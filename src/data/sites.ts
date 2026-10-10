import type { CompassDir, SiteInfo, WindRoseEntry } from '@/domain/types';

/**
 * Site, climate, hazards and urban parameters for every project.
 * Climate values are rounded, plausible values for the city (HDD base 20/12 °C, global horizontal irradiation),
 * not measured data. Urban parameters come from fictional plan provisions (ПДР / ПГР) and локацијски услови.
 */

const DIRS: CompassDir[] = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

/** Build a 16-direction wind rose from parallel arrays (freq in % of hours, max gust in m/s). */
const rose = (freq: number[], maxSpeed: number[]): WindRoseEntry[] =>
  DIRS.map((dir, i) => ({ dir, freq: freq[i], maxSpeed: maxSpeed[i] }));

/* Београд — кошава (ИЈИ/ЈИ) dominant in the cold season, W–NW in summer. Calms ≈ 20 %. */
const ROSE_BEOGRAD = rose(
  [4, 2.5, 2.5, 3, 5.5, 10.5, 11, 4, 3, 2, 2.5, 3.5, 7.5, 6.5, 8, 4],
  [16, 13, 13, 15, 20, 27, 30, 18, 14, 12, 13, 15, 21, 19, 22, 16],
);
/* Нови Сад — NW dominant, кошава weaker than in Belgrade. Calms ≈ 22 %. */
const ROSE_NOVI_SAD = rose(
  [6, 3, 3, 3, 4, 6.5, 8.5, 4, 4, 2.5, 3, 3.5, 6, 6.5, 9, 5.5],
  [17, 13, 12, 13, 16, 22, 24, 15, 14, 12, 13, 15, 19, 20, 23, 18],
);
/* Ниш — NW along the Morava valley and E from the Nišava gorge. Calms ≈ 23 %. */
const ROSE_NIS = rose(
  [6, 3, 3, 4.5, 8, 5, 3.5, 3, 4, 3, 2.5, 3, 5.5, 6.5, 9.5, 6],
  [16, 12, 12, 16, 21, 17, 14, 13, 14, 12, 11, 13, 17, 19, 22, 17],
);

const AIR_BEOGRAD =
  'Зими повишене концентрације PM10 и PM2,5 током грејне сезоне (инверзије); лети приземни озон. ' +
  'Саобраћај на Савској магистрали је главни локални извор NO₂.';
const AIR_NOVI_SAD =
  'Квалитет ваздуха претежно добар; у грејној сезони повремена прекорачења PM10, у пролеће и јесен прашина ' +
  'са пољопривредних површина.';
const AIR_NIS =
  'Ниш је међу градовима са највишим зимским концентрацијама PM2,5 у Србији (индивидуална ложишта, ' +
  'котлинска инверзија). Унутрашњи ваздух захтева филтрацију најмање ePM1 50 %.';

export const sites: SiteInfo[] = [
  /* ================================ Савски кеј — блок Ц ================================ */
  {
    projectId: 'savski-kej',
    climate: {
      hdd: 2520,
      cdd: 320,
      solarKWhM2a: 1450,
      designTempWinter: -12.1,
      designTempSummer: 35,
      windRose: ROSE_BEOGRAD,
      prevailingWindNote:
        'Кошава (ИЈИ–ЈИ) од октобра до априла, удари до 30 m/s; терасе 8. спрата и повученог спрата изложене.',
      uhiIntensity: 2.5,
      airQualityNote: AIR_BEOGRAD,
    },
    hazards: {
      floodZone: 'Зона Q100 Саве — заштићено кејским зидом; кота приземља 76,50 мнв (изнад Q1000)',
      floodRisk: 'medium',
      seismic: { agG: 0.1, mcs: 8 },
      soil: 'Насип 2–3 m преко алувијалних песковито-шљунковитих наноса Саве; категорија тла C по SRPS EN 1998-1',
      groundwaterDepthM: 3.5,
    },
    urbanParams: [
      { id: 'iz', label: 'Индекс заузетости', limit: 0.5, design: 0.49, unit: '', comparator: 'max' },
      { id: 'ii', label: 'Индекс изграђености', limit: 4.0, design: 3.79, unit: '', comparator: 'max' },
      {
        id: 'spratnost',
        label: 'Спратност',
        limit: 10,
        design: 10,
        unit: '',
        comparator: 'max',
        displayLimit: 'П+8+Пс',
        displayDesign: 'П+8+Пс',
      },
      { id: 'visina', label: 'Висина венца', limit: 32, design: 30.4, unit: 'm', comparator: 'max' },
      { id: 'zelenilo', label: 'Зелене површине на парцели', limit: 30, design: 32, unit: '%', comparator: 'min' },
      { id: 'zelenilo-tlo', label: 'Зеленило на природном тлу', limit: 15, design: 15.8, unit: '%', comparator: 'min' },
      {
        id: 'parking',
        label: 'Паркинг места (1,1 ПМ/стан + 1 ПМ/70 m² пословања)',
        limit: 210,
        design: 212,
        unit: 'ПМ',
        comparator: 'min',
      },
    ],
    utilities: [
      'Даљинско грејање — ЈКП „Београдске електране“ (топловод у Савској улици)',
      'Електромрежа — Електродистрибуција Србије, нова ТС 10/0,4 kV у објекту',
      'Водовод и канализација — ЈКП „Београдски водовод и канализација“ (општи систем)',
      'Јавни превоз: трамвај и аутобус на 250 m; бициклистичка стаза дуж кеја',
    ],
    contextNote:
      'Угаона парцела између Савске улице и кеја, у контактној зони просторне културно-историјске целине. ' +
      'Кроз блок се пробија јавни пешачки пролаз ка реци. Подземна вода осцилира са водостајем Саве, па су ' +
      'подземне етаже пројектоване као „бела када“.',
  },

  /* ================================ ОШ „Ново насеље“ ================================ */
  {
    projectId: 'os-novo-naselje',
    climate: {
      hdd: 2780,
      cdd: 270,
      solarKWhM2a: 1390,
      designTempWinter: -13.9,
      designTempSummer: 34,
      windRose: ROSE_NOVI_SAD,
      prevailingWindNote: 'Северозападни ветар преовлађује; кошава слабија него у Београду, до 24 m/s.',
      uhiIntensity: 2.0,
      airQualityNote: AIR_NOVI_SAD,
    },
    hazards: {
      floodZone: 'Ван зоне плављења — одбрамбени насип Дунава',
      floodRisk: 'low',
      seismic: { agG: 0.08, mcs: 7 },
      soil: 'Лес и лесоидне наслаге преко алувијалних песака; постојећи темељи без знакова слегања',
      groundwaterDepthM: 4.5,
    },
    urbanParams: [
      { id: 'iz', label: 'Индекс заузетости', limit: 0.4, design: 0.31, unit: '', comparator: 'max' },
      { id: 'ii', label: 'Индекс изграђености', limit: 1.2, design: 0.34, unit: '', comparator: 'max' },
      {
        id: 'spratnost',
        label: 'Спратност',
        limit: 4,
        design: 3,
        unit: '',
        comparator: 'max',
        displayLimit: 'П+3',
        displayDesign: 'П+2 (постојеће)',
      },
      { id: 'zelenilo', label: 'Зелене површине на парцели', limit: 40, design: 46, unit: '%', comparator: 'min' },
      { id: 'parking', label: 'Паркинг места (1 ПМ по учионици)', limit: 24, design: 26, unit: 'ПМ', comparator: 'min' },
    ],
    utilities: [
      'Гасна котларница (постојећа) — укида се, прелазак на топлотне пумпе',
      'Електромрежа — Електродистрибуција Србије, повећање прикључне снаге и купац-произвођач',
      'Водовод и канализација — ЈКП „Водовод и канализација“ Нови Сад',
    ],
    contextNote:
      'Слободностојећа школа из 1978. у отвореном блоку Новог насеља, са фискултурном салом и спортским теренима. ' +
      'Радови се изводе у две летње сезоне, без прекида наставе.',
  },

  /* ================================ Парк на Нишави ================================ */
  {
    projectId: 'park-nisava',
    climate: {
      hdd: 2700,
      cdd: 300,
      solarKWhM2a: 1480,
      designTempWinter: -15.0,
      designTempSummer: 35.5,
      windRose: ROSE_NIS,
      prevailingWindNote: 'Северозападни ветар низ Мораву и источни из Нишавске клисуре; лети честе тишине.',
      uhiIntensity: 1.5,
      airQualityNote: AIR_NIS,
    },
    hazards: {
      floodZone: 'Зона Q100 Нишаве — поплавне ливаде пројектоване да се плаве при Q20; стазе и павиљон изнад Q100',
      floodRisk: 'high',
      seismic: { agG: 0.17, mcs: 8 },
      soil: 'Алувијални шљунак и песак Нишаве, добро водопропусни',
      groundwaterDepthM: 1.8,
    },
    urbanParams: [
      { id: 'zelenilo', label: 'Зелене површине', limit: 70, design: 78, unit: '%', comparator: 'min' },
      { id: 'propusne', label: 'Водопропусне површине', limit: 85, design: 91, unit: '%', comparator: 'min' },
      { id: 'iz', label: 'Индекс заузетости (павиљони)', limit: 0.02, design: 0.008, unit: '', comparator: 'max' },
      { id: 'krosnje', label: 'Засена крошњама за 15 година', limit: 40, design: 46, unit: '%', comparator: 'min' },
    ],
    utilities: [
      'Електромрежа — Електродистрибуција Србије (павиљон, расвета)',
      'Водовод — ЈКП „Наисус“ (чесме, тоалети); заливање из бунара и ретензија',
      'Атмосферска канализација околних улица усмерава се у биоретенције парка',
    ],
    contextNote:
      'Линеарни појас од 1,4 km на десној обали Нишаве, између Тврђаве и Чамурлије. Сећање на поплаве из 2014. ' +
      'обликовало је концепт: парк прихвата воду уместо да је одбија.',
  },

  /* ================================ Блок 42 ================================ */
  {
    projectId: 'blok-42',
    climate: {
      hdd: 2520,
      cdd: 340,
      solarKWhM2a: 1450,
      designTempWinter: -12.1,
      designTempSummer: 35,
      windRose: ROSE_BEOGRAD,
      prevailingWindNote: 'Кошава (ИЈИ–ЈИ) удара на отворене просторе Новог Београда; ветровити пролази између кула.',
      uhiIntensity: 3.5,
      airQualityNote: AIR_BEOGRAD,
    },
    hazards: {
      floodZone: 'Ван зоне плављења — заштићено насипима Саве и Дунава',
      floodRisk: 'low',
      seismic: { agG: 0.1, mcs: 8 },
      soil: 'Хидраулички насути песак (1950-их) преко алувијалних глина и песка',
      groundwaterDepthM: 2.8,
    },
    urbanParams: [
      { id: 'iz', label: 'Индекс заузетости', limit: 0.4, design: 0.38, unit: '', comparator: 'max' },
      { id: 'ii', label: 'Индекс изграђености', limit: 3.0, design: 2.89, unit: '', comparator: 'max' },
      {
        id: 'spratnost',
        label: 'Спратност',
        limit: 13,
        design: 13,
        unit: '',
        comparator: 'max',
        displayLimit: 'П+12',
        displayDesign: 'П+12',
      },
      { id: 'visina', label: 'Висина венца', limit: 52, design: 49.6, unit: 'm', comparator: 'max' },
      { id: 'zelenilo', label: 'Зелене површине на парцели', limit: 30, design: 31, unit: '%', comparator: 'min' },
      { id: 'zelenilo-tlo', label: 'Зеленило на природном тлу', limit: 20, design: 20.5, unit: '%', comparator: 'min' },
      { id: 'parking', label: 'Паркинг места (1 ПМ/60 m² пословања)', limit: 400, design: 412, unit: 'ПМ', comparator: 'min' },
    ],
    utilities: [
      'Даљинско грејање — ЈКП „Београдске електране“ (ТО Нови Београд)',
      'Електромрежа — Електродистрибуција Србије, ТС 2 × 1000 kVA',
      'Водовод и канализација — ЈКП „Београдски водовод и канализација“ (сепарациони систем)',
      'Јавни превоз: трамвај и аутобус на 150 m',
    ],
    contextNote:
      'Последња неизграђена парцела у блоку, окружена пословним зградама из 2000-их. Градилиште отворено у марту 2026; ' +
      'АБ конструкција изведена до 6. спрата.',
  },

  /* ================================ Вртић „Бубамара“ ================================ */
  {
    projectId: 'vrtic-bubamara',
    climate: {
      hdd: 2700,
      cdd: 300,
      solarKWhM2a: 1480,
      designTempWinter: -15.0,
      designTempSummer: 35.5,
      windRose: ROSE_NIS,
      prevailingWindNote: 'Северозападни ветар зими; двориште за игру оријентисано ка југоистоку, у заветрини.',
      uhiIntensity: 2.0,
      airQualityNote: AIR_NIS,
    },
    hazards: {
      floodZone: 'Ван зоне плављења',
      floodRisk: 'low',
      seismic: { agG: 0.17, mcs: 8 },
      soil: 'Делувијалне прашинасте глине; геомеханички истражни радови планирани у ИДР',
      groundwaterDepthM: 6,
    },
    urbanParams: [
      { id: 'iz', label: 'Индекс заузетости', limit: 0.3, design: 0.22, unit: '', comparator: 'max' },
      { id: 'ii', label: 'Индекс изграђености', limit: 0.6, design: 0.29, unit: '', comparator: 'max' },
      {
        id: 'spratnost',
        label: 'Спратност',
        limit: 2,
        design: 2,
        unit: '',
        comparator: 'max',
        displayLimit: 'П+1',
        displayDesign: 'П+1',
      },
      { id: 'zelenilo', label: 'Зелене површине на парцели', limit: 40, design: 58, unit: '%', comparator: 'min' },
      { id: 'igraliste', label: 'Простор за игру на отвореном', limit: 10, design: 14, unit: 'm²/дете', comparator: 'min' },
      { id: 'parking', label: 'Паркинг места', limit: 10, design: 12, unit: 'ПМ', comparator: 'min' },
    ],
    utilities: [
      'Електромрежа — Електродистрибуција Србије (купац-произвођач)',
      'Водовод и канализација — ЈКП „Наисус“',
      'Даљинско грејање није доступно на локацији',
    ],
    contextNote: 'Парцела на ободу стамбеног насеља, уз дрворед липа који се задржава. Улаз из мирне стамбене улице.',
  },

  /* ================================ Стара пивара ================================ */
  {
    projectId: 'stara-pivara',
    climate: {
      hdd: 2780,
      cdd: 270,
      solarKWhM2a: 1390,
      designTempWinter: -13.9,
      designTempSummer: 34,
      windRose: ROSE_NOVI_SAD,
      prevailingWindNote: 'Северозападни ветар преовлађује; унутрашње двориште пиваре у заветрини.',
      uhiIntensity: 2.5,
      airQualityNote: AIR_NOVI_SAD,
    },
    hazards: {
      floodZone: 'Иза одбрамбеног насипа Дунава, у зони потенцијалног плављења (Q100); кота пода хале 78,20 мнв',
      floodRisk: 'medium',
      seismic: { agG: 0.08, mcs: 7 },
      soil: 'Лес и алувијални песак; ниво подземне воде прати водостај Дунава',
      groundwaterDepthM: 2.6,
    },
    urbanParams: [
      { id: 'iz', label: 'Индекс заузетости', limit: 0.6, design: 0.52, unit: '', comparator: 'max' },
      { id: 'ii', label: 'Индекс изграђености', limit: 2.0, design: 1.63, unit: '', comparator: 'max' },
      {
        id: 'spratnost',
        label: 'Спратност',
        limit: 5,
        design: 5,
        unit: '',
        comparator: 'max',
        displayLimit: 'П+4',
        displayDesign: 'П+3 + надоградња П+4',
      },
      { id: 'visina', label: 'Висина венца', limit: 21, design: 19.8, unit: 'm', comparator: 'max' },
      { id: 'zelenilo', label: 'Зелене површине на парцели', limit: 20, design: 21, unit: '%', comparator: 'min' },
      {
        id: 'parking',
        label: 'Паркинг места (1 ПМ/стан + 1 ПМ/80 m² пословања)',
        limit: 70,
        design: 64,
        unit: 'ПМ',
        comparator: 'min',
      },
    ],
    utilities: [
      'Даљинско грејање — ЈКП „Новосадска топлана“ (топловод на 300 m)',
      'Електромрежа — Електродистрибуција Србије',
      'Водовод и канализација — ЈКП „Водовод и канализација“ Нови Сад',
    ],
    contextNote:
      'Комплекс пиваре из 1920-их са опечним фасадама и челичним решеткама хале, под претходном заштитом Завода ' +
      'за заштиту споменика културе Града Новог Сада. Паркинг норма се не може испунити на парцели без рушења анекса.',
  },
];
