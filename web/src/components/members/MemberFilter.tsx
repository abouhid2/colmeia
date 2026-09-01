import { useMemberFilter } from "../../hooks/useMemberFilter";
import { useSession } from "../../hooks/useSession";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";

interface ChipProps {
  selected: boolean;
  onClick(): void;
  children: React.ReactNode;
}

function Chip({ selected, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-3 text-sm font-semibold transition-colors",
        selected ? "border-honey-500 bg-honey-200 text-honey-900" : "border-line bg-surface text-ink-soft hover:bg-dune-100 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** One filter for the whole app: pick a person and every screen narrows to them. */
export function MemberFilter() {
  const { members } = useSession();
  const { memberId, setMemberId } = useMemberFilter();

  return (
    <div role="radiogroup" aria-label="Filtrar por pessoa" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      <Chip selected={memberId === null} onClick={() => setMemberId(null)}>
        <span className="grid size-6 place-items-center rounded-full bg-dune-100 text-xs">👥</span> Todos
      </Chip>
      {members.map((member) => (
        <Chip key={member.id} selected={member.id === memberId} onClick={() => setMemberId(member.id)}>
          <Avatar member={member} size="xs" /> {member.name}
        </Chip>
      ))}
    </div>
  );
}
