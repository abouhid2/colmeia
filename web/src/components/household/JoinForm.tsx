import { useState, type FormEvent } from "react";
import { MEMBER_KIND_OPTIONS, MEMBER_KINDS } from "../../domain/memberKinds";
import type { MemberColor, MemberInput, MemberKind } from "../../domain/types";
import { AvatarPicker } from "../members/AvatarPicker";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Segmented } from "../ui/Segmented";

const KIND_SEGMENTS = MEMBER_KIND_OPTIONS.map((kind) => ({ value: kind, label: MEMBER_KINDS[kind].label }));

interface JoinFormProps {
  submitting: boolean;
  onSubmit(input: MemberInput): void;
  onCancel(): void;
}

/** "Sou outra pessoa": the list did not have me, so I add myself. */
export function JoinForm({ submitting, onSubmit, onCancel }: JoinFormProps) {
  const [ name, setName ] = useState("");
  const [ avatar, setAvatar ] = useState("🐝");
  const [ color, setColor ] = useState<MemberColor>("honey");
  const [ kind, setKind ] = useState<MemberKind>("bee");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ name, avatar, color, kind });
  };

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar member={{ name: name || "Prévia", avatar, color }} size="lg" />
          <Field label="Seu nome" htmlFor="join-name">
            <Input id="join-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como te chamam" required autoFocus />
          </Field>
        </div>
        <AvatarPicker avatar={avatar} color={color} onAvatar={setAvatar} onColor={setColor} />
        <Field label="Tipo" hint={MEMBER_KINDS[kind].hint}>
          <Segmented label="Tipo de pessoa" options={KIND_SEGMENTS} value={kind} onChange={setKind} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" loading={submitting} disabled={name.trim() === ""}>Entrar na colmeia</Button>
        </div>
      </form>
    </Card>
  );
}
