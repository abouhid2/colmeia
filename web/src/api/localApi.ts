import { isRecurring, nextDueOn } from "../domain/recurrence";
import { MAX_RATING, pointsForRating } from "../domain/points";
import type {
  Completion, Goal, GoalInput, Household, Member, MemberInput, ReviewInput,
  ShoppingItem, ShoppingItemInput, ShoppingItemUpdate, Task, TaskInput,
} from "../domain/types";
import type { ColmeiaApi, CompleteTaskResult } from "./client";
import { ApiError } from "./errors";
import { emptyState, type LocalState } from "./localState";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface LocalApiOptions {
  seed?: () => LocalState;
  clock?: () => Date;
  storageKey?: string;
}

export const LOCAL_STORAGE_KEY = "colmeia.db.v1";

function invalid(...details: string[]): never {
  throw new ApiError(422, details);
}

function conflict(detail: string): never {
  throw new ApiError(409, [detail]);
}

function findOrFail<T extends { id: number }>(items: T[], id: number, label: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new ApiError(404, [`${label} não encontrado`]);
  return found;
}

function validateTask(input: Partial<TaskInput>): void {
  if (input.title !== undefined && input.title.trim() === "") invalid("Dê um nome à tarefa");
  if (input.points !== undefined && (!Number.isInteger(input.points) || input.points <= 0)) invalid("Os pontos precisam ser um número maior que zero");
  if (input.recurrence === "custom" && !(input.intervalDays && input.intervalDays > 0)) invalid("Informe a cada quantos dias a tarefa se repete");
}

/**
 * Same rules as the Rails API, kept in the browser so the app works with no
 * server at all (that is what GitHub Pages runs).
 */
export class LocalApi implements ColmeiaApi {
  readonly mode = "local" as const;
  private readonly store: KeyValueStore;
  private readonly seed: () => LocalState;
  private readonly clock: () => Date;
  private readonly storageKey: string;

  constructor(store: KeyValueStore, options: LocalApiOptions = {}) {
    this.store = store;
    this.seed = options.seed ?? emptyState;
    this.clock = options.clock ?? (() => new Date());
    this.storageKey = options.storageKey ?? LOCAL_STORAGE_KEY;
  }

  private load(): LocalState {
    const raw = this.store.getItem(this.storageKey);
    if (raw) return JSON.parse(raw) as LocalState;
    const fresh = this.seed();
    this.persist(fresh);
    return fresh;
  }

  private persist(state: LocalState): void {
    this.store.setItem(this.storageKey, JSON.stringify(state));
  }

  private read<T>(select: (state: LocalState) => T): Promise<T> {
    return Promise.resolve(structuredClone(select(this.load())));
  }

  private mutate<T>(change: (state: LocalState, now: Date) => T): Promise<T> {
    try {
      const state = this.load();
      const result = change(state, this.clock());
      this.persist(state);
      return Promise.resolve(structuredClone(result));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private nextId(state: LocalState): number {
    return state.nextId++;
  }

  reset(): Promise<void> {
    this.store.removeItem(this.storageKey);
    return Promise.resolve();
  }

  household = {
    get: (): Promise<Household> => this.read((state) => state.household),
    update: (input: Pick<Household, "name">): Promise<Household> =>
      this.mutate((state) => {
        if (input.name.trim() === "") invalid("Dê um nome à casa");
        state.household = { ...state.household, name: input.name.trim() };
        return state.household;
      }),
  };

  members = {
    list: (): Promise<Member[]> => this.read((state) => state.members),
    create: (input: MemberInput): Promise<Member> =>
      this.mutate((state, now) => {
        if (input.name.trim() === "") invalid("Dê um nome à pessoa");
        const member: Member = { ...input, name: input.name.trim(), id: this.nextId(state), createdAt: now.toISOString() };
        state.members.push(member);
        return member;
      }),
    update: (id: number, input: Partial<MemberInput>): Promise<Member> =>
      this.mutate((state) => {
        const member = findOrFail(state.members, id, "Membro");
        if (input.name !== undefined && input.name.trim() === "") invalid("Dê um nome à pessoa");
        Object.assign(member, input);
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
        findOrFail(state.members, memberId, "Membro");
        if (task.status === "done") conflict("Essa tarefa já foi concluída");
        const completion: Completion = {
          id: this.nextId(state),
          taskId: task.id,
          memberId,
          reviewerId: null,
          status: task.requiresReview ? "pending" : "approved",
          rating: null,
          pointsAwarded: task.requiresReview ? 0 : task.points,
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
  };

  completions = {
    list: (): Promise<Completion[]> =>
      this.read((state) => [...state.completions].sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))),
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
          pointsAwarded: pointsForRating(completion.taskPoints, input.rating),
        });
        return completion;
      }),
  };

  shopping = {
    list: (): Promise<ShoppingItem[]> => this.read((state) => state.shoppingItems),
    create: (input: ShoppingItemInput): Promise<ShoppingItem> =>
      this.mutate((state, now) => {
        if (input.name.trim() === "") invalid("Escreva o que está faltando");
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

  goal = {
    get: (): Promise<Goal | null> => this.read((state) => state.goal),
    update: (input: GoalInput): Promise<Goal> =>
      this.mutate((state) => {
        if (input.title.trim() === "") invalid("Diga qual é a recompensa");
        if (!Number.isInteger(input.targetPoints) || input.targetPoints <= 0) invalid("A meta precisa ser maior que zero");
        state.goal = { id: state.goal?.id ?? this.nextId(state), ...input, title: input.title.trim() };
        return state.goal;
      }),
  };
}
