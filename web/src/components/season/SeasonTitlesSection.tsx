import { Settings2 } from "lucide-react";
import type { SeasonCrown } from "../../domain/crown";
import type { Member } from "../../domain/types";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useMembers } from "../../hooks/useMembers";
import type { SeasonVoting } from "../../hooks/useSeasonVoting";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";
import { CrownTitleCard } from "./CrownTitleCard";
import { SeasonTitlesDialog } from "./SeasonTitlesDialog";
import { VoteTitleCard } from "./VoteTitleCard";

interface SeasonTitlesSectionProps {
  voting: SeasonVoting;
  crown: SeasonCrown;
  /** Voting opens once the estação is encerrada. */
  closed: boolean;
  /** Whoever is using the app: the one person this browser votes as. */
  me: Member | null;
}

export function SeasonTitlesSection({ voting, crown, closed, me }: SeasonTitlesSectionProps) {
  const { members } = useMembers();
  const manager = useDisclosure();

  return (
    <section>
      <SectionHeading
        title="Títulos"
        hint={closed ? "Hora de votar" : undefined}
        action={
          <Button variant="secondary" size="sm" icon={<Settings2 className="size-4" />} onClick={manager.open}>
            Gerenciar
          </Button>
        }
      />
      <ul className="space-y-3">
        {voting.crown !== null && (
          <CrownTitleCard title={voting.crown} winner={crown.winner} goalReached={crown.goalReached} closed={closed} me={me} />
        )}
        {voting.results.map((result) => (
          <VoteTitleCard
            key={result.title.id}
            result={result}
            members={members}
            open={closed}
            voterId={me?.id ?? null}
            myVoteeId={voting.myVotes[result.title.id] ?? null}
            onVote={(voteeId) => voting.vote(result.title.id, voteeId)}
            onClear={() => voting.clear(result.title.id)}
            isPending={voting.isPending}
          />
        ))}
      </ul>

      <SeasonTitlesDialog open={manager.isOpen} onClose={manager.close} />
    </section>
  );
}
