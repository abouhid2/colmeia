import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { useSession } from "../../hooks/useSession";
import { Avatar } from "../ui/Avatar";

/** Netflix-style "who is watching", because a kitchen tablet is shared by everyone. */
export function MemberSwitcher({ compact = false }: { compact?: boolean }) {
  const { currentMember, members, setCurrentMemberId } = useSession();
  const selectId = useId();
  if (!currentMember) return null;

  return (
    <label className="relative inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-8 hover:bg-dune-100">
      <Avatar member={currentMember} size="sm" />
      {!compact && (
        <span className="text-sm leading-tight">
          <span className="block text-[0.625rem] font-semibold uppercase tracking-wider text-ink-faint">Você é</span>
          <span className="block font-semibold">{currentMember.name}</span>
        </span>
      )}
      <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-ink-faint" aria-hidden />
      <select
        id={selectId}
        name="current-member"
        aria-label="Quem está usando"
        value={currentMember.id}
        onChange={(event) => setCurrentMemberId(Number(event.target.value))}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {members.map((member) => (
          <option key={member.id} value={member.id}>{member.avatar} {member.name}</option>
        ))}
      </select>
    </label>
  );
}
