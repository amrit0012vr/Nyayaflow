import React, { useState, useEffect } from 'react';
import { Case } from '../types';
import { api } from '../lib/api';
import { 
  Upload, FileText, CheckCircle2, ShieldCheck, AlertCircle, 
  ArrowRight, RefreshCw, Lock, Sparkles, Scale 
} from 'lucide-react';

export const ClerkIntake: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('bail_application');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<any>(null);

  // New Case Form
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
    try {
      const res = await api.uploadDocument(selectedCaseId, file, docType);
      setUploadSuccess(res);
      setFile(null);
      fetchCases();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
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
      fetchCases();
      setSelectedCaseId(created.id);
      alert('Case successfully created in Registry docket!');
    } catch (err: any) {
      alert(`Error creating case: ${err.message}`);
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
      alert('Triage successfully overridden and recorded in cryptographic audit chain!');
    } catch (err: any) {
      alert(`Override failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Scale className="w-4 h-4" /> Court Registry & Document Ingestion Core
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Secure Document Vault & Agentic Processing
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Ingest case records into AES-256 encrypted storage, apply automated PII redaction, and trigger multi-agent pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            + Register New Case Filing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Pipeline Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            Upload Legal Document into Encrypted Vault
          </h2>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Case Docket</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} — {c.title} ({c.case_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Document Classification Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="bail_application">Bail Application (CrPC 439 / BNSS 483)</option>
                <option value="fir">First Information Report (FIR)</option>
                <option value="charge_sheet">Police Charge Sheet / Final Report (Sec 173)</option>
                <option value="petition">Writ Petition / Plaint</option>
                <option value="order">Judicial Order / Judgment</option>
                <option value="medical_report">Medical / Forensic Examination Report</option>
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-6 text-center cursor-pointer transition bg-slate-800/40">
              <input
                type="file"
                id="case-doc-file"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <label htmlFor="case-doc-file" className="cursor-pointer block space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-sm text-slate-200">
                  {file ? (
                    <span className="font-semibold text-amber-400">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  ) : (
                    <span>Click to select or drag PDF, scan, or legal text file</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  Secured with AES-256-GCM at rest & SHA-256 audit chaining
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${
                !file || uploading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Pipeline: Encryption → OCR → Redaction → Triage → Summarisation...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Encrypt, Seal & Trigger Agent Pipeline
                </>
              )}
            </button>
          </form>

          {/* Success Banner */}
          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Document Ingested & Pipeline Completed!
              </div>
              <div className="text-slate-300 font-mono text-[11px] space-y-0.5">
                <div>Version: #{uploadSuccess.document_version?.version_no}</div>
                <div>SHA-256: {uploadSuccess.document_version?.sha256}</div>
                <div>Size: {uploadSuccess.document_version?.size_bytes} bytes (AES-256 Encrypted)</div>
                <div>Triage Tier: <strong className="text-amber-400 uppercase">{uploadSuccess.pipeline_result?.triage?.tier}</strong> ({uploadSuccess.pipeline_result?.triage?.score}/100)</div>
              </div>
            </div>
          )}
        </div>

        {/* Registry Actions & Override */}
        <div className="space-y-6">
          {/* Clerk Override Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" /> Human-in-the-Loop Override
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI provides advisory triage scores. Authorized Registry Clerks can adjust priority tiers with a mandatory audit reason.
            </p>
            <button
              onClick={() => setShowOverrideModal(true)}
              className="w-full py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 font-semibold text-xs transition"
            >
              Apply Triage Tier Override
            </button>
          </div>

          {/* Pipeline Stages Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Pipeline Architecture
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span>1. AES-256 Vault Storage</span>
                <span className="text-emerald-400 font-mono text-[11px]">Enforced</span>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span>2. Automated PII Redaction</span>
                <span className="text-emerald-400 font-mono text-[11px]">DPDP-2023</span>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span>3. Explainable Triage Scoring</span>
                <span className="text-emerald-400 font-mono text-[11px]">Rule + LLM</span>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span>4. Citation Verifier</span>
                <span className="text-emerald-400 font-mono text-[11px]">Anti-Hallucination</span>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span>5. Hash-Chain Audit Logging</span>
                <span className="text-emerald-400 font-mono text-[11px]">Tamper-Proof</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Register New Filing Docket</h2>
            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Case Number (or leave blank for auto)</label>
                <input
                  type="text"
                  placeholder="e.g. BAIL/DEL/2026/0991"
                  value={newCaseNumber}
                  onChange={(e) => setNewCaseNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Case Title / Cause Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Patel vs. State of Delhi"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Case Type</label>
                <select
                  value={newCaseType}
                  onChange={(e) => setNewCaseType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="Bail Application">Bail Application (CrPC 439 / BNSS 483)</option>
                  <option value="Writ Petition">Writ Petition (Article 226)</option>
                  <option value="Criminal Trial">Criminal Trial (Sessions)</option>
                  <option value="Commercial Suit">Commercial Suit</option>
                  <option value="Habeas Corpus">Habeas Corpus</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newCustodyFlag}
                    onChange={(e) => setNewCustodyFlag(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  Under-Trial In Custody
                </label>
              </div>

              {newCustodyFlag && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custody Since Date</label>
                  <input
                    type="date"
                    value={newCustodySince}
                    onChange={(e) => setNewCustodySince(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newVulnerable}
                    onChange={(e) => setNewVulnerable(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  Priority Litigant (Senior Citizen / Minor / Disability)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Judicial Triage Override</h2>
            <p className="text-xs text-slate-400">
              Every override is cryptographically logged in the tamper-evident audit trail with your name and justification.
            </p>

            <form onSubmit={handleOverride} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select New Urgency Tier</label>
                <select
                  value={overrideTier}
                  onChange={(e) => setOverrideTier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="critical">Critical Tier (Immediate Listing)</option>
                  <option value="high">High Tier</option>
                  <option value="normal">Normal Tier</option>
                  <option value="low">Low Tier</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mandatory Justification Reason</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Urgent medical bail request certified by Chief Medical Officer..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Record Override in Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
