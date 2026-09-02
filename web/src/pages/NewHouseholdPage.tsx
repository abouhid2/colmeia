import { ArrowLeft, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useCreateHousehold } from "../hooks/useHouseholds";
import { BrandMark } from "../components/layout/BrandMark";
import { PlainPage } from "../components/layout/PlainPage";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";

/** Name the colmeia and list who lives there. Everyone claims themselves later. */
export function NewHouseholdPage() {
  const navigate = useNavigate();
  const create = useCreateHousehold();
  const [ name, setName ] = useState("");
  const [ people, setPeople ] = useState<string[]>([]);
  const [ draft, setDraft ] = useState("");

  const addPerson = (event: FormEvent) => {
    event.preventDefault();
    const person = draft.trim();
    if (person === "") return;
    setPeople((current) => [ ...current, person ]);
    setDraft("");
  };

  const removePerson = (position: number) => {
    setPeople((current) => current.filter((_, index) => index !== position));
  };

  const start = () => {
    create.mutate({ name, memberNames: people }, {
      onSuccess: (household) => void navigate(`/entrar/${household.inviteCode}`, { replace: true }),
    });
  };

  return (
    <PlainPage>
      <div className="text-center">
        <BrandMark className="justify-center" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Uma colmeia nova</h1>
        <p className="mt-2 text-ink-soft">Escreva quem mora aí. Depois é só mandar o link: cada um entra e diz quem é.</p>
      </div>

      <Card className="space-y-5 p-6">
        <Field label="Nome da colmeia" htmlFor="household-name">
          <Input id="household-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Família Silva, Apê 42" autoFocus />
        </Field>

        {people.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Pessoas da colmeia">
            {people.map((person, index) => (
              <li key={`${person}-${index}`} className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-3 pr-1.5 text-sm font-medium">
                {person}
                <button
                  type="button"
                  aria-label={`Remover ${person}`}
                  onClick={() => removePerson(index)}
                  className="grid size-5 place-items-center rounded-full text-ink-faint hover:bg-dune-100 hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addPerson} className="flex gap-2">
          <Input aria-label="Nome da pessoa" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nome" />
          <Button type="submit" variant="secondary" icon={<Plus className="size-4" />} disabled={draft.trim() === ""}>Adicionar</Button>
        </form>

        <Button size="lg" className="w-full" disabled={name.trim() === ""} loading={create.isPending} onClick={start}>
          Criar colmeia
        </Button>
      </Card>

      <Button variant="ghost" size="sm" className="self-center" icon={<ArrowLeft className="size-4" />} onClick={() => void navigate("/")}>
        Voltar
      </Button>
    </PlainPage>
  );
}
