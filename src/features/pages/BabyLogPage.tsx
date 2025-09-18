import { useState } from "react";
import type { JSX } from "react";
import { Utensils, Heart, HeartPlus, Milk } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useBaby } from "../../context/BabyContext";
import { useAuth } from "../../hooks/useAuth";
import UnifiedForm from "../forms/UnifiedForm";
import ScrollableStatsPanel from "../components/ScrollableStatsPanel";

const logTypeConfig = {
  meal: {
    title: "Biberon",
    table: "meals",
    quantityType: null! as number,
  },
  bottle: {
    title: "Biberon",
    table: "bottles",
    quantityType: null! as number,
  },
  pump: {
    title: "Expression",
    table: "pumps",
    quantityType: null! as number,
  },
  breast: {
    title: "Allaitement",
    table: "breast_feeding",
    quantityType: null! as number,
  },
  diaper: {
    title: "Couche",
    table: "diapers",
    quantityType: null! as string,
  },
  bath: {
    title: "Bain",
    table: "baths",
    quantityType: null! as void,
  },
} as const;

type LogType = keyof typeof logTypeConfig;


type BabyLogPageProps = {
  page: 'meal' | 'diaper' | 'bath';
};



export default function BabyLogPage({ page }: BabyLogPageProps) {
  const { currentBabyId } = useBaby();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedFormPage, setSelectedFormPage] = useState<"bottle" | "pump" | "breast" | "meal" | null>(null);

  // Page effective (si un sous-formulaire repas est sélectionné)
  const effectivePage: LogType = (selectedFormPage ?? page) as LogType;

  // Table cible
  const table = logTypeConfig[effectivePage].table;

  async function handleFormSubmit(formData: Record<string, any>) {
    if (!currentBabyId || !user?.id) return;

    try {
      const { error } = await supabase
        .from(table)
        .insert([{ ...formData, baby_id: currentBabyId, user_id: user.id }]);

      if (error) {
        console.error("Error adding log:", error);
      } else {
        // Trigger refresh of ScrollableStatsPanel
        window.dispatchEvent(new CustomEvent('refreshStatsPanel'));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div>
      {/* Titre + bouton ajouter */}
      <div className="flex justify-between items-center mb-4">
        {page === "meal" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pb-2">
            <SquareButton
              icon={<Milk />}
              label="Biberon"
              onClick={() => { setSelectedFormPage("bottle"); setShowForm(true); }}
            />
            <SquareButton
              icon={<Utensils />}
              label="Solide"
              onClick={() => { setSelectedFormPage("meal"); setShowForm(true); }}
            />
            <SquareButton
              icon={<Heart />}
              label="Allaitement"
              onClick={() => { setSelectedFormPage("breast"); setShowForm(true); }}
            />
            <SquareButton
              icon={<HeartPlus />}
              label="Expression"
              onClick={() => { setSelectedFormPage("pump"); setShowForm(true); }}
            />
          </div>
        ) : (
          <div className="w-full">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded"
            >
              Ajouter
            </button>
          </div>
        )}
      </div>

      {/* Stats et Tableau des logs - ScrollableStatsPanel */}
      <ScrollableStatsPanel />

      {/* Boutons supplémentaires */}
      <div className="flex gap-2 mt-4">
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">
          Modifier
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Commander {page === "meal" ? "des repas" : "des couches"}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <UnifiedForm
          page={effectivePage}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setSelectedFormPage(null); }}
          babyId={currentBabyId || undefined}
        />
      )}
    </div>
  );
}

function SquareButton({ icon, label, onClick }: { icon: JSX.Element; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-full bg-gray-100 rounded-xl p-4 hover:bg-gray-200"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
