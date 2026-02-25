"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

const DEFAULT_ROLE = "member";

export type AuthState = {
  user: User | null;
  role: string;
  loading: boolean;
  error: string | null;
};

/**
 * Client hook: ensures Supabase session, redirects to /login if not logged in,
 * and loads user role from user_roles table (defaults to "member" if missing).
 */
export function useAuth(redirectIfUnauthenticated = true): AuthState {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>(DEFAULT_ROLE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        if (redirectIfUnauthenticated) router.replace("/login");
        return;
      }

      if (!session?.user) {
        setLoading(false);
        if (redirectIfUnauthenticated) router.replace("/login");
        return;
      }

      setUser(session.user);

      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (roleError) {
        setError(roleError.message);
        setRole(DEFAULT_ROLE);
      } else if (roleRow?.role) {
        setRole(roleRow.role);
      } else {
        setRole(DEFAULT_ROLE);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, redirectIfUnauthenticated]);

  return { user, role, loading, error };
}
