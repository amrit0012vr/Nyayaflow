import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { JudgeCauseList } from './components/JudgeCauseList';
import { ClerkIntake } from './components/ClerkIntake';
import { SchedulingView } from './components/SchedulingView';
import { CitizenPortal } from './components/CitizenPortal';
import { PoliceEvidenceVault } from './components/PoliceEvidenceVault';
import { AuditChainViewer } from './components/AuditChainViewer';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('cause-list');
  const [activeRole, setActiveRole] = useState<string>('judge');
  const [language, setLanguage] = useState<string>('en');

  // Handle role change mapping to default appropriate tab
  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    if (role === 'judge') setActiveTab('cause-list');
    else if (role === 'clerk') setActiveTab('clerk-intake');
    else if (role === 'lawyer') setActiveTab('cause-list');
    else if (role === 'police') setActiveTab('evidence');
    else if (role === 'citizen') setActiveTab('citizen');
    else if (role === 'auditor') setActiveTab('audit');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
        language={language}
        setLanguage={setLanguage}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cause-list' && <JudgeCauseList />}
        {activeTab === 'clerk-intake' && <ClerkIntake />}
        {activeTab === 'scheduling' && <SchedulingView />}
        {activeTab === 'citizen' && <CitizenPortal language={language} setLanguage={setLanguage} />}
        {activeTab === 'evidence' && <PoliceEvidenceVault />}
        {activeTab === 'audit' && <AuditChainViewer />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>NyayaFlow</strong> — Open-Source Judicial Decision Support Platform (Apache-2.0 License)
          </div>
          <div>
            Bharat Agentic-AI Hackathon 2026 • Code for a Billion • Track 07: Timely Justice
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

