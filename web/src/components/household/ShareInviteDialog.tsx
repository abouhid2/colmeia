import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { InviteLinkField } from "./InviteLinkField";

interface ShareInviteDialogProps {
  open: boolean;
  inviteCode: string;
  onClose(): void;
}

export function ShareInviteDialog({ open, inviteCode, onClose }: ShareInviteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Convidar" description="Cada pessoa abre o link e diz quem é.">
      <div className="space-y-5">
        <InviteLinkField inviteCode={inviteCode} />
        <div className="flex justify-end"><Button onClick={onClose}>Pronto</Button></div>
      </div>
    </Dialog>
  );
}
