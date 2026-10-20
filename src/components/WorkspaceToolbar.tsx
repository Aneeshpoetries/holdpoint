import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Palette } from 'lucide-react';
import { ScreenType, useHoldpoint } from '../engine/store';
import { useTheme } from '../engine/theme';
import { PersonaAvatar } from './PersonaAvatar';

const pages: Record<ScreenType, [string, string, string]> = {
  landing: ['Landing', '', 'SITE'],
  protection: ['Overview', 'The state of every consequential action, at a glance.', 'WORKSPACE'],
  workspace: ['Agent workspace', 'Draft an action, inspect the contract, and follow its decision.', 'WORKSPACE'],
  approvals: ['Approval inbox', 'Review held actions against exact authority and scope.', 'WORKSPACE'],
  policy: ['Policy studio', 'Define the conditions that stand between intent and effect.', 'CONTROL'],
  routes: ['Route coverage', 'Find every path that can reach a consequential destination.', 'CONTROL'],
  destinations: ['Destinations', 'Inspect the protected state behind each action.', 'CONTROL'],
  recovery: ['Recovery', 'Verify independent restoration before impact.', 'CONTROL'],
  timeline: ['Action timeline', 'Trace decisions as they pass through the enforcement gate.', 'OBSERVE'],
  evidence: ['Evidence ledger', 'Examine the audit trail and destination receipts.', 'OBSERVE'],
  scenarios: ['Acceptance lab', 'Run deterministic tests against the control boundary.', 'OBSERVE'],
  multiuser: ['Multi-user model', 'Explore actors, roles, and independent authority.', 'REFERENCE'],
  dossier: ['System dossier', 'Read the design and its governing decisions.', 'REFERENCE'],
};
const themes = [
  { id: 'canvas', name: 'Canvas', description: 'Warm daylight', swatch: '#e7e1d8' },
  { id: 'glacier', name: 'Glacier', description: 'Cool, clean daylight', swatch: '#dce7e9' },
  { id: 'sandstone', name: 'Sandstone', description: 'Soft mineral warmth', swatch: '#e9d8b8' },
  { id: 'graphite', name: 'Graphite', description: 'Soft charcoal', swatch: '#323536' },
  { id: 'nocturne', name: 'Nocturne', description: 'Ink and brass', swatch: '#1c2530' },
  { id: 'aubergine', name: 'Aubergine', description: 'Deep plum and chalk', swatch: '#342a35' },
] as const;

export const WorkspaceToolbar: React.FC = () => {
  const { activeScreen, mode, setMode, personas, currentPersona, setPersonaId, pendingApprovals, setActiveScreen } = useHoldpoint();
  const { resolvedMode, palette, setMode: setThemeMode, setPalette } = useTheme();
  const [open, setOpen] = useState<'persona' | 'theme' | null>(null);
  const [focused, setFocused] = useState(0);
  const personaRoot = useRef<HTMLDivElement>(null);
  const themeRoot = useRef<HTMLDivElement>(null);
  const personaTrigger = useRef<HTMLButtonElement>(null);
  const options = useRef<Array<HTMLButtonElement | null>>([]);
  const [title, description, group] = pages[activeScreen];
  const currentTheme = resolvedMode === 'light' ? palette === 'glacier' ? 'glacier' : palette === 'sandstone' ? 'sandstone' : 'canvas' : palette === 'cobalt' ? 'nocturne' : palette === 'aubergine' ? 'aubergine' : 'graphite';

  useEffect(() => {
    if (!open) return;
    const onOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!personaRoot.current?.contains(target) && !themeRoot.current?.contains(target)) setOpen(null);
    };
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [open]);
  useEffect(() => { if (open === 'persona') options.current[focused]?.scrollIntoView({ block: 'nearest' }); }, [focused, open]);

  const onPersonaKey = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { setOpen(null); personaTrigger.current?.focus(); }
    else if (event.target !== personaTrigger.current) return;
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      setOpen('persona');
      setFocused((index) => event.key === 'Home' ? 0 : event.key === 'End' ? personas.length - 1 : Math.max(0, Math.min(personas.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))));
    } else if (event.key === 'Enter' && open === 'persona') {
      event.preventDefault(); setPersonaId(personas[focused].id); setOpen(null); personaTrigger.current?.focus();
    }
  };
  const chooseTheme = (id: typeof themes[number]['id']) => {
    setThemeMode(['canvas', 'glacier', 'sandstone'].includes(id) ? 'light' : 'dark');
    setPalette(id === 'glacier' ? 'glacier' : id === 'sandstone' ? 'sandstone' : id === 'nocturne' ? 'cobalt' : id === 'aubergine' ? 'aubergine' : id === 'graphite' ? 'zinc' : 'warm');
    setOpen(null);
  };

  return <header className="cr-page-header">
    <div className="cr-page-title"><div className="cr-breadcrumb">CONTROL ROOM <span>/</span> {group}</div><h1>{title}</h1><p>{description}</p></div>
    <div className="cr-header-controls">
      <div className="cr-mode-switch" role="group" aria-label="Workspace mode">
        <button type="button" className={mode === 'consumer' ? 'is-current' : ''} aria-pressed={mode === 'consumer'} onClick={() => { setMode('consumer'); setOpen(null); }}>Consumer</button>
        <button type="button" className={mode === 'enterprise' ? 'is-current' : ''} aria-pressed={mode === 'enterprise'} onClick={() => { setMode('enterprise'); setOpen(null); }}>Enterprise</button>
      </div>
      <div className="cr-picker" ref={personaRoot} onKeyDown={onPersonaKey}>
        <button ref={personaTrigger} type="button" role="combobox" className="cr-picker-trigger" aria-haspopup="listbox" aria-controls="cr-persona-listbox" aria-activedescendant={open === 'persona' ? `cr-persona-option-${personas[focused].id}` : undefined} aria-expanded={open === 'persona'} onClick={() => { setFocused(Math.max(0, personas.findIndex((p) => p.id === currentPersona.id))); setOpen(open === 'persona' ? null : 'persona'); }}><PersonaAvatar id={currentPersona.id} name={currentPersona.name} /><span className="cr-picker-copy"><strong>{currentPersona.name}</strong><small>{currentPersona.title}</small></span><ChevronDown size={15} aria-hidden="true" /></button>
        {open === 'persona' && <div className="cr-picker-popover cr-persona-popover"><div className="cr-popover-label">SWITCH {mode === 'consumer' ? 'PERSONA' : 'ACTOR'} <span>{personas.length} profiles</span></div><div id="cr-persona-listbox" className="cr-picker-options" role="listbox" aria-label="Active operator">{personas.map((persona, index) => <button id={`cr-persona-option-${persona.id}`} ref={(element) => { options.current[index] = element; }} key={persona.id} type="button" role="option" aria-selected={currentPersona.id === persona.id} className={`cr-picker-option ${focused === index ? 'is-focused' : ''}`} onMouseEnter={() => setFocused(index)} onClick={() => { setPersonaId(persona.id); setOpen(null); }}><PersonaAvatar id={persona.id} name={persona.name} /><span><strong>{persona.name}</strong><small>{persona.title}</small></span>{currentPersona.id === persona.id && <Check size={16} aria-hidden="true" />}</button>)}</div></div>}
      </div>
      <div className="cr-picker cr-theme-picker" ref={themeRoot} onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(null); themeRoot.current?.querySelector<HTMLButtonElement>('.cr-icon-control')?.focus(); } }}><button type="button" className="cr-icon-control" aria-label={`Theme: ${currentTheme}. Choose theme`} aria-expanded={open === 'theme'} aria-controls="cr-theme-choices" onClick={() => setOpen(open === 'theme' ? null : 'theme')}><Palette size={17} strokeWidth={1.7} /></button>{open === 'theme' && <div id="cr-theme-choices" className="cr-picker-popover cr-theme-popover" role="group" aria-label="Visual theme"><div className="cr-popover-label">APPEARANCE</div>{themes.map((theme) => <button key={theme.id} type="button" aria-pressed={currentTheme === theme.id} className="cr-theme-option" onClick={() => chooseTheme(theme.id)}><span className="cr-theme-swatch" style={{ backgroundColor: theme.swatch }} /><span><strong>{theme.name}</strong><small>{theme.description}</small></span>{currentTheme === theme.id && <Check size={16} aria-hidden="true" />}</button>)}</div>}</div>
      <button type="button" className="cr-header-approvals" onClick={() => setActiveScreen('approvals')} aria-label={`${pendingApprovals.length} pending approvals`}><span className="cr-approval-count">{pendingApprovals.length}</span><span>pending</span></button>
    </div>
  </header>;
};
