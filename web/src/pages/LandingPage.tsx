import { Plus, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { extractInviteCode } from "../domain/inviteCode";
import { useColmeiaSwitcher, useEnterExample, useStoredHouseholds } from "../hooks/useHouseholds";
import { BrandMark } from "../components/layout/BrandMark";
import { PlainPage } from "../components/layout/PlainPage";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { SectionHeading } from "../components/ui/SectionHeading";

/** No colmeia yet: start one, or open the link somebody sent. */
export function LandingPage() {
  const navigate = useNavigate();
  const { data: stored } = useStoredHouseholds();
  const switchTo = useColmeiaSwitcher();
  const enterExample = useEnterExample();
  const [ pasted, setPasted ] = useState("");
  const [ error, setError ] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const code = extractInviteCode(pasted);
    if (code === null) {
      setError("Cole o link do convite ou digite só o código.");
      return;
    }
    setError(null);
    void navigate(`/entrar/${code}`);
  };

  return (
    <PlainPage>
      <div className="text-center">
        <BrandMark className="justify-center" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">As tarefas da casa viram pontos</h1>
        <p className="mt-2 text-ink-soft">E os pontos viram uma recompensa para todo mundo. Crie a sua colmeia ou entre na de quem te chamou.</p>
      </div>

      <Card className="space-y-5 p-6">
        <Button size="lg" className="w-full" icon={<Plus className="size-4" />} onClick={() => void navigate("/nova")}>
          Criar uma colmeia
        </Button>

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
          <span className="h-px flex-1 bg-line" />ou<span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field label="Tenho um link de convite" htmlFor="invite-code" error={error ?? undefined}>
            <Input
              id="invite-code"
              value={pasted}
              onChange={(event) => setPasted(event.target.value)}
              placeholder="Cole o link ou o código"
              autoComplete="off"
            />
          </Field>
          <Button type="submit" variant="secondary" className="w-full" disabled={pasted.trim() === ""}>Entrar</Button>
        </form>
      </Card>

      <div className="text-center">
        <Button
          variant="secondary"
          className="w-full"
          icon={<Sparkles className="size-4" />}
          loading={enterExample.isPending}
          onClick={() => enterExample.mutate()}
        >
          Experimentar com uma família de exemplo
        </Button>
        <p className="mt-2 text-sm text-ink-soft">Uma colmeia só sua, cheia de tarefas e pessoas de mentira, para você mexer à vontade.</p>
      </div>

      {stored !== undefined && stored.length > 0 && (
        <section>
          <SectionHeading title="Colmeias que você já abriu aqui" />
          <ul className="space-y-2">
            {stored.map((item) => (
              <li key={item.inviteCode}>
                <Button variant="secondary" className="w-full justify-start" onClick={() => switchTo(item.inviteCode)}>
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PlainPage>
  );
}
