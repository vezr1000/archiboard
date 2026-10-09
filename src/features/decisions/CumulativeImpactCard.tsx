import { useMemo } from 'react';
import { StepLine, type StepPoint, type StepTick } from '@/components/charts';
import { Card } from '@/components/ui';
import type { Decision } from '@/domain/types';
import { DEMO_TODAY, parseIsoDate } from '@/lib/dates';
import { formatDate, formatPct } from '@/lib/format';
import { cumulativeCarbon, decisionEmphasis } from './decisionsLogic';

const ts = (iso: string) => parseIsoDate(iso).getTime();
const fmt = (v: number) => formatPct(v, { signed: true, decimals: 0 });

/**
 * „Кумулативни утицај на уграђени угљеник“ — step line of the compounded carbon effect of the decisions.
 * Decision Δs are relative to the design state just before each decision, so this is NOT an absolute KPI path.
 */
export function CumulativeImpactCard({ decisions }: { decisions: Decision[] }) {
  const steps = useMemo(() => cumulativeCarbon(decisions), [decisions]);

  const points: StepPoint[] = steps.map((s) => ({
    x: ts(s.decision.date),
    y: s.cumulativePct,
    label: s.decision.title,
    projected: s.projected,
    tone: (s.decision.impact.carbonDeltaPct ?? 0) > 0 ? 'bad' : 'good',
    highlight: decisionEmphasis(s.decision) !== null,
  }));

  if (steps.length < 2) return null;

  const first = ts(steps[0].decision.date);
  const end = Math.max(ts(steps[steps.length - 1].decision.date), ts(DEMO_TODAY));
  const spanDays = (end - first) / 86_400_000;
  const tickDates =
    spanDays > 120
      ? [steps[0].decision.date, new Date(first + (end - first) / 2), new Date(end)]
      : [steps[0].decision.date, new Date(end)];
  const seen = new Set<string>();
  const xTicks: StepTick[] = tickDates.flatMap((d) => {
    const label = formatDate(d, 'month').replace(/\.$/, '');
    if (seen.has(label)) return [];
    seen.add(label);
    return [{ x: typeof d === 'string' ? ts(d) : d.getTime(), label }];
  });

  const approved = steps.filter((s) => !s.projected);
  const lastApproved = approved[approved.length - 1];
  const last = steps[steps.length - 1];

  return (
    <Card
      title="Кумулативни утицај на уграђени угљеник"
      subtitle="Утицај одлука, не апсолутне вредности: збир ефеката свих одлука у односу на стање пре прве"
    >
      <StepLine title="Кумулативни утицај одлука на уграђени угљеник" points={points} xEnd={end} xTicks={xTicks} format={fmt} unit="%" />
      <p className="mt-2 text-sm text-muted">
        {lastApproved ? (
          <>
            Усвојене одлуке: <span className="tabular font-medium text-ink">{fmt(lastApproved.cumulativePct)}</span>
          </>
        ) : null}
        {last.projected && (
          <>
            {lastApproved ? ' · ' : ''}уз предлоге: <span className="tabular font-medium text-ink">{fmt(last.cumulativePct)}</span>
          </>
        )}
        . Ефекти се множе, јер се свака одлука мери у односу на стање непосредно пре ње; на пројектни KPI утичу и друге промене.
      </p>
    </Card>
  );
}
