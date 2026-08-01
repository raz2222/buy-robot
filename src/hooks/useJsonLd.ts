import { useEffect } from "react";

/**
 * Injects one `<script type="application/ld+json">` per call, keyed by id
 * so re-renders replace it instead of stacking duplicates. Mirrors
 * `useDocumentMeta`'s per-route lifecycle: set on mount/deps change, no
 * cleanup on unmount needed since the next page's effect overwrites the
 * same id or the tag is simply stale until the next schema-bearing route.
 *
 * Pass `null` while the underlying data is still loading — nothing is
 * written until there is real data, so no page ever ships a schema that
 * describes a loading skeleton.
 */
export function useJsonLd(id: string, data: object | null) {
  useEffect(() => {
    if (!data) return;

    let el = document.head.querySelector<HTMLScriptElement>(`script[data-jsonld="${id}"]`);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.jsonld = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);

    return () => {
      el?.remove();
    };
  }, [id, data]);
}
