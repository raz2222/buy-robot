import { useAdminGuides, useTogglePublish } from "@/admin/adminQueries";
import { useCategories } from "@/data/queries";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Guides() {
  const { data: guides = [], isLoading } = useAdminGuides();
  const { data: categories = [] } = useCategories();
  const toggle = useTogglePublish("guides");

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">מדריכים</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <bdi>{guides.length}</bdi> מדריכים והשוואות.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">טוען…</p>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-background">
          <ul className="divide-y divide-border">
            {guides.map((guide) => (
              <li
                key={guide.id}
                className="flex flex-wrap items-center gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{guide.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {categories.find((c) => c.id === guide.category_id)?.name ??
                      "ללא קטגוריה"}{" "}
                    · {formatDate(guide.published_at)} ·{" "}
                    <bdi>{guide.read_minutes} דק׳</bdi>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggle.mutate({
                      id: guide.id,
                      status: guide.status === "published" ? "draft" : "published",
                    })
                  }
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-xs transition-colors",
                    guide.status === "published"
                      ? "border-signal/30 bg-signal/10 text-signal"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {guide.status === "published" ? "מפורסם" : "טיוטה"}
                </button>

                <a
                  href={`/guide/${guide.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline underline-offset-4"
                >
                  צפייה
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
