import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BabyProvider } from "./context/BabyContext";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./features/auth/LoginPage";
import HomePage from "./features/pages/HomePage";
import OverviewPage from "./features/pages/OverviewPage";
import ActivitiesPage from "./features/pages/ActivitiesPage";
import SettingsPage from "./features/settings/SettingsPage";
import EvolutionPage from "./features/pages/subpages/EvolutionPage";
import Layout from "./components/Layout";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  return (
    <BabyProvider>
      <BrowserRouter>
        {user ? (
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/evolution" element={<EvolutionPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        ) : (
          <LoginPage />
        )}
      </BrowserRouter>
    </BabyProvider>
  );
}

export default App;
