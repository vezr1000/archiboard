import { Droplets, Plug, Wind } from 'lucide-react';
import { WindRose } from '@/components/charts';
import { Badge, Callout, Card, DataList, KeyValue, ProgressBar } from '@/components/ui';
import type { DataColumn } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import type { Project, SiteInfo } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatArea, formatNumber, formatSigned } from '@/lib/format';
import { assessHazards, evaluateUrbanParam, windInsight, type UrbanParamView } from './siteLogic';
import { SiteMap } from './SiteMap';

/* ------------------------------------------------------------------------------------------------ */

/** Site card: stylised plan + address, parcel, plan, area and utilities. */
export function SiteCard({ project, site }: { project: Project; site: SiteInfo }) {
  const items = [
    { label: 'Адреса', value: project.address },
    { label: 'Катастарска парцела', value: project.parcel },
    { label: 'План', value: project.plan },
    ...(project.siteAreaM2 ? [{ label: 'Површина парцеле', value: <span className="tabular">{formatArea(project.siteAreaM2, 'auto')}</span> }] : []),
  ];
  return (
    <Card title="Локација" subtitle={project.city} className="h-full">
      <SiteMap project={project} site={site} />
      <div className="mt-4">
        <KeyValue items={items} />
      </div>
      <div className="mt-4 border-t border-line pt-4">
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Plug className="size-4 text-muted" aria-hidden />
          Комунална опремљеност
        </h4>
        <ul className="flex flex-col gap-1.5">
          {site.utilities.map((u) => (
            <li key={u} className="flex gap-2 text-sm leading-snug text-ink">
              <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              <span className="min-w-0">{u}</span>
            </li>
          ))}
        </ul>
      </div>
      {site.contextNote && <p className="mt-4 text-sm leading-relaxed text-muted">{site.contextNote}</p>}
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

const tile = 'min-w-0 rounded-xl border border-line bg-surface-2/40 p-3';

function ClimateTile({ label, value, unit, hint }: { label: string; value: string; unit: string; hint: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[0.8rem] leading-snug text-muted">{label}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
        <span className="tabular font-display text-xl font-semibold leading-tight text-ink">{value}</span>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      <div className="mt-1 text-xs leading-snug text-muted">{hint}</div>
    </div>
  );
}

/** Climate: degree days, irradiation, design temperatures, UHI, air quality and the wind rose with its reading. */
export function ClimateCard({ project, site }: { project: Project; site: SiteInfo }) {
  const c = site.climate;
  const wind = windInsight(site);
  return (
    <Card title="Климатски подаци" subtitle={`Орјентационе вредности за ${project.city}`} className="h-full">
      <div className="flex flex-col gap-4">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <li className={tile}>
            <ClimateTile label="Степен-дани грејања" value={formatNumber(c.hdd, 0)} unit="K·дан/год" hint="грејна сезона (HDD)" />
          </li>
          <li className={tile}>
            <ClimateTile label="Степен-дани хлађења" value={formatNumber(c.cdd, 0)} unit="K·дан/год" hint="летње хлађење (CDD)" />
          </li>
          <li className={tile}>
            <ClimateTile label="Сунчево зрачење" value={formatNumber(c.solarKWhM2a, 0)} unit="kWh/m²a" hint="глобално, хоризонтално" />
          </li>
          <li className={tile}>
            <ClimateTile label="Прорачунска темп. зими" value={formatNumber(c.designTempWinter, 1)} unit="°C" hint="спољна температура" />
          </li>
          <li className={tile}>
            <ClimateTile label="Прорачунска темп. лети" value={formatNumber(c.designTempSummer, 1)} unit="°C" hint="спољна температура" />
          </li>
          <li className={tile}>
            <ClimateTile
              label="Урбано острво топлоте"
              value={formatSigned(c.uhiIntensity, 1)}
              unit="°C"
              hint={c.uhiIntensity >= 3 ? 'јако — лети ноћу' : c.uhiIntensity >= 2 ? 'умерено — лети ноћу' : 'благо — лети ноћу'}
            />
          </li>
        </ul>
        <div className="grid gap-4 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-start">
          {wind && (
            <div className="min-w-0 rounded-xl border border-line bg-surface-2/40 p-3">
              <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Wind className="size-4 text-muted" aria-hidden />
                Ружа ветрова
              </h4>
              <WindRose title={`Ружа ветрова — ${project.city}`} data={c.windRose} highlight={wind.highlight} size={230} />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-3">
            {wind && (
              <Callout tone="clay" icon={Wind} title="Ветар и пројекат">
                {wind.sentence}
                {c.prevailingWindNote && <span className="mt-1 block text-xs text-muted">{c.prevailingWindNote}</span>}
              </Callout>
            )}
            <Callout tone="info" icon={Droplets} title="Квалитет ваздуха">
              {c.airQualityNote}
            </Callout>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** Hazards: flood, seismic, soil and groundwater with status chips and a short design implication each. */
export function HazardsCard({ site }: { site: SiteInfo }) {
  const rows = assessHazards(site.hazards);
  return (
    <Card title="Хазарди" subtitle="Шта то значи за пројекат" className="h-full">
      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.id} className={cn('min-w-0 rounded-xl border border-l-[3px] border-line bg-surface-2/40 p-3', TONE_CLASSES[r.tone].border)}>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="text-xs text-muted">{r.label}</div>
              <Badge tone={r.tone} size="sm" dot>
                {r.status}
              </Badge>
            </div>
            <div className="mt-1 text-sm font-medium leading-snug text-ink">{r.value}</div>
            <p className="mt-1.5 text-sm leading-snug text-muted">{r.implication}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

function Utilisation({ v }: { v: UrbanParamView }) {
  const p = v.param;
  const max = Math.max(p.limit, p.design) * 1.15;
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <ProgressBar
        value={p.design}
        max={max}
        target={p.limit}
        tone={v.tone}
        size="sm"
        ariaLabel={`${p.label}: искоришћење ${formatNumber(v.utilisationPct, 0)} %`}
        className="min-w-0 flex-1"
      />
      <span className="tabular w-11 shrink-0 text-right text-xs text-muted">{formatNumber(v.utilisationPct, 0)} %</span>
    </div>
  );
}

/** Urban parameters: limit vs design with comparator, utilisation bar and status (margin < 5 % = „на граници“). */
export function UrbanParamsCard({ site }: { site: SiteInfo }) {
  const views = site.urbanParams.map(evaluateUrbanParam);
  const count = (s: UrbanParamView['status']) => views.filter((v) => v.status === s).length;
  const columns: DataColumn<UrbanParamView>[] = [
    { id: 'param', header: 'Параметар', cell: (v) => <span className="font-medium">{v.param.label}</span>, width: '30%' },
    { id: 'limit', header: 'Ограничење', cell: (v) => <span className="tabular whitespace-nowrap">{v.limitText}</span>, mobileLabel: 'Ограничење' },
    { id: 'design', header: 'Пројектовано', cell: (v) => <span className="tabular whitespace-nowrap font-medium">{v.designText}</span>, mobileLabel: 'Пројектовано' },
    { id: 'use', header: 'Искоришћење', cell: (v) => <Utilisation v={v} />, width: '28%', mobileLabel: null },
    {
      id: 'status',
      header: 'Статус',
      cell: (v) => (
        <Badge tone={v.tone} dot size="sm">
          {v.statusLabel}
        </Badge>
      ),
      hideOnMobile: true,
    },
  ];
  return (
    <Card
      title="Урбанистички параметри"
      subtitle="Ограничења плана и локацијских услова наспрам пројектованих вредности"
      action={
        <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
          {count('pass') > 0 && <Badge tone="good" size="sm">{count('pass')} усклађено</Badge>}
          {count('edge') > 0 && <Badge tone="warn" size="sm">{count('edge')} на граници</Badge>}
          {count('fail') > 0 && <Badge tone="bad" size="sm">{count('fail')} није испуњено</Badge>}
        </div>
      }
    >
      <DataList
        rows={views}
        rowKey={(v) => v.param.id}
        caption="Урбанистички параметри"
        columns={columns}
        mobileAside={(v) => (
          <Badge tone={v.tone} dot size="sm">
            {v.statusLabel}
          </Badge>
        )}
      />
      <p className="mt-3 text-xs text-muted">„На граници“ = маргина до ограничења мања од 5 %. Маркер на траци означава ограничење.</p>
    </Card>
  );
}
