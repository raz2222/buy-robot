import { Link } from "react-router-dom";
import { ProsePage } from "@/components/layout/ProsePage";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function About() {
  useDocumentMeta({
    title: "עלינו",
    description:
      "buy robots מרכז את כל הרובוטים הביתיים שנמכרים בישראל ומשווה מחירים בין החנויות.",
    path: "/about",
  });

  return (
    <ProsePage
      title="למה הקמנו את זה"
      intro="כי לקנות רובוט ביתי בישראל מסובך הרבה יותר משצריך להיות."
    >
      <p>
        השוק המקומי קטן, היבוא מפוצל, ואותו דגם יכול להימכר בהפרש של מאות שקלים
        בין חנויות — לפעמים באותו שבוע. חלק מהדגמים מגיעים רק ביבוא אישי, מה
        שאומר שאין אחריות מקומית ואין למי לפנות כשמשהו נשבר. וברוב אתרי
        ההשוואה, מה שמופיע ראשון הוא פשוט מי ששילם הכי הרבה.
      </p>
      <p>
        רצינו מקום אחד שעונה על שלוש שאלות: מה הדגמים שקיימים כאן, כמה הם באמת
        עולים בכל חנות, ומה קורה אם הם מתקלקלים.
      </p>

      <h2>מה יש כאן</h2>
      <ul>
        <li>השוואת מחירים בין KSP, Ivory, זאפ ואמזון על כל דגם.</li>
        <li>מדריכי קנייה שמסבירים מה משנה בכל קטגוריה ומה רק נשמע טוב.</li>
        <li>שאלון קצר שממליץ על דגמים לפי הבית, התקציב והצרכים.</li>
        <li>מעקב אחרי רובוטים הומנואידיים ומתי הם יגיעו לישראל.</li>
        <li>חיבור לטכנאים כשהרובוט מתקלקל.</li>
      </ul>

      <h2>איך אנחנו מרוויחים</h2>
      <p>
        עמלת שותפים מהחנויות, בלי תוספת עלות לקונה. אנחנו לא גובים תשלום
        מהקוראים ולא מוכרים דירוגים.{" "}
        <Link to="/methodology" className="text-foreground underline">
          כאן מוסבר בדיוק איך מחושב כל ציון
        </Link>
        .
      </p>

      <h2>יצירת קשר</h2>
      <p>
        טעות במחיר, דגם שחסר, או הצעה לשיתוף פעולה —{" "}
        <a href="mailto:hello@buyrobots.co.il" className="text-foreground underline">
          hello@buyrobots.co.il
        </a>
        . סוחרים ויבואנים מוזמנים ל
        <Link to="/for-dealers" className="text-foreground underline">
          עמוד השותפים
        </Link>
        .
      </p>
    </ProsePage>
  );
}
