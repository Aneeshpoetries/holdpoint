/**
 * HOLDPOINT Policy Engine
 * Deterministic policy evaluation, typed rules, budget tracking,
 * dual-control enforcement, and Policy Studio compiler.
 * Invariant: Chat text or retrieved documents CAN NEVER alter policy.
 */

import {
  DecisionType,
  DestinationId,
  EngineConfig,
  ImpactLevel,
  InspectionReport,
  PolicyRule,
  TypedActionContract
} from './types';

export class PolicyEngine {
  private static instance: PolicyEngine;

  public rules: PolicyRule[] = [
    {
      id: 'pol-asset-01',
      name: 'Protect Critical Original Assets',
      description: 'Original photos, master databases, primary branches, and user identities cannot be destroyed without dual HSM clearance.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'critical_assets',
      targetDestinations: ['photo_vault', 'cloud_infra', 'code_repo', 'user_identity'],
      targetActions: ['delete_originals_or_all', 'drop_database', 'delete_bucket', 'force_push_main', 'delete_account_permanently'],
      conditions: {
        disallowIrreversible: true,
        requireIndependentRecovery: true,
      },
      decisionOnMatch: 'deny',
      impactIfMatched: 'critical',
      rejectionMessage: 'CRITICAL_ASSET_HOLD: Irreversible destruction of primary protected asset prohibited.'
    },
    {
      id: 'pol-recovery-02',
      name: 'Preserve Independent Recovery Path',
      description: 'Any action altering or deleting resources must have a verified independent recovery snapshot before execution.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'recovery_path',
      targetDestinations: ['cloud_infra', 'photo_vault', 'code_repo'],
      targetActions: ['drop_database', 'delete_bucket', 'delete_duplicates'],
      conditions: {
        requireIndependentRecovery: true
      },
      decisionOnMatch: 'stage',
      impactIfMatched: 'high',
      rejectionMessage: 'RECOVERY_PATH_REQUIRED: Execution staged pending independent vault snapshot.'
    },
    {
      id: 'pol-budget-03',
      name: 'High Consequence Financial Threshold',
      description: 'Disbursements exceeding $2,500 or aggregate daily spend exceeding $25,000 require independent approval.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'budget',
      targetDestinations: ['bank_payments'],
      targetActions: ['transfer_funds', 'pay_invoice'],
      conditions: {
        maxAmount: 2500,
        maxDailyBudget: 25000,
        requireDualControl: true
      },
      decisionOnMatch: 'stage',
      impactIfMatched: 'high',
      rejectionMessage: 'FINANCIAL_THRESHOLD: Payment exceeds single-actor limit ($2,500). Staged for dual approval.'
    },
    {
      id: 'pol-dual-04',
      name: 'Strict Dual Control & No Self-Approval',
      description: 'The actor who proposed or drafted an action is strictly prohibited from approving it.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'dual_control',
      targetDestinations: ['code_repo', 'user_identity'],
      targetActions: ['deploy_to_production', 'reset_account_recovery'],
      conditions: {
        preventSelfApproval: true,
        requireDualControl: true
      },
      decisionOnMatch: 'stage',
      impactIfMatched: 'high',
      rejectionMessage: 'DUAL_CONTROL_MANDATE: Actor cannot approve own proposed action.'
    },
    {
      id: 'pol-egress-05',
      name: 'Data Movement & Egress Bounds',
      description: 'Bulk exports or transfers exceeding 500KB or containing PII must be sanitized or held.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'data_movement',
      targetDestinations: ['email_crm', 'code_repo'],
      targetActions: ['send_email', 'export_records', 'publish_snippet'],
      conditions: {
        allowedEgressBytes: 500000,
        requireCleanInspection: true
      },
      decisionOnMatch: 'sanitize',
      impactIfMatched: 'medium',
      rejectionMessage: 'DATA_EGRESS_EXCEEDED: Payload contains sensitive data or exceeds egress quota.'
    },
    {
      id: 'pol-account-06',
      name: 'Scam & Account Recovery Lockout',
      description: 'Recovery email/phone updates on security-locked accounts require trusted contact consensus.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'critical_assets',
      targetDestinations: ['user_identity'],
      targetActions: ['reset_account_recovery'],
      conditions: {
        requireDualControl: true
      },
      decisionOnMatch: 'stage',
      impactIfMatched: 'critical',
      rejectionMessage: 'RECOVERY_LOCK: High-risk account recovery attempt requires trusted contact approval.'
    },
    {
      id: 'pol-support-refund-02',
      name: 'Customer Support Single-Refund Authority Cap',
      description: 'Customer refunds exceeding $150 require lead dual-control authorization before disbursement.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'budget',
      targetDestinations: ['bank_payments'],
      targetActions: ['refund_customer'],
      conditions: {
        maxAmount: 150,
        requireDualControl: true
      },
      decisionOnMatch: 'stage',
      impactIfMatched: 'high',
      rejectionMessage: 'SUPPORT_THRESHOLD_EXCEEDED: Customer refund exceeds $150 operator limit. Staged for lead dual-control approval.'
    },
    {
      id: 'pol-security-07',
      name: 'Security Broker Enforcement Immutability',
      description: 'Attempting to disable fail-closed policies, audit trails, or scanner probes is strictly denied.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'critical_assets',
      targetDestinations: ['cloud_infra'],
      targetActions: ['disable_security_enforcement', 'shutdown_broker', 'bypass_scanner', 'native_console_bypass_attempt'],
      conditions: {
        disallowIrreversible: false
      },
      decisionOnMatch: 'deny',
      impactIfMatched: 'critical',
      rejectionMessage: 'SECURITY_ENFORCEMENT_IMMUTABLE: Disabling security broker enforcement is strictly prohibited.'
    },
    {
      id: 'pol-crm-bulk-08',
      name: 'CRM Database Bulk Exfiltration Prevention',
      description: 'Bulk contact list exports exceeding 10,000 records or unencrypted exports require compliance hold.',
      mode: 'enforce',
      version: 'v2.1',
      enabled: true,
      category: 'data_movement',
      targetDestinations: ['email_crm'],
      targetActions: ['bulk_export_crm_records'],
      conditions: {
        allowedEgressBytes: 500000
      },
      decisionOnMatch: 'hold',
      impactIfMatched: 'high',
      rejectionMessage: 'BULK_EGRESS_HOLD: Bulk export of CRM contact database exceeds uninspected egress limit. Staged for DLP compliance review.'
    }
  ];

  // Active temporary policy exceptions (scoped waivers with expiry)
  public scopedExceptions: {
    id: string;
    ruleId: string;
    grantedToActor: string;
    destination: DestinationId;
    expiresAt: number;
    reason: string;
  }[] = [];

  constructor() {}

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  public evaluateAction(
    action: TypedActionContract,
    inspection: InspectionReport,
    config: EngineConfig
  ): {
    decision: DecisionType;
    matchedRules: PolicyRule[];
    impact: ImpactLevel;
    reasons: string[];
    policyVersion: string;
  } {
    const reasons: string[] = [];
    const matchedRules: PolicyRule[] = [];
    let resultingDecision: DecisionType = 'allow';
    let computedImpact: ImpactLevel = action.impact || 'low';
    const policyVersion = 'pol-v2.1-prod';

    // 1. FAIL-CLOSED CHECK: If scanner is down and action has medium+ impact or protected destination
    if (inspection.status === 'error_unavailable') {
      if (config.failClosedOnScannerFailure) {
        return {
          decision: 'hold',
          matchedRules: [],
          impact: 'critical',
          reasons: ['FAIL_CLOSED: Security scanner unavailable. High-consequence action held.'],
          policyVersion
        };
      }
    }

    // 2. INSPECTION REPORT INTEGRATION:
    // If critical findings (secrets, raw PII), rule requires sanitization or hold
    if (inspection.unresolvedRisks.length > 0) {
      const hasSecrets = inspection.inspectedParts.some(p => p.findings.some(f => f.type === 'secret'));
      const hasPii = inspection.inspectedParts.some(p => p.findings.some(f => f.type === 'pii'));
      const hasEvasion = inspection.inspectedParts.some(p => p.findings.some(f => f.type === 'nested_evasion'));
      const hasUrlTrap = inspection.inspectedParts.some(p => p.findings.some(f => f.type === 'url_trap'));

      if (hasSecrets) {
        resultingDecision = 'deny';
        computedImpact = 'critical';
        reasons.push('SECRET_EXFILTRATION: Unmasked API key or private key detected in action payload.');
      } else if (hasPii) {
        resultingDecision = 'sanitize';
        computedImpact = 'high';
        reasons.push('PII_DETECTED: Social Security Number or Payment Card found. Sanitization required.');
      } else if (hasEvasion) {
        resultingDecision = 'hold';
        computedImpact = 'high';
        reasons.push('EVASION_ATTEMPT: Nested obfuscated Base64 encoding flagged by inspection.');
      } else if (hasUrlTrap) {
        resultingDecision = 'hold';
        computedImpact = 'high';
        reasons.push('PHISHING_URL_CLUSTER: Excessive redirect links detected in communication payload.');
      }
    }

    // 2.1 INVARIANT: Irreversible Critical Actions Cannot Execute Without Denial / Fail-Closed
    if (action.impact === 'critical' && action.reversibility === 'irreversible') {
      const assetRule = this.rules.find(r => r.id === 'pol-asset-01');
      if (assetRule && assetRule.enabled && config.enforcementMode === 'enforce') {
        resultingDecision = this.prioritizeDecision(resultingDecision, 'deny');
        computedImpact = 'critical';
        if (!matchedRules.some(r => r.id === assetRule.id)) matchedRules.push(assetRule);
        reasons.push(`${assetRule.name}: ${assetRule.rejectionMessage}`);
      }
    }

    // 2.2 INVARIANT: Prompt Injection & Adversarial Payload Detection
    const rawLower = (action.rawUserPrompt || '').toLowerCase();
    const paramsStr = JSON.stringify(action.canonicalParameters || {}).toLowerCase();
    const hasInjection =
      rawLower.includes('ignore previous') ||
      rawLower.includes('ignore all previous') ||
      rawLower.includes('system prompt') ||
      rawLower.includes('override policy') ||
      rawLower.includes('bypass security') ||
      rawLower.includes('drop table') ||
      rawLower.includes('drop database') ||
      rawLower.includes('exfiltrate') ||
      paramsStr.includes('droptable') ||
      paramsStr.includes('drop_database') ||
      paramsStr.includes('force_push') ||
      paramsStr.includes('untrusted_tool_result_injection') ||
      paramsStr.includes('forcedelete');

    if (hasInjection && (action.impact === 'critical' || action.impact === 'high' || rawLower.includes('ignore') || rawLower.includes('override'))) {
      resultingDecision = this.prioritizeDecision(resultingDecision, 'deny');
      computedImpact = 'critical';
      reasons.push('ADVERSARIAL_INJECTION_BLOCKED: Prompt injection or untrusted override pattern detected in payload.');
    }

    // 2.3 INVARIANT: Single-Actor Financial Ceiling ($25,000+)
    if (action.destination === 'bank_payments' && action.financialAmount && action.financialAmount > 25000) {
      resultingDecision = this.prioritizeDecision(resultingDecision, 'deny');
      computedImpact = 'critical';
      reasons.push(`CUMULATIVE_CAP_EXCEEDED: Single transaction ($${action.financialAmount.toLocaleString()}) exceeds single-actor safety cap ($25,000). Direct execution prohibited.`);
    }

    // 3. MATCH TYPED RULES
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Check destination and action match
      const destMatch = rule.targetDestinations.includes(action.destination);
      const actionMatch = rule.targetActions.includes(action.actionType);

      if (destMatch && actionMatch) {
        // Check for active scoped exception
        const activeException = this.scopedExceptions.find(
          e => e.ruleId === rule.id && e.grantedToActor === action.actorId && e.destination === action.destination && e.expiresAt > Date.now()
        );
        if (activeException) {
          reasons.push(`SCOPED_EXCEPTION_APPLIED: Rule ${rule.name} waived by exception #${activeException.id} until ${new Date(activeException.expiresAt).toLocaleTimeString()}`);
          continue;
        }

        let conditionHit = false;

        if (rule.conditions.disallowIrreversible && action.reversibility === 'irreversible') {
          conditionHit = true;
        }

        if (rule.conditions.maxAmount) {
          if ((action.financialAmount ?? 0) > rule.conditions.maxAmount) {
            conditionHit = true;
          }
        } else if (rule.conditions.requireDualControl) {
          conditionHit = true;
        }

        if (rule.conditions.disallowIrreversible && (action.actionType === 'delete_originals_or_all' || action.actionType === 'drop_database')) {
          conditionHit = true;
        }

        if (rule.id === 'pol-security-07' || rule.id === 'pol-crm-bulk-08') {
          conditionHit = true;
        }

        if (conditionHit) {
          matchedRules.push(rule);
          if (rule.mode === 'enforce' && config.enforcementMode === 'enforce') {
            // Apply decision hierarchy: deny > hold > stage > sanitize > allow
            resultingDecision = this.prioritizeDecision(resultingDecision, rule.decisionOnMatch);
            computedImpact = this.prioritizeImpact(computedImpact, rule.impactIfMatched);
            reasons.push(`${rule.name}: ${rule.rejectionMessage}`);
          } else {
            // Observe mode: log finding without blocking
            reasons.push(`[OBSERVED_ONLY] ${rule.name}: Would have resulted in ${rule.decisionOnMatch.toUpperCase()}`);
          }
        }
      }
    }

    if (reasons.length === 0) {
      reasons.push('Action satisfies all deterministic policy invariants.');
    }

    return {
      decision: resultingDecision,
      matchedRules,
      impact: computedImpact,
      reasons,
      policyVersion
    };
  }

  private prioritizeDecision(current: DecisionType, next: DecisionType): DecisionType {
    const rank: Record<DecisionType, number> = {
      deny: 5,
      hold: 4,
      stage: 3,
      sanitize: 2,
      escalate: 2,
      allow: 1
    };
    return rank[next] > rank[current] ? next : current;
  }

  private prioritizeImpact(current: ImpactLevel, next: ImpactLevel): ImpactLevel {
    const rank: Record<ImpactLevel, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    return rank[next] > rank[current] ? next : current;
  }

  // Policy Studio helper: Check for rule conflicts
  public checkRuleConflicts(candidateRule: PolicyRule): { hasConflict: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    for (const existing of this.rules) {
      if (existing.id === candidateRule.id) continue;
      const sharedDests = existing.targetDestinations.filter(d => candidateRule.targetDestinations.includes(d));
      const sharedActions = existing.targetActions.filter(a => candidateRule.targetActions.includes(a));

      if (sharedDests.length > 0 && sharedActions.length > 0) {
        if (existing.decisionOnMatch === 'deny' && candidateRule.decisionOnMatch === 'allow') {
          conflicts.push(`Direct conflict with ${existing.name}: Existing rule denies matching action, but new rule allows it.`);
        }
      }
    }
    return { hasConflict: conflicts.length > 0, conflicts };
  }
}
