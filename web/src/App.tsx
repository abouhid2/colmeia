import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { AppProviders } from "./components/providers/AppProviders";
import { AchievementsPage } from "./pages/AchievementsPage";
import { FamilyPage } from "./pages/FamilyPage";
import { GoalsPage } from "./pages/GoalsPage";
import { HomePage } from "./pages/HomePage";
import { InvitePage } from "./pages/InvitePage";
import { MemberPage } from "./pages/MemberPage";
import { NewHouseholdPage } from "./pages/NewHouseholdPage";
import { SeasonPage } from "./pages/SeasonPage";
import { SeasonsPage } from "./pages/SeasonsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShoppingPage } from "./pages/ShoppingPage";
import { TasksPage } from "./pages/TasksPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter basename={basename}>
        <Routes>
          {/* No colmeia needed, and no navigation either. */}
          <Route path="nova" element={<NewHouseholdPage />} />
          <Route path="entrar/:code" element={<InvitePage />} />
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="tarefas" element={<TasksPage />} />
            <Route path="metas" element={<GoalsPage />} />
            <Route path="compras" element={<ShoppingPage />} />
            <Route path="familia" element={<FamilyPage />} />
            <Route path="familia/:memberId" element={<MemberPage />} />
            <Route path="estacoes" element={<SeasonsPage />} />
            <Route path="estacoes/:seasonId" element={<SeasonPage />} />
            <Route path="conquistas" element={<AchievementsPage />} />
            <Route path="ajustes" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
