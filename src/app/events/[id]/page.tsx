"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { EventRow, fetchEventById, deleteEvent } from "@/src/lib/events";
import {
  createInvitation,
  fetchInvitationsForEvent,
  type InvitationRow,
} from "@/src/lib/invitations";

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, user } = useAuth(true);
  const userId = user?.id ?? null;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<InvitationRow[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      setError(null);
      setLoadingEvent(true);
      const e = await fetchEventById(id);
      setEvent(e);
      if (e) {
        const list = await fetchInvitationsForEvent(e.id);
        setInvites(list);
      } else {
        setInvites([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoadingEvent(false);
    }
  };

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, id]);

  const canManage = !!event && !!userId && event.owner_id === userId;

  const onDelete = async () => {
    if (!event) return;
    if (!canManage) return;

    const ok = confirm("Delete this event?");
    if (!ok) return;

    try {
      await deleteEvent(event.id);
      router.push("/events");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="text-sm underline dark:text-zinc-300"
        >
          ← Back to events
        </Link>

        {canManage && event && (
          <div className="flex gap-2">
            <Link
              href={`/events/${event.id}/edit`}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950">
          {error}
        </div>
      )}

      {loadingEvent ? (
        <div className="rounded-xl border p-4 dark:border-zinc-700">
          Loading event...
        </div>
      ) : !event ? (
        <div className="rounded-xl border p-4 dark:border-zinc-700">
          Event not found.
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <h1 className="text-2xl font-semibold dark:text-zinc-100">
            {event.title}
          </h1>

          <div className="text-sm text-gray-600 dark:text-zinc-400">
            {new Date(event.start_time).toLocaleString()} →{" "}
            {new Date(event.end_time).toLocaleString()}
          </div>

          {event.location && (
            <div className="text-sm text-gray-700 dark:text-zinc-300">
              Location: {event.location}
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-zinc-500">
            Status: {event.status}
          </div>

          {event.description && (
            <div className="pt-2">
              <div className="text-sm font-medium dark:text-zinc-300">
                Description
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-zinc-400">
                {event.description}
              </p>
            </div>
          )}

          {canManage && (
            <div className="space-y-3 pt-4">
              <div className="text-sm font-medium dark:text-zinc-300">
                Invite people
              </div>

              <div className="flex gap-2">
                <input
                  className="w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                  placeholder="Invitee email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
                  onClick={async () => {
                    if (!event || !userId) return;
                    if (!inviteEmail.trim().includes("@")) {
                      alert("Please enter a valid email");
                      return;
                    }
                    try {
                      const token = await createInvitation(
                        event.id,
                        inviteEmail,
                        userId
                      );
                      setInviteEmail("");
                      await load();
                      const link = `${window.location.origin}/invite/${token}`;
                      alert(`Invitation link created:\n${link}`);
                    } catch (e: unknown) {
                      alert(
                        e instanceof Error ? e.message : "Failed to invite"
                      );
                    }
                  }}
                >
                  Invite
                </button>
              </div>

              <div className="rounded-xl border dark:border-zinc-600">
                <div className="border-b px-4 py-3 text-sm text-gray-600 dark:border-zinc-600 dark:text-zinc-400">
                  Invitations ({invites.length})
                </div>
                {invites.length === 0 ? (
                  <div className="p-4 text-sm text-gray-600 dark:text-zinc-400">
                    No invitations yet.
                  </div>
                ) : (
                  <ul className="divide-y dark:divide-zinc-600">
                    {invites.map((inv) => (
                      <li key={inv.id} className="p-4 text-sm">
                        <div className="font-medium dark:text-zinc-100">
                          {inv.invitee_email}
                        </div>
                        <div className="text-gray-600 dark:text-zinc-400">
                          Status: {inv.status}
                        </div>
                        <div className="mt-1">
                          <span className="text-gray-500 dark:text-zinc-500">
                            Link:
                          </span>{" "}
                          <span className="break-all">
                            {typeof window !== "undefined"
                              ? `${window.location.origin}/invite/${inv.token}`
                              : `/invite/${inv.token}`}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
