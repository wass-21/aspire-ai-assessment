"use client";

import Link from "next/link";
import { useAuth } from "@/src/lib/useAuth";

const STAFF_ROLES = ["admin", "librarian"];

function canAddBook(role: string): boolean {
  return STAFF_ROLES.includes(role.toLowerCase());
}

export default function LibraryBooksPage() {
  const { role, loading, error } = useAuth();
  const showAddBook = canAddBook(role);

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
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Library
          </Link>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Books
          </h1>
        </div>
        {showAddBook && (
          <button
            type="button"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add book
          </button>
        )}
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Book list will go here.
          </p>
        </div>
      </main>
    </div>
  );
}
