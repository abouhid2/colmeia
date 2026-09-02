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
}

export interface AchievementInput {
  memberId: number;
  completions: Completion[];
  tasks: Task[];
}

/** A task this heavy is a small project, not a chore. */
export const BIG_TASK_POINTS = 50;

interface Definition {
  id: AchievementId;
  name: string;
  hint: string;
  target: number;
  unit: string;
  measure(tally: Tally): number;
}

interface Tally {
  tasks: number;
  points: number;
  topRatings: number;
  reviews: number;
  urgent: number;
  big: number;
  days: number;
}

const DEFINITIONS: Definition[] = [
  { id: "firstTask", name: "Primeira tarefa", hint: "A primeira sempre é a mais difícil.", target: 1, unit: "tarefa", measure: (tally) => tally.tasks },
  { id: "tenTasks", name: "Dez tarefas", hint: "Dez tarefas concluídas.", target: 10, unit: "tarefas", measure: (tally) => tally.tasks },
  { id: "fiftyTasks", name: "Cinquenta tarefas", hint: "Cinquenta tarefas concluídas.", target: 50, unit: "tarefas", measure: (tally) => tally.tasks },
  { id: "hundredPoints", name: "Cem pontos", hint: "Cem pontos ganhos desde sempre.", target: 100, unit: "pontos", measure: (tally) => tally.points },
  { id: "fiveHundredPoints", name: "Quinhentos pontos", hint: "Quinhentos pontos ganhos desde sempre.", target: 500, unit: "pontos", measure: (tally) => tally.points },
  { id: "flawless", name: "Impecável", hint: "Recebeu uma nota 5 de alguém da casa.", target: 1, unit: "nota 5", measure: (tally) => tally.topRatings },
  { id: "fiveReviews", name: "Olho clínico", hint: "Avaliou o trabalho dos outros cinco vezes.", target: 5, unit: "avaliações", measure: (tally) => tally.reviews },
  { id: "urgentTask", name: "Apagou o incêndio", hint: "Deu conta de uma tarefa urgente.", target: 1, unit: "tarefa urgente", measure: (tally) => tally.urgent },
  { id: "bigTask", name: "Missão pesada", hint: `Fez uma tarefa de ${BIG_TASK_POINTS} pontos ou mais.`, target: 1, unit: "tarefa pesada", measure: (tally) => tally.big },
  { id: "sevenDays", name: "Sete dias na ativa", hint: "Fez tarefas em sete dias diferentes.", target: 7, unit: "dias", measure: (tally) => tally.days },
];

function tallyFor({ memberId, completions, tasks }: AchievementInput): Tally {
  const own = completions.filter((completion) => completion.memberId === memberId);
  const urgentTaskIds = new Set(tasks.filter((task) => task.priority === "urgent").map((task) => task.id));
  const days = new Set(own.map((completion) => startOfDay(parseISO(completion.completedAt)).getTime()));

  return {
    tasks: own.length,
    points: own.reduce((sum, completion) => sum + completion.pointsAwarded, 0),
    topRatings: own.filter((completion) => completion.rating === MAX_RATING).length,
    reviews: completions.filter((completion) => completion.reviewerId === memberId).length,
    urgent: own.filter((completion) => completion.taskId !== null && urgentTaskIds.has(completion.taskId)).length,
    big: own.filter((completion) => completion.taskPoints >= BIG_TASK_POINTS).length,
    days: days.size,
  };
}

/**
 * Badges read straight off the data, so they can never drift from it: nothing
 * is stored, and removing a completion takes its badge with it.
 */
export function memberAchievements(input: AchievementInput): Achievement[] {
  const tally = tallyFor(input);
  return DEFINITIONS.map(({ id, name, hint, target, unit, measure }) => {
    const current = Math.min(measure(tally), target);
    return { id, name, hint, current, target, unlocked: current >= target, progress: `${current} de ${target} ${unit}` };
  });
}
