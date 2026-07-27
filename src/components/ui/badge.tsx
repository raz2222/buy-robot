import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-chip px-3 py-1 text-xs font-medium leading-5",
  {
    variants: {
      variant: {
        /** Category chip that sits on top of card artwork. */
        default: "bg-background text-foreground shadow-sm",
        outline: "border border-border bg-background text-muted-foreground",
        solid: "bg-foreground text-background",
        signal: "bg-signal/10 text-signal",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
