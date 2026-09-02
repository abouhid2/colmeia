import type { Member } from "../../domain/types";
import { formatLongDate } from "../../lib/dates";
import { CrownMark } from "../members/CrownMark";

interface GreetingProps {
  member: Member | null;
  now: Date;
  crowned: boolean;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function Greeting({ member, now, crowned }: GreetingProps) {
  return (
    <div>
      <p className="text-sm text-ink-soft">{capitalize(formatLongDate(now))}</p>
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight md:text-4xl">
        {member ? `Oi, ${member.name}` : "Oi"}
        {member && crowned && <CrownMark member={member} />}
      </h1>
    </div>
  );
}
