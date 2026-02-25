"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuth } from "@/src/lib/useAuth";

export default function NewBookPage() {
  const router = useRouter();
  const { loading, role } = useAuth(true);

  const canManage = role === "admin" || role === "librarian";

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [tags, setTags] = useState(""); // comma-separated
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!canManage) return;
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

      const { error } = await supabase.from("books").insert({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim() || null,
        tags: tagArr.length ? tagArr : [],
        status: "available",
      });

      if (error) throw error;

      router.push("/library/books");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create book");
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
          href="/library/books"
          className="text-sm underline dark:text-zinc-300"
        >
          Back to books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4 p-6">
      <Link
        href="/library/books"
        className="text-sm underline dark:text-zinc-300"
      >
        ← Back
      </Link>

      <h1 className="text-2xl font-semibold dark:text-zinc-100">Add book</h1>

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
            placeholder="ai, software, backend"
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
