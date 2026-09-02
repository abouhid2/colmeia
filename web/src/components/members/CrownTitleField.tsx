import { CROWN_TITLE_SUGGESTIONS } from "../../domain/crownTitles";
import { LIMITS } from "../../domain/limits";
import { cn } from "../../lib/cn";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

interface CrownTitleFieldProps {
  id: string;
  value: string;
  onChange(value: string): void;
}

export function CrownTitleField({ id, value, onChange }: CrownTitleFieldProps) {
  const chosen = value.trim();

  return (
    <Field label="Quando vencer, vira" htmlFor={id} hint="Escolha o título que quiser. Deixe em branco para nunca receber a coroa.">
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Abelha Rainha, Abelhão, Rei da Louça…"
        maxLength={LIMITS.crownTitle}
      />
      <div className="flex flex-wrap gap-1.5 pt-1">
        {CROWN_TITLE_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onChange(suggestion)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              chosen === suggestion
                ? "border-honey-500 bg-honey-200 text-honey-900"
                : "border-line bg-surface text-ink-soft hover:bg-dune-100 hover:text-ink",
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </Field>
  );
}
