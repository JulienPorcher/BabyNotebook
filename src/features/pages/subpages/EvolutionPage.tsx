import { useState } from "react";
import { PlusCircle, Edit3 } from "lucide-react";
import UnifiedForm from "../../forms/UnifiedForm";

export default function EvolutionPage() {
  const [showBathForm, setShowBathForm] = useState(false);
  const [showMeasureForm, setShowMeasureForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);

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

      {/* Section Bain */}
      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Bain</h2>
          <button
            onClick={() => setShowBathForm(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-xl"
          >
            <PlusCircle size={18} /> Ajouter
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <StatCard label="Fréquence" value="Tous les 2 jours" />
          <StatCard label="Nb sur 7j" value="4" />
        </div>

        <button className="flex items-center gap-2 text-blue-600 mt-2">
          <Edit3 size={16} /> Modifier
        </button>
      </section>

      {/* Section Mesures */}
      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="text-lg font-semibold">Mesures</h2>
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">
            Dernière taille : 65 cm (12/08/2025)
          </p>
          <button
            onClick={() => setShowMeasureForm(true)}
            className="bg-green-500 text-white px-3 py-2 rounded-xl"
          >
            Ajouter
          </button>
        </div>

        <button className="flex items-center gap-2 text-green-600 mt-2">
          <Edit3 size={16} /> Modifier
        </button>

        <div className="mt-4">
          <h3 className="text-sm text-gray-500">Évolution de la taille</h3>
          <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center">
            📊 Graphique taille (à faire)
          </div>
        </div>
      </section>

      {/* Section Poids */}
      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="text-lg font-semibold">Pesée</h2>
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">
            Dernier poids : 7,2 kg (12/08/2025)
          </p>
          <button
            onClick={() => setShowWeightForm(true)}
            className="bg-purple-500 text-white px-3 py-2 rounded-xl"
          >
            Ajouter
          </button>
        </div>

        <button className="flex items-center gap-2 text-purple-600 mt-2">
          <Edit3 size={16} /> Modifier
        </button>

        <div className="mt-4">
          <h3 className="text-sm text-gray-500">Évolution du poids</h3>
          <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center">
            📊 Graphique poids (à faire)
          </div>
        </div>
      </section>

      {/* Forms */}
      {showBathForm && (
        <UnifiedForm 
          page="bath"
          onSubmit={(data) => {
            console.log('Bath data:', data);
            setShowBathForm(false);
          }}
          onClose={() => setShowBathForm(false)}
        />
      )}

      {showMeasureForm && (
        <UnifiedForm 
          page="measure"
          onSubmit={(data) => {
            console.log('Measure data:', data);
            setShowMeasureForm(false);
          }}
          onClose={() => setShowMeasureForm(false)}
        />
      )}

      {showWeightForm && (
        <UnifiedForm 
          page="weight"
          onSubmit={(data) => {
            console.log('Weight data:', data);
            setShowWeightForm(false);
          }}
          onClose={() => setShowWeightForm(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-100 rounded-xl p-2">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
