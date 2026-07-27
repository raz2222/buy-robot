import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Wordmark. The Latin brand name stays left-to-right inside the RTL
 * layout, which is why it sits in its own `dir="ltr"` box.
 *
 * The mark's eyes track nothing and blink never — but the head tilts a
 * few degrees on hover, which is enough personality for a logo.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      dir="ltr"
      aria-label="buy robots — לעמוד הבית"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="grid size-8 place-items-center text-foreground transition-transform duration-500 ease-spring group-hover:-rotate-12">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <rect
            x="3.5"
            y="6"
            width="17"
            height="13"
            rx="4.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="9" cy="12.5" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12.5" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[1.35rem] font-semibold leading-none tracking-tight">
        buy robots
      </span>
    </Link>
  );
}
