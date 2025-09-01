// src/components/BabySelector.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useBaby } from "../context/BabyContext";

type Baby = {
  id: string;
  name: string;
};

export default function BabySelector() {
  const { currentBabyId, setCurrentBabyId } = useBaby();
  const [babies, setBabies] = useState<Baby[]>([]);

  useEffect(() => {
    async function fetchBabies() {
      const { data, error } = await supabase.from("babies").select("id, name");
      if (error) {
        console.error(error);
      } else {
        setBabies(data || []);
        if (!currentBabyId && data?.length) {
          setCurrentBabyId(data[0].id); // si aucun bébé choisi, on prend le premier
        }
      }
    }
    fetchBabies();
  }, []);

  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-600 mb-1">Sélectionnez un bébé :</label>
      <select
        value={currentBabyId ?? ""}
        onChange={(e) => setCurrentBabyId(e.target.value)}
        className="w-full border rounded px-2 py-1"
      >
        {babies.map((baby) => (
          <option key={baby.id} value={baby.id}>
            {baby.name}
          </option>
        ))}
      </select>
    </div>
  );
}