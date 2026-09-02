import { useState } from "react";
import { awardedPoints, formatPoints } from "../../domain/points";
import type { Task } from "../../domain/types";
import { useSession } from "../../hooks/useSession";
import { useTaskMutations } from "../../hooks/useTasks";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { DoerPicker } from "./DoerPicker";
import { useCompletionMoment } from "./useCompletionMoment";
import { WhenFields } from "./WhenFields";

interface CompleteTaskDialogProps {
  task: Task | null;
  onClose(): void;
}

export function CompleteTaskDialog({ task, onClose }: CompleteTaskDialogProps) {
  return (
    <Dialog open={task !== null} onClose={onClose} title="Quem fez esta tarefa?" description={task?.title}>
      {task && <CompleteTaskForm key={task.id} task={task} onDone={onClose} />}
    </Dialog>
  );
}

function CompleteTaskForm({ task, onDone }: { task: Task; onDone(): void }) {
  const { members, currentMember } = useSession();
  const [memberId, setMemberId] = useState<number | null>(currentMember?.id ?? null);
  const moment = useCompletionMoment();
  const { complete } = useTaskMutations();
  const { notify } = useToast();
  const doer = members.find((member) => member.id === memberId);
  const payout = awardedPoints(task.points, null, doer?.pointsMultiplier ?? 1);

  const confirm = () => {
    if (memberId === null || !doer || !moment.isValid) return;
    complete.mutate({ id: task.id, memberId, completedAt: moment.completedAt }, {
      onSuccess: ({ completion }) => {
        notify(completion.status === "pending"
          ? { message: `Feito. Agora outra pessoa dá a nota e libera os ${task.points} pontos.` }
          : { tone: "success", message: `${formatPoints(completion.pointsAwarded)} para ${doer.name}` });
        onDone();
      },
    });
  };

  return (
    <div className="space-y-5">
      <DoerPicker members={members} selectedId={memberId} onSelect={setMemberId} />
      <WhenFields moment={moment} />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancelar</Button>
        <Button onClick={confirm} loading={complete.isPending} disabled={memberId === null || !moment.isValid}>
          {task.requiresReview ? "Enviar para avaliação" : `Concluir e ganhar ${payout}`}
        </Button>
      </div>
    </div>
  );
}
