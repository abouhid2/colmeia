import { Pencil } from "lucide-react";
import { useState, type FormEvent } from "react";
import { LIMITS } from "../../domain/limits";
import type { Member } from "../../domain/types";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useMemberMutations } from "../../hooks/useMembers";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

/** Renaming your own crown right where the título is explained, so nobody has
 *  to go hunting for it in the pessoa dialog. */
export function OwnCrownTitleField({ member }: { member: Member }) {
  const editing = useDisclosure();

  if (editing.isOpen) return <CrownTitleForm key={member.crownTitle} member={member} onDone={editing.close} />;

  return (
    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
      {member.crownTitle === ""
        ? <span>Você está fora da coroa</span>
        : <span>Ao vencer, você vira <span className="font-semibold text-ink">{member.crownTitle}</span></span>}
      <Button variant="ghost" size="sm" icon={<Pencil className="size-4" />} onClick={editing.open}>Editar o meu</Button>
    </p>
  );
}

function CrownTitleForm({ member, onDone }: { member: Member; onDone(): void }) {
  const [ value, setValue ] = useState(member.crownTitle);
  const { update } = useMemberMutations();
  const { notify } = useToast();

  const save = (event: FormEvent) => {
    event.preventDefault();
    const chosen = value.trim();
    update.mutate({ id: member.id, input: { crownTitle: chosen } }, {
      onSuccess: () => {
        notify({ tone: "success", message: chosen === "" ? "Você ficou fora da coroa" : `Ao vencer, você vira ${chosen}` });
        onDone();
      },
    });
  };

  return (
    <form onSubmit={save} className="mt-2 flex flex-wrap items-center gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Como você quer ser chamado ao vencer"
        placeholder="Abelha Rainha, Abelhão, Rei da Louça…"
        maxLength={LIMITS.crownTitle}
        className="w-56"
        autoFocus
      />
      <Button type="submit" size="sm" loading={update.isPending}>Salvar</Button>
      <Button variant="ghost" size="sm" onClick={onDone}>Cancelar</Button>
      <span className="w-full text-sm text-ink-soft">Em branco, você fica fora da coroa.</span>
    </form>
  );
}
