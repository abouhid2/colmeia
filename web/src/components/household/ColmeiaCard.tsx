import { ArrowRightLeft, LogOut } from "lucide-react";
import { useState } from "react";
import { useColmeiaSwitcher, useStoredHouseholds } from "../../hooks/useHouseholds";
import { useHousehold } from "../../hooks/useHousehold";
import { useSessionContext } from "../../hooks/useSessionContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SectionHeading } from "../ui/SectionHeading";
import { InviteLinkField } from "./InviteLinkField";

export function ColmeiaCard() {
  const { data: household } = useHousehold();
  const { leave } = useSessionContext();
  const { data: stored } = useStoredHouseholds();
  const switchTo = useColmeiaSwitcher();
  const [ confirmingLeave, setConfirmingLeave ] = useState(false);

  if (!household) return null;

  const others = (stored ?? []).filter((item) => item.inviteCode !== household.inviteCode);

  return (
    <Card className="space-y-5 p-5">
      <InviteLinkField inviteCode={household.inviteCode} />

      {others.length > 0 && (
        <div>
          <SectionHeading title="Outras colmeias neste navegador" />
          <ul className="space-y-2">
            {others.map((item) => (
              <li key={item.inviteCode}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  icon={<ArrowRightLeft className="size-4" />}
                  onClick={() => switchTo(item.inviteCode)}
                >
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end border-t border-line pt-4">
        <Button
          variant={confirmingLeave ? "danger" : "ghost"}
          size="sm"
          icon={<LogOut className="size-4" />}
          onClick={() => (confirmingLeave ? leave() : setConfirmingLeave(true))}
        >
          {confirmingLeave ? "Confirmar saída" : "Sair desta colmeia"}
        </Button>
      </div>
    </Card>
  );
}
