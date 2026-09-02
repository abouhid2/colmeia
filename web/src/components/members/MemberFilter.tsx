import { useMemberFilter } from "../../hooks/useMemberFilter";
import { useSession } from "../../hooks/useSession";
import { Avatar } from "../ui/Avatar";
import { FilterChip } from "../ui/FilterChip";

interface MemberFilterProps {
  /** Screens about one person at a time have no use for "Todos". */
  allowAll?: boolean;
  /** Who reads as selected while the URL still says nothing. */
  fallbackId?: number | null;
}

/** One filter for the whole app: pick a person and every screen narrows to them. */
export function MemberFilter({ allowAll = true, fallbackId = null }: MemberFilterProps) {
  const { members } = useSession();
  const { memberId, setMemberId } = useMemberFilter();
  const selectedId = memberId ?? fallbackId;

  return (
    <div role="radiogroup" aria-label="Filtrar por pessoa" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      {allowAll && (
        <FilterChip selected={selectedId === null} role="radio" aria-checked={selectedId === null} onClick={() => setMemberId(null)} className="pl-1.5">
          <span className="grid size-6 place-items-center rounded-full bg-dune-100 text-xs">👥</span> Todos
        </FilterChip>
      )}
      {members.map((member) => (
        <FilterChip key={member.id} selected={member.id === selectedId} role="radio" aria-checked={member.id === selectedId} onClick={() => setMemberId(member.id)} className="pl-1.5">
          <Avatar member={member} size="xs" /> {member.name}
        </FilterChip>
      ))}
    </div>
  );
}
