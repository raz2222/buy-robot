import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ui/product-image";
import { Reveal } from "@/components/ui/reveal";
import { RobotCard } from "@/components/product/RobotCard";
import { LeadForm } from "@/components/lead/LeadForm";
import { useCategories, useGuide, useRobots } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import { formatDate } from "@/lib/format";
import NotFound from "@/pages/NotFound";

const ORIGIN = "https://buyrobots.co.il";

export default function Guide() {
  const { slug } = useParams();
  const { data: guide, isLoading } = useGuide(slug);
  const { data: categories = [] } = useCategories();
  const category = categories.find((item) => item.id === guide?.category_id);
  const { data: picks = [] } = useRobots({
    categorySlug: category?.slug,
    limit: 3,
  });

  useDocumentMeta({
    title: guide?.title ?? "מדריך",
    description: guide?.excerpt ?? undefined,
    path: `/guide/${slug}`,
  });

  const articleSchema = useMemo(() => {
    if (!guide) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.excerpt ?? undefined,
      image: guide.cover ?? undefined,
      datePublished: guide.published_at ?? undefined,
      url: `${ORIGIN}/guide/${guide.slug}`,
    };
  }, [guide]);

  const breadcrumbSchema = useMemo(() => {
    if (!guide) return null;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "בית", item: `${ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: "מדריכים", item: `${ORIGIN}/guides` },
        { "@type": "ListItem", position: 3, name: guide.title, item: `${ORIGIN}/guide/${guide.slug}` },
      ],
    };
  }, [guide]);

  useJsonLd("article", articleSchema);
  useJsonLd("breadcrumb", breadcrumbSchema);

  if (isLoading) {
    return (
      <div className="container py-32">
        <div className="skeleton h-10 w-2/3 rounded" />
        <div className="skeleton mt-6 h-5 w-full rounded" />
      </div>
    );
  }

  if (!guide) return <NotFound />;

  const paragraphs = (guide.body_md ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      <article>
        <header className="pb-14 pt-28 md:pb-16 md:pt-32">
          <div className="container">
            <nav
              aria-label="פירורי לחם"
              className="mb-8 flex items-center gap-1 text-xs text-muted-foreground"
            >
              <Link to="/guides" className="hover:text-foreground">
                מדריכים
              </Link>
              <ChevronLeft className="size-3" />
              <span className="text-foreground">{guide.title}</span>
            </nav>

            <div className="max-w-3xl">
              {category && (
                <Badge
                  variant="outline"
                  className="border-white/25 bg-white/10 text-foreground"
                >
                  {category.name}
                </Badge>
              )}
              <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {guide.title}
              </h1>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime={guide.published_at ?? undefined}>
                  {formatDate(guide.published_at)}
                </time>
                <span aria-hidden="true">·</span>
                <span>
                  <bdi>{guide.read_minutes} דק׳ קריאה</bdi>
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="container -mt-8 md:-mt-12">
          <ProductImage
            src={guide.cover}
            alt={guide.title}
            priority
            className="aspect-[16/9] rounded-hero"
          />
        </div>

        <div className="container grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="max-w-2xl">
            <p className="text-lg leading-9 text-foreground">{guide.excerpt}</p>
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="mt-6 leading-9 text-muted-foreground">
                {paragraph}
              </p>
            ))}

            <div className="mt-12 rounded-[1.5rem] bg-surface p-6">
              <p className="text-sm leading-7 text-muted-foreground">
                <strong className="font-medium text-foreground">שקיפות:</strong>{" "}
                אנחנו לא מעבדת בדיקות. הדירוגים שלנו מבוססים על מפרטי היצרן,
                מחירים בפועל בחנויות בישראל ודירוגי משתמשים.{" "}
                <Link to="/methodology" className="text-foreground underline">
                  איך אנחנו מדרגים
                </Link>
                .
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[1.5rem] border border-white/10 p-6">
              <h2 className="text-base font-semibold">
                מייל אחד בשבוע, בלי ספאם
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                ירידות מחיר ודגמים חדשים שנכנסו לארץ.
              </p>
              <div className="mt-5">
                <LeadForm
                  type="newsletter"
                  payload={{ guide: guide.slug }}
                  cta="הרשמה"
                />
              </div>
            </div>
          </aside>
        </div>
      </article>

      {picks.length > 0 && (
        <section className="bg-surface py-14 md:py-20">
          <div className="container">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              הדגמים שהוזכרו במדריך
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((robot, index) => (
                <Reveal key={robot.id} delay={index * 80}>
                  <RobotCard robot={robot} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
