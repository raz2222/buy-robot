import { Link } from "react-router-dom";
import { useAdminRobots, useTogglePublish } from "@/admin/adminQueries";
import { useCategories } from "@/data/queries";
import { formatPrice, formatScore } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Robots() {
  const { data: robots = [], isLoading } = useAdminRobots();
  const { data: categories = [] } = useCategories();
  const toggle = useTogglePublish("robots");

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">רובוטים</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <bdi>{robots.length}</bdi> דגמים. לחיצה על דגם פותחת את עורך המחירים
          והקישורים.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">טוען…</p>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-background">
          <ul className="divide-y divide-border">
            {robots.map((robot) => (
              <li key={robot.id}>
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <Link
                    to={`/admin/robots/${robot.id}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm font-medium">{robot.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {robot.brand} ·{" "}
                      {categories.find((c) => c.id === robot.category_id)?.name ??
                        "ללא קטגוריה"}
                    </p>
                  </Link>

                  <span className="text-sm tabular-nums text-muted-foreground">
                    <bdi>{formatScore(robot.score)}</bdi>
                  </span>

                  <span className="w-24 text-sm tabular-nums">
                    <bdi>{formatPrice(robot.price_from)}</bdi>
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      toggle.mutate({
                        id: robot.id,
                        status: robot.status === "published" ? "draft" : "published",
                      })
                    }
                    className={cn(
                      "min-h-11 rounded-full border px-4 text-xs transition-colors",
                      robot.status === "published"
                        ? "border-signal/30 bg-signal/10 text-signal"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {robot.status === "published" ? "מפורסם" : "טיוטה"}
                  </button>

                  <Link
                    to={`/admin/robots/${robot.id}`}
                    className="text-sm underline underline-offset-4"
                  >
                    עריכה
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
