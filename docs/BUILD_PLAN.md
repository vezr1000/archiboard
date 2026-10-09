# Build plan

Sequential, one agent at a time. The orchestrator verifies each step (build, copy check, browser check at 375px and
1280px, light + dark) before starting the next one.

| # | Step | Model | Status |
|---|---|---|---|
| 1 | Foundation: scaffold, tokens, fonts, app shell, routing, UI + chart primitives, domain types, store, feedback widget, placeholder pages | Opus | ✅ |
| 2 | Seed data: 6 projects, people, regulations, materials, documents, decisions, risks, stakeholders, sessions | Opus | ✅ |
| 3 | Портфолио (home) + Пројекти list + project cockpit shell + Преглед tab | Sonnet | ☐ |
| 4 | Локација и услови + AI extraction moment | Sonnet | ☐ |
| 5 | Циљеви и KPI + Сертификација | Sonnet | ☐ |
| 6 | ★ Варијанте + what-if carbon model | Opus | ☐ |
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

