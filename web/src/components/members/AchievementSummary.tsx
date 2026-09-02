import type { Member } from "../../domain/types";
import { Card } from "../ui/Card";
import { BeeAvatar } from "./BeeAvatar";

interface AchievementSummaryProps {
  member: Member;
  unlocked: number;
  total: number;
}

/** How far one person is through the whole shelf of badges. */
export function AchievementSummary({ member, unlocked, total }: AchievementSummaryProps) {
  const percent = total === 0 ? 0 : (unlocked / total) * 100;

  return (
    <Card className="flex items-center gap-4 p-5">
      <BeeAvatar member={member} size="hero" className="size-16" />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-xl font-bold tracking-tight">{member.name}</h2>
        <p className="mt-0.5 text-sm text-ink-soft">
          <span className="font-display font-bold text-ink tabular-nums">{unlocked}</span> de {total} conquistas
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dune-100">
          <div className="h-full rounded-full bg-honey-400 transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </Card>
  );
}
