# Build plan

Sequential, one agent at a time. The orchestrator verifies each step (build, copy check, browser check at 375px and
1280px, light + dark) before starting the next one.

| # | Step | Model | Status |
|---|---|---|---|
| 1 | Foundation: scaffold, tokens, fonts, app shell, routing, UI + chart primitives, domain types, store, feedback widget, placeholder pages | Opus | ✅ |
| 2 | Seed data: 6 projects, people, regulations, materials, documents, decisions, risks, stakeholders, sessions | Opus | ☐ |
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

