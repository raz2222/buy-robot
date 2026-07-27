import { LeadForm } from "@/components/lead/LeadForm";
import { Reveal } from "@/components/ui/reveal";

/**
 * Price-drop alerts. Framed around a concrete benefit rather than "join our
 * newsletter", because the value exchange is what gets the address.
 */
export function NewsletterCta() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
            נעדכן אותך כשהרובוט שאתה רוצה יורד במחיר
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            מייל אחד בשבוע: ירידות מחיר אמיתיות בחנויות בישראל, דגמים חדשים
            שנכנסו לארץ, ומה לא שווה לקנות למרות המבצע.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <LeadForm
              type="newsletter"
              cta="קבלו עדכונים"
              successTitle="נרשמת"
              successBody="המייל הראשון יגיע ביום ראשון."
            />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            בלי ספאם. ביטול בלחיצה אחת בכל מייל.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
