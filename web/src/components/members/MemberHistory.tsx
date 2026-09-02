import { Hourglass, Star } from "lucide-react";
import { MAX_RATING } from "../../domain/points";
import type { Completion, Member } from "../../domain/types";
import { timeAgo } from "../../lib/dates";
import { cn } from "../../lib/cn";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface MemberHistoryProps {
  completions: Completion[];
  lookup(id: number | null): Member | null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center" aria-label={`Nota ${rating} de ${MAX_RATING}`}>
      {Array.from({ length: MAX_RATING }, (_, index) => index + 1).map((star) => (
        <Star
          key={star}
          aria-hidden
          className={cn("size-3.5", star <= rating ? "fill-honey-400 text-honey-500" : "text-line-strong")}
        />
      ))}
    </span>
  );
}

export function MemberHistory({ completions, lookup }: MemberHistoryProps) {
  return (
    <Card>
      <ol className="divide-y divide-line">
        {completions.map((completion) => {
          const reviewer = lookup(completion.reviewerId);
          return (
            <li key={completion.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
              <p className="min-w-0 flex-1 truncate font-semibold">{completion.taskTitle}</p>
              {completion.status === "pending" ? (
                <Badge icon={<Hourglass className="size-3" />}>Aguardando avaliação</Badge>
              ) : (
                <span className="font-display text-sm font-bold tabular-nums text-honey-700">+{completion.pointsAwarded}</span>
              )}
              <p className="flex w-full items-center gap-2 text-xs text-ink-faint">
                <span>{timeAgo(completion.completedAt)}</span>
                {completion.rating !== null && (
                  <>
                    <Stars rating={completion.rating} />
                    {reviewer && <span>por {reviewer.name}</span>}
                  </>
                )}
              </p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
