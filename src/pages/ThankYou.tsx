import { Link, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { RobotCard } from "@/components/product/RobotCard";
import { useRobots } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

interface QuizState {
  slugs?: string[];
  answers?: Record<string, string>;
}

export default function ThankYou() {
  useDocumentMeta({ title: "ההמלצות שלך", path: "/thank-you" });

  const { state } = useLocation() as { state: QuizState | null };
  const slugs = state?.slugs ?? [];
  const { data: robots = [] } = useRobots();

  const picks = slugs
    .map((slug) => robots.find((robot) => robot.slug === slug))
    .filter((robot): robot is (typeof robots)[number] => Boolean(robot));

  return (
    <>
      <section className="pb-16 pt-28 md:pt-36">
        <div className="container max-w-2xl text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-accent-foreground">
            <Check className="size-7" />
          </span>
          <h1 className="mt-6 text-balance text-3xl font-semibold sm:text-4xl">
            {picks.length > 0 ? "אלה הדגמים שמתאימים לך" : "תודה, קיבלנו"}
          </h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            {picks.length > 0
              ? "שלחנו לך גם למייל, כדי שיהיה שמור. לחיצה על כל דגם תפתח את השוואת המחירים המלאה."
              : "נחזור אליך במייל בהקדם."}
          </p>
        </div>
      </section>

      {picks.length > 0 && (
        <section className="bg-background py-14 md:py-20">
          <div className="container">
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((robot, index) => (
                <Reveal key={robot.id} delay={index * 80}>
                  <RobotCard robot={robot} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-surface py-14 md:py-20">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl font-semibold">מה עכשיו?</h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            אם אף אחד מהם לא מדויק, שווה לקרוא את מדריך הקנייה של הקטגוריה —
            שם מוסבר מה באמת משנה ומה רק נשמע טוב על הקופסה.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/guides">למדריכי הקנייה</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/find-my-robot">לענות שוב על השאלון</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
