import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { LIMITS } from "../../domain/limits";
import { MAX_MULTIPLIER, MEMBER_KIND_OPTIONS, MEMBER_KINDS, MIN_MULTIPLIER, multiplierHint } from "../../domain/memberKinds";
import type { Member } from "../../domain/types";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useLagartinhasEnabled } from "../../hooks/useLagartinhas";
import { useMemberMutations } from "../../hooks/useMembers";
import { useToast } from "../../hooks/useToast";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Segmented } from "../ui/Segmented";
import { AvatarPicker } from "./AvatarPicker";
import { CrownTitleField } from "./CrownTitleField";
import { useMemberForm } from "./useMemberForm";

const KIND_SEGMENTS = MEMBER_KIND_OPTIONS.map((kind) => ({ value: kind, label: MEMBER_KINDS[kind].label }));

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
  const form = useMemberForm(member);
  const { name, avatar, color, kind, multiplier, crownTitle } = form.values;
  const [ confirmingDelete, setConfirmingDelete ] = useState(false);
  const advanced = useDisclosure();
  const lagartinhasEnabled = useLagartinhasEnabled();
  const { create, update, remove } = useMemberMutations();
  const { notify } = useToast();
  const showMultiplier = lagartinhasEnabled && (kind === "lagartinha" || advanced.isOpen);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.isValid) return;
    const input = form.toInput();
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
          <Input id="member-name" value={name} onChange={(event) => form.setName(event.target.value)} placeholder="Como chamam essa pessoa" maxLength={LIMITS.memberName} required autoFocus className="w-56" />
        </Field>
      </div>
      <AvatarPicker avatar={avatar} color={color} onAvatar={form.setAvatar} onColor={form.setColor} />
      {lagartinhasEnabled && (
        <Field label="É abelha ou lagartinha?" hint={MEMBER_KINDS[kind].hint}>
          <Segmented label="Tipo de pessoa" options={KIND_SEGMENTS} value={kind} onChange={form.setKind} />
        </Field>
      )}
      {showMultiplier ? (
        <Field label="Multiplicador de pontos" htmlFor="member-multiplier" error={form.multiplierError} hint={multiplierHint(name, kind, Number(multiplier.replace(",", ".")))}>
          <Input id="member-multiplier" type="number" inputMode="decimal" min={MIN_MULTIPLIER} max={MAX_MULTIPLIER} step={0.1} value={multiplier} onChange={(event) => form.setMultiplier(event.target.value)} className="w-28" />
        </Field>
      ) : lagartinhasEnabled ? (
        <Button variant="ghost" size="sm" onClick={advanced.open}>Mexer no multiplicador</Button>
      ) : null}
      <CrownTitleField id="member-crown-title" value={crownTitle} onChange={form.setCrownTitle} />
      <div className="flex items-center justify-between gap-2 pt-2">
        {member ? (
          <Button variant={confirmingDelete ? "danger" : "ghost"} size="sm" icon={<Trash2 className="size-4" />} onClick={() => (confirmingDelete ? destroy() : setConfirmingDelete(true))} loading={remove.isPending}>
            {confirmingDelete ? "Tirar mesmo" : "Tirar da colmeia"}
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDone}>Cancelar</Button>
          <Button type="submit" disabled={!form.isValid} loading={create.isPending || update.isPending}>{member ? "Salvar pessoa" : "Adicionar à colmeia"}</Button>
        </div>
      </div>
    </form>
  );
}
