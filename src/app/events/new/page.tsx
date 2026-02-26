"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuth } from "@/src/lib/useAuth";
import PageContainer from "@/src/components/PageContainer";
import { useToast } from "@/src/components/Toast";
import { CardSkeleton, Spinner } from "@/src/components/skeletons";

type EventStatus = "upcoming" | "attending" | "maybe" | "declined";

export default function NewEventPage() {
  const router = useRouter();
  const { loading, user } = useAuth(true);
  const userId = user?.id ?? null;
  const toast = useToast();

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
      toast.show("Title, start time, and end time are required", "error");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      toast.show("End time must be after start time", "error");
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

      toast.show("Event created.");
      router.push("/events");
    } catch (e: unknown) {
      toast.show(
        e instanceof Error ? e.message : "Failed to create event",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <CardSkeleton lines={6} />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <PageContainer>
        <div className="max-w-xl space-y-4">
          <Link
            href="/events"
            className="text-sm font-medium text-zinc-600 underline dark:text-zinc-300"
          >
            ← Back
          </Link>

          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Create event
          </h1>

          <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:p-6">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Create with AI
            </div>

            <textarea
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
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
                  toast.show("Event details extracted.");
                } catch (e: unknown) {
                  toast.show(
                    e instanceof Error ? e.message : "AI failed",
                    "error"
                  );
                } finally {
                  setAiLoading(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              {aiLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Extracting…
                </>
              ) : (
                "Extract event with AI"
              )}
            </button>
          </div>

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
                "Create"
              )}
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
