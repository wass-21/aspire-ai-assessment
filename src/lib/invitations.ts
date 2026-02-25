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
  const email = inviteeEmail.trim().toLowerCase();
  const token = randomToken();

  // Try to insert a new invite
  const { error } = await supabase.from("event_invitations").insert({
    event_id: eventId,
    inviter_id: inviterId,
    invitee_email: email,
    token,
    status: "pending",
  });

  // If it failed because the user was already invited, return the existing token
  if (error) {
    const msg = ((error as { message?: string })?.message ?? "").toLowerCase();
    const isDuplicate =
      msg.includes("duplicate") || msg.includes("unique");

    if (isDuplicate) {
      const { data: existing, error: e2 } = await supabase
        .from("event_invitations")
        .select("token,status")
        .eq("event_id", eventId)
        .eq("invitee_email", email)
        .maybeSingle();

      if (e2) throw e2;

      if (!existing?.token) throw error;

      // Optional: if previously declined, you can reset to pending (nice touch)
      // await supabase.from("event_invitations").update({ status: "pending" }).eq("event_id", eventId).eq("invitee_email", email);

      return {
        token: existing.token as string,
        alreadyInvited: true,
        status: existing.status as string,
      };
    }

    throw error;
  }

  return { token, alreadyInvited: false, status: "pending" };
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
