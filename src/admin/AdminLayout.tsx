import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Bot,
  LayoutDashboard,
  LogOut,
  Store,
  Users,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/admin/useAdmin";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "סקירה", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "לידים", icon: Users, end: false },
  { to: "/admin/robots", label: "רובוטים", icon: Bot, end: false },
  { to: "/admin/guides", label: "מדריכים", icon: BookOpen, end: false },
  { to: "/admin/stores", label: "חנויות ואפילייט", icon: Store, end: false },
];

export default function AdminLayout() {
  const { session, isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ניהול | buy robots";
  }, []);

  useEffect(() => {
    if (!loading && !session) navigate("/admin/login", { replace: true });
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface">
        <p className="text-sm text-muted-foreground">טוען…</p>
      </div>
    );
  }

  if (session && !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">אין לך הרשאת ניהול</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            החשבון מחובר, אבל הוא לא מסומן כמנהל. פנה לבעל האתר כדי לקבל
            הרשאה.
          </p>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="mt-6 text-sm underline underline-offset-4"
          >
            התנתקות
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-s border-border bg-background p-5 lg:flex">
        <Logo />

        <nav className="mt-8 flex-1 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 items-center gap-3 rounded-card px-3 text-sm transition-colors duration-200",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border pt-4">
          <p className="truncate text-xs text-muted-foreground" dir="ltr">
            {session?.user.email}
          </p>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-card px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            התנתקות
          </button>
        </div>
      </aside>

      {/* Mobile nav: the sidebar collapses to a scrollable strip. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-border bg-background px-4 py-3 lg:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-5 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
