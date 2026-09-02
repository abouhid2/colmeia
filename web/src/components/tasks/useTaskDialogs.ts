import { useCallback, useState } from "react";
import type { Task } from "../../domain/types";
import type { TaskDialogMode } from "./TaskDialog";

/** Shared open/close state for the task editor and the "who did it" dialog. */
export function useTaskDialogs() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<TaskDialogMode>("plan");
  const [editing, setEditing] = useState<Task | null>(null);
  const [completing, setCompleting] = useState<Task | null>(null);

  const openEditor = useCallback((task: Task | null, mode: TaskDialogMode) => {
    setEditing(task);
    setEditorMode(mode);
    setEditorOpen(true);
  }, []);

  const openCreate = useCallback(() => openEditor(null, "plan"), [openEditor]);
  const openEdit = useCallback((task: Task) => openEditor(task, "plan"), [openEditor]);
  /** Something nobody planned: it is already done, and goes straight to history. */
  const openLogDone = useCallback(() => openEditor(null, "logged"), [openEditor]);
  const closeEditor = useCallback(() => setEditorOpen(false), []);
  const openComplete = useCallback((task: Task) => setCompleting(task), []);
  const closeComplete = useCallback(() => setCompleting(null), []);

  return {
    editorOpen, editorMode, editing, completing,
    openCreate, openEdit, openLogDone, closeEditor, openComplete, closeComplete,
  };
}

export type TaskDialogsState = ReturnType<typeof useTaskDialogs>;
