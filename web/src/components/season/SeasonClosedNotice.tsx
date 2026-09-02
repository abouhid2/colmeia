import { Archive } from "lucide-react";

/** A closed estação is a finished championship: it can be read, not played. */
export function SeasonClosedNotice({ name }: { name: string }) {
  return (
    <p className="flex items-start gap-2.5 rounded-card border border-line bg-dune-100 px-4 py-3 text-sm text-ink-soft">
      <Archive className="mt-0.5 size-4 shrink-0 text-dune-700" aria-hidden />
      <span>
        <span className="font-semibold text-ink">Estação encerrada.</span> {name} virou história: o ranking está
        congelado. Troque de estação para continuar.
      </span>
    </p>
  );
}
