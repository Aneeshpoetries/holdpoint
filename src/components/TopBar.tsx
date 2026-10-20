import React, { useState } from 'react';
import {
  ArrowUpRight, BookOpen, Bot, ClipboardCheck, Database, FlaskConical,
  GitBranch, Home, LayoutDashboard, LockKeyhole, Menu, OctagonAlert,
  Radar, RotateCcw, ScrollText, Settings2, ShieldCheck, Users, X,
} from 'lucide-react';
import { ScreenType, useHoldpoint } from '../engine/store';

type NavItem = { id: ScreenType; label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; badge?: number };

export const TopBar: React.FC<{ onTriggerEmergencyKill: () => void }> = ({ onTriggerEmergencyKill }) => {
  const { activeScreen, setActiveScreen, pendingApprovals } = useHoldpoint();
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups: { title: string; items: NavItem[] }[] = [
    { title: 'WORKSPACE', items: [
      { id: 'protection', label: 'Overview', Icon: LayoutDashboard },
      { id: 'workspace', label: 'Agent workspace', Icon: Bot },
      { id: 'approvals', label: 'Approval inbox', Icon: ClipboardCheck, badge: pendingApprovals.length },
    ] },
    { title: 'CONTROL', items: [
      { id: 'policy', label: 'Policy studio', Icon: Settings2 },
      { id: 'routes', label: 'Route coverage', Icon: GitBranch },
      { id: 'destinations', label: 'Destinations', Icon: Database },
      { id: 'recovery', label: 'Recovery', Icon: RotateCcw },
    ] },
    { title: 'OBSERVE', items: [
      { id: 'timeline', label: 'Action timeline', Icon: Radar },
      { id: 'evidence', label: 'Evidence ledger', Icon: ScrollText },
      { id: 'scenarios', label: 'Acceptance lab', Icon: FlaskConical },
    ] },
    { title: 'REFERENCE', items: [
      { id: 'multiuser', label: 'Multi-user model', Icon: Users },
      { id: 'dossier', label: 'System dossier', Icon: BookOpen },
    ] },
  ];

  const navigate = (id: ScreenType) => {
    setActiveScreen(id);
    setMobileOpen(false);
  };

  return (
    <>
      <button type="button" className="cr-mobile-menu" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>
        {mobileOpen ? <X size={19} strokeWidth={1.6} /> : <Menu size={19} strokeWidth={1.6} />}
      </button>
      {mobileOpen && <button type="button" className="cr-mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`cr-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Control room navigation">
        <div className="cr-brand">
          <div className="cr-brand-mark"><ShieldCheck size={18} strokeWidth={1.5} /></div>
          <div><strong>HOLDPOINT</strong><span>CONTROL ROOM</span></div>
        </div>

        <div className="cr-environment"><span className="cr-live-dot" /> ENFORCEMENT ACTIVE <LockKeyhole size={12} strokeWidth={1.4} /></div>

        <nav className="cr-nav" aria-label="Primary workspace navigation">
          {groups.map((group) => (
            <div key={group.title} className="cr-nav-group">
              <p className="cr-nav-caption">{group.title}</p>
              {group.items.map(({ id, label, Icon, badge }) => (
                <button key={id} type="button" className={`cr-nav-item ${activeScreen === id ? 'is-active' : ''}`} aria-current={activeScreen === id ? 'page' : undefined} onClick={() => navigate(id)}>
                  <Icon className="cr-nav-icon" strokeWidth={1.5} />
                  <span>{label}</span>
                  {badge ? <span className="cr-nav-badge">{badge}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="cr-sidebar-bottom">
          <button type="button" className="cr-site-link" onClick={() => navigate('landing')}><Home size={16} strokeWidth={1.5} /> Back to site <ArrowUpRight size={14} strokeWidth={1.5} /></button>
          <div className="cr-sidebar-tools">
            <button type="button" className="is-danger" onClick={onTriggerEmergencyKill} title="Halt in-flight actions and drain queued child agents"><OctagonAlert size={16} strokeWidth={1.5} /> Emergency halt</button>
          </div>
          <div className="cr-sidebar-signoff"><span className="cr-live-dot" /> Local simulation <span>v1.0</span></div>
        </div>
      </aside>
    </>
  );
};
