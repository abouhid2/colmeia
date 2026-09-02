import type { Member, MemberColor, MemberPattern } from "../domain/types";
import { useMemberMutations } from "./useMembers";
import { useSession } from "./useSession";
import { useToast } from "./useToast";

export interface MemberMarkValue {
  /** Whoever is using the app, or null while the colmeia is still loading. */
  member: Member | null;
  setColor(color: MemberColor): void;
  setPattern(pattern: MemberPattern): void;
  isSaving: boolean;
}

/** The colour and the texture that stand for whoever is using the app. Every
 *  pick is saved on the spot, so there is no button to press. */
export function useMemberMark(): MemberMarkValue {
  const { currentMember } = useSession();
  const { update } = useMemberMutations();
  const { notify } = useToast();

  const save = (input: { color: MemberColor } | { pattern: MemberPattern }, message: string) => {
    if (currentMember === null) return;
    update.mutate({ id: currentMember.id, input }, { onSuccess: () => notify({ message }) });
  };

  return {
    member: currentMember,
    isSaving: update.isPending,
    setColor: (color) => save({ color }, "Cor trocada"),
    setPattern: (pattern) => save({ pattern }, "Textura trocada"),
  };
}
