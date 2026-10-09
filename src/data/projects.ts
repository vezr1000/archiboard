import type { Project } from '@/domain/types';

/**
 * Projects in the demo portfolio (docs/CONCEPT.md §4). Order = default display order (flagship first).
 *
 * Health mix: 1 off-track (Блок 42), 2 at-risk (Савски кеј, Стара пивара), 3 on-track.
 * `nextGate` always matches a `scheduled` board session in sessions.ts (checked by `npm run check:data`).
 * `teamIds` = everyone with an allocation on the project (lead first).
 */
export const projects: Project[] = [
  /* ---------- 1. Flagship ---------- */
  {
    id: 'savski-kej',
    name: 'Савски кеј — блок Ц',
    shortName: 'Савски кеј',
    city: 'Београд',
    address: 'Савска обала бб, Савски венац',
    parcel: 'КП 1789/3, КО Савски венац',
    plan: 'ПДР Савски амфитеатар, целина Ц',
    typology: 'stambeno-poslovni',
    typologyLabel: 'Стамбено-пословни, хибридна дрвена конструкција (CLT + АБ језгро)',
    description:
      'Стамбено-пословни блок уз Саву са 164 стана, приземљем за комерцијалне садржаје и јавним пролазом ка кеју. ' +
      'Носећа конструкција изнад приземља је од унакрсно лепљеног дрвета (CLT) са армиранобетонским језгрима. ' +
      'Циљ је DGNB Gold и усклађеност са EU таксономијом ради зеленог кредита инвеститора.',
    gfaM2: 18_400,
    siteAreaM2: 4_850,
    floors: '2По+П+8+Пс',
    budgetEur: 31_500_000,
    client: 'Кеј Девелопмент д.о.о.',
    phase: 'pgd',
    phaseProgress: 0.7,
    health: 'at-risk',
    certification: { scheme: 'DGNB', targetLevel: 'Gold', currentScore: 66, targetScore: 70 },
    leadArchitectId: 'p-ana-jovanovic',
    teamIds: [
      'p-ana-jovanovic',
      'p-nikola-petrovic',
      'p-jelena-markovic',
      'p-vladimir-kostic',
      'p-marko-djordjevic',
      'p-tamara-nikolic',
      'p-milos-savic',
      'p-stefan-pavlovic',
      'p-sanja-filipovic',
      'p-jovana-radovic',
      'p-dusan-vukovic',
      'p-milena-ristic',
    ],
    nextGate: { gate: 'G2', date: '2026-10-23' },
    coverHue: 152,
    illustration: 'tower',
    coordinates: { x: 46, y: 30 },
    tags: ['CLT', 'DGNB', 'EU таксономија', 'Сава'],
    startYear: 2025,
  },

  /* ---------- 2. School retrofit, Novi Sad ---------- */
  {
    id: 'os-novo-naselje',
    name: 'ОШ „Ново насеље“ — енергетска обнова',
    shortName: 'ОШ Ново насеље',
    city: 'Нови Сад',
    address: 'Улица Бранимира Ћосића бб, Ново насеље',
    parcel: 'КП 9876/2, КО Нови Сад IV',
    plan: 'ПГР „Ново насеље“, Нови Сад',
    typology: 'obrazovni',
    typologyLabel: 'Образовни, дубока енергетска обнова школе из 1978.',
    description:
      'Дубока енергетска обнова основне школе за 820 ученика: нова термоизолација омотача, троструко застакљење, ' +
      'механичка вентилација са рекуперацијом у учионицама, топлотне пумпе уместо гасне котларнице и PV на крову ' +
      'фискултурне сале. Радови су планирани у две летње сезоне без прекида наставе.',
    gfaM2: 6_200,
    siteAreaM2: 18_500,
    floors: 'П+2',
    budgetEur: 4_800_000,
    client: 'Град Нови Сад — Градска управа за образовање',
    phase: 'pzi',
    phaseProgress: 0.55,
    health: 'on-track',
    certification: { scheme: 'EDGE', targetLevel: 'Advanced', currentScore: 52, targetScore: 40 },
    leadArchitectId: 'p-katarina-mitic',
    teamIds: [
      'p-katarina-mitic',
      'p-nikola-petrovic',
      'p-dragan-ilic',
      'p-stefan-pavlovic',
      'p-milos-savic',
      'p-ivana-lazic',
      'p-luka-obradovic',
      'p-sanja-filipovic',
    ],
    nextGate: { gate: 'G3', date: '2026-11-18' },
    coverHue: 38,
    illustration: 'school',
    coordinates: { x: 37, y: 16 },
    tags: ['EDGE', 'обнова', 'рекуперација', 'PV'],
    startYear: 2024,
  },

  /* ---------- 3. Public space, Niš ---------- */
  {
    id: 'park-nisava',
    name: 'Парк на Нишави',
    shortName: 'Парк на Нишави',
    city: 'Ниш',
    address: 'Десна обала Нишаве, потез Тврђава — Чамурлија',
    parcel: 'КП 4521/1 и др., КО Ниш-Бубањ',
    plan: 'ПДР приобаља Нишаве, сектор 3',
    typology: 'javni-prostor',
    typologyLabel: 'Јавни простор, плаво-зелена инфраструктура',
    description:
      'Линеарни парк дуж Нишаве са поплавним ливадама, кишним вртовима и биоретенцијама које прихватају воду са ' +
      'околних улица. Део парка је пројектован да се плави при високим водама (Q20), уз шетне стазе на коти изнад Q100. ' +
      'Програм обухвата павиљон са јавним тоалетима, игралишта и бициклистичку стазу.',
    siteAreaM2: 42_000,
    budgetEur: 6_200_000,
    client: 'Град Ниш',
    phase: 'idr',
    phaseProgress: 0.6,
    health: 'on-track',
    certification: { scheme: 'none', targetLevel: 'Напредни', currentScore: 72, targetScore: 75 },
    leadArchitectId: 'p-jovana-radovic',
    teamIds: ['p-jovana-radovic', 'p-nikola-petrovic', 'p-milena-ristic'],
    nextGate: { gate: 'G1', date: '2026-11-04' },
    coverHue: 120,
    illustration: 'park',
    coordinates: { x: 66, y: 70 },
    tags: ['плаво-зелена инфраструктура', 'биодиверзитет', 'Нишава', 'кишни вртови'],
    startYear: 2026,
  },

  /* ---------- 4. Office, New Belgrade (construction) ---------- */
  {
    id: 'blok-42',
    name: 'Пословни центар „Блок 42“',
    shortName: 'Блок 42',
    city: 'Београд',
    address: 'Омладинских бригада бб, Нови Београд',
    parcel: 'КП 6120/4, КО Нови Београд',
    plan: 'ПДР Блок 42, Нови Београд',
    typology: 'poslovni',
    typologyLabel: 'Пословни, АБ скелет са зид-завесом',
    description:
      'Пословна зграда класе А са 24.000 m² БРГП и три подземне етаже гараже. У градњи од марта 2026. ' +
      'Извођач је током градње предложио замене материјала (бетон са CEM II уместо CEM III/A, други добављач ' +
      'зид-завесе без EPD) и смањење PV система, што је угрозило BREEAM Excellent.',
    gfaM2: 24_000,
    siteAreaM2: 8_300,
    floors: '3По+П+12',
    budgetEur: 38_000_000,
    client: 'Нордлајн Инвест д.о.о.',
    phase: 'gradnja',
    phaseProgress: 0.45,
    health: 'off-track',
    certification: { scheme: 'BREEAM', targetLevel: 'Excellent', currentScore: 66.7, targetScore: 70 },
    leadArchitectId: 'p-nemanja-stevanovic',
    teamIds: [
      'p-nemanja-stevanovic',
      'p-jelena-markovic',
      'p-nikola-petrovic',
      'p-vladimir-kostic',
      'p-tamara-nikolic',
      'p-milos-savic',
      'p-sanja-filipovic',
      'p-milena-ristic',
    ],
    nextGate: { gate: 'G4', date: '2027-04-20' },
    coverHue: 210,
    illustration: 'office',
    coordinates: { x: 45, y: 29 },
    tags: ['BREEAM', 'градња', 'замена материјала', 'зид-завеса'],
    startYear: 2023,
  },

  /* ---------- 5. Kindergarten, Niš (brief) ---------- */
  {
    id: 'vrtic-bubamara',
    name: 'Вртић „Бубамара“',
    shortName: 'Вртић Бубамара',
    city: 'Ниш',
    address: 'Насеље Дуваниште, Ниш',
    parcel: 'КП 3310/7, КО Ниш-Црвени крст',
    plan: 'ПГР градске општине Црвени крст',
    typology: 'predskolski',
    typologyLabel: 'Предшколски, пасивна кућа у дрвеној конструкцији',
    description:
      'Нови вртић за 180 деце у десет група, пројектован по Passivhaus стандарду: компактан волумен, дрвена ' +
      'скелетна конструкција са изолацијом од дрвених влакана, троструко застакљење, вентилација са рекуперацијом ' +
      'и PV на кровним надстрешницама. У фази пројектног задатка — циљеви се утврђују пре Г0.',
    gfaM2: 1_900,
    siteAreaM2: 6_500,
    floors: 'П+1',
    budgetEur: 3_600_000,
    client: 'Град Ниш',
    phase: 'zadatak',
    phaseProgress: 0.8,
    health: 'on-track',
    certification: { scheme: 'Passivhaus', targetLevel: 'Classic', currentScore: 67, targetScore: 100 },
    leadArchitectId: 'p-marko-djordjevic',
    teamIds: ['p-marko-djordjevic', 'p-ana-jovanovic', 'p-nikola-petrovic', 'p-jovana-radovic', 'p-sanja-filipovic'],
    nextGate: { gate: 'G0', date: '2026-10-14' },
    coverHue: 48,
    illustration: 'kindergarten',
    coordinates: { x: 67, y: 72 },
    tags: ['Passivhaus', 'nZEB', 'дрво', 'деца'],
    startYear: 2026,
  },

  /* ---------- 6. Adaptive reuse, Novi Sad ---------- */
  {
    id: 'stara-pivara',
    name: 'Стара пивара — пренамена',
    shortName: 'Стара пивара',
    city: 'Нови Сад',
    address: 'Сентандрејски пут бб, Нови Сад',
    parcel: 'КП 10456/1, КО Нови Сад I',
    plan: 'ПДР „Радна зона Север“ — измене и допуне',
    typology: 'adaptivna-prenamena',
    typologyLabel: 'Адаптивна пренамена индустријског објекта у мешовити програм',
    description:
      'Пренамена пиваре из 1920-их у мешовити програм: лофт станови, коворкинг, тржница хране и галерија. ' +
      'Задржавају се опечне фасаде под претходном заштитом и челичне решеткасте конструкције хале, а нова ' +
      'надоградња је у CLT-у. Циљ је LEED Gold и највећи могући удео поново употребљених материјала.',
    gfaM2: 9_800,
    siteAreaM2: 6_000,
    floors: 'П+3 / П+4',
    budgetEur: 14_500_000,
    client: 'Пивара Лофт д.о.о.',
    phase: 'idr',
    phaseProgress: 0.75,
    health: 'at-risk',
    certification: { scheme: 'LEED', targetLevel: 'Gold', currentScore: 58, targetScore: 64 },
    leadArchitectId: 'p-ivana-lazic',
    teamIds: [
      'p-ivana-lazic',
      'p-jelena-markovic',
      'p-nikola-petrovic',
      'p-dragan-ilic',
      'p-vladimir-kostic',
      'p-tamara-nikolic',
      'p-stefan-pavlovic',
      'p-milos-savic',
      'p-luka-obradovic',
      'p-dusan-vukovic',
    ],
    nextGate: { gate: 'G1', date: '2026-11-25' },
    coverHue: 18,
    illustration: 'brewery',
    coordinates: { x: 39, y: 18 },
    tags: ['LEED', 'циркуларност', 'поновна употреба', 'индустријско наслеђе'],
    startYear: 2025,
  },
];
