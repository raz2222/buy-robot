import { functionsUrl } from "./supabase";

/**
 * Outbound link for an offer.
 *
 * The browser never sees the affiliate URL. It points at the `go` Edge
 * Function, which logs the click, expands the store's link template with the
 * current affiliate tag, and 302s the visitor onward. That indirection is
 * what makes "change the tag once, every link updates" true — and it keeps
 * the tag off the page entirely.
 */
export function offerLink(offerId: string): string {
  return `${functionsUrl}/go/${offerId}`;
}

/**
 * Expands a store link template. Mirrors the implementation inside the `go`
 * Edge Function so the admin can preview exactly what a visitor will hit.
 *
 *   {url}         — the clean product URL
 *   {url_encoded} — the same, percent-encoded for use as a query value
 *   {tag}         — the affiliate identifier
 */
export function buildAffiliateUrl(
  template: string | null | undefined,
  productUrl: string,
  tag: string | null | undefined,
): string {
  if (!template || !template.includes("{url")) return productUrl;
  return template
    .replaceAll("{url_encoded}", encodeURIComponent(productUrl))
    .replaceAll("{url}", productUrl)
    .replaceAll("{tag}", tag ?? "");
}

/**
 * Picks the store a pasted product URL belongs to, by hostname. Lets the
 * admin paste a link and skip choosing a retailer from a dropdown.
 */
export function detectStore<T extends { id: string; domains: string[] }>(
  productUrl: string,
  stores: T[],
): T | undefined {
  let host: string;
  try {
    host = new URL(productUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return undefined;
  }
  return stores.find((store) =>
    store.domains.some((domain) => {
      const clean = domain.toLowerCase().replace(/^www\./, "");
      return host === clean || host.endsWith(`.${clean}`);
    }),
  );
}
