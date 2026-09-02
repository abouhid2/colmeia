import { formatPoints } from "../../domain/points";
import type { Completion } from "../../domain/types";

/**
 * What the toast says once something already done is registered. The day only
 * shows up when it is not today: nobody needs to be told they did it today.
 */
export function logDoneMessage(completion: Completion, doerName: string, day: string | null): string {
  if (completion.status === "pending") {
    const registered = day === null ? "Registrado" : `Registrado em ${day}`;
    return `${registered}. Agora outra pessoa dá a nota e libera os ${completion.taskPoints} pontos.`;
  }
  const when = day === null ? "" : `, contando em ${day}`;
  return `+${formatPoints(completion.pointsAwarded)} para ${doerName}${when}.`;
}
