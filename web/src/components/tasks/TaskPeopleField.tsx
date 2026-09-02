import { Users } from "lucide-react";
import type { Member } from "../../domain/types";
import { Avatar } from "../ui/Avatar";
import { Field } from "../ui/Field";
import { FilterChip } from "../ui/FilterChip";

interface TaskPeopleFieldProps {
  members: Member[];
  selected: number[];
  onToggle(id: number): void;
  onAnyone(): void;
}

/** Who does the task: nobody picked means whoever gets to it first, and more
 *  than one person means the work is shared. */
export function TaskPeopleField({ members, selected, onToggle, onAnyone }: TaskPeopleFieldProps) {
  const anyone = selected.length === 0;

  return (
    <Field label="Quem faz" hint={selected.length > 1 ? "A tarefa é de todos que você marcar. Quem terminar dá o feito." : undefined}>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quem faz a tarefa">
        <FilterChip selected={anyone} aria-pressed={anyone} onClick={onAnyone} className="pl-1.5">
          <span className="grid size-6 place-items-center rounded-full bg-dune-100"><Users className="size-3.5" aria-hidden /></span>
          Quem pegar primeiro
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
