import React, { useEffect, useState } from 'react';
import { ArrowRight, Menu, ShieldCheck, X } from 'lucide-react';
import { useHoldpoint } from '../engine/store';
import { HoldpointHero } from './landing/HoldpointHero';
import { PolicyGraph } from './landing/PolicyGraph';
import { AuthoritySequence } from './landing/AuthoritySequence';
import { CoverageAccordion } from './landing/CoverageAccordion';
import { ActionFooter } from './landing/ActionFooter';
import './landing/landing-motion.css';

export const LandingPageView: React.FC = () => {
  const { setActiveScreen } = useHoldpoint();
  const [menuOpen, setMenuOpen] = useState(false);
  const launchConsole = () => setActiveScreen('protection');

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <div className="holdpoint-landing min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#030c18] text-[#edf8ff] selection:bg-cyan-300 selection:text-[#03111d]">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-24 rounded-md bg-cyan-200 px-4 py-2 text-sm font-semibold text-[#04121d] transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="hp-nav fixed inset-x-3 top-3 z-50 sm:inset-x-5 sm:top-5">
        <div className="mx-auto flex h-[70px] max-w-[1480px] items-center justify-between px-5 sm:px-9 lg:px-12">
          <a href="#top" className="flex items-center gap-2.5" aria-label="HOLDPOINT home">
            <span className="grid size-7 place-items-center rounded-[4px] bg-[#d5eeff]">
              <ShieldCheck aria-hidden="true" className="size-4 text-[#061b2c]" strokeWidth={1.9} />
            </span>
            <span className="font-grotesk text-[13px] font-bold tracking-[0.11em] text-white">HOLDPOINT</span>
          </a>

          <nav className="hidden items-center gap-8 text-[12px] text-slate-300 lg:flex" aria-label="Primary navigation">
            <a className="landing-nav-link" href="#policy-graph">Policy graph</a>
            <a className="landing-nav-link" href="#control-story">How it works</a>
            <a className="landing-nav-link" href="#coverage">Coverage</a>
            <button className="landing-nav-link" onClick={() => setActiveScreen('dossier')}>Evidence</button>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="flex items-center gap-1.5 rounded-full border border-[#a5d3e6]/15 bg-[#a5d3e6]/[0.05] px-3 py-1.5 font-mono text-[9px] text-[#a9d5e7]">
              <span className="size-1 rounded-full bg-[#a4f3d0]" /> ENFORCING
            </span>
            <button onClick={launchConsole} className="hp-nav-cta inline-flex h-9 items-center gap-3 rounded-full px-4 text-[10px] font-semibold">
              Open console
              <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
            </button>
          </div>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-[6px] border border-white/15 bg-[#061624]/80 text-white lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="mx-auto mt-1 grid max-w-[1480px] gap-1 border border-white/10 bg-[#04111cf7] p-3 text-sm shadow-2xl backdrop-blur-xl lg:hidden"
            aria-label="Mobile navigation"
          >
            {[
              ['Policy graph', '#policy-graph'],
              ['How it works', '#control-story'],
              ['Coverage', '#coverage'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-[9px] px-3 py-3 text-slate-200 hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <button onClick={launchConsole} className="hp-button hp-button-primary mt-1 h-11 justify-center rounded-full text-xs">
              Open console
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </button>
          </nav>
        )}
      </header>

      <main id="main-content">
        <HoldpointHero onLaunch={launchConsole} />
        <PolicyGraph onOpenPolicyStudio={() => setActiveScreen('policy')} />
        <AuthoritySequence />
        <CoverageAccordion />
        <ActionFooter onLaunch={launchConsole} />
      </main>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck aria-hidden="true" className="size-4 text-cyan-200" strokeWidth={1.7} />
            <span className="font-grotesk font-semibold tracking-[0.14em]">HOLDPOINT</span>
          </div>
          <p>Consequential actions require explicit authority.</p>
          <button onClick={launchConsole} className="inline-flex items-center gap-2 font-semibold text-cyan-100 hover:text-white">
            Launch console
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
