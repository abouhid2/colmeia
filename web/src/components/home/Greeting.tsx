import type { Member } from "../../domain/types";
import { formatLongDate } from "../../lib/dates";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function Greeting({ member, now }: { member: Member | null; now: Date }) {
  return (
    <div>
      <p className="text-sm text-ink-soft">{capitalize(formatLongDate(now))}</p>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{member ? `Oi, ${member.name}` : "Oi"}</h1>
    </div>
  );
}
