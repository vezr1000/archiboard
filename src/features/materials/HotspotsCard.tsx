import { BarChart } from '@/components/charts';
import { Card } from '@/components/ui';
import { BUILDING_LAYER_LABELS } from '@/domain/labels';
import type { BuildingLayer, Tone } from '@/domain/types';
import { formatNumber, formatPct } from '@/lib/format';
import { layerTotals, topMaterials, type PassportRow } from './materialsLogic';

interface HotspotsCardProps {
  rows: PassportRow[];
  layer: BuildingLayer | null;
  materialId: string | null;
  onLayer: (layer: BuildingLayer | null) => void;
  onMaterial: (materialId: string | null) => void;
}

const label = (kg: number, total: number) => `${formatNumber(kg / 1000, kg >= 100_000 ? 0 : 1)} t · ${formatPct((kg / total) * 100, { decimals: 0 })}`;

/** „Жаришта угљеника“: carbon by building layer and by top-8 materials. Bars filter the passport below. */
export function HotspotsCard({ rows, layer, materialId, onLayer, onMaterial }: HotspotsCardProps) {
  const total = rows.reduce((s, r) => s + r.gwpTotalKg, 0);
  const layers = layerTotals(rows);
  const materials = topMaterials(rows, 8);
  const top8Share = materials.reduce((s, m) => s + m.kg, 0) / total;
  const tone = (selected: boolean, anySelected: boolean): Tone => (selected ? 'clay' : anySelected ? 'neutral' : 'accent');

  return (
    <Card
      title="Жаришта угљеника"
      subtitle="Где настаје уграђени угљеник A1–A3 (t CO₂e). Додирните траку да филтрирате пасош испод."
      id="zarista"
    >
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="min-w-0">
          <h4 className="eyebrow mb-3">По слојевима</h4>
          <BarChart
            title="Уграђени угљеник по слојевима зграде"
            data={layers.map((l) => ({
              id: l.layer,
              label: BUILDING_LAYER_LABELS[l.layer],
              value: l.kg,
              valueLabel: label(l.kg, total),
              tone: tone(layer === l.layer, layer !== null),
            }))}
            onBarClick={(d) => onLayer(layer === d.id ? null : (d.id as BuildingLayer))}
          />
        </div>
        <div className="min-w-0">
          <h4 className="eyebrow mb-3">
            Првих {formatNumber(materials.length, 0)} материјала <span className="font-normal normal-case tracking-normal text-muted">· {formatPct(top8Share * 100, { decimals: 0 })} укупног</span>
          </h4>
          <BarChart
            title="Првих осам материјала по уграђеном угљенику"
            data={materials.map((m) => ({
              id: m.material.id,
              label: m.material.name,
              value: m.kg,
              valueLabel: label(m.kg, total),
              tone: tone(materialId === m.material.id, materialId !== null),
            }))}
            onBarClick={(d) => onMaterial(materialId === d.id ? null : d.id)}
          />
        </div>
      </div>
    </Card>
  );
}
