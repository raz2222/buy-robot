import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubmitLead } from "@/data/queries";
import type { LeadType } from "@/types";
import { cn } from "@/lib/utils";

interface Field {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  /** Half-width on desktop, so two fields share a row. */
  half?: boolean;
}

interface ContactFormProps {
  type: LeadType;
  fields: Field[];
  cta: string;
  successTitle: string;
  successBody: string;
  className?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The multi-field capture behind the repair and dealer pages. Unlike the
 * newsletter form these leads are worth qualifying, so a few extra fields
 * pay for themselves — a repair request without a city cannot be routed to
 * a technician.
 */
export function ContactForm({
  type,
  fields,
  cta,
  successTitle,
  successBody,
  className,
}: ContactFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const submit = useSubmitLead();

  const set = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const missing = fields.find(
      (field) => field.required && !values[field.name]?.trim(),
    );
    if (missing) {
      setError(`חסר שדה: ${missing.label}`);
      return;
    }

    if (values.email && !EMAIL.test(values.email.trim())) {
      setError("נראה שכתובת האימייל לא תקינה");
      return;
    }

    // Known columns go in their own fields; anything else rides in `payload`,
    // so a new question never needs a schema change.
    const { name, email, phone, city, ...rest } = values;

    try {
      await submit.mutateAsync({
        type,
        name: name?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        city: city?.trim(),
        payload: rest,
      });
      setDone(true);
    } catch {
      setError("משהו השתבש. אפשר לנסות שוב?");
    }
  };

  if (done) {
    return (
      <div
        role="status"
        className={cn("rounded-card border border-signal/30 bg-signal/5 p-8", className)}
      >
        <span className="grid size-11 place-items-center rounded-full bg-signal text-signal-foreground">
          <Check className="size-5" />
        </span>
        <h3 className="mt-5 text-lg font-semibold">{successTitle}</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-4 sm:grid-cols-2", className)} noValidate>
      {fields.map((field) => (
        <div
          key={field.name}
          className={field.half ? "sm:col-span-1" : "sm:col-span-2"}
        >
          <label
            htmlFor={`${type}-${field.name}`}
            className="mb-2 block text-sm font-medium"
          >
            {field.label}
            {field.required && <span aria-hidden="true"> *</span>}
          </label>

          {field.type === "textarea" ? (
            <textarea
              id={`${type}-${field.name}`}
              rows={4}
              value={values[field.name] ?? ""}
              onChange={(event) => set(field.name, event.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-card border border-input bg-background p-4 text-sm outline-none transition-colors focus:border-foreground"
            />
          ) : field.type === "select" ? (
            <select
              id={`${type}-${field.name}`}
              value={values[field.name] ?? ""}
              onChange={(event) => set(field.name, event.target.value)}
              className="h-12 w-full rounded-full border border-input bg-background px-5 text-sm outline-none transition-colors focus:border-foreground"
            >
              <option value="">בחר…</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`${type}-${field.name}`}
              type={field.type ?? "text"}
              dir={field.type === "email" || field.type === "tel" ? "ltr" : undefined}
              autoComplete={
                field.name === "email"
                  ? "email"
                  : field.name === "phone"
                    ? "tel"
                    : field.name === "name"
                      ? "name"
                      : undefined
              }
              value={values[field.name] ?? ""}
              onChange={(event) => set(field.name, event.target.value)}
              placeholder={field.placeholder}
              className="h-12 w-full rounded-full border border-input bg-background px-5 text-start text-sm outline-none transition-colors focus:border-foreground"
            />
          )}
        </div>
      ))}

      {error && (
        <p role="alert" className="sm:col-span-2 text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={submit.isPending}>
          {submit.isPending && <Loader2 className="size-4 animate-spin" />}
          {cta}
        </Button>
      </div>
    </form>
  );
}
