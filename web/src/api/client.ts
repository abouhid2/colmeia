import type {
  AchievementAward,
  AchievementAwardInput,
  Completion,
  Goal,
  GoalInput,
  Household,
  HouseholdInput,
  HouseholdWithMembers,
  Member,
  MemberInput,
  ReviewInput,
  Season,
  SeasonInput,
  SeasonUpdate,
  ShoppingItem,
  ShoppingItemInput,
  ShoppingItemUpdate,
  Task,
  TaskInput,
} from "../domain/types";

/** Which slice of the history a screen wants. */
export interface CompletionQuery {
  /** Only what was scored inside this estação. */
  seasonId?: number | null;
  /** At most this many, newest first. */
  limit?: number;
}

export interface CompleteTaskResult {
  task: Task;
  completion: Completion;
}

export interface CompleteTaskOptions {
  /** When the work actually happened, ISO 8601. Absent means right now. */
  completedAt?: string;
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
  /** The championships of the colmeia. Everything that scores belongs to one. */
  seasons: {
    list(): Promise<Season[]>;
    create(input: SeasonInput): Promise<Season>;
    update(id: number, input: Partial<SeasonUpdate>): Promise<Season>;
    close(id: number): Promise<Season>;
    reopen(id: number): Promise<Season>;
    remove(id: number): Promise<void>;
  };
  tasks: {
    /** null spans every estação. */
    list(seasonId: number | null): Promise<Task[]>;
    create(input: TaskInput): Promise<Task>;
    update(id: number, input: Partial<TaskInput>): Promise<Task>;
    remove(id: number): Promise<void>;
    complete(id: number, memberId: number, options?: CompleteTaskOptions): Promise<CompleteTaskResult>;
    reopen(id: number): Promise<Task>;
  };
  completions: {
    /** Newest first, across every estação unless one is named: the profile
     *  history and the badges are counted from all of it. */
    list(options?: CompletionQuery): Promise<Completion[]>;
    review(id: number, input: ReviewInput): Promise<Completion>;
  };
  achievementAwards: {
    /** null asks for everyone in the colmeia. */
    list(memberId: number | null): Promise<AchievementAward[]>;
    /** Idempotent: whatever is already written down is left alone. */
    record(memberId: number, awards: AchievementAwardInput[]): Promise<AchievementAward[]>;
  };
  shopping: {
    list(): Promise<ShoppingItem[]>;
    create(input: ShoppingItemInput): Promise<ShoppingItem>;
    update(id: number, input: ShoppingItemUpdate): Promise<ShoppingItem>;
    remove(id: number): Promise<void>;
    clearPurchased(): Promise<void>;
  };
  goals: {
    /** null spans every estação. */
    list(seasonId: number | null): Promise<Goal[]>;
    create(input: GoalInput): Promise<Goal>;
    update(id: number, input: Partial<GoalInput>): Promise<Goal>;
    remove(id: number): Promise<void>;
  };
  /** Only meaningful for the in-browser store. */
  listStoredHouseholds?(): Promise<StoredHousehold[]>;
}
