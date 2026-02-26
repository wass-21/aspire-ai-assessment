"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { Book, fetchBookById, deleteBook, updateBook } from "@/src/lib/books";
import {
  fetchActiveBorrow,
  checkoutBook,
  returnBook,
  type BorrowRow,
} from "@/src/lib/borrows";
import PageContainer from "@/src/components/PageContainer";
import ConfirmModal from "@/src/components/ConfirmModal";
import { BookStatusBadge } from "@/src/components/StatusBadge";
import { useToast } from "@/src/components/Toast";
import { CardSkeleton, Spinner } from "@/src/components/skeletons";

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, role, user } = useAuth(true);
  const userId = user?.id ?? null;
  const toast = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [activeBorrow, setActiveBorrow] = useState<BorrowRow | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
    setDeleteModalOpen(false);
    try {
      await deleteBook(book.id);
      toast.show("Book deleted.");
      router.push("/library/books");
    } catch (e: unknown) {
      toast.show(e instanceof Error ? e.message : "Failed to delete", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <CardSkeleton lines={5} />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <PageContainer>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/library/books"
              className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              ← Back to books
            </Link>

            {canManage && book && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/library/books/${book.id}/edit`}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <ConfirmModal
            open={deleteModalOpen}
            title="Delete book"
            message="Are you sure you want to delete this book? This cannot be undone."
            confirmLabel="Delete"
            onConfirm={onDelete}
            onCancel={() => setDeleteModalOpen(false)}
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950">
              {error}
            </div>
          )}

          {loadingBook ? (
            <CardSkeleton lines={6} />
          ) : !book ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">Book not found.</p>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                {book.title}
              </h1>
              <p className="text-zinc-700 dark:text-zinc-300">{book.author}</p>

              <div>
                <BookStatusBadge
                  status={book.status === "available" ? "available" : "borrowed"}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {book.status === "available" && userId && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await checkoutBook(book.id, userId);
                        await load();
                        toast.show("Book checked out.");
                      } catch (e: unknown) {
                        toast.show(
                          e instanceof Error ? e.message : "Failed to check out",
                          "error"
                        );
                      }
                    }}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
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
                          toast.show("Book returned.");
                        } catch (e: unknown) {
                          toast.show(
                            e instanceof Error ? e.message : "Failed to return",
                            "error"
                          );
                        }
                      }}
                      className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
                    >
                      Return
                    </button>
                  )}

                {book.status === "borrowed" && activeBorrow && (
                  <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    Borrowed by:{" "}
                    <span className="ml-1 font-medium">
                      {activeBorrow.borrowed_by}
                    </span>
                  </div>
                )}
              </div>

              {book.isbn && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  ISBN: {book.isbn}
                </div>
              )}

              {book.tags && book.tags.length > 0 && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Tags:{" "}
                  <span className="font-medium">{book.tags.join(", ")}</span>
                </div>
              )}

              {canManage && (
                <button
                  type="button"
                  disabled={aiLoading || !book}
                  onClick={async () => {
                    if (!book) return;
                    setAiLoading(true);
                    try {
                      const res = await fetch("/api/ai/book-metadata", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: book.title,
                          author: book.author,
                        }),
                      });

                      const data = await res.json();
                      if (!res.ok)
                        throw new Error(data?.error ?? "AI generation failed");

                      await updateBook(book.id, {
                        summary: data.summary,
                        tags: data.tags,
                      });

                      await load();
                      toast.show("AI summary and tags generated.");
                    } catch (e: unknown) {
                      toast.show(
                        e instanceof Error ? e.message : "Failed to generate summary",
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
                      Generating…
                    </>
                  ) : (
                    "Generate AI summary + tags"
                  )}
                </button>
              )}

              {book.summary && (
                <div className="pt-2">
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Summary
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {book.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
