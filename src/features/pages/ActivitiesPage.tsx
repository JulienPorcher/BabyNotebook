import { useState } from "react";
import { PlusCircle, Edit3 } from "lucide-react";
import UnifiedForm from "../forms/UnifiedForm";
import { useBaby } from "../../context/BabyContext";
import { supabase } from "../../lib/supabaseClient";
import ActivitiesCalendar from "../../components/ActivitiesCalendar";

export default function ActivitiesPage() {
  const [showForm, setShowForm] = useState(false);
  const { currentBabyId } = useBaby();

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!currentBabyId) return;

    try {
      const { error } = await supabase
        .from("activities")
        .insert([{ ...formData, baby_id: currentBabyId }]);

      if (error) {
        console.error("Error adding activity:", error);
      } else {
        console.log("Activity added successfully");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Calendar View */}
      {currentBabyId && (
        <ActivitiesCalendar babyId={currentBabyId} />
      )}

      {/* Boutons Ajouter/Modifier */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-xl"
        >
          <PlusCircle size={18} /> Ajouter
        </button>
        <button className="flex items-center gap-2 bg-gray-200 px-3 py-2 rounded-xl">
          <Edit3 size={18} /> Modifier
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <UnifiedForm
          page="activity"
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}