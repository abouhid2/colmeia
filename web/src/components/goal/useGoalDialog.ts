import { useCallback, useState } from "react";
import type { Goal } from "../../domain/types";

const NOBODY: number[] = [];

export function useGoalDialog() {
  const [ isOpen, setOpen ] = useState(false);
  const [ goal, setGoal ] = useState<Goal | null>(null);
  const [ defaultMemberIds, setDefaultMemberIds ] = useState<number[]>(NOBODY);
  const [ defaultSeasonId, setDefaultSeasonId ] = useState<number | null>(null);

  /** A new goal starts on whoever the screen was already about, and in the
   *  estação it came from, so the roteiro of an old estação can grow one too. */
  const openCreate = useCallback((memberId: number | null = null, seasonId: number | null = null) => {
    setGoal(null);
    setDefaultMemberIds(memberId === null ? NOBODY : [ memberId ]);
    setDefaultSeasonId(seasonId);
    setOpen(true);
  }, []);

  const openEdit = useCallback((target: Goal) => {
    setGoal(target);
    setDefaultMemberIds(NOBODY);
    setDefaultSeasonId(target.seasonId);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { isOpen, goal, defaultMemberIds, defaultSeasonId, openCreate, openEdit, close };
}

export type GoalDialogState = ReturnType<typeof useGoalDialog>;
