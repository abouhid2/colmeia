import { useState } from "react";
import { LIMITS } from "../../domain/limits";
import type { Priority, Recurrence, Task, TaskInput } from "../../domain/types";

export interface TaskFormValues {
  title: string;
  description: string;
  points: number;
  priority: Priority;
  recurrence: Recurrence;
  intervalDays: string;
  dueOn: string;
  requiresReview: boolean;
  kidFriendly: boolean;
  assigneeId: string;
}

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

function initialValues(task: Task | null): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    points: task?.points ?? 10,
    priority: task?.priority ?? "medium",
    recurrence: task?.recurrence ?? "none",
    intervalDays: task?.intervalDays ? String(task.intervalDays) : "",
    dueOn: task?.dueOn ?? "",
    requiresReview: task?.requiresReview ?? false,
    kidFriendly: task?.kidFriendly ?? false,
    assigneeId: task?.assigneeId ? String(task.assigneeId) : "",
  };
}

function validate(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  if (values.title.trim() === "") errors.title = "Dê um nome à tarefa";
  if (!Number.isInteger(values.points) || values.points <= 0) errors.points = "Vale pelo menos 1 ponto";
  if (values.points > LIMITS.taskPoints) errors.points = `No máximo ${LIMITS.taskPoints} pontos`;
  if (values.recurrence === "custom" && !(Number(values.intervalDays) > 0)) errors.intervalDays = "Diga a cada quantos dias";
  return errors;
}

export function toTaskInput(values: TaskFormValues, createdById: number | null, seasonId: number): TaskInput {
  return {
    seasonId,
    title: values.title.trim(),
    description: values.description.trim() || null,
    points: values.points,
    priority: values.priority,
    recurrence: values.recurrence,
    intervalDays: values.recurrence === "custom" ? Number(values.intervalDays) : null,
    dueOn: values.dueOn || null,
    requiresReview: values.requiresReview,
    kidFriendly: values.kidFriendly,
    assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
    createdById,
  };
}

export function useTaskForm(task: Task | null) {
  const [values, setValues] = useState(() => initialValues(task));
  const [touched, setTouched] = useState(false);
  const errors = validate(values);

  const set = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return {
    values,
    set,
    errors: touched ? errors : {},
    isValid: Object.keys(errors).length === 0,
    touch: () => setTouched(true),
  };
}
