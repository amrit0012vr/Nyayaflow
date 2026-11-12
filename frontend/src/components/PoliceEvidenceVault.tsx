import React, { useState, useEffect } from 'react';
import { Case } from '../types';
import { api } from '../lib/api';
import {
  ShieldCheck,
  Upload,
  Lock,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';
import { InlineBanner } from './ui/InlineBanner';

export const PoliceEvidenceVault: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [evidenceTitle, setEvidenceTitle] = useState<string>('Forensic Chemical Analysis & Seizure Memo');
  const [evidenceCategory, setEvidenceCategory] = useState<string>('forensic_report');
  const [evidenceText, setEvidenceText] = useState<string>(
    'CENTRAL FORENSIC SCIENCE LABORATORY (CFSL) EXAMINATION REPORT\nSpecimen Q-1 examined under spectrophotometer. No traces of prohibited accelerant detected. Chain of custody sealed with lead impression mark CFSL-DEL-492.'
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedEvidence, setUploadedEvidence] = useState<any[]>([]);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCases = async () => {
    try {
      const data = await api.getCases();
      setCases(data);
      if (data.length > 0 && !selectedCaseId) {
        setSelectedCaseId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceText.trim() || !selectedCaseId) return;

    setUploading(true);
    setBannerMessage(null);
    try {
      const file = new File([evidenceText], `${evidenceTitle.replace(/\s+/g, '_')}.txt`, { type: 'text/plain' });
      const res = await api.uploadDocument(selectedCaseId, file, 'medical_report');

      const newEntry = {
        title: evidenceTitle,
        category: evidenceCategory,
        version_no: res.document_version?.version_no || 1,
        sha256: res.document_version?.sha256,
        size_bytes: res.document_version?.size_bytes,
        timestamp: new Date().toISOString()
      };

      setUploadedEvidence((prev) => [newEntry, ...prev]);
      setBannerMessage({
        type: 'success',
        text: 'Evidentiary artifact sealed and recorded into tamper-evident chained audit ledger.'
      });
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: `Evidence deposit failed: ${err.message}`
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#C5CCD6] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
          <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
          <span>Law Enforcement Docket &bull; Investigating Agency Vault</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
          Tamper-Evident Chain of Custody &amp; Evidence Ingestion
        </h1>
        <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
        <p className="text-sm text-[#4A4F57] max-w-3xl">
          Evidentiary artifacts are AES-256 encrypted at rest with a tamper-evident SHA-256 hash chained into the judicial audit log.
        </p>
      </div>

      {bannerMessage && (
        <InlineBanner
          variant={bannerMessage.type === 'success' ? 'success' : 'danger'}
          title={bannerMessage.type === 'success' ? 'Evidence Vault Receipt' : 'Error'}
        >
          {bannerMessage.text}
        </InlineBanner>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit Evidence Form */}
        <div className="space-y-6">
          <Panel title="Deposit Case Evidence">
            <form onSubmit={handleUploadEvidence} className="space-y-4">
              <FormField
                label="Target Judicial Matter"
                required
                htmlFor="target-case-docket"
              >
                <select
                  id="target-case-docket"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number} — {c.title.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Evidence Title"
                required
                htmlFor="evidence-title-input"
              >
                <input
                  id="evidence-title-input"
                  type="text"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </FormField>

              <FormField
                label="Evidence Classification"
                required
                htmlFor="evidence-category-selector"
              >
                <select
                  id="evidence-category-selector"
                  value={evidenceCategory}
                  onChange={(e) => setEvidenceCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="forensic_report">Forensic / Chemical Lab Examination Report</option>
                  <option value="seizure_memo">Seizure Memo / Panchnama</option>
                  <option value="cctv_log">Digital CCTV / Call Detail Record (CDR)</option>
                  <option value="witness_statement">Section 161 CrPC / BNSS 180 Witness Statement</option>
                </select>
              </FormField>

              <FormField
                label="Certified Text / Excerpt"
                required
                htmlFor="evidence-content-textarea"
                hint="Anchors the cryptographic fingerprint in the audit trail."
              >
                <textarea
                  id="evidence-content-textarea"
                  rows={4}
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-xs font-mono text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                isBusy={uploading}
                disabled={uploading || !selectedCaseId}
                className="w-full flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>{uploading ? 'Calculating SHA-256 & Encrypting...' : 'Deposit in Hash Chain'}</span>
              </Button>
            </form>
          </Panel>
        </div>

        {/* Chain of Custody Records */}
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Chain of Custody Registry"
            subtitle="Cryptographic verification receipts"
            action={
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#137333]/15 text-[#137333] border border-[#137333]/30 font-mono font-semibold">
                Tamper-Evident Active
              </span>
            }
          >
            <p className="text-xs text-[#4A4F57] mb-4">
              Cryptographic receipts of investigation documents deposited into the judicial evidence vault. Any bit modification invalidates the SHA-256 signature immediately.
            </p>

            <div className="space-y-3">
              {uploadedEvidence.length === 0 ? (
                <div className="p-8 text-center text-[#757575] border border-dashed border-[#C5CCD6] rounded">
                  No newly deposited evidence in this session. Existing evidence files are indexed in the Audit Chain.
                </div>
              ) : (
                uploadedEvidence.map((ev, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <strong className="text-sm text-[#0B2A5B]">{ev.title}</strong>
                      <span className="text-[#137333] font-mono text-[11px] bg-[#137333]/10 px-2 py-0.5 rounded border border-[#137333]/20 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Chained
                      </span>
                    </div>

                    <div className="text-[#1A1A1A] font-mono text-[11px] bg-white p-3 rounded border border-[#C5CCD6] break-all space-y-1">
                      <div>
                        <strong className="text-[#0B2A5B]">SHA-256 Digest:</strong> {ev.sha256}
                      </div>
                      <div>
                        <strong className="text-[#4A4F57]">Encryption:</strong> AES-256-GCM / HKDF-SHA256
                      </div>
                      <div>
                        <strong className="text-[#4A4F57]">Vault Timestamp:</strong> {ev.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
