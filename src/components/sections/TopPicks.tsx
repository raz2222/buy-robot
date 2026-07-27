import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { RobotCard, RobotCardSkeleton } from "@/components/product/RobotCard";
import { useRobots } from "@/data/queries";

/**
 * The highest-earning block on the page: three products, each one click from
 * a comparison table. Sits on the grey band so it reads as a curated shelf
 * rather than more of the feed.
 */
export function TopPicks() {
  const { data: robots = [], isLoading } = useRobots({ limit: 3, sort: "score" });

  return (
    <section id="top-picks" className="scroll-mt-24 bg-surface py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="הכי מומלצים"
          title="המובילים החודש"
          blurb="שלושת הדגמים עם הציון הגבוה ביותר כרגע, עם המחיר הזול ביותר שמצאנו בכל חנות."
          action={{ to: "/category/robot-vacuums", label: "לכל הרובוטים" }}
        />

        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <RobotCardSkeleton key={index} />
              ))
            : robots.map((robot, index) => (
                <Reveal key={robot.id} delay={index * 80}>
                  <RobotCard robot={robot} />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}
