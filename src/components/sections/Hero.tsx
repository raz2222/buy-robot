import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowButton } from "@/components/ui/arrow-button";
import { Button } from "@/components/ui/button";
import {
  ArticleCard,
  Barcode,
  LabelRule,
  PillTag,
  TicketCard,
} from "@/components/ui/deco";
import { ProductImage } from "@/components/ui/product-image";
import { useCarousel } from "@/hooks/useCarousel";
import { formatPrice } from "@/lib/format";
import type { RobotWithOffers } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Entrance classes for the hero copy.
 *
 * Deliberately a transition and not a CSS animation. An animation that
 * starts at `opacity: 0` leaves the text invisible anywhere animations do
 * not tick — a background tab, a headless screenshotter, a crawler that
 * pre-renders. A transition resolves to its end value in those cases, so
 * the worst outcome is copy that appears without moving.
 */
function entrance(ready: boolean, delay: number, extra?: string) {
  return {
    className: cn(
      "transition-all duration-[900ms] ease-smooth",
      ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      extra,
    ),
    style: { transitionDelay: `${delay}ms` },
  };
}

export function Hero({ robots }: { robots: RobotWithOffers[] }) {
  const { index, go, containerProps } = useCarousel(robots.length);
  const [ready, setReady] = useState(false);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(timer);
  }, [index]);

  // Parallax on the bleeding artwork. rAF-throttled so a fast scroll never
  // queues more work than the compositor can draw.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScroll(window.scrollY);
        frame = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // Smoothly brings the embedded calculator into view — respects a
  // visitor's reduced-motion preference instead of forcing the animation.
  const scrollToFinder = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById("finder")
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  if (robots.length === 0) return <div className="h-screen" />;

  const robot = robots[index];
  const best = robot.offers?.[0];

  return (
    <section
      {...containerProps}
      className="relative isolate flex items-center overflow-hidden pb-20 pt-28 lg:min-h-[100svh] lg:pb-16"
      aria-roledescription="carousel"
      aria-label="הדגמים המובילים"
    >
      {/* ---------- bleeding brand artwork ----------
          A cut-out render bleeding off the inline-end edge, the way the
          reference stages its robot. Deliberately *not* the carousel's
          current product: a generic render captioned with a specific model
          name would misrepresent what the shopper is buying. The real
          photograph of the real product stays on the ticket card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 select-none"
        style={{
          // Bleeds off the inline-end edge *and* the top, the way the
          // reference crops its render — a subject fully inside the frame
          // reads as an illustration; one that leaves the frame reads as
          // scale.
          insetInlineEnd: "-14%",
          top: "-8%",
          width: "min(78vw, 62rem)",
          transform: `translate3d(0, ${scroll * 0.14}px, 0)`,
        }}
      >
        <img
          src="/images/cutouts/vacuum-a.png"
          alt=""
          className="w-full opacity-40 [filter:grayscale(0.6)_brightness(0.55)_contrast(1.15)] lg:opacity-[0.72]"
        />
        {/* Sinks the render's near edge into the canvas so it reads as
            bleeding out of the page rather than as a pasted box. */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      {/* A slow periwinkle bloom behind the product. */}
      <div
        aria-hidden="true"
        className="absolute -z-10 end-[10%] top-1/4 size-[38rem] animate-drift rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "hsl(var(--accent))" }}
      />

      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-[20rem_1fr] lg:gap-16">
          {/* ---------- ticket card ---------- */}
          <div
            {...entrance(ready, 120, "order-2 mx-auto w-full max-w-[20rem] lg:order-1")}
          >
            <TicketCard
              media={
                <ProductImage
                  src={robot.hero_image}
                  alt={robot.name}
                  priority
                  className="aspect-[4/5] rounded-[1.3rem] rounded-ss-none"
                />
              }
              footer={
                <div className="flex items-center justify-between gap-3 px-1.5 pb-1">
                  <span className="min-w-0 flex-1 truncate text-base font-semibold">
                    {robot.name}
                  </span>
                  <ArrowButton
                    asChild
                    size="md"
                    variant="outline"
                    direction="diagonal"
                    label={`לעמוד ${robot.name}`}
                    className="border-accent-foreground/50 hover:border-accent-foreground"
                  >
                    <Link to={`/robot/${robot.slug}`} />
                  </ArrowButton>
                </div>
              }
            >
              {/* carousel dots */}
              <div
                className="mt-4 flex justify-center gap-2.5"
                role="tablist"
                aria-label="בחירת דגם"
              >
                {robots.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={itemIndex === index}
                    aria-label={item.name}
                    onClick={() => go(itemIndex)}
                    className={cn(
                      "size-3 rounded-full border-[1.5px] border-light-foreground transition-all duration-500 ease-spring",
                      itemIndex === index
                        ? "bg-light-foreground"
                        : "bg-transparent hover:scale-125",
                    )}
                  />
                ))}
              </div>

              <p className="mt-4 px-1 text-[0.8rem] leading-6 text-light-foreground/75 line-clamp-2">
                {robot.summary}
              </p>

              {/* The commercial payload. The reference has only a serial
                  here, but this is a price-comparison site — the cheapest
                  price is the reason the card exists. */}
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-light-foreground/15 px-1 pt-3">
                <div className="min-w-0">
                  <p className="truncate text-[0.7rem] text-light-foreground/60">
                    {best ? `הכי זול ב-${best.store?.name}` : "מחיר משוער"}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    <bdi>{formatPrice(robot.price_from)}</bdi>
                  </p>
                </div>
                <PillTag className="border-light-foreground/30 text-light-foreground">
                  <bdi>{robot.score?.toFixed(1) ?? "—"}</bdi>
                </PillTag>
              </div>

              <Barcode
                code={String(robot.score ?? 0).replace(".", "")}
                className="mt-4 px-1"
              />
            </TicketCard>
          </div>

          {/* ---------- headline column ---------- */}
          <div className="order-1 lg:order-2">
            <div {...entrance(ready, 60)}>
              <LabelRule>הרובוטים שנמכרים בישראל, במקום אחד</LabelRule>
            </div>

            {/* The headline is the site's promise, not the rotating product
                — a page whose <h1> changes every six seconds tells a search
                engine nothing and a reader less. */}
            <h1
              {...entrance(
                ready,
                180,
                "mt-8 max-w-[19ch] text-balance text-[2.6rem] font-medium leading-[1.1] sm:text-[3.4rem] lg:text-[4.2rem]",
              )}
            >
              משווים רובוטים ביתיים.
              <br />
              <span className="text-accent">קונים נכון.</span>
            </h1>

            <p
              {...entrance(
                ready,
                280,
                "mt-7 max-w-md text-base leading-8 text-muted-foreground",
              )}
            >
              ענו על כמה שאלות וקבלו התאמה אישית של הרובוטים המתאימים ביותר
              לבית, לצרכים ולתקציב שלכם.
            </p>

            <div {...entrance(ready, 460, "mt-10 flex flex-wrap items-center gap-3")}>
              <Button size="lg" onClick={scrollToFinder}>
                התחילו התאמה אישית
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/comparisons">לכל ההשוואות</Link>
              </Button>
            </div>

            {/* ---------- editorial specimen ---------- */}
            <div {...entrance(ready, 560, "mt-8 max-w-sm")}>
              <ArticleCard
                tag={robot.category?.name ?? "מדריך קנייה"}
                date={new Date().toLocaleDateString("he-IL")}
                title="מה באמת משנה בקטגוריה הזאת, ומה רק נשמע טוב על הקופסה"
                action={
                  <Button asChild size="sm" variant="accent" className="h-8 px-4">
                    <Link to="/guides">למדריך</Link>
                  </Button>
                }
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
