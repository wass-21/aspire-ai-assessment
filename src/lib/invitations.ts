import { supabase } from "./supabaseClient";

export type InvitationRow = {
  id: string;
  event_id: string;
  inviter_id: string;
  invitee_email: string;
  token: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

function randomToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

export async function createInvitation(
  eventId: string,
  inviteeEmail: string,
  inviterId: string
) {
  const token = randomToken();
  const { error } = await supabase.from("event_invitations").insert({
    event_id: eventId,
    inviter_id: inviterId,
    invitee_email: inviteeEmail.trim().toLowerCase(),
    token,
    status: "pending",
  });
  if (error) throw error;
  return token;
}

export async function fetchInvitationsForEvent(
  eventId: string
): Promise<InvitationRow[]> {
  const { data, error } = await supabase
    .from("event_invitations")
    .select(
      "id,event_id,inviter_id,invitee_email,token,status,created_at"
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as InvitationRow[];
}

export async function fetchInvitationByToken(
  token: string
): Promise<InvitationRow | null> {
  const { data, error } = await supabase
    .from("event_invitations")
    .select(
      "id,event_id,inviter_id,invitee_email,token,status,created_at"
    )
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  return (data as InvitationRow) ?? null;
}

export async function updateInvitationStatus(
  id: string,
  status: "accepted" | "declined"
) {
  const { error } = await supabase
    .from("event_invitations")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
