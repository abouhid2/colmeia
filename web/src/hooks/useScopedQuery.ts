import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "./queryKeys";
import { useSessionContext } from "./useSessionContext";

interface ScopedQueryOptions {
  /** Extra key parts, so data of one estação never shows up under another. */
  scope?: readonly (string | number | null)[];
  enabled?: boolean;
}

/**
 * Scoped data only exists inside a colmeia. The invite code rides along in the
 * query key so switching colmeias never shows the previous one's cache, while
 * invalidating by the plain key still matches.
 */
export function useScopedQuery<T>(queryKey: QueryKey, queryFn: () => Promise<T>, options: ScopedQueryOptions = {}) {
  const { session } = useSessionContext();
  const { scope = [], enabled = true } = options;
  return useQuery({
    queryKey: [ ...queryKey, session?.inviteCode ?? null, ...scope ],
    queryFn,
    enabled: session !== null && enabled,
  });
}
