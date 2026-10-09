import { useEffect, useId, useState } from 'react';
import { CalendarClock, Save, Send } from 'lucide-react';
import { Badge, Button, EnergyClassBadge, Sheet, Toggle } from '@/components/ui';
import type { EnergyClass } from '@/domain/types';
import { formatPct, formatSigned } from '@/lib/format';

const inputCls =
  'w-full rounded-xl border border-line bg-surface px-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none';

/** „Сачувај као варијанту“ — name + description, saved to the store as a user option. */
export function SaveOptionSheet({
  open,
  onClose,
  defaultName,
  defaultSummary,
  code,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  defaultName: string;
  defaultSummary: string;
  code: string;
  onSave: (name: string, summary: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [summary, setSummary] = useState(defaultSummary);
  const nameId = useId();
  const sumId = useId();
  useEffect(() => {
    if (open) {
      setName(defaultName);
      setSummary(defaultSummary);
    }
  }, [open, defaultName, defaultSummary]);
  const valid = name.trim().length > 0;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Сачувај као варијанту"
      subtitle={`Добиће ознаку „${code}“ и појавиће се у поређењу варијанти.`}
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Одустани
          </Button>
          <Button icon={Save} className="min-w-0 flex-1" disabled={!valid} onClick={() => onSave(name.trim(), summary.trim())}>
            Сачувај варијанту {code}
          </Button>
        </div>
      }
    >
      <label htmlFor={nameId} className="mb-1 block text-sm text-ink">
        Назив
      </label>
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-sm text-muted">Варијанта {code} —</span>
        <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} h-11`} maxLength={80} />
      </div>
      <label htmlFor={sumId} className="mt-4 mb-1 block text-sm text-ink">
        Опис
      </label>
      <textarea id={sumId} value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className={`${inputCls} resize-y py-2`} />
      <p className="mt-2 text-xs text-muted">Варијанта се чува на овом уређају и може се обрисати из поређења.</p>
    </Sheet>
  );
}

export interface ProposalPreview {
  carbon: number;
  carbonDeltaPct: number;
  energyClass: EnergyClass;
  costDeltaPp: number;
  taxonomyPass: boolean;
  fireWarning: boolean;
  referenceLabel: string;
}

/** „Предложи одбору“ — creates a proposed decision linked to the next gate session. */
export function ProposeSheet({
  open,
  onClose,
  defaultTitle,
  preview,
  sessionLabel,
  alreadySaved,
  onPropose,
}: {
  open: boolean;
  onClose: () => void;
  defaultTitle: string;
  preview: ProposalPreview;
  sessionLabel?: string;
  alreadySaved: boolean;
  onPropose: (title: string, alsoSave: boolean) => void;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [alsoSave, setAlsoSave] = useState(true);
  const titleId = useId();
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setAlsoSave(true);
    }
  }, [open, defaultTitle]);
  const p = preview;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Предложи одбору"
      subtitle="Ствара нацрт одлуке са контекстом и утицајем из калкулатора."
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Одустани
          </Button>
          <Button icon={Send} className="min-w-0 flex-1" disabled={!title.trim()} onClick={() => onPropose(title.trim(), alsoSave && !alreadySaved)}>
            Пошаљи предлог
          </Button>
        </div>
      }
    >
      <label htmlFor={titleId} className="mb-1 block text-sm text-ink">
        Наслов одлуке
      </label>
      <input id={titleId} value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputCls} h-11`} maxLength={120} />

      <div className="mt-4 rounded-2xl bg-surface-2 p-3.5">
        <div className="eyebrow mb-2">Утицај у односу на {p.referenceLabel}</div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={p.carbonDeltaPct <= 0 ? 'good' : 'bad'}>
            Угљеник {p.carbon} kgCO₂e/m² ({formatPct(p.carbonDeltaPct, { signed: true, decimals: 1 })})
          </Badge>
          <Badge tone={p.costDeltaPp <= 0 ? 'good' : 'warn'}>Трошак {formatSigned(Math.round(p.costDeltaPp * 10) / 10, 1)} п.п.</Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            разред <EnergyClassBadge value={p.energyClass} size="sm" />
          </span>
          <Badge tone={p.taxonomyPass ? 'good' : 'bad'} size="sm">
            EU таксономија {p.taxonomyPass ? 'испуњена' : 'није испуњена'}
          </Badge>
          {p.fireWarning && (
            <Badge tone="bad" size="sm">
              Горива облога изнад 22 m
            </Badge>
          )}
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-sm text-ink">
        <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
        {sessionLabel ? <span>Предлог ће бити уврштен у следећу седницу одбора: {sessionLabel}.</span> : <span>Пројекат нема заказану седницу — предлог остаје у дневнику одлука.</span>}
      </p>

      {!alreadySaved && (
        <Toggle className="mt-4" label="Сачувај и као варијанту" description="Да би одбор могао да је упореди са осталима" checked={alsoSave} onChange={setAlsoSave} />
      )}
    </Sheet>
  );
}
