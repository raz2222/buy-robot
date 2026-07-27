import { Link, useParams } from "react-router-dom";
import { Check, ChevronLeft, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ui/product-image";
import { Reveal } from "@/components/ui/reveal";
import { ScoreBadge } from "@/components/product/ScoreBadge";
import { PriceTable } from "@/components/product/PriceTable";
import { RobotCard } from "@/components/product/RobotCard";
import { LeadForm } from "@/components/lead/LeadForm";
import { useRobot, useRobots } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { bestOffer, maxSaving } from "@/lib/offers";
import { formatPrice } from "@/lib/format";
import NotFound from "@/pages/NotFound";

export default function Robot() {
  const { slug } = useParams();
  const { data: robot, isLoading } = useRobot(slug);
  const { data: related = [] } = useRobots({ limit: 3, sort: "score" });

  useDocumentMeta({
    title: robot ? `${robot.name} — מחיר, מפרט והשוואה` : "טוען…",
    description: robot?.summary ?? undefined,
    path: `/robot/${slug}`,
  });

  if (isLoading) return <RobotSkeleton />;
  if (!robot) return <NotFound />;

  const offer = bestOffer(robot);
  const saving = maxSaving(robot);
  const specs = Object.entries(robot.specs ?? {});

  return (
    <>
      {/* ---------- masthead ---------- */}
      <section className="bg-ink pb-14 pt-28 text-ink-foreground md:pb-20 md:pt-32">
        <div className="container">
          <nav aria-label="פירורי לחם" className="mb-8 flex items-center gap-1 text-xs text-ink-muted">
            <Link to="/" className="hover:text-ink-foreground">בית</Link>
            <ChevronLeft className="size-3" />
            {robot.category && (
              <>
                <Link
                  to={`/category/${robot.category.slug}`}
                  className="hover:text-ink-foreground"
                >
                  {robot.category.name}
                </Link>
                <ChevronLeft className="size-3" />
              </>
            )}
            <span className="text-ink-foreground">{robot.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <div>
              <Badge
                variant="outline"
                className="border-ink-foreground/25 bg-ink-foreground/10 text-ink-foreground"
              >
                {robot.brand}
              </Badge>

              <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {robot.name}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-ink-muted">
                {robot.summary}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                <div className="flex items-center gap-3">
                  <ScoreBadge score={robot.score} size="lg" className="text-ink-foreground" />
                  <div className="text-sm leading-5">
                    <p className="font-medium">הציון שלנו</p>
                    <Link
                      to="/methodology"
                      className="text-ink-muted underline underline-offset-4 hover:text-ink-foreground"
                    >
                      איך חישבנו
                    </Link>
                  </div>
                </div>

                <div className="h-10 w-px bg-ink-foreground/15" />

                <div className="text-sm leading-5">
                  <p className="text-ink-muted">
                    {offer?.store ? `הכי זול ב-${offer.store.name}` : "מחיר משוער"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    <bdi>{formatPrice(offer?.price ?? robot.price_from)}</bdi>
                  </p>
                </div>

                {saving > 0 && (
                  <Badge variant="solid" className="bg-signal text-signal-foreground">
                    השוואה חוסכת עד <bdi>{formatPrice(saving)}</bdi>
                  </Badge>
                )}
              </div>
            </div>

            <ProductImage
              src={robot.hero_image}
              alt={robot.name}
              priority
              className="aspect-[4/3] rounded-hero"
            />
          </div>
        </div>
      </section>

      {/* ---------- price comparison ---------- */}
      <section className="border-b border-border bg-background py-14 md:py-20">
        <div className="container">
          <Reveal>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              איפה לקנות — השוואת מחירים
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {robot.offers.length} חנויות מוכרות את הדגם הזה בישראל.
            </p>
            <div className="mt-8">
              <PriceTable robot={robot} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- verdict ---------- */}
      <section className="bg-background py-14 md:py-20">
        <div className="container grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="text-2xl font-semibold sm:text-3xl">מה טוב ומה פחות</h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <ul className="space-y-3">
                  {robot.pros.map((pro) => (
                    <li key={pro} className="flex gap-3 text-sm leading-6">
                      <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                      {pro}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-3">
                  {robot.cons.map((con) => (
                    <li
                      key={con}
                      className="flex gap-3 text-sm leading-6 text-muted-foreground"
                    >
                      <Minus className="mt-0.5 size-4 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {specs.length > 0 && (
              <Reveal className="mt-14">
                <h2 className="text-2xl font-semibold sm:text-3xl">מפרט</h2>
                <dl className="mt-8 divide-y divide-border border-y border-border">
                  {specs.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-6 py-4"
                    >
                      <dt className="text-sm text-muted-foreground">{key}</dt>
                      <dd className="text-sm font-medium text-start">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>

          {/* ---------- sidebar ---------- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div
              id="waitlist"
              className="scroll-mt-28 rounded-card border border-border p-6"
            >
              <h3 className="text-base font-semibold">שומרים על המחיר בעין</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                נעדכן אותך אם הדגם הזה יורד במחיר באחת החנויות.
              </p>
              <div className="mt-5">
                <LeadForm
                  type="newsletter"
                  payload={{ robot: robot.slug, intent: "price_drop" }}
                  cta="עדכנו אותי"
                  successTitle="נעקוב בשבילך"
                  successBody="נכתוב לך ברגע שהמחיר ירד."
                />
              </div>
            </div>

            <div className="mt-4 rounded-card bg-surface p-6">
              <h3 className="text-base font-semibold">לא בטוח שזה הדגם הנכון?</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                ארבע שאלות קצרות ונמליץ על שלושה דגמים שמתאימים לבית שלך.
              </p>
              <Link
                to="/find-my-robot"
                className="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
              >
                מצא את הרובוט שלי
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- related ---------- */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container">
          <h2 className="text-2xl font-semibold sm:text-3xl">דגמים דומים</h2>
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related
              .filter((item) => item.id !== robot.id)
              .slice(0, 3)
              .map((item, index) => (
                <Reveal key={item.id} delay={index * 80}>
                  <RobotCard robot={item} />
                </Reveal>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}

function RobotSkeleton() {
  return (
    <div className="bg-ink pb-20 pt-32">
      <div className="container">
        <div className="h-6 w-40 rounded bg-ink-foreground/10" />
        <div className="mt-6 h-12 w-2/3 rounded bg-ink-foreground/10" />
        <div className="mt-5 h-5 w-1/2 rounded bg-ink-foreground/10" />
      </div>
    </div>
  );
}
