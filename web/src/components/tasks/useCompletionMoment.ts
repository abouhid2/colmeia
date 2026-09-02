import { useState } from "react";
import { completedAtError } from "../../domain/completionMoment";
import { useNow } from "../../hooks/useNow";
import { fromDateAndTimeInput, momentPhrase, toIsoDate, toTimeInput } from "../../lib/dates";

export interface CompletionMoment {
  /** False while the completion is simply "agora". */
  custom: boolean;
  date: string;
  time: string;
  setCustom(custom: boolean): void;
  setDate(date: string): void;
  setTime(time: string): void;
  /** Why the chosen moment cannot be, or null. */
  error: string | null;
  isValid: boolean;
  /** What travels with the completion. Absent means now. */
  completedAt: string | undefined;
  /** "14 de ago às 18:30", once a moment of its own is picked. */
  phrase: string | null;
}

/** When a task was done: now by default, or the day and hour a person picks. */
export function useCompletionMoment(): CompletionMoment {
  const now = useNow();
  const [custom, setCustom] = useState(false);
  const [date, setDate] = useState(() => toIsoDate(now));
  const [time, setTime] = useState(() => toTimeInput(now));

  const moment = custom ? fromDateAndTimeInput(date, time) : null;
  const error = moment === null ? null : completedAtError(moment, now);
  const chosen = moment !== null && error === null ? moment : null;

  return {
    custom,
    date,
    time,
    setCustom,
    setDate,
    setTime,
    error,
    isValid: error === null,
    completedAt: chosen?.toISOString(),
    phrase: chosen === null ? null : momentPhrase(chosen),
  };
}
