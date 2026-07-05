export type DateRange = "7d" | "30d" | "90d" | "all";

export const DATE_RANGE_OPTIONS: Array<{ value: DateRange; label: string; days: number | null }> = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
];

export function getRangeDays(range: DateRange): number | null {
  return DATE_RANGE_OPTIONS.find((o) => o.value === range)?.days ?? 30;
}

export function withinRange(iso: string | null | undefined, range: DateRange): boolean {
  if (!iso) return false;
  const days = getRangeDays(range);
  if (days === null) return true;
  const cutoff = Date.now() - days * 86400_000;
  return new Date(iso).getTime() >= cutoff;
}

export function buildDailySeries(
  rows: Array<{ redeemed_at: string | null }>,
  range: DateRange,
): Array<{ date: string; redemptions: number }> {
  const days = getRangeDays(range) ?? 30;
  const map: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  rows.forEach((r) => {
    if (r.redeemed_at) {
      const day = r.redeemed_at.slice(0, 10);
      if (map[day] !== undefined) map[day]++;
    }
  });
  return Object.entries(map).map(([date, count]) => ({
    date: date.slice(5),
    redemptions: count,
  }));
}

export function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
