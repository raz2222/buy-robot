import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { GuideCard, GuideCardSkeleton } from "@/components/product/GuideCard";
import { useCategories, useGuides } from "@/data/queries";

/**
 * Buying guides are the search-traffic engine: they rank, they answer the
 * question, and they hand the reader to a product page.
 */
export function GuidesPreview() {
  const { data: guides = [], isLoading } = useGuides(6);
  const { data: categories = [] } = useCategories();

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="לפני שקונים"
          title="מדריכים והשוואות"
          blurb="הסברים ישרים על מה שבאמת משנה בכל קטגוריה — ומה רק נשמע טוב על הקופסה."
          action={{ to: "/guides", label: "לכל המדריכים" }}
        />

        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <GuideCardSkeleton key={index} />
              ))
            : guides.map((guide, index) => (
                <Reveal key={guide.id} delay={(index % 3) * 80}>
                  <GuideCard
                    guide={guide}
                    category={categories.find((c) => c.id === guide.category_id)}
                  />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}
