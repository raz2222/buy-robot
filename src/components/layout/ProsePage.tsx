import type { ReactNode } from "react";

/** Shared shell for the text-only pages: about, methodology, privacy. */
export function ProsePage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="pb-14 pt-28 md:pb-16 md:pt-36">
        <div className="container max-w-3xl">
          <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-5 text-base leading-8 text-muted-foreground">{intro}</p>
          )}
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="container max-w-3xl [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2:first-child]:mt-0 [&_li]:leading-8 [&_p]:mt-4 [&_p]:leading-8 [&_p]:text-muted-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6 [&_ul]:text-muted-foreground">
          {children}
        </div>
      </section>
    </>
  );
}
