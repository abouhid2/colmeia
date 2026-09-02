import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { cn } from "../../lib/cn";
import type { NavItem } from "./navItems";

export type NavLayout = "rail" | "tabs";

interface NavLinksProps {
  items: NavItem[];
  layout: NavLayout;
  /** One more slot in the same row, for the button that opens the rest. */
  trailing?: ReactNode;
}

/** Tailwind reads the class out of the source, so every width is written down. */
const TAB_COLUMNS: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5",
};

/** Shared so the button that opens the rest sits in the row like a link. */
export function navLinkClasses(layout: NavLayout, isActive: boolean): string {
  const rail = layout === "rail";
  return cn(
    "flex w-full items-center font-semibold transition-colors",
    rail ? "gap-3 rounded-full px-4 py-2.5 text-sm" : "flex-col gap-0.5 px-0.5 py-2 text-[0.625rem]",
    isActive ? (rail ? "bg-honey-100 text-honey-900" : "text-honey-700") : "text-ink-soft hover:text-ink",
  );
}

export function NavLinks({ items, layout, trailing }: NavLinksProps) {
  const { search } = useLocation();
  const slots = items.length + (trailing === undefined ? 0 : 1);

  return (
    <ul className={layout === "rail" ? "flex flex-col gap-1" : cn("grid", TAB_COLUMNS[slots])}>
      {items.map(({ key, to, label, icon: Icon, end }) => (
        <li key={key}>
          <NavLink to={{ pathname: to, search }} end={end} className={({ isActive }) => navLinkClasses(layout, isActive)}>
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        </li>
      ))}
      {trailing !== undefined && <li>{trailing}</li>}
    </ul>
  );
}
