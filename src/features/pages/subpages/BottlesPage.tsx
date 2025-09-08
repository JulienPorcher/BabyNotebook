import { useState, useEffect } from "react";
import { PlusCircle, Edit3 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import UnifiedForm from "../../forms/UnifiedForm";
import StatCard from "../../../components/StatCard"

type BottlePageProps = {
  babyId: string;
};

export default function BottlePage({ babyId }: BottlePageProps) {
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function fetchBottles() {
    const { data, error } = await supabase
      .from("bottle")
      .select("*")
      .eq("baby_id", babyId)
      .order("date", { ascending: false })
      .limit(10);

    if (!error) setData(data);
  }

  async function addBottle(values: any) {
    const { error } = await supabase.from("bottle").insert([{ ...values, baby_id: babyId }]);
    if (!error) fetchBottles();
  }

  useEffect(() => {
    if (babyId) fetchBottles();
  }, [babyId]);

  return (
    <div className="p-4 space-y-6">
      {/* Sélecteur bébé */}
      <div>
        <label className="text-sm text-gray-600">Sélectionner un bébé :</label>
        <select className="w-full border rounded-xl p-2 mt-1">
          <option>Bébé 1</option>
          <option>Bébé 2</option>
        </select>
      </div>

      {/* Section Repas */}
      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Repas</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-xl"
          >
            <PlusCircle size={18} /> Ajouter
          </button>
        </div>

        {/* Stats repas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatCard label="Moyenne (ml)" value="170" />
          <StatCard label="Nb repas / jour" value="6" />
          <StatCard label="Dernier repas" value="14h30" />
        </div>

        {/* Tableau des repas */}
        <div>
          <h3 className="text-sm text-gray-500 mb-2">10 derniers repas</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th>Date</th>
                <th>Type</th>
                <th>Quantité</th>
              </tr>
            </thead>
            <tbody>
              {/* TODO: remplacer par données Supabase */}
              <tr className="border-b">
                <td>25/08 14:30</td>
                <td>Biberon</td>
                <td>180 ml</td>
              </tr>
              <tr className="border-b">
                <td>25/08 11:30</td>
                <td>Purée</td>
                <td>150 g</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button className="flex items-center gap-2 text-blue-600 mt-2">
          <Edit3 size={16} /> Modifier
        </button>

        {/* Bouton partenaire */}
        <div className="mt-4 bg-yellow-100 p-3 rounded-xl">
          <p className="text-sm mb-2">
            👶 Découvrez nos repas bio pour bébé ! Livraison rapide 🍎
          </p>
          <button className="bg-yellow-500 text-white rounded-xl px-3 py-2">
            En savoir plus
          </button>
        </div>
      </section>
    
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Fermer" : "Ajouter"}
      </button>

      {showForm && <UnifiedForm 
          page="bottle"
          onSubmit={addBottle} 
          onClose={() => setShowForm(false)}  />}

      <ul>
        {data.map((bottle) => (
          <li key={bottle.id}>
            {bottle.date} - {bottle.type} ({bottle.quantity}) {bottle.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}


