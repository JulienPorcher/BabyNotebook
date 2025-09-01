import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSupabaseTable<T>(table: string, babyId?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from(table).select("*").order("date", { ascending: false }).limit(10);

    if (babyId) query = query.eq("baby_id", babyId);

    const { data, error } = await query;
    if (error) console.error(error);
    else setData(data as T[]);

    setLoading(false);
  };

  const insertData = async (payload: Partial<T>) => {
    const { error } = await supabase.from(table).insert(payload);
    if (error) {
      console.error("Insert error:", error);
      return false;
    }
    fetchData(); // refresh après insertion
    return true;
  };

  useEffect(() => {
    fetchData();
  }, [babyId]);

  return { data, loading, insertData, fetchData };
}
