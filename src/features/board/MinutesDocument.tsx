import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Check, Copy, Printer, TriangleAlert } from 'lucide-react';
import { paths } from '@/components/layout/navigation';
import { Badge, Button } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { FIRM, APP, getPerson } from '@/data';
import {
  CHECK_STATUS_TONE,
  FINDING_DISPOSITION_DONE_LABELS,
  FINDING_DISPOSITION_TONE,
  FINDING_SEVERITY_LABELS,
  FINDING_SEVERITY_TONE,
  GATE_LABELS,
  SESSION_OUTCOME_LABELS,
  SESSION_OUTCOME_TONE,
} from '@/domain/labels';
import { cn } from '@/lib/cn';
import { DEMO_TODAY } from '@/lib/dates';
import { formatDate, formatDateGenitive } from '@/lib/format';
import { minutesSummary, type MinutesData } from './reviewLogic';

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid-page border-t border-line pt-4">
      <h2 className="mb-2 font-display text-lg text-ink">
        <span className="tabular mr-1.5 text-muted">{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Записник — formal minutes of a board session, from seed (held sessions) or generated from a finished gate review.
 * Print-ready: „Штампај / PDF“ uses the print stylesheet in index.css (app chrome hidden, light colours).
 */
export function MinutesDocument({ minutes: m }: { minutes: MinutesData }) {
  const [copy, setCopy] = useState<'idle' | 'ok' | 'fail'>('idle');
  const outcomeTone = SESSION_OUTCOME_TONE[m.outcome];
  const gate = GATE_LABELS[m.session.gate];

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(minutesSummary(m));
      setCopy('ok');
    } catch {
      setCopy('fail');
    }
    window.setTimeout(() => setCopy('idle'), 2200);
  };

  let n = 0;
  const next = () => (n += 1);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <p className="text-sm text-muted">{m.generated ? 'Записник генерисан из ревизије' : 'Записник из архиве одбора'}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
            Штампај / PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={copy === 'ok' ? Check : copy === 'fail' ? TriangleAlert : Copy}
            onClick={copySummary}
          >
            {copy === 'ok' ? 'Копирано' : copy === 'fail' ? 'Копирање није успело' : 'Копирај сажетак'}
          </Button>
        </div>
      </div>

      <article
        id="zapisnik"
        className="print-doc mx-auto flex max-w-3xl flex-col gap-5 rounded-2xl border border-line bg-surface p-5 shadow-soft md:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        <header>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink pb-2">
            <p className="text-xs font-semibold tracking-[0.12em] text-ink uppercase">
              {APP.name} · {FIRM.name}
            </p>
            <p className="text-xs text-muted">Одбор за одрживу архитектуру</p>
          </div>
          <h1 className="mt-5 font-display text-3xl text-ink md:text-4xl">Записник</h1>
          <p className="mt-1 text-sm text-muted">са седнице одбора — ревизија капије {gate.full}</p>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs text-muted">Пројекат</dt>
              <dd className="text-ink">{m.project?.name}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Капија</dt>
              <dd className="text-ink">{gate.full}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Датум и место</dt>
              <dd className="text-ink">
                {formatDate(m.session.date, 'long')}
                {m.session.location ? `, ${m.session.location}` : ''}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Председава</dt>
              <dd className="text-ink">{m.chair?.name ?? '—'}</dd>
            </div>
          </dl>
        </header>

        <div className={cn('rounded-xl p-4 print:border print:border-line', TONE_CLASSES[outcomeTone].bgSoft)}>
          <p className="eyebrow">Одлука одбора</p>
          <p className={cn('mt-0.5 font-display text-2xl md:text-3xl', TONE_CLASSES[outcomeTone].text)}>
            {SESSION_OUTCOME_LABELS[m.outcome]}
          </p>
          {m.conditions.length > 0 && (
            <p className="mt-1 text-sm text-ink">Уз услове наведене у тачки „Услови“, са носиоцима и роковима.</p>
          )}
        </div>

        <Section n={next()} title="Присутни">
          <ul className="flex flex-col gap-1 text-sm">
            {m.attendees.map((p) => (
              <li key={p.id} className="flex flex-wrap gap-x-2">
                <span className="text-ink">{p.name}</span>
                <span className="text-muted">— {p.role}</span>
              </li>
            ))}
          </ul>
          {m.absent.length > 0 && <p className="mt-1.5 text-sm text-muted">Одсутни: {m.absent.map((p) => p.name).join(', ')}</p>}
          <p className="mt-1.5 text-xs text-muted">
            Кворум: {m.attendees.length} од {m.attendees.length + m.absent.length} (потребно {m.quorum}).
          </p>
        </Section>

        <Section n={next()} title="Дневни ред">
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-ink marker:text-muted">
            {m.agenda.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </Section>

        <Section n={next()} title="Документација">
          <p className="text-sm text-ink">{m.documents.caption}</p>
          {m.documents.missing.length > 0 && (
            <ul className="mt-1.5 flex flex-col gap-1 text-sm">
              {m.documents.missing.map((d) => (
                <li key={d.id} className="flex gap-2">
                  <span className="text-bad">—</span>
                  <Link to={`${paths.project(d.projectId, 'dokumenta')}?doc=${d.id}`} className="text-ink hover:text-accent">
                    {d.title} <span className="text-muted">(недостаје)</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {m.kpis && (
          <Section n={next()} title="Показатељи (KPI)">
            <p className="mb-2 text-xs text-muted">{m.kpis.caption}</p>
            <ul className="divide-y divide-line rounded-xl border border-line text-sm">
              {m.kpis.rows.map((r) => (
                <li key={r.id} className="flex min-w-0 items-center gap-3 px-3 py-2 break-inside-avoid">
                  <span className="min-w-0 flex-1">
                    <span className="block text-ink">{r.label}</span>
                    <span className="block text-xs text-muted">праг {r.target}</span>
                  </span>
                  <span className="tabular shrink-0 text-right">
                    <span className="block text-ink">{r.value}</span>
                    {r.delta && (
                      <span className={cn('block text-xs', TONE_CLASSES[CHECK_STATUS_TONE[r.status]].text)}>{r.delta}</span>
                    )}
                  </span>
                  <span
                    className={cn('size-2.5 shrink-0 rounded-full', TONE_CLASSES[CHECK_STATUS_TONE[r.status]].bg)}
                    aria-label={r.status}
                  />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {m.findings.length > 0 && (
          <Section n={next()} title="АИ пре-ревизија (демо)">
            <ul className="flex flex-col gap-2 text-sm">
              {m.findings.map(({ finding: f, disposition }) => (
                <li key={f.id} className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 break-inside-avoid">
                  <span className={cn('text-xs font-medium', TONE_CLASSES[FINDING_SEVERITY_TONE[f.severity]].text)}>
                    {FINDING_SEVERITY_LABELS[f.severity]}
                  </span>
                  <span className="min-w-0 text-ink">{f.title}</span>
                  {disposition && (
                    <Badge tone={FINDING_DISPOSITION_TONE[disposition]} size="sm">
                      {FINDING_DISPOSITION_DONE_LABELS[disposition]}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section n={next()} title="Услови">
          {m.conditions.length === 0 ? (
            <p className="text-sm text-muted">Одбор није поставио услове.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-line rounded-xl border border-line text-sm">
              <li
                className="hidden gap-3 px-3 py-2 text-xs text-muted md:grid md:grid-cols-[1.5rem_minmax(0,1fr)_10rem_7.5rem]"
                aria-hidden
              >
                <span>№</span>
                <span>Услов</span>
                <span>Носилац</span>
                <span>Рок</span>
              </li>
              {m.conditions.map((c, i) => {
                const owner = getPerson(c.ownerId);
                const late = !c.done && c.dueDate < DEMO_TODAY;
                return (
                  <li
                    key={c.id}
                    className="grid gap-x-3 gap-y-1 px-3 py-2.5 break-inside-avoid md:grid-cols-[1.5rem_minmax(0,1fr)_10rem_7.5rem]"
                  >
                    <span className="tabular hidden text-muted md:block">{i + 1}.</span>
                    <span className="min-w-0 text-ink">
                      <span className="tabular mr-1 text-muted md:hidden">{i + 1}.</span>
                      {c.text}
                      {c.note && <span className="ml-1 text-xs text-muted">({c.note})</span>}
                      {c.done && <span className="ml-1 text-xs text-good">— испуњено</span>}
                    </span>
                    <span className="text-muted md:text-ink">
                      <span className="md:hidden">Носилац: </span>
                      {owner?.name ?? '—'}
                    </span>
                    <span className={cn('tabular', late ? 'font-medium text-bad' : 'text-muted md:text-ink')}>
                      <span className="md:hidden">Рок: </span>
                      {formatDate(c.dueDate, 'numeric')}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </Section>

        {m.votes && (
          <Section n={next()} title="Гласање">
            <ul className="flex flex-col gap-2 text-sm">
              {m.votes.map(({ person, vote }) => (
                <li key={person.id} className="break-inside-avoid">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-ink">{person.name}</span>
                    <Badge tone={SESSION_OUTCOME_TONE[vote.vote]} size="sm">
                      {SESSION_OUTCOME_LABELS[vote.vote]}
                    </Badge>
                  </span>
                  {vote.comment?.trim() && <span className="mt-0.5 block text-muted italic">„{vote.comment.trim()}“</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {m.text && (
          <Section n={next()} title="Закључак">
            <p className="text-sm leading-relaxed text-ink">{m.text}</p>
          </Section>
        )}

        <footer className="mt-4 grid gap-8 pt-4 sm:grid-cols-2 break-inside-avoid">
          {[
            {
              role: m.chair?.role.toLocaleLowerCase('sr').includes('председница') ? 'Председница одбора' : 'Председник одбора',
              name: m.chair?.name ?? '',
            },
            { role: 'Записничар', name: '' },
          ].map((s) => (
            <div key={s.role}>
              <div className="h-10 border-b border-ink/70" />
              <p className="mt-1.5 text-sm text-ink">{s.name || ' '}</p>
              <p className="text-xs text-muted">{s.role}</p>
            </div>
          ))}
        </footer>
        <p className="text-[0.7rem] leading-snug text-muted">
          {m.generated
            ? `Записник је генерисан у апликацији ${APP.name} из ревизије капије${m.completedAt ? ` завршене ${formatDateGenitive(m.completedAt.slice(0, 10))}` : ''}. Демо — подаци су измишљени.`
            : `Записник из архиве одбора. Демо — подаци су измишљени.`}
        </p>
      </article>
    </div>
  );
}
