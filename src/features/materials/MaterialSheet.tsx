import { Link } from 'react-router';
import { ArrowRight, Leaf, Puzzle } from 'lucide-react';
import { paths } from '@/components/layout/navigation';
import { Badge, Callout, KeyValue, Sheet } from '@/components/ui';
import { getMaterial, materialsForProject, usageForMaterial } from '@/data';
import { BUILDING_LAYER_LABELS, MATERIAL_CATEGORY_LABELS, REUSE_POTENTIAL_LABELS, REUSE_POTENTIAL_TONE } from '@/domain/labels';
import type { Material } from '@/domain/types';
import { formatCarbon, formatNumber, formatPct, formatSigned } from '@/lib/format';
import { alternativesFor, formatGwp, formatKm, formatQuantity, gwpUnit, LOCAL_KM, massKgPerUnit, positionsCount, projectsCount } from './materialsLogic';

/** Dry wood ≈ 50 % carbon → 1,83 kgCO₂ stored per kg of bio-based material (orientation only). */
const BIOGENIC_KG_CO2_PER_KG = 1.83;

export interface MaterialSheetProps {
  /** Material to show; `null` closes the sheet. */
  materialId: string | null;
  /** Called with another material id (alternatives) or `null` (close). */
  onChange: (materialId: string | null) => void;
  /** Inside a project: show usage and swap deltas for that project. Without it: usage across all projects. */
  projectId?: string;
}

const H = ({ children }: { children: string }) => <h3 className="eyebrow mb-2">{children}</h3>;

/**
 * Material detail (EPD data, origin, usage, lower-GWP alternatives). Shared by the project passport and the EPD library.
 * @example <MaterialSheet materialId={id} onChange={setId} projectId={project.id} />
 */
export function MaterialSheet({ materialId, onChange, projectId }: MaterialSheetProps) {
  const material = getMaterial(materialId ?? undefined);
  return (
    <Sheet
      open={material !== undefined}
      onClose={() => onChange(null)}
      title={material?.name ?? ''}
      subtitle={material ? `${MATERIAL_CATEGORY_LABELS[material.category]} · декларисана јединица ${material.unit}` : undefined}
      width="md"
    >
      {material && <SheetBody material={material} projectId={projectId} onChange={onChange} />}
    </Sheet>
  );
}

function SheetBody({ material, projectId, onChange }: { material: Material; projectId?: string; onChange: (id: string | null) => void }) {
  const projectRows = projectId ? materialsForProject(projectId).filter((r) => r.materialId === material.id) : [];
  const projectQty = projectRows.reduce((s, r) => s + r.quantity, 0);
  const projectKg = projectRows.reduce((s, r) => s + r.gwpTotalKg, 0);
  const usage = projectId ? [] : usageForMaterial(material.id);
  const alternatives = alternativesFor(material, projectId && projectQty > 0 ? projectQty : undefined);
  const local = material.distanceKm < LOCAL_KM;
  const storedKgCo2PerUnit = material.bioBased ? massKgPerUnit(material) * BIOGENIC_KG_CO2_PER_KG : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1.5">
        <Badge tone={REUSE_POTENTIAL_TONE[material.reusePotential]} dot>
          Поновна употреба: {REUSE_POTENTIAL_LABELS[material.reusePotential].toLowerCase()}
        </Badge>
        {material.bioBased && (
          <Badge tone="good" icon={Leaf}>
            Биобазиран
          </Badge>
        )}
        {local && <Badge tone="accent">Локално (&lt; {LOCAL_KM} km)</Badge>}
        {material.recycledPct > 0 && <Badge>{formatNumber(material.recycledPct, 0)} % рециклата</Badge>}
      </div>

      <section>
        <H>EPD подаци</H>
        <KeyValue
          items={[
            { label: 'GWP A1–A3', value: <span className="tabular font-medium">{formatGwp(material)}</span>, hint: 'фосилни, EN 15804+A2' },
            { label: 'EPD извор', value: material.epdSource },
            { label: 'Добављач', value: material.supplier ?? '—' },
            { label: 'Порекло', value: material.originCity, hint: `${formatKm(material.distanceKm)} до Београда` },
            { label: 'Рециклирани садржај', value: formatPct(material.recycledPct, { decimals: 0 }) },
          ]}
        />
      </section>

      {material.note && <Callout tone="info">{material.note}</Callout>}

      {material.bioBased && (
        <Callout tone="good" icon={Leaf} title="Биогени угљеник">
          Дрво и друга биомаса ускладиштају угљеник током раста. GWP у библиотеци је <strong>без кредита</strong> за тај угљеник (конвенција фирме по
          стандарду за LCA). Оријентационо је ускладиштено око {formatNumber(storedKgCo2PerUnit, 0)} kgCO₂ по {material.unit} — приказује се одвојено и не
          улази у A1–A3.
        </Callout>
      )}

      <section>
        <H>{projectId ? 'Употреба у овом пројекту' : 'Употреба у пројектима'}</H>
        {projectId ? (
          projectRows.length === 0 ? (
            <p className="text-sm text-muted">Материјал се не користи у пасошу овог пројекта.</p>
          ) : (
            <>
              <ul className="divide-y divide-line rounded-xl border border-line">
                {projectRows.map((r) => (
                  <li key={`${r.layer}|${r.element}`} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <div className="text-ink">{r.element}</div>
                      <div className="text-xs text-muted">{BUILDING_LAYER_LABELS[r.layer]}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="tabular text-ink">{formatQuantity(r.quantity, material.unit)}</div>
                      <div className="tabular text-xs text-muted">{formatCarbon(r.gwpTotalKg, 'total')}</div>
                    </div>
                  </li>
                ))}
              </ul>
              {projectRows.length > 1 && (
                <p className="mt-2 text-right text-sm text-muted">
                  Укупно: <span className="tabular font-medium text-ink">{formatQuantity(projectQty, material.unit)}</span> ·{' '}
                  <span className="tabular font-medium text-ink">{formatCarbon(projectKg, 'total')}</span>
                </p>
              )}
            </>
          )
        ) : usage.length === 0 ? (
          <p className="text-sm text-muted">Још се не користи ни у једном пасошу пројекта.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {usage.map((u) => (
              <li key={u.project.id}>
                <Link
                  to={paths.project(u.project.id, 'materijali')}
                  className="flex min-h-11 items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-surface-2/60"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">{u.project.shortName}</div>
                    <div className="text-xs text-muted">
                      {formatQuantity(u.quantity, material.unit)} · {positionsCount(u.rows.length)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="tabular text-xs text-muted">{formatCarbon(u.gwpTotalKg, 'total')}</span>
                    <ArrowRight className="size-4 text-muted" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!projectId && usage.length > 0 && <p className="mt-2 text-xs text-muted">Користи се у {projectsCount(usage.length)}.</p>}
      </section>

      <section>
        <H>Алтернативе</H>
        {alternatives.items.length === 0 ? (
          <p className="text-sm text-muted">
            У библиотеци нема функционално замењивог материјала са нижим GWP по истој јединици ({gwpUnit(material)}).
          </p>
        ) : (
          <>
            <p className="mb-2 text-xs text-muted">
              {alternatives.group}: материјали са нижим GWP по истој јединици. Δ у пројекту претпоставља замену целе количине.
            </p>
            <ul className="flex flex-col gap-2">
              {alternatives.items.map((a) => (
                <li key={a.material.id} className="rounded-xl border border-line p-3">
                  <button
                    type="button"
                    onClick={() => onChange(a.material.id)}
                    className="flex min-h-9 w-full items-start justify-between gap-2 text-left text-sm font-medium text-ink hover:underline"
                  >
                    <span className="min-w-0">{a.material.name}</span>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                  </button>
                  <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                    <div>
                      <dt className="text-[0.7rem] text-muted">Δ GWP по јединици</dt>
                      <dd className="tabular font-medium text-good">
                        {formatSigned(a.deltaPerUnit)} {gwpUnit(material)} <span className="font-normal">({formatPct(a.deltaPct, { decimals: 0 })})</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.7rem] text-muted">{a.deltaTotalKg !== undefined ? 'Δ у пројекту' : 'GWP A1–A3'}</dt>
                      <dd className="tabular font-medium text-ink">
                        {a.deltaTotalKg !== undefined ? formatCarbon(a.deltaTotalKg, 'total') : formatGwp(a.material)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge size="sm">{formatKm(a.material.distanceKm)}</Badge>
                    <Badge size="sm" tone={REUSE_POTENTIAL_TONE[a.material.reusePotential]} icon={Puzzle}>
                      {REUSE_POTENTIAL_LABELS[a.material.reusePotential]}
                    </Badge>
                    {a.material.note && <span className="min-w-0 text-xs text-muted">{a.material.note}</span>}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">Нижи GWP није једини критеријум: пре замене проверити пожарну класу, носивост и рок испоруке.</p>
          </>
        )}
      </section>
    </div>
  );
}
