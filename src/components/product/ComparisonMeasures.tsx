import { formatPrice } from "@/lib/format";
import { maxSaving } from "@/lib/offers";
import type { RobotWithOffers } from "@/types";
import { cn } from "@/lib/utils";

export interface Measure {
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
 *
 * Shared by the home page's CompareLab picker and the standalone
 * product-vs-product `/compare` page — the numbers must never drift
 * between the two.
 */
export const MEASURES: Measure[] = [
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

/**
 * One row per measure, one column per model. Each cell carries the number
 * *and* a bar: the bar answers "by how much" at a glance while the number
 * answers "exactly what" — a table that only has bars cannot be read by a
 * screen reader or copied out.
 *
 * Bars are scaled per row, never across the table — a shekel price and a
 * score out of ten share no axis.
 */
export function MeasureTable({
  selection,
  open = true,
}: {
  selection: RobotWithOffers[];
  /** When false, rows sit at their resting (closed) transition state —
   * used by CompareLab's collapsible reveal. Always true on a page that
   * has no collapse to animate from. */
  open?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-surface">
      <table className="w-full min-w-[32rem]">
        <caption className="sr-only">השוואה מספרית בין הדגמים שנבחרו</caption>

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
