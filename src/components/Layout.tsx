import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Utensils, Activity, Settings, Baby } from "lucide-react";
import BabySelector from "../components/BabySelector"; // <-- import

const tabs = [
  { path: "/", icon: <Home size={24} /> },
  { path: "/overview", icon: <Utensils size={24} /> },
  { path: "/evolution", icon: <Baby size={24} /> },
  { path: "/activity", icon: <Activity size={24} /> },
  { path: "/settings", icon: <Settings size={24} /> },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const hideBabySelector = location.pathname === "/settings";

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-center">
        <h1 className="text-xl font-bold">Carnet de Bébé 👶</h1>
      </header>

      {/* Baby selector sauf sur Settings */}
      {!hideBabySelector && (
        <div className="p-2 border-b bg-gray-50">
          <BabySelector />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Tabs */}
      <nav className="bg-white shadow-inner flex justify-around p-3">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`p-2 rounded-xl ${
              location.pathname === tab.path ? "bg-gray-200" : ""
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </nav>
    </div>
  );
}
