"use client";

import Link from "next/link";
import { useAuth } from "@/src/lib/useAuth";

export default function LibraryPage() {
  const { role, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Library
        </h1>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Your role
            </p>
            <p className="mb-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {role}
            </p>
            <nav className="space-y-2">
              <Link
                href="/library/books"
                className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
              >
                Browse books →
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
