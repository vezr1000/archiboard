/**
 * Pure helpers for the presenter's feedback summary (`/povratne-informacije`): filtering by session, per-module ranking,
 * export builders (CSV / JSON / clipboard summary) and the file download. No React here.
 */
import { MODULES } from '@/components/layout/navigation';
import { FEEDBACK_RATING_LABELS } from '@/domain/labels';
import type { FeedbackEntry, FeedbackRating, Tone } from '@/domain/types';
import { formatSigned } from '@/lib/format';
import { toIsoDate } from '@/lib/dates';

/** Sentinel session key for answers saved without a session label („без ознаке“). */
export const NO_SESSION = '__none__';

export const sessionKeyOf = (f: FeedbackEntry): string => f.sessionLabel || NO_SESSION;

export const sessionName = (key: string): string => (key === NO_SESSION ? 'без ознаке' : key);

export interface SessionOption {
  value: string;
  label: string;
  count: number;
}

/** Distinct session labels found in the feedback (labelled sessions A→Ш first, „без ознаке“ last). */
export function sessionOptions(feedback: FeedbackEntry[]): SessionOption[] {
  const counts = new Map<string, number>();
  for (const f of feedback) counts.set(sessionKeyOf(f), (counts.get(sessionKeyOf(f)) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([a], [b]) => {
      if (a === NO_SESSION) return 1;
      if (b === NO_SESSION) return -1;
      return a.localeCompare(b, 'sr');
    })
    .map(([value, count]) => ({ value, label: sessionName(value), count }));
}

export const RATING_TONE: Record<FeedbackRating, Tone> = { up: 'good', meh: 'warn', down: 'bad' };

export interface ModuleRow {
  moduleId: string;
  label: string;
  group: string;
  up: number;
  meh: number;
  down: number;
  total: number;
  /** (Да − Не) / укупно, from −1 to +1. */
  score: number;
  notes: number;
}

const MODULE_BY_ID = new Map(MODULES.map((m) => [m.id, m]));

export const scoreOf = (up: number, down: number, total: number): number => (total > 0 ? (up - down) / total : 0);

/**
 * Rows for every module in MODULES (plus unknown ids found in the feedback), sorted by score, then by number of answers.
 * Modules without answers are returned separately.
 */
export function rankModules(entries: FeedbackEntry[]): { ranked: ModuleRow[]; unanswered: ModuleRow[] } {
  const rows = new Map<string, ModuleRow>();
  const rowFor = (moduleId: string): ModuleRow => {
    let row = rows.get(moduleId);
    if (!row) {
      const known = MODULE_BY_ID.get(moduleId);
      row = {
        moduleId,
        label: known?.label ?? moduleId,
        group: known?.group ?? 'Остало',
        up: 0,
        meh: 0,
        down: 0,
        total: 0,
        score: 0,
        notes: 0,
      };
      rows.set(moduleId, row);
    }
    return row;
  };

  for (const m of MODULES) rowFor(m.id);
  for (const f of entries) {
    const row = rowFor(f.moduleId);
    row[f.rating] += 1;
    row.total += 1;
    if (f.note?.trim()) row.notes += 1;
  }

  const all = [...rows.values()].map((r) => ({ ...r, score: scoreOf(r.up, r.down, r.total) }));
  const ranked = all
    .filter((r) => r.total > 0)
    .sort((a, b) => b.score - a.score || b.total - a.total || a.label.localeCompare(b.label, 'sr'));
  const unanswered = all.filter((r) => r.total === 0);
  return { ranked, unanswered };
}

/** Notes (non-empty answers' notes), newest first. */
export function notesOf(entries: FeedbackEntry[]): FeedbackEntry[] {
  return entries.filter((f) => f.note?.trim()).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/* ---------- Export ---------- */

/** RFC 4180 style escaping: quote when the value holds a separator, quote or line break. */
export function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const ENTRY_ORDER = (a: FeedbackEntry, b: FeedbackEntry) => {
  const ia = MODULES.findIndex((m) => m.id === a.moduleId);
  const ib = MODULES.findIndex((m) => m.id === b.moduleId);
  return (ia < 0 ? 1e6 : ia) - (ib < 0 ? 1e6 : ib) || a.timestamp.localeCompare(b.timestamp);
};

/** CSV with a UTF-8 BOM so Excel shows Cyrillic. Header in Latin for spreadsheet compatibility. */
export function buildCsv(entries: FeedbackEntry[]): string {
  const header = ['moduleId', 'modul', 'grupa', 'ocena', 'beleska', 'sesija', 'vreme'];
  const lines = [header.join(',')];
  for (const f of [...entries].sort(ENTRY_ORDER)) {
    const m = MODULE_BY_ID.get(f.moduleId);
    const cells = [
      f.moduleId,
      m?.label ?? f.moduleId,
      m?.group ?? 'Остало',
      FEEDBACK_RATING_LABELS[f.rating],
      f.note ?? '',
      f.sessionLabel ?? '',
      f.timestamp,
    ];
    lines.push(cells.map(csvCell).join(','));
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

/** JSON export: the answers with module label/group, plus the export time and the session filter used. */
export function buildJson(entries: FeedbackEntry[], sessions: string[], now: Date = new Date()): string {
  const answers = [...entries].sort(ENTRY_ORDER).map((f) => {
    const m = MODULE_BY_ID.get(f.moduleId);
    return {
      moduleId: f.moduleId,
      modul: m?.label ?? f.moduleId,
      grupa: m?.group ?? 'Остало',
      ocena: f.rating,
      beleska: f.note ?? null,
      sesija: f.sessionLabel ?? null,
      vreme: f.timestamp,
    };
  });
  return JSON.stringify(
    { izvezeno: now.toISOString(), sesije: sessions.map(sessionName), broj: answers.length, odgovori: answers },
    null,
    2,
  );
}

/** Serbian plural: 1 одговор · 2–4 одговора · 5+ одговора (`forms` = [one, few, many]). */
export function plural(n: number, forms: [string, string, string]): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
}

/** Plain-text summary of the ranking for pasting into a mail or a chat. */
export function buildSummaryText(entries: FeedbackEntry[], ranked: ModuleRow[]): string {
  const sessions = new Set(entries.map(sessionKeyOf)).size;
  const head = `АрхиБорд · повратне информације: ${entries.length} ${plural(entries.length, ['одговор', 'одговора', 'одговора'])}, ${sessions} ${plural(sessions, ['сесија', 'сесије', 'сесија'])}`;
  const body = ranked.map(
    (r, i) => `${i + 1}. ${r.label}: ${formatSigned(r.score, 2)} (Да ${r.up} · Можда ${r.meh} · Не ${r.down})${r.notes ? ` · белешки ${r.notes}` : ''}`,
  );
  return [head, ...body].join('\n');
}

/** Blob + object URL + temporary anchor. The object URL is revoked shortly after the click. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const exportFilename = (ext: 'csv' | 'json', now: Date = new Date()): string =>
  `arhiboard-povratne-informacije-${toIsoDate(now)}.${ext}`;
