import { useEffect } from "react";

interface Meta {
  title: string;
  description?: string;
  /** Absolute path, e.g. `/robot/roborock-s8-maxv-ultra`. */
  path?: string;
}

const SITE = "buy robots";
const ORIGIN = "https://buyrobots.co.il";

function setTag(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!el) {
    el = selector.startsWith("link")
      ? document.createElement("link")
      : document.createElement("meta");
    const match = selector.match(/\[(\w+)="([^"]+)"\]/);
    if (match) el.setAttribute(match[1], match[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Per-page title, description and canonical URL. A single-page app keeps one
 * document, so each route has to maintain these itself — and for an affiliate
 * content site they are the difference between ranking and not.
 */
export function useDocumentMeta({ title, description, path }: Meta) {
  useEffect(() => {
    const full = title.includes(SITE) ? title : `${title} | ${SITE}`;
    document.title = full;
    setTag('meta[property="og:title"]', "content", full);

    if (description) {
      setTag('meta[name="description"]', "content", description);
      setTag('meta[property="og:description"]', "content", description);
    }

    if (path) {
      const url = `${ORIGIN}${path}`;
      setTag('link[rel="canonical"]', "href", url);
      setTag('meta[property="og:url"]', "content", url);
    }
  }, [title, description, path]);
}
