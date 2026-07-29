import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { GuideCard, GuideCardSkeleton } from "@/components/product/GuideCard";
import { NewsletterCta } from "@/components/sections/NewsletterCta";
import { useCategories, useGuides } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { cn } from "@/lib/utils";

export default function Guides() {
  const [filter, setFilter] = useState<string | null>(null);
  const { data: guides = [], isLoading } = useGuides();
  const { data: categories = [] } = useCategories();

  useDocumentMeta({
    title: "מדריכי קנייה והשוואות רובוטים",
    description:
      "כל מה שצריך לדעת לפני שקונים רובוט ביתי בישראל — השוואות, מדריכי קנייה והסברים על מה שבאמת משנה.",
    path: "/guides",
  });

  const visible = filter
    ? guides.filter((guide) => guide.category_id === filter)
    : guides;

  return (
    <>
      <section className="pb-14 pt-28 md:pb-16 md:pt-32">
        <div className="container">
          <h1 className="text-balance text-3xl font-semibold sm:text-4xl lg:text-5xl">
            מדריכים והשוואות
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
            ריכזנו מפרטים, מחירים ודירוגי משתמשים כדי לענות על השאלה היחידה
            שמעניינת — מה כדאי לקנות, ולמה.
          </p>
        </div>
      </section>

      <section className="bg-background py-12 md:py-16">
        <div className="container">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-8">
            <FilterChip
              active={filter === null}
              onClick={() => setFilter(null)}
              label="הכול"
            />
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                active={filter === category.id}
                onClick={() => setFilter(category.id)}
                label={category.name}
              />
            ))}
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <GuideCardSkeleton key={index} />
              ))
            ) : visible.length === 0 ? (
              <p className="col-span-full py-12 text-center text-muted-foreground">
                אין עדיין מדריכים בקטגוריה הזאת.
              </p>
            ) : (
              visible.map((guide, index) => (
                <Reveal key={guide.id} delay={(index % 3) * 80}>
                  <GuideCard
                    guide={guide}
                    category={categories.find((c) => c.id === guide.category_id)}
                  />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      <NewsletterCta />
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 rounded-full border px-4 text-sm transition-colors duration-200",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-white/10 text-muted-foreground hover:border-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
