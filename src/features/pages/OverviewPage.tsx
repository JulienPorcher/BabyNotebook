import { useState } from "react";
import BabyLogPage from "./BabyLogPage";

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<"meals" | "diapers" | "baths">("meals");

  // TODO: mettre un vrai sélecteur de bébé
  const [selectedBaby, setSelectedBaby] = useState("baby_id_placeholder");

  return (
    <div className="p-4">
      {/* Sélecteur de bébé */}
      <div className="mb-4">
        <label className="font-semibold mr-2">Bébé :</label>
        <select
          value={selectedBaby}
          onChange={(e) => setSelectedBaby(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="baby_id_placeholder">Bébé 1</option>
          <option value="baby2">Bébé 2</option>
        </select>
      </div>

      {/* Intercalaires */}
      <div className="flex space-x-2 mb-4 border-b">
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "meals" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("meals")}
        >
          Repas
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "diapers" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("diapers")}
        >
          Couches
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "baths" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("baths")}
        >
          Couches
        </button>
      </div>

      {/* Contenu du sous-onglet */}
      <div>
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
