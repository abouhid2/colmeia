import type { MemberPattern } from "./types";

interface MemberPatternMeta {
  label: string;
}

/** The textures somebody can fill their share of the honeycomb with. The Rails
 *  model holds the same list; changing one means changing the other. */
export const MEMBER_PATTERNS: Record<MemberPattern, MemberPatternMeta> = {
  solid: { label: "Lisa" },
  dots: { label: "Bolinhas" },
  stripes: { label: "Listras" },
  crosses: { label: "Cruzinhas" },
  checks: { label: "Xadrez" },
  waves: { label: "Ondas" },
  rings: { label: "Argolas" },
};

export const MEMBER_PATTERN_OPTIONS = Object.keys(MEMBER_PATTERNS) as MemberPattern[];

export const DEFAULT_MEMBER_PATTERN: MemberPattern = "solid";

export function isMemberPattern(value: string): value is MemberPattern {
  return value in MEMBER_PATTERNS;
}
