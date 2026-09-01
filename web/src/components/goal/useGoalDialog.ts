import { useCallback, useState } from "react";
import type { Goal } from "../../domain/types";

export function useGoalDialog() {
  const [isOpen, setOpen] = useState(false);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [defaultMemberId, setDefaultMemberId] = useState<number | null>(null);

  const openCreate = useCallback((memberId: number | null = null) => { setGoal(null); setDefaultMemberId(memberId); setOpen(true); }, []);
  const openEdit = useCallback((target: Goal) => { setGoal(target); setOpen(true); }, []);
  const close = useCallback(() => setOpen(false), []);

  return { isOpen, goal, defaultMemberId, openCreate, openEdit, close };
}

export type GoalDialogState = ReturnType<typeof useGoalDialog>;
