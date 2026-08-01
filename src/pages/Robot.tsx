import { useMemo } from "react";
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
import { useJsonLd } from "@/hooks/useJsonLd";
import { bestOffer, maxSaving } from "@/lib/offers";
import { formatPrice } from "@/lib/format";
import NotFound from "@/pages/NotFound";

const ORIGIN = "https://buyrobots.co.il";

export default function Robot() {
  const { slug } = useParams();
  const { data: robot, isLoading } = useRobot(slug);
  const { data: related = [] } = useRobots({ limit: 3, sort: "score" });

  useDocumentMeta({
    title: robot ? `${robot.name} — מחיר, מפרט והשוואה` : "טוען…",
    description: robot?.summary ?? undefined,
    path: `/robot/${slug}`,
  });

  // Real offers only — no fabricated rating or review, since there is no
  // genuine review data model behind this catalogue yet.
  const productSchema = useMemo(() => {
    if (!robot) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: robot.name,
      brand: { "@type": "Brand", name: robot.brand },
      description: robot.summary ?? undefined,
      image: robot.hero_image ?? undefined,
      url: `${ORIGIN}/robot/${robot.slug}`,
      offers: robot.offers.map((offer) => ({
        "@type": "Offer",
        price: offer.price ?? undefined,
        priceCurrency: "ILS",
        availability: offer.in_stock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${ORIGIN}/robot/${robot.slug}`,
        seller: offer.store ? { "@type": "Organization", name: offer.store.name } : undefined,
      })),
    };
  }, [robot]);

  const breadcrumbSchema = useMemo(() => {
    if (!robot) return null;
    const items = [
      { name: "בית", url: `${ORIGIN}/` },
      ...(robot.category
        ? [{ name: robot.category.name, url: `${ORIGIN}/category/${robot.category.slug}` }]
        : []),
      { name: robot.name, url: `${ORIGIN}/robot/${robot.slug}` },
    ];
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }, [robot]);

  useJsonLd("product", productSchema);
  useJsonLd("breadcrumb", breadcrumbSchema);

  if (isLoading) return <RobotSkeleton />;
  if (!robot) return <NotFound />;

  const offer = bestOffer(robot);
  const saving = maxSaving(robot);
  const specs = Object.entries(robot.specs ?? {});

  return (
    <>
      {/* ---------- masthead ---------- */}
      <section className="relative overflow-hidden pb-14 pt-28 md:pb-20 md:pt-32">
        <div className="container">
          <nav aria-label="פירורי לחם" className="mb-8 flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">בית</Link>
            <ChevronLeft className="size-3" />
            {robot.category && (
              <>
                <Link
                  to={`/category/${robot.category.slug}`}
                  className="hover:text-foreground"
                >
                  {robot.category.name}
                </Link>
                <ChevronLeft className="size-3" />
              </>
            )}
            <span className="text-foreground">{robot.name}</span>
          </nav>

          {/* ---------- summary box ---------- */}
          {robot.verdict && (
            <div className="mb-10 rounded-[1.75rem] border border-accent/30 bg-accent/[0.06] p-6 md:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
                הפסק דין שלנו
              </p>
              <p className="mt-3 max-w-2xl text-lg font-medium leading-8">
                {robot.verdict}
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">הציון הסופי</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">
                    <bdi>{robot.score?.toFixed(1) ?? "—"}</bdi>
                  </p>
                </div>
                {robot.pros[0] && (
                  <div>
                    <p className="text-xs text-muted-foreground">יתרון מרכזי</p>
                    <p className="mt-1 text-sm leading-6">{robot.pros[0]}</p>
                  </div>
                )}
                {robot.cons[0] && (
                  <div>
                    <p className="text-xs text-muted-foreground">חיסרון מרכזי</p>
                    <p className="mt-1 text-sm leading-6">{robot.cons[0]}</p>
                  </div>
                )}
                {robot.best_for.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">מתאים במיוחד ל</p>
                    <p className="mt-1 text-sm leading-6">{robot.best_for.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <div>
              <Badge
                variant="outline"
                className="border-white/25 bg-white/10 text-foreground"
              >
                {robot.brand}
              </Badge>

              <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {robot.name}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                {robot.summary}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                <div className="flex items-center gap-3">
                  <ScoreBadge score={robot.score} size="lg" className="text-foreground" />
                  <div className="text-sm leading-5">
                    <p className="font-medium">הציון שלנו</p>
                    <Link
                      to="/methodology"
                      className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      איך חישבנו
                    </Link>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/15" />

                <div className="text-sm leading-5">
                  <p className="text-muted-foreground">
                    {offer?.store ? `הכי זול ב-${offer.store.name}` : "מחיר משוער"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    <bdi>{formatPrice(offer?.price ?? robot.price_from)}</bdi>
                  </p>
                </div>

                {saving > 0 && (
                  <Badge variant="solid" className="bg-accent text-accent-foreground">
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
      <section className="border-b border-white/10 bg-background py-14 md:py-20">
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
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
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
                <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
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
              className="scroll-mt-28 rounded-[1.5rem] border border-white/10 bg-surface p-6"
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

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-surface p-6">
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

      {/* ---------- who it's for ---------- */}
      {(robot.best_for.length > 0 || robot.not_for.length > 0) && (
        <section className="border-t border-white/10 bg-background py-14 md:py-20">
          <div className="container">
            <Reveal>
              <h2 className="text-2xl font-semibold sm:text-3xl">למי זה מתאים, ולמי לא</h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                {robot.best_for.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-accent">מתאים ל</p>
                    <ul className="mt-3 space-y-3">
                      {robot.best_for.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-6">
                          <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {robot.not_for.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">פחות מתאים ל</p>
                    <ul className="mt-3 space-y-3">
                      {robot.not_for.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-sm leading-6 text-muted-foreground"
                        >
                          <Minus className="mt-0.5 size-4 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- maintenance & warranty ---------- */}
      {(robot.maintenance_cost || robot.warranty || robot.spare_parts_availability) && (
        <section className="border-t border-white/10 bg-surface py-14 md:py-20">
          <div className="container">
            <Reveal>
              <h2 className="text-2xl font-semibold sm:text-3xl">עלויות ואחריות בישראל</h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-3">
                {robot.maintenance_cost && (
                  <div>
                    <p className="text-sm font-medium">עלויות תחזוקה</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {robot.maintenance_cost}
                    </p>
                  </div>
                )}
                {robot.warranty && (
                  <div>
                    <p className="text-sm font-medium">אחריות</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {robot.warranty}
                    </p>
                  </div>
                )}
                {robot.spare_parts_availability && (
                  <div>
                    <p className="text-sm font-medium">זמינות חלקי חילוף</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {robot.spare_parts_availability}
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

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
    <div className="pb-20 pt-32">
      <div className="container">
        <div className="h-6 w-40 rounded bg-white/10" />
        <div className="mt-6 h-12 w-2/3 rounded bg-white/10" />
        <div className="mt-5 h-5 w-1/2 rounded bg-white/10" />
      </div>
    </div>
  );
}
