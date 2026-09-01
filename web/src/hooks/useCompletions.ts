import { useQuery } from "@tanstack/react-query";
import type { Completion, ReviewInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";

const EMPTY: Completion[] = [];

export function useCompletions() {
  const api = useApi();
  const query = useQuery({ queryKey: queryKeys.completions, queryFn: () => api.completions.list() });
  const completions = query.data ?? EMPTY;
  return { ...query, completions, pending: completions.filter((completion) => completion.status === "pending") };
}

export function useReviewCompletion() {
  const api = useApi();
  return useAppMutation(
    ({ id, input }: { id: number; input: ReviewInput }) => api.completions.review(id, input),
    { invalidates: [queryKeys.completions] },
  );
}
