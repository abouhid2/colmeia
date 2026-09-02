import { crownedTitle } from "../../domain/crownTitles";
import type { Member } from "../../domain/types";
import { BeeAvatar } from "./BeeAvatar";

/** The little crowned bee that follows the winner around the app. */
export function CrownMark({ member }: { member: Pick<Member, "name" | "color" | "crownTitle"> }) {
  const title = crownedTitle(member.crownTitle);
  return (
    <span title={title} className="inline-flex align-middle">
      <BeeAvatar member={member} size="sm" crowned label={title} />
    </span>
  );
}
