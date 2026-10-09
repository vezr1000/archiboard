/**
 * Pure logic for the „Сертификација“ tab: score model, status sentence, next level, criteria helpers.
 * Units follow `src/lib/cert.ts` (LEED points /110, everything else a 0–100 scale).
 */
import type { RingThreshold } from '@/components/charts';
import type { CertificationCategory, CertificationCategoryScore, CertificationCriterion, CertificationScheme, Project, Tone } from '@/domain/types';
import {
  achievedLevel,
  categoryBreakdown,
  formatCertGap,
  formatCertScore,
  nextThreshold,
  thresholdOf,
  thresholdsInScoreUnits,
  trackerScore,
} from '@/lib/cert';
import { formatNumber } from '@/lib/format';

export interface CertModel {
  project: Project;
  tracker: CertificationCategory;
  scheme: CertificationScheme;
  /** Display name of the target level, e.g. „Gold“, „Напредни“. */
  level: string;
  thresholds: RingThreshold[];
  score: number;
  target: number;
  /** Threshold value of the target level (score units). */
  levelValue: number;
  reached?: RingThreshold;
  next?: RingThreshold;
  /** Score if everything targeted is achieved (incl. at-risk). */
  potential: number;
  /** Part of `potential` that depends on at-risk credits. */
  atRisk: number;
  status: { tone: Tone; text: string; detail?: string };
}

const EDGE_SHORT: Record<string, string> = { energy: 'енергије', water: 'воде', materials: 'материјала' };

function edgeSentence(level: string, cats: CertificationCategoryScore[]): { tone: Tone; text: string } {
  const parts = cats.map((c) => `${EDGE_SHORT[c.id] ?? c.label.toLowerCase()} ${formatNumber(c.achieved, 0)} % (захтев ${formatNumber(c.targeted, 0)} %)`);
  const unmet = cats.filter((c) => c.achieved < c.targeted).map((c) => EDGE_SHORT[c.id] ?? c.label);
  if (unmet.length === 0) {
    return { tone: 'good', text: `EDGE ${level} је достижан: уштеде ${parts.join(', ')} премашују захтеве.` };
  }
  return { tone: 'warn', text: `За EDGE ${level} недостаје уштеда у: ${unmet.join(', ')}. Тренутно: ${parts.join(', ')}.` };
}

export function buildCertModel(project: Project, tracker: CertificationCategory): CertModel {
  const scheme = project.certification.scheme;
  const thresholds = thresholdsInScoreUnits(scheme, tracker.thresholds);
  const score = project.certification.currentScore;
  const target = project.certification.targetScore;
  const level = project.certification.targetLevel;
  const levelValue = thresholdOf(thresholds, level)?.value ?? target;
  const potential = trackerScore(tracker, 'targeted');
  const atRisk = trackerScore(tracker, 'atRisk');
  const reserve = score - levelValue;
  const gapText = formatCertGap(reserve, scheme);
  const potentialText = formatCertScore(Math.round(potential * 10) / 10, scheme);

  let status: CertModel['status'];
  if (scheme === 'EDGE') {
    status = edgeSentence(level, tracker.categories);
  } else if (scheme === 'Passivhaus') {
    const met = tracker.categories.reduce((s, c) => s + c.achieved, 0);
    const all = tracker.categories.reduce((s, c) => s + c.max, 0);
    const risk = tracker.categories.reduce((s, c) => s + categoryBreakdown(c).atRisk, 0);
    status = {
      tone: 'warn',
      text: `Passivhaus ${level} је све-или-ништа: сви критеријуми морају бити испуњени. Тренутно ${met} од ${all}${risk > 0 ? `, од тога ${risk} угрожен` : ''}.`,
    };
  } else if (reserve >= 0) {
    status = { tone: reserve < 3 ? 'warn' : 'good', text: `${level} је достижан уз резерву од ${gapText}.` };
  } else if (potential >= levelValue) {
    const onlyIfRisky = potential - atRisk < levelValue;
    status = {
      tone: 'warn',
      text: `До нивоа ${level} недостаје ${gapText}. Остваривањем свих циљаних кредита (${potentialText}) ниво се достиже${onlyIfRisky ? ', али само ако се остваре и угрожени кредити' : ''}.`,
    };
  } else {
    status = { tone: 'bad', text: `До нивоа ${level} недостаје ${gapText}, а ни сви циљани кредити (${potentialText}) не воде до њега.` };
  }
  if (scheme !== 'EDGE' && scheme !== 'Passivhaus' && atRisk > 0) {
    status.detail = `Циљани кредити носе до ${potentialText}; од тога ${formatCertGap(atRisk, scheme)} зависи од угрожених кредита.`;
  }

  status.text = status.text.replace(/\.\./g, '.');
  if (status.detail) status.detail = status.detail.replace(/\.\./g, '.');

  return {
    project,
    tracker,
    scheme,
    level,
    thresholds,
    score,
    target,
    levelValue,
    reached: achievedLevel(thresholds, score),
    next: nextThreshold(thresholds, score),
    potential,
    atRisk,
    status,
  };
}

/** „ENV1.1 Еколошки биланс…“ → { code: 'ENV1.1', title: 'Еколошки биланс…' }. Labels without a code keep an empty code. */
export function splitCriterionCode(label: string, categoryIds: string[]): { code: string; title: string } {
  const m = label.match(/^([A-Z][A-Za-z]{0,3}\s?\d+(?:\.\d+)?)\s+(.+)$/);
  if (m) return { code: m[1], title: m[2] };
  const m2 = label.match(/^([A-Z]{2,3})\s+(.+)$/);
  if (m2 && categoryIds.includes(m2[1])) return { code: m2[1], title: m2[2] };
  return { code: '', title: label };
}

/** Criteria in tracker category order (stable within a category). */
export function sortedCriteria(tracker: CertificationCategory, criteria: CertificationCriterion[]): CertificationCriterion[] {
  const order = new Map(tracker.categories.map((c, i) => [c.id, i]));
  return [...criteria].sort((a, b) => (order.get(a.categoryId) ?? 99) - (order.get(b.categoryId) ?? 99));
}

export interface AtRiskItem {
  criterion: CertificationCriterion;
  category?: CertificationCategoryScore;
  /** Sort key: larger = more at stake. */
  stake: number;
  /** Human text on what is at stake. */
  stakeText: string;
}

/**
 * At-risk criteria ranked by what is at stake: remaining criterion points where the scheme counts them (DGNB, LEED),
 * otherwise the at-risk share of the category in score points (weight × at-risk / max).
 */
export function atRiskCriteria(model: CertModel, criteria: CertificationCriterion[]): AtRiskItem[] {
  const { scheme, tracker } = model;
  return criteria
    .filter((c) => c.status === 'at-risk')
    .map((criterion) => {
      const category = tracker.categories.find((c) => c.id === criterion.categoryId);
      if ((scheme === 'DGNB' || scheme === 'LEED') && criterion.points !== undefined && criterion.maxPoints !== undefined) {
        const open = Math.max(0, criterion.maxPoints - criterion.points);
        return {
          criterion,
          category,
          stake: open,
          stakeText: `${formatNumber(criterion.points, 0)} од ${formatNumber(criterion.maxPoints, 0)} бод. · још до ${formatNumber(open, 0)} бод.`,
        };
      }
      const pp = category ? (category.weight * categoryBreakdown(category).atRisk) / (category.max || 1) : 0;
      return {
        criterion,
        category,
        stake: pp,
        stakeText: pp > 0 ? `категорија је угрожена до ${formatNumber(Math.round(pp * 10) / 10, 1)} п.п. резултата` : 'утицај на резултат још није процењен',
      };
    })
    .sort((a, b) => b.stake - a.stake);
}

/** Short category code for display („ENV“, „Ene“); empty for slug ids like „energija“. */
export const categoryCode = (id: string): string => (/^[A-Z][A-Za-z]{0,3}$/.test(id) ? id : '');
