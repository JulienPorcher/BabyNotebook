import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useBaby } from "../../context/BabyContext";
import UnifiedForm from "../forms/UnifiedForm";

const logTypeConfig = {
  meal: {
    title: "Repas",
    table: "meals",
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

type LogEntry<T extends LogType> = {
  id: string;
  date: string;
  type: T;
  quantity: typeof logTypeConfig[T]["quantityType"];
  comment?: string;
};

type BabyLogPageProps = {
  page: LogType; // "meal" | "diaper" | "bath"
};



export default function BabyLogPage({ page }: BabyLogPageProps) {
  const { currentBabyId } = useBaby();
  const [logs, setLogs] = useState<LogEntry<typeof page>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Nom humain
  const title = logTypeConfig[page].title;

  // Table cible
  const table = logTypeConfig[page].table;

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("baby_id", currentBabyId)
        .order("date", { ascending: false })
        .limit(10);

      if (error) {
        console.error(error);
      } else {
        setLogs(data as LogEntry<typeof page>[]);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [currentBabyId, page]);

  async function handleFormSubmit(formData: Record<string, any>) {
    if (!currentBabyId) return;

    try {
      const { error } = await supabase
        .from(table)
        .insert([{ ...formData, baby_id: currentBabyId }]);

      if (error) {
        console.error("Error adding log:", error);
      } else {
        // Refresh the logs list
        const { data, error: fetchError } = await supabase
          .from(table)
          .select("*")
          .eq("baby_id", currentBabyId)
          .order("date", { ascending: false })
          .limit(10);

        if (!fetchError) {
          setLogs(data as LogEntry<typeof page>[]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div>
      {/* Titre + bouton ajouter */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </div>

      {/* Stats (placeholder ici, mais calculées en DB) */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-gray-100 rounded text-center">Stat 1</div>
        <div className="p-2 bg-gray-100 rounded text-center">Stat 2</div>
        <div className="p-2 bg-gray-100 rounded text-center">Stat 3</div>
      </div>

      {/* Tableau des logs */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Quantité</th>
              <th className="border px-2 py-1">Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border px-2 py-1">
                  {new Date(log.date).toLocaleString()}
                </td>
                <td className="border px-2 py-1">{log.type}</td>
                <td className="border px-2 py-1">{log.quantity ?? "-"}</td>
                <td className="border px-2 py-1">{log.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
          page={page}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
