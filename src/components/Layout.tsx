import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Utensils, Image, Settings, Baby } from "lucide-react";
import { useBaby } from "../context/BabyContext";

const tabs = [
  { path: "/", icon: <Home size={24} /> },
  { path: "/overview", icon: <Utensils size={24} /> },
  { path: "/evolution", icon: <Baby size={24} /> },
  { path: "/gallery", icon: <Image size={24} /> },
  { path: "/settings", icon: <Settings size={24} /> },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBaby } = useBaby();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-center">
        <h1 className="text-xl font-bold">
          {currentBaby ? `Carnet de ${currentBaby.name}` : 'Carnet de Bébé 👶'}
        </h1>
      </header>

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
