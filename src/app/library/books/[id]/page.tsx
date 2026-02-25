"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { Book, fetchBookById, deleteBook } from "@/src/lib/books";
import {
  fetchActiveBorrow,
  checkoutBook,
  returnBook,
  type BorrowRow,
} from "@/src/lib/borrows";

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, role, user } = useAuth(true);
  const userId = user?.id ?? null;

  const [book, setBook] = useState<Book | null>(null);
  const [activeBorrow, setActiveBorrow] = useState<BorrowRow | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = role === "admin" || role === "librarian";
  const isBorrower =
    activeBorrow !== null && userId !== null && activeBorrow.borrowed_by === userId;

  const load = async () => {
    if (!id) return;
    try {
      setError(null);
      setLoadingBook(true);
      const b = await fetchBookById(id);
      setBook(b);
      if (b) {
        const ab = await fetchActiveBorrow(b.id);
        setActiveBorrow(ab);
      } else {
        setActiveBorrow(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load book");
    } finally {
      setLoadingBook(false);
    }
  };

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, id]);

  const onDelete = async () => {
    if (!book) return;
    if (!canManage) return;

    const ok = confirm("Delete this book?");
    if (!ok) return;

    try {
      await deleteBook(book.id);
      router.push("/library/books");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/library/books"
          className="text-sm underline dark:text-zinc-300"
        >
          ← Back to books
        </Link>

        {canManage && book && (
          <div className="flex gap-2">
            <Link
              href={`/library/books/${book.id}/edit`}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950">
          {error}
        </div>
      )}

      {loadingBook ? (
        <div className="rounded-xl border p-4 dark:border-zinc-700">
          Loading book...
        </div>
      ) : !book ? (
        <div className="rounded-xl border p-4 dark:border-zinc-700">
          Book not found.
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <h1 className="text-2xl font-semibold dark:text-zinc-100">
            {book.title}
          </h1>
          <p className="text-gray-700 dark:text-zinc-300">{book.author}</p>

          <div className="text-sm text-gray-600 dark:text-zinc-400">
            Status:{" "}
            <span className="font-medium">
              {book.status === "available" ? "Available" : "Borrowed"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3">
            {book.status === "available" && userId && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await checkoutBook(book.id, userId);
                    await load();
                  } catch (e: unknown) {
                    alert(
                      e instanceof Error ? e.message : "Failed to check out"
                    );
                  }
                }}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Check out
              </button>
            )}

            {book.status === "borrowed" &&
              activeBorrow &&
              (isBorrower || canManage) && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await returnBook(book.id, activeBorrow.id);
                      await load();
                    } catch (e: unknown) {
                      alert(
                        e instanceof Error ? e.message : "Failed to return"
                      );
                    }
                  }}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  Return
                </button>
              )}

            {book.status === "borrowed" && activeBorrow && (
              <div className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
                Borrowed by:{" "}
                <span className="ml-1 font-medium">
                  {activeBorrow.borrowed_by}
                </span>
              </div>
            )}
          </div>

          {book.isbn && (
            <div className="text-sm text-gray-600 dark:text-zinc-400">
              ISBN: {book.isbn}
            </div>
          )}

          {book.tags && book.tags.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-zinc-400">
              Tags:{" "}
              <span className="font-medium">{book.tags.join(", ")}</span>
            </div>
          )}

          {book.summary && (
            <div className="pt-2">
              <div className="text-sm font-medium dark:text-zinc-300">
                Summary
              </div>
              <p className="mt-1 text-sm text-gray-700 dark:text-zinc-400">
                {book.summary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
