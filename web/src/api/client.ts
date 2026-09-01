import type {
  Completion,
  Goal,
  GoalInput,
  Household,
  Member,
  MemberInput,
  ReviewInput,
  ShoppingItem,
  ShoppingItemInput,
  ShoppingItemUpdate,
  Task,
  TaskInput,
} from "../domain/types";

export interface CompleteTaskResult {
  task: Task;
  completion: Completion;
}

export interface ColmeiaApi {
  readonly mode: "local" | "http";
  household: {
    get(): Promise<Household>;
    update(input: Pick<Household, "name">): Promise<Household>;
  };
  members: {
    list(): Promise<Member[]>;
    create(input: MemberInput): Promise<Member>;
    update(id: number, input: Partial<MemberInput>): Promise<Member>;
    remove(id: number): Promise<void>;
  };
  tasks: {
    list(): Promise<Task[]>;
    create(input: TaskInput): Promise<Task>;
    update(id: number, input: Partial<TaskInput>): Promise<Task>;
    remove(id: number): Promise<void>;
    complete(id: number, memberId: number): Promise<CompleteTaskResult>;
    reopen(id: number): Promise<Task>;
  };
  completions: {
    list(): Promise<Completion[]>;
    review(id: number, input: ReviewInput): Promise<Completion>;
  };
  shopping: {
    list(): Promise<ShoppingItem[]>;
    create(input: ShoppingItemInput): Promise<ShoppingItem>;
    update(id: number, input: ShoppingItemUpdate): Promise<ShoppingItem>;
    remove(id: number): Promise<void>;
    clearPurchased(): Promise<void>;
  };
  goals: {
    list(): Promise<Goal[]>;
    create(input: GoalInput): Promise<Goal>;
    update(id: number, input: Partial<GoalInput>): Promise<Goal>;
    remove(id: number): Promise<void>;
  };
  /** Only meaningful for the in-browser store. */
  reset?(): Promise<void>;
}
