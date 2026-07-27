const shekels = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

/** `6490` → `‎₪6,490`. Returns a dash for missing prices, never "₪0". */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return shekels.format(value);
}

const dates = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return dates.format(new Date(value));
}

/** `9.4` → `9.4`, `9` → `9.0`. Keeps the score column visually even. */
export function formatScore(value: number | null | undefined): string {
  if (!value) return "—";
  return value.toFixed(1);
}

/** Relative wording used on lead timestamps in the admin. */
export function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דק׳`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `לפני ${hours} שע׳`;
  const days = Math.round(hours / 24);
  if (days < 30) return `לפני ${days} ימים`;
  return formatDate(value);
}
