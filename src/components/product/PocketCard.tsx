import { Link } from "react-router-dom";
import { ProductImage } from "@/components/ui/product-image";
import { formatPrice } from "@/lib/format";
import type { RobotWithOffers } from "@/types";
import { cn } from "@/lib/utils";

/**
 * A product tucked into a pocket.
 *
 * The artwork fills the card; a dark panel covers its lower half like a
 * slip pocket, and the panel's top edge is deliberately not level — it
 * sits high on the inline-start side and steps down, the same notch the
 * hero's ticket card uses. On hover the artwork rides up out of the
 * pocket, which is the whole trick: the product looks like a physical
 * thing being drawn out rather than an image being scaled.
 *
 * The step is a radial gradient, not a fixed `path()`, so the silhouette
 * holds at any width.
 */
export function PocketCard({
  robot,
  /** Index into the comparison series palette; omit outside a comparison. */
  seriesIndex,
  className,
}: {
  robot: RobotWithOffers;
  seriesIndex?: number;
  className?: string;
}) {
  const offer = robot.offers?.[0];
  const seriesColor =
    seriesIndex === undefined ? null : `hsl(var(--series-${seriesIndex + 1}))`;

  return (
    <article className={cn("group/pocket relative", className)}>
      <Link
        to={`/robot/${robot.slug}`}
        className="block overflow-hidden rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[3/4] bg-light">
          {/* the artwork — rides up on hover */}
          <ProductImage
            src={robot.hero_image}
            alt={robot.name}
            className="size-full transition-transform duration-[900ms] ease-smooth group-hover/pocket:-translate-y-6 group-hover/pocket:scale-[1.04]"
          />

          {/* the serial, as in the reference */}
          <span
            className="absolute end-4 top-4 text-[0.7rem] font-medium tracking-wider text-white mix-blend-difference"
            dir="ltr"
          >
            {robot.brand?.toUpperCase().replace(/\s/g, "").slice(0, 8)}
          </span>

          {/* ---------- the pocket ----------
              The reference puts a black pocket on a pale page. Here the
              canvas is already black, so a black pocket would vanish into
              it — the accent carries the shape instead.

              Its text is dark, not white: white on this blue measures
              2.8:1, under the readable floor, while near-black on it
              measures 6.9:1. */}
          <div className="absolute inset-x-0 bottom-0 h-[58%]">
            {/* raised half of the pocket's top edge */}
            <div className="absolute start-0 top-0 h-10 w-[54%] rounded-t-[1.6rem] bg-accent" />

            {/* the concave joint down to the lower half */}
            <span
              aria-hidden="true"
              className="absolute start-[54%] top-4 size-6"
              style={{
                background:
                  "radial-gradient(circle at 100% 100%, transparent 0 1.5rem, hsl(var(--accent)) 1.5rem)",
              }}
            />

            <div className="absolute inset-x-0 bottom-0 top-4 flex flex-col justify-between rounded-[1.6rem] rounded-ss-none bg-accent p-5 text-background">
              <div>
                <p className="text-[0.7rem] text-background/70">
                  {robot.category?.name ?? "רובוט ביתי"}
                </p>
                <h3 className="mt-1 text-lg font-semibold leading-6 line-clamp-2">
                  {robot.name}
                </h3>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-3xl font-semibold tabular-nums">
                    <bdi>{robot.score?.toFixed(1) ?? "—"}</bdi>
                    <span className="ms-1.5 align-middle text-xs font-normal text-background/70">
                      ציון
                    </span>
                  </p>
                  <p className="mt-1 truncate text-xs text-background/70">
                    {offer?.store ? `הכי זול ב-${offer.store.name}` : "מחיר משוער"}{" "}
                    · <bdi>{formatPrice(offer?.price ?? robot.price_from)}</bdi>
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-background/40 transition-colors duration-500 ease-smooth group-hover/pocket:border-transparent group-hover/pocket:bg-background group-hover/pocket:text-accent"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11 5H5v6M11 5 5 11"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* In a comparison, a rule in the series colour ties the card to
                its bars below. Identity never rests on it alone — the name
                sits right above, and the legend repeats both. */}
            {seriesColor && (
              <span
                aria-hidden="true"
                className="absolute inset-x-5 bottom-3 h-1.5 rounded-full ring-2 ring-accent"
                style={{ background: seriesColor }}
              />
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
