import type { KpiDefinition, ProjectKpi } from '@/domain/types';

/**
 * KPI definitions with benchmarks, in display order.
 *
 * Conventions (also stated in the descriptions, so the UI can show them):
 * - Embodied carbon per m² БРГП (above-ground GFA); for the park per m² of intervention area.
 *   GWP = fossil A1–A3 per EN 15804+A2 (GWP-fossil). Biogenic carbon in timber is NOT credited (no −1/+1).
 * - `operational-energy` is the annual heating need Qh,nd — the basis of the Serbian energy-passport class.
 *   Class limits for a new multi-family residential building (Qh,nd,max = 60 kWh/m²a = class C):
 *   B ≤ 50 %, A ≤ 25 %, A+ ≤ 15 % of the maximum.
 * - For lower-better KPIs `regulatoryMin` holds the regulatory MAXIMUM (the limit that must not be exceeded).
 * - Serbia has not yet published numeric nZEB values; the firm uses an interim reference for the
 *   EU Taxonomy primary-energy check (see `primary-energy`).
 */
export const kpiDefinitions: KpiDefinition[] = [
  {
    id: 'embodied-carbon',
    label: 'Уграђени угљеник (A1–A3)',
    shortLabel: 'Уграђени угљеник',
    unit: 'kgCO₂e/m²',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { firmTarget: 350, bestPractice: 250 },
    description:
      'Емисије из производње грађевинских материјала (модули A1–A3 по EN 15978), по m² БРГП. Рачуна се ' +
      'фосилни GWP из EPD-ова по EN 15804+A2; биогени угљеник у дрвету се не одбија. Типично: АБ стамбена ' +
      'зграда 380–480, хибридна дрвена 230–320 kgCO₂e/m². Пропис у Србији још не поставља граничну вредност.',
  },
  {
    id: 'embodied-carbon-wlc',
    label: 'Угљеник у животном циклусу (A1–C4, без B6)',
    shortLabel: 'Угљеник A1–C4',
    unit: 'kgCO₂e/m²',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { firmTarget: 550, bestPractice: 400 },
    description:
      'Уграђени угљеник у целом животном циклусу (A1–A5, B1–B5, C1–C4) за референтни период од 50 година, без ' +
      'оперативне енергије (B6). Модул D се приказује одвојено. EU таксономија и ревидирана EPBD захтевају ' +
      'прорачун и обелодањивање ове вредности, али још не прописују граничну вредност.',
  },
  {
    id: 'operational-energy',
    label: 'Потребна енергија за грејање (Qh,nd)',
    shortLabel: 'Енергија за грејање',
    unit: 'kWh/m²a',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { regulatoryMin: 60, firmTarget: 30, bestPractice: 15 },
    description:
      'Годишња потребна енергија за грејање по m² корисне површине, прорачун по Правилнику о енергетској ' +
      'ефикасности зграда. За нову стамбену зграду са више станова максимум је 60 kWh/m²a (разред C); разред B ' +
      'захтева ≤ 50 %, A ≤ 25 %, A+ ≤ 15 % те вредности. Passivhaus: ≤ 15 kWh/m²a.',
  },
  {
    id: 'primary-energy',
    label: 'Примарна енергија',
    shortLabel: 'Примарна енергија',
    unit: 'kWh/m²a',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { euTaxonomy: 90, firmTarget: 80, bestPractice: 60 },
    description:
      'Годишња примарна енергија (грејање, хлађење, вентилација, топла вода, помоћна енергија). EU таксономија ' +
      'тражи вредност најмање 10 % испод nZEB захтева. Док Србија не објави нумеричке nZEB вредности, фирма ' +
      'користи интерну референцу од 100 kWh/m²a, па је праг таксономије 90 kWh/m²a.',
  },
  {
    id: 'energy-class',
    label: 'Енергетски разред (енергетски пасош)',
    shortLabel: 'Енергетски разред',
    unit: '',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { regulatoryMin: 4, firmTarget: 3, bestPractice: 1 },
    description:
      'Разред из енергетског пасоша (A+ … G), кодиран бројем: A+ = 1, A = 2, B = 3, C = 4 … G = 8. ' +
      'Нове зграде морају да имају најмање разред C; при реконструкцији се захтева побољшање за најмање један разред.',
  },
  {
    id: 'renewable-share',
    label: 'Удео обновљивих извора (ОИЕ)',
    shortLabel: 'Удео ОИЕ',
    unit: '%',
    direction: 'higher-better',
    decimals: 0,
    benchmarks: { firmTarget: 30, bestPractice: 50 },
    description:
      'Удео финалне енергије зграде покривен из обновљивих извора на локацији или у близини (PV, амбијентална ' +
      'енергија топлотних пумпи). PV се по правилу прикључује по моделу купца-произвођача.',
  },
  {
    id: 'water',
    label: 'Потрошња питке воде',
    shortLabel: 'Вода',
    unit: 'l/особи/дан',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { firmTarget: 90, bestPractice: 75 },
    description:
      'Процењена потрошња питке воде по кориснику дневно. Референца за стамбене зграде у Београду је око ' +
      '110 l/особи/дан; смањење кроз арматуре ниског протока и коришћење кишнице за испирање WC и заливање. ' +
      'За школе и пословне зграде вредност је по ученику / запосленом.',
  },
  {
    id: 'stormwater-retention',
    label: 'Задржавање атмосферских вода на парцели',
    shortLabel: 'Атмосферске воде',
    unit: '%',
    direction: 'higher-better',
    decimals: 0,
    benchmarks: { firmTarget: 60, bestPractice: 85 },
    description:
      'Удео годишњих падавина који се задржава, упија или поново користи на парцели (зелени кровови, ретензије, ' +
      'кишни вртови, пропусни застори) уместо испуштања у јавну канализацију.',
  },
  {
    id: 'green-area',
    label: 'Зелене површине',
    shortLabel: 'Зеленило',
    unit: '%',
    direction: 'higher-better',
    decimals: 0,
    benchmarks: { regulatoryMin: 30, firmTarget: 40, bestPractice: 50 },
    description:
      'Удео зелених површина у површини парцеле, укључујући зелене кровове над подземним етажама. Минимум у ' +
      'табели је типична вредност из ПДР за стамбене блокове; тачан захтев је у урбанистичким параметрима пројекта.',
  },
  {
    id: 'biotope-factor',
    label: 'Фактор биотопа (BAF)',
    shortLabel: 'Фактор биотопа',
    unit: '',
    direction: 'higher-better',
    decimals: 2,
    benchmarks: { firmTarget: 0.45, bestPractice: 0.6 },
    description:
      'Пондерисани удео еколошки ефективних површина (тло, зелени кровови, зелени зидови, пропусни застори) у ' +
      'површини парцеле, по берлинској методологији (Biotopflächenfaktor). Берлин тражи 0,60 за становање.',
  },
  {
    id: 'daylight',
    label: 'Дневно светло (DF ≥ 2 %)',
    shortLabel: 'Дневно светло',
    unit: '%',
    direction: 'higher-better',
    decimals: 0,
    benchmarks: { firmTarget: 75, bestPractice: 90 },
    description:
      'Удео корисне површине боравишних просторија са фактором дневног светла ≥ 2 %, према симулацији ' +
      '(методологија у складу са EN 17037).',
  },
  {
    id: 'overheating',
    label: 'Летње прегревање',
    shortLabel: 'Прегревање',
    unit: 'h/год',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { firmTarget: 100, bestPractice: 50 },
    description:
      'Број сати у години када оперативна температура у најнеповољнијој просторији прелази горњу границу ' +
      'категорије II по EN 16798-1 (без активног хлађења). Протокол фирме: динамичка симулација са климатским ' +
      'фајлом за 2050. годину.',
  },
];

/**
 * Per-project KPI values. `history` has one point per phase reached (the last point = current value, in the
 * project's current phase). Status is computed with `kpiStatus()` unless set explicitly.
 */
export const projectKpis: ProjectKpi[] = [
  /* ================================ Савски кеј — блок Ц (ПГД) ================================ */
  {
    projectId: 'savski-kej',
    kpiId: 'embodied-carbon',
    target: 320,
    current: 358,
    history: [
      { phase: 'zadatak', value: 335 },
      { phase: 'idr', value: 312 },
      { phase: 'pgd', value: 358 },
    ],
    note:
      'Пре промене фасаде 329 kgCO₂e/m²; замена дрвене облоге алуминијумским панелима (јун 2026) додала је ' +
      '+29 kgCO₂e/m². Тренутно 12 % изнад циља.',
  },
  {
    projectId: 'savski-kej',
    kpiId: 'embodied-carbon-wlc',
    target: 520,
    current: 568,
    history: [
      { phase: 'zadatak', value: 560 },
      { phase: 'idr', value: 505 },
      { phase: 'pgd', value: 568 },
    ],
    note: 'Модули C1–C4 процењени по подразумеваним сценаријима — LCA извештај v2.0 их још не покрива.',
  },
  {
    projectId: 'savski-kej',
    kpiId: 'operational-energy',
    target: 28,
    current: 27,
    history: [
      { phase: 'zadatak', value: 35 },
      { phase: 'idr', value: 26 },
      { phase: 'pgd', value: 27 },
    ],
    note: 'Елаборат ЕЕ v1.2 — разред B (45 % од максимално дозвољене вредности).',
  },
  {
    projectId: 'savski-kej',
    kpiId: 'primary-energy',
    target: 75,
    current: 72,
    history: [
      { phase: 'zadatak', value: 95 },
      { phase: 'idr', value: 74 },
      { phase: 'pgd', value: 72 },
    ],
  },
  {
    projectId: 'savski-kej',
    kpiId: 'energy-class',
    target: 3,
    current: 3,
    history: [
      { phase: 'zadatak', value: 4 },
      { phase: 'idr', value: 3 },
      { phase: 'pgd', value: 3 },
    ],
  },
  {
    projectId: 'savski-kej',
    kpiId: 'renewable-share',
    target: 30,
    current: 28,
    history: [
      { phase: 'zadatak', value: 20 },
      { phase: 'idr', value: 31 },
      { phase: 'pgd', value: 28 },
    ],
    note: 'PV смањен са 160 на 120 kWp након поделе крова између PV и зеленог крова (одлука из јануара 2026).',
  },
  {
    projectId: 'savski-kej',
    kpiId: 'water',
    target: 85,
    current: 84,
    history: [
      { phase: 'zadatak', value: 105 },
      { phase: 'idr', value: 92 },
      { phase: 'pgd', value: 84 },
    ],
    note: 'Кишница (резервоар 60 m³) за испирање WC у пословном делу и заливање дворишта.',
  },
  {
    projectId: 'savski-kej',
    kpiId: 'stormwater-retention',
    target: 70,
    current: 74,
    history: [
      { phase: 'zadatak', value: 50 },
      { phase: 'idr', value: 64 },
      { phase: 'pgd', value: 74 },
    ],
  },
  {
    projectId: 'savski-kej',
    kpiId: 'green-area',
    target: 40,
    current: 41,
    history: [
      { phase: 'zadatak', value: 35 },
      { phase: 'idr', value: 42 },
      { phase: 'pgd', value: 41 },
    ],
    note: 'Од тога 15,8 % на природном тлу (минимум по ЛУ 15 %).',
  },
  {
    projectId: 'savski-kej',
    kpiId: 'biotope-factor',
    target: 0.45,
    current: 0.42,
    history: [
      { phase: 'zadatak', value: 0.4 },
      { phase: 'idr', value: 0.47 },
      { phase: 'pgd', value: 0.42 },
    ],
    note: 'Пад због PV панела на делу крова који је у ИДР био екстензивни зелени кров.',
  },
  {
    projectId: 'savski-kej',
    kpiId: 'daylight',
    target: 75,
    current: 78,
    history: [
      { phase: 'idr', value: 81 },
      { phase: 'pgd', value: 78 },
    ],
  },
  {
    projectId: 'savski-kej',
    kpiId: 'overheating',
    target: 100,
    current: 108,
    history: [
      { phase: 'idr', value: 74 },
      { phase: 'pgd', value: 108 },
    ],
    note:
      'Најнеповољнији стан: ЈЗ угао, 8. спрат. ИДР — поједностављени модел; ПГД — динамичка симулација са ' +
      'климом 2050. Ефекат спољне засене још није потврђен (симулација у изради).',
  },

  /* ================================ ОШ „Ново насеље“ (ПЗИ) ================================ */
  {
    projectId: 'os-novo-naselje',
    kpiId: 'embodied-carbon',
    target: 120,
    current: 98,
    history: [
      { phase: 'zadatak', value: 140 },
      { phase: 'idr', value: 112 },
      { phase: 'pgd', value: 101 },
      { phase: 'pzi', value: 98 },
    ],
    note: 'Само материјали обнове — постојећа АБ конструкција се задржава и не урачунава.',
  },
  {
    projectId: 'os-novo-naselje',
    kpiId: 'embodied-carbon-wlc',
    target: 230,
    current: 205,
    history: [
      { phase: 'zadatak', value: 250 },
      { phase: 'idr', value: 214 },
      { phase: 'pgd', value: 208 },
      { phase: 'pzi', value: 205 },
    ],
  },
  {
    projectId: 'os-novo-naselje',
    kpiId: 'operational-energy',
    target: 25,
    current: 24,
    history: [
      { phase: 'zadatak', value: 148 },
      { phase: 'idr', value: 34 },
      { phase: 'pgd', value: 26 },
      { phase: 'pzi', value: 24 },
    ],
    note: 'Задатак = постојеће стање (енергетски пасош 2024, разред F).',
  },
  {
    projectId: 'os-novo-naselje',
    kpiId: 'primary-energy',
    target: 75,
    current: 71,
    history: [
      { phase: 'zadatak', value: 260 },
      { phase: 'idr', value: 92 },
      { phase: 'pgd', value: 76 },
      { phase: 'pzi', value: 71 },
    ],
  },
  {
    projectId: 'os-novo-naselje',
    kpiId: 'energy-class',
    target: 2,
    current: 2,
    history: [
      { phase: 'zadatak', value: 7 },
      { phase: 'idr', value: 3 },
      { phase: 'pgd', value: 2 },
      { phase: 'pzi', value: 2 },
    ],
    note: 'Циљ подигнут са B на A после Г1, када је одобрен PV на крову фискултурне сале.',
  },
  {
    projectId: 'os-novo-naselje',
    kpiId: 'renewable-share',
    target: 35,
    current: 41,
    history: [
      { phase: 'zadatak', value: 0 },
      { phase: 'idr', value: 28 },
      { phase: 'pgd', value: 38 },
      { phase: 'pzi', value: 41 },
    ],
  },
  {
    projectId: 'os-novo-naselje',
    kpiId: 'water',
    target: 18,
    current: 17,
    history: [
      { phase: 'zadatak', value: 26 },
      { phase: 'idr', value: 20 },
      { phase: 'pgd', value: 18 },
      { phase: 'pzi', value: 17 },
    ],
    note: 'Литара по ученику дневно (EDGE методологија).',
  },
  {
    projectId: 'os-novo-naselje',
    kpiId: 'daylight',
    target: 80,
    current: 84,
    history: [
      { phase: 'zadatak', value: 71 },
      { phase: 'idr', value: 82 },
      { phase: 'pgd', value: 84 },
      { phase: 'pzi', value: 84 },
    ],
  },
  {
    projectId: 'os-novo-naselje',
    kpiId: 'overheating',
    target: 100,
    current: 64,
    history: [
      { phase: 'zadatak', value: 310 },
      { phase: 'idr', value: 120 },
      { phase: 'pgd', value: 72 },
      { phase: 'pzi', value: 64 },
    ],
    note: 'Ноћно проветравање кроз рекуперацију са бајпасом и спољне ролетне на јужним учионицама.',
  },

  /* ================================ Парк на Нишави (ИДР) ================================ */
  {
    projectId: 'park-nisava',
    kpiId: 'embodied-carbon',
    target: 18,
    current: 13,
    history: [
      { phase: 'zadatak', value: 21 },
      { phase: 'idr', value: 13 },
    ],
    note: 'По m² површине интервенције (стазе, платои, павиљон, мобилијар). Пропусни застори уместо асфалта.',
  },
  {
    projectId: 'park-nisava',
    kpiId: 'green-area',
    target: 70,
    current: 78,
    history: [
      { phase: 'zadatak', value: 66 },
      { phase: 'idr', value: 78 },
    ],
  },
  {
    projectId: 'park-nisava',
    kpiId: 'biotope-factor',
    target: 0.7,
    current: 0.74,
    history: [
      { phase: 'zadatak', value: 0.62 },
      { phase: 'idr', value: 0.74 },
    ],
  },
  {
    projectId: 'park-nisava',
    kpiId: 'stormwater-retention',
    target: 85,
    current: 88,
    history: [
      { phase: 'zadatak', value: 70 },
      { phase: 'idr', value: 88 },
    ],
    note: 'Укључује воду са 6,5 ha околних улица усмерену у биоретенције.',
  },

  /* ================================ Блок 42 (Градња) ================================ */
  {
    projectId: 'blok-42',
    kpiId: 'embodied-carbon',
    target: 380,
    current: 421,
    history: [
      { phase: 'zadatak', value: 430 },
      { phase: 'idr', value: 398 },
      { phase: 'pgd', value: 384 },
      { phase: 'pzi', value: 377 },
      { phase: 'gradnja', value: 421 },
    ],
    note:
      'Замене извођача: CEM II уместо CEM III/A у таваницама (+21), зид-завеса другог добављача (+14), ' +
      'генеричке вредности за производе без EPD (+9).',
  },
  {
    projectId: 'blok-42',
    kpiId: 'embodied-carbon-wlc',
    target: 600,
    current: 652,
    history: [
      { phase: 'zadatak', value: 670 },
      { phase: 'idr', value: 628 },
      { phase: 'pgd', value: 605 },
      { phase: 'pzi', value: 598 },
      { phase: 'gradnja', value: 652 },
    ],
  },
  {
    projectId: 'blok-42',
    kpiId: 'operational-energy',
    target: 22,
    current: 22,
    history: [
      { phase: 'zadatak', value: 30 },
      { phase: 'idr', value: 24 },
      { phase: 'pgd', value: 22 },
      { phase: 'pzi', value: 21 },
      { phase: 'gradnja', value: 22 },
    ],
  },
  {
    projectId: 'blok-42',
    kpiId: 'primary-energy',
    target: 90,
    current: 96,
    history: [
      { phase: 'zadatak', value: 120 },
      { phase: 'idr', value: 98 },
      { phase: 'pgd', value: 91 },
      { phase: 'pzi', value: 89 },
      { phase: 'gradnja', value: 96 },
    ],
  },
  {
    projectId: 'blok-42',
    kpiId: 'energy-class',
    target: 3,
    current: 3,
    history: [
      { phase: 'zadatak', value: 4 },
      { phase: 'idr', value: 3 },
      { phase: 'pgd', value: 3 },
      { phase: 'pzi', value: 3 },
      { phase: 'gradnja', value: 3 },
    ],
  },
  {
    projectId: 'blok-42',
    kpiId: 'renewable-share',
    target: 20,
    current: 12,
    history: [
      { phase: 'zadatak', value: 10 },
      { phase: 'idr', value: 18 },
      { phase: 'pgd', value: 21 },
      { phase: 'pzi', value: 22 },
      { phase: 'gradnja', value: 12 },
    ],
    note: 'PV смањен са 180 на 95 kWp у оквиру вредносног инжењеринга извођача (без сагласности одбора).',
  },
  {
    projectId: 'blok-42',
    kpiId: 'water',
    target: 16,
    current: 15,
    history: [
      { phase: 'zadatak', value: 22 },
      { phase: 'idr', value: 18 },
      { phase: 'pgd', value: 16 },
      { phase: 'pzi', value: 15 },
      { phase: 'gradnja', value: 15 },
    ],
    note: 'Литара по запосленом дневно.',
  },
  {
    projectId: 'blok-42',
    kpiId: 'daylight',
    target: 70,
    current: 72,
    history: [
      { phase: 'zadatak', value: 66 },
      { phase: 'idr', value: 71 },
      { phase: 'pgd', value: 72 },
      { phase: 'pzi', value: 72 },
      { phase: 'gradnja', value: 72 },
    ],
  },

  /* ================================ Вртић „Бубамара“ (Пројектни задатак) ================================ */
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'embodied-carbon',
    target: 260,
    current: 230,
    history: [{ phase: 'zadatak', value: 230 }],
    note: 'Процена по референтним пројектима (дрвени скелет, плитки темељи, без подрума).',
  },
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'embodied-carbon-wlc',
    target: 420,
    current: 390,
    history: [{ phase: 'zadatak', value: 390 }],
  },
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'operational-energy',
    target: 15,
    current: 14,
    history: [{ phase: 'zadatak', value: 14 }],
    note: 'Прелиминарни PHPP модел (масинг из пројектног задатка).',
  },
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'primary-energy',
    target: 60,
    current: 56,
    history: [{ phase: 'zadatak', value: 56 }],
  },
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'energy-class',
    target: 1,
    current: 1,
    history: [{ phase: 'zadatak', value: 1 }],
  },
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'renewable-share',
    target: 60,
    current: 62,
    history: [{ phase: 'zadatak', value: 62 }],
  },
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'green-area',
    target: 50,
    current: 58,
    history: [{ phase: 'zadatak', value: 58 }],
  },
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'daylight',
    target: 85,
    current: 88,
    history: [{ phase: 'zadatak', value: 88 }],
  },
  {
    projectId: 'vrtic-bubamara',
    kpiId: 'overheating',
    target: 80,
    current: 70,
    history: [{ phase: 'zadatak', value: 70 }],
  },

  /* ================================ Стара пивара (ИДР) ================================ */
  {
    projectId: 'stara-pivara',
    kpiId: 'embodied-carbon',
    target: 180,
    current: 192,
    history: [
      { phase: 'zadatak', value: 165 },
      { phase: 'idr', value: 192 },
    ],
    note:
      'Преглед конструкције (август 2026) показао корозију на 30 % решеткастих носача — замена новим челиком ' +
      'и већи удео нове надоградње подигли су вредност за +27 kgCO₂e/m².',
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'embodied-carbon-wlc',
    target: 330,
    current: 351,
    history: [
      { phase: 'zadatak', value: 310 },
      { phase: 'idr', value: 351 },
    ],
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'operational-energy',
    target: 35,
    current: 38,
    history: [
      { phase: 'zadatak', value: 42 },
      { phase: 'idr', value: 38 },
    ],
    note: 'Унутрашња изолација заштићених опечних фасада ограничена на 8 cm (хигротермална анализа).',
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'primary-energy',
    target: 90,
    current: 94,
    history: [
      { phase: 'zadatak', value: 105 },
      { phase: 'idr', value: 94 },
    ],
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'energy-class',
    target: 3,
    current: 3,
    history: [
      { phase: 'zadatak', value: 4 },
      { phase: 'idr', value: 3 },
    ],
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'renewable-share',
    target: 25,
    current: 27,
    history: [
      { phase: 'zadatak', value: 20 },
      { phase: 'idr', value: 27 },
    ],
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'water',
    target: 90,
    current: 88,
    history: [
      { phase: 'zadatak', value: 105 },
      { phase: 'idr', value: 88 },
    ],
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'green-area',
    target: 20,
    current: 21,
    history: [
      { phase: 'zadatak', value: 15 },
      { phase: 'idr', value: 21 },
    ],
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'daylight',
    target: 70,
    current: 64,
    history: [
      { phase: 'zadatak', value: 62 },
      { phase: 'idr', value: 64 },
    ],
    note: 'Дубока хала (28 m) — разматрају се кровни светларници у постојећим решеткама.',
  },
  {
    projectId: 'stara-pivara',
    kpiId: 'overheating',
    target: 100,
    current: 85,
    history: [
      { phase: 'zadatak', value: 90 },
      { phase: 'idr', value: 85 },
    ],
  },
];
