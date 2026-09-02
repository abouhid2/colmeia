import { CompleteTaskDialog } from "./CompleteTaskDialog";
import { TaskDialog } from "./TaskDialog";
import type { TaskDialogsState } from "./useTaskDialogs";

export function TaskDialogs({ dialogs }: { dialogs: TaskDialogsState }) {
  return (
    <>
      <TaskDialog open={dialogs.editorOpen} mode={dialogs.editorMode} task={dialogs.editing} onClose={dialogs.closeEditor} />
      <CompleteTaskDialog task={dialogs.completing} onClose={dialogs.closeComplete} />
    </>
  );
}
