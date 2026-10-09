import type { CertificationCategory, CertificationCriterion } from '@/domain/types';

/**
 * Certification credit trackers, one per project.
 *
 * Units per scheme (so the UI can compute a total = Σ weight × achieved / max):
 * - DGNB (Савски кеј): each category is a performance index 0–100 %; weights for new residential buildings
 *   (approximate: ENV/ECO/SOC 22,5 %, TEC 15 %, PRO 12,5 %, SITE 5 %). Thresholds Silver 50 / Gold 65 / Platinum 80.
 * - BREEAM (Блок 42): category score 0–100 %, BREEAM International NC 2016 weights; thresholds in %.
 * - LEED (Стара пивара): category max = available points (110 total); weight = share of 110; thresholds as % of 110.
 * - EDGE (школа): category value = predicted savings % vs. the EDGE base case; thresholds are energy savings %.
 * - Passivhaus (вртић): category max = number of criteria, achieved = criteria met in the preliminary PHPP.
 * - Парк: firm's internal blue-green scorecard (scheme 'none'), category score 0–100.
 */
export const certifications: CertificationCategory[] = [
  /* ---------- Савски кеј — DGNB ---------- */
  {
    projectId: 'savski-kej',
    scheme: 'DGNB',
    categories: [
      { id: 'ENV', label: 'Еколошки квалитет', weight: 22.5, max: 100, targeted: 72, achieved: 58, atRisk: 10 },
      { id: 'ECO', label: 'Економски квалитет', weight: 22.5, max: 100, targeted: 70, achieved: 66, atRisk: 0 },
      { id: 'SOC', label: 'Социокултурни и функционални квалитет', weight: 22.5, max: 100, targeted: 74, achieved: 70, atRisk: 6 },
      { id: 'TEC', label: 'Технички квалитет', weight: 15, max: 100, targeted: 68, achieved: 64, atRisk: 4 },
      { id: 'PRO', label: 'Квалитет процеса', weight: 12.5, max: 100, targeted: 75, achieved: 72, atRisk: 0 },
      { id: 'SITE', label: 'Квалитет локације', weight: 5, max: 100, targeted: 80, achieved: 80, atRisk: 0 },
    ],
    thresholds: [
      { label: 'Silver', min: 50 },
      { label: 'Gold', min: 65 },
      { label: 'Platinum', min: 80 },
    ],
  },

  /* ---------- ОШ „Ново насеље“ — EDGE ---------- */
  {
    projectId: 'os-novo-naselje',
    scheme: 'EDGE',
    categories: [
      { id: 'energy', label: 'Енергија', weight: 34, max: 100, targeted: 40, achieved: 52, atRisk: 0 },
      { id: 'water', label: 'Вода', weight: 33, max: 100, targeted: 20, achieved: 31, atRisk: 0 },
      { id: 'materials', label: 'Материјали (уграђена енергија)', weight: 33, max: 100, targeted: 20, achieved: 38, atRisk: 0 },
    ],
    thresholds: [
      { label: 'EDGE Certified', min: 20 },
      { label: 'EDGE Advanced', min: 40 },
    ],
  },

  /* ---------- Парк на Нишави — интерни скор ---------- */
  {
    projectId: 'park-nisava',
    scheme: 'none',
    categories: [
      { id: 'bio', label: 'Биодиверзитет', weight: 30, max: 100, targeted: 80, achieved: 78, atRisk: 0 },
      { id: 'voda', label: 'Управљање атмосферским водама', weight: 30, max: 100, targeted: 76, achieved: 70, atRisk: 6 },
      { id: 'klima', label: 'Микроклима и засена', weight: 20, max: 100, targeted: 72, achieved: 68, atRisk: 0 },
      { id: 'drustvo', label: 'Друштвена вредност и приступачност', weight: 20, max: 100, targeted: 70, achieved: 72, atRisk: 4 },
    ],
    thresholds: [
      { label: 'Основни', min: 50 },
      { label: 'Напредни', min: 70 },
      { label: 'Предводник', min: 85 },
    ],
  },

  /* ---------- Блок 42 — BREEAM ---------- */
  {
    projectId: 'blok-42',
    scheme: 'BREEAM',
    categories: [
      { id: 'Man', label: 'Менаџмент', weight: 12, max: 100, targeted: 80, achieved: 78, atRisk: 0 },
      { id: 'Hea', label: 'Здравље и благостање', weight: 15, max: 100, targeted: 76, achieved: 74, atRisk: 0 },
      { id: 'Ene', label: 'Енергија', weight: 19, max: 100, targeted: 74, achieved: 66, atRisk: 6 },
      { id: 'Tra', label: 'Транспорт', weight: 8, max: 100, targeted: 75, achieved: 75, atRisk: 0 },
      { id: 'Wat', label: 'Вода', weight: 6, max: 100, targeted: 72, achieved: 67, atRisk: 0 },
      { id: 'Mat', label: 'Материјали', weight: 12.5, max: 100, targeted: 62, achieved: 46, atRisk: 8 },
      { id: 'Wst', label: 'Отпад', weight: 7.5, max: 100, targeted: 72, achieved: 70, atRisk: 0 },
      { id: 'LE', label: 'Коришћење земљишта и екологија', weight: 10, max: 100, targeted: 70, achieved: 65, atRisk: 0 },
      { id: 'Pol', label: 'Загађење', weight: 10, max: 100, targeted: 68, achieved: 62, atRisk: 4 },
    ],
    thresholds: [
      { label: 'Pass', min: 30 },
      { label: 'Good', min: 45 },
      { label: 'Very Good', min: 55 },
      { label: 'Excellent', min: 70 },
      { label: 'Outstanding', min: 85 },
    ],
  },

  /* ---------- Вртић „Бубамара“ — Passivhaus ---------- */
  {
    projectId: 'vrtic-bubamara',
    scheme: 'Passivhaus',
    categories: [
      { id: 'energija', label: 'Енергетски захтеви', weight: 33.3, max: 3, targeted: 3, achieved: 2, atRisk: 1 },
      { id: 'zaptivenost', label: 'Заптивеност', weight: 11.1, max: 1, targeted: 1, achieved: 0, atRisk: 0 },
      { id: 'komfor', label: 'Комфор', weight: 33.3, max: 3, targeted: 3, achieved: 2, atRisk: 0 },
      { id: 'komponente', label: 'Квалитет компоненти', weight: 22.3, max: 2, targeted: 2, achieved: 2, atRisk: 0 },
    ],
    thresholds: [{ label: 'Classic', min: 100 }],
  },

  /* ---------- Стара пивара — LEED v4.1 BD+C ---------- */
  {
    projectId: 'stara-pivara',
    scheme: 'LEED',
    categories: [
      { id: 'IP', label: 'Интегративни процес', weight: 0.9, max: 1, targeted: 1, achieved: 1, atRisk: 0 },
      { id: 'LT', label: 'Локација и транспорт', weight: 14.5, max: 16, targeted: 12, achieved: 12, atRisk: 0 },
      { id: 'SS', label: 'Одрживе локације', weight: 9.1, max: 10, targeted: 6, achieved: 5, atRisk: 1 },
      { id: 'WE', label: 'Ефикасност воде', weight: 10, max: 11, targeted: 6, achieved: 6, atRisk: 0 },
      { id: 'EA', label: 'Енергија и атмосфера', weight: 30, max: 33, targeted: 16, achieved: 14, atRisk: 2 },
      { id: 'MR', label: 'Материјали и ресурси', weight: 11.8, max: 13, targeted: 8, achieved: 5, atRisk: 3 },
      { id: 'EQ', label: 'Квалитет унутрашње средине', weight: 14.5, max: 16, targeted: 8, achieved: 8, atRisk: 0 },
      { id: 'IN', label: 'Иновације', weight: 5.5, max: 6, targeted: 5, achieved: 5, atRisk: 0 },
      { id: 'RP', label: 'Регионални приоритет', weight: 3.7, max: 4, targeted: 2, achieved: 2, atRisk: 0 },
    ],
    thresholds: [
      { label: 'Certified', min: 36.4 },
      { label: 'Silver', min: 45.5 },
      { label: 'Gold', min: 54.5 },
      { label: 'Platinum', min: 72.7 },
    ],
  },
];

/** Individual criteria (credits) with owners and evidence. */
export const certificationCriteria: CertificationCriterion[] = [
  /* ================================ Савски кеј — DGNB ================================ */
  { id: 'cr-sk-env11', projectId: 'savski-kej', categoryId: 'ENV', label: 'ENV1.1 Еколошки биланс у животном циклусу (LCA)', ownerId: 'p-milos-savic', status: 'at-risk', points: 40, maxPoints: 100, evidenceDocumentId: 'doc-sk-lca' },
  { id: 'cr-sk-env12', projectId: 'savski-kej', categoryId: 'ENV', label: 'ENV1.2 Ризици по локалну животну средину', ownerId: 'p-nikola-petrovic', status: 'on-track', points: 70, maxPoints: 100 },
  { id: 'cr-sk-env13', projectId: 'savski-kej', categoryId: 'ENV', label: 'ENV1.3 Одговорна набавка материјала', ownerId: 'p-milos-savic', status: 'on-track', points: 55, maxPoints: 100, evidenceDocumentId: 'doc-sk-fasada-alt' },
  { id: 'cr-sk-env22', projectId: 'savski-kej', categoryId: 'ENV', label: 'ENV2.2 Потрошња питке воде и количина отпадне воде', ownerId: 'p-sanja-filipovic', status: 'on-track', points: 75, maxPoints: 100, evidenceDocumentId: 'doc-sk-vik-pgd' },
  { id: 'cr-sk-env23', projectId: 'savski-kej', categoryId: 'ENV', label: 'ENV2.3 Коришћење земљишта', ownerId: 'p-ana-jovanovic', status: 'achieved', points: 80, maxPoints: 100 },
  { id: 'cr-sk-env24', projectId: 'savski-kej', categoryId: 'ENV', label: 'ENV2.4 Биодиверзитет на локацији', ownerId: 'p-jovana-radovic', status: 'at-risk', points: 50, maxPoints: 100, evidenceDocumentId: 'doc-sk-pejzaz' },
  { id: 'cr-sk-eco11', projectId: 'savski-kej', categoryId: 'ECO', label: 'ECO1.1 Трошкови у животном циклусу', ownerId: 'p-nikola-petrovic', status: 'on-track', points: 65, maxPoints: 100 },
  { id: 'cr-sk-eco21', projectId: 'savski-kej', categoryId: 'ECO', label: 'ECO2.1 Флексибилност и прилагодљивост', ownerId: 'p-ana-jovanovic', status: 'on-track', points: 70, maxPoints: 100 },
  { id: 'cr-sk-eco22', projectId: 'savski-kej', categoryId: 'ECO', label: 'ECO2.2 Тржишна одрживост', ownerId: 'p-jelena-markovic', status: 'achieved', points: 75, maxPoints: 100 },
  { id: 'cr-sk-soc11', projectId: 'savski-kej', categoryId: 'SOC', label: 'SOC1.1 Топлотни комфор', ownerId: 'p-stefan-pavlovic', status: 'at-risk', points: 55, maxPoints: 100, evidenceDocumentId: 'doc-sk-pregrevanje' },
  { id: 'cr-sk-soc12', projectId: 'savski-kej', categoryId: 'SOC', label: 'SOC1.2 Квалитет унутрашњег ваздуха', ownerId: 'p-sanja-filipovic', status: 'on-track', points: 70, maxPoints: 100 },
  { id: 'cr-sk-soc13', projectId: 'savski-kej', categoryId: 'SOC', label: 'SOC1.3 Акустички комфор', ownerId: 'p-marko-djordjevic', status: 'on-track', points: 65, maxPoints: 100, evidenceDocumentId: 'doc-sk-akustika' },
  { id: 'cr-sk-soc14', projectId: 'savski-kej', categoryId: 'SOC', label: 'SOC1.4 Визуелни комфор (дневно светло)', ownerId: 'p-marko-djordjevic', status: 'achieved', points: 80, maxPoints: 100, evidenceDocumentId: 'doc-sk-dnevno-svetlo' },
  { id: 'cr-sk-soc21', projectId: 'savski-kej', categoryId: 'SOC', label: 'SOC2.1 Пројектовање за све', ownerId: 'p-ana-jovanovic', status: 'on-track', points: 75, maxPoints: 100 },
  { id: 'cr-sk-tec13', projectId: 'savski-kej', categoryId: 'TEC', label: 'TEC1.3 Квалитет омотача зграде', ownerId: 'p-stefan-pavlovic', status: 'on-track', points: 70, maxPoints: 100, evidenceDocumentId: 'doc-sk-ee' },
  { id: 'cr-sk-tec16', projectId: 'savski-kej', categoryId: 'TEC', label: 'TEC1.6 Демонтажа и рециклажа', ownerId: 'p-milos-savic', status: 'on-track', points: 60, maxPoints: 100 },
  { id: 'cr-sk-tec31', projectId: 'savski-kej', categoryId: 'TEC', label: 'TEC3.1 Инфраструктура мобилности', ownerId: 'p-milena-ristic', status: 'achieved', points: 80, maxPoints: 100 },
  { id: 'cr-sk-pro11', projectId: 'savski-kej', categoryId: 'PRO', label: 'PRO1.1 Свеобухватан пројектни задатак', ownerId: 'p-ana-jovanovic', status: 'achieved', points: 90, maxPoints: 100, evidenceDocumentId: 'doc-sk-pz' },
  { id: 'cr-sk-pro14', projectId: 'savski-kej', categoryId: 'PRO', label: 'PRO1.4 Одрживост у тендерској документацији', ownerId: 'p-milena-ristic', status: 'not-started', maxPoints: 100 },
  { id: 'cr-sk-pro23', projectId: 'savski-kej', categoryId: 'PRO', label: 'PRO2.3 Систематско пуштање у рад', ownerId: 'p-sanja-filipovic', status: 'not-started', maxPoints: 100 },
  { id: 'cr-sk-site13', projectId: 'savski-kej', categoryId: 'SITE', label: 'SITE1.3 Саобраћајна доступност', ownerId: 'p-milena-ristic', status: 'achieved', points: 90, maxPoints: 100 },

  /* ================================ ОШ „Ново насеље“ — EDGE ================================ */
  { id: 'cr-os-e1', projectId: 'os-novo-naselje', categoryId: 'energy', label: 'Термоизолација спољних зидова (U = 0,17 W/m²K)', ownerId: 'p-stefan-pavlovic', status: 'achieved', evidenceDocumentId: 'doc-os-ee' },
  { id: 'cr-os-e2', projectId: 'os-novo-naselje', categoryId: 'energy', label: 'Троструко застакљење', ownerId: 'p-katarina-mitic', status: 'achieved' },
  { id: 'cr-os-e3', projectId: 'os-novo-naselje', categoryId: 'energy', label: 'Топлотне пумпе и рекуперација', ownerId: 'p-sanja-filipovic', status: 'on-track' },
  { id: 'cr-os-e4', projectId: 'os-novo-naselje', categoryId: 'energy', label: 'PV на крову сале (140 kWp)', ownerId: 'p-stefan-pavlovic', status: 'on-track' },
  { id: 'cr-os-w1', projectId: 'os-novo-naselje', categoryId: 'water', label: 'Арматуре ниског протока и сензорске славине', ownerId: 'p-sanja-filipovic', status: 'achieved' },
  { id: 'cr-os-m1', projectId: 'os-novo-naselje', categoryId: 'materials', label: 'Изолација и прозори са EPD', ownerId: 'p-milos-savic', status: 'on-track', evidenceDocumentId: 'doc-os-lca' },

  /* ================================ Парк на Нишави — интерни скор ================================ */
  { id: 'cr-pn-1', projectId: 'park-nisava', categoryId: 'bio', label: 'Најмање 80 % аутохтоних врста', ownerId: 'p-jovana-radovic', status: 'on-track', evidenceDocumentId: 'doc-pn-biodiverzitet' },
  { id: 'cr-pn-2', projectId: 'park-nisava', categoryId: 'bio', label: 'Заштита гнездилишта водомара', ownerId: 'p-jovana-radovic', status: 'achieved', evidenceDocumentId: 'doc-pn-biodiverzitet' },
  { id: 'cr-pn-3', projectId: 'park-nisava', categoryId: 'voda', label: 'Ретенција ≥ 85 % годишњих падавина', ownerId: 'p-jovana-radovic', status: 'at-risk', evidenceDocumentId: 'doc-pn-hidraulika' },
  { id: 'cr-pn-4', projectId: 'park-nisava', categoryId: 'klima', label: 'Засена крошњама ≥ 40 % за 15 година', ownerId: 'p-jovana-radovic', status: 'on-track' },
  { id: 'cr-pn-5', projectId: 'park-nisava', categoryId: 'drustvo', label: 'Приступачне главне стазе', ownerId: 'p-milena-ristic', status: 'at-risk' },

  /* ================================ Блок 42 — BREEAM ================================ */
  { id: 'cr-b42-ene01', projectId: 'blok-42', categoryId: 'Ene', label: 'Ene 01 Смањење потрошње енергије и емисија', ownerId: 'p-nikola-petrovic', status: 'achieved' },
  { id: 'cr-b42-ene04', projectId: 'blok-42', categoryId: 'Ene', label: 'Ene 04 Нискоугљеничне технологије', ownerId: 'p-nikola-petrovic', status: 'at-risk' },
  { id: 'cr-b42-mat01', projectId: 'blok-42', categoryId: 'Mat', label: 'Mat 01 Утицај у животном циклусу', ownerId: 'p-milos-savic', status: 'at-risk', evidenceDocumentId: 'doc-b42-lca' },
  { id: 'cr-b42-mat03', projectId: 'blok-42', categoryId: 'Mat', label: 'Mat 03 Одговорна набавка производа', ownerId: 'p-nemanja-stevanovic', status: 'at-risk', evidenceDocumentId: 'doc-b42-zamene' },
  { id: 'cr-b42-hea01', projectId: 'blok-42', categoryId: 'Hea', label: 'Hea 01 Визуелни комфор', ownerId: 'p-nemanja-stevanovic', status: 'achieved' },
  { id: 'cr-b42-wat01', projectId: 'blok-42', categoryId: 'Wat', label: 'Wat 01 Потрошња воде', ownerId: 'p-sanja-filipovic', status: 'achieved' },
  { id: 'cr-b42-man03', projectId: 'blok-42', categoryId: 'Man', label: 'Man 03 Одговорна пракса на градилишту', ownerId: 'p-nemanja-stevanovic', status: 'on-track' },
  { id: 'cr-b42-wst01', projectId: 'blok-42', categoryId: 'Wst', label: 'Wst 01 Управљање грађевинским отпадом', ownerId: 'p-milena-ristic', status: 'on-track' },
  { id: 'cr-b42-pol03', projectId: 'blok-42', categoryId: 'Pol', label: 'Pol 03 Ризик од поплава и атмосферске воде', ownerId: 'p-sanja-filipovic', status: 'achieved' },

  /* ================================ Вртић „Бубамара“ — Passivhaus ================================ */
  { id: 'cr-vb-qh', projectId: 'vrtic-bubamara', categoryId: 'energija', label: 'Потреба за грејањем ≤ 15 kWh/m²a (PHPP: 14)', ownerId: 'p-marko-djordjevic', status: 'on-track', points: 14, maxPoints: 15, evidenceDocumentId: 'doc-vb-phpp' },
  { id: 'cr-vb-load', projectId: 'vrtic-bubamara', categoryId: 'energija', label: 'Грејно оптерећење ≤ 10 W/m² (PHPP: 10,4)', ownerId: 'p-marko-djordjevic', status: 'at-risk', points: 10.4, maxPoints: 10, evidenceDocumentId: 'doc-vb-phpp' },
  { id: 'cr-vb-per', projectId: 'vrtic-bubamara', categoryId: 'energija', label: 'PER ≤ 60 kWh/m²a (Classic)', ownerId: 'p-sanja-filipovic', status: 'on-track', points: 56, maxPoints: 60 },
  { id: 'cr-vb-n50', projectId: 'vrtic-bubamara', categoryId: 'zaptivenost', label: 'Заптивеност n50 ≤ 0,6 h⁻¹ (blower door)', ownerId: 'p-marko-djordjevic', status: 'not-started', maxPoints: 0.6 },
  { id: 'cr-vb-overheat', projectId: 'vrtic-bubamara', categoryId: 'komfor', label: 'Учесталост прегревања > 25 °C ≤ 10 %', ownerId: 'p-sanja-filipovic', status: 'on-track' },
  { id: 'cr-vb-windows', projectId: 'vrtic-bubamara', categoryId: 'komponente', label: 'Прозори Uw ≤ 0,80 W/m²K уграђени', ownerId: 'p-marko-djordjevic', status: 'on-track' },
  { id: 'cr-vb-mvhr', projectId: 'vrtic-bubamara', categoryId: 'komponente', label: 'Рекуперација топлоте ≥ 75 %', ownerId: 'p-sanja-filipovic', status: 'on-track' },

  /* ================================ Стара пивара — LEED v4.1 ================================ */
  { id: 'cr-sp-ip', projectId: 'stara-pivara', categoryId: 'IP', label: 'IP Интегративни процес', ownerId: 'p-ivana-lazic', status: 'achieved', points: 1, maxPoints: 1 },
  { id: 'cr-sp-lt', projectId: 'stara-pivara', categoryId: 'LT', label: 'LT Густина и разноврсност намена у окружењу', ownerId: 'p-ivana-lazic', status: 'achieved', points: 5, maxPoints: 5 },
  { id: 'cr-sp-ss', projectId: 'stara-pivara', categoryId: 'SS', label: 'SS Управљање атмосферским водама', ownerId: 'p-luka-obradovic', status: 'at-risk', points: 1, maxPoints: 3 },
  { id: 'cr-sp-we', projectId: 'stara-pivara', categoryId: 'WE', label: 'WE Смањење потрошње воде у објекту', ownerId: 'p-stefan-pavlovic', status: 'on-track', points: 4, maxPoints: 6 },
  { id: 'cr-sp-ea', projectId: 'stara-pivara', categoryId: 'EA', label: 'EA Оптимизација енергетских перформанси', ownerId: 'p-stefan-pavlovic', status: 'on-track', points: 10, maxPoints: 18 },
  { id: 'cr-sp-mr', projectId: 'stara-pivara', categoryId: 'MR', label: 'MR Смањење утицаја зграде у животном циклусу (поновна употреба)', ownerId: 'p-ivana-lazic', status: 'at-risk', points: 3, maxPoints: 5, evidenceDocumentId: 'doc-sp-audit' },
  { id: 'cr-sp-mr-epd', projectId: 'stara-pivara', categoryId: 'MR', label: 'MR Декларације производа (EPD)', ownerId: 'p-milos-savic', status: 'on-track', points: 1, maxPoints: 2, evidenceDocumentId: 'doc-sp-lca' },
  { id: 'cr-sp-eq', projectId: 'stara-pivara', categoryId: 'EQ', label: 'EQ Дневно светло', ownerId: 'p-luka-obradovic', status: 'at-risk', points: 1, maxPoints: 3 },
];
