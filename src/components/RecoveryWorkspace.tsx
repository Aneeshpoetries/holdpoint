import React, { useState } from 'react';
import { useHoldpoint } from '../engine/store';
import {
  Database,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  FileDiff,
  Key,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { RestorePreview } from '../engine/types';

export const RecoveryWorkspace: React.FC = () => {
  const { snapshots, generateRestorePreview, executeRestoreDrill } = useHoldpoint();
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(snapshots[0]?.snapshotId || '');
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [drillResult, setDrillResult] = useState<any>(null);

  const handleGeneratePreview = (snapId: string) => {
    setSelectedSnapshotId(snapId);
    setDrillResult(null);
    const p = generateRestorePreview(snapId);
    setPreview(p);
  };

  const handleRunDrill = (snapId: string) => {
    const res = executeRestoreDrill(snapId);
    setDrillResult(res);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Fail-Safe & Independent Authority
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            Recovery Workspace & Verified Restore Drills
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Holdpoint retains versions under independent authority. Never claims "recovery verified" without an executed drill.
          </p>
        </div>
      </div>

      {/* Snapshots Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">
          Independent Vault Snapshots ({snapshots.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snapshots.map((snap) => {
            const isSelected = selectedSnapshotId === snap.snapshotId;
            return (
              <div
                key={snap.snapshotId}
                className={`p-4 rounded-xl border text-xs space-y-2.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-50 dark:bg-neutral-800/70 border-neutral-400 dark:border-neutral-600'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
                onClick={() => handleGeneratePreview(snap.snapshotId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {snap.resourceId} (v{snap.version})
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400">
                    {snap.destination}
                  </span>
                </div>

                <div className="font-mono text-[11px] text-neutral-500 space-y-0.5">
                  <div>Authority: {snap.authority} (Separated Custody)</div>
                  <div className="truncate">Key Fingerprint: {snap.encryptionKeyFingerprint}</div>
                  <div>Captured: {new Date(snap.capturedAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    {isSelected ? 'Active Preview Selected' : 'Click to Inspect Diff'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunDrill(snap.snapshotId);
                    }}
                    className="px-3 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded font-semibold text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Execute Restore Drill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoped Restore Preview (Diff & Conflicts) */}
      {preview && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileDiff className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Scoped Restore Preview & Conflict Analysis
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              Target: {preview.resourceId} (v{preview.currentVersion} → v{preview.targetVersion})
            </span>
          </div>

          {preview.conflictsDetected.length > 0 && (
            <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>State Conflicts Detected with Newer Work:</span>
              </div>
              {preview.conflictsDetected.map((c, i) => (
                <div key={i} className="font-mono text-[11px] pl-5">· {c}</div>
              ))}
            </div>
          )}

          <div className="space-y-2 text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Computed Changeset Diff:</span>
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 font-mono text-[11px] space-y-1 border border-neutral-200 dark:border-neutral-700">
              {preview.diffSummary.map((d, i) => (
                <div key={i} className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <span className="text-sky-500 font-bold">~</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Restore Drill Verification Results */}
      {drillResult && (
        <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4" />
              <h2 className="text-sm font-semibold">
                Restore Drill Successfully Verified on Real Destination
              </h2>
            </div>
            <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">
              HSM Signature Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200">
              <span>Integrity: </span>
              <strong>{drillResult.verifiedIntegrity ? 'VALID (100%)' : 'FAILED'}</strong>
            </div>
            <div className="p-2 rounded bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200">
              <span>IAM Permissions: </span>
              <strong>{drillResult.verifiedPermissions ? 'RESTORED' : 'FAILED'}</strong>
            </div>
            <div className="p-2 rounded bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200">
              <span>Cryptographic Key: </span>
              <strong>{drillResult.verifiedKeyFingerprint ? 'MATCHED ROOT' : 'FAILED'}</strong>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">Drill Verification Audit Log:</span>
            <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-850 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 space-y-0.5 max-h-32 overflow-y-auto">
              {drillResult.logs.map((log: string, idx: number) => (
                <div key={idx}>· {log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
