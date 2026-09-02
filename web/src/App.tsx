import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { AppProviders } from "./components/providers/AppProviders";
import { AchievementsPage } from "./pages/AchievementsPage";
import { FamilyPage } from "./pages/FamilyPage";
import { HomePage } from "./pages/HomePage";
import { InvitePage } from "./pages/InvitePage";
import { MemberPage } from "./pages/MemberPage";
import { NewHouseholdPage } from "./pages/NewHouseholdPage";
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
            <Route path="compras" element={<ShoppingPage />} />
            <Route path="familia" element={<FamilyPage />} />
            <Route path="familia/:memberId" element={<MemberPage />} />
            <Route path="conquistas" element={<AchievementsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
