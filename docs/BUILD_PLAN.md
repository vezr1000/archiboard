# Build plan

Sequential, one agent at a time. The orchestrator verifies each step (build, copy check, browser check at 375px and
1280px, light + dark) before starting the next one.

| # | Step | Model | Status |
|---|---|---|---|
| 1 | Foundation: scaffold, tokens, fonts, app shell, routing, UI + chart primitives, domain types, store, feedback widget, placeholder pages | Opus | ✅ |
| 2 | Seed data: 6 projects, people, regulations, materials, documents, decisions, risks, stakeholders, sessions | Opus | ✅ |
| 3 | Портфолио (home) + Пројекти list + project cockpit shell + Преглед tab | Sonnet | ✅ |
| 4 | Локација и услови + AI extraction moment | Sonnet | ✅ |
| 5 | Циљеви и KPI + Сертификација | Sonnet | ✅ |
| 6 | ★ Варијанте + what-if carbon model | Opus | ✅ |
| 7 | Материјали (project passport + global EPD library) | Sonnet | ☐ |
| 8 | Документација + Одлуке + Ризици | Sonnet | ☐ |
| 9 | Заинтересоване стране + Тим (project + global) | Sonnet | ☐ |
| 10 | ★ Одбор: sessions + gate review flow | Opus | ☐ |
| 11 | ★ Смернице + Питај АрхиБорд | Sonnet | ☐ |
| 12 | Повратне информације page + export; GitHub Pages workflow; README | Haiku | ☐ |
| 13 | Polish & QA pass (mobile, dark mode, copy review) | Sonnet + orchestrator | ☐ |

## Log

### Step 1 — Foundation ✅ (2026-10-09)
Built: Vite + React 19 + TS (strict) scaffold; Tailwind v4 tokens (light/dark, system default + `data-theme` override,
no-flash inline script); Inter + Source Serif 4; complete domain model (`src/domain/types.ts`) with Serbian label/tone
maps (`labels.ts`); `lib/format.ts` (sr-Cyrl), `lib/dates.ts`, `lib/kpi.ts`; seed stubs in `src/data/*` (one project
„Савски кеј — блок Ц“, 3 personas, 2 KPI definitions) + lookup helpers; zustand store (`archiboard-v1`) + merged
seed/user hooks + theme store; 27 UI primitives, 11 SVG charts + Legend, AI demo primitives, FeedbackWidget;
AppShell (sidebar ≥1024px, top bar + bottom tabs + „Више“ sheet below); all CONCEPT §5 routes as placeholders
(project cockpit shell with 11 route tabs) + 404; hidden showcase `/#/_ui`; `docs/COMPONENTS.md`.
Verified: build + check:copy pass; no horizontal overflow at 375/768/1280 on every route; light + dark checked.

Notes / deviations for later steps:
- Installed versions are newer than usual: React 19.3, react-router 8 (import from `react-router`), Vite 8,
  TypeScript 7, Tailwind 4.3, zustand 5, **lucide-react 1.x** (some icon names changed — see COMPONENTS.md).
- `@vitejs/plugin-react` added as a dev dependency (needed for JSX/fast refresh).
- `DEMO_TODAY = '2026-10-09'` (`src/lib/dates.ts`) is the demo's fixed „today“; `formatRelative` uses it. Seed dates
  should be written relative to it.
- `resetDemo()` keeps audience feedback (presenter resets between audiences); `clearFeedback()` wipes it.
- Feedback is stored per (moduleId, session label) — re-answering replaces the earlier answer.
- Page files to replace live in `src/features/<module>/` (see `App.tsx`); project tabs read the project via
  `useCurrentProject()`. Module ids and labels are registered in `components/layout/navigation.ts` (`MODULES`).
- Types added beyond the brief: `Project.typologyLabel`, `siteAreaM2`, `illustration`, `startYear`;
  `KpiDefinition.shortLabel/decimals`; `SiteHazards.floodRisk`; `UrbanParam.display*`; `Person.office/boardMember/
  competencies`; `CertificationCategory.thresholds`; `CertificationCriterion.projectId/points`; `Tone`, `CheckStatus`.
- `gateReviews` is typed `Record<string, unknown>` — step 10 defines the real `GateReviewState`.

### Step 2 — Seed data ✅ (2026-10-09)
Filled every array in `src/data/` (fictional people/companies; real institutions only as stakeholders). Counts:
6 projects · 17 people (4 board members; Милош Савић 120 % and Тамара Николић 115 % overallocated) · 12 KPI
definitions / 52 project KPIs · 6 sites · 55 requirements (flagship 25) · 32 library entries (25 laws/standards/EU/
schemes + 7 „Смернице фирме“ `smf-*`) · 7 options · 19 decisions (flagship 9) · 14 board sessions (5 upcoming) ·
47 documents (flagship 24) · 46 EPD materials / 88 passport rows (flagship 31, Стара пивара 17) · 29 stakeholders
(flagship 12) · 28 risks (flagship 12) · 6 certification trackers / 56 criteria (flagship DGNB 21) · 32 activity items ·
8 attention items. `npm run check:data` (new, `scripts/check-data.ts`, Node type stripping) validates all references
and invariants and prints these counts.

Health: Блок 42 off-track (contractor substitutions → BREEAM 66,7 % < 70 %); Савски кеј and Стара пивара at-risk
(reuse 62 % → 48 % after corroded trusses; parking 64/70); school, park, kindergarten on-track.

Flagship storyline (keep consistent): target 320 kgCO₂e/m² (A1–A3). ИДР 312 → ПГД quantities + CEM III/A → 329 →
facade change ариш → пуни алуминијумски панели A1 (`dec-sk-06`, 17. 6. 2026, forced by the high-rise fire rule
above 22 m + investor preference) +29 → **358 (+12 %)**. Proposed fix for Г2: fibre-cement (`dec-sk-09`, status proposed,
−5,2 % → ~340; with CEM III/A in cores ~333). The material passport sums exactly to 358 × 18.400 m².

Key ids for later steps:
- Projects: `savski-kej`, `os-novo-naselje`, `park-nisava`, `blok-42`, `vrtic-bubamara`, `stara-pivara`.
- Flagship options `opt-sk-a` (АБ + ETICS, rejected), `opt-sk-b` (CLT + АБ језгро, **selected**, = current KPIs),
  `opt-sk-c` (хибрид + PV, rejected). Decisions `dec-sk-01…09`.
- ★ Gate-review demo: **`ses-sk-g2`** (Г2 ПГД, 2026-10-23 10:00, 4 members, 7 agenda items, 12 required docs of which
  `doc-sk-sag-be` and `doc-sk-pregrevanje` are `draft` = „недостају 2 од 12“, 8 АИ findings: 2 critical / 4 warning /
  2 info). Past Г1 = `ses-sk-g1` (approved with 5 conditions; `cond-sk-g1-01` LCA A1–C4 is overdue since 30. 9.).
- Other held sessions: `ses-sk-g0`, `ses-os-g1`, `ses-os-g2`, `ses-pn-g0`, `ses-b42-g3`, `ses-b42-g3-rev` (rework),
  `ses-sp-g0`; upcoming: `ses-vb-g0` (14. 10.), `ses-sk-g2`, `ses-pn-g1` (4. 11.), `ses-os-g3`, `ses-sp-g1`, `ses-b42-g4`.
  Every project's `nextGate` matches its scheduled session; for scheduled sessions `requiredDocumentIds` equals the
  project documents whose `requiredForGates` contains that gate (checked).

Type changes (all additive/optional, in `src/domain/types.ts`): `KpiId` + `'stormwater-retention'`;
`Material.supplier?`; `ProjectMaterial.reused?`; `CertificationCriterion.maxPoints?`; `AiFinding.documentId?` /
`regulationId?`; new `AttentionItem` (+ `src/data/attention.ts`). Comment on `DesignResults.operationalEnergy` now
says it is Qh,nd.

Notes for later steps:
- `operational-energy` KPI = heating need **Qh,nd** (energy-class basis); class thresholds for new multi-family
  residential: C ≤ 60, B ≤ 30, A ≤ 15, A+ ≤ 9 kWh/m²a (% of max per the certificate rulebook). For lower-better KPIs
  `benchmarks.regulatoryMin` holds the regulatory maximum.
- GWP convention: fossil A1–A3 per EN 15804+A2, no biogenic credit (stated in material `epdSource`/notes).
- Certification units differ per scheme — see the header comment in `certification.ts` (DGNB/BREEAM/park/Passivhaus:
  Σ weight × achieved / max = project score; LEED: Σ achieved points = score (58/110, Gold = 60); EDGE: energy savings %).
  Park uses scheme `'none'` with an internal scorecard (levels Основни / Напредни / Предводник).
- New helpers in `src/data/index.ts`: `getOption`, `upcomingSessions`, `pastSessions`, `openConditionsForProject`,
  `documentsForGate`, `recentActivity`, `attentionFor`, export `attentionItems`.
- Seed modules must keep `@/` imports type-only (`import type`), otherwise `check:data` cannot load them.
- Activity dates are ISO timestamps (`2026-10-08T16:40:00`); everything else is `YYYY-MM-DD`.

### Step 3 — Портфолио, Пројекти, cockpit shell, Преглед ✅ (2026-10-09)
Built:
- `/` `PortfolioPage`: greeting + DEMO_TODAY, 5-stat KPI strip (active projects with health split; total GFA **excluding the
  park**, which is noted separately in ha; GFA-weighted embodied carbon 325 vs firm target 350 = −7 %; 50 % on track;
  3 gates in 30 days), „Захтева пажњу“ (top 4, expandable to 8, each row links to its project tab), next 3 board sessions
  (→ `/odbor/:id`), 6 `ProjectCard`s (generative `ProjectCover`, chips, 3 mini ProgressBars with target marker, compact
  PhaseTimeline, next gate relative), „Угљенични буџет“ BarChart (park omitted — per m² of site, not GFA; bars navigate to ciljevi).
  Stats live in `features/portfolio/portfolioStats.ts`.
- `/projekti` `ProjectsPage`: SearchInput + multi-select FilterChips (град, фаза, здравље, шема) + sort Select
  (назив / фаза / здравље / следећа капија; default next gate), DataList (table ≥768px, cards below), empty state with
  „Очисти филтере“; filters collapse behind a „Филтери“ button on phones.
- `ProjectLayout`: breadcrumb, eyebrow city · typology, name, address, chips, compact key-facts row (БРГП or site area for
  the park, спратност, инвеститор, водећи архитекта + Avatar; missing facts are skipped), route tabs unchanged.
- `OverviewTab` (+ `OverviewCards.tsx`): project „Захтева пажњу“ (if any), PhaseTimeline with gate dates from sessions, KPI tiles
  (first 6 KPIs: value, % vs target coloured by direction, sparkline over phases; energy class shown as letter), certification
  RingScore with thresholds + reached level, next-gate card (document readiness StackedBar, missing docs, open conditions with
  overdue flagged → session / decision / dokumenta links), latest 3 decisions (seed + user-saved), top 3 open risks by p×i, activity feed.
  Mobile: one column; ≥1024px: 3-col grid. Checked for all 6 projects (no horizontal overflow at 375 and 1280).
- New helpers: `lib/cert.ts`; in `data/index.ts`: `gateReadiness`, `nextSessionForProject`. No new ui primitives.

Notes for later steps:
- Document „readiness“ convention: ready = approved or in review; **missing = draft** (matches „недостају 2 од 12“); the card
  shows approved / in review / draft as a StackedBar. Step 10 should use `gateReadiness` for consistency.
- Certification scores are on different scales: LEED /110, others /100; tracker thresholds are stored as % of max, convert via
  `thresholdsInScoreUnits`. Cert bars/rings never go red on their own (`certTone`: good if ≥ target else warn).
- „Отворени услови“ on the overview = all open conditions of sessions + decisions of the project, soonest first.
- Tailwind v4 note: `cn` does not merge conflicting classes; to override a component's own margin use the important suffix
  (`mb-3!`) as in `ProjectLayout`.
- Pre-existing, not from step 3: React duplicate-key warning for `p-jelena-markovic` comes from `/#/_ui` (AvatarStack fed `[...people, ...people]`).

### Step 4 — Локација и услови + АИ извлачење услова ✅ (2026-10-09)
Built `/projekti/:id/lokacija` (`src/features/site/`), mobile one column, ≥1024px 3-col grid; works for all 6 projects:
- `SiteCard` + `SiteMap` (abstract SVG: river by city — Сава/Дунав/Нишава —, parcel, building footprint ∝ индекс заузетости, north arrow, scale hint; 4 layouts: quay / riverside / distant / park strip), key-values, utilities, context note.
- `ClimateCard`: HDD/CDD, зрачење, прорачунске температуре, UHI, `WindRose` + generated sentence (dominant direction + max speed; „кошава“ only if the seed note says so and dominant is ЈИ-ish) + air quality.
- `HazardsCard`: flood / seismic / soil / groundwater rows with tone chip + generic implication (rules in `siteLogic.ts`).
- `UrbanParamsCard`: `DataList` (table ≥768px, cards below), comparator, utilisation `ProgressBar` with limit marker, status: <5 % margin = „на граници“, beyond = „прекорачено“ (max) / „испод минимума“ (min).
- `RequirementsCard` (`id="uslovi"`): seed + accepted (`useProjectRequirements`), stacked status bar with counts, multi-select chips by source and status, AI-accepted items first with „ново · АИ“, notes clamp on mobile with „Прикажи више“, first 8 shown + „Прикажи све“.
- `AiExtractionCard` (★): shown for **all 6 projects** (park uses its „водни услови“ document, vrtic an „информација о локацији“, since no ЛУ exists yet). Flow = `useScriptedRun` (thinking ~4,8 s, 5 progressive status lines) → file chip → conditions stream in (650 ms each) → per-item „Прихвати“ / „Прихвати све нове“ → `acceptRequirements` (id `req-ai-<project>-<key>`, source `lokacijski-uslovi`, status `unchecked`, `aiExtracted`). Items matching a seed requirement (`matchesId`) show „већ у листи“ and are not acceptable. „Покрени поново“ / „Затвори резултат“; accepted state comes from the store, so `resetDemo()` makes them acceptable again. Scripts: `extractionScripts.ts` (flagship 8 conditions: 5 existing, 3 new — паркинг/ЕВ, бука, ватрогасни приступ; the „висина венца“ example was dropped because it is already covered by req-sk-03; others 7 each, mix of existing/new; ROP numbers fictional, flagship matches `doc-sk-lu`). Disclaimer line always visible.
- `FeedbackWidget` got a non-breaking `compact` prop; second widget `ai-lokacijski-uslovi` inside the AI card; registered in `MODULES` (navigation.ts).
No store, seed or type changes. Verified at 375 light/dark, 1280 light (idle + after run + after „Прихвати све“), all 6 projects: no horizontal overflow.
Notes: Stat's label truncates — climate tiles use their own small tile markup. Seed `status` of accepted items is always „непроверено“.

### Step 5 — Циљеви и KPI + Сертификација ✅ (2026-10-09)
Built `/projekti/:id/ciljevi` (`src/features/kpi/`) and `/projekti/:id/sertifikacija` (`src/features/certification/`); all 6 projects/schemes work.
- **Циљеви и KPI**: „Ниво амбиције“ `Segmented` (минимум → `regulatoryMin`, fallback `euTaxonomy`; добра пракса → `firmTarget`; предводник → `bestPractice`; local state, default добра пракса) drives a dotted comparison line in `LineBand` and a sentence per card (gap %). Summary card: StackedBar pass/warn/fail **vs project target** + „X од N испуњава мерило нивоа“. KPI cards (1 col / 2 cols ≥768px): value, delta (coloured by direction), `LineBand` across phases with band (target → best practice, or 15 % better than target when best practice is worse), `BenchmarkScale`, project note, collapsible description. Energy class: A+…G badge row (current / target / ambition class captions, colours via `energyClassTone`) and a class-per-phase chain instead of a line chart. KPIs with < 2 history points show „Нема историје“ (вртић: all, парк: 2 points is enough for a line). Park: KPIs ordered stormwater, biotope, green area, carbon; firm/regulatory benchmarks hidden for carbon and green area (not comparable to buildings — `PARK_INCOMPARABLE` in `kpiLogic.ts`) + info callout. „Одакле су мерила“ callout.
- **Сертификација**: header card (RingScore in the scheme's unit, reached level, status sentence derived generically in `certLogic.ts`: reserve over target level, or gap + whether „all targeted credits“ reach it and whether that depends on at-risk credits; EDGE and Passivhaus have their own sentences; park labelled „Интерни скорекард“), „Шта нам недостаје за следећи ниво“ (gap to next threshold, potential if everything targeted lands, top-3 at-risk criteria; ranked by remaining criterion points for DGNB/LEED, else category weight × at-risk), category card (StackedBar per category: achieved / targeted-not-yet / at-risk / remaining with target marker, weights, + `RadarChart` achieved vs targeted; ids as axis labels when ≥5 coded categories; EDGE instead shows three savings `ProgressBar`s vs required savings), criteria `DataList` grouped by category with status filter chips, owner avatar, evidence link `/projekti/:id/dokumenta?doc=<docId>` (step 8 should read the `doc` search param). Passivhaus shows value / limit (`≤`) in the value column.
- Model: `categoryBreakdown`: gap = max(0, targeted − achieved); at-risk = min(atRisk, gap); pending = rest of gap; remaining = max − achieved − gap. `trackerScore`: LEED Σ points, EDGE = energy savings, others Σ weight × value / max. Header ring uses `project.certification` numbers (66 vs computed 66,3 — same story).
- New/extended generic pieces: `components/charts/BenchmarkScale.tsx`; `LineBand` optional `reference` line; `DataList` optional `groupBy` / `groupHeader`; `Segmented` buttons now wrap to two lines instead of truncating (min-h-9); `lib/cert.ts` helpers (see COMPONENTS.md); `thresholdsInScoreUnits` rounds LEED thresholds to whole points (40/50/60/80 instead of 50,1).
Notes for later steps: category ids like `energija`/`bio` are slugs — use `categoryCode(id)` (certLogic) to show only real codes (ENV, Ene, IP …). FeedbackWidget module ids `projekat-ciljevi`, `projekat-sertifikacija`. Verified at 375 light/dark and 1280 light, plus 375 light for EDGE, BREEAM, LEED, Passivhaus, park: no horizontal overflow.

### Step 6 — ★ Варијанте + what-if модел ✅ (2026-10-09)
**Model** `src/lib/carbonModel.ts` (pure, no runtime imports; `npm run check:model` = `scripts/check-model.ts`):
- Embodied A1–A3 per m² БРГП = конструкција (system coefficient × project `structureScale` × concrete shares with cement factors CEM I 1,18 / CEM II 1 / CEM III/A 0,77 / LC3 0,70, split into foundations `concreteMix` and cores `coreConcreteMix` × (1 − 0,55 × reuse %)) + фасада (facade ratio × opaque share × (cladding package or wall system + insulation/cm)) + отвори (glazed area × window carbon) + кров (+ green roof) + инсталације/PV (generic + heating plant + MVHR + 950 kgCO₂e/kWp) + унутрашњост. Coefficients come from the flagship passport (alu panels 78 + alu subframe 28,5 + board 2,6 = 109 per m² wall; PV 950/kWp; MEP 40).
- Whole life A1–C4 excl. B6 (A4–A5 8 %, B4 replacements, C1–C4), Qh,nd (monthly-method shape: 0,024 × HDD × (H_T + H_V) − 0,9 × gains; MVHR −60 % H_V), class from Qh,nd / typology max (residential 60, office 55, kindergarten 65, school retrofit 97, adaptive reuse 90) with A+ ≤ 15 % · A ≤ 25 % · B ≤ 50 % · C ≤ 100 % · D 150 · E 200 · F 250, primary energy (district 1,45, HP SCOP 3,4 × grid 2,5, PV 1.200 kWh/kWp), renewable share, cost index €/m² → Δ % of budget/БРГП, cert points (scheme sensitivities), daylight, overheating (glazing × g × shading × mass × green roof), duration.
- Compliance: EU Taxonomy 7.1 (PED ≤ 90 = firm NZEB reference 100 − 10 %, from KPI benchmark) + GWP A1–C4 disclosure for > 5.000 m² (met unless an open condition still mentions „A1–C4“ → flagship fails only on that); school uses 7.2 (−30 % vs existing 260). Fire: combustible cladding (larch / timber facade) with top floor > 22 m (from `floors`: 2По+П+8+Пс → 30,1 m) → warning.
- Calibration: `setupProjectModel` anchors the selected seed option (+ current KPIs for whole-life / PE / RES / overheating) or, without options, typology defaults (`PROJECT_DEFAULT_PARAMS` for Блок 42 and Вртић) calibrated to current KPIs. Loading another option uses its own residual (`optionCalibration`), so every card = calculator exactly. Embodied carbon is explained by one model per project (residual ≤ 1 kgCO₂e/m² for all seed options).
- Calibration results (seed / model with project calibration): Савски кеј А 432/432, Б 358/358, В 372/371,7; ОШ А 62/61,4, Б 98/98; Пивара А 192/192, Б 268/268,4; Блок 42 421/421 (Qh 22/22), Вртић 230/230 (14/14). Other metrics (residuals carried by the option when loaded): Qh В 24/27, ОШ А 48/52; cost ОШ А 0/14,5 (deep-retrofit measures beyond the parameters); daylight ОШ А 80/89; cert ОШ А 28/24; rest ±1. Вртић class: computed A at 14 kWh/m²a, KPI A+ → class shift −1 kept by the anchor.
- Storyline (asserted): Б 358 → ариш 329,1 → фибер-цемент 340,0 → + CEM III/A у језгрима 333,1 (contributions −18 / −6,8); ариш triggers the fire warning; Г2 proposal is −1,1 п.п. cheaper.

**Type / data changes (additive):** `StructureSystem` + `'drvo'`; new `Cladding`, `WindowGlazing`, `ShadingType`; `DesignParams.cladding? / windows? / coreConcreteMix? / shading? / mvhr?`; `DesignResults.wholeLifeCarbon? / primaryEnergy? / renewableSharePct? / overheatingHours?`; labels `CLADDING_LABELS`, `WINDOWS_LABELS`, `SHADING_LABELS`. Seed `options.ts`: Б got `cladding: 'aluminijum'`, `windows`, `coreConcreteMix: 'cem-ii'` (passport: only basements in CEM III/A), В `cladding`/`windows`, school options `windows` (A double, Б triple) and Б `mvhr: true`. No store shape change (uses `userOptions` / `userDecisions`).

**UI** `/projekti/:id/varijante` (`src/features/options/`): „Поређење варијанти“ cards (snap-scroll on phones, grid ≥768px; code, status / „Корисничка“, carbon vs target, Qh + class, cost, cert in scheme units, duration, „Учитај у калкулатор“, delete for user options) + chart card (`GroupedBars` per KPI with targets / `RadarChart` normalised, max 3 options; radar default on phones). ★ Calculator: presets (each option, flagship „Предлог за Г2 (фибер-цемент + CEM III)“, Блок 42 „Пре замена извођача“, „Тренутно стање“ when no options, „Поништи“), controls in Конструкција / Омотач / Енергија / Материјали with a clay dot on changed controls, results card (sticky on desktop): animated RingScore vs target + count-up number, animated class badge with class limit, fire Callout, EU taxonomy sub-criteria, `DivergingBars` contributions vs the selected option (sequential attribution; a loaded option's residual shows as its own bar if ≥ 0,5); details: 8 stat tiles (A1–C4, PE vs taxonomy limit, ОИЕ, cost, cert vs target, daylight, overheating vs target, duration) + element `StackedBar` with target marker. Mobile sticky bar (carbon + Δ, class, taxonomy chip) above the bottom nav while the controls are on screen and the results card is not; tap scrolls to results; spacer at the end. „Како рачунамо“: formulas, project parameters, live `COEFFICIENT_TABLE`, disclaimer. „Сачувај као варијанту“ (Sheet, next Cyrillic letter, auto name from the most influential changes) and „Предложи одбору“ (Sheet → `userDecisions` proposed decision with auto context/decision/rationale, impact Δ %, `sessionId` of the next gate, optional save as option; success Callout with links to odluke / session). Park: „Калкулатор је за зграде“ EmptyState + link to Циљеви. Блок 42 in construction: info callout. Feedback `projekat-varijante` + compact `varijante-kalkulator` (registered in `MODULES`).
New generic pieces: `components/charts/DivergingBars`, `GroupedBars`; `components/ui/EnergyClassBadge`, `AnimatedNumber`; `animate-pop` keyframe in `index.css`; showcase + COMPONENTS.md updated.
Verified at 375 light/dark and 1280 light for Савски кеј (idle, larch, Г2 preset, propose flow, save sheet, „Како рачунамо“, sticky bar viewport), 375 light for Стара пивара, Блок 42, Парк, ОШ, Вртић: no horizontal overflow, no console errors.
Notes for later steps: step 8 (Одлуке) should list `userDecisions` (proposed, `isUserCreated`, `sessionId` set, `optionId` → user option); step 10 can show user proposals on the Г2 agenda. Calculator state is per project (component keyed by project id).

## QA backlog (for step 13 — collected by the orchestrator)
- Code-split routes (`React.lazy`) — main chunk > 500 kB.
- Вртић: KPI says energy class A+ but Qh,nd 14 with assumed max 65 ⇒ A; align seed (class A, or Qh,nd ≤ 9) and drop the one-class anchor shift in carbonModel.
- Percent spacing is inconsistent („12 %“ in data copy vs „12%“ from formatPct) — pick one (Serbian norm: „12 %“) and apply everywhere.
- Mobile Варијанте: consider a "Резултати" jump link at the top of the calculator (results are below all controls on mobile).
- Interactive QA of all scripted flows on a real phone width (AI extraction, calculator save/propose, gate review).
