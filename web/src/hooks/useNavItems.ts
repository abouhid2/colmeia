import { useMemo } from "react";
import { NAV_ITEMS, type NavItem } from "../components/layout/navItems";
import { isNavKeyVisible, navOrder, normalizeNavPreferences, type NavPreferences } from "../domain/navigation";
import { useSession } from "./useSession";

export interface ResolvedNavItem extends NavItem {
  /** Off means this person took the screen out of their own navigation. */
  visible: boolean;
}

export interface NavItemsValue {
  /** Every screen in this person's order, the ones they turned off included. */
  items: ResolvedNavItem[];
  /** What the sidebar and the bar at the bottom of a phone show. */
  visible: ResolvedNavItem[];
  preferences: NavPreferences;
}

/** The one place the navigation is resolved: the default order, rearranged by
 *  whoever is using the app right now. */
export function useNavItems(): NavItemsValue {
  const { currentMember } = useSession();
  const stored = currentMember?.navPreferences;

  return useMemo(() => {
    const preferences = normalizeNavPreferences(stored);
    const items = navOrder(preferences).map((key) => ({ ...NAV_ITEMS[key], visible: isNavKeyVisible(preferences, key) }));
    return { items, visible: items.filter((item) => item.visible), preferences };
  }, [stored]);
}
