/**
 * Serbian (Cyrillic) number/date formatting. ALL user-visible numbers and dates go through here.
 *
 *   formatNumber(18400)            → „18.400“
 *   formatNumber(0.349, 2)         → „0,35“
 *   formatArea(18400)              → „18.400 m²“
 *   formatArea(42000, 'ha')        → „4,2 ha“
 *   formatCarbon(412)              → „412 kgCO₂e/m²“
 *   formatCarbon(18400, 'total')   → „18,4 t CO₂e“
 *   formatEur(12_500_000)          → „12.500.000 €“
 *   formatEur(12_500_000, true)    → „12,5 мил. €“
 *   formatPct(12.34)               → „12,3 %“
 *   formatPct(-12, { signed: true })→ „−12 %“
 *   formatDate('2026-10-09')       → „9. октобар 2026.“
 *   formatDate('2026-10-09','short') → „9. окт“
 *   formatDateGenitive('2026-10-23') → „23. октобра 2026.“ (running text)
 *   formatRelative('2026-10-12')   → „за 3 дана“ (relative to DEMO_TODAY)
 *
 * Numbers and units are joined with a non-breaking space so they never wrap apart.
 */
import { DEMO_TODAY, parseIsoDate } from './dates';

const LOCALE = 'sr-Cyrl-RS';
export const NBSP = ' ';
const MINUS = '−';

/* ---------- Intl with safe fallback ---------- */

const numberFormatCache = new Map<string, Intl.NumberFormat>();
function nf(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options);
  let f = numberFormatCache.get(key);
  if (!f) {
    try {
      f = new Intl.NumberFormat(LOCALE, options);
    } catch {
      // Very old engines: fall back to German grouping (same separators as Serbian: 18.400,5).
      f = new Intl.NumberFormat('de-DE', options);
    }
    numberFormatCache.set(key, f);
  }
  return f;
}

// Dates are formatted manually (identical to Intl sr-Cyrl-RS output, but deterministic on every engine).
const MONTHS_LONG = ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'];
const MONTHS_GENITIVE = ['јануара', 'фебруара', 'марта', 'априла', 'маја', 'јуна', 'јула', 'августа', 'септембра', 'октобра', 'новембра', 'децембра'];
const MONTHS_SHORT = ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'];
const WEEKDAYS = ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'];

/* ---------- Numbers ---------- */

/**
 * Format a number with Serbian separators.
 * @param decimals fixed number of decimals. If omitted: 2 for |n| < 10, 1 for |n| < 100, else 0 (trailing zeros dropped).
 */
export function formatNumber(n: number, decimals?: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions =
    decimals === undefined
      ? { maximumFractionDigits: abs < 10 ? 2 : abs < 100 ? 1 : 0 }
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return nf(opts).format(n).replace('-', MINUS);
}

/** Number with explicit sign: „+12,5“, „−3“, „0“. */
export function formatSigned(n: number, decimals?: number): string {
  if (!Number.isFinite(n)) return '—';
  const body = formatNumber(Math.abs(n), decimals);
  if (n > 0) return `+${body}`;
  if (n < 0) return `${MINUS}${body}`;
  return body;
}

/** Compact number: „12,5 мил.“, „18,4 хиљ.“. */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return nf({ notation: 'compact', maximumFractionDigits: 1 }).format(n).replace('-', MINUS);
}

/** Value + unit joined with a non-breaking space: formatUnit(54, 'kWh/m²a') → „54 kWh/m²a“. */
export function formatUnit(n: number, unit: string, decimals?: number): string {
  const v = formatNumber(n, decimals);
  return unit ? `${v}${NBSP}${unit}` : v;
}

/** Area. `unit` 'auto' switches to hectares at ≥ 10.000 m². */
export function formatArea(m2: number, unit: 'm2' | 'ha' | 'auto' = 'm2'): string {
  if (unit === 'ha' || (unit === 'auto' && m2 >= 10_000)) return formatUnit(m2 / 10_000, 'ha', 1);
  return formatUnit(m2, 'm²', 0);
}

/**
 * Carbon.
 * - 'per-m2' (default): value in kgCO₂e/m² → „412 kgCO₂e/m²“
 * - 'total': value in kgCO₂e → tonnes „18,4 t CO₂e“ (or kg below 1 t)
 * - 'tonnes': value already in t → „18,4 t CO₂e“
 */
export function formatCarbon(value: number, mode: 'per-m2' | 'total' | 'tonnes' = 'per-m2'): string {
  if (mode === 'per-m2') return formatUnit(value, 'kgCO₂e/m²', 0);
  const t = mode === 'tonnes' ? value : value / 1000;
  if (mode === 'total' && Math.abs(t) < 1) return formatUnit(value, 'kgCO₂e', 0);
  return formatUnit(t, 't CO₂e', Math.abs(t) < 100 ? 1 : 0);
}

/** Euros: „12.500.000 €“; compact → „12,5 мил. €“. */
export function formatEur(n: number, compact = false): string {
  if (compact) return `${formatCompact(n)}${NBSP}€`;
  return `${formatNumber(n, 0)}${NBSP}€`;
}

/**
 * Percent. By default `value` is already in percent (12.3 → „12,3 %“).
 * @param opts.ratio  value is a 0..1 ratio (0.123 → „12,3 %“)
 * @param opts.signed prefix + / − (for deltas)
 * @param opts.decimals fixed decimals (default: up to 1)
 */
export function formatPct(value: number, opts: { ratio?: boolean; signed?: boolean; decimals?: number } = {}): string {
  const v = opts.ratio ? value * 100 : value;
  if (!Number.isFinite(v)) return '—';
  const decimals = opts.decimals;
  const body =
    decimals === undefined
      ? nf({ maximumFractionDigits: 1 }).format(Math.abs(v))
      : formatNumber(Math.abs(v), decimals);
  const sign = v < 0 ? MINUS : opts.signed && v > 0 ? '+' : '';
  return `${sign}${body}${NBSP}%`;
}

/* ---------- Dates ---------- */

export type DateStyle = 'long' | 'short' | 'numeric' | 'month' | 'weekday' | 'day-month';

/**
 * Format an ISO date (or Date).
 * - 'long'      „9. октобар 2026.“
 * - 'short'     „9. окт“
 * - 'day-month' „9. октобар“
 * - 'numeric'   „9. 10. 2026.“
 * - 'month'     „октобар 2026.“
 * - 'weekday'   „петак, 9. октобар“
 */
export function formatDate(input: string | Date, style: DateStyle = 'long'): string {
  const d = typeof input === 'string' ? parseIsoDate(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();

  switch (style) {
    case 'short':
      return `${day}. ${MONTHS_SHORT[m]}`;
    case 'day-month':
      return `${day}. ${MONTHS_LONG[m]}`;
    case 'numeric':
      return `${day}. ${m + 1}. ${y}.`;
    case 'month':
      return `${MONTHS_LONG[m]} ${y}.`;
    case 'weekday':
      return `${WEEKDAYS[d.getDay()]}, ${day}. ${MONTHS_LONG[m]}`;
    default:
      return `${day}. ${MONTHS_LONG[m]} ${y}.`;
  }
}

/**
 * Date for running text where the month stands in the genitive: „23. октобра 2026.“
 * (e.g. „на седници одржаној 23. октобра 2026.“). Standalone labels keep using `formatDate`.
 */
export function formatDateGenitive(input: string | Date): string {
  const d = typeof input === 'string' ? parseIsoDate(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()}. ${MONTHS_GENITIVE[d.getMonth()]} ${d.getFullYear()}.`;
}

/**
 * Relative date vs the demo „today“ (DEMO_TODAY): „данас“, „сутра“, „за 3 дана“, „пре 2 недеље“, „за 2 месеца“.
 */
export function formatRelative(input: string | Date, now: string | Date = DEMO_TODAY): string {
  const d = typeof input === 'string' ? parseIsoDate(input) : input;
  const n = typeof now === 'string' ? parseIsoDate(now) : now;
  const days = Math.round((startOfDay(d) - startOfDay(n)) / 86_400_000);
  const abs = Math.abs(days);
  let value: number;
  let unit: Intl.RelativeTimeFormatUnit;
  if (abs < 7) {
    value = days;
    unit = 'day';
  } else if (abs < 30) {
    value = Math.round(days / 7);
    unit = 'week';
  } else if (abs < 365) {
    value = Math.round(days / 30);
    unit = 'month';
  } else {
    value = Math.round(days / 365);
    unit = 'year';
  }
  try {
    return new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }).format(value, unit);
  } catch {
    if (days === 0) return 'данас';
    return days > 0 ? `за ${abs} дана` : `пре ${abs} дана`;
  }
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
