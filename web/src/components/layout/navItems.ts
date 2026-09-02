import { Award, CalendarRange, House, ListChecks, ShoppingBasket, Users, type LucideIcon } from "lucide-react";
import type { NavKey } from "../../domain/navigation";

export interface NavItem {
  key: NavKey;
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

/** Where the settings of one person live: next to the navigation, never in it. */
export const SETTINGS_PATH = "/ajustes";
export const SETTINGS_LABEL = "Meus ajustes";

/** Every screen the navigation can hold. The order somebody sees is their own:
 *  useNavItems resolves it from NAV_KEYS and whatever they arranged. */
export const NAV_ITEMS: Record<NavKey, NavItem> = {
  home: { key: "home", to: "/", label: "Início", icon: House, end: true },
  tasks: { key: "tasks", to: "/tarefas", label: "Tarefas", icon: ListChecks },
  shopping: { key: "shopping", to: "/compras", label: "Compras", icon: ShoppingBasket },
  family: { key: "family", to: "/familia", label: "Família", icon: Users },
  achievements: { key: "achievements", to: "/conquistas", label: "Conquistas", icon: Award },
  seasons: { key: "seasons", to: "/estacoes", label: "Estações", icon: CalendarRange },
};
