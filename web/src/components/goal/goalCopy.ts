import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPoints } from "../../domain/points";
import type { PeriodBounds } from "../../domain/progress";
import type { GoalPeriod } from "../../domain/types";

/** How a household goal names its owner inside a sentence. */
export const HOUSEHOLD_OWNER = "a casa";

export function periodScopeLabel(period: GoalPeriod): string {
  return period === "week" ? "Esta semana" : "Este mês";
}

/** The same scope, lowercased for the middle of a sentence. */
export function periodWhen(period: GoalPeriod): string {
  return period === "week" ? "nesta semana" : "neste mês";
}

export function periodEnding(bounds: PeriodBounds): string {
  const lastDay = subDays(bounds.end, 1);
  return `até ${format(lastDay, "EEEEEE, d 'de' MMM", { locale: ptBR })}`;
}

export interface GoalPreview {
  /** null while the whole household works towards it. */
  ownerName: string | null;
  targetPoints: number;
  period: GoalPeriod;
  /** What they get for reaching it: the goal's title. */
  reward: string;
}

/** One sentence tying the two halves together: the points to reach, then what they pay. */
export function goalPreviewSentence({ ownerName, targetPoints, period, reward }: GoalPreview): string {
  const who = ownerName?.trim() || HOUSEHOLD_OWNER;
  const target = targetPoints > 0 ? `juntar ${formatPoints(targetPoints)}` : "bater a meta";
  const prize = reward.trim() === "" ? "ganha a recompensa combinada" : `ganha: ${reward.trim()}`;
  return `Quando ${who} ${target} ${periodWhen(period)}, ${prize}.`;
}
