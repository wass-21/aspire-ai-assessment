"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { supabase } from "@/src/lib/supabaseClient";
import { EventRow, fetchEventById, deleteEvent } from "@/src/lib/events";
import {
  createInvitation,
  fetchInvitationsForEvent,
  type InvitationRow,
} from "@/src/lib/invitations";
import PageContainer from "@/src/components/PageContainer";
import ConfirmModal from "@/src/components/ConfirmModal";
import { EventStatusBadge, InvitationStatusBadge } from "@/src/components/StatusBadge";
import { useToast } from "@/src/components/Toast";
import { CardSkeleton } from "@/src/components/skeletons";

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, user } = useAuth(true);
  const userId = user?.id ?? null;
  const toast = useToast();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [myEmail, setMyEmail] = useState<string>("");
  const [invites, setInvites] = useState<InvitationRow[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

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
    const loadMe = async () => {
      const { data } = await supabase.auth.getUser();
      setMyEmail((data.user?.email ?? "").toLowerCase());
    };
    if (!loading) {
      loadMe();
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, id]);

  const canManage = !!event && !!userId && event.owner_id === userId;

  const onDelete = async () => {
    if (!event) return;
    if (!canManage) return;
    setDeleteModalOpen(false);
    try {
      await deleteEvent(event.id);
      toast.show("Event deleted.");
      router.push("/events");
    } catch (e: unknown) {
      toast.show(e instanceof Error ? e.message : "Failed to delete", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <CardSkeleton lines={5} />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <PageContainer>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/events"
              className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              ← Back to events
            </Link>

            {canManage && event && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <ConfirmModal
            open={deleteModalOpen}
            title="Delete event"
            message="Are you sure you want to delete this event? This cannot be undone."
            confirmLabel="Delete"
            onConfirm={onDelete}
            onCancel={() => setDeleteModalOpen(false)}
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950">
              {error}
            </div>
          )}

          {loadingEvent ? (
            <CardSkeleton lines={6} />
          ) : !event ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">Event not found.</p>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                {event.title}
              </h1>

              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(event.start_time).toLocaleString()} →{" "}
                {new Date(event.end_time).toLocaleString()}
              </div>

              {event.location && (
                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                  Location: {event.location}
                </div>
              )}
              <div>
                <EventStatusBadge status={event.status} />
              </div>

              {event.description && (
                <div className="pt-2">
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                    {event.description}
                  </p>
                </div>
              )}

              {canManage && (
                <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Invite people
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                      placeholder="Invitee email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={inviteLoading}
                      className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
                      onClick={async () => {
                        if (!event || !userId) return;
                        if (!inviteEmail.trim().includes("@")) {
                          toast.show("Please enter a valid email", "error");
                          return;
                        }
                        const email = inviteEmail.trim().toLowerCase();
                        if (email === myEmail) {
                          toast.show("You cannot invite yourself.", "error");
                          return;
                        }
                        setInviteLoading(true);
                        try {
                          const result = await createInvitation(
                            event.id,
                            email,
                            userId
                          );
                          setInviteEmail("");
                          await load();
                          const link = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${result.token}`;
                          if (result.alreadyInvited) {
                            toast.show(
                              `Already invited (${result.status}). Link: ${link}`,
                              "info"
                            );
                          } else {
                            toast.show(`Invitation sent. Link: ${link}`, "success");
                          }
                        } catch (e: unknown) {
                          toast.show(
                            e instanceof Error ? e.message : "Failed to invite",
                            "error"
                          );
                        } finally {
                          setInviteLoading(false);
                        }
                      }}
                    >
                      {inviteLoading ? "Sending…" : "Invite"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-600">
                    <div className="border-b border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
                      Invitations ({invites.length})
                    </div>
                    {invites.length === 0 ? (
                      <div className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                        No invitations yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-zinc-200 dark:divide-zinc-600">
                        {invites.map((inv) => (
                          <li
                            key={inv.id}
                            className="flex flex-col gap-1 p-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"
                          >
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                              {inv.invitee_email}
                            </div>
                            <InvitationStatusBadge status={inv.status} />
                            <div className="mt-1 w-full sm:mt-0 sm:w-auto">
                              <span className="text-zinc-500 dark:text-zinc-500">
                                Link:{" "}
                              </span>
                              <span className="break-all font-mono text-xs">
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
      </PageContainer>
    </div>
  );
}
