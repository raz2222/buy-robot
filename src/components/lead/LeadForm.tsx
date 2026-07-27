import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubmitLead } from "@/data/queries";
import type { LeadType } from "@/types";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  type: LeadType;
  /** Extra context stored with the lead, e.g. which robot page it came from. */
  payload?: Record<string, unknown>;
  placeholder?: string;
  cta?: string;
  successTitle?: string;
  successBody?: string;
  /** `light` sits on the white/grey bands, `dark` on the ink panels. */
  tone?: "light" | "dark";
  className?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The single-field capture used by the newsletter band and the humanoid
 * waitlist. One field, one button — every extra input measurably costs
 * signups, and everything else about the visitor can be asked later.
 */
export function LeadForm({
  type,
  payload,
  placeholder = "כתובת אימייל",
  cta = "הרשמה",
  successTitle = "נרשמת בהצלחה",
  successBody = "נעדכן אותך במייל. אפשר לבטל בכל רגע.",
  tone = "light",
  className,
}: LeadFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const submit = useSubmitLead();

  const dark = tone === "dark";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!EMAIL.test(email.trim())) {
      setError("נראה שכתובת האימייל לא תקינה");
      return;
    }

    try {
      await submit.mutateAsync({ type, email: email.trim(), payload });
      setDone(true);
    } catch {
      setError("משהו השתבש. אפשר לנסות שוב?");
    }
  };

  if (done) {
    return (
      <div
        role="status"
        className={cn(
          "flex items-center gap-3 rounded-full px-6 py-4",
          dark ? "bg-ink-foreground/10 text-ink-foreground" : "bg-signal/10 text-signal",
          className,
        )}
      >
        <Check className="size-5 shrink-0" />
        <p className="text-sm">
          <strong className="font-medium">{successTitle}.</strong> {successBody}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)} noValidate>
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-1.5",
          dark ? "sm:bg-ink-foreground/10" : "sm:bg-background sm:shadow-card",
        )}
      >
        <label className="sr-only" htmlFor={`lead-${type}`}>
          {placeholder}
        </label>
        <input
          id={`lead-${type}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `lead-${type}-error` : undefined}
          className={cn(
            "h-12 flex-1 rounded-full px-5 text-start text-sm outline-none transition-colors",
            dark
              ? "bg-ink-foreground/10 text-ink-foreground placeholder:text-ink-muted sm:bg-transparent"
              : "border border-input bg-background text-foreground placeholder:text-muted-foreground sm:border-transparent",
          )}
        />
        <Button
          type="submit"
          size="md"
          variant={dark ? "accent" : "default"}
          disabled={submit.isPending}
          className="h-12 shrink-0"
        >
          {submit.isPending && <Loader2 className="size-4 animate-spin" />}
          {cta}
        </Button>
      </div>

      {error && (
        <p
          id={`lead-${type}-error`}
          role="alert"
          className={cn(
            "mt-3 ps-5 text-sm",
            dark ? "text-ink-foreground" : "text-foreground",
          )}
        >
          {error}
        </p>
      )}
    </form>
  );
}
