"use client";

import { supabase } from "@/src/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Aspire AI Assessment
          </span>

          <nav className="flex gap-3 text-sm">
            <a
              href="/library/books"
              className="underline text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Library
            </a>
            <a
              href="/events"
              className="underline text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Events
            </a>
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
