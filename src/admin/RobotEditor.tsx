import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAdminOffers,
  useAdminRobots,
  useAdminStores,
  useDeleteOffer,
  useSaveOffer,
  useUpdateRobot,
} from "@/admin/adminQueries";
import { useCategories } from "@/data/queries";
import { buildAffiliateUrl, detectStore } from "@/lib/affiliate";
import { formatPrice } from "@/lib/format";
import type { OfferAdmin, Robot } from "@/types";

/** `"a\nb"` <-> `["a", "b"]` — one item per line, blank lines dropped. */
function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
function arrayToLines(items: string[]): string {
  return items.join("\n");
}

/** `"key: value"` per line <-> `{ key: value }`. Lines without a colon,
 * or with an empty key, are silently dropped rather than erroring — a
 * stray blank line while typing shouldn't block saving the rest. */
function linesToSpecs(text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const index = line.indexOf(":");
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key) specs[key] = value;
  }
  return specs;
}
function specsToLines(specs: Record<string, string>): string {
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

/**
 * The content editor for a robot's editorial fields — name, summary,
 * verdict, pros/cons, best-for/not-for, maintenance/warranty, specs. Until
 * now these existed only in the database schema; there was no admin
 * screen to fill them in without writing SQL by hand.
 *
 * Local state is seeded from `robot` once when it loads, then edited
 * freely and saved as one patch — no autosave, so a half-finished edit
 * never silently overwrites a published field.
 */
function RobotContentEditor({ robot }: { robot: Robot }) {
  const { data: categories = [] } = useCategories();
  const update = useUpdateRobot();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState(() => ({
    name: robot.name,
    brand: robot.brand,
    category_id: robot.category_id ?? "",
    price_from: robot.price_from?.toString() ?? "",
    hero_image: robot.hero_image ?? "",
    summary: robot.summary ?? "",
    verdict: robot.verdict ?? "",
    pros: arrayToLines(robot.pros),
    cons: arrayToLines(robot.cons),
    best_for: arrayToLines(robot.best_for),
    not_for: arrayToLines(robot.not_for),
    maintenance_cost: robot.maintenance_cost ?? "",
    warranty: robot.warranty ?? "",
    spare_parts_availability: robot.spare_parts_availability ?? "",
    specs: specsToLines(robot.specs ?? {}),
    is_featured: robot.is_featured,
  }));

  // Re-seed only when the robot itself changes (e.g. navigating from one
  // editor to another) — never on every render, which would wipe unsaved
  // edits back to the last-saved values.
  useEffect(() => {
    setForm({
      name: robot.name,
      brand: robot.brand,
      category_id: robot.category_id ?? "",
      price_from: robot.price_from?.toString() ?? "",
      hero_image: robot.hero_image ?? "",
      summary: robot.summary ?? "",
      verdict: robot.verdict ?? "",
      pros: arrayToLines(robot.pros),
      cons: arrayToLines(robot.cons),
      best_for: arrayToLines(robot.best_for),
      not_for: arrayToLines(robot.not_for),
      maintenance_cost: robot.maintenance_cost ?? "",
      warranty: robot.warranty ?? "",
      spare_parts_availability: robot.spare_parts_availability ?? "",
      specs: specsToLines(robot.specs ?? {}),
      is_featured: robot.is_featured,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robot.id]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await update.mutateAsync({
      id: robot.id,
      name: form.name,
      brand: form.brand,
      category_id: form.category_id || null,
      price_from: form.price_from ? Number(form.price_from) : null,
      hero_image: form.hero_image || null,
      summary: form.summary || null,
      verdict: form.verdict || null,
      pros: linesToArray(form.pros),
      cons: linesToArray(form.cons),
      best_for: linesToArray(form.best_for),
      not_for: linesToArray(form.not_for),
      maintenance_cost: form.maintenance_cost || null,
      warranty: form.warranty || null,
      spare_parts_availability: form.spare_parts_availability || null,
      specs: linesToSpecs(form.specs),
      is_featured: form.is_featured,
    });
    setSaved(true);
  };

  return (
    <form
      onSubmit={onSave}
      className="rounded-[1.5rem] border border-white/10 bg-background p-6"
    >
      <h2 className="text-sm font-semibold">תוכן ומפרט</h2>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">
        שם, קטגוריה, תיאור, יתרונות וחסרונות, ושדות העריכה שמזינים את קופסת
        הסיכום בעמוד המוצר.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="שם הדגם">
          <input
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-sm outline-none focus:border-foreground"
          />
        </Field>
        <Field label="מותג">
          <input
            value={form.brand}
            onChange={(event) => set("brand", event.target.value)}
            className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-sm outline-none focus:border-foreground"
          />
        </Field>
        <Field label="קטגוריה">
          <select
            value={form.category_id}
            onChange={(event) => set("category_id", event.target.value)}
            className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-sm outline-none focus:border-foreground"
          >
            <option value="">ללא קטגוריה</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="מחיר משוער (₪) — ריק אם אין מידע אמין">
          <input
            type="number"
            inputMode="numeric"
            dir="ltr"
            value={form.price_from}
            onChange={(event) => set("price_from", event.target.value)}
            className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-start text-sm outline-none focus:border-foreground"
          />
        </Field>
        <Field label="קישור לתמונה ראשית" className="sm:col-span-2">
          <input
            dir="ltr"
            value={form.hero_image}
            onChange={(event) => set("hero_image", event.target.value)}
            placeholder="https://…"
            className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-start text-sm outline-none focus:border-foreground"
          />
        </Field>

        <Field label="תיאור קצר (שורה אחת)" className="sm:col-span-2">
          <textarea
            rows={2}
            value={form.summary}
            onChange={(event) => set("summary", event.target.value)}
            className="w-full rounded-[1.5rem] border border-white/20 bg-background p-4 text-sm outline-none focus:border-foreground"
          />
        </Field>

        <Field label="פסק דין (קופסת הסיכום)" className="sm:col-span-2">
          <textarea
            rows={2}
            value={form.verdict}
            onChange={(event) => set("verdict", event.target.value)}
            placeholder="משפט אחד: מה המסקנה שלנו על הדגם הזה"
            className="w-full rounded-[1.5rem] border border-white/20 bg-background p-4 text-sm outline-none focus:border-foreground"
          />
        </Field>

        <Field label="יתרונות (שורה לכל יתרון)">
          <textarea
            rows={4}
            value={form.pros}
            onChange={(event) => set("pros", event.target.value)}
            className="w-full rounded-[1.5rem] border border-white/20 bg-background p-4 text-sm outline-none focus:border-foreground"
          />
        </Field>
        <Field label="חסרונות (שורה לכל חיסרון)">
          <textarea
            rows={4}
            value={form.cons}
            onChange={(event) => set("cons", event.target.value)}
            className="w-full rounded-[1.5rem] border border-white/20 bg-background p-4 text-sm outline-none focus:border-foreground"
          />
        </Field>

        <Field label="מתאים ל (שורה לכל פריט)">
          <textarea
            rows={3}
            value={form.best_for}
            onChange={(event) => set("best_for", event.target.value)}
            className="w-full rounded-[1.5rem] border border-white/20 bg-background p-4 text-sm outline-none focus:border-foreground"
          />
        </Field>
        <Field label="פחות מתאים ל (שורה לכל פריט)">
          <textarea
            rows={3}
            value={form.not_for}
            onChange={(event) => set("not_for", event.target.value)}
            className="w-full rounded-[1.5rem] border border-white/20 bg-background p-4 text-sm outline-none focus:border-foreground"
          />
        </Field>

        <Field label="עלויות תחזוקה">
          <input
            value={form.maintenance_cost}
            onChange={(event) => set("maintenance_cost", event.target.value)}
            className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-sm outline-none focus:border-foreground"
          />
        </Field>
        <Field label="אחריות">
          <input
            value={form.warranty}
            onChange={(event) => set("warranty", event.target.value)}
            className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-sm outline-none focus:border-foreground"
          />
        </Field>
        <Field label="זמינות חלקי חילוף" className="sm:col-span-2">
          <input
            value={form.spare_parts_availability}
            onChange={(event) => set("spare_parts_availability", event.target.value)}
            className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-sm outline-none focus:border-foreground"
          />
        </Field>

        <Field label="מפרט טכני (key: value, שורה לכל שדה)" className="sm:col-span-2">
          <textarea
            rows={5}
            dir="ltr"
            value={form.specs}
            onChange={(event) => set("specs", event.target.value)}
            placeholder={"ניווט: LiDAR\nתחנה: ריקון ושטיפה"}
            className="w-full rounded-[1.5rem] border border-white/20 bg-background p-4 text-start text-sm outline-none focus:border-foreground"
          />
        </Field>

        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(event) => set("is_featured", event.target.checked)}
            className="size-4"
          />
          בחירת העורך (מוצג בבית ובעמוד הקטגוריה)
        </label>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={update.isPending} className="w-full sm:w-auto">
          {update.isPending && <Loader2 className="size-4 animate-spin" />}
          שמירה
        </Button>
        {saved && (
          <p role="status" className="text-sm text-accent">
            נשמר.
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-medium">{label}</label>
      {children}
    </div>
  );
}

/**
 * Offer editor — the screen that turns a pasted shop link into money.
 *
 * The admin pastes a plain product URL. The store is identified from its
 * hostname, the affiliate URL is composed from that store's template, and a
 * live preview shows exactly where a visitor will land. Because the tag lives
 * on the store row, changing affiliate programme later rewrites every link on
 * the site at once.
 */
export default function RobotEditor() {
  const { id } = useParams();
  const { data: robots = [] } = useAdminRobots();
  const { data: stores = [] } = useAdminStores();
  const { data: offers = [] } = useAdminOffers(id);
  const save = useSaveOffer();
  const remove = useDeleteOffer();

  const robot = robots.find((item) => item.id === id);

  const [productUrl, setProductUrl] = useState("");
  const [price, setPrice] = useState("");
  const [shipping, setShipping] = useState("");
  const [inStock, setInStock] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const matchedStore = productUrl ? detectStore(productUrl, stores) : undefined;
  const preview = matchedStore
    ? buildAffiliateUrl(
        matchedStore.link_template,
        productUrl,
        matchedStore.affiliate_tag,
      )
    : "";

  const addOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (!matchedStore) {
      setError(
        "לא זיהינו את החנות מהקישור. אפשר להוסיף את הדומיין במסך ״חנויות ואפילייט״.",
      );
      return;
    }

    try {
      await save.mutateAsync({
        robot_id: id!,
        store_id: matchedStore.id,
        price: price ? Number(price) : null,
        in_stock: inStock,
        shipping_note: shipping || null,
        product_url: productUrl,
        affiliate_url: preview,
      });
      setProductUrl("");
      setPrice("");
      setShipping("");
      setSaved(true);
    } catch {
      setError("השמירה נכשלה. ייתכן שכבר קיימת הצעה לחנות הזאת.");
    }
  };

  if (!robot) {
    return <p className="text-sm text-muted-foreground">טוען…</p>;
  }

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/robots"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4" />
        חזרה לרשימה
      </Link>

      <header className="mb-8 mt-4">
        <h1 className="text-2xl font-semibold">{robot.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {robot.brand} · <bdi>{formatPrice(robot.price_from)}</bdi>
        </p>
      </header>

      <div className="mb-6">
        <RobotContentEditor robot={robot} />
      </div>

      {/* ---------- add an offer ---------- */}
      <section className="rounded-[1.5rem] border border-white/10 bg-background p-6">
        <h2 className="text-sm font-semibold">הוספת חנות</h2>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          הדביקו קישור רגיל למוצר מאתר החנות. אנחנו נזהה את החנות ונבנה את
          קישור השותפים לבד.
        </p>

        <form onSubmit={addOffer} className="mt-5 grid gap-4">
          <div>
            <label htmlFor="product-url" className="mb-2 block text-xs font-medium">
              קישור המוצר בחנות
            </label>
            <input
              id="product-url"
              dir="ltr"
              value={productUrl}
              onChange={(event) => setProductUrl(event.target.value)}
              placeholder="https://ksp.co.il/web/item/123456"
              className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-start text-sm outline-none focus:border-foreground"
            />

            {productUrl && (
              <div className="mt-3 rounded-[1.5rem] bg-white/5 p-4">
                {matchedStore ? (
                  <>
                    <p className="flex items-center gap-2 text-xs font-medium">
                      <Check className="size-3.5 text-accent" />
                      זוהתה החנות: {matchedStore.name} · עמלה{" "}
                      <bdi>{matchedStore.commission_rate}%</bdi>
                    </p>
                    <p className="mt-2 break-all text-xs text-muted-foreground" dir="ltr">
                      {preview}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    לא זיהינו את החנות מהדומיין הזה.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="offer-price" className="mb-2 block text-xs font-medium">
                מחיר (₪)
              </label>
              <input
                id="offer-price"
                type="number"
                inputMode="numeric"
                dir="ltr"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-start text-sm outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label htmlFor="offer-shipping" className="mb-2 block text-xs font-medium">
                הערת משלוח
              </label>
              <input
                id="offer-shipping"
                value={shipping}
                onChange={(event) => setShipping(event.target.value)}
                placeholder="משלוח חינם"
                className="h-12 w-full rounded-full border border-white/20 bg-background px-5 text-sm outline-none focus:border-foreground"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(event) => setInStock(event.target.checked)}
              className="size-4"
            />
            במלאי
          </label>

          {error && (
            <p role="alert" className="text-sm text-foreground">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-accent">
              ההצעה נשמרה.
            </p>
          )}

          <div>
            <Button type="submit" disabled={save.isPending || !productUrl}>
              {save.isPending && <Loader2 className="size-4 animate-spin" />}
              הוספה
            </Button>
          </div>
        </form>
      </section>

      {/* ---------- existing offers ---------- */}
      <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-background p-6">
        <h2 className="text-sm font-semibold">
          חנויות שמוכרות את הדגם (<bdi>{offers.length}</bdi>)
        </h2>

        {offers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            עדיין לא הוספת חנויות לדגם הזה.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {(offers as OfferAdmin[]).map((offer) => {
              const store = stores.find((item) => item.id === offer.store_id);
              return (
                <li key={offer.id} className="flex items-start gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {store?.name ?? "חנות"} ·{" "}
                      <bdi className="tabular-nums">{formatPrice(offer.price)}</bdi>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {offer.in_stock ? "במלאי" : "אזל"}
                      {offer.shipping_note ? ` · ${offer.shipping_note}` : ""}
                    </p>
                    <p
                      className="mt-1 truncate text-xs text-muted-foreground"
                      dir="ltr"
                      title={offer.product_url}
                    >
                      {offer.product_url}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove.mutate(offer.id)}
                    aria-label={`מחיקת ההצעה של ${store?.name ?? "החנות"}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
