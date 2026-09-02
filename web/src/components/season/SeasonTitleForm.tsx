import { useState, type FormEvent } from "react";
import { LIMITS } from "../../domain/limits";
import type { SeasonTitle } from "../../domain/types";
import { useSeasonTitleMutations } from "../../hooks/useSeasonTitles";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

interface SeasonTitleFormProps {
  /** null writes a new título; a título edits that one. */
  title: SeasonTitle | null;
  onDone(): void;
}

export function SeasonTitleForm({ title, onDone }: SeasonTitleFormProps) {
  const [ emoji, setEmoji ] = useState(title?.emoji ?? "");
  const [ name, setName ] = useState(title?.name ?? "");
  const [ description, setDescription ] = useState(title?.description ?? "");
  const { create, update } = useSeasonTitleMutations();
  const { notify } = useToast();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = { name, emoji, description };
    const onSuccess = () => { notify({ tone: "success", message: title ? "Título salvo" : `${name.trim()} entrou na lista` }); onDone(); };
    if (title) update.mutate({ id: title.id, input }, { onSuccess });
    else create.mutate(input, { onSuccess });
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-card border border-line bg-dune-100 p-3">
      <div className="flex gap-3">
        <Field label="Emoji" htmlFor="title-emoji">
          <Input
            id="title-emoji" value={emoji} onChange={(event) => setEmoji(event.target.value)}
            placeholder="🐜" maxLength={LIMITS.titleEmoji} required className="w-20 text-center" autoFocus={title === null}
          />
        </Field>
        <div className="min-w-0 flex-1">
          <Field label="Nome" htmlFor="title-name">
            <Input
              id="title-name" value={name} onChange={(event) => setName(event.target.value)}
              placeholder="Formiga" maxLength={LIMITS.titleName} required
            />
          </Field>
        </div>
      </div>
      <Field label="Do que se trata" htmlFor="title-description">
        <Input
          id="title-description" value={description} onChange={(event) => setDescription(event.target.value)}
          placeholder="Carrega o dobro do próprio peso." maxLength={LIMITS.titleDescription}
        />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onDone}>Cancelar</Button>
        <Button type="submit" size="sm" disabled={name.trim() === "" || emoji.trim() === ""} loading={create.isPending || update.isPending}>
          {title ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
