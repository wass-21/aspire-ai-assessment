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

export async function fetchEvents(
  search?: string,
  startDate?: string,
  endDate?: string
): Promise<EventRow[]> {
  const user = await supabase.auth.getUser();
  const email = user.data.user?.email?.toLowerCase();
  const userId = user.data.user?.id;

  if (!userId) return [];

  // Fetch accepted invitations for this email (if any)
  const { data: invites, error: e2 } = await supabase
    .from("event_invitations")
    .select("event_id")
    .eq("invitee_email", email ?? "")
    .eq("status", "accepted");

  if (e2) throw e2;

  const invitedIds = invites?.map((i) => i.event_id) ?? [];

  // Events: owned by user OR id in accepted-invitation list
  const ownerOrInvited =
    invitedIds.length > 0
      ? `owner_id.eq.${userId},id.in.(${invitedIds.join(",")})`
      : `owner_id.eq.${userId}`;

  let query = supabase
    .from("events")
    .select(
      "id,owner_id,title,start_time,end_time,location,description,status,created_at"
    )
    .or(ownerOrInvited)
    .order("start_time", { ascending: true });

  // text search
  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(`title.ilike.%${s}%,location.ilike.%${s}%`);
  }

  // start date filter
  if (startDate) {
    query = query.gte("start_time", new Date(startDate).toISOString());
  }

  // end date filter
  if (endDate) {
    query = query.lte("start_time", new Date(endDate).toISOString());
  }

  const { data, error } = await query;

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

export async function updateEvent(
  id: string,
  updates: Partial<
    Pick<
      EventRow,
      | "title"
      | "start_time"
      | "end_time"
      | "location"
      | "description"
      | "status"
    >
  >
) {
  const { error } = await supabase.from("events").update(updates).eq("id", id);
  if (error) throw error;
}
