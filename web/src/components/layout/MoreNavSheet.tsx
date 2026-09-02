import { LogOut, Settings2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useSessionContext } from "../../hooks/useSessionContext";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { SETTINGS_LABEL, SETTINGS_PATH, type NavItem } from "./navItems";

interface MoreNavSheetProps {
  open: boolean;
  onClose(): void;
  items: NavItem[];
}

/** The rest of the navigation, the way to rearrange it, and the way out. */
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
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={{ pathname: SETTINGS_PATH, search }}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-honey-700 hover:underline"
        >
          <Settings2 className="size-4" aria-hidden /> {SETTINGS_LABEL}
        </Link>
        <LeaveButton />
      </div>
    </Dialog>
  );
}

/** Asks once before it happens. It unmounts with the sheet, so it always asks again. */
function LeaveButton() {
  const { leave } = useSessionContext();
  const [ confirming, setConfirming ] = useState(false);

  return (
    <Button
      variant={confirming ? "danger" : "ghost"}
      size="sm"
      icon={<LogOut className="size-4" />}
      onClick={() => (confirming ? leave() : setConfirming(true))}
    >
      {confirming ? "Sair mesmo" : "Sair desta colmeia"}
    </Button>
  );
}
