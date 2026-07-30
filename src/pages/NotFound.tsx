import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function NotFound() {
  useDocumentMeta({ title: "הדף לא נמצא" });
  const { data: categories = [] } = useCategories();

  return (
    <section className="flex min-h-[70vh] items-center bg-background py-24">
      <div className="container text-center">
        <p className="text-[7rem] font-semibold leading-none tracking-tight tabular-nums sm:text-[10rem]">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
          הדף הזה לא קיים
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-8 text-muted-foreground">
          יכול להיות שהקישור ישן, או שהדגם ירד מהמדף. אפשר להתחיל מכאן:
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/">לעמוד הבית</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link to="/find-my-robot">מצא את הרובוט שלי</Link>
          </Button>
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="rounded-full border border-white/10 px-4 py-2 text-sm transition-colors duration-200 hover:border-foreground"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
