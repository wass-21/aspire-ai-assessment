"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/useAuth";
import { Book, fetchBookById, updateBook } from "@/src/lib/books";

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, role } = useAuth(true);

  const canManage = role === "admin" || role === "librarian";

  const [book, setBook] = useState<Book | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoadingBook(true);
      try {
        const b = await fetchBookById(id);
        setBook(b);
        setTitle(b?.title ?? "");
        setAuthor(b?.author ?? "");
        setIsbn(b?.isbn ?? "");
        setTags((b?.tags ?? []).join(", "));
      } finally {
        setLoadingBook(false);
      }
    };

    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, id]);

  const onSave = async () => {
    if (!canManage || !id) return;
    if (!title.trim() || !author.trim()) {
      alert("Title and author are required");
      return;
    }

    setSaving(true);
    try {
      const tagArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await updateBook(id, {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim() || null,
        tags: tagArr,
      });

      router.push(`/library/books/${id}`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!canManage) {
    return (
      <div className="space-y-2 p-6">
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          You do not have permission.
        </p>
        <Link
          href={`/library/books/${id}`}
          className="text-sm underline dark:text-zinc-300"
        >
          Back
        </Link>
      </div>
    );
  }

  if (loadingBook) return <div className="p-6">Loading book...</div>;
  if (!book) return <div className="p-6">Book not found.</div>;

  return (
    <div className="max-w-xl space-y-4 p-6">
      <Link
        href={`/library/books/${id}`}
        className="text-sm underline dark:text-zinc-300"
      >
        ← Back
      </Link>

      <h1 className="text-2xl font-semibold dark:text-zinc-100">Edit book</h1>

      <div className="space-y-3 rounded-xl border p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div>
          <label className="text-sm font-medium dark:text-zinc-300">Title</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium dark:text-zinc-300">Author</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium dark:text-zinc-300">
            ISBN (optional)
          </label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium dark:text-zinc-300">
            Tags (comma separated)
          </label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
