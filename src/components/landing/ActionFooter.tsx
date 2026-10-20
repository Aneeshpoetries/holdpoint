import React from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

interface ActionFooterProps {
  onLaunch: () => void;
}

const fields = ['ACTOR', 'OPERATION', 'DESTINATION', 'SCOPE', 'EFFECT'];

export const ActionFooter: React.FC<ActionFooterProps> = ({ onLaunch }) => (
  <>
    <div className="hp-marquee overflow-hidden border-y border-[#8cb9d8]/20 bg-[#071728]" aria-label="The action contract records actor, operation, destination, scope, and effect">
      <div className="hp-marquee-track flex w-max items-center gap-10 py-5 font-mono text-[10px] tracking-[0.14em] text-[#7ca9c8]" aria-hidden="true">
        {[0, 1, 2, 3].map((copy) => fields.map((field) => <span key={`${copy}-${field}`} className="flex items-center gap-10"><span className="size-1 rounded-full bg-[#b5e4ff]" />{field}</span>))}
      </div>
    </div>
    <section className="hp-final relative overflow-hidden px-5 py-28 sm:px-10 lg:py-40">
      <div className="hp-final-ghost" aria-hidden="true">H</div>
      <div className="relative mx-auto max-w-[1500px]">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.12em] text-[#245478]"><ShieldCheck className="size-4" strokeWidth={1.3} /> TAKE CONTROL OF THE MOMENT BEFORE</div>
        <h2 className="mt-10 max-w-[1250px] text-[clamp(3.6rem,8vw,9.5rem)] font-medium leading-[0.9] tracking-[-0.08em] text-[#061c2f]">Make impact<br />answer to authority.</h2>
        <div className="mt-16 flex flex-col gap-8 border-t border-[#1b5078]/25 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-[410px] text-[17px] leading-7 text-[#2c5b7b]">Explore the working control room and trace how a consequential action gets held, reviewed, and recorded.</p>
          <button type="button" onClick={onLaunch} className="hp-premium-button hp-premium-button-dark group w-fit">
            <span>Enter the control room</span>
            <span className="hp-button-icon"><ArrowUpRight className="size-[15px]" strokeWidth={1.7} /></span>
          </button>
        </div>
      </div>
    </section>
  </>
);
