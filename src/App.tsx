import React, { useEffect, useRef, useState } from 'react';
import { HoldpointProvider, useHoldpoint } from './engine/store';
import { ThemeProvider, useTheme } from './engine/theme';
import { TopBar } from './components/TopBar';
import { HonestyBanner } from './components/HonestyBanner';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { ConfigModal } from './components/ConfigModal';
import { ProtectionHome } from './components/ProtectionHome';
import { AgentWorkspace } from './components/AgentWorkspace';
import { ApprovalInbox } from './components/ApprovalInbox';
import { TimelineView } from './components/TimelineView';
import { CoverageView } from './components/CoverageView';
import { RecoveryWorkspace } from './components/RecoveryWorkspace';
import { PolicyStudio } from './components/PolicyStudio';
import { EvidenceAuditView } from './components/EvidenceAuditView';
import { DestinationInspector } from './components/DestinationInspector';
import { ScenarioRunner } from './components/ScenarioRunner';
import { MultiUserView } from './components/MultiUserView';
import { DossierSpecView } from './components/DossierSpecView';
import { LandingPageView } from './components/LandingPageView';
import { ShieldAlert, X } from 'lucide-react';
import './components/control-room.css';
import './components/control-room-next.css';

const AppContent: React.FC = () => {
  const { activeScreen, mode, triggerKillSwitch, actionsList } = useHoldpoint();
  const { resolvedMode, palette } = useTheme();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isKillModalOpen, setIsKillModalOpen] = useState(false);
  const [killNotice, setKillNotice] = useState<string | null>(null);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeScreen]);

  const handleConfirmKillSwitch = () => {
    // Find latest active parent action or trigger global halt
    const parent = actionsList.find(a => !a.contract.parentActionId);
    const parentId = parent ? parent.contract.actionId : 'global-halt-tree';
    const res = triggerKillSwitch(parentId);
    setKillNotice(`EMERGENCY KILL SWITCH: Cancelled ${res.cancelledCount} queued actions. In-flight operations safely reconciled.`);
    setIsKillModalOpen(false);
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'protection':
        return <ProtectionHome />;
      case 'workspace':
        return <AgentWorkspace />;
      case 'approvals':
        return <ApprovalInbox />;
      case 'timeline':
        return <TimelineView />;
      case 'routes':
        return <CoverageView />;
      case 'recovery':
        return <RecoveryWorkspace />;
      case 'policy':
        return <PolicyStudio />;
      case 'evidence':
        return <EvidenceAuditView />;
      case 'destinations':
        return <DestinationInspector />;
      case 'scenarios':
        return <ScenarioRunner />;
      case 'landing':
        return <LandingPageView />;
      case 'multiuser':
        return <MultiUserView />;
      case 'dossier':
        return <DossierSpecView />;
      default:
        return <LandingPageView />;
    }
  };

  if (activeScreen === 'landing') {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-[#e4e4e7]">
        <LandingPageView />
      </div>
    );
  }

  return (
    <div data-ui-theme={resolvedMode === 'light' ? palette === 'glacier' ? 'glacier' : palette === 'sandstone' ? 'sandstone' : 'canvas' : palette === 'cobalt' ? 'nocturne' : palette === 'aubergine' ? 'aubergine' : 'graphite'} className={`control-room-shell ${mode === 'consumer' ? 'is-consumer' : 'is-enterprise'}`}>
      <TopBar onTriggerEmergencyKill={() => setIsKillModalOpen(true)} />
      <div className="cr-main-column">
        <WorkspaceToolbar />
        <HonestyBanner onOpenConfig={() => setIsConfigOpen(true)} />
        {killNotice && (
          <div className="cr-kill-notice" role="alert"><ShieldAlert className="size-4 shrink-0" /><span>{killNotice}</span><button type="button" onClick={() => setKillNotice(null)} aria-label="Dismiss notification"><X className="size-4" /></button></div>
        )}
        <main id="control-room-content" ref={contentRef} data-screen={activeScreen} className="cr-content" tabIndex={-1}>{renderActiveScreen()}</main>
      </div>

      {/* Config & Failure Injection Modal */}
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      {/* Emergency Kill Switch Modal */}
      {isKillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-md w-full p-6 text-neutral-200 shadow-2xl space-y-4" role="dialog" aria-modal="true" aria-labelledby="emergency-halt-title">
            <div className="flex items-center gap-3 text-rose-500">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h2 id="emergency-halt-title" className="text-base font-bold text-white">Trigger Emergency Kill Switch?</h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              This will immediately drain queued child agent tasks, stop pending dispatches, and reconcile any in-flight actions honestly against destination state.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsKillModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmKillSwitch}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Halt Execution Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <HoldpointProvider>
        <AppContent />
      </HoldpointProvider>
    </ThemeProvider>
  );
}
