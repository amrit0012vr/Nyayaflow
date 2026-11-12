import React, { useState, useEffect } from 'react';
import { AuditEntry } from '../types';
import { api } from '../lib/api';
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Link,
  Bug,
  Scale,
  Printer
} from 'lucide-react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { InlineBanner } from './ui/InlineBanner';

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
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
      fetchLogs();
    } catch (err: any) {
      alert(`Tamper error: ${err.message}`);
    } finally {
      setTampering(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchLogs();
    handleVerifyChain();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#C5CCD6] pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
              <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
              <span>Judicial Vigilance &bull; Tamper-Evident Audit Ledger</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
              Cryptographic Audit Chain &amp; Integrity Verifier
            </h1>
            <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
            <p className="text-sm text-[#4A4F57] max-w-3xl">
              Formula: <code className="text-[#0B2A5B] font-mono text-xs bg-[#F4F6FA] px-1 py-0.5 rounded border border-[#C5CCD6]">entry_hash_n = SHA256(prev_hash || ts || actor || action || object || details)</code>. Tamper-evident append-only ledger.
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Print Report</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              isBusy={verifying}
              disabled={verifying}
              onClick={handleVerifyChain}
              className="flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Verify Integrity</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={tampering || logs.length === 0}
              onClick={() => handleSimulateTamper(logs[0]?.id || 1)}
              className="flex items-center gap-1.5"
            >
              <Bug className="w-4 h-4" aria-hidden="true" />
              <span>Simulate Tamper Demo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Status Card */}
      {verificationResult && (
        <div
          role="status"
          className={`p-5 rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
            verificationResult.is_valid
              ? 'bg-[#137333]/10 border-[#137333]/40 text-[#137333]'
              : 'bg-[#B3261E]/10 border-[#B3261E]/40 text-[#B3261E]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded flex items-center justify-center shrink-0 border ${
                verificationResult.is_valid
                  ? 'bg-white border-[#137333]/30 text-[#137333]'
                  : 'bg-white border-[#B3261E]/30 text-[#B3261E]'
              }`}
            >
              {verificationResult.is_valid ? (
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              ) : (
                <ShieldAlert className="w-6 h-6" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">
                {verificationResult.is_valid
                  ? 'Cryptographic Chain Integrity Confirmed'
                  : 'Tampering Detected in Judicial Audit Chain!'}
              </h2>
              <p className="text-xs text-[#4A4F57] mt-0.5">
                {verificationResult.message}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-white px-3 py-2 rounded border border-[#C5CCD6] shrink-0 text-[#1A1A1A]">
            Total Entries: <strong>{verificationResult.total_entries_checked}</strong> | Broken At:{' '}
            <strong className={verificationResult.is_valid ? 'text-[#137333]' : 'text-[#B3261E]'}>
              {verificationResult.broken_at_id ?? 'None (Clean)'}
            </strong>
          </div>
        </div>
      )}

      {/* Chain Timeline Blocks */}
      <Panel
        title={`Audit Log Entries (${logs.length})`}
        subtitle="Chronological sequence of verified ledger blocks"
        action={
          <span className="text-xs font-mono text-[#757575]">
            Genesis: 000000000000...
          </span>
        }
      >
        {loading ? (
          <div className="p-12 text-center text-[#4A4F57]">
            <div className="w-8 h-8 border-4 border-[#0B2A5B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading cryptographic hash blocks...</p>
          </div>
        ) : (
          <div className="divide-y divide-[#C5CCD6] max-h-[650px] overflow-y-auto">
            {logs.map((entry) => (
              <div key={entry.id} className="py-4 px-2 hover:bg-[#F4F6FA] transition-colors space-y-2 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0B2A5B] bg-[#0B2A5B]/10 px-2 py-0.5 rounded border border-[#0B2A5B]/20">
                      Block #{entry.id}
                    </span>
                    <span className="font-semibold text-[#1A1A1A] uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-[#F4F6FA] border border-[#C5CCD6]">
                      {entry.action}
                    </span>
                    <span className="text-[#4A4F57]">
                      by <strong className="text-[#1A1A1A]">{entry.actor_name}</strong>
                    </span>
                  </div>

                  <span className="text-[#757575] font-mono text-[11px]">{entry.ts}</span>
                </div>

                {/* Hashes Linkage Visual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-[#F4F6FA] p-2.5 rounded border border-[#C5CCD6] break-all">
                  <div>
                    <span className="text-[#757575] block font-sans">Previous Hash (H_prev):</span>
                    <span className="text-[#4A4F57]">{entry.prev_hash}</span>
                  </div>
                  <div>
                    <span className="text-[#0B2A5B] block font-sans font-bold">Entry Hash (SHA-256):</span>
                    <span className="text-[#0B2A5B] font-bold">{entry.entry_hash}</span>
                  </div>
                </div>

                {/* Details Payload */}
                {entry.details && Object.keys(entry.details).length > 0 && (
                  <div className="text-[11px] text-[#4A4F57] bg-white p-2 rounded border border-[#C5CCD6]">
                    <strong className="text-[#1A1A1A]">Payload:</strong> {JSON.stringify(entry.details)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
