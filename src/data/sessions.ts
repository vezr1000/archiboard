import type { BoardSession } from '@/domain/types';

/**
 * Design board sessions (past + upcoming). Board: Јелена Марковић (председница), Никола Петровић,
 * Драган Илић, Владимир Костић.
 *
 * ★ `ses-sk-g2` — Савски кеј, Г2 ПГД, 23. октобар 2026 — powers the deep gate-review demo (step 10):
 *   12 required documents (2 not ready), 8 scripted АИ findings, open conditions from Г1.
 */
export const boardSessions: BoardSession[] = [
  /* ================================ Савски кеј — блок Ц ================================ */
  {
    id: 'ses-sk-g0',
    projectId: 'savski-kej',
    gate: 'G0',
    date: '2025-03-20',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-vladimir-kostic'],
    agenda: [
      'Пројектни задатак и програм инвеститора',
      'Циљеви одрживости: DGNB Gold, EU таксономија, ≤ 320 kgCO₂e/m²',
      'Састав тима и спољни сарадници (конструкција у дрвету)',
    ],
    requiredDocumentIds: ['doc-sk-pz'],
    outcome: 'approved',
    conditions: [],
    minutes:
      'Одбор је усвојио пројектни задатак. Циљ уграђеног угљеника постављен је на 320 kgCO₂e/m², испод ' +
      'циља фирме (350), јер инвеститор планира зелени кредит усклађен са EU таксономијом. Тражено је да ИДР ' +
      'упореди најмање три конструктивна система.',
    aiFindings: [],
    location: '10:00 · сала „Сава“, Београд',
  },
  {
    id: 'ses-sk-g1',
    projectId: 'savski-kej',
    gate: 'G1',
    date: '2026-01-28',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-dragan-ilic', 'p-vladimir-kostic'],
    agenda: [
      'Идејно решење v3.0 и локацијски услови',
      'LCA ИДР — 312 kgCO₂e/m² (циљ 320)',
      'Подела крова између PV и зеленог крова',
      'Студија ветра — терасе на ЈИ угловима',
      'DGNB претходна процена — 70 %',
    ],
    requiredDocumentIds: ['doc-sk-idr', 'doc-sk-lu', 'doc-sk-dgnb-pre', 'doc-sk-cfd', 'doc-sk-sag-zavod'],
    outcome: 'approved-with-conditions',
    conditions: [
      {
        id: 'cond-sk-g1-01',
        text: 'Проширити LCA на модуле A1–C4 по стандарду фирме пре Г2.',
        ownerId: 'p-milos-savic',
        dueDate: '2026-09-30',
        done: false,
      },
      {
        id: 'cond-sk-g1-02',
        text: 'Потврдити CFD анализом удобност тераса са стакленим ветробранима.',
        ownerId: 'p-marko-djordjevic',
        dueDate: '2026-03-31',
        done: true,
      },
      {
        id: 'cond-sk-g1-03',
        text: 'Прибавити техничке услове Београдских електрана за хибридни систем (даљинско + ТП).',
        ownerId: 'p-milena-ristic',
        dueDate: '2026-04-30',
        done: true,
      },
      {
        id: 'cond-sk-g1-04',
        text: 'Ажурирати DGNB процену са количинама из ПГД.',
        ownerId: 'p-nikola-petrovic',
        dueDate: '2026-07-31',
        done: true,
      },
      {
        id: 'cond-sk-g1-05',
        text: 'Задржати резерву индекса заузетости — без проширења габарита приземља.',
        ownerId: 'p-ana-jovanovic',
        dueDate: '2026-10-23',
        done: false,
      },
    ],
    minutes:
      'Одбор је одобрио прелазак у ПГД уз пет услова. ИДР са 312 kgCO₂e/m² испуњава циљ, али LCA обухвата ' +
      'само A1–A3, па је затражено проширење на цео животни циклус пре Г2. Усвојена је подела крова: ' +
      'екстензивни зелени кров на 55 % и PV од 120 kWp на преосталом делу (одлука dec-sk-04). Владимир ' +
      'Костић је упозорио да ће висина од преко 22 m отворити питање фасадне облоге од дрвета у елаборату ' +
      'заштите од пожара — Ана Јовановић ће то проверити са пројектантом заштите од пожара.',
    aiFindings: [
      {
        id: 'f-sk-g1-01',
        severity: 'warning',
        title: 'LCA обухвата само модуле A1–A3',
        detail: 'Извештај v1.0 не садржи B4 и C1–C4; стандард фирме захтева цео животни циклус од Г1.',
        reference: 'Стандард фирме за LCA (СГ-03)',
        documentId: 'doc-sk-lca',
        regulationId: 'smf-lca',
      },
      {
        id: 'f-sk-g1-02',
        severity: 'warning',
        title: 'Дрвена фасадна облога изнад 22 m',
        detail:
          'Под повученог спрата је на 30,1 m — објекат је „висок“. Облога од ариша (класа D) захтева потврду ' +
          'пројектанта заштите од пожара или замену негоривом облогом изнад 22 m.',
        reference: 'Правилник о заштити високих објеката од пожара',
        regulationId: 'reg-pravilnik-visoki-objekti',
      },
      {
        id: 'f-sk-g1-03',
        severity: 'info',
        title: 'Индекс заузетости 0,49 (граница 0,50)',
        detail: 'Маргина 2 % — препорука да се габарит приземља закључа за ПГД.',
        reference: 'ЛУ стр. 3, тач. 2.1',
        documentId: 'doc-sk-lu',
      },
    ],
    location: '10:00 · сала „Сава“, Београд',
  },
  {
    id: 'ses-sk-g2',
    projectId: 'savski-kej',
    gate: 'G2',
    date: '2026-10-23',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-dragan-ilic', 'p-vladimir-kostic'],
    agenda: [
      'Статус ПГД и налази техничке контроле — Ана Јовановић',
      'Уграђени угљеник: LCA v2.0, промена фасаде и предлог фибер-цементних плоча — Милош Савић',
      'Енергија и комфор: елаборат ЕЕ и симулација прегревања — Стефан Павловић',
      'DGNB процена и услови зеленог кредита (EU таксономија) — Никола Петровић',
      'Сагласност Београдских електрана и рок за подношење захтева за грађевинску дозволу — Милена Ристић',
      'Услови са Г1 — статус',
      'Одлука о преласку у ПЗИ',
    ],
    requiredDocumentIds: [
      'doc-sk-arh-pgd',
      'doc-sk-kon-pgd',
      'doc-sk-mas-pgd',
      'doc-sk-vik-pgd',
      'doc-sk-ee',
      'doc-sk-pozar',
      'doc-sk-geo',
      'doc-sk-lu',
      'doc-sk-lca',
      'doc-sk-energ-model',
      'doc-sk-sag-be',
      'doc-sk-pregrevanje',
    ],
    outcome: 'scheduled',
    conditions: [],
    aiFindings: [
      {
        id: 'f-sk-g2-01',
        severity: 'critical',
        title: 'Уграђени угљеник 12 % изнад циља',
        detail:
          'LCA v2.0: 358 kgCO₂e/m² према циљу 320 (+11,9 %). Главни узрок је замена облоге од ариша ' +
          'алуминијумским панелима у јуну (+29 kgCO₂e/m²). Фибер-цементне плоче (предлог одлуке) враћају ' +
          'вредност на ~340, а у комбинацији са CEM III/A у АБ језгрима на ~333 kgCO₂e/m² (+4 %).',
        reference: 'LCA извештај v2.0, табела 4 — hotspot анализа',
        documentId: 'doc-sk-lca',
      },
      {
        id: 'f-sk-g2-02',
        severity: 'critical',
        title: 'Недостаје сагласност ЈКП „Београдске електране“',
        detail:
          'Локацијски услови захтевају сагласност на пројекат прикључења пре подношења захтева за грађевинску ' +
          'дозволу. БЕ је 22. септембра тражила допуну хидрауличког прорачуна; допуна је послата 25. септембра, ' +
          'одговор још није стигао.',
        reference: 'ЛУ стр. 7, тач. 4.4',
        documentId: 'doc-sk-sag-be',
      },
      {
        id: 'f-sk-g2-03',
        severity: 'warning',
        title: 'Индекс заузетости 0,49 — граница ПДР 0,50, маргина 2 %',
        detail:
          'Свака измена габарита у ПЗИ може прекорачити границу. Надстрешница над улазом у пасаж (25 m²) из ' +
          'коментара инвеститора искористила би половину преостале резерве.',
        reference: 'ПДР Савски амфитеатар, правила грађења за целину Ц; ЛУ стр. 3, тач. 2.1',
        documentId: 'doc-sk-lu',
      },
      {
        id: 'f-sk-g2-04',
        severity: 'warning',
        title: 'LCA не покрива модуле C1–C4',
        detail:
          'Извештај v2.0 обухвата A1–A3 и B4. Стандард фирме и DGNB ENV1.1 захтевају и крај животног века; ' +
          'вредност A1–C4 од 568 kgCO₂e/m² је процена по подразумеваним сценаријима. Услов са Г1 (рок 30. ' +
          'септембар) није испуњен.',
        reference: 'Стандард фирме за LCA (СГ-03); DGNB ENV1.1',
        documentId: 'doc-sk-lca',
        regulationId: 'smf-lca',
      },
      {
        id: 'f-sk-g2-05',
        severity: 'warning',
        title: 'EU таксономија: обелодањивање GWP за зграде веће од 5.000 m²',
        detail:
          'БРГП је 18.400 m². За активност 7.1 потребан је GWP у животном циклусу израчунат и обелодањен, као ' +
          'и тест заптивености и термографија по завршетку. Банка то тражи као услов прве транше зеленог кредита.',
        reference: 'Делегирана уредба (EU) 2021/2139, Анекс I, активност 7.1',
        regulationId: 'reg-eu-taksonomija',
      },
      {
        id: 'f-sk-g2-06',
        severity: 'warning',
        title: 'Прегревање у ЈЗ становима 7. и 8. спрата',
        detail:
          'Прелиминарно 108 h годишње изнад горње границе категорије II (клима 2050), циљ ≤ 100 h. Модел са ' +
          'спољном засеном (v0.4) није завршен, а симулација је обавезан прилог за Г2.',
        reference: 'Протокол за процену летњег прегревања (СГ-07)',
        documentId: 'doc-sk-pregrevanje',
        regulationId: 'smf-pregrevanje',
      },
      {
        id: 'f-sk-g2-07',
        severity: 'info',
        title: 'DGNB предвиђање 66 % — Gold уз малу резерву',
        detail:
          'Праг за Gold је 65 %. Угрожени су ENV1.1 (LCA) и SOC1.1 (топлотни комфор); њиховим решавањем ' +
          'оцена се враћа на око 70 %, колико тражи пројектни задатак.',
        reference: 'DGNB претходна процена v2.1',
        documentId: 'doc-sk-dgnb-pre',
        regulationId: 'reg-dgnb',
      },
      {
        id: 'f-sk-g2-08',
        severity: 'info',
        title: 'Удео ОИЕ 28 % — испод циља од 30 %',
        detail:
          'После поделе крова инсталисано је 120 kWp. Biosolar решење (PV на подконструкцији изнад ' +
          'екстензивног зеленог крова) додало би око 40 kWp без смањења фактора биотопа.',
        reference: 'Смернице фирме СГ-05 — зелени кровови',
        regulationId: 'smf-zeleni-krov',
      },
    ],
    location: '10:00 · сала „Сава“, Београд',
  },

  /* ================================ ОШ „Ново насеље“ ================================ */
  {
    id: 'ses-os-g1',
    projectId: 'os-novo-naselje',
    gate: 'G1',
    date: '2025-03-19',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-dragan-ilic'],
    agenda: ['Поређење варијанти обнове', 'Циљ EDGE Advanced', 'Фазе радова током летњих распуста'],
    requiredDocumentIds: ['doc-os-pasos-postojece'],
    outcome: 'approved',
    conditions: [],
    minutes:
      'Одбор је подржао варијанту Б (дубока обнова). Циљ енергетског разреда подигнут је са B на A уз ' +
      'услов да се PV на крову фискултурне сале провери статички.',
    aiFindings: [],
    location: '11:00 · канцеларија Нови Сад',
  },
  {
    id: 'ses-os-g2',
    projectId: 'os-novo-naselje',
    gate: 'G2',
    date: '2025-07-09',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-dragan-ilic'],
    agenda: ['ПГД и елаборат ЕЕ', 'EDGE прорачун', 'Приступачност — лифт'],
    requiredDocumentIds: ['doc-os-ee'],
    outcome: 'approved-with-conditions',
    conditions: [
      {
        id: 'cond-os-g2-01',
        text: 'Наћи решење за приступачан лифт (спољни лифт или проширење окна).',
        ownerId: 'p-katarina-mitic',
        dueDate: '2026-11-18',
        done: false,
      },
      {
        id: 'cond-os-g2-02',
        text: 'Прибавити EDGE preliminary сертификат пре тендера.',
        ownerId: 'p-nikola-petrovic',
        dueDate: '2025-10-01',
        done: true,
      },
    ],
    minutes:
      'ПГД одобрен. Енергетски циљеви испуњени са резервом (EDGE 52 %). Отворено питање приступачности ' +
      'горњих етажа — постојеће окно лифта је преуско.',
    aiFindings: [],
    location: '11:00 · канцеларија Нови Сад',
  },
  {
    id: 'ses-os-g3',
    projectId: 'os-novo-naselje',
    gate: 'G3',
    date: '2026-11-18',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-dragan-ilic'],
    agenda: ['ПЗИ и фазе извођења', 'Тендерска документација', 'Решење лифта'],
    requiredDocumentIds: ['doc-os-pzi-arh', 'doc-os-ee', 'doc-os-edge', 'doc-os-lca'],
    outcome: 'scheduled',
    conditions: [],
    aiFindings: [
      {
        id: 'f-os-g3-01',
        severity: 'warning',
        title: 'Услов са Г2 о лифту још отворен',
        detail: 'Без приступачног лифта школа не испуњава правилник о приступачности за горње етаже.',
        reference: 'Правилник о приступачности',
        regulationId: 'reg-pravilnik-pristupacnost',
      },
      {
        id: 'f-os-g3-02',
        severity: 'info',
        title: 'Рок наручивања прозора',
        detail: 'За монтажу у првом летњем распусту прозоре треба наручити до краја фебруара 2027.',
        reference: 'Пројекат архитектуре (ПЗИ) v1.3',
        documentId: 'doc-os-pzi-arh',
      },
    ],
    location: '11:00 · канцеларија Нови Сад',
  },

  /* ================================ Парк на Нишави ================================ */
  {
    id: 'ses-pn-g0',
    projectId: 'park-nisava',
    gate: 'G0',
    date: '2026-04-15',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-vladimir-kostic'],
    agenda: ['Пројектни задатак Града Ниша', 'Интерни скор плаво-зелене инфраструктуре', 'Партнерство са хидротехничарима'],
    requiredDocumentIds: [],
    outcome: 'approved',
    conditions: [],
    minutes:
      'Одбор је подржао концепт „парк који прихвата воду“ и интерни скор плаво-зелене инфраструктуре као ' +
      'замену за сертификацију. Циљ: ниво „Напредни“ (≥ 75).',
    aiFindings: [],
    location: '09:30 · видео-позив',
  },
  {
    id: 'ses-pn-g1',
    projectId: 'park-nisava',
    gate: 'G1',
    date: '2026-11-04',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-vladimir-kostic'],
    agenda: ['Идејно решење парка', 'Хидраулички модел и водни услови', 'Приступачност стаза'],
    requiredDocumentIds: ['doc-pn-lu', 'doc-pn-biodiverzitet', 'doc-pn-idr', 'doc-pn-hidraulika'],
    outcome: 'scheduled',
    conditions: [],
    aiFindings: [
      {
        id: 'f-pn-g1-01',
        severity: 'warning',
        title: 'Хидраулички модел у нацрту',
        detail: 'Водни услови траже прорачун за поплавне ливаде у зони Q20; модел v0.3 још није калибрисан на Q100.',
        reference: 'Водни услови ЈВП „Србијаводе“, тач. 3.4',
        documentId: 'doc-pn-hidraulika',
      },
      {
        id: 'f-pn-g1-02',
        severity: 'info',
        title: 'Нагиб прелаза са насипа 7 %',
        detail: 'На дужини од 40 m прелаз прелази 5 % — потребна рампа са одмориштима или алтернативна траса.',
        reference: 'Правилник о приступачности',
        regulationId: 'reg-pravilnik-pristupacnost',
      },
    ],
    location: '10:00 · сала „Сава“, Београд',
  },

  /* ================================ Блок 42 ================================ */
  {
    id: 'ses-b42-g3',
    projectId: 'blok-42',
    gate: 'G3',
    date: '2026-02-18',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-vladimir-kostic'],
    agenda: ['ПЗИ и избор извођача', 'BREEAM Design Stage — 72,3 %', 'Протокол за замене материјала'],
    requiredDocumentIds: ['doc-b42-gd', 'doc-b42-pzi-arh', 'doc-b42-breeam'],
    outcome: 'approved-with-conditions',
    conditions: [
      {
        id: 'cond-b42-g3-01',
        text: 'Свака замена материјала извођача мора имати EPD и сагласност одбора пре наручивања.',
        ownerId: 'p-nemanja-stevanovic',
        dueDate: '2026-03-15',
        done: true,
      },
      {
        id: 'cond-b42-g3-02',
        text: 'Месечни извештај о BREEAM доказима са градилишта.',
        ownerId: 'p-nikola-petrovic',
        dueDate: '2026-04-01',
        done: true,
      },
    ],
    minutes:
      'ПЗИ одобрен. Уведен протокол: замене материјала само уз EPD и сагласност одбора. Извођач уведен у посао у марту.',
    aiFindings: [],
    location: '10:00 · сала „Сава“, Београд',
  },
  {
    id: 'ses-b42-g3-rev',
    projectId: 'blok-42',
    gate: 'G3',
    date: '2026-09-30',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-vladimir-kostic'],
    agenda: [
      'Ванредни преглед: замене материјала које је извођач спровео без сагласности',
      'Утицај на BREEAM Excellent и уграђени угљеник',
      'План опоравка',
    ],
    requiredDocumentIds: ['doc-b42-zamene', 'doc-b42-lca'],
    outcome: 'rework',
    conditions: [
      {
        id: 'cond-b42-rev-01',
        text: 'Захтевати од извођача EPD за зид-завесу или повратак на специфицирани систем.',
        ownerId: 'p-nemanja-stevanovic',
        dueDate: '2026-10-20',
        done: false,
      },
      {
        id: 'cond-b42-rev-02',
        text: 'Вратити PV на 180 kWp — анекс уговора са инвеститором.',
        ownerId: 'p-jelena-markovic',
        dueDate: '2026-10-31',
        done: false,
      },
      {
        id: 'cond-b42-rev-03',
        text: 'Преостале таванице (7.–12. спрат) изводити са CEM III/A.',
        ownerId: 'p-vladimir-kostic',
        dueDate: '2026-10-15',
        done: false,
      },
    ],
    minutes:
      'Одбор констатује да је извођач у таваницама 1.–6. спрата уградио бетон са CEM II и наручио зид-завесу ' +
      'другог добављача без EPD, а инвеститору предложио смањење PV на 95 kWp. BREEAM процена је пала на ' +
      '66,7 % (испод Excellent). Пројекат се враћа на дораду са планом опоравка до 31. октобра.',
    aiFindings: [
      {
        id: 'f-b42-rev-01',
        severity: 'critical',
        title: 'BREEAM 66,7 % — испод прага Excellent (70 %)',
        detail: 'Губитак кредита у Mat 01 (LCA), Mat 03 (одговорна набавка) и Ene 04 (нискоугљеничне технологије).',
        reference: 'Анализа замена материјала v1.2',
        documentId: 'doc-b42-zamene',
      },
      {
        id: 'f-b42-rev-02',
        severity: 'warning',
        title: 'Уграђени угљеник +11 % у односу на циљ',
        detail: '421 kgCO₂e/m² према циљу 380 — CEM II у таваницама (+21), зид-завеса без EPD (+23 са фактором сигурности).',
        reference: 'LCA извештај v3.0',
        documentId: 'doc-b42-lca',
      },
    ],
    location: '10:00 · сала „Сава“, Београд',
  },
  {
    id: 'ses-b42-g4',
    projectId: 'blok-42',
    gate: 'G4',
    date: '2027-04-20',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-vladimir-kostic'],
    agenda: ['Технички преглед и BREEAM Post-Construction', 'Енергетски пасош', 'Тест заптивености'],
    requiredDocumentIds: ['doc-b42-zamene', 'doc-b42-lca'],
    outcome: 'scheduled',
    conditions: [],
    aiFindings: [],
    location: '10:00 · градилиште, Нови Београд',
  },

  /* ================================ Вртић „Бубамара“ ================================ */
  {
    id: 'ses-vb-g0',
    projectId: 'vrtic-bubamara',
    gate: 'G0',
    date: '2026-10-14',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-vladimir-kostic'],
    agenda: ['Пројектни задатак Града Ниша', 'Passivhaus Classic као циљ', 'Дрвена конструкција и сеизмика у Нишу'],
    requiredDocumentIds: ['doc-vb-lokacija', 'doc-vb-pz', 'doc-vb-phpp'],
    outcome: 'scheduled',
    conditions: [],
    aiFindings: [
      {
        id: 'f-vb-g0-01',
        severity: 'warning',
        title: 'Грејно оптерећење 10,4 W/m² — на граници',
        detail: 'Passivhaus дозвољава Qh ≤ 15 kWh/m²a или грејно оптерећење ≤ 10 W/m²; модел испуњава први критеријум (14).',
        reference: 'Прелиминарни PHPP модел v0.3',
        documentId: 'doc-vb-phpp',
        regulationId: 'reg-passivhaus',
      },
      {
        id: 'f-vb-g0-02',
        severity: 'info',
        title: 'Квалитет ваздуха у Нишу',
        detail: 'Зими високе концентрације PM2,5 — у задатак унети филтре ePM1 на вентилацији.',
        reference: 'Анализа локације',
        documentId: 'doc-vb-lokacija',
      },
    ],
    location: '14:00 · видео-позив са Градом Нишом',
  },

  /* ================================ Стара пивара ================================ */
  {
    id: 'ses-sp-g0',
    projectId: 'stara-pivara',
    gate: 'G0',
    date: '2025-12-10',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-dragan-ilic', 'p-vladimir-kostic'],
    agenda: ['Програм пренамене', 'LEED Gold и циљ поновне употребе ≥ 60 %', 'Снимак постојећег стања'],
    requiredDocumentIds: ['doc-sp-snimak'],
    outcome: 'approved',
    conditions: [],
    minutes:
      'Одбор је подржао варијанту максималног задржавања. Услов: преглед челичне конструкције пре ИДР.',
    aiFindings: [],
    location: '11:00 · канцеларија Нови Сад',
  },
  {
    id: 'ses-sp-g1',
    projectId: 'stara-pivara',
    gate: 'G1',
    date: '2026-11-25',
    memberIds: ['p-jelena-markovic', 'p-nikola-petrovic', 'p-dragan-ilic', 'p-vladimir-kostic'],
    agenda: ['Идејно решење', 'Последице прегледа конструкције', 'Паркинг норма', 'LEED процена'],
    requiredDocumentIds: ['doc-sp-uslovi-zavod', 'doc-sp-pregled-konstrukcije', 'doc-sp-audit', 'doc-sp-idr', 'doc-sp-lca'],
    outcome: 'scheduled',
    conditions: [],
    aiFindings: [
      {
        id: 'f-sp-g1-01',
        severity: 'warning',
        title: 'Удео поново употребљених материјала 48 % (циљ 60 %)',
        detail: 'Пад после замене кородираних носача. LEED кредит за поновну употребу зграде је на граници (52 %).',
        reference: 'Преглед материјала пре рушења v1.1',
        documentId: 'doc-sp-audit',
      },
      {
        id: 'f-sp-g1-02',
        severity: 'critical',
        title: 'Паркинг норма није испуњена',
        detail: 'Потребно 70 ПМ, на парцели могуће 64. Без уговора о закупу у јавној гаражи локацијски услови неће бити издати.',
        reference: 'ПДР „Радна зона Север“ — правила паркирања',
      },
    ],
    location: '11:00 · канцеларија Нови Сад',
  },
];
