import { LeadForm } from "@/components/lead/LeadForm";
import { Reveal } from "@/components/ui/reveal";
import { RobotCard } from "@/components/product/RobotCard";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { useRobots, useWaitlistCount } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const TRACKER = [
  {
    name: "Tesla Optimus",
    maker: "Tesla",
    status: "בייצור פנימי",
    israel: "טרם הוכרז תאריך",
    note: "טסלה מדברת על ייצור המוני ומחיר יעד של 20–30 אלף דולר. טרם נמכר לצרכנים בשום מדינה.",
  },
  {
    name: "Figure 02",
    maker: "Figure AI",
    status: "פיילוטים תעשייתיים",
    israel: "לא צפוי בקרוב",
    note: "עובד בקווי ייצור אצל שותפים נבחרים. לא מיועד לשוק הביתי בשלב זה.",
  },
  {
    name: "Unitree G1",
    maker: "Unitree",
    status: "נמכר בפועל",
    israel: "ביבוא אישי",
    note: "ההומנואיד היחיד שאפשר באמת לקנות היום. מיועד למחקר ופיתוח, לא למטלות בית.",
  },
  {
    name: "1X NEO",
    maker: "1X Technologies",
    status: "בטא מוקדמת",
    israel: "טרם הוכרז",
    note: "מיועד במפורש לבית, אך בשלב זה מופעל חלקית מרחוק על ידי מפעילים אנושיים.",
  },
];

export default function Humanoids() {
  useDocumentMeta({
    title: "רובוטים הומנואידיים בישראל — מה קיים ומתי זה מגיע",
    description:
      "מעקב עדכני אחרי אופטימוס, Figure, Unitree ו-1X: מה כבר נמכר, מה עדיין הדגמה, ומתי הומנואידים יגיעו לישראל.",
    path: "/humanoids",
  });

  const { data: count = 0 } = useWaitlistCount();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const shown = useCountUp(count, inView);
  const { data: robots = [] } = useRobots({ categorySlug: "humanoids" });

  return (
    <>
      <section className="pb-16 pt-28 md:pb-20 md:pt-36">
        <div ref={ref} className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                מעקב שוק
              </p>
              <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                מתי רובוט הומנואידי יגיע לישראל?
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground">
                התשובה הכנה: אף אחד לא יודע בוודאות. מה שכן אפשר לעשות זה לעקוב
                אחרי מה שקורה בפועל — מי כבר מוכר, למי יש יבואן, ומה המחיר
                האמיתי אחרי מכס ומע״מ. אנחנו עושים את זה, ומעדכנים כשיש חדש.
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
            </div>

            <div className="rounded-hero border border-white/10 bg-white/[0.04] p-10 text-center lg:justify-self-end">
              <p className="text-6xl font-semibold tabular-nums sm:text-7xl">
                <bdi>{shown.toLocaleString("he-IL")}</bdi>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                ישראלים ברשימת ההמתנה
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- tracker ---------- */}
      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <h2 className="text-2xl font-semibold sm:text-3xl">מצב השוק היום</h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground">
            ארבעת השחקנים שכדאי להכיר, ומה הסטטוס האמיתי של כל אחד מהם.
          </p>

          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {TRACKER.map((item, index) => (
              <Reveal key={item.name} delay={index * 60}>
                <div className="grid gap-4 py-7 md:grid-cols-[1fr_auto] md:items-start md:gap-10">
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 dir="ltr" className="text-lg font-semibold">
                        {item.name}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {item.maker}
                      </span>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                      {item.note}
                    </p>
                  </div>

                  <dl className="flex gap-8 md:text-end">
                    <div>
                      <dt className="text-xs text-muted-foreground">סטטוס</dt>
                      <dd className="mt-1 text-sm font-medium">{item.status}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">בישראל</dt>
                      <dd className="mt-1 text-sm font-medium">{item.israel}</dd>
                    </div>
                  </dl>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {robots.length > 0 && (
        <section className="bg-surface py-16 md:py-24">
          <div className="container">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              מה כבר אפשר להשיג
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {robots.map((robot, index) => (
                <Reveal key={robot.id} delay={index * 80}>
                  <RobotCard robot={robot} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
