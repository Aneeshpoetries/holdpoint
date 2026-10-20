/**
 * HOLDPOINT Global State & React Context
 * Connects the deterministic engine, simulated destinations,
 * live persona switching, real-time agent loop, and failure injection toggles.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DestinationRegistry } from './destinations';
import { ActionLifecycleState, ExecutionEngine } from './executionEngine';
import { AgentExecutionLoop, StageTransitionEvent, PipelineStageName } from './executionLoop';
import { CONSUMER_PERSONAS, ENTERPRISE_EMPLOYEES } from './personas';
import { PolicyEngine } from './policyEngine';
import { ACCEPTANCE_SCENARIOS, runAcceptanceScenario } from './scenarios';
import { aiChatHandler } from './chat';
import {
  AcceptanceScenario,
  BoundedApproval,
  CoverageRoute,
  DestinationId,
  DraftActionContract,
  EngineConfig,
  EventLogEntry,
  PersonaProfile,
  PolicyRule,
  RecoverySnapshot,
  RestorePreview,
  SystemMode,
  TypedActionContract
} from './types';

export type ScreenType =
  | 'landing'
  | 'protection'
  | 'workspace'
  | 'approvals'
  | 'timeline'
  | 'routes'
  | 'recovery'
  | 'policy'
  | 'evidence'
  | 'destinations'
  | 'scenarios'
  | 'multiuser'
  | 'dossier';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'holdpoint';
  text: string;
  timestamp: number;
  actionId?: string;
  actionStatus?: string;
  actionType?: string;
  decisionReason?: string;
  isHarmfulAttempt?: boolean;
  draftContract?: DraftActionContract;
}

export interface ScenarioRunResult {
  scenarioId: string;
  title: string;
  harmfulPassed: boolean;
  harmfulStatus: string;
  controlPassed: boolean;
  controlStatus: string;
  details: string;
}

interface HoldpointContextType {
  mode: SystemMode;
  setMode: (mode: SystemMode) => void;
  currentPersona: PersonaProfile;
  setPersonaId: (id: string) => void;
  personas: PersonaProfile[];
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;

  // Real engine states
  actionsList: ActionLifecycleState[];
  pendingApprovals: BoundedApproval[];
  evidenceList: EventLogEntry[];
  routesList: CoverageRoute[];
  policyRules: PolicyRule[];
  destinations: DestinationRegistry;
  config: EngineConfig;
  updateConfig: (patch: Partial<EngineConfig>) => void;

  // Chat & Agent interaction
  chatHistory: Record<string, ChatMessage[]>;
  lastDraftContract: DraftActionContract | null;
  createDraftAction: (prompt: string, presetScenarioId?: string) => Promise<DraftActionContract>;
  validateAndPromoteDraft: (draft: DraftActionContract) => Promise<{ success: boolean; state?: ActionLifecycleState; error?: string }>;
  rejectDraft: (draftId: string) => void;
  sendAgentTask: (prompt: string, presetScenarioId?: string) => Promise<void>;
  clearPersonaChat: (personaId: string) => void;
  syncWithServer: () => Promise<void>;

  // Approvals
  approveAction: (approvalId: string, approverId: string, tamperedParams?: Record<string, any>) => { success: boolean; error?: string };
  rejectApproval: (approvalId: string) => void;
  expireApproval: (approvalId: string) => { success: boolean; error?: string };
  adjustApprovalTTL: (approvalId: string, remainingSeconds: number) => void;
  seedTestStagedAction: (type?: 'finance' | 'deploy' | 'recovery') => void;

  // Kill Switch
  triggerKillSwitch: (parentActionId: string) => { cancelledCount: number; reconciledCount: number; details: string[] };

  // Recovery
  snapshots: RecoverySnapshot[];
  generateRestorePreview: (snapshotId: string) => RestorePreview | null;
  executeRestoreDrill: (snapshotId: string) => any;

  // Policy Studio
  addDraftRule: (rule: Omit<PolicyRule, 'id'>) => { success: boolean; error?: string };
  toggleRule: (ruleId: string) => void;

  // Evidence
  verifyLedger: () => { intact: boolean; tamperedIndex?: number; verifiedEntries: number };
  simulateTamper: () => void;

  // Scenario Runner
  scenarioResults: Record<string, ScenarioRunResult>;
  isRunningScenarios: boolean;
  runScenarioById: (scenarioId: string) => Promise<void>;
  runAllScenarios: () => Promise<void>;

  // Core Agent Execution Loop
  isLoopRunning: boolean;
  loopTickRate: number;
  currentStageEvent: StageTransitionEvent | null;
  pendingQueueLength: number;
  pauseLoop: () => void;
  resumeLoop: () => void;
  stepLoop: () => Promise<void>;
  setLoopTickRate: (ms: number) => void;
  enqueueAction: (rawInput: any) => string;

  // System
  resetAll: () => void;
  tickCounter: number;
}

const HoldpointContext = createContext<HoldpointContextType | null>(null);

export const HoldpointProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SystemMode>('consumer');
  const [currentPersonaId, setCurrentPersonaId] = useState<string>('aisha');
  const [activeScreen, setActiveScreen] = useState<ScreenType>('landing');
  const [tickCounter, setTickCounter] = useState(0);

  const engine = ExecutionEngine.getInstance();
  const loop = AgentExecutionLoop.getInstance();
  const policyEngine = PolicyEngine.getInstance();
  const destinations = DestinationRegistry.getInstance();

  const [config, setConfig] = useState<EngineConfig>({ ...engine.config });
  const [actionsList, setActionsList] = useState<ActionLifecycleState[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<BoundedApproval[]>([]);
  const [evidenceList, setEvidenceList] = useState<EventLogEntry[]>([]);
  const [routesList, setRoutesList] = useState<CoverageRoute[]>([...engine.routes]);
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>([...policyEngine.rules]);
  const [scenarioResults, setScenarioResults] = useState<Record<string, ScenarioRunResult>>({});
  const [isRunningScenarios, setIsRunningScenarios] = useState(false);

  // Execution loop states
  const [isLoopRunning, setIsLoopRunning] = useState<boolean>(loop.isRunning);
  const [loopTickRate, setLoopTickRateState] = useState<number>(loop.tickRateMs);
  const [currentStageEvent, setCurrentStageEvent] = useState<StageTransitionEvent | null>(null);
  const [pendingQueueLength, setPendingQueueLength] = useState<number>(loop.pendingQueue.length);
  const [lastDraftContract, setLastDraftContract] = useState<DraftActionContract | null>(null);

  // Chat message state per persona with localStorage memory persistence
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('holdpoint_chat_memory_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed reading chat history from storage:', e);
    }
    return {
      aisha: [
        {
          id: 'msg-seed-1',
          sender: 'holdpoint',
          text: 'HOLDPOINT Photo Shield active: 14,000 photos indexed. Originals protected against bulk destruction. 1,240 duplicates ready for safe pruning.',
          timestamp: Date.now() - 3600000
        }
      ],
      dev: [
        {
          id: 'msg-seed-dev',
          sender: 'holdpoint',
          text: 'HOLDPOINT Identity Broker active: 2FA protection enforced. Out-of-band dual verification required for recovery credential alterations.',
          timestamp: Date.now() - 3600000
        }
      ],
      priya: [
        {
          id: 'msg-seed-2',
          sender: 'holdpoint',
          text: 'HOLDPOINT CI/CD Gate active on holdpoint-core-v2. Production deployments require CISO/Engineering dual sign-off.',
          timestamp: Date.now() - 3600000
        }
      ],
      neha: [
        {
          id: 'msg-seed-3',
          sender: 'holdpoint',
          text: 'HOLDPOINT Treasury Broker active. Daily cap: $25,000. Single-actor threshold: $2,500.',
          timestamp: Date.now() - 3600000
        }
      ]
    };
  });

  // Sync chat memory to localStorage on updates
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('holdpoint_chat_memory_v2', JSON.stringify(chatHistory));
      }
    } catch (e) {
      // ignore storage quota error
    }
  }, [chatHistory]);

  const personas = mode === 'consumer' ? CONSUMER_PERSONAS : ENTERPRISE_EMPLOYEES;
  const currentPersona = personas.find(p => p.id === currentPersonaId) || personas[0];

  // Refresh view state from engine
  const syncState = () => {
    setActionsList(Array.from(engine.actions.values()).reverse());
    setPendingApprovals(Array.from(engine.approvals.values()).filter(a => a.status === 'pending').reverse());
    setEvidenceList([...engine.evidenceChain].reverse());
    setRoutesList([...engine.routes]);
    setPolicyRules([...policyEngine.rules]);
    setTickCounter(prev => prev + 1);
  };

  // Switch mode
  const setMode = (newMode: SystemMode) => {
    setModeState(newMode);
    if (newMode === 'consumer') {
      setCurrentPersonaId('aisha');
    } else {
      setCurrentPersonaId('priya');
    }
  };

  const setPersonaId = (id: string) => {
    setCurrentPersonaId(id);
  };

  const updateConfig = (patch: Partial<EngineConfig>) => {
    const updated = { ...config, ...patch };
    engine.config = updated;
    setConfig(updated);
    syncState();
  };

  const resetAll = () => {
    engine.resetDemo();
    setScenarioResults({});
    setConfig({ ...engine.config });
    syncState();
  };

  const sendAgentTask = async (prompt: string, presetScenarioId?: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now().toString(36)}`,
      sender: 'user',
      text: prompt,
      timestamp: Date.now()
    };

    setChatHistory(prev => ({
      ...prev,
      [currentPersona.id]: [...(prev[currentPersona.id] || []), userMsg]
    }));

    // Prepare conversation memory history payload
    const currentHistory = chatHistory[currentPersona.id] || [];
    const historyPayload = currentHistory.map(m => ({
      sender: m.sender,
      text: m.text,
      actionType: m.actionType
    }));

    // Try backend API first
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: currentPersona.id,
          prompt,
          presetScenarioId,
          history: historyPayload
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const actionState = data.actionState;
        const draft: DraftActionContract | undefined = data.draftContract;
        if (draft) setLastDraftContract(draft);

        if (actionState && actionState.contract) {
          engine.actions.set(actionState.contract.actionId, actionState);
          if (actionState.approval) {
            engine.approvals.set(actionState.approval.approvalId, actionState.approval);
          }
        }

        const agentMsg: ChatMessage = {
          id: `agt-${Date.now().toString(36)}`,
          sender: 'holdpoint',
          text: data.reply,
          timestamp: Date.now(),
          actionId: actionState?.contract?.actionId,
          actionStatus: draft?.isInformational ? undefined : (actionState?.status || (draft?.validation.isValid ? 'proposed' : 'denied')),
          actionType: draft?.isInformational ? undefined : (actionState?.contract?.actionType || draft?.proposedContract.actionType),
          decisionReason: actionState?.policyDecision?.reasons?.[0] || actionState?.executionError || draft?.validation.errors[0],
          isHarmfulAttempt: Boolean(presetScenarioId || draft?.isHarmfulSuspect),
          draftContract: draft
        };

        setChatHistory(prev => ({
          ...prev,
          [currentPersona.id]: [...(prev[currentPersona.id] || []), agentMsg]
        }));
        syncState();
        return;
      }
    } catch (netErr) {
      // Fallback to local in-memory engine if server route is unavailable
      console.warn('Backend /api/chat unavailable, using local deterministic engine:', netErr);
    }

    // Process through AIChatHandler directly in-memory with multi-turn memory
    const chatResult = await aiChatHandler.processUserChat(
      prompt,
      currentPersona,
      presetScenarioId,
      historyPayload
    );
    setLastDraftContract(chatResult.draft);
    if (chatResult.queuedState?.contract) {
      engine.actions.set(chatResult.queuedState.contract.actionId, chatResult.queuedState);
      if (chatResult.queuedState.approval) {
        engine.approvals.set(chatResult.queuedState.approval.approvalId, chatResult.queuedState.approval);
      }
    }

    const agentMsg: ChatMessage = {
      id: `agt-${Date.now().toString(36)}`,
      sender: 'holdpoint',
      text: chatResult.chatResponse,
      timestamp: Date.now(),
      actionId: chatResult.queuedState?.contract.actionId,
      actionStatus: chatResult.draft.isInformational
        ? undefined
        : (chatResult.queuedState?.status || (chatResult.draft.validation.isValid ? 'proposed' : 'denied')),
      actionType: chatResult.draft.isInformational ? undefined : chatResult.draft.proposedContract.actionType,
      decisionReason:
        chatResult.queuedState?.policyDecision?.reasons?.[0] ||
        chatResult.queuedState?.executionError ||
        chatResult.draft.validation.errors[0],
      isHarmfulAttempt: chatResult.isHarmfulAttempt,
      draftContract: chatResult.draft
    };

    setChatHistory(prev => ({
      ...prev,
      [currentPersona.id]: [...(prev[currentPersona.id] || []), agentMsg]
    }));
    syncState();
  };

  const createDraftAction = async (prompt: string, presetScenarioId?: string): Promise<DraftActionContract> => {
    const historyPayload = (chatHistory[currentPersona.id] || []).map(m => ({
      sender: m.sender,
      text: m.text,
      actionType: m.actionType
    }));
    const { draft } = await aiChatHandler.generateDraftContract(prompt, currentPersona, {
      presetScenarioId,
      history: historyPayload
    });
    setLastDraftContract(draft);
    return draft;
  };

  const validateAndPromoteDraft = async (draft: DraftActionContract) => {
    let result = await aiChatHandler.promoteAndQueueDraft(draft);
    if (result.success && result.state) {
      engine.actions.set(result.state.contract.actionId, result.state);
      if (result.state.approval) {
        engine.approvals.set(result.state.approval.approvalId, result.state.approval);
      }
    }

    try {
      const resp = await fetch('/api/drafts/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.state) {
          result = data;
          engine.actions.set(data.state.contract.actionId, data.state);
          if (data.state.approval) {
            engine.approvals.set(data.state.approval.approvalId, data.state.approval);
          }
        }
      }
    } catch {}

    // Update chat history to reflect promoted action
    setChatHistory(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pId => {
        updated[pId] = updated[pId].map(msg => {
          if (msg.draftContract?.draftId === draft.draftId) {
            return {
              ...msg,
              actionId: result.state?.contract.actionId,
              actionStatus: result.state?.status || (result.success ? 'completed' : 'denied'),
              decisionReason: result.state?.policyDecision?.reasons?.[0] || result.error
            };
          }
          return msg;
        });
      });
      return updated;
    });

    syncState();
    return result;
  };

  const rejectDraft = (draftId: string) => {
    engine.recordEvidence(
      draftId,
      'intent',
      currentPersona.id,
      'user_identity',
      `Draft contract #${draftId} rejected and dismissed by user`,
      {}
    );

    setChatHistory(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pId => {
        updated[pId] = updated[pId].map(msg => {
          if (msg.draftContract?.draftId === draftId) {
            return {
              ...msg,
              actionStatus: 'draft_rejected',
              decisionReason: 'Draft proposal rejected and dismissed by user'
            };
          }
          return msg;
        });
      });
      return updated;
    });

    if (lastDraftContract?.draftId === draftId) {
      setLastDraftContract(null);
    }
    syncState();
  };

  const clearPersonaChat = (personaId: string) => {
    setChatHistory(prev => {
      const nextHistory = {
        ...prev,
        [personaId]: [
          {
            id: `msg-reset-${Date.now()}`,
            sender: 'holdpoint' as const,
            text: `Conversation memory reset for ${personas.find(p => p.id === personaId)?.agentName || 'Agent'}. Previous session context has been wiped clean.`,
            timestamp: Date.now()
          }
        ]
      };
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('holdpoint_chat_memory_v2', JSON.stringify(nextHistory));
        }
      } catch {}
      return nextHistory;
    });
  };

  const approveAction = (approvalId: string, approverId: string, tamperedParams?: Record<string, any>) => {
    const result = engine.authorizeApproval(approvalId, approverId, tamperedParams);

    fetch(`/api/approvals/${approvalId}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverId, tamperedParams })
    }).catch(() => {});

    const targetActionId = engine.approvals.get(approvalId)?.actionId;
    setChatHistory(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pId => {
        updated[pId] = updated[pId].map(msg => {
          if (msg.actionId && targetActionId && msg.actionId === targetActionId) {
            return {
              ...msg,
              actionStatus: result.success ? 'completed' : 'denied',
              decisionReason: result.success ? `Dual-control approved by ${approverId}` : (result.error || 'Approval rejected')
            };
          }
          return msg;
        });
      });
      return updated;
    });

    syncState();
    return result;
  };

  const rejectApproval = (approvalId: string) => {
    const appr = engine.approvals.get(approvalId);
    const targetActionId = appr?.actionId;
    if (appr) {
      appr.status = 'rejected';
      const act = engine.actions.get(appr.actionId);
      if (act) act.status = 'denied';
      engine.recordEvidence(appr.actionId, 'approval', currentPersona.id, appr.boundDestination, `Approval #${approvalId} rejected by user`, {});
    }

    fetch(`/api/approvals/${approvalId}/reject`, { method: 'POST' }).catch(() => {});

    setChatHistory(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pId => {
        updated[pId] = updated[pId].map(msg => {
          if (msg.actionId && targetActionId && msg.actionId === targetActionId) {
            return {
              ...msg,
              actionStatus: 'denied',
              decisionReason: `Dual-control rejected by ${currentPersona.name}`
            };
          }
          return msg;
        });
      });
      return updated;
    });

    syncState();
  };

  const expireApproval = (approvalId: string) => {
    const appr = engine.approvals.get(approvalId);
    const targetActionId = appr?.actionId;
    const result = engine.expireApproval(approvalId);

    fetch(`/api/approvals/${approvalId}/expire`, { method: 'POST' }).catch(() => {});

    setChatHistory(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pId => {
        updated[pId] = updated[pId].map(msg => {
          if (msg.actionId && targetActionId && msg.actionId === targetActionId) {
            return {
              ...msg,
              actionStatus: 'denied',
              decisionReason: 'TTL Expired: Approval token invalidated by deterministic time-to-live invariant'
            };
          }
          return msg;
        });
      });
      return updated;
    });

    syncState();
    return result;
  };

  const adjustApprovalTTL = (approvalId: string, remainingSeconds: number) => {
    engine.adjustApprovalTTL(approvalId, remainingSeconds);
    fetch(`/api/approvals/${approvalId}/adjust-ttl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remainingSeconds })
    }).catch(() => {});
    syncState();
  };

  const seedTestStagedAction = (type: 'finance' | 'deploy' | 'recovery' = 'finance') => {
    const id = `act-staged-${Date.now().toString(36)}`;
    const actionType = type === 'finance' ? 'treasury_wire' : type === 'deploy' ? 'deploy_production' : 'reset_recovery_factor';
    const destination: DestinationId = type === 'finance' ? 'bank_payments' : type === 'deploy' ? 'cloud_infra' : 'user_identity';
    const amount = type === 'finance' ? 18500 : undefined;
    const contract: TypedActionContract = {
      actionId: id,
      delegationDepth: 0,
      tenantId: 'tenant-enterprise-acme',
      actorId: 'neha@holdpoint.internal',
      actorRole: type === 'finance' ? 'finance_lead' : type === 'deploy' ? 'lead_developer' : 'security_admin',
      actionType,
      destination,
      resourceId: type === 'finance' ? 'acct-treasury-primary' : type === 'deploy' ? 'cluster-prod-asia-1' : 'user-auth-root',
      resourceVersion: 1,
      canonicalParameters: type === 'finance'
        ? { recipient: 'Apex Cloud Systems Corp', amount: 18500, memo: 'Quarterly Infrastructure SLA Reserve', currency: 'USD' }
        : type === 'deploy'
        ? { commitSha: '7f8c12a', cluster: 'cluster-prod-asia-1', environment: 'production', canaryWeightPercent: 15 }
        : { userEmail: 'admin@holdpoint.internal', resetChannel: 'hardware_token' },
      impact: 'high',
      reversibility: type === 'deploy' ? 'compensatable' : 'irreversible',
      financialAmount: amount,
      idempotencyKey: `idemp-${id}`,
      createdAt: Date.now()
    };

    const approval = engine.createBoundedApproval(contract);
    engine.approvals.set(approval.approvalId, approval);

    const state: ActionLifecycleState = {
      contract,
      status: 'staged',
      policyDecision: {
        decision: 'stage',
        matchedRules: [],
        reasons: ['HIGH_CONSEQUENCE: Independent dual-control review required before destination dispatch.'],
        policyVersion: 'pol-v2.1-prod'
      },
      approval,
      updatedAt: Date.now()
    };
    engine.actions.set(id, state);

    engine.recordEvidence(
      id,
      'approval',
      'holdpoint-broker',
      destination,
      `Dual-control approval token #${approval.approvalId} staged. 5-minute TTL countdown initiated.`,
      { approval }
    );

    syncState();
  };

  const triggerKillSwitch = (parentActionId: string) => {
    const result = engine.triggerKillSwitch(parentActionId);
    syncState();
    return result;
  };

  const generateRestorePreview = (snapshotId: string) => {
    return engine.generateRestorePreview(snapshotId);
  };

  const executeRestoreDrill = (snapshotId: string) => {
    const res = destinations.performRestoreDrill(snapshotId);
    engine.recordEvidence(
      `drill-${Date.now().toString(36)}`,
      'recovery',
      currentPersona.id,
      'cloud_infra',
      `Restore drill executed for snapshot ${snapshotId}. Key & IAM permissions verified.`,
      { result: res }
    );
    syncState();
    return res;
  };

  const addDraftRule = (rule: Omit<PolicyRule, 'id'>) => {
    const newId = `pol-custom-${Date.now().toString(36)}`;
    const fullRule: PolicyRule = { ...rule, id: newId };
    const conflict = policyEngine.checkRuleConflicts(fullRule);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.conflicts.join(' ') };
    }
    policyEngine.rules.push(fullRule);
    syncState();
    return { success: true };
  };

  const toggleRule = (ruleId: string) => {
    const rule = policyEngine.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      syncState();
    }
  };

  const verifyLedger = () => {
    return engine.verifyLedgerIntegrity();
  };

  const simulateTamper = () => {
    engine.simulateLedgerTamper(1);
    syncState();
  };

  // Run a single scenario
  const runScenarioById = async (scenarioId: string) => {
    const scen = ACCEPTANCE_SCENARIOS.find(s => s.id === scenarioId);
    if (!scen) return;

    const harmfulRes = await runAcceptanceScenario(scen, 'harmful');
    const controlRes = await runAcceptanceScenario(scen, 'control');

    setScenarioResults(prev => ({
      ...prev,
      [scenarioId]: {
        scenarioId,
        title: scen.title,
        harmfulPassed: harmfulRes.passed,
        harmfulStatus: harmfulRes.actualStatus,
        controlPassed: controlRes.passed,
        controlStatus: controlRes.actualStatus,
        details: harmfulRes.reasons[0] || 'Evaluated against destination state'
      }
    }));
    syncState();
  };

  // Run all 28 acceptance scenarios
  const runAllScenarios = async () => {
    setIsRunningScenarios(true);
    for (const scen of ACCEPTANCE_SCENARIOS) {
      const harmfulRes = await runAcceptanceScenario(scen, 'harmful');
      const controlRes = await runAcceptanceScenario(scen, 'control');
      setScenarioResults(prev => ({
        ...prev,
        [scen.id]: {
          scenarioId: scen.id,
          title: scen.title,
          harmfulPassed: harmfulRes.passed,
          harmfulStatus: harmfulRes.actualStatus,
          controlPassed: controlRes.passed,
          controlStatus: controlRes.actualStatus,
          details: harmfulRes.reasons[0] || 'Evaluated against destination state'
        }
      }));
    }
    setIsRunningScenarios(false);
    syncState();
  };

  const syncWithServer = async () => {
    try {
      const resp = await fetch('/api/actions');
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.actions)) {
          data.actions.forEach((act: ActionLifecycleState) => {
            if (act?.contract?.actionId) {
              engine.actions.set(act.contract.actionId, act);
              if (act.approval) {
                engine.approvals.set(act.approval.approvalId, act.approval);
              }
            }
          });
        }
        if (Array.isArray(data.pendingApprovals)) {
          data.pendingApprovals.forEach((appr: BoundedApproval) => {
            if (appr?.approvalId) {
              engine.approvals.set(appr.approvalId, appr);
            }
          });
        }
        syncState();
      }
    } catch {}
  };

  useEffect(() => {
    syncState();
    syncWithServer();
    const unsubLoop = loop.subscribe(() => {
      setIsLoopRunning(loop.isRunning);
      setPendingQueueLength(loop.pendingQueue.length);
      syncState();
    });
    const unsubStage = loop.subscribeStage((evt) => {
      setCurrentStageEvent(evt);
    });
    return () => {
      unsubLoop();
      unsubStage();
    };
  }, []);

  const pauseLoop = () => {
    loop.pause();
    setIsLoopRunning(false);
  };

  const resumeLoop = () => {
    loop.start();
    setIsLoopRunning(true);
  };

  const stepLoop = async () => {
    await loop.stepOne();
    syncState();
  };

  const setLoopTickRate = (ms: number) => {
    loop.setTickRate(ms);
    setLoopTickRateState(ms);
  };

  const enqueueAction = (rawInput: any) => {
    const id = loop.enqueue(rawInput);
    setPendingQueueLength(loop.pendingQueue.length);
    return id;
  };

  const snapshots = Array.from(destinations.snapshots.values());

  return (
    <HoldpointContext.Provider
      value={{
        mode,
        setMode,
        currentPersona,
        setPersonaId,
        personas,
        activeScreen,
        setActiveScreen,
        actionsList,
        pendingApprovals,
        evidenceList,
        routesList,
        policyRules,
        destinations,
        config,
        updateConfig,
        chatHistory,
        lastDraftContract,
        createDraftAction,
        validateAndPromoteDraft,
        rejectDraft,
        sendAgentTask,
        clearPersonaChat,
        syncWithServer,
        approveAction,
        rejectApproval,
        expireApproval,
        adjustApprovalTTL,
        seedTestStagedAction,
        triggerKillSwitch,
        snapshots,
        generateRestorePreview,
        executeRestoreDrill,
        addDraftRule,
        toggleRule,
        verifyLedger,
        simulateTamper,
        scenarioResults,
        isRunningScenarios,
        runScenarioById,
        runAllScenarios,
        isLoopRunning,
        loopTickRate,
        currentStageEvent,
        pendingQueueLength,
        pauseLoop,
        resumeLoop,
        stepLoop,
        setLoopTickRate,
        enqueueAction,
        resetAll,
        tickCounter
      }}
    >
      {children}
    </HoldpointContext.Provider>
  );
};

export const useHoldpoint = () => {
  const context = useContext(HoldpointContext);
  if (!context) throw new Error('useHoldpoint must be used within HoldpointProvider');
  return context;
};
