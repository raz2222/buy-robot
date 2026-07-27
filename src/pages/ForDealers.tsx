import { ContactForm } from "@/components/lead/ContactForm";
import { Reveal } from "@/components/ui/reveal";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { useWaitlistCount } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const OFFERINGS = [
  {
    title: "לידים מסוננים",
    body: "כל פנייה מגיעה עם קטגוריה, טווח תקציב וגודל בית — לא רק כתובת מייל. אתם מקבלים רק את מה שרלוונטי למה שאתם מוכרים.",
  },
  {
    title: "מיקום מוצר",
    body: "הצגה קבועה בעמוד הקטגוריה ובמדריכי הקנייה, מסומנת בבירור כתוכן ממומן. בלי לגעת בציון המערכתי.",
  },
  {
    title: "השקה לשוק",
    body: "מביאים דגם חדש לישראל? יש לנו קהל שכבר מחפש בדיוק אותו, ורשימת המתנה שממתינה להודעה.",
  },
];

export default function ForDealers() {
  useDocumentMeta({
    title: "לסוחרים, יבואנים וספקי שירות",
    description:
      "יש לנו קהל ישראלי שמחפש רובוטים ביתיים ומוכן לקנות. לידים מסוננים, מיקומי מוצר והשקות לשוק המקומי.",
    path: "/for-dealers",
  });

  const { data: waitlist = 0 } = useWaitlistCount();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const shown = useCountUp(waitlist, inView);

  return (
    <>
      <section className="bg-ink pb-16 pt-28 text-ink-foreground md:pb-20 md:pt-36">
        <div ref={ref} className="container">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
              B2B
            </p>
            <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              הקונים כבר כאן. נחבר ביניכם.
            </h1>
            <p className="mt-5 text-base leading-8 text-ink-muted">
              אנשים מגיעים לאתר בשלב שבו הם כבר החליטו לקנות ומחפשים איפה.
              אנחנו יודעים איזו קטגוריה מעניינת אותם, מה התקציב, ואיפה הם גרים.
            </p>
          </div>

          <dl className="mt-14 grid gap-8 border-t border-ink-foreground/10 pt-10 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-ink-muted">ברשימת ההמתנה להומנואידים</dt>
              <dd className="mt-2 text-4xl font-semibold tabular-nums">
                <bdi>{shown.toLocaleString("he-IL")}</bdi>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">קטגוריות מכוסות</dt>
              <dd className="mt-2 text-4xl font-semibold tabular-nums">
                <bdi>7</bdi>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">חנויות בהשוואה</dt>
              <dd className="mt-2 text-4xl font-semibold tabular-nums">
                <bdi>4</bdi>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <h2 className="text-2xl font-semibold sm:text-3xl">מה אנחנו מציעים</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {OFFERINGS.map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="h-full rounded-card border border-border p-7">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 rounded-card bg-surface p-6">
            <p className="text-sm leading-7 text-muted-foreground">
              <strong className="font-medium text-foreground">מה שלא נמכר:</strong>{" "}
              דירוגים. הציון שמוצג באתר מחושב לפי מפרט, מחיר ודירוגי משתמשים,
              והוא לא ניתן לרכישה בשום סכום. תוכן ממומן מסומן תמיד ככזה. זה מה
              שמשאיר את הקהל כאן, ולכן זה גם מה ששומר על הערך שלו עבורכם.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="container max-w-2xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">בואו נדבר</h2>
          <p className="mt-3 text-base leading-8 text-muted-foreground">
            ספרו לנו מה אתם מוכרים ונחזור אליכם עם הצעה קונקרטית.
          </p>

          <ContactForm
            className="mt-10"
            type="dealer"
            cta="שלחו פנייה"
            successTitle="קיבלנו, תודה"
            successBody="נחזור אליכם תוך יום עסקים עם נתונים ספציפיים לקטגוריה שלכם."
            fields={[
              { name: "company", label: "שם החברה", required: true, half: true },
              { name: "name", label: "איש קשר", required: true, half: true },
              { name: "email", label: "אימייל", type: "email", required: true, half: true },
              { name: "phone", label: "טלפון", type: "tel", half: true },
              {
                name: "interest",
                label: "מה מעניין אתכם",
                type: "select",
                options: [
                  "רכישת לידים",
                  "מיקום מוצר",
                  "השקת דגם חדש בישראל",
                  "שירותי תיקון",
                  "אחר",
                ],
                required: true,
              },
              {
                name: "message",
                label: "פרטים",
                type: "textarea",
                placeholder: "אילו מוצרים אתם מוכרים, ובאיזה היקף",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
