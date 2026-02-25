"use client";

import Link from "next/link";
import { useAuth } from "@/src/lib/useAuth";

export default function EventsHome() {
  const { loading } = useAuth(true);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-zinc-100">Events</h1>
        <Link
          href="/events/new"
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          Create event
        </Link>
      </div>

      <div className="rounded-xl border p-4 text-sm text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        Next: list events + search + invitations + AI event creation.
      </div>
    </div>
  );
}
