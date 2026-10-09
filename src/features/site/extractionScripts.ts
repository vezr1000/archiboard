/**
 * Scripted „АИ извлачење услова“ results per project. Nothing here is computed from a real document —
 * the demo plays back pre-written findings (see the disclaimer in the card).
 *
 * `matchesId` points at an existing seed requirement that already covers the condition („већ у листи“);
 * conditions without it are NEW and can be accepted into the checklist.
 */
import type { RequirementCategory } from '@/domain/types';

export interface ExtractedCondition {
  /** Stable key within the project; the accepted requirement id is `req-ai-<projectId>-<key>`. */
  key: string;
  /** Page of the source document. */
  page: number;
  /** Item reference as printed in the document, e.g. „тач. 4.4 (услови ЈКП Београдске електране)“. */
  item: string;
  category: RequirementCategory;
  text: string;
  /** Model confidence, 0..100. */
  confidence: number;
  /** Existing requirement id when the checklist already contains this condition. */
  matchesId?: string;
}

export interface ExtractionScript {
  fileName: string;
  sizeMb: number;
  pages: number;
  /** Short name used in the page reference, e.g. „ЛУ“ or „ВУ“. */
  docAbbr: string;
  /** Document kind in the genitive, for „Извуци услове из …“. */
  docGenitive: string;
  /** Plan the extraction is „compared“ with. */
  planName: string;
  /** Progressive status lines of the thinking phase (first is the upload). */
  statusLines: string[];
  conditions: ExtractedCondition[];
}

const lines = (pages: number, plan: string, utilities: string): string[] => [
  'Отпремам документ…',
  `Читам ${pages} страна…`,
  utilities,
  `Упоређујем са ${plan}…`,
  'Проверавам постојећу листу услова…',
];

export const EXTRACTION_SCRIPTS: Record<string, ExtractionScript> = {
  'savski-kej': {
    fileName: 'Lokacijski_uslovi_ROP-BGDU-21874-LOC-1_2025.pdf',
    sizeMb: 2.4,
    pages: 14,
    docAbbr: 'ЛУ',
    docGenitive: 'локацијских услова',
    planName: 'ПДР „Савски амфитеатар“',
    statusLines: lines(14, 'ПДР „Савски амфитеатар“', 'Препознајем услове ЈКП и Електродистрибуције Србије…'),
    conditions: [
      {
        key: 'daljinsko',
        page: 7,
        item: 'тач. 4.4 (услови ЈКП Београдске електране)',
        category: 'energija',
        text: 'Прикључење на систем даљинског грејања преко топлотне подстанице у сутерену објекта; сагласност на машински пројекат пре захтева за грађевинску дозволу.',
        confidence: 97,
        matchesId: 'req-sk-08',
      },
      {
        key: 'retencija',
        page: 6,
        item: 'тач. 4.2 (услови ЈКП БВК)',
        category: 'voda',
        text: 'Атмосферске воде задржати на парцели — ретензија најмање 30 l/m² непропусне површине, са контролисаним испуштањем у општи систем.',
        confidence: 95,
        matchesId: 'req-sk-07',
      },
      {
        key: 'zelenilo',
        page: 4,
        item: 'тач. 2.6',
        category: 'zelenilo',
        text: 'Најмање 30 % зелених површина на парцели, од чега најмање 15 % на природном тлу.',
        confidence: 96,
        matchesId: 'req-sk-04',
      },
      {
        key: 'zavod',
        page: 8,
        item: 'тач. 4.6 (услови Завода за заштиту споменика културе)',
        category: 'nasledje',
        text: 'Обрада фасаде према кеју подлеже сагласности Завода за заштиту споменика културе града Београда; археолошки надзор при земљаним радовима.',
        confidence: 91,
        matchesId: 'req-sk-09',
      },
      {
        key: 'ts',
        page: 6,
        item: 'тач. 4.3 (услови Електродистрибуције Србије)',
        category: 'energija',
        text: 'Трансформаторска станица 10/0,4 kV у објекту, са директним приступом са јавне површине.',
        confidence: 93,
        matchesId: 'req-sk-10',
      },
      {
        key: 'parking-ev',
        page: 4,
        item: 'тач. 2.9',
        category: 'saobracaj',
        text: 'Паркирање у подземној гаражи, 1,1 ПМ по стану; најмање 10 % места опремити за пуњење електричних возила и обезбедити 1 бициклистичко место по стану.',
        confidence: 88,
      },
      {
        key: 'bula',
        page: 9,
        item: 'тач. 5.1',
        category: 'ostalo',
        text: 'Заштита од буке са саобраћајнице (Савска магистрала): фасадни елементи и вентилација станова ка улици морају обезбедити унутрашњи ниво буке до 30 dB(A) ноћу.',
        confidence: 89,
      },
      {
        key: 'vatrogasni',
        page: 10,
        item: 'тач. 5.3',
        category: 'zastita-od-pozara',
        text: 'Обезбедити приступ и површину за интервенцију ватрогасних возила са кејске стране (носивост 100 kN) и унутрашњег пролаза, ширине најмање 4 m.',
        confidence: 84,
      },
    ],
  },

  'os-novo-naselje': {
    fileName: 'Lokacijski_uslovi_ROP-NSA-4417-LOC-1_2026.pdf',
    sizeMb: 1.7,
    pages: 9,
    docAbbr: 'ЛУ',
    docGenitive: 'локацијских услова',
    planName: 'ПГР Новог Сада',
    statusLines: lines(9, 'ПГР Новог Сада', 'Препознајем услове оператера мрежа и Сектора за ванредне ситуације…'),
    conditions: [
      {
        key: 'gabarit',
        page: 2,
        item: 'тач. 1.4',
        category: 'urbanizam',
        text: 'Задржавају се постојећи габарит и спратност; дозвољена спољна термоизолација до 25 cm преко грађевинске линије.',
        confidence: 96,
        matchesId: 'req-os-02',
      },
      {
        key: 'pozar',
        page: 6,
        item: 'тач. 4.1 (услови у погледу заштите од пожара)',
        category: 'zastita-od-pozara',
        text: 'Фасадна изолација од негоривог материјала на целој фасади школе; елаборат заштите од пожара уз захтев за грађевинску дозволу.',
        confidence: 92,
        matchesId: 'req-os-07',
      },
      {
        key: 'gas',
        page: 4,
        item: 'тач. 3.1 (услови оператера дистрибутивног система гаса)',
        category: 'energija',
        text: 'Деактивирати гасни прикључак и уклонити котларницу пре почетка радова; записник о искључењу доставити оператеру.',
        confidence: 90,
      },
      {
        key: 'eds',
        page: 4,
        item: 'тач. 3.3 (услови Електродистрибуције Србије)',
        category: 'energija',
        text: 'Повећање прикључне снаге за топлотне пумпе и прикључење PV система по моделу купца-произвођача; мерно место на фасади према улици.',
        confidence: 87,
      },
      {
        key: 'zelenilo',
        page: 5,
        item: 'тач. 3.6',
        category: 'zelenilo',
        text: 'Најмање 40 % зелених површина на парцели; постојеће високо дрвеће у школском дворишту се задржава, а уклањање захтева сагласност.',
        confidence: 85,
      },
      {
        key: 'parking',
        page: 5,
        item: 'тач. 3.8',
        category: 'saobracaj',
        text: 'Паркирање на парцели: 1 ПМ по учионици (укупно најмање 24 ПМ), уз смештај за бицикле при улазу.',
        confidence: 83,
      },
      {
        key: 'gradiliste',
        page: 8,
        item: 'тач. 5.2',
        category: 'ostalo',
        text: 'Организација градилишта: радови без прекида наставе, пешачки приступ школи остаје отворен, привремене ограде и заштита од буке и прашине према учионицама.',
        confidence: 81,
      },
    ],
  },

  'park-nisava': {
    fileName: 'Vodni_uslovi_Srbijavode_VU-0412_2026.pdf',
    sizeMb: 1.8,
    pages: 9,
    docAbbr: 'ВУ',
    docGenitive: 'водних услова',
    planName: 'ПДР приобаља Нишаве',
    statusLines: lines(9, 'ПДР приобаља Нишаве', 'Препознајем водне услове ЈВП „Србијаводе“…'),
    conditions: [
      {
        key: 'protocni-profil',
        page: 3,
        item: 'тач. 3.2',
        category: 'voda',
        text: 'Без објеката и ограда у протицајном профилу за Q100; шетне стазе и павиљон на коти изнад Q100.',
        confidence: 97,
        matchesId: 'req-pn-02',
      },
      {
        key: 'q20',
        page: 3,
        item: 'тач. 3.4',
        category: 'voda',
        text: 'Поплавне ливаде и биоретенције у зони Q20 захтевају сагласност на хидраулички прорачун.',
        confidence: 94,
        matchesId: 'req-pn-03',
      },
      {
        key: 'inspekciona-staza',
        page: 4,
        item: 'тач. 3.6',
        category: 'voda',
        text: 'Уз насип обезбедити инспекциону стазу ширине најмање 4 m за приступ механизације ЈВП; без садње дрвећа на 10 m од круне насипа.',
        confidence: 90,
      },
      {
        key: 'gradiliste-q20',
        page: 4,
        item: 'тач. 3.8',
        category: 'voda',
        text: 'Током градње не депоновати материјал и не постављати привремене објекте испод коте Q20; план евакуације градилишта при најави великих вода.',
        confidence: 86,
      },
      {
        key: 'uliv',
        page: 5,
        item: 'тач. 4.1',
        category: 'voda',
        text: 'Атмосферске воде околних улица усмеравати у биоретенције тек након третмана (таложник и сепаратор уља), уз контролисан прелив ка Нишави.',
        confidence: 88,
      },
      {
        key: 'bunari',
        page: 6,
        item: 'тач. 4.3',
        category: 'voda',
        text: 'Бунари за заливање парка захтевају водну дозволу за захватање подземних вода; годишња потрошња се пријављује надлежном органу.',
        confidence: 82,
      },
      {
        key: 'obalna-vegetacija',
        page: 7,
        item: 'тач. 5.1 (мишљење заштите природе)',
        category: 'zelenilo',
        text: 'Постојећа обална вегетација (врбак) задржава се на најмање 60 % дужине обале; нове врсте искључиво аутохтоне.',
        confidence: 79,
      },
    ],
  },

  'blok-42': {
    fileName: 'Lokacijski_uslovi_ROP-BGDU-08633-LOC-1_2025.pdf',
    sizeMb: 3.1,
    pages: 16,
    docAbbr: 'ЛУ',
    docGenitive: 'локацијских услова',
    planName: 'ПГР Новог Београда',
    statusLines: lines(16, 'ПГР Новог Београда', 'Препознајем услове ЈКП, ЕПС Дистрибуције и ватрогасне службе…'),
    conditions: [
      {
        key: 'parking',
        page: 3,
        item: 'тач. 2.7',
        category: 'saobracaj',
        text: 'Паркирање 1 ПМ на 60 m² пословног простора; 10 % места са пуњачима за електрична возила.',
        confidence: 96,
        matchesId: 'req-b42-05',
      },
      {
        key: 'pozar-visoki',
        page: 10,
        item: 'тач. 5.2 (услови у погледу заштите од пожара)',
        category: 'zastita-od-pozara',
        text: 'Висок објекат: сигурносна степеништа са надпритиском и противпожарни прекиди зида-завесе између етажа.',
        confidence: 91,
        matchesId: 'req-b42-04',
      },
      {
        key: 'visina',
        page: 3,
        item: 'тач. 2.3',
        category: 'urbanizam',
        text: 'Спратност највише П+12; висина венца највише 52 m од коте приступне саобраћајнице.',
        confidence: 95,
      },
      {
        key: 'zelenilo',
        page: 4,
        item: 'тач. 2.5',
        category: 'zelenilo',
        text: 'Најмање 30 % зелених површина на парцели, од чега најмање 20 % на природном тлу.',
        confidence: 94,
      },
      {
        key: 'toplana',
        page: 7,
        item: 'тач. 4.1 (услови ЈКП Београдске електране)',
        category: 'energija',
        text: 'Прикључење на даљинско грејање (ТО Нови Београд) преко топлотне подстанице у објекту.',
        confidence: 92,
      },
      {
        key: 'separator',
        page: 8,
        item: 'тач. 4.4 (услови ЈКП БВК)',
        category: 'voda',
        text: 'Сепарациони систем: атмосферске воде са паркинг површина пречистити (сепаратор уља и масти) пре упуштања у кишну канализацију.',
        confidence: 87,
      },
      {
        key: 'vetar',
        page: 12,
        item: 'тач. 6.2',
        category: 'urbanizam',
        text: 'Доставити анализу утицаја ветра на пешачке токове и улазе између кула (кошава) као прилог пројекту за грађевинску дозволу.',
        confidence: 80,
      },
    ],
  },

  'vrtic-bubamara': {
    fileName: 'Informacija_o_lokaciji_ROP-NIS-1927-IL_2026.pdf',
    sizeMb: 1.1,
    pages: 6,
    docAbbr: 'ИЛ',
    docGenitive: 'информације о локацији',
    planName: 'ПГР градске општине Црвени крст',
    statusLines: lines(6, 'ПГР градске општине Црвени крст', 'Препознајем услове јавних предузећа…'),
    conditions: [
      {
        key: 'parametri',
        page: 2,
        item: 'тач. 1.2',
        category: 'urbanizam',
        text: 'Индекс заузетости до 0,30, спратност до П+1, најмање 40 % зелених површина.',
        confidence: 96,
        matchesId: 'req-vb-02',
      },
      {
        key: 'drvored',
        page: 2,
        item: 'тач. 1.5',
        category: 'zelenilo',
        text: 'Постојећи дрворед липа дуж улице (14 стабала) се задржава; пројектовати заштиту стабала током градње.',
        confidence: 93,
        matchesId: 'req-vb-05',
      },
      {
        key: 'pristup',
        page: 3,
        item: 'тач. 2.1',
        category: 'saobracaj',
        text: 'Колски и пешачки улаз из стамбене улице; најмање 10 ПМ на парцели, уз простор за заустављање возила родитеља ван коловоза.',
        confidence: 89,
      },
      {
        key: 'igraliste',
        page: 3,
        item: 'тач. 2.4',
        category: 'ostalo',
        text: 'Простор за игру на отвореном најмање 10 m² по детету, оријентисан ка заветрини и заштићен од саобраћаја.',
        confidence: 86,
      },
      {
        key: 'eds',
        page: 4,
        item: 'тач. 3.1 (услови Електродистрибуције Србије)',
        category: 'energija',
        text: 'Прикључење на нисконапонску мрежу уз могућност прикључења PV система по моделу купца-произвођача.',
        confidence: 88,
      },
      {
        key: 'grejanje',
        page: 4,
        item: 'тач. 3.3',
        category: 'energija',
        text: 'Даљинско грејање није доступно на локацији — систем грејања предвидети на обновљиве изворе (топлотна пумпа).',
        confidence: 84,
      },
      {
        key: 'geomehanika',
        page: 5,
        item: 'тач. 4.2',
        category: 'konstrukcija',
        text: 'Геомеханичка истраживања терена обавезна пре израде пројекта за грађевинску дозволу; одредити ниво подземне воде.',
        confidence: 90,
      },
    ],
  },

  'stara-pivara': {
    fileName: 'Lokacijski_uslovi_ROP-NSA-7721-LOC-1_2026.pdf',
    sizeMb: 3.8,
    pages: 18,
    docAbbr: 'ЛУ',
    docGenitive: 'локацијских услова',
    planName: 'ПДР „Радна зона Север“',
    statusLines: lines(18, 'ПДР „Радна зона Север“', 'Препознајем услове Завода за заштиту споменика и ЈКП…'),
    conditions: [
      {
        key: 'zavod',
        page: 4,
        item: 'тач. 2–4 (услови Завода за заштиту споменика културе)',
        category: 'nasledje',
        text: 'Задржати опечне фасаде главне зграде и челичну решеткасту конструкцију хале; надоградња повучена најмање 3 m од венца.',
        confidence: 95,
        matchesId: 'req-sp-01',
      },
      {
        key: 'parking',
        page: 5,
        item: 'тач. 3.2',
        category: 'saobracaj',
        text: 'Паркирање на парцели: 1 ПМ по стану и 1 ПМ на 80 m² пословног простора.',
        confidence: 94,
        matchesId: 'req-sp-02',
      },
      {
        key: 'toplana',
        page: 6,
        item: 'тач. 5 (услови ЈКП „Новосадска топлана“)',
        category: 'energija',
        text: 'Прикључење на даљинско грејање преко топлотне подстанице у подруму главне зграде.',
        confidence: 92,
        matchesId: 'req-sp-06',
      },
      {
        key: 'voda-dunav',
        page: 8,
        item: 'тач. 6.1 (водни услови)',
        category: 'voda',
        text: 'Зона потенцијалног плављења (Q100): кота пода приземља најмање 78,20 мнв, подземне етаже водонепропусне са заштитом од узгона.',
        confidence: 90,
      },
      {
        key: 'visina',
        page: 9,
        item: 'тач. 2.3',
        category: 'urbanizam',
        text: 'Спратност највише П+4; висина венца највише 21 m, рачунато од коте приступне саобраћајнице.',
        confidence: 93,
      },
      {
        key: 'zelenilo',
        page: 10,
        item: 'тач. 2.6',
        category: 'zelenilo',
        text: 'Најмање 20 % зелених површина на парцели; озелењавање унутрашњег дворишта пиваре се прихвата у обрачун.',
        confidence: 86,
      },
      {
        key: 'bula',
        page: 12,
        item: 'тач. 7.1',
        category: 'ostalo',
        text: 'Радна зона: за становање у објекту обезбедити заштиту од буке из суседних производних погона (до 55 dB(A) дању, 45 dB(A) ноћу).',
        confidence: 82,
      },
    ],
  },
};
