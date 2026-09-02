import type { Season } from "../../domain/types";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Toggle } from "../ui/Toggle";
import { goalWindowPhrase } from "./goalCopy";

interface GoalWindowFieldProps {
  season: Season;
  ownWindow: boolean;
  startsOn: string;
  endsOn: string;
  onOwnWindow(value: boolean): void;
  onStartsOn(value: string): void;
  onEndsOn(value: string): void;
}

/** When the goal counts: the whole estação, or a stretch of it. */
export function GoalWindowField({ season, ownWindow, startsOn, endsOn, onOwnWindow, onStartsOn, onEndsOn }: GoalWindowFieldProps) {
  const resolved = ownWindow
    ? goalWindowPhrase({ startsOn: startsOn === "" ? null : startsOn, endsOn: endsOn === "" ? null : endsOn }, season)
    : goalWindowPhrase({ startsOn: null, endsOn: null }, season);

  return (
    <div className="space-y-3">
      <Toggle
        checked={ownWindow}
        onChange={onOwnWindow}
        label="Só uma parte da estação"
        hint={ownWindow ? undefined : "A meta vale a estação inteira."}
      />
      {ownWindow && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Começa em" htmlFor="goal-starts">
            <Input
              id="goal-starts" type="date" value={startsOn} min={season.startsOn}
              max={season.endsOn ?? undefined} onChange={(event) => onStartsOn(event.target.value)}
            />
          </Field>
          <Field label="Termina em" htmlFor="goal-ends">
            <Input
              id="goal-ends" type="date" value={endsOn} min={startsOn === "" ? season.startsOn : startsOn}
              max={season.endsOn ?? undefined} onChange={(event) => onEndsOn(event.target.value)}
            />
          </Field>
        </div>
      )}
      <p className="text-sm text-ink-soft">{resolved}</p>
    </div>
  );
}
