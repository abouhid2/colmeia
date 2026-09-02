import type { Task, TaskInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";

const EMPTY: Task[] = [];

export type TaskUpdate = Partial<TaskInput>;

export interface CompleteTaskVariables {
  id: number;
  memberId: number;
  /** When the work happened, ISO 8601. Absent means right now. */
  completedAt?: string;
}

export function useTasks() {
  const api = useApi();
  const query = useScopedQuery(queryKeys.tasks, () => api.tasks.list());
  return { ...query, tasks: query.data ?? EMPTY };
}

export function useTaskMutations() {
  const api = useApi();
  const create = useAppMutation((input: TaskInput) => api.tasks.create(input), { invalidates: [queryKeys.tasks] });
  const update = useAppMutation(
    ({ id, input }: { id: number; input: TaskUpdate }) => api.tasks.update(id, input),
    { invalidates: [queryKeys.tasks] },
  );
  const remove = useAppMutation((id: number) => api.tasks.remove(id), {
    invalidates: [queryKeys.tasks, queryKeys.completions],
  });
  const complete = useAppMutation(
    ({ id, memberId, completedAt }: CompleteTaskVariables) => api.tasks.complete(id, memberId, { completedAt }),
    { invalidates: [queryKeys.tasks, queryKeys.completions] },
  );
  const reopen = useAppMutation((id: number) => api.tasks.reopen(id), {
    invalidates: [queryKeys.tasks, queryKeys.completions],
  });
  return { create, update, remove, complete, reopen };
}
