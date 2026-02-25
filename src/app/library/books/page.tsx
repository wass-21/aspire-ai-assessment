"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { Book, fetchBooks } from "@/src/lib/books";

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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Library · Books</h1>

        {(role === "admin" || role === "librarian") && (
          <Link
            href="/library/books/new"
            className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
          >
            Add book
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or author..."
          className="w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
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
          {loadingBooks ? "Loading books..." : `${books.length} book(s)`}
        </div>

        {!loadingBooks && books.length === 0 ? (
          <div className="p-4 text-sm text-gray-600 dark:text-zinc-400">
            No books found.
          </div>
        ) : (
          <ul className="divide-y dark:divide-zinc-700">
            {books.map((b) => (
              <li
                key={b.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div>
                  <div className="font-medium dark:text-zinc-100">{b.title}</div>
                  <div className="text-sm text-gray-600 dark:text-zinc-400">
                    {b.author}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-zinc-500">
                    Status:{" "}
                    <span className="font-medium">
                      {b.status === "available" ? "Available" : "Borrowed"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/library/books/${b.id}`}
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
