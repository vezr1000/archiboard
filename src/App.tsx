/**
 * Routes (CONCEPT §5). HashRouter keeps GitHub Pages happy.
 * Each page component lives in `src/features/<module>/`; replace placeholders in place — don't change paths.
 */
import { lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { NotFoundPage } from '@/features/not-found/NotFoundPage';
import { PortfolioPage } from '@/features/portfolio/PortfolioPage';
import { ProjectLayout } from '@/features/project/ProjectLayout';

/* Route-level code splitting: only the shell, layout and portfolio ship in the entry chunk. */
const BoardPage = lazy(() => import('@/features/board/BoardPage').then((m) => ({ default: m.BoardPage })));
const GateReviewPage = lazy(() => import('@/features/board/GateReviewPage').then((m) => ({ default: m.GateReviewPage })));
const CertificationTab = lazy(() => import('@/features/certification/CertificationTab').then((m) => ({ default: m.CertificationTab })));
const DecisionsTab = lazy(() => import('@/features/decisions/DecisionsTab').then((m) => ({ default: m.DecisionsTab })));
const UiShowcasePage = lazy(() => import('@/features/dev/UiShowcasePage').then((m) => ({ default: m.UiShowcasePage })));
const DocumentsTab = lazy(() => import('@/features/documents/DocumentsTab').then((m) => ({ default: m.DocumentsTab })));
const FeedbackSummaryPage = lazy(() => import('@/features/feedback/FeedbackSummaryPage').then((m) => ({ default: m.FeedbackSummaryPage })));
const GuidelinesPage = lazy(() => import('@/features/guidelines/GuidelinesPage').then((m) => ({ default: m.GuidelinesPage })));
const RegulationDetailPage = lazy(() => import('@/features/guidelines/RegulationDetailPage').then((m) => ({ default: m.RegulationDetailPage })));
const KpiTab = lazy(() => import('@/features/kpi/KpiTab').then((m) => ({ default: m.KpiTab })));
const MaterialsLibraryPage = lazy(() => import('@/features/materials/MaterialsLibraryPage').then((m) => ({ default: m.MaterialsLibraryPage })));
const ProjectMaterialsTab = lazy(() => import('@/features/materials/ProjectMaterialsTab').then((m) => ({ default: m.ProjectMaterialsTab })));
const OptionsTab = lazy(() => import('@/features/options/OptionsTab').then((m) => ({ default: m.OptionsTab })));
const OverviewTab = lazy(() => import('@/features/project/OverviewTab').then((m) => ({ default: m.OverviewTab })));
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const RisksTab = lazy(() => import('@/features/risks/RisksTab').then((m) => ({ default: m.RisksTab })));
const SiteTab = lazy(() => import('@/features/site/SiteTab').then((m) => ({ default: m.SiteTab })));
const StakeholdersTab = lazy(() => import('@/features/stakeholders/StakeholdersTab').then((m) => ({ default: m.StakeholdersTab })));
const ProjectTeamTab = lazy(() => import('@/features/team/ProjectTeamTab').then((m) => ({ default: m.ProjectTeamTab })));
const TeamPage = lazy(() => import('@/features/team/TeamPage').then((m) => ({ default: m.TeamPage })));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<PortfolioPage />} />
          <Route path="projekti" element={<ProjectsPage />} />
          <Route path="projekti/:id" element={<ProjectLayout />}>
            <Route index element={<Navigate to="pregled" replace />} />
            <Route path="pregled" element={<OverviewTab />} />
            <Route path="lokacija" element={<SiteTab />} />
            <Route path="ciljevi" element={<KpiTab />} />
            <Route path="varijante" element={<OptionsTab />} />
            <Route path="sertifikacija" element={<CertificationTab />} />
            <Route path="materijali" element={<ProjectMaterialsTab />} />
            <Route path="dokumenta" element={<DocumentsTab />} />
            <Route path="odluke" element={<DecisionsTab />} />
            <Route path="rizici" element={<RisksTab />} />
            <Route path="akteri" element={<StakeholdersTab />} />
            <Route path="tim" element={<ProjectTeamTab />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="odbor" element={<BoardPage />} />
          <Route path="odbor/:sessionId" element={<GateReviewPage />} />
          <Route path="smernice" element={<GuidelinesPage />} />
          <Route path="smernice/:id" element={<RegulationDetailPage />} />
          <Route path="materijali" element={<MaterialsLibraryPage />} />
          <Route path="tim" element={<TeamPage />} />
          <Route path="povratne-informacije" element={<FeedbackSummaryPage />} />
          {/* Hidden component showcase for developers / later build steps. Not linked from navigation. */}
          <Route path="_ui" element={<UiShowcasePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
