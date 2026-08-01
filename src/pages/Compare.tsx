import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ChevronLeft, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ScoreBadge } from "@/components/product/ScoreBadge";
import { MeasureTable } from "@/components/product/ComparisonMeasures";
import { ProductImage } from "@/components/ui/product-image";
import { useRobot } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { track } from "@/lib/analytics";
import { bestOffer } from "@/lib/offers";
import { formatPrice } from "@/lib/format";
import type { RobotWithOffers } from "@/types";
import NotFound from "@/pages/NotFound";

/**
 * The product-vs-product template (as opposed to CompareLab's up-to-three
 * picker on the home page). Two real products, side by side, at a URL that
 * can be shared and indexed: /compare/:slugA/:slugB.
 *
 * Deliberately does not force a single overall "winner" — the objective
 * measures table can show one, but the verdict copy states which use case
 * each product actually fits, because that's what's true and what a
 * shopper comparing two specific models needs.
 */
export default function Compare() {
  const { slugA, slugB } = useParams();
  const { data: robotA, isLoading: loadingA } = useRobot(slugA);
  const { data: robotB, isLoading: loadingB } = useRobot(slugB);

  useDocumentMeta({
    title:
      robotA && robotB
        ? `${robotA.name} מול ${robotB.name} — השוואה`
        : "השוואת רובוטים",
    description:
      robotA && robotB
        ? `השוואה בין ${robotA.name} ל-${robotB.name}: ציון, מחיר, יתרונות וחסרונות.`
        : undefined,
    path: `/compare/${slugA}/${slugB}`,
  });

  const winner = useMemo(() => {
    if (!robotA || !robotB) return null;
    return (robotA.score ?? 0) >= (robotB.score ?? 0) ? robotA : robotB;
  }, [robotA, robotB]);

  if (loadingA || loadingB) {
    return (
      <div className="container py-32">
        <div className="skeleton h-10 w-2/3 rounded" />
        <div className="skeleton mt-6 h-5 w-full rounded" />
      </div>
    );
  }

  if (!robotA || !robotB) return <NotFound />;

  return (
    <>
      <section className="pb-14 pt-28 md:pb-16 md:pt-32">
        <div className="container">
          <nav aria-label="פירורי לחם" className="mb-8 flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/comparisons" className="hover:text-foreground">השוואות</Link>
            <ChevronLeft className="size-3" />
            <span className="text-foreground">
              {robotA.name} מול {robotB.name}
            </span>
          </nav>

          <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            <span dir="ltr">{robotA.name}</span> מול <span dir="ltr">{robotB.name}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            {winner
              ? `לפי הציון שלנו, ${winner.name} מוביל, אבל הבחירה הנכונה תלויה במה שהכי חשוב לכם.`
              : "שני דגמים קרובים בציון — הבחירה תלויה במה שהכי חשוב לכם."}
          </p>
        </div>
      </section>

      {/* ---------- side by side ---------- */}
      <section className="border-y border-white/10 bg-background py-14 md:py-20">
        <div className="container grid gap-8 sm:grid-cols-2">
          {[robotA, robotB].map((robot) => (
            <ProductColumn key={robot.id} robot={robot} />
          ))}
        </div>
      </section>

      {/* ---------- measures ---------- */}
      <Reveal className="bg-surface py-14 md:py-20">
        <div className="container">
          <h2 className="text-2xl font-semibold sm:text-3xl">השוואה במספרים</h2>
          <div className="mt-8">
            <MeasureTable selection={[robotA, robotB]} />
          </div>
        </div>
      </Reveal>

      {/* ---------- verdict ---------- */}
      <section className="bg-background py-14 md:py-20">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">הפסק דין שלנו</h2>
          <div className="mt-6 space-y-4 text-base leading-8 text-muted-foreground">
            <p>
              <strong className="font-medium text-foreground" dir="ltr">
                {robotA.name}
              </strong>
              {": "}
              {robotA.verdict ?? robotA.summary ?? "מידע מלא בעמוד המוצר."}
            </p>
            <p>
              <strong className="font-medium text-foreground" dir="ltr">
                {robotB.name}
              </strong>
              {": "}
              {robotB.verdict ?? robotB.summary ?? "מידע מלא בעמוד המוצר."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductColumn({ robot }: { robot: RobotWithOffers }) {
  const offer = bestOffer(robot);

  return (
    <Reveal>
      <div className="rounded-[1.75rem] border border-white/10 bg-surface p-5">
        <ProductImage
          src={robot.hero_image}
          alt={robot.name}
          className="aspect-[4/3] rounded-[1.25rem]"
        />

        <h2 className="mt-4 text-lg font-semibold" dir="ltr">
          {robot.name}
        </h2>

        <div className="mt-3 flex items-center gap-3">
          <ScoreBadge score={robot.score} className="text-foreground" />
          <p className="text-lg font-semibold tabular-nums text-accent">
            <bdi>{formatPrice(offer?.price ?? robot.price_from)}</bdi>
          </p>
        </div>

        {robot.best_for.length > 0 && (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">מתאים ל: </span>
            {robot.best_for.join(", ")}
          </p>
        )}

        <div className="mt-5 grid gap-2">
          {robot.pros.slice(0, 3).map((pro) => (
            <p key={pro} className="flex gap-2 text-sm leading-6">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              {pro}
            </p>
          ))}
          {robot.cons.slice(0, 2).map((con) => (
            <p key={con} className="flex gap-2 text-sm leading-6 text-muted-foreground">
              <Minus className="mt-0.5 size-4 shrink-0" />
              {con}
            </p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to={`/robot/${robot.slug}`}>לפרטים המלאים</Link>
          </Button>
          <Button asChild size="sm" variant="accent" className="flex-1">
            <Link
              to={`/robot/${robot.slug}`}
              onClick={() => track("price_check_click", { slug: robot.slug, from: "compare" })}
            >
              בדיקת מחיר
            </Link>
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
