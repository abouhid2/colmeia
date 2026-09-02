import { useHousehold } from "./useHousehold";

/**
 * Whether this colmeia talks about lagartinhas at all. Every screen with a
 * caterpillar mark, a multiplier, the kids' league or a task marked for a
 * child asks here, so the answer is read in one place.
 *
 * A colmeia nobody has answered for yet counts as off: a family without
 * children never sees the word, and one with them waits a render.
 */
export function useLagartinhasEnabled(): boolean {
  const { data: household } = useHousehold();
  return household?.lagartinhasEnabled ?? false;
}
