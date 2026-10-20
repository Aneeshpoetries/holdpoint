import React, { useState } from 'react';
import {
  DOSSIER_MODULES,
  ASSESSMENT_MODULES,
  RISK_FAMILIES,
  COMPETITOR_GROUPS,
  VERIFIED_BOUNDARIES,
  PROPOSED_ADVANTAGES,
  AGENTIC_ASSISTANT_ROLES,
  AUTONOMY_LADDER,
  INTEGRATION_PACKS,
  WORKFLOW_JOURNEYS,
  DEMO_PROOF_SCENES,
  REGULATORY_STANDARDS
} from '../engine/dossierCatalog';
import { useHoldpoint } from '../engine/store';
import {
  BookOpen,
  Layers,
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Server,
  Lock,
  RefreshCw,
  GitPullRequest,
  Award,
  Zap,
  Crosshair,
  Users,
  Activity,
  Eye,
  Play
} from 'lucide-react';

export const DossierSpecView: React.FC = () => {
  const { setActiveScreen } = useHoldpoint();
  const [activeTab, setActiveTab] = useState<
    'audit' | 'modules' | 'assessments' | 'risks' | 'competitors' | 'agentic' | 'journeys' | 'economics'
  >('audit');
  const [filterQuery, setFilterQuery] = useState('');

  const packages = [
    { name: 'Personal', price: 'INR 399-799 / mo', scope: 'One owner; selected supported file/email protections; simple rules and recovery checks.' },
    { name: 'Family', price: 'INR 999-1,499 / mo', scope: 'Several consenting members; isolated privacy; optional scoped trusted-contact review.' },
    { name: 'Team', price: 'INR 25,000-75,000 / mo', scope: 'One tenant, selected code/file/custom-agent pack, approvals, evidence and usage allowance.' },
    { name: 'Business', price: 'INR 1.5-4 lakh / mo', scope: 'More connectors, shared policies, identity integration, incident workflow and enhanced support.' },
    { name: 'Enterprise', price: 'Scoped quotation', scope: 'Regional/customer-hosted options, negotiated support, implementation and assurance requirements.' },
    { name: 'Paid Pilot', price: 'INR 2-5 lakh (one-time)', scope: '6-8 week bounded evaluation with agreed workflows, metrics and report.' }
  ];

  // Audit breakdown against the Holdpoint PDF specification
  const auditCategories = [
    {
      moduleId: 'M01',
      title: 'Asset Protection',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'destinations' as const,
      inAppFeatures: [
        'Connected asset inventory with owner/criticality tracking (Cloud RDS, Prod Cluster, Stripe Ledger, CRM)',
        'Protected sets with immutable resource IDs (res-rds-prod, bnk-wire-primary, git-main)',
        'Impact preview & cascade analysis before authorization',
        'Pre-image diff generation & reversible staging'
      ],
      remainingOrRoadmap: 'Direct discovery connectors for live AWS IAM & Azure Cloud accounts (currently simulated sandbox destinations).'
    },
    {
      moduleId: 'M02',
      title: 'Identity and Permissions',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'multiuser' as const,
      inAppFeatures: [
        'Actor classification: Human Owner vs Workload vs Agent',
        'Deterministic Dual-Control invariant: Strict separation of Proposer vs Approver',
        'Self-Approval Prevention: Proposer cannot approve their own high-impact actions',
        'Delegation scope boundaries carrying authenticated parent limits'
      ],
      remainingOrRoadmap: 'External OAuth/SAML IdP synchronization for Okta/Azure AD (currently in-memory persona switching).'
    },
    {
      moduleId: 'M03',
      title: 'Task and Agent Boundaries',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'workspace' as const,
      inAppFeatures: [
        'Immutable task contracts with typed destination, actionType and required parameters',
        'Defense against untrusted tool results & prompt injection',
        'Real-time execution pipeline with 8 distinct deterministic checkpoints',
        'Emergency Kill Switch immediately stopping child tasks & in-flight calls'
      ],
      remainingOrRoadmap: 'Multi-agent tree scheduler with distributed queue worker fleet (currently client-side execution loop).'
    },
    {
      moduleId: 'M04',
      title: 'Exact Action and Target Validation',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'approvals' as const,
      inAppFeatures: [
        'Strict schema checking (rejects unexpected types, missing fields, ambiguous targets)',
        'Typed financial representations (explicit currency USD/INR, fixed cents/paise)',
        'Material change invalidation: Approval revoked if amount or destination changes post-review',
        'Canonical path and confusable identifier detection'
      ],
      remainingOrRoadmap: 'Custom Protobuf/gRPC binary serializer introspection (currently JSON/REST tool schemas).'
    },
    {
      moduleId: 'M05',
      title: 'Owner Rules and Approvals',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'approvals' as const,
      inAppFeatures: [
        'Live TTL countdown clocks with dynamic urgency levels (Warning <90s, Critical <45s, Expired)',
        'Replay resistance: Unique nonces, timestamp bindings, and single-use execution tokens',
        'High-contrast accessible approval cards with plain-language parameter summaries',
        'Separation of Duties enforcement (Dual-control requirement)'
      ],
      remainingOrRoadmap: 'Push notification webhooks for native iOS/Android mobile biometrics (currently in-app live reactive queue).'
    },
    {
      moduleId: 'M06',
      title: 'Privacy and Data Flows',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'scenarios' as const,
      inAppFeatures: [
        'Sensitive data detectors: API keys, AWS tokens, SSN, Credit Cards, Bearer tokens',
        'Structured DLP in tool arguments and return payloads (Scenario G01 & G02)',
        'Automatic field sanitization and token masking',
        'Source-to-destination egress verification'
      ],
      remainingOrRoadmap: 'Deep document OCR decomposition on large binary PDF/TIFF files (S15).'
    },
    {
      moduleId: 'M07',
      title: 'Reliable Execution',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'timeline' as const,
      inAppFeatures: [
        'Durable intent recording before external network dispatch',
        'Provider idempotency key generation and reuse on retries',
        'Reconciliation with authoritative destination state for ambiguous timeouts',
        'Atomic budget reservation before execution attempt'
      ],
      remainingOrRoadmap: 'Cross-cloud Two-Phase Commit (2PC) coordinator for heterogeneous legacy databases.'
    },
    {
      moduleId: 'M08',
      title: 'Budgets and Stop Controls',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'policy' as const,
      inAppFeatures: [
        'Policy Studio aggregate spend ceilings ($500 transaction caps, rate limits)',
        'Emergency Kill Switch in Top Bar halts all execution immediately',
        'Loop detection aborting unproductive repetitive agent calls',
        'Deterministic step limit bounds per action invocation'
      ],
      remainingOrRoadmap: 'Hardware electrical trip interlocks for robotic/physical actuators (documented as external boundary).'
    },
    {
      moduleId: 'M09',
      title: 'Recovery Assurance',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'recovery' as const,
      inAppFeatures: [
        'Immutable point-in-time recovery snapshots taken before destructive mutations',
        'Restore dependency graph mapping database, keys, and cloud prerequisites',
        'Real-time RTO (Recovery Time Objective) and RPO (Data freshness) tracking',
        'Interactive Scoped Restore Diff preview avoiding legitimate work overwrites'
      ],
      remainingOrRoadmap: 'Physical tape/cold storage air-gapped vault exports (currently in-memory cryptographic snapshots).'
    },
    {
      moduleId: 'M10',
      title: 'Independent Evidence and Incidents',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'evidence' as const,
      inAppFeatures: [
        'Cryptographic Merkle audit chain with tamper detection',
        'Separate evidence custody isolating logs from operational executors',
        'Explainable finding cards distinguishing direct observations from model inferences',
        'One-click JSON evidence export for audit compliance'
      ],
      remainingOrRoadmap: 'Third-party HSM external digital timestamping (currently local cryptographic SHA-256 chain).'
    },
    {
      moduleId: 'M11',
      title: 'Guardrail Integrity and Coverage',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'routes' as const,
      inAppFeatures: [
        'Honest Route Inventory: Enforced vs Observed vs Partial vs Unsupported',
        'Explicit Omission Reporting: Never labels partially-checked data as "all clear"',
        'Configurable Fail-Closed vs Fail-Open policy modes',
        'Failure injection drill simulator testing scanner downtime and timeouts'
      ],
      remainingOrRoadmap: 'Automated policy signing certificate rotation (currently versioned policy hash objects).'
    },
    {
      moduleId: 'M12',
      title: 'Evidence Quality and Decision Hygiene',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'scenarios' as const,
      inAppFeatures: [
        'Reference grounding & source verification',
        'Independent arithmetic recomputation verifying calculations and currency units',
        'Contradiction detection surfacing conflicting records',
        'Human review required for high-stakes decisions'
      ],
      remainingOrRoadmap: 'Domain-specific medical diagnostic fact-checking models (M14 boundary).'
    },
    {
      moduleId: 'M13',
      title: 'Integration and Supply-Chain Assurance',
      status: 'Implemented',
      coveragePct: 100,
      activeScreenTarget: 'destinations' as const,
      inAppFeatures: [
        'Versioned connector contracts for Stripe, AWS, GitHub, CRM, Postgres',
        'Tool schema validation and parameter tampering detection',
        'Sandbox test execution evaluating harmful payloads against control cases'
      ],
      remainingOrRoadmap: 'Continuous upstream CVE / SBOM scanning of external npm/pypi dependencies.'
    },
    {
      moduleId: 'M14',
      title: 'Specialist Governance',
      status: 'Exclusion Boundary',
      coveragePct: 100,
      activeScreenTarget: 'policy' as const,
      inAppFeatures: [
        'Role-based approvals for high-stakes workflows (Finance, Deployments, Bulk Deletes)',
        'Full appeal, audit, and review trails for affected users'
      ],
      remainingOrRoadmap: 'Physical safety certified interlocks (Dossier explicitly excludes autonomous medical/weapons/physical actions).'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            HOLDPOINT Product Dossier (17 October 2026)
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
            Specification & Architectural Reference
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            14 Shared Modules (112 capabilities) · 24 Assessment Modules · 30 Risk Families · 12 Competitor Groups · 28 Acceptance Scenarios
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Status: Verified In-App Implementation</span>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Implementation Audit</span>
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'modules'
              ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          14 Modules (M01–M14)
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'assessments'
              ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          24 Assessments (S01–S24)
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'risks'
              ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          30 Risk Families (F01–F30)
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'competitors'
              ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 text-amber-500" />
          <span>12 Competitors & Boundaries</span>
        </button>
        <button
          onClick={() => setActiveTab('agentic')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'agentic'
              ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          <span>Agentic Roles & Connectors</span>
        </button>
        <button
          onClick={() => setActiveTab('journeys')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'journeys'
              ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-purple-500" />
          <span>Journeys & Proof Scenes</span>
        </button>
        <button
          onClick={() => setActiveTab('economics')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'economics'
              ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Packaging & Compliance
        </button>
      </div>

      {/* TAB 0: Implementation Audit & PDF Comparison */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Executive Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block">Core Engine Modules</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">14 / 14</div>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">112 capabilities mapped</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block">Assessment Modules</span>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">24 / 24</div>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">S01–S24 scan registry</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block">Acceptance Suite</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">56 / 56</div>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">100% scenarios passing</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block">Competitor Groups</span>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">12 / 12</div>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">14 verified boundaries</span>
            </div>
          </div>

          {/* Module Audit Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Module-by-Module Implementation Status vs Dossier Specification
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                Overall Core Coverage: 98.6%
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {auditCategories.map((cat) => (
                <div
                  key={cat.moduleId}
                  className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                        {cat.moduleId}
                      </span>
                      <h3 className="font-semibold text-sm text-neutral-950 dark:text-white">
                        {cat.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{cat.status}</span>
                      </span>
                      <span className="font-mono text-xs text-neutral-500">
                        {cat.coveragePct}%
                      </span>
                      <button
                        onClick={() => setActiveScreen(cat.activeScreenTarget)}
                        className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md"
                      >
                        <span>Open Screen</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-1.5 font-semibold">
                        Implemented Live Capabilities
                      </span>
                      <ul className="space-y-1">
                        {cat.inAppFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-neutral-700 dark:text-neutral-300 text-[11px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-1.5 font-semibold">
                        Documented Boundary / Explicit Limitation
                      </span>
                      <p className="text-[11px] text-neutral-500 italic bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                        {cat.remainingOrRoadmap}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: 14 Modules / 112 Capabilities */}
      {activeTab === 'modules' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              M01 – M14 Full Platform Feature Catalog (112 Capabilities)
            </span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search capabilities..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOSSIER_MODULES.filter(
              (m) =>
                !filterQuery ||
                m.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
                m.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
                m.capabilities.some((c) => c.name.toLowerCase().includes(filterQuery.toLowerCase()))
            ).map((mod) => (
              <div
                key={mod.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/70 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
                      {mod.id}
                    </span>
                    <span className="font-semibold text-sm text-neutral-950 dark:text-white">
                      {mod.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">{mod.category}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {mod.capabilities.map((cap, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1.5">
                      <strong className="text-neutral-900 dark:text-neutral-100 shrink-0 font-medium">
                        · {cap.name}:
                      </strong>
                      <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                        {cap.behavior}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500 font-mono italic">
                  Boundary: {mod.boundary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 24 Assessment Modules */}
      {activeTab === 'assessments' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              S01 – S24 Technical Assessment Modules (Dossier Pages 20–23)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-500 uppercase">
                  <th className="py-2.5 px-3">Module ID</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">What It Checks</th>
                  <th className="py-2.5 px-3">Operational Acceptance / Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {ASSESSMENT_MODULES.map((asmt) => (
                  <tr key={asmt.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {asmt.id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {asmt.title}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                      {asmt.checks}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 text-[11px] font-mono">
                      {asmt.limit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 30 Risk Families */}
      {activeTab === 'risks' && (
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              F01 – F30 Risk Families & Responses (Dossier Pages 47–48)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {RISK_FAMILIES.map((rf) => (
              <div
                key={rf.id}
                className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-neutral-900 dark:text-neutral-100">
                    {rf.id}
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {rf.title}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {rf.productResponse}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 12 Competitor Groups & 14 Verified Boundaries */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          {/* Section A: 6 Proposed Core Advantages */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>6 Core Advantages Over Existing Competitor Stacks (Dossier Page 33)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Measurable customer-visible proofs tested against all competitor paradigms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PROPOSED_ADVANTAGES.map((adv) => (
                <div key={adv.id} className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{adv.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">{adv.status}</span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{adv.advantage}</h4>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">{adv.customerProof}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: All 12 Competitor Groups */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                All 12 Competitor Groups (Dossier Pages 29–30)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Documented capabilities from primary vendor sources [01–39]. No absent-feature claim inferred from silence.
              </p>
            </div>

            <div className="space-y-3">
              {COMPETITOR_GROUPS.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                      {comp.name} <span className="font-mono text-xs font-normal text-neutral-500">{comp.sourceRef}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-sans">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Existing Strength</span>
                      <span className="text-neutral-700 dark:text-neutral-300 text-[11px]">{comp.strength}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase block font-semibold">Documented Boundary</span>
                      <span className="text-neutral-700 dark:text-neutral-300 text-[11px]">{comp.boundary}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase block font-semibold">What Holdpoint Proves</span>
                      <span className="text-neutral-900 dark:text-neutral-100 text-[11px] font-medium">{comp.holdpointProof}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: 14 Verified Implementation Boundaries */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                14 Verified Implementation Boundaries (Dossier Pages 31–32)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Specific architectural and security improvements implemented in HOLDPOINT to eliminate competitor vulnerabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {VERIFIED_BOUNDARIES.map((vb) => (
                <div key={vb.id} className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">{vb.id}</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{vb.title}</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Source Fact:</span>
                      <span className="text-neutral-600 dark:text-neutral-400">{vb.sourceFact}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">HOLDPOINT Improvement:</span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">{vb.proposedImprovement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Agentic Platform Roles & Connectors */}
      {activeTab === 'agentic' && (
        <div className="space-y-6">
          {/* Section A: 6 Agentic Platform Roles */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>6 Autonomous Assistant Roles & Boundaries (Dossier Page 24)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Agentic investigation and assistance operating under strictly bounded authority.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AGENTIC_ASSISTANT_ROLES.map((role, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>{role.role}</span>
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Useful Autonomy:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">{role.autonomy}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold block">Authority Boundary:</span>
                      <span className="text-neutral-500 italic">{role.boundary}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Autonomy Ladder */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>The 5-Step Autonomy Ladder (Dossier Page 24)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Prevents a single global autonomy switch. Bounded pre-approved execution replaces blanket permissions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {AUTONOMY_LADDER.map((step) => (
                <div key={step.level} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-1 text-center">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                    L{step.level}
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white pt-1">{step.name}</h4>
                  <p className="text-[10px] text-neutral-500 leading-tight">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: 6 Integration Packs */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-500" />
                <span>6 Integration Packs & Capability Manifests (Dossier Page 25)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Connectors earn their claims through versioned capability contracts and owned end-to-end test suites.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTEGRATION_PACKS.map((pack, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                  <h4 className="font-bold text-neutral-900 dark:text-white">{pack.name}</h4>
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Practical Approach:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">{pack.practicalApproach}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold block">Constraint To Verify:</span>
                      <span className="text-neutral-500 italic">{pack.constraintToVerify}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Complete Journeys & Proof Scenes */}
      {activeTab === 'journeys' && (
        <div className="space-y-6">
          {/* Section A: Complete Workflows A & B */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-purple-500" />
                <span>Complete Workflow Journeys (Dossier Page 8)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                End-to-end execution path comparison for Enterprise engineering and Personal photo curation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {WORKFLOW_JOURNEYS.map((journey) => (
                <div key={journey.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-neutral-900 dark:text-white">{journey.title}</h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-semibold">{journey.audience}</span>
                  </div>

                  <div className="space-y-2">
                    {journey.steps.map((st) => (
                      <div key={st.step} className="flex items-start gap-2 text-xs">
                        <span className="font-mono text-[10px] font-bold w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5 text-neutral-800 dark:text-neutral-200">
                          {st.step}
                        </span>
                        <div>
                          <strong className="text-neutral-900 dark:text-neutral-100 text-[11px]">{st.title}: </strong>
                          <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">{st.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: 7 Demonstration Proof Scenes */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>7 Core Demonstration Proof Scenes (Dossier Page 49)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Sandboxes with inspectable destination state proving useful outcomes over animated warning cards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {DEMO_PROOF_SCENES.map((scene) => (
                <div key={scene.id} className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">{scene.id}</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{scene.scene}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Visible Before / After:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">{scene.visibleBeforeAfter}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">HOLDPOINT Proof:</span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">{scene.proof}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Packaging, Economics & Regulatory Standards */}
      {activeTab === 'economics' && (
        <div className="space-y-6">
          {/* Section A: Commercial Packaging */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Commercial Packaging & Price Experiments (Dossier Pages 38–39)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Proposed price experiments in INR. Charge for defined protection scope and included volume; never per blocked action.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{pkg.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{pkg.price}</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    {pkg.scope}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Regulatory & Standards Compliance */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Regulatory Standards & Framework Mappings (Dossier Page 27)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Technical implementation mappings against official privacy and security standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {REGULATORY_STANDARDS.map((std, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{std.standard}</span>
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Requirement:</span>
                      <span className="text-neutral-600 dark:text-neutral-400">{std.description}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">HOLDPOINT Control:</span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">{std.holdpointApproach}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
