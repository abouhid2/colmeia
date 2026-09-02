import { isAchievementId, MAX_FAVORITE_ACHIEVEMENTS, type AchievementId } from "../domain/achievements";
import { DEFAULT_CROWN_TITLE } from "../domain/crownTitles";
import { generateInviteCode } from "../domain/inviteCode";
import { emptyNavPreferences, normalizeNavPreferences } from "../domain/navigation";
import { AVATAR_OPTIONS, MEMBER_COLOR_OPTIONS } from "../domain/memberColors";
import { completedAtError } from "../domain/completionMoment";
import { isRecurring, nextDueOn } from "../domain/recurrence";
import { seasonsNewestFirst } from "../domain/seasons";
import { LIMITS } from "../domain/limits";
import { formatMultiplier, MAX_MULTIPLIER, MIN_MULTIPLIER, multiplierForKind } from "../domain/memberKinds";
import { awardedPoints, MAX_RATING } from "../domain/points";
import type {
  AchievementAward, AchievementAwardInput, Completion, Goal, GoalInput, Household, HouseholdInput,
  HouseholdUpdate, HouseholdWithMembers, Member, MemberInput, ReviewInput, Season, SeasonInput, SeasonUpdate,
  ShoppingItem, ShoppingItemInput, ShoppingItemUpdate, Task, TaskInput,
} from "../domain/types";
import type { ColmeiaApi, CompleteTaskOptions, CompleteTaskResult, CompletionQuery, DemoColmeia, StoredHousehold } from "./client";
import { ApiError } from "./errors";
import {
  DEMO_INVITE_CODE, EXAMPLE_ENTRY_MEMBER, emptyState, withCounts, withMembers,
  type LocalState, type StoredSeason,
} from "./localState";
import { LocalStore } from "./localStore";
import type { KeyValueStore } from "./storage";

export type { KeyValueStore } from "./storage";
export { DEMO_INVITE_CODE } from "./localState";

interface LocalApiOptions {
  seed?: () => LocalState;
  clock?: () => Date;
  newCode?: () => string;
}

function invalid(...details: string[]): never {
  throw new ApiError(422, details);
}

function conflict(detail: string): never {
  throw new ApiError(409, [ detail ]);
}

function requireRoom(state: LocalState): void {
  if (state.members.length >= LIMITS.householdMembers) invalid(`Esta colmeia já tem ${LIMITS.householdMembers} pessoas`);
}

function findOrFail<T extends { id: number }>(items: T[], id: number, label: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new ApiError(404, [`${label} não está mais aqui. Atualize a página.`]);
  return found;
}

function validateName(value: string | undefined, max: number, blankMessage: string): void {
  if (value === undefined) return;
  if (value.trim() === "") invalid(blankMessage);
  if (value.trim().length > max) invalid(`Use no máximo ${max} letras`);
}

/** When the work happened: what the person said, or now if they said nothing. */
function resolveMoment(completedAt: string | undefined, now: Date, seasonStartsOn: string): Date {
  if (completedAt === undefined || completedAt === "") return now;
  const moment = new Date(completedAt);
  const error = completedAtError(moment, now, seasonStartsOn);
  if (error !== null) invalid(error);
  return moment;
}

/** The cycle counts from the day the work happened, but a completion from a
 *  cycle already closed must not drag the next date backwards. */
function rolledDueOn(task: Task, moment: Date): string | null {
  const rolled = nextDueOn(task.recurrence, task.intervalDays, moment);
  if (rolled === null || task.dueOn === null) return rolled;
  return rolled < task.dueOn ? task.dueOn : rolled;
}

/** The completion that closed the task, the one reopening it undoes. */
function lastCompletionFor(completions: Completion[], taskId: number): Completion | null {
  return completions
    .filter((completion) => completion.taskId === taskId)
    .reduce<Completion | null>((latest, completion) => (
      latest === null || Date.parse(completion.completedAt) >= Date.parse(latest.completedAt) ? completion : latest
    ), null);
}

function validateShoppingItem(input: { name?: string; quantity?: string | null }): void {
  validateName(input.name, LIMITS.shoppingItemName, "Escreva o que está faltando");
  if (input.quantity && input.quantity.length > LIMITS.shoppingQuantity) invalid(`A quantidade cabe em ${LIMITS.shoppingQuantity} letras`);
}

/** The same three rules the Rails validation applies to a pinned badge. */
function validateFavorites(favorites: AchievementId[] | undefined): void {
  if (favorites === undefined) return;
  if (favorites.length > MAX_FAVORITE_ACHIEVEMENTS) invalid(`Dá para fixar no máximo ${MAX_FAVORITE_ACHIEVEMENTS} conquistas`);
  if (favorites.some((key) => !isAchievementId(key))) invalid("Essa conquista não existe");
  if (new Set(favorites).size !== favorites.length) invalid("Essa conquista já está fixada");
}

function validateMember(input: Partial<MemberInput>): void {
  validateName(input.name, LIMITS.memberName, "Dê um nome à pessoa");
  validateFavorites(input.favoriteAchievements);
  // A blank crown title is allowed on purpose: it is how someone says they want no crown.
  if (input.crownTitle !== undefined && input.crownTitle.trim().length > LIMITS.crownTitle) {
    invalid(`O título cabe em ${LIMITS.crownTitle} letras`);
  }
  const multiplier = input.pointsMultiplier;
  if (multiplier === undefined) return;
  if (!(multiplier >= MIN_MULTIPLIER && multiplier <= MAX_MULTIPLIER)) {
    invalid(`O multiplicador vai de ${formatMultiplier(MIN_MULTIPLIER)} a ${formatMultiplier(MAX_MULTIPLIER)}`);
  }
}

function validateGoal(input: Partial<GoalInput>): void {
  validateName(input.title, LIMITS.goalTitle, "Diga qual é a recompensa");
  if (input.targetPoints !== undefined && (!Number.isInteger(input.targetPoints) || input.targetPoints <= 0)) invalid("A meta precisa de pelo menos 1 ponto");
  if (input.targetPoints !== undefined && input.targetPoints > LIMITS.goalTarget) invalid(`A meta vai até ${LIMITS.goalTarget} pontos`);
}

function validateSeason(input: Partial<SeasonInput>): void {
  validateName(input.name, LIMITS.seasonName, "Dê um nome à estação");
  if (input.startsOn !== undefined && input.startsOn === "") invalid("Diga quando a estação começa");
  const endsOn = input.endsOn ?? null;
  if (input.startsOn !== undefined && endsOn !== null && endsOn < input.startsOn) invalid("O fim não pode ser antes do começo");
}

function validateTask(input: Partial<TaskInput>): void {
  validateName(input.title, LIMITS.taskTitle, "Dê um nome à tarefa");
  if (input.points !== undefined && (!Number.isInteger(input.points) || input.points <= 0)) invalid("A tarefa vale pelo menos 1 ponto");
  if (input.points !== undefined && input.points > LIMITS.taskPoints) invalid(`Uma tarefa vale no máximo ${LIMITS.taskPoints} pontos`);
  if (input.recurrence === "custom" && !(input.intervalDays && input.intervalDays > 0)) invalid("Diga a cada quantos dias a tarefa se repete");
}

/** Defaults a new person the way the Rails model does, handicap included. */
function newMember(input: MemberInput): Omit<Member, "claimedAt" | "createdAt" | "id"> {
  const kind = input.kind ?? "bee";
  return {
    name: input.name.trim(),
    avatar: input.avatar,
    color: input.color,
    kind,
    pointsMultiplier: multiplierForKind(kind, input.pointsMultiplier ?? 1),
    crownTitle: input.crownTitle.trim(),
    favoriteAchievements: input.favoriteAchievements ?? [],
    navPreferences: normalizeNavPreferences(input.navPreferences),
  };
}

/** One badge earned once: the same shape the unique index on Rails guards. */
function awardSlot(key: string, completionId: number | null): string {
  return `${key}:${completionId ?? "sem conclusão"}`;
}

function oldestAwardsFirst(awards: AchievementAward[]): AchievementAward[] {
  return [ ...awards ].sort((left, right) => Date.parse(left.awardedAt) - Date.parse(right.awardedAt));
}

/**
 * Same rules as the Rails API, kept in the browser so the app works with no
 * server at all (that is what GitHub Pages runs). Invite links resolve here
 * too, but only inside this browser: there is nowhere else for them to reach.
 */
export class LocalApi implements ColmeiaApi {
  readonly mode = "local" as const;
  private readonly store: LocalStore;
  private readonly clock: () => Date;
  private readonly newCode: () => string;
  private inviteCode: string | null = null;

  constructor(store: KeyValueStore, options: LocalApiOptions = {}) {
    this.clock = options.clock ?? (() => new Date());
    this.newCode = options.newCode ?? generateInviteCode;
    this.store = new LocalStore(store, options.seed ?? (() => emptyState(DEMO_INVITE_CODE, "Nossa casa", this.clock())), this.clock);
  }

  setInviteCode(inviteCode: string | null): void {
    this.inviteCode = inviteCode;
  }

  listStoredHouseholds(): Promise<StoredHousehold[]> {
    const index = this.store.index();
    return Promise.resolve(
      Object.entries(index)
        .map(([ inviteCode, entry ]) => ({ inviteCode, ...entry }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    );
  }

  private currentState(): LocalState {
    if (this.inviteCode === null) throw new ApiError(401, [ "Entre em uma colmeia para ver isso" ]);
    const state = this.store.read(this.inviteCode);
    if (state === null) throw new ApiError(401, [ "Essa colmeia não está neste navegador" ]);
    return state;
  }

  private invitedState(inviteCode: string): LocalState {
    const state = this.store.read(inviteCode);
    if (state === null) throw new ApiError(404, [ "Esse convite não existe" ]);
    return state;
  }

  private attempt<T>(run: () => T): Promise<T> {
    try {
      return Promise.resolve(run());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private read<T>(select: (state: LocalState) => T): Promise<T> {
    return this.attempt(() => structuredClone(select(this.currentState())));
  }

  private mutate<T>(change: (state: LocalState, now: Date) => T): Promise<T> {
    return this.change(() => this.currentState(), change);
  }

  private mutateInvited<T>(inviteCode: string, change: (state: LocalState, now: Date) => T): Promise<T> {
    return this.change(() => this.invitedState(inviteCode), change);
  }

  private change<T>(load: () => LocalState, apply: (state: LocalState, now: Date) => T): Promise<T> {
    return this.attempt(() => {
      const state = load();
      const result = apply(state, this.clock());
      this.store.save(state);
      return structuredClone(result);
    });
  }

  private nextId(state: LocalState): number {
    return state.nextId++;
  }

  /** The example opens with Ana already in it, so nobody has to claim a place
   *  before touching anything. */
  private claimExampleMember(state: LocalState): Member {
    const member = state.members.find((person) => person.name === EXAMPLE_ENTRY_MEMBER) ?? state.members[0];
    if (member === undefined) invalid("O exemplo está vazio");
    member.claimedAt = this.clock().toISOString();
    return member;
  }

  private freshInviteCode(): string {
    let candidate = this.newCode();
    while (this.store.resolve(candidate) !== null) candidate = this.newCode();
    return candidate;
  }

  /** Nothing is scored in a closed estação: it is a finished championship. */
  private openSeason(state: LocalState, seasonId: number): StoredSeason {
    const season = findOrFail(state.seasons, seasonId, "Essa estação");
    if (season.closedAt !== null) conflict("Essa estação já foi encerrada");
    return season;
  }

  /** The same chores come back every estação, only the score starts from zero. */
  private copyOpenTasks(state: LocalState, sourceId: number, seasonId: number, now: Date): void {
    const source = findOrFail(state.seasons, sourceId, "Essa estação");
    state.tasks
      .filter((task) => task.seasonId === source.id && task.status === "open")
      .map((task): Task => ({
        ...task, id: this.nextId(state), seasonId, dueOn: null, status: "open",
        completedAt: null, createdAt: now.toISOString(),
      }))
      .forEach((task) => state.tasks.push(task));
  }

  private placeholder(state: LocalState, name: string, position: number, now: Date): Member {
    return {
      id: this.nextId(state),
      name,
      avatar: AVATAR_OPTIONS[position % AVATAR_OPTIONS.length],
      color: MEMBER_COLOR_OPTIONS[position % MEMBER_COLOR_OPTIONS.length],
      kind: "bee",
      pointsMultiplier: 1,
      crownTitle: DEFAULT_CROWN_TITLE,
      navPreferences: emptyNavPreferences(),
      favoriteAchievements: [],
      claimedAt: null,
      createdAt: now.toISOString(),
    };
  }

  households = {
    create: (input: HouseholdInput): Promise<HouseholdWithMembers> =>
      this.attempt(() => {
        validateName(input.name, LIMITS.householdName, "Dê um nome à colmeia");
        const memberNames = input.memberNames.map((value) => value.trim()).filter((value) => value !== "");
        if (memberNames.length > LIMITS.initialMembers) invalid(`Uma colmeia começa com no máximo ${LIMITS.initialMembers} pessoas`);
        memberNames.forEach((memberName) => validateName(memberName, LIMITS.memberName, "Dê um nome à pessoa"));
        const now = this.clock();
        const state = emptyState(this.freshInviteCode(), input.name.trim(), now);
        memberNames.forEach((memberName, position) => state.members.push(this.placeholder(state, memberName, position, now)));
        this.store.save(state);
        return structuredClone(withMembers(state));
      }),
    createDemo: (): Promise<DemoColmeia> =>
      this.attempt(() => {
        const state = this.store.example(this.freshInviteCode());
        const member = this.claimExampleMember(state);
        this.store.save(state);
        return structuredClone({ household: withMembers(state), member });
      }),
    lookup: (inviteCode: string): Promise<HouseholdWithMembers> =>
      this.attempt(() => structuredClone(withMembers(this.invitedState(inviteCode)))),
    claim: (inviteCode: string, memberId: number): Promise<Member> =>
      this.mutateInvited(inviteCode, (state, now) => {
        const member = findOrFail(state.members, memberId, "Essa pessoa");
        if (member.claimedAt !== null) conflict("Essa pessoa já entrou na colmeia");
        member.claimedAt = now.toISOString();
        return member;
      }),
    join: (inviteCode: string, input: MemberInput): Promise<Member> =>
      this.mutateInvited(inviteCode, (state, now) => {
        validateMember(input);
        requireRoom(state);
        const member: Member = {
          ...newMember(input), id: this.nextId(state),
          claimedAt: now.toISOString(), createdAt: now.toISOString(),
        };
        state.members.push(member);
        return member;
      }),
  };

  household = {
    get: (): Promise<Household> => this.read((state) => state.household),
    update: (input: HouseholdUpdate): Promise<Household> =>
      this.mutate((state) => {
        validateName(input.name, LIMITS.householdName, "Dê um nome à colmeia");
        // Each field is left alone unless it was sent, so renaming the colmeia
        // never answers the lagartinhas question by accident.
        state.household = {
          ...state.household,
          ...(input.name === undefined ? {} : { name: input.name.trim() }),
          ...(input.lagartinhasEnabled === undefined ? {} : { lagartinhasEnabled: input.lagartinhasEnabled }),
        };
        return state.household;
      }),
    reseed: (): Promise<Member> =>
      this.attempt(() => {
        const current = this.currentState();
        if (!current.household.demo) conflict("Só dá para recomeçar uma colmeia de exemplo");
        const state = this.store.example(current.household.inviteCode);
        const member = this.claimExampleMember(state);
        this.store.save(state);
        return structuredClone(member);
      }),
  };

  members = {
    list: (): Promise<Member[]> => this.read((state) => state.members),
    create: (input: MemberInput): Promise<Member> =>
      this.mutate((state, now) => {
        validateMember(input);
        requireRoom(state);
        const member: Member = {
          ...newMember(input), id: this.nextId(state), claimedAt: null, createdAt: now.toISOString(),
        };
        state.members.push(member);
        return member;
      }),
    update: (id: number, input: Partial<MemberInput>): Promise<Member> =>
      this.mutate((state) => {
        const member = findOrFail(state.members, id, "Essa pessoa");
        validateMember(input);
        const wasLagartinha = member.kind === "lagartinha";
        Object.assign(member, input);
        if (input.crownTitle !== undefined) member.crownTitle = input.crownTitle.trim();
        if (input.navPreferences !== undefined) member.navPreferences = normalizeNavPreferences(input.navPreferences);
        if (!wasLagartinha) member.pointsMultiplier = multiplierForKind(member.kind, member.pointsMultiplier);
        return member;
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        findOrFail(state.members, id, "Essa pessoa");
        state.members = state.members.filter((member) => member.id !== id);
        const nullify = (value: number | null) => (value === id ? null : value);
        state.tasks.forEach((task) => { task.assigneeId = nullify(task.assigneeId); task.createdById = nullify(task.createdById); });
        state.completions.forEach((completion) => { completion.memberId = nullify(completion.memberId); completion.reviewerId = nullify(completion.reviewerId); });
        state.shoppingItems.forEach((item) => { item.addedById = nullify(item.addedById); item.purchasedById = nullify(item.purchasedById); });
        state.goals = state.goals.filter((goal) => goal.memberId !== id);
        // Whoever leaves the colmeia takes their badges with them.
        state.awards = state.awards.filter((award) => award.memberId !== id);
      }),
  };

  seasons = {
    list: (): Promise<Season[]> =>
      this.read((state) => seasonsNewestFirst(state.seasons.map((season) => withCounts(state, season)))),
    create: (input: SeasonInput): Promise<Season> =>
      this.mutate((state, now) => {
        validateSeason(input);
        const season: StoredSeason = {
          id: this.nextId(state), name: input.name.trim(), startsOn: input.startsOn,
          endsOn: input.endsOn, closedAt: null, createdAt: now.toISOString(),
        };
        state.seasons.push(season);
        if (input.copyTasksFromSeasonId != null) this.copyOpenTasks(state, input.copyTasksFromSeasonId, season.id, now);
        return withCounts(state, season);
      }),
    update: (id: number, input: Partial<SeasonUpdate>): Promise<Season> =>
      this.mutate((state) => {
        const season = findOrFail(state.seasons, id, "Essa estação");
        validateSeason({ ...season, ...input });
        Object.assign(season, input);
        if (input.name !== undefined) season.name = input.name.trim();
        return withCounts(state, season);
      }),
    close: (id: number): Promise<Season> =>
      this.mutate((state, now) => {
        const season = this.openSeason(state, id);
        season.closedAt = now.toISOString();
        return withCounts(state, season);
      }),
    reopen: (id: number): Promise<Season> =>
      this.mutate((state) => {
        const season = findOrFail(state.seasons, id, "Essa estação");
        if (season.closedAt === null) conflict("Essa estação não está encerrada");
        season.closedAt = null;
        return withCounts(state, season);
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        const season = findOrFail(state.seasons, id, "Essa estação");
        if (state.completions.some((completion) => completion.seasonId === season.id)) {
          conflict("Essa estação já tem tarefas concluídas, então não dá para apagá-la");
        }
        state.seasons = state.seasons.filter((candidate) => candidate.id !== season.id);
        state.tasks = state.tasks.filter((task) => task.seasonId !== season.id);
        state.goals = state.goals.filter((goal) => goal.seasonId !== season.id);
      }),
  };

  tasks = {
    list: (seasonId: number | null): Promise<Task[]> =>
      this.read((state) => (seasonId === null ? state.tasks : state.tasks.filter((task) => task.seasonId === seasonId))),
    create: (input: TaskInput): Promise<Task> =>
      this.mutate((state, now) => {
        validateTask(input);
        this.openSeason(state, input.seasonId);
        const task: Task = { ...input, title: input.title.trim(), id: this.nextId(state), status: "open", completedAt: null, createdAt: now.toISOString() };
        state.tasks.push(task);
        return task;
      }),
    update: (id: number, input: Partial<TaskInput>): Promise<Task> =>
      this.mutate((state) => {
        const task = findOrFail(state.tasks, id, "Essa tarefa");
        validateTask({ ...task, ...input });
        Object.assign(task, input);
        return task;
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        findOrFail(state.tasks, id, "Essa tarefa");
        state.tasks = state.tasks.filter((task) => task.id !== id);
        state.completions.forEach((completion) => { if (completion.taskId === id) completion.taskId = null; });
      }),
    complete: (id: number, memberId: number, options: CompleteTaskOptions = {}): Promise<CompleteTaskResult> =>
      this.mutate((state, now) => {
        const task = findOrFail(state.tasks, id, "Essa tarefa");
        const doer = findOrFail(state.members, memberId, "Essa pessoa");
        const season = this.openSeason(state, task.seasonId);
        if (task.status === "done") conflict("Essa tarefa já foi concluída");
        const moment = resolveMoment(options.completedAt, now, season.startsOn);
        const completion: Completion = {
          id: this.nextId(state),
          seasonId: task.seasonId,
          taskId: task.id,
          memberId,
          reviewerId: null,
          status: task.requiresReview ? "pending" : "approved",
          rating: null,
          pointsAwarded: task.requiresReview ? 0 : awardedPoints(task.points, null, doer.pointsMultiplier),
          multiplier: doer.pointsMultiplier,
          taskTitle: task.title,
          taskPoints: task.points,
          completedAt: moment.toISOString(),
          reviewedAt: null,
        };
        state.completions.push(completion);
        if (isRecurring(task.recurrence)) {
          task.dueOn = rolledDueOn(task, moment);
        } else {
          task.status = "done";
          task.completedAt = moment.toISOString();
        }
        return { task, completion };
      }),
    reopen: (id: number): Promise<Task> =>
      this.mutate((state) => {
        const task = findOrFail(state.tasks, id, "Essa tarefa");
        if (task.status !== "done") conflict("Essa tarefa já está aberta");
        const closing = lastCompletionFor(state.completions, task.id);
        state.completions = state.completions.filter((completion) => completion !== closing);
        task.status = "open";
        task.completedAt = null;
        return task;
      }),
  };

  completions = {
    list: ({ seasonId, limit }: CompletionQuery = {}): Promise<Completion[]> =>
      this.read((state) => {
        const recent = state.completions
          .filter((completion) => seasonId === undefined || seasonId === null || completion.seasonId === seasonId)
          .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt));
        return limit === undefined ? recent : recent.slice(0, limit);
      }),
    review: (id: number, input: ReviewInput): Promise<Completion> =>
      this.mutate((state, now) => {
        const completion = findOrFail(state.completions, id, "Essa tarefa feita");
        findOrFail(state.members, input.reviewerId, "Essa pessoa");
        if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > MAX_RATING) invalid("A nota vai de 1 a 5 estrelas");
        if (completion.status !== "pending") conflict("Essa tarefa já foi avaliada");
        if (completion.memberId === input.reviewerId) conflict("Quem fez a tarefa não pode avaliar o próprio trabalho");
        Object.assign(completion, {
          status: "approved",
          rating: input.rating,
          reviewerId: input.reviewerId,
          reviewedAt: now.toISOString(),
          pointsAwarded: awardedPoints(completion.taskPoints, input.rating, completion.multiplier),
        });
        return completion;
      }),
  };

  achievementAwards = {
    list: (memberId: number | null): Promise<AchievementAward[]> =>
      this.read((state) =>
        oldestAwardsFirst(memberId === null ? state.awards : state.awards.filter((award) => award.memberId === memberId))),
    record: (memberId: number, awards: AchievementAwardInput[]): Promise<AchievementAward[]> =>
      this.mutate((state) => {
        findOrFail(state.members, memberId, "Membro");
        const taken = new Set(
          state.awards.filter((award) => award.memberId === memberId).map((award) => awardSlot(award.key, award.completionId)),
        );
        awards.forEach((input) => {
          if (!isAchievementId(input.key)) invalid("Essa conquista não existe");
          const slot = awardSlot(input.key, input.completionId);
          if (taken.has(slot)) return;
          taken.add(slot);
          state.awards.push({ ...input, id: this.nextId(state), memberId });
        });
        return oldestAwardsFirst(state.awards.filter((award) => award.memberId === memberId));
      }),
  };

  shopping = {
    list: (): Promise<ShoppingItem[]> => this.read((state) => state.shoppingItems),
    create: (input: ShoppingItemInput): Promise<ShoppingItem> =>
      this.mutate((state, now) => {
        validateShoppingItem(input);
        const item: ShoppingItem = {
          ...input, name: input.name.trim(), id: this.nextId(state), purchased: false, purchasedById: null, purchasedAt: null, createdAt: now.toISOString(),
        };
        state.shoppingItems.push(item);
        return item;
      }),
    update: (id: number, input: ShoppingItemUpdate): Promise<ShoppingItem> =>
      this.mutate((state, now) => {
        const item = findOrFail(state.shoppingItems, id, "Esse item");
        validateShoppingItem(input);
        Object.assign(item, input);
        if (input.purchased === true) item.purchasedAt = now.toISOString();
        if (input.purchased === false) { item.purchasedAt = null; item.purchasedById = null; }
        return item;
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        findOrFail(state.shoppingItems, id, "Esse item");
        state.shoppingItems = state.shoppingItems.filter((item) => item.id !== id);
      }),
    clearPurchased: (): Promise<void> =>
      this.mutate((state) => {
        state.shoppingItems = state.shoppingItems.filter((item) => !item.purchased);
      }),
  };

  goals = {
    list: (seasonId: number | null): Promise<Goal[]> =>
      this.read((state) => (seasonId === null ? state.goals : state.goals.filter((goal) => goal.seasonId === seasonId))),
    create: (input: GoalInput): Promise<Goal> =>
      this.mutate((state) => {
        validateGoal(input);
        this.openSeason(state, input.seasonId);
        if (input.memberId !== null) findOrFail(state.members, input.memberId, "Essa pessoa");
        const goal: Goal = { ...input, title: input.title.trim(), id: this.nextId(state) };
        state.goals.push(goal);
        return goal;
      }),
    update: (id: number, input: Partial<GoalInput>): Promise<Goal> =>
      this.mutate((state) => {
        const goal = findOrFail(state.goals, id, "Essa meta");
        validateGoal(input);
        Object.assign(goal, input);
        return goal;
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        findOrFail(state.goals, id, "Essa meta");
        state.goals = state.goals.filter((goal) => goal.id !== id);
      }),
  };
}
