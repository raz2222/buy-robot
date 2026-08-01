/** Domain types, mirroring the Supabase schema. */

export type LeadType =
  | "quiz"
  | "newsletter"
  | "humanoid_waitlist"
  | "repair"
  | "dealer";

export type LeadStatus = "new" | "contacted" | "sold" | "archived";

export type PublishStatus = "draft" | "published";

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  icon: string | null;
  sort: number;
  is_active: boolean;
}

/** The shape a visitor may read — no affiliate credentials. */
export interface Store {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  base_url: string;
  sort: number;
  is_active: boolean;
}

/** The admin view, including the fields the `anon` role cannot select. */
export interface StoreAdmin extends Store {
  domains: string[];
  affiliate_network: string | null;
  affiliate_tag: string | null;
  link_template: string;
  commission_rate: number;
  updated_at: string;
}

export interface Robot {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category_id: string | null;
  score: number | null;
  price_from: number | null;
  summary: string | null;
  body: string | null;
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  hero_image: string | null;
  gallery: string[];
  status: PublishStatus;
  is_featured: boolean;
  sort: number;
  created_at: string;
  updated_at: string;

  /** One line for the summary box: "our verdict". Null until an editor
   * writes it — the box simply doesn't render without it. */
  verdict: string | null;
  /** Who this model is genuinely a good fit for, e.g. "בתים עם שטיח". */
  best_for: string[];
  /** Who should look elsewhere, e.g. "דירות קטנות בלי מסדרון למצוא בסיס". */
  not_for: string[];
  maintenance_cost: string | null;
  warranty: string | null;
  spare_parts_availability: string | null;
  /** Free-form tags for grouping robots on comparison pages. */
  comparison_tags: string[];
  /** Free-form tags the calculator can match against in the future,
   * alongside (not replacing) the category/budget/pets logic it already uses. */
  calculator_tags: string[];
}

/** Public offer row. `product_url` / `affiliate_url` are withheld. */
export interface Offer {
  id: string;
  robot_id: string;
  store_id: string;
  price: number | null;
  in_stock: boolean;
  shipping_note: string | null;
  updated_at: string;
}

export interface OfferAdmin extends Offer {
  product_url: string;
  affiliate_url: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string | null;
  cover: string | null;
  category_id: string | null;
  read_minutes: number;
  status: PublishStatus;
  published_at: string | null;
}

export interface Lead {
  id: string;
  type: LeadType;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  payload: Record<string, unknown>;
  source_path: string | null;
  utm: Record<string, string>;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
}

export interface Click {
  id: string;
  offer_id: string | null;
  robot_id: string | null;
  store_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

/** A robot joined with its offers and category — what product cards render. */
export interface RobotWithOffers extends Robot {
  category: Category | null;
  offers: (Offer & { store: Store | null })[];
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  quiz: "קוויז התאמה",
  newsletter: "ניוזלטר",
  humanoid_waitlist: "רשימת המתנה — הומנואידים",
  repair: "בקשת תיקון",
  dealer: "פנייה מסוחר",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "חדש",
  contacted: "יצרנו קשר",
  sold: "נמכר",
  archived: "בארכיון",
};
