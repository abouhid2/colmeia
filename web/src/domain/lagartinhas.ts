import type { Member } from "./types";

/** "Duda", "Duda e Caio", "Duda, Caio e Nina". */
export function joinNames(names: string[]): string {
  if (names.length < 2) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export function lagartinhaNames(members: Member[]): string[] {
  return members.filter((member) => member.kind === "lagartinha").map((member) => member.name);
}

/**
 * What the switch says while it is off and somebody in the colmeia is still a
 * lagartinha: nothing was taken from them, the app just stopped saying it.
 *
 * "continua na colmeia como lagartinha" instead of "continua cadastrada":
 * nobody tells the app whether a person is a girl or a boy, and a participle
 * would have to pick one.
 */
export function lagartinhasOffNote(members: Member[]): string | null {
  const names = lagartinhaNames(members);
  if (names.length === 0) return null;

  const who = joinNames(names);
  const stays = names.length === 1
    ? `${who} continua na colmeia como lagartinha`
    : `${who} continuam na colmeia como lagartinhas`;
  return `${stays}, só não aparece nada disso enquanto o ajuste estiver desligado. Os pontos de quem já é lagartinha continuam multiplicados.`;
}
