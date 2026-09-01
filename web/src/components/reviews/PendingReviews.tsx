import { formatPoints } from "../../domain/points";
import { useReviewCompletion, useCompletions } from "../../hooks/useCompletions";
import { useMemberLookup } from "../../hooks/useMembers";
import { useSession } from "../../hooks/useSession";
import { useToast } from "../../hooks/useToast";
import { SectionHeading } from "../ui/SectionHeading";
import { ReviewCard } from "./ReviewCard";

export function PendingReviews() {
  const { pending } = useCompletions();
  const lookup = useMemberLookup();
  const { currentMember } = useSession();
  const review = useReviewCompletion();
  const { notify } = useToast();

  if (pending.length === 0 || !currentMember) return null;

  const submit = (completionId: number, doerName: string, rating: number) => {
    review.mutate({ id: completionId, input: { reviewerId: currentMember.id, rating } }, {
      onSuccess: (reviewed) => notify({ tone: "success", message: `${formatPoints(reviewed.pointsAwarded)} para ${doerName}` }),
    });
  };

  return (
    <section>
      <SectionHeading title="Para avaliar" hint="Os pontos só entram na colmeia depois da nota." />
      <ul className="space-y-3">
        {pending.map((completion) => {
          const doer = lookup(completion.memberId);
          return (
            <ReviewCard
              key={completion.id}
              completion={completion}
              doer={doer}
              canReview={completion.memberId !== currentMember.id}
              submitting={review.isPending && review.variables?.id === completion.id}
              onReview={(rating) => submit(completion.id, doer?.name ?? "Alguém", rating)}
            />
          );
        })}
      </ul>
    </section>
  );
}
