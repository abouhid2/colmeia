import { useId } from "react";
import { cn } from "../../lib/cn";
import { MemberPatternDefs, memberPatternId, type MarkedMember } from "./MemberPatternDefs";

/** No viewBox here, so one unit is one CSS pixel and the texture never scales. */
const BAR_UNIT = 6;

interface MemberPatternBarProps {
  member: MarkedMember;
  /** How much of the bar is filled, 0..1. */
  ratio: number;
  className?: string;
}

/** A progress bar filled with one person's texture, for a goal only they are
 *  working on. Goes inside whatever already rounds and clips the track. */
export function MemberPatternBar({ member, ratio, className }: MemberPatternBarProps) {
  const scope = useId();
  return (
    <svg className={cn("h-full transition-[width] duration-500", className)} style={{ width: `${ratio * 100}%` }} aria-hidden>
      <MemberPatternDefs scope={scope} members={[ member ]} unit={BAR_UNIT} />
      <rect width="100%" height="100%" fill={`url(#${memberPatternId(scope, member.id)})`} />
    </svg>
  );
}
