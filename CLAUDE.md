# АрхиБорд (ArchiBoard) — engineering conventions

Static, backend-less PoC web app. Product spec: [docs/CONCEPT.md](docs/CONCEPT.md). Build log: [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md).
Read both before working. Implement only the task you were given; do not refactor other modules.

## Stack (fixed — do not add alternatives)
- Vite + React + TypeScript (strict) — `npm run build` must pass with zero TS errors.
- Tailwind CSS v4 via `@tailwindcss/vite`; design tokens as CSS variables in `src/styles/index.css`.
- `react-router` with **HashRouter** (GitHub Pages friendly). Vite `base: './'`.
- `zustand` (+ `persist` middleware, localStorage key `archiboard-v1`) for user-created state only.
  Seed data is plain typed TS modules in `src/data/` and is never mutated.
- Icons: `lucide-react`. Fonts: `@fontsource-variable/source-serif-4` (headings), `@fontsource-variable/inter` (UI) — both with Cyrillic.
- Charts: hand-written SVG components in `src/components/charts/`. **No chart libraries.**
- No other runtime dependencies without the orchestrator's approval.

## Folder layout
```
src/
  main.tsx, App.tsx            routes
  styles/index.css             tailwind + tokens (light/dark)
  domain/types.ts              ALL domain types (single source of truth)
  data/*.ts, data/index.ts     seed data + lookup helpers (getProject(id) …)
  store/                       zustand stores (persisted user state)
  lib/                         format.ts (sr-Cyrl formatting), models (e.g. carbonModel.ts)
  components/ui/               primitives (Card, Badge, Button, Tabs, Sheet, Stat, ProgressBar, …)
  components/charts/           SVG charts
  components/layout/           AppShell, Sidebar, BottomNav, PageHeader
  components/ai/               AI demo primitives (AiBadge, ThinkingDots, StreamingText)
  components/feedback/         FeedbackWidget
  features/<module>/           one folder per module (pages + module components)
```
Reuse primitives from `components/` — don't re-implement cards/badges/charts inside features.

## Language & copy rules (important)
- All user-visible text is **Serbian, Cyrillic script (ћирилица)**, written as an architect in Serbia would write it.
- Serbian Cyrillic only: use ђ ј љ њ ћ џ. **Never** use Russian-only letters ы э ъ ё щ й (a check script enforces this).
- Allowed Latin: proper names of schemes/standards/products/units (DGNB, LEED, BREEAM, EDGE, EPD, LCA, CLT, BIM, PV, CEM III, kWh, kgCO₂e, m², SRPS EN), and `АИ` is written in Cyrillic.
- Use the domain vocabulary in docs/CONCEPT.md §3 (ИДР, ПГД, ПЗИ, ПИО, локацијски услови, индекс заузетости …).
- Numbers/dates: always via `src/lib/format.ts` (`Intl` with `sr-Cyrl-RS`): `18.400 m²`, `0,35`, `9. октобар 2026.`
- Code identifiers, comments and file names are English. Route slugs are Latin transliteration (`/projekti/:id/varijante`).
- AI features are scripted demos and must be visibly labelled with `<AiBadge />` („АИ асистент · демо“).

## Design rules
- "Calm editorial" architectural-studio look: generous whitespace, serif headings, muted earth/green palette,
  hairline borders, few shadows, restrained colour used for meaning (status, KPI good/bad).
- Use only token colours (`bg-surface`, `text-ink`, `text-muted`, `border-line`, `accent`, status colours …) — no raw hex in features.
- Light and dark themes both must look right.
- **Mobile-first**: design at 375px wide first, then enhance for ≥768px and ≥1024px. No horizontal page scroll
  (wide tables become stacked cards on mobile or scroll inside their own container). Tap targets ≥ 40px.
- Every routed page renders `<FeedbackWidget moduleId="…" />` at the bottom (moduleId = stable kebab-case id).

## Verification (run before reporting done)
```
npm run build          # tsc + vite build, must pass
npm run check:copy     # fails on Russian-only Cyrillic letters in src/
npm run check:data     # referential integrity + invariants of seed data
npm run check:model    # what-if model: every seed option reproduced + flagship storyline (358/329/340/333)
```
Seed data (`src/data/`) is read-only for feature steps: read it through helpers in `src/data/index.ts` and
`src/store/selectors.ts`; if you need a new helper, add it there. `DEMO_TODAY` (`src/lib/dates.ts`) is „today“.
Do not start long-running dev servers; a dev server normally runs on http://localhost:5173 (check with
`curl -s localhost:5173 >/dev/null && echo up`). Visually verify your pages with
`node scripts/shot.mjs /tmp/claude-503/shots 375 light /projekti/savski-kej/pregled` (also 1280 and dark), then Read
the JPEG segments. Fix what looks wrong before reporting. Do not commit or push.
