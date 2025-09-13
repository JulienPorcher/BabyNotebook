import { useState } from "react";
import { Utensils, Baby, Activity, Bath, Ruler, Scale, Heart, HeartPlus, Milk } from "lucide-react";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedForm, { type FormPage } from "../forms/UnifiedForm";
import { useBaby } from "../../context/BabyContext";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import BabySelector from "../components/BabySelector";


export default function HomePage() {
  const { currentBabyId, babies, loading, setCurrentBabyId, refreshBabies } = useBaby();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [currentFormPage, setCurrentFormPage] = useState<FormPage | null>(null);

  // Map form pages to their corresponding database tables
  const getTableName = (page: FormPage): string => {
    const tableMap: Record<FormPage, string> = {
      meal: 'meals',
      bottle: 'bottles',
      pump: 'pumps',
      diaper: 'diapers',
      activity: 'activities',
      bath: 'baths',
      weight: 'weights',
      measure: 'measures',
      breast: 'breastfeeding',
      baby: 'babies'
    };
    return tableMap[page];
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!currentFormPage || !user?.id) return;

    try {
      const tableName = getTableName(currentFormPage);
      
      // For baby creation, add user_id and don't add baby_id (it's the baby being created)
      const insertData = currentFormPage === 'baby' 
        ? { ...formData, owner_id: user.id }
        : { ...formData, baby_id: currentBabyId, user_id: user.id };

      const { error } = await supabase
        .from(tableName)
        .insert([insertData]);

      if (error) {
        console.error("Error adding entry:", error);
      } else {
        console.log("Entry added successfully");
        // If it's a baby creation, refresh the baby list
        if (currentFormPage === 'baby') {
          console.log("Baby created successfully!");
          await refreshBabies();
        }
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

  const handleSelectBaby = (babyId: string) => {
    setCurrentBabyId(babyId);
  };

  const handleShareCarnet = () => {
    if (!currentBabyId) {
      alert("Veuillez sélectionner un carnet avant de le partager");
      return;
    }
    navigate("/share");
  };

  // Debug logging
  console.log('HomePage - babies:', babies);
  console.log('HomePage - loading:', loading);
  console.log('HomePage - user:', user);

  return (
    <div className="p-4 space-y-4">
      {/* Debug Test */}
      {/*<SupabaseTest />*/}
      
      {/* Baby Selector */}
      <BabySelector
        babies={babies}
        currentBabyId={currentBabyId}
        onSelectBaby={handleSelectBaby}
        loading={loading}
      />

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
          <ActionButton icon={<Milk />} label="Biberon" onClick={() => handleActionButtonClick("bottle")} />
          <ActionButton icon={<Utensils />} label="Solide" onClick={() => handleActionButtonClick("meal")} />
          <ActionButton icon={<Heart />} label="Allaitement" onClick={() => handleActionButtonClick("breast")} />
          <ActionButton icon={<HeartPlus />} label="Expression" onClick={() => handleActionButtonClick("pump")} />
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
          <h2 className="text-lg font-semibold mb-3">Gestion des Carnets</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => handleActionButtonClick("baby")}
              className="flex-1 bg-blue-500 text-white rounded-xl p-3"
            >
              Créer un carnet
            </button>
            <button className="flex-1 bg-green-500 text-white rounded-xl p-3">Ajouter un carnet</button>
            <button 
              onClick={handleShareCarnet}
              className="flex-1 bg-purple-500 text-white rounded-xl p-3"
            >
              Partager ce carnet
            </button>
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
