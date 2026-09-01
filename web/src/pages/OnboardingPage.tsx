import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { MemberColor, MemberInput } from "../domain/types";
import { MEMBER_COLOR_OPTIONS } from "../domain/memberColors";
import { useRenameHousehold } from "../hooks/useHousehold";
import { useMemberMutations } from "../hooks/useMembers";
import { BrandMark } from "../components/layout/BrandMark";
import { AvatarPicker } from "../components/members/AvatarPicker";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";

/** First run against an empty store: name the house and say who lives in it. */
export function OnboardingPage() {
  const [householdName, setHouseholdName] = useState("");
  const [drafts, setDrafts] = useState<MemberInput[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🐝");
  const [color, setColor] = useState<MemberColor>("honey");
  const [starting, setStarting] = useState(false);
  const rename = useRenameHousehold();
  const { create } = useMemberMutations();

  const addDraft = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() === "") return;
    setDrafts((current) => [...current, { name: name.trim(), avatar, color }]);
    setName("");
    setColor(MEMBER_COLOR_OPTIONS[(drafts.length + 1) % MEMBER_COLOR_OPTIONS.length]);
  };

  const start = async () => {
    setStarting(true);
    try {
      if (householdName.trim() !== "") await rename.mutateAsync({ name: householdName });
      for (const draft of drafts) await create.mutateAsync(draft);
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <BrandMark className="justify-center" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Quem mora aqui?</h1>
        <p className="mt-2 text-ink-soft">As tarefas da casa viram pontos, e os pontos viram uma recompensa para todo mundo.</p>
      </div>

      <Card className="space-y-5 p-6">
        <Field label="Nome da casa" htmlFor="household-name">
          <Input id="household-name" value={householdName} onChange={(event) => setHouseholdName(event.target.value)} placeholder="Ex.: Família Silva, Apê 42" />
        </Field>

        {drafts.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Pessoas adicionadas">
            {drafts.map((draft, index) => (
              <li key={`${draft.name}-${index}`} className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-1.5 text-sm font-medium">
                <Avatar member={draft} size="xs" /> {draft.name}
                <button type="button" aria-label={`Remover ${draft.name}`} onClick={() => setDrafts((current) => current.filter((_, position) => position !== index))} className="grid size-5 place-items-center rounded-full text-ink-faint hover:bg-dune-100 hover:text-ink"><X className="size-3.5" /></button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addDraft} className="space-y-3">
          <div className="flex gap-2">
            <Input aria-label="Nome da pessoa" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome" />
            <Button type="submit" variant="secondary" icon={<Plus className="size-4" />} disabled={name.trim() === ""}>Adicionar</Button>
          </div>
          <AvatarPicker avatar={avatar} color={color} onAvatar={setAvatar} onColor={setColor} />
        </form>

        <Button size="lg" className="w-full" disabled={drafts.length === 0} loading={starting} onClick={start}>
          {drafts.length === 0 ? "Adicione pelo menos uma pessoa" : "Começar"}
        </Button>
      </Card>
    </main>
  );
}
