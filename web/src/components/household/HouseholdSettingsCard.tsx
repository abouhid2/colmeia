import { HouseholdNameForm } from "../members/HouseholdNameForm";
import { Card } from "../ui/Card";
import { Toggle } from "../ui/Toggle";
import { useLagartinhasSetting } from "./useLagartinhasSetting";

/** What the colmeia itself is called and how it works, in one place. */
export function HouseholdSettingsCard() {
  const lagartinhas = useLagartinhasSetting();

  return (
    <Card className="space-y-5 p-5">
      <HouseholdNameForm />

      {lagartinhas.ready && (
        <div className="space-y-2">
          <Toggle
            checked={lagartinhas.enabled}
            onChange={lagartinhas.toggle}
            label="Tem lagartinhas na colmeia?"
            hint="Crianças ganham um multiplicador de pontos, um ranking só delas e tarefas marcadas como boas para elas."
          />
          {lagartinhas.note && <p className="px-3.5 text-sm text-ink-soft">{lagartinhas.note}</p>}
        </div>
      )}
    </Card>
  );
}
