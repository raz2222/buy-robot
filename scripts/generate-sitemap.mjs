// Runs after `vite build`. Writes dist/sitemap.xml from the same published
// content Category/Robot/Guide pages render — never a static, hand-kept
// list that silently drifts from the real catalogue.
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ORIGIN = "https://buyrobots.co.il";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.warn(
    "[sitemap] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY not set — skipping sitemap generation.",
  );
  process.exit(0);
}

const supabase = createClient(url, key);

const STATIC_ROUTES = [
  "/",
  "/guides",
  "/comparisons",
  "/find-my-robot",
  "/humanoids",
  "/about",
  "/methodology",
  "/privacy",
];

function urlEntry(loc, lastmod) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : "";
  return `  <url>\n    <loc>${ORIGIN}${loc}</loc>${lastmodTag}\n  </url>`;
}

async function main() {
  const [{ data: categories }, { data: robots }, { data: guides }] = await Promise.all([
    supabase.from("categories").select("slug").eq("is_active", true),
    supabase.from("robots").select("slug, updated_at").eq("status", "published"),
    supabase.from("guides").select("slug, updated_at").eq("status", "published"),
  ]);

  const entries = [
    ...STATIC_ROUTES.map((route) => urlEntry(route)),
    ...(categories ?? []).map((c) => urlEntry(`/category/${c.slug}`)),
    ...(robots ?? []).map((r) => urlEntry(`/robot/${r.slug}`, r.updated_at)),
    ...(guides ?? []).map((g) => urlEntry(`/guide/${g.slug}`, g.updated_at)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
  writeFileSync(path.join(dist, "sitemap.xml"), xml);
  console.log(`[sitemap] wrote ${entries.length} URLs to dist/sitemap.xml`);
}

main().catch((error) => {
  console.error("[sitemap] failed:", error);
  // A missing sitemap should not fail the whole deploy.
  process.exit(0);
});
