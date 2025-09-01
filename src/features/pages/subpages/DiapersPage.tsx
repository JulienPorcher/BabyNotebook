import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import UnifiedForm from "../../forms/UnifiedForm";

type DiapersPageProps = {
  babyId: string;
};

export default function DiapersPage({ babyId }: DiapersPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function fetchDiapers() {
    const { data, error } = await supabase
      .from("diapers")
      .select("*")
      .eq("baby_id", babyId)
      .order("date", { ascending: false })
      .limit(10);

    if (!error) setData(data);
  }

  async function addDiaper(values: any) {
    const { error } = await supabase
      .from("diapers")
      .insert([{ ...values, baby_id: babyId }]);
    if (!error) fetchDiapers();
  }

  useEffect(() => {
    if (babyId) fetchDiapers();
  }, [babyId]);

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Fermer" : "Ajouter"}
      </button>

      {showForm && <UnifiedForm 
          page="diaper"
          onSubmit={addDiaper} 
          onClose={() => setShowForm(false)}
           />}

      <ul>
        {data.map((diaper) => (
          <li key={diaper.id}>
            {diaper.date} - {diaper.type} ({diaper.quantity}) {diaper.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}
