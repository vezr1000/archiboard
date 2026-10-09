import type { AttentionItem } from '@/domain/types';

/**
 * „Захтева пажњу“ — scripted alerts for the portfolio and project overview, ordered by severity, then date.
 * Each item mirrors data elsewhere (KPIs, documents, conditions, certification, risks).
 */
export const attentionItems: AttentionItem[] = [
  {
    id: 'att-sk-carbon',
    projectId: 'savski-kej',
    severity: 'critical',
    title: 'Савски кеј: уграђени угљеник 12 % изнад циља након промене фасаде',
    detail:
      '358 према 320 kgCO₂e/m². Замена облоге од ариша алуминијумским панелима додала је +29 kgCO₂e/m²; ' +
      'предлог фибер-цементних плоча иде на Г2.',
    tab: 'ciljevi',
    date: '2026-09-08',
  },
  {
    id: 'att-b42-breeam',
    projectId: 'blok-42',
    severity: 'critical',
    title: 'Блок 42: BREEAM 66,7 % — испод прага Excellent (70 %)',
    detail: 'Замене материјала извођача без сагласности одбора; план опоравка до 31. октобра.',
    tab: 'sertifikacija',
    date: '2026-09-30',
  },
  {
    id: 'att-sk-docs',
    projectId: 'savski-kej',
    severity: 'warning',
    title: 'Савски кеј: за Г2 недостају 2 од 12 докумената',
    detail: 'Сагласност Београдских електрана (захтев у поступку) и симулација летњег прегревања (нацрт).',
    tab: 'dokumenta',
    date: '2026-10-05',
  },
  {
    id: 'att-sk-condition',
    projectId: 'savski-kej',
    severity: 'warning',
    title: 'Савски кеј: истекао рок услова са Г1 — LCA A1–C4',
    detail: 'Рок је био 30. септембар; LCA v2.0 обухвата само A1–A3 и B4.',
    tab: 'odluke',
    date: '2026-10-01',
  },
  {
    id: 'att-sp-reuse',
    projectId: 'stara-pivara',
    severity: 'warning',
    title: 'Стара пивара: удео поновне употребе пао са 62 % на 48 %',
    detail: 'Корозија на 30 % решеткастих носача хале — замена новим челиком.',
    tab: 'materijali',
    date: '2026-09-17',
  },
  {
    id: 'att-sp-parking',
    projectId: 'stara-pivara',
    severity: 'warning',
    title: 'Стара пивара: паркинг норма није испуњена (64 од 70 ПМ)',
    detail: 'Без решења локацијски услови неће бити издати; предлог закупа у јавној гаражи.',
    tab: 'lokacija',
    date: '2026-10-02',
  },
  {
    id: 'att-team-load',
    projectId: 'savski-kej',
    severity: 'warning',
    title: 'Преоптерећење: Милош Савић 120 %, Тамара Николић 115 %',
    detail: 'Обоје су кључни за Г2 на Савском кеју (LCA и BIM модел).',
    tab: 'tim',
    date: '2026-10-06',
  },
  {
    id: 'att-vb-g0',
    projectId: 'vrtic-bubamara',
    severity: 'info',
    title: 'Вртић „Бубамара“: Г0 за 5 дана — потврда Passivhaus циља',
    detail: 'Пројектни задатак v0.8 и прелиминарни PHPP послати Граду Нишу.',
    tab: 'pregled',
    date: '2026-10-09',
  },
];
