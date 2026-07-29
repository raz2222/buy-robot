import { useMemo, useState } from "react";
import { Check, Table2 } from "lucide-react";
import { PocketCard } from "@/components/product/PocketCard";
import { Reveal } from "@/components/ui/reveal";
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
  const [asTable, setAsTable] = useState(false);
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

        {/* ---------- pocket cards ---------- */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {selection.map((robot, index) => (
            <Reveal key={robot.id} delay={index * 80}>
              <PocketCard robot={robot} seriesIndex={index} />
            </Reveal>
          ))}
        </div>

        {/* ---------- the comparison ---------- */}
        {selection.length > 1 && (
          <div className="mt-14">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-medium">איפה ההבדל</h3>

              <button
                type="button"
                onClick={() => setAsTable((value) => !value)}
                aria-pressed={asTable}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-muted-foreground transition-colors duration-300 hover:border-white/50 hover:text-foreground"
              >
                <Table2 className="size-4" />
                {asTable ? "תצוגת גרפים" : "תצוגת טבלה"}
              </button>
            </div>

            {/* Legend. Present whenever there is more than one series, so
                identity never rests on colour alone. */}
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {selection.map((robot, index) => (
                <li key={robot.id} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-full"
                    style={{ background: `hsl(var(--series-${index + 1}))` }}
                  />
                  <span dir="ltr">{robot.name}</span>
                </li>
              ))}
            </ul>

            {asTable ? (
              <ComparisonTable selection={selection} />
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {MEASURES.map((measure) => (
                  <MeasureChart
                    key={measure.key}
                    measure={measure}
                    selection={selection}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * One measure, one scale.
 *
 * Four small charts rather than one combined chart: a shekel price and a
 * score out of ten share no axis, and forcing them onto one — or onto two
 * y-axes — would make the bars lie about their relative size.
 */
function MeasureChart({
  measure,
  selection,
}: {
  measure: Measure;
  selection: RobotWithOffers[];
}) {
  const values = selection.map(measure.value);
  const max = Math.max(...values, 1);

  const best =
    measure.better === "high"
      ? Math.max(...values)
      : Math.min(...values.filter((value) => value > 0), Infinity);

  return (
    <figure className="rounded-[1.5rem] border border-white/10 bg-surface p-6">
      <figcaption>
        <h4 className="text-sm font-medium">{measure.label}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{measure.note}</p>
      </figcaption>

      <div className="mt-5 space-y-3">
        {selection.map((robot, index) => {
          const value = measure.value(robot);
          const isBest = value === best && value > 0;
          return (
            <div key={robot.id}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate text-muted-foreground" dir="ltr">
                  {robot.name}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">
                  <bdi>{measure.format(value)}</bdi>
                  {isBest && (
                    <span className="ms-1.5 text-[0.65rem] text-muted-foreground">
                      הכי טוב
                    </span>
                  )}
                </span>
              </div>

              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-smooth"
                  style={{
                    width: `${Math.max((value / max) * 100, value > 0 ? 4 : 0)}%`,
                    background: `hsl(var(--series-${index + 1}))`,
                  }}
                  role="img"
                  aria-label={`${robot.name}: ${measure.format(value)}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/** The same numbers as a table — the accessible path past the bars. */
function ComparisonTable({ selection }: { selection: RobotWithOffers[] }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-white/10">
      <table className="w-full min-w-[34rem] text-sm">
        <caption className="sr-only">השוואה מספרית בין הדגמים שנבחרו</caption>
        <thead>
          <tr className="border-b border-white/10 text-start">
            <th scope="col" className="p-4 text-start font-medium">
              מדד
            </th>
            {selection.map((robot) => (
              <th
                key={robot.id}
                scope="col"
                className="p-4 text-start font-medium"
                dir="ltr"
              >
                {robot.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {MEASURES.map((measure) => (
            <tr key={measure.key}>
              <th scope="row" className="p-4 text-start font-normal text-muted-foreground">
                {measure.label}
              </th>
              {selection.map((robot) => (
                <td key={robot.id} className="p-4 tabular-nums">
                  <bdi>{measure.format(measure.value(robot))}</bdi>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
