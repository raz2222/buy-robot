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
 * The "ticket" card that holds the featured product.
 *
 * Three nested planes, exactly as the reference stacks them: a light grey
 * shell, an accent card inset inside it, and the artwork inset inside
 * that. The grey shell's top edge steps — a folder tab on the inline-start
 * half, joined to the lower half by an inverted corner. The step is drawn
 * with a radial gradient rather than a fixed `path()`, so the silhouette
 * survives any width.
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
      {/* the raised half of the top edge */}
      <div className="absolute start-0 top-0 h-14 w-[56%] rounded-t-[2rem] bg-light" />

      {/* the concave joint down to the lower half */}
      <span
        aria-hidden="true"
        className="absolute start-[56%] top-[1.75rem] size-7"
        style={{
          background:
            "radial-gradient(circle at 100% 100%, transparent 0 1.75rem, hsl(var(--light)) 1.75rem)",
        }}
      />

      <div className="relative mt-7 rounded-[2rem] rounded-ss-none bg-light pb-5 text-light-foreground">
        {children}
      </div>
    </div>
  );
}

/**
 * The dark editorial card that sits under the hero headline in the
 * reference — a piece of the site's own content shown as a specimen, so
 * the hero proves there is substance behind it rather than just claiming
 * there is.
 */
export function ArticleCard({
  tag,
  date,
  title,
  action,
  className,
}: {
  tag: string;
  date: string;
  title: string;
  action: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/10 bg-surface/80 p-5 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="grid size-9 place-items-center rounded-full border border-white/15">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="3.5" y="6" width="17" height="13" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="9" cy="12.5" r="1.5" fill="currentColor" />
            <circle cx="15" cy="12.5" r="1.5" fill="currentColor" />
          </svg>
        </span>
        {action}
        <span className="ms-auto text-xs text-muted-foreground tabular-nums">
          <bdi>{date}</bdi>
        </span>
      </div>

      <PillTag className="mt-4">{tag}</PillTag>

      <p className="mt-3 text-[0.95rem] leading-7">{title}</p>
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
