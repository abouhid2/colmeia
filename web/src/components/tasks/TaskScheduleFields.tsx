import { RECURRENCES, RECURRENCE_OPTIONS } from "../../domain/recurrence";
import type { Member, Recurrence } from "../../domain/types";
import { Field } from "../ui/Field";
import { Input, Select } from "../ui/Input";
import type { TaskFormErrors, TaskFormValues } from "./useTaskForm";

interface TaskScheduleFieldsProps {
  values: TaskFormValues;
  errors: TaskFormErrors;
  members: Member[];
  set<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]): void;
}

export function TaskScheduleFields({ values, errors, members, set }: TaskScheduleFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Repete?" htmlFor="task-recurrence">
          <Select id="task-recurrence" value={values.recurrence} onChange={(event) => set("recurrence", event.target.value as Recurrence)}>
            {RECURRENCE_OPTIONS.map((option) => (
              <option key={option} value={option}>{RECURRENCES[option].label}</option>
            ))}
          </Select>
        </Field>
        {values.recurrence === "custom" ? (
          <Field label="A cada quantos dias" htmlFor="task-interval" error={errors.intervalDays}>
            <Input id="task-interval" type="number" min={1} step={1} value={values.intervalDays} onChange={(event) => set("intervalDays", event.target.value)} placeholder="3" />
          </Field>
        ) : (
          <Field label={values.recurrence === "none" ? "Prazo" : "Próxima vez"} htmlFor="task-due">
            <Input id="task-due" type="date" value={values.dueOn} onChange={(event) => set("dueOn", event.target.value)} />
          </Field>
        )}
      </div>
      {values.recurrence === "custom" && (
        <Field label="Próxima vez" htmlFor="task-due-custom">
          <Input id="task-due-custom" type="date" value={values.dueOn} onChange={(event) => set("dueOn", event.target.value)} />
        </Field>
      )}
      <Field label="Responsável" htmlFor="task-assignee">
        <Select id="task-assignee" value={values.assigneeId} onChange={(event) => set("assigneeId", event.target.value)}>
          <option value="">Quem pegar primeiro</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>{member.avatar} {member.name}</option>
          ))}
        </Select>
      </Field>
    </>
  );
}
