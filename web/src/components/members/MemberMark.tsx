import { useId } from "react";
import { cn } from "../../lib/cn";
import { MemberPatternDefs, memberPatternId, type MarkedMember } from "./MemberPatternDefs";

/** Big enough for two repeats of a texture, small enough to sit beside a name. */
const SPAN = 12;
const UNIT = 5;

function hexagon(span: number): string {
  const radius = span / 2;
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30);
    return `${(radius + radius * Math.cos(angle)).toFixed(2)},${(radius + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

interface MemberMarkProps {
  member: MarkedMember;
  className?: string;
}

/** One cell of the comb in somebody's colour and texture: the legend for their
 *  share of the honeycomb, next to their name. */
export function MemberMark({ member, className }: MemberMarkProps) {
  const scope = useId();
  return (
    <svg viewBox={`0 0 ${SPAN} ${SPAN}`} className={cn("size-5 shrink-0", className)} aria-hidden>
      <MemberPatternDefs scope={scope} members={[ member ]} unit={UNIT} />
      <path d={hexagon(SPAN)} fill={`url(#${memberPatternId(scope, member.id)})`} className="stroke-line-strong" strokeWidth={0.5} />
    </svg>
  );
}
