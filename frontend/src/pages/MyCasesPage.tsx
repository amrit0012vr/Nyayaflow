import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Case } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Calendar,
  Clock,
  ArrowRight,
  Scale
} from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { StatusChip, ChipVariant } from '../components/ui/StatusChip';
import { InlineBanner } from '../components/ui/InlineBanner';

export const MyCasesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssignedCases() {
      try {
        const data = await api.getCases();
        setCases(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load assigned matters');
      } finally {
        setLoading(false);
      }
    }
    loadAssignedCases();
  }, []);

  const mapTierToVariant = (tier?: string): ChipVariant => {
    switch (tier?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'normal':
        return 'normal';
      default:
        return 'low';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#C5CCD6] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
          <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
          <span>
            {user?.role === 'lawyer' ? 'Advocate on Record Docket' : 'Investigating Agency Docket'}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
          My Assigned Court Matters
        </h1>
        <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
        <p className="text-sm text-[#4A4F57] max-w-3xl">
          Matters where you are the designated {user?.role === 'lawyer' ? 'Advocate on Record' : 'Investigating Officer'}.
        </p>
      </div>

      {error && (
        <InlineBanner variant="danger" title="Error Loading Cases">
          {error}
        </InlineBanner>
      )}

      <Panel
        title="Assigned Matters List"
        subtitle={`Total active listings: ${cases.length}`}
      >
        {loading ? (
          <div className="p-12 text-center text-[#4A4F57]">
            <div className="w-8 h-8 border-4 border-[#0B2A5B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading assigned case files...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-[#4A4F57]">
            <Briefcase className="w-10 h-10 text-[#C5CCD6] mx-auto mb-3" aria-hidden="true" />
            <p className="text-base font-bold text-[#1A1A1A]">No Assigned Matters</p>
            <p className="text-xs mt-1">
              You do not currently have any active judicial files assigned in your docket.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/cases/${c.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/cases/${c.id}`);
                  }
                }}
                className="bg-white border border-[#C5CCD6] hover:border-[#0B2A5B] rounded p-5 cursor-pointer transition-colors shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-[#0B2A5B]">
                      {c.case_number}
                    </span>
                    <StatusChip
                      variant={mapTierToVariant(c.triage_tier)}
                      label={c.triage_tier?.toUpperCase() || 'LOW'}
                    />
                  </div>

                  <h2 className="text-sm font-bold text-[#1A1A1A] mb-2 line-clamp-1 hover:text-[#0B2A5B]">
                    {c.title}
                  </h2>

                  <div className="space-y-1 text-xs text-[#4A4F57] mb-4">
                    <div>
                      <strong>Court:</strong> {c.court}
                    </div>
                    <div>
                      <strong>Type:</strong> {c.case_type}
                    </div>
                    {c.custody_flag && (
                      <div className="text-[#B3261E] font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Accused in judicial custody</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#C5CCD6] flex items-center justify-between text-xs font-semibold text-[#0B2A5B]">
                  <span>Open Dossier &amp; Brief</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
