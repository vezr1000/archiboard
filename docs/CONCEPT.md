# ArchiBoard — Product Concept (PoC)

> Working name in UI: **АрхиБорд** (subtitle: „Одбор за одрживу архитектуру“).
> Audience: senior architects and partners at high-profile architecture firms in Serbia / the region.
> Purpose of the PoC: an **ideation demo**. The presenter walks architects through it (mostly on a phone) and
> collects which features they find valuable. Breadth matters, plus 2–3 deep interactive "wow" moments.

## 1. Product idea in one paragraph

Sustainable building projects fail quietly: carbon and energy ambitions set at concept stage erode decision by
decision, and nobody sees it until the energy passport (енергетски пасош) or the certification audit.
АрхиБорд is the **firm's sustainability design board in a pocket**: a portfolio view for the board (partners,
sustainability lead) and a project cockpit for the project architect. It keeps the site constraints, regulations,
targets, design options, decisions, documents, stakeholders and team of every project in one place, and it runs
**stage-gate reviews** that check each project against its sustainability targets before it moves to the next phase.

## 2. Personas (all fictional)

| Persona | Role | What they want |
|---|---|---|
| **Јелена Марковић** | Partner, chair of the design board | Portfolio health at a glance, upcoming gates, which projects drift from targets |
| **Никола Петровић** | Sustainability lead (DGNB Consultant, лиценца ИКС 381) | Carbon/energy KPIs, certification credits, EPDs, LCA |
| **Ана Јовановић** | Project architect (лиценца ИКС 300) on the flagship project | Constraints, options, documents, stakeholder obligations, tasks before the gate |

The firm: **Студио Градина** (fictional), ~60 people, offices in Belgrade and Novi Sad.

## 3. Domain grounding (Serbia + EU)

Credibility with architects depends on using the real vocabulary. Use these terms (Cyrillic):

- **Phases (Serbian design documentation):** Пројектни задатак → **ИДР** (идејно решење) → **ПГД** (пројекат за грађевинску дозволу)
  → **ПЗИ** (пројекат за извођење) → Градња → **ПИО** (пројекат изведеног објекта) → Употреба.
- **Permits / procedure:** локацијски услови, грађевинска дозвола, употребна дозвола, технички преглед,
  обједињена процедура (ЦЕОП / еДозволе).
- **Urban plans:** ПГР (план генералне регулације), ПДР (план детаљне регулације), ГУП.
  Urban parameters: индекс заузетости, индекс изграђености, спратност (нпр. П+6+Пс), висина венца,
  % зелених површина / % зелених површина на тлу, паркинг норматив, грађевинска линија, регулациона линија.
- **Laws & rulebooks:** Закон о планирању и изградњи; Закон о енергетској ефикасности и рационалној употреби енергије (2021);
  Правилник о енергетској ефикасности зграда; Правилник о условима, садржини и начину издавања сертификата о енергетским
  својствима зграда (енергетски пасош, класе **A+ … G**, нове зграде минимум **C**); Закон о коришћењу обновљивих извора енергије
  (купац-произвођач / prosumer); seismic design per SRPS EN 1998 (Еврокод 8).
- **EU alignment:** EU Taxonomy (climate mitigation criteria for new buildings: PED ≥10% below NZEB; GWP disclosure for >5000 m²),
  EPBD recast (zero-emission buildings, whole-life GWP), Level(s) framework, Green Agenda for the Western Balkans.
- **Certification schemes used in Serbia:** DGNB, LEED v4.1, BREEAM, **EDGE** (IFC — very common in Serbia), WELL.
- **Local climate/site concerns:** urban heat island (Београд), кошава (strong SE wind), flood risk along Сава/Дунав/Нишава
  (memory of 2014 floods), loess soils in Војводина, higher seismic exposure around Ниш, PM10/PM2.5 air quality in winter,
  district heating (даљинско грејање) availability.
- **Engineering licences (ИКС — Инжењерска комора Србије):** 300 (одговорни пројектант архитектонских пројеката),
  381 (одговорни инжењер за енергетску ефикасност зграда).
- **Units/format:** kgCO₂e/m², kWh/m²a, m², €. Serbian number format: `18.400 m²`, `0,35`. Dates in Serbian Cyrillic.

## 4. Demo dataset

All data is fictional but plausible. Six projects:

| # | Project | City | Typology | GFA | Phase | Target | Role in demo |
|---|---|---|---|---|---|---|---|
| 1 | **Савски кеј — блок Ц** | Београд | Стамбено-пословни, хибридна дрвена конструкција (CLT + АБ језгро) | ~18.400 m² | ПГД | DGNB Gold + EU Taxonomy | **Flagship** — every module fully populated |
| 2 | **ОШ „Ново насеље“ — енергетска обнова** | Нови Сад | Образовни, дубока енергетска реконструкција | ~6.200 m² | ПЗИ | EDGE Advanced, класа B → A | Retrofit story |
| 3 | **Парк на Нишави** | Ниш | Јавни простор, плаво-зелена инфраструктура | ~4,2 ha | ИДР | Biodiversity / stormwater targets | Non-building project |
| 4 | **Пословни центар „Блок 42“** | Нови Београд | Пословни | ~24.000 m² | Градња | BREEAM Excellent | Construction-phase tracking |
| 5 | **Вртић „Бубамара“** | Ниш | Предшколски, пасивна кућа | ~1.900 m² | Пројектни задатак | Passivhaus / nZEB | Early-stage ambitions |
| 6 | **Стара пивара — пренамена** | Нови Сад | Адаптивна поновна употреба индустријског објекта | ~9.800 m² | ИДР | LEED Gold, циркуларност | Circularity / reuse story |

Projects must show a mix of health states (on track / at risk / off track) so the portfolio view is interesting.

## 5. Information architecture

Mobile: bottom tab bar with 5 entries. Desktop (≥1024px): left sidebar. Project modules are tabs inside the project
cockpit (horizontally scrollable chip bar on mobile).

```
/                         Портфолио (board home)
/projekti                 Пројекти (list, filters)
/projekti/:id             Пројекат → tabs:
   pregled                  Преглед
   lokacija                 Локација и услови
   ciljevi                  Циљеви и KPI
   varijante                Варијанте (★ deep)
   sertifikacija            Сертификација
   materijali               Материјали и циркуларност
   dokumenta                Документација
   odluke                   Одлуке
   rizici                   Ризици
   akteri                   Заинтересоване стране
   tim                      Тим
/odbor                    Одбор: sessions list
/odbor/:sessionId         Gate review (★ deep)
/smernice                 Смернице и прописи (library + AI Q&A ★)
/materijali               EPD библиотека (global)
/tim                      Тим фирме (people, competencies, workload)
/povratne-informacije     Демо: feedback summary (presenter tool)
```

Mobile bottom tabs: Портфолио · Пројекти · Одбор · Смернице · Више (sheet with Материјали, Тим, Повратне информације, theme).

## 6. Feature specs

### 6.1 Портфолио (board home)
- Greeting + date, firm name.
- Portfolio KPI strip: number of active projects, total GFA, area-weighted average embodied carbon vs firm target,
  % of projects on track, upcoming gates in next 30 days.
- Project cards: name, city, phase pill, health dot, 3 mini KPI bars (embodied carbon, operational energy, cert score),
  next gate date. Tap → project cockpit.
- "Захтева пажњу" (needs attention) list: e.g. „Савски кеј: уграђени угљеник 12% изнад циља након промене фасаде“.
- Upcoming board sessions (next 3).
- A "carbon budget" chart: per project, target vs current embodied carbon (horizontal bars).

### 6.2 Project cockpit — Преглед
- Header: name, address, typology, GFA, client, phase, certification target, health.
- Phase timeline (ИДР → ПГД → ПЗИ → Градња → ПИО → Употреба) with gate markers Г0–Г5 and the current position.
- KPI tiles: current vs target with trend sparkline across phases.
- Latest decisions (3), top risks (3), open conditions from the last gate, next gate checklist progress.
- Recent activity feed.

### 6.3 Локација и услови (site & constraints)
- Site card: location (stylised SVG mini-map, no external map tiles), parcel number (кат. парцела), plan (ПДР/ПГР name).
- Climate panel: HDD/CDD, annual solar irradiation, design temperatures, prevailing wind (кошава) as a wind rose,
  UHI intensity, air quality.
- Hazards: flood zone, seismic (ag / MCS intensity), soil (лес etc.), groundwater.
- **Урбанистички параметри**: table of limit vs design value with status (индекс заузетости, изграђености, спратност,
  висина, % зеленила, паркинг).
- **Услови и ограничења** checklist: each requirement with source (локацијски услови / ПДР / закон / сертификација /
  пројектни задатак), status (усклађено / ризик / неусклађено / непроверено).
- **AI moment**: button „Извуци услове из локацијских услова (PDF)“ → simulated upload + progressive "analysing" animation →
  shows 6–8 extracted conditions with page references, which the user can accept into the checklist.
  Labelled clearly as "АИ асистент (демо)".

### 6.4 Циљеви и KPI
- KPI definitions with benchmarks: Serbian regulatory minimum, EU Taxonomy threshold, firm target, project target.
- KPIs: уграђени угљеник (A1–A3 and A1–C4, kgCO₂e/m²), оперативна енергија / примарна енергија (kWh/m²a), енергетски разред,
  удео ОИЕ (%), потрошња воде (l/особи/дан), зелене површине (%), фактор биотопа / biodiversity, дневно светло (%
  простора са DF ≥ 2%), топлотни комфор (h прегревања).
- Per KPI: chart of value across phases vs target band. "Ambition level" selector (минимум / добра пракса / предводник).

### 6.5 ★ Варијанте (design options + what-if) — DEEP
- Compare 2–4 options side by side (e.g. А: АБ скелет + ETICS; Б: CLT + АБ језгро + вентилисана фасада; В: хибрид + повећан PV).
- Each option: parameters and results (embodied carbon, operational energy, energy class, cost €/m² delta, cert points,
  daylight, construction time).
- **Live what-if calculator**: sliders/selects for structure system, facade type, insulation thickness, glazing ratio,
  PV area, heating system, % reused/recycled materials, concrete mix (CEM I vs CEM III / low-clinker).
  Results update instantly with animated gauges; shows delta vs selected option and vs target; energy class badge;
  "EU Taxonomy" pass/fail chip.
- Transparent model: "Како рачунамо" expandable panel showing simplified formulas and coefficients (it's a demo model,
  say so).
- "Сачувај као варијанту" adds a new option card (persisted in localStorage). "Предложи одбору" creates a draft decision.

### 6.6 Сертификација
- Scheme-specific credit tracker (DGNB for flagship: categories ENV, ECO, SOC, TEC, PRO, SITE with weights).
- Per category: max / targeted / achieved / at-risk points, stacked bars; overall score ring with award thresholds
  (Silver / Gold / Platinum).
- Criteria list with owner, evidence document link, status.

### 6.7 Материјали и циркуларност
- Material passport: building layers (конструкција, фасада, кров, унутрашњост, инсталације) → materials with quantity,
  GWP, EPD source, origin distance (km), recycled content, reuse potential, disassembly-friendly flag.
- Embodied carbon "hotspots" chart (by element).
- Circularity indicators: % reused, % recyclable, % bio-based, local (<300 km).
- Swap suggestion (scripted): "Замени CEM I бетон за CEM III/A: −18 t CO₂e".
- Global `/materijali`: EPD library with search & filters (category, GWP range, origin).

### 6.8 Документација (artifact register)
- List of artifacts: title, type (цртеж, елаборат ЕЕ, LCA извештај, енергетски модел, BIM модел, геомеханички елаборат,
  локацијски услови, сагласност), discipline, version, status (у изради / на ревизији / одобрено / замењено), owner,
  updated, required for gate Гx.
- Filters by status/type/gate; version history drawer per document.
- Gate readiness: "for Г2 you are missing 2 of 11 artifacts".

### 6.9 Одлуке (decision log)
- Design Decision Records: title, date, context, options considered, decision, rationale, sustainability impact
  (Δ carbon, Δ energy), decided by (board session), conditions, status.
- Timeline view.

### 6.10 Ризици
- Risk register: probability × impact heat map (5×5), list with owner, mitigation, status, category
  (регулаторни, технички, трошковни, временски, климатски, ланац снабдевања).

### 6.11 Заинтересоване стране
- Influence/interest grid (2×2 with dots), stakeholder list: инвеститор, Секретаријат за урбанизам, Завод за заштиту
  споменика културе, ЈКП (Београдски водовод, Београдске електране), ЕПС Дистрибуција, станари суседних зграда,
  градска општина, банка (зелени кредит), извођач.
- Engagement log (meetings, letters, approvals), obligations and next actions; attitude (подржава / неутралан / противи се).

### 6.12 Тим
- Project team with roles, ИКС licences, certifications (DGNB Consultant, LEED AP, EDGE Expert, Passivhaus Designer),
  allocation %.
- Global `/tim`: firm people, competency matrix, workload across projects (overallocation warning).

### 6.13 ★ Одбор — gate review — DEEP
- Sessions list (past + upcoming) with outcomes.
- **Gate review flow** (stepper, works on mobile):
  1. Припрема — project, gate (e.g. Г2 ПГД), members, agenda.
  2. Документација — required artifacts checklist (auto-derived from register; missing ones flagged).
  3. KPI провера — each KPI vs gate threshold, pass / warn / fail.
  4. **АИ пре-ревизија (демо)** — scripted findings with severity and references (e.g. "Индекс заузетости 0,49 —
     граница ПДР 0,50, маргина 2%"; "LCA извештај не покрива фазе C1–C4"; "EDGE: недостаје прорачун воде").
  5. Дискусија и услови — add conditions (owner, due date).
  6. Одлука — each board member votes; outcome Одобрено / Одобрено уз услове / Враћено на дораду; generates decision
     record + "Записник" (minutes) preview.
- Result persisted (localStorage) and visible in the project decision log and timeline.

### 6.14 ★ Смернице и прописи (knowledge library + AI Q&A)
- Library of regulations, standards, certification manuals and **firm guidelines** (e.g. „Смернице за пасивно пројектовање
  у панонској клими“, „Стандард фирме за LCA“, „Чек-листа за кошаву и јужне фасаде“).
- Each entry: type, jurisdiction, summary, key requirements, which projects it applies to.
- Search + filter chips.
- **Питај АрхиБорд (демо)**: chat-like panel with 5–6 suggested questions; scripted answers stream in with citations to
  library entries (e.g. „Која је минимална енергетска класа за нову стамбену зграду?“ → „C …“).

### 6.15 Демо: Повратне информације (presenter tool)
- Every module/page has an unobtrusive „Да ли бисте ово користили?“ control (👍 / 😐 / 👎 + optional note).
- Stored in localStorage. `/povratne-informacije` shows a ranked summary per module and allows **export to CSV/JSON**
  and reset. The presenter can also tag a session with the architect's firm name ("Сесија: …").
- This is how the user learns which features architects value.

## 7. AI moments (scripted, no backend)
Always visually marked „АИ асистент · демо“. Deterministic, scripted outputs with a short "thinking" animation
(1–2 s) and streaming text. Never claim real analysis.

## 8. Non-goals
No backend, no auth, no real file upload processing, no real maps, no real BIM viewer. No i18n framework (Serbian only).
