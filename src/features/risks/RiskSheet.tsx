import { Avatar, Badge, KeyValue, Sheet } from '@/components/ui';
import { getPerson } from '@/data';
import { RISK_CATEGORY_LABELS, RISK_STATUS_LABELS, RISK_STATUS_TONE } from '@/domain/labels';
import type { Risk } from '@/domain/types';
import { cn } from '@/lib/cn';
import { ScoreBadge } from './RiskBadges';
import { riskScore, riskZone } from './risksLogic';

const PROBABILITY_WORDS = ['врло мала', 'мала', 'средња', 'велика', 'скоро извесна'];
const IMPACT_WORDS = ['занемарљив', 'мали', 'умерен', 'велики', 'тежак'];

function Scale({ label, value, words }: { label: string; value: number; words: string[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-muted">{label}</span>
        <span className="text-ink">
          <span className="tabular font-semibold">{value}</span>/5 · {words[value - 1]}
        </span>
      </div>
      <div className="mt-1.5 flex gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={cn('h-1.5 flex-1 rounded-full', n <= value ? 'bg-accent' : 'bg-surface-2')} />
        ))}
      </div>
    </div>
  );
}

export interface RiskSheetProps {
  /** Risk to show; `null` closes the sheet. */
  risk: Risk | null;
  onClose: () => void;
}

/** Risk detail: score and zone, probability / impact scales, owner, mitigation. */
export function RiskSheet({ risk, onClose }: RiskSheetProps) {
  const owner = risk ? getPerson(risk.ownerId) : undefined;
  const zone = risk ? riskZone(riskScore(risk)) : undefined;
  return (
    <Sheet open={risk !== null} onClose={onClose} title={risk?.title ?? ''} subtitle={risk ? RISK_CATEGORY_LABELS[risk.category] : undefined} width="md">
      {risk && zone && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <ScoreBadge risk={risk} />
            <Badge tone={zone.tone} variant="outline">
              {zone.label} ризик
            </Badge>
            <Badge tone={RISK_STATUS_TONE[risk.status]} dot>
              {RISK_STATUS_LABELS[risk.status]}
            </Badge>
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="eyebrow">Процена</h3>
            <Scale label="Вероватноћа" value={risk.probability} words={PROBABILITY_WORDS} />
            <Scale label="Утицај" value={risk.impact} words={IMPACT_WORDS} />
            <p className="text-xs text-muted">
              Резултат = вероватноћа × утицај = {risk.probability} × {risk.impact} = {riskScore(risk)}.
            </p>
          </section>

          <section>
            <h3 className="eyebrow mb-2">Ублажавање</h3>
            <p className="rounded-2xl bg-accent-soft p-3.5 text-sm leading-relaxed text-ink">{risk.mitigation}</p>
          </section>

          <section>
            <h3 className="eyebrow mb-2">Подаци</h3>
            <KeyValue
              items={[
                {
                  label: 'Одговорно лице',
                  value: owner ? (
                    <span className="inline-flex items-center gap-2">
                      <Avatar person={owner} size="xs" />
                      {owner.name}
                    </span>
                  ) : (
                    '—'
                  ),
                  hint: owner?.role,
                },
                { label: 'Категорија', value: RISK_CATEGORY_LABELS[risk.category] },
                { label: 'Статус', value: RISK_STATUS_LABELS[risk.status] },
              ]}
            />
          </section>
        </div>
      )}
    </Sheet>
  );
}
