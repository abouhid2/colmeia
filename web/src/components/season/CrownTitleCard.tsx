import type { Crown } from "../../domain/crown";
import type { Member, SeasonTitle } from "../../domain/types";
import { OwnCrownTitleField } from "./OwnCrownTitleField";
import { crownTitleLine } from "./titleCopy";

interface CrownTitleCardProps {
  title: SeasonTitle;
  /** Who won this estação, when it is closed and somebody did. */
  winner: Crown | null;
  goalReached: boolean | null;
  closed: boolean;
  /** Whoever is using the app, who renames their own crown here. */
  me: Member | null;
}

/** The one título nobody votes on: the ranking hands it out, and each person
 *  says what they want to be called when it lands on them. */
export function CrownTitleCard({ title, winner, goalReached, closed, me }: CrownTitleCardProps) {
  return (
    <li className="rounded-card border border-honey-500 bg-honey-100 p-4">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl leading-none">{title.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{title.name}</h3>
          {title.description !== "" && <p className="text-sm text-ink-soft">{title.description}</p>}
          <p className="mt-1 text-sm font-semibold text-honey-700">{crownTitleLine(closed, winner, goalReached)}</p>
          {me !== null && <OwnCrownTitleField member={me} />}
        </div>
      </div>
    </li>
  );
}
