import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowButton } from "@/components/ui/arrow-button";
import { Button } from "@/components/ui/button";
import { Barcode, LabelRule, PillTag, TicketCard } from "@/components/ui/deco";
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

  if (robots.length === 0) return <div className="h-screen" />;

  const robot = robots[index];
  const best = robot.offers?.[0];

  return (
    <section
      {...containerProps}
      className="relative isolate flex min-h-[46rem] items-center overflow-hidden pb-20 pt-32 lg:h-[100svh] lg:min-h-[48rem]"
      aria-roledescription="carousel"
      aria-label="הדגמים המובילים"
    >
      {/* ---------- bleeding artwork ---------- */}
      <div
        className="absolute inset-y-0 end-0 -z-10 w-full lg:w-[54%]"
        style={{ transform: `translate3d(0, ${scroll * 0.16}px, 0)` }}
      >
        {robots.map((item, itemIndex) => (
          <div
            key={item.id}
            aria-hidden={itemIndex !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1200ms] ease-smooth",
              itemIndex === index ? "opacity-100" : "opacity-0",
            )}
          >
            <ProductImage
              src={item.hero_image}
              alt=""
              priority={itemIndex === 0}
              className="size-full"
            />
          </div>
        ))}

        {/* Fades the photograph into the canvas on its inner edge so it
            reads as bleeding out of the page rather than as a pasted box.
            The artwork sits on the inline-end side, so in this RTL layout
            its inner edge is the physical right — hence `to-r`. */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/85 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/80" />
        {/* Lifestyle photography is far brighter than the cut-out renders
            this layout was designed around; this keeps it from washing the
            canvas out. */}
        <div className="absolute inset-0 bg-background/45" />
      </div>

      {/* A slow periwinkle bloom behind the product. */}
      <div
        aria-hidden="true"
        className="absolute -z-10 end-[10%] top-1/4 size-[38rem] animate-drift rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "hsl(var(--accent))" }}
      />

      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-[20rem_1fr] lg:gap-16">
          {/* ---------- ticket card ---------- */}
          <div
            {...entrance(ready, 120, "order-2 mx-auto w-full max-w-[20rem] lg:order-1")}
          >
            <TicketCard>
              <div className="p-3.5">
                <div className="relative overflow-hidden rounded-[1.35rem] bg-background">
                  <ProductImage
                    src={robot.hero_image}
                    alt={robot.name}
                    priority
                    className="aspect-[4/5]"
                  />
                </div>

                <div className="mt-3.5 flex items-center justify-between gap-3 rounded-[1.35rem] bg-accent p-3 ps-5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-semibold text-accent-foreground">
                      {robot.name}
                    </span>
                  </span>
                  <ArrowButton
                    asChild
                    size="md"
                    variant="solid"
                    direction="diagonal"
                    label={`לעמוד ${robot.name}`}
                    className="border-0 bg-light-foreground text-light"
                  >
                    <Link to={`/robot/${robot.slug}`} />
                  </ArrowButton>
                </div>

                {/* carousel dots */}
                <div
                  className="mt-4 flex justify-center gap-2"
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

                <Barcode
                  code={String(robot.score ?? 0).replace(".", "")}
                  className="mt-4 px-1 pb-1"
                />
              </div>
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
                "mt-7 max-w-2xl text-balance text-[2.4rem] font-medium leading-[1.12] sm:text-[3rem] lg:text-[3.6rem]",
              )}
            >
              כל רובוט שנמכר כאן,
              <br />
              <span className="text-accent">והמחיר בכל חנות</span>
            </h1>

            <p
              {...entrance(
                ready,
                280,
                "mt-6 max-w-md text-base leading-8 text-muted-foreground",
              )}
            >
              ריכזנו את הדגמים, השווינו מחירים בין KSP, Ivory, זאפ ואמזון,
              ובדקנו מי בכלל מתקן אותם בארץ.
            </p>

            {/* ---------- the rotating product strip ---------- */}
            <div
              {...entrance(
                ready,
                380,
                "mt-10 flex max-w-lg flex-wrap items-center gap-x-8 gap-y-5 rounded-[1.5rem] border border-white/10 bg-surface/70 p-5 backdrop-blur-md",
              )}
            >
              <div className="min-w-0 flex-1">
                <PillTag className="mb-2">{robot.category?.name ?? "מומלץ"}</PillTag>
                <p className="truncate text-lg font-medium" dir="ltr">
                  {robot.name}
                </p>
              </div>

              <div className="text-center">
                <p className="text-[0.7rem] text-muted-foreground">ציון</p>
                <p className="text-2xl font-medium tabular-nums">
                  <bdi>{robot.score?.toFixed(1) ?? "—"}</bdi>
                </p>
              </div>

              <span className="h-9 w-px bg-white/15" />

              <div>
                <p className="text-[0.7rem] text-muted-foreground">
                  {best ? `הכי זול ב-${best.store?.name}` : "בקרוב"}
                </p>
                <p className="text-2xl font-medium tabular-nums text-accent">
                  <bdi>{formatPrice(robot.price_from)}</bdi>
                </p>
              </div>
            </div>

            <div {...entrance(ready, 460, "mt-8 flex flex-wrap items-center gap-3")}>
              <Button asChild size="lg">
                <Link to={`/robot/${robot.slug}`}>השווה מחירים</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/find-my-robot">ענה על 4 שאלות</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
