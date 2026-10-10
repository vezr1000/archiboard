import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BookMarked, Check, CircleCheck, FileText, ListPlus, RotateCcw, ScanSearch, Scale, X } from 'lucide-react';
import { AiBadge, ThinkingDots, useReducedMotion, useScriptedRun } from '@/components/ai';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { Badge, Button, Callout, Card, ChoiceGroup } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { getRegulation, sessionsForProject } from '@/data';
import { FINDING_SEVERITY_LABELS, FINDING_SEVERITY_TONE, GATE_LABELS } from '@/domain/labels';
import type { AiFinding, FindingDisposition, FindingSeverity, ProjectDocument, Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { conditionFromFinding } from '../reviewLogic';
import type { StepProps } from './PrepStep';

const SEVERITIES: FindingSeverity[] = ['critical', 'warning', 'info'];
const GROUP_LABELS: Record<FindingSeverity, string> = { critical: 'Критично', warning: 'Упозорење', info: 'Инфо' };
const DISCLAIMER = 'Демо: налази су унапред припремљени за ову седницу — нема стварне анализе докумената. Одлуку доноси одбор.';
const BORDER_L: Record<Tone, string> = {
  neutral: 'border-l-line-strong',
  accent: 'border-l-accent',
  good: 'border-l-good',
  warn: 'border-l-warn',
  bad: 'border-l-bad',
  info: 'border-l-info',
  clay: 'border-l-clay',
};
const THINKING_MS = 4600;
const REVEAL_MS = 520;

function FindingCard({
  f,
  projectId,
  disposition,
  onChoose,
  onOpenConditions,
}: {
  f: AiFinding;
  projectId: string;
  disposition: FindingDisposition | undefined;
  onChoose: (d: FindingDisposition) => void;
  onOpenConditions: () => void;
}) {
  const tone = FINDING_SEVERITY_TONE[f.severity];
  const reg = getRegulation(f.regulationId);
  return (
    <li className={cn('animate-fade-in min-w-0 rounded-2xl border border-l-[3px] border-line bg-surface p-3.5', BORDER_L[tone])}>
      <div className="flex min-w-0 items-start gap-2">
        <Badge tone={tone} size="sm" variant={f.severity === 'critical' ? 'solid' : 'soft'} className="mt-0.5">
          {FINDING_SEVERITY_LABELS[f.severity]}
        </Badge>
      </div>
      <h4 className="mt-2 text-[0.95rem] leading-snug font-semibold text-ink">{f.title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-ink/90">{f.detail}</p>
      <p className="mt-2 flex items-start gap-1.5 text-xs leading-snug text-muted">
        <BookMarked className="mt-px size-3.5 shrink-0" aria-hidden />
        <span className="min-w-0">{f.reference}</span>
      </p>
      {(f.documentId || reg) && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {f.documentId && (
            <Link
              to={`${paths.project(projectId, 'dokumenta')}?doc=${f.documentId}`}
              className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              <FileText className="size-4" aria-hidden />
              Отвори документ
            </Link>
          )}
          {reg && (
            <Link
              to={paths.regulation(reg.id)}
              className="inline-flex min-h-9 min-w-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              <Scale className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{reg.code}</span>
            </Link>
          )}
        </div>
      )}
      <div className="mt-3 border-t border-line pt-3">
        <p className="mb-1.5 text-xs text-muted">Одлука одбора о налазу</p>
        <ChoiceGroup
          size="sm"
          ariaLabel={`Одлука о налазу: ${f.title}`}
          value={disposition}
          onChange={onChoose}
          options={[
            { value: 'condition', label: 'Претвори у услов', icon: ListPlus, tone: 'clay' },
            { value: 'accepted', label: 'Прихваћено', icon: Check, tone: 'good' },
            { value: 'not-relevant', label: 'Није релевантно', icon: X, tone: 'neutral' },
          ]}
        />
        {disposition === 'condition' && (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-snug text-muted">
            <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-good" aria-hidden />
            <span className="min-w-0">
              Услов је унапред попуњен у кораку „Услови“.{' '}
              <button
                type="button"
                onClick={onOpenConditions}
                className="inline-flex min-h-8 items-center gap-1 font-medium text-accent hover:underline"
              >
                Уреди услов <ArrowRight className="size-3.5" aria-hidden />
              </button>
            </span>
          </p>
        )}
      </div>
    </li>
  );
}

/** Step 4 — ★ АИ пре-ревизија (scripted demo): progressive status lines → findings stream in → board dispositions. */
export function AiStep({
  session,
  project,
  review,
  update,
  docs,
  goTo,
}: StepProps & { docs: ProjectDocument[]; goTo: (i: number) => void }) {
  const reduced = useReducedMotion();
  const thinkingMs = reduced ? 400 : THINKING_MS;
  const run = useScriptedRun({ thinkingMs });
  const { finish } = run;
  const [line, setLine] = useState(0);
  const [revealed, setRevealed] = useState(0);

  const findings = useMemo(
    () => [...session.aiFindings].sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity)),
    [session.aiFindings],
  );
  const prevGate = useMemo(
    () => sessionsForProject(session.projectId).find((s) => s.outcome !== 'scheduled' && s.date < session.date)?.gate,
    [session],
  );
  const statusLines = [
    `Проверавам ${docs.length} ${docs.length % 10 >= 2 && docs.length % 10 <= 4 && (docs.length < 12 || docs.length > 14) ? 'документа' : 'докумената'}…`,
    'Упоређујем KPI са циљевима…',
    prevGate ? `Проверавам услове са ${GATE_LABELS[prevGate].code}…` : 'Проверавам локацијске услове…',
    'Проверавам EU таксономију…',
    'Сортирам налазе по озбиљности…',
  ];

  // Thinking: advance status lines.
  useEffect(() => {
    if (run.state !== 'thinking') return;
    setLine(0);
    setRevealed(0);
    const step = thinkingMs / statusLines.length;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setLine(Math.min(n, statusLines.length - 1));
      if (n >= statusLines.length - 1) window.clearInterval(id);
    }, step);
    return () => window.clearInterval(id);
  }, [run.state, thinkingMs, statusLines.length]);

  // Streaming: findings one by one, then mark the run as done in the store.
  useEffect(() => {
    if (run.state !== 'streaming') return;
    const total = findings.length;
    let n = Math.min(1, total);
    setRevealed(n);
    const end = () => {
      finish();
      update((r) => ({ ...r, aiRun: true }));
    };
    if (total <= 1) {
      end();
      return;
    }
    const id = window.setInterval(
      () => {
        n += 1;
        setRevealed(n);
        if (n >= total) {
          window.clearInterval(id);
          end();
        }
      },
      reduced ? 60 : REVEAL_MS,
    );
    return () => window.clearInterval(id);
  }, [run.state, findings.length, reduced, finish, update]);

  const running = run.state === 'thinking' || run.state === 'streaming';
  const showAll = review.aiRun && !running;
  const shown = showAll ? findings : run.state === 'streaming' || run.state === 'done' ? findings.slice(0, revealed) : [];
  const disposed = findings.filter((f) => review.findingDispositions[f.id]).length;

  const choose = (f: AiFinding, d: FindingDisposition) =>
    update((r) => {
      const conditions = r.conditions.filter((c) => !(c.source === 'finding' && c.sourceId === f.id));
      return {
        ...r,
        findingDispositions: { ...r.findingDispositions, [f.id]: d },
        conditions: d === 'condition' ? [...conditions, conditionFromFinding(f, session, project)] : conditions,
      };
    });

  return (
    <Card className="border-info/30">
      <header className="mb-4 flex min-w-0 flex-col gap-2">
        <AiBadge />
        <div>
          <h3 className="font-display text-xl leading-snug text-ink">АИ пре-ревизија</h3>
          <p className="mt-0.5 text-sm text-muted">
            Пре седнице АрхиБорд проверава обавезна документа, показатеље, услове са претходне капије и критеријуме EU
            таксономије, и предлаже налазе по озбиљности. Одбор одлучује шта са сваким налазом.
          </p>
        </div>
      </header>

      {!review.aiRun && run.state === 'idle' && (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong bg-surface-2/40 p-4 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
            <ScanSearch className="size-5" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 text-sm leading-snug text-muted">
            {docs.length} обавезних докумената ·{' '}
            {session.aiFindings.length ? `${session.aiFindings.length} припремљених налаза` : 'без припремљених налаза'} за{' '}
            {GATE_LABELS[session.gate].full}.
          </p>
          <Button icon={ScanSearch} onClick={run.start} className="w-full sm:w-auto">
            Покрени пре-ревизију
          </Button>
        </div>
      )}

      {run.state === 'thinking' && (
        <ul className="flex flex-col gap-1.5 rounded-xl bg-surface-2/40 p-3.5" aria-live="polite">
          {statusLines.slice(0, line + 1).map((s, i) =>
            i < line ? (
              <li key={s} className="flex items-center gap-2 text-sm text-muted">
                <Check className="size-4 shrink-0 text-good" aria-hidden />
                {s}
              </li>
            ) : (
              <li key={s}>
                <ThinkingDots label={s} />
              </li>
            ),
          )}
        </ul>
      )}

      {(showAll || run.state === 'streaming' || run.state === 'done') && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2" aria-live="polite">
            <p className="flex items-center gap-2 text-sm text-ink">
              <Check className="size-4 shrink-0 text-good" aria-hidden />
              {running ? (
                <span>
                  Налази: {revealed} од {findings.length}…
                </span>
              ) : findings.length === 0 ? (
                <span>Пре-ревизија завршена — без налаза.</span>
              ) : (
                <span>
                  Пре-ревизија завршена · <span className="font-medium">{findings.length} налаза</span> · одлучено {disposed} од{' '}
                  {findings.length}
                </span>
              )}
            </p>
            {!running && (
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={run.start}>
                Покрени поново
              </Button>
            )}
          </div>

          {findings.length === 0 && !running && (
            <Callout tone="good" title="Нема налаза за ову капију">
              Документација и показатељи не отварају нова питања — одбор може да пређе на услове и одлуку.
            </Callout>
          )}

          {SEVERITIES.map((sev) => {
            const group = shown.filter((f) => f.severity === sev);
            if (group.length === 0) return null;
            const total = findings.filter((f) => f.severity === sev).length;
            return (
              <section key={sev} aria-label={GROUP_LABELS[sev]}>
                <h4 className="mb-2 flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', TONE_CLASSES[FINDING_SEVERITY_TONE[sev]].bg)} aria-hidden />
                  <span className="eyebrow">
                    {GROUP_LABELS[sev]} · {total}
                  </span>
                </h4>
                <ul className="grid gap-2.5 xl:grid-cols-2">
                  {group.map((f) => (
                    <FindingCard
                      key={f.id}
                      f={f}
                      projectId={project.id}
                      disposition={review.findingDispositions[f.id]}
                      onChoose={(d) => choose(f, d)}
                      onOpenConditions={() => goTo(4)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs leading-snug text-muted">{DISCLAIMER}</p>
      <FeedbackWidget
        moduleId="odbor-ai-prerevizija"
        compact
        question="Да ли бисте користили АИ пре-ревизију пред седницом одбора?"
      />
    </Card>
  );
}
