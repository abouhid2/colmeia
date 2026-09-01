import { useState, type FormEvent } from "react";
import { LIMITS } from "../../domain/limits";
import { useHousehold, useRenameHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function HouseholdNameForm() {
  const { data: household } = useHousehold();
  const rename = useRenameHousehold();
  const { notify } = useToast();
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? household?.name ?? "";
  const dirty = household !== undefined && name.trim() !== household.name;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    rename.mutate({ name }, {
      onSuccess: () => { setDraft(null); notify({ tone: "success", message: "Nome da casa salvo" }); },
    });
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input aria-label="Nome da casa" maxLength={LIMITS.householdName} value={name} onChange={(event) => setDraft(event.target.value)} className="max-w-xs" />
      <Button type="submit" variant="secondary" disabled={!dirty} loading={rename.isPending}>Salvar</Button>
    </form>
  );
}
