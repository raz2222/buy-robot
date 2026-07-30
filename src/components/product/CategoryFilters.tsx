import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CategoryFilterState {
  brand: string | null;
  priceMax: number | null;
  inStockOnly: boolean;
}

export const DEFAULT_FILTERS: CategoryFilterState = {
  brand: null,
  priceMax: null,
  inStockOnly: false,
};

const PRICE_BRACKETS = [
  { label: "עד ₪2,000", value: 2000 },
  { label: "עד ₪4,000", value: 4000 },
  { label: "עד ₪7,000", value: 7000 },
];

/**
 * The reusable facet set for every category page. Brand and price come
 * straight off the robots already loaded for this category — no extra
 * network round trip, no full-page refresh, just a client-side filter over
 * data that's already in memory.
 *
 * More facets (pets, mopping, dock, LiDAR, noise level, warranty) belong
 * here too, but each needs a real boolean/enum column on `robots` first —
 * this component is built so adding one is a new `<Facet>` block, not a
 * rewrite.
 */
export function CategoryFilters({
  brands,
  value,
  onChange,
}: {
  brands: string[];
  value: CategoryFilterState;
  onChange: (next: CategoryFilterState) => void;
}) {
  const activeCount =
    (value.brand ? 1 : 0) + (value.priceMax ? 1 : 0) + (value.inStockOnly ? 1 : 0);

  return (
    <>
      {/* ---------- desktop: inline row ---------- */}
      <div className="hidden flex-wrap items-center gap-3 md:flex">
        <FilterFields brands={brands} value={value} onChange={onChange} />
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            איפוס סינון
          </button>
        )}
      </div>

      {/* ---------- mobile: bottom-sheet drawer ---------- */}
      <div className="md:hidden">
        <MobileFilterSheet brands={brands} value={value} onChange={onChange} activeCount={activeCount} />
      </div>
    </>
  );
}

function FilterFields({
  brands,
  value,
  onChange,
}: {
  brands: string[];
  value: CategoryFilterState;
  onChange: (next: CategoryFilterState) => void;
}) {
  return (
    <>
      <div>
        <label htmlFor="filter-brand" className="sr-only">
          מותג
        </label>
        <select
          id="filter-brand"
          value={value.brand ?? ""}
          onChange={(event) => onChange({ ...value, brand: event.target.value || null })}
          className="h-11 rounded-full border border-white/10 bg-background px-4 text-sm outline-none transition-colors focus:border-foreground"
        >
          <option value="">כל המותגים</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-price" className="sr-only">
          מחיר מקסימלי
        </label>
        <select
          id="filter-price"
          value={value.priceMax ?? ""}
          onChange={(event) =>
            onChange({ ...value, priceMax: event.target.value ? Number(event.target.value) : null })
          }
          className="h-11 rounded-full border border-white/10 bg-background px-4 text-sm outline-none transition-colors focus:border-foreground"
        >
          <option value="">כל המחירים</option>
          {PRICE_BRACKETS.map((bracket) => (
            <option key={bracket.value} value={bracket.value}>
              {bracket.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm">
        <input
          type="checkbox"
          checked={value.inStockOnly}
          onChange={(event) => onChange({ ...value, inStockOnly: event.target.checked })}
          className="size-4"
        />
        במלאי בלבד
      </label>
    </>
  );
}

function MobileFilterSheet({
  brands,
  value,
  onChange,
  activeCount,
}: {
  brands: string[];
  value: CategoryFilterState;
  onChange: (next: CategoryFilterState) => void;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="md" className="w-full justify-center">
          <SlidersHorizontal className="size-4" />
          סינון
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-accent text-xs text-accent-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md data-[state=open]:animate-fade-in" />
        <Dialog.Content
          dir="rtl"
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 rounded-t-[1.75rem] border-t border-white/10 bg-background p-6 pb-8",
            "data-[state=open]:animate-fade-up",
          )}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold">סינון</Dialog.Title>
            <Dialog.Close
              aria-label="סגירת סינון"
              className="grid size-10 place-items-center rounded-full border border-white/20 text-foreground"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <FilterFields brands={brands} value={value} onChange={onChange} />
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onChange(DEFAULT_FILTERS)}>
              איפוס
            </Button>
            <Dialog.Close asChild>
              <Button variant="accent" className="flex-1">
                הצג תוצאות
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
