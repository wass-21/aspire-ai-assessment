"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/useAuth";
import {
  fetchInvitationByToken,
  updateInvitationStatus,
  type InvitationRow,
} from "@/src/lib/invitations";
import { fetchEventById, type EventRow } from "@/src/lib/events";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { loading } = useAuth(true);

  const [inv, setInv] = useState<InvitationRow | null>(null);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    try {
      const i = await fetchInvitationByToken(token);
      setInv(i);
      if (i?.event_id) {
        const e = await fetchEventById(i.event_id);
        setEvent(e);
      } else {
        setEvent(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load invitation");
    }
  };

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!inv) {
    return (
      <div className="p-6">
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Invalid invitation token.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold dark:text-zinc-100">
        Event Invitation
      </h1>

      {event && (
        <div className="space-y-1 rounded-xl border p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="font-medium dark:text-zinc-100">{event.title}</div>
          <div className="text-sm text-gray-600 dark:text-zinc-400">
            {new Date(event.start_time).toLocaleString()} →{" "}
            {new Date(event.end_time).toLocaleString()}
          </div>
          {event.location && (
            <div className="text-sm dark:text-zinc-300">{event.location}</div>
          )}
        </div>
      )}

      <div className="space-y-2 rounded-xl border p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div>
          Invitee:{" "}
          <span className="font-medium dark:text-zinc-100">
            {inv.invitee_email}
          </span>
        </div>
        <div>
          Status:{" "}
          <span className="font-medium dark:text-zinc-100">{inv.status}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy || inv.status !== "pending"}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
          onClick={async () => {
            setBusy(true);
            try {
              await updateInvitationStatus(inv.id, "accepted");
              await load();
              router.push("/events");
            } catch (e: unknown) {
              alert(e instanceof Error ? e.message : "Failed to accept");
            } finally {
              setBusy(false);
            }
          }}
        >
          Accept
        </button>

        <button
          type="button"
          disabled={busy || inv.status !== "pending"}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
          onClick={async () => {
            setBusy(true);
            try {
              await updateInvitationStatus(inv.id, "declined");
              await load();
              router.push("/events");
            } catch (e: unknown) {
              alert(e instanceof Error ? e.message : "Failed to decline");
            } finally {
              setBusy(false);
            }
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
