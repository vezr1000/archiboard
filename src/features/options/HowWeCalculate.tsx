import { useId, useState } from 'react';
import { ChevronDown, Sigma } from 'lucide-react';
import { Callout } from '@/components/ui';
import { COEFFICIENT_TABLE, ENERGY_CLASS_BANDS, K, type ModelContext } from '@/lib/carbonModel';
import { cn } from '@/lib/cn';
import { formatNumber, formatSigned } from '@/lib/format';

const FORMULAS: Array<{ title: string; text: string }> = [
  {
    title: 'Уграђени угљеник A1–A3',
    text:
      'Збир шест елемената по m² БРГП: конструкција + фасада + отвори + кров + инсталације и PV + унутрашњост. Конструкција = коефицијент система × ' +
      'размера пројекта × (удео бетона × фактор цемента) × (1 − 0,55 × удео поново употребљених материјала). Фасада = површина пуног зида × (облога или ' +
      'систем + изолација по cm × дебљина). Отвори = површина стакла × угљеник прозора. Кров = површина крова × (40 + 20 × удео зеленог крова). ' +
      'Инсталације = генерички фактор + систем грејања + рекуперација + 950 kgCO₂e по kWp PV.',
  },
  {
    title: 'Угљеник у животном циклусу A1–C4 (без B6)',
    text: 'A1–A3 × 1,08 (транспорт и уградња A4–A5) + замене у 50 година (инсталације 1×, унутрашњост 0,8×, прозори 0,5×, фасада 0,3×, кров 0,4×) + крај животног века C1–C4.',
  },
  {
    title: 'Потребна енергија за грејање Qh,nd',
    text:
      'Губици = 0,024 × степен-дани грејања × (трансмисија + вентилација); трансмисија из U-вредности зида (изолација λ 0,035), прозора и крова уз ' +
      'додатак за топлотне мостове по систему конструкције. Од губитака се одузима 90 % унутрашњих и соларних добитака. Рекуперација смањује губитке вентилацијом за 60 %.',
  },
  {
    title: 'Примарна енергија, ОИЕ и EU таксономија',
    text:
      'Топлота (Qh,nd + топла вода) из изабраног система: даљинско грејање × 1,45; топлотна пумпа COP 3,4 са струјом × 2,5; PV принос 1.200 kWh/kWp умањује ' +
      'куповину струје. Таксономија 7.1: примарна енергија најмање 10 % испод nZEB референце фирме (≤ 90 kWh/m²a) и обелодањен GWP A1–C4 за зграде веће од 5.000 m²; ' +
      'код обнове (7.2) смањење примарне енергије ≥ 30 %.',
  },
  {
    title: 'Комфор, трошак, сертификација и трајање',
    text:
      'Прегревање расте са површином стакла и соларним фактором, а смањују га маса конструкције, зелени кров и спољна засена (−45 %). Дневно светло расте линеарно ' +
      'са застакљењем и пропустљивошћу стакла. Трошак, бодови сертификације и трајање градње се мењају за фиксне износе по параметру у односу на учитану варијанту.',
  },
];

/** „Како рачунамо“ — expandable explanation of the demo model with its live coefficient table. */
export function HowWeCalculate({ ctx, carbonOffset }: { ctx: ModelContext; carbonOffset: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const p = ctx.profile;
  return (
    <section className="rounded-2xl border border-line bg-surface">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink">
          <Sigma className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-semibold text-ink">Како рачунамо</span>
          <span className="block text-xs text-muted">Формуле, коефицијенти и калибрација на пројекат</span>
        </span>
        <ChevronDown className={cn('size-5 shrink-0 text-muted transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div id={id} className="animate-fade-in border-t border-line px-4 pt-3 pb-4">
          <Callout tone="warn" title="Демо модел">
            Поједностављени демо модел калибрисан на пројекат; није замена за LCA по EN 15978.
          </Callout>

          <ol className="mt-4 flex flex-col gap-3">
            {FORMULAS.map((f, i) => (
              <li key={f.title} className="text-sm">
                <span className="font-medium text-ink">
                  {i + 1}. {f.title}
                </span>
                <p className="mt-0.5 text-muted">{f.text}</p>
              </li>
            ))}
            <li className="text-sm">
              <span className="font-medium text-ink">{FORMULAS.length + 1}. Енергетски разред</span>
              <p className="mt-0.5 text-muted">
                Qh,nd у односу на највећу дозвољену вредност за типологију ({formatNumber(p.qhMax, 0)} kWh/m²a = граница разреда C):{' '}
                {ENERGY_CLASS_BANDS.filter((b) => Number.isFinite(b.maxShare))
                  .map((b) => `${b.cls} ≤ ${formatNumber(b.maxShare * 100, 0)} %`)
                  .join(', ')}
                , G изнад.
              </p>
            </li>
            <li className="text-sm">
              <span className="font-medium text-ink">{FORMULAS.length + 2}. Калибрација на пројекат</span>
              <p className="mt-0.5 text-muted">
                Модел је померен тако да изабрана варијанта (или тренутни KPI пројекта) даје тачно своје вредности — за уграђени угљеник за{' '}
                {formatSigned(Math.round(carbonOffset * 10) / 10, 1)} kgCO₂e/m². Промене параметара мењају резултат за физичку разлику модела. Свака учитана
                варијанта задржава своје мало одступање.
              </p>
            </li>
          </ol>

          <h4 className="mt-5 mb-2 text-base text-ink">Параметри пројекта</h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <KV label="Фасада / БРГП" value={formatNumber(p.facadeRatio, 2)} />
            <KV label="Кров / БРГП" value={formatNumber(p.roofRatio, 2)} />
            <KV label="Размера конструкције" value={formatNumber(p.structureScale, 2)} />
            <KV label="Степен-дани грејања" value={formatNumber(ctx.hdd, 0)} />
            <KV label="Под највишег спрата" value={`${formatNumber(ctx.topFloorLevelM, 1)} m`} />
            <KV label="Граница за високе зграде" value={`${K.highRiseM} m`} />
          </dl>

          <h4 className="mt-5 mb-2 text-base text-ink">Коефицијенти</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {COEFFICIENT_TABLE.map((g) => (
              <div key={g.group} className="min-w-0">
                <div className="eyebrow mb-1">{g.group}</div>
                <table className="w-full text-sm">
                  <tbody>
                    {g.rows.map((r) => (
                      <tr key={r.label} className="border-b border-line last:border-0">
                        <td className="py-1.5 pr-2 align-top text-ink">
                          {r.label}
                          {r.note && <span className="block text-xs text-muted">{r.note}</span>}
                        </td>
                        <td className="tabular py-1.5 text-right align-top whitespace-nowrap text-ink">
                          {formatNumber(r.value)} <span className="text-xs text-muted">{r.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[0.7rem] text-muted">{label}</dt>
      <dd className="tabular text-ink">{value}</dd>
    </div>
  );
}
