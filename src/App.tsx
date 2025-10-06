import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BabyProvider } from "./context/BabyContext";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./features/auth/LoginPage";
import HomePage from "./features/pages/HomePage";
import OverviewPage from "./features/pages/OverviewPage";
import GalleryPage from "./features/pages/GalleryPage";
import SettingsPage from "./features/settings/SettingsPage";
import EvolutionPage from "./features/pages/subpages/EvolutionPage";
import SharePage from "./features/pages/SharePage";
import Layout from "./components/Layout";
import ForgotPassword from "./features/auth/ForgotPassword";
import UpdatePassword from "./features/auth/UpdatePassword";
import RouteRefreshHandler from "./components/RouteRefreshHandler";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  return (
    <BabyProvider>
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundColor: "#e6f2d5",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
      <BrowserRouter>
        {user && <RouteRefreshHandler />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<UpdatePassword />} />
          {user ? (
          
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/evolution" element={<EvolutionPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/share" element={<SharePage />} />
            </Route>
          
        ) : (
          <Route path="*" element={<LoginPage />} />
        )}
        </Routes>
      </BrowserRouter>
      </div>
    </BabyProvider>
  );
}

export default App;
