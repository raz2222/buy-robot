import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Category,
  Guide,
  LeadType,
  RobotWithOffers,
} from "@/types";

/**
 * Column lists are spelled out rather than using `*` on purpose. The `anon`
 * role is granted only the safe columns of `stores` and `offers`; asking for
 * `*` would request the affiliate fields too and Postgres would reject the
 * whole query.
 */
const STORE_COLUMNS = "id, slug, name, logo_url, base_url, sort, is_active";
const OFFER_COLUMNS =
  "id, robot_id, store_id, price, in_stock, shipping_note, updated_at";
const ROBOT_WITH_OFFERS = `
  *,
  category:categories(*),
  offers(${OFFER_COLUMNS}, store:stores(${STORE_COLUMNS}))
`;

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

interface RobotFilters {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  /** `price-asc` | `price-desc` | `score` | `newest` */
  sort?: string;
}

export function useRobots(filters: RobotFilters = {}) {
  const { categorySlug, featured, limit, sort = "score" } = filters;

  return useQuery({
    queryKey: ["robots", categorySlug, featured, limit, sort],
    queryFn: async (): Promise<RobotWithOffers[]> => {
      let query = supabase.from("robots").select(ROBOT_WITH_OFFERS);

      if (featured) query = query.eq("is_featured", true);

      if (categorySlug) {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();
        if (!category) return [];
        query = query.eq("category_id", category.id);
      }

      switch (sort) {
        case "price-asc":
          query = query.order("price_from", { ascending: true, nullsFirst: false });
          break;
        case "price-desc":
          query = query.order("price_from", { ascending: false, nullsFirst: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        default:
          query = query.order("score", { ascending: false, nullsFirst: false });
      }

      query = query.order("sort");
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as RobotWithOffers[];
    },
    staleTime: 60 * 1000,
  });
}

export function useRobot(slug: string | undefined) {
  return useQuery({
    queryKey: ["robot", slug],
    enabled: Boolean(slug),
    queryFn: async (): Promise<RobotWithOffers | null> => {
      const { data, error } = await supabase
        .from("robots")
        .select(ROBOT_WITH_OFFERS)
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as RobotWithOffers | null;
    },
  });
}

export function useGuides(limit?: number, categorySlug?: string) {
  return useQuery({
    queryKey: ["guides", limit, categorySlug],
    queryFn: async (): Promise<Guide[]> => {
      let query = supabase
        .from("guides")
        .select("*")
        .order("published_at", { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();
        if (!category) return [];
        query = query.eq("category_id", category.id);
      }

      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useGuide(slug: string | undefined) {
  return useQuery({
    queryKey: ["guide", slug],
    enabled: Boolean(slug),
    queryFn: async (): Promise<Guide | null> => {
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}

/**
 * Headline number for the humanoid waitlist. Goes through a security-definer
 * function because visitors are not allowed to read the `leads` table itself —
 * they get the count, never a row.
 */
export function useWaitlistCount() {
  return useQuery({
    queryKey: ["waitlist-count"],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc("waitlist_count");
      if (error) throw error;
      return (data as number) ?? 0;
    },
    staleTime: 30 * 1000,
  });
}

export interface LeadInput {
  type: LeadType;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  payload?: Record<string, unknown>;
}

/** Reads the campaign parameters that brought the visitor here, if any. */
function readUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}

/**
 * Every form on the site funnels through here. The insert deliberately does
 * not chain `.select()` — the `anon` role has insert privileges and nothing
 * else, so asking for the row back would fail.
 */
export function useSubmitLead() {
  return useMutation({
    mutationFn: async (input: LeadInput) => {
      const { error } = await supabase.from("leads").insert({
        type: input.type,
        name: input.name ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        city: input.city ?? null,
        payload: input.payload ?? {},
        source_path: window.location.pathname,
        utm: readUtm(),
      });
      if (error) throw error;
    },
  });
}
