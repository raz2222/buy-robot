import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { RobotCard, RobotCardSkeleton } from "@/components/product/RobotCard";
import { GuideCard } from "@/components/product/GuideCard";
import {
  CategoryFilters,
  DEFAULT_FILTERS,
  type CategoryFilterState,
} from "@/components/product/CategoryFilters";
import { NewsletterCta } from "@/components/sections/NewsletterCta";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { useCategories, useGuides, useRobots } from "@/data/queries";
import { CATEGORY_FAQS } from "@/data/faq";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import { track } from "@/lib/analytics";

const ORIGIN = "https://buyrobots.co.il";

const SORTS = [
  { value: "score", label: "הציון הגבוה ביותר" },
  { value: "price-asc", label: "המחיר הזול ביותר" },
  { value: "price-desc", label: "המחיר היקר ביותר" },
  { value: "newest", label: "נוספו לאחרונה" },
];

export default function Category() {
  const { slug } = useParams();
  const [sort, setSort] = useState("score");
  const [filters, setFilters] = useState<CategoryFilterState>(DEFAULT_FILTERS);
  const { data: categories = [] } = useCategories();
  const { data: robots = [], isLoading } = useRobots({ categorySlug: slug, sort });
  const { data: relatedGuides = [] } = useGuides(3, slug);

  const category = categories.find((item) => item.slug === slug);

  const editorPicks = useMemo(
    () => robots.filter((robot) => robot.is_featured).slice(0, 3),
    [robots],
  );

  const brands = useMemo(
    () => Array.from(new Set(robots.map((robot) => robot.brand))).sort(),
    [robots],
  );

  const visible = useMemo(() => {
    return robots.filter((robot) => {
      if (filters.brand && robot.brand !== filters.brand) return false;
      if (filters.priceMax && (robot.price_from ?? 0) > filters.priceMax) return false;
      if (filters.inStockOnly && !robot.offers.some((offer) => offer.in_stock)) return false;
      return true;
    });
  }, [robots, filters]);

  // Reset filters when the category itself changes, and skip the very
  // first "use" event that firing on mount with the default state would
  // otherwise send.
  useEffect(() => {
    setFilters(DEFAULT_FILTERS);
  }, [slug]);

  const applyFilters = (next: CategoryFilterState) => {
    setFilters(next);
    track("filter_use", { category: slug, ...next });
  };

  useDocumentMeta({
    title: category ? `${category.name} — השוואת מחירים בישראל` : "קטגוריה",
    description: category?.tagline ?? undefined,
    path: `/category/${slug}`,
  });

  const breadcrumbSchema = useMemo(() => {
    if (!category) return null;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "בית", item: `${ORIGIN}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: `${ORIGIN}/category/${category.slug}`,
        },
      ],
    };
  }, [category]);

  const itemListSchema = useMemo(() => {
    if (!category || robots.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: robots.map((robot, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${ORIGIN}/robot/${robot.slug}`,
        name: robot.name,
      })),
    };
  }, [category, robots]);

  const faqs = slug ? CATEGORY_FAQS[slug] : undefined;

  const faqSchema = useMemo(() => {
    if (!faqs || faqs.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    };
  }, [faqs]);

  useJsonLd("breadcrumb", breadcrumbSchema);
  useJsonLd("itemlist", itemListSchema);
  useJsonLd("faq", faqSchema);

  return (
    <>
      <section className="pb-14 pt-28 md:pb-16 md:pt-32">
        <div className="container">
          <nav aria-label="פירורי לחם" className="mb-8 flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">בית</Link>
            <ChevronLeft className="size-3" />
            <span className="text-foreground">{category?.name ?? "קטגוריה"}</span>
          </nav>

          <h1 className="text-balance text-3xl font-semibold sm:text-4xl lg:text-5xl">
            {category?.name ?? "קטגוריה"}
          </h1>
          {category?.tagline && (
            <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
              {category.tagline}
            </p>
          )}
        </div>
      </section>

      {/* ---------- editor's picks ---------- */}
      {editorPicks.length > 0 && (
        <section className="border-b border-white/10 bg-surface py-12 md:py-16">
          <div className="container">
            <h2 className="text-xl font-semibold sm:text-2xl">בחירת העורך בקטגוריה הזו</h2>
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {editorPicks.map((robot, index) => (
                <Reveal key={robot.id} delay={index * 80}>
                  <RobotCard robot={robot} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-background py-12 md:py-16">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <p className="text-sm text-muted-foreground">
              <bdi>{visible.length}</bdi> מתוך <bdi>{robots.length}</bdi> דגמים
            </p>

            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm text-muted-foreground">
                מיון
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-11 rounded-full border border-white/10 bg-background px-4 text-sm outline-none transition-colors focus:border-foreground"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <CategoryFilters brands={brands} value={filters} onChange={applyFilters} />
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <RobotCardSkeleton key={index} />
              ))
            ) : robots.length === 0 ? (
              <p className="col-span-full py-12 text-center text-muted-foreground">
                עדיין אין דגמים בקטגוריה הזאת.
              </p>
            ) : visible.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">אף דגם לא תואם את הסינון שבחרת.</p>
                <button
                  type="button"
                  onClick={() => applyFilters(DEFAULT_FILTERS)}
                  className="mt-3 text-sm underline underline-offset-4"
                >
                  איפוס סינון
                </button>
              </div>
            ) : (
              visible.map((robot, index) => (
                <Reveal key={robot.id} delay={(index % 3) * 80}>
                  <RobotCard robot={robot} />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ---------- related guides ---------- */}
      {relatedGuides.length > 0 && (
        <section className="border-t border-white/10 bg-surface py-14 md:py-20">
          <div className="container">
            <h2 className="text-2xl font-semibold sm:text-3xl">מדריכים לקטגוריה הזו</h2>
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((guide, index) => (
                <Reveal key={guide.id} delay={index * 80}>
                  <GuideCard guide={guide} category={category} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- FAQ ---------- */}
      {faqs && faqs.length > 0 && (
        <section className="border-t border-white/10 bg-background py-14 md:py-20">
          <div className="container max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">שאלות נפוצות</h2>
            <FaqAccordion items={faqs} className="mt-8" />
          </div>
        </section>
      )}

      <NewsletterCta />
    </>
  );
}
