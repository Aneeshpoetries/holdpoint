import React from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useHoldpoint } from '../engine/store';

export const HonestyBanner: React.FC<{ onOpenConfig: () => void }> = ({ onOpenConfig }) => {
  const { config, resetAll } = useHoldpoint();
  const injections = [
    config.scannerDown && 'Scanner offline',
    config.destinationTimeout && 'Destination timeout',
    config.duplicateDelivery && 'Duplicate delivery',
    config.revokedCredential && 'Credential revoked',
    config.expiredApproval && 'Approval expired',
    config.enforcementMode === 'observe' && 'Observe-only mode',
  ].filter(Boolean);

  return (
    <div className={`cr-system-strip ${injections.length ? 'has-injections' : ''}`} role="status">
      <div className="cr-system-message"><span className="cr-live-dot" /><strong>LOCAL SIMULATION</strong><span className="cr-system-divider" /><span>In-memory pipeline · No external actions</span>{injections.length > 0 && <em>{injections.length} fault {injections.length === 1 ? 'injection' : 'injections'} active</em>}</div>
      <div className="cr-system-actions">
        <button type="button" onClick={onOpenConfig}><SlidersHorizontal size={14} strokeWidth={1.5} /> Failure controls</button>
        <button type="button" onClick={resetAll} title="Reset in-memory engine and destination state"><RotateCcw size={14} strokeWidth={1.5} /> Reset simulation</button>
      </div>
    </div>
  );
};
