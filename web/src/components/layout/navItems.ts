import { House, ListChecks, ShoppingBasket, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: House, end: true },
  { to: "/tarefas", label: "Tarefas", icon: ListChecks },
  { to: "/compras", label: "Compras", icon: ShoppingBasket },
  { to: "/familia", label: "Família", icon: Users },
];
