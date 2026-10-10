# Component library

Everything below is live at **`/#/_ui`** (hidden showcase, `src/features/dev/UiShowcasePage.tsx`). Look there first;
copy the usage from that file. Add new primitives there and here.

Rules: use these instead of re-implementing; colours only via tokens/tones; all copy in Serbian Cyrillic;
numbers/dates via `@/lib/format`. Icons come from `lucide-react` **1.x** — some names differ from older docs
(e.g. `FaceNeutral` not `Meh`, `Building` not `Building2`, `CircleAlert`, `TriangleAlert`). If an import fails,
grep `node_modules/lucide-react/dist/lucide-react.d.ts`.

## Tokens & tones

| What | Where | Usage |
|---|---|---|
| Colour tokens | `src/styles/index.css` | `bg-paper` (page) `bg-surface` (cards) `bg-surface-2` (fills) `text-ink` `text-muted` `border-line` `border-line-strong` `bg-accent` `text-accent` `bg-accent-soft` `text-accent-ink` (text on solid accent) `clay` `good` `warn` `bad` `info` (+ `-soft` for each), `chart-1…6`, `bg-overlay` |
| Fonts | — | `font-display` / `font-serif` (Source Serif 4, headings — h1–h4 get it automatically), default sans = Inter |
| Utilities | — | `tabular` (tabular numerals), `eyebrow` (small caps label), `scrollbar-none`, `pt-safe` / `pb-safe` (iOS insets) |
| `Tone` | `@/domain/types` | `'neutral' \| 'accent' \| 'good' \| 'warn' \| 'bad' \| 'info' \| 'clay'` — prop on Badge, Stat, ProgressBar, charts … |
| `TONE_CLASSES`, `toneVar`, `seriesColor` | `@/components/ui` | `TONE_CLASSES.good.soft` → `'bg-good-soft text-good'`; `toneVar('warn')` → `'var(--warn)'` (SVG); `seriesColor(i)` → `var(--chart-n)` |
| `cn` | `@/lib/cn` | `cn('a', cond && 'b')` |

Dark mode: tokens switch automatically (system, or forced by `<html data-theme>`). A `dark:` variant exists but is rarely needed.

## UI primitives — `import { … } from '@/components/ui'`

| Component | Usage |
|---|---|
| `Card` | `<Card title="Уграђени угљеник" subtitle="A1–A3" eyebrow="KPI" action={<Badge>…</Badge>} padding="md" interactive>…</Card>` |
| `SectionHeader` | `<SectionHeader title="Захтева пажњу" subtitle="3 ставке" action={<Button variant="ghost" size="sm">Све</Button>} />` |
| `PageHeader` | `<PageHeader eyebrow="Портфолио" title="…" subtitle="…" actions={<Button>…</Button>} meta={<HealthBadge … />} back={{ to: '/projekti', label: 'Пројекти' }} />` |
| `Badge` / `Pill` | `<Badge tone="good" dot>Усклађено</Badge>` · `variant="soft\|outline\|solid"` · `size="sm\|md"` · `icon={FileText}` |
| `StatusDot` | `<StatusDot tone="warn" label="Ризик" pulse />` |
| `HealthBadge` | `<HealthBadge health={project.health} long? size? />` |
| `PhasePill` | `<PhasePill phase="pgd" long? />` → „ПГД“ |
| `Button` | `<Button icon={Plus} onClick={…}>Сачувај</Button>` · `variant="primary\|secondary\|ghost\|danger"` · `size="sm\|md\|lg"` · `iconRight` · `fullWidth` · `to="/odbor"` renders a router link |
| `IconButton` | `<IconButton icon={X} label="Затвори" variant="ghost\|secondary\|primary" size="sm\|md" />` |
| `RouteTabs` | `<RouteTabs ariaLabel="…" items={[{ to: paths.project(id, 'pregled'), label: 'Преглед', count? }]} />` — chips on mobile, underline ≥768px |
| `Tabs` | `<Tabs ariaLabel="Приказ" items={[{ id: 'lista', label: 'Листа', count: 4 }]} value={v} onChange={setV} />` · `variant="auto\|chips\|underline"` |
| `Segmented` | `<Segmented ariaLabel="Ниво" options={[{ value: 'min', label: 'Минимум', icon? }]} value={v} onChange={setV} size? fullWidth? />` |
| `Stat` | `<Stat label="Тренутно" value={358} unit="kgCO₂e/m²" delta={11.9} direction="lower-better" deltaLabel="у односу на циљ" aside={<Sparkline …/>} size="sm\|md\|lg" hint="…" />` (delta in % by default; `deltaUnit=""` for absolute) |
| `ProgressBar` | `<ProgressBar label="Г2 спремност" valueLabel="9 / 11" value={9} max={11} target={10} tone="accent" size="xs\|sm\|md" />` |
| `RangeBar` | `<RangeBar value={205} min={180} max={310} direction="lower-better" ariaLabel="GWP у оквиру категорије" />` — thin track with a marker showing where a value sits between the min and max of its comparison group (tone from position; renders nothing when min = max) |
| `Callout` | `<Callout tone="warn" title="…" action={<Button size="sm">…</Button>}>текст</Callout>` |
| `Sheet` | `<Sheet open={o} onClose={close} title="…" subtitle? footer={<Button>…</Button>} width="sm\|md\|lg">…</Sheet>` — bottom sheet on mobile, right drawer ≥768px, Esc/backdrop close, focus trap |
| `Modal` | `<Modal open={o} onClose={close} title="…" footer={…} size="sm\|md\|lg">…</Modal>` |
| `EmptyState` | `<EmptyState icon={Search} title="Нема резултата" description="…" action={…} compact />` |
| `Avatar` | `<Avatar person={getPerson(id)!} size="xs\|sm\|md\|lg" />` (initials, colour from id) |
| `AvatarStack` | `<AvatarStack people={teamForProject(id)} max={3} />` |
| `KeyValue` | `<KeyValue items={[{ label: 'Парцела', value: p.parcel, hint? }]} columns={1\|2} />` |
| `DataList` | `<DataList rows={docs} rowKey={(d) => d.id} caption="Документа" columns={[{ id, header, cell: (d) => …, align?, width?, hideOnMobile?, mobileLabel? }]} onRowClick? selectedKey? mobileAside={(d) => <Badge/>} primaryColumn? emptyText? groupBy={(d) => d.categoryId} groupHeader={(key, rows) => …} />` (rows must be sorted so groups are contiguous) — table ≥768px, cards below |
| `SearchInput` | `<SearchInput value={q} onChange={setQ} placeholder="Претражи прописе…" />` |
| `FilterChips` | single: `<FilterChips ariaLabel="Статус" options={[{ value, label, count? }]} value={v \| null} onChange={setV} />` · multi: add `multiple` with `value: string[]` · `wrap` to wrap instead of scroll |
| `Slider` | `<Slider label="Изолација" unit="cm" value={cm} min={10} max={30} step={1} onChange={setCm} format? hint? minLabel? maxLabel? />` |
| `Select` | `<Select label="Фасада" value={f} onChange={setF} options={[{ value, label }]} size="sm\|md" />` (native) |
| `Toggle` | `<Toggle label="…" description? checked={b} onChange={setB} />` |
| `Tooltip` | `<Tooltip content="Индекс заузетости = …" underline>ИЗ</Tooltip>` (native title) |
| `EnergyClassBadge` | `<EnergyClassBadge value="B" size="sm\|md\|lg" animate />` — passport class letter on its tone colour; `animate` pops on change |
| `AnimatedNumber` | `<AnimatedNumber value={358} decimals={0} format? duration? />` — count-up tween (instant with reduced motion) |
| `useMediaQuery` | `const isPhone = useMediaQuery('(max-width: 767px)')` — subscribes to a CSS media query (used to cut long mobile lists with „Прикажи још“) |
| `DotScale` | `<DotScale label="Утицај" value={4} max={5} />` — tiny filled/empty dots (influence 1–5, competence level 0–3), accessible „Утицај 4 од 5“ |
| `Skeleton` | `<Skeleton className="h-24 w-full" />` · `<Skeleton lines={3} />` |

## Charts — `import { … } from '@/components/charts'`

All are SVG, responsive (fill their container width), theme-aware, with an accessible title (`title` prop required).

| Chart | Usage |
|---|---|
| `BarChart` | `<BarChart title="…" unit="kgCO₂e/m²" direction="lower-better" data={[{ id, label, value, target?, tone?, sublabel?, valueLabel? }]} max? format? onBarClick? showLegend? />` — horizontal bars, target marker, colour = pass/warn/fail vs target |
| `RingScore` | `<RingScore title="DGNB" value={66} max={100} target={70} sublabel="циљ Gold" thresholds={[{ value: 50, label: 'Silver' }, …]} size={160} tone="accent" label? showThresholdLabels? />` — animated 270° gauge |
| `Sparkline` | `<Sparkline title="Тренд" values={[305, 330, 358]} target={320} tone="warn" width={96} height={28} area? />` |
| `RadarChart` | `<RadarChart title="…" max={100} axes={[{ id, label }]} series={[{ id, label, values: number[], color?, dashed? }]} levels? showLegend? />` (1–3 series; dashed = target outline) |
| `StackedBar` | `<StackedBar title="…" total={100} marker={70} overMarkerTone="bad" segments={[{ id, label, value, tone? \| color? }]} height="sm\|md\|lg" legendValues? showLegend? />` |
| `PhaseTimeline` | `<PhaseTimeline current="pgd" progress={0.7} gates={{ G2: { date: '2026-10-22', state? } }} />` (vertical on phones, horizontal ≥640px) · `variant="compact"` for cards |
| `HeatMap5x5` | `<HeatMap5x5 title="Матрица ризика" items={risks.map(r => ({ id: r.id, probability: r.probability, impact: r.impact, label: r.title }))} selected={cell} onCellClick={(c) => …} />` |
| `WindRose` | `<WindRose title="Ружа ветрова" data={site.climate.windRose} highlight={['ESE', 'SE']} size={260} />` |
| `QuadrantGrid` | `<QuadrantGrid title="…" xLabel="Интерес" yLabel="Утицај" quadrants={STAKEHOLDER_QUADRANTS} items={[{ id, label, x: 1–5, y: 1–5, tone? }]} selectedId? onItemClick? labelMode="numbered\|inline" showList={false} />` (numbered = dots + legend list, default; `showList={false}` hides the list when the caller lists the items itself) |
| `LineBand` | `<LineBand title="…" unit="kgCO₂e/m²" target={320} band={{ from: 250, to: 320, label? }} reference={{ value: 350, label: 'Мерило: Циљ фирме' }} points={[{ label: 'ИДР', value: 305 }, { label: 'ПЗИ', value: 334, projected: true }]} height={180} />` |
| `BenchmarkScale` | `<BenchmarkScale title="Угљеник" direction="lower-better" current={358} target={320} currentTone="bad" highlightId="firm" format={fmt} marks={[{ id: 'firm', label: 'Циљ фирме', value: 350 }, { id: 'best', label: 'Најбоља пракса', value: 250 }]} />` — compact benchmark ladder (пропис / EU таксономија / циљ фирме / најбоља пракса), better side always on the right, current value as marker, labels laid out in lanes |
| `DivergingBars` | `<DivergingBars title="…" unit="kgCO₂e/m²" data={[{ id, label, value, sublabel? }]} total={{ label: 'Укупно', value }} positiveTone="bad" negativeTone="good" />` — contributions around zero (labels above bars, phone-safe) |
| `GroupedBars` | `<GroupedBars title="…" series={[{ id, label, color? }]} groups={[{ id, label, unit?, values: number[], target?, direction?, format? }]} />` — small multiples, one thin bar per series, each group on its own scale |
| `StepLine` | `<StepLine title="…" points={[{ x: timestamp, y: -28, label: 'Одлука 1', tone: 'good', projected?, highlight? }]} xEnd? xTicks={[{ x, label }]} format={(v) => formatPct(v, { signed: true, decimals: 0 })} startValue={0} />` — step line (value jumps at discrete moments), dashed = proposed/projected, highlight prints the value |
| `Legend` | `<Legend items={[{ label: 'Циљ', color: 'var(--ink)', shape: 'square\|line\|dashed\|dot' }]} />` |

Helpers in `src/components/charts/utils.ts`: `polar`, `sectorPath`, `niceDomain`, `scaleLinear`, `useMounted`, `truncate`.

## AI demo — `import { … } from '@/components/ai'`

| Item | Usage |
|---|---|
| `AiBadge` | `<AiBadge />` → „АИ асистент · демо“ (mandatory on every AI feature) · `size="sm"` |
| `ThinkingDots` | `<ThinkingDots label="Анализирам локацијске услове…" />` |
| `StreamingText` | `<StreamingText text={answer} active={run.state === 'streaming' \|\| run.state === 'done'} onDone={run.finish} speed={28} />` (`\n\n` = paragraphs; reduced motion → instant) |
| `useScriptedRun` | `const run = useScriptedRun({ thinkingMs: 1400, streamingMs? })` → `{ state: 'idle'\|'thinking'\|'streaming'\|'done', start, finish, reset, isRunning }` |
| `useReducedMotion` | `const reduced = useReducedMotion()` |

## Feedback & layout

| Item | Usage |
|---|---|
| `FeedbackWidget` | `import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'` — `<FeedbackWidget moduleId="projekat-varijante" />` at the bottom of every routed page (ids in `MODULES`); `compact` + `question` for an embedded poll under an AI demo (e.g. `ai-lokacijski-uslovi`) |
| `ModulePlaceholder` | `@/components/layout/ModulePlaceholder` — temporary „Модул у изради — корак N“ box; delete when the module is built |
| `navigation.ts` | `@/components/layout/navigation` — `paths.project(id, 'varijante')`, `paths.session(id)` …, `PROJECT_TABS`, `MODULES` (moduleId → label), `NAV_*` |
| `ThemeToggle` | `<ThemeToggle />` (labelled) / `<ThemeToggle compact />` (icons) |
| `ResetDemoButton` | Clears user-created options/decisions/reviews/accepted requirements (keeps feedback) |
| `useCurrentProject` | `@/features/project/useCurrentProject` — inside `/projekti/:id/*` tabs: `const project = useCurrentProject()` |

## Data, store, formatting (quick reference)

| Item | Usage |
|---|---|
| Seed + lookups | `import { projects, getProject, getPerson, getPeople, teamForProject, kpisForProject, siteForProject, requirementsForProject, optionsForProject, decisionsForProject, sessionsForProject, getSession, documentsForProject, materialsForProject, stakeholdersForProject, risksForProject, certificationForProject, criteriaForProject, activityForProject, regulationsForProject, FIRM, APP } from '@/data'` |
| Labels | `import { PHASE_LABELS, GATE_LABELS, HEALTH_LABELS, HEALTH_TONE, … } from '@/domain/labels'` — every enum has `*_LABELS` (+ `*_TONE` for statuses) |
| Store | `useAppStore((s) => s.userOptions)`, `s.addUserOption(o)`, `s.addUserDecision(d)`, `s.setGateReview(id, state)`, `s.acceptRequirements([...])`, `s.setFeedback(moduleId, rating, note?)`, `s.resetDemo()` |
| Store extras | `s.removeUserDecision(id)` (delete a user-created decision/proposal) · `s.addStakeholderNote(stakeholderId, { date, kind, summary })` (user notes in `s.stakeholderNotes`) |
| Merged hooks | `useProjectOptions(id)`, `useProjectDecisions(id)`, `useProjectRequirements(id)`, `useProjectStakeholders(id)` (seed + user notes merged into `log`, newest first), `useModuleFeedback(moduleId)` from `@/store` (seed + user items) |
| Theme | `useThemeStore((s) => s.theme)`, `setTheme('system'\|'light'\|'dark')`, `useResolvedTheme()` |
| Format | `formatNumber(n, dec?)`, `formatSigned`, `formatCompact`, `formatUnit(n, unit, dec?)`, `formatArea(m2, 'm2'\|'ha'\|'auto')`, `formatCarbon(v, 'per-m2'\|'total'\|'tonnes')`, `formatEur(n, compact?)`, `formatPct(v, { ratio?, signed?, decimals? })`, `formatDate(iso, 'long'\|'short'\|'day-month'\|'numeric'\|'month'\|'weekday')`, `formatRelative(iso)` |
| Dates | `@/lib/dates`: `DEMO_TODAY` (fixed demo „today“ = 2026-10-09), `daysFromToday`, `addDays`, `isWithinNextDays`, `parseIsoDate` |
| Cert scores | `@/lib/cert`: `certScoreMax(scheme)` (LEED 110, else 100), `formatCertScore`, `thresholdsInScoreUnits(scheme, thresholds)` (for `RingScore`), `achievedLevel`, `certTone`, `categoryBreakdown(cat)` (achieved / pending / atRisk / remaining), `trackerScore(tracker, 'achieved'\|'targeted'\|'atRisk')`, `nextThreshold`, `thresholdOf`, `formatCertGap` („1 п.п.“ / „2 бод.“), `categoryUnit` |
| Shared project pieces | `@/features/projects/ProjectCard` (portfolio card), `ProjectCover` (generative illustration from `illustration` + `coverHue`), `miniKpisFor(project)`; `@/features/portfolio/AttentionList` („Захтева пажњу“ rows; `showProject={false}` inside a project) |
| Gate helpers | `gateReadiness(projectId, gate)` → `{ required, approved, inReview, missing }` (missing = draft), `nextSessionForProject(projectId)` from `@/data` |
| Document links | `linksForDocument(documentId)` from `@/data` → `{ criteria, sessions, findings }` (certification criteria citing it as evidence, board sessions requiring it, AI findings about it). Deep links: `/projekti/:id/dokumenta?doc=<id>`, `/projekti/:id/odluke?decision=<id>` |
| What-if model | `@/lib/carbonModel` (pure, step 6): `setupProjectModel(input)` → `{ ctx, anchorParams, selected, calibration }` (null for the park), `evaluate(params, ctx, cal)` → `ModelResult`, `optionCalibration(model, option)`, `contributions(ctx, cal, from, to)`, `toDesignResults(r)`, `COEFFICIENT_TABLE`, `PARAM_LABELS`; in features use `useProjectModel(project)` from `@/features/options/useProjectModel` |
| KPI logic | `@/lib/kpi`: `kpiStatus(direction, current, target, tolerancePct=10)` → pass/warn/fail, `gapPct`, `deltaTone`, `clamp` |
