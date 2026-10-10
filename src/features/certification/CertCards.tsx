import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router';
import { Legend, RadarChart, RingScore, StackedBar } from '@/components/charts';
import { paths } from '@/components/layout/navigation';
import { Avatar, Badge, Card, ProgressBar } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { getPerson } from '@/data';
import { CRITERION_STATUS_LABELS, CRITERION_STATUS_TONE, SCHEME_LABELS } from '@/domain/labels';
import type { CertificationCriterion } from '@/domain/types';
import { categoryBreakdown, categoryUnit, certScoreMax, certTone, formatCertGap, formatCertScore } from '@/lib/cert';
import { formatNumber } from '@/lib/format';
import { atRiskCriteria, categoryCode, splitCriterionCode, type CertModel } from './certLogic';

const STATUS_ICON = { good: CircleCheck, warn: TriangleAlert, bad: CircleAlert, neutral: CircleCheck, accent: CircleCheck, info: CircleCheck, clay: CircleCheck } as const;

/* ------------------------------------------------------------------------------------------------ */

export function CertHeaderCard({ model, criteria }: { model: CertModel; criteria: CertificationCriterion[] }) {
  const { scheme, level, score, target, thresholds, reached, status } = model;
  const isNone = scheme === 'none';
  const Icon = STATUS_ICON[status.tone];
  const counts = (['achieved', 'on-track', 'at-risk', 'not-started'] as const).map((s) => ({ s, n: criteria.filter((c) => c.status === s).length }));
  return (
    <Card
      eyebrow={isNone ? 'Интерни скорекард фирме' : 'Шема сертификације'}
      title={isNone ? `Циљни ниво: ${level}` : `${SCHEME_LABELS[scheme]} · циљ ${level}`}
      subtitle={
        isNone
          ? 'Плаво-зелена инфраструктура — није спољна сертификација'
          : scheme === 'EDGE'
            ? 'Приказана је уштеда енергије у односу на EDGE референтни случај'
            : scheme === 'Passivhaus'
              ? 'Проценат испуњених Passivhaus критеријума (прелиминарни PHPP)'
              : 'Предвиђени резултат'
      }
      className="h-full"
    >
      <div className="flex flex-col items-center gap-3">
        <RingScore
          title={`Резултат ${isNone ? 'интерног скорекарда' : SCHEME_LABELS[scheme]}`}
          value={score}
          max={certScoreMax(scheme)}
          target={target}
          tone={certTone(score, target)}
          thresholds={thresholds}
          size={200}
          label={formatCertScore(score, scheme)}
          sublabel={`циљ ${formatCertScore(target, scheme)}`}
        />
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {reached ? <Badge tone="accent">Достигнуто: {reached.label}</Badge> : <Badge tone="neutral">Испод првог нивоа</Badge>}
          {score >= target ? (
            <Badge tone="good">циљ достигнут</Badge>
          ) : (
            <span className="text-muted">
              до циља недостаје <span className="tabular font-medium text-ink">{formatCertGap(target - score, scheme)}</span>
            </span>
          )}
        </div>
      </div>
      <div className={`mt-4 flex gap-2.5 rounded-xl p-3 text-sm ${TONE_CLASSES[status.tone].bgSoft}`}>
        <Icon className={`mt-0.5 size-4 shrink-0 ${TONE_CLASSES[status.tone].text}`} aria-hidden />
        <div className="min-w-0">
          <p className="font-medium text-ink">{status.text}</p>
          {status.detail && <p className="mt-1 text-xs text-ink/75">{status.detail}</p>}
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Критеријуми по статусу">
        {counts.map(({ s, n }) => (
          <li key={s}>
            <Badge tone={CRITERION_STATUS_TONE[s]} size="sm">
              {CRITERION_STATUS_LABELS[s]} {n}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** „Шта нам недостаје за следећи ниво“. */
export function NextLevelCard({ model, criteria }: { model: CertModel; criteria: CertificationCriterion[] }) {
  const { scheme, next, score, levelValue, level, potential, tracker } = model;
  const top = atRiskCriteria(model, criteria).slice(0, 3);
  const notStarted = criteria.filter((c) => c.status === 'not-started').length;
  const codes = tracker.categories.map((c) => c.id);
  const fmt = (v: number) => formatCertScore(Math.round(v * 10) / 10, scheme);
  const targetReached = score >= levelValue;
  const projectId = model.project.id;

  return (
    <Card
      title="Шта нам недостаје за следећи ниво"
      subtitle={next ? `Следећи ниво: ${next.label} (${fmt(next.value)})` : 'Сви нивои шеме су достигнути'}
      className="h-full"
    >
      <div className="flex flex-col gap-4">
        {next ? (
          <div>
            <ProgressBar
              value={score}
              max={next.value}
              tone={certTone(score, next.value)}
              label={`Тренутно ${fmt(score)}`}
              valueLabel={`недостаје ${formatCertGap(next.value - score, scheme)}`}
              size="md"
            />
            <ul className="mt-3 flex flex-col gap-1 text-sm text-muted">
              <li>
                Циљни ниво <span className="font-medium text-ink">{level}</span>:{' '}
                {targetReached ? (
                  <span className="text-good">достигнут (резерва {formatCertGap(score - levelValue, scheme)})</span>
                ) : (
                  <span className="text-warn">недостаје {formatCertGap(levelValue - score, scheme)}</span>
                )}
              </li>
              <li>
                Када би се остварили сви циљани {scheme === 'Passivhaus' ? 'критеријуми' : 'кредити'}, резултат би био{' '}
                <span className="tabular font-medium text-ink">{fmt(potential)}</span>
                {potential >= next.value ? ` — довољно за ${next.label}.` : ` — за ${next.label} и даље недостаје ${formatCertGap(next.value - potential, scheme)}`.replace(/\.$/, '') + '.'}
              </li>
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted">Резултат {fmt(score)} је изнад свих прагова шеме. Приоритет је задржати достигнуто — прати угрожене критеријуме.</p>
        )}

        <div>
          <h4 className="mb-1 text-sm font-semibold text-ink">Најугроженији критеријуми</h4>
          {top.length === 0 ? (
            <p className="text-sm text-muted">Нема критеријума означених као угрожени.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-line">
              {top.map(({ criterion, category, stakeText }, i) => {
                const { code, title } = splitCriterionCode(criterion.label, codes);
                const owner = getPerson(criterion.ownerId);
                return (
                  <li key={criterion.id} className="flex items-start gap-3 py-2.5">
                    <span className="tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-warn-soft text-xs font-semibold text-warn">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        {code && <span className="tabular mr-1.5 text-muted">{code}</span>}
                        {title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {category ? `${categoryCode(category.id) || category.label} · ` : ''}
                        {stakeText}
                      </p>
                      {criterion.evidenceDocumentId && (
                        <Link to={`${paths.project(projectId, 'dokumenta')}?doc=${criterion.evidenceDocumentId}`} className="mt-1 inline-block text-xs text-accent hover:underline">
                          Отвори доказ
                        </Link>
                      )}
                    </div>
                    {owner && <Avatar person={owner} size="sm" />}
                  </li>
                );
              })}
            </ol>
          )}
          {notStarted > 0 && (
            <p className="mt-2 text-xs text-muted">
              Још није започето: <span className="tabular font-medium text-ink">{notStarted}</span> {notStarted === 1 ? 'критеријум' : 'критеријума'}.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** EDGE: three savings bars (energy / water / materials) against the required savings. */
function EdgeSavings({ model }: { model: CertModel }) {
  const cats = model.tracker.categories;
  return (
    <ul className="flex flex-col gap-4">
      {cats.map((c) => {
        const ok = c.achieved >= c.targeted;
        return (
          <li key={c.id}>
            <ProgressBar
              label={c.label}
              valueLabel={
                <span className={ok ? 'text-good' : 'text-warn'}>
                  {formatNumber(c.achieved, 0)} % <span className="font-normal text-muted">/ захтев {formatNumber(c.targeted, 0)} %</span>
                </span>
              }
              value={c.achieved}
              max={Math.max(60, ...cats.map((x) => Math.max(x.achieved, x.targeted) * 1.15))}
              target={c.targeted}
              tone={ok ? 'good' : 'warn'}
              size="md"
            />
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryCard({ model }: { model: CertModel }) {
  const { scheme, tracker } = model;
  const unit = categoryUnit(scheme);
  const rows = tracker.categories.map(categoryBreakdown);
  const compactAxes = rows.length > 4 && rows.every((r) => categoryCode(r.id));

  if (scheme === 'EDGE') {
    return (
      <Card title="Уштеде по категоријама" subtitle="Уштеда у односу на EDGE референтни случај; црта означава захтев за циљни ниво">
        <EdgeSavings model={model} />
      </Card>
    );
  }

  return (
    <Card
      title="Категорије"
      subtitle={scheme === 'LEED' ? 'Поени по категоријама (укупно 110)' : scheme === 'Passivhaus' ? 'Испуњени критеријуми по групама' : 'Остварено и циљано по категоријама, са тежинама'}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <Legend
            className="mb-4"
            items={[
              { label: 'Остварено', color: 'var(--good)' },
              { label: 'Циљано, није остварено', color: 'var(--info)' },
              { label: 'Угрожено', color: 'var(--warn)' },
              { label: 'Преостало до максимума', color: 'var(--line-strong)' },
              { label: 'Циљ категорије', color: 'var(--ink)', shape: 'line' },
            ]}
          />
          <ul className="flex flex-col gap-4">
            {rows.map((r) => (
              <li key={r.id} className="min-w-0">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <div className="min-w-0 text-sm">
                    {categoryCode(r.id) ? (
                      <>
                        <span className="tabular font-semibold text-ink">{categoryCode(r.id)}</span> <span className="text-muted">· {r.label}</span>
                      </>
                    ) : (
                      <span className="font-semibold text-ink">{r.label}</span>
                    )}
                  </div>
                  <div className="tabular shrink-0 text-sm text-ink">
                    {formatNumber(r.achieved, Number.isInteger(r.achieved) ? 0 : 1)}
                    <span className="text-muted"> / {formatNumber(r.max, 0)} {unit}</span>
                  </div>
                </div>
                <StackedBar
                  title={`${categoryCode(r.id)} ${r.label}`.trim()}
                  total={r.max}
                  marker={r.targeted <= r.max ? r.targeted : undefined}
                  height="md"
                  showLegend={false}
                  segments={[
                    { id: 'a', label: 'Остварено', value: r.achieved, tone: 'good' },
                    { id: 'p', label: 'Циљано', value: r.pending, tone: 'info' },
                    { id: 'r', label: 'Угрожено', value: r.atRisk, tone: 'warn' },
                  ]}
                />
                <div className="mt-1 text-[0.7rem] text-muted">
                  тежина {formatNumber(r.weight, 1)} %
                  {r.atRisk > 0 && <> · угрожено {formatNumber(r.atRisk, Number.isInteger(r.atRisk) ? 0 : 1)} {unit}</>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 lg:col-span-2">
          <h4 className="mb-1 text-sm font-semibold text-ink">Остварено и циљано (% максимума)</h4>
          <RadarChart
            title="Остварено и циљано по категоријама"
            max={100}
            labelMax={compactAxes ? 5 : 22}
            axes={rows.map((r) => ({ id: r.id, label: compactAxes ? r.id : r.label }))}
            series={[
              { id: 'target', label: 'Циљано', values: rows.map((r) => (Math.max(r.targeted, r.achieved) / r.max) * 100), color: 'var(--ink)', dashed: true },
              { id: 'ach', label: 'Остварено', values: rows.map((r) => (r.achieved / r.max) * 100), color: 'var(--accent)' },
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
