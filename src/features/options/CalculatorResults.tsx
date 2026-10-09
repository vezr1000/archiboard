import type { ReactNode } from 'react';
import { CircleCheck, CircleX, Flame } from 'lucide-react';
import { DivergingBars, RingScore, StackedBar, type DivergingDatum } from '@/components/charts';
import { AnimatedNumber, Badge, Callout, EnergyClassBadge, Stat } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { CHECK_STATUS_TONE } from '@/domain/labels';
import type { CertificationScheme, Tone } from '@/domain/types';
import { ENERGY_CLASS_BANDS, type ModelResult } from '@/lib/carbonModel';
import { cn } from '@/lib/cn';
import { formatNumber, formatPct, formatSigned } from '@/lib/format';
import { gapPct, kpiStatus } from '@/lib/kpi';

export interface ResultsTargets {
  carbon?: number;
  qh?: number;
  overheating?: number;
  cert?: number;
  pedLimit: number;
}

interface CalculatorResultsProps {
  result: ModelResult;
  reference: ModelResult;
  /** „Варијанта Б (изабрана)“ / „тренутно стање пројекта“. */
  referenceLabel: string;
  targets: ResultsTargets;
  scheme: CertificationScheme;
  /** Fixed ring scale for the project (does not jump while editing). */
  ringMax: number;
  contributions: DivergingDatum[];
  /** Extra sentence for the fire warning (flagship storyline). */
  fireNote?: string;
  /** Qh,nd,max of the typology — shows the upper limit of the current class (omit when the class is calibrated). */
  qhMax?: number;
}

/** Six element colours in fixed order (5 chart series + a neutral for the interior). */
const ELEMENT_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--line-strong)'];

const round = (v: number) => Math.round(v);
const pctChange = (v: number, ref: number) => (ref === 0 ? 0 : ((v - ref) / ref) * 100);

/** EU Taxonomy pass/fail chip (also used in the sticky mobile bar). */
export function TaxonomyChip({ result, compact }: { result: ModelResult; compact?: boolean }) {
  const pass = result.taxonomy.pass;
  const failing = result.taxonomy.criteria.filter((c) => !c.pass);
  return (
    <Badge
      tone={pass ? 'good' : 'bad'}
      icon={pass ? CircleCheck : CircleX}
      size={compact ? 'sm' : 'md'}
      title={pass ? 'EU таксономија: испуњено' : `EU таксономија: ${failing.map((c) => c.label).join('; ')}`}
    >
      {compact ? 'EU таксон.' : `EU таксономија ${result.taxonomy.activity}`}
      {!compact && (pass ? ' · испуњено' : ' · није испуњено')}
    </Badge>
  );
}

/** Results panel of the what-if calculator. */
export function CalculatorResults({ result: r, reference: ref, referenceLabel, targets, ringMax, contributions, fireNote, qhMax }: CalculatorResultsProps) {
  const share = ENERGY_CLASS_BANDS.find((b) => b.cls === r.energyClass)?.maxShare ?? Infinity;
  const classLimit = qhMax !== undefined && Number.isFinite(share) ? share * qhMax : undefined;
  const ec = round(r.embodiedCarbon);
  const refEc = round(ref.embodiedCarbon);
  const ecTone: Tone = targets.carbon !== undefined ? CHECK_STATUS_TONE[kpiStatus('lower-better', ec, targets.carbon)] : 'accent';
  const dRef = ec - refEc;
  const total = contributions.reduce((s, c) => s + c.value, 0);
  return (
    <div className="flex flex-col gap-4">
      {/* ---- headline: carbon ring + energy class ---- */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
        <RingScore
          title="Уграђени угљеник A1–A3"
          value={r.embodiedCarbon}
          max={ringMax}
          tone={ecTone}
          size={148}
          target={targets.carbon}
          thresholds={targets.carbon !== undefined ? [{ value: targets.carbon, label: 'Циљ' }] : []}
          showThresholdLabels={false}
          label={<AnimatedNumber value={ec} />}
          sublabel="kgCO₂e/m²"
        />
        <div className="min-w-0">
          <div className="eyebrow">Уграђени угљеник A1–A3</div>
          <DeltaLine
            label={`у односу на ${referenceLabel}`}
            text={dRef === 0 ? 'без промене' : `${formatSigned(dRef, 0)} kgCO₂e/m² (${formatPct(pctChange(ec, refEc), { signed: true, decimals: 1 })})`}
            tone={dRef === 0 ? 'neutral' : dRef < 0 ? 'good' : 'bad'}
          />
          {targets.carbon !== undefined && (
            <DeltaLine
              label={`циљ пројекта ${formatNumber(targets.carbon, 0)}`}
              text={
                ec <= targets.carbon
                  ? `испод циља (${formatPct(gapPct('lower-better', ec, targets.carbon), { decimals: 1 })})`
                  : `${formatPct(gapPct('lower-better', ec, targets.carbon), { signed: true, decimals: 1 })} изнад циља`
              }
              tone={ecTone}
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5">
        <EnergyClassBadge value={r.energyClass} size="lg" animate />
        <div className="min-w-0 flex-1">
          <div className="text-[0.7rem] text-muted">Енергетски разред · потребна енергија за грејање Qh,nd</div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="tabular font-display text-xl font-semibold text-ink">
              <AnimatedNumber value={round(r.heatingNeed)} />
            </span>
            <span className="text-xs text-muted">kWh/m²a</span>
            {classLimit !== undefined && (
              <span className="text-xs text-muted">
                · разред {r.energyClass} до {formatNumber(classLimit)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---- compliance ---- */}
      {r.fire.warning && (
        <Callout tone="bad" icon={Flame} title="Горива фасадна облога изнад 22 m — потребна сагласност / негорива облога">
          Под највишег спрата је на {formatNumber(r.fire.topFloorLevelM, 1)} m, па је зграда висока. Горива облога (класа D) није прихватљива без посебне
          сагласности; потребна је негорива облога (A1 или A2-s1,d0).{fireNote && ` ${fireNote}`}
        </Callout>
      )}
      <div className="rounded-2xl border border-line p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-ink">EU таксономија (активност {r.taxonomy.activity})</span>
          <Badge tone={r.taxonomy.pass ? 'good' : 'bad'} size="sm" icon={r.taxonomy.pass ? CircleCheck : CircleX}>
            {r.taxonomy.pass ? 'испуњено' : 'није испуњено'}
          </Badge>
        </div>
        <ul className="mt-2 flex flex-col gap-1.5">
          {r.taxonomy.criteria.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              {c.pass ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-good" aria-hidden /> : <CircleX className="mt-0.5 size-4 shrink-0 text-bad" aria-hidden />}
              <span className="min-w-0">
                <span className="text-ink">{c.label}</span>
                <span className="block text-xs text-muted">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- contributions ---- */}
      <section className="rounded-2xl border border-line p-3.5" aria-labelledby="doprinosi">
        <h4 id="doprinosi" className="text-base text-ink">
          Шта је променило уграђени угљеник
        </h4>
        <p className="mb-3 text-xs text-muted">Утицај сваке измене у односу на {referenceLabel}, kgCO₂e/m²</p>
        {contributions.length === 0 ? (
          <p className="rounded-xl bg-surface-2 px-3 py-4 text-center text-sm text-muted">Померите неки параметар — овде ће се видети који је колико допринео.</p>
        ) : (
          <DivergingBars title="Допринос измена уграђеном угљенику" data={contributions} unit="" total={{ label: 'Укупна промена', value: total }} />
        )}
      </section>
    </div>
  );
}

/** Secondary results: stat tiles + per-element breakdown (below the calculator grid on desktop). */
export function CalculatorDetails({ result: r, reference: ref, targets, scheme }: Pick<CalculatorResultsProps, 'result' | 'reference' | 'targets' | 'scheme'>) {
  const certUnit = scheme === 'LEED' ? 'бод.' : '%';
  const ohTone: Tone =
    targets.overheating !== undefined ? CHECK_STATUS_TONE[kpiStatus('lower-better', round(r.overheatingHours), targets.overheating)] : 'neutral';
  return (
    <div className="flex flex-col gap-4">
      {/* ---- stat tiles ---- */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile>
          <Stat size="sm" label="Угљеник A1–C4" value={round(r.wholeLifeCarbon)} unit="kgCO₂e/m²" delta={nz(round1(pctChange(r.wholeLifeCarbon, ref.wholeLifeCarbon)))} direction="lower-better" />
        </Tile>
        <Tile>
          <Stat
            size="sm"
            label="Примарна енергија"
            value={round(r.primaryEnergy)}
            unit="kWh/m²a"
            delta={nz(round(r.primaryEnergy) - round(ref.primaryEnergy))}
            deltaUnit=""
            direction="lower-better"
            hint={`граница таксономије ${formatNumber(targets.pedLimit, 0)}`}
          />
        </Tile>
        <Tile>
          <Stat size="sm" label="Удео ОИЕ" value={round(r.renewableSharePct)} unit="%" delta={nz(round(r.renewableSharePct) - round(ref.renewableSharePct))} deltaUnit=" п.п." direction="higher-better" />
        </Tile>
        <Tile>
          <Stat
            size="sm"
            label="Трошак градње"
            value={formatSigned(round1(r.costDeltaPct), 1)}
            unit="%"
            delta={nz(round1(r.costDeltaPct - ref.costDeltaPct))}
            deltaUnit=" п.п."
            direction="lower-better"
            hint="у односу на основну варијанту"
          />
        </Tile>
        <Tile>
          <Stat
            size="sm"
            label="Сертификација"
            value={round(r.certPoints)}
            unit={certUnit}
            delta={nz(round(r.certPoints) - round(ref.certPoints))}
            deltaUnit={scheme === 'LEED' ? ' бод.' : ' п.п.'}
            direction="higher-better"
            hint={targets.cert !== undefined ? `циљ ${formatNumber(targets.cert, 0)}` : undefined}
          />
        </Tile>
        <Tile>
          <Stat size="sm" label="Дневно светло" value={round(r.daylightPct)} unit="%" delta={nz(round(r.daylightPct) - round(ref.daylightPct))} deltaUnit=" п.п." direction="higher-better" hint="DF ≥ 2 %" />
        </Tile>
        <Tile>
          <Stat
            size="sm"
            label="Летње прегревање"
            value={round(r.overheatingHours)}
            unit="h/год"
            delta={nz(round(r.overheatingHours) - round(ref.overheatingHours))}
            deltaUnit=" h"
            direction="lower-better"
            hint={
              targets.overheating !== undefined ? (
                <span className={cn('inline-flex items-center gap-1', TONE_CLASSES[ohTone].text)}>
                  <span className={cn('size-1.5 rounded-full', TONE_CLASSES[ohTone].bg)} aria-hidden />
                  {round(r.overheatingHours) <= targets.overheating ? 'испуњава' : 'изнад'} циљ ≤ {formatNumber(targets.overheating, 0)} h
                </span>
              ) : undefined
            }
          />
        </Tile>
        <Tile>
          <Stat size="sm" label="Трајање градње" value={round(r.durationMonths)} unit="мес." delta={nz(round(r.durationMonths) - round(ref.durationMonths))} deltaUnit=" мес." direction="lower-better" />
        </Tile>
      </div>

      {/* ---- per-element breakdown ---- */}
      <section className="rounded-2xl border border-line bg-surface p-3.5" aria-labelledby="po-elementima">
        <h4 id="po-elementima" className="text-base text-ink">
          По елементима зграде
        </h4>
        <p className="mb-3 text-xs text-muted">A1–A3, kgCO₂e/m²{targets.carbon !== undefined && ' · црта = циљ пројекта'}</p>
        <StackedBar
          title="Уграђени угљеник по елементима"
          height="lg"
          total={Math.max(r.embodiedCarbon, targets.carbon ?? 0)}
          marker={targets.carbon}
          legendValues
          format={(v) => formatNumber(v, 0)}
          segments={r.elements.map((e, i) => ({ id: e.id, label: e.label, value: e.value, color: ELEMENT_COLORS[i] }))}
        />
      </section>
    </div>
  );
}

const round1 = (v: number) => Math.round(v * 10) / 10;
/** Hide a delta of zero (no arrow + „0“ noise when nothing changed). */
const nz = (v: number): number | undefined => (Math.abs(v) < 0.05 ? undefined : v);

function Tile({ children }: { children: ReactNode }) {
  return <div className="min-w-0 rounded-xl border border-line bg-surface px-3 py-2.5">{children}</div>;
}

function DeltaLine({ label, text, tone }: { label: string; text: string; tone: Tone }) {
  return (
    <div className="mt-1 text-sm">
      <span className={cn('tabular font-medium', TONE_CLASSES[tone].text)}>{text}</span>
      <span className="block text-xs text-muted">{label}</span>
    </div>
  );
}

