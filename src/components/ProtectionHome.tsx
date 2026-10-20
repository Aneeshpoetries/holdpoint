import React from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, Database, GitBranch, LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useHoldpoint } from '../engine/store';
import { ProtectionDashboardCharts } from './ProtectionDashboardCharts';
import { PersonaDesk } from './PersonaDesk';

export const ProtectionHome: React.FC = () => {
  const { currentPersona, pendingApprovals, routesList, destinations, snapshots, evidenceList, setActiveScreen, sendAgentTask } = useHoldpoint();
  const gapRoutes = routesList.filter((route) => route.enforcementStatus !== 'enforced');
  const recentEvents = evidenceList.slice(0, 4);
  const enforcedRoutes = routesList.length - gapRoutes.length;
  const coveragePercent = routesList.length ? Math.round((enforcedRoutes / routesList.length) * 100) : 0;
  const evidenceStages = ['intent', 'policy', 'inspection', 'approval', 'dispatch', 'receipt', 'reconciled', 'recovery'].map((stage) => ({ stage, count: evidenceList.filter((event) => event.stage === stage).length }));
  const maximumStageCount = Math.max(1, ...evidenceStages.map((item) => item.count));

  const asset = (() => {
    switch (currentPersona.id) {
      case 'aisha': {
        const photos = destinations.photos.filter((photo) => !photo.deleted).length;
        return { label: 'PHOTO VAULT', metric: photos.toLocaleString(), unit: 'sample records', title: 'Personal photo vault', detail: 'Representative records for 14,000 indexed photos. Originals cannot be bulk-deleted without an independent restore check.', destination: 'Photo Vault · iCloud & local storage' };
      }
      case 'dev':
        return { label: 'IDENTITY BROKER', metric: destinations.userSecurity['dev-user']?.recoveryLocked ? 'Locked' : 'Unlocked', unit: 'recovery status', title: 'Account security', detail: 'Recovery changes are held behind verified, independent authority.', destination: 'User identity & authentication broker' };
      case 'rohan':
        return { label: 'ACADEMIC DRIVE', metric: 'Scoped', unit: 'export authority', title: 'Research archive', detail: 'Citations can be prepared for export while confidential participant records remain inside their permitted boundary.', destination: 'Academic records & citation workflow' };
      case 'meera':
        return { label: 'HOUSEHOLD CONTROL', metric: `$${Math.max(0, currentPersona.dailyBudgetLimit - currentPersona.dailyBudgetSpent)}`, unit: 'daily budget available', title: 'Family services', detail: 'Calendar, subscription, and verified household payment changes leave a reviewable trail.', destination: 'Household calendar & subscription broker' };
      case 'priya':
        return { label: 'RELEASE SYSTEM', metric: destinations.repo.productionReleaseVersion, unit: 'deployed version', title: 'Production repository', detail: 'Main branch and release operations require dual authorization.', destination: 'Code repository · Git & CD runners' };
      case 'karan':
        return { label: 'CLOUD CONTROL', metric: String(destinations.cloudResources.filter((resource) => resource.status === 'running').length), unit: 'active resources', title: 'Cloud infrastructure', detail: 'Destructive changes wait for recovery proof and independent approval.', destination: 'Cloud infrastructure · Postgres, S3 & IAM' };
      case 'neha':
        return { label: 'TREASURY BROKER', metric: `$${destinations.bankBalance.toLocaleString()}`, unit: 'available balance', title: 'Treasury settlement', detail: 'Transfers are limited by daily caps and dual-control policy.', destination: 'Treasury & bank payment broker' };
      case 'sana':
        return { label: 'CUSTOMER SUPPORT', metric: `$${Math.max(0, currentPersona.dailyBudgetLimit - currentPersona.dailyBudgetSpent).toLocaleString()}`, unit: 'daily budget available', title: 'Refund authority', detail: 'Customer credits are checked individually against bounded support authority and aggregate spend.', destination: 'Customer records & refund broker' };
      case 'vikram':
        return { label: 'CRM OUTBOUND', metric: 'Review', unit: 'before delivery', title: 'Customer communications', detail: 'Quotes and proposals can be prepared without turning private CRM data into an unrestricted export.', destination: 'CRM & outbound communications' };
      case 'arjun':
        return { label: 'CONTROL PLANE', metric: String(gapRoutes.length), unit: 'visible route gaps', title: 'Enforcement coverage', detail: 'Mediated paths are distinguished from direct access that bypasses the control boundary.', destination: 'Policy, coverage & approval broker' };
      default:
        return { label: 'PROTECTED DESTINATION', metric: 'Active', unit: 'safeguards', title: currentPersona.title, detail: currentPersona.summary, destination: 'Holdpoint action broker' };
    }
  })();

  return (
    <div className="cr-overview">
      <PersonaDesk />

      <div className="cr-metric-strip" aria-label="Current control status">
        <div><span>WAITING FOR APPROVAL</span><strong>{pendingApprovals.length.toString().padStart(2, '0')}</strong><small>Bounded review tokens</small></div>
        <div><span>ROUTE GAPS</span><strong>{gapRoutes.length.toString().padStart(2, '0')}</strong><small>Paths needing coverage</small></div>
        <div><span>RECOVERY COPIES</span><strong>{snapshots.length.toString().padStart(2, '0')}</strong><small>Independent snapshots</small></div>
        <div><span>EVIDENCE EVENTS</span><strong>{evidenceList.length.toString().padStart(2, '0')}</strong><small>Recorded decisions</small></div>
      </div>

      <section className="cr-analytics" aria-label="Live operational analytics">
        <div className="cr-analytic-copy"><span className="cr-overline">LIVE COVERAGE</span><strong>{coveragePercent}%</strong><span>of discovered routes enforced</span><button type="button" onClick={() => setActiveScreen('routes')}>Inspect route map <ArrowRight size={14} /></button></div>
        <div className="cr-coverage-visual"><div className="cr-coverage-header"><span>ENFORCEMENT PERIMETER</span><span>{enforcedRoutes} of {routesList.length} routes</span></div><div className="cr-coverage-bar" role="img" aria-label={`${enforcedRoutes} enforced routes and ${gapRoutes.length} route gaps`}><span style={{ width: `${coveragePercent}%` }} /><i style={{ width: `${100 - coveragePercent}%` }} /></div><div className="cr-coverage-key"><span><b className="is-covered" /> Enforced · {enforcedRoutes}</span><span><b className="is-gap" /> Needs coverage · {gapRoutes.length}</span></div></div>
        <div className="cr-stage-visual"><div className="cr-coverage-header"><span>EVIDENCE BY STAGE</span><span>{evidenceList.length} events</span></div><div className="cr-stage-bars">{evidenceStages.map(({ stage, count }) => <div key={stage} title={`${stage}: ${count} events`}><span>{count}</span><i style={{ height: `${Math.max(6, (count / maximumStageCount) * 54)}px` }} /><small>{stage === 'reconciled' ? 'rcon' : stage === 'recovery' ? 'rcvy' : stage.slice(0, 4)}</small></div>)}</div></div>
      </section>

      <div className="cr-overview-grid">
        <section className="cr-panel cr-asset-panel" aria-labelledby="protected-asset-heading">
          <div className="cr-panel-inner">
            <div className="cr-panel-topline"><span><ShieldCheck size={16} strokeWidth={1.45} /> PROTECTED DESTINATION</span><span className="cr-status-chip"><span className="cr-live-dot" /> ENFORCED</span></div>
            <div className="cr-asset-body"><span className="cr-overline">{asset.label}</span><div className="cr-asset-number">{asset.metric}</div><div className="cr-asset-unit">{asset.unit}</div><h3 id="protected-asset-heading">{asset.title}</h3><p>{asset.detail}</p></div>
            <div className="cr-decision-route" aria-label="Action decision sequence">
              {[['01', 'Intent'], ['02', 'Policy'], ['03', 'Authority'], ['04', 'Effect']].map(([number, label]) => <div key={number}><span>{number}</span><strong>{label}</strong></div>)}
            </div>
            <div className="cr-panel-foot"><span><LockKeyhole size={14} strokeWidth={1.5} /> {asset.destination}</span><button type="button" onClick={() => setActiveScreen('destinations')}>Inspect destination <ArrowRight size={15} strokeWidth={1.5} /></button></div>
          </div>
        </section>

        <div className="cr-overview-side">
          <section className="cr-panel cr-attention-panel" aria-labelledby="attention-heading"><div className="cr-panel-inner"><div className="cr-panel-topline"><span><Clock3 size={16} strokeWidth={1.5} /> REQUIRES ATTENTION</span><span>LIVE QUEUE</span></div><h3 id="attention-heading">{pendingApprovals.length ? `${pendingApprovals.length} actions held for review` : 'No actions waiting'}</h3><p>{pendingApprovals.length ? 'A proposed action cannot reach its destination until an authorized reviewer approves the exact scope.' : 'The approval queue is clear. New high-impact actions will appear here.'}</p><button type="button" onClick={() => setActiveScreen('approvals')}>Open approval inbox <ArrowRight size={15} strokeWidth={1.5} /></button></div></section>
          <div className="cr-mini-grid">
            <button type="button" className="cr-mini-card" onClick={() => setActiveScreen('routes')}><GitBranch size={17} strokeWidth={1.4} /><span>ROUTE COVERAGE</span><strong>{gapRoutes.length} gaps</strong><small>Inspect exposed paths <ArrowUpRight size={13} /></small></button>
            <button type="button" className="cr-mini-card" onClick={() => setActiveScreen('recovery')}><Database size={17} strokeWidth={1.4} /><span>RECOVERY</span><strong>{snapshots.length} copies</strong><small>Verify restore posture <ArrowUpRight size={13} /></small></button>
          </div>
        </div>
      </div>

      <div className="cr-overview-lower">
        <section className="cr-panel cr-task-panel" aria-labelledby="tasks-heading"><div className="cr-panel-inner"><div className="cr-section-heading"><div><span className="cr-overline">ACTIVE OPERATOR · {currentPersona.name.toUpperCase()}</span><h3 id="tasks-heading">Suggested simulations</h3><p>Run a scenario through the same policy and approval gate.</p></div><button type="button" onClick={() => setActiveScreen('workspace')}>All workspace tools <ArrowRight size={15} /></button></div><div className="cr-task-list">{currentPersona.suggestedTasks.map((task, index) => <div className="cr-task-row" key={`${task.title}-${index}`}><div className={`cr-task-symbol ${task.isAttackScenario ? 'is-attack' : ''}`}>{task.isAttackScenario ? <ShieldAlert size={18} strokeWidth={1.4} /> : <Check size={18} strokeWidth={1.4} />}</div><div><strong>{task.title}</strong><span>{task.prompt}</span></div><button type="button" onClick={() => { sendAgentTask(task.prompt, task.scenarioId); setActiveScreen('workspace'); }}>Run simulation <ArrowUpRight size={14} /></button></div>)}</div></div></section>
        <section className="cr-panel cr-ledger-panel" aria-labelledby="recent-ledger-heading"><div className="cr-panel-inner"><div className="cr-section-heading"><div><span className="cr-overline">AUDIT TRAIL</span><h3 id="recent-ledger-heading">Recent evidence</h3><p>Every stage has a recorded decision.</p></div><button type="button" onClick={() => setActiveScreen('evidence')}>Full ledger <ArrowRight size={15} /></button></div><div className="cr-ledger-list">{recentEvents.length ? recentEvents.map((event) => <div key={event.index} className="cr-ledger-row"><span>#{String(event.index).padStart(3, '0')}</span><div><strong>{event.stage}</strong><p>{event.summary}</p></div><time>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>) : <p className="cr-ledger-empty">No evidence yet. Run a simulation to create the first record.</p>}</div></div></section>
      </div>

      <details className="cr-telemetry"><summary>Explore detailed operational telemetry <ChevronDown size={17} strokeWidth={1.5} /></summary><ProtectionDashboardCharts /></details>
    </div>
  );
};
