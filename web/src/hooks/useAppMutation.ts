import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorMessage } from "../api/errors";
import type { QueryKey } from "./queryKeys";
import { useToast } from "./useToast";

interface AppMutationOptions<TInput, TResult> {
  invalidates: readonly QueryKey[];
  onSuccess?(result: TResult, input: TInput): void;
}

/** useMutation with the two things every write here needs: cache invalidation and an error toast. */
export function useAppMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  options: AppMutationOptions<TInput, TResult>,
) {
  const queryClient = useQueryClient();
  const { notify } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: async (result, input) => {
      await Promise.all(options.invalidates.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      options.onSuccess?.(result, input);
    },
    onError: (error) => notify({ tone: "error", message: errorMessage(error) }),
  });
}
