import { Link } from "react-router-dom";
import { Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useCategories } from "@/data/queries";

const COMPANY = [
  { to: "/about", label: "עלינו" },
  { to: "/methodology", label: "איך אנחנו מדרגים" },
  { to: "/for-dealers", label: "לסוחרים ויבואנים" },
  { to: "/privacy", label: "פרטיות ותנאי שימוש" },
];

const TOOLS = [
  { to: "/find-my-robot", label: "מצא את הרובוט שלי" },
  { to: "/guides", label: "מדריכי קנייה" },
  { to: "/humanoids", label: "רשימת המתנה — הומנואידים" },
  { to: "/repair", label: "בקשת תיקון" },
];

export function Footer() {
  const { data: categories = [] } = useCategories();

  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-7 text-ink-muted">
              מרכזים את כל הרובוטים הביתיים שנמכרים בישראל, משווים מחירים בין
              החנויות, ועוזרים לבחור נכון.
            </p>
            <div className="mt-6 flex gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="אינסטגרם"
                className="grid size-11 place-items-center rounded-full border border-ink-foreground/15 transition-colors duration-200 hover:border-ink-foreground/50"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="יוטיוב"
                className="grid size-11 place-items-center rounded-full border border-ink-foreground/15 transition-colors duration-200 hover:border-ink-foreground/50"
              >
                <Youtube className="size-4" />
              </a>
            </div>
          </div>

          <FooterColumn title="קטגוריות">
            {categories.map((category) => (
              <FooterLink
                key={category.id}
                to={`/category/${category.slug}`}
                label={category.name}
              />
            ))}
          </FooterColumn>

          <FooterColumn title="כלים">
            {TOOLS.map((item) => (
              <FooterLink key={item.to} {...item} />
            ))}
          </FooterColumn>

          <FooterColumn title="מידע">
            {COMPANY.map((item) => (
              <FooterLink key={item.to} {...item} />
            ))}
          </FooterColumn>
        </div>

        {/*
          Affiliate disclosure. Required by Israeli consumer protection rules
          and by the affiliate programmes themselves, and it costs nothing in
          trust when it is stated plainly rather than buried.
        */}
        <div className="mt-14 rounded-card border border-ink-foreground/10 bg-ink-foreground/[0.03] p-5">
          <p className="text-xs leading-6 text-ink-muted">
            <strong className="font-medium text-ink-foreground">גילוי נאות:</strong>{" "}
            חלק מהקישורים באתר הם קישורי שותפים. אם תרכשו דרכם, אנחנו עשויים
            לקבל עמלה מהחנות — בלי תוספת עלות עבורכם. העמלה אינה משפיעה על
            הציון שאנחנו נותנים למוצר ולא על סדר ההצגה. המחירים מתעדכנים
            ידנית ועשויים להשתנות; המחיר המחייב הוא זה שמופיע באתר החנות.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-ink-foreground/10 pt-8 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} buy robots. כל הזכויות שמורות.</p>
          <p dir="ltr">buyrobots.co.il</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-ink-foreground">{title}</h3>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-ink-muted transition-colors duration-200 hover:text-ink-foreground"
      >
        {label}
      </Link>
    </li>
  );
}
