import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const ROUTE_NAME_MAP: Record<string, string> = {
  login: 'User Login',
  about: 'About NyayaFlow',
  'how-it-works': 'How It Works',
  'legal-aid-info': 'Legal Aid Information',
  help: 'Help & FAQs',
  contact: 'Contact',
  accessibility: 'Accessibility Statement',
  terms: 'Terms of Use',
  privacy: 'Privacy Policy',
  disclaimer: 'Disclaimer',
  sitemap: 'Sitemap',
  cases: 'Cause List',
  intake: 'Case Registration & Scrutiny',
  schedule: 'Hearing Constraint Scheduler',
  'my-cases': 'Assigned Cases',
  evidence: 'Police Evidence Vault',
  citizen: 'Citizen Portal',
  chat: 'Legal Aid Assistant',
  eligibility: 'Section 12 Eligibility Calculator',
  status: 'My Case Status',
  audit: 'Tamper-Evident Audit Ledger',
  evaluation: 'Benchmark & Evaluation',
  admin: 'Administration',
  users: 'User Management',
  forbidden: 'Access Denied (403)',
  '404': 'Page Not Found (404)'
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();

  let breadcrumbs: BreadcrumbItem[] = items || [];

  if (!items) {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    breadcrumbs = [{ label: 'Home', to: '/' }];

    let accumulatedPath = '';
    pathSegments.forEach((segment, idx) => {
      accumulatedPath += `/${segment}`;
      const isLast = idx === pathSegments.length - 1;
      const label = ROUTE_NAME_MAP[segment] || segment;
      breadcrumbs.push({
        label,
        to: isLast ? undefined : accumulatedPath
      });
    });
  }

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="bg-[#F4F6FA] border-b border-[#C5CCD6] py-1.5 px-4 text-xs">
      <div className="max-w-[1200px] mx-auto">
        <ol className="flex items-center flex-wrap gap-1.5 text-[#4A4F57] m-0 p-0 list-none">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#C5CCD6]" aria-hidden="true" />}
                {isLast || !item.to ? (
                  <span className="font-bold text-[#1A1A1A]" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.to} className="text-[#0B5FA5] hover:underline">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
