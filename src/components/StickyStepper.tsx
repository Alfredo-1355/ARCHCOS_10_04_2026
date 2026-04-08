import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface Step {
  id: string | number;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface StickyStepperProps {
  steps: Step[];
  onStepClick: (stepId: any) => void;
}

export const StickyStepper: React.FC<StickyStepperProps> = ({ steps, onStepClick }) => {
  return (
    // LAYOUT FIX: Compact sidebar that doesn't steal horizontal space from content.
    // - `w-10` on small screens (icon only, 40px)
    // - `xl:w-52` on large screens (icon + label text, 208px)
    // - `shrink-0` prevents it from being squeezed by the flex-1 content area.
    // - `sticky top-20` keeps it visible as the user scrolls.
    <nav className="sticky top-20 flex flex-col gap-6 w-10 xl:w-52 shrink-0 h-fit">
      <div className="flex flex-col gap-5 relative">
        {/* Vertical progress line */}
        <div className="absolute left-[18px] top-3 bottom-3 w-px bg-arch-border" />
        
        {steps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            title={step.label}
            className="flex items-center gap-3 group transition-all text-left outline-none"
          >
            {/* Dot / Number indicator — always visible */}
            <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${
              step.isActive 
                ? 'bg-brand-ink border-brand-ink shadow-md text-white scale-110' 
                : step.isCompleted
                  ? 'bg-brand-green/20 border-brand-green/40 text-brand-dark-green'
                  : 'bg-white border-arch-border text-arch-text-muted group-hover:border-arch-text group-hover:text-arch-text'
            }`}>
              {step.isCompleted 
                ? <Check size={14} strokeWidth={3} /> 
                : <span className="text-[11px] font-black">{idx + 1}</span>
              }
            </div>
            
            {/* Label — only visible on xl+ viewports */}
            <div className="hidden xl:flex flex-col min-w-0">
              <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 truncate ${
                step.isActive 
                  ? 'text-arch-text' 
                  : 'text-arch-text-muted group-hover:text-arch-text'
              }`}>
                {step.label}
              </span>
              {step.isActive && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="h-0.5 bg-brand-blue mt-1.5 w-8 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Live sync indicator — only on xl */}
      <div className="hidden xl:block pt-6 border-t border-arch-border mt-2">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shrink-0" />
          <span className="text-[9px] font-black text-arch-text-muted uppercase tracking-[0.3em]">Live</span>
        </div>
        <p className="text-[9px] font-bold text-arch-text-muted leading-relaxed">
          Guardado automático activo.
        </p>
      </div>
    </nav>
  );
};
