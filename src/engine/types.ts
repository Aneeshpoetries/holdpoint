/**
 * HOLDPOINT Engine Core Types
 * Deterministic typed action contract, policy definitions, inspection metadata,
 * approvals, destination schemas, and evidence logging.
 */

export type SystemMode = 'consumer' | 'enterprise';

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export type Reversibility = 'reversible' | 'compensatable' | 'irreversible';

export type DecisionType = 'allow' | 'stage' | 'sanitize' | 'escalate' | 'deny' | 'hold';

export type ActionStatus =
  | 'proposed'
  | 'inspecting'
  | 'decided'
  | 'staged'
  | 'approved'
  | 'reserving'
  | 'dispatched'
  | 'outcome_unknown'
  | 'reconciled'
  | 'completed'
  | 'denied'
  | 'held'
  | 'cancelled'
  | 'reverted';

export type InspectionStatus = 'fully_inspected' | 'partial' | 'unsupported' | 'error_unavailable';

export interface InspectionReport {
  status: InspectionStatus;
  detectorVersion: string;
  inspectedParts: {
    partId: string;
    mediaType: string;
    hash: string;
    inspectedBytes: number;
    skippedBytes: number;
    findings: Finding[];
  }[];
  totalBytes: number;
  totalSkippedBytes: number;
  hasOcrGap: boolean;
  hasNestedExpansionExceeded: boolean;
  unresolvedRisks: string[];
}

export interface Finding {
  type: 'pii' | 'secret' | 'nested_evasion' | 'url_trap' | 'binary_ocr_gap' | 'suspicious_payload';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detail: string;
  matchedPattern?: string;
  location?: string;
  sanitizationSuggested?: string;
}

export interface TypedActionContract {
  actionId: string;
  parentActionId?: string;
  delegationDepth: number;
  tenantId: string;
  actorId: string;
  actorRole: string;
  agentId?: string;
  destination: DestinationId;
  actionType: string;
  resourceId: string;
  resourceVersion: number;
  canonicalParameters: Record<string, any>;
  rawUserPrompt?: string; // Evidence only, NEVER authority
  impact: ImpactLevel;
  reversibility: Reversibility;
  financialAmount?: number;
  dataEgressBytes?: number;
  createdAt: number;
  idempotencyKey: string;
}

export type DraftValidationStatus =
  | 'draft'
  | 'validated'
  | 'invalid_schema'
  | 'rejected_authority'
  | 'quarantined'
  | 'rejected';

export interface DraftValidationResult {
  isValid: boolean;
  status: DraftValidationStatus;
  errors: string[];
  warnings: string[];
  schemaChecks: {
    parametersAreObject: boolean;
    noDuplicateKeys: boolean;
    destinationRecognized: boolean;
    resourceIdSpecified: boolean;
    actorAuthorized: boolean;
    boundsRespected: boolean;
  };
}

export interface DraftActionContract {
  draftId: string;
  createdAt: number;
  rawPrompt: string; // Free text is evidence, never authority
  personaId: string;
  actorId: string;
  actorRole: string;
  agentId: string;
  agentName: string;
  agentReasoning: string;
  proposedContract: {
    actionType: string;
    destination: DestinationId;
    resourceId: string;
    resourceVersion?: number;
    canonicalParameters: Record<string, any>;
    impact: ImpactLevel;
    reversibility: Reversibility;
    financialAmount?: number;
    dataEgressBytes?: number;
    delegationDepth?: number;
    parentActionId?: string;
    idempotencyKey?: string;
  };
  validation: DraftValidationResult;
  confidenceScore: number;
  isHarmfulSuspect: boolean;
  isInformational?: boolean;
  promotedActionId?: string;
}

export type DestinationId =
  | 'photo_vault'
  | 'cloud_infra'
  | 'code_repo'
  | 'bank_payments'
  | 'email_crm'
  | 'user_identity';

export interface BoundedApproval {
  approvalId: string;
  actionId: string;
  tenantId: string;
  requiredRole: string;
  approverId?: string;
  approvedAt?: number;
  expiresAt: number;
  nonce: string;
  policyVersion: string;
  boundResourceId: string;
  boundResourceVersion: number;
  boundDestination: DestinationId;
  boundCanonicalHash: string;
  boundMaxAmount?: number;
  status: 'pending' | 'granted' | 'rejected' | 'expired' | 'invalidated';
  invalidationReason?: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  mode: 'enforce' | 'observe';
  version: string;
  enabled: boolean;
  targetDestinations: DestinationId[];
  targetActions: string[];
  conditions: {
    maxAmount?: number;
    disallowIrreversible?: boolean;
    requireDualControl?: boolean;
    requireCleanInspection?: boolean;
    maxDailyBudget?: number;
    allowedEgressBytes?: number;
    requireIndependentRecovery?: boolean;
    preventSelfApproval?: boolean;
    forbiddenPatterns?: string[];
  };
  decisionOnMatch: DecisionType;
  impactIfMatched: ImpactLevel;
  rejectionMessage: string;
  category: 'critical_assets' | 'recovery_path' | 'data_movement' | 'budget' | 'dual_control' | 'evasion';
}

export interface EventLogEntry {
  index: number;
  timestamp: number;
  actionId: string;
  stage: 'intent' | 'policy' | 'inspection' | 'approval' | 'dispatch' | 'receipt' | 'reconciled' | 'recovery';
  actorId: string;
  destination: DestinationId;
  summary: string;
  payloadHash: string;
  prevHash: string;
  currentHash: string;
  policyVersion?: string;
  metadata: Record<string, any>;
}

export interface CoverageRoute {
  id: string;
  name: string;
  destination: DestinationId;
  type: 'agent_tool_wrapper' | 'internal_sdk' | 'native_ui' | 'alternate_api_key';
  enforcementStatus: 'enforced' | 'observed' | 'partial' | 'unconnected';
  description: string;
  hasWrapper: boolean;
  gapNotice?: string;
  trafficCount: number;
}

export interface RecoverySnapshot {
  snapshotId: string;
  destination: DestinationId;
  resourceId: string;
  version: number;
  data: any;
  permissions: Record<string, string>;
  encryptionKeyFingerprint: string;
  capturedAt: number;
  authority: 'independent_vault' | 'local_agent';
}

export interface RestorePreview {
  snapshotId: string;
  destination: DestinationId;
  resourceId: string;
  targetVersion: number;
  currentVersion: number;
  diffSummary: string[];
  conflictsDetected: string[];
  permissionsRestoreDiff: string[];
  canSafelyRestore: boolean;
}

export interface PersonaProfile {
  id: string;
  name: string;
  title: string;
  mode: SystemMode;
  avatarSeed: string;
  summary: string;
  agentName: string;
  authority: string[];
  dailyBudgetLimit: number;
  dailyBudgetSpent: number;
  suggestedTasks: {
    title: string;
    prompt: string;
    isAttackScenario?: boolean;
    scenarioId?: string;
  }[];
}

export interface EngineConfig {
  enforcementMode: 'enforce' | 'observe';
  failClosedOnScannerFailure: boolean;
  inspectionDepth: 'thorough' | 'fast';
  strictApprovals: boolean;
  simulatedLatencyMs: number;
  timeSpeedMultiplier: number;
  // Failure Injection
  scannerDown: boolean;
  destinationTimeout: boolean;
  duplicateDelivery: boolean;
  revokedCredential: boolean;
  expiredApproval: boolean;
}

export interface AcceptanceScenario {
  id: string; // G01 - G28
  title: string;
  description: string;
  category: string;
  mode: SystemMode;
  harmfulCase: {
    description: string;
    expectedDecision: DecisionType | ActionStatus;
    actionBuilder: () => Partial<TypedActionContract> & { rawPrompt?: string; payload?: any };
  };
  controlCase: {
    description: string;
    expectedDecision: DecisionType | ActionStatus;
    actionBuilder: () => Partial<TypedActionContract> & { rawPrompt?: string; payload?: any };
  };
}

export interface ChatHistoryTurn {
  sender: 'user' | 'agent' | 'holdpoint';
  text: string;
  actionType?: string;
}

