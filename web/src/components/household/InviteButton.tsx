import { UserPlus } from "lucide-react";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useHousehold } from "../../hooks/useHousehold";
import { useInviteLink } from "../../hooks/useInviteLink";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { ShareInviteDialog } from "./ShareInviteDialog";

/** Copies the invite link, and falls back to showing it when the clipboard is not there. */
export function InviteButton({ compact = false }: { compact?: boolean }) {
  const { data: household } = useHousehold();
  const dialog = useDisclosure();
  const { copy } = useInviteLink(household?.inviteCode);

  if (!household) return null;

  const share = async () => {
    if (!(await copy())) dialog.open();
  };

  return (
    <>
      {compact ? (
        <IconButton label="Convidar" icon={<UserPlus className="size-5" />} onClick={() => void share()} />
      ) : (
        <Button variant="secondary" size="sm" className="w-full" icon={<UserPlus className="size-4" />} onClick={() => void share()}>
          Convidar
        </Button>
      )}
      <ShareInviteDialog open={dialog.isOpen} inviteCode={household.inviteCode} demo={household.demo} onClose={dialog.close} />
    </>
  );
}
