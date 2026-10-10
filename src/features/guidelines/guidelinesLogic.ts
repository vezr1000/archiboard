/**
 * Смернице и прописи — library logic: tolerant text search, ordering and relations between entries.
 * Pure functions over seed data (no store, no React).
 */
import { projectsForRegulation, regulations } from '@/data';
import type { Jurisdiction, Project, Regulation, RegulationKind, Tone } from '@/domain/types';

/* ------------------------------------------------------------------------------------------------
 * Text normalisation (search)
 * ---------------------------------------------------------------------------------------------- */

/** Serbian Cyrillic → plain ASCII Latin (so „kosava“ finds „кошава“ and „DGNB“ stays itself). */
const CYR_TO_ASCII: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'dj', е: 'e', ж: 'z', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj',
  м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'c', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'c',
  џ: 'dz', ш: 's',
};

/** Latin letters with no Unicode decomposition. */
const LATIN_FOLD: Record<string, string> = { đ: 'dj', ł: 'l', ø: 'o', ß: 'ss' };

/**
 * Lower-case, strip diacritics (Latin č ć š ž đ, ü, é …) and transliterate Cyrillic to ASCII.
 * Both the query and the searched text go through this, so „Kosava“, „КОШАВА“ and „košava“ all match.
 */
export function foldText(input: string): string {
  let out = '';
  for (const ch of input.toLowerCase().normalize('NFD')) {
    if (/\p{M}/u.test(ch)) continue;
    out += CYR_TO_ASCII[ch] ?? LATIN_FOLD[ch] ?? ch;
  }
  return out;
}

/** Searchable text of an entry, folded. */
const haystack = (r: Regulation): string => foldText([r.title, r.code, r.summary, ...r.keyPoints, ...r.tags].join(' \n '));

const HAYSTACKS = new Map<string, string>(regulations.map((r) => [r.id, haystack(r)]));

/** Every whitespace-separated term of the query must occur in the entry (title, code, summary, key points, tags). */
export function matchesQuery(r: Regulation, query: string): boolean {
  const terms = foldText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = HAYSTACKS.get(r.id) ?? haystack(r);
  return terms.every((t) => text.includes(t));
}

/* ------------------------------------------------------------------------------------------------
 * Kinds, jurisdictions, ordering
 * ---------------------------------------------------------------------------------------------- */

/** Display order: firm guidelines first (the selling point), then national law, standards, EU, schemes. */
export const KIND_ORDER: RegulationKind[] = ['smernica-firme', 'zakon', 'pravilnik', 'standard', 'eu', 'sertifikacija'];

/** Short chip labels for the kind filter (plural / compact forms). */
export const KIND_CHIP_LABELS: Record<RegulationKind, string> = {
  zakon: 'Закони',
  pravilnik: 'Правилници',
  standard: 'Стандарди',
  sertifikacija: 'Сертификација',
  eu: 'ЕУ',
  'smernica-firme': 'Смернице фирме',
};

export const JURISDICTION_CHIP_LABELS: Record<Jurisdiction, string> = {
  RS: 'Србија',
  EU: 'ЕУ',
  intl: 'Међународно',
  firm: 'Фирма',
};

export const JURISDICTION_ORDER: Jurisdiction[] = ['RS', 'EU', 'intl', 'firm'];

export const KIND_TONE: Record<RegulationKind, Tone> = {
  zakon: 'accent',
  pravilnik: 'accent',
  standard: 'info',
  sertifikacija: 'good',
  eu: 'info',
  'smernica-firme': 'clay',
};

export const isFirmGuideline = (r: Pick<Regulation, 'kind'>): boolean => r.kind === 'smernica-firme';

/** Stable ordering: kind order, then the order in the seed (which follows the library structure). */
export function sortLibrary(list: Regulation[]): Regulation[] {
  const seedIndex = new Map(regulations.map((r, i) => [r.id, i]));
  return [...list].sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || (seedIndex.get(a.id) ?? 0) - (seedIndex.get(b.id) ?? 0),
  );
}

/* ------------------------------------------------------------------------------------------------
 * Relations
 * ---------------------------------------------------------------------------------------------- */

/** Entries that share tags with `r`, most shared tags first (top `limit`). */
export function relatedEntries(r: Regulation, limit = 4): Array<{ entry: Regulation; shared: string[] }> {
  const mine = new Set(r.tags.map((t) => t.toLowerCase()));
  return regulations
    .filter((x) => x.id !== r.id)
    .map((entry) => ({ entry, shared: entry.tags.filter((t) => mine.has(t.toLowerCase())) }))
    .filter((x) => x.shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, limit);
}

/** Label for the „applies to“ chips of a card: „Сви пројекти“ or up to `max` short names + „+N“. */
export function appliesToLabels(projects: Project[], total: number, max = 3): { labels: string[]; more: number; all: boolean } {
  if (projects.length === 0) return { labels: [], more: 0, all: false };
  if (projects.length === total) return { labels: [], more: 0, all: true };
  return { labels: projects.slice(0, max).map((p) => p.shortName), more: Math.max(0, projects.length - max), all: false };
}

/** Project ids an entry applies to (memoised per id — seed is read-only). */
const APPLIES_CACHE = new Map<string, Project[]>();
export function appliesToProjects(r: Regulation): Project[] {
  let list = APPLIES_CACHE.get(r.id);
  if (!list) {
    list = projectsForRegulation(r.id);
    APPLIES_CACHE.set(r.id, list);
  }
  return list;
}
