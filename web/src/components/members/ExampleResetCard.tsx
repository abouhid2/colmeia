import { useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAppMutation } from "../../hooks/useAppMutation";
import { useHousehold } from "../../hooks/useHousehold";
import { useSessionContext } from "../../hooks/useSessionContext";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const NOTHING = [] as const;

/** Only a sandbox colmeia has an example to go back to. */
export function ExampleResetCard() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { session, enter } = useSessionContext();
  const { data: household } = useHousehold();

  const restart = useAppMutation(() => api.household.reseed(), {
    invalidates: NOTHING,
    onSuccess: (member) => {
      // Everybody came back with a new id, so the browser follows the new Ana.
      if (session !== null) enter({ inviteCode: session.inviteCode, memberId: member.id });
      void queryClient.invalidateQueries();
      notify({ message: "Exemplo recomeçado" });
    },
  });

  if (household?.demo !== true) return null;

  return (
    <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-semibold">Recomeçar o exemplo</h3>
        <p className="text-sm text-ink-soft">Apaga o que você fez aqui e devolve esta colmeia às tarefas, pessoas e pontos do começo.</p>
      </div>
      <Button variant="secondary" size="sm" icon={<RotateCcw className="size-4" />} loading={restart.isPending} onClick={() => restart.mutate()}>
        Recomeçar
      </Button>
    </Card>
  );
}
