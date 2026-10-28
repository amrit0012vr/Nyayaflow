import React, { useState, useEffect } from 'react';
import { Case } from '../types';
import { api } from '../lib/api';
import { 
  ShieldCheck, Upload, FileText, Lock, CheckCircle2, 
  Clock, Hash, Key, AlertCircle, Scale 
} from 'lucide-react';

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
      alert('Evidence cryptographically sealed in vault and recorded in chained audit log!');
    } catch (err: any) {
      alert(`Evidence upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Scale className="w-4 h-4" /> Investigating Officer & Police Evidence Vault
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Tamper-Proof Chain of Custody & Evidence Ingestion
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Every evidentiary artifact is AES-256 encrypted at rest with an immutable SHA-256 hash chained into the judicial audit log.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            Deposit Case Evidence
          </h2>

          <form onSubmit={handleUploadEvidence} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Case Docket</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Evidence Title</label>
              <input
                type="text"
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Evidence Classification</label>
              <select
                value={evidenceCategory}
                onChange={(e) => setEvidenceCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="forensic_report">Forensic / Chemical Lab Report</option>
                <option value="seizure_memo">Seizure Memo / Panchnama</option>
                <option value="cctv_log">Digital CCTV / Call Detail Record (CDR)</option>
                <option value="witness_statement">Section 161 CrPC / BNSS 180 Witness Statement</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Evidence Text / Certified Excerpt</label>
              <textarea
                rows={4}
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Lock className="w-4 h-4" />
              {uploading ? 'Calculating SHA-256 & Encrypting...' : 'Deposit & Anchor in Hash Chain'}
            </button>
          </form>
        </div>

        {/* Chain of Custody Vault Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Active Chain of Custody Registry
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Tamper-Evident Active
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Below are cryptographic receipts of investigation documents deposited into the judicial evidence vault. Any bit modification invalidates the SHA-256 signature immediately.
            </p>

            <div className="space-y-3">
              {uploadedEvidence.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No newly deposited evidence in this session. Existing seed evidence files are anchored in the Audit Chain.
                </div>
              ) : (
                uploadedEvidence.map((ev, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-white text-sm">{ev.title}</span>
                      <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Chained
                      </span>
                    </div>

                    <div className="text-slate-300 font-mono text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all space-y-1">
                      <div><strong className="text-amber-400">SHA-256 Digest:</strong> {ev.sha256}</div>
                      <div><strong className="text-slate-400">Cipher:</strong> AES-256-GCM (Military-Grade)</div>
                      <div><strong className="text-slate-400">Vault Timestamp:</strong> {ev.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

