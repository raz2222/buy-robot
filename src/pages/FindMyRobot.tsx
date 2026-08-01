import { RobotFinder } from "@/components/sections/RobotFinder";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function FindMyRobot() {
  useDocumentMeta({
    title: "מצא את הרובוט שלי",
    description:
      "ארבע שאלות קצרות, ונמליץ על שלושה רובוטים שמתאימים לבית, לתקציב ולצרכים שלך.",
    path: "/find-my-robot",
  });

  return <RobotFinder />;
}
