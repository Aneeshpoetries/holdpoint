import React from 'react';
import { ArrowUpRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useHoldpoint } from '../engine/store';
import { PersonaAvatar } from './PersonaAvatar';

const deskCopy: Record<string, { field: string; headline: string; description: string; surface: string }> = {
  aisha: { field: 'PHOTO INTEGRITY', headline: 'Keep the originals.', description: 'Clean duplicate photos while keeping the master archive intact and recoverable.', surface: 'Photo vault' },
  rohan: { field: 'RESEARCH PRIVACY', headline: 'Protect the work behind the work.', description: 'Move citations and thesis material without exposing confidential lab records.', surface: 'Academic drive' },
  meera: { field: 'HOUSEHOLD OPERATIONS', headline: 'Make room for what matters.', description: 'Coordinate the family calendar and subscriptions with a clear trail for every change.', surface: 'Household services' },
  dev: { field: 'IDENTITY SAFETY', headline: 'Keep recovery in trusted hands.', description: 'A locked recovery path protects this account from urgent-looking scam requests.', surface: 'Identity broker' },
  priya: { field: 'RELEASE GOVERNANCE', headline: 'Ship with a second signature.', description: 'Propose production releases while the policy gate protects the main branch.', surface: 'Code repository' },
  karan: { field: 'CLOUD OPERATIONS', headline: 'Change infrastructure with a way back.', description: 'Require a verified restore path before a destructive cloud operation reaches production.', surface: 'Cloud control' },
  sana: { field: 'SUPPORT AUTHORITY', headline: 'Resolve the case. Respect the limit.', description: 'Handle customer refunds and lookups within a bounded support mandate.', surface: 'Customer support' },
  vikram: { field: 'OUTBOUND CONTROL', headline: 'Send the right thing to the right people.', description: 'Prepare proposals and CRM outreach without letting private records escape.', surface: 'CRM & communications' },
  neha: { field: 'TREASURY CONTROL', headline: 'Make every transfer accountable.', description: 'Keep vendor payments inside budget and subject to independent authority.', surface: 'Payment broker' },
  arjun: { field: 'SECURITY COMMAND', headline: 'See the whole enforcement boundary.', description: 'Audit coverage, policy, approval and recovery from one independent command desk.', surface: 'Control plane' },
};

const Signal: React.FC<{ id: string }> = ({ id }) => {
  const { destinations, routesList, snapshots, currentPersona } = useHoldpoint();
  const remaining = Math.max(0, currentPersona.dailyBudgetLimit - currentPersona.dailyBudgetSpent);
  const spendPercent = Math.min(100, Math.round((currentPersona.dailyBudgetSpent / currentPersona.dailyBudgetLimit) * 100));
  const enforced = routesList.filter((route) => route.enforcementStatus === 'enforced').length;
  switch (id) {
    case 'aisha': return <><span className="cr-signal-caption">ARCHIVE POSTURE</span><div className="cr-photo-stack" aria-hidden="true"><i /><i /><i /></div><strong className="cr-signal-value">14,000</strong><small>indexed photos · originals protected</small><div className="cr-signal-note"><ShieldCheck size={13} /> Duplicate cleanup is scoped</div></>;
    case 'rohan': return <><span className="cr-signal-caption">RESEARCH WORKFLOW</span><div className="cr-document-stack" aria-hidden="true"><i /><i /><i /></div><strong className="cr-signal-value cr-signal-word">Private by default</strong><small>Citations can move; participant data cannot.</small><div className="cr-signal-note"><LockKeyhole size={13} /> Confidential files stay bounded</div></>;
    case 'meera': return <><span className="cr-signal-caption">HOUSEHOLD DESK</span><div className="cr-week-grid" aria-hidden="true">{['M','T','W','T','F','S','S'].map((day, index) => <i key={index} className={index === 3 ? 'is-current' : ''}>{day}</i>)}</div><strong className="cr-signal-value cr-signal-word">One shared plan</strong><small>Calendar · subscriptions · trusted contacts</small><div className="cr-signal-note">${remaining.toLocaleString()} of daily budget available</div></>;
    case 'dev': return <><span className="cr-signal-caption">RECOVERY CONTROL</span><div className="cr-lock-orbit"><LockKeyhole size={27} strokeWidth={1.5} /></div><strong className="cr-signal-value cr-signal-word">{destinations.userSecurity['dev-user']?.recoveryLocked ? 'Locked' : 'Unlocked'}</strong><small>Recovery changes require trusted authority.</small><div className="cr-signal-note">SMS urgency does not bypass policy</div></>;
    case 'priya': return <><span className="cr-signal-caption">RELEASE PIPELINE</span><div className="cr-release-route" aria-label="Propose, verify, approve, deploy"><i>01<span>Propose</span></i><i>02<span>Verify</span></i><i>03<span>Approve</span></i><i>04<span>Deploy</span></i></div><strong className="cr-signal-value cr-signal-word">{destinations.repo.productionReleaseVersion}</strong><small>currently deployed release</small><div className="cr-signal-note">Main branch requires independent review</div></>;
    case 'karan': return <><span className="cr-signal-caption">INFRASTRUCTURE POSTURE</span><div className="cr-infra-nodes" aria-hidden="true"><i /><i /><i /><i /></div><strong className="cr-signal-value">{destinations.cloudResources.filter((resource) => resource.status === 'running').length}</strong><small>running cloud resources</small><div className="cr-signal-note">{snapshots.length} independent recovery {snapshots.length === 1 ? 'copy' : 'copies'}</div></>;
    case 'sana': return <><span className="cr-signal-caption">SUPPORT SPEND</span><div className="cr-budget-track"><i style={{ width: `${spendPercent}%` }} /></div><strong className="cr-signal-value">${remaining.toLocaleString()}</strong><small>remaining of ${currentPersona.dailyBudgetLimit.toLocaleString()} daily budget</small><div className="cr-signal-note">Refund requests are inspected individually</div></>;
    case 'vikram': return <><span className="cr-signal-caption">OUTBOUND PATH</span><div className="cr-comms-path"><i>Quote</i><b>→</b><i>Review</i><b>→</b><i>Send</i></div><strong className="cr-signal-value cr-signal-word">Audience first</strong><small>Customer records stay inside CRM scope.</small><div className="cr-signal-note">Export requests meet the policy gate</div></>;
    case 'neha': return <><span className="cr-signal-caption">TREASURY POSITION</span><div className="cr-budget-track"><i style={{ width: `${spendPercent}%` }} /></div><strong className="cr-signal-value">${destinations.bankBalance.toLocaleString()}</strong><small>available settlement balance</small><div className="cr-signal-note">${remaining.toLocaleString()} daily authority remaining</div></>;
    default: return <><span className="cr-signal-caption">COVERAGE MONITOR</span><div className="cr-command-matrix" aria-hidden="true">{routesList.map((route) => <i key={route.id} className={route.enforcementStatus === 'enforced' ? 'is-enforced' : 'is-gap'} />)}</div><strong className="cr-signal-value">{enforced}<span> / {routesList.length}</span></strong><small>discovered routes enforced</small><div className="cr-signal-note">{routesList.length - enforced} visible gaps need attention</div></>;
  }
};

export const PersonaDesk: React.FC = () => {
  const { currentPersona, setActiveScreen } = useHoldpoint();
  const copy = deskCopy[currentPersona.id] ?? deskCopy.arjun;
  return <section className={`cr-persona-desk persona-${currentPersona.id}`} aria-labelledby="persona-desk-heading">
    <div className="cr-persona-copy"><span className="cr-persona-eyebrow"><span className="cr-persona-eyebrow-dot" /> {copy.field} <span>·</span> {currentPersona.name}</span><h2 id="persona-desk-heading">{copy.headline}</h2><p>{copy.description}</p><div className="cr-persona-meta"><span>PROTECTED SURFACE</span><strong>{copy.surface}</strong></div><button type="button" onClick={() => setActiveScreen('workspace')}>Open {currentPersona.agentName} <ArrowUpRight size={15} /></button></div>
    <div className="cr-persona-signal"><Signal id={currentPersona.id} /></div>
    <div className="cr-persona-portrait"><PersonaAvatar id={currentPersona.id} name={currentPersona.name} className="is-large" /><span>{currentPersona.title}</span></div>
  </section>;
};
