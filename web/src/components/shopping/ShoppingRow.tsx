import { Check, X } from "lucide-react";
import type { Member, ShoppingItem } from "../../domain/types";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";
import { IconButton } from "../ui/IconButton";

interface ShoppingRowProps {
  item: ShoppingItem;
  addedBy: Member | null;
  purchasedBy: Member | null;
  onToggle(item: ShoppingItem): void;
  onRemove(item: ShoppingItem): void;
}

export function ShoppingRow({ item, addedBy, purchasedBy, onToggle, onRemove }: ShoppingRowProps) {
  const checkboxId = `item-${item.id}`;
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <input id={checkboxId} type="checkbox" checked={item.purchased} onChange={() => onToggle(item)} className="peer sr-only" />
      <label
        htmlFor={checkboxId}
        className={cn(
          "grid size-6 shrink-0 cursor-pointer place-items-center rounded-md border-2 transition-colors",
          item.purchased ? "border-leaf-500 bg-leaf-500 text-white" : "border-line-strong bg-surface text-transparent hover:border-honey-500",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-honey-200",
        )}
      >
        <Check className="size-4" strokeWidth={3} aria-hidden />
      </label>
      <label htmlFor={checkboxId} className="min-w-0 flex-1 cursor-pointer">
        <span className={cn("block truncate font-medium", item.purchased && "text-ink-faint line-through")}>
          {item.name}
          {item.quantity && <span className="ml-2 text-sm font-normal text-ink-soft">{item.quantity}</span>}
        </span>
        <span className="block text-xs text-ink-faint">
          {item.purchased && purchasedBy ? `Comprado por ${purchasedBy.name}` : addedBy ? `Pedido por ${addedBy.name}` : ""}
        </span>
      </label>
      {addedBy && !item.purchased && <Avatar member={addedBy} size="xs" />}
      <IconButton label={`Remover ${item.name}`} icon={<X className="size-4" />} tone="danger" onClick={() => onRemove(item)} />
    </li>
  );
}
