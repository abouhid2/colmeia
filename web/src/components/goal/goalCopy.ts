import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PeriodBounds } from "../../domain/progress";
import type { GoalPeriod } from "../../domain/types";

export function periodTitle(period: GoalPeriod): string {
  return period === "week" ? "Meta da semana" : "Meta do mês";
}

export function periodScopeLabel(period: GoalPeriod): string {
  return period === "week" ? "Esta semana" : "Este mês";
}

export function periodEnding(bounds: PeriodBounds): string {
  const lastDay = subDays(bounds.end, 1);
  return `até ${format(lastDay, "EEEEEE, d 'de' MMM", { locale: ptBR })}`;
}
