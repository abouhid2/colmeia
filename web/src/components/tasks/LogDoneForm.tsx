import { Field } from "../ui/Field";
import { DoerPicker } from "./DoerPicker";
import { TaskForm } from "./TaskForm";
import { useLogDone } from "./useLogDone";
import { WhenFields } from "./WhenFields";

/** The same task form, minus everything about the future: this one already
 *  happened, so it only needs who did it and when. */
export function LogDoneForm({ onDone }: { onDone(): void }) {
  const log = useLogDone(onDone);

  return (
    <TaskForm
      task={null}
      members={log.members}
      currentMemberId={log.memberId}
      submitting={log.submitting}
      logged={{
        ready: log.ready,
        fields: (
          <>
            <Field label="Quem fez">
              <DoerPicker members={log.members} selectedId={log.memberId} onSelect={log.setMemberId} />
            </Field>
            <WhenFields moment={log.moment} />
          </>
        ),
      }}
      onSubmit={log.submit}
      onCancel={onDone}
    />
  );
}
