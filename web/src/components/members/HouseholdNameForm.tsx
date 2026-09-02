import { useState, type FormEvent } from "react";
import { LIMITS } from "../../domain/limits";
import { useHousehold, useUpdateHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function HouseholdNameForm() {
  const { data: household } = useHousehold();
  const rename = useUpdateHousehold();
  const { notify } = useToast();
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? household?.name ?? "";
  const trimmed = name.trim();
  const dirty = household !== undefined && trimmed !== "" && trimmed !== household.name;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!dirty) return;
    rename.mutate({ name: trimmed }, {
      onSuccess: () => { setDraft(null); notify({ tone: "success", message: "Nome da colmeia salvo" }); },
    });
  };

  return (
    <form onSubmit={submit}>
      <Field label="Nome da colmeia" htmlFor="household-name">
        <div className="flex gap-2">
          <Input id="household-name" maxLength={LIMITS.householdName} value={name} onChange={(event) => setDraft(event.target.value)} className="max-w-xs" />
          <Button type="submit" variant="secondary" disabled={!dirty} loading={rename.isPending}>Salvar</Button>
        </div>
      </Field>
    </form>
  );
}
