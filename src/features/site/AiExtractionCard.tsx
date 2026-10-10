import { useEffect, useState } from 'react';
import { ArrowDown, Check, FileText, FileUp, Plus, RotateCcw, ScanText } from 'lucide-react';
import { AiBadge, ThinkingDots, useReducedMotion, useScriptedRun } from '@/components/ai';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Badge, Button, Callout, Card, ProgressBar } from '@/components/ui';
import { requirementsForProject } from '@/data';
import { REQUIREMENT_CATEGORY_LABELS, REQUIREMENT_STATUS_LABELS } from '@/domain/labels';
import type { Project, Requirement, Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { useAppStore } from '@/store';
import { EXTRACTION_SCRIPTS, type ExtractedCondition, type ExtractionScript } from './extractionScripts';

const DISCLAIMER = 'Демо: резултат је унапред припремљен, без стварне анализе документа.';

const confidenceTone = (c: number): Tone => (c >= 90 ? 'good' : c >= 83 ? 'info' : 'warn');

/** Requirement created when an extracted condition is accepted into the checklist. */
const toRequirement = (project: Project, script: ExtractionScript, c: ExtractedCondition): Requirement => ({
  id: `req-ai-${project.id}-${c.key}`,
  projectId: project.id,
  source: 'lokacijski-uslovi',
  sourceRef: `${script.docAbbr} стр. ${c.page}, ${c.item}`,
  category: c.category,
  text: c.text,
  status: 'unchecked',
  note: `Извучено АИ анализом (демо), поузданост ${formatNumber(c.confidence, 0)} % — потребна провера архитекте.`,
  aiExtracted: true,
});

const scrollToChecklist = () => {
  document.getElementById('uslovi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function ConditionCard({
  c,
  script,
  existing,
  accepted,
  onAccept,
}: {
  c: ExtractedCondition;
  script: ExtractionScript;
  existing: Requirement | undefined;
  accepted: boolean;
  onAccept: () => void;
}) {
  return (
    <li className="animate-fade-in min-w-0 rounded-xl border border-line bg-surface p-3.5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant="outline" size="sm" icon={FileText}>
            {script.docAbbr} стр. {c.page}
          </Badge>
          <span className="min-w-0 text-xs leading-snug text-muted">{c.item}</span>
        </div>
        {existing ? (
          <Badge size="sm">већ у листи</Badge>
        ) : (
          <Badge tone="info" size="sm" variant="solid">
            ново
          </Badge>
        )}
      </div>

      <p className="mt-2 text-sm leading-snug text-ink">{c.text}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge size="sm">{REQUIREMENT_CATEGORY_LABELS[c.category]}</Badge>
      </div>

      <ProgressBar
        className="mt-3"
        size="xs"
        tone={confidenceTone(c.confidence)}
        value={c.confidence}
        max={100}
        label="Поузданост"
        valueLabel={`${formatNumber(c.confidence, 0)} %`}
      />

      <div className="mt-3 flex min-h-9 flex-wrap items-center justify-between gap-2">
        {existing ? (
          <p className="text-xs leading-snug text-muted">
            Постоји у листи услова ·{' '}
            <span className={cn('font-medium', existing.status === 'compliant' ? 'text-good' : 'text-ink')}>
              {REQUIREMENT_STATUS_LABELS[existing.status].toLowerCase()}
            </span>
          </p>
        ) : accepted ? (
          <>
            <Badge tone="good" icon={Check}>
              Прихваћено
            </Badge>
            <Button variant="ghost" size="sm" iconRight={ArrowDown} onClick={scrollToChecklist}>
              У листи
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" icon={Plus} onClick={onAccept}>
            Прихвати
          </Button>
        )}
      </div>
    </li>
  );
}

/**
 * ★ АИ moment: „Извуци услове из локацијских услова“. Scripted playback — fake file chip, progressive status lines,
 * results streaming in, then accept one/all into the checklist (store `acceptedRequirements`).
 * Shown for every project; the park uses its water-conditions document.
 */
export function AiExtractionCard({ project }: { project: Project }) {
  const script = EXTRACTION_SCRIPTS[project.id];
  const reduced = useReducedMotion();
  const run = useScriptedRun({ thinkingMs: reduced ? 500 : 4800 });
  const { start, finish, reset } = run;
  const acceptedList = useAppStore((s) => s.acceptedRequirements);
  const acceptRequirements = useAppStore((s) => s.acceptRequirements);
  const [line, setLine] = useState(0);
  const [revealed, setRevealed] = useState(0);

  const total = script?.conditions.length ?? 0;
  const lineCount = script?.statusLines.length ?? 0;

  // Thinking phase: advance the status lines.
  useEffect(() => {
    if (run.state !== 'thinking') return;
    setLine(0);
    setRevealed(0);
    const step = (reduced ? 500 : 4800) / Math.max(1, lineCount);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setLine(Math.min(n, lineCount - 1));
      if (n >= lineCount - 1) window.clearInterval(id);
    }, step);
    return () => window.clearInterval(id);
  }, [run.state, lineCount, reduced]);

  // Streaming phase: reveal the extracted conditions one by one, then finish.
  useEffect(() => {
    if (run.state !== 'streaming') return;
    let n = 1;
    setRevealed(1);
    if (total <= 1) {
      finish();
      return;
    }
    const id = window.setInterval(() => {
      n += 1;
      setRevealed(n);
      if (n >= total) {
        window.clearInterval(id);
        finish();
      }
    }, reduced ? 60 : 650);
    return () => window.clearInterval(id);
  }, [run.state, total, reduced, finish]);

  if (!script) return null;

  const seedReqs = requirementsForProject(project.id);
  const rows = script.conditions.map((c) => {
    const id = `req-ai-${project.id}-${c.key}`;
    return {
      c,
      existing: c.matchesId ? seedReqs.find((r) => r.id === c.matchesId) : undefined,
      accepted: acceptedList.some((r) => r.id === id),
    };
  });
  const shown = rows.slice(0, revealed);
  const pending = rows.filter((r) => !r.existing && !r.accepted);
  const existingCount = rows.filter((r) => r.existing).length;
  const acceptedNow = rows.filter((r) => r.accepted).length;
  const accept = (items: ExtractedCondition[]) => acceptRequirements(items.map((c) => toRequirement(project, script, c)));
  const sizeLabel = `${formatNumber(script.sizeMb, 1)} MB`;
  const active = run.state !== 'idle';
  const done = run.state === 'done';

  return (
    <Card className="border-info/30">
      <header className="mb-4 min-w-0">
        <AiBadge />
        <h3 className="mt-2 font-display text-lg leading-snug text-ink">Извуци услове из {script.docGenitive}</h3>
        <p className="mt-0.5 text-sm text-muted">Издвајање услова из PDF-а, са референцом на страну, и предлог за листу услова</p>
      </header>
      {!active && (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong bg-surface-2/40 p-4 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
            <FileUp className="size-5" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 text-sm leading-snug text-muted">
            Отпремите PDF и АрхиБорд ће препознати услове јавних предузећа, ограничења плана и обавезе према
            заштити споменика, упоредити их са постојећом листом и предложити шта недостаје.
          </p>
          <Button icon={ScanText} onClick={start} className="h-auto! min-h-11 w-full whitespace-normal! py-2 text-center sm:w-auto">
            Извуци услове из {script.docGenitive}
          </Button>
        </div>
      )}

      {active && (
        <div className="flex flex-col gap-4">
          {/* (a) fake file chip */}
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bad-soft text-bad">
              <FileText className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink" title={script.fileName}>
                {script.fileName}
              </p>
              <p className="text-xs text-muted">
                PDF · {sizeLabel} · {script.pages} страна
              </p>
            </div>
            <Badge tone={line === 0 && run.state === 'thinking' ? 'info' : 'good'} size="sm" icon={line === 0 && run.state === 'thinking' ? undefined : Check}>
              {line === 0 && run.state === 'thinking' ? 'отпрема се' : 'отпремљено'}
            </Badge>
          </div>

          {/* (b) thinking: progressive status lines */}
          {run.state === 'thinking' && (
            <ul className="flex flex-col gap-1.5" aria-live="polite">
              {script.statusLines.slice(0, line + 1).map((s, i) =>
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

          {/* (c) results */}
          {run.state !== 'thinking' && (
            <>
              <p className="flex items-center gap-2 text-sm text-ink" aria-live="polite">
                <Check className="size-4 shrink-0 text-good" aria-hidden />
                {done ? (
                  <span>
                    Анализа завршена — пронађено <span className="font-medium">{total}</span> услова:{' '}
                    {existingCount} већ у листи, <span className="font-medium">{total - existingCount} нових</span>.
                  </span>
                ) : (
                  <span>Пронађени услови: {revealed} од {total}…</span>
                )}
              </p>
              <ul className="grid gap-2.5 md:grid-cols-2">
                {shown.map(({ c, existing, accepted }) => (
                  <ConditionCard key={c.key} c={c} script={script} existing={existing} accepted={accepted} onAccept={() => accept([c])} />
                ))}
              </ul>
            </>
          )}

          {done && (
            <>
              {acceptedNow > 0 && (
                <Callout tone="good">
                  <p>
                    {acceptedNow === 1 ? 'Један услов је додат' : `Додато услова: ${acceptedNow}`} у листу — статус „{REQUIREMENT_STATUS_LABELS.unchecked.toLowerCase()}“, означено као „ново“.
                  </p>
                  <Button variant="secondary" size="sm" iconRight={ArrowDown} onClick={scrollToChecklist} className="mt-2">
                    Листа услова
                  </Button>
                </Callout>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button icon={Plus} onClick={() => accept(pending.map((r) => r.c))} disabled={pending.length === 0}>
                  {pending.length > 0 ? `Прихвати све нове (${pending.length})` : 'Сви нови услови су прихваћени'}
                </Button>
                <Button variant="ghost" icon={RotateCcw} onClick={start}>
                  Покрени поново
                </Button>
                <Button variant="ghost" onClick={reset} className="sm:ml-auto">
                  Затвори резултат
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <p className="mt-4 text-xs leading-snug text-muted">{DISCLAIMER}</p>
      <FeedbackWidget
        moduleId="ai-lokacijski-uslovi"
        compact
        question="Да ли бисте користили АИ издвајање услова из документа?"
      />
    </Card>
  );
}
