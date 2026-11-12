import React, { useState, useEffect } from 'react';
import { Case } from '../types';
import { api } from '../lib/api';
import {
  Upload,
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Scale,
  PlusCircle,
  FileUp,
  SlidersHorizontal
} from 'lucide-react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';
import { Dialog } from './ui/Dialog';
import { StatusChip } from './ui/StatusChip';
import { InlineBanner } from './ui/InlineBanner';

export const ClerkIntake: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('bail_application');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Case Form Modal
  const [showNewCaseModal, setShowNewCaseModal] = useState<boolean>(false);
  const [newCaseNumber, setNewCaseNumber] = useState<string>('');
  const [newCaseTitle, setNewCaseTitle] = useState<string>('');
  const [newCaseType, setNewCaseType] = useState<string>('Bail Application');
  const [newCustodyFlag, setNewCustodyFlag] = useState<boolean>(true);
  const [newCustodySince, setNewCustodySince] = useState<string>('2025-08-15');
  const [newVulnerable, setNewVulnerable] = useState<boolean>(false);

  // Override Modal
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideTier, setOverrideTier] = useState<string>('critical');
  const [overrideReason, setOverrideReason] = useState<string>('');

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

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCaseId) return;

    setUploading(true);
    setUploadSuccess(null);
    setStatusMessage(null);
    try {
      const res = await api.uploadDocument(selectedCaseId, file, docType);
      setUploadSuccess(res);
      setFile(null);
      fetchCases();
      setStatusMessage({
        type: 'success',
        text: 'Document uploaded, PII redacted per DPDP Act (2023), and encrypted into the secure registry repository.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Upload failed: ${err.message}`
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createCase({
        case_number: newCaseNumber || `CASE/DEL/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000 + 1000)}`,
        title: newCaseTitle,
        case_type: newCaseType,
        filing_date: new Date().toISOString(),
        custody_flag: newCustodyFlag,
        custody_since: newCustodyFlag ? newCustodySince : undefined,
        vulnerable_party: newVulnerable,
        vulnerability_reason: newVulnerable ? 'Priority Vulnerable Group' : undefined
      });
      setShowNewCaseModal(false);
      setNewCaseNumber('');
      setNewCaseTitle('');
      fetchCases();
      setSelectedCaseId(created.id);
      setStatusMessage({
        type: 'success',
        text: `Case ${created.case_number} registered in Registry docket.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error registering case: ${err.message}`
      });
    }
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert('Mandatory justification reason required for override');
      return;
    }
    try {
      await api.overrideTriage(selectedCaseId, overrideTier, overrideReason);
      setShowOverrideModal(false);
      setOverrideReason('');
      fetchCases();
      setStatusMessage({
        type: 'success',
        text: 'Triage urgency successfully overridden and recorded in tamper-evident audit log.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Override failed: ${err.message}`
      });
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#C5CCD6] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
          <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
          <span>Court Registry Intake &bull; Document Ingestion &amp; Triage</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
          Case Filing Intake &amp; Ingestion Center
        </h1>
        <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
        <p className="text-sm text-[#4A4F57] max-w-3xl">
          Register new judicial matters, upload legal filings with automated DPDP Act (2023) PII redaction, and record formal administrative triage adjustments.
        </p>
      </div>

      {statusMessage && (
        <InlineBanner
          variant={statusMessage.type === 'success' ? 'success' : 'danger'}
          title={statusMessage.type === 'success' ? 'Intake Action Completed' : 'Intake Error'}
        >
          {statusMessage.text}
        </InlineBanner>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F4F6FA] border border-[#C5CCD6] p-4 rounded">
        <div>
          <span className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider block">
            Active Registry Docket
          </span>
          <span className="text-sm text-[#1A1A1A]">
            {cases.length} court matters currently on record
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setShowNewCaseModal(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>Register New Filing</span>
          </Button>
          {selectedCase && (
            <Button
              variant="secondary"
              onClick={() => setShowOverrideModal(true)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span>Override Triage Priority</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Case Selector & Document Ingestion Form */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Document Ingestion &amp; Automated Redaction">
            <form onSubmit={handleFileUpload} className="space-y-4">
              <FormField
                label="Target Judicial Matter"
                required
                htmlFor="case-selector"
                hint="Select the case file under which this document should be registered."
              >
                <select
                  id="case-selector"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number} — {c.title.slice(0, 50)}... ({c.case_type})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Document Classification Category"
                required
                htmlFor="doc-type-selector"
                hint="Category determines legal section parsing and automated extraction pipelines."
              >
                <select
                  id="doc-type-selector"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="bail_application">Bail Application (CrPC / BNSS)</option>
                  <option value="chargesheet">Police Charge Sheet / Final Form Report</option>
                  <option value="fir">First Information Report (FIR)</option>
                  <option value="medical_report">Medico-Legal Examination Report</option>
                  <option value="order">Previous Judicial Order / Subordinate Court Record</option>
                </select>
              </FormField>

              <FormField
                label="Filing Attachment File"
                required
                htmlFor="file-upload-input"
                hint="Accepted formats: PDF, DOCX, TXT. Documents are tokenized for DPDP Act compliance before storage."
              >
                <input
                  id="file-upload-input"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#C5CCD6] rounded file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0B2A5B] file:text-white hover:file:bg-[#071C3F] cursor-pointer"
                />
              </FormField>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isBusy={uploading}
                  disabled={!file || !selectedCaseId || uploading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <FileUp className="w-4 h-4" aria-hidden="true" />
                  <span>{uploading ? 'Processing Ingestion Pipeline...' : 'Upload &amp; Redact Document'}</span>
                </Button>
              </div>
            </form>
          </Panel>

          {/* Upload Success & DPDP Redaction Verification */}
          {uploadSuccess && (
            <Panel
              title="DPDP Act (2023) Privacy Tokenization &amp; Ingestion Report"
              subtitle="Tamper-evident verification details"
            >
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#137333]/10 border border-[#137333]/30 rounded text-[#137333] font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Document securely ingested into encrypted storage.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
                    <span className="text-[#4A4F57] block">Version Number</span>
                    <strong className="text-sm text-[#0B2A5B] font-mono">
                      v{uploadSuccess.document_version?.version_no ?? 1}
                    </strong>
                  </div>
                  <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
                    <span className="text-[#4A4F57] block">File Size</span>
                    <strong className="text-sm text-[#0B2A5B] font-mono">
                      {uploadSuccess.document_version?.size_bytes ?? 0} bytes
                    </strong>
                  </div>
                  <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
                    <span className="text-[#4A4F57] block">Encryption Mode</span>
                    <strong className="text-sm text-[#0B2A5B]">Envelope HKDF-SHA256</strong>
                  </div>
                </div>

                {uploadSuccess.pii_redaction && (
                  <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded space-y-2">
                    <div className="flex items-center justify-between font-bold text-[#0B2A5B]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#137333]" aria-hidden="true" />
                        DPDP Act Tokenized Entities
                      </span>
                      <span>{uploadSuccess.pii_redaction.redacted_count} entities replaced</span>
                    </div>
                    <p className="text-[#4A4F57]">
                      Direct identifiers (Aadhaar numbers, PAN, mobile numbers, personal names) were masked before indexing. The original raw text remains sealed under authorized judicial custody.
                    </p>
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>

        {/* Right Column: Active Case Overview */}
        <div className="space-y-6">
          <Panel title="Active Case Profile">
            {selectedCase ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-mono text-sm font-bold text-[#0B2A5B] block">
                    {selectedCase.case_number}
                  </span>
                  <h2 className="text-base font-bold text-[#1A1A1A] mt-1">
                    {selectedCase.title}
                  </h2>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#C5CCD6]">
                  <div className="flex justify-between py-1 border-b border-[#F4F6FA]">
                    <span className="text-[#4A4F57]">Court Forum:</span>
                    <strong className="text-[#1A1A1A]">{selectedCase.court}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F4F6FA]">
                    <span className="text-[#4A4F57]">Case Category:</span>
                    <strong className="text-[#1A1A1A]">{selectedCase.case_type}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F4F6FA]">
                    <span className="text-[#4A4F57]">Current Urgency Tier:</span>
                    <StatusChip
                      variant={
                        selectedCase.triage_tier === 'critical'
                          ? 'critical'
                          : selectedCase.triage_tier === 'high'
                          ? 'high'
                          : selectedCase.triage_tier === 'normal'
                          ? 'normal'
                          : 'low'
                      }
                      label={selectedCase.triage_tier?.toUpperCase() || 'UNRANKED'}
                    />
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F4F6FA]">
                    <span className="text-[#4A4F57]">Triage Score:</span>
                    <strong className="text-[#0B2A5B] font-mono">{selectedCase.triage_score ?? 0} / 100</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F4F6FA]">
                    <span className="text-[#4A4F57]">Ingested Documents:</span>
                    <strong className="text-[#1A1A1A]">{selectedCase.document_count}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F4F6FA]">
                    <span className="text-[#4A4F57]">Undertrial Custody:</span>
                    <strong className={selectedCase.custody_flag ? 'text-[#B3261E]' : 'text-[#4A4F57]'}>
                      {selectedCase.custody_flag ? 'Yes (Active Detention)' : 'No (Bailed / Non-custody)'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#4A4F57]">Vulnerable Party:</span>
                    <strong className={selectedCase.vulnerable_party ? 'text-[#137333]' : 'text-[#4A4F57]'}>
                      {selectedCase.vulnerable_party ? selectedCase.vulnerability_reason || 'Yes' : 'No'}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#4A4F57] py-6 text-center">
                Select a case from the list to review details.
              </p>
            )}
          </Panel>
        </div>
      </div>

      {/* Register New Case Accessible Dialog */}
      <Dialog
        isOpen={showNewCaseModal}
        onClose={() => setShowNewCaseModal(false)}
        title="Register New Judicial Case File"
        description="Fill in mandatory statutory parameters for automated triage and cause listing."
      >
        <form onSubmit={handleCreateCase} className="space-y-4">
          <FormField
            label="Case Number"
            required
            htmlFor="new-case-number"
            hint="Leave blank to auto-generate a valid registry docket identifier."
          >
            <input
              id="new-case-number"
              type="text"
              placeholder="e.g. BAIL/DEL/2026/1042"
              value={newCaseNumber}
              onChange={(e) => setNewCaseNumber(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            />
          </FormField>

          <FormField
            label="Case Title (Parties Involved)"
            required
            htmlFor="new-case-title"
            hint="e.g. State (NCT of Delhi) v. Ramesh Kumar &amp; Anr."
          >
            <input
              id="new-case-title"
              type="text"
              required
              placeholder="State v. Accused Party"
              value={newCaseTitle}
              onChange={(e) => setNewCaseTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            />
          </FormField>

          <FormField
            label="Matter Classification"
            required
            htmlFor="new-case-type"
          >
            <select
              id="new-case-type"
              value={newCaseType}
              onChange={(e) => setNewCaseType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            >
              <option value="Bail Application">Bail Application (Regular / Anticipatory)</option>
              <option value="Criminal Trial">Criminal Trial (Chargesheet Ingested)</option>
              <option value="Civil Suit">Civil Suit</option>
              <option value="Appellate Review">Appellate Review</option>
            </select>
          </FormField>

          <div className="space-y-2 p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1A1A1A]">
              <input
                type="checkbox"
                checked={newCustodyFlag}
                onChange={(e) => setNewCustodyFlag(e.target.checked)}
                className="w-4 h-4 text-[#0B2A5B] border-[#C5CCD6] rounded focus:ring-[#0B2A5B]"
              />
              <span>Accused party is currently held in judicial custody (undertrial)</span>
            </label>

            {newCustodyFlag && (
              <div className="pt-2 pl-6">
                <FormField
                  label="Custody Commencement Date"
                  required
                  htmlFor="custody-date"
                  hint="Used to calculate undertrial detention duration for Article 21 / CrPC Sec 436A priority."
                >
                  <input
                    id="custody-date"
                    type="date"
                    value={newCustodySince}
                    onChange={(e) => setNewCustodySince(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                  />
                </FormField>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1A1A1A]">
              <input
                type="checkbox"
                checked={newVulnerable}
                onChange={(e) => setNewVulnerable(e.target.checked)}
                className="w-4 h-4 text-[#0B2A5B] border-[#C5CCD6] rounded focus:ring-[#0B2A5B]"
              />
              <span>Matter involves vulnerable party (senior citizen, child, victim of trafficking)</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#C5CCD6]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowNewCaseModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Case
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Override Triage Modal */}
      <Dialog
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        title="Administrative Triage Urgency Override"
        description="Override automated rule scoring with formal judicial or administrative justification."
      >
        <form onSubmit={handleOverride} className="space-y-4">
          <FormField
            label="Target Urgency Tier"
            required
            htmlFor="override-tier"
            hint="Adjusts cause list scheduling order and bench notification urgency."
          >
            <select
              id="override-tier"
              value={overrideTier}
              onChange={(e) => setOverrideTier(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            >
              <option value="critical">Critical Priority (Immediate Bench Listing)</option>
              <option value="high">High Urgency (Listing within 48 Hours)</option>
              <option value="normal">Normal (Standard Docket Timeline)</option>
              <option value="low">Low (Awaiting Counter-Affidavits)</option>
            </select>
          </FormField>

          <FormField
            label="Mandatory Reason for Override"
            required
            htmlFor="override-reason"
            hint="Must specify judicial direction, medical emergency, or bench order reference. Logged in audit trail."
          >
            <textarea
              id="override-reason"
              required
              rows={3}
              placeholder="e.g. As per oral mentioning before Bench 02, medical grounds require urgent bail hearing."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#C5CCD6]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowOverrideModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Triage Override
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
