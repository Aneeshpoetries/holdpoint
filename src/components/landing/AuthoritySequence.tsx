import React, { useRef, useState } from 'react';
import { Check, CirclePause, Fingerprint, GitBranch, LockKeyhole, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
  {
    key: 'REQUEST', title: 'Intent is captured.', Icon: GitBranch,
    description: 'The agent proposes an exact operation. HOLDPOINT records what it wants to change before any tool can run.',
    fact: 'git push --force origin main', detail: 'Actor · operation · destination · scope', state: 'CONTRACT CREATED',
  },
  {
    key: 'POLICY', title: 'Authority is evaluated.', Icon: ShieldCheck,
    description: 'The request crosses the policy boundary. Force-pushing a shared branch requires a separate authorized reviewer.',
    fact: 'Independent review required', detail: 'Rule matched · production repository', state: 'POLICY MATCHED',
  },
  {
    key: 'APPROVAL', title: 'The action waits.', Icon: Fingerprint,
    description: 'A prompt is not an approval. Until a real person signs off on this exact change, the request remains held.',
    fact: 'Awaiting authorized reviewer', detail: 'No approval token · no dispatch', state: 'HOLD ACTIVE',
  },
  {
    key: 'EVIDENCE', title: 'The effect is proven.', Icon: LockKeyhole,
    description: 'The destination is checked after the decision. In this case, nothing was changed; the blocked attempt is recorded.',
    fact: 'Production branch unchanged', detail: 'Destination check · evidence sealed', state: 'NO EFFECT',
  },
];

export const AuthoritySequence: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef(0);
  const [active, setActive] = useState(0);
  const enhancedMotion = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)').matches;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.hp-reveal-word', { opacity: 0.16, y: 34 }, {
        opacity: 1, y: 0, ease: 'none', stagger: 0.18,
        scrollTrigger: { trigger: '.hp-sequence-intro', start: 'top 76%', end: 'bottom 46%', scrub: 0.8 },
      });
    });
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const stage = stageRef.current;
      const lane = laneRef.current;
      const packet = packetRef.current;
      if (!stage || !lane || !packet) return;
      const cards = gsap.utils.toArray<HTMLElement>('.hp-sequence-card');
      const nodes = gsap.utils.toArray<HTMLElement>('.hp-sequence-node');
      gsap.set(cards.slice(1), { autoAlpha: 0, y: 74, scale: 1.045 });
      gsap.set('.hp-sequence-progress-line', { scaleX: 0, transformOrigin: 'left center' });
      const travel = () => Math.max(0, lane.clientWidth - packet.clientWidth - 20);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage, start: 'top top', end: () => `+=${Math.max(2200, window.innerHeight * 3.25)}`,
          pin: true, scrub: 0.75, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            const next = Math.min(3, Math.floor(progress * 4));
            if (next !== lastActive.current) { lastActive.current = next; setActive(next); }
          },
        },
      });
      [1, 2, 3].forEach((index) => {
        const start = index - 1;
        timeline.to(packet, { x: () => travel() * (index / 3), duration: 0.8, ease: 'power2.inOut' }, start);
        timeline.to('.hp-sequence-progress-line', { scaleX: index / 3, duration: 0.8, ease: 'none' }, start);
        timeline.to(nodes[index], { scale: 1.2, duration: 0.18, ease: 'power2.out' }, start + 0.48);
        timeline.to(cards[index - 1], { autoAlpha: 0.13, y: -42, scale: 0.96, duration: 0.5, ease: 'power2.inOut' }, start + 0.18);
        timeline.to(cards[index], { autoAlpha: 1, y: 0, scale: 1, duration: 0.58, ease: 'power3.out' }, start + 0.38);
      });
      timeline.to({}, { duration: 0.15 });
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section id="control-story" ref={sectionRef} className="hp-sequence scroll-mt-20">
      <div className="hp-sequence-intro mx-auto max-w-[1500px] px-5 pb-24 pt-36 sm:px-10 lg:pb-36 lg:pt-48">
        <p className="hp-section-overline">The authority boundary</p>
        <h2 className="mt-8 max-w-[1100px] text-[clamp(3.6rem,7vw,8rem)] font-medium leading-[0.94] tracking-[-0.075em] text-[#eff8ff]">
          {['A request', 'is not', 'permission.'].map((word) => <span key={word} className="hp-reveal-word mr-[0.23em] inline-block">{word}</span>)}
        </h2>
        <p className="mt-8 max-w-[560px] text-lg leading-[1.55] text-[#9ab7cc]">Scroll one consequential action through the gate. Every movement below changes what the system is allowed to do.</p>
      </div>

      <div ref={stageRef} className="hp-sequence-stage relative mx-3 min-h-[760px] overflow-hidden sm:mx-5 lg:h-[100dvh] lg:min-h-[680px]">
        <div className="hp-sequence-stage-grid absolute inset-0" aria-hidden="true" />
        <div className="hp-sequence-chrome relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3"><span className="size-2 rounded-full bg-[#bfe8ff] shadow-[0_0_18px_#88ccff]" /><span>ONE ACTION / FOUR DECISIONS</span></div>
          <span className="hidden sm:block">SCROLL TO TRACE THE ROUTE</span>
        </div>

        <div className="hp-sequence-layout relative z-10 mx-auto grid max-w-[1500px] gap-10 px-6 pb-14 pt-8 sm:px-10 lg:h-[calc(100%-62px)] lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)] lg:items-center lg:gap-16 lg:py-10">
          <div className="hp-sequence-left relative flex min-h-[390px] flex-col justify-between lg:min-h-[560px]">
            <div>
              <p className="font-mono text-[10px] tracking-[0.1em] text-[#7ba9c6]">CONSEQUENTIAL ACTION CONTRACT</p>
              <div className="mt-8 max-w-[620px] font-medium leading-[0.97] tracking-[-0.07em] text-[#eaf7ff]" style={{ fontSize: 'clamp(3rem, 5.5vw, 6.5rem)' }}>
                Before it<br /><span className="text-[#7aabd0]">becomes real.</span>
              </div>
            </div>

            <div className="hp-sequence-route">
              <div ref={laneRef} className="hp-sequence-lane relative h-[106px]">
                <div className="hp-sequence-rail-line absolute left-5 right-5 top-[42px] h-px" />
                <div className="hp-sequence-progress-line absolute left-5 right-5 top-[42px] h-px bg-[#b9e6ff]" />
                <div ref={packetRef} className="hp-sequence-packet absolute left-[5px] top-[25px] z-20 grid size-[35px] place-items-center rounded-full border border-[#d5f3ff] bg-[#c5eaff] text-[#092338] shadow-[0_0_34px_rgba(154,218,255,0.65)]"><GitBranch className="size-4" strokeWidth={1.6} /></div>
                <div className="absolute inset-x-0 top-0 flex justify-between">
                  {steps.map(({ key, Icon }, index) => (
                    <div key={key} className={`hp-sequence-node flex w-20 flex-col items-center gap-7 ${index <= active ? 'is-active' : ''}`}>
                      <div className="hp-sequence-node-core mt-[27px] grid size-[30px] place-items-center rounded-full border border-[#789bb7]/45 bg-[#081a2a]"><Icon className="size-3.5" strokeWidth={1.4} /></div>
                      <span className="font-mono text-[9px] tracking-[0.08em]">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[#8db6d0]/20 pt-4 font-mono text-[10px] text-[#729cbb]"><span>ACTOR: AGENT</span><span>DESTINATION: PRODUCTION</span></div>
            </div>
          </div>

          <div className="hp-sequence-card-stack relative min-h-[420px] lg:h-[520px]">
            {steps.map(({ key, title, description, fact, detail, state, Icon }, index) => (
              <article key={key} className={`hp-sequence-card absolute inset-0 ${index === 0 ? 'is-first' : ''}`} aria-hidden={enhancedMotion && index !== active}>
                <div className="hp-sequence-card-core flex h-full flex-col p-7 sm:p-9">
                  <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3 text-[#acd3ec]"><Icon className="size-5" strokeWidth={1.3} /><span className="font-mono text-[10px] tracking-[0.12em]">{key}</span></div><span className="font-mono text-[10px] text-[#6b98b5]">0{index + 1} / 04</span></div>
                  <div className="mt-14"><h3 className="text-[clamp(2rem,3vw,3.2rem)] font-medium leading-[1.05] tracking-[-0.055em] text-[#f2faff]">{title}</h3><p className="mt-5 max-w-[370px] text-[15px] leading-7 text-[#a3bed0]">{description}</p></div>
                  <div className="mt-auto"><div className="border-t border-[#92bbd5]/25 pt-5"><p className="font-mono text-[9px] tracking-[0.1em] text-[#719fbe]">EVIDENCE IN FOCUS</p><p className="mt-3 text-lg font-medium text-[#e2f2fc]">{fact}</p><p className="mt-2 font-mono text-[10px] text-[#82a8c0]">{detail}</p></div><div className="mt-7 flex items-center gap-2 font-mono text-[10px] tracking-[0.07em] text-[#bbdff6]">{index === 2 ? <CirclePause className="size-4" strokeWidth={1.4} /> : <Check className="size-4" strokeWidth={1.4} />}{state}</div></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
