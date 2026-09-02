import { crownedTitle, WORKER_BEE_LABEL } from "../../domain/crownTitles";
import type { GoalPeriod, Member } from "../../domain/types";
import { periodScopeLabel } from "../goal/goalCopy";
import { Card } from "../ui/Card";
import { BeeAvatar } from "./BeeAvatar";

interface MemberHeroProps {
  member: Member;
  crowned: boolean;
  period: GoalPeriod;
  periodPoints: number;
  allTimePoints: number;
  rank: number | null;
  houseSize: number;
}

export function MemberHero({ member, crowned, period, periodPoints, allTimePoints, rank, houseSize }: MemberHeroProps) {
  const title = crowned ? crownedTitle(member.crownTitle, period) : WORKER_BEE_LABEL;

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:gap-6 sm:text-left">
      <BeeAvatar member={member} size="hero" crowned={crowned} label={`${member.name}, ${title}`} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-honey-700">{title}</p>
        <h1 className="mt-0.5 text-3xl font-bold tracking-tight">{member.name}</h1>
        <p className="mt-3 text-sm text-ink-soft">
          <span className="font-display font-bold text-ink tabular-nums">{periodPoints}</span> pontos {periodScopeLabel(period).toLowerCase()}
          <span className="px-1.5 text-ink-faint">·</span>
          <span className="font-display font-bold text-ink tabular-nums">{allTimePoints}</span> no total
          {rank !== null && (
            <>
              <span className="px-1.5 text-ink-faint">·</span>
              <span className="font-semibold text-ink">{rank}º de {houseSize}</span>
            </>
          )}
        </p>
      </div>
    </Card>
  );
}
