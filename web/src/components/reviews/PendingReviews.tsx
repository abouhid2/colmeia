import { formatPoints } from "../../domain/points";
import { completionsInSeason } from "../../domain/seasons";
import { useReviewCompletion, useCompletions } from "../../hooks/useCompletions";
import { useMemberLookup } from "../../hooks/useMembers";
import { useNow } from "../../hooks/useNow";
import { useSeason } from "../../hooks/useSeasonContext";
import { useSession } from "../../hooks/useSession";
import { useToast } from "../../hooks/useToast";
import { SectionHeading } from "../ui/SectionHeading";
import { ReviewCard } from "./ReviewCard";

interface PendingReviewsProps {
  /** A closed estação scores nothing more, so what is pending stays pending. */
  readOnly?: boolean;
}

export function PendingReviews({ readOnly = false }: PendingReviewsProps) {
  const now = useNow();
  const { pending: everything } = useCompletions();
  const { currentSeason } = useSeason();
  const lookup = useMemberLookup();
  const { currentMember } = useSession();
  const review = useReviewCompletion();
  const { notify } = useToast();

  // What is waiting for a note in the estação on screen, not in another one.
  const pending = completionsInSeason(everything, currentSeason?.id ?? null);
  if (pending.length === 0 || !currentMember) return null;

  const submit = (completionId: number, doerName: string, rating: number) => {
    review.mutate({ id: completionId, input: { reviewerId: currentMember.id, rating } }, {
      onSuccess: (reviewed) => notify({ tone: "success", message: `${formatPoints(reviewed.pointsAwarded)} para ${doerName}` }),
    });
  };

  return (
    <section>
      <SectionHeading
        title="Para avaliar"
        hint={readOnly ? "A estação encerrou, então essas ficaram sem nota." : "Os pontos só entram no favo depois da nota."}
      />
      <ul className="space-y-3">
        {pending.map((completion) => {
          const doer = lookup(completion.memberId);
          return (
            <ReviewCard
              key={completion.id}
              completion={completion}
              doer={doer}
              now={now}
              canReview={completion.memberId !== currentMember.id}
              submitting={review.isPending && review.variables?.id === completion.id}
              onReview={(rating) => submit(completion.id, doer?.name ?? "Alguém", rating)}
              readOnly={readOnly}
            />
          );
        })}
      </ul>
    </section>
  );
}
