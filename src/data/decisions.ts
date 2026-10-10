import type { Decision } from '@/domain/types';

/**
 * Design Decision Records. Flagship storyline (Савски кеј):
 *   structure (CLT) → heating → parking cut → roof split at Г1 → CEM III/A → ★ facade change to aluminium
 *   (+9 % carbon) → rainwater → external shading → PROPOSED fibre-cement facade, to be decided at Г2.
 * Impact deltas are relative to the design state just before the decision.
 */
export const decisions: Decision[] = [
  /* ================================ Савски кеј — блок Ц ================================ */
  {
    id: 'dec-sk-01',
    projectId: 'savski-kej',
    date: '2025-07-09',
    title: 'Конструктивни систем: CLT + АБ језгра (варијанта Б)',
    context:
      'Пројектни задатак тражи ≤ 320 kgCO₂e/m². Поређење три варијанте у ИДР показало је да АБ скелет ' +
      '(432 kgCO₂e/m²) не може да достигне циљ ни уз CEM III/A.',
    optionsConsidered: [
      'А — АБ скелет + ETICS',
      'Б — CLT + АБ језгра + вентилисана фасада',
      'В — хибрид дрво–бетон + проширени PV',
    ],
    decision:
      'Усваја се варијанта Б: подземне етаже, приземље и језгра у АБ, изнад приземља CLT таванице и зидови.',
    rationale:
      'Најнижи уграђени угљеник, четири месеца краћа градња због монтаже и мања тежина изнад тла лошије ' +
      'носивости. Варијанта В има бољу оперативну енергију, али више бетона и највишу цену.',
    impact: { carbonDeltaPct: -28, energyDeltaPct: -7, costDeltaPct: 6.5 },
    decidedByIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-vladimir-kostic', 'p-ana-jovanovic'],
    conditions: [
      {
        id: 'cond-dec-sk-01-1',
        text: 'Ангажовати конструктора са искуством у CLT зградама изнад П+6.',
        ownerId: 'p-vladimir-kostic',
        dueDate: '2025-08-31',
        done: true,
      },
    ],
    status: 'approved',
    optionId: 'opt-sk-b',
  },
  {
    id: 'dec-sk-02',
    projectId: 'savski-kej',
    date: '2025-09-24',
    title: 'Грејање: даљинско грејање + топлотне пумпе за топлу воду',
    context:
      'Топловод Београдских електрана пролази Савском улицом на 80 m од парцеле. Пословно приземље тражи ' +
      'хлађење, а топла вода лети троши енергију из система који тада ради смањеним капацитетом.',
    optionsConsidered: [
      'Само даљинско грејање',
      'Топлотне пумпе вода-вода са бунарима за цео објекат',
      'Хибрид: даљинско за грејање, ТП ваздух-вода за топлу воду и хлађење пословања',
    ],
    decision: 'Хибридни систем: подстаница даљинског грејања и каскада топлотних пумпи ваздух-вода (R290).',
    rationale:
      'Бунари су ризични због осцилација подземне воде Саве и дугог поступка за водну дозволу. Хибрид смањује ' +
      'примарну енергију и повећава удео ОИЕ без зависности од једног система.',
    impact: { energyDeltaPct: -12, costDeltaPct: 1.2 },
    decidedByIds: ['p-nikola-petrovic', 'p-sanja-filipovic', 'p-ana-jovanovic'],
    conditions: [],
    status: 'approved',
  },
  {
    id: 'dec-sk-03',
    projectId: 'savski-kej',
    date: '2025-11-05',
    title: 'Паркинг: минимум по ПДР и план мобилности уместо 1,4 ПМ/стан',
    context:
      'Инвеститор је тражио 1,4 ПМ по стану ради продаје. То захтева два пуна подземна нивоа у зони високе ' +
      'подземне воде, уз око 1.300 m³ бетона више.',
    optionsConsidered: [
      '1,4 ПМ/стан — два пуна подземна нивоа',
      '1,1 ПМ/стан — минимум из ПДР',
      '1,1 ПМ/стан + план мобилности (car-sharing, 320 места за бицикле, пуњачи)',
    ],
    decision: 'Паркинг на минимуму из ПДР (212 ПМ) уз план мобилности; други подземни ниво смањен.',
    rationale:
      'Мање ископа у подземној води, мањи ризик и трошак градње. Локација је на 250 m од трамваја, а ' +
      'план мобилности доноси DGNB бодове у TEC3.1.',
    impact: { carbonDeltaPct: -4.1, costDeltaPct: -3.2 },
    decidedByIds: ['p-jelena-markovic', 'p-ana-jovanovic'],
    conditions: [
      {
        id: 'cond-dec-sk-03-1',
        text: 'Уговор са оператором car-sharing-а пре техничког прегледа.',
        ownerId: 'p-milena-ristic',
        dueDate: '2028-03-01',
        done: false,
      },
    ],
    status: 'approved',
  },
  {
    id: 'dec-sk-04',
    projectId: 'savski-kej',
    date: '2026-01-28',
    title: 'Подела крова: екстензивни зелени кров 55 % + PV 120 kWp',
    context:
      'PV на целом крову (160 kWp) и зелени кров на целом крову искључују се. ПДР и DGNB награђују зеленило, ' +
      'а пројектни задатак тражи ≥ 30 % ОИЕ.',
    optionsConsidered: [
      'PV на целом крову (160 kWp)',
      'Зелени кров на целом крову',
      'Подела: 55 % зелени кров, 45 % PV (120 kWp)',
      'Biosolar: PV на подконструкцији изнад екстензивног крова',
    ],
    decision: 'Подела крова 55/45; biosolar се поново разматра у ПЗИ.',
    rationale:
      'Biosolar је у ИДР одбачен због оптерећења ветром (кошава) и цене подконструкције. Подела чува ' +
      'ретенцију воде и фактор биотопа уз прихватљив губитак производње.',
    impact: { energyDeltaPct: 2, carbonDeltaPct: -0.5, costDeltaPct: -0.4 },
    sessionId: 'ses-sk-g1',
    conditions: [
      {
        id: 'cond-dec-sk-04-1',
        text: 'Поново размотрити biosolar у ПЗИ уз проверу оптерећења ветром.',
        ownerId: 'p-nikola-petrovic',
        dueDate: '2027-01-31',
        done: false,
      },
    ],
    status: 'approved',
  },
  {
    id: 'dec-sk-05',
    projectId: 'savski-kej',
    date: '2026-03-11',
    title: 'Бетон: CEM III/A у темељној плочи и подземним етажама',
    context:
      'Геомеханички елаборат тражи темељну плочу дебљине 1,0 m због узгона. Масивни бетон у подземним етажама ' +
      'чини највећи појединачни извор уграђеног угљеника.',
    optionsConsidered: [
      'CEM II/B-M у свим елементима',
      'CEM III/A у масивним елементима (темељи, подземне етаже)',
      'CEM III/A свуда, укључујући АБ језгра',
      'Нискоклинкерски LC3 бетон',
    ],
    decision: 'CEM III/A у темељној плочи, зидовима и таваницама подземних етажа; CEM II/B-M у језгрима и приземљу.',
    rationale:
      'Мања топлота хидратације је предност у масивној плочи. Језгра се изводе клизном оплатом и траже бржи ' +
      'прираст чврстоће. LC3 нема довољан капацитет испоруке за 7.500 m³.',
    impact: { carbonDeltaPct: -6, costDeltaPct: 0.4 },
    decidedByIds: ['p-vladimir-kostic', 'p-dusan-vukovic', 'p-milos-savic'],
    conditions: [
      {
        id: 'cond-dec-sk-05-1',
        text: 'Пробне мешавине CEM III/A за језгра са произвођачем бетона.',
        ownerId: 'p-dusan-vukovic',
        dueDate: '2026-10-20',
        done: false,
      },
    ],
    status: 'approved',
  },
  {
    id: 'dec-sk-06',
    projectId: 'savski-kej',
    date: '2026-06-17',
    title: 'Фасадна облога: алуминијумски панели уместо облоге од ариша',
    context:
      'Елаборат заштите од пожара (v1.0, 28. мај) утврдио је да је објекат висок (под повученог спрата на ' +
      '30,1 m), па облога од ариша класе D није прихватљива изнад 22 m. Инвеститор је тражио једнообразну ' +
      'фасаду и мало одржавање.',
    optionsConsidered: [
      'Ариш до 22 m, изнад негорива облога',
      'Пуни алуминијумски панели (A1) на целој фасади',
      'Фибер-цементне плоче (A2-s1,d0)',
      'Керамичке плоче на подконструкцији',
    ],
    decision:
      'Пуни алуминијумски панели (A1) на целој фасади, камена вуна уместо дрвених влакана и негорива облога ' +
      'CLT зидова са спољне стране.',
    rationale:
      'Избор инвеститора: једнообразан изглед, испорука за 8 недеља, гаранција 25 година. Фибер-цемент у то ' +
      'време није имао понуду у траженом формату. Одбор је обавештен накнадно — угљеник расте за ' +
      '+29 kgCO₂e/m² и пројекат прелази циљ.',
    impact: { carbonDeltaPct: 9, energyDeltaPct: 1, costDeltaPct: 1.8 },
    decidedByIds: ['p-ana-jovanovic', 'p-jelena-markovic'],
    conditions: [
      {
        id: 'cond-dec-sk-06-1',
        text: 'Ажурирати LCA са новом фасадом.',
        ownerId: 'p-milos-savic',
        dueDate: '2026-07-31',
        done: true,
      },
      {
        id: 'cond-dec-sk-06-2',
        text: 'Припремити нискоугљеничне алтернативе фасаде за одбор пре Г2.',
        ownerId: 'p-ana-jovanovic',
        dueDate: '2026-10-16',
        done: false,
      },
    ],
    status: 'approved',
  },
  {
    id: 'dec-sk-07',
    projectId: 'savski-kej',
    date: '2026-07-22',
    title: 'Кишница: резервоар 60 m³ за испирање WC и заливање',
    context:
      'Услови ЈКП БВК траже ретенцију атмосферских вода. Пројектни задатак циља ≤ 85 l/особи/дан.',
    optionsConsidered: [
      'Само ретензија по условима БВК',
      'Ретензија + кишница за заливање',
      'Ретензија + кишница за заливање и испирање WC у пословном делу',
    ],
    decision: 'Резервоар кишнице 60 m³ уз ретензију од 95 m³; двоструки развод у пословном делу.',
    rationale: 'Испуњава циљ потрошње воде и доноси DGNB бодове у ENV2.2 уз мали додатни трошак.',
    impact: { costDeltaPct: 0.3 },
    decidedByIds: ['p-sanja-filipovic', 'p-jovana-radovic', 'p-ana-jovanovic'],
    conditions: [
      {
        id: 'cond-dec-sk-07-1',
        text: 'Сагласност ЈКП БВК на двоструки развод.',
        ownerId: 'p-sanja-filipovic',
        dueDate: '2026-11-30',
        done: false,
      },
    ],
    status: 'approved',
  },
  {
    id: 'dec-sk-08',
    projectId: 'savski-kej',
    date: '2026-08-26',
    title: 'Спољна покретна засена на З и ЈЗ фасадама',
    context:
      'Прва динамичка симулација (клима 2050) показала је 108 h прегревања у ЈЗ становима горњих спратова, ' +
      'изнад протокола фирме (≤ 100 h).',
    optionsConsidered: [
      'Унутрашње завесе (без промене)',
      'Фиксне хоризонталне ламеле',
      'Спољне покретне жалузине са аутоматиком по зрачењу',
    ],
    decision: 'Спољне покретне жалузине на З и ЈЗ фасадама, аутоматско управљање уз могућност ручног.',
    rationale:
      'Фиксне ламеле смањују дневно светло зими; покретна засена задржава DF и соларне добитке у грејној сезони.',
    impact: { energyDeltaPct: -2, costDeltaPct: 0.6 },
    decidedByIds: ['p-ana-jovanovic', 'p-stefan-pavlovic', 'p-marko-djordjevic'],
    conditions: [
      {
        id: 'cond-dec-sk-08-1',
        text: 'Потврдити динамичком симулацијом (≤ 100 h) пре Г2.',
        ownerId: 'p-stefan-pavlovic',
        dueDate: '2026-10-15',
        done: false,
      },
    ],
    status: 'approved',
  },
  {
    id: 'dec-sk-09',
    projectId: 'savski-kej',
    date: '2026-09-30',
    title: 'Предлог: фибер-цементне плоче уместо алуминијумских панела',
    context:
      'После промене фасаде уграђени угљеник је 358 kgCO₂e/m² (+12 % изнад циља). Студија алтернатива ' +
      'показује да је облога највећа појединачна резерва.',
    optionsConsidered: [
      'Задржати алуминијумске панеле',
      'Алуминијумски панели са ≥ 75 % рециклата (−13 kgCO₂e/m², цена облоге +18 %)',
      'Фибер-цементне плоче A2-s1,d0 (−18 kgCO₂e/m²)',
      'Керамичке плоче (−15 kgCO₂e/m², дужа испорука)',
    ],
    decision:
      'Предлаже се фибер-цемент на свим фасадама уз задржану алуминијумску подконструкцију; уз CEM III/A ' +
      'у језгрима вредност пада на око 333 kgCO₂e/m².',
    rationale:
      'Највеће смањење угљеника уз нижу цену од алуминијума и исту класу реакције на пожар. Захтева сагласност ' +
      'инвеститора на изглед.',
    impact: { carbonDeltaPct: -5.2, costDeltaPct: -1.1 },
    sessionId: 'ses-sk-g2',
    conditions: [
      {
        id: 'cond-dec-sk-09-1',
        text: 'Сагласност инвеститора на узорак боје и текстуре.',
        ownerId: 'p-ana-jovanovic',
        dueDate: '2026-11-06',
        done: false,
      },
      {
        id: 'cond-dec-sk-09-2',
        text: 'Ажурирати елаборат заштите од пожара и LCA.',
        ownerId: 'p-milos-savic',
        dueDate: '2026-11-13',
        done: false,
      },
    ],
    status: 'proposed',
  },

  /* ================================ ОШ „Ново насеље“ ================================ */
  {
    id: 'dec-os-01',
    projectId: 'os-novo-naselje',
    date: '2025-03-19',
    title: 'Дубока обнова (варијанта Б) уместо основне',
    context: 'Основна обнова испуњава законски минимум, али не и EDGE Advanced ни услове зеленог кредита Града.',
    optionsConsidered: ['А — основна обнова, гасни котао', 'Б — дубока обнова, ТП + PV + рекуперација'],
    decision: 'Усваја се дубока обнова.',
    rationale: 'Трошкови енергије падају за око 70 %; рекуперација решава лош квалитет ваздуха у учионицама.',
    impact: { energyDeltaPct: -84, costDeltaPct: 38 },
    sessionId: 'ses-os-g1',
    conditions: [],
    status: 'approved',
    optionId: 'opt-os-b',
  },
  {
    id: 'dec-os-02',
    projectId: 'os-novo-naselje',
    date: '2025-06-04',
    title: 'PV од 140 kWp на крову фискултурне сале',
    context: 'Статичка провера крова сале показала је резерву носивости за PV на подконструкцији.',
    optionsConsidered: ['Без PV', 'PV 60 kWp', 'PV 140 kWp (цео кров сале)'],
    decision: 'PV од 140 kWp по моделу купца-произвођача.',
    rationale: 'Подиже енергетски разред са B на A и удео ОИЕ изнад 35 %.',
    impact: { energyDeltaPct: -18, carbonDeltaPct: 4, costDeltaPct: 3.5 },
    decidedByIds: ['p-katarina-mitic', 'p-stefan-pavlovic', 'p-nikola-petrovic'],
    conditions: [],
    status: 'approved',
  },

  /* ================================ Парк на Нишави ================================ */
  {
    id: 'dec-pn-01',
    projectId: 'park-nisava',
    date: '2026-06-10',
    title: 'Поплавне ливаде уместо насипа дуж целог потеза',
    context: 'Градски програм је предвиђао насип дуж обале; студија биодиверзитета нашла је гнездилишта водомара.',
    optionsConsidered: ['Насип дуж целог потеза', 'Поплавне ливаде (Q20) и стазе изнад Q100'],
    decision: 'Поплавне ливаде на 1,1 km потеза; насип само код Тврђаве.',
    rationale: 'Већа ретенција, очувана обала и мањи трошак; парк се после поплаве чисти, а не обнавља.',
    impact: { carbonDeltaPct: -30, costDeltaPct: -12 },
    decidedByIds: ['p-jovana-radovic', 'p-nikola-petrovic'],
    conditions: [],
    status: 'approved',
  },
  {
    id: 'dec-pn-02',
    projectId: 'park-nisava',
    date: '2026-09-16',
    title: 'Пропусни застори на стазама у поплавној зони',
    context: 'Асфалт у поплавној зони се оштећује и спречава упијање.',
    optionsConsidered: ['Асфалт', 'Бетонске плоче', 'Шљунак у саћастој решетки'],
    decision: 'Шљунак у саћастој решетки на стазама у зони Q20; бетонске плоче изнад Q100.',
    rationale: 'Водопропусност 91 % парка и нижи уграђени угљеник.',
    impact: { carbonDeltaPct: -8 },
    decidedByIds: ['p-jovana-radovic'],
    conditions: [],
    status: 'approved',
  },

  /* ================================ Блок 42 ================================ */
  {
    id: 'dec-b42-01',
    projectId: 'blok-42',
    date: '2026-02-18',
    title: 'Протокол за замене материјала током градње',
    context: 'Уговор са извођачем дозвољава „еквивалентне“ материјале без дефиниције еквивалентности.',
    optionsConsidered: ['Без посебног протокола', 'Замене уз EPD и сагласност одбора'],
    decision: 'Свака замена мора имати EPD и писану сагласност одбора пре наручивања.',
    rationale: 'Штити BREEAM Excellent и циљ уграђеног угљеника.',
    impact: {},
    sessionId: 'ses-b42-g3',
    conditions: [],
    status: 'approved',
  },
  {
    id: 'dec-b42-02',
    projectId: 'blok-42',
    date: '2026-09-30',
    title: 'План опоравка BREEAM Excellent',
    context: 'Извођач је заменио бетон и зид-завесу без сагласности и предложио смањење PV.',
    optionsConsidered: [
      'Прихватити замене и циљати Very Good',
      'План опоравка: EPD за зид-завесу, PV 180 kWp, CEM III/A у преосталим таваницама',
    ],
    decision: 'Усваја се план опоравка са роком 31. октобар.',
    rationale: 'Excellent је уговорна обавеза према инвеститору и услов закупца (међународна банка).',
    impact: { carbonDeltaPct: -4, costDeltaPct: 0.8 },
    sessionId: 'ses-b42-g3-rev',
    conditions: [],
    status: 'approved',
  },

  /* ================================ Вртић „Бубамара“ ================================ */
  {
    id: 'dec-vb-01',
    projectId: 'vrtic-bubamara',
    date: '2026-09-23',
    title: 'Предлог: Passivhaus Classic као циљ уместо nZEB минимума',
    context: 'Град Ниш тражи низак трошак одржавања; деца бораве у објекту 10–11 сати дневно.',
    optionsConsidered: ['nZEB минимум', 'Passivhaus Classic', 'Passivhaus Plus'],
    decision: 'Предлаже се Passivhaus Classic са сертификацијом.',
    rationale: 'Најнижи трошак грејања, квалитетан ваздух уз филтрацију, проверљив резултат (blower door).',
    impact: { energyDeltaPct: -45, costDeltaPct: 6 },
    sessionId: 'ses-vb-g0',
    conditions: [],
    status: 'proposed',
  },

  /* ================================ Стара пивара ================================ */
  {
    id: 'dec-sp-01',
    projectId: 'stara-pivara',
    date: '2025-12-10',
    title: 'Максимално задржавање постојеће зграде (варијанта А)',
    context: 'Инвеститор је разматрао фасадизам — задржавање само уличних фасада.',
    optionsConsidered: ['А — максимално задржавање', 'Б — фасаде задржане, нова CLT конструкција'],
    decision: 'Усваја се варијанта А.',
    rationale: 'Најнижи угљеник, LEED кредит за поновну употребу и подршка Завода.',
    impact: { carbonDeltaPct: -28, costDeltaPct: -9 },
    sessionId: 'ses-sp-g0',
    conditions: [],
    status: 'approved',
    optionId: 'opt-sp-a',
  },
  {
    id: 'dec-sp-02',
    projectId: 'stara-pivara',
    date: '2026-09-09',
    title: 'Замена кородираних решеткастих носача новим челиком',
    context: 'Преглед конструкције (август 2026) показао је корозију ослонаца и доњих појасева на 30 % носача.',
    optionsConsidered: ['Санација свих носача на лицу места', 'Замена кородираних носача новим', 'Замена целе кровне конструкције'],
    decision: 'Замена 30 % носача новим челиком истог облика; остали се санирају.',
    rationale: 'Санација кородираних ослонаца је скупља од замене и не даје поуздану носивост за нове терете.',
    impact: { carbonDeltaPct: 16, costDeltaPct: 2.4 },
    decidedByIds: ['p-dusan-vukovic', 'p-ivana-lazic', 'p-vladimir-kostic'],
    conditions: [
      {
        id: 'cond-dec-sp-02-1',
        text: 'Испитати могућност набавке половних профила из рушења у региону.',
        ownerId: 'p-ivana-lazic',
        dueDate: '2026-11-15',
        done: false,
      },
    ],
    status: 'approved',
  },
  {
    id: 'dec-sp-03',
    projectId: 'stara-pivara',
    date: '2026-10-02',
    title: 'Предлог: закуп 10 паркинг места у суседној јавној гаражи',
    context: 'Паркинг норма захтева 70 места; на парцели је могуће 64 без рушења заштићеног анекса.',
    optionsConsidered: ['Рушење анекса за паркинг', 'Подземна гаража испод дворишта', 'Закуп у јавној гаражи'],
    decision: 'Предлаже се дугорочни закуп 10 места у гаражи на 200 m.',
    rationale: 'Без рушења и ископа у зони подземне воде; потребна сагласност Града.',
    impact: { carbonDeltaPct: 0 },
    sessionId: 'ses-sp-g1',
    conditions: [],
    status: 'proposed',
  },
];
