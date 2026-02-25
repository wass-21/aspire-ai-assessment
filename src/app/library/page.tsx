"use client";

import { useAuth } from "@/src/lib/useAuth";

export default function LibraryPage() {
  const { user, role, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading…
          </p>
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <main className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Library
        </h1>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              User ID
            </dt>
            <dd className="mt-0.5 break-all font-mono text-zinc-900 dark:text-zinc-100">
              {user?.id ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Role
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {role}
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
