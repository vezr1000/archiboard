import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { Legend } from '@/components/charts';
import { toneVar } from '@/components/ui';
import { getProject } from '@/data';
import { GATE_LABELS } from '@/domain/labels';
import type { BoardSession } from '@/domain/types';
import { cn } from '@/lib/cn';
import { addDays, DEMO_TODAY, parseIsoDate } from '@/lib/dates';
import { formatDate } from '@/lib/format';

const WEEKDAYS = ['П', 'У', 'С', 'Ч', 'П', 'С', 'Н'];
const WEEKS = 6;

/** Monday of the week containing `iso`. */
function mondayOf(iso: string): string {
  const d = parseIsoDate(iso);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  return addDays(-dow, iso);
}

/**
 * Compact 6-week calendar (starting with the current week) with a dot per board session. Tapping a session day
 * opens the session. Mobile-friendly: 7 columns of ≥ 40px.
 */
export function BoardCalendar({ sessions }: { sessions: BoardSession[] }) {
  const start = mondayOf(DEMO_TODAY);
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(i, start));
  const end = days[days.length - 1];
  const byDay = new Map<string, BoardSession[]>();
  sessions.filter((s) => s.date >= start && s.date <= end).forEach((s) => byDay.set(s.date, [...(byDay.get(s.date) ?? []), s]));
  const inWindow = [...byDay.values()].flat().sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <p className="mb-2 text-sm text-muted">
        {formatDate(start, 'day-month')} — {formatDate(end, 'long')}
      </p>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Календар седница одбора, наредних 6 недеља">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className={cn('pb-1 text-center text-[0.68rem] font-semibold text-muted', i >= 5 && 'opacity-60')}
            aria-hidden
          >
            {w}
          </div>
        ))}
        {days.map((iso, i) => {
          const d = parseIsoDate(iso);
          const list = byDay.get(iso);
          const isToday = iso === DEMO_TODAY;
          const past = iso < DEMO_TODAY;
          const firstOfMonth = d.getDate() === 1;
          const weekend = i % 7 >= 5;
          const content = (
            <>
              <span className="tabular leading-none">{d.getDate()}</span>
              {firstOfMonth && (
                <span className="text-[0.58rem] leading-none text-muted">{formatDate(iso, 'short').split(' ')[1]}</span>
              )}
              {list && <span className="mt-0.5 size-1.5 rounded-full" style={{ background: toneVar('accent') }} aria-hidden />}
            </>
          );
          const cls = cn(
            'flex h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-sm',
            past ? 'text-muted/60' : weekend ? 'text-muted' : 'text-ink',
            isToday && 'ring-1 ring-line-strong font-semibold',
          );
          if (list) {
            const s = list[0];
            const p = getProject(s.projectId);
            return (
              <Link
                key={iso}
                to={paths.session(s.id)}
                className={cn(cls, 'bg-accent-soft font-semibold text-accent hover:bg-accent hover:text-accent-ink')}
                aria-label={`${formatDate(iso, 'long')}: ${GATE_LABELS[s.gate].full}, ${p?.shortName ?? ''}`}
                title={`${GATE_LABELS[s.gate].full} · ${p?.shortName ?? ''}`}
              >
                {content}
              </Link>
            );
          }
          return (
            <div key={iso} className={cls} aria-label={isToday ? `данас, ${formatDate(iso, 'long')}` : undefined}>
              {content}
            </div>
          );
        })}
      </div>
      <Legend
        className="mt-3"
        items={[
          { label: 'седница одбора', color: toneVar('accent'), shape: 'dot' },
          { label: 'данас', color: 'var(--line-strong)', shape: 'square' },
        ]}
      />
      {inWindow.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
          {inWindow.map((s) => (
            <li key={s.id}>
              <Link
                to={paths.session(s.id)}
                className="flex min-h-10 items-center gap-2 rounded-lg px-1 text-sm hover:bg-surface-2"
              >
                <span className="tabular w-14 shrink-0 text-muted">{formatDate(s.date, 'short')}</span>
                <span className="min-w-0 flex-1 truncate text-ink">
                  {GATE_LABELS[s.gate].code} · {getProject(s.projectId)?.shortName}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
