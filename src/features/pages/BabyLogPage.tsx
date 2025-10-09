import { useState } from "react";
import { useBaby } from "../../context/BabyContext";
import { type BabyData } from "../../context/BabyTypes";
import { useAuth } from "../../hooks/useAuth";
import UnifiedForm from "../forms/UnifiedForm";
import ScrollableStatsPanel from "../components/ScrollableStatsPanel";
import { getActivityConfig, type ActivityType } from "../../lib/activityConfig";


type BabyLogPageProps = {
  page: 'meal' | 'hygiene' | 'health' | 'calendar';
};



export default function BabyLogPage({ page }: BabyLogPageProps) {
  const { currentBabyId, addData } = useBaby();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedFormPage, setSelectedFormPage] = useState<ActivityType | null>(null);

  // Page effective (si un sous-formulaire est sélectionné)
  const effectivePage: ActivityType | null = selectedFormPage;

  // Map activity types to context data types
  const getDataTypeFromActivity = (activityType: ActivityType): keyof BabyData => {
    const dataTypeMap: Record<ActivityType, keyof BabyData> = {
      bottle: 'bottles',
      meal: 'meals',
      breast: 'breast',
      pump: 'pumps',
      diaper: 'diapers',
      bath: 'baths',
      weight: 'weights',
      measure: 'measures',
      activity: 'activities'
    };
    return dataTypeMap[activityType];
  };

  async function handleFormSubmit(formData: Record<string, any>) {
    if (!currentBabyId || !user?.id || !effectivePage) return;

    try {
      const dataType = getDataTypeFromActivity(effectivePage);
      console.log("Adding data via context:", dataType, formData);
      await addData(dataType, formData as any);
      console.log("Data added successfully via context");
      
      // Trigger refresh of ScrollableStatsPanel
      window.dispatchEvent(new CustomEvent('refreshStatsPanel'));
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
              activityType="bottle"
              onClick={() => { setSelectedFormPage("bottle"); setShowForm(true); }}
            />
            <SquareButton
              activityType="meal"
              onClick={() => { setSelectedFormPage("meal"); setShowForm(true); }}
            />
            <SquareButton
              activityType="breast"
              onClick={() => { setSelectedFormPage("breast"); setShowForm(true); }}
            />
            <SquareButton
              activityType="pump"
              onClick={() => { setSelectedFormPage("pump"); setShowForm(true); }}
            />
          </div>
        ) : page === "hygiene" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pb-2">
            <SquareButton
              activityType="diaper"
              onClick={() => { setSelectedFormPage("diaper"); setShowForm(true); }}
            />
            <SquareButton
              activityType="bath"
              onClick={() => { setSelectedFormPage("bath"); setShowForm(true); }}
            />
          </div>
        ) : page === "health" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pb-2">
            <SquareButton
              activityType="weight"
              onClick={() => { setSelectedFormPage("weight"); setShowForm(true); }}
            />
            <SquareButton
              activityType="measure"
              onClick={() => { setSelectedFormPage("measure"); setShowForm(true); }}
            />
          </div>
        ) : page === "calendar" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pb-2">
            <SquareButton
              activityType="activity"
              onClick={() => { setSelectedFormPage("activity"); setShowForm(true); }}
            />
          </div>
        ) : null}
      </div>

      {/* Stats et Tableau des logs - ScrollableStatsPanel */}
      {page !== "calendar" && <ScrollableStatsPanel tab={page} />}

      {/* Boutons supplémentaires */}
      <div className="flex gap-2 mt-4">
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">
          Modifier
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Commander {page === "meal" ? "des repas" : page === "hygiene" ? "des couches" : "du matériel"}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && effectivePage && (
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

function SquareButton({ activityType, onClick }: { activityType: ActivityType; onClick: () => void }) {
  const config = getActivityConfig(activityType);
  const IconComponent = config.icon;
  
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-full bg-gray-100 rounded-xl p-4 hover:bg-gray-200"
    >
      <IconComponent className="w-6 h-6" />
      <span className="text-xs mt-1">{config.title}</span>
    </button>
  );
}
