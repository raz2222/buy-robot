import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PillTag } from "@/components/ui/deco";
import { offerLink } from "@/lib/affiliate";
import { formatPrice } from "@/lib/format";
import { sortedOffers } from "@/lib/offers";
import type { RobotWithOffers } from "@/types";

/**
 * The comparison table — the reason the site exists.
 *
 * Every outbound link points at the `go` Edge Function rather than the shop:
 * the click gets recorded, the affiliate tag is attached server-side, and the
 * tag itself never appears in the page source. `rel="sponsored nofollow"` is
 * what the affiliate programmes and Google both require of a paid link.
 *
 * On phones the table becomes a stack of cards. A comparison the reader has
 * to scroll sideways is a comparison they will not make.
 */
export function PriceTable({ robot }: { robot: RobotWithOffers }) {
  const offers = sortedOffers(robot);

  if (offers.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-white/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          הדגם הזה עדיין לא נמכר בישראל.{" "}
          <a href="#waitlist" className="font-medium text-accent underline underline-offset-4">
            נעדכן אתכם כשהוא יגיע
          </a>
          .
        </p>
      </div>
    );
  }

  const cheapest = offers[0];

  return (
    <div>
      {/* ---------- desktop ---------- */}
      <table className="hidden w-full border-collapse text-start md:table">
        <caption className="sr-only">
          השוואת מחירים ל־{robot.name} בין החנויות בישראל
        </caption>
        <thead>
          <tr className="border-b border-white/10 text-xs text-muted-foreground">
            <th scope="col" className="py-3 text-start font-medium">חנות</th>
            <th scope="col" className="py-3 text-start font-medium">מחיר</th>
            <th scope="col" className="py-3 text-start font-medium">משלוח</th>
            <th scope="col" className="py-3 text-start font-medium">מלאי</th>
            <th scope="col" className="py-3 text-end font-medium">
              <span className="sr-only">קישור לחנות</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr
              key={offer.id}
              className="border-b border-white/10 transition-colors duration-300 hover:bg-white/[0.04]"
            >
              <td className="py-5">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{offer.store?.name ?? "חנות"}</span>
                  {offer.id === cheapest.id && offer.in_stock && (
                    <PillTag tone="accent">הכי זול</PillTag>
                  )}
                </div>
              </td>
              <td className="py-5 text-lg font-semibold tabular-nums text-accent">
                <bdi>{formatPrice(offer.price)}</bdi>
              </td>
              <td className="py-5 text-sm text-muted-foreground">
                {offer.shipping_note ?? "—"}
              </td>
              <td className="py-5 text-sm">
                {offer.in_stock ? (
                  <span className="text-accent">במלאי</span>
                ) : (
                  <span className="text-muted-foreground">אזל</span>
                )}
              </td>
              <td className="py-5 text-end">
                <Button
                  asChild
                  size="sm"
                  variant={offer.id === cheapest.id ? "accent" : "outline"}
                  disabled={!offer.in_stock}
                >
                  <a
                    href={offerLink(offer.id)}
                    target="_blank"
                    rel="sponsored nofollow noopener"
                  >
                    לרכישה
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------- mobile ---------- */}
      <ul className="space-y-3 md:hidden">
        {offers.map((offer) => (
          <li
            key={offer.id}
            className="rounded-[1.5rem] border border-white/10 bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{offer.store?.name ?? "חנות"}</span>
                  {offer.id === cheapest.id && offer.in_stock && (
                    <PillTag tone="accent">הכי זול</PillTag>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {offer.shipping_note ?? "—"} ·{" "}
                  {offer.in_stock ? (
                    <span className="text-accent">במלאי</span>
                  ) : (
                    "אזל"
                  )}
                </p>
              </div>
              <p className="text-lg font-semibold tabular-nums text-accent">
                <bdi>{formatPrice(offer.price)}</bdi>
              </p>
            </div>

            <Button
              asChild
              size="md"
              variant={offer.id === cheapest.id ? "accent" : "outline"}
              className="mt-4 w-full"
              disabled={!offer.in_stock}
            >
              <a
                href={offerLink(offer.id)}
                target="_blank"
                rel="sponsored nofollow noopener"
              >
                לרכישה ב{offer.store?.name}
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs leading-6 text-muted-foreground">
        המחירים מתעדכנים ידנית ועשויים להשתנות. המחיר המחייב הוא זה שמופיע
        באתר החנות. חלק מהקישורים הם קישורי שותפים.
      </p>
    </div>
  );
}
