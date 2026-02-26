"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { EventRow, fetchEventById, updateEvent } from "@/src/lib/events";
import PageContainer from "@/src/components/PageContainer";
import { useToast } from "@/src/components/Toast";
import { CardSkeleton, Spinner } from "@/src/components/skeletons";

type EventStatus = "upcoming" | "attending" | "maybe" | "declined";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, user } = useAuth(true);
  const userId = user?.id ?? null;
  const toast = useToast();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<EventStatus>("upcoming");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoadingEvent(true);
      try {
        const e = await fetchEventById(id);
        setEvent(e);
        setTitle(e?.title ?? "");
        setLocation(e?.location ?? "");
        setStartTime(
          e ? new Date(e.start_time).toISOString().slice(0, 16) : ""
        );
        setEndTime(e ? new Date(e.end_time).toISOString().slice(0, 16) : "");
        setStatus((e?.status as EventStatus) ?? "upcoming");
        setDescription(e?.description ?? "");
      } finally {
        setLoadingEvent(false);
      }
    };

    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, id]);

  const canManage = !!event && !!userId && event.owner_id === userId;

  const onSave = async () => {
    if (!event || !canManage || !id) return;
    if (!title.trim() || !startTime || !endTime) {
      toast.show("Title, start time, and end time are required", "error");
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      toast.show("End time must be after start time", "error");
      return;
    }

    setSaving(true);
    try {
      await updateEvent(event.id, {
        title: title.trim(),
        location: location.trim() || null,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        status,
        description: description.trim() || null,
      });

      toast.show("Event saved.");
      router.push(`/events/${event.id}`);
    } catch (e: unknown) {
      toast.show(e instanceof Error ? e.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingEvent) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <CardSkeleton lines={6} />
        </PageContainer>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <p className="text-zinc-600 dark:text-zinc-400">Event not found.</p>
        </PageContainer>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <div className="space-y-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You do not have permission.
            </p>
            <Link
              href={`/events/${id}`}
              className="text-sm font-medium text-zinc-600 underline dark:text-zinc-300"
            >
              Back
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <PageContainer>
        <div className="max-w-xl space-y-4">
          <Link
            href={`/events/${id}`}
            className="text-sm font-medium text-zinc-600 underline dark:text-zinc-300"
          >
            ← Back
          </Link>

          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Edit event
          </h1>

          <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:p-6">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Location
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Start time
                </label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  End time
                </label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
              >
                <option value="upcoming">upcoming</option>
                <option value="attending">attending</option>
                <option value="maybe">maybe</option>
                <option value="declined">declined</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <textarea
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              {saving ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
