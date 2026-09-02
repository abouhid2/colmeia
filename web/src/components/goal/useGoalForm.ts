import { useState } from "react";
import type { Goal, GoalInput, Season } from "../../domain/types";

const DEFAULT_TARGET = 300;

/** A goal already stored keeps its own days; a new one starts on the estação. */
function hasOwnWindow(goal: Goal | null): boolean {
  return goal !== null && (goal.startsOn !== null || goal.endsOn !== null);
}

export function useGoalForm(goal: Goal | null, defaultMemberIds: number[], season: Season) {
  const [ title, setTitle ] = useState(goal?.title ?? "");
  const [ target, setTarget ] = useState(goal?.targetPoints ?? DEFAULT_TARGET);
  const [ memberIds, setMemberIds ] = useState<number[]>(goal === null ? defaultMemberIds : goal.memberIds);
  const [ ownWindow, setOwnWindow ] = useState(hasOwnWindow(goal));
  const [ startsOn, setStartsOn ] = useState(goal?.startsOn ?? season.startsOn);
  const [ endsOn, setEndsOn ] = useState(goal?.endsOn ?? season.endsOn ?? "");

  const toggleMember = (id: number) =>
    setMemberIds((current) => (current.includes(id) ? current.filter((other) => other !== id) : [ ...current, id ]));

  const toInput = (seasonId: number): GoalInput => ({
    seasonId,
    title,
    targetPoints: target,
    memberIds,
    startsOn: ownWindow && startsOn !== "" ? startsOn : null,
    endsOn: ownWindow && endsOn !== "" ? endsOn : null,
  });

  return {
    values: { title, target, memberIds, ownWindow, startsOn, endsOn },
    setTitle,
    setTarget,
    toggleMember,
    clearMembers: () => setMemberIds([]),
    setOwnWindow,
    setStartsOn,
    setEndsOn,
    toInput,
  };
}

export type GoalFormState = ReturnType<typeof useGoalForm>;
