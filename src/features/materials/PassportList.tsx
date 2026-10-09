import { useMemo, useState } from 'react';
import { Puzzle, X } from 'lucide-react';
import { Badge, Button, Card, DataList, FilterChips, SearchInput, type DataColumn } from '@/components/ui';
import { BUILDING_LAYER_LABELS, BUILDING_LAYERS, REUSE_POTENTIAL_LABELS, REUSE_POTENTIAL_TONE } from '@/domain/labels';
import type { BuildingLayer, ReusePotential } from '@/domain/types';
import { formatCarbon, formatNumber, formatPct } from '@/lib/format';
import {
  formatGwp,
  formatKm,
  formatQuantity,
  LOCAL_KM,
  passportRowKey,
  positionsCount,
  sortPassport,
  type PassportRow,
} from './materialsLogic';

type Flag = 'local' | 'demountable' | 'reused';

interface PassportListProps {
  rows: PassportRow[];
  layer: BuildingLayer | null;
  materialId: string | null;
  onLayer: (layer: BuildingLayer | null) => void;
  onMaterial: (materialId: string | null) => void;
  onOpenMaterial: (materialId: string) => void;
}

const tonnes = (kg: number) => `${formatNumber(kg / 1000, kg >= 100_000 ? 0 : 1)} t`;

/** „Материјални пасош“: rows grouped by building layer with search and filter chips. */
export function PassportList({ rows, layer, materialId, onLayer, onMaterial, onOpenMaterial }: PassportListProps) {
  const [query, setQuery] = useState('');
  const [reuse, setReuse] = useState<ReusePotential | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);

  const total = useMemo(() => rows.reduce((s, r) => s + r.gwpTotalKg, 0), [rows]);
  const hasReused = rows.some((r) => r.reused);
  const layersPresent = BUILDING_LAYERS.filter((l) => rows.some((r) => r.layer === l));
  const materialName = materialId ? rows.find((r) => r.materialId === materialId)?.material.name : undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortPassport(
      rows.filter((r) => {
        if (layer && r.layer !== layer) return false;
        if (materialId && r.materialId !== materialId) return false;
        if (reuse && r.material.reusePotential !== reuse) return false;
        if (flags.includes('local') && r.material.distanceKm >= LOCAL_KM) return false;
        if (flags.includes('demountable') && !r.demountable) return false;
        if (flags.includes('reused') && !r.reused) return false;
        if (q && !`${r.element} ${r.material.name} ${r.material.epdSource}`.toLowerCase().includes(q)) return false;
        return true;
      }),
    );
  }, [rows, layer, materialId, reuse, flags, query]);

  const filteredKg = filtered.reduce((s, r) => s + r.gwpTotalKg, 0);
  const active = query !== '' || layer !== null || materialId !== null || reuse !== null || flags.length > 0;
  const clear = () => {
    setQuery('');
    setReuse(null);
    setFlags([]);
    onLayer(null);
    onMaterial(null);
  };

  const columns: DataColumn<PassportRow>[] = [
    {
      id: 'element',
      header: 'Позиција',
      width: '22%',
      cell: (r) => (
        <div className="min-w-0">
          <div className="font-medium text-ink">{r.element}</div>
          {r.reused && (
            <Badge tone="good" size="sm" className="mt-1">
              поново употребљено
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'material',
      header: 'Материјал',
      width: '22%',
      cell: (r) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpenMaterial(r.materialId)}
            className="min-h-6 text-left text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            {r.material.name}
          </button>
          <div className="hidden text-xs text-muted md:block">{r.material.epdSource}</div>
        </div>
      ),
    },
    {
      id: 'qty',
      header: 'Количина · GWP',
      align: 'right',
      mobileLabel: 'Количина · GWP A1–A3',
      cell: (r) => (
        <div className="tabular">
          <div>{formatQuantity(r.quantity, r.material.unit)}</div>
          <div className="text-xs text-muted">{formatGwp(r.material)}</div>
        </div>
      ),
    },
    {
      id: 'total',
      header: 'Укупно',
      align: 'right',
      hideOnMobile: true,
      cell: (r) => (
        <div className="tabular">
          <div className="font-medium">{tonnes(r.gwpTotalKg)}</div>
          <div className="text-xs text-muted">{formatPct((r.gwpTotalKg / total) * 100, { decimals: r.gwpTotalKg / total < 0.01 ? 1 : 0 })}</div>
        </div>
      ),
    },
    {
      id: 'origin',
      header: 'Порекло',
      cell: (r) => (
        <div className="min-w-0">
          <div>{r.material.originCity}</div>
          <div className="tabular text-xs text-muted">{formatKm(r.material.distanceKm)}</div>
        </div>
      ),
    },
    {
      id: 'circ',
      header: 'Циркуларност',
      mobileLabel: 'Поновна употреба и рециклат',
      cell: (r) => (
        <div className="min-w-0">
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Badge size="sm" tone={REUSE_POTENTIAL_TONE[r.material.reusePotential]}>
              {REUSE_POTENTIAL_LABELS[r.material.reusePotential]}
            </Badge>
            {r.demountable && (
              <span className="inline-flex items-center gap-1 text-xs text-good" title="Пројектовано за демонтажу">
                <Puzzle className="size-4" aria-label="Растављиво" />
                <span className="md:sr-only">растављиво</span>
              </span>
            )}
          </span>
          <div className="mt-1 text-xs text-muted">Рециклирано: {formatPct(r.material.recycledPct, { decimals: 0 })}</div>
        </div>
      ),
    },
  ];

  return (
    <Card
      id="pasos"
      title="Материјални пасош"
      subtitle={`${positionsCount(rows.length)} · ${formatCarbon(total, 'total')} уграђеног угљеника (A1–A3)`}
      className="scroll-mt-20"
    >
      <div className="flex flex-col gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Претражи позиције и материјале…" />
        <FilterChips
          ariaLabel="Слој зграде"
          options={layersPresent.map((l) => ({ value: l, label: BUILDING_LAYER_LABELS[l], count: rows.filter((r) => r.layer === l).length }))}
          value={layer}
          onChange={onLayer}
        />
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
          <FilterChips
            ariaLabel="Потенцијал поновне употребе"
            options={(['high', 'medium', 'low'] as const).map((v) => ({ value: v, label: `Поновна употреба: ${REUSE_POTENTIAL_LABELS[v].toLowerCase()}` }))}
            value={reuse}
            onChange={setReuse}
          />
          <FilterChips
            multiple
            ariaLabel="Својства"
            options={[
              { value: 'local' as Flag, label: `Локално < ${LOCAL_KM} km` },
              { value: 'demountable' as Flag, label: 'Растављиво' },
              ...(hasReused ? [{ value: 'reused' as Flag, label: 'Поново употребљено' }] : []),
            ]}
            value={flags}
            onChange={setFlags}
          />
        </div>
        {materialId && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Филтер из графикона:</span>
            <button
              type="button"
              onClick={() => onMaterial(null)}
              className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-clay bg-clay-soft px-3 text-clay"
            >
              <span className="truncate">{materialName}</span>
              <X className="size-3.5 shrink-0" aria-label="Уклони филтер" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
        <span aria-live="polite">
          {active ? (
            <>
              Приказано {formatNumber(filtered.length, 0)} од {formatNumber(rows.length, 0)} · <span className="tabular text-ink">{formatCarbon(filteredKg, 'total')}</span>{' '}
              ({formatPct((filteredKg / total) * 100, { decimals: 0 })})
            </>
          ) : (
            <>Тапните материјал за детаље и алтернативе.</>
          )}
        </span>
        {active && (
          <Button size="sm" variant="ghost" onClick={clear}>
            Очисти
          </Button>
        )}
      </div>

      <DataList
        className="mt-2"
        rows={filtered}
        rowKey={passportRowKey}
        caption="Материјални пасош"
        primaryColumn="element"
        columns={columns}
        groupBy={(r) => r.layer}
        groupHeader={(key, group) => (
          <span className="flex items-baseline justify-between gap-3">
            <span>{BUILDING_LAYER_LABELS[key as BuildingLayer]}</span>
            <span className="tabular font-normal text-muted">
              {positionsCount(group.length)} · {tonnes(group.reduce((s, r) => s + r.gwpTotalKg, 0))}
            </span>
          </span>
        )}
        mobileAside={(r) => <span className="tabular text-sm font-medium text-ink">{tonnes(r.gwpTotalKg)}</span>}
        emptyText="Нема позиција за изабране филтере."
      />
    </Card>
  );
}
