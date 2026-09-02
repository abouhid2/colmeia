import { NavLink, useLocation } from "react-router";
import { cn } from "../../lib/cn";
import { NAV_ITEMS } from "./navItems";

interface NavLinksProps {
  layout: "rail" | "tabs";
}

export function NavLinks({ layout }: NavLinksProps) {
  const rail = layout === "rail";
  const { search } = useLocation();
  return (
    <ul className={cn(rail ? "flex flex-col gap-1" : "grid grid-cols-5")}>
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={{ pathname: to, search }}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center font-semibold transition-colors",
                rail ? "gap-3 rounded-full px-4 py-2.5 text-sm" : "flex-col gap-0.5 px-0.5 py-2 text-[0.625rem]",
                isActive ? (rail ? "bg-honey-100 text-honey-900" : "text-honey-700") : "text-ink-soft hover:text-ink",
              )
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
