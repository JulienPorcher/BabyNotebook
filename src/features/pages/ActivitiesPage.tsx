import { useState } from "react";
import { PlusCircle, Edit3 } from "lucide-react";
import UnifiedForm from "../forms/UnifiedForm";
import { useBaby } from "../../context/BabyContext";
import { supabase } from "../../lib/supabaseClient";

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

      {/* Liste activités */}
      <div className="space-y-3">
        <ActivityItem
          date="25/08/2025"
          title="Sortie au parc"
          description="Bébé a joué sur le toboggan..."
        />
        <ActivityItem
          date="24/08/2025"
          title="Peinture"
          description="Découverte des couleurs avec les doigts."
        />
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

function ActivityItem({
  date,
  title,
  description,
}: {
  date: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="text-xs text-gray-500">{date}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600 truncate">{description}</p>
    </div>
  );
}