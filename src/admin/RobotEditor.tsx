import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAdminOffers,
  useAdminRobots,
  useAdminStores,
  useDeleteOffer,
  useSaveOffer,
} from "@/admin/adminQueries";
import { buildAffiliateUrl, detectStore } from "@/lib/affiliate";
import { formatPrice } from "@/lib/format";
import type { OfferAdmin } from "@/types";

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

      {/* ---------- add an offer ---------- */}
      <section className="rounded-card border border-border bg-background p-6">
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
              className="h-12 w-full rounded-full border border-input bg-background px-5 text-start text-sm outline-none focus:border-foreground"
            />

            {productUrl && (
              <div className="mt-3 rounded-card bg-muted p-4">
                {matchedStore ? (
                  <>
                    <p className="flex items-center gap-2 text-xs font-medium">
                      <Check className="size-3.5 text-signal" />
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
                className="h-12 w-full rounded-full border border-input bg-background px-5 text-start text-sm outline-none focus:border-foreground"
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
                className="h-12 w-full rounded-full border border-input bg-background px-5 text-sm outline-none focus:border-foreground"
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
            <p role="status" className="text-sm text-signal">
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
      <section className="mt-6 rounded-card border border-border bg-background p-6">
        <h2 className="text-sm font-semibold">
          חנויות שמוכרות את הדגם (<bdi>{offers.length}</bdi>)
        </h2>

        {offers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            עדיין לא הוספת חנויות לדגם הזה.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
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
                    className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
