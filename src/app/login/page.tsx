"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signUp = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;

      alert(
        "Signup successful."
      );
      // Sign up often creates a session when email confirmation is off; redirect like sign in
      window.location.href = "/library";
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  const signIn = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      window.location.href = "/library";
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Welcome
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Sign in with Google or use email/password.
          </p>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          Continue with Google
        </button>

        <div className="text-center text-xs text-gray-400 dark:text-zinc-500">
          or
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium dark:text-zinc-300">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={signIn}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              {busy ? "..." : "Sign in"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={signUp}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:hover:bg-zinc-700"
            >
              {busy ? "..." : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
