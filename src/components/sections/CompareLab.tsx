import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { PocketCard } from "@/components/product/PocketCard";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { useCategories, useRobots } from "@/data/queries";
import { maxSaving } from "@/lib/offers";
import { formatPrice } from "@/lib/format";
import type { RobotWithOffers } from "@/types";
import { cn } from "@/lib/utils";

const MAX_PICKS = 3;

interface Measure {
  key: string;
  label: string;
  /** Which direction counts as better — flips how the winner is marked. */
  better: "high" | "low";
  value: (robot: RobotWithOffers) => number;
  format: (value: number) => string;
  note: string;
}

/**
 * Only measures that come straight off a column are compared.
 *
 * The spec sheets are free text ("10,000 Pa", "עד 7 שבועות") and parsing a
 * number out of them would silently invent data the moment a supplier
 * writes a value differently. These four are exact, and they are the ones
 * a buyer actually decides on.
 */
const MEASURES: Measure[] = [
  {
    key: "score",
    label: "הציון שלנו",
    better: "high",
    value: (robot) => robot.score ?? 0,
    format: (value) => value.toFixed(1),
    note: "מפרט, מחיר בפועל ודירוגי משתמשים",
  },
  {
    key: "price",
    label: "המחיר הזול ביותר",
    better: "low",
    value: (robot) => robot.offers?.[0]?.price ?? robot.price_from ?? 0,
    format: (value) => formatPrice(value),
    note: "כמה שפחות, יותר טוב",
  },
  {
    key: "saving",
    label: "חיסכון מהשוואה",
    better: "high",
    value: (robot) => maxSaving(robot),
    format: (value) => formatPrice(value),
    note: "ההפרש בין החנות היקרה לזולה",
  },
  {
    key: "stores",
    label: "חנויות שמוכרות",
    better: "high",
    value: (robot) => robot.offers?.length ?? 0,
    format: (value) => String(value),
    note: "יותר חנויות, יותר מקום למשא ומתן",
  },
];

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
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={open ? "outline" : "accent"}
                onClick={() => setOpen((value) => !value)}
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
                <ComparisonTable selection={selection} open={open} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * The comparison itself: one row per measure, one column per model.
 *
 * Each cell carries the number *and* a bar, because a bar answers "by how
 * much" at a glance while the number answers "exactly what" — and a table
 * that only has bars cannot be read by a screen reader or copied out.
 *
 * The bars are scaled per row, never across the table. A shekel price and
 * a score out of ten share no axis; one scale for both would make the
 * bars lie about their relative size.
 */
function ComparisonTable({
  selection,
  open,
}: {
  selection: RobotWithOffers[];
  open: boolean;
}) {
  return (
    <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-white/10 bg-surface">
      <table className="w-full min-w-[32rem]">
        <caption className="sr-only">
          השוואה מספרית בין הדגמים שנבחרו
        </caption>

        <thead>
          <tr className="border-b border-white/10">
            <th scope="col" className="p-4 text-start text-xs font-medium text-muted-foreground">
              מדד
            </th>
            {selection.map((robot, index) => (
              <th key={robot.id} scope="col" className="p-4 text-start">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: `hsl(var(--series-${index + 1}))` }}
                  />
                  <span className="text-sm font-medium" dir="ltr">
                    {robot.name}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {MEASURES.map((measure, rowIndex) => {
            const values = selection.map(measure.value);
            const max = Math.max(...values, 1);
            const positives = values.filter((value) => value > 0);
            const best =
              measure.better === "high"
                ? Math.max(...values)
                : positives.length
                  ? Math.min(...positives)
                  : 0;

            return (
              <tr
                key={measure.key}
                className={cn(
                  "transition-all duration-500 ease-smooth",
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
                style={{ transitionDelay: `${120 + rowIndex * 90}ms` }}
              >
                <th scope="row" className="p-4 text-start align-top">
                  <span className="block text-sm font-normal">{measure.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {measure.note}
                  </span>
                </th>

                {selection.map((robot, index) => {
                  const value = measure.value(robot);
                  const isBest = value === best && value > 0;
                  return (
                    <td key={robot.id} className="p-4 align-top">
                      <span className="flex items-baseline gap-2">
                        <span className="text-base font-medium tabular-nums">
                          <bdi>{measure.format(value)}</bdi>
                        </span>
                        {isBest && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] text-foreground">
                            הכי טוב
                          </span>
                        )}
                      </span>

                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <span
                          className="block h-full rounded-full transition-[width] duration-700 ease-smooth"
                          style={{
                            width: open
                              ? `${Math.max((value / max) * 100, value > 0 ? 5 : 0)}%`
                              : "0%",
                            background: `hsl(var(--series-${index + 1}))`,
                            transitionDelay: `${200 + rowIndex * 90}ms`,
                          }}
                        />
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
