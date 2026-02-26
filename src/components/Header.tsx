"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? "");
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const isLibrary = pathname?.startsWith("/library");
  const isEvents = pathname?.startsWith("/events");

  const linkBase =
    "text-sm font-medium transition rounded-md px-3 py-2";
  const linkInactive =
    "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700";
  const linkActive =
    "text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-700";

  return (
    <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Aspire AI Assessment
          </span>

          <nav className="flex gap-1">
            <Link
              href="/library/books"
              className={`${linkBase} ${
                isLibrary ? linkActive : linkInactive
              }`}
            >
              Library
            </Link>
            <Link
              href="/events"
              className={`${linkBase} ${
                isEvents ? linkActive : linkInactive
              }`}
            >
              Events
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
