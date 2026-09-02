import { useCallback } from "react";
import type { Member, MemberInput } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";
import { useScopedQuery } from "./useScopedQuery";

const EMPTY: Member[] = [];
const EVERYTHING = [queryKeys.members, queryKeys.tasks, queryKeys.completions, queryKeys.shopping, queryKeys.goals] as const;

export function useMembers() {
  const api = useApi();
  const query = useScopedQuery(queryKeys.members, () => api.members.list());
  return { ...query, members: query.data ?? EMPTY };
}

/** Resolves member ids to members, for cards that only carry an id. */
export function useMemberLookup() {
  const { members } = useMembers();
  return useCallback(
    (id: number | null): Member | null => (id === null ? null : (members.find((member) => member.id === id) ?? null)),
    [members],
  );
}

export function useMemberMutations() {
  const api = useApi();
  const create = useAppMutation((input: MemberInput) => api.members.create(input), { invalidates: [queryKeys.members] });
  const update = useAppMutation(
    ({ id, input }: { id: number; input: Partial<MemberInput> }) => api.members.update(id, input),
    { invalidates: [queryKeys.members] },
  );
  const remove = useAppMutation((id: number) => api.members.remove(id), { invalidates: EVERYTHING });
  return { create, update, remove };
}
