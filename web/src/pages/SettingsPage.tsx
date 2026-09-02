import { useNavPreferences } from "../hooks/useNavPreferences";
import { NavPreferenceRow } from "../components/settings/NavPreferenceRow";
import { SectionHeading } from "../components/ui/SectionHeading";

export function SettingsPage() {
  const { items, move, setVisible, isSaving } = useNavPreferences();

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus ajustes</h1>
        <p className="mt-1 text-sm text-ink-soft">Valem só para você. Quem mais usa esta colmeia tem os seus.</p>
      </div>

      <section>
        <SectionHeading title="Navegação" hint="Escolha o que aparece no menu e em que ordem." />
        <ul className="space-y-2">
          {items.map((item, index) => (
            <NavPreferenceRow
              key={item.key}
              item={item}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              saving={isSaving}
              onMove={(step) => move(item.key, step)}
              onVisible={(visible) => setVisible(item.key, visible)}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
