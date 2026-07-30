import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import { PocketCard } from "@/components/product/PocketCard";
import { MeasureTable } from "@/components/product/ComparisonMeasures";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { useCategories, useRobots } from "@/data/queries";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const MAX_PICKS = 3;

export function CompareLab() {
  const { data: categories = [] } = useCategories();
  const [categorySlug, setCategorySlug] = useState("robot-vacuums");
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { data: robots = [] } = useRobots({ categorySlug });

  // Seed the comparison with the top three of whichever category is open,
  // so the section is never an empty shell on arrival.
  const selection = useMemo(() => {
    const chosen = robots.filter((robot) => picked.includes(robot.id));
    return chosen.length > 0 ? chosen : robots.slice(0, 2);
  }, [robots, picked]);

  const toggle = (id: string) => {
    setPicked((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= MAX_PICKS) return [...current.slice(1), id];
      return [...current, id];
    });
  };

  const switchCategory = (slug: string) => {
    setCategorySlug(slug);
    setPicked([]);
  };

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="השוואה"
          title="שים שניים זה מול זה"
          blurb="בחר עד שלושה דגמים ותראה בדיוק במה הם נבדלים — ציון, מחיר, כמה החיפוש חוסך לך ובכמה חנויות הם נמכרים."
        />

        {/* ---------- category switch ---------- */}
        <div className="mt-10 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => switchCategory(category.slug)}
              aria-pressed={categorySlug === category.slug}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm transition-colors duration-300",
                categorySlug === category.slug
                  ? "border-transparent bg-foreground text-background"
                  : "border-white/15 text-muted-foreground hover:border-white/40 hover:text-foreground",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* ---------- picker ---------- */}
        <div className="mt-6 flex flex-wrap gap-2">
          {robots.map((robot) => {
            const active = selection.some((item) => item.id === robot.id);
            const seriesIndex = selection.findIndex((item) => item.id === robot.id);
            return (
              <button
                key={robot.id}
                type="button"
                onClick={() => toggle(robot.id)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-300",
                  active
                    ? "border-white/40 bg-surface text-foreground"
                    : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground",
                )}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: `hsl(var(--series-${seriesIndex + 1}))` }}
                  />
                )}
                <span dir="ltr">{robot.name}</span>
                {active && <Check className="size-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          עד <bdi>{MAX_PICKS}</bdi> דגמים. בחירה רביעית תחליף את הראשונה.
        </p>

        {/* ---------- pocket cards ----------
            Always side by side, including on a phone. The whole point of
            the section is reading the models against each other; stacked
            cards make that a memory test. */}
        <div
          className={cn(
            "mt-12 grid gap-3 sm:gap-6",
            selection.length >= 3 ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          {selection.map((robot, index) => (
            <div
              key={robot.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <PocketCard robot={robot} seriesIndex={index} compact />
            </div>
          ))}
        </div>

        {/* ---------- the reveal ---------- */}
        {selection.length > 1 && (
          <div className="mt-10">
            <div className="flex flex-wrap justify-center gap-3">
              {selection.length === 2 && (
                <Button asChild size="lg" variant="outline">
                  <Link to={`/compare/${selection[0].slug}/${selection[1].slug}`}>
                    לעמוד ההשוואה המלא
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                variant={open ? "outline" : "accent"}
                onClick={() => {
                  const next = !open;
                  setOpen(next);
                  if (next) {
                    track("comparison_view", {
                      category: categorySlug,
                      robots: selection.map((robot) => robot.slug),
                    });
                  }
                }}
                aria-expanded={open}
                aria-controls="compare-table"
              >
                {open ? "סגור את ההשוואה" : `השווה ${selection.length} דגמים`}
                <ChevronDown
                  className={cn(
                    "transition-transform duration-500 ease-smooth",
                    open && "rotate-180",
                  )}
                />
              </Button>
            </div>

            {/* Grid-rows 0fr → 1fr animates height without measuring it, so
                the panel opens smoothly whatever the content height. */}
            <div
              id="compare-table"
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-700 ease-smooth",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="mt-8">
                  <MeasureTable selection={selection} open={open} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
