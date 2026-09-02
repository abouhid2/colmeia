import type { Member } from "../../domain/types";
import { cn } from "../../lib/cn";
import { LagartinhaMark } from "../members/LagartinhaMark";
import { Avatar } from "../ui/Avatar";

interface DoerPickerProps {
  members: Member[];
  selectedId: number | null;
  onSelect(id: number): void;
}

/** Who did the work: one chip per person, because a household is small enough
 *  that a list of faces beats a dropdown. */
export function DoerPicker({ members, selectedId, onSelect }: DoerPickerProps) {
  return (
    <div role="radiogroup" aria-label="Quem fez" className="grid grid-cols-2 gap-2">
      {members.map((member) => {
        const selected = member.id === selectedId;
        return (
          <button
            key={member.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(member.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-left font-medium transition-colors",
              selected ? "border-honey-500 bg-honey-100" : "border-line hover:bg-dune-100",
            )}
          >
            <Avatar member={member} size="sm" />
            <span className="min-w-0 flex-1 truncate">{member.name}</span>
            <LagartinhaMark member={member} compact />
          </button>
        );
      })}
    </div>
  );
}
