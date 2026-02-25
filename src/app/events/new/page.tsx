"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuth } from "@/src/lib/useAuth";

type EventStatus = "upcoming" | "attending" | "maybe" | "declined";

export default function NewEventPage() {
  const router = useRouter();
  const { loading, user } = useAuth(true);
  const userId = user?.id ?? null;

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<EventStatus>("upcoming");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const onSave = async () => {
    if (!userId) return;
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
      const { error } = await supabase.from("events").insert({
        owner_id: userId,
        title: title.trim(),
        location: location.trim() || null,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        status,
        description: description.trim() || null,
      });

      if (error) throw error;

      router.push("/events");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl space-y-4 p-6">
      <Link
        href="/events"
        className="text-sm underline dark:text-zinc-300"
      >
        ← Back
      </Link>

      <h1 className="text-2xl font-semibold dark:text-zinc-100">
        Create event
      </h1>

      <div className="space-y-2 rounded-xl border p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="text-sm font-medium dark:text-zinc-300">
          Create with AI
        </div>

        <textarea
          className="w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
          rows={3}
          placeholder="Example: Team meeting next Monday at 10am in conference room"
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
        />

        <button
          type="button"
          disabled={aiLoading || !aiText.trim()}
          onClick={async () => {
            setAiLoading(true);
            try {
              const res = await fetch("/api/ai/extract-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: aiText }),
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data?.error);

              setTitle(data.title ?? "");
              setLocation(data.location ?? "");
              setStartTime(data.start_time?.slice(0, 16) ?? "");
              setEndTime(data.end_time?.slice(0, 16) ?? "");
              setDescription(data.description ?? "");
            } catch (e: unknown) {
              alert(e instanceof Error ? e.message : "AI failed");
            } finally {
              setAiLoading(false);
            }
          }}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          {aiLoading ? "Extracting..." : "Extract event with AI"}
        </button>
      </div>

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
          {saving ? "Saving..." : "Create"}
        </button>
      </div>
    </div>
  );
}
