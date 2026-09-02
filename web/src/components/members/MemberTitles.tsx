import type { MemberTitleAward } from "../../domain/memberTitles";

/** What the colmeia called this person, estação by estação. */
export function MemberTitles({ awards }: { awards: MemberTitleAward[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {awards.map((award, index) => (
        <li key={`${award.season.id}-${award.label}-${index}`} className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-card">
          <span aria-hidden className="text-xl leading-none">{award.emoji}</span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{award.label}</p>
            <p className="truncate text-sm text-ink-soft">{award.season.name}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
