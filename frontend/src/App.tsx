import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { RequirePermission } from './components/RequirePermission';
import { getRoleHomeRoute } from './lib/permissions';
import { useLanguage } from './hooks/useLanguage';

// Public & Static Pages
import { LoginPage } from './pages/LoginPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AboutPage } from './pages/static/AboutPage';
import { HowItWorksPage } from './pages/static/HowItWorksPage';
import { LegalAidInfoPage } from './pages/static/LegalAidInfoPage';
import { HelpPage } from './pages/static/HelpPage';
import { ContactPage } from './pages/static/ContactPage';
import { AccessibilityPage } from './pages/static/AccessibilityPage';
import { TermsPage } from './pages/static/TermsPage';
import { PrivacyPage } from './pages/static/PrivacyPage';
import { DisclaimerPage } from './pages/static/DisclaimerPage';
import { SitemapPage } from './pages/static/SitemapPage';

// Judicial & Clerk Components / Pages
import { JudgeCauseList } from './components/JudgeCauseList';
import { ClerkIntake } from './components/ClerkIntake';
import { SchedulingView } from './components/SchedulingView';
import { CaseDossierPage } from './pages/CaseDossierPage';

// Legal & Law Enforcement Pages
import { MyCasesPage } from './pages/MyCasesPage';
import { PoliceEvidenceVault } from './components/PoliceEvidenceVault';

// Citizen Portal Pages
import { CitizenHome } from './pages/citizen/CitizenHome';
import { LegalAidChat } from './pages/citizen/LegalAidChat';
import { EligibilityWizard } from './pages/citizen/EligibilityWizard';
import { MyCaseStatus } from './pages/citizen/MyCaseStatus';

// Auditor & Admin Pages
import { AuditChainViewer } from './components/AuditChainViewer';
import { EvaluationPage } from './pages/EvaluationPage';
import { UserManagement } from './pages/admin/UserManagement';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-[#1A1A1A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#0B2A5B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#4A4F57] font-semibold tracking-wide">Validating session credentials...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRoleHomeRoute(user.role)} replace />;
};

function AppRoutes() {
  const { language, setLanguage } = useLanguage();

  return (
    <AppShell language={language} setLanguage={setLanguage}>
      <Routes>
        {/* Public & Static Routes */}
        <Route path="/login" element={<LoginPage language={language} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/legal-aid-info" element={<LegalAidInfoPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Root Landing Route */}
        <Route path="/" element={<RootRedirect />} />

        {/* Bench & Clerk Routes */}
        <Route
          path="/cases"
          element={
            <RequireAuth>
              <RequirePermission roles={['judge', 'clerk']} permission="case:list">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
                  <JudgeCauseList />
                </div>
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <RequireAuth>
              <RequirePermission permission="case:read">
                <CaseDossierPage />
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/intake"
          element={
            <RequireAuth>
              <RequirePermission roles={['clerk']} permission="case:create">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
                  <ClerkIntake />
                </div>
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/schedule"
          element={
            <RequireAuth>
              <RequirePermission roles={['judge', 'clerk']} permission="schedule:suggest">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
                  <SchedulingView />
                </div>
              </RequirePermission>
            </RequireAuth>
          }
        />

        {/* Advocate & Police Routes */}
        <Route
          path="/my-cases"
          element={
            <RequireAuth>
              <RequirePermission roles={['lawyer', 'police']} permission="case:list">
                <MyCasesPage />
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/evidence"
          element={
            <RequireAuth>
              <RequirePermission roles={['police']} permission="evidence:read">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
                  <PoliceEvidenceVault />
                </div>
              </RequirePermission>
            </RequireAuth>
          }
        />

        {/* Citizen Isolated Portal Routes */}
        <Route
          path="/citizen"
          element={
            <RequireAuth>
              <RequirePermission roles={['citizen']} permission="legalaid:chat">
                <CitizenHome />
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/citizen/chat"
          element={
            <RequireAuth>
              <RequirePermission roles={['citizen']} permission="legalaid:chat">
                <LegalAidChat language={language} />
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/citizen/eligibility"
          element={
            <RequireAuth>
              <RequirePermission roles={['citizen']} permission="legalaid:eligibility">
                <EligibilityWizard />
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/citizen/status"
          element={
            <RequireAuth>
              <RequirePermission roles={['citizen']} permission="me:cases">
                <MyCaseStatus />
              </RequirePermission>
            </RequireAuth>
          }
        />

        {/* Auditor & Admin Routes */}
        <Route
          path="/audit"
          element={
            <RequireAuth>
              <RequirePermission roles={['auditor', 'admin']} permission="audit:read">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
                  <AuditChainViewer />
                </div>
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/evaluation"
          element={
            <RequireAuth>
              <RequirePermission roles={['judge', 'auditor', 'admin']} permission="evaluation:read">
                <EvaluationPage />
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth>
              <RequirePermission roles={['admin']} permission="users:manage">
                <UserManagement />
              </RequirePermission>
            </RequireAuth>
          }
        />

        {/* Catch-all Not Found */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
