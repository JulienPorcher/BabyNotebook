import { supabase } from "../lib/supabaseClient";

export async function addMeal(babyId: string, { date, quantity, comment }: { date: string; quantity: number; comment?: string }) {
  return supabase.from("meals").insert([{ baby_id: babyId, date, quantity, comment }]);
}

export async function addDiaper(babyId: string, { date, type, comment }: { date: string; type: string; comment?: string }) {
  return supabase.from("diapers").insert([{ baby_id: babyId, date, type, comment }]);
}

export async function addBath(babyId: string, { date, comment }: { date: string; comment?: string }) {
  return supabase.from("baths").insert([{ baby_id: babyId, date, comment }]);
}
