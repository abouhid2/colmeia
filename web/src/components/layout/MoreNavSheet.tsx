import { Settings2 } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Dialog } from "../ui/Dialog";
import { SETTINGS_LABEL, SETTINGS_PATH, type NavItem } from "./navItems";

interface MoreNavSheetProps {
  open: boolean;
  onClose(): void;
  items: NavItem[];
}

/** The rest of the navigation, and the way to rearrange it. */
export function MoreNavSheet({ open, onClose, items }: MoreNavSheetProps) {
  const { search } = useLocation();

  return (
    <Dialog open={open} onClose={onClose} title="Mais">
      <ul className="space-y-2">
        {items.map(({ key, to, label, icon: Icon }) => (
          <li key={key}>
            <Link
              to={{ pathname: to, search }}
              onClick={onClose}
              className="flex items-center gap-3 rounded-card border border-line px-4 py-3 font-semibold transition-colors hover:bg-dune-100"
            >
              <Icon className="size-5 shrink-0 text-honey-700" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to={{ pathname: SETTINGS_PATH, search }}
        onClick={onClose}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-honey-700 hover:underline"
      >
        <Settings2 className="size-4" aria-hidden /> {SETTINGS_LABEL}
      </Link>
    </Dialog>
  );
}
