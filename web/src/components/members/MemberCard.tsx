import { Pencil } from "lucide-react";
import type { Standing } from "../../domain/leaderboard";
import type { Member } from "../../domain/types";
import { Avatar } from "../ui/Avatar";
import { IconButton } from "../ui/IconButton";

interface MemberCardProps {
  member: Member;
  periodStanding: Standing | undefined;
  allTimeStanding: Standing | undefined;
  onEdit(member: Member): void;
}

export function MemberCard({ member, periodStanding, allTimeStanding, onEdit }: MemberCardProps) {
  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <Avatar member={member} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{member.name}</p>
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink tabular-nums">{periodStanding?.points ?? 0}</span> no período · {allTimeStanding?.points ?? 0} no total
        </p>
        {member.claimedAt === null && <p className="text-xs text-ink-faint">Ainda não entrou</p>}
      </div>
      <IconButton label={`Editar ${member.name}`} icon={<Pencil className="size-4" />} onClick={() => onEdit(member)} />
    </li>
  );
}
