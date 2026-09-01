import { useQuery } from "@tanstack/react-query";
import type { Task, TaskInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";

const EMPTY: Task[] = [];

export type TaskUpdate = Partial<TaskInput>;

export function useTasks() {
  const api = useApi();
  const query = useQuery({ queryKey: queryKeys.tasks, queryFn: () => api.tasks.list() });
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
    ({ id, memberId }: { id: number; memberId: number }) => api.tasks.complete(id, memberId),
    { invalidates: [queryKeys.tasks, queryKeys.completions] },
  );
  const reopen = useAppMutation((id: number) => api.tasks.reopen(id), { invalidates: [queryKeys.tasks] });
  return { create, update, remove, complete, reopen };
}
