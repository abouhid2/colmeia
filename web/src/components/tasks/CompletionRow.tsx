import { Clock, RotateCcw, Star } from "lucide-react";
import { MAX_RATING } from "../../domain/points";
import type { Completion, Member } from "../../domain/types";
import { timeAgo } from "../../lib/dates";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { IconButton } from "../ui/IconButton";
import { PointsBadge } from "../ui/PointsBadge";

interface CompletionRowProps {
  completion: Completion;
  doer: Member | null;
  canReopen: boolean;
  onReopen(): void;
}

/** One row of history: what got done, by whom, and whether it still earned points. */
export function CompletionRow({ completion, doer, canReopen, onReopen }: CompletionRowProps) {
  const rating = completion.rating;

  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-surface/60 px-4 py-3">
      {doer ? <Avatar member={doer} size="sm" /> : <span className="size-8 shrink-0 rounded-full bg-dune-100" />}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-soft">{completion.taskTitle}</p>
        <p className="truncate text-xs text-ink-faint">
          {doer?.name ?? "Alguém"} · {timeAgo(completion.completedAt)}
        </p>
        {rating !== null && (
          <div className="mt-1 flex" aria-label={`Nota ${rating} de ${MAX_RATING}`}>
            {Array.from({ length: MAX_RATING }, (_, index) => index + 1).map((star) => (
              <Star key={star} className={cn("size-3", star <= rating ? "fill-honey-400 text-honey-500" : "text-line-strong")} />
            ))}
          </div>
        )}
      </div>
      {completion.status === "approved" ? (
        <PointsBadge points={completion.pointsAwarded} size="sm" muted />
      ) : (
        <Badge tone="bg-lake-100 text-lake-700" icon={<Clock className="size-3" />}>Aguardando avaliação</Badge>
      )}
      {canReopen && (
        <IconButton label={`Reabrir: ${completion.taskTitle}`} icon={<RotateCcw className="size-4" />} onClick={onReopen} />
      )}
    </li>
  );
}
