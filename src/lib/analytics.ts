declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Pushes one event onto `window.dataLayer` (GTM-compatible). Never pass a
 * quiz answer, an email, or any other visitor-entered value here — only
 * counts, slugs, categories and other non-identifying context. If a tag
 * manager isn't installed yet, this is a no-op array push and nothing
 * breaks.
 */
export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}

export {};
