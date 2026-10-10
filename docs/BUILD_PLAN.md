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
| 7 | Материјали (project passport + global EPD library) | Sonnet | ✅ |
| 8 | Документација + Одлуке + Ризици | Sonnet | ✅ |
| 9 | Заинтересоване стране + Тим (project + global) | Sonnet | ✅ |
| 10 | ★ Одбор: sessions + gate review flow | Opus | ✅ |
| 11 | ★ Смернице + Питај АрхиБорд | Sonnet | ✅ |
| 12 | Повратне информације page + export; GitHub Pages workflow; README | Haiku | ✅ |
| 13 | Polish & QA pass (mobile, dark mode, copy review) | Sonnet + orchestrator | ✅ |

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

### Step 7 — Материјали и циркуларност + EPD библиотека ✅ (2026-10-09)
Built `/projekti/:id/materijali` and `/materijali` (`src/features/materials/`); all 6 projects have passports (park handled generically: per m² of site area, no calculator link).
- **Passport tab**: indicator tiles (embodied carbon A1–A3 = Σ GWP × quantity, per m² БРГП / site area, vs target and „KPI пројекта“; reused / recycled / bio-based / local < 300 km / demountable). **Shares are weighted by estimated mass** (demo kg-per-unit table `MASS_KG_PER_UNIT` in `materialsLogic.ts`), stated under the tiles; kept passport-only (retained existing elements are not in the passport, so Стара пивара shows less „reused“ than its 48 % KPI). „Жаришта угљеника“ (`BarChart` by layer + top-8 materials; tap = filter + scroll to passport; selected bar clay, others neutral). ★ „Предлози замене“ placed **before** the passport (more visible than the long list). Passport `DataList` grouped by layer (table ≥768px, cards below; EPD source line hidden on phones), search + chips (layer, reuse potential, local / demountable / reused), filter chip from chart. `MaterialSheet` (shared) used from table, swap cards and library.
- **Swaps** (`analyseSwaps`): scripted rule list (`SWAP_RULES`: CEM I/II→CEM III/A, alu panels→fibre-cement (alt. recycled alu), no-EPD curtain wall→EPD system, reused steel (≤ 50 %, only rows ≥ 150 t), LC3 (≤ 30 %), windows→PVC, wood fibre→cellulose, new→reclaimed brick, paving→permeable) evaluated on passport quantities × EPD GWP, only positive savings kept, ranked, rules competing for the same source material dropped, top 4. Card: savings t CO₂e + per m², project before→after vs target, cost/practicality note, „Пренеси у калкулатор“ (link to `varijante`; hidden for the park). Combined effect in a callout (Савски кеј 358 → 326, still 6 above target 320). Starts (ThinkingDots ~1,3 s) when the card scrolls into view, „Анализирај поново“, `AiBadge`, compact `FeedbackWidget` `materijali-zamene` (registered in `MODULES`). Note: EPS → wood fibre from the brief is NOT suggested — with the firm's no-biogenic-credit convention wood fibre has higher GWP (85 vs 52 per m³), so the computed saving is negative.
- **Material sheet**: EPD data, supplier, origin + km, recycled %, library note, biogenic callout (orientation estimate of stored kgCO₂ per unit), usage in this project (rows) or across projects with links (library mode), „Алтернативе“ = up to 3 lower-GWP materials of the same functional group (`ALTERNATIVE_GROUPS`, curated; same declared unit) with Δ GWP per unit and Δ total in the project; alternatives are tappable.
- **Library**: Callout (EPD / EN 15804, demo data), search, sort (категорија [grouped] / GWP ↑↓ / назив / удаљеност), chips category / reuse / origin (Србија · Регион · ЕУ · Остали свет — derived from `originCity`, `originRegion`) / bio-based; filters collapse behind „Филтери“ on phones. Table: GWP + `RangeBar` (position within same category AND unit; hidden when alone), EPD + supplier, origin + km, recycled, reuse badge (+ био), „N пројеката“ (computed via new `usageForMaterial`). Row → `MaterialSheet`.
- New generic: `components/ui/RangeBar` (+ showcase + COMPONENTS.md); helper `usageForMaterial` in `data/index.ts`; `scripts/shot.mjs` honours `SHOT_WAIT` (ms, default 500) so delayed UI can be captured. No seed/type/store changes.
Verified at 375 light/dark + 1280 light (Савски кеј, library), 375 light (Стара пивара, Парк): no horizontal overflow, no console errors.

### Step 8 — Документација + Одлуке + Ризици ✅ (2026-10-09)
Built three project tabs (`src/features/documents|decisions|risks/`); all 6 projects work.
- **Документација**: `GateReadinessCard` (Segmented over gates that have required documents, default = next gate; „За Г2 недостају 2 од 12 докумената“ with Serbian agreement `недостаје/недостају`, StackedBar approved / review / draft via `gateReadiness`, missing list → opens the document, „Прикажи у регистру“ sets the gate filter below); `DocumentRegister` (SearchInput, FilterChips status / gate / type / discipline — behind a „Филтери“ button on phones —, sort Select, table ≥768px / cards, first 8 on phones + „Прикажи још“); `DocumentSheet` (fake SVG first-page preview by type, metadata, version-history timeline, reverse-lookup links: certification criteria, sessions, AI findings with `AiBadge`). Deep link `?doc=<id>` (react-router search params inside the hash route) opens the sheet, highlights + scrolls to the row, is cleared on close; the certification tab links already use it.
- **Одлуке**: decision log = seed + `userDecisions` (user ones dashed, „нова · предлог“, deletable from card and sheet via new store action `removeUserDecision`); Segmented timeline (grouped by month, impact chips Δ угљеник / енергија / цена, first 6 + „Прикажи још“) / list (DataList); `DecisionSheet` in DDR format (контекст, опције, одлука, образложење, `DivergingBars` утицај, услови with owner / due / done / overdue vs DEMO_TODAY, седница link `/odbor/:id` or deciders, linked option). Emphasis is generic (`decisionEmphasis`): carbon ≥ +5 % = red „rise“ (dec-sk-06), proposed with carbon ≤ −3 % = blue „fix“ (dec-sk-09). `CumulativeImpactCard`: `StepLine` of the **compounded** carbon Δ of the decisions (Π(1+Δ)−1; labelled „утицај одлука“, not absolute — decision Δs are relative to the state before each decision and do not sum to the KPI path 312→329→358); proposals dashed. Deep link `?decision=<id>`.
- **Ризици**: `HeatMap5x5` (tap a cell to filter, closed risks excluded) + 4 zone legend (низак 1–7 / средњи 8–14 / висок 15–19 / критичан 20–25 — tones follow `riskScoreTone`, critical is a solid badge) and zone counts, category and status chips, sort Select (резултат / статус / категорија), register with score badge, owner Avatar, expandable mitigation („Прикажи више“), first 5 on phones + „Прикажи још“; `RiskSheet` (P / I scales, mitigation, owner).
- New generic: `components/charts/StepLine`, `components/ui/useMediaQuery`; `linksForDocument` in `data/index.ts`; store `removeUserDecision`. No seed/type changes.
Verified: build, check:copy, check:data, check:model pass; shots at 375 light/dark + 1280 light for Савски кеј (3 tabs, deep links `?doc=doc-sk-lca`, `?decision=dec-sk-06`) and 375 light for Парк and Блок 42: no horizontal overflow, no console errors.
Notes: Decision type has no „superseded by“ field and risks have no decision/document ids, so those links are not shown (add fields later if wanted). Risk-detail links to decisions/documents skipped for the same reason.

### Step 9 — Заинтересоване стране + Тим ✅ (2026-10-10)
Built `/projekti/:id/akteri` (`src/features/stakeholders/`), `/projekti/:id/tim` and `/tim` (`src/features/team/`); all 6 projects work.
- **Актери**: `QuadrantGrid` (influence × interest; quadrants Активно управљати / Држати задовољним / Држати информисаним / Пратити; dots by attitude, tap → sheet; numbers = order in the list, grid's own legend list hidden via new `showList={false}`; a value of 3 counts as „high“ and is drawn nudged to the high side of the midline), attitude legend, summary `FilterChips` (став + група with counts, they filter the register), „Следеће обавезе“ (next actions; seed has free text only, so `parseDue` recovers a date from „14. октобра“, „у новембру“ (mid-month, sorted) or „после Г2“ = project's next gate; overdue flagged vs DEMO_TODAY — none overdue in seed), register `DataList` (table ≥768px / cards, first 6 + „Прикажи још“, mini `DotScale`s, last contact relative), `StakeholderSheet` (classification, obligations, next step with due chip, vertical timeline with icon per kind, „Додај белешку“ inline form → entry dated DEMO_TODAY marked „ново“). Role groups (`groupOf`, keyword rules on role → name/organisation): Институције / ЈКП и комунална предузећа / Инвеститор и финансије (incl. банка, закупац) / Извођач и консултанти / Заједница и корисници.
- **Store**: new persisted slice `stakeholderNotes: Record<id, EngagementLogEntry[]>` + `addStakeholderNote`; persist version unchanged (default `{}` merges in for old localStorage), `resetDemo` clears it, `EngagementLogEntry.isUserCreated?` added to the type, selector `useProjectStakeholders(projectId)`.
- **Тим (пројекат)**: coverage card „Покривеност компетенција“ (`competencyNeeds` in `teamLogic.ts`: ИКС 300 + 381, LCA (level ≥ 2), BIM менаџер (level 3); scheme: DGNB Consultant/Auditor, LEED AP, BREEAM AP, EDGE Expert, Passive House Designer; CLT → дрвене конструкције level 3; adaptive reuse → наслеђе 3 + циркуларност; school retrofit / Passivhaus → енергетско моделовање 3; park: ИКС 373 + LCA + internal-scorecard certification instead of the building licences) with covering people, or „недостаје у тиму“ + who in the firm could cover it; member cards (avatar, role, discipline, ИКС badges, certification chips, % on project, total with overallocation warning), first 6 on phones; tap → `PersonSheet`.
- **/tim**: stat strip (17 људи, просечна 81 %, 2 преоптерећена, 14 сертификованих + counts per scheme), office + discipline `FilterChips`, „Оптерећење“ (StackedBar per person on one common scale, 100 % marker, share above 100 % tinted bad via new `overMarkerTone`, sorted by total, project colours = `PROJECT_COLORS` by project index incl. new token `--chart-6`), „Матрица компетенција“ (`Segmented` Компетенције [level dots 1–3] / Сертификати / Лиценце; desktop table with sticky name column, mobile per-person cards or per-item lists via a second Segmented; single points of failure = covered by one person firm-wide → warn callout + marked column; today only Пејзаж (Јована Радовић) among competencies), `PersonSheet` (board badge, licences with domain, certificates, competency levels, allocations linking to project `tim` tabs).
- New generic: `components/ui/DotScale`, `StackedBar.overMarkerTone`, `QuadrantGrid.showList`, token `--chart-6` (light/dark), showcase + COMPONENTS.md updated.
Verified: build, check:copy, check:data, check:model pass; shots at 375 light/dark + 1280 light for Савски кеј (akteri, tim) and /tim, 375 light for Парк (akteri, tim): no horizontal overflow, no console errors; note flow (add → „ново“, „данас“) tested in the browser.
Notes: shot.mjs in zsh needs width/scheme as separate args (an unquoted `$a` does not word-split) and orphan headless Chromes can make runs silently fail (`pkill -f chrome-shot`). Seed has no dated obligations, so „Следеће обавезе“ lists only next actions.

### Step 10 — ★ Одбор: седнице + ревизија капије ✅ (2026-10-10)
Built `/odbor` and `/odbor/:sessionId` (`src/features/board/`); data-driven for all 14 sessions (crafted for `ses-sk-g2`).
- **`/odbor`** `BoardPage`: header (board AvatarStack, chair), 4 stats (approval rate 88 % = 7/8 held, 1,5 conditions per gate, overdue
  open conditions across projects vs DEMO_TODAY = 1, sessions in 30 days) — completed demo reviews count as held; upcoming cards (gate,
  project, weekday + relative, „ускоро“ ≤ 14 days, location, readiness bar from `gateReadiness` „10 од 12 спремно“, AI findings by
  severity, status заказано / у току · корак n/6 / outcome, CTA „Започни ревизију“ / „Настави“ / „Записник“; first 3 on phones +
  „Прикажи још“); `BoardCalendar` (6 weeks from the current Monday, 7-col grid, session days tappable, list below); „Услови ван рока“
  card; held sessions list (outcome, open/overdue conditions, → записник).
- **`/odbor/:id`**: held session → `MinutesDocument` from seed (`minutesFromSeed`; KPI snapshot = history value at the phase the gate
  closes, e.g. Г1 → ИДР); scheduled → `ReviewStepper`; closed in the demo → success callout + minutes generated from the review.
  „Ресетуј ревизију“ (Modal confirm) clears the review and removes its decision. Unknown id → EmptyState.
- **Stepper**: desktop (≥1024) sticky vertical step list with per-step status („кворум 4/4 · ред 0/7“, „прегледано 12/12“,
  „констатовано 5/5“, „одлучено 8/8“ …, ✓ when complete); below 1024 a sticky progress header under the top bar (Корак n/6 + title +
  6 segments, tap → Sheet with the step list) and a fixed Назад / Даље bar above the bottom nav (safe-area aware, spacer so it never
  covers content). Free navigation between steps; every change persists (`useReview` → store).
  1. Припрема — project facts, members with присуство toggles and quorum badge (simple majority: ≥ 3 of 4, ≥ 2 of 3), agenda checklist
     (+ user proposals from Варијанте with sessionId, linked).
  2. Документација — `requiredDocumentIds` with register status (draft = недостаје, highlighted, sorted first), deep link
     `dokumenta?doc=`, per-doc „Прихваћено за ревизију“ / „Недостаје“, bulk „Прихвати спремна“ / „Означи недостајућа“.
  3. KPI провера — all project KPIs vs gate threshold = project target, `kpiStatus(…, 5)` (pass / warn ≤ 5 % / fail); flagship: 7 pass,
     5 fail (A1–A3 358/320, A1–C4, прегревање, биотоп, ОИЕ). Deviations need „Констатуј“. Proposals for the session (seed
     `proposalsForSession` + user `userDecisions`) attach to the KPI they affect; **dec-sk-09 estimates come from the calibrated
     what-if model** (`MEASURE_SCENARIOS` in `reviewLogic.ts`): 358 → ≈ 340 (фибер-цемент) → ≈ 333 (+ CEM III/A у језгрима), „и даље
     4 % изнад прага“; other proposals use current × (1 + Δ). „Укључи као услов“, link `odluke?decision=`.
  4. ★ АИ пре-ревизија — `useScriptedRun` (4,6 s, 5 status lines incl. „Проверавам 12 докумената…“, „…услове са Г1…“, „…EU
     таксономију…“), findings stream in (520 ms) grouped критично / упозорење / инфо, reference + document / regulation links (`/smernice`),
     disposition `ChoiceGroup` (Претвори у услов → pre-filled condition: owner = document owner if on the team else lead, due +14 days
     for critical / +30, text „<наслов>: …“; Прихваћено; Није релевантно). `aiRun` persisted (no replay on revisit, „Покрени поново“).
     Disclaimer + compact feedback `odbor-ai-prerevizija` (registered in `MODULES`).
  5. Услови — carried open conditions of earlier held gates (`carriedConditionsForSession`: cond-sk-g1-01 overdue flagged, cond-sk-g1-05),
     finding / measure / manual conditions; editable text, owner Select (team + board), date input, remove (removing a finding
     condition clears that finding's disposition), add.
  6. Одлука — present members vote (Одобрено / Уз услове / Враћено на дораду) + comment; outcome = majority of present votes, tie →
     chair's vote, tie without the chair among tied options → stricter outcome; one muted rule line + explanation when the chair broke
     a tie or voted „враћено“ and was outvoted. „Заврши седницу“ needs quorum + all present voted → `buildBoardDecision` added to
     `userDecisions` (title „Г2 ПГД — одлука одбора“, date = session date, status approved, conditions, sessionId) + review gets
     outcome / completedAt / decisionId → minutes.
- **Записник** (`MinutesDocument`): firm header, title, project / gate / date & place / chair, outcome banner, numbered sections
  (присутни + кворум, дневни ред, документација + missing, KPI table, АИ налази + dispositions, услови № / носилац / рок, гласање +
  comments, закључак), signature lines, provenance note. „Штампај / PDF“ = `window.print()`; print stylesheet in `index.css` (light
  tokens forced, A4, app chrome hidden via `#root > div > :not(:has(#main))`, page parts use `print:hidden`). „Копирај сажетак“ →
  clipboard (try/catch, „Копирање није успело“).
- **Types / store (additive)**: `BoardVote`, `FindingDisposition`, `DocumentReviewMark`, `ReviewConditionSource`, `ReviewCondition`,
  `MemberVote`, `GateReviewState` in `types.ts`; labels `FINDING_DISPOSITION_*`, `REVIEW_CONDITION_SOURCE_LABELS`. `gateReviews:
  Record<string, GateReviewState>`; **persist version 1 → 2** with `migrate` that keeps every slice and drops malformed v1 review
  placeholders (verified: feedback kept). Selectors `useGateReview`, `useSessionOutcome`, pure `sessionOutcomeOf`. Data helpers
  `boardChair`, `proposalsForSession`, `carriedConditionsForSession`, `sessionOfCondition`.
- **Integration**: `SessionOutcomeBadge` (effective outcome incl. „у току · корак n/6“) used in DecisionSheet, DocumentSheet and a
  status row on the overview next-gate card; Одлуке labels the review decision „нова · седница одбора“ and hides its delete (reset
  the review instead) via `isBoardReviewDecision` / `userDecisionLabel` in `decisionsLogic.ts`.
- New generic: `components/ui/ChoiceGroup` (+ showcase, COMPONENTS.md).
Verified: build, check:copy, check:data, check:model pass; shots 375 light / dark + 1280 light for `/odbor`, `/odbor/ses-sk-g2`,
`/odbor/ses-sk-g1`, 375 light for `ses-b42-g4`, `ses-pn-g1`, `ses-b42-g3-rev`, unknown id; whole ses-sk-g2 flow walked headless at
375 light, 375 dark and 1280 light (every step, minutes, print media, /odbor stats, overview, odluke) — no horizontal overflow, no
console errors.
Notes: KPI gate rule (5 % tolerance vs project target) makes 5 of 12 flagship KPIs fail — intentional, the board then approves with
conditions. Votes are per present member; absent members' earlier votes are ignored. The decision record has no impact values.

### Step 11 — ★ Смернице и прописи + Питај АрхиБорд ✅ (2026-10-10)
Built `/smernice` and `/smernice/:id` (`src/features/guidelines/`); seed unchanged (32 entries, 7 firm guidelines).
- **Library** (`GuidelinesPage`): header, ★ Q&A card, search (`foldText`: lower-case, diacritics stripped, Cyrillic transliterated to ASCII, so „kosava“ finds „кошава“; every term must occur in title / code / summary / key points / tags), multi-select chips by kind and jurisdiction (with counts), „Важи за“ project Select, „Очисти филтере“, empty state. Filters live in the URL: `?q=`, `?vrsta=`, `?nadleznost=`, `?projekat=` (`?q=` is the deep link; tag chips on detail pages use it). Order: firm guidelines first, then laws, rulebooks, standards, EU, schemes. `RegulationCard`: kind + year/jurisdiction, code, title, 2-line summary, applies-to chips („Сви пројекти“ or 3 names + N), count of linked requirements; firm guidelines have a clay-soft card and solid „Стандард фирме“ badge instead of the kind badge.
- **Linked requirements** = seed requirements with `regulationId` (new helpers in `data/index.ts`: `projectsForRegulation`, `requirementsForRegulation`, `findingsForRegulation`). Firm guidelines have none (no requirement cites them), so cards show no count for them.
- **Detail** (`RegulationDetailPage`): meta badges, summary (+ „Сажетак за демо — за примену консултовати важећи текст прописа.“ for non-firm; a note for firm), numbered key points, „Где се примењује“ (project cards with phase pill, citing requirements with status + source ref, link to `lokacija`; projects that only appear via requirements are included), „Налази АИ пре-ревизије“ (findings with this `regulationId` → `/odbor/:sessionId`), related entries by shared tags, tag chips → `?q=`. Unknown id → EmptyState. Feedback `smernice-detalj`.
- **★ Питај АрхиБорд** (`AskCard`, `AskParts`, `askScripts.ts`, `useAskThread.ts`): 6 scripted Q&As (енергетска класа, EU таксономија >5.000 m², дрвена фасада >22 m, бетон, кошава, Г2 капија), 100–120 words each, intro + bullets + closing sentence tied to the flagship; ThinkingDots 1 s → StreamingText (44 words/s) → „Извори“ chips (library entries → `/smernice/:id`, firm standards in clay; project / decision / session / EPD-library links). Free text → `matchQuestion` (weighted keyword stems, Cyrillic or Latin, threshold 2) → else fallback text + the unasked question chips. Thread is page state (`useAskThread`), input disabled while an answer is written, finished answers render instantly on remount, „Нова питања“ resets. ≥768px: chat inside the card (thread scrolls inside max 30 rem); phones: compact teaser (3 chips + „Отвори разговор“) and the chat in a bottom `Sheet` with the input in the sheet footer; floating „Питај“ button appears when the card is scrolled out of view (IntersectionObserver). Compact feedback `smernice-pitaj` inside the card/sheet; page feedback `smernice` unchanged. Both new module ids registered in `MODULES`; `paths.regulation(id)`.
- **D**: AiStep finding links now go to `/smernice/:id` (`paths.regulation(reg.id)`).
- Generic: `StreamingText` got an `instant` prop and „•“ bullet paragraphs (COMPONENTS.md updated). Answer numbers are consistent with data: CEM II/B-M 255 → CEM III/A 205 kgCO₂e/m³, 2.230 m³ in cores + transfer slab ≈ −112 t (≈ 6 kgCO₂e/m²); ариш → алуминијум +29; Qh,nd 27 / разред B; Г2 12 documents, 2 missing, KPI tolerance 5 %.
Verified: build, check:copy, check:data, check:model pass; shots 375 light/dark + 1280 light for `/smernice`, `smf-drvo`, `smf-lca`, `reg-eu-taksonomija`, `?q=kosava`; Q&A exercised headlessly (suggested chip, second chip, free text „kosava i terase“, fallback) at 375 light/dark and 1280 light — no horizontal overflow, no console errors.
Notes: no firm „gate standard“ entry exists in the library, so the Г2 answer cites СГ-03 (LCA), СГ-07 (прегревање), the technical-documentation rulebook and the session. Regulatory statements in answers are general and mirror the step-2 library summaries (not independently verified): class C minimum and 60 kWh/m²a for new multi-family residential, A+/A/B shares 15/25/50 %, 22 m high-rise threshold with A1/A2 cladding, taxonomy 7.1 requirements. EPBD 2024 is cited only as a source chip.

### Step 12 — Повратне информације + README ✅ (2026-10-10)
Replaced the placeholder at `/povratne-informacije` (`src/features/feedback/`); the page has no FeedbackWidget of its own.
- **Logic** (`feedbackLogic.ts`, pure): session options and filter (the chips store EXCLUDED sessions, so new sessions show
  up active by default), `rankModules` (score = (Да − Не) / укупно, sort by score then total; unanswered modules split off),
  `buildCsv` (BOM, `moduleId,modul,grupa,ocena,beleska,sesija,vreme`, RFC 4180 escaping), `buildJson`, `buildSummaryText`,
  `downloadFile` (Blob + object URL + temporary anchor), `exportFilename` (`arhiboard-povratne-informacije-YYYY-MM-DD`).
- **Page**: session card (input committed on blur/Enter because the store trims on every save, and a per-keystroke trim
  would eat spaces; FilterChips per session with counts), 4 stats, ranking DataList (table ≥768px, cards on phones) with
  StackedBar per module and a collapsed „Без одговора (N)“, notes list (relative date vs the real today, not DEMO_TODAY),
  export (CSV, JSON, „Копирај сажетак“ with try/catch and „Копирано“), danger „Обриши све одговоре“ behind a Modal, EmptyState
  when there is no feedback.
- **README.md** added at the repo root (English). The Pages workflow is unchanged.
Verified: build, check:copy, check:data, check:model pass; shots 375 light and 1280 dark for the empty state and for a seeded
state (25 answers, 3 sessions incl. без ознаке, notes with quotes and commas). No horizontal overflow.
Notes: the session chips filter only the summary (the widget still tags with the current label). The clear button wipes all
answers, not just the filtered ones, as the brief asked.

### Step 13 — Polish & QA ✅ (2026-10-10)
- Code-split: all feature pages/tabs `React.lazy` (shell, ProjectLayout, portfolio eager); `RouteSuspense`/`PageFallback` (Skeleton) in `components/layout/PageFallback.tsx`, used around the AppShell and project-tab outlets. Entry chunk 284 kB (88 kB gzip), no >500 kB warning; relative `./assets/…` paths verified through `vite preview`.
- Percent: `formatPct`, `Stat` delta default and all hand-built „N %“ strings in `src/` (incl. seed data copy) now use U+00A0 before `%`.
- `formatDateGenitive` („23. октобра 2026.“) in `lib/format`; used in gate-review minutes/summary running text (`reviewLogic.ts`, `MinutesDocument.tsx`).
- Вртић energy class seed → A (target and current = 2, KPI note). `classShift` in `carbonModel.ts` is KEPT: ОШ „Ново насеље“ А (retrofit, Qh 48 / qhMax 97 ⇒ B, seed says C) still needs it, so it was not vrtić-only.
- Mobile Варијанте: „Резултати ↓“ jump link above the controls (<1024px, respects reduced motion). Mobile Материјали: passport layer groups collapsed by default (<768px) via new optional `DataList` props `collapsibleGroupsOnMobile` / `expandAllGroups` / `mobileGroupHeader`; any active filter expands all. Tab height 11k → 3.4k px.
- PWA-lite: `public/manifest.webmanifest`, icons 192/512 + apple-touch-icon 180 (rendered from the logo mark), iOS meta tags; top bar already uses `pt-safe`. No service worker.
- „Демо пут“ card on the portfolio (`DemoGuideCard`, `useDemoGuideStore`, localStorage `archiboard-demo-guide-dismissed`); re-open via „Водич кроз демо“ in the sidebar Демо section and the „Више“ sheet.
- Small copy fixes: „енергетски разред“ in the first Ask suggestion; shorter passport search placeholder.
- Sweep (375 light all routes + savski-kej tabs, 375 dark, 1280 light): no horizontal overflow, no console errors.

## QA backlog (for step 13 — collected by the orchestrator)
- ~~Code-split routes (`React.lazy`) — main chunk > 500 kB.~~ (step 13)
- ~~Вртић: KPI says energy class A+ but Qh,nd 14 with assumed max 65 ⇒ A; align seed (class A, or Qh,nd ≤ 9) and drop the one-class anchor shift in carbonModel.~~ (step 13)
- ~~Percent spacing is inconsistent („12 %“ in data copy vs „12%“ from formatPct) — pick one (Serbian norm: „12 %“) and apply everywhere.~~ (step 13)
- ~~Mobile Варијанте: consider a "Резултати" jump link at the top of the calculator (results are below all controls on mobile).~~ (step 13)
- ~~Interactive QA of all scripted flows on a real phone width (AI extraction, calculator save/propose, gate review).~~ Done by orchestrator 2026-10-10 via CDP walk at 375px: extraction (≈9 s to full result) → accept, calculator Г2 preset + propose, full Г2 review → votes → minutes → decision log, Q&A, feedback summary; no console errors.
- ~~Gate review: Serbian date case in generated copy uses numeric dates to avoid „23. октобар“ in genitive contexts; a genitive month formatter in `lib/format` would read better.~~ (step 13)
- ~~Mobile Материјали tab is ~11k px tall: collapse passport layer groups by default on mobile (show totals per layer, expand on tap).~~ (step 13)
