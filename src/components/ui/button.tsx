import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Every button is a pill, and every pill fills from the inside on hover:
 * a circle scales up from the centre behind the label instead of the
 * background colour snapping. It costs one pseudo-element and is the
 * difference between "styled" and "designed".
 */
const buttonVariants = cva(
  [
    "group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-medium",
    "transition-[color,border-color,transform] duration-300 ease-smooth",
    "before:absolute before:inset-0 before:-z-10 before:rounded-full before:transition-transform before:duration-500 before:ease-smooth",
    "before:scale-x-0 before:origin-[100%_50%] hover:before:scale-x-100",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300",
  ].join(" "),
  {
    variants: {
      variant: {
        /** The primary action: white pill that fills periwinkle on hover. */
        default:
          "bg-foreground text-background before:bg-accent hover:text-accent-foreground",
        /** The accent action — already periwinkle, fills white. */
        accent:
          "bg-accent text-accent-foreground before:bg-foreground hover:text-background",
        /** Quiet outline for secondary actions on the dark canvas. */
        outline:
          "border border-white/25 text-foreground before:bg-foreground hover:border-transparent hover:text-background",
        /** Sits on the one light panel. */
        onLight:
          "bg-light-foreground text-light before:bg-accent hover:text-accent-foreground",
        ghost:
          "text-muted-foreground before:bg-white/10 hover:text-foreground",
        link: "text-foreground underline-offset-4 before:hidden hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-[3.25rem] px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
