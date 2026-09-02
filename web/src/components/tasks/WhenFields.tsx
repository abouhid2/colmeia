import { useId } from "react";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import type { CompletionMoment } from "./useCompletionMoment";

/** "Quando?": now unless somebody says otherwise, and then the browser's own
 *  calendar and clock, so nobody has to type a date in any particular shape. */
export function WhenFields({ moment }: { moment: CompletionMoment }) {
  const dateId = useId();
  const timeId = useId();

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink">Quando?</span>
        <button
          type="button"
          onClick={() => moment.setCustom(!moment.custom)}
          className="text-sm font-semibold text-honey-700 hover:underline"
        >
          {moment.custom ? "Foi agora" : "Foi em outro dia ou hora"}
        </button>
      </div>

      {moment.custom ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dia" htmlFor={dateId}>
              <Input id={dateId} type="date" value={moment.date} onChange={(event) => moment.setDate(event.target.value)} />
            </Field>
            <Field label="Hora" htmlFor={timeId}>
              <Input id={timeId} type="time" value={moment.time} onChange={(event) => moment.setTime(event.target.value)} />
            </Field>
          </div>
          {moment.error ? (
            <p className="text-sm text-berry-700">{moment.error}</p>
          ) : (
            moment.phrase && <p className="text-sm text-ink-soft">Vai contar como feita em {moment.phrase}.</p>
          )}
        </>
      ) : (
        <p className="text-sm text-ink-soft">Agora mesmo.</p>
      )}
    </div>
  );
}
