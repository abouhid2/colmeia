import type { MemberKind } from "./types";

interface MemberKindMeta {
  label: string;
  hint: string;
}

export const MEMBER_KINDS: Record<MemberKind, MemberKindMeta> = {
  bee: { label: "Abelha", hint: "Ganha exatamente o que a tarefa vale." },
  lagartinha: { label: "Lagartinha", hint: "Criança: ganha os pontos multiplicados para acompanhar o resto da colmeia." },
};

export const MEMBER_KIND_OPTIONS = Object.keys(MEMBER_KINDS) as MemberKind[];

/** What a lagartinha earns until the family says otherwise. */
export const DEFAULT_LAGARTINHA_MULTIPLIER = 1.5;
export const MIN_MULTIPLIER = 0.5;
export const MAX_MULTIPLIER = 3;

export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}×`;
}

/** Becoming a lagartinha suggests the handicap once; going back to bee keeps
 *  whatever the family set, because an adult may want one too. */
export function multiplierForKind(kind: MemberKind, current: number): number {
  return kind === "lagartinha" && current === 1 ? DEFAULT_LAGARTINHA_MULTIPLIER : current;
}

/** The sentence the app says out loud, because a hidden handicap is not trusted. */
export function multiplierHint(name: string, kind: MemberKind, multiplier: number): string {
  const who = name.trim() === "" ? "Essa pessoa" : name.trim();
  return kind === "lagartinha"
    ? `${who} ganha ${formatMultiplier(multiplier)} por ser lagartinha.`
    : `${who} ganha ${formatMultiplier(multiplier)} em cada tarefa.`;
}
