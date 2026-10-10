/**
 * „Питај АрхиБорд“ — scripted Q&A. Six prepared questions with prepared answers and citations; free text is matched
 * to the closest one by keyword overlap. Answers are general on purpose (no article numbers) and consistent with the
 * seed data (kpis, regulations, decisions, materials). `\n\n` separates paragraphs; a paragraph starting with „•“ is
 * rendered as a bullet by `StreamingText`.
 */
import { foldText } from './guidelinesLogic';

export type Citation =
  /** A library entry → `/smernice/:id`. */
  | { kind: 'reg'; id: string; label: string }
  /** A project / decision / session / EPD-library page. */
  | { kind: 'link'; to: string; label: string; icon: 'project' | 'decision' | 'session' | 'materials' | 'document' };

export interface AskScript {
  id: string;
  question: string;
  /** Weighted keyword stems (folded Latin form is derived, so Cyrillic and Latin typing both work). */
  keywords: Array<[stem: string, weight: number]>;
  answer: string;
  citations: Citation[];
}

export const ASK_SCRIPTS: AskScript[] = [
  {
    id: 'energetska-klasa',
    question: 'Који је минимални енергетски разред за нову стамбену зграду?',
    keywords: [
      ['енергетск', 1], ['класа', 1], ['разред', 1], ['стамбен', 1], ['пасош', 1], ['минимал', 1], ['qh', 2], ['нова', 0.5], ['нову', 0.5], ['сертификат', 1],
    ],
    answer:
      'Нове зграде у Србији морају да постигну најмање енергетски разред C. Разред се одређује према годишњој потребној енергији за грејање Qh,nd по m² корисне површине, у односу на највећу дозвољену вредност за ту категорију зграде.' +
      '\n\n• Нова стамбена зграда са више станова: Qh,nd највише 60 kWh/m²a, што је разред C.' +
      '\n\n• Разред B захтева највише 50 %, разред A највише 25 %, а A+ највише 15 % те вредности.' +
      '\n\n• Доказ је енергетски пасош: издаје га овлашћена организација, потписује одговорни инжењер са лиценцом ИКС 381, а прилаже се уз захтев за употребну дозволу.' +
      '\n\nСавски кеј је у ПГД на разреду B (Qh,nd 27 kWh/m²a), а Закон о ЕЕ најављује постепен прелазак на зграде са готово нултом потрошњом енергије (nZEB).',
    citations: [
      { kind: 'reg', id: 'reg-pravilnik-ee', label: 'Правилник о ЕЕ зграда' },
      { kind: 'reg', id: 'reg-pravilnik-sertifikat', label: 'Правилник о сертификатима' },
      { kind: 'reg', id: 'reg-zakon-ee', label: 'Закон о ЕЕ' },
      { kind: 'link', to: '/projekti/savski-kej/ciljevi', label: 'Савски кеј — KPI', icon: 'project' },
    ],
  },
  {
    id: 'eu-taksonomija',
    question: 'Шта EU таксономија захтева за нову зграду већу од 5.000 m²?',
    keywords: [
      ['таксономиј', 2], ['eu', 1], ['еу', 1], ['5.000', 1], ['5000', 1], ['већу', 0.5], ['већа', 0.5], ['зелен', 1], ['кредит', 1], ['gwp', 1], ['nzeb', 1], ['термограф', 1], ['заптивен', 1],
    ],
    answer:
      'За изградњу нових зграда (активност 7.1) EU таксономија поставља неколико захтева:' +
      '\n\n• Примарна енергија (PED) најмање 10 % испод националног nZEB захтева.' +
      '\n\n• За зграде веће од 5.000 m²: тест заптивености и термографија по завршетку, као и прорачун и обелодањивање GWP-а у животном циклусу (по EN 15978, модули A1–C4).' +
      '\n\n• DNSH критеријуми, нпр. најмање 70 % неопасног грађевинског отпада припремљеног за поновну употребу или рециклажу.' +
      '\n\nСрбија није чланица ЕУ, па таксономија није обавезна, али је банке у региону користе као мерило за зелене кредите. Савски кеј испуњава критеријум примарне енергије, али не и обелодањивање: док LCA не покрије модуле A1–C4, усклађеност не може да се докаже.',
    citations: [
      { kind: 'reg', id: 'reg-eu-taksonomija', label: 'EU таксономија' },
      { kind: 'reg', id: 'reg-en-15978', label: 'EN 15978' },
      { kind: 'reg', id: 'reg-epbd-2024', label: 'EPBD 2024' },
      { kind: 'link', to: '/projekti/savski-kej/ciljevi', label: 'Савски кеј — KPI', icon: 'project' },
    ],
  },
  {
    id: 'drvena-fasada',
    question: 'Да ли смемо да користимо дрвену фасадну облогу изнад 22 m?',
    keywords: [
      ['дрвен', 1], ['дрво', 1], ['фасад', 1], ['облог', 1], ['22', 2], ['пожар', 1], ['висок', 1], ['негорив', 1], ['ариш', 1], ['clt', 1],
    ],
    answer:
      'Не, не као фасадну облогу. Објекат је „висок“ када је под највише етаже са боравком људи више од 22 m изнад коте приступа ватрогасних возила, а тада правилник за вентилисане фасаде тражи негориве облоге и изолацију (класа A1/A2).' +
      '\n\n• Дрвена облога (нпр. ариш, класа D) може до 22 m, уз противпожарне баријере — тако налажу и смернице фирме за дрво.' +
      '\n\n• Изнад 22 m: фибер-цементне плоче (A2-s1,d0), керамика или алуминијум.' +
      '\n\n• Дрво остаје у ентеријеру станова, уз сагласност пројектанта заштите од пожара.' +
      '\n\nНа Савском кеју (под повученог спрата на 30,1 m) ово је био разлог одлуке из јуна: ариш је замењен алуминијумом (+29 kgCO₂e/m²), а за Г2 је предложен фибер-цемент.',
    citations: [
      { kind: 'reg', id: 'reg-pravilnik-visoki-objekti', label: 'Правилник: високи објекти' },
      { kind: 'reg', id: 'smf-drvo', label: 'Смернице фирме: дрво' },
      { kind: 'reg', id: 'reg-srps-en-1995', label: 'Еврокод 5' },
      { kind: 'link', to: '/projekti/savski-kej/odluke?decision=dec-sk-06', label: 'Одлука: фасадна облога', icon: 'decision' },
      { kind: 'link', to: '/projekti/savski-kej/odluke?decision=dec-sk-09', label: 'Предлог: фибер-цемент', icon: 'decision' },
    ],
  },
  {
    id: 'ugradjeni-ugljenik-beton',
    question: 'Како да смањимо уграђени угљеник бетона?',
    keywords: [
      ['угљеник', 1], ['бетон', 2], ['cem', 1], ['цемент', 1], ['клинкер', 1], ['lc3', 1], ['смањ', 1], ['уграђен', 1], ['epd', 1], ['рециклир', 1],
    ],
    answer:
      'Бетон је обично највећи појединачни извор уграђеног угљеника у АБ делу зграде, а највише зависи од удела клинкера у цементу.' +
      '\n\n• Цемент: CEM III/A уместо CEM I/II. У нашој EPD библиотеци је 205 према 255 kgCO₂e/m³ за CEM II/B-M; LC3 је на 180, али је у пилот производњи, па долази у обзир за део количина.' +
      '\n\n• Оптимизација: мањи распони и дебљине плоча, високе чврстоће само где су потребне, рециклирани агрегат у подлогама.' +
      '\n\n• Спецификација: у ПГД тражити EPD по EN 15804+A2 и унапред уписати врсту цемента, да извођач не замени бољу варијанту јефтинијом.' +
      '\n\nНа Савском кеју замена CEM II бетона у АБ језгрима и преносној плочи (око 2.230 m³) уштеди око 112 t CO₂e, односно око 6 kgCO₂e/m².',
    citations: [
      { kind: 'reg', id: 'smf-lca', label: 'Стандард фирме за LCA' },
      { kind: 'reg', id: 'reg-en-15804', label: 'EN 15804 (EPD)' },
      { kind: 'link', to: '/materijali', label: 'EPD библиотека', icon: 'materials' },
      { kind: 'link', to: '/projekti/savski-kej/materijali', label: 'Савски кеј — материјали', icon: 'project' },
    ],
  },
  {
    id: 'kosava',
    question: 'Шта значи кошава за пројектовање фасаде и балкона?',
    keywords: [
      ['кошав', 2], ['ветар', 1], ['ветр', 1], ['балкон', 1], ['тераса', 1], ['терас', 1], ['фасад', 0.5], ['удар', 1],
    ],
    answer:
      'Кошава је јак југоисточни ветар (у Београду удари и до 30 m/s). За пројекат то значи четири ствари: комфор тераса, оптерећење фасаде, продор кише и заптивеност.' +
      '\n\n• Терасе изнад 20 m на ЈИ страни: CFD студија или аеротунел већ у ИДР.' +
      '\n\n• Анкерисање вентилисаних фасада рачуна се на ударе ветра по SRPS EN 1991-1-4, уз фактор угаоне зоне.' +
      '\n\n• Улази и пролази не окрећемо ка ЈИ без ветробрана.' +
      '\n\n• Прозори: двостепено заптивање и нагнута окапница, јер кошава носи кишу хоризонтално.' +
      '\n\nНа Савском кеју су изложене терасе 8. спрата и повученог спрата; студија ветра (CFD) је урађена за Г1, а на ЈИ угловима су предвиђени стаклени ветробрани.',
    citations: [
      { kind: 'reg', id: 'smf-kosava', label: 'Чек-листа за кошаву' },
      { kind: 'reg', id: 'smf-pasivno-panonija', label: 'Пасивно пројектовање' },
      { kind: 'link', to: '/projekti/savski-kej/lokacija', label: 'Савски кеј — локација и ветар', icon: 'project' },
      { kind: 'link', to: '/projekti/savski-kej/dokumenta?doc=doc-sk-cfd', label: 'Студија ветра (CFD)', icon: 'document' },
    ],
  },
  {
    id: 'kapija-g2',
    question: 'Које услове морамо да испунимо за Г2 ПГД капију?',
    keywords: [
      ['г2', 2], ['g2', 2], ['капиј', 2], ['пгд', 2], ['одбор', 1], ['седниц', 1], ['услов', 0.5], ['документ', 1], ['ревизиј', 1], ['kpi', 1],
    ],
    answer:
      'Г2 је капија пред подношење захтева за грађевинску дозволу. Одбор проверава три ствари:' +
      '\n\n• Документацију: за Савски кеј 12 докумената (пројекти свих струка, елаборат ЕЕ, елаборат заштите од пожара, LCA, енергетски модел, симулација прегревања и сагласност ЈКП „Београдске електране“). Тренутно недостају 2 од 12.' +
      '\n\n• KPI: свака вредност се упоређује са циљем пројекта, уз толеранцију од 5 %. LCA мора да обухвати модуле A1–C4, а симулација прегревања је обавезан прилог.' +
      '\n\n• Услове са Г1: затворене или образложене, укључујући LCA A1–C4 којем је рок истекао 30. септембра.' +
      '\n\nОдбор одлучује: одобрено, одобрено уз услове или враћено на дораду. С обзиром на KPI изнад прага, реално је очекивати одобрење уз услове.',
    citations: [
      { kind: 'link', to: '/odbor/ses-sk-g2', label: 'Седница Г2 — Савски кеј', icon: 'session' },
      { kind: 'reg', id: 'smf-lca', label: 'Стандард фирме за LCA' },
      { kind: 'reg', id: 'smf-pregrevanje', label: 'Протокол за прегревање' },
      { kind: 'reg', id: 'reg-pravilnik-tehnicka-dokumentacija', label: 'Садржина техничке документације' },
      { kind: 'link', to: '/projekti/savski-kej/dokumenta', label: 'Савски кеј — документација', icon: 'document' },
    ],
  },
];

export const ASK_FALLBACK =
  'У демо верзији могу да одговорим на ова питања — изаберите једно од предложених испод. Покушајте и са кључним речима: енергетска класа, EU таксономија, дрвена фасада, бетон, кошава или Г2.';

/** Minimum summed keyword weight for a free-text question to count as a match. */
const MATCH_THRESHOLD = 2;

/** Folded keyword stems, computed once. */
const FOLDED = ASK_SCRIPTS.map((s) => {
  const byStem = new Map<string, number>(); // Cyrillic and Latin spellings of one stem fold to the same key — count once
  for (const [stem, w] of s.keywords) byStem.set(foldText(stem), Math.max(w, byStem.get(foldText(stem)) ?? 0));
  return { script: s, keywords: [...byStem.entries()] };
});

/**
 * Closest scripted question for free text: sums the weights of keyword stems found in the text (case-insensitive,
 * Cyrillic or Latin). Returns undefined below the threshold. Exact suggested questions always match themselves.
 */
export function matchQuestion(text: string): AskScript | undefined {
  const folded = foldText(text);
  if (!folded.trim()) return undefined;
  const exact = ASK_SCRIPTS.find((s) => foldText(s.question) === folded.trim());
  if (exact) return exact;
  let best: { script: AskScript; score: number } | undefined;
  for (const { script, keywords } of FOLDED) {
    const score = keywords.reduce((sum, [stem, w]) => (folded.includes(stem) ? sum + w : sum), 0);
    if (score >= MATCH_THRESHOLD && (!best || score > best.score)) best = { script, score };
  }
  return best?.script;
}
