import { Outlet } from "react-router";
import { useApi } from "../../hooks/useApi";
import { useHousehold } from "../../hooks/useHousehold";
import { useSession } from "../../hooks/useSession";
import { OnboardingPage } from "../../pages/OnboardingPage";
import { BrandMark } from "./BrandMark";
import { MemberSwitcher } from "./MemberSwitcher";
import { NavLinks } from "./NavLinks";

export function AppShell() {
  const { members, isLoading } = useSession();
  const { data: household } = useHousehold();
  const { mode } = useApi();

  if (isLoading) return <LoadingScreen />;
  if (members.length === 0) return <OnboardingPage />;

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15.5rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line bg-surface px-5 py-6 md:flex">
        <div>
          <BrandMark />
          <p className="mt-1 truncate pl-9 text-sm text-ink-soft">{household?.name}</p>
        </div>
        <nav aria-label="Principal"><NavLinks layout="rail" /></nav>
        <div className="mt-auto space-y-3">
          <MemberSwitcher />
          {mode === "local" && <p className="text-xs text-ink-faint">Demonstração: os dados ficam só neste navegador.</p>}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-2.5 backdrop-blur md:hidden">
          <BrandMark />
          <MemberSwitcher compact />
        </header>
        <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 md:px-10 md:pb-16 md:pt-10">
          <Outlet />
        </main>
        <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          <NavLinks layout="tabs" />
        </nav>
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
