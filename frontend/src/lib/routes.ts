export interface AppRoute {
  path: string;
  permission?: string;
  roles?: string[];
  title: string;
  navLabel: string;
  showInNav: boolean;
}

// Single source of truth for frontend navigation and permission mapping (RBAC-02, Appendix C)
export const APP_ROUTES: AppRoute[] = [
  {
    path: '/cases',
    permission: 'case:list',
    roles: ['judge', 'clerk'],
    title: 'Urgency Cause List',
    navLabel: 'Cause List',
    showInNav: true
  },
  {
    path: '/cases/:id',
    permission: 'case:read',
    title: 'Case Dossier & Bench Brief',
    navLabel: 'Case Dossier',
    showInNav: false
  },
  {
    path: '/intake',
    permission: 'case:create',
    roles: ['clerk'],
    title: 'Registration & DPDP Ingestion',
    navLabel: 'Clerk Intake',
    showInNav: true
  },
  {
    path: '/schedule',
    permission: 'schedule:suggest',
    roles: ['judge', 'clerk'],
    title: 'Hearing Constraint Scheduler',
    navLabel: 'Scheduling',
    showInNav: true
  },
  {
    path: '/my-cases',
    permission: 'case:list',
    roles: ['lawyer', 'police'],
    title: 'My Assigned Matters',
    navLabel: 'My Cases',
    showInNav: true
  },
  {
    path: '/evidence',
    permission: 'evidence:read',
    roles: ['police'],
    title: 'Police Evidence Chain of Custody',
    navLabel: 'Evidence Vault',
    showInNav: true
  },
  {
    path: '/citizen',
    permission: 'legalaid:chat',
    roles: ['citizen'],
    title: 'Nyaya Sahayak Citizen Portal',
    navLabel: 'Citizen Home',
    showInNav: true
  },
  {
    path: '/citizen/chat',
    permission: 'legalaid:chat',
    roles: ['citizen'],
    title: 'Multilingual Legal Aid Assistant',
    navLabel: 'Legal Aid Chat',
    showInNav: true
  },
  {
    path: '/citizen/eligibility',
    permission: 'legalaid:eligibility',
    roles: ['citizen'],
    title: 'Section 12 Legal Aid Calculator',
    navLabel: 'Check Eligibility',
    showInNav: true
  },
  {
    path: '/citizen/status',
    permission: 'me:cases',
    roles: ['citizen'],
    title: 'My Case Status (Plain Language)',
    navLabel: 'My Case Status',
    showInNav: true
  },
  {
    path: '/audit',
    permission: 'audit:read',
    roles: ['auditor', 'admin'],
    title: 'Cryptographic Audit Trail',
    navLabel: 'Audit Ledger',
    showInNav: true
  },
  {
    path: '/evaluation',
    permission: 'evaluation:read',
    roles: ['judge', 'auditor', 'admin'],
    title: 'Evaluation & Impact Dashboard',
    navLabel: 'Evaluation & Impact',
    showInNav: true
  },
  {
    path: '/admin/users',
    permission: 'users:manage',
    roles: ['admin'],
    title: 'Court User Administration',
    navLabel: 'User Management',
    showInNav: true
  }
];

