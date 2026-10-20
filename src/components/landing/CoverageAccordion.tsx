import React, { useRef, useState } from 'react';
import { ArrowUpRight, Cloud, GitBranch, Landmark, MessageSquareLock } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const surfaces = [
  { name: 'Code', Icon: GitBranch, action: 'Force push to a protected branch', policy: 'Independent reviewer required', scope: 'REPOSITORY / PRODUCTION', geometry: 'code' },
  { name: 'Cloud', Icon: Cloud, action: 'Delete production customer data', policy: 'Recovery proof required', scope: 'DATA PLANE / PRODUCTION', geometry: 'cloud' },
  { name: 'Payments', Icon: Landmark, action: 'Transfer to a new beneficiary', policy: 'Dual authorization required', scope: 'TREASURY / EXTERNAL', geometry: 'payments' },
  { name: 'Comms', Icon: MessageSquareLock, action: 'Send to every customer', policy: 'Content and audience review', scope: 'PUBLIC CHANNEL / ALL', geometry: 'comms' },
];

export const CoverageAccordion: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(0);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.hp-coverage-heading', { y: 70, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
      gsap.fromTo('.hp-surfaces', { scale: 0.9, opacity: 0.35 }, {
        scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.hp-surfaces', start: 'top 90%', end: 'top 25%', scrub: 0.8 },
      });
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section id="coverage" ref={sectionRef} className="hp-coverage scroll-mt-20 px-3 py-36 sm:px-5 lg:py-48">
      <div className="mx-auto max-w-[1500px]">
        <div className="hp-coverage-heading mb-14 px-3 sm:px-8">
          <p className="hp-section-overline">A single control plane</p>
          <h2 className="mt-7 max-w-[1050px] text-[clamp(3.5rem,6.4vw,7.2rem)] font-medium leading-[0.96] tracking-[-0.073em] text-[#edf8ff]">Every surface.<br /><span className="text-[#82afcf]">One standard of authority.</span></h2>
          <p className="mt-7 max-w-[560px] text-[17px] leading-7 text-[#99b7cc]">Select a surface. The operation changes; the boundary does not.</p>
        </div>

        <div className="hp-surfaces grid min-h-[560px] gap-px overflow-hidden border border-[#7eaccb]/25 bg-[#456a85]/25 lg:grid-cols-4">
          {surfaces.map(({ name, Icon, action, policy, scope, geometry }, index) => (
            <button
              key={name} type="button" onClick={() => setSelected(index)} onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)}
              aria-pressed={selected === index}
              className={`hp-surface group relative isolate flex min-h-[390px] flex-col overflow-hidden p-7 text-left sm:p-9 lg:min-h-[560px] ${selected === index ? 'is-selected' : ''}`}
            >
              <div className={`hp-surface-geometry hp-surface-geometry-${geometry} absolute inset-0`} aria-hidden="true">
                <div className="hp-surface-ring hp-surface-ring-one" /><div className="hp-surface-ring hp-surface-ring-two" /><div className="hp-surface-ring hp-surface-ring-three" />
              </div>
              <div className="relative z-10 flex items-start justify-between"><Icon className="size-6 text-[#b6dcf3]" strokeWidth={1.15} /><ArrowUpRight className="size-5 text-[#91b9d2] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={1.3} /></div>
              <div className="relative z-10 mt-auto">
                <span className="font-mono text-[10px] tracking-[0.12em] text-[#82aac4]">{scope}</span>
                <h3 className="mt-4 text-[clamp(2.5rem,3.7vw,4.6rem)] font-medium leading-none tracking-[-0.07em] text-[#eaf7ff]">{name}</h3>
                <div className="hp-surface-detail mt-7 border-t border-[#9ac6e3]/25 pt-5">
                  <p className="font-mono text-[9px] tracking-[0.1em] text-[#7ca8c5]">EXAMPLE ACTION</p>
                  <p className="mt-2 text-[15px] leading-6 text-[#d5e9f6]">{action}</p>
                  <p className="mt-5 font-mono text-[9px] tracking-[0.1em] text-[#7ca8c5]">CONTROL RESULT</p>
                  <p className="mt-2 text-[13px] leading-5 text-[#afd2e8]">{policy}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
