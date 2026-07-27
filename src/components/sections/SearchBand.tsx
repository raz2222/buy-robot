import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { useCategories } from "@/data/queries";

/**
 * The funnel entrance: one line of intent, one control. Sits directly under
 * the hero because a visitor who did not want the featured robot needs a way
 * to steer within one screen.
 */
export function SearchBand() {
  const { data: categories = [] } = useCategories();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (category && !term.trim()) {
      navigate(`/category/${category}`);
      return;
    }
    const params = new URLSearchParams();
    if (term.trim()) params.set("q", term.trim());
    if (category) params.set("category", category);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
            איזה רובוט מתאים לבית שלך?
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            ריכזנו את כל הדגמים שנמכרים בישראל, עם המחיר בכל חנות במקום אחד.
          </p>
        </Reveal>

        <Reveal delay={120} className="mx-auto mt-8 max-w-3xl">
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3 rounded-card border border-border bg-background p-3 shadow-card md:flex-row md:items-center md:rounded-full md:p-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-muted-foreground" />
              <label className="sr-only" htmlFor="hero-search">
                חיפוש לפי דגם או מותג
              </label>
              <input
                id="hero-search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="חפשו דגם, מותג או צורך — למשל ״שיער של כלב״"
                className="h-12 w-full rounded-full bg-transparent pe-4 ps-11 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="h-px bg-border md:h-8 md:w-px" />

            <label className="sr-only" htmlFor="hero-category">
              קטגוריה
            </label>
            <select
              id="hero-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-12 rounded-full bg-transparent px-4 text-sm outline-none md:w-52"
            >
              <option value="">כל הקטגוריות</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <Button type="submit" size="lg" className="h-12 shrink-0">
              חיפוש
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
