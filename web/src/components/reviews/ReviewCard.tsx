import { useState } from "react";
import { awardedPoints } from "../../domain/points";
import type { Completion, Member } from "../../domain/types";
import { completedLabel } from "../../lib/dates";
import { LagartinhaMark } from "../members/LagartinhaMark";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { StarRating } from "../ui/StarRating";

interface ReviewCardProps {
  completion: Completion;
  doer: Member | null;
  now: Date;
  canReview: boolean;
  submitting: boolean;
  onReview(rating: number): void;
  /** A closed estação takes no more notas, so the stars go with it. */
  readOnly?: boolean;
}

export function ReviewCard({ completion, doer, now, canReview, submitting, onReview, readOnly = false }: ReviewCardProps) {
  const [rating, setRating] = useState<number | null>(null);
  // The multiplier the work was done under is the one that will be paid.
  const preview = rating === null ? null : awardedPoints(completion.taskPoints, rating, completion.multiplier);

  return (
    <li className="rounded-card border border-lake-500/30 bg-lake-100/40 p-4">
      <div className="flex items-center gap-3">
        {doer ? <Avatar member={doer} size="sm" /> : <span className="size-8 rounded-full bg-dune-100" />}
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-semibold">{doer?.name ?? "Alguém"}</span>
          {doer && <LagartinhaMark member={doer} compact className="ml-1 align-middle" />} concluiu <span className="font-semibold">{completion.taskTitle}</span>
          <span className="text-ink-soft"> · {completedLabel(completion.completedAt, now)} · vale {completion.taskPoints} pontos</span>
        </p>
      </div>
      {!readOnly && (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <StarRating value={rating} onChange={setRating} disabled={!canReview} />
            <div className="flex items-center gap-3">
              {preview !== null && <span className="text-sm tabular-nums text-ink-soft">= {preview} pontos</span>}
              <Button size="sm" disabled={!canReview || rating === null} loading={submitting} onClick={() => rating !== null && onReview(rating)}>Confirmar nota</Button>
            </div>
          </div>
          {!canReview && <p className="mt-2 text-xs text-ink-soft">Ninguém avalia o próprio trabalho. Troque de pessoa lá em cima para dar a nota.</p>}
        </>
      )}
    </li>
  );
}
