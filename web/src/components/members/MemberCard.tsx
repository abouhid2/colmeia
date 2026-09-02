import { Pencil } from "lucide-react";
import { Link, useLocation } from "react-router";
import type { Standing } from "../../domain/leaderboard";
import type { GoalPeriod, Member } from "../../domain/types";
import { periodScopeLabel } from "../goal/goalCopy";
import { Avatar } from "../ui/Avatar";
import { IconButton } from "../ui/IconButton";
import { CrownMark } from "./CrownMark";
import { LagartinhaMark } from "./LagartinhaMark";

interface MemberCardProps {
  member: Member;
  periodStanding: Standing | undefined;
  allTimeStanding: Standing | undefined;
  crowned: boolean;
  period: GoalPeriod;
  onEdit(member: Member): void;
}

export function MemberCard({ member, periodStanding, allTimeStanding, crowned, period, onEdit }: MemberCardProps) {
  const { search } = useLocation();

  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <Link
        to={{ pathname: `/familia/${member.id}`, search }}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-card hover:opacity-80"
      >
        <Avatar member={member} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5 font-semibold">
            <span className="truncate">{member.name}</span>
            <LagartinhaMark member={member} compact />
            {crowned && <CrownMark member={member} period={period} />}
          </p>
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink tabular-nums">{periodStanding?.points ?? 0}</span> {periodScopeLabel(period).toLowerCase()} · {allTimeStanding?.points ?? 0} no total
          </p>
          {member.claimedAt === null && <p className="text-xs text-ink-faint">Ainda não entrou</p>}
        </div>
      </Link>
      <IconButton label={`Editar ${member.name}`} icon={<Pencil className="size-4" />} onClick={() => onEdit(member)} />
    </li>
  );
}
