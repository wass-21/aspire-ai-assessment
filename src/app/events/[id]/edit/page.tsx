"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { EventRow, fetchEventById, updateEvent } from "@/src/lib/events";

type EventStatus = "upcoming" | "attending" | "maybe" | "declined";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, user } = useAuth(true);
  const userId = user?.id ?? null;

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
      alert("Title, start time, and end time are required");
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      alert("End time must be after start time");
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

      router.push(`/events/${event.id}`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (loadingEvent) return <div className="p-6">Loading event...</div>;
  if (!event) return <div className="p-6">Event not found.</div>;

  if (!canManage) {
    return (
      <div className="space-y-2 p-6">
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          You do not have permission.
        </p>
        <Link
          href={`/events/${id}`}
          className="text-sm underline dark:text-zinc-300"
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4 p-6">
      <Link
        href={`/events/${id}`}
        className="text-sm underline dark:text-zinc-300"
      >
        ← Back
      </Link>

      <h1 className="text-2xl font-semibold dark:text-zinc-100">
        Edit event
      </h1>

      <div className="space-y-3 rounded-xl border p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div>
          <label className="text-sm font-medium dark:text-zinc-300">Title</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium dark:text-zinc-300">
            Location
          </label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium dark:text-zinc-300">
              Start time
            </label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium dark:text-zinc-300">
              End time
            </label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium dark:text-zinc-300">
            Status
          </label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
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
          <label className="text-sm font-medium dark:text-zinc-300">
            Description
          </label>
          <textarea
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
