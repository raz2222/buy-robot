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
 * A panel whose top edge steps down — the folder-tab silhouette the
 * reference gives every layer of its product card.
 *
 * The edge is high on the inline-start side for `tab` of the width, then
 * drops by `step`. The concave joint is a radial gradient rather than a
 * fixed `path()`, so the shape survives any width; a hardcoded path would
 * not.
 */
function NotchedPanel({
  color,
  tab,
  step,
  radius,
  children,
  className,
}: {
  /** Any CSS colour — passed through to both the tab and the joint. */
  color: string;
  /** Width of the raised half, as a CSS length or percentage. */
  tab: string;
  /** How far the edge drops, in rem. */
  step: number;
  radius: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute start-0 top-0"
        style={{
          width: tab,
          height: `${step + 2}rem`,
          background: color,
          borderStartStartRadius: radius,
          borderStartEndRadius: radius,
        }}
      />

      <span
        aria-hidden="true"
        className="absolute"
        style={{
          insetInlineStart: tab,
          top: `${step}rem`,
          width: "1.5rem",
          height: "1.5rem",
          background: `radial-gradient(circle at 100% 100%, transparent 0 1.5rem, ${color} 1.5rem)`,
        }}
      />

      <div
        className="relative"
        style={{
          marginTop: `${step}rem`,
          background: color,
          borderRadius: radius,
          borderStartStartRadius: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The "ticket" card that holds the featured product: three notched planes
 * cascading into each other — light shell, accent card, artwork — each
 * stepping a little lower and tabbing a little narrower than the one
 * above it, exactly as the reference stacks them.
 */
export function TicketCard({
  media,
  footer,
  children,
  className,
}: {
  /** The artwork, rendered inside the innermost notched plane. */
  media: ReactNode;
  /** The row under the artwork, inside the accent plane. */
  footer: ReactNode;
  /** Everything below the accent plane, on the light shell. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <NotchedPanel
      color="hsl(var(--light))"
      tab="62%"
      step={1.75}
      radius="2rem"
      className={cn("text-light-foreground", className)}
    >
      <div className="px-3 pb-5 pt-1">
        <NotchedPanel
          color="hsl(var(--accent))"
          tab="54%"
          step={1.5}
          radius="1.6rem"
        >
          <div className="px-2.5 pb-2.5">
            <NotchedPanel
              color="hsl(var(--background))"
              tab="46%"
              step={1.25}
              radius="1.3rem"
            >
              {media}
            </NotchedPanel>

            <div className="pt-3 text-accent-foreground">{footer}</div>
          </div>
        </NotchedPanel>

        {children}
      </div>
    </NotchedPanel>
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
