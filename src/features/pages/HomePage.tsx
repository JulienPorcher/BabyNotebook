import { useState } from "react";
import { Utensils, Baby, Activity, Bath, Ruler, Scale } from "lucide-react";
import type { JSX } from "react";
import UnifiedForm, { type FormPage } from "../forms/UnifiedForm";
import { useBaby } from "../../context/BabyContext";
import { supabase } from "../../lib/supabaseClient";


export default function HomePage() {
  const { currentBabyId } = useBaby();
  const [showForm, setShowForm] = useState(false);
  const [currentFormPage, setCurrentFormPage] = useState<FormPage | null>(null);

  // Map form pages to their corresponding database tables
  const getTableName = (page: FormPage): string => {
    const tableMap: Record<FormPage, string> = {
      meal: 'meals',
      diaper: 'diapers',
      activity: 'activities',
      bath: 'baths',
      weight: 'weights',
      measure: 'measures'
    };
    return tableMap[page];
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!currentBabyId || !currentFormPage) return;

    try {
      const tableName = getTableName(currentFormPage);
      const { error } = await supabase
        .from(tableName)
        .insert([{ ...formData, baby_id: currentBabyId }]);

      if (error) {
        console.error("Error adding entry:", error);
      } else {
        console.log("Entry added successfully");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleActionButtonClick = (page: FormPage) => {
    setCurrentFormPage(page);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentFormPage(null);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Bloc 1 : Infos récentes */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Dernières infos</h2>
        <div className="space-y-2">
          <InfoRow title="Dernier repas" value="Biberon 180ml à 14h30" />
          <InfoRow title="Dernière couche" value="Caca à 13h50" />
          <InfoRow title="Dernier bain" value="Hier à 18h00" />
        </div>
      </div>

      {/* Bloc 2 : Boutons Ajouter */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Ajouter</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <ActionButton icon={<Utensils />} label="Repas" onClick={() => handleActionButtonClick("meal")} />
          <ActionButton icon={<Baby />} label="Couche" onClick={() => handleActionButtonClick("diaper")} />
          <ActionButton icon={<Activity />} label="Activité" onClick={() => handleActionButtonClick("activity")} />
          <ActionButton icon={<Bath />} label="Bain" onClick={() => handleActionButtonClick("bath")} />
          <ActionButton icon={<Ruler />} label="Mesure" onClick={() => handleActionButtonClick("measure")} />
          <ActionButton icon={<Scale />} label="Pesée" onClick={() => handleActionButtonClick("weight")} />
        </div>
      </div>

      {/* Bloc 3 : Infos pratiques */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Infos pratiques</h2>
        <p className="text-gray-600 text-sm">
          Ici vous retrouverez bientôt des liens utiles, conseils, et ressources pour vous accompagner 📚.
        </p>
      </div>
      {/* Bloc 4 : Gestion des bébés */}
      <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Gestion des bébés</h2>
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-500 text-white rounded-xl p-3">Créer un carnet</button>
            <button className="flex-1 bg-green-500 text-white rounded-xl p-3">Ajouter un carnet</button>
            <button className="flex-1 bg-purple-500 text-white rounded-xl p-3">Partager un carnet</button>
          </div>
      </div>
      {/* Form Modal */}
      {showForm && currentFormPage && (
        <UnifiedForm
          page={currentFormPage}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: JSX.Element; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center min-w-[80px] bg-gray-100 rounded-xl p-3 hover:bg-gray-200"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

function InfoRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b pb-1">
      <span className="text-gray-600">{title}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
