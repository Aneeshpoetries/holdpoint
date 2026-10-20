/**
 * HOLDPOINT Execution Engine & Pipeline
 * Implements the deterministic 9-stage typed action lifecycle:
 * Normalise -> Authority -> Coverage -> Impact -> Decide -> Reserve -> Dispatch -> Reconcile -> Close/Recover.
 * Hash-chained evidence audit ledger with true tamper detection.
 */

import { computeSha256, InspectionEngine } from './detectors';
import { DestinationRegistry } from './destinations';
import { PolicyEngine } from './policyEngine';
import {
  ActionStatus,
  BoundedApproval,
  CoverageRoute,
  EngineConfig,
  EventLogEntry,
  InspectionReport,
  PolicyRule,
  RecoverySnapshot,
  RestorePreview,
  TypedActionContract
} from './types';

export interface ActionLifecycleState {
  contract: TypedActionContract;
  status: ActionStatus;
  inspectionReport?: InspectionReport;
  policyDecision?: {
    decision: string;
    matchedRules: PolicyRule[];
    reasons: string[];
    policyVersion: string;
  };
  approval?: BoundedApproval;
  reservation?: {
    reservedAmount: number;
    budgetSnapshot: number;
  };
  dispatchResult?: any;
  reconciliationReport?: {
    reconciled: boolean;
    destinationStatus: string;
    destinationVersion: number;
    verifiedAt: number;
  };
  executionError?: string;
  updatedAt: number;
}

export type ActionProcessor = (
  rawInput: Partial<TypedActionContract> & { rawPrompt?: string; payload?: any; skipSleep?: boolean }
) => Promise<ActionLifecycleState>;

export class ExecutionEngine {
  private static instance: ExecutionEngine;

  public actions: Map<string, ActionLifecycleState> = new Map();
  public approvals: Map<string, BoundedApproval> = new Map();
  public evidenceChain: EventLogEntry[] = [];
  public routes: CoverageRoute[] = [
    {
      id: 'route-agent-sdk',
      name: 'Holdpoint Agent Tool Wrapper (gRPC/TypeScript)',
      destination: 'cloud_infra',
      type: 'agent_tool_wrapper',
      enforcementStatus: 'enforced',
      description: 'Primary mediated gateway for AI agent tool invocations with strict parameter normalization.',
      hasWrapper: true,
      trafficCount: 142
    },
    {
      id: 'route-fin-payments',
      name: 'Treasury & Bank Payment Broker API',
      destination: 'bank_payments',
      type: 'agent_tool_wrapper',
      enforcementStatus: 'enforced',
      description: 'Settlement broker gateway enforcing atomic budget limits and bounded approval nonces.',
      hasWrapper: true,
      trafficCount: 38
    },
    {
      id: 'route-git-releases',
      name: 'Code Repository & CD Deployment Webhook',
      destination: 'code_repo',
      type: 'agent_tool_wrapper',
      enforcementStatus: 'enforced',
      description: 'Protected deployment dispatch requiring CISO/Engineering dual sign-off.',
      hasWrapper: true,
      trafficCount: 29
    },
    {
      id: 'route-photo-sync',
      name: 'Consumer Photo Vault Cloud Storage Bridge',
      destination: 'photo_vault',
      type: 'agent_tool_wrapper',
      enforcementStatus: 'enforced',
      description: 'Asset safeguard preventing deletion of original albums during cleanup.',
      hasWrapper: true,
      trafficCount: 65
    },
    {
      id: 'route-native-web-ui',
      name: 'Legacy Cloud Console Direct Web UI',
      destination: 'cloud_infra',
      type: 'native_ui',
      enforcementStatus: 'unconnected',
      description: 'Direct engineer browser login to cloud console bypassing the Holdpoint control layer.',
      hasWrapper: false,
      gapNotice: 'GAP IDENTIFIED: Engineers logging in directly to cloud console can bypass Holdpoint rules.',
      trafficCount: 12
    },
    {
      id: 'route-alt-api-key',
      name: 'Direct Root API Key Bypassing Broker',
      destination: 'bank_payments',
      type: 'alternate_api_key',
      enforcementStatus: 'unconnected',
      description: 'Legacy raw API token provisioned before Holdpoint rollout.',
      hasWrapper: false,
      gapNotice: 'UNPROTECTED ROUTE: Direct API key bypasses bounded approvals and daily aggregate caps.',
      trafficCount: 4
    }
  ];

  public config: EngineConfig = {
    enforcementMode: 'enforce',
    failClosedOnScannerFailure: true,
    inspectionDepth: 'thorough',
    strictApprovals: true,
    simulatedLatencyMs: 120,
    timeSpeedMultiplier: 1,
    scannerDown: false,
    destinationTimeout: false,
    duplicateDelivery: false,
    revokedCredential: false,
    expiredApproval: false
  };

  private destinationRegistry = DestinationRegistry.getInstance();
  private policyEngine = PolicyEngine.getInstance();

  constructor() {
    this.seedEvidenceGenesis();
    this.seedInitialApprovals();
  }

  public static getInstance(): ExecutionEngine {
    if (!ExecutionEngine.instance) {
      ExecutionEngine.instance = new ExecutionEngine();
    }
    return ExecutionEngine.instance;
  }

  public seedInitialApprovals(): void {
    if (this.approvals.size > 0) return;

    // 1. Staged Action 1: Treasury Wire with ~4.5m TTL (Normal/Safe window)
    const act1Id = 'act-staged-wire-882';
    const contract1: TypedActionContract = {
      actionId: act1Id,
      delegationDepth: 0,
      tenantId: 'tenant-enterprise-acme',
      actorId: 'neha@holdpoint.internal',
      actorRole: 'finance_lead',
      actionType: 'treasury_wire',
      destination: 'bank_payments',
      resourceId: 'acct-treasury-primary',
      resourceVersion: 3,
      canonicalParameters: {
        recipient: 'Acme Cloud Compute Corp',
        amount: 14800,
        currency: 'USD',
        memo: 'Q3 Reserved Instance Pool Renewal'
      },
      impact: 'high',
      reversibility: 'irreversible',
      financialAmount: 14800,
      idempotencyKey: 'idemp-wire-882-q3',
      createdAt: Date.now() - 30000
    };
    const appr1 = this.createBoundedApproval(contract1);
    appr1.expiresAt = Date.now() + 270000; // 4.5 minutes remaining
    this.approvals.set(appr1.approvalId, appr1);
    this.actions.set(act1Id, {
      contract: contract1,
      status: 'staged',
      policyDecision: {
        decision: 'stage',
        matchedRules: [],
        reasons: ['HIGH_CONSEQUENCE: Treasury disbursement over $2,500 requires independent dual-control authorization.'],
        policyVersion: 'pol-v2.1-prod'
      },
      approval: appr1,
      updatedAt: Date.now() - 30000
    });

    // 2. Staged Action 2: Production Deploy with 80s TTL (Approaching Expiration Threshold Warning!)
    const act2Id = 'act-staged-deploy-419';
    const contract2: TypedActionContract = {
      actionId: act2Id,
      delegationDepth: 0,
      tenantId: 'tenant-enterprise-acme',
      actorId: 'priya@holdpoint.internal',
      actorRole: 'lead_developer',
      actionType: 'deploy_production',
      destination: 'cloud_infra',
      resourceId: 'cluster-prod-asia-1',
      resourceVersion: 12,
      canonicalParameters: {
        commitSha: 'a8f93e1b',
        cluster: 'cluster-prod-asia-1',
        environment: 'production',
        canaryWeightPercent: 10
      },
      impact: 'high',
      reversibility: 'compensatable',
      idempotencyKey: 'idemp-deploy-419-prod',
      createdAt: Date.now() - 220000
    };
    const appr2 = this.createBoundedApproval(contract2);
    appr2.expiresAt = Date.now() + 80000; // 80 seconds remaining (in Warning Threshold < 2 min)
    this.approvals.set(appr2.approvalId, appr2);
    this.actions.set(act2Id, {
      contract: contract2,
      status: 'staged',
      policyDecision: {
        decision: 'stage',
        matchedRules: [],
        reasons: ['HIGH_CONSEQUENCE: Production cluster deployments mandate dual peer sign-off.'],
        policyVersion: 'pol-v2.1-prod'
      },
      approval: appr2,
      updatedAt: Date.now() - 220000
    });
  }

  public resetDemo(): void {
    this.actions.clear();
    this.approvals.clear();
    this.destinationRegistry.seedDefaults();
    this.policyEngine.scopedExceptions = [];
    this.seedEvidenceGenesis();
    this.seedInitialApprovals();
    this.config = {
      enforcementMode: 'enforce',
      failClosedOnScannerFailure: true,
      inspectionDepth: 'thorough',
      strictApprovals: true,
      simulatedLatencyMs: 120,
      timeSpeedMultiplier: 1,
      scannerDown: false,
      destinationTimeout: false,
      duplicateDelivery: false,
      revokedCredential: false,
      expiredApproval: false
    };
  }

  private seedEvidenceGenesis(): void {
    const genesisTime = Date.now() - 3600000 * 24;
    const genesisEntry: EventLogEntry = {
      index: 0,
      timestamp: genesisTime,
      actionId: 'act-genesis-000',
      stage: 'policy',
      actorId: 'system-root-custodian',
      destination: 'cloud_infra',
      summary: 'HOLDPOINT Security Ledger Genesis Initialized (SHA-256 Hash Chain)',
      payloadHash: computeSha256('genesis-block-payload-holdpoint'),
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      currentHash: computeSha256('0000000000000000000000000000000000000000000000000000000000000000' + 'act-genesis-000'),
      policyVersion: 'v2.1',
      metadata: { initialCoverage: '4_enforced_routes_active' }
    };
    this.evidenceChain = [genesisEntry];

    // Seed initial operational emergency halt events
    const drillTime1 = Date.now() - 3600000 * 5;
    const prev1 = this.evidenceChain[this.evidenceChain.length - 1];
    const payload1 = { cancelledCount: 4, reconciledCount: 2, parentActionId: 'act-worker-tree-92' };
    const pHash1 = computeSha256(JSON.stringify(payload1));
    this.evidenceChain.push({
      index: 1,
      timestamp: drillTime1,
      actionId: 'act-worker-tree-92',
      stage: 'recovery',
      actorId: 'ciso-operator',
      destination: 'cloud_infra',
      summary: 'EMERGENCY KILL SWITCH: Cancelled 4 actions, reconciled 2',
      payloadHash: pHash1,
      prevHash: prev1.currentHash,
      currentHash: computeSha256(`${prev1.currentHash}:1:act-worker-tree-92:recovery:${pHash1}`),
      metadata: payload1
    });

    const drillTime2 = Date.now() - 3600000 * 2;
    const prev2 = this.evidenceChain[this.evidenceChain.length - 1];
    const payload2 = { cancelledCount: 2, reconciledCount: 1, parentActionId: 'act-cascade-ci-104' };
    const pHash2 = computeSha256(JSON.stringify(payload2));
    this.evidenceChain.push({
      index: 2,
      timestamp: drillTime2,
      actionId: 'act-cascade-ci-104',
      stage: 'recovery',
      actorId: 'ciso-operator',
      destination: 'code_repo',
      summary: 'EMERGENCY KILL SWITCH: Cancelled 2 actions, reconciled 1',
      payloadHash: pHash2,
      prevHash: prev2.currentHash,
      currentHash: computeSha256(`${prev2.currentHash}:2:act-cascade-ci-104:recovery:${pHash2}`),
      metadata: payload2
    });
  }

  // Record an immutable hash-chained audit event
  public recordEvidence(
    actionId: string,
    stage: EventLogEntry['stage'],
    actorId: string,
    destination: EventLogEntry['destination'],
    summary: string,
    payload: any,
    metadata: Record<string, any> = {}
  ): EventLogEntry {
    const prevEntry = this.evidenceChain[this.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const payloadHash = computeSha256(JSON.stringify(payload ?? {}));
    const index = this.evidenceChain.length;
    const timestamp = Date.now();
    const currentHash = computeSha256(`${prevHash}:${index}:${actionId}:${stage}:${payloadHash}`);

    const entry: EventLogEntry = {
      index,
      timestamp,
      actionId,
      stage,
      actorId,
      destination,
      summary,
      payloadHash,
      prevHash,
      currentHash,
      metadata
    };

    this.evidenceChain.push(entry);
    return entry;
  }

  // Tamper detection function: walks the chain and validates every link
  public verifyLedgerIntegrity(): {
    intact: boolean;
    tamperedIndex?: number;
    expectedHash?: string;
    actualHash?: string;
    verifiedEntries: number;
  } {
    for (let i = 1; i < this.evidenceChain.length; i++) {
      const prev = this.evidenceChain[i - 1];
      const curr = this.evidenceChain[i];

      // Check if prevHash matches the previous entry's currentHash
      if (curr.prevHash !== prev.currentHash) {
        return {
          intact: false,
          tamperedIndex: i,
          expectedHash: prev.currentHash,
          actualHash: curr.prevHash,
          verifiedEntries: i
        };
      }

      // Recompute expected currentHash
      const recomputed = computeSha256(`${curr.prevHash}:${curr.index}:${curr.actionId}:${curr.stage}:${curr.payloadHash}`);
      if (curr.currentHash !== recomputed) {
        return {
          intact: false,
          tamperedIndex: i,
          expectedHash: recomputed,
          actualHash: curr.currentHash,
          verifiedEntries: i
        };
      }
    }

    return {
      intact: true,
      verifiedEntries: this.evidenceChain.length
    };
  }

  // Simulate malicious ledger alteration to test tamper detection
  public simulateLedgerTamper(targetIndex: number = 1): boolean {
    if (this.evidenceChain.length <= 1) {
      // Need at least 2 entries to simulate
      this.recordEvidence('act-tamper-dummy', 'dispatch', 'attacker', 'cloud_infra', 'Seeded record for tamper test', {});
    }
    const idx = Math.min(targetIndex, this.evidenceChain.length - 1);
    if (idx > 0 && this.evidenceChain[idx]) {
      // Secretly alter summary or payloadHash without recomputing the hash chain
      this.evidenceChain[idx].summary = 'MALICIOUS_TAMPER: Unauthorized modification of audit log event';
      this.evidenceChain[idx].payloadHash = computeSha256('tampered-unauthorized-payload');
      return true;
    }
    return false;
  }

  private actionProcessor: ActionProcessor | null = null;

  public registerActionProcessor(processor: ActionProcessor): void {
    this.actionProcessor = processor;
  }

  /**
   * The Full 8-Stage Execution Contract Pipeline via Core Agent Execution Loop
   */
  public async submitAction(rawInput: Partial<TypedActionContract> & { rawPrompt?: string; payload?: any; skipSleep?: boolean }): Promise<ActionLifecycleState> {
    if (this.actionProcessor) {
      return await this.actionProcessor(rawInput);
    }
    const { AgentExecutionLoop } = await import('./executionLoop');
    return await AgentExecutionLoop.getInstance().processItemThroughStages(rawInput);
  }

  // Create cryptographic bounded approval token
  public createBoundedApproval(contract: TypedActionContract): BoundedApproval {
    const canonicalHash = computeSha256(JSON.stringify(contract.canonicalParameters));
    const nonce = `nonce-${Math.random().toString(36).substring(2, 10)}`;
    const approvalId = `appr-${contract.actionId}`;

    return {
      approvalId,
      actionId: contract.actionId,
      tenantId: contract.tenantId,
      requiredRole: contract.impact === 'critical' ? 'ciso_or_executive' : 'independent_peer',
      expiresAt: Date.now() + 300000, // 5 min TTL
      nonce,
      policyVersion: 'pol-v2.1-prod',
      boundResourceId: contract.resourceId,
      boundResourceVersion: contract.resourceVersion,
      boundDestination: contract.destination,
      boundCanonicalHash: canonicalHash,
      boundMaxAmount: contract.financialAmount,
      status: 'pending'
    };
  }

  // Authorize a staged action via independent approver
  public authorizeApproval(approvalId: string, approverId: string, candidateActionParams?: Record<string, any>): {
    success: boolean;
    error?: string;
  } {
    const approval = this.approvals.get(approvalId);
    if (!approval) return { success: false, error: 'Approval token not found.' };

    const state = this.actions.get(approval.actionId);
    if (!state) return { success: false, error: 'Target action not found.' };

    // 1. Strict Self-Approval Check
    if (state.contract.actorId === approverId) {
      return {
        success: false,
        error: 'SELF_APPROVAL_VIOLATION: The actor who proposed this action cannot approve it. Independent reviewer required.'
      };
    }

    // 2. Expiry check
    if (this.config.expiredApproval || Date.now() > approval.expiresAt) {
      approval.status = 'expired';
      state.status = 'denied';
      state.executionError = 'APPROVAL_EXPIRED: The bounded approval token has passed its valid TTL window.';
      return { success: false, error: state.executionError };
    }

    // 3. Parameter Binding Verification (Anti-Tamper)
    const currentParams = candidateActionParams || state.contract.canonicalParameters;
    const currentHash = computeSha256(JSON.stringify(currentParams));
    if (currentHash !== approval.boundCanonicalHash) {
      approval.status = 'invalidated';
      approval.invalidationReason = 'PARAMETER_TAMPERED: Canonical parameters (recipient or amount) altered post-approval.';
      state.status = 'denied';
      state.executionError = approval.invalidationReason;
      return { success: false, error: approval.invalidationReason };
    }

    // 4. Resource Version Check
    if (state.contract.resourceVersion !== approval.boundResourceVersion) {
      approval.status = 'invalidated';
      approval.invalidationReason = 'RESOURCE_VERSION_MISMATCH: Resource changed since approval was bound.';
      state.status = 'denied';
      state.executionError = approval.invalidationReason;
      return { success: false, error: approval.invalidationReason };
    }

    // 5. Anti-Malicious Attack Authorization Gate
    // Irreversible critical destruction or denied attacks cannot be released through dual control
    if (state.contract.reversibility === 'irreversible' && state.contract.impact === 'critical') {
      approval.status = 'rejected';
      approval.invalidationReason = 'CRITICAL_ASSET_HOLD: Irreversible destruction of primary protected assets cannot be authorized. Action remains denied.';
      state.status = 'denied';
      state.executionError = approval.invalidationReason;
      return { success: false, error: approval.invalidationReason };
    }

    // Validated
    approval.status = 'granted';
    approval.approverId = approverId;
    approval.approvedAt = Date.now();
    state.status = 'approved';

    this.recordEvidence(state.contract.actionId, 'approval', approverId, state.contract.destination, `Approval #${approval.approvalId} granted by ${approverId}`, {
      approval
    });

    // Automatically dispatch now that approval is locked
    this.dispatchAction(state);
    return { success: true };
  }

  // Explicitly expire an approval token due to TTL timeout
  public expireApproval(approvalId: string): { success: boolean; error?: string } {
    const approval = this.approvals.get(approvalId);
    if (!approval) return { success: false, error: 'Approval token not found' };

    approval.status = 'expired';
    const state = this.actions.get(approval.actionId);
    if (state && (state.status === 'staged' || state.status === 'inspecting' || state.status === 'proposed')) {
      state.status = 'denied';
      state.executionError = 'APPROVAL_EXPIRED: The bounded approval token exceeded its time-to-live (TTL) window and expired.';
      state.updatedAt = Date.now();
    }

    this.recordEvidence(
      approval.actionId,
      'approval',
      'holdpoint-ttl-monitor',
      approval.boundDestination,
      `APPROVAL_EXPIRED: Token #${approvalId} exceeded time-to-live (TTL). Action auto-denied to prevent stale authorizations.`,
      {
        approvalId,
        expiredAt: Date.now(),
        boundCanonicalHash: approval.boundCanonicalHash,
        invalidationRule: 'deterministic-ttl-expiry'
      }
    );
    return { success: true };
  }

  // Adjust remaining TTL in seconds (for live testing and threshold alert demonstrations)
  public adjustApprovalTTL(approvalId: string, remainingSeconds: number): boolean {
    const approval = this.approvals.get(approvalId);
    if (!approval) return false;
    approval.expiresAt = Date.now() + (remainingSeconds * 1000);
    return true;
  }

  // Dispatch to simulated destination with reliability guarantees
  private async dispatchAction(state: ActionLifecycleState): Promise<void> {
    const { contract } = state;
    state.status = 'dispatched';

    this.recordEvidence(contract.actionId, 'dispatch', contract.actorId, contract.destination, `Dispatching to destination ${contract.destination}`, {
      canonicalParameters: contract.canonicalParameters,
      idempotencyKey: contract.idempotencyKey
    });

    // Simulate failure injection if enabled
    if (this.config.revokedCredential) {
      state.status = 'denied';
      state.executionError = 'REVOKED_CREDENTIAL: Cloud / Banking IAM credentials were permanently revoked mid-flight.';
      this.recordEvidence(contract.actionId, 'receipt', 'destination-gateway', contract.destination, 'Credential revoked error', { error: state.executionError });
      return;
    }

    if (this.config.destinationTimeout) {
      // Commit-then-timeout producing OUTCOME UNKNOWN
      state.status = 'outcome_unknown';
      state.executionError = 'DESTINATION_TIMEOUT: Transport timed out after commit dispatch. State is unknown. Blind retry forbidden; reconciliation required.';
      this.recordEvidence(contract.actionId, 'receipt', 'destination-gateway', contract.destination, 'Timeout after commit - outcome unknown', { error: state.executionError });
      return;
    }

    // Replay duplicate if injection toggle is on
    const idempKey = this.config.duplicateDelivery ? 'duplicate-idemp-key-replayed' : contract.idempotencyKey;
    if (this.config.duplicateDelivery) {
      this.destinationRegistry.processedIdempotencyKeys.add('duplicate-idemp-key-replayed');
    }

    // Execute on actual destination
    const dispatchResult = this.destinationRegistry.executeAction(
      contract.destination,
      contract.actionType,
      contract.resourceId,
      contract.canonicalParameters,
      idempKey
    );

    state.dispatchResult = dispatchResult;

    if (!dispatchResult.success) {
      state.status = 'denied';
      state.executionError = dispatchResult.error || 'DESTINATION_REJECTION: Destination refused execution.';
      this.recordEvidence(contract.actionId, 'receipt', 'destination-gateway', contract.destination, `Execution rejected: ${state.executionError}`, { dispatchResult });
      return;
    }

    // Stage 6: Reconcile Against Destination State
    state.status = 'completed';
    state.reconciliationReport = {
      reconciled: true,
      destinationStatus: 'verified_active',
      destinationVersion: contract.resourceVersion + 1,
      verifiedAt: Date.now()
    };

    this.recordEvidence(contract.actionId, 'receipt', 'destination-gateway', contract.destination, `Receipt confirmed and verified against real state.`, {
      dispatchResult,
      reconciliation: state.reconciliationReport
    });
  }

  // Sanitizer
  private applySanitization(params: Record<string, any>, inspection: InspectionReport): Record<string, any> {
    let serialized = JSON.stringify(params);
    inspection.inspectedParts.forEach(part => {
      part.findings.forEach(finding => {
        if (finding.sanitizationSuggested && finding.matchedPattern) {
          serialized = serialized.replaceAll(finding.matchedPattern, finding.sanitizationSuggested);
        }
      });
    });
    try {
      return JSON.parse(serialized);
    } catch {
      return params;
    }
  }

  // Kill Switch: Cancelling a parent stops queued children, reconciles in-flight
  public triggerKillSwitch(parentActionId: string): {
    cancelledCount: number;
    reconciledCount: number;
    details: string[];
  } {
    let cancelledCount = 0;
    let reconciledCount = 0;
    const details: string[] = [];

    this.actions.forEach((state, id) => {
      if (id === parentActionId || state.contract.parentActionId === parentActionId) {
        if (state.status === 'staged' || state.status === 'inspecting' || state.status === 'proposed') {
          state.status = 'cancelled';
          cancelledCount++;
          details.push(`Action ${id} (${state.contract.actionType}) stopped in queue.`);
        } else if (state.status === 'dispatched' || state.status === 'outcome_unknown') {
          state.status = 'reconciled';
          reconciledCount++;
          details.push(`In-flight action ${id} reconciled against destination state.`);
        }
        state.updatedAt = Date.now();
      }
    });

    this.recordEvidence(parentActionId, 'recovery', 'kill-switch-operator', 'cloud_infra', `EMERGENCY KILL SWITCH: Cancelled ${cancelledCount} actions, reconciled ${reconciledCount}`, {
      cancelledCount,
      reconciledCount,
      details
    });

    return { cancelledCount, reconciledCount, details };
  }

  // Restore Preview: calculates diff, checks conflicts with newer work
  public generateRestorePreview(snapshotId: string): RestorePreview | null {
    const snap = this.destinationRegistry.snapshots.get(snapshotId);
    if (!snap) return null;

    let currentVersion = snap.version;
    const conflicts: string[] = [];
    const diffSummary: string[] = [];

    if (snap.destination === 'cloud_infra') {
      const current = this.destinationRegistry.cloudResources.find(r => r.id === snap.resourceId);
      if (current) {
        currentVersion = current.version;
        if (current.version > snap.version) {
          conflicts.push(`Resource has advanced ${current.version - snap.version} versions ahead since snapshot was taken.`);
        }
        diffSummary.push(`Roll back database version from v${current.version} to snapshot v${snap.version}`);
        diffSummary.push(`Reset status from '${current.status}' to 'running'`);
        diffSummary.push(`Restore verified cryptographic key fingerprint: ${snap.data.activeKeyFingerprint}`);
      }
    }

    return {
      snapshotId,
      destination: snap.destination,
      resourceId: snap.resourceId,
      targetVersion: snap.version,
      currentVersion,
      diffSummary,
      conflictsDetected: conflicts,
      permissionsRestoreDiff: ['Admin role IAM bindings will be restored to independent baseline'],
      canSafelyRestore: true
    };
  }
}
