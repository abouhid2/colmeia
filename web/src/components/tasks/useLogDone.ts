import { useRef, useState } from "react";
import type { TaskInput } from "../../domain/types";
import { useSeason } from "../../hooks/useSeasonContext";
import { useSession } from "../../hooks/useSession";
import { useTaskMutations } from "../../hooks/useTasks";
import { useToast } from "../../hooks/useToast";
import { logDoneMessage } from "./logDoneCopy";
import { useCompletionMoment } from "./useCompletionMoment";

/**
 * Create a task and close it in one gesture. It takes two calls, so the id of
 * the task that was created is kept: if the completion fails, the task is
 * already there and trying again finishes it instead of making a twin.
 */
export function useLogDone(onDone: () => void) {
  const { members, currentMember } = useSession();
  const { currentSeason } = useSeason();
  const { create, complete } = useTaskMutations();
  const { notify } = useToast();
  const [memberId, setMemberId] = useState<number | null>(currentMember?.id ?? null);
  const moment = useCompletionMoment();
  const created = useRef<number | null>(null);

  const finish = (taskId: number, doerId: number, doerName: string) => {
    complete.mutate({ id: taskId, memberId: doerId, completedAt: moment.completedAt }, {
      onSuccess: ({ completion }) => {
        notify({
          tone: completion.status === "pending" ? "info" : "success",
          message: logDoneMessage(completion, doerName, moment.day),
        });
        onDone();
      },
    });
  };

  const submit = (input: TaskInput) => {
    const doer = members.find((member) => member.id === memberId);
    if (doer === undefined || !moment.isValid) return;

    if (created.current !== null) {
      finish(created.current, doer.id, doer.name);
      return;
    }
    create.mutate(input, {
      onSuccess: (task) => {
        created.current = task.id;
        finish(task.id, doer.id, doer.name);
      },
    });
  };

  return {
    members,
    /** The estação it lands in: the one on screen, like any new task. */
    seasonId: currentSeason?.id ?? null,
    memberId,
    setMemberId,
    moment,
    submitting: create.isPending || complete.isPending,
    ready: memberId !== null && moment.isValid,
    submit,
  };
}
