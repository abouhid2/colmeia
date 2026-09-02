import { lagartinhasOffNote } from "../../domain/lagartinhas";
import { useHousehold, useUpdateHousehold } from "../../hooks/useHousehold";
import { useLagartinhasEnabled } from "../../hooks/useLagartinhas";
import { useMembers } from "../../hooks/useMembers";

/** The switch on the Família page: what it reads, what flipping it saves, and
 *  what it owes the family when it is off and there are children registered. */
export function useLagartinhasSetting() {
  const { data: household } = useHousehold();
  const saved = useLagartinhasEnabled();
  const { members } = useMembers();
  const update = useUpdateHousehold();

  // While the save is in flight the switch shows where it is going, not where
  // it came from, so it answers the tap right away.
  const enabled = update.isPending ? (update.variables.lagartinhasEnabled ?? saved) : saved;

  return {
    ready: household !== undefined,
    enabled,
    note: enabled ? null : lagartinhasOffNote(members),
    toggle: (next: boolean) => update.mutate({ lagartinhasEnabled: next }),
  };
}
