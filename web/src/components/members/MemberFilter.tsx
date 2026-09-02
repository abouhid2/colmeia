import { useMemberFilter } from "../../hooks/useMemberFilter";
import { useSession } from "../../hooks/useSession";
import { Avatar } from "../ui/Avatar";
import { FilterChip } from "../ui/FilterChip";

/** One filter for the whole app: pick a person and every screen narrows to them. */
export function MemberFilter() {
  const { members } = useSession();
  const { memberId, setMemberId } = useMemberFilter();

  return (
    <div role="radiogroup" aria-label="Filtrar por pessoa" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      <FilterChip selected={memberId === null} role="radio" aria-checked={memberId === null} onClick={() => setMemberId(null)} className="pl-1.5">
        <span className="grid size-6 place-items-center rounded-full bg-dune-100 text-xs">👥</span> Todos
      </FilterChip>
      {members.map((member) => (
        <FilterChip key={member.id} selected={member.id === memberId} role="radio" aria-checked={member.id === memberId} onClick={() => setMemberId(member.id)} className="pl-1.5">
          <Avatar member={member} size="xs" /> {member.name}
        </FilterChip>
      ))}
    </div>
  );
}
