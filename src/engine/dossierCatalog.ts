/**
 * HOLDPOINT Dossier Catalog & Taxonomy
 * Directly derived from Holdpoint Final Product and Business Dossier (17 October 2026):
 * - 14 Shared Modules (M01 - M14) / 112 Capabilities
 * - 24 Technical Assessment Modules (S01 - S24)
 * - 30 Risk Families (F01 - F30)
 * - 39 Primary Source References
 */

export interface DossierModule {
  id: string; // M01 - M14
  title: string;
  category: string;
  capabilities: { name: string; behavior: string }[];
  boundary: string;
}

export interface AssessmentModule {
  id: string; // S01 - S24
  title: string;
  checks: string;
  limit: string;
}

export interface RiskFamily {
  id: string; // F01 - F30
  title: string;
  productResponse: string;
}

export const DOSSIER_MODULES: DossierModule[] = [
  {
    id: 'M01',
    title: 'Asset Protection',
    category: 'Core Protection',
    capabilities: [
      { name: 'Inventory', behavior: 'Discover connected assets, owners, environment and criticality; surface unowned resources.' },
      { name: 'Protected sets', behavior: 'Use stable IDs and explicit folders/tables/accounts rather than name-only matching.' },
      { name: 'Impact preview', behavior: 'Resolve bulk targets, wildcards, cascades and permission inheritance before authorization.' },
      { name: 'Safe staging', behavior: 'Quarantine or draft reversible changes; retain preimages where supported.' },
      { name: 'Environment binding', behavior: 'Separate production, test and personal contexts at credential and resource level.' },
      { name: 'Dependency map', behavior: 'Link databases, services, domains, identities, keys and recovery assets.' },
      { name: 'Last-path checks', behavior: 'Detect proposed loss of minimum recovery or administrator paths.' },
      { name: 'Asset health', behavior: 'Track ownership, renewal and permission drift with actionable owner tasks.' },
    ],
    boundary: 'Only connected, effectively controlled assets can receive preventive guarantees.'
  },
  {
    id: 'M02',
    title: 'Identity and Permissions',
    category: 'Core Protection',
    capabilities: [
      { name: 'Unique actors', behavior: 'Distinguish human, workload, agent and service identities with tenant-bound IDs.' },
      { name: 'Scoped credentials', behavior: 'Issue short-lived grants restricted to task, operation, destination and object scope.' },
      { name: 'Delegation chain', behavior: 'Carry authenticated parent constraints to children; forbid scope expansion.' },
      { name: 'Owner verification', behavior: 'Resolve authoritative asset ownership and current approval rights.' },
      { name: 'Privilege separation', behavior: 'Keep policy authority, approval authority and execution credentials separate.' },
      { name: 'Revocation checks', behavior: 'Verify current authority at dispatch and propagate offboarding to supported systems.' },
      { name: 'Credential inventory', behavior: 'Find alternate API keys and shared identities; report routes outside enforcement.' },
      { name: 'Device context', behavior: 'Consume native identity and device posture rather than inventing trust signals.' },
    ],
    boundary: 'Root owners and uncontrolled credentials can bypass an application wrapper.'
  },
  {
    id: 'M03',
    title: 'Task and Agent Boundaries',
    category: 'Execution Governance',
    capabilities: [
      { name: 'Task contract', behavior: 'Define goal, allowed actions, protected assets, destination and completion criteria.' },
      { name: 'Untrusted channels', behavior: 'Keep retrieved documents, email, tool outputs and descriptions from changing policy.' },
      { name: 'Intent drift', behavior: 'Evaluate proposed action against authenticated scope and cumulative task state.' },
      { name: 'Delegation budgets', behavior: 'Allocate finite steps, money, time and data budgets to child agents.' },
      { name: 'Memory provenance', behavior: 'Store source, owner, scope and expiry; make inferred memory reviewable.' },
      { name: 'Context survival', behavior: 'Enforce critical constraints outside context windows and lossy summaries.' },
      { name: 'Tool restrictions', behavior: 'Allow tools and functions by role, schema, version and task purpose.' },
      { name: 'Stop semantics', behavior: 'Cancel supported children and queues; distinguish in-flight effects from new dispatch.' },
    ],
    boundary: 'Injection detection is probabilistic; consequences need independent execution controls.'
  },
  {
    id: 'M04',
    title: 'Exact Action and Target Validation',
    category: 'Execution Governance',
    capabilities: [
      { name: 'Strict schemas', behavior: 'Reject missing/duplicate fields, unexpected types and ambiguous operation names.' },
      { name: 'Stable targets', behavior: 'Resolve entities, object IDs, accounts, recipients and tenant/environment identifiers.' },
      { name: 'Typed quantities', behavior: 'Represent money, units, counts, currency and timestamps without locale guessing.' },
      { name: 'Canonical paths', behavior: 'Resolve symlinks, path traversal, wildcard expansion and Unicode ambiguity safely.' },
      { name: 'Version awareness', behavior: 'Bind reads and approvals to resource versions; use conditional writes where possible.' },
      { name: 'Semantic diffs', behavior: 'Show changes to actual permissions, recipients, rows, files and commitments.' },
      { name: 'Format fidelity', behavior: 'Preserve identifiers, leading zeros, formulas, dates and original source files.' },
      { name: 'Preview isolation', behavior: 'Use genuine dry-run/sandbox paths; never assume a diagnostic command is read-only.' },
    ],
    boundary: 'Some destinations cannot support atomic check-and-act; residual races require disclosure.'
  },
  {
    id: 'M05',
    title: 'Owner Rules and Approvals',
    category: 'Authorization & Trust',
    capabilities: [
      { name: 'Policy templates', behavior: 'Offer reviewed patterns for deletion, sharing, publishing, refunds and deployment.' },
      { name: 'Exact approval', behavior: 'Show final target, parameters, amount, audience and uncertainty in plain language.' },
      { name: 'Authenticated reviewer', behavior: 'Use current owner authority through a separate trusted approval path.' },
      { name: 'Material-change check', behavior: 'Invalidate approval when relevant parameters or resource state changes.' },
      { name: 'Replay resistance', behavior: 'Bind expiry, nonce and one intended operation to the approval record.' },
      { name: 'Separation of duties', behavior: 'Require independent review for protected policy, privilege or recovery changes.' },
      { name: 'Scoped exceptions', behavior: 'Time-limit exceptional authority and log the exact objects and permitted action.' },
      { name: 'Accessible review', behavior: 'Support mobile, keyboard and screen-reader use; avoid misleading safe defaults.' },
    ],
    boundary: 'Approval cannot cure missing authority or make an irreversible action recoverable.'
  },
  {
    id: 'M06',
    title: 'Privacy and Data Flows',
    category: 'Data Safeguards',
    capabilities: [
      { name: 'Data classification', behavior: 'Combine labels, exact fingerprints, patterns and contextual detection.' },
      { name: 'Destination policy', behavior: 'Check intended recipient, domain, provider, region and task purpose before egress.' },
      { name: 'Structured DLP', behavior: 'Inspect relevant tool fields, files, outputs, retrievals and render/fetch paths.' },
      { name: 'Safe transformation', behavior: 'Tokenize/redact only when destination operation stays valid; validate result.' },
      { name: 'Context separation', behavior: 'Keep work/personal, tenant, project and customer contexts apart.' },
      { name: 'Minimal evidence', behavior: 'Redact normal logs; separately restrict necessary raw forensic content.' },
      { name: 'Retrieval access', behavior: 'Recheck source authorization and deletion state for search, memory and caches.' },
      { name: 'Data rights support', behavior: 'Track retention, export and deletion propagation with explicit residual copies.' },
    ],
    boundary: 'Detection can miss sensitive material; encryption and anonymization claims need separate evidence.'
  },
  {
    id: 'M07',
    title: 'Reliable Execution',
    category: 'Execution Reliability',
    capabilities: [
      { name: 'Durable intent', behavior: 'Persist business operation before dispatch, using one stable identity.' },
      { name: 'Provider idempotency', behavior: 'Use supported destination keys without assuming global exactly-once effects.' },
      { name: 'Business dedupe', behavior: 'Detect repeated intent across restarts, retries and different generated requests.' },
      { name: 'Atomic reservation', behavior: 'Reserve shared budget and protected scope before concurrent execution.' },
      { name: 'Outcome ledger', behavior: 'Record attempts, receipts, postconditions and uncertain destination state.' },
      { name: 'Reconciliation', behavior: 'Query authoritative destination state before retrying an ambiguous action.' },
      { name: 'Conditional commit', behavior: 'Use resource versions, transactions or locks when destination permits them.' },
      { name: 'Compensation', behavior: 'Represent partial success and recovery steps explicitly; require appropriate authorization.' },
    ],
    boundary: 'Cross-service atomicity and reversibility depend on destination capabilities.'
  },
  {
    id: 'M08',
    title: 'Budgets and Stop Controls',
    category: 'Execution Governance',
    capabilities: [
      { name: 'Aggregate ceilings', behavior: 'Limit committed spend, refunds, exports, deletes and publication volume.' },
      { name: 'Resource budgets', behavior: 'Bound tokens, tool calls, time, concurrency and parser expansion.' },
      { name: 'Loop detection', behavior: 'Detect repeated unproductive calls and require scope review before continuation.' },
      { name: 'Task cancellation', behavior: 'Revoke task capabilities and cancel supported jobs and queued work.' },
      { name: 'Hierarchy controls', behavior: 'Apply parent limits across agent descendants and scheduled triggers.' },
      { name: 'Rate controls', behavior: 'Throttle before expensive services and costly destination operations.' },
      { name: 'Emergency paths', behavior: 'Permit only predefined limited continuity actions with audited expiry.' },
      { name: 'Budget visibility', behavior: 'Explain reservations, committed outcomes, releases and unknown commitments.' },
    ],
    boundary: 'A stop request cannot undo an external operation that already committed.'
  },
  {
    id: 'M09',
    title: 'Recovery Assurance',
    category: 'Resilience & Recovery',
    capabilities: [
      { name: 'Independent versions', behavior: 'Use retained copies outside the routine agent credential scope.' },
      { name: 'Key survivability', behavior: 'Keep recoverable key material and recovery identities independent.' },
      { name: 'Restore dependency graph', behavior: 'Map data, permission, identity, domain and service prerequisites.' },
      { name: 'Restore drills', behavior: 'Verify representative content and service behavior, not only backup job completion.' },
      { name: 'Scoped restore', behavior: 'Preview recovery diff and avoid overwriting newer legitimate work.' },
      { name: 'RTO/RPO tracking', behavior: 'Measure recovery time and data-point freshness per supported asset class.' },
      { name: 'Irreversibility labels', behavior: 'Separate reversible, compensatable and irreversible consequences.' },
      { name: 'Recovery custody', behavior: 'Control deletion, retention changes and access to backup/restore authority.' },
    ],
    boundary: 'Backup existence does not prove restoration; disclosure and external settlement may be irreversible.'
  },
  {
    id: 'M10',
    title: 'Independent Evidence and Incidents',
    category: 'Evidence & Integrity',
    capabilities: [
      { name: 'Event chain', behavior: 'Link intent, identity, policy, approval, dispatch, receipt and verified result.' },
      { name: 'Tamper evidence', behavior: 'Separate evidence custody; sign/checkpoint records and monitor missing events.' },
      { name: 'Owner routing', behavior: 'Assign incidents to current responsible owners with acknowledgment and escalation.' },
      { name: 'Containment plans', behavior: 'Pause related work and revoke scoped credentials through supported integrations.' },
      { name: 'Explainable findings', behavior: 'Show direct observations separately from model inference and hypotheses.' },
      { name: 'Restricted exports', behavior: 'Redact normal reports; audit access to sensitive incident evidence.' },
      { name: 'Near-miss learning', behavior: 'Convert verified failures and false blocks into reviewed regression cases.' },
      { name: 'Response rehearsal', behavior: 'Test escalation channels, recovery runbooks and manual continuity procedures.' },
    ],
    boundary: 'Logs can be incomplete or delayed; corroborate them with destination state.'
  },
  {
    id: 'M11',
    title: 'Guardrail Integrity and Coverage',
    category: 'Coverage Honesty',
    capabilities: [
      { name: 'Route inventory', behavior: 'Show enforced, observed and unknown routes by connector and operation.' },
      { name: 'Coverage manifest', behavior: 'Record checked content and omissions for each configured inspection.' },
      { name: 'Failure policy', behavior: 'Use explicit risk-specific behavior for scanner, network and policy outages.' },
      { name: 'Signed policy', behavior: 'Protect policy distribution, versions, rollback and administrative changes.' },
      { name: 'Tenant isolation', behavior: 'Separate data, caches, keys, queues, credentials and authorization domains.' },
      { name: 'Permission health', behavior: 'Detect expired grants, lost hooks and overly broad alternative authority.' },
      { name: 'Control self-tests', behavior: 'Prove important rules can stop a harmless synthetic attempt on each route.' },
      { name: 'Exit readiness', behavior: 'Export policy/evidence and rehearse removal without leaving unsafe credentials.' },
    ],
    boundary: 'The safeguard itself is a high-value system and must be independently assessed.'
  },
  {
    id: 'M12',
    title: 'Evidence Quality and Decision Hygiene',
    category: 'Hygiene & Precision',
    capabilities: [
      { name: 'Source grounding', behavior: 'Resolve references and link material claims to inspectable evidence.' },
      { name: 'Freshness', behavior: 'Track retrieval date, authoritative version and validity period of changing facts.' },
      { name: 'Independent arithmetic', behavior: 'Recompute calculations and verify units and numerical constraints.' },
      { name: 'Entity consistency', behavior: 'Preserve names, IDs, negations and critical exceptions through summaries.' },
      { name: 'Contradiction review', behavior: 'Surface conflicting records rather than silently selecting a convenient answer.' },
      { name: 'Uncertainty handling', behavior: 'Escalate missing authoritative inputs; do not equate confidence with truth.' },
      { name: 'Multilingual checks', behavior: 'Evaluate supported languages and locales with domain-relevant examples.' },
      { name: 'Human judgment', behavior: 'Keep consequential recommendations reviewable with evidence and alternative outcomes.' },
    ],
    boundary: 'Sources can be wrong; general-purpose fact checks do not certify domain decisions.'
  },
  {
    id: 'M13',
    title: 'Integration and Supply-Chain Assurance',
    category: 'Ecosystem & Connectors',
    capabilities: [
      { name: 'Connector contracts', behavior: 'Version schemas, permissions, side effects, limits and recovery semantics.' },
      { name: 'Artifact provenance', behavior: 'Verify signed builds, declared dependencies and allowed artifact origins.' },
      { name: 'Continuous scans', behavior: 'Integrate code, secrets, dependencies, model, image and configuration checks.' },
      { name: 'Tool change review', behavior: 'Reassess tool descriptions, schemas, endpoints and permission changes.' },
      { name: 'Sandbox validation', behavior: 'Run owned malicious/benign behavior tests before granting production scope.' },
      { name: 'Supplier controls', behavior: 'Record provider data handling, region, retention, subprocessors and support terms.' },
      { name: 'Compatibility testing', behavior: 'Detect API drift, authentication changes and callback/retry differences.' },
      { name: 'Portable integration', behavior: 'Offer SDK, APIs and standard finding exports with explicit license boundaries.' },
    ],
    boundary: 'Signatures establish origin; scans and finite tests cannot establish universal harmlessness.'
  },
  {
    id: 'M14',
    title: 'Specialist Governance',
    category: 'Compliance & Society',
    capabilities: [
      { name: 'Domain approval', behavior: 'Require qualified owners for health, hiring, credit and physical-risk workflows.' },
      { name: 'Fairness evaluation', behavior: 'Test relevant groups and failure distributions with appropriate lawful data.' },
      { name: 'Appeal support', behavior: 'Keep meaningful review, correction and contestability paths.' },
      { name: 'Children/companions', behavior: 'Use separate consent, retention and safety design where supported.' },
      { name: 'Accessibility', behavior: 'Evaluate assisted interaction and high-impact review interfaces with real users.' },
      { name: 'Rights mapping', behavior: 'Map contract/policy obligations to evidence and accountable owners.' },
      { name: 'Content safeguards', behavior: 'Context-sensitive harmful-content controls with appropriate escalation.' },
      { name: 'Societal measures', behavior: 'Support training, manual fallback, resource budgets and provider-exit planning.' },
    ],
    boundary: 'This module supports governance; it cannot certify lawfulness, fairness or physical safety.'
  }
];

export const ASSESSMENT_MODULES: AssessmentModule[] = [
  { id: 'S01', title: 'AI asset and shadow-AI discovery', checks: 'Read approved inventory, identity and traffic sources; map agents, models, endpoints, owners and unmanaged routes.', limit: 'Validate against a seeded owned inventory; report visibility gaps.' },
  { id: 'S02', title: 'AI posture and permission assessment', checks: 'Check orphan owners, broad grants, public exposure, missing policies and recovery dependencies.', limit: 'Confirm actual effective permissions, not only declared settings.' },
  { id: 'S03', title: 'SAST and code/data-flow analysis', checks: 'Inspect source and supported flows for injection, unsafe execution and authorization weaknesses.', limit: 'Track language/rule coverage; triage false positives.' },
  { id: 'S04', title: 'SCA, licenses and SBOM', checks: 'Inventory dependencies, known vulnerabilities, provenance and license obligations.', limit: 'Finding does not establish exploitability or legal clearance.' },
  { id: 'S05', title: 'Secret scanning', checks: 'Scan relevant code/history/configuration/output for exposed tokens and credentials.', limit: 'Verify synthetic detection; route real leaks to rotation/revocation.' },
  { id: 'S06', title: 'Container and artifact scanning', checks: 'Assess supported images, packages and executable components before deployment.', limit: 'Pin artifact digest; isolated scan; record unsupported formats.' },
  { id: 'S07', title: 'IaC and cloud configuration', checks: 'Review deployment plans, public access, IAM, logging and destructive resource changes.', limit: 'Compare planned and effective state; verify drift after deploy.' },
  { id: 'S08', title: 'DAST and API authorization testing', checks: 'Exercise owned staging endpoints for request handling, tenant isolation and broken access control.', limit: 'Use synthetic data and non-destructive payloads; no unauthorised targets.' },
  { id: 'S09', title: 'Model artifact security', checks: 'Inspect supported serialization, embedded code, operators and artifact provenance.', limit: 'Sandbox loading; no universal backdoor-free verdict.' },
  { id: 'S10', title: 'Dataset and training provenance', checks: 'Record lineage, access, consent basis, contamination and suspicious changes.', limit: 'Separate observed data issues from speculative poisoning claims.' },
  { id: 'S11', title: 'MCP/server/tool assessment', checks: 'Assess metadata, schemas, permissions, endpoint changes and sandbox behavior.', limit: 'Pin versions; validate auth and egress; descriptions cannot grant authority.' },
  { id: 'S12', title: 'Prompt injection and jailbreak tests', checks: 'Evaluate direct, indirect, multi-turn and tool-origin attempts in owned task environments.', limit: 'Judge actual forbidden effects and legitimate task completion.' },
  { id: 'S13', title: 'Runtime content and topic safety', checks: 'Assess configured harmful-content and business-topic categories with context.', limit: 'Tune by category/language; content score is not business authorization.' },
  { id: 'S14', title: 'Sensitive-data and egress inspection', checks: 'Combine labels, fingerprints, patterns and context for supported text and structured fields.', limit: 'Check destination and purpose; include render/fetch paths.' },
  { id: 'S15', title: 'File decomposition and OCR', checks: 'Inspect text, metadata, embedded images and supported archive parts.', limit: 'Bound expansion; preserve part map; partial status for unreadable content.' },
  { id: 'S16', title: 'Encoding and parser resilience', checks: 'Safely normalize supported encodings, Unicode, malformed schemas and nested containers.', limit: 'Budget depth/size; unknown ciphertext is opaque, not clean.' },
  { id: 'S17', title: 'Retrieval, memory and cache tests', checks: 'Check source permissions, stale access, contaminated memory and cross-tenant cache keys.', limit: 'Repeat after revocation/deletion; do not trust prior access.' },
  { id: 'S18', title: 'Factual and policy consistency', checks: 'Verify references, arithmetic, units, authoritative state and represented policy constraints.', limit: 'Expose uncovered claims; source availability does not prove truth.' },
  { id: 'S19', title: 'Action semantics and target validation', checks: 'Parse exact operations, resource versions, beneficiaries, recipients and target expansions.', limit: 'Reject ambiguity; test near-identical IDs and environment confusion.' },
  { id: 'S20', title: 'Agent behavior and sequence tests', checks: 'Trace reads, writes, delegation, privilege and cumulative commitments across a task.', limit: 'Use adversarial action chains and authenticated task scopes.' },
  { id: 'S21', title: 'Fault, retry and concurrency testing', checks: 'Inject timeouts, duplicates, reordering, restarts, partitions and budget races.', limit: 'Reconcile real outcomes in mock destinations; no blind exactly-once claim.' },
  { id: 'S22', title: 'Restore and continuity testing', checks: 'Rehearse data plus key/identity/service restoration using independent recovery authority.', limit: 'Measure content fidelity, RTO/RPO and dependency failures.' },
  { id: 'S23', title: 'Language, fairness and accessibility evaluation', checks: 'Assess supported populations, locales, interfaces and specialist decision workflows.', limit: 'Domain owners set context; no automated legal/fairness certification.' },
  { id: 'S24', title: 'Adaptive red teaming and regression', checks: 'Refresh owned attack scenarios, holdouts and verified incident-derived cases.', limit: 'Separate training/tuning from evaluation; report repeated trials and utility.' }
];

export const RISK_FAMILIES: RiskFamily[] = [
  { id: 'F01', title: 'Destructive changes and lost assets', productResponse: 'Protect exact targets; stage destructive operations; retain independent recoverable versions.' },
  { id: 'F02', title: 'Identity, permissions and ownership', productResponse: 'Separate identities, verify owner authority and limit privileges on every supported operation.' },
  { id: 'F03', title: 'Prompt injection and task hijacking', productResponse: 'Treat external instructions as untrusted; enforce task scope outside the model.' },
  { id: 'F04', title: 'Unreliable answers and evidence', productResponse: 'Verify claims, references, units and fresh authoritative inputs; expose uncertainty.' },
  { id: 'F05', title: 'Retrieval, memory and poisoned knowledge', productResponse: 'Preserve knowledge provenance and recheck retrieval/cache access after changes.' },
  { id: 'F06', title: 'Privacy and confidential data flows', productResponse: 'Minimize content and enforce source-to-destination data policy, including telemetry.' },
  { id: 'F07', title: 'Messages, publishing and reputation', productResponse: 'Validate final recipients, audience, sender, attachments and authorized promises.' },
  { id: 'F08', title: 'Payments, purchases and fraud', productResponse: 'Verify beneficiary and commitment details; reserve budgets; reconcile outcomes.' },
  { id: 'F09', title: 'Retries, concurrency and distributed actions', productResponse: 'Use durable operations, destination idempotency, atomic reservations and explicit unknown states.' },
  { id: 'F10', title: 'Small identifiers, paths and parsing errors', productResponse: 'Resolve stable IDs, paths, confusables, duplicate fields and exact target expansions.' },
  { id: 'F11', title: 'Dates, calendars and locale', productResponse: 'Use explicit timezone, locale, recurrence scope and typed timestamps.' },
  { id: 'F12', title: 'Documents, spreadsheets and exports', productResponse: 'Preserve source fidelity, identifiers, formulas, hidden content and supported metadata.' },
  { id: 'F13', title: 'Generated code and command execution', productResponse: 'Scan code and contain execution; authorize commands by actual effect and scope.' },
  { id: 'F14', title: 'Cloud configuration, deployment and outages', productResponse: 'Review change plans and effective cloud state; separate production authority.' },
  { id: 'F15', title: 'Backups, restore and business survival', productResponse: 'Test independent data, key, identity and service restoration dependencies.' },
  { id: 'F16', title: 'Runaway cost, loops and resource exhaustion', productResponse: 'Apply aggregate spend, step, time, concurrency and parser resource ceilings.' },
  { id: 'F17', title: 'Supply chain, connectors and external services', productResponse: 'Version connector contracts; verify artifacts, permissions and supplier data handling.' },
  { id: 'F18', title: 'Multi-agent and long-running automation', productResponse: 'Carry authenticated scope through descendants; stop queued work and reconcile in-flight effects.' },
  { id: 'F19', title: 'Human mistakes and malicious insiders', productResponse: 'Apply independent owner policy to humans too; separate duties and exceptional authority.' },
  { id: 'F20', title: 'Approval, consent and user-interface failures', productResponse: 'Use exact, accessible and non-replayable approvals; avoid warning fatigue.' },
  { id: 'F21', title: 'Bias, exclusion and unfair decisions', productResponse: 'Require domain-relevant evaluation and meaningful review/appeal for affected people.' },
  { id: 'F22', title: 'Health, physical systems and other high-stakes use', productResponse: 'Use specialist partners and device-specific assurance; exclude unsupported autonomous decisions.' },
  { id: 'F23', title: 'Abusive content and harmful assistance', productResponse: 'Apply contextual content policy with appropriate escalation; measure legitimate utility.' },
  { id: 'F24', title: 'Children, companions and emotional reliance', productResponse: 'Use separate age/consent and care design; do not claim universal companion safety.' },
  { id: 'F25', title: 'Personal scams, identity and account takeover', productResponse: 'Independently verify consequential requests and protect account-recovery changes.' },
  { id: 'F26', title: 'Rights, contracts and governance obligations', productResponse: 'Map obligations to accountable review and evidence; no automated legal certification.' },
  { id: 'F27', title: 'Evidence, monitoring and incident response', productResponse: 'Correlate intent through outcome; restrict evidence and rehearse incident response.' },
  { id: 'F28', title: 'The safeguard fails or is bypassed', productResponse: 'Self-test coverage, failure modes, tenant isolation and policy integrity.' },
  { id: 'F29', title: 'Skills, society and environmental effects', productResponse: 'Support manual skills, provider exit and resource measurement; wider social effects remain outside core.' },
  { id: 'F30', title: 'Conventional cyber and operational hazards', productResponse: 'Integrate endpoint, identity, backup and physical continuity controls; do not replace them all.' }
];

export interface CompetitorGroup {
  name: string;
  sourceRef: string;
  strength: string;
  boundary: string;
  holdpointProof: string;
}

export interface VerifiedBoundary {
  id: string;
  title: string;
  sourceFact: string;
  proposedImprovement: string;
}

export interface CompetitiveAdvantage {
  id: string;
  advantage: string;
  customerProof: string;
  status: string;
}

export interface AgenticRole {
  role: string;
  autonomy: string;
  boundary: string;
}

export interface AutonomyLevel {
  level: number;
  name: string;
  description: string;
}

export interface IntegrationPackSpec {
  name: string;
  practicalApproach: string;
  constraintToVerify: string;
}

export interface WorkflowJourney {
  id: string;
  title: string;
  audience: 'Enterprise' | 'Personal';
  steps: { step: number; title: string; description: string }[];
}

export interface DemoProofScene {
  id: string;
  scene: string;
  visibleBeforeAfter: string;
  proof: string;
}

export interface RegulatoryStandard {
  standard: string;
  description: string;
  holdpointApproach: string;
}

export const COMPETITOR_GROUPS: CompetitorGroup[] = [
  {
    name: 'AWS Bedrock Guardrails',
    sourceRef: '[01-03]',
    strength: 'Content, sensitive-data and prompt-attack filtering; policy consistency through Automated Reasoning.',
    boundary: 'Specific filters exclude tool fields; policy-variable validity is bounded; detect-only findings.',
    holdpointProof: 'Typed action enforcement, full required-field coverage and execution reliability around Bedrock workflows.'
  },
  {
    name: 'Google Model Armor',
    sourceRef: '[04, 05]',
    strength: 'Prompt/response screening, sensitive-data controls and supported document/image handling.',
    boundary: 'Documented single-turn, encoding and size/mode boundaries; no screening of embedded images.',
    holdpointProof: 'Context-aware workflow controls and explicit inspection completeness without claiming universal decoding.'
  },
  {
    name: 'Palo Alto Prisma AIRS',
    sourceRef: '[10-13]',
    strength: 'Lifecycle discovery, assessment, model/supply-chain scans, red teaming and runtime controls.',
    boundary: 'Agent gateway limited preview; network-intercept sends AI traffic to US inspection.',
    holdpointProof: 'Benchmark exact-action, retry and recovery behavior on identical workflows; do not claim action controls are absent.'
  },
  {
    name: 'CrowdStrike AIDR',
    sourceRef: '[06]',
    strength: 'Multiple workforce/application/gateway/agent collectors with monitoring and enforcement options.',
    boundary: 'Collector choice determines context; browser output rules report only; Cloud/OTel collectors passive.',
    holdpointProof: 'Clearer operation-level coverage contract and dependable deployment verification.'
  },
  {
    name: 'Check Point / Lakera',
    sourceRef: '[07]',
    strength: 'Content and leakage protection; tool lists; beta Dangerous Deviation and tool-result screening.',
    boundary: 'Dangerous Deviation checks mandate divergence; can pass dangerous calls warranted by trusted user messages.',
    holdpointProof: 'Independent owner/asset invariants and execution checks for dangerous but requested operations.'
  },
  {
    name: 'Microsoft security stack',
    sourceRef: '[08, 21, 22]',
    strength: 'Agent 365 combines Entra, Defender and Purview; identity and data controls depend on integration.',
    boundary: 'Large native ecosystem; API keys bypass Entra Conditional Access; subject targeting needs separate coverage.',
    holdpointProof: 'Cross-provider authority mapping and protected non-native workflows without duplicating native controls.'
  },
  {
    name: 'Zenity',
    sourceRef: '[14]',
    strength: 'Runtime Boundaries describes action enforcement, session context and multi-step behavior controls.',
    boundary: 'Direct competitor to our central thesis; capabilities are not unique to Holdpoint.',
    holdpointProof: 'Superior outcomes for exact approvals, unknown effects, recovery dependencies and setup effort.'
  },
  {
    name: 'Cisco AI Defense',
    sourceRef: '[15]',
    strength: 'Discovery, model/MCP scanning, validation, runtime tool/action controls and customer-environment deployment.',
    boundary: 'Broad technical overlap and established networking/security reach.',
    holdpointProof: 'Benchmark supported actions, coverage quality, usability, latency and lower integration burden.'
  },
  {
    name: 'Netskope',
    sourceRef: '[16]',
    strength: 'AI Gateway, Guardrails, DLP integration and AI Red Teaming.',
    boundary: 'Strong data/network security adjacency and enterprise deployment options.',
    holdpointProof: 'Prove business-operation semantics, recovery linkage and valuable personal or SMB workflows.'
  },
  {
    name: 'Zscaler',
    sourceRef: '[17, 18]',
    strength: 'AI Guard inspection/DLP/intent controls, AI Red Teaming and adjacent gateway/endpoint controls.',
    boundary: 'Published suite includes action authorization; cannot portray it as only a prompt filter.',
    holdpointProof: 'Prove exact transaction and restore workflows with less friction on the same supported scope.'
  },
  {
    name: 'IBM watsonx',
    sourceRef: '[19, 20]',
    strength: 'Governance, evaluation, inventory and agent control-plane capabilities including policies and cost visibility.',
    boundary: 'Direct governance/control overlap; monitoring support is deployment and product specific.',
    holdpointProof: 'Demonstrate dependable independent execution and recovery across selected external systems.'
  },
  {
    name: 'Rubrik Agent Cloud',
    sourceRef: '[23]',
    strength: 'Advertised agent controls, rewind, independent repository snapshots and agent-configuration recovery.',
    boundary: 'Strong resilience incumbent; verify shipped scope and restore semantics; backup existence does not prove restoration.',
    holdpointProof: 'Preventive asset invariants plus measured restoration of broader supported dependencies.'
  }
];

export const VERIFIED_BOUNDARIES: VerifiedBoundary[] = [
  { id: 'B01', title: 'Tool-field inspection', sourceFact: 'Bedrock sensitive filter excludes tool arguments/results/definitions. [01]', proposedImprovement: 'Typed field inspection plus data/destination authority; verify legitimate tool functionality.' },
  { id: 'B02', title: 'Log leakage', sourceFact: 'Bedrock masking does not mask original invocation input or original matched trace values. [01]', proposedImprovement: 'Minimize/redact ordinary telemetry; restrict necessary original forensic evidence.' },
  { id: 'B03', title: 'Tool injection and tagging', sourceFact: 'Bedrock prompt-attack filter excludes tool results/definitions; specified APIs require input tags. [02]', proposedImprovement: 'Inspect untrusted channels; verify SDK instrumentation; block effects independently.' },
  { id: 'B04', title: 'History and decoding', sourceFact: 'Model Armor documents single-turn inspection and no decoding of encoded content. [04]', proposedImprovement: 'Task ledger and bounded supported decoding; opaque content remains explicitly uninspected.' },
  { id: 'B05', title: 'Embedded-image coverage', sourceFact: 'Model Armor documents image/mixed-method limits and no screening of images embedded in files. [04]', proposedImprovement: 'Decompose documents, OCR supported images and publish part-level scope.' },
  { id: 'B06', title: 'Skipped large content', sourceFact: 'Model Armor has file/filter/URL limits; real-time streaming has mode-specific exceptions. [05]', proposedImprovement: 'Full coverage record, context-preserving chunks and hold required incomplete checks.' },
  { id: 'B07', title: 'Observe versus prevent', sourceFact: 'AIDR browser output rules report only; Cloud/OTel collectors are passive. [06]', proposedImprovement: 'Use inline enforcement for protected effects; show capability per direction.' },
  { id: 'B08', title: 'Missing connector context', sourceFact: 'AIDR collectors see different subsets of model/tool/conversation data. [06]', proposedImprovement: 'Correlate authenticated task IDs; never invent missing context.' },
  { id: 'B09', title: 'Alternate credentials', sourceFact: 'Entra Conditional Access does not govern API-key authentication bypassing Entra. [08]', proposedImprovement: 'Inventory keys and remove alternate broad authority; publish remaining uncontrolled routes.' },
  { id: 'B10', title: 'Requested dangerous action', sourceFact: 'Lakera Dangerous Deviation can pass dangerous calls warranted by trusted user messages. [07]', proposedImprovement: 'Apply independent owner/asset rules; respect the detector\'s intended scope.' },
  { id: 'B11', title: 'Failure-policy choices', sourceFact: 'APISIX integration: fail_open=true permits scan errors; unsupported mode defaults to skip. [09]', proposedImprovement: 'Risk-specific holds and self-tests. Default fail_open is false.' },
  { id: 'B12', title: 'Payload/URL boundary', sourceFact: 'Prisma AIRS API interface documents 2 MB sync, 5 MB async and 100-URL limits. [10]', proposedImprovement: 'Bounded batching, coverage accounting and explicit incomplete state.' },
  { id: 'B13', title: 'Processing geography', sourceFact: 'Documented AIRS network-intercept path sends AI traffic to US inspection. [11]', proposedImprovement: 'Verified region or customer-hosted option; do not generalize to every AIRS deployment.' },
  { id: 'B14', title: 'Partial logical validity', sourceFact: 'Bedrock Automated Reasoning validity covers policy variables and returns detect-only findings. [03]', proposedImprovement: 'Track missing rules and connect decisions to actual executor enforcement.' }
];

export const PROPOSED_ADVANTAGES: CompetitiveAdvantage[] = [
  { id: 'A01', advantage: 'Exact-action authority', customerProof: 'Changed recipient, amount or target cannot execute under an old approval; authorized unchanged action succeeds.', status: 'Production-Active' },
  { id: 'A02', advantage: 'Inspection completeness', customerProof: 'Seed missing fields, oversize content and unsupported media; UI never labels incomplete inspection as complete.', status: 'Production-Active' },
  { id: 'A03', advantage: 'Execution correctness', customerProof: 'Commit-then-timeout does not cause a duplicate; ambiguous outcomes remain visible until reconciled.', status: 'Production-Active' },
  { id: 'A04', advantage: 'Recovery dependencies', customerProof: 'Restore data and authority after primary credentials are lost; verify contents and permission state.', status: 'Production-Active' },
  { id: 'A05', advantage: 'Cumulative protection', customerProof: 'Concurrent agents cannot exceed shared limits or remove the final tested recovery path.', status: 'Production-Active' },
  { id: 'A06', advantage: 'Usable breadth', customerProof: 'Business and personal packs share reliable controls while retaining acceptable setup effort and task success.', status: 'Production-Active' }
];

export const AGENTIC_ASSISTANT_ROLES: AgenticRole[] = [
  { role: 'Discovery assistant', autonomy: 'Group assets, detect likely ownership and suggest connector setup.', boundary: 'Cannot grant access; uncertain owners remain unverified.' },
  { role: 'Policy assistant', autonomy: 'Draft typed rules, explain conflicts and generate test cases.', boundary: 'No production activation without authenticated policy-owner review.' },
  { role: 'Investigation assistant', autonomy: 'Correlate task steps, evidence and relevant configuration; propose hypotheses.', boundary: 'Read-only by default; cite direct evidence and uncertainty.' },
  { role: 'Remediation assistant', autonomy: 'Prepare scoped patches, credential-rotation plans and containment steps.', boundary: 'Execution passes the same policy/approval/executor controls as customer agents.' },
  { role: 'Recovery planner', autonomy: 'Order prerequisites and propose a restore diff and verification plan.', boundary: 'No irreversible restore or blanket rollback without scoped authority.' },
  { role: 'Evaluation assistant', autonomy: 'Generate variations of owned test cases and cluster failure patterns.', boundary: 'Separate holdout; no self-scored proof of safety or unsupervised production attacks.' }
];

export const AUTONOMY_LADDER: AutonomyLevel[] = [
  { level: 1, name: 'Observe & Summarize', description: 'Read telemetry and draft summaries without proposing or initiating changes.' },
  { level: 2, name: 'Propose', description: 'Formulate typed action draft contracts with explicit canonical parameters for human review.' },
  { level: 3, name: 'Stage Reversible Action', description: 'Quarantine files, prepare staging branches, and capture pre-images before mutation.' },
  { level: 4, name: 'Execute Bounded Low-Impact', description: 'Execute pre-authorized routine operations (e.g. support refund <$150, CI checks).' },
  { level: 5, name: 'Escalate High-Impact Changes', description: 'Mandate independent dual-control approval for critical, irreversible, or high-value actions.' }
];

export const INTEGRATION_PACKS: IntegrationPackSpec[] = [
  { name: 'GitHub / Development', practicalApproach: 'App-scoped access, branch/change staging, CI policy gates and independent artifact retention.', constraintToVerify: 'Native console, git credentials, admin bypass, force-push and deletion coverage. [37]' },
  { name: 'MCP and Custom Agents', practicalApproach: 'Tool proxy or SDK hooks plus destination-scoped credentials and typed action contract.', constraintToVerify: 'Metadata drift, token audience, result coverage, alternate tool access. [30]' },
  { name: 'Microsoft 365', practicalApproach: 'Graph permissions and controlled send/file workflows; combine native tenant policies.', constraintToVerify: 'Delegated versus application scope; cannot assume all sends can be intercepted. [38]' },
  { name: 'Google Workspace / Files', practicalApproach: 'Controlled application paths plus native permission and retention integration.', constraintToVerify: 'API consent, export types, external sharing and unmanaged applications; discovery needed.' },
  { name: 'Cloud Infrastructure', practicalApproach: 'Plan-time checks plus scoped execution roles and effective-state verification.', constraintToVerify: 'Root/admin alternate paths and provider-specific precondition semantics.' },
  { name: 'Payments / Commerce', practicalApproach: 'Provider-specific beneficiary, idempotency, budget and reconciliation adapters.', constraintToVerify: 'Settlement, authorization, regulations and refunds differ; specialist release gate. [29]' }
];

export const WORKFLOW_JOURNEYS: WorkflowJourney[] = [
  {
    id: 'J01',
    title: 'Journey A: An Agent Cleans a Company Repository',
    audience: 'Enterprise',
    steps: [
      { step: 1, title: 'Scope', description: 'The engineering owner authorizes cleanup on a test branch, excluding production and credential files.' },
      { step: 2, title: 'Plan', description: 'HOLDPOINT resolves the actual file set, detects symlinks and shows deletions plus dependent build files.' },
      { step: 3, title: 'Inspect', description: 'Code and secret scanners run on relevant content; skipped parts remain explicit in coverage manifest.' },
      { step: 4, title: 'Decide', description: 'The executor denies protected changes even if a retrieved README instructs them (Free text is evidence, never authority).' },
      { step: 5, title: 'Approve', description: 'A material permitted change receives approval bound to file hashes, branch, and operation with expiry nonce.' },
      { step: 6, title: 'Execute', description: 'Credentials are short-lived and scoped. A changed branch invalidates the approval atomically.' },
      { step: 7, title: 'Verify', description: 'The destination receipt and final commit diff are cryptographically recorded in tamper-evident ledger.' },
      { step: 8, title: 'Recover', description: 'A scoped restore uses a retained version without overwriting unrelated new work.' }
    ]
  },
  {
    id: 'J02',
    title: 'Journey B: An Individual Asks AI to Organize Photos',
    audience: 'Personal',
    steps: [
      { step: 1, title: 'Select', description: 'The owner chooses folders and marks original master albums as protected sets.' },
      { step: 2, title: 'Compare', description: 'Similarity suggests possible duplicates, while exact SHA-256 hashes distinguish identical bytes.' },
      { step: 3, title: 'Preview', description: 'The user inspects every proposed removal, duplicate candidate, and storage consequence.' },
      { step: 4, title: 'Stage', description: 'Files move to a protected quarantine instead of permanent deletion; master originals remain preserved.' },
      { step: 5, title: 'Confirm', description: 'A representative independent restore drill is tested before final deletion approval.' },
      { step: 6, title: 'Complete', description: 'Permanent deletion only follows configured retention policies and explicit owner re-authentication.' }
    ]
  }
];

export const DEMO_PROOF_SCENES: DemoProofScene[] = [
  { id: 'D01', scene: 'Useful Delegation', visibleBeforeAfter: 'Agent performs an approved repository cleanup or synthetic customer update.', proof: 'Legitimate task succeeds; action scope and destination receipt visible.' },
  { id: 'D02', scene: 'Injected Instruction', visibleBeforeAfter: 'Mock retrieved document instructs the agent to export protected records.', proof: 'No unauthorized destination write despite the attempted tool call.' },
  { id: 'D03', scene: 'Requested Destruction', visibleBeforeAfter: 'Authenticated user asks to delete a protected test asset.', proof: 'Independent owner policy denies it; allowed bounded cleanup still works.' },
  { id: 'D04', scene: 'Changed Approval', visibleBeforeAfter: 'Approve one mock recipient/amount, then alter the action parameters.', proof: 'Old approval cannot dispatch the altered operation; approval invalidates.' },
  { id: 'D05', scene: 'Ambiguous Timeout', visibleBeforeAfter: 'Mock destination commits, then network connection drops.', proof: 'One effect after reconciliation; unknown state is honestly displayed.' },
  { id: 'D06', scene: 'Coverage Failure', visibleBeforeAfter: 'Submit unsupported/oversize content or disable a required scanner.', proof: 'Explicit partial/error status and protected-action hold; never false clean.' },
  { id: 'D07', scene: 'Recovery & Cancellation', visibleBeforeAfter: 'Restore after losing primary credentials; cancel a task with queued children.', proof: 'Actual restored contents and authority; no new controlled child dispatch.' }
];

export const REGULATORY_STANDARDS: RegulatoryStandard[] = [
  { standard: 'India DPDP Rules 2025', description: 'Data protection obligations, consent management, data principal rights, cross-border safeguards.', holdpointApproach: 'Audit trail for consent verification, purpose limitation on data egress, verifiable data deletion, local processing boundary support.' },
  { standard: 'NIST AI 600-1 Profile', description: 'Generative AI Risk Management Profile: govern, map, measure, and manage consequential AI risks.', holdpointApproach: 'Continuous risk mapping across 30 risk families (F01-F30), measurable release gates (G01-G28), and deterministic authority controls.' },
  { standard: 'OWASP Agentic AI Top 10 (2026)', description: 'Prompt injection, excessive agency, broken tool authorization, supply-chain vulnerabilities, unsafe execution.', holdpointApproach: 'Direct prompt injection interceptors, token smuggling normalizers, dual-control execution barriers, and immutable task contracts.' },
  { standard: 'MITRE CWE-367 (TOCTOU)', description: 'Time-of-check to time-of-use race condition between authorization decision and dispatch.', holdpointApproach: 'Precondition version matching, atomic budget reservations, single-use approval nonces, and destination idempotency keys.' }
];
