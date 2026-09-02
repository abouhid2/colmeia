import { useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { DEMO_INVITE_CODE } from "../../api";
import { useApi } from "../../hooks/useApi";
import { useHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

/** Only the demo colmeia has an example to go back to. */
export function DemoResetCard() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { data: household } = useHousehold();
  if (api.mode !== "local" || !api.reset || household?.inviteCode !== DEMO_INVITE_CODE) return null;

  const reset = async () => {
    await api.reset?.();
    await queryClient.invalidateQueries();
    notify({ message: "Dados de exemplo restaurados" });
  };

  return (
    <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-semibold">Modo demonstração</h3>
        <p className="text-sm text-ink-soft">Tudo fica salvo só neste navegador. Para a família inteira usar, rode a API em <code className="rounded bg-dune-100 px-1">api/</code>.</p>
      </div>
      <Button variant="secondary" size="sm" icon={<RotateCcw className="size-4" />} onClick={reset}>Restaurar exemplo</Button>
    </Card>
  );
}
