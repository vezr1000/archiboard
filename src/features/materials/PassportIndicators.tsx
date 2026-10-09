import { ProgressBar, Stat } from '@/components/ui';
import type { Tone } from '@/domain/types';
import { formatCarbon, formatNumber, formatPct } from '@/lib/format';
import { carbonKpi, carbonTarget, LOCAL_KM, type PassportStats } from './materialsLogic';

interface PassportIndicatorsProps {
  stats: PassportStats;
  projectId: string;
  /** Unit of the per-m² value (БРГП vs površina intervencije). */
  unit: string;
}

interface Tile {
  id: string;
  label: string;
  value: number;
  tone: Tone;
  hint: string;
}

/** Row of stat tiles: embodied carbon (A1–A3) plus circularity shares (all weighted by estimated mass). */
export function PassportIndicators({ stats, projectId, unit }: PassportIndicatorsProps) {
  const target = carbonTarget(projectId);
  const kpi = carbonKpi(projectId);
  const tiles: Tile[] = [
    { id: 'reused', label: 'Поново употребљено', value: stats.reusedPct, tone: 'good', hint: 'Материјал са локације или из другог објекта.' },
    { id: 'recycled', label: 'Рециклирани садржај', value: stats.recycledPct, tone: 'accent', hint: 'Просек по EPD-овима уграђених материјала.' },
    { id: 'bio', label: 'Биобазирани', value: stats.bioPct, tone: 'good', hint: 'Дрво, целулоза и други обновљиви материјали.' },
    { id: 'local', label: `Локално (< ${LOCAL_KM} km)`, value: stats.localPct, tone: 'accent', hint: 'Произведено близу Београда — краћи транспорт.' },
    { id: 'demountable', label: 'Растављиво', value: stats.demountablePct, tone: 'clay', hint: 'Пројектовано за демонтажу и поновну употребу.' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 lg:grid-cols-7">
        <div className="col-span-2 flex min-w-0 flex-col justify-between rounded-2xl border border-line bg-surface p-4 md:col-span-5 lg:col-span-2">
          <Stat
            label="Уграђени угљеник A1–A3"
            value={formatNumber(stats.perM2, 0)}
            unit={unit}
            delta={target ? ((stats.perM2 - target) / target) * 100 : undefined}
            direction="lower-better"
            deltaLabel={target ? `у односу на циљ (${formatNumber(target, 0)})` : undefined}
            hint={
              <>
                Укупно <span className="tabular font-medium text-ink">{formatCarbon(stats.totalKg, 'total')}</span>
                {kpi !== undefined && <> · KPI пројекта {formatNumber(kpi, 0)}</>}
              </>
            }
          />
        </div>
        {tiles.map((t, i) => (
          <div
            key={t.id}
            className={`flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-3.5 ${i === tiles.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}
          >
            <div className="text-[0.8rem] leading-snug text-muted">{t.label}</div>
            <div className="tabular mt-0.5 font-display text-[1.7rem] leading-tight font-semibold text-ink">{formatPct(t.value, { decimals: 0 })}</div>
            <ProgressBar className="mt-1.5" size="xs" tone={t.tone} value={t.value} max={100} ariaLabel={t.label} />
            <p className="mt-2 text-xs leading-snug text-muted">{t.hint}</p>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-xs text-muted">
        Удели су рачунати по <strong className="font-medium">процењеној маси</strong> уграђених материјала (демо коефицијенти густине), а не по
        угљенику. Укупан угљеник је Σ (GWP A1–A3 × количина) из пасоша. Задржани постојећи елементи нису део пасоша.
      </p>
    </div>
  );
}
