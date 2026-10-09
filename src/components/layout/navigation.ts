/**
 * Navigation + module registry. Single place that knows every route, its Serbian label and its feedback moduleId.
 * The feedback summary (step 12) uses MODULES to label answers.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  ClipboardCheck,
  FileStack,
  FolderKanban,
  GitCompareArrows,
  Handshake,
  LayoutDashboard,
  Layers,
  LayoutGrid,
  MapPinned,
  MessageSquareHeart,
  Recycle,
  Scale,
  ShieldAlert,
  Target,
  Users,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (for '/'). */
  end?: boolean;
}

/** Desktop sidebar — main section. */
export const NAV_MAIN: NavItem[] = [
  { to: '/', label: 'Портфолио', icon: LayoutDashboard, end: true },
  { to: '/projekti', label: 'Пројекти', icon: FolderKanban },
  { to: '/odbor', label: 'Одбор', icon: ClipboardCheck },
  { to: '/smernice', label: 'Смернице и прописи', icon: BookOpen },
  { to: '/materijali', label: 'EPD библиотека', icon: Layers },
  { to: '/tim', label: 'Тим фирме', icon: Users },
];

/** Desktop sidebar — demo/presenter section. */
export const NAV_DEMO: NavItem[] = [{ to: '/povratne-informacije', label: 'Повратне информације', icon: MessageSquareHeart }];

/** Mobile bottom tab bar (the 5th tab „Више“ opens the MoreSheet). */
export const NAV_BOTTOM: NavItem[] = [
  { to: '/', label: 'Портфолио', icon: LayoutDashboard, end: true },
  { to: '/projekti', label: 'Пројекти', icon: FolderKanban },
  { to: '/odbor', label: 'Одбор', icon: ClipboardCheck },
  { to: '/smernice', label: 'Смернице', icon: BookOpen },
];

/** Items inside the mobile „Више“ sheet. */
export const NAV_MORE: NavItem[] = [
  { to: '/materijali', label: 'Материјали (EPD библиотека)', icon: Layers },
  { to: '/tim', label: 'Тим фирме', icon: Users },
  { to: '/povratne-informacije', label: 'Повратне информације', icon: MessageSquareHeart },
];

export type ProjectTabSlug =
  | 'pregled'
  | 'lokacija'
  | 'ciljevi'
  | 'varijante'
  | 'sertifikacija'
  | 'materijali'
  | 'dokumenta'
  | 'odluke'
  | 'rizici'
  | 'akteri'
  | 'tim';

export interface ProjectTab {
  slug: ProjectTabSlug;
  /** Full label (page title). */
  label: string;
  /** Short label for the tab chip. */
  short: string;
  icon: LucideIcon;
  moduleId: string;
  /** Build-plan step that implements the tab. */
  step: number;
}

/** Project cockpit tabs in display order (CONCEPT §5). */
export const PROJECT_TABS: ProjectTab[] = [
  { slug: 'pregled', label: 'Преглед', short: 'Преглед', icon: LayoutGrid, moduleId: 'projekat-pregled', step: 3 },
  { slug: 'lokacija', label: 'Локација и услови', short: 'Локација', icon: MapPinned, moduleId: 'projekat-lokacija', step: 4 },
  { slug: 'ciljevi', label: 'Циљеви и KPI', short: 'Циљеви', icon: Target, moduleId: 'projekat-ciljevi', step: 5 },
  { slug: 'varijante', label: 'Варијанте', short: 'Варијанте', icon: GitCompareArrows, moduleId: 'projekat-varijante', step: 6 },
  { slug: 'sertifikacija', label: 'Сертификација', short: 'Сертификација', icon: Award, moduleId: 'projekat-sertifikacija', step: 5 },
  { slug: 'materijali', label: 'Материјали и циркуларност', short: 'Материјали', icon: Recycle, moduleId: 'projekat-materijali', step: 7 },
  { slug: 'dokumenta', label: 'Документација', short: 'Документа', icon: FileStack, moduleId: 'projekat-dokumenta', step: 8 },
  { slug: 'odluke', label: 'Одлуке', short: 'Одлуке', icon: Scale, moduleId: 'projekat-odluke', step: 8 },
  { slug: 'rizici', label: 'Ризици', short: 'Ризици', icon: ShieldAlert, moduleId: 'projekat-rizici', step: 8 },
  { slug: 'akteri', label: 'Заинтересоване стране', short: 'Актери', icon: Handshake, moduleId: 'projekat-akteri', step: 9 },
  { slug: 'tim', label: 'Тим', short: 'Тим', icon: Users, moduleId: 'projekat-tim', step: 9 },
];

export const getProjectTab = (slug: string | undefined): ProjectTab | undefined => PROJECT_TABS.find((t) => t.slug === slug);

/** Path helpers — use instead of string concatenation. */
export const paths = {
  portfolio: () => '/',
  projects: () => '/projekti',
  project: (id: string, tab: ProjectTabSlug = 'pregled') => `/projekti/${id}/${tab}`,
  board: () => '/odbor',
  session: (sessionId: string) => `/odbor/${sessionId}`,
  guidelines: () => '/smernice',
  materials: () => '/materijali',
  team: () => '/tim',
  feedback: () => '/povratne-informacije',
};

/** Every feedback moduleId with its Serbian label (used by the feedback summary page). */
export const MODULES: Array<{ id: string; label: string; group: 'Портфолио' | 'Пројекат' | 'Фирма' | 'Демо' }> = [
  { id: 'portfolio', label: 'Портфолио', group: 'Портфолио' },
  { id: 'projekti', label: 'Пројекти — листа', group: 'Портфолио' },
  ...PROJECT_TABS.map((t) => ({ id: t.moduleId, label: `Пројекат — ${t.label}`, group: 'Пројекат' as const })),
  { id: 'ai-lokacijski-uslovi', label: 'АИ издвајање услова из локацијских услова', group: 'Пројекат' },
  { id: 'odbor', label: 'Одбор — састанци', group: 'Фирма' },
  { id: 'odbor-revizija', label: 'Одбор — ревизија капије', group: 'Фирма' },
  { id: 'smernice', label: 'Смернице и прописи', group: 'Фирма' },
  { id: 'materijali', label: 'EPD библиотека', group: 'Фирма' },
  { id: 'tim', label: 'Тим фирме', group: 'Фирма' },
  { id: 'povratne-informacije', label: 'Повратне информације', group: 'Демо' },
];
