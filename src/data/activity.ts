import type { ActivityItem } from '@/domain/types';

/** Recent activity across projects (relative to DEMO_TODAY = 2026-10-09). Timestamps are local time. */
export const activity: ActivityItem[] = [
  /* ================================ Савски кеј — блок Ц ================================ */
  { id: 'act-sk-01', projectId: 'savski-kej', date: '2026-10-09T09:10:00', actorId: 'p-jelena-markovic', kind: 'gate', text: 'Потврђена седница одбора Г2 ПГД — 23. октобар у 10:00, сала „Сава“.' },
  { id: 'act-sk-02', projectId: 'savski-kej', date: '2026-10-08T16:40:00', actorId: 'p-stefan-pavlovic', kind: 'document', text: 'Покренута симулација прегревања са спољном засеном (v0.4) — резултати до 15. октобра.' },
  { id: 'act-sk-03', projectId: 'savski-kej', date: '2026-10-07T11:15:00', actorId: 'p-tamara-nikolic', kind: 'document', text: 'BIM модел v2.6: провера колизија — 14 отворених (инсталације кроз CLT таванице).' },
  { id: 'act-sk-04', projectId: 'savski-kej', date: '2026-10-06T17:05:00', actorId: 'p-ana-jovanovic', kind: 'document', text: 'Пројекат архитектуре ПГД v2.3 предат техничкој контроли.' },
  { id: 'act-sk-05', projectId: 'savski-kej', date: '2026-10-05T09:30:00', actorId: 'p-nikola-petrovic', kind: 'kpi', text: 'Уграђени угљеник 358 kgCO₂e/m² — 12 % изнад циља; пројекат остаје у статусу „Ризик“.' },
  { id: 'act-sk-06', projectId: 'savski-kej', date: '2026-10-01T14:00:00', actorId: 'p-ana-jovanovic', kind: 'stakeholder', text: 'Састанак са инвеститором: представљене алтернативе фасаде, узорци фибер-цемента 16. октобра.' },
  { id: 'act-sk-07', projectId: 'savski-kej', date: '2026-10-01T08:00:00', actorId: 'p-nikola-petrovic', kind: 'gate', text: 'Истекао рок услова са Г1: LCA A1–C4 (одговоран Милош Савић).' },
  { id: 'act-sk-08', projectId: 'savski-kej', date: '2026-09-30T18:20:00', actorId: 'p-milos-savic', kind: 'decision', text: 'Предлог одлуке за Г2: фибер-цементне плоче уместо алуминијумских панела (−5,2 % угљеника).' },
  { id: 'act-sk-09', projectId: 'savski-kej', date: '2026-09-29T15:10:00', actorId: 'p-milos-savic', kind: 'document', text: 'Студија алтернатива фасадне облоге v1.0 послата на ревизију.' },
  { id: 'act-sk-10', projectId: 'savski-kej', date: '2026-09-29T10:00:00', actorId: 'p-stefan-pavlovic', kind: 'document', text: 'Елаборат ЕЕ v1.2: Qh,nd = 27 kWh/m²a, разред B.' },
  { id: 'act-sk-11', projectId: 'savski-kej', date: '2026-09-25T13:45:00', actorId: 'p-sanja-filipovic', kind: 'stakeholder', text: 'Допуна хидрауличког прорачуна подстанице послата Београдским електранама.' },
  { id: 'act-sk-12', projectId: 'savski-kej', date: '2026-09-22T12:30:00', actorId: 'p-milena-ristic', kind: 'risk', text: 'БЕ тражи допуну за сагласност на прикључење — ризик за рок Г2 подигнут на 4 × 3.' },
  { id: 'act-sk-13', projectId: 'savski-kej', date: '2026-09-15T18:00:00', actorId: 'p-jelena-markovic', kind: 'stakeholder', text: 'Састанак са станарима Савске 14–20: представљена студија осенчења.' },
  { id: 'act-sk-14', projectId: 'savski-kej', date: '2026-09-08T17:00:00', actorId: 'p-milos-savic', kind: 'option', text: 'Варијанта Б ажурирана са новом фасадом: 358 kgCO₂e/m².' },
  { id: 'act-sk-15', projectId: 'savski-kej', date: '2026-09-08T16:00:00', actorId: 'p-milos-savic', kind: 'kpi', text: 'LCA v2.0: уграђени угљеник порастао на 358 kgCO₂e/m² (+29 због фасаде).' },

  /* ================================ Блок 42 ================================ */
  { id: 'act-b42-01', projectId: 'blok-42', date: '2026-10-06T15:30:00', actorId: 'p-nemanja-stevanovic', kind: 'stakeholder', text: 'Инвеститор тражи процену трошка за повратак PV на 180 kWp.' },
  { id: 'act-b42-02', projectId: 'blok-42', date: '2026-10-02T11:00:00', actorId: 'p-nemanja-stevanovic', kind: 'comment', text: 'Извођач оспорава трошак повратка на специфицирану зид-завесу — тражимо писани одговор о EPD.' },
  { id: 'act-b42-03', projectId: 'blok-42', date: '2026-09-30T13:00:00', actorId: 'p-jelena-markovic', kind: 'gate', text: 'Ванредни преглед Г3: враћено на дораду, план опоравка до 31. октобра.' },
  { id: 'act-b42-04', projectId: 'blok-42', date: '2026-09-24T17:20:00', actorId: 'p-milos-savic', kind: 'kpi', text: 'LCA v3.0 са заменама извођача: 421 kgCO₂e/m², 11 % изнад циља.' },

  /* ================================ Стара пивара ================================ */
  { id: 'act-sp-01', projectId: 'stara-pivara', date: '2026-10-05T10:15:00', actorId: 'p-dragan-ilic', kind: 'stakeholder', text: 'Поднет захтев Градској управи за саобраћај — мишљење о закупу паркинга.' },
  { id: 'act-sp-02', projectId: 'stara-pivara', date: '2026-10-03T16:45:00', actorId: 'p-ivana-lazic', kind: 'document', text: 'ИДР v0.9: мезанин у хали и кровни светларници у постојећим решеткама.' },
  { id: 'act-sp-03', projectId: 'stara-pivara', date: '2026-10-02T12:00:00', actorId: 'p-ivana-lazic', kind: 'decision', text: 'Предлог одлуке: закуп 10 паркинг места у суседној јавној гаражи.' },
  { id: 'act-sp-04', projectId: 'stara-pivara', date: '2026-09-17T14:30:00', actorId: 'p-ivana-lazic', kind: 'risk', text: 'Преглед материјала пре рушења v1.1: удео поновне употребе пао на 48 %.' },

  /* ================================ ОШ „Ново насеље“ ================================ */
  { id: 'act-os-01', projectId: 'os-novo-naselje', date: '2026-10-08T10:20:00', actorId: 'p-luka-obradovic', kind: 'risk', text: 'Заказано узорковање подних облога на азбест за 20. октобар.' },
  { id: 'act-os-02', projectId: 'os-novo-naselje', date: '2026-10-01T09:45:00', actorId: 'p-katarina-mitic', kind: 'document', text: 'ПЗИ архитектуре v1.3 — фазе извођења по летњим распустима.' },
  { id: 'act-os-03', projectId: 'os-novo-naselje', date: '2026-09-17T13:00:00', actorId: 'p-katarina-mitic', kind: 'stakeholder', text: 'Састанак са управом школе и саветом родитеља о распореду радова.' },

  /* ================================ Парк на Нишави ================================ */
  { id: 'act-pn-01', projectId: 'park-nisava', date: '2026-10-02T15:00:00', actorId: 'p-jovana-radovic', kind: 'document', text: 'ИДР парка v0.9 — павиљон, стазе изнад Q100 и кишни вртови.' },
  { id: 'act-pn-02', projectId: 'park-nisava', date: '2026-09-28T11:30:00', actorId: 'p-jovana-radovic', kind: 'document', text: 'Хидраулички модел v0.3 калибрисан на водостаје из 2014. и 2021.' },
  { id: 'act-pn-03', projectId: 'park-nisava', date: '2026-09-16T10:00:00', actorId: 'p-jovana-radovic', kind: 'decision', text: 'Усвојени пропусни застори на стазама у поплавној зони.' },

  /* ================================ Вртић „Бубамара“ ================================ */
  { id: 'act-vb-01', projectId: 'vrtic-bubamara', date: '2026-10-07T14:10:00', actorId: 'p-marko-djordjevic', kind: 'document', text: 'Пројектни задатак v0.8 послат Граду Нишу пре Г0.' },
  { id: 'act-vb-02', projectId: 'vrtic-bubamara', date: '2026-10-05T12:40:00', actorId: 'p-sanja-filipovic', kind: 'kpi', text: 'Прелиминарни PHPP: Qh = 14 kWh/m²a, грејно оптерећење 10,4 W/m² — на граници.' },
  { id: 'act-vb-03', projectId: 'vrtic-bubamara', date: '2026-10-02T18:00:00', actorId: 'p-marko-djordjevic', kind: 'stakeholder', text: 'Анкета родитеља: 78 % подржава дрвени вртић.' },
];
