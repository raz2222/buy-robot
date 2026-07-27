import { forwardRef, useRef, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArrowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "solid" | "accent";
  /** `diagonal` matches the reference's ↗ affordance for "open this". */
  direction?: "back" | "diagonal";
  /** Accessible name — the button has no visible label. */
  label: string;
}

/** Forwards a ref while the component also keeps its own handle on the node. */
function assignRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

const SIZES = {
  sm: "size-9 [&_svg]:size-4",
  md: "size-12 [&_svg]:size-[1.15rem]",
  lg: "size-14 [&_svg]:size-5",
};

const VARIANTS = {
  outline: "border border-white/30 text-foreground hover:border-white",
  solid: "bg-foreground text-background",
  accent: "bg-accent text-accent-foreground",
};

/**
 * The circular arrow button that carries most of the navigation in this
 * design.
 *
 * It tracks the pointer and leans a few pixels toward it — a "magnetic"
 * hover. The effect is deliberately small: enough that the button feels
 * alive under the cursor, not so much that it drifts away from where the
 * user aimed. Touch devices never fire the move handler, so they simply
 * get the plain button.
 */
export const ArrowButton = forwardRef<HTMLButtonElement, ArrowButtonProps>(
  (
    {
      className,
      asChild,
      size = "md",
      variant = "outline",
      direction = "back",
      label,
      ...props
    },
    forwardedRef,
  ) => {
    const Comp = asChild ? Slot : "button";
    const localRef = useRef<HTMLButtonElement | null>(null);
    const [pull, setPull] = useState({ x: 0, y: 0 });

    const onMove = (event: React.MouseEvent<HTMLButtonElement>) => {
      const node = localRef.current;
      if (!node) return;
      const box = node.getBoundingClientRect();
      // Offset from the centre, scaled right down so the travel stays under
      // ~4px however large the button is.
      setPull({
        x: (event.clientX - (box.left + box.width / 2)) * 0.28,
        y: (event.clientY - (box.top + box.height / 2)) * 0.28,
      });
    };

    const Icon = direction === "diagonal" ? ArrowUpLeft : ArrowLeft;

    return (
      <Comp
        ref={(node: HTMLButtonElement | null) => {
          localRef.current = node;
          assignRef(forwardedRef, node);
        }}
        aria-label={label}
        onMouseMove={onMove}
        onMouseLeave={() => setPull({ x: 0, y: 0 })}
        style={{ transform: `translate3d(${pull.x}px, ${pull.y}px, 0)` }}
        className={cn(
          "group/arrow relative grid shrink-0 place-items-center rounded-full",
          "transition-[transform,background-color,border-color,color] duration-300 ease-spring",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          SIZES[size],
          VARIANTS[variant],
          className,
        )}
        {...props}
      >
        {/* The icon slides out and a second one slides in behind it, so the
            arrow reads as "leaving" rather than just changing colour. */}
        <span className="relative grid size-full place-items-center overflow-hidden rounded-full">
          <Icon
            className={cn(
              "absolute transition-transform duration-500 ease-smooth",
              direction === "diagonal"
                ? "group-hover/arrow:-translate-x-5 group-hover/arrow:-translate-y-5"
                : "group-hover/arrow:-translate-x-6",
            )}
          />
          <Icon
            className={cn(
              "absolute transition-transform duration-500 ease-smooth",
              direction === "diagonal"
                ? "translate-x-5 translate-y-5 group-hover/arrow:translate-x-0 group-hover/arrow:translate-y-0"
                : "translate-x-6 group-hover/arrow:translate-x-0",
            )}
          />
        </span>
      </Comp>
    );
  },
);

ArrowButton.displayName = "ArrowButton";
