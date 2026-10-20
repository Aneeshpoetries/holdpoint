import React, { useState } from 'react';
import { useHoldpoint } from '../engine/store';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  Bug,
  RotateCcw,
  Search,
  Hash,
  Clock
} from 'lucide-react';

export const EvidenceAuditView: React.FC = () => {
  const { evidenceList, verifyLedger, simulateTamper } = useHoldpoint();
  const [auditResult, setAuditResult] = useState<{
    intact: boolean;
    tamperedIndex?: number;
    verifiedEntries: number;
  } | null>(null);

  const handleVerify = () => {
    const res = verifyLedger();
    setAuditResult(res);
  };

  const handleSimulateTamper = () => {
    simulateTamper();
    setAuditResult(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Evidence & Non-Repudiation
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            Hash-Chained Audit Ledger
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Every digital action intent, policy calculation, approval signature, and dispatch receipt is cryptographically linked
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateTamper}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Adversarially modify block #1 in memory to test tamper detection"
          >
            <Bug className="w-3.5 h-3.5 text-rose-500" />
            <span>Simulate Log Tamper</span>
          </button>

          <button
            onClick={handleVerify}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Chain Integrity</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {auditResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
            auditResult.intact
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {auditResult.intact ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {auditResult.intact
                  ? 'Cryptographic Audit Verified: SHA-256 Chain is Intact'
                  : `TAMPER DETECTED: Hash Mismatch Flagged at Block Index #${auditResult.tamperedIndex}`}
              </div>
              <p className="mt-0.5 opacity-85">
                {auditResult.intact
                  ? `Successfully validated ${auditResult.verifiedEntries} chained events against genesis root. Zero unauthorized modifications detected.`
                  : `Downstream hash recalculation failed at block #${auditResult.tamperedIndex}. An entry was maliciously altered or injected without the root key.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
            Audit Ledger Blocks ({evidenceList.length})
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            Algorithm: SHA-256 Recursive Link
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-500 uppercase">
                <th className="py-2.5 px-3">Index</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Summary</th>
                <th className="py-2.5 px-3">Actor / Dest</th>
                <th className="py-2.5 px-3">Payload Hash</th>
                <th className="py-2.5 px-3">Current Block Hash</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-mono">
              {evidenceList.map((entry) => (
                <tr key={entry.index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors">
                  <td className="py-2.5 px-3 text-neutral-400 tabular-nums">
                    #{entry.index.toString().padStart(3, '0')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 uppercase text-[10px]">
                      {entry.stage}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-neutral-900 dark:text-neutral-100 max-w-xs truncate" title={entry.summary}>
                    {entry.summary}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                    <div>{entry.actorId.split('@')[0]}</div>
                    <div className="text-[10px] text-neutral-400">{entry.destination}</div>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 text-[11px] truncate max-w-[120px]" title={entry.payloadHash}>
                    {entry.payloadHash.substring(0, 14)}...
                  </td>
                  <td className="py-2.5 px-3 text-sky-600 dark:text-sky-400 text-[11px] font-semibold truncate max-w-[140px]" title={entry.currentHash}>
                    {entry.currentHash.substring(0, 16)}...
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 tabular-nums text-[11px]">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
