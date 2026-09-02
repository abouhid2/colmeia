import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { InviteLinkField } from "./InviteLinkField";

interface ShareInviteDialogProps {
  open: boolean;
  inviteCode: string;
  /** A sandbox colmeia: worth saying before somebody invites the family to it. */
  demo?: boolean;
  onClose(): void;
}

export function ShareInviteDialog({ open, inviteCode, demo = false, onClose }: ShareInviteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Convidar" description="Cada pessoa abre o link e diz quem é.">
      <div className="space-y-5">
        <InviteLinkField inviteCode={inviteCode} />
        {demo && (
          <p className="text-sm text-ink-soft">
            Esta colmeia é um exemplo. Quem abrir o link vai mexer nas tarefas de mentira junto com você.
          </p>
        )}
        <div className="flex justify-end"><Button onClick={onClose}>Pronto</Button></div>
      </div>
    </Dialog>
  );
}
