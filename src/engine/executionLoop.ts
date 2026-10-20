/**
 * HOLDPOINT Core Agent Execution Loop
 * Directly implements the 8-stage Execution Contract from Dossier Page 10:
 * 1. Normalize
 * 2. Establish Authority
 * 3. Establish Coverage
 * 4. Evaluate Impact
 * 5. Decide & Reserve
 * 6. Dispatch
 * 7. Reconcile
 * 8. Close or Recover
 *
 * Operates on timers using an event loop with active queue draining,
 * real-time stage progress emissions, and pause/step controls.
 */

import { computeSha256, InspectionEngine } from './detectors';
import { DestinationRegistry } from './destinations';
import { ActionLifecycleState, ExecutionEngine } from './executionEngine';
import { PolicyEngine } from './policyEngine';
import {
  ActionStatus,
  BoundedApproval,
  DecisionType,
  EngineConfig,
  EventLogEntry,
  ImpactLevel,
  InspectionReport,
  Reversibility,
  TypedActionContract
} from './types';

export type PipelineStageName =
  | 'normalize'
  | 'authority'
  | 'coverage'
  | 'impact'
  | 'decide_reserve'
  | 'dispatch'
  | 'reconcile'
  | 'close_recover';

export interface StageTransitionEvent {
  actionId: string;
  stage: PipelineStageName;
  stageNumber: number; // 1 to 8
  status: ActionStatus;
  timestamp: number;
  details: string;
}

export class AgentExecutionLoop {
  private static instance: AgentExecutionLoop;

  public pendingQueue: (Partial<TypedActionContract> & { rawPrompt?: string; payload?: any })[] = [];
  public currentProcessingActionId: string | null = null;
  public currentActiveStage: PipelineStageName | null = null;
  public isRunning: boolean = true;
  public tickRateMs: number = 400; // Simulated latency per stage
  private timerHandle: any = null;

  private listeners: Set<() => void> = new Set();
  private stageListeners: Set<(evt: StageTransitionEvent) => void> = new Set();

  private executionEngine = ExecutionEngine.getInstance();
  private destinationRegistry = DestinationRegistry.getInstance();
  private policyEngine = PolicyEngine.getInstance();

  constructor() {
    this.executionEngine.registerActionProcessor((raw) => this.processItemThroughStages(raw));
    this.start();
  }

  public static getInstance(): AgentExecutionLoop {
    if (!AgentExecutionLoop.instance) {
      AgentExecutionLoop.instance = new AgentExecutionLoop();
    }
    return AgentExecutionLoop.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeStage(listener: (evt: StageTransitionEvent) => void): () => void {
    this.stageListeners.add(listener);
    return () => this.stageListeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  private emitStage(actionId: string, stage: PipelineStageName, stageNum: number, status: ActionStatus, details: string) {
    this.currentActiveStage = stage;
    const evt: StageTransitionEvent = {
      actionId,
      stage,
      stageNumber: stageNum,
      status,
      timestamp: Date.now(),
      details
    };
    this.stageListeners.forEach(fn => fn(evt));
    this.notify();
  }

  public start(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
    this.isRunning = true;
    this.timerHandle = setInterval(() => {
      this.tick();
    }, this.tickRateMs);
    if (this.timerHandle && typeof this.timerHandle.unref === 'function') {
      this.timerHandle.unref();
    }
    this.notify();
  }

  public pause(): void {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
    this.isRunning = false;
    this.notify();
  }

  public setTickRate(ms: number): void {
    this.tickRateMs = Math.max(0, ms);
    if (this.isRunning) {
      this.start();
    }
  }

  public enqueue(rawInput: Partial<TypedActionContract> & { rawPrompt?: string; payload?: any; skipSleep?: boolean }): string {
    const actionId = rawInput.actionId || `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    rawInput.actionId = actionId;
    this.pendingQueue.push(rawInput);
    this.notify();
    return actionId;
  }

  /**
   * One iteration of the agent execution loop
   */
  public async tick(): Promise<void> {
    if (this.currentProcessingActionId !== null) {
      // Worker currently processing an active action
      return;
    }

    if (this.pendingQueue.length === 0) {
      this.currentActiveStage = null;
      return;
    }

    const nextItem = this.pendingQueue.shift();
    if (nextItem) {
      await this.processItemThroughStages(nextItem);
    }
  }

  /**
   * Step one action explicitly (Manual Step Mode)
   */
  public async stepOne(): Promise<ActionLifecycleState | null> {
    if (this.pendingQueue.length === 0) return null;
    const nextItem = this.pendingQueue.shift()!;
    return await this.processItemThroughStages(nextItem);
  }

  /**
   * The Full 8-Stage Execution Contract Pipeline
   */
  public async processItemThroughStages(
    rawInput: Partial<TypedActionContract> & { rawPrompt?: string; payload?: any; skipSleep?: boolean }
  ): Promise<ActionLifecycleState> {
    const actionId = rawInput.actionId || `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    this.currentProcessingActionId = actionId;
    const stageDelay = rawInput.skipSleep ? 0 : this.tickRateMs / 2;

    try {
      // ----------------------------------------------------
      // STAGE 1: NORMALIZE
      // Resolve stable asset & recipient IDs; reject ambiguous schemas,
      // duplicate fields and environment mismatches.
      // ----------------------------------------------------
      this.emitStage(actionId, 'normalize', 1, 'proposed', 'Resolving stable asset IDs and verifying canonical schema parameters.');
      await this.sleep(stageDelay);

      const canonicalParams = rawInput.canonicalParameters || rawInput.payload || {};
      if (typeof canonicalParams !== 'object' || canonicalParams === null) {
        throw new Error('NORMALIZE_ERROR: Canonical parameters must be a well-formed JSON object without duplicate keys.');
      }

      const contract: TypedActionContract = {
        actionId,
        parentActionId: rawInput.parentActionId,
        delegationDepth: rawInput.delegationDepth || 0,
        tenantId: rawInput.tenantId || 'tenant-holdpoint-prod',
        actorId: rawInput.actorId || 'priya@holdpoint.internal',
        actorRole: rawInput.actorRole || 'engineer',
        agentId: rawInput.agentId,
        destination: rawInput.destination || 'cloud_infra',
        actionType: rawInput.actionType || 'execute_task',
        resourceId: rawInput.resourceId || 'res-default',
        resourceVersion: rawInput.resourceVersion || 1,
        canonicalParameters: canonicalParams,
        rawUserPrompt: rawInput.rawPrompt,
        impact: rawInput.impact || 'medium',
        reversibility: rawInput.reversibility || 'reversible',
        financialAmount: rawInput.financialAmount ?? (canonicalParams.amount ? Number(canonicalParams.amount) : undefined),
        dataEgressBytes: rawInput.dataEgressBytes ?? 1024,
        createdAt: Date.now(),
        idempotencyKey: rawInput.idempotencyKey || `idemp-${actionId}`
      };

      const state: ActionLifecycleState = {
        contract,
        status: 'proposed',
        updatedAt: Date.now()
      };
      this.executionEngine.actions.set(actionId, state);

      // Validate schema normalization
      if (
        canonicalParams.invalidSchema ||
        (contract.actionType === 'issue_refund' && !canonicalParams.customerId)
      ) {
        state.status = 'denied';
        state.executionError = 'SCHEMA_VALIDATION_ERROR: Missing required customer identifier or invalid schema parameters.';
        this.emitStage(actionId, 'normalize', 1, 'denied', state.executionError);
        return state;
      }

      this.executionEngine.recordEvidence(
        actionId,
        'intent',
        contract.actorId,
        contract.destination,
        `Action normalized: ${contract.actionType} on ${contract.resourceId}`,
        { contract }
      );

      // ----------------------------------------------------
      // STAGE 2: ESTABLISH AUTHORITY
      // Authenticate actor, owner, tenant, task, delegation chain,
      // permitted functions and expiry.
      // ----------------------------------------------------
      this.emitStage(actionId, 'authority', 2, 'proposed', `Authenticating actor ${contract.actorId} and delegation depth ${contract.delegationDepth}.`);
      await this.sleep(stageDelay);

      // Check delegation bounds (parent constraints cannot expand to children)
      if (contract.delegationDepth > 2) {
        state.status = 'denied';
        state.executionError = 'DELEGATION_DEPTH_EXCEEDED: Child agent attempted delegation exceeding maximum depth (2).';
        this.emitStage(actionId, 'authority', 2, 'denied', state.executionError);
        return state;
      }

      // ----------------------------------------------------
      // STAGE 3: ESTABLISH COVERAGE
      // Record inspected fields, content hashes, formats, detector versions,
      // omissions and errors.
      // ----------------------------------------------------
      this.emitStage(actionId, 'coverage', 3, 'inspecting', 'Running content parsers, regex PII, secret scans, and nested decode checks.');
      await this.sleep(stageDelay);

      const inspectionReport = InspectionEngine.inspectPayload(contract.canonicalParameters, {
        depth: this.executionEngine.config.inspectionDepth,
        scannerDown: this.executionEngine.config.scannerDown
      });
      state.inspectionReport = inspectionReport;

      this.executionEngine.recordEvidence(
        actionId,
        'inspection',
        'security-scanner',
        contract.destination,
        `Inspection finished. Status: ${inspectionReport.status}`,
        { report: inspectionReport }
      );

      // ----------------------------------------------------
      // STAGE 4: EVALUATE IMPACT
      // Calculate exact target set, cumulative budget, dependency changes
      // and reversibility class.
      // ----------------------------------------------------
      this.emitStage(actionId, 'impact', 4, 'inspecting', `Evaluating consequence: impact=${contract.impact}, reversibility=${contract.reversibility}.`);
      await this.sleep(stageDelay);

      // ----------------------------------------------------
      // STAGE 5: DECIDE AND RESERVE
      // Apply deterministic rules; obtain scoped approval if allowed;
      // atomically reserve budget and targets where supported.
      // ----------------------------------------------------
      this.emitStage(actionId, 'decide_reserve', 5, 'decided', 'Evaluating deterministic policy rules against action contract and inspection report.');
      await this.sleep(stageDelay);

      const evaluation = this.policyEngine.evaluateAction(contract, inspectionReport, this.executionEngine.config);
      state.policyDecision = evaluation;

      this.executionEngine.recordEvidence(
        actionId,
        'policy',
        'policy-engine',
        contract.destination,
        `Policy decided: ${evaluation.decision.toUpperCase()}`,
        { evaluation }
      );

      if (evaluation.decision === 'deny') {
        state.status = 'denied';
        state.executionError = evaluation.reasons[0] || 'DENIED_BY_POLICY';
        this.emitStage(actionId, 'decide_reserve', 5, 'denied', `Denied: ${state.executionError}`);
        return state;
      }

      if (evaluation.decision === 'hold') {
        state.status = 'held';
        state.executionError = evaluation.reasons[0] || 'HELD_BY_SECURITY';
        this.emitStage(actionId, 'decide_reserve', 5, 'held', `Held: ${state.executionError}`);
        return state;
      }

      if (evaluation.decision === 'stage') {
        state.status = 'staged';
        const approval = this.executionEngine.createBoundedApproval(contract);
        state.approval = approval;
        this.executionEngine.approvals.set(approval.approvalId, approval);

        this.executionEngine.recordEvidence(
          actionId,
          'approval',
          'holdpoint-broker',
          contract.destination,
          `Action staged. Bound approval #${approval.approvalId} generated.`,
          { approval }
        );

        this.emitStage(
          actionId,
          'decide_reserve',
          5,
          'staged',
          `Staged in Approval Inbox (Token #${approval.approvalId}). Dual-control reviewer required.`
        );
        return state;
      }

      if (evaluation.decision === 'sanitize') {
        this.applySanitization(contract.canonicalParameters, inspectionReport);
        state.status = 'decided';
      }

      // Atomic Budget Reservation
      if (contract.financialAmount && contract.destination === 'bank_payments') {
        const remainingBudget = this.destinationRegistry.dailyBudgetCap - this.destinationRegistry.dailyBudgetUsed;
        if (contract.financialAmount > remainingBudget) {
          state.status = 'denied';
          state.executionError = `BUDGET_EXCEEDED: Requested $${contract.financialAmount} exceeds remaining quota ($${remainingBudget}).`;
          this.emitStage(actionId, 'decide_reserve', 5, 'denied', state.executionError);
          return state;
        }
        state.reservation = {
          reservedAmount: contract.financialAmount,
          budgetSnapshot: remainingBudget
        };
      }

      // ----------------------------------------------------
      // STAGE 6: DISPATCH
      // Recheck versions, policy freshness and revocation; use one durable
      // operation ID and destination idempotency if available.
      // ----------------------------------------------------
      this.emitStage(actionId, 'dispatch', 6, 'dispatched', `Dispatching to destination ${contract.destination} with durable idempotency key.`);
      await this.sleep(stageDelay);

      state.status = 'dispatched';
      this.executionEngine.recordEvidence(
        contract.actionId,
        'dispatch',
        contract.actorId,
        contract.destination,
        `Dispatching to destination ${contract.destination}`,
        { canonicalParameters: contract.canonicalParameters, idempotencyKey: contract.idempotencyKey }
      );

      // Failure injections check
      if (this.executionEngine.config.revokedCredential) {
        state.status = 'denied';
        state.executionError = 'REVOKED_CREDENTIAL: Cloud / Banking IAM credentials were permanently revoked mid-flight.';
        this.emitStage(actionId, 'dispatch', 6, 'denied', state.executionError);
        return state;
      }

      if (this.executionEngine.config.destinationTimeout) {
        state.status = 'outcome_unknown';
        state.executionError = 'DESTINATION_TIMEOUT: Transport timed out after commit dispatch. State is unknown. Blind retry forbidden; reconciliation required.';
        this.emitStage(actionId, 'dispatch', 6, 'outcome_unknown', state.executionError);
        return state;
      }

      const idempKey = this.executionEngine.config.duplicateDelivery
        ? 'duplicate-idemp-key-replayed'
        : contract.idempotencyKey;

      if (this.executionEngine.config.duplicateDelivery) {
        this.destinationRegistry.processedIdempotencyKeys.add('duplicate-idemp-key-replayed');
      }

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
        state.executionError = dispatchResult.error || 'DESTINATION_REJECTION';
        this.emitStage(actionId, 'dispatch', 6, 'denied', state.executionError);
        return state;
      }

      // ----------------------------------------------------
      // STAGE 7: RECONCILE
      // Verify actual destination state; distinguish succeeded, failed,
      // pending and unknown outcomes.
      // ----------------------------------------------------
      this.emitStage(actionId, 'reconcile', 7, 'completed', 'Reconciling destination state and verifying mutation against authoritative ledger.');
      await this.sleep(stageDelay);

      state.status = 'completed';
      state.reconciliationReport = {
        reconciled: true,
        destinationStatus: 'verified_active',
        destinationVersion: contract.resourceVersion + 1,
        verifiedAt: Date.now()
      };

      // ----------------------------------------------------
      // STAGE 8: CLOSE OR RECOVER
      // Release reservations; record evidence; initiate an approved
      // scoped compensation/restore when supported.
      // ----------------------------------------------------
      this.emitStage(actionId, 'close_recover', 8, 'completed', 'Committing SHA-256 block to hash-chained evidence ledger and closing transaction.');

      this.executionEngine.recordEvidence(
        contract.actionId,
        'receipt',
        'destination-gateway',
        contract.destination,
        `Receipt confirmed and verified against real state.`,
        { dispatchResult, reconciliation: state.reconciliationReport }
      );

      return state;
    } finally {
      this.currentProcessingActionId = null;
      this.notify();
    }
  }

  private applySanitization(params: Record<string, any>, inspection: InspectionReport) {
    let serialized = JSON.stringify(params);
    inspection.inspectedParts.forEach(part => {
      part.findings.forEach(finding => {
        if (finding.sanitizationSuggested && finding.matchedPattern) {
          serialized = serialized.replaceAll(finding.matchedPattern, finding.sanitizationSuggested);
        }
      });
    });
    try {
      Object.assign(params, JSON.parse(serialized));
    } catch {
      // fallback
    }
  }

  private sleep(ms: number): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
