import { ContactForm } from "@/components/lead/ContactForm";
import { Reveal } from "@/components/ui/reveal";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const STEPS = [
  {
    title: "מתארים את התקלה",
    body: "שדה אחד. לא צריך לדעת מה שבור — מספיק לתאר מה קורה.",
  },
  {
    title: "מוצאים טכנאי באזור",
    body: "אנחנו מעבירים את הפנייה למעבדות ולטכנאים שעובדים עם הדגם שלכם.",
  },
  {
    title: "מקבלים הצעת מחיר",
    body: "הטכנאי חוזר אליכם ישירות. אין התחייבות ואין עלות על הפנייה.",
  },
];

export default function Repair() {
  useDocumentMeta({
    title: "תיקון רובוט — מצאו טכנאי בישראל",
    description:
      "שואב רובוטי תקוע, סוללה שלא נטענת או מכסחת שלא חוזרת לעגינה? נחבר אתכם לטכנאי שמתמחה בדגם שלכם.",
    path: "/repair",
  });

  return (
    <>
      <section className="pb-16 pt-28 md:pb-20 md:pt-36">
        <div className="container max-w-3xl">
          <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            הרובוט שלך תקוע? נמצא מי שיתקן
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            רוב התקלות ברובוטים ביתיים — סוללה, גלגל, חיישן, מברשת — הן תיקון
            של שעה במעבדה, ועולות הרבה פחות מדגם חדש. הבעיה היא למצוא את מי
            שמתעסק עם הדגם שלכם, במיוחד אחרי יבוא אישי.
          </p>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="container grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-2xl font-semibold">איך זה עובד</h2>
            <ol className="mt-8 space-y-8">
              {STEPS.map((step, index) => (
                <Reveal key={step.title} delay={index * 80}>
                  <li className="flex gap-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-sm font-medium text-background tabular-nums">
                      <bdi>{index + 1}</bdi>
                    </span>
                    <span>
                      <span className="block font-medium">{step.title}</span>
                      <span className="mt-1 block text-sm leading-7 text-muted-foreground">
                        {step.body}
                      </span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ol>

            <div className="mt-12 rounded-[1.5rem] bg-surface p-6">
              <p className="text-sm leading-7 text-muted-foreground">
                <strong className="font-medium text-foreground">שקיפות:</strong>{" "}
                אנחנו לא מתקנים בעצמנו. אנחנו מעבירים את הפנייה לטכנאים
                ולמעבדות, ועשויים לקבל מהם עמלה. השירות עבורכם ללא עלות.
              </p>
            </div>
          </div>

          <Reveal delay={120}>
            <div className="rounded-[1.5rem] border border-white/10 p-7">
              <h2 className="text-xl font-semibold">פרטי הפנייה</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                נחזור אליכם תוך יום עסקים.
              </p>

              <ContactForm
                className="mt-7"
                type="repair"
                cta="שלחו את הפנייה"
                successTitle="הפנייה נקלטה"
                successBody="נעביר אותה לטכנאי שמתמחה בדגם שלכם, והוא יחזור אליכם ישירות."
                fields={[
                  { name: "name", label: "שם", required: true, half: true },
                  { name: "phone", label: "טלפון", type: "tel", required: true, half: true },
                  { name: "email", label: "אימייל", type: "email", half: true },
                  { name: "city", label: "עיר", required: true, half: true },
                  {
                    name: "device",
                    label: "איזה רובוט",
                    placeholder: "למשל Roborock S8 או ״לא בטוח״",
                    required: true,
                  },
                  {
                    name: "warranty",
                    label: "מצב אחריות",
                    type: "select",
                    options: [
                      "באחריות יבואן רשמי",
                      "יבוא אישי",
                      "האחריות הסתיימה",
                      "לא יודע",
                    ],
                  },
                  {
                    name: "problem",
                    label: "מה קורה?",
                    type: "textarea",
                    placeholder: "למשל: נדלק, מסתובב שנייה ונכבה עם צפצוף כפול",
                    required: true,
                  },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
