import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminStores, useUpdateStore } from "@/admin/adminQueries";
import { buildAffiliateUrl } from "@/lib/affiliate";
import type { StoreAdmin } from "@/types";

/**
 * Affiliate settings, one row per retailer.
 *
 * This is the single place the affiliate identity lives. Change the tag or
 * the template here and every outbound link on the site follows immediately,
 * because the redirect function composes each URL at click time rather than
 * relying on what was saved months ago.
 */
export default function Stores() {
  const { data: stores = [], isLoading } = useAdminStores();

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">חנויות ואפילייט</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          מזהה השותף נשמר כאן בלבד ולעולם לא נשלח לדפדפן של הגולש. שינוי כאן
          מעדכן את כל הקישורים באתר מיד.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">טוען…</p>
      ) : (
        <div className="space-y-4">
          {stores.map((store) => (
            <StoreRow key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}

function StoreRow({ store }: { store: StoreAdmin }) {
  const update = useUpdateStore();
  const [tag, setTag] = useState(store.affiliate_tag ?? "");
  const [template, setTemplate] = useState(store.link_template);
  const [rate, setRate] = useState(String(store.commission_rate));
  const [domains, setDomains] = useState(store.domains.join(", "));
  const [saved, setSaved] = useState(false);

  const dirty =
    tag !== (store.affiliate_tag ?? "") ||
    template !== store.link_template ||
    rate !== String(store.commission_rate) ||
    domains !== store.domains.join(", ");

  const preview = buildAffiliateUrl(
    template,
    `${store.base_url}/product/12345`,
    tag,
  );

  const onSave = async () => {
    await update.mutateAsync({
      id: store.id,
      affiliate_tag: tag || null,
      link_template: template,
      commission_rate: Number(rate) || 0,
      domains: domains
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-background p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">{store.name}</h2>
        <span className="text-xs text-muted-foreground" dir="ltr">
          {store.base_url}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          id={`tag-${store.id}`}
          label="מזהה שותף"
          value={tag}
          onChange={setTag}
          ltr
        />
        <Field
          id={`rate-${store.id}`}
          label="אחוז עמלה"
          value={rate}
          onChange={setRate}
          ltr
        />
        <div className="sm:col-span-2">
          <Field
            id={`template-${store.id}`}
            label="תבנית קישור"
            value={template}
            onChange={setTemplate}
            ltr
            hint="משתנים זמינים: {url} · {url_encoded} · {tag}"
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            id={`domains-${store.id}`}
            label="דומיינים לזיהוי אוטומטי"
            value={domains}
            onChange={setDomains}
            ltr
            hint="מופרדים בפסיק. לפי אלה מזוהה החנות כשמדביקים קישור מוצר."
          />
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-white/5 p-4">
        <p className="text-xs font-medium">תצוגה מקדימה</p>
        <p className="mt-1.5 break-all text-xs text-muted-foreground" dir="ltr">
          {preview}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={onSave} disabled={!dirty || update.isPending} size="sm">
          {update.isPending && <Loader2 className="size-4 animate-spin" />}
          שמירה
        </Button>
        {saved && <span className="text-sm text-accent">נשמר</span>}
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  ltr,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  ltr?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-medium">
        {label}
      </label>
      <input
        id={id}
        dir={ltr ? "ltr" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-start text-sm outline-none focus:border-foreground"
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
