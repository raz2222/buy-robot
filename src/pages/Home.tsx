import { Hero } from "@/components/sections/Hero";
import { RobotFinder } from "@/components/sections/RobotFinder";
import { TopPicks } from "@/components/sections/TopPicks";
import { CategoryStrip } from "@/components/sections/CategoryStrip";
import { CompareLab } from "@/components/sections/CompareLab";
import { GuidesPreview } from "@/components/sections/GuidesPreview";
import { HumanoidWaitlist } from "@/components/sections/HumanoidWaitlist";
import { NewsletterCta } from "@/components/sections/NewsletterCta";
import { useRobots } from "@/data/queries";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function Home() {
  useDocumentMeta({
    title: "buy robots — משווים רובוטים ביתיים. קונים נכון.",
    description:
      "ריכזנו את כל הרובוטים הביתיים שנמכרים בישראל — שואבי אבק, שוטפי רצפה, מכסחות דשא ורובוטי בריכה — עם השוואת מחירים בין KSP, Ivory, זאפ ואמזון.",
    path: "/",
  });

  const { data: featured = [] } = useRobots({ featured: true, limit: 4 });

  return (
    <>
      <Hero robots={featured} />
      <section id="finder" className="border-b border-white/10 bg-background">
        <RobotFinder embedded />
      </section>
      <TopPicks />
      <CompareLab />
      <CategoryStrip />
      <GuidesPreview />
      <HumanoidWaitlist />
      <NewsletterCta />
    </>
  );
}
