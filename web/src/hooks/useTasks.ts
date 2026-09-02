import type { Task, TaskInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";
import { useSeason } from "./useSeasonContext";

const EMPTY: Task[] = [];

export type TaskUpdate = Partial<TaskInput>;

/** The tasks of the estação the app is showing. */
export function useTasks() {
  const api = useApi();
  const { currentSeason } = useSeason();
  const seasonId = currentSeason?.id ?? null;
  const query = useScopedQuery(queryKeys.tasks, () => api.tasks.list(seasonId), {
    scope: [ seasonId ],
    enabled: seasonId !== null,
  });
  return { ...query, tasks: query.data ?? EMPTY };
}

/** Every task of the colmeia, estações included: what the badges read. */
export function useAllTasks() {
  const api = useApi();
  const query = useScopedQuery(queryKeys.tasks, () => api.tasks.list(null), { scope: [ "todas" ] });
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
    invalidates: [queryKeys.tasks, queryKeys.completions, queryKeys.seasons],
  });
  const complete = useAppMutation(
    ({ id, memberId }: { id: number; memberId: number }) => api.tasks.complete(id, memberId),
    { invalidates: [queryKeys.tasks, queryKeys.completions, queryKeys.seasons] },
  );
  const reopen = useAppMutation((id: number) => api.tasks.reopen(id), {
    invalidates: [queryKeys.tasks, queryKeys.completions],
  });
  return { create, update, remove, complete, reopen };
}
