// src/components/AddEntryModal.tsx
import UnifiedForm from "../features/forms/UnifiedForm";
import { useBaby } from "../context/BabyContext";
import { addMeal, addDiaper, addBath } from "../services/babyLogsServices";


type AddEntryModalProps = {
  open: boolean;
  onClose: () => void;
  type: "meal" | "diaper" | "bath" | "measure" | "weight";
};

export default function AddEntryModal({ open, onClose, type }: AddEntryModalProps) {
  const { currentBabyId } = useBaby();
  if (!open) return null;

  async function handleSubmit(formData: any) {
    if (!currentBabyId) return;

    if (type === "meal") {
      await addMeal(currentBabyId, formData);
    } else if (type === "diaper") {
      await addDiaper(currentBabyId, formData);
    } else if (type === "bath") {
      await addBath(currentBabyId, formData);
    }

    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {type === "meal" && "Ajouter un repas"}
            {type === "diaper" && "Ajouter une couche"}
            {type === "bath" && "Ajouter un bain"}
            {type === "measure" && "Ajouter une mesure"}
            {type === "weight" && "Ajouter une pesée"}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">✕</button>
        </div>

        {/* Affichage dynamique du bon formulaire */}
        <UnifiedForm 
          page={type as any} 
          onSubmit={handleSubmit} 
          onClose={onClose} 
        />
      </div>
    </div>
  );
}
