import { lagartinhaStandings, type Standing } from "../../domain/leaderboard";
import { useLagartinhasEnabled } from "../../hooks/useLagartinhas";
import { SectionHeading } from "../ui/SectionHeading";
import { Leaderboard } from "./Leaderboard";

interface LagartinhaLeagueProps {
  standings: Standing[];
}

/** The kids' own table, so a lagartinha can also come first somewhere. Absent
 *  from colmeias with no children. */
export function LagartinhaLeague({ standings }: LagartinhaLeagueProps) {
  const enabled = useLagartinhasEnabled();
  const league = lagartinhaStandings(standings);
  if (!enabled || league.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Lagartinhas" />
      <Leaderboard standings={league} />
    </section>
  );
}
