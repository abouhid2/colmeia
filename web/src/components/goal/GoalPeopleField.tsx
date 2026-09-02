import { Users } from "lucide-react";
import type { Member } from "../../domain/types";
import { Avatar } from "../ui/Avatar";
import { Field } from "../ui/Field";
import { FilterChip } from "../ui/FilterChip";

interface GoalPeopleFieldProps {
  members: Member[];
  selected: number[];
  onToggle(id: number): void;
  onEveryone(): void;
}

/** Who the goal is for: nobody picked means the whole colmeia is in it. */
export function GoalPeopleField({ members, selected, onToggle, onEveryone }: GoalPeopleFieldProps) {
  const everyone = selected.length === 0;

  return (
    <Field
      label="Para quem"
      hint={everyone ? "Os pontos de todo mundo contam." : "Só os pontos de quem está marcado contam."}
    >
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Para quem é a meta">
        <FilterChip selected={everyone} aria-pressed={everyone} onClick={onEveryone} className="pl-1.5">
          <span className="grid size-6 place-items-center rounded-full bg-dune-100"><Users className="size-3.5" aria-hidden /></span>
          A colmeia inteira
        </FilterChip>
        {members.map((member) => {
          const picked = selected.includes(member.id);
          return (
            <FilterChip key={member.id} selected={picked} aria-pressed={picked} onClick={() => onToggle(member.id)} className="pl-1.5">
              <Avatar member={member} size="xs" /> {member.name}
            </FilterChip>
          );
        })}
      </div>
    </Field>
  );
}
