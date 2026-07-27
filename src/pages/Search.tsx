import { useSearchParams } from "react-router-dom";
import { Reveal } from "@/components/ui/reveal";
import { RobotCard, RobotCardSkeleton } from "@/components/product/RobotCard";
import { GuideCard } from "@/components/product/GuideCard";
import { useCategories, useGuides, useRobots } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Search runs in the browser over the already-cached catalogue. At this size
 * that is instant and costs no round trip; if the catalogue grows past a few
 * hundred rows this should move to a Postgres full-text index.
 */
export default function Search() {
  const [params] = useSearchParams();
  const term = (params.get("q") ?? "").trim();
  const categorySlug = params.get("category") ?? undefined;

  const { data: robots = [], isLoading } = useRobots({ categorySlug });
  const { data: guides = [] } = useGuides();
  const { data: categories = [] } = useCategories();

  useDocumentMeta({
    title: term ? `תוצאות חיפוש: ${term}` : "חיפוש",
    path: "/search",
  });

  const needle = term.toLowerCase();
  const matchedRobots = needle
    ? robots.filter((robot) =>
        [robot.name, robot.brand, robot.summary, robot.category?.name]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(needle)),
      )
    : robots;

  const matchedGuides = needle
    ? guides.filter((guide) =>
        [guide.title, guide.excerpt]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(needle)),
      )
    : [];

  const total = matchedRobots.length + matchedGuides.length;

  return (
    <section className="bg-background pb-20 pt-28 md:pt-32">
      <div className="container">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {term ? <>תוצאות עבור ״{term}״</> : "כל הרובוטים"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <bdi>{total}</bdi> תוצאות
        </p>

        {isLoading ? (
          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <RobotCardSkeleton key={index} />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="mt-16 rounded-card border border-dashed border-border p-12 text-center">
            <p className="text-base font-medium">לא מצאנו התאמה</p>
            <p className="mt-2 text-sm text-muted-foreground">
              אפשר לנסות מונח אחר, או לענות על ארבע שאלות ולקבל המלצה אישית.
            </p>
          </div>
        ) : (
          <>
            {matchedRobots.length > 0 && (
              <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {matchedRobots.map((robot, index) => (
                  <Reveal key={robot.id} delay={(index % 3) * 60}>
                    <RobotCard robot={robot} />
                  </Reveal>
                ))}
              </div>
            )}

            {matchedGuides.length > 0 && (
              <>
                <h2 className="mt-20 text-xl font-semibold">מדריכים רלוונטיים</h2>
                <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {matchedGuides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      guide={guide}
                      category={categories.find((c) => c.id === guide.category_id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
