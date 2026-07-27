import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AdminState {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Auth state for the admin area.
 *
 * Being signed in is not enough — the account also needs an `admin` row in
 * `profiles`. The client check here only decides what to render; the real
 * enforcement is the RLS policies, which reject any query from a session
 * without that role no matter what the UI does.
 */
export function useAdmin(): AdminState {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const resolve = async (next: Session | null) => {
      if (!active) return;
      setSession(next);

      if (!next) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", next.user.id)
        .maybeSingle();

      if (!active) return;
      setIsAdmin(data?.role === "admin");
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setLoading(true);
      resolve(next);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, isAdmin, loading };
}
