"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuth } from "@/src/lib/useAuth";
import PageContainer from "@/src/components/PageContainer";
import { useToast } from "@/src/components/Toast";
import { CardSkeleton, Spinner } from "@/src/components/skeletons";

export default function NewBookPage() {
  const router = useRouter();
  const { loading, role } = useAuth(true);
  const toast = useToast();

  const canManage = role === "admin" || role === "librarian";

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [tags, setTags] = useState(""); // comma-separated
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!canManage) return;
    if (!title.trim() || !author.trim()) {
      toast.show("Title and author are required", "error");
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

      toast.show("Book created.");
      router.push("/library/books");
    } catch (e: unknown) {
      toast.show(
        e instanceof Error ? e.message : "Failed to create book",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <CardSkeleton lines={6} />
        </PageContainer>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <PageContainer>
          <div className="space-y-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You do not have permission.
            </p>
            <Link
              href="/library/books"
              className="text-sm font-medium text-zinc-600 underline dark:text-zinc-300"
            >
              Back to books
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <PageContainer>
        <div className="max-w-xl space-y-4">
          <Link
            href="/library/books"
            className="text-sm font-medium text-zinc-600 underline dark:text-zinc-300"
          >
            ← Back
          </Link>

          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Add book
          </h1>

          <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:p-6">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Author
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                ISBN (optional)
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tags (comma separated)
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ai, software, backend"
              />
            </div>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              {saving ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
