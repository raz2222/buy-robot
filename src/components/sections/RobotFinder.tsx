import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Check,
  Coins,
  Dog,
  Droplets,
  Home,
  Loader2,
  PanelTop,
  PersonStanding,
  RotateCcw,
  Ruler,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabelRule } from "@/components/ui/deco";
import { ProductImage } from "@/components/ui/product-image";
import { useRobots, useSubmitLead } from "@/data/queries";
import { track } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Choice {
  value: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
}

interface Step {
  key: "need" | "size" | "budget" | "pets";
  title: string;
  question: string;
  blurb: string;
  choices: Choice[];
}

/**
 * Four questions, one per screen. Each answer is a single tap that advances
 * automatically — the fewer decisions between the first tap and the email
 * field, the more leads finish. The category and budget captured here are
 * what make the lead worth something to an importer later.
 *
 * This is the one calculator on the site. It renders both on its own page
 * (`/find-my-robot`) and embedded under the home hero — the questions,
 * scoring and result logic below are shared, never duplicated.
 */
const STEPS: Step[] = [
  {
    key: "need",
    title: "הצורך",
    question: "מה הכי מפריע לך בבית?",
    blurb: "נתחיל מהבעיה, לא מהמוצר.",
    choices: [
      { value: "robot-vacuums", label: "אבק ולכלוך על הרצפה", hint: "שואב רובוטי", icon: Bot },
      { value: "mops", label: "הרצפה דביקה ומרוחה", hint: "שוטף רצפה", icon: Droplets },
      { value: "lawn-mowers", label: "הדשא בחצר", hint: "מכסחת רובוטית", icon: Trees },
      { value: "pool-cleaners", label: "הבריכה מלוכלכת", hint: "רובוט בריכה", icon: Waves },
      { value: "window-cleaners", label: "חלונות גבוהים", hint: "רובוט חלונות", icon: PanelTop },
      { value: "humanoids", label: "רק סקרן לגבי הומנואידים", hint: "עוקבים בשבילך", icon: PersonStanding },
    ],
  },
  {
    key: "size",
    title: "הבית",
    question: "כמה גדול הבית?",
    blurb: "משפיע על גודל הסוללה והמיכל שתצטרך.",
    choices: [
      { value: "small", label: "עד 80 מ״ר", hint: "דירה קטנה", icon: Home },
      { value: "medium", label: "80–140 מ״ר", hint: "דירה משפחתית", icon: Home },
      { value: "large", label: "מעל 140 מ״ר", hint: "בית או דופלקס", icon: Ruler },
    ],
  },
  {
    key: "budget",
    title: "התקציב",
    question: "מה התקציב?",
    blurb: "נציג רק דגמים שבאמת בטווח.",
    choices: [
      { value: "0-2000", label: "עד ₪2,000", icon: Coins },
      { value: "2000-4000", label: "₪2,000–4,000", icon: Coins },
      { value: "4000-7000", label: "₪4,000–7,000", icon: Coins },
      { value: "7000+", label: "מעל ₪7,000", icon: Coins },
    ],
  },
  {
    key: "pets",
    title: "חיות",
    question: "יש חיות מחמד בבית?",
    blurb: "שיער חיות משנה לגמרי איזו מברשת צריך.",
    choices: [
      { value: "yes", label: "כן, כלב או חתול", icon: Dog },
      { value: "no", label: "לא", icon: Check },
    ],
  },
];

const BUDGET_CEILING: Record<string, number> = {
  "0-2000": 2000,
  "2000-4000": 4000,
  "4000-7000": 7000,
  "7000+": Number.POSITIVE_INFINITY,
};

const SIZE_LABELS: Record<string, string> = {
  small: "דירה קטנה",
  medium: "דירה משפחתית",
  large: "בית גדול",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** One line explaining *why* this specific robot matched these answers. */
function matchReason(answers: Record<string, string>): string {
  const size = SIZE_LABELS[answers.size];
  const pets = answers.pets === "yes";
  if (size && pets) return `מתאים ל${size} עם בעלי חיים בבית`;
  if (size) return `מתאים ל${size}`;
  if (pets) return "מתמודד טוב עם שיער חיות מחמד";
  return "מתאים לצרכים שציינת";
}

export function RobotFinder({ embedded = false }: { embedded?: boolean }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = useSubmitLead();

  const { data: robots = [] } = useRobots({ categorySlug: answers.need });

  const onContactStep = step === STEPS.length;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstStep = useRef(true);

  useEffect(() => {
    track("quiz_start", { embedded });
    // Only ever fires once per mount — this is the funnel's entry event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replays the panel entrance on every step change. A transition rather
  // than an animation, so the panel is never stuck invisible if animations
  // do not run.
  useEffect(() => {
    setEntered(false);
    const timer = window.setTimeout(() => setEntered(true), 40);
    return () => window.clearTimeout(timer);
  }, [step]);

  // Moves focus to the new question/result heading on every step after the
  // first, so keyboard and screen-reader users are told the step changed —
  // nothing here otherwise triggers a route change or page reload for them
  // to notice by. Skipped on the very first render so the quiz never
  // steals focus from the page on mount.
  useEffect(() => {
    if (isFirstStep.current) {
      isFirstStep.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  /** Filters the catalogue down to what the answers actually allow. Never
   * random — always the same score-sorted, budget-filtered pool. */
  const matches = useMemo(() => {
    const ceiling = BUDGET_CEILING[answers.budget] ?? Number.POSITIVE_INFINITY;
    const inBudget = robots.filter((robot) => (robot.price_from ?? 0) <= ceiling);
    // If nothing fits the budget, showing the cheapest options beats an
    // empty result — the visitor still gets somewhere useful to click.
    const pool = inBudget.length > 0 ? inBudget : robots;
    return [...pool].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);
  }, [robots, answers.budget]);

  // Fires exactly once when the visitor reaches the results screen, never
  // on every render of it.
  const completeTracked = useRef(false);
  useEffect(() => {
    if (onContactStep && !completeTracked.current) {
      completeTracked.current = true;
      track("quiz_complete", { matches: matches.length });
    }
    if (!onContactStep) completeTracked.current = false;
  }, [onContactStep, matches.length]);

  const choose = (key: string, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    // Which question was answered, never the answer itself — funnel
    // progress without recording what the visitor actually chose.
    track("quiz_answer", { step: key });
    // A short beat so the selected state is visible before the screen moves.
    window.setTimeout(() => setStep((current) => current + 1), 260);
  };

  const restart = () => {
    track("quiz_restart");
    setStep(0);
    setAnswers({});
    setEmail("");
    setError(null);
    setSent(false);
  };

  const finish = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!EMAIL.test(email.trim())) {
      setError("נראה שכתובת האימייל לא תקינה");
      return;
    }

    try {
      await submit.mutateAsync({
        type: "quiz",
        email: email.trim(),
        payload: { ...answers, recommended: matches.map((robot) => robot.slug) },
      });
      setSent(true);
      track("quiz_lead_submit", { matches: matches.length });
    } catch {
      setError("משהו השתבש. אפשר לנסות שוב?");
    }
  };

  const current = STEPS[step];

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        embedded ? "pb-20 pt-4" : "min-h-[100svh] pb-24 pt-32 md:pt-40",
      )}
    >
      {/* the accent bloom follows the step, so progress is felt as well as read */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 size-[34rem] rounded-full opacity-[0.13] blur-[130px] transition-[inset-inline-start] duration-[1200ms] ease-smooth"
        style={{
          background: "hsl(var(--accent))",
          insetInlineStart: `${8 + step * 20}%`,
        }}
      />

      <div className="container max-w-3xl">
        {embedded && (
          <div className="mb-10 text-center">
            <LabelRule className="justify-center">מצאו את הרובוט שמתאים לכם</LabelRule>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              ענו על מספר שאלות קצרות וקבלו המלצות שמותאמות לבית, להרגלים ולתקציב שלכם.
            </p>
          </div>
        )}

        <StepRail step={step} />

        {!onContactStep ? (
          <div
            key={current.key}
            className={cn(
              "mt-14 transition-all duration-700 ease-smooth",
              entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <LabelRule>{`שאלה ${step + 1} מתוך ${STEPS.length}`}</LabelRule>

            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mt-7 text-balance text-3xl font-medium outline-none sm:text-[2.75rem] sm:leading-[1.1]"
            >
              {current.question}
            </h2>
            <p className="mt-4 text-base text-muted-foreground">{current.blurb}</p>

            <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-3" role="group" aria-label={current.question}>
              {current.choices.map((choice, index) => {
                const selected = answers[current.key] === choice.value;
                const Icon = choice.icon;
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => choose(current.key, choice.value)}
                    aria-pressed={selected}
                    style={{ transitionDelay: `${index * 45}ms` }}
                    className={cn(
                      "group/choice relative flex min-h-[4.5rem] flex-col items-center gap-2 overflow-hidden rounded-[1.5rem] border p-3 text-center",
                      "transition-all duration-500 ease-smooth",
                      "sm:flex-row sm:gap-4 sm:p-4 sm:text-start",
                      entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                      selected
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-white/12 bg-surface hover:border-white/30",
                    )}
                  >
                    {/* accent wipe on hover, from the inline-start edge */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 origin-[100%_50%] scale-x-0 bg-accent/10 transition-transform duration-500 ease-smooth",
                        !selected && "group-hover/choice:scale-x-100",
                      )}
                    />

                    <span
                      className={cn(
                        "relative grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-500 sm:size-12",
                        selected
                          ? "border-accent-foreground/25 bg-accent-foreground/10"
                          : "border-white/15 text-muted-foreground group-hover/choice:border-accent group-hover/choice:text-accent",
                      )}
                    >
                      <Icon className="size-4 sm:size-5" />
                    </span>

                    <span className="relative min-w-0 flex-1">
                      <span className="block text-xs font-medium leading-5 sm:text-sm">
                        {choice.label}
                      </span>
                      {choice.hint && (
                        <span
                          className={cn(
                            "sr-only sm:not-sr-only sm:mt-0.5 sm:block sm:text-xs",
                            selected
                              ? "text-accent-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {choice.hint}
                        </span>
                      )}
                    </span>

                    <span className="absolute end-2 top-2 shrink-0 sm:static">
                      {selected ? (
                        <Check className="size-4 sm:size-5" />
                      ) : (
                        <ArrowRight className="hidden size-4 -scale-x-100 text-muted-foreground transition-transform duration-500 ease-smooth group-hover/choice:-translate-x-1 sm:block" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((value) => value - 1)}
                className="mt-9 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                חזרה לשאלה הקודמת
              </button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "mt-14 transition-all duration-700 ease-smooth",
              entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <LabelRule>{sent ? "נשמר" : "הצעד האחרון"}</LabelRule>

            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mt-7 text-balance text-3xl font-medium outline-none sm:text-[2.75rem] sm:leading-[1.1]"
            >
              {matches.length === 1 ? (
                <>
                  מצאנו <span className="text-accent">דגם אחד</span> שמתאים לך
                </>
              ) : matches.length > 1 ? (
                <>
                  מצאנו <span className="text-accent">{matches.length}</span>{" "}
                  דגמים שמתאימים לך
                </>
              ) : (
                "לא מצאנו התאמה מדויקת"
              )}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-8 text-muted-foreground">
              {matches.length > 0
                ? "לחיצה על כל דגם פותחת את הפרטים המלאים ואת השוואת המחירים בין החנויות."
                : "אפשר לנסות שוב עם תקציב אחר, או לעיין בכל הדגמים בקטגוריה."}
            </p>

            {/* ---------- recommendations ---------- */}
            {matches.length > 0 && (
              <ol className="mt-10 grid gap-4 sm:grid-cols-3">
                {matches.map((robot, index) => (
                  <li
                    key={robot.id}
                    className="flex flex-col rounded-[1.5rem] border border-white/10 bg-surface p-4"
                  >
                    <span className="text-xs font-medium text-accent">
                      <bdi>0{index + 1}</bdi> · {robot.category?.name ?? "רובוט"}
                    </span>

                    <ProductImage
                      src={robot.hero_image}
                      alt={robot.name}
                      className="mt-3 aspect-[4/3] rounded-[1rem]"
                    />

                    <h3 className="mt-3 text-base font-medium leading-6" dir="ltr">
                      {robot.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {matchReason(answers)}
                    </p>

                    <ul className="mt-3 space-y-1.5 text-xs leading-5">
                      {robot.pros?.[0] && (
                        <li className="flex gap-1.5">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                          <span>{robot.pros[0]}</span>
                        </li>
                      )}
                      {robot.cons?.[0] && (
                        <li className="flex gap-1.5 text-muted-foreground">
                          <span className="mt-0.5 shrink-0">–</span>
                          <span>{robot.cons[0]}</span>
                        </li>
                      )}
                    </ul>

                    <p className="mt-3 text-lg font-medium tabular-nums text-accent">
                      <bdi>{formatPrice(robot.price_from)}</bdi>
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link
                          to={`/robot/${robot.slug}`}
                          onClick={() => track("product_click", { slug: robot.slug, from: "quiz" })}
                        >
                          לפרטים המלאים
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="accent" className="flex-1">
                        <Link
                          to={`/robot/${robot.slug}`}
                          onClick={() => track("price_check_click", { slug: robot.slug, from: "quiz" })}
                        >
                          בדיקת מחיר
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {!sent ? (
              <form onSubmit={finish} className="mt-10 max-w-lg" noValidate>
                <label htmlFor="quiz-email" className="sr-only">
                  כתובת אימייל
                </label>
                <div className="flex flex-col gap-2 rounded-[1.75rem] border border-white/25 p-2 transition-colors duration-300 focus-within:border-accent sm:h-[3.75rem] sm:flex-row sm:items-center sm:rounded-full sm:p-0 sm:ps-6 sm:pe-2">
                  <input
                    id="quiz-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    dir="ltr"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="your@email.com"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "quiz-email-error" : undefined}
                    className="h-12 w-full min-w-0 flex-1 rounded-full bg-transparent px-4 text-start text-base outline-none placeholder:text-muted-foreground sm:h-auto sm:rounded-none sm:px-0"
                  />
                  <Button
                    type="submit"
                    variant="accent"
                    className="h-11 w-full shrink-0 sm:w-auto"
                    disabled={submit.isPending}
                  >
                    {submit.isPending && <Loader2 className="size-4 animate-spin" />}
                    שמרו לי במייל
                  </Button>
                </div>

                {error && (
                  <p id="quiz-email-error" role="alert" className="mt-3 ps-6 text-sm text-foreground">
                    {error}
                  </p>
                )}

                <p className="mt-4 ps-6 text-xs text-muted-foreground">
                  לא נשלח ספאם ולא נמכור את הכתובת שלך.
                </p>
              </form>
            ) : (
              <p className="mt-10 max-w-lg text-sm text-muted-foreground">
                שלחנו את ההמלצות למייל שלך.
              </p>
            )}

            <button
              type="button"
              onClick={restart}
              className="mt-9 flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              התחילו מחדש
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * The step rail. Nodes fill with the accent as they are completed and the
 * connecting rule fills behind them, so progress reads at a glance without
 * a percentage. The active node keeps a soft pulse — the one looping
 * animation on the site, and only ever one at a time.
 */
function StepRail({ step }: { step: number }) {
  const total = STEPS.length + 1;
  const labels = [...STEPS.map((item) => item.title), "המלצות"];

  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {labels.map((label, index) => {
        const done = index < step;
        const active = index === step;

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span className="relative grid shrink-0 place-items-center">
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute size-9 animate-pulse-ring rounded-full bg-accent/40"
                />
              )}
              <span
                className={cn(
                  "relative grid size-9 place-items-center rounded-full border text-xs font-medium tabular-nums transition-all duration-500 ease-spring",
                  done && "border-accent bg-accent text-accent-foreground",
                  active && "border-accent text-accent",
                  !done && !active && "border-white/15 text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : <bdi>{index + 1}</bdi>}
              </span>
            </span>

            <span
              className={cn(
                "hidden truncate text-xs transition-colors duration-500 sm:block",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>

            {index < total - 1 && (
              <span className="relative h-px min-w-4 flex-1 bg-white/12">
                <span
                  className="absolute inset-y-0 start-0 bg-accent transition-[width] duration-700 ease-smooth"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
