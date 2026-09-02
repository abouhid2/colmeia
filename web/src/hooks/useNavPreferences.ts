import { NAV_ITEMS } from "../components/layout/navItems";
import { withNavKeyMoved, withNavKeyVisible, type NavKey, type NavPreferences } from "../domain/navigation";
import { useMemberMutations } from "./useMembers";
import { useNavItems, type ResolvedNavItem } from "./useNavItems";
import { useSession } from "./useSession";
import { useToast } from "./useToast";

export interface NavPreferencesValue {
  /** Every screen in this person's order, the ones they turned off included. */
  items: ResolvedNavItem[];
  move(key: NavKey, step: -1 | 1): void;
  setVisible(key: NavKey, visible: boolean): void;
  /** One change at a time: the next one is written from the one before it. */
  isSaving: boolean;
}

/** Arranging the navigation of whoever is using the app. Every change is saved
 *  on the spot, so there is no button to press and nothing to lose. */
export function useNavPreferences(): NavPreferencesValue {
  const { currentMember } = useSession();
  const { items, preferences } = useNavItems();
  const { update } = useMemberMutations();
  const { notify } = useToast();

  const save = (navPreferences: NavPreferences, message: string) => {
    if (currentMember === null) return;
    update.mutate({ id: currentMember.id, input: { navPreferences } }, { onSuccess: () => notify({ message }) });
  };

  return {
    items,
    isSaving: update.isPending,
    move: (key, step) => save(withNavKeyMoved(preferences, key, step), `${NAV_ITEMS[key].label} mudou de lugar`),
    setVisible: (key, visible) =>
      save(withNavKeyVisible(preferences, key, visible), `${NAV_ITEMS[key].label} ${visible ? "voltou ao menu" : "saiu do menu"}`),
  };
}
