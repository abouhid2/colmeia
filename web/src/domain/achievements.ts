import { parseISO, startOfDay } from "date-fns";
import { MAX_RATING } from "./points";
import type { Completion, Task } from "./types";

export type AchievementId =
  | "firstTask"
  | "tenTasks"
  | "fiftyTasks"
  | "hundredPoints"
  | "fiveHundredPoints"
  | "flawless"
  | "fiveReviews"
  | "urgentTask"
  | "bigTask"
  | "sevenDays";

export interface Achievement {
  id: AchievementId;
  name: string;
  hint: string;
  /** How far along, never above the target. */
  current: number;
  target: number;
  unlocked: boolean;
  /** "7 de 10 tarefas". */
  progress: string;
  /** Earned again every time it happens, instead of once and for all. */
  repeatable: boolean;
}

/** One time a badge was earned: the moment, and what earned it. */
export interface AchievementEvent {
  id: AchievementId;
  /** The completion that earned it, or null once that completion is gone. */
  completionId: number | null;
  awardedAt: string;
}

export interface AchievementInput {
  memberId: number;
  completions: Completion[];
  tasks: Task[];
}

/** A task this heavy is a small project, not a chore. */
export const BIG_TASK_POINTS = 50;

/** How many badges someone can pin on their own profile. */
export const MAX_FAVORITE_ACHIEVEMENTS = 3;

/** One completion pushing one badge along, and when it did. */
interface Contribution {
  completionId: number;
  at: string;
  amount: number;
}

/** This member's completions, already in the order the badges count them. */
interface Ledger {
  own: Completion[];
  given: Completion[];
  urgentTaskIds: Set<number>;
}

interface Definition {
  id: AchievementId;
  name: string;
  hint: string;
  target: number;
  unit: string;
  repeatable: boolean;
  contributions(ledger: Ledger): Contribution[];
}

/** A review lands when it is given, not when the task was done. */
function reviewedAt(completion: Completion): string {
  return completion.reviewedAt ?? completion.completedAt;
}

function step(completion: Completion, at = completion.completedAt): Contribution {
  return { completionId: completion.id, at, amount: 1 };
}

/** The first completion of each distinct day: seven of these are seven days. */
function firstOfEachDay(own: Completion[]): Completion[] {
  const seen = new Set<number>();
  return own.filter((completion) => {
    const day = startOfDay(parseISO(completion.completedAt)).getTime();
    if (seen.has(day)) return false;
    seen.add(day);
    return true;
  });
}

const DEFINITIONS: Definition[] = [
  { id: "firstTask", name: "Primeira tarefa", hint: "A primeira sempre é a mais difícil.", target: 1, unit: "tarefa", repeatable: false, contributions: ({ own }) => own.map((completion) => step(completion)) },
  { id: "tenTasks", name: "Dez tarefas", hint: "Dez tarefas feitas. A casa sente a diferença.", target: 10, unit: "tarefas", repeatable: false, contributions: ({ own }) => own.map((completion) => step(completion)) },
  { id: "fiftyTasks", name: "Cinquenta tarefas", hint: "Cinquenta tarefas feitas. Isso já virou hábito.", target: 50, unit: "tarefas", repeatable: false, contributions: ({ own }) => own.map((completion) => step(completion)) },
  { id: "hundredPoints", name: "Cem pontos", hint: "Cem pontos somados desde o começo.", target: 100, unit: "pontos", repeatable: false, contributions: ({ own }) => own.map((completion) => ({ ...step(completion), amount: completion.pointsAwarded })) },
  { id: "fiveHundredPoints", name: "Quinhentos pontos", hint: "Quinhentos pontos somados desde o começo.", target: 500, unit: "pontos", repeatable: false, contributions: ({ own }) => own.map((completion) => ({ ...step(completion), amount: completion.pointsAwarded })) },
  { id: "flawless", name: "Impecável", hint: "Ganhou uma nota 5 de alguém da colmeia.", target: 1, unit: "nota 5", repeatable: true, contributions: ({ own }) => own.filter((completion) => completion.rating === MAX_RATING).map((completion) => step(completion, reviewedAt(completion))) },
  { id: "fiveReviews", name: "Olho clínico", hint: "Avaliou o trabalho dos outros cinco vezes.", target: 5, unit: "avaliações", repeatable: false, contributions: ({ given }) => given.map((completion) => step(completion, reviewedAt(completion))) },
  { id: "urgentTask", name: "Apagou o incêndio", hint: "Deu conta de uma tarefa urgente.", target: 1, unit: "tarefa urgente", repeatable: true, contributions: ({ own, urgentTaskIds }) => own.filter((completion) => completion.taskId !== null && urgentTaskIds.has(completion.taskId)).map((completion) => step(completion)) },
  { id: "bigTask", name: "Missão pesada", hint: `Fez uma tarefa de ${BIG_TASK_POINTS} pontos ou mais.`, target: 1, unit: "tarefa pesada", repeatable: true, contributions: ({ own }) => own.filter((completion) => completion.taskPoints >= BIG_TASK_POINTS).map((completion) => step(completion)) },
  { id: "sevenDays", name: "Sete dias na ativa", hint: "Fez tarefas em sete dias diferentes.", target: 7, unit: "dias", repeatable: false, contributions: ({ own }) => firstOfEachDay(own).map((completion) => step(completion)) },
];

/** The same ids the Rails side validates against, in the same spelling. */
export const ACHIEVEMENT_IDS: AchievementId[] = DEFINITIONS.map((definition) => definition.id);

const REPEATABLE_IDS = new Set(DEFINITIONS.filter((definition) => definition.repeatable).map((definition) => definition.id));

export function isAchievementId(value: string): value is AchievementId {
  return (ACHIEVEMENT_IDS as string[]).includes(value);
}

/** Milestones are earned once; the rest count every time they happen. */
export function isRepeatable(id: AchievementId): boolean {
  return REPEATABLE_IDS.has(id);
}

function byTime(left: { at: string }, right: { at: string }): number {
  return Date.parse(left.at) - Date.parse(right.at);
}

function ledgerFor({ memberId, completions, tasks }: AchievementInput): Ledger {
  return {
    own: completions
      .filter((completion) => completion.memberId === memberId)
      .sort((left, right) => Date.parse(left.completedAt) - Date.parse(right.completedAt)),
    given: completions
      .filter((completion) => completion.reviewerId === memberId)
      .sort((left, right) => Date.parse(reviewedAt(left)) - Date.parse(reviewedAt(right))),
    urgentTaskIds: new Set(tasks.filter((task) => task.priority === "urgent").map((task) => task.id)),
  };
}

function contributionsFor(definition: Definition, ledger: Ledger): Contribution[] {
  return definition.contributions(ledger).sort(byTime);
}

/** A milestone is awarded by whatever completion crossed its target; a
 *  repeatable badge is awarded again by every completion that qualifies. */
function eventsFor(definition: Definition, contributions: Contribution[]): AchievementEvent[] {
  if (definition.repeatable) {
    return contributions
      .filter((contribution) => contribution.amount > 0)
      .map((contribution) => ({ id: definition.id, completionId: contribution.completionId, awardedAt: contribution.at }));
  }

  let running = 0;
  for (const contribution of contributions) {
    running += contribution.amount;
    if (running >= definition.target) {
      return [ { id: definition.id, completionId: contribution.completionId, awardedAt: contribution.at } ];
    }
  }
  return [];
}

/**
 * Every time this person earned a badge, oldest first. Read straight off the
 * completions, so it can be recomputed at any moment: what gets written down
 * is what survives the completions themselves being deleted.
 */
export function achievementEvents(input: AchievementInput): AchievementEvent[] {
  const ledger = ledgerFor(input);
  return DEFINITIONS
    .flatMap((definition) => eventsFor(definition, contributionsFor(definition, ledger)))
    .sort((left, right) => Date.parse(left.awardedAt) - Date.parse(right.awardedAt));
}

/**
 * Badges read straight off the data, so they can never drift from it: nothing
 * is stored, and removing a completion takes its badge with it. What was
 * already written down lives in the awards, and is merged in on the way out.
 */
export function memberAchievements(input: AchievementInput): Achievement[] {
  const ledger = ledgerFor(input);
  return DEFINITIONS.map((definition) => {
    const { id, name, hint, target, unit, repeatable } = definition;
    const total = contributionsFor(definition, ledger).reduce((sum, contribution) => sum + contribution.amount, 0);
    const current = Math.min(total, target);
    return { id, name, hint, current, target, unlocked: current >= target, progress: `${current} de ${target} ${unit}`, repeatable };
  });
}
