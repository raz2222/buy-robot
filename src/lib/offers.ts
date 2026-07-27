import type { Offer, RobotWithOffers, Store } from "@/types";

export type OfferWithStore = Offer & { store: Store | null };

/**
 * The offer a shopper actually wants: cheapest in stock. Falls back to the
 * cheapest out-of-stock one so a product page still shows a reference price
 * instead of an empty dash.
 */
export function bestOffer(robot: RobotWithOffers): OfferWithStore | undefined {
  const byPrice = [...(robot.offers ?? [])].sort(
    (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  );
  return byPrice.find((offer) => offer.in_stock) ?? byPrice[0];
}

/** Cheapest first, in-stock before out-of-stock — the comparison table order. */
export function sortedOffers(robot: RobotWithOffers): OfferWithStore[] {
  return [...(robot.offers ?? [])].sort((a, b) => {
    if (a.in_stock !== b.in_stock) return a.in_stock ? -1 : 1;
    return (a.price ?? Infinity) - (b.price ?? Infinity);
  });
}

/** How much the cheapest offer saves against the most expensive one. */
export function maxSaving(robot: RobotWithOffers): number {
  const prices = (robot.offers ?? [])
    .map((offer) => offer.price)
    .filter((price): price is number => typeof price === "number");
  if (prices.length < 2) return 0;
  return Math.max(...prices) - Math.min(...prices);
}
