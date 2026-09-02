import { useState } from "react";
import { DEFAULT_CROWN_TITLE } from "../../domain/crownTitles";
import { formatMultiplier, MAX_MULTIPLIER, MIN_MULTIPLIER, multiplierForKind } from "../../domain/memberKinds";
import type { Member, MemberColor, MemberInput, MemberKind } from "../../domain/types";

const RANGE_MESSAGE = `O multiplicador vai de ${formatMultiplier(MIN_MULTIPLIER)} a ${formatMultiplier(MAX_MULTIPLIER)}`;

/** People type "1,5" here, not "1.5". */
function parseMultiplier(raw: string): number {
  return Number(raw.replace(",", "."));
}

function multiplierError(raw: string): string | undefined {
  const value = parseMultiplier(raw);
  return Number.isFinite(value) && value >= MIN_MULTIPLIER && value <= MAX_MULTIPLIER ? undefined : RANGE_MESSAGE;
}

export function useMemberForm(member: Member | null) {
  const [ name, setName ] = useState(member?.name ?? "");
  const [ avatar, setAvatar ] = useState(member?.avatar ?? "🐝");
  const [ color, setColor ] = useState<MemberColor>(member?.color ?? "honey");
  const [ kind, setKindValue ] = useState<MemberKind>(member?.kind ?? "bee");
  const [ multiplier, setMultiplier ] = useState(String(member?.pointsMultiplier ?? 1));
  const [ crownTitle, setCrownTitle ] = useState(member?.crownTitle ?? DEFAULT_CROWN_TITLE);

  // Turning someone into a lagartinha offers the default handicap; turning the
  // switch back leaves it, because an adult may want one too.
  const setKind = (next: MemberKind) => {
    setKindValue(next);
    setMultiplier((current) => String(multiplierForKind(next, parseMultiplier(current) || 1)));
  };

  const error = multiplierError(multiplier);
  const toInput = (): MemberInput => ({ name, avatar, color, kind, pointsMultiplier: parseMultiplier(multiplier), crownTitle });

  return {
    values: { name, avatar, color, kind, multiplier, crownTitle },
    setName, setAvatar, setColor, setKind, setMultiplier, setCrownTitle,
    multiplierError: error,
    isValid: name.trim() !== "" && error === undefined,
    toInput,
  };
}
