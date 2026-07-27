import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "@/components/lead/LeadForm";
import { Reveal } from "@/components/ui/reveal";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { useWaitlistCount } from "@/data/queries";

/**
 * The waitlist is the most valuable thing on the site. An email here is a
 * person who intends to buy a category of product that is not yet sold in
 * Israel — which is exactly the list an importer will pay for.
 *
 * The live counter is honest: it reads the real number of signups through a
 * function that returns a count and nothing else.
 */
export function HumanoidWaitlist() {
  const { data: count = 0 } = useWaitlistCount();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });
  const shown = useCountUp(count, inView);

  return (
    <section className="relative overflow-hidden bg-ink py-20 text-ink-foreground md:py-28">
      {/* A faint schematic grid, the same language as the artwork placeholders. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div ref={ref} className="container relative">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
              הגל הבא
            </p>
            <h2 className="text-balance text-3xl font-semibold leading-[1.15] sm:text-4xl lg:text-5xl">
              נעדכן אותך ברגע שרובוט הומנואידי מגיע לישראל
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-ink-muted">
              אופטימוס, Figure ו-Unitree עדיין לא נמכרים כאן לשימוש ביתי. אנחנו
              עוקבים אחרי היבוא, המחירים והאישורים הרגולטוריים — ושולחים עדכון
              כשבאמת יש מה לספר. בלי ספאם.
            </p>

            <div className="mt-8 max-w-md">
              <LeadForm
                type="humanoid_waitlist"
                tone="dark"
                cta="עדכנו אותי"
                successTitle="אתה ברשימה"
                successBody="נכתוב לך כשיהיה משהו אמיתי לדווח."
              />
            </div>

            <Link
              to="/humanoids"
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink-foreground"
            >
              מה כבר אפשר לקנות היום?
              <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
            </Link>
          </Reveal>

          <Reveal delay={140} className="lg:justify-self-end">
            <div className="rounded-hero border border-ink-foreground/10 bg-ink-foreground/[0.04] p-10 text-center">
              <p className="text-6xl font-semibold tabular-nums sm:text-7xl">
                <bdi>{shown.toLocaleString("he-IL")}</bdi>
              </p>
              <p className="mt-3 text-sm text-ink-muted">
                ישראלים כבר ברשימת ההמתנה
              </p>

              <div className="mt-8 space-y-3 border-t border-ink-foreground/10 pt-8 text-start">
                {[
                  ["Tesla Optimus", "טרם הוכרז תאריך לישראל"],
                  ["Figure 02", "פיילוטים תעשייתיים בלבד"],
                  ["Unitree G1", "זמין ביבוא אישי"],
                ].map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between gap-4">
                    <span dir="ltr" className="text-sm font-medium">
                      {name}
                    </span>
                    <span className="text-xs text-ink-muted">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
