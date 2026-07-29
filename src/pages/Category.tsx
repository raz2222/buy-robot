import { useState } from "react";
import { useParams } from "react-router-dom";
import { Reveal } from "@/components/ui/reveal";
import { RobotCard, RobotCardSkeleton } from "@/components/product/RobotCard";
import { NewsletterCta } from "@/components/sections/NewsletterCta";
import { useCategories, useRobots } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const SORTS = [
  { value: "score", label: "הציון הגבוה ביותר" },
  { value: "price-asc", label: "המחיר הזול ביותר" },
  { value: "price-desc", label: "המחיר היקר ביותר" },
  { value: "newest", label: "נוספו לאחרונה" },
];

export default function Category() {
  const { slug } = useParams();
  const [sort, setSort] = useState("score");
  const { data: categories = [] } = useCategories();
  const { data: robots = [], isLoading } = useRobots({ categorySlug: slug, sort });

  const category = categories.find((item) => item.slug === slug);

  useDocumentMeta({
    title: category ? `${category.name} — השוואת מחירים בישראל` : "קטגוריה",
    description: category?.tagline ?? undefined,
    path: `/category/${slug}`,
  });

  return (
    <>
      <section className="pb-14 pt-28 md:pb-16 md:pt-32">
        <div className="container">
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

      <section className="bg-background py-12 md:py-16">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <p className="text-sm text-muted-foreground">
              <bdi>{robots.length}</bdi> דגמים
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

          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <RobotCardSkeleton key={index} />
              ))
            ) : robots.length === 0 ? (
              <p className="col-span-full py-12 text-center text-muted-foreground">
                עדיין אין דגמים בקטגוריה הזאת.
              </p>
            ) : (
              robots.map((robot, index) => (
                <Reveal key={robot.id} delay={(index % 3) * 80}>
                  <RobotCard robot={robot} />
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
