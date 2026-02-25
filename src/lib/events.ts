import { supabase } from "./supabaseClient";

export type EventRow = {
  id: string;
  owner_id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  description: string | null;
  status: "upcoming" | "attending" | "maybe" | "declined";
  created_at: string;
};

export async function fetchEvents(search?: string): Promise<EventRow[]> {
  let q = supabase
    .from("events")
    .select(
      "id,owner_id,title,start_time,end_time,location,description,status,created_at"
    )
    .order("start_time", { ascending: true });

  if (search && search.trim()) {
    const s = search.trim();
    q = q.or(`title.ilike.%${s}%,location.ilike.%${s}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function fetchEventById(id: string): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from("events")
    .select(
      "id,owner_id,title,start_time,end_time,location,description,status,created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as EventRow) ?? null;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
