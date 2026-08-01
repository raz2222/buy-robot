import { CompareLab } from "@/components/sections/CompareLab";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * A dedicated destination for the "השוואות" nav item. Reuses the same
 * CompareLab section and comparison logic that lives on the home page —
 * the picker, the scoring measures, the table — none of it is rebuilt here.
 */
export default function Comparisons() {
  useDocumentMeta({
    title: "השוואת רובוטים ביתיים",
    description:
      "בחרו עד שלושה דגמים מאותה קטגוריה והשוו ציון, מחיר, חיסכון ומספר החנויות שמוכרות אותם.",
    path: "/comparisons",
  });

  return (
    <>
      <section className="pb-4 pt-28 md:pt-32">
        <div className="container">
          <h1 className="text-balance text-3xl font-semibold sm:text-4xl lg:text-5xl">
            השוואת רובוטים
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
            בחרו קטגוריה, סמנו עד שלושה דגמים, וראו בדיוק במה הם נבדלים.
          </p>
        </div>
      </section>
      <CompareLab />
    </>
  );
}
