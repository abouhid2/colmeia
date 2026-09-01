import { useCallback, useState } from "react";
import type { Task } from "../../domain/types";

/** Shared open/close state for the task editor and the "who did it" dialog. */
export function useTaskDialogs() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [completing, setCompleting] = useState<Task | null>(null);

  const openCreate = useCallback(() => { setEditing(null); setEditorOpen(true); }, []);
  const openEdit = useCallback((task: Task) => { setEditing(task); setEditorOpen(true); }, []);
  const closeEditor = useCallback(() => setEditorOpen(false), []);
  const openComplete = useCallback((task: Task) => setCompleting(task), []);
  const closeComplete = useCallback(() => setCompleting(null), []);

  return { editorOpen, editing, completing, openCreate, openEdit, closeEditor, openComplete, closeComplete };
}

export type TaskDialogsState = ReturnType<typeof useTaskDialogs>;
