import { useState } from "react";
import { awardedPoints, formatPoints } from "../../domain/points";
import type { Task } from "../../domain/types";
import { useSession } from "../../hooks/useSession";
import { useTaskMutations } from "../../hooks/useTasks";
import { useToast } from "../../hooks/useToast";
import { cn } from "../../lib/cn";
import { LagartinhaMark } from "../members/LagartinhaMark";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

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
  const { complete } = useTaskMutations();
  const { notify } = useToast();
  const doer = members.find((member) => member.id === memberId);
  const payout = awardedPoints(task.points, null, doer?.pointsMultiplier ?? 1);

  const confirm = () => {
    if (memberId === null || !doer) return;
    complete.mutate({ id: task.id, memberId }, {
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
      <div role="radiogroup" aria-label="Quem fez" className="grid grid-cols-2 gap-2">
        {members.map((member) => {
          const selected = member.id === memberId;
          return (
            <button
              key={member.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMemberId(member.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-left font-medium transition-colors",
                selected ? "border-honey-500 bg-honey-100" : "border-line hover:bg-dune-100",
              )}
            >
              <Avatar member={member} size="sm" />
              <span className="min-w-0 flex-1 truncate">{member.name}</span>
              <LagartinhaMark member={member} compact />
            </button>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancelar</Button>
        <Button onClick={confirm} loading={complete.isPending} disabled={memberId === null}>
          {task.requiresReview ? "Enviar para avaliação" : `Concluir e ganhar ${payout}`}
        </Button>
      </div>
    </div>
  );
}
