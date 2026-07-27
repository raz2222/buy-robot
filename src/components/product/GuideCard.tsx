import { Link } from "react-router-dom";
import { PillTag } from "@/components/ui/deco";
import { ProductImage } from "@/components/ui/product-image";
import { formatDate } from "@/lib/format";
import type { Category, Guide } from "@/types";

export function GuideCard({
  guide,
  category,
}: {
  guide: Guide;
  category?: Category;
}) {
  return (
    <article className="group h-full">
      <Link
        to={`/guide/${guide.slug}`}
        className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-surface p-3 transition-colors duration-500 ease-smooth hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative overflow-hidden rounded-[1.35rem]">
          <ProductImage
            src={guide.cover}
            alt={guide.title}
            className="aspect-[16/10] transition-transform duration-[900ms] ease-smooth group-hover:scale-[1.06]"
          />
          {category && (
            <PillTag className="absolute start-3 top-3 bg-background/70 backdrop-blur-md">
              {category.name}
            </PillTag>
          )}
        </div>

        <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={guide.published_at ?? undefined}>
              {formatDate(guide.published_at)}
            </time>
            <span className="size-1 rounded-full bg-accent" />
            <span className="tabular-nums">
              <bdi>{guide.read_minutes} דק׳ קריאה</bdi>
            </span>
          </div>

          <h3 className="mt-3 text-base font-medium leading-6 line-clamp-2">
            {guide.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
            {guide.excerpt}
          </p>

          <span className="mt-auto flex items-center gap-2 pt-5 text-sm text-accent">
            לקריאה
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform duration-500 ease-smooth group-hover:-translate-x-1"
            >
              <path
                d="M13 8H3M7 4 3 8l4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  );
}

export function GuideCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-surface p-3">
      <div className="skeleton aspect-[16/10] rounded-[1.35rem]" />
      <div className="px-2 pt-4">
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton mt-3 h-4 w-full rounded" />
        <div className="skeleton mt-2 h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}
