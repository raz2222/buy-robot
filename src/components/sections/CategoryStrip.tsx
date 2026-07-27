import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { useCategories } from "@/data/queries";

/**
 * Category tiles. Doubles as internal linking for search engines and as the
 * "none of the featured ones are for me" escape hatch for shoppers.
 */
export function CategoryStrip() {
  const { data: categories = [] } = useCategories();

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="לפי סוג"
          title="כל הקטגוריות"
          blurb="מהשואב שכולם מכירים ועד מכסחת דשא ורובוט בריכה."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={(index % 4) * 60}>
              <Link
                to={`/category/${category.slug}`}
                className="sheen group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface p-6 transition-colors duration-500 ease-smooth hover:border-white/25"
              >
                {/* An accent wash rises from the bottom on hover instead of
                    the card lifting — nothing on a black canvas casts a
                    believable shadow anyway. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-accent/15 to-transparent transition-[height] duration-700 ease-smooth group-hover:h-full"
                />

                <span className="relative grid size-12 place-items-center rounded-full border border-white/15 text-muted-foreground transition-colors duration-500 group-hover:border-accent group-hover:text-accent">
                  <CategoryIcon name={category.icon} className="size-5" />
                </span>

                <h3 className="relative mt-6 text-base font-medium">
                  {category.name}
                </h3>
                <p className="relative mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {category.tagline}
                </p>

                <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm text-accent">
                  לצפייה
                  <ArrowLeft className="size-4 transition-transform duration-500 ease-smooth group-hover:-translate-x-1.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
