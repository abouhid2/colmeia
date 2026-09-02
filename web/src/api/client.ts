import type {
  Completion,
  Goal,
  GoalInput,
  Household,
  HouseholdInput,
  HouseholdWithMembers,
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

/** A colmeia this browser knows about, for the in-browser store only. */
export interface StoredHousehold {
  inviteCode: string;
  name: string;
  createdAt: string;
  demo: boolean;
}

/** A sandbox colmeia and the person whoever asked for it walks in as. */
export interface DemoColmeia {
  household: HouseholdWithMembers;
  member: Member;
}

export interface ColmeiaApi {
  readonly mode: "local" | "http";
  /** Which colmeia every scoped call below belongs to. */
  setInviteCode(code: string | null): void;
  /** Reachable with nothing but the code in the invite link. */
  households: {
    create(input: HouseholdInput): Promise<HouseholdWithMembers>;
    /** A colmeia of one's own, filled with the example, already claimed. */
    createDemo(): Promise<DemoColmeia>;
    lookup(code: string): Promise<HouseholdWithMembers>;
    claim(code: string, memberId: number): Promise<Member>;
    join(code: string, input: MemberInput): Promise<Member>;
  };
  household: {
    get(): Promise<Household>;
    update(input: Pick<Household, "name">): Promise<Household>;
    /** Only for a sandbox: back to the example, with the member to carry on as. */
    reseed(): Promise<Member>;
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
  listStoredHouseholds?(): Promise<StoredHousehold[]>;
}
