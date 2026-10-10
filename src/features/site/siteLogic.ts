/**
 * Pure helpers for the „Локација и услови“ tab: wind insight, hazard assessment and urban-parameter status.
 * All copy is Serbian Cyrillic; numbers are formatted through `@/lib/format`.
 */
import { COMPASS_LABELS } from '@/domain/labels';
import type { CompassDir, SiteHazards, SiteInfo, Tone, UrbanParam, WindRoseEntry } from '@/domain/types';
import { formatNumber } from '@/lib/format';

/* ------------------------------------------------------------------------------------------------
 * Wind
 * ---------------------------------------------------------------------------------------------- */

const DIRS_16: CompassDir[] = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const KOSAVA_DIRS: CompassDir[] = ['ESE', 'SE', 'SSE'];

export interface WindInsight {
  dominant: WindRoseEntry;
  /** Directions emphasised on the rose: the dominant one plus a neighbour of comparable frequency. */
  highlight: CompassDir[];
  kosava: boolean;
  /** One-line, design-oriented reading of the rose. */
  sentence: string;
}

/** Dominant direction, highlighted sector(s) and a one-line interpretation derived from the wind rose. */
export function windInsight(site: SiteInfo): WindInsight | null {
  const rose = site.climate.windRose;
  if (rose.length === 0) return null;
  const dominant = rose.reduce((a, b) => (b.freq > a.freq ? b : a));
  const i = DIRS_16.indexOf(dominant.dir);
  const neighbours = [DIRS_16[(i + 1) % 16], DIRS_16[(i + 15) % 16]]
    .map((dir) => rose.find((r) => r.dir === dir))
    .filter((r): r is WindRoseEntry => Boolean(r))
    .sort((a, b) => b.freq - a.freq);
  const twin = neighbours[0] && neighbours[0].freq >= dominant.freq * 0.7 ? neighbours[0].dir : undefined;
  const highlight = twin ? [dominant.dir, twin] : [dominant.dir];

  const note = site.climate.prevailingWindNote ?? '';
  const kosava = /кошав/i.test(note) && highlight.some((d) => KOSAVA_DIRS.includes(d));
  const label = COMPASS_LABELS[dominant.dir];
  const speed = formatNumber(dominant.maxSpeed, 0);

  const sentence = kosava
    ? `Доминантан ветар ${label} (кошава), удари до ${speed} m/s — заштитити улазе и балконе на ${label} фасади.`
    : `Доминантан ветар ${label}, удари до ${speed} m/s — предвидети заветрину за улазе и отворене просторе према ${label}.`;
  return { dominant, highlight, kosava, sentence };
}

/* ------------------------------------------------------------------------------------------------
 * Hazards
 * ---------------------------------------------------------------------------------------------- */

export interface HazardAssessment {
  id: 'flood' | 'seismic' | 'soil' | 'groundwater';
  label: string;
  /** Primary value line, e.g. „a_gR = 0,10 g · MCS 8“. */
  value: string;
  /** Status chip text and tone. */
  status: string;
  tone: Tone;
  /** Short design implication. */
  implication: string;
}

export function assessHazards(h: SiteHazards): HazardAssessment[] {
  const flood: HazardAssessment = {
    id: 'flood',
    label: 'Плављење',
    value: h.floodZone,
    ...(h.floodRisk === 'low'
      ? { status: 'Низак ризик', tone: 'good' as Tone, implication: 'Без посебних мера против плављења; предвидети контролисано одвођење атмосферских вода.' }
      : h.floodRisk === 'medium'
        ? { status: 'Средњи ризик', tone: 'warn' as Tone, implication: 'Кота приземља изнад меродавне воде, водонепропусне подземне етаже и заштита од успора.' }
        : { status: 'Висок ризик', tone: 'bad' as Tone, implication: 'Осетљиве садржаје и инсталације изнад Q100; водопропусне површине и плављиве зоне, без објеката у протицајном профилу.' }),
  };

  const ag = h.seismic.agG;
  const agText = `a_gR = ${formatNumber(ag, 2)} g · MCS ${formatNumber(h.seismic.mcs, 0)}`;
  const seismic: HazardAssessment = {
    id: 'seismic',
    label: 'Сеизмичност',
    value: agText,
    ...(ag < 0.08
      ? { status: 'Ниска', tone: 'good' as Tone, implication: 'Сеизмички прорачун по SRPS EN 1998-1 уз стандардне конструктивне мере.' }
      : ag < 0.14
        ? { status: 'Умерена', tone: 'warn' as Tone, implication: 'Сеизмички прорачун по SRPS EN 1998-1; правилна основа и континуална крута језгра по висини.' }
        : { status: 'Повишена', tone: 'bad' as Tone, implication: 'Компактна, симетрична основа, дуктилни детаљи и пажљиво фундирање; рана сарадња са конструктером.' }),
  };

  const soilText = h.soil.toLowerCase();
  const soil: HazardAssessment = {
    id: 'soil',
    label: 'Тло',
    value: h.soil,
    ...(/насип|насут/.test(soilText)
      ? { status: 'Захтева пажњу', tone: 'warn' as Tone, implication: 'Могуће неједнако слегање насипа — дубоко фундирање или побољшање тла; геомеханички елаборат пре ПГД.' }
      : /лес/.test(soilText)
        ? { status: 'Захтева пажњу', tone: 'warn' as Tone, implication: 'Лес је склон слегању при квашењу — заштита темеља од воде и геомеханичка истраживања.' }
        : /геомеханичк.*планирани|истражн/.test(soilText)
          ? { status: 'Непотпуни подаци', tone: 'info' as Tone, implication: 'Геомеханичка истраживања су предуслов за избор система фундирања.' }
          : { status: 'Повољно', tone: 'good' as Tone, implication: 'Добра носивост и водопропусност; потврдити геомеханичким елаборатом.' }),
  };

  const gw = h.groundwaterDepthM;
  const gwText = `${formatNumber(gw, 1)} m испод терена`;
  const groundwater: HazardAssessment = {
    id: 'groundwater',
    label: 'Подземна вода',
    value: gwText,
    ...(gw <= 2
      ? { status: 'Врло плитка', tone: 'bad' as Tone, implication: 'Подрум као „бела када“ или без подрума; одводњавање при градњи и заштита од узгона.' }
      : gw <= 4
        ? { status: 'Плитка', tone: 'warn' as Tone, implication: 'Водонепропусне подземне етаже, заштита од узгона и праћење водостаја током градње.' }
        : { status: 'Дубока', tone: 'good' as Tone, implication: 'Без већих ограничења за подземне етаже; проверити сезонске осцилације нивоа.' }),
  };

  return [flood, seismic, soil, groundwater];
}

/* ------------------------------------------------------------------------------------------------
 * Urban parameters
 * ---------------------------------------------------------------------------------------------- */

export type UrbanStatus = 'pass' | 'edge' | 'fail';

export interface UrbanParamView {
  param: UrbanParam;
  status: UrbanStatus;
  statusLabel: string;
  tone: Tone;
  /** design / limit in %. */
  utilisationPct: number;
  /** Margin to the limit in % of the limit (positive = on the safe side). */
  marginPct: number;
  limitText: string;
  designText: string;
}

const decimalsOf = (n: number): number => {
  const s = String(n);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
};

/** Evaluate a parameter: ≤ 5 % margin to the limit = „на граници“. */
export function evaluateUrbanParam(p: UrbanParam): UrbanParamView {
  const isMax = p.comparator === 'max';
  const marginPct = p.limit === 0 ? 0 : (isMax ? (p.limit - p.design) / p.limit : (p.design - p.limit) / p.limit) * 100;
  const status: UrbanStatus = marginPct < 0 ? 'fail' : marginPct < 5 ? 'edge' : 'pass';
  const statusLabel = status === 'pass' ? 'Усклађено' : status === 'edge' ? 'На граници' : isMax ? 'Прекорачено' : 'Испод минимума';
  const tone: Tone = status === 'pass' ? 'good' : status === 'edge' ? 'warn' : 'bad';

  const unitless = p.unit === '';
  const dec = Math.max(decimalsOf(p.limit), decimalsOf(p.design), unitless && Math.max(p.limit, p.design) < 10 ? 2 : 0);
  const fmt = (v: number) => `${formatNumber(v, dec)}${p.unit ? ` ${p.unit}` : ''}`;
  const sign = isMax ? '≤' : '≥';
  return {
    param: p,
    status,
    statusLabel,
    tone,
    utilisationPct: p.limit === 0 ? 0 : (p.design / p.limit) * 100,
    marginPct,
    limitText: `${sign} ${p.displayLimit ?? fmt(p.limit)}`,
    designText: p.displayDesign ?? fmt(p.design),
  };
}
