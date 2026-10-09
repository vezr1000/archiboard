/**
 * `/#/_ui` — hidden component showcase. Renders every primitive and chart with sample data so the orchestrator and
 * later build steps can see the component library in light and dark. Not linked from navigation.
 * Keep it in sync when adding primitives (and update docs/COMPONENTS.md).
 */
import { useState, type ReactNode } from 'react';
import { Download, FileText, Plus, Search, Settings2, Sparkles } from 'lucide-react';
import { AiBadge, StreamingText, ThinkingDots, useScriptedRun } from '@/components/ai';
import {
  BarChart,
  DivergingBars,
  GroupedBars,
  HeatMap5x5,
  LineBand,
  PhaseTimeline,
  QuadrantGrid,
  RadarChart,
  RingScore,
  Sparkline,
  STAKEHOLDER_QUADRANTS,
  StackedBar,
  WindRose,
} from '@/components/charts';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import {
  AnimatedNumber,
  Avatar,
  AvatarStack,
  Badge,
  Button,
  Callout,
  Card,
  DataList,
  EmptyState,
  EnergyClassBadge,
  FilterChips,
  HealthBadge,
  IconButton,
  KeyValue,
  Modal,
  PageHeader,
  PhasePill,
  ProgressBar,
  SearchInput,
  SectionHeader,
  Segmented,
  Select,
  Sheet,
  Skeleton,
  Slider,
  Stat,
  StatusDot,
  Tabs,
  Toggle,
  Tooltip,
} from '@/components/ui';
import { getProject, people } from '@/data';
import { ATTITUDE_TONE, FACADE_LABELS, PHASES } from '@/domain/labels';
import type { FacadeType, Phase, StakeholderAttitude, Tone, WindRoseEntry } from '@/domain/types';
import { formatArea, formatCarbon, formatDate, formatEur, formatNumber, formatPct, formatRelative } from '@/lib/format';

/* ---------- sample data ---------- */

const TONES: Tone[] = ['neutral', 'accent', 'good', 'warn', 'bad', 'info', 'clay'];

const SWATCHES = [
  'paper', 'surface', 'surface-2', 'ink', 'muted', 'line', 'line-strong', 'accent', 'accent-soft', 'clay', 'clay-soft',
  'good', 'good-soft', 'warn', 'warn-soft', 'bad', 'bad-soft', 'info', 'info-soft', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
];

const WIND: WindRoseEntry[] = [
  { dir: 'N', freq: 6, maxSpeed: 12 }, { dir: 'NNE', freq: 3, maxSpeed: 10 }, { dir: 'NE', freq: 3, maxSpeed: 9 },
  { dir: 'ENE', freq: 4, maxSpeed: 11 }, { dir: 'E', freq: 7, maxSpeed: 15 }, { dir: 'ESE', freq: 17, maxSpeed: 25 },
  { dir: 'SE', freq: 13, maxSpeed: 22 }, { dir: 'SSE', freq: 4, maxSpeed: 12 }, { dir: 'S', freq: 3, maxSpeed: 10 },
  { dir: 'SSW', freq: 2, maxSpeed: 9 }, { dir: 'SW', freq: 3, maxSpeed: 10 }, { dir: 'WSW', freq: 4, maxSpeed: 12 },
  { dir: 'W', freq: 8, maxSpeed: 16 }, { dir: 'WNW', freq: 9, maxSpeed: 18 }, { dir: 'NW', freq: 8, maxSpeed: 17 },
  { dir: 'NNW', freq: 5, maxSpeed: 13 },
];

const RISKS = [
  { id: 'r1', probability: 4, impact: 4, label: 'Кашњење CLT испоруке' },
  { id: 'r2', probability: 3, impact: 5, label: 'Сагласност Завода' },
  { id: 'r3', probability: 2, impact: 3, label: 'Раст цене челика' },
  { id: 'r4', probability: 2, impact: 3, label: 'Подземне воде' },
  { id: 'r5', probability: 5, impact: 2, label: 'Кошава на скели' },
  { id: 'r6', probability: 1, impact: 4, label: 'Измена ПДР' },
];

const STAKEHOLDERS: Array<{ id: string; label: string; x: number; y: number; attitude: StakeholderAttitude }> = [
  { id: 's1', label: 'Инвеститор', x: 5, y: 5, attitude: 'supportive' },
  { id: 's2', label: 'Секретаријат за урбанизам', x: 3, y: 5, attitude: 'neutral' },
  { id: 's3', label: 'Завод за заштиту споменика', x: 2, y: 4, attitude: 'neutral' },
  { id: 's4', label: 'Станари суседних зграда', x: 5, y: 2, attitude: 'opposed' },
  { id: 's5', label: 'ЕПС Дистрибуција', x: 2, y: 3, attitude: 'neutral' },
  { id: 's6', label: 'Банка (зелени кредит)', x: 4, y: 3, attitude: 'supportive' },
  { id: 's7', label: 'Градска општина', x: 3, y: 2, attitude: 'supportive' },
];

const DOCS = [
  { id: 'd1', title: 'Елаборат енергетске ефикасности', type: 'Елаборат ЕЕ', version: 'v2.1', status: 'review' as const, updated: '2026-10-02' },
  { id: 'd2', title: 'LCA извештај (A1–C4)', type: 'LCA извештај', version: 'v1.3', status: 'draft' as const, updated: '2026-09-28' },
  { id: 'd3', title: 'Локацијски услови', type: 'Локацијски услови', version: 'Р1', status: 'approved' as const, updated: '2026-03-14' },
];
const DOC_STATUS: Record<'draft' | 'review' | 'approved', { label: string; tone: Tone }> = {
  draft: { label: 'У изради', tone: 'neutral' },
  review: { label: 'На ревизији', tone: 'info' },
  approved: { label: 'Одобрено', tone: 'good' },
};

const AI_ANSWER =
  'Према Правилнику о енергетској ефикасности зграда, нова стамбена зграда мора да оствари најмање енергетски разред C.\n\n' +
  'За усклађеност са EU таксономијом потребна је примарна енергија најмање 10% испод NZEB захтева, што за Савски кеј значи циљ од око 50 kWh/m²a.';

/* ---------- helpers ---------- */

function Block({ title, children, note }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <SectionHeader title={title} subtitle={note} />
      {children}
    </section>
  );
}

const grid2 = 'grid grid-cols-1 gap-4 md:grid-cols-2';
const grid3 = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

/* ---------- page ---------- */

export function UiShowcasePage() {
  const project = getProject('savski-kej');
  const [tab, setTab] = useState<'a' | 'b' | 'c'>('a');
  const [seg, setSeg] = useState<'min' | 'dobra' | 'top'>('dobra');
  const [q, setQ] = useState('');
  const [chip, setChip] = useState<string | null>('open');
  const [chips, setChips] = useState<string[]>(['beton']);
  const [cm, setCm] = useState(20);
  const [facade, setFacade] = useState<FacadeType>('ventilisana');
  const [toggle, setToggle] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [modal, setModal] = useState(false);
  const [phase, setPhase] = useState<Phase>('pgd');
  const [cell, setCell] = useState<{ probability: number; impact: number } | null>(null);
  const [sel, setSel] = useState<string | undefined>();
  const run = useScriptedRun({ thinkingMs: 1400 });

  return (
    <>
      <PageHeader
        eyebrow="Развој · скривено"
        title="Библиотека компоненти"
        subtitle="Сви примитиви и графикони са пробним подацима. Проверите у светлој и тамној теми, на 375 px и на десктопу."
        actions={<Button variant="secondary" icon={Settings2} to="/">Портфолио</Button>}
      />

      <Block title="Боје (токени)" note="Класе bg-…, text-…, border-…; у SVG var(--име)">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {SWATCHES.map((s) => (
            <div key={s} className="min-w-0">
              <div className="h-10 rounded-lg border border-line" style={{ background: `var(--${s})` }} />
              <div className="mt-1 truncate text-[0.7rem] text-muted">{s}</div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Типографија и формати">
        <Card>
          <div className="eyebrow">Eyebrow · ознака</div>
          <h1 className="mt-1 font-display text-4xl">Савски кеј — блок Ц</h1>
          <h2 className="mt-2 font-display text-2xl">Наслов секције (Source Serif 4)</h2>
          <p className="mt-2 max-w-2xl text-ink">
            Основни текст у фонту Inter. Ђурђевак, љубичица, њива, ћилим, џеп — српска ћирилица са локалним облицима
            <span className="italic"> (курзив: б г д п т)</span>.
          </p>
          <p className="mt-1 text-sm text-muted">Секундарни текст у muted боји.</p>
          <KeyValue
            className="mt-4"
            columns={2}
            items={[
              { label: 'formatNumber(18400)', value: formatNumber(18400) },
              { label: 'formatNumber(0.349, 2)', value: formatNumber(0.349, 2) },
              { label: 'formatArea(18400)', value: formatArea(18400) },
              { label: "formatArea(42000, 'ha')", value: formatArea(42000, 'ha') },
              { label: 'formatCarbon(412)', value: formatCarbon(412) },
              { label: "formatCarbon(18400, 'total')", value: formatCarbon(18400, 'total') },
              { label: 'formatEur(31500000)', value: formatEur(31_500_000) },
              { label: 'formatEur(31500000, true)', value: formatEur(31_500_000, true) },
              { label: 'formatPct(-12.34, {signed})', value: formatPct(-12.34, { signed: true }) },
              { label: "formatDate('2026-10-22')", value: formatDate('2026-10-22') },
              { label: "formatDate(…, 'weekday')", value: formatDate('2026-10-22', 'weekday') },
              { label: "formatRelative('2026-10-22')", value: formatRelative('2026-10-22') },
            ]}
          />
        </Card>
      </Block>

      <Block title="Дугмад">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Button icon={Plus}>Сачувај као варијанту</Button>
            <Button variant="secondary">Секундарно</Button>
            <Button variant="ghost">Дух</Button>
            <Button variant="danger">Обриши</Button>
            <Button size="sm" variant="secondary" icon={Download}>Мало</Button>
            <Button size="lg">Велико</Button>
            <Button disabled>Онемогућено</Button>
            <IconButton icon={Search} label="Претрага" />
            <IconButton icon={Plus} label="Додај" variant="secondary" />
            <IconButton icon={Sparkles} label="АИ" variant="primary" />
          </div>
        </Card>
      </Block>

      <Block title="Ознаке и статуси">
        <Card>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <Badge key={t} tone={t} dot>
                {t}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TONES.map((t) => (
              <Badge key={t} tone={t} variant="outline" size="sm">
                {t}
              </Badge>
            ))}
            <Badge tone="info" icon={FileText}>v2.1</Badge>
            <Badge tone="accent" variant="solid">DGNB Gold</Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <HealthBadge health="on-track" />
            <HealthBadge health="at-risk" />
            <HealthBadge health="off-track" long />
            <PhasePill phase="pgd" />
            <PhasePill phase="idr" long />
            <StatusDot tone="good" label="Усклађено" />
            <StatusDot tone="bad" label="Неусклађено" pulse />
            <AiBadge />
            <AiBadge size="sm" />
            <Tooltip content="Индекс заузетости = површина под објектом / површина парцеле" underline>
              ИЗ 0,49
            </Tooltip>
          </div>
        </Card>
      </Block>

      <Block title="Картице и показатељи">
        <div className={grid3}>
          <Card title="Уграђени угљеник" subtitle="A1–A3, ПГД" action={<Badge tone="warn">+12%</Badge>}>
            <Stat
              label="Тренутно"
              value={358}
              unit="kgCO₂e/m²"
              delta={11.9}
              direction="lower-better"
              deltaLabel="у односу на циљ"
              aside={<Sparkline title="Тренд" values={[305, 330, 358]} target={320} tone="warn" />}
            />
          </Card>
          <Card title="Оперативна енергија" eyebrow="KPI">
            <Stat label="Финална енергија" value={38} unit="kWh/m²a" delta={-5} direction="lower-better" deltaLabel="од ИДР" />
          </Card>
          <Card title="Портфолио">
            <Stat label="Укупна БРГП" value={64_300} unit="m²" size="lg" hint="6 активних пројеката" />
          </Card>
        </div>
        <div className={`${grid2} mt-4`}>
          <Card title="Траке напретка">
            <div className="flex flex-col gap-4">
              <ProgressBar label="Спремност за Г2" valueLabel="9 / 11" value={9} max={11} />
              <ProgressBar label="Угљенични буџет" valueLabel="358 / 320" value={358} max={450} target={320} tone="warn" />
              <ProgressBar value={0.7} tone="clay" size="md" ariaLabel="Фаза" />
              <ProgressBar value={0.3} tone="good" size="xs" ariaLabel="Мало" />
            </div>
          </Card>
          <Card title="Чињенице" subtitle="KeyValue">
            <KeyValue
              items={[
                { label: 'Адреса', value: project?.address ?? '—' },
                { label: 'Парцела', value: project?.parcel ?? '—' },
                { label: 'План', value: project?.plan ?? '—' },
                { label: 'БРГП', value: formatArea(18_400), hint: project?.floors },
              ]}
            />
          </Card>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <Callout tone="warn" title="Уграђени угљеник 12% изнад циља">Након промене фасаде са дрвене облоге на алуминијумске панеле.</Callout>
          <Callout tone="info" title="Савет" action={<Button size="sm" variant="secondary">Отвори</Button>}>
            Г2 захтева LCA извештај који покрива фазе A1–C4.
          </Callout>
          <Callout tone="good">Сви услови са Г1 су затворени.</Callout>
        </div>
      </Block>

      <Block title="Картице (табови), сегменти, филтери">
        <Card>
          <Tabs
            ariaLabel="Пример"
            items={[
              { id: 'a', label: 'Преглед' },
              { id: 'b', label: 'Документа', count: 11 },
              { id: 'c', label: 'Заинтересоване стране' },
            ]}
            value={tab}
            onChange={setTab}
          />
          <p className="mt-3 text-sm text-muted">Изабрано: {tab}. Route-варијанта (RouteTabs) је у заглављу пројекта.</p>
          <div className="mt-4">
            <Segmented
              ariaLabel="Ниво амбиције"
              options={[
                { value: 'min', label: 'Минимум' },
                { value: 'dobra', label: 'Добра пракса' },
                { value: 'top', label: 'Предводник' },
              ]}
              value={seg}
              onChange={setSeg}
            />
          </div>
          <div className="mt-4">
            <FilterChips
              ariaLabel="Статус"
              options={[
                { value: 'open', label: 'Отворени', count: 4 },
                { value: 'mitigating', label: 'Ублажавају се', count: 3 },
                { value: 'closed', label: 'Затворени', count: 2 },
              ]}
              value={chip}
              onChange={setChip}
            />
          </div>
          <div className="mt-3">
            <FilterChips
              multiple
              ariaLabel="Категорија"
              options={[
                { value: 'beton', label: 'Бетон' },
                { value: 'drvo', label: 'Дрво' },
                { value: 'celik', label: 'Челик' },
                { value: 'izolacija', label: 'Изолација' },
                { value: 'staklo', label: 'Стакло' },
                { value: 'opeka', label: 'Опека и блокови' },
              ]}
              value={chips}
              onChange={setChips}
            />
          </div>
        </Card>
      </Block>

      <Block title="Уноси">
        <div className={grid2}>
          <Card>
            <div className="flex flex-col gap-4">
              <SearchInput value={q} onChange={setQ} placeholder="Претражи прописе…" />
              <Select
                label="Фасада"
                value={facade}
                onChange={setFacade}
                options={(Object.keys(FACADE_LABELS) as FacadeType[]).map((value) => ({ value, label: FACADE_LABELS[value] }))}
              />
              <Toggle label="Само демонтажни елементи" description="Пројектовано за раставање" checked={toggle} onChange={setToggle} />
            </div>
          </Card>
          <Card>
            <Slider label="Дебљина изолације" unit="cm" value={cm} min={10} max={30} onChange={setCm} minLabel="10 cm" maxLabel="30 cm" hint="Утиче на оперативну и уграђену енергију." />
            <Slider
              className="mt-3"
              label="Удео застакљења"
              value={0.35}
              min={0.2}
              max={0.6}
              step={0.01}
              onChange={() => undefined}
              format={(v) => formatPct(v, { ratio: true, decimals: 0 })}
            />
          </Card>
        </div>
      </Block>

      <Block title="Листе и особе">
        <Card className="mb-4">
          <div className="flex flex-wrap items-center gap-4">
            {people.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-2">
                <Avatar person={p} size="md" />
                <span className="text-sm">{p.name}</span>
              </span>
            ))}
            <AvatarStack people={[...people, ...people]} max={4} />
          </div>
        </Card>
        <DataList
          caption="Документа"
          rows={DOCS}
          rowKey={(d) => d.id}
          onRowClick={(d) => setSel(d.id)}
          selectedKey={sel}
          mobileAside={(d) => <Badge tone={DOC_STATUS[d.status].tone}>{DOC_STATUS[d.status].label}</Badge>}
          columns={[
            { id: 'title', header: 'Назив', cell: (d) => d.title, width: '40%' },
            { id: 'type', header: 'Врста', cell: (d) => d.type },
            { id: 'version', header: 'Верзија', cell: (d) => d.version },
            {
              id: 'status',
              header: 'Статус',
              cell: (d) => <Badge tone={DOC_STATUS[d.status].tone}>{DOC_STATUS[d.status].label}</Badge>,
              hideOnMobile: true,
            },
            { id: 'updated', header: 'Измењено', cell: (d) => formatDate(d.updated, 'short'), align: 'right' },
          ]}
        />
      </Block>

      <Block title="Прекривачи, празна стања, учитавање">
        <div className={grid2}>
          <Card>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setSheet(true)}>Отвори Sheet</Button>
              <Button variant="secondary" onClick={() => setModal(true)}>Отвори Modal</Button>
            </div>
            <div className="mt-4">
              <Skeleton lines={3} />
              <div className="mt-3 flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <EmptyState compact icon={Search} title="Нема резултата" description="Промените филтере или претрагу." action={<Button size="sm" variant="ghost">Поништи филтере</Button>} />
          </Card>
        </div>
        <Sheet
          open={sheet}
          onClose={() => setSheet(false)}
          title="Историја верзија"
          subtitle="Елаборат енергетске ефикасности"
          footer={<Button onClick={() => setSheet(false)}>Затвори</Button>}
        >
          <ol className="flex flex-col gap-3 text-sm">
            <li><b>v2.1</b> · {formatDate('2026-10-02')} — Ажурирана фасада и U-вредности.</li>
            <li><b>v2.0</b> · {formatDate('2026-08-18')} — Усклађено са ПГД.</li>
            <li><b>v1.0</b> · {formatDate('2026-04-03')} — Прва верзија за ИДР.</li>
          </ol>
        </Sheet>
        <Modal
          open={modal}
          onClose={() => setModal(false)}
          title="Предложити одбору?"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>Откажи</Button>
              <Button onClick={() => setModal(false)}>Предложи</Button>
            </>
          }
        >
          Креираће се нацрт одлуке за наредни састанак одбора.
        </Modal>
      </Block>

      <Block title="Графикони — KPI">
        <div className={grid2}>
          <Card title="BarChart" subtitle="Угљенични буџет по пројекту">
            <BarChart
              title="Уграђени угљеник по пројекту"
              unit="kgCO₂e/m²"
              data={[
                { id: 'a', label: 'Савски кеј', sublabel: 'Београд', value: 358, target: 320 },
                { id: 'b', label: 'ОШ Ново насеље', value: 190, target: 220 },
                { id: 'c', label: 'Блок 42', value: 455, target: 380 },
                { id: 'd', label: 'Стара пивара', value: 145, target: 150 },
              ]}
            />
          </Card>
          <Card title="LineBand" subtitle="Вредност кроз фазе у односу на циљ">
            <LineBand
              title="Уграђени угљеник по фазама"
              unit="kgCO₂e/m²"
              target={320}
              band={{ from: 250, to: 320, label: 'Циљни опсег' }}
              points={[
                { label: 'ИДР', value: 305 },
                { label: 'ПГД', value: 358 },
                { label: 'ПЗИ', value: 334, projected: true },
              ]}
            />
          </Card>
          <Card title="RingScore" subtitle="Сертификациони резултат">
            <div className="flex flex-wrap items-center justify-around gap-4">
              <RingScore
                title="DGNB"
                value={66}
                target={70}
                sublabel="DGNB · циљ Gold"
                thresholds={[
                  { value: 50, label: 'Silver' },
                  { value: 65, label: 'Gold' },
                  { value: 80, label: 'Platinum' },
                ]}
              />
              <RingScore title="Спремност" value={9} max={11} size={120} tone="clay" label="9/11" sublabel="докумената" showThresholdLabels={false} />
            </div>
          </Card>
          <Card title="StackedBar" subtitle="Поени по категорији">
            <div className="flex flex-col gap-5">
              <StackedBar
                title="ENV"
                total={100}
                marker={70}
                legendValues
                segments={[
                  { id: 'a', label: 'Остварено', value: 42, tone: 'good' },
                  { id: 't', label: 'Циљано', value: 20, tone: 'accent' },
                  { id: 'r', label: 'Угрожено', value: 8, tone: 'warn' },
                ]}
              />
              <StackedBar
                title="Угљеник по слојевима"
                height="lg"
                segments={[
                  { id: 'k', label: 'Конструкција', value: 190 },
                  { id: 'f', label: 'Фасада', value: 72 },
                  { id: 'kr', label: 'Кров', value: 28 },
                  { id: 'u', label: 'Унутрашњост', value: 40 },
                  { id: 'i', label: 'Инсталације', value: 28 },
                ]}
              />
            </div>
          </Card>
          <Card title="RadarChart" subtitle="Поређење варијанти">
            <RadarChart
              title="Поређење варијанти"
              axes={[
                { id: 'c', label: 'Угљеник' },
                { id: 'e', label: 'Енергија' },
                { id: 'k', label: 'Трошак' },
                { id: 'd', label: 'Дневно светло' },
                { id: 's', label: 'Сертификација' },
                { id: 't', label: 'Рок градње' },
              ]}
              series={[
                { id: 'a', label: 'А: АБ + ETICS', values: [40, 60, 85, 55, 50, 70] },
                { id: 'b', label: 'Б: CLT + АБ језгро', values: [82, 70, 60, 65, 78, 80] },
                { id: 't', label: 'Циљ', values: [75, 75, 65, 60, 70, 70], color: 'var(--ink)', dashed: true },
              ]}
            />
          </Card>
          <Card title="Sparkline">
            <div className="flex flex-wrap items-center gap-6">
              <Sparkline title="а" values={[305, 330, 358]} target={320} tone="warn" />
              <Sparkline title="б" values={[52, 44, 39, 38]} target={40} tone="good" />
              <Sparkline title="в" values={[12, 18, 15, 22, 25]} tone="info" width={140} height={36} />
            </div>
          </Card>
        </div>
      </Block>

      <Block title="Графикони — пројекат">
        <Card title="PhaseTimeline" subtitle="Вертикално на телефону, хоризонтално од 640 px" action={
          <Select<Phase> size="sm" ariaLabel="Фаза" value={phase} onChange={setPhase} options={PHASES.map((p) => ({ value: p, label: p }))} />
        }>
          <PhaseTimeline current={phase} progress={0.7} gates={{ G1: { date: '2026-03-12' }, G2: { date: '2026-10-22' } }} />
          <div className="mt-6 max-w-xs">
            <div className="eyebrow mb-2">variant=&quot;compact&quot;</div>
            <PhaseTimeline current={phase} progress={0.7} variant="compact" gates={{ G2: { date: '2026-10-22' } }} />
          </div>
        </Card>
        <div className={`${grid2} mt-4`}>
          <Card title="HeatMap5x5" subtitle={cell ? `Изабрано: В${cell.probability} × У${cell.impact}` : 'Кликните поље'}>
            <HeatMap5x5 title="Матрица ризика" items={RISKS} selected={cell} onCellClick={(c) => setCell({ probability: c.probability, impact: c.impact })} />
          </Card>
          <Card title="DivergingBars" subtitle="Допринос измена (корак 6)">
            <DivergingBars
              title="Допринос измена"
              unit="kgCO₂e/m²"
              data={[
                { id: 'c', label: 'Фасадна облога', value: -18, sublabel: 'Алуминијум → фибер-цемент' },
                { id: 'k', label: 'Бетон — језгра', value: -6.8 },
                { id: 'p', label: 'PV снага', value: 4.2 },
              ]}
              total={{ label: 'Укупно', value: -20.6 }}
            />
          </Card>
          <Card title="GroupedBars + EnergyClassBadge + AnimatedNumber" subtitle="Корак 6">
            <GroupedBars
              title="Поређење"
              series={[{ id: 'a', label: 'А' }, { id: 'b', label: 'Б' }]}
              groups={[{ id: 'ec', label: 'Уграђени угљеник', unit: 'kgCO₂e/m²', values: [432, 358], target: 320, direction: 'lower-better' }]}
            />
            <div className="mt-4 flex items-center gap-2">
              <EnergyClassBadge value="A+" size="sm" />
              <EnergyClassBadge value="B" />
              <EnergyClassBadge value="E" size="lg" animate />
              <span className="font-display text-2xl text-ink">
                <AnimatedNumber value={358} />
              </span>
            </div>
          </Card>
          <Card title="WindRose" subtitle="Кошава (ИЈИ/ЈИ) истакнута">
            <WindRose title="Ружа ветрова — Београд" data={WIND} highlight={['ESE', 'SE']} />
          </Card>
          <Card title="QuadrantGrid" subtitle="Утицај / интерес" className="md:col-span-2">
            <QuadrantGrid
              title="Заинтересоване стране"
              xLabel="Интерес"
              yLabel="Утицај"
              quadrants={STAKEHOLDER_QUADRANTS}
              selectedId={sel}
              onItemClick={(it) => setSel(it.id)}
              items={STAKEHOLDERS.map((s) => ({ id: s.id, label: s.label, x: s.x, y: s.y, tone: ATTITUDE_TONE[s.attitude] }))}
            />
          </Card>
        </div>
      </Block>

      <Block title="АИ демо примитиви">
        <Card
          title="Питај АрхиБорд"
          action={<AiBadge size="sm" />}
        >
          <p className="text-sm text-muted">„Која је минимална енергетска класа за нову стамбену зграду?“</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button icon={Sparkles} onClick={run.start} disabled={run.isRunning}>
              {run.state === 'done' ? 'Поново' : 'Питај'}
            </Button>
            <Button variant="ghost" onClick={run.reset}>Ресетуј</Button>
            <Badge tone="neutral" size="sm">{run.state}</Badge>
          </div>
          <div className="mt-4 min-h-16">
            {run.state === 'thinking' && <ThinkingDots label="Претражујем библиотеку прописа…" />}
            <StreamingText text={AI_ANSWER} active={run.state === 'streaming' || run.state === 'done'} onDone={run.finish} />
          </div>
        </Card>
      </Block>

      <FeedbackWidget moduleId="ui-showcase" />
    </>
  );
}
