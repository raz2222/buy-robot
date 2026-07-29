import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Sparkles, X } from "lucide-react";
import { ArrowButton } from "@/components/ui/arrow-button";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Logo } from "@/components/layout/Logo";
import { useCategories } from "@/data/queries";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/guides", label: "מדריכים" },
  { to: "/humanoids", label: "הומנואידים" },
  { to: "/repair", label: "תיקונים" },
  { to: "/for-dealers", label: "לסוחרים" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors duration-500 ease-smooth",
          scrolled && "border-b border-white/10 bg-background/70 backdrop-blur-xl",
        )}
      >
        <div
          className={cn(
            "container flex items-center gap-5 transition-[height] duration-500 ease-smooth",
            scrolled ? "h-[4.5rem]" : "h-24",
          )}
        >
          <MenuButton open={menuOpen} onClick={() => setMenuOpen(true)} />

          <Logo className="shrink-0" />

          <nav className="ms-6 hidden items-center gap-7 lg:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    // The underline grows from the inline-start edge rather
                    // than fading in — reads as drawn, not toggled.
                    "relative py-1 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-[100%_50%] after:scale-x-0 after:bg-accent after:transition-transform after:duration-500 after:ease-smooth hover:after:scale-x-100",
                    isActive && "text-foreground after:scale-x-100",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="me-auto" />

          <form onSubmit={submitSearch} className="hidden sm:block">
            <label className="sr-only" htmlFor="nav-search">
              חיפוש רובוט
            </label>
            <div className="group flex h-12 items-center gap-2 rounded-full border border-white/25 ps-5 pe-1.5 transition-colors duration-300 focus-within:border-white/70">
              <input
                id="nav-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="חיפוש דגם או מותג"
                className="w-32 bg-transparent text-sm text-foreground outline-none transition-[width] duration-500 ease-smooth placeholder:text-muted-foreground focus:w-56 lg:w-44"
              />
              <ArrowButton
                type="submit"
                size="sm"
                variant="outline"
                direction="diagonal"
                label="חיפוש"
              />
            </div>
          </form>

          {/* A bare circle with an arrow does not read as a control — it
              needs a word. The label shortens rather than disappearing so
              the action is always named. */}
          <Button asChild size="sm" variant="accent" className="shrink-0 sm:hidden">
            <Link to="/find-my-robot">
              <Sparkles className="size-4" />
              התאמה
            </Link>
          </Button>
        </div>
      </header>

      <FullMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}

/** Three rules that collapse into an X — the hamburger is always visible. */
function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="פתיחת תפריט"
      aria-expanded={open}
      className="group/menu grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/5"
    >
      {/* Three equal rules, as in the reference — the staggered-length
          hamburger is a different design language entirely. */}
      <span className="flex w-[1.6rem] flex-col gap-[6px]">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-[2px] w-full origin-[100%_50%] rounded-full bg-foreground transition-transform duration-500 ease-smooth group-hover/menu:scale-x-[0.7]"
            style={{ transitionDelay: `${index * 60}ms` }}
          />
        ))}
      </span>
    </button>
  );
}

/**
 * Full-screen navigation. The links stagger in on open, which is the one
 * place on the site where a heavier flourish earns its keep — the panel
 * covers everything, so there is nothing else competing for attention.
 */
function FullMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: categories = [] } = useCategories();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md data-[state=open]:animate-fade-in" />
        <Dialog.Content
          dir="rtl"
          className="fixed inset-0 z-50 overflow-y-auto bg-background data-[state=open]:animate-fade-in"
        >
          <Dialog.Title className="sr-only">תפריט ניווט</Dialog.Title>

          <div className="container flex h-24 items-center justify-between">
            <Logo />
            <Dialog.Close
              aria-label="סגירת תפריט"
              className="grid size-11 place-items-center rounded-full border border-white/25 text-foreground transition-colors duration-300 hover:border-white hover:bg-white hover:text-background"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <div className="container grid gap-16 pb-24 pt-10 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
            <nav>
              <p className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                ניווט
              </p>
              <ul className="space-y-1">
                {[{ to: "/", label: "בית" }, ...LINKS].map((link, index) => (
                  <li
                    key={link.to}
                    className="animate-fade-up"
                    style={{ animationDelay: `${80 + index * 60}ms` }}
                  >
                    <Link
                      to={link.to}
                      className="group/item flex items-baseline gap-4 py-2 text-3xl font-medium tracking-tight transition-colors duration-300 hover:text-accent sm:text-4xl"
                    >
                      <span className="text-xs text-muted-foreground tabular-nums">
                        <bdi>0{index + 1}</bdi>
                      </span>
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-1 inset-x-0 h-px origin-[100%_50%] scale-x-0 bg-accent transition-transform duration-500 ease-smooth group-hover/item:scale-x-100" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                קטגוריות
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {categories.map((category, index) => (
                  <li
                    key={category.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${200 + index * 40}ms` }}
                  >
                    <Link
                      to={`/category/${category.slug}`}
                      className="group/cat flex items-center gap-3 rounded-[1.5rem] border border-transparent p-3 transition-colors duration-300 hover:border-white/15 hover:bg-surface"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-muted-foreground transition-colors duration-300 group-hover/cat:border-accent group-hover/cat:text-accent">
                        <CategoryIcon name={category.icon} className="size-4" />
                      </span>
                      <span className="text-sm">{category.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
