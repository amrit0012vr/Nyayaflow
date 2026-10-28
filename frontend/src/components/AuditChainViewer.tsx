import React, { useState, useEffect } from 'react';
import { AuditEntry } from '../types';
import { api } from '../lib/api';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, 
  RefreshCw, Lock, Link, Eye, Bug, Scale 
} from 'lucide-react';

export const AuditChainViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [tampering, setTampering] = useState<boolean>(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateTamper = async (entryId: number) => {
    setTampering(true);
    try {
      await api.simulateTamper(entryId);
      // Immediately run verification to show the live detection
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
      fetchLogs();
    } catch (err: any) {
      alert(`Tamper error: ${err.message}`);
    } finally {
      setTampering(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    handleVerifyChain();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Scale className="w-4 h-4" /> Judicial Vigilance & Cryptographic Audit Trail
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Tamper-Evident Hash Chain & Integrity Verifier
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Formula: <code className="text-amber-300 font-mono text-xs">entry_hash_n = SHA256(prev_hash || ts || actor || action || object || details)</code>. Guaranteed append-only immutability.
          </p>
        </div>

        {/* Verification Trigger Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {verifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Verify Audit Chain Integrity
          </button>

          <button
            onClick={() => handleSimulateTamper(logs[0]?.id || 1)}
            disabled={tampering || logs.length === 0}
            className="px-4 py-2 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
          >
            <Bug className="w-4 h-4" />
            Simulate Tamper Demo
          </button>
        </div>
      </div>

      {/* Verification Status Card */}
      {verificationResult && (
        <div
          className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xl ${
            verificationResult.is_valid
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                verificationResult.is_valid
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-bounce'
              }`}
            >
              {verificationResult.is_valid ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <ShieldAlert className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="text-base font-bold">
                {verificationResult.is_valid
                  ? 'Cryptographic Chain Integrity Confirmed'
                  : 'Tampering Detected in Judicial Chain!'}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {verificationResult.message}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700/60 shrink-0">
            Total Blocks: <strong>{verificationResult.total_entries_checked}</strong> | Broken At:{' '}
            <strong>{verificationResult.broken_at_id ?? 'None (Clean)'}</strong>
          </div>
        </div>
      )}

      {/* Chain Timeline Blocks */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Link className="w-4 h-4 text-amber-400" />
            Append-Only Cryptographic Audit Log Entries ({logs.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Genesis: 0000000000...</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">
            Loading cryptographic hash blocks...
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 max-h-[650px] overflow-y-auto">
            {logs.map((entry) => (
              <div key={entry.id} className="p-4 hover:bg-slate-800/40 transition space-y-2 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Block #{entry.id}
                    </span>
                    <span className="font-semibold text-white uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {entry.action}
                    </span>
                    <span className="text-slate-400">by <strong className="text-slate-200">{entry.actor_name}</strong></span>
                  </div>

                  <span className="text-slate-500 font-mono text-[11px]">{entry.ts}</span>
                </div>

                {/* Hashes Linkage Visual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all">
                  <div>
                    <span className="text-slate-500 block">Previous Hash (H_prev):</span>
                    <span className="text-slate-400">{entry.prev_hash}</span>
                  </div>
                  <div>
                    <span className="text-amber-400 block">Entry Hash (SHA-256):</span>
                    <span className="text-amber-300 font-bold">{entry.entry_hash}</span>
                  </div>
                </div>

                {/* Details Payload */}
                {entry.details && Object.keys(entry.details).length > 0 && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/60">
                    <strong className="text-slate-300">Payload:</strong> {JSON.stringify(entry.details)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
