"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done">("loading");

  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        router.replace("/login");
        return;
      }

      if (session) {
        router.replace("/library");
      } else {
        router.replace("/login");
      }
      setStatus("done");
    })();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {status === "loading" ? "Signing you in…" : "Redirecting…"}
        </p>
      </div>
    </div>
  );
}
