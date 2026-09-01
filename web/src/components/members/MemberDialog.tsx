import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Member, MemberColor } from "../../domain/types";
import { useMemberMutations } from "../../hooks/useMembers";
import { useToast } from "../../hooks/useToast";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { AvatarPicker } from "./AvatarPicker";

interface MemberDialogProps {
  open: boolean;
  member: Member | null;
  onClose(): void;
}

export function MemberDialog({ open, member, onClose }: MemberDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={member ? "Editar pessoa" : "Nova pessoa"}>
      <MemberForm key={member?.id ?? "new"} member={member} onDone={onClose} />
    </Dialog>
  );
}

function MemberForm({ member, onDone }: { member: Member | null; onDone(): void }) {
  const [name, setName] = useState(member?.name ?? "");
  const [avatar, setAvatar] = useState(member?.avatar ?? "🐝");
  const [color, setColor] = useState<MemberColor>(member?.color ?? "honey");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { create, update, remove } = useMemberMutations();
  const { notify } = useToast();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = { name, avatar, color };
    const onSuccess = () => { notify({ tone: "success", message: member ? "Pessoa salva" : `${name} entrou na colmeia` }); onDone(); };
    if (member) update.mutate({ id: member.id, input }, { onSuccess });
    else create.mutate(input, { onSuccess });
  };

  const destroy = () => {
    if (!member) return;
    remove.mutate(member.id, { onSuccess: () => { notify({ message: `${member.name} saiu da colmeia` }); onDone(); } });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar member={{ name: name || "Prévia", avatar, color }} size="lg" />
        <Field label="Nome" htmlFor="member-name">
          <Input id="member-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como chamam essa pessoa" required autoFocus className="w-56" />
        </Field>
      </div>
      <AvatarPicker avatar={avatar} color={color} onAvatar={setAvatar} onColor={setColor} />
      <div className="flex items-center justify-between gap-2 pt-2">
        {member ? (
          <Button variant={confirmingDelete ? "danger" : "ghost"} size="sm" icon={<Trash2 className="size-4" />} onClick={() => (confirmingDelete ? destroy() : setConfirmingDelete(true))} loading={remove.isPending}>
            {confirmingDelete ? "Confirmar saída" : "Remover"}
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDone}>Cancelar</Button>
          <Button type="submit" loading={create.isPending || update.isPending}>{member ? "Salvar" : "Adicionar"}</Button>
        </div>
      </div>
    </form>
  );
}
