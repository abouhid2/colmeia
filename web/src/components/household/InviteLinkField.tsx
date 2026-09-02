import { Copy } from "lucide-react";
import { useId } from "react";
import { useInviteLink } from "../../hooks/useInviteLink";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

const SHARED_HINT = "Mande para quem mora aí. Quem abrir escolhe quem é na lista.";

export function InviteLinkField({ inviteCode }: { inviteCode: string }) {
  const { url, isLocal, canCopy, copy, localWarning } = useInviteLink(inviteCode);
  const fieldId = useId();

  return (
    <Field label="Link do convite" htmlFor={fieldId} hint={isLocal ? localWarning : SHARED_HINT}>
      <div className="flex gap-2">
        <Input id={fieldId} readOnly value={url} onFocus={(event) => event.target.select()} className="text-sm" />
        {canCopy && (
          <Button variant="secondary" icon={<Copy className="size-4" />} onClick={() => void copy()}>Copiar</Button>
        )}
      </div>
    </Field>
  );
}
