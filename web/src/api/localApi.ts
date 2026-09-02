import { DEFAULT_CROWN_TITLE } from "../domain/crownTitles";
import { generateInviteCode } from "../domain/inviteCode";
import { AVATAR_OPTIONS, MEMBER_COLOR_OPTIONS } from "../domain/memberColors";
import { isRecurring, nextDueOn } from "../domain/recurrence";
import { LIMITS } from "../domain/limits";
import { formatMultiplier, MAX_MULTIPLIER, MIN_MULTIPLIER, multiplierForKind } from "../domain/memberKinds";
import { awardedPoints, MAX_RATING } from "../domain/points";
import type {
  Completion, Goal, GoalInput, Household, HouseholdInput, HouseholdWithMembers, Member, MemberInput,
  ReviewInput, ShoppingItem, ShoppingItemInput, ShoppingItemUpdate, Task, TaskInput,
} from "../domain/types";
import type { ColmeiaApi, CompleteTaskResult, StoredHousehold } from "./client";
import { ApiError } from "./errors";
import { DEMO_INVITE_CODE, emptyState, withMembers, type LocalState } from "./localState";
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

function findOrFail<T extends { id: number }>(items: T[], id: number, label: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new ApiError(404, [`${label} não encontrado`]);
  return found;
}

function validateName(value: string | undefined, max: number, blankMessage: string): void {
  if (value === undefined) return;
  if (value.trim() === "") invalid(blankMessage);
  if (value.trim().length > max) invalid(`Use no máximo ${max} caracteres`);
}

function validateMember(input: Partial<MemberInput>): void {
  validateName(input.name, LIMITS.memberName, "Dê um nome à pessoa");
  // A blank crown title is allowed on purpose: it is how someone says they want no crown.
  if (input.crownTitle !== undefined && input.crownTitle.trim().length > LIMITS.crownTitle) {
    invalid(`O título cabe em ${LIMITS.crownTitle} caracteres`);
  }
  const multiplier = input.pointsMultiplier;
  if (multiplier === undefined) return;
  if (!(multiplier >= MIN_MULTIPLIER && multiplier <= MAX_MULTIPLIER)) {
    invalid(`O multiplicador vai de ${formatMultiplier(MIN_MULTIPLIER)} a ${formatMultiplier(MAX_MULTIPLIER)}`);
  }
}

function validateGoal(input: Partial<GoalInput>): void {
  validateName(input.title, LIMITS.goalTitle, "Diga qual é a recompensa");
  if (input.targetPoints !== undefined && (!Number.isInteger(input.targetPoints) || input.targetPoints <= 0)) invalid("A meta precisa ser maior que zero");
  if (input.targetPoints !== undefined && input.targetPoints > LIMITS.goalTarget) invalid(`A meta vai até ${LIMITS.goalTarget} pontos`);
}

function validateTask(input: Partial<TaskInput>): void {
  validateName(input.title, LIMITS.taskTitle, "Dê um nome à tarefa");
  if (input.points !== undefined && (!Number.isInteger(input.points) || input.points <= 0)) invalid("Os pontos precisam ser um número maior que zero");
  if (input.points !== undefined && input.points > LIMITS.taskPoints) invalid(`Uma tarefa vale no máximo ${LIMITS.taskPoints} pontos`);
  if (input.recurrence === "custom" && !(input.intervalDays && input.intervalDays > 0)) invalid("Informe a cada quantos dias a tarefa se repete");
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
  };
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
    this.store = new LocalStore(store, options.seed ?? (() => emptyState(DEMO_INVITE_CODE, "Nossa casa")), this.clock);
  }

  setInviteCode(inviteCode: string | null): void {
    this.inviteCode = inviteCode;
  }

  reset(): Promise<void> {
    this.store.resetDemo();
    return Promise.resolve();
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

  private freshInviteCode(): string {
    const index = this.store.index();
    let candidate = this.newCode();
    while (candidate in index) candidate = this.newCode();
    return candidate;
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
      claimedAt: null,
      createdAt: now.toISOString(),
    };
  }

  households = {
    create: (input: HouseholdInput): Promise<HouseholdWithMembers> =>
      this.attempt(() => {
        const name = input.name.trim();
        if (name === "") invalid("Dê um nome à colmeia");
        const now = this.clock();
        const state = emptyState(this.freshInviteCode(), name);
        input.memberNames
          .map((value) => value.trim())
          .filter((value) => value !== "")
          .forEach((memberName, position) => state.members.push(this.placeholder(state, memberName, position, now)));
        this.store.save(state);
        return structuredClone(withMembers(state));
      }),
    lookup: (inviteCode: string): Promise<HouseholdWithMembers> =>
      this.attempt(() => structuredClone(withMembers(this.invitedState(inviteCode)))),
    claim: (inviteCode: string, memberId: number): Promise<Member> =>
      this.mutateInvited(inviteCode, (state, now) => {
        const member = findOrFail(state.members, memberId, "Membro");
        if (member.claimedAt !== null) conflict("Essa pessoa já entrou na colmeia");
        member.claimedAt = now.toISOString();
        return member;
      }),
    join: (inviteCode: string, input: MemberInput): Promise<Member> =>
      this.mutateInvited(inviteCode, (state, now) => {
        if (input.name.trim() === "") invalid("Dê um nome à pessoa");
        validateMember(input);
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
    update: (input: Pick<Household, "name">): Promise<Household> =>
      this.mutate((state) => {
        validateName(input.name, LIMITS.householdName, "Dê um nome à colmeia");
        state.household = { ...state.household, name: input.name.trim() };
        return state.household;
      }),
  };

  members = {
    list: (): Promise<Member[]> => this.read((state) => state.members),
    create: (input: MemberInput): Promise<Member> =>
      this.mutate((state, now) => {
        validateMember(input);
        const member: Member = {
          ...newMember(input), id: this.nextId(state), claimedAt: null, createdAt: now.toISOString(),
        };
        state.members.push(member);
        return member;
      }),
    update: (id: number, input: Partial<MemberInput>): Promise<Member> =>
      this.mutate((state) => {
        const member = findOrFail(state.members, id, "Membro");
        validateMember(input);
        const wasLagartinha = member.kind === "lagartinha";
        Object.assign(member, input);
        if (input.crownTitle !== undefined) member.crownTitle = input.crownTitle.trim();
        if (!wasLagartinha) member.pointsMultiplier = multiplierForKind(member.kind, member.pointsMultiplier);
        return member;
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        findOrFail(state.members, id, "Membro");
        state.members = state.members.filter((member) => member.id !== id);
        const nullify = (value: number | null) => (value === id ? null : value);
        state.tasks.forEach((task) => { task.assigneeId = nullify(task.assigneeId); task.createdById = nullify(task.createdById); });
        state.completions.forEach((completion) => { completion.memberId = nullify(completion.memberId); completion.reviewerId = nullify(completion.reviewerId); });
        state.shoppingItems.forEach((item) => { item.addedById = nullify(item.addedById); item.purchasedById = nullify(item.purchasedById); });
        state.goals = state.goals.filter((goal) => goal.memberId !== id);
      }),
  };

  tasks = {
    list: (): Promise<Task[]> => this.read((state) => state.tasks),
    create: (input: TaskInput): Promise<Task> =>
      this.mutate((state, now) => {
        validateTask(input);
        const task: Task = { ...input, title: input.title.trim(), id: this.nextId(state), status: "open", completedAt: null, createdAt: now.toISOString() };
        state.tasks.push(task);
        return task;
      }),
    update: (id: number, input: Partial<TaskInput>): Promise<Task> =>
      this.mutate((state) => {
        const task = findOrFail(state.tasks, id, "Tarefa");
        validateTask({ ...task, ...input });
        Object.assign(task, input);
        return task;
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        findOrFail(state.tasks, id, "Tarefa");
        state.tasks = state.tasks.filter((task) => task.id !== id);
        state.completions.forEach((completion) => { if (completion.taskId === id) completion.taskId = null; });
      }),
    complete: (id: number, memberId: number): Promise<CompleteTaskResult> =>
      this.mutate((state, now) => {
        const task = findOrFail(state.tasks, id, "Tarefa");
        const doer = findOrFail(state.members, memberId, "Membro");
        if (task.status === "done") conflict("Essa tarefa já foi concluída");
        const completion: Completion = {
          id: this.nextId(state),
          taskId: task.id,
          memberId,
          reviewerId: null,
          status: task.requiresReview ? "pending" : "approved",
          rating: null,
          pointsAwarded: task.requiresReview ? 0 : awardedPoints(task.points, null, doer.pointsMultiplier),
          multiplier: doer.pointsMultiplier,
          taskTitle: task.title,
          taskPoints: task.points,
          completedAt: now.toISOString(),
          reviewedAt: null,
        };
        state.completions.push(completion);
        if (isRecurring(task.recurrence)) {
          task.dueOn = nextDueOn(task.recurrence, task.intervalDays, now);
        } else {
          task.status = "done";
          task.completedAt = now.toISOString();
        }
        return { task, completion };
      }),
    reopen: (id: number): Promise<Task> =>
      this.mutate((state) => {
        const task = findOrFail(state.tasks, id, "Tarefa");
        if (task.status !== "done") conflict("Essa tarefa já está aberta");
        task.status = "open";
        task.completedAt = null;
        return task;
      }),
  };

  completions = {
    list: (): Promise<Completion[]> =>
      this.read((state) => [ ...state.completions ].sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))),
    review: (id: number, input: ReviewInput): Promise<Completion> =>
      this.mutate((state, now) => {
        const completion = findOrFail(state.completions, id, "Conclusão");
        findOrFail(state.members, input.reviewerId, "Membro");
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

  shopping = {
    list: (): Promise<ShoppingItem[]> => this.read((state) => state.shoppingItems),
    create: (input: ShoppingItemInput): Promise<ShoppingItem> =>
      this.mutate((state, now) => {
        validateName(input.name, LIMITS.shoppingItemName, "Escreva o que está faltando");
        if (input.quantity && input.quantity.length > LIMITS.shoppingQuantity) invalid(`A quantidade cabe em ${LIMITS.shoppingQuantity} caracteres`);
        const item: ShoppingItem = {
          ...input, name: input.name.trim(), id: this.nextId(state), purchased: false, purchasedById: null, purchasedAt: null, createdAt: now.toISOString(),
        };
        state.shoppingItems.push(item);
        return item;
      }),
    update: (id: number, input: ShoppingItemUpdate): Promise<ShoppingItem> =>
      this.mutate((state, now) => {
        const item = findOrFail(state.shoppingItems, id, "Item");
        Object.assign(item, input);
        if (input.purchased === true) item.purchasedAt = now.toISOString();
        if (input.purchased === false) { item.purchasedAt = null; item.purchasedById = null; }
        return item;
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        findOrFail(state.shoppingItems, id, "Item");
        state.shoppingItems = state.shoppingItems.filter((item) => item.id !== id);
      }),
    clearPurchased: (): Promise<void> =>
      this.mutate((state) => {
        state.shoppingItems = state.shoppingItems.filter((item) => !item.purchased);
      }),
  };

  goals = {
    list: (): Promise<Goal[]> => this.read((state) => state.goals),
    create: (input: GoalInput): Promise<Goal> =>
      this.mutate((state) => {
        validateGoal(input);
        if (input.memberId !== null) findOrFail(state.members, input.memberId, "Membro");
        const goal: Goal = { ...input, title: input.title.trim(), id: this.nextId(state) };
        state.goals.push(goal);
        return goal;
      }),
    update: (id: number, input: Partial<GoalInput>): Promise<Goal> =>
      this.mutate((state) => {
        const goal = findOrFail(state.goals, id, "Meta");
        validateGoal(input);
        Object.assign(goal, input);
        return goal;
      }),
    remove: (id: number): Promise<void> =>
      this.mutate((state) => {
        findOrFail(state.goals, id, "Meta");
        state.goals = state.goals.filter((goal) => goal.id !== id);
      }),
  };
}
