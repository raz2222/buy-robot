import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/admin/useAdmin";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { session } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "כניסה לניהול | buy robots";
  }, []);

  useEffect(() => {
    if (session) navigate("/admin", { replace: true });
  }, [session, navigate]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setBusy(false);
    // Deliberately vague: telling an attacker which half was wrong helps them
    // enumerate valid addresses.
    if (authError) setError("האימייל או הסיסמה שגויים");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-[1.5rem] border border-white/10 bg-background p-7"
        >
          <h1 className="text-lg font-semibold">כניסה לניהול</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            האזור הזה מיועד לצוות בלבד.
          </p>

          <label htmlFor="admin-email" className="mt-6 block text-sm font-medium">
            אימייל
          </label>
          <input
            id="admin-email"
            type="email"
            dir="ltr"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-12 w-full rounded-full border border-white/20 bg-background px-5 text-start text-sm outline-none transition-colors focus:border-foreground"
          />

          <label htmlFor="admin-password" className="mt-4 block text-sm font-medium">
            סיסמה
          </label>
          <input
            id="admin-password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-12 w-full rounded-full border border-white/20 bg-background px-5 text-start text-sm outline-none transition-colors focus:border-foreground"
          />

          {error && (
            <p role="alert" className="mt-4 text-sm text-foreground">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            כניסה
          </Button>
        </form>
      </div>
    </div>
  );
}
