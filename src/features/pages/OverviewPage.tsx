import { useState } from "react";
import BabyLogPage from "./BabyLogPage";

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<"meals" | "diapers" | "baths">("meals");


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
            activeTab === "diapers" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("diapers")}
        >
          Couches
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-t-lg ${
            activeTab === "baths" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("baths")}
        >
          Bains
        </button>
      </div>

      {/* Contenu du sous-onglet */}
      <div className="bg-white rounded-2xl shadow p-4">
        {activeTab === "meals" && <BabyLogPage page="meal"/>}
        {activeTab === "diapers" && <BabyLogPage page="diaper" />}
        {activeTab === "baths" && <BabyLogPage page="bath" />}
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
