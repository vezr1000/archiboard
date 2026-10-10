import type { LucideIcon } from 'lucide-react';
import { FileCheck, Mail, Megaphone, Users } from 'lucide-react';
import type { EngagementKind, Project, Stakeholder, StakeholderAttitude } from '@/domain/types';
import { GATE_LABELS } from '@/domain/labels';
import { DEMO_TODAY, daysFromToday, toIsoDate } from '@/lib/dates';

/* ---------- Role groups (derived from name / organisation / role) ---------- */

export type StakeholderGroup = 'institucije' | 'jkp' | 'investitor' | 'zajednica' | 'izvodjac';

export const GROUP_LABELS: Record<StakeholderGroup, string> = {
  institucije: 'Институције',
  jkp: 'ЈКП и комунална предузећа',
  investitor: 'Инвеститор и финансије',
  zajednica: 'Заједница и корисници',
  izvodjac: 'Извођач и консултанти',
};

export const GROUP_ORDER: StakeholderGroup[] = ['institucije', 'jkp', 'investitor', 'izvodjac', 'zajednica'];

/** Ordered keyword rules — the first match wins; everything else is an institution (city, ministry, heritage institute). */
const GROUP_RULES: Array<{ group: StakeholderGroup; test: RegExp }> = [
  { group: 'investitor', test: /инвеститор|кредит|банк|закупац/i },
  { group: 'jkp', test: /ЈКП|ЈВП|електродистрибуц|ЕПС/i },
  { group: 'izvodjac', test: /извођач|верификатор|консултант|сертификацион/i },
  { group: 'zajednica', test: /станар|удружењ|заједниц|родитељ|корисник|суседи|колектив|школ|предшколск/i },
];

export function groupOf(s: Pick<Stakeholder, 'name' | 'organization' | 'role'>): StakeholderGroup {
  // Role first (it says what the party does in the project), then name + organisation.
  const byRole = GROUP_RULES.find((r) => r.test.test(s.role));
  if (byRole) return byRole.group;
  const text = `${s.name} ${s.organization}`;
  return GROUP_RULES.find((r) => r.test.test(text))?.group ?? 'institucije';
}

/* ---------- Influence × interest quadrants ---------- */

export type QuadrantId = 'manage' | 'satisfy' | 'inform' | 'monitor';

export const QUADRANT_LABELS: Record<QuadrantId, string> = {
  manage: 'Активно управљати',
  satisfy: 'Држати задовољним',
  inform: 'Држати информисаним',
  monitor: 'Пратити',
};

export const QUADRANT_HINTS: Record<QuadrantId, string> = {
  manage: 'Висок утицај и висок интерес — редовни састанци, заједничко доношење одлука.',
  satisfy: 'Висок утицај, мањи интерес — благовремене информације и испуњавање услова.',
  inform: 'Мањи утицај, висок интерес — јасна и редовна комуникација.',
  monitor: 'Мањи утицај и интерес — праћење и повремено обавештавање.',
};

/** Grid labels in the order QuadrantGrid expects (influence ↑, interest →). */
export const QUADRANTS = { tl: QUADRANT_LABELS.satisfy, tr: QUADRANT_LABELS.manage, bl: QUADRANT_LABELS.monitor, br: QUADRANT_LABELS.inform };

/** A value of 3 counts as „high“ (the dashed midline of the grid is at 3). */
export function quadrantOf(s: Pick<Stakeholder, 'influence' | 'interest'>): QuadrantId {
  const highInfluence = s.influence >= 3;
  const highInterest = s.interest >= 3;
  if (highInfluence) return highInterest ? 'manage' : 'satisfy';
  return highInterest ? 'inform' : 'monitor';
}

/** Display-only nudge so that a value of 3 is drawn on the „high“ side of the midline instead of on it. */
export const gridPosition = (v: number): number => (v === 3 ? 3.3 : v);

export const ATTITUDE_ORDER: StakeholderAttitude[] = ['supportive', 'neutral', 'opposed'];

/** Most influential first (then most interested, then name) — the order of the numbers on the map. */
export const sortByImportance = <T extends Pick<Stakeholder, 'influence' | 'interest' | 'name'>>(list: T[]): T[] =>
  [...list].sort((a, b) => b.influence - a.influence || b.interest - a.interest || a.name.localeCompare(b.name, 'sr'));

/* ---------- Engagement log ---------- */

export const KIND_ICONS: Record<EngagementKind, LucideIcon> = {
  sastanak: Users,
  dopis: Mail,
  saglasnost: FileCheck,
  'javna-rasprava': Megaphone,
};

/** Date of the latest log entry (log may be in any order). */
export const lastContact = (s: Pick<Stakeholder, 'log'>): string | undefined =>
  s.log.reduce<string | undefined>((best, e) => (best === undefined || e.date > best ? e.date : best), undefined);

/* ---------- Next actions with due dates parsed from the text ---------- */

const MONTHS_GEN = ['јануара', 'фебруара', 'марта', 'априла', 'маја', 'јуна', 'јула', 'августа', 'септембра', 'октобра', 'новембра', 'децембра'];
const MONTHS_LOC = ['јануару', 'фебруару', 'марту', 'априлу', 'мају', 'јуну', 'јулу', 'августу', 'септембру', 'октобру', 'новембру', 'децембру'];

export interface ParsedDue {
  /** ISO date used for sorting / overdue checks. */
  date: string;
  /** exact = a day is named in the text; month = only a month („у новембру“, sorted to mid-month); gate = next gate of the project. */
  precision: 'exact' | 'month' | 'gate';
}

/**
 * Seed next actions are free text; try to recover a due date: „14. октобра“, „у новембру“, or a mention of the
 * project's next gate („после Г2“). Returns undefined when the text names no date.
 */
export function parseDue(text: string, project?: Pick<Project, 'nextGate'>): ParsedDue | undefined {
  const year = Number(DEMO_TODAY.slice(0, 4));
  const iso = (m: number, d: number) => toIsoDate(new Date(year, m, d));
  const day = new RegExp(`(\\d{1,2})\\.\\s*(${MONTHS_GEN.join('|')})`).exec(text);
  if (day) return { date: iso(MONTHS_GEN.indexOf(day[2]), Number(day[1])), precision: 'exact' };
  const month = new RegExp(`(?:у|током)\\s+(${MONTHS_LOC.join('|')})`).exec(text);
  if (month) return { date: iso(MONTHS_LOC.indexOf(month[1]), 15), precision: 'month' };
  const gate = /Г([0-5])/.exec(text);
  if (gate && project && GATE_LABELS[project.nextGate.gate].code === `Г${gate[1]}`) {
    return { date: project.nextGate.date, precision: 'gate' };
  }
  return undefined;
}

export interface NextActionItem {
  stakeholder: Stakeholder;
  text: string;
  due?: ParsedDue;
  overdue: boolean;
}

/** Upcoming next actions: overdue first, then by date; undated last. */
export function nextActionsOf(stakeholders: Stakeholder[], project: Pick<Project, 'nextGate'>): NextActionItem[] {
  return stakeholders
    .flatMap((stakeholder) => {
      if (!stakeholder.nextAction) return [];
      const due = parseDue(stakeholder.nextAction, project);
      return [{ stakeholder, text: stakeholder.nextAction, due, overdue: due !== undefined && daysFromToday(due.date) < 0 }];
    })
    .sort((a, b) => (a.due?.date ?? '9999').localeCompare(b.due?.date ?? '9999') || b.stakeholder.influence - a.stakeholder.influence);
}
