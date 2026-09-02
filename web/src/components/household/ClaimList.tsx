import type { Member } from "../../domain/types";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface ClaimListProps {
  members: Member[];
  /** Who this browser already is here, if it has been in before. */
  knownMemberId: number | undefined;
  pendingId: number | null;
  onClaim(memberId: number): void;
  onResume(memberId: number): void;
}

export function ClaimList({ members, knownMemberId, pendingId, onClaim, onResume }: ClaimListProps) {
  return (
    <Card>
      <ul className="divide-y divide-line">
        {members.map((member) => {
          const isKnown = member.id === knownMemberId;
          const joined = member.claimedAt !== null;
          return (
            <li key={member.id} className={cn("flex items-center gap-3 p-4", joined && !isKnown && "opacity-55")}>
              <Avatar member={member} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{member.name}</p>
                {isKnown && <p className="text-sm text-ink-soft">Você, neste navegador</p>}
              </div>
              <ClaimAction
                member={member}
                isKnown={isKnown}
                isPending={pendingId === member.id}
                onClaim={onClaim}
                onResume={onResume}
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function ClaimAction({ member, isKnown, isPending, onClaim, onResume }: {
  member: Member;
  isKnown: boolean;
  isPending: boolean;
  onClaim(memberId: number): void;
  onResume(memberId: number): void;
}) {
  if (isKnown) {
    return <Button size="sm" loading={isPending} onClick={() => onResume(member.id)}>Continuar</Button>;
  }
  if (member.claimedAt !== null) {
    return <span className="text-sm font-medium text-ink-faint">já entrou</span>;
  }
  return <Button variant="secondary" size="sm" loading={isPending} onClick={() => onClaim(member.id)}>Sou essa pessoa</Button>;
}
