import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { LocalApi } from "../api/localApi";
import { buildDemoState } from "../api/seed";
import type { KeyValueStore } from "../api/storage";
import { ToastProvider } from "../components/providers/ToastProvider";
import { resolveSeason } from "../domain/seasons";
import type { Member, Season } from "../domain/types";
import { ApiContext } from "../hooks/useApi";
import { SeasonContext } from "../hooks/useSeasonContext";
import { SessionContext } from "../hooks/useSessionContext";

class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

interface Colmeia {
  api: LocalApi;
  member: Member;
  seasons: Season[];
}

/** The example family in a store of its own, with the switch either way. */
export async function exampleColmeia(lagartinhasEnabled: boolean): Promise<Colmeia> {
  const api = new LocalApi(new MemoryStore(), { seed: () => buildDemoState(new Date()), newCode: () => "exemplo0001" });
  const { household, member } = await api.households.createDemo();
  api.setInviteCode(household.inviteCode);
  await api.household.update({ lagartinhasEnabled });
  return { api, member, seasons: await api.seasons.list() };
}

/** Everything a screen needs around it, minus the browser storage the real
 *  providers read: the colmeia, who is looking at it and which estação. */
function Providers({ colmeia, children }: { colmeia: Colmeia; children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const session = {
    session: { inviteCode: "exemplo0001", memberId: colmeia.member.id, seasonId: null },
    memberships: {},
    enter: () => {},
    leave: () => {},
    setCurrentMemberId: () => {},
    setCurrentSeasonId: () => {},
  };
  const season = {
    seasons: colmeia.seasons,
    currentSeason: resolveSeason(colmeia.seasons, null, new Date()),
    setCurrentSeasonId: () => {},
    isLoading: false,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={colmeia.api}>
        <ToastProvider>
          <SessionContext.Provider value={session}>
            <SeasonContext.Provider value={season}>
              <MemoryRouter>{children}</MemoryRouter>
            </SeasonContext.Provider>
          </SessionContext.Provider>
        </ToastProvider>
      </ApiContext.Provider>
    </QueryClientProvider>
  );
}

export function renderInColmeia(colmeia: Colmeia, ui: ReactNode) {
  return render(<Providers colmeia={colmeia}>{ui}</Providers>);
}
