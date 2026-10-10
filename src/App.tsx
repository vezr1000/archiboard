/**
 * Routes (CONCEPT §5). HashRouter keeps GitHub Pages happy.
 * Each page component lives in `src/features/<module>/`; replace placeholders in place — don't change paths.
 */
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { BoardPage } from '@/features/board/BoardPage';
import { GateReviewPage } from '@/features/board/GateReviewPage';
import { CertificationTab } from '@/features/certification/CertificationTab';
import { DecisionsTab } from '@/features/decisions/DecisionsTab';
import { UiShowcasePage } from '@/features/dev/UiShowcasePage';
import { DocumentsTab } from '@/features/documents/DocumentsTab';
import { FeedbackSummaryPage } from '@/features/feedback/FeedbackSummaryPage';
import { GuidelinesPage } from '@/features/guidelines/GuidelinesPage';
import { RegulationDetailPage } from '@/features/guidelines/RegulationDetailPage';
import { KpiTab } from '@/features/kpi/KpiTab';
import { MaterialsLibraryPage } from '@/features/materials/MaterialsLibraryPage';
import { ProjectMaterialsTab } from '@/features/materials/ProjectMaterialsTab';
import { NotFoundPage } from '@/features/not-found/NotFoundPage';
import { OptionsTab } from '@/features/options/OptionsTab';
import { PortfolioPage } from '@/features/portfolio/PortfolioPage';
import { OverviewTab } from '@/features/project/OverviewTab';
import { ProjectLayout } from '@/features/project/ProjectLayout';
import { ProjectsPage } from '@/features/projects/ProjectsPage';
import { RisksTab } from '@/features/risks/RisksTab';
import { SiteTab } from '@/features/site/SiteTab';
import { StakeholdersTab } from '@/features/stakeholders/StakeholdersTab';
import { ProjectTeamTab } from '@/features/team/ProjectTeamTab';
import { TeamPage } from '@/features/team/TeamPage';

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
