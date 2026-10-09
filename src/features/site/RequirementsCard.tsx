import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { StackedBar, type StackSegment } from '@/components/charts';
import { Badge, Button, Card, EmptyState, FilterChips } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import {
  REQUIREMENT_CATEGORY_LABELS,
  REQUIREMENT_SOURCE_LABELS,
  REQUIREMENT_STATUS_LABELS,
  REQUIREMENT_STATUS_TONE,
} from '@/domain/labels';
import type { Project, Requirement, RequirementSource, RequirementStatus } from '@/domain/types';
import { cn } from '@/lib/cn';
import { useProjectRequirements } from '@/store';

const STATUS_ORDER: RequirementStatus[] = ['non-compliant', 'risk', 'unchecked', 'compliant'];
const SOURCE_ORDER: RequirementSource[] = ['lokacijski-uslovi', 'pdr', 'zakon', 'pravilnik', 'sertifikacija', 'projektni-zadatak', 'eu'];
const INITIAL_VISIBLE = 8;
const LONG_NOTE = 90;

function RequirementRow({ req }: { req: Requirement }) {
  const [open, setOpen] = useState(false);
  const tone = REQUIREMENT_STATUS_TONE[req.status];
  const longNote = (req.note?.length ?? 0) > LONG_NOTE;
  return (
    <li
      className={cn(
        'min-w-0 rounded-xl border border-l-[3px] border-line bg-surface p-3.5',
        TONE_CLASSES[tone].border,
        req.aiExtracted && 'bg-info-soft/40',
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant="outline" size="sm">
            {REQUIREMENT_SOURCE_LABELS[req.source]}
          </Badge>
          <span className="min-w-0 text-xs leading-snug text-muted">{req.sourceRef}</span>
        </div>
        <Badge tone={tone} size="sm" dot>
          {REQUIREMENT_STATUS_LABELS[req.status]}
        </Badge>
      </div>

      <p className="mt-2 text-sm leading-snug text-ink">{req.text}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge size="sm">{REQUIREMENT_CATEGORY_LABELS[req.category]}</Badge>
        {req.aiExtracted && (
          <Badge tone="info" size="sm" icon={Sparkles} title="Додато из резултата АИ извлачења (демо)">
            ново · АИ
          </Badge>
        )}
      </div>

      {req.note && (
        <div className="mt-2.5 rounded-lg bg-surface-2/70 px-2.5 py-2">
          <p className={cn('text-sm leading-snug text-muted', longNote && !open && 'line-clamp-2 md:line-clamp-none')}>{req.note}</p>
          {longNote && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="mt-1 inline-flex h-8 items-center gap-1 text-xs font-medium text-accent md:hidden"
            >
              {open ? 'Прикажи мање' : 'Прикажи више'}
              {open ? <ChevronUp className="size-3.5" aria-hidden /> : <ChevronDown className="size-3.5" aria-hidden />}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

/** „Услови и ограничења“: seed requirements merged with accepted AI-extracted ones; filter by source and status. */
export function RequirementsCard({ project }: { project: Project }) {
  const all = useProjectRequirements(project.id);
  const [sources, setSources] = useState<RequirementSource[]>([]);
  const [statuses, setStatuses] = useState<RequirementStatus[]>([]);
  const [showAll, setShowAll] = useState(false);

  const statusCount = (s: RequirementStatus) => all.filter((r) => r.status === s).length;
  const sourceOptions = SOURCE_ORDER.filter((s) => all.some((r) => r.source === s)).map((s) => ({
    value: s,
    label: REQUIREMENT_SOURCE_LABELS[s],
    count: all.filter((r) => r.source === s).length,
  }));
  const statusOptions = STATUS_ORDER.filter((s) => statusCount(s) > 0).map((s) => ({
    value: s,
    label: REQUIREMENT_STATUS_LABELS[s],
    count: statusCount(s),
  }));

  const filtered = useMemo(
    () =>
      all
        .filter((r) => (sources.length === 0 || sources.includes(r.source)) && (statuses.length === 0 || statuses.includes(r.status)))
        .map((r, i) => ({ r, i }))
        .sort(
          (a, b) =>
            Number(Boolean(b.r.aiExtracted)) - Number(Boolean(a.r.aiExtracted)) ||
            STATUS_ORDER.indexOf(a.r.status) - STATUS_ORDER.indexOf(b.r.status) ||
            a.i - b.i,
        )
        .map(({ r }) => r),
    [all, sources, statuses],
  );
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const filtering = sources.length > 0 || statuses.length > 0;
  const aiCount = all.filter((r) => r.aiExtracted).length;

  return (
    <Card
      id="uslovi"
      title="Услови и ограничења"
      subtitle={`${all.length} услова из локацијских услова, плана, прописа, сертификације и пројектног задатка${aiCount > 0 ? ` · ${aiCount} додато АИ анализом` : ''}`}
    >
      <StackedBar
        title="Услови по статусу усклађености"
        total={all.length}
        height="md"
        legendValues
        segments={STATUS_ORDER.map(
          (s): StackSegment => ({ id: s, label: REQUIREMENT_STATUS_LABELS[s], value: statusCount(s), tone: REQUIREMENT_STATUS_TONE[s] }),
        ).filter((s) => s.value > 0)}
      />

      <div className="mt-4 flex flex-col gap-2">
        <FilterChips multiple ariaLabel="Извор услова" options={sourceOptions} value={sources} onChange={setSources} />
        <FilterChips multiple ariaLabel="Статус услова" options={statusOptions} value={statuses} onChange={setStatuses} />
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            compact
            title="Нема услова за изабране филтере"
            action={
              filtering ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSources([]);
                    setStatuses([]);
                  }}
                >
                  Очисти филтере
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ul className="grid gap-2.5 lg:grid-cols-2">
              {visible.map((r) => (
                <RequirementRow key={r.id} req={r} />
              ))}
            </ul>
            {filtered.length > INITIAL_VISIBLE && (
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => setShowAll((v) => !v)}
                icon={showAll ? ChevronUp : ChevronDown}
              >
                {showAll ? 'Прикажи мање' : `Прикажи све (${filtered.length})`}
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
