import { crownedTitle } from "../../domain/crownTitles";
import type { GoalPeriod, Member } from "../../domain/types";
import { BeeAvatar } from "./BeeAvatar";

interface CrownMarkProps {
  member: Pick<Member, "name" | "color" | "crownTitle">;
  period: GoalPeriod;
}

/** The little crowned bee that follows the winner around the app. */
export function CrownMark({ member, period }: CrownMarkProps) {
  const title = crownedTitle(member.crownTitle, period);
  return (
    <span title={title} className="inline-flex align-middle">
      <BeeAvatar member={member} size="sm" crowned label={title} />
    </span>
  );
}
