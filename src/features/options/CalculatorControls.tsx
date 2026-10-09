import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Building, Layers, Recycle, Zap } from 'lucide-react';
import { Segmented, Select, Slider, Toggle } from '@/components/ui';
import {
  CLADDING_LABELS,
  CONCRETE_MIX_LABELS,
  FACADE_LABELS,
  HEATING_LABELS,
  SHADING_LABELS,
  STRUCTURE_LABELS,
} from '@/domain/labels';
import type { Cladding, ConcreteMix, DesignParams, FacadeType, HeatingSystem, ShadingType, StructureSystem, WindowGlazing } from '@/domain/types';
import { CLADDING, PARAM_LABELS, resolveParams, type FullParams, type ParamKey } from '@/lib/carbonModel';
import { formatNumber, formatPct } from '@/lib/format';

const opts = <V extends string>(labels: Record<V, string>) => (Object.keys(labels) as V[]).map((value) => ({ value, label: labels[value] }));

const CONCRETE_SHORT: Array<{ value: ConcreteMix; label: string }> = [
  { value: 'cem-i', label: 'CEM I' },
  { value: 'cem-ii', label: 'CEM II' },
  { value: 'cem-iii', label: 'CEM III/A' },
  { value: 'niskoklinkerski', label: 'LC3' },
];

interface CalculatorControlsProps {
  params: FullParams;
  /** Reference design — changed controls get a marker. */
  refParams: DesignParams;
  onChange: (patch: Partial<FullParams>) => void;
  pvMax: number;
  /** Floor level of the top storey (fire rule hint). */
  topFloorLevelM: number;
}

/** What-if controls grouped as Конструкција / Омотач / Енергија / Материјали. */
export function CalculatorControls({ params: p, refParams, onChange, pvMax, topFloorLevelM }: CalculatorControlsProps) {
  const ref = resolveParams(refParams);
  const label = (key: ParamKey, text?: string) => <ChangedLabel text={text ?? PARAM_LABELS[key]} changed={ref[key] !== p[key]} />;
  const ventilated = p.facade === 'ventilisana';

  return (
    <div className="flex flex-col gap-3">
      <Group icon={Building} title="Конструкција">
        <Select<StructureSystem>
          label={label('structure')}
          value={p.structure}
          onChange={(structure) => onChange({ structure })}
          options={opts(STRUCTURE_LABELS)}
        />
        <p className="text-xs text-muted">
          {topFloorLevelM > 22
            ? `Висока зграда: под највишег спрата на ${formatNumber(topFloorLevelM, 1)} m (> 22 m) — фасадна облога мора бити негорива.`
            : `Под највишег спрата на ${formatNumber(topFloorLevelM, 1)} m — испод границе од 22 m за високе зграде.`}
        </p>
      </Group>

      <Group icon={Layers} title="Омотач">
        <Select<FacadeType> label={label('facade')} value={p.facade} onChange={(facade) => onChange({ facade })} options={opts(FACADE_LABELS)} />
        {ventilated && (
          <Select<Cladding>
            label={label('cladding')}
            value={p.cladding}
            onChange={(cladding) => onChange({ cladding })}
            options={(Object.keys(CLADDING_LABELS) as Cladding[]).map((value) => ({
              value,
              label: `${CLADDING_LABELS[value]} (${CLADDING[value].fireClass})`,
            }))}
          />
        )}
        <Slider
          label={label('insulationCm', 'Изолација зидова')}
          unit="cm"
          value={p.insulationCm}
          min={4}
          max={40}
          step={1}
          onChange={(insulationCm) => onChange({ insulationCm })}
          minLabel="4 cm"
          maxLabel="40 cm"
        />
        <Slider
          label={label('glazingRatio', 'Удео застакљења фасаде')}
          value={Math.round(p.glazingRatio * 100)}
          min={15}
          max={75}
          step={1}
          format={(v) => formatPct(v, { decimals: 0 })}
          onChange={(v) => onChange({ glazingRatio: v / 100 })}
          hint="Више стакла: више дневног светла, али и више прегревања и угљеника у отворима."
        />
        <SegmentedField label={label('windows')}>
          <Segmented<WindowGlazing> ariaLabel="Прозори" fullWidth value={p.windows} onChange={(windows) => onChange({ windows })} options={[{ value: 'dvostruko', label: 'Двоструко' }, { value: 'trostruko', label: 'Троструко' }]} />
        </SegmentedField>
        <SegmentedField label={label('shading', 'Засена застакљења')}>
          <Segmented<ShadingType> ariaLabel="Засена" fullWidth value={p.shading} onChange={(shading) => onChange({ shading })} options={opts(SHADING_LABELS)} />
        </SegmentedField>
        <Slider
          label={label('greenRoofPct', 'Зелени кров (удео крова)')}
          value={p.greenRoofPct}
          min={0}
          max={100}
          step={5}
          format={(v) => formatPct(v, { decimals: 0 })}
          onChange={(greenRoofPct) => onChange({ greenRoofPct })}
        />
      </Group>

      <Group icon={Zap} title="Енергија">
        <Select<HeatingSystem> label={label('heating')} value={p.heating} onChange={(heating) => onChange({ heating })} options={opts(HEATING_LABELS)} />
        <Slider
          label={label('pvKwp', 'PV на крову и фасади')}
          unit="kWp"
          value={Math.min(p.pvKwp, pvMax)}
          min={0}
          max={pvMax}
          step={5}
          onChange={(pvKwp) => onChange({ pvKwp })}
          hint="PV смањује примарну енергију, али додаје уграђени угљеник (950 kgCO₂e/kWp)."
        />
        <Toggle
          label={label('mvhr', 'Вентилација са рекуперацијом')}
          description="Смањује губитке вентилацијом за 60 %"
          checked={p.mvhr}
          onChange={(mvhr) => onChange({ mvhr })}
        />
      </Group>

      <Group icon={Recycle} title="Материјали">
        <SegmentedField label={label('concreteMix')}>
          <Segmented<ConcreteMix> ariaLabel="Бетон — темељи" fullWidth value={p.concreteMix} onChange={(concreteMix) => onChange({ concreteMix })} options={CONCRETE_SHORT} />
        </SegmentedField>
        <SegmentedField label={label('coreConcreteMix')}>
          <Segmented<ConcreteMix>
            ariaLabel="Бетон — језгра"
            fullWidth
            value={p.coreConcreteMix}
            onChange={(coreConcreteMix) => onChange({ coreConcreteMix })}
            options={CONCRETE_SHORT}
          />
        </SegmentedField>
        <p className="-mt-1 text-xs text-muted">
          {CONCRETE_MIX_LABELS['cem-iii']} и нискоклинкерски цемент (LC3) смањују угљеник бетона за 23–30 % у односу на CEM II.
        </p>
        <Slider
          label={label('reusedPct', 'Поново употребљени материјали')}
          value={p.reusedPct}
          min={0}
          max={60}
          step={1}
          format={(v) => formatPct(v, { decimals: 0 })}
          onChange={(reusedPct) => onChange({ reusedPct })}
          hint="Поново употребљени и рециклирани материјали, удео масе конструкције."
        />
      </Group>
    </div>
  );
}

function Group({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 rounded-2xl border border-line bg-surface p-4">
      <legend className="sr-only">{title}</legend>
      <div className="mb-3 flex items-center gap-2" aria-hidden>
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="size-4" />
        </span>
        <span className="font-display text-base font-semibold text-ink">{title}</span>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

function SegmentedField({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-sm text-ink">{label}</div>
      {children}
    </div>
  );
}

/** Label with a small clay dot when the value differs from the reference design. */
function ChangedLabel({ text, changed }: { text: string; changed: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="truncate">{text}</span>
      {changed && (
        <span className="size-2 shrink-0 rounded-full bg-clay" title="Измењено у односу на поређење">
          <span className="sr-only">(измењено)</span>
        </span>
      )}
    </span>
  );
}
