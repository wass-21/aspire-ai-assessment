"use client";

import Link from "next/link";
import { useAuth } from "@/src/lib/useAuth";
import PageContainer from "@/src/components/PageContainer";
import { PageSkeleton } from "@/src/components/skeletons";

export default function LibraryPage() {
  const { role, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <PageSkeleton />
        </PageContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <PageContainer>
        <div className="space-y-6">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            Library
          </h1>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Your role
            </p>
            <p className="mb-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {role}
            </p>
            <nav className="flex flex-wrap gap-2">
              <Link
                href="/library/books"
                className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
              >
                Browse books →
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
              >
                Events →
              </Link>
            </nav>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
