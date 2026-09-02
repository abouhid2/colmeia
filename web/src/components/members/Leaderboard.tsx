import { Link, useLocation } from "react-router";
import { MEMBER_COLORS } from "../../domain/memberColors";
import type { Standing } from "../../domain/leaderboard";
import type { GoalPeriod } from "../../domain/types";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import { CrownMark } from "./CrownMark";

interface LeaderboardProps {
  standings: Standing[];
  crownedMemberId?: number | null;
  period?: GoalPeriod;
}

export function Leaderboard({ standings, crownedMemberId = null, period = "week" }: LeaderboardProps) {
  const top = standings[0]?.points ?? 0;
  const { search } = useLocation();

  return (
    <Card>
      <ol className="divide-y divide-line">
        {standings.map((standing, index) => (
          <li key={standing.member.id}>
            <Link to={{ pathname: `/familia/${standing.member.id}`, search }} className="flex items-center gap-3 px-4 py-3 hover:bg-dune-100">
              <span className="w-5 text-center font-display text-sm font-bold text-ink-faint">{index + 1}</span>
              <Avatar member={standing.member} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="flex items-center gap-1.5 truncate font-semibold">
                    {standing.member.name}
                    {standing.member.id === crownedMemberId && <CrownMark member={standing.member} period={period} />}
                  </p>
                  <p className="text-sm tabular-nums text-ink-soft">
                    <span className="font-display text-base font-bold text-ink">{standing.points}</span> pts · {standing.tasksCount} {standing.tasksCount === 1 ? "tarefa" : "tarefas"}
                  </p>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-dune-100">
                  <div className={MEMBER_COLORS[standing.member.color].bar + " h-full rounded-full transition-[width] duration-500"} style={{ width: top === 0 ? "0%" : `${(standing.points / top) * 100}%` }} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
