import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CircleDollarSign, CloudCog, GitBranch, LockKeyhole, MessageSquareLock, RotateCcw, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface PolicyGraphProps {
  onOpenPolicyStudio: () => void;
}

type GraphState = 'tracing' | 'held';

const scenarios = [
  {
    id: 'repository', label: 'Code', title: 'Force push to production', command: 'git push --force origin main',
    source: 'Production repository', effect: 'Shared history can be rewritten', policy: 'Independent review required',
    reason: 'The requested push can replace commits used by the team. Dispatch remains blocked until a second authorized person approves the exact change.',
    destinations: ['main branch', 'release pipeline', 'CI workflow', 'registry', 'deployment', 'rollback commit', 'branch rule', 'audit ledger', 'reviewer', 'artifact store', 'production', 'evidence seal'],
    Icon: GitBranch,
  },
  {
    id: 'payment', label: 'Payments', title: 'Transfer to a new beneficiary', command: 'transfer 85,000 USD',
    source: 'Treasury account', effect: 'Funds leave controlled custody', policy: 'Dual authorization required',
    reason: 'The amount and recipient exceed single actor authority. The transfer stays on hold while a separate approver verifies the beneficiary.',
    destinations: ['beneficiary', 'transfer limit', 'bank route', 'risk rule', 'treasury', 'approval key', 'settlement', 'counterparty', 'ledger', 'hold queue', 'receipt', 'reconciliation'],
    Icon: CircleDollarSign,
  },
  {
    id: 'infrastructure', label: 'Cloud', title: 'Delete production data', command: 'DROP DATABASE prod_customers',
    source: 'Cloud data plane', effect: 'Production records can be removed', policy: 'Recovery proof required',
    reason: 'The deletion has a broad impact. HOLDPOINT requires a verified recovery point and an authorized break glass review before dispatch.',
    destinations: ['data plane', 'snapshot', 'restore test', 'access rule', 'service', 'backup', 'owner', 'incident', 'policy', 'hold queue', 'ledger', 'recovery'],
    Icon: CloudCog,
  },
  {
    id: 'communications', label: 'Comms', title: 'Send a customer announcement', command: 'send to all customers',
    source: 'External channel', effect: 'A public message reaches customers', policy: 'Human review required',
    reason: 'A high reach message represents the organization. The final content and audience must be approved by an authorized reviewer.',
    destinations: ['audience', 'preview', 'brand rule', 'reviewer', 'email', 'chat', 'public post', 'schedule', 'hold queue', 'record', 'receipt', 'ledger'],
    Icon: MessageSquareLock,
  },
];

const sourceY = [86, 218, 350, 482];
const targetY = Array.from({ length: 12 }, (_, index) => 56 + index * 43);

export const PolicyGraph: React.FC<PolicyGraphProps> = ({ onOpenPolicyStudio }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [graphState, setGraphState] = useState<GraphState>('held');
  const timerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const selected = scenarios[selectedIndex];

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.hp-graph-frame', { scale: 0.9, opacity: 0.45 }, {
        scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.hp-graph-frame', start: 'top 88%', end: 'top 26%', scrub: 0.85 },
      });
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const trace = (index: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setSelectedIndex(index);
    setGraphState(reduceMotion ? 'held' : 'tracing');
    if (!reduceMotion) timerRef.current = window.setTimeout(() => setGraphState('held'), 1200);
  };

  const moveSpotlight = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--graph-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--graph-y', `${event.clientY - rect.top}px`);
  };

  return (
    <section id="policy-graph" ref={sectionRef} className="hp-graph-section relative scroll-mt-20 px-3 py-32 sm:px-5 lg:py-48">
      <div className="mx-auto max-w-[1480px]">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }} className="mb-10 max-w-[700px] px-3 sm:px-6">
          <h2 className="font-grotesk text-[clamp(2.7rem,5.3vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.065em] text-white">A decision you can see.</h2>
          <p className="mt-5 max-w-[580px] text-[15px] leading-7 text-[#9aafc3] sm:text-base">Follow a request from intent through policy, approval, and destination. Select a surface to inspect its route.</p>
        </motion.div>

        <div className="hp-graph-frame overflow-hidden border border-[#739bb8]/20 bg-[#061321]" onPointerMove={moveSpotlight}>
          <div className="flex h-14 items-center justify-between border-b border-white/10 bg-[#091b2b] px-4 sm:px-6">
            <div className="flex items-center gap-3"><span className="grid size-6 place-items-center border border-[#b6e7ff]/25 text-[#c5edff]"><ShieldCheck className="size-3.5" strokeWidth={1.6} /></span><span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-[#e6f4fb]">HOLDPOINT POLICY MAP</span></div>
            <div className="hidden items-center gap-5 font-mono text-[9px] text-[#89aac6] sm:flex"><span>INTERACTIVE MODEL</span><span className="text-[#b6e8ff]">4 ACTION SURFACES</span></div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,.75fr)]">
            <div className="hp-graph-canvas relative min-h-[610px] overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r">
              <div className="hp-graph-grid absolute inset-0" aria-hidden="true" />
              <div className="hp-graph-haze absolute inset-0" aria-hidden="true" />

              <div className="hidden md:block" aria-label="Interactive policy topology">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 590" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="hp-path" x1="0" x2="1"><stop stopColor="#b9ebff" stopOpacity=".8" /><stop offset="1" stopColor="#8dd8ff" stopOpacity=".48" /></linearGradient>
                  </defs>
                  {sourceY.map((y, index) => (
                    <path key={index} d={`M 150 295 C 205 295, 200 ${y}, 275 ${y}`} fill="none" stroke={index === selectedIndex ? '#a5e3ff' : '#497798'} strokeOpacity={index === selectedIndex ? 0.72 : 0.3} strokeWidth={index === selectedIndex ? 1.5 : 1} />
                  ))}
                  {targetY.map((y, index) => (
                    <path key={index} d={`M 451 ${sourceY[selectedIndex]} C 545 ${sourceY[selectedIndex]}, 545 ${y}, 705 ${y}`} fill="none" stroke="#7ec9f1" strokeOpacity={index % 3 === 0 ? 0.38 : 0.22} strokeWidth="1" />
                  ))}
                  <motion.path
                    key={selected.id}
                    d={`M 150 295 C 205 295, 200 ${sourceY[selectedIndex]}, 275 ${sourceY[selectedIndex]} L 451 ${sourceY[selectedIndex]} C 545 ${sourceY[selectedIndex]}, 545 ${targetY[5]}, 705 ${targetY[5]}`}
                    fill="none" stroke="url(#hp-path)" strokeWidth="2" strokeLinecap="round"
                    initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <circle cx="705" cy={targetY[5]} r="3.5" fill="#d1f2ff" />
                </svg>

                <div className="hp-graph-origin absolute left-[4%] top-1/2 flex -translate-y-1/2 flex-col items-center">
                  <div className="hp-orbit relative grid size-[115px] place-items-center rounded-full border border-[#9ccbe6]/25">
                    <div className="hp-orbit-inner grid size-[72px] place-items-center rounded-full border border-[#c9e9fa]/45"><LockKeyhole className="size-6 text-[#e5f6ff]" strokeWidth={1.3} /></div>
                  </div>
                  <span className="mt-5 font-mono text-[9px] tracking-[0.11em] text-[#b9d8ea]">ACTION INTENT</span>
                </div>

                <div className="absolute left-[30.6%] top-0 h-full w-[20%]">
                  {scenarios.map((scenario, index) => {
                    const Icon = scenario.Icon;
                    const active = selectedIndex === index;
                    return (
                      <button key={scenario.id} type="button" onClick={() => trace(index)} aria-pressed={active} style={{ top: `${(sourceY[index] / 590) * 100}%` }} className={`hp-graph-node absolute left-0 flex h-[55px] w-full min-w-[154px] -translate-y-1/2 items-center gap-3 px-3 text-left ${active ? 'is-active' : ''}`}>
                        <Icon className="size-4 shrink-0" strokeWidth={1.4} />
                        <span><strong className="block text-xs font-medium">{scenario.label}</strong><small className="mt-0.5 block font-mono text-[9px]">POLICY ROUTE</small></span>
                      </button>
                    );
                  })}
                </div>

                <div className="absolute left-[79%] top-0 h-full w-[19%]">
                  {selected.destinations.map((destination, index) => (
                    <div key={destination} style={{ top: `${(targetY[index] / 590) * 100}%` }} className={`hp-graph-target absolute left-0 flex h-[29px] w-full -translate-y-1/2 items-center gap-2 pl-2 font-mono text-[9px] ${index === 5 ? 'is-selected' : ''}`}>
                      <span className="size-1 shrink-0 rounded-full bg-current" /> <span className="truncate">{destination}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 grid gap-2 p-4 md:hidden">
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] text-[#a8c8dd]"><span>REQUEST SURFACE</span><span>SELECT ONE</span></div>
                {scenarios.map((scenario, index) => {
                  const Icon = scenario.Icon;
                  return (
                    <button key={scenario.id} type="button" onClick={() => trace(index)} aria-pressed={selectedIndex === index} className={`hp-graph-node flex min-h-[68px] items-center gap-3 px-4 text-left ${selectedIndex === index ? 'is-active' : ''}`}>
                      <Icon className="size-5 shrink-0" strokeWidth={1.4} />
                      <span><strong className="block text-sm font-medium">{scenario.label}</strong><small className="mt-1 block text-xs">{scenario.title}</small></span>
                    </button>
                  );
                })}
                <div className="mt-3 border border-[#a9d9f2]/20 bg-[#153b58]/35 p-5 text-center"><ShieldCheck className="mx-auto size-7 text-[#bce7fc]" strokeWidth={1.3} /><p className="mt-3 text-sm text-[#e6f7ff]">Every route stops at the policy gate.</p></div>
              </div>
            </div>

            <aside className="hp-inspector relative flex flex-col bg-[#0b2033]" aria-label="Policy decision inspector">
              <div className="flex h-14 items-center justify-between border-b border-white/10 px-5"><span className="font-mono text-[10px] tracking-[0.08em] text-[#cee9f8]">DECISION INSPECTOR</span><span className="border border-[#9cd8f7]/25 px-2 py-1 font-mono text-[9px] text-[#d4f0fc]">{graphState === 'tracing' ? 'TRACING' : 'HELD'}</span></div>
              <AnimatePresence mode="wait">
                <motion.div key={selected.id} initial={reduceMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -8 }} transition={{ duration: 0.3 }} className="flex flex-1 flex-col p-5 sm:p-7">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#a1bfd3]"><selected.Icon className="size-4" strokeWidth={1.4} /> {selected.label.toUpperCase()} / POLICY MATCH</div>
                  <h3 className="mt-5 max-w-[350px] font-grotesk text-[clamp(1.45rem,2.2vw,2rem)] font-medium leading-[1.1] tracking-[-0.035em] text-white">{selected.title}</h3>
                  <div className="mt-6 border border-[#addaf1]/20 bg-[#102c45] p-4">
                    <div className="flex items-start justify-between gap-3"><span className="font-mono text-[9px] text-[#91b9d5]">POLICY RESULT</span><ShieldCheck className="size-4 text-[#c0e8fa]" strokeWidth={1.4} /></div>
                    <p className="mt-3 text-lg font-medium text-[#e4f5ff]">{selected.policy}</p>
                    <p className="mt-2 text-[12px] leading-5 text-[#a1bfd0]">{selected.reason}</p>
                  </div>
                  <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5">
                    <div><dt className="font-mono text-[9px] text-[#789cba]">DESTINATION</dt><dd className="mt-1 text-[12px] leading-5 text-[#dfedf7]">{selected.source}</dd></div>
                    <div><dt className="font-mono text-[9px] text-[#789cba]">CONSEQUENCE</dt><dd className="mt-1 text-[12px] leading-5 text-[#dfedf7]">{selected.effect}</dd></div>
                  </dl>
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="font-mono text-[9px] text-[#88aec9]">REQUESTED OPERATION</p>
                    <code className="mt-2 block overflow-x-auto whitespace-nowrap font-mono text-[11px] text-[#d9effa]">{selected.command}</code>
                  </div>
                  <div className="mt-auto grid gap-2 pt-9">
                    <button type="button" onClick={() => trace(selectedIndex)} className="hp-graph-action inline-flex h-11 items-center justify-between px-4 text-xs font-semibold text-[#08243b]">Trace this decision <RotateCcw className="size-4" strokeWidth={1.6} /></button>
                    <button type="button" onClick={onOpenPolicyStudio} className="inline-flex h-11 items-center justify-between border border-[#aed7ed]/20 px-4 text-xs font-medium text-[#d7effa] transition-colors hover:bg-white/5">Open policy studio <ArrowRight className="size-4" strokeWidth={1.6} /></button>
                  </div>
                  <p className="sr-only" aria-live="polite">Decision state: {graphState}</p>
                </motion.div>
              </AnimatePresence>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};
