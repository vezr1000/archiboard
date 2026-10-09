/**
 * Date helpers. The demo runs on a fixed „today“ so seed data (gates in the next 30 days, overdue conditions …)
 * always tells the same story. Seed data authors: write dates relative to DEMO_TODAY.
 */

/** The demo's „today“ (ISO). */
export const DEMO_TODAY = '2026-10-09';

/** Parse `YYYY-MM-DD` as a LOCAL date (avoids the UTC off-by-one of `new Date('2026-10-09')`). */
export function parseIsoDate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(iso);
}

/** `Date` → `YYYY-MM-DD` (local). */
export function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Demo today as a Date. */
export const demoToday = (): Date => parseIsoDate(DEMO_TODAY);

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: string | Date, b: string | Date): number {
  const da = typeof a === 'string' ? parseIsoDate(a) : a;
  const db = typeof b === 'string' ? parseIsoDate(b) : b;
  const sa = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const sb = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((sb - sa) / 86_400_000);
}

/** Days from DEMO_TODAY until `iso` (negative = in the past). */
export const daysFromToday = (iso: string): number => daysBetween(DEMO_TODAY, iso);

/** ISO date `n` days after `iso` (or after DEMO_TODAY). */
export function addDays(n: number, iso: string = DEMO_TODAY): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + n);
  return toIsoDate(d);
}

/** True when `iso` is between today and today + `days` (inclusive). */
export const isWithinNextDays = (iso: string, days: number): boolean => {
  const n = daysFromToday(iso);
  return n >= 0 && n <= days;
};
