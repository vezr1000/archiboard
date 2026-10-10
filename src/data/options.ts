import type { DesignOption } from '@/domain/types';

/**
 * Design options (Варијанте). Results are on the CURRENT design basis: for Савски кеј every option already
 * includes the non-combustible facade cladding required above 22 m, so the selected option Б equals the
 * project's current KPIs (358 kgCO₂e/m², Qh,nd 27 kWh/m²a, class B, DGNB 66 %).
 * `certPoints` uses the project's scheme unit (DGNB %, EDGE energy savings %, LEED points).
 * `operationalEnergy` = Qh,nd (kWh/m²a).
 * Optional params (`cladding`, `windows`, `coreConcreteMix`, `shading`) were added in step 6 for the what-if model
 * (`src/lib/carbonModel.ts`); when omitted the model uses its defaults. Option Б states `coreConcreteMix: 'cem-ii'`
 * because only the basements use CEM III/A (material passport) — switching the cores is the −7 kgCO₂e/m² lever of dec-sk-09.
 */
export const designOptions: DesignOption[] = [
  /* ================================ Савски кеј — блок Ц ================================ */
  {
    id: 'opt-sk-a',
    projectId: 'savski-kej',
    name: 'Варијанта А — АБ скелет + ETICS',
    code: 'А',
    summary:
      'Конвенционални армиранобетонски скелет са контактном фасадом (ETICS са каменом вуном 16 cm). Најнижа ' +
      'цена и најпознатија технологија за извођаче, али уграђени угљеник далеко изнад циља и дужа градња.',
    params: {
      structure: 'ab-skelet',
      facade: 'etics',
      insulationCm: 16,
      glazingRatio: 0.38,
      pvKwp: 80,
      heating: 'daljinsko',
      reusedPct: 5,
      concreteMix: 'cem-ii',
      greenRoofPct: 40,
    },
    results: {
      embodiedCarbon: 432,
      operationalEnergy: 29,
      energyClass: 'B',
      costDeltaPct: 0,
      certPoints: 61,
      daylightPct: 74,
      durationMonths: 26,
    },
    status: 'rejected',
    createdBy: 'p-ana-jovanovic',
    createdAt: '2025-05-14',
  },
  {
    id: 'opt-sk-b',
    projectId: 'savski-kej',
    name: 'Варијанта Б — CLT + АБ језгро + вентилисана фасада',
    code: 'Б',
    summary:
      'Подземне етаже, приземље и језгра у армираном бетону (CEM III/A у подземним етажама), изнад приземља ' +
      'CLT таванице и зидови. Вентилисана фасада — од јуна 2026. са алуминијумским панелима уместо облоге од ' +
      'ариша. Грејање преко даљинског система, топла вода и хлађење пословања топлотним пумпама.',
    params: {
      structure: 'clt-ab-jezgro',
      facade: 'ventilisana',
      insulationCm: 20,
      glazingRatio: 0.4,
      pvKwp: 120,
      heating: 'hibrid-tp-daljinsko',
      reusedPct: 12,
      concreteMix: 'cem-iii',
      greenRoofPct: 55,
      cladding: 'aluminijum',
      windows: 'trostruko',
      coreConcreteMix: 'cem-ii',
    },
    results: {
      embodiedCarbon: 358,
      operationalEnergy: 27,
      energyClass: 'B',
      costDeltaPct: 6.5,
      certPoints: 66,
      daylightPct: 78,
      durationMonths: 22,
    },
    status: 'selected',
    createdBy: 'p-ana-jovanovic',
    createdAt: '2025-05-14',
  },
  {
    id: 'opt-sk-c',
    projectId: 'savski-kej',
    name: 'Варијанта В — хибрид дрво–бетон + проширени PV',
    code: 'В',
    summary:
      'Спрегнуте дрво-бетонске таванице на АБ скелету, CEM III/A у свим бетонским елементима и PV на крову и ' +
      'парапетима јужне фасаде (260 kWp). Грејање искључиво топлотним пумпама. Најбоља оперативна енергија, ' +
      'али више бетона него у варијанти Б и највиша цена.',
    params: {
      structure: 'hibrid',
      facade: 'ventilisana',
      insulationCm: 22,
      glazingRatio: 0.36,
      pvKwp: 260,
      heating: 'toplotna-pumpa',
      reusedPct: 18,
      concreteMix: 'cem-iii',
      greenRoofPct: 30,
      cladding: 'aluminijum',
      windows: 'trostruko',
    },
    results: {
      embodiedCarbon: 372,
      operationalEnergy: 24,
      energyClass: 'B',
      costDeltaPct: 9.8,
      certPoints: 68,
      daylightPct: 72,
      durationMonths: 23,
    },
    status: 'rejected',
    createdBy: 'p-marko-djordjevic',
    createdAt: '2025-06-04',
  },

  /* ================================ ОШ „Ново насеље“ ================================ */
  {
    id: 'opt-os-a',
    projectId: 'os-novo-naselje',
    name: 'Варијанта А — основна обнова',
    code: 'А',
    summary:
      'ETICS са каменом вуном 12 cm, нови ПВЦ прозори, задржава се гасна котларница. Испуњава законски минимум, ' +
      'али не досеже EDGE Advanced ни захтев банке за зелени кредит.',
    params: {
      structure: 'postojeca',
      facade: 'etics',
      insulationCm: 12,
      glazingRatio: 0.3,
      pvKwp: 0,
      heating: 'gas',
      reusedPct: 0,
      concreteMix: 'cem-ii',
      greenRoofPct: 0,
      windows: 'dvostruko',
    },
    results: {
      embodiedCarbon: 62,
      operationalEnergy: 48,
      energyClass: 'C',
      costDeltaPct: 0,
      certPoints: 28,
      daylightPct: 80,
      durationMonths: 4,
    },
    status: 'rejected',
    createdBy: 'p-katarina-mitic',
    createdAt: '2024-12-11',
  },
  {
    id: 'opt-os-b',
    projectId: 'os-novo-naselje',
    name: 'Варијанта Б — дубока обнова',
    code: 'Б',
    summary:
      'Камена вуна 20 cm, троструко застакљење, механичка вентилација са рекуперацијом у учионицама, каскада ' +
      'топлотних пумпи уместо гасног котла и PV од 140 kWp на крову фискултурне сале.',
    params: {
      structure: 'postojeca',
      facade: 'etics',
      insulationCm: 20,
      glazingRatio: 0.3,
      pvKwp: 140,
      heating: 'toplotna-pumpa',
      reusedPct: 0,
      concreteMix: 'cem-ii',
      greenRoofPct: 0,
      windows: 'trostruko',
      mvhr: true,
    },
    results: {
      embodiedCarbon: 98,
      operationalEnergy: 24,
      energyClass: 'A',
      costDeltaPct: 38,
      certPoints: 52,
      daylightPct: 84,
      durationMonths: 5,
    },
    status: 'selected',
    createdBy: 'p-katarina-mitic',
    createdAt: '2024-12-11',
  },

  /* ================================ Стара пивара ================================ */
  {
    id: 'opt-sp-a',
    projectId: 'stara-pivara',
    name: 'Варијанта А — максимално задржавање',
    code: 'А',
    summary:
      'Задржавају се опечне фасаде, таванице главне зграде и решеткасти носачи хале (санација, замена само ' +
      'кородираних), опека из анекса се поново зида. Надоградња П+4 у CLT-у. Унутрашња изолација од дрвених влакана.',
    params: {
      structure: 'postojeca',
      facade: 'opeka',
      insulationCm: 8,
      glazingRatio: 0.25,
      pvKwp: 180,
      heating: 'daljinsko',
      reusedPct: 48,
      concreteMix: 'cem-iii',
      greenRoofPct: 20,
    },
    results: {
      embodiedCarbon: 192,
      operationalEnergy: 38,
      energyClass: 'B',
      costDeltaPct: 0,
      certPoints: 58,
      daylightPct: 64,
      durationMonths: 20,
    },
    status: 'selected',
    createdBy: 'p-ivana-lazic',
    createdAt: '2025-11-20',
  },
  {
    id: 'opt-sp-b',
    projectId: 'stara-pivara',
    name: 'Варијанта Б — фасаде задржане, нова конструкција',
    code: 'Б',
    summary:
      'Задржавају се само уличне фасаде као „кулиса“; иза њих нова CLT конструкција са АБ језгрима. ' +
      'Бољи енергетски резултат и флексибилнији простор, али губи се LEED кредит за поновну употребу зграде и ' +
      'Завод начелно не подржава уклањање решетки хале.',
    params: {
      structure: 'clt-ab-jezgro',
      facade: 'opeka',
      insulationCm: 12,
      glazingRatio: 0.3,
      pvKwp: 180,
      heating: 'toplotna-pumpa',
      reusedPct: 22,
      concreteMix: 'cem-iii',
      greenRoofPct: 20,
    },
    results: {
      embodiedCarbon: 268,
      operationalEnergy: 33,
      energyClass: 'B',
      costDeltaPct: 11,
      certPoints: 55,
      daylightPct: 70,
      durationMonths: 24,
    },
    status: 'rejected',
    createdBy: 'p-luka-obradovic',
    createdAt: '2025-11-20',
  },
];
