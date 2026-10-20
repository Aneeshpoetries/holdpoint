import React, { useRef } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, Fingerprint, GitBranch, LockKeyhole, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface HoldpointHeroProps {
  onLaunch: () => void;
}

const rail = [
  { label: 'Capture', detail: 'The requested action', Icon: GitBranch },
  { label: 'Decide', detail: 'Policy and authority', Icon: ShieldCheck },
  { label: 'Approve', detail: 'Independent sign-off', Icon: Fingerprint },
  { label: 'Verify', detail: 'The resulting effect', Icon: LockKeyhole },
];

export const HoldpointHero: React.FC<HoldpointHeroProps> = ({ onLaunch }) => {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.hp-hero-photo', { scale: 1.09, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 1.7, ease: 'power3.out' });
      gsap.fromTo('.hp-hero-enter', { y: 55, opacity: 0 }, { y: 0, opacity: 1, duration: 1.15, ease: 'power3.out', stagger: 0.1, delay: 0.12 });
      gsap.fromTo('.hp-hero-console', { y: 42, opacity: 0, rotateY: -8 }, { y: 0, opacity: 1, rotateY: 0, duration: 1.25, delay: 0.55, ease: 'power3.out' });
      gsap.to('.hp-hero-photo', {
        yPercent: 10,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
      gsap.to('.hp-hero-wordmark', {
        xPercent: -5,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
    });
    return () => mm.revert();
  }, { scope: heroRef });

  return (
    <section id="top" ref={heroRef} className="hp-hero relative isolate mx-3 mt-3 overflow-hidden bg-[#03101d] sm:mx-5 sm:mt-5">
      <div className="hp-hero-photo absolute inset-0" aria-hidden="true">
        <img src="/holdpoint-operator-hero.png" alt="" fetchPriority="high" className="h-full w-full object-cover" />
      </div>
      <div className="hp-hero-scrim absolute inset-0" aria-hidden="true" />
      <div className="hp-hero-grid absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[790px] max-w-[1500px] flex-col px-5 pt-28 sm:px-10 lg:min-h-[100dvh] lg:px-14">
        <div className="flex flex-1 items-center justify-between gap-6 pb-24 pt-10 lg:pb-28">
          <div className="relative z-10 w-full max-w-5xl">
            <div className="hp-hero-enter hp-hero-status mb-9 inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.05em] text-[#d9eaf7]">
              <span className="hp-status-pulse" aria-hidden="true" />
              CONSEQUENTIAL ACTIONS / HELD UNTIL AUTHORIZED
            </div>
            <h1 className="hp-hero-enter hp-hero-title max-w-5xl font-medium text-white">
              Authority<br /><span>before impact.</span>
            </h1>
            <p className="hp-hero-enter mt-9 max-w-[440px] text-base leading-[1.68] text-[#b9d0e2]">
              The control layer between an AI agent’s intention and a real-world consequence.
            </p>
            <div className="hp-hero-enter mt-9 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onLaunch} className="hp-premium-button hp-premium-button-primary group">
                <span>Enter the control room</span>
                <span className="hp-button-icon"><ArrowUpRight className="size-[15px]" strokeWidth={1.7} /></span>
              </button>
              <a href="#policy-graph" className="hp-premium-button hp-premium-button-quiet group">
                <span>Explore the system</span>
                <span className="hp-button-icon"><ArrowDownRight className="size-[15px]" strokeWidth={1.7} /></span>
              </a>
            </div>
          </div>

          <aside className="hp-hero-console relative z-10 hidden w-[318px] shrink-0 lg:block xl:w-[365px]" aria-label="Illustrative policy decision">
            <div className="hp-console-top flex items-center justify-between px-5 py-4">
              <span className="font-mono text-[10px] tracking-[0.07em] text-[#b8d4e9]">HOLDPOINT / DECISION PREVIEW</span>
              <span className="hp-console-held">HELD</span>
            </div>
            <div className="px-5 pb-5 pt-6">
              <div className="hp-console-symbol mx-auto grid size-24 place-items-center rounded-full">
                <div className="grid size-[66px] place-items-center rounded-full border border-[#c4e8ff]/40"><LockKeyhole className="size-7 text-[#e7f6ff]" strokeWidth={1.25} /></div>
              </div>
              <div className="mt-6 text-center font-mono text-[9px] tracking-[0.14em] text-[#b6d7ee]">AWAITING INDEPENDENT APPROVAL</div>
              <div className="mt-7 border-t border-[#a2cce8]/20 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-mono text-[9px] tracking-[0.1em] text-[#83a8c3]">REQUESTED ACTION</p><p className="mt-2 text-lg font-medium tracking-[-0.04em] text-[#eff8ff]">Force push to main</p></div>
                  <GitBranch className="mt-1 size-5 text-[#a8d5f3]" strokeWidth={1.25} />
                </div>
                <code className="mt-3 block border border-[#9fc9e5]/15 bg-[#102941]/55 px-3 py-2.5 font-mono text-[10px] text-[#bcd9ef]">git push --force origin main</code>
              </div>
              <div className="mt-6 space-y-3">
                <div className="hp-console-step"><Check className="size-3" strokeWidth={1.7} /><span>Intent captured</span><span>01</span></div>
                <div className="hp-console-step"><Check className="size-3" strokeWidth={1.7} /><span>Policy matched</span><span>02</span></div>
                <div className="hp-console-step is-current"><span className="size-3 rounded-full border border-current" /><span>Reviewer required</span><span>03</span></div>
              </div>
              <div className="mt-6 flex items-center gap-2 border-t border-[#a2cce8]/20 pt-4 font-mono text-[9px] text-[#9bbcd3]"><ShieldCheck className="size-3.5" strokeWidth={1.4} /> Destination unchanged</div>
            </div>
          </aside>
        </div>

        <div className="relative z-10">
          <div className="hp-hero-wordmark" aria-hidden="true">HOLDPOINT</div>
          <div className="hp-hero-rail grid grid-flow-dense grid-cols-2 lg:grid-cols-4">
            {rail.map(({ label, detail, Icon }) => (
              <div key={label} className="hp-hero-rail-item flex min-h-[84px] items-center gap-3 px-3 sm:px-5">
                <Icon className="size-[19px] shrink-0 text-[#b3ddf8]" strokeWidth={1.2} />
                <div><span className="block text-[11px] font-semibold text-[#e5f4ff]">{label}</span><span className="mt-1 block text-[10px] text-[#8eafc8]">{detail}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
