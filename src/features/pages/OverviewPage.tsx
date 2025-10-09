import { useState } from "react";
import BabyLogPage from "./BabyLogPage";
import ActivitiesCalendar from "../../components/ActivitiesCalendar";
import { useBaby } from "../../context/BabyContext";

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<"meals" | "hygiene" | "health" | "calendar">("meals");
  const { currentBabyId } = useBaby();


  return (
    <div className="p-4">
      
      {/* Intercalaires */}
      <div className="flex space-x-2 mb-4 border-b">
        <button
          className={`flex-1 px-4 py-2 rounded-t-lg ${
            activeTab === "meals" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("meals")}
        >
          Repas
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-t-lg ${
            activeTab === "hygiene" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("hygiene")}
        >
          Hygiène
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-t-lg ${
            activeTab === "health" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("health")}
        >
          Santé
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-t-lg ${
            activeTab === "calendar" ? "bg-pink-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendrier
        </button>
      </div>

      {/* Contenu du sous-onglet */}
      <div className="bg-white rounded-2xl shadow p-4">
        {activeTab === "meals" && <BabyLogPage page="meal"/>}
        {activeTab === "hygiene" && <BabyLogPage page="hygiene" />}
        {activeTab === "health" && <BabyLogPage page="health" />}
        {activeTab === "calendar" && currentBabyId && (
          <ActivitiesCalendar babyId={currentBabyId} />
        )}
      </div>
      {/* Bouton partenaire */}
        <div className="mt-4 bg-yellow-100 p-3 rounded-xl">
          <p className="text-sm mb-2">
            👶 Découvrez nos repas bio pour bébé ! Livraison rapide 🍎
          </p>
          <button className="bg-yellow-500 text-white rounded-xl px-3 py-2">
            En savoir plus
          </button>
        </div>
    </div>
  );
}
