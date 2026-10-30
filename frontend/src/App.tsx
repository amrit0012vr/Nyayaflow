import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RequireAuth } from './components/RequireAuth';
import { RequirePermission } from './components/RequirePermission';
import { getRoleHomeRoute } from './lib/permissions';

// Public Pages
import { LoginPage } from './pages/LoginPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium tracking-wide">Validating judicial credentials...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRoleHomeRoute(user.role)} replace />;
};

export function App() {
  const [language, setLanguage] = useState<string>('en');

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar language={language} setLanguage={setLanguage} />

          <main className="flex-1 w-full">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
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
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          </main>

          <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <strong>NyayaFlow</strong> — Open-Source Judicial Decision Support Platform (Apache-2.0 License)
              </div>
              <div>
                Judicial Decision Support System • Timely Justice
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
