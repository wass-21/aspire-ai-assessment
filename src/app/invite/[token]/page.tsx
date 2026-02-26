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
import PageContainer from "@/src/components/PageContainer";
import { InvitationStatusBadge } from "@/src/components/StatusBadge";
import { useToast } from "@/src/components/Toast";
import { CardSkeleton, Spinner } from "@/src/components/skeletons";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { loading } = useAuth(true);
  const toast = useToast();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <CardSkeleton lines={4} />
        </PageContainer>
      </div>
    );
  }
  if (!inv) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Invalid invitation token.
              </p>
            )}
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <PageContainer>
        <div className="max-w-xl space-y-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Event Invitation
          </h1>

          {event && (
            <div className="space-y-1 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:p-6">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {event.title}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(event.start_time).toLocaleString()} →{" "}
                {new Date(event.end_time).toLocaleString()}
              </div>
              {event.location && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {event.location}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-600 dark:text-zinc-400">
                Invitee:{" "}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {inv.invitee_email}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-600 dark:text-zinc-400">Status:</span>
              <InvitationStatusBadge status={inv.status} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || inv.status !== "pending"}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
              onClick={async () => {
                setBusy(true);
                try {
                  await updateInvitationStatus(inv.id, "accepted");
                  await load();
                  toast.show("Invitation accepted.");
                  router.push("/events");
                } catch (e: unknown) {
                  toast.show(
                    e instanceof Error ? e.message : "Failed to accept",
                    "error"
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Accepting…
                </>
              ) : (
                "Accept"
              )}
            </button>

            <button
              type="button"
              disabled={busy || inv.status !== "pending"}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
              onClick={async () => {
                setBusy(true);
                try {
                  await updateInvitationStatus(inv.id, "declined");
                  await load();
                  toast.show("Invitation declined.");
                  router.push("/events");
                } catch (e: unknown) {
                  toast.show(
                    e instanceof Error ? e.message : "Failed to decline",
                    "error"
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Declining…
                </>
              ) : (
                "Decline"
              )}
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
