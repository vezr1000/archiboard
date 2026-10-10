# АрхиБорд (ArchiBoard)

АрхиБорд is a clickable proof-of-concept for an architecture studio's project cockpit. It follows one fictional
Serbian studio (Студио Градина) through portfolio, design variants with a carbon/energy "what if" calculator, gate
reviews with a board, a regulations library and a materials (EPD) library, and it ends with a presenter tool that
collects audience feedback. It is a static front-end only: no backend, no real data, no real AI.

**Live demo:** https://vezr1000.github.io/archiboard/

## Features

**Portfolio**
- Portfolio dashboard with attention items and project cards; project list.

**Project cockpit (tabs)**
- Overview, site and location requirements (with AI extraction demo), goals and KPIs, certification tracker.
- Design variants with the what-if calculator (carbon and energy) and option saving / proposals.
- Materials and circularity (project passport, replacement suggestions), documentation register, decisions, risks.
- Stakeholders and project team.

**Board and gate review**
- Board sessions overview and calendar; six-step gate review with AI pre-review, voting and generated minutes.

**Knowledge library and Q&A**
- Regulations and firm guidelines library with detail pages; scripted "Питај АрхиБорд" Q&A.

**Materials library**
- Global EPD library with filters and comparison.

**Team**
- Firm people, workload across projects and competency matrix.

**Feedback tool (presenter)**
- Feedback widget at the bottom of every page; summary page with session labels, per-module ranking, notes,
  CSV/JSON export and reset.

## Suggested demo path (about 5 minutes)

Портфолио → Савски кеј → Варијанте калкулатор → Одбор Г2 ревизија → Питај АрхиБорд → Повратне информације

## Tech stack

Vite, React 19, TypeScript (strict), Tailwind CSS v4, react-router (HashRouter), zustand (persisted user state in
localStorage), lucide-react icons, hand-written SVG charts. Serbian Cyrillic UI copy.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build
npm run check:copy # no Russian-only Cyrillic letters in src/
npm run check:data # referential integrity of seed data
npm run check:model # what-if model reproduces the seed options and the flagship storyline
```

## Deployment

Pushing to `main` deploys the app to GitHub Pages via `.github/workflows/pages.yml`.

## Data and AI disclaimer

All data (studio, projects, people, suppliers, regulations references and measurements) is fictional and for demo
purposes only. Regulatory statements are simplified summaries and must not be used for design decisions. All AI
features (requirement extraction, pre-review, Q&A, replacement suggestions) are scripted demos, not live models.
