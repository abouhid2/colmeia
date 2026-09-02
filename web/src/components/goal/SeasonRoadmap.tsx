import type { GoalWithProgress } from "../../domain/goalBoard";
import type { GoalStatus } from "../../domain/progress";
import { roadmapBar, roadmapMarker, roadmapSpan, type RoadmapSpan } from "../../domain/roadmap";
import type { Goal } from "../../domain/types";
import { cn } from "../../lib/cn";
import { dayPhrase } from "../../lib/dates";
import { AvatarStack } from "../ui/AvatarStack";
import { GOAL_STATUS_LABEL, goalWindowPhrase, participantsLabel } from "./goalCopy";

const STATUS_BAR: Record<GoalStatus, string> = {
  upcoming: "bg-dune-500",
  active: "bg-honey-500",
  reached: "bg-leaf-500",
  missed: "bg-berry-500",
};

interface SeasonRoadmapProps {
  goals: GoalWithProgress[];
  now: Date;
  /** Clicking a bar opens that meta. Leave it out for a roteiro just to read. */
  onSelect?(goal: Goal): void;
}

/**
 * The estação drawn from end to end, one lane per meta, with today marked. It
 * scrolls sideways inside itself, so a narrow phone never pushes the page along.
 */
export function SeasonRoadmap({ goals, now, onSelect }: SeasonRoadmapProps) {
  const [ first ] = goals;
  if (first === undefined) return null;

  const span = roadmapSpan(first.season, now);
  const marker = roadmapMarker(now, span);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-lg">
        <div className="relative mb-2 h-5 text-xs font-semibold text-ink-soft">
          <span className="absolute left-0 top-0">{dayPhrase(span.start)}</span>
          {marker !== null && (
            <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-honey-200 px-2 text-honey-900" style={{ left: `${marker}%` }}>
              hoje
            </span>
          )}
          <span className="absolute right-0 top-0">{span.openEnded ? "sem data de fim" : dayPhrase(span.end)}</span>
        </div>
        <div className="relative">
          <ol>
            {goals.map((item) => (
              <RoadmapLane key={item.goal.id} item={item} span={span} onSelect={onSelect} />
            ))}
          </ol>
          {marker !== null && (
            <span aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-honey-400" style={{ left: `${marker}%` }} />
          )}
        </div>
      </div>
    </div>
  );
}

interface RoadmapLaneProps {
  item: GoalWithProgress;
  span: RoadmapSpan;
  onSelect?(goal: Goal): void;
}

function RoadmapLane({ item, span, onSelect }: RoadmapLaneProps) {
  const { goal, progress, season, members } = item;
  const bar = roadmapBar(progress.window, span);
  const when = goalWindowPhrase(goal, season);
  const status = GOAL_STATUS_LABEL[progress.status];
  const points = `${progress.earned} de ${progress.target}`;

  const body = (
    <>
      <span className="flex items-center gap-2">
        {members.length > 0 && <AvatarStack members={members} max={2} />}
        <span className="min-w-0 flex-1 truncate font-semibold">{goal.title}</span>
        <span className="shrink-0 text-sm tabular-nums text-ink-soft">{points}</span>
      </span>
      <span className="mt-1.5 block h-2.5 rounded-full bg-dune-100">
        <span className={cn("block h-full rounded-full", STATUS_BAR[progress.status])} style={{ marginLeft: `${bar.left}%`, width: `${bar.width}%` }} />
      </span>
    </>
  );

  return (
    <li className="py-1.5">
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(goal)}
          aria-label={`${goal.title}, ${participantsLabel(members)}, ${when}, ${points} pontos, ${status}`}
          className="block w-full rounded-xl text-left transition-colors hover:bg-dune-100"
        >
          {body}
        </button>
      ) : (
        <div>
          {body}
          <span className="sr-only">{participantsLabel(members)}, {when}, {status}</span>
        </div>
      )}
    </li>
  );
}
