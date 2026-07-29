import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MousePointerClick, TrendingUp, Users } from "lucide-react";
import {
  useAdminClicks,
  useAdminLeads,
  useAdminRobots,
  useAdminStores,
} from "@/admin/adminQueries";
import { LEAD_TYPE_LABELS, type LeadType } from "@/types";
import { formatPrice } from "@/lib/format";

/** Share of clicks assumed to convert into a purchase, for the estimate only. */
const ASSUMED_CONVERSION = 0.03;

export default function Dashboard() {
  const { data: leads = [] } = useAdminLeads();
  const { data: clicks = [] } = useAdminClicks(30);
  const { data: stores = [] } = useAdminStores();
  const { data: robots = [] } = useAdminRobots();

  const weekAgo = Date.now() - 7 * 86_400_000;
  const leadsThisWeek = leads.filter(
    (lead) => new Date(lead.created_at).getTime() > weekAgo,
  );
  const newLeads = leads.filter((lead) => lead.status === "new");

  const byType = useMemo(() => {
    const counts = new Map<LeadType, number>();
    for (const lead of leads) {
      counts.set(lead.type, (counts.get(lead.type) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const byStore = useMemo(() => {
    const counts = new Map<string, number>();
    for (const click of clicks) {
      if (!click.store_id) continue;
      counts.set(click.store_id, (counts.get(click.store_id) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([storeId, count]) => ({
        store: stores.find((item) => item.id === storeId),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [clicks, stores]);

  const topRobots = useMemo(() => {
    const counts = new Map<string, number>();
    for (const click of clicks) {
      if (!click.robot_id) continue;
      counts.set(click.robot_id, (counts.get(click.robot_id) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([robotId, count]) => ({
        robot: robots.find((item) => item.id === robotId),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [clicks, robots]);

  /**
   * A rough commission estimate, not a report: clicks × assumed conversion ×
   * the store's own rate against the robot's entry price. Good enough to
   * price a lead package, not good enough to file taxes on.
   */
  const estimated = useMemo(() => {
    let total = 0;
    for (const click of clicks) {
      const store = stores.find((item) => item.id === click.store_id);
      const robot = robots.find((item) => item.id === click.robot_id);
      if (!store || !robot?.price_from) continue;
      total += robot.price_from * (store.commission_rate / 100) * ASSUMED_CONVERSION;
    }
    return total;
  }, [clicks, stores, robots]);

  const maxStoreClicks = Math.max(1, ...byStore.map((row) => row.count));

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">סקירה</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          30 הימים האחרונים.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users className="size-4" />}
          label="לידים השבוע"
          value={leadsThisWeek.length.toLocaleString("he-IL")}
          hint={`${newLeads.length} ממתינים לטיפול`}
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="סה״כ לידים"
          value={leads.length.toLocaleString("he-IL")}
        />
        <StatCard
          icon={<MousePointerClick className="size-4" />}
          label="קליקים לחנויות"
          value={clicks.length.toLocaleString("he-IL")}
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="עמלה משוערת"
          value={formatPrice(Math.round(estimated))}
          hint={`לפי המרה של ${ASSUMED_CONVERSION * 100}%`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="לידים לפי סוג" action={{ to: "/admin/leads", label: "לכל הלידים" }}>
          {byType.length === 0 ? (
            <Empty>עדיין אין לידים.</Empty>
          ) : (
            <ul className="space-y-3">
              {byType.map(([type, count]) => (
                <li key={type} className="flex items-center justify-between gap-4">
                  <span className="text-sm">{LEAD_TYPE_LABELS[type]}</span>
                  <span className="text-sm font-semibold tabular-nums">
                    <bdi>{count}</bdi>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="קליקים לפי חנות">
          {byStore.length === 0 ? (
            <Empty>עדיין אין קליקים.</Empty>
          ) : (
            <ul className="space-y-4">
              {byStore.map((row) => (
                <li key={row.store?.id ?? "unknown"}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span>{row.store?.name ?? "לא ידוע"}</span>
                    <span className="font-semibold tabular-nums">
                      <bdi>{row.count}</bdi>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-foreground transition-[width] duration-700 ease-smooth"
                      style={{ width: `${(row.count / maxStoreClicks) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="הרובוטים עם הכי הרבה קליקים"
          action={{ to: "/admin/robots", label: "לניהול רובוטים" }}
        >
          {topRobots.length === 0 ? (
            <Empty>עדיין אין קליקים.</Empty>
          ) : (
            <ol className="space-y-3">
              {topRobots.map((row, index) => (
                <li
                  key={row.robot?.id ?? index}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="flex min-w-0 items-center gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/5 text-xs tabular-nums">
                      <bdi>{index + 1}</bdi>
                    </span>
                    <span className="truncate">{row.robot?.name ?? "—"}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    <bdi>{row.count}</bdi>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="לידים אחרונים" action={{ to: "/admin/leads", label: "הכול" }}>
          {leads.length === 0 ? (
            <Empty>עדיין אין לידים.</Empty>
          ) : (
            <ul className="divide-y divide-white/10">
              {leads.slice(0, 6).map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm" dir="ltr">
                      {lead.email ?? lead.phone ?? "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {LEAD_TYPE_LABELS[lead.type]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-background p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums">
        <bdi>{value}</bdi>
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-background p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action && (
          <Link
            to={action.to}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
