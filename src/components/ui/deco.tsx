import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section label with the hairline rule under it, straight from the
 * reference. Used instead of a coloured eyebrow — the rule does the work
 * a colour would, without spending the accent.
 */
export function LabelRule({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block border-b border-white/40 pb-2 text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Thin outlined pill — the reference's "News Article" tag. */
export function PillTag({
  children,
  tone = "outline",
  className,
}: {
  children: ReactNode;
  tone?: "outline" | "accent" | "light";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs leading-5",
        tone === "outline" && "border border-white/30 text-foreground",
        tone === "accent" && "bg-accent text-accent-foreground",
        tone === "light" && "bg-light text-light-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * The barcode strip and serial number. Pure decoration, and marked
 * `aria-hidden` because a screen reader announcing a barcode is noise —
 * the model number sits next to it as real text.
 */
export function Barcode({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end gap-3", className)}>
      <span
        aria-hidden="true"
        className="barcode h-9 flex-1 text-light-foreground/85"
      />
      <span className="shrink-0 text-[0.65rem] font-medium leading-3 tracking-wide">
        CODE
        <br />
        <bdi>{code}</bdi>
      </span>
    </div>
  );
}

/**
 * The notched "ticket" card that holds the featured product.
 *
 * Built from two blocks rather than a fixed `path()`: a raised tab on the
 * inline-start side and the body below it, joined by an inverted corner
 * drawn with a radial gradient. Every dimension is relative, so the shape
 * holds at any width — a hardcoded path would not.
 */
export function TicketCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* raised tab */}
      <div className="absolute start-0 top-0 h-16 w-[52%] rounded-t-[2rem] bg-light" />

      {/* the concave joint between tab and body */}
      <span
        aria-hidden="true"
        className="absolute start-[52%] top-10 size-6"
        style={{
          background:
            "radial-gradient(circle at 100% 100%, transparent 0 1.5rem, hsl(var(--light)) 1.5rem)",
        }}
      />

      <div className="relative mt-10 rounded-[2rem] rounded-ss-none bg-light text-light-foreground">
        {children}
      </div>
    </div>
  );
}

/**
 * Infinite ticker. The row is rendered twice and translated by exactly
 * half its width, so the loop point is seamless whatever the content.
 */
export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={cn("group/marquee relative flex overflow-hidden", className)}
      aria-hidden="true"
    >
      <div className="flex shrink-0 animate-marquee items-center group-hover/marquee:[animation-play-state:paused]">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-6 whitespace-nowrap px-6 text-sm text-muted-foreground"
          >
            {item}
            <span className="size-1 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}
