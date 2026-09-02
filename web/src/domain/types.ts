import type { AchievementId } from "./achievements";

export type Priority = "low" | "medium" | "high" | "urgent";
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "custom";
export type TaskStatus = "open" | "done";
export type CompletionStatus = "pending" | "approved";
export type MemberColor = "honey" | "pollen" | "leaf" | "berry" | "sky" | "plum";
/** A lagartinha is a child: the same colmeia, smaller reach, points scaled up. */
export type MemberKind = "bee" | "lagartinha";

export interface Household {
  id: number;
  name: string;
  /** The code in the invite link. Everything else is scoped to it. */
  inviteCode: string;
  /** A sandbox filled with the example family: nothing in it is real. */
  demo: boolean;
}

/** A championship the colmeia runs: its own tasks, goals, points and ranking. */
export interface Season {
  id: number;
  name: string;
  /** ISO date. */
  startsOn: string;
  /** ISO date, or null for an estação with no end in sight. */
  endsOn: string | null;
  /** Set once the ranking is frozen. */
  closedAt: string | null;
  createdAt: string;
  tasksCount: number;
  completionsCount: number;
}

export interface Member {
  id: number;
  name: string;
  avatar: string;
  color: MemberColor;
  kind: MemberKind;
  /** What this person earns per point a task is worth. 1 for most adults. */
  pointsMultiplier: number;
  /** null while the member is still a placeholder nobody has claimed. */
  claimedAt: string | null;
  /** What they want to be called when they win an estação. Blank means they never wear the crown. */
  crownTitle: string;
  /** Up to three badges this person pinned on their own profile. */
  favoriteAchievements: AchievementId[];
  createdAt: string;
}

export interface Task {
  id: number;
  seasonId: number;
  title: string;
  description: string | null;
  points: number;
  priority: Priority;
  recurrence: Recurrence;
  intervalDays: number | null;
  dueOn: string | null;
  requiresReview: boolean;
  /** Marked by an adult as something a child can actually do. */
  kidFriendly: boolean;
  status: TaskStatus;
  completedAt: string | null;
  assigneeId: number | null;
  createdById: number | null;
  createdAt: string;
}

export interface Completion {
  id: number;
  seasonId: number;
  taskId: number | null;
  memberId: number | null;
  reviewerId: number | null;
  status: CompletionStatus;
  rating: number | null;
  pointsAwarded: number;
  /** The doer's multiplier at the time, so history survives a later change. */
  multiplier: number;
  taskTitle: string;
  taskPoints: number;
  completedAt: string;
  reviewedAt: string | null;
}

/** A badge written down, so the history outlives the completion that earned it. */
export interface AchievementAward {
  id: number;
  memberId: number;
  key: AchievementId;
  /** The completion that earned it, kept as a plain number: it may be gone. */
  completionId: number | null;
  awardedAt: string;
}

export type AchievementAwardInput = Omit<AchievementAward, "id" | "memberId">;

export interface ShoppingItem {
  id: number;
  name: string;
  quantity: string | null;
  addedById: number | null;
  purchased: boolean;
  purchasedById: number | null;
  purchasedAt: string | null;
  createdAt: string;
}

export interface Goal {
  id: number;
  seasonId: number;
  title: string;
  targetPoints: number;
  /** null means the whole household works towards it. */
  memberId: number | null;
}

/** The crown the ranking awards on its own, or one the family votes on. */
export type SeasonTitleKind = "auto" | "vote";

/** A name the colmeia hands out at the end of an estação. Titles belong to the
 *  colmeia, not to one estação: they come back every season. */
export interface SeasonTitle {
  id: number;
  name: string;
  description: string;
  emoji: string;
  kind: SeasonTitleKind;
  /** Where it sits in the list. */
  position: number;
  /** A title dropped after somebody was already called it goes quiet instead of away. */
  active: boolean;
}

export type SeasonTitleInput = Pick<SeasonTitle, "name" | "description" | "emoji">;

export type SeasonTitleUpdate = Partial<SeasonTitleInput & Pick<SeasonTitle, "position" | "active">>;

/** One person saying who was the Pernilongo of an estação. */
export interface SeasonTitleVote {
  id: number;
  seasonId: number;
  seasonTitleId: number;
  voterId: number;
  voteeId: number;
}

export interface VoteInput {
  seasonTitleId: number;
  voterId: number;
  voteeId: number;
}

/** Taking a vote back needs only to say which vote is yours. */
export type VoteKey = Pick<VoteInput, "seasonTitleId" | "voterId">;

export interface HouseholdWithMembers extends Household {
  members: Member[];
}

export interface HouseholdInput {
  name: string;
  /** Placeholder people, waiting for whoever opens the link to claim them. */
  memberNames: string[];
}

export interface MemberInput extends Pick<Member, "name" | "avatar" | "color" | "crownTitle"> {
  kind?: MemberKind;
  pointsMultiplier?: number;
  favoriteAchievements?: AchievementId[];
}

export interface TaskInput {
  seasonId: number;
  title: string;
  description: string | null;
  points: number;
  priority: Priority;
  recurrence: Recurrence;
  intervalDays: number | null;
  dueOn: string | null;
  requiresReview: boolean;
  kidFriendly: boolean;
  assigneeId: number | null;
  createdById: number | null;
}

export interface ShoppingItemInput {
  name: string;
  quantity: string | null;
  addedById: number | null;
}

export interface ShoppingItemUpdate {
  name?: string;
  quantity?: string | null;
  purchased?: boolean;
  purchasedById?: number | null;
}

export type GoalInput = Pick<Goal, "seasonId" | "title" | "targetPoints" | "memberId">;

export interface SeasonInput {
  name: string;
  startsOn: string;
  endsOn: string | null;
  /** Open tasks of this estação come along, so the chores do not have to be retyped. */
  copyTasksFromSeasonId?: number | null;
}

export type SeasonUpdate = Pick<SeasonInput, "name" | "startsOn" | "endsOn">;

export interface ReviewInput {
  reviewerId: number;
  rating: number;
}
