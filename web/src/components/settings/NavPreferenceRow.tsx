import { ChevronDown, ChevronUp } from "lucide-react";
import { PINNED_NAV_KEY } from "../../domain/navigation";
import type { ResolvedNavItem } from "../../hooks/useNavItems";
import { IconButton } from "../ui/IconButton";
import { Toggle } from "../ui/Toggle";

interface NavPreferenceRowProps {
  item: ResolvedNavItem;
  isFirst: boolean;
  isLast: boolean;
  saving: boolean;
  onMove(step: -1 | 1): void;
  onVisible(visible: boolean): void;
}

/** One screen: whether it shows, and where it sits. */
export function NavPreferenceRow({ item, isFirst, isLast, saving, onMove, onVisible }: NavPreferenceRowProps) {
  const pinned = item.key === PINNED_NAV_KEY;

  return (
    <li className="flex items-center gap-1">
      <div className="min-w-0 flex-1">
        <Toggle
          checked={item.visible}
          onChange={onVisible}
          label={item.label}
          hint={pinned ? "Sempre no menu" : undefined}
          disabled={pinned || saving}
        />
      </div>
      <IconButton
        label={`Mover ${item.label} para cima`}
        icon={<ChevronUp className="size-5" />}
        disabled={isFirst || saving}
        onClick={() => onMove(-1)}
      />
      <IconButton
        label={`Mover ${item.label} para baixo`}
        icon={<ChevronDown className="size-5" />}
        disabled={isLast || saving}
        onClick={() => onMove(1)}
      />
    </li>
  );
}
