import { Link } from "react-router-dom";
import { PillTag } from "@/components/ui/deco";
import { ProductImage } from "@/components/ui/product-image";
import { bestOffer, maxSaving } from "@/lib/offers";
import { track } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import type { RobotWithOffers } from "@/types";
import { cn } from "@/lib/utils";

/**
 * The card that carries the whole catalogue. Everything a shopper needs to
 * decide whether to click is on it: score, best price, which shop it is at,
 * and how much the comparison saves them.
 *
 * The whole card is one link. The arrow button is decorative — duplicating
 * the destination as a second focusable control would make every card two
 * tab stops for one action.
 */
export function RobotCard({
  robot,
  className,
}: {
  robot: RobotWithOffers;
  className?: string;
}) {
  const offer = bestOffer(robot);
  const saving = maxSaving(robot);

  return (
    <article className={cn("group h-full", className)}>
      <Link
        to={`/robot/${robot.slug}`}
        onClick={() => track("product_click", { slug: robot.slug, from: "card" })}
        className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-surface p-3 transition-colors duration-500 ease-smooth hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative overflow-hidden rounded-[1.35rem]">
          <ProductImage
            src={robot.hero_image}
            alt={robot.name}
            className="aspect-[4/3] transition-transform duration-[900ms] ease-smooth group-hover:scale-[1.06]"
          />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            {robot.category ? (
              <PillTag className="bg-background/70 backdrop-blur-md">
                {robot.category.name}
              </PillTag>
            ) : (
              <span />
            )}

            {saving > 0 && (
              <PillTag tone="accent" className="font-medium">
                חוסך <bdi>{formatPrice(saving)}</bdi>
              </PillTag>
            )}
          </div>

          {/* The score sits on the artwork as a ring, the way the reference
              stamps a serial on its product shots. */}
          <span className="absolute bottom-3 end-3 grid size-12 place-items-center rounded-full bg-background/70 text-base font-medium tabular-nums backdrop-blur-md">
            <bdi>{robot.score?.toFixed(1) ?? "—"}</bdi>
          </span>
        </div>

        <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
          <p className="text-xs text-muted-foreground" dir="ltr">
            {robot.brand}
          </p>
          <h3 className="mt-1.5 text-base font-medium leading-6 line-clamp-2">
            {robot.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
            {robot.summary}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-4">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {offer?.store ? `הכי זול ב-${offer.store.name}` : "מחיר משוער"}
              </p>
              <p className="mt-0.5 text-xl font-medium tabular-nums text-accent">
                <bdi>{formatPrice(offer?.price ?? robot.price_from)}</bdi>
              </p>
            </div>

            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 transition-colors duration-500 ease-smooth group-hover:border-transparent group-hover:bg-accent group-hover:text-accent-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform duration-500 ease-smooth group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
              >
                <path
                  d="M11 5H5v6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 5 5 11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/** Matches the card's silhouette so the grid does not jump while loading. */
export function RobotCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-surface p-3">
      <div className="skeleton aspect-[4/3] rounded-[1.35rem]" />
      <div className="px-2 pt-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton mt-3 h-4 w-4/5 rounded" />
        <div className="skeleton mt-3 h-3 w-full rounded" />
        <div className="skeleton mt-2 h-3 w-2/3 rounded" />
        <div className="skeleton mt-6 h-8 w-1/2 rounded" />
      </div>
    </div>
  );
}
