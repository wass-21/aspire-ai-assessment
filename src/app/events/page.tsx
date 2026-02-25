"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { EventRow, fetchEvents } from "@/src/lib/events";

export default function EventsPage() {
  const { loading } = useAuth(true);

  const [items, setItems] = useState<EventRow[]>([]);
  const [search, setSearch] = useState("");
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (q?: string) => {
    try {
      setError(null);
      setLoadingItems(true);
      const data = await fetchEvents(q);
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold dark:text-zinc-100">Events</h1>
        <Link
          href="/events/new"
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          Create event
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Search by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          onClick={() => load(search)}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            load("");
          }}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950">
          {error}
        </div>
      )}

      <div className="rounded-xl border dark:border-zinc-700">
        <div className="border-b px-4 py-3 text-sm text-gray-600 dark:border-zinc-700 dark:text-zinc-400">
          {loadingItems ? "Loading events..." : `${items.length} event(s)`}
        </div>

        {!loadingItems && items.length === 0 ? (
          <div className="p-4 text-sm text-gray-600 dark:text-zinc-400">
            No events found.
          </div>
        ) : (
          <ul className="divide-y dark:divide-zinc-700">
            {items.map((ev) => (
              <li
                key={ev.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div>
                  <div className="font-medium dark:text-zinc-100">{ev.title}</div>
                  <div className="text-sm text-gray-600 dark:text-zinc-400">
                    {new Date(ev.start_time).toLocaleString()} →{" "}
                    {new Date(ev.end_time).toLocaleString()}
                  </div>
                  {ev.location && (
                    <div className="text-sm text-gray-600 dark:text-zinc-400">
                      {ev.location}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
                    Status: {ev.status}
                  </div>
                </div>

                <Link
                  href={`/events/${ev.id}`}
                  className="text-sm underline dark:text-zinc-300"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
