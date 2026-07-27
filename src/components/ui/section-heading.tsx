import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LabelRule } from "@/components/ui/deco";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/**
 * Shared section header: a ruled label, the title, an optional blurb and a
 * "see all" link. The rule under the label is the design's signature — it
 * does the job a coloured eyebrow would, without spending the accent on
 * every single section.
 */
export function SectionHeading({
  eyebrow,
  title,
  blurb,
  action,
  align = "start",
}: {
  eyebrow?: string;
  title: ReactNode;
  blurb?: ReactNode;
  action?: { to: string; label: string };
  align?: "start" | "center";
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <LabelRule className="mb-6">{eyebrow}</LabelRule>}

        <h2 className="text-balance text-3xl font-medium sm:text-[2.6rem] sm:leading-[1.1]">
          {title}
        </h2>

        {blurb && (
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {blurb}
          </p>
        )}
      </div>

      {action && (
        <Link
          to={action.to}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm transition-colors duration-500 ease-smooth hover:border-transparent hover:bg-foreground hover:text-background"
        >
          {action.label}
          <ArrowLeft className="size-4 transition-transform duration-500 ease-smooth group-hover:-translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}
