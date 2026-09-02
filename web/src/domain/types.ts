export type Priority = "low" | "medium" | "high" | "urgent";
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "custom";
export type TaskStatus = "open" | "done";
export type CompletionStatus = "pending" | "approved";
export type GoalPeriod = "week" | "month";
export type MemberColor = "honey" | "pollen" | "leaf" | "berry" | "sky" | "plum";

export interface Household {
  id: number;
  name: string;
  /** The code in the invite link. Everything else is scoped to it. */
  inviteCode: string;
}

export interface Member {
  id: number;
  name: string;
  avatar: string;
  color: MemberColor;
  /** null while the member is still a placeholder nobody has claimed. */
  claimedAt: string | null;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  points: number;
  priority: Priority;
  recurrence: Recurrence;
  intervalDays: number | null;
  dueOn: string | null;
  requiresReview: boolean;
  status: TaskStatus;
  completedAt: string | null;
  assigneeId: number | null;
  createdById: number | null;
  createdAt: string;
}

export interface Completion {
  id: number;
  taskId: number | null;
  memberId: number | null;
  reviewerId: number | null;
  status: CompletionStatus;
  rating: number | null;
  pointsAwarded: number;
  taskTitle: string;
  taskPoints: number;
  completedAt: string;
  reviewedAt: string | null;
}

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
  title: string;
  targetPoints: number;
  period: GoalPeriod;
  /** null means the whole household works towards it. */
  memberId: number | null;
}

export interface HouseholdWithMembers extends Household {
  members: Member[];
}

export interface HouseholdInput {
  name: string;
  /** Placeholder people, waiting for whoever opens the link to claim them. */
  memberNames: string[];
}

export type MemberInput = Pick<Member, "name" | "avatar" | "color">;

export interface TaskInput {
  title: string;
  description: string | null;
  points: number;
  priority: Priority;
  recurrence: Recurrence;
  intervalDays: number | null;
  dueOn: string | null;
  requiresReview: boolean;
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

export type GoalInput = Pick<Goal, "title" | "targetPoints" | "period" | "memberId">;

export interface ReviewInput {
  reviewerId: number;
  rating: number;
}
