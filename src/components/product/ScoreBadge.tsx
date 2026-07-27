import { formatScore } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The editorial score, drawn as a ring that fills in proportion to the value.
 * Rendered as a single accessible label so a screen reader announces
 * "ציון 9.4 מתוך 10" rather than reading the decorative arc.
 */
export function ScoreBadge({
  score,
  size = "md",
  className,
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (!score) return null;

  const dimensions = { sm: 40, md: 52, lg: 76 }[size];
  const stroke = { sm: 3, md: 3.5, lg: 5 }[size];
  const radius = (dimensions - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 10) * circumference;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: dimensions, height: dimensions }}
      role="img"
      aria-label={`ציון ${formatScore(score)} מתוך 10`}
    >
      <svg
        width={dimensions}
        height={dimensions}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-current opacity-15"
        />
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="text-current transition-[stroke-dasharray] duration-700 ease-smooth"
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 grid place-items-center font-semibold tabular-nums",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-xl",
        )}
        aria-hidden="true"
      >
        {formatScore(score)}
      </span>
    </div>
  );
}
