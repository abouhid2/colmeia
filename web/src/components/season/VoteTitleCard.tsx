import type { TitleResult } from "../../domain/titleResults";
import type { Member } from "../../domain/types";
import { Avatar } from "../ui/Avatar";
import { FilterChip } from "../ui/FilterChip";
import { titleResultLine } from "./titleCopy";

interface VoteTitleCardProps {
  result: TitleResult;
  members: Member[];
  /** Voting only opens once the estação is encerrada. */
  open: boolean;
  /** Who this browser votes as, or null when nobody in it can. */
  voterId: number | null;
  /** Who this person voted for, or null while they have not. */
  myVoteeId: number | null;
  onVote(voteeId: number): void;
  onClear(): void;
  isPending: boolean;
}

/** One voted título: who the family picked, and the way to change your mind. */
export function VoteTitleCard({ result, members, open, voterId, myVoteeId, onVote, onClear, isPending }: VoteTitleCardProps) {
  const { title } = result;
  const votesFor = (memberId: number) => result.tallies.find((tally) => tally.member.id === memberId)?.votes ?? 0;

  return (
    <li className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl leading-none">{title.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{title.name}</h3>
          {title.description !== "" && <p className="text-sm text-ink-soft">{title.description}</p>}
        </div>
      </div>

      {open && (
        <>
          <div role="radiogroup" aria-label={`Quem foi ${title.name} nesta estação`} className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            {members.map((member) => {
              const mine = member.id === myVoteeId;
              const votes = votesFor(member.id);
              return (
                <FilterChip
                  key={member.id}
                  role="radio"
                  aria-checked={mine}
                  selected={mine}
                  disabled={voterId === null || isPending}
                  onClick={() => (mine ? onClear() : onVote(member.id))}
                  className="pl-1.5"
                >
                  <Avatar member={member} size="xs" /> {member.name}
                  {votes > 0 && <span className="font-display font-bold tabular-nums">{votes}</span>}
                </FilterChip>
              );
            })}
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{titleResultLine(result)}</p>
        </>
      )}
    </li>
  );
}
