import { Link2Off } from "lucide-react";
import { Outlet } from "react-router";
import { useAchievementSync } from "../../hooks/useAchievementAwards";
import { useApi } from "../../hooks/useApi";
import { useHousehold } from "../../hooks/useHousehold";
import { useSession } from "../../hooks/useSession";
import { useSessionContext } from "../../hooks/useSessionContext";
import { LandingPage } from "../../pages/LandingPage";
import { InviteButton } from "../household/InviteButton";
import { SeasonSwitcher } from "../season/SeasonSwitcher";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { BrandMark } from "./BrandMark";
import { ExampleBanner } from "./ExampleBanner";
import { MemberSwitcher } from "./MemberSwitcher";
import { NavLinks } from "./NavLinks";
import { PlainPage } from "./PlainPage";

export function AppShell() {
  const { session, leave } = useSessionContext();
  const { currentMember, isLoading } = useSession();
  const household = useHousehold();
  const { mode } = useApi();
  // Wherever this person is in the app, the badges they earn get written down.
  useAchievementSync(currentMember?.id ?? null);

  if (session === null) return <LandingPage />;
  if (isLoading || household.isLoading) return <LoadingScreen />;
  if (household.isError) return <LostColmeia onLeave={leave} />;

  return (
    <div className="min-h-dvh">
      <ExampleBanner />
      <div className="md:grid md:grid-cols-[15.5rem_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line bg-surface px-5 py-6 md:flex">
          <div>
            <BrandMark />
            <p className="mt-1 truncate pl-9 text-sm text-ink-soft">{household.data?.name}</p>
            <div className="mt-4"><SeasonSwitcher /></div>
          </div>
          <nav aria-label="Principal"><NavLinks layout="rail" /></nav>
          <div className="mt-auto space-y-3">
            <InviteButton />
            <MemberSwitcher />
            {mode === "local" && <p className="text-xs text-ink-faint">Demonstração: os dados ficam só neste navegador.</p>}
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-10 space-y-2 border-b border-line bg-paper/90 px-4 py-2.5 backdrop-blur md:hidden">
            <div className="flex items-center justify-between">
              <BrandMark />
              <div className="flex items-center gap-1">
                <InviteButton compact />
                <MemberSwitcher compact />
              </div>
            </div>
            <SeasonSwitcher />
          </header>
          <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 md:px-10 md:pb-16 md:pt-10">
            <Outlet />
          </main>
          <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
            <NavLinks layout="tabs" />
          </nav>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <BrandMark className="animate-pulse" />
    </div>
  );
}

/** The session points at a colmeia the API no longer answers for. */
function LostColmeia({ onLeave }: { onLeave(): void }) {
  return (
    <PlainPage>
      <EmptyState
        icon={<Link2Off className="size-6" />}
        title="Essa colmeia não está mais aqui"
        hint="O convite pode ter mudado, ou os dados deste navegador foram apagados."
        action={<Button onClick={onLeave}>Voltar ao início</Button>}
      />
    </PlainPage>
  );
}
