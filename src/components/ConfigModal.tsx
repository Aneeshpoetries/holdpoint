import React, { useEffect, useRef } from 'react';
import { useHoldpoint } from '../engine/store';
import { X, AlertTriangle, ShieldCheck, Radio } from 'lucide-react';

export const ConfigModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { config, updateConfig } = useHoldpoint();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="cr-config-dialog bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-xl w-full p-6 text-neutral-900 dark:text-neutral-100 shadow-2xl space-y-6" role="dialog" aria-modal="true" aria-labelledby="failure-controls-title">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 id="failure-controls-title" className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">
              Failure controls
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Inject deterministic failure conditions and tune runtime safety parameters
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close failure controls"
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Policy & Enforcement Mode */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Policy Engine Mode
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => updateConfig({ enforcementMode: 'enforce' })}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                config.enforcementMode === 'enforce'
                  ? 'bg-neutral-900 dark:bg-neutral-800 text-white border-neutral-900 dark:border-neutral-600 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Enforce (Active)</span>
              </div>
              <p className="text-xs opacity-80 mt-1 leading-snug">
                Actions violating policy are actively staged, sanitized, or denied.
              </p>
            </button>

            <button
              onClick={() => updateConfig({ enforcementMode: 'observe' })}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                config.enforcementMode === 'observe'
                  ? 'bg-amber-600 dark:bg-amber-700 text-white border-amber-600 dark:border-amber-600 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Radio className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                <span>Observe-Only (Shadow)</span>
              </div>
              <p className="text-xs opacity-80 mt-1 leading-snug">
                Telemetry logged without blocking. Never claims prevention badge.
              </p>
            </button>
          </div>
        </div>

        {/* Section 2: Failure Injections */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Failure Mode Injections (Adversarial & Transport)</span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Security Scanner Failure (Offline / Timeout)
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Forces fail-closed policy hold on consequential actions
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.scannerDown}
                onChange={(e) => updateConfig({ scannerDown: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Destination Timeout Post-Commit (Outcome Unknown)
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Simulates packet drop after commit dispatch; forbids blind retry
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.destinationTimeout}
                onChange={(e) => updateConfig({ destinationTimeout: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Duplicate Delivery Replay Attack
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Replays identical idempotency key to test destination rejection
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.duplicateDelivery}
                onChange={(e) => updateConfig({ duplicateDelivery: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Mid-Flight IAM Credential Revocation
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Destination rejects dispatch due to invalidated cryptographic key
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.revokedCredential}
                onChange={(e) => updateConfig({ revokedCredential: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Expired Approval Token (TTL Elapsed)
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Forces time-to-live expiration check failure during authorization
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.expiredApproval}
                onChange={(e) => updateConfig({ expiredApproval: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Safety Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div>
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
              Scanner Fail-Safety
            </label>
            <select
              value={config.failClosedOnScannerFailure ? 'closed' : 'open'}
              onChange={(e) => updateConfig({ failClosedOnScannerFailure: e.target.value === 'closed' })}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            >
              <option value="closed">Fail-Closed (Hold all critical actions)</option>
              <option value="open">Fail-Open (Low-impact actions only)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
              Inspection Depth
            </label>
            <select
              value={config.inspectionDepth}
              onChange={(e) => updateConfig({ inspectionDepth: e.target.value as any })}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            >
              <option value="thorough">Thorough (Recursive nested decode + OCR check)</option>
              <option value="fast">Fast (Top-level pattern scan)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
