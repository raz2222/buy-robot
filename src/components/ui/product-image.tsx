import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Eager-load the one image that is above the fold; lazy-load the rest. */
  priority?: boolean;
  /** Slow zoom used by the hero. */
  kenBurns?: boolean;
}

/**
 * Product artwork with a graceful fallback.
 *
 * Official manufacturer photography is uploaded per product from the admin.
 * Until a product has one — and if a URL ever 404s — this renders a quiet
 * monochrome field instead of a broken image icon, so a half-populated
 * catalogue still looks deliberate.
 */
export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  kenBurns = false,
}: ProductImageProps) {
  // Keyed by `src`, so a component that is reused for a different product —
  // the hero carousel reuses one instance for every slide — never inherits
  // the previous image's failure and falls back for a URL that is fine.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          // React 18 does not map a camelCase `fetchPriority`, so the
          // attribute is set with its DOM spelling to avoid a dev warning.
          {...{ fetchpriority: priority ? "high" : "auto" }}
          onError={() => setFailedSrc(src!)}
          className={cn(
            "h-full w-full object-cover",
            kenBurns && "animate-ken-burns",
          )}
        />
      ) : (
        <div
          className={cn(
            "art-placeholder h-full w-full",
            kenBurns && "animate-ken-burns",
          )}
          role="img"
          aria-label={alt}
        >
          {/* A faint schematic grid keeps the empty state from reading as a
              loading failure. */}
          <svg
            className="h-full w-full opacity-[0.07]"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      )}
    </div>
  );
}
