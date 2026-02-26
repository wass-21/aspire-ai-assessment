"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { Book, fetchBooks } from "@/src/lib/books";
import PageContainer from "@/src/components/PageContainer";
import { BookStatusBadge } from "@/src/components/StatusBadge";
import { ListSkeleton } from "@/src/components/skeletons";

export default function BooksPage() {
  const { loading, role } = useAuth(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (q?: string) => {
    try {
      setError(null);
      setLoadingBooks(true);
      const data = await fetchBooks(q);
      setBooks(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load books");
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            <ListSkeleton rows={6} />
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <PageContainer>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              Library · Books
            </h1>

            {(role === "admin" || role === "librarian") && (
              <Link
                href="/library/books/new"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Add book
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => load(search)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  load("");
                }}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Clear
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {loadingBooks ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  Loading books…
                </span>
              ) : (
                `${books.length} book(s)`
              )}
            </div>

            {!loadingBooks && books.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                No books found.
              </div>
            ) : loadingBooks ? (
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {[1, 2, 3, 4].map((i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                    <div className="h-4 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {books.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {b.title}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {b.author}
                      </div>
                      <div className="mt-2">
                        <BookStatusBadge
                          status={b.status === "available" ? "available" : "borrowed"}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/library/books/${b.id}`}
                      className="shrink-0 text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
