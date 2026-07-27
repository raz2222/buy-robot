import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.",
  );
}

/**
 * Browser client. This key is public by design — it travels with every
 * request a visitor makes. What keeps the data safe is Row Level Security:
 * `leads` and `clicks` accept inserts but return nothing, and the affiliate
 * columns on `stores` / `offers` are not granted to the `anon` role at all.
 */
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "buyrobots.auth",
  },
});

/** Base URL of the deployed Edge Functions, used for affiliate redirects. */
export const functionsUrl = `${url}/functions/v1`;
