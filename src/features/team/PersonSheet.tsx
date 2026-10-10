import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { paths } from '@/components/layout/navigation';
import { Avatar, Badge, DotScale, KeyValue, Sheet } from '@/components/ui';
import { getProject } from '@/data';
import { COMPETENCY_LABELS, DISCIPLINE_LABELS } from '@/domain/labels';
import type { Competency, Person } from '@/domain/types';
import { formatPct } from '@/lib/format';
import { isOverallocated, LICENCE_LABELS, projectColor, totalPct } from './teamLogic';

const LEVEL_WORDS = ['', 'основно', 'самостално', 'експерт'];

export interface PersonSheetProps {
  /** Person to show; `null` closes the sheet. */
  person: Person | null;
  onClose: () => void;
}

/** Person detail: role, office, licences, certifications, competencies, allocations (links to project team tabs). */
export function PersonSheet({ person, onClose }: PersonSheetProps) {
  return (
    <Sheet open={person !== null} onClose={onClose} title={person?.name ?? ''} subtitle={person?.role} width="md">
      {person && <Body p={person} />}
    </Sheet>
  );
}

function Body({ p }: { p: Person }) {
  const total = totalPct(p);
  const over = isOverallocated(p);
  const comps = (Object.entries(p.competencies ?? {}) as Array<[Competency, number]>).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const allocations = [...p.allocations].sort((a, b) => b.pct - a.pct);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar person={p} size="lg" showTitle={false} />
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {p.boardMember && (
            <Badge tone="accent" variant="solid">
              Члан одбора
            </Badge>
          )}
          <Badge tone="neutral" variant="outline">
            {DISCIPLINE_LABELS[p.discipline]}
          </Badge>
          {p.office && <Badge tone="neutral" variant="outline">{p.office}</Badge>}
        </div>
      </div>

      <section>
        <h3 className="eyebrow mb-2">Лиценце и сертификати</h3>
        <KeyValue
          items={[
            {
              label: 'Лиценце ИКС',
              value:
                p.licences.length === 0 ? (
                  '—'
                ) : (
                  <span className="flex flex-col gap-0.5">
                    {p.licences.map((l) => (
                      <span key={l}>
                        <span className="font-medium">{l}</span>
                        {LICENCE_LABELS[l] && <span className="text-muted"> · {LICENCE_LABELS[l]}</span>}
                      </span>
                    ))}
                  </span>
                ),
            },
            {
              label: 'Сертификати',
              value:
                p.certifications.length === 0 ? (
                  '—'
                ) : (
                  <span className="flex flex-wrap gap-1.5">
                    {p.certifications.map((c) => (
                      <Badge key={c} tone="info" variant="outline">
                        {c}
                      </Badge>
                    ))}
                  </span>
                ),
            },
          ]}
        />
      </section>

      <section>
        <h3 className="eyebrow mb-2">Компетенције</h3>
        {comps.length === 0 ? (
          <p className="text-sm text-muted">Нису процењене.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {comps.map(([c, v]) => (
              <li key={c} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink">{COMPETENCY_LABELS[c]}</span>
                <span className="inline-flex items-center gap-2 text-xs text-muted">
                  {LEVEL_WORDS[v]}
                  <DotScale label={COMPETENCY_LABELS[c]} value={v} max={3} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="eyebrow">Ангажовање</h3>
          <span className={over ? 'tabular text-sm font-semibold text-bad' : 'tabular text-sm font-semibold text-ink'}>{formatPct(total, { decimals: 0 })} укупно</span>
        </div>
        {over && <p className="mb-2 text-sm text-bad">Преоптерећење: {formatPct(total - 100, { decimals: 0 })} изнад капацитета.</p>}
        <ul className="flex flex-col gap-1.5">
          {allocations.map((a) => {
            const project = getProject(a.projectId);
            if (!project) return null;
            return (
              <li key={a.projectId}>
                <Link
                  to={paths.project(a.projectId, 'tim')}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3 py-2 text-sm transition-colors hover:bg-surface-2/60"
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: projectColor(a.projectId) }} aria-hidden />
                  <span className="min-w-0 flex-1 text-ink">{project.shortName}</span>
                  <span className="tabular font-medium text-ink">{formatPct(a.pct, { decimals: 0 })}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
