import React from 'react';
import { motion } from 'motion/react';
import { InfoChip, MiniRing } from './LayoutAtoms';
import { PHASES, getPhase } from '../utils';

interface Props {
  allTasks: any[];
  wc: number;
  todayWi: number;
  sCurve: { planned: number[]; actual: number[] };
}

export const MetricsPanel: React.FC<Props> = ({ allTasks, wc, todayWi, sCurve }) => {
  const currentActual = allTasks.length
    ? allTasks.reduce((a, t) => a + (t.progress || 0), 0) / allTasks.length
    : 0;

  const ptsPlanned = sCurve.planned
    .map((val, i) => `${i * (200 / (wc - 1 || 1))},${60 - (val / 100) * 60}`)
    .join(" ");
  const ptsActual = sCurve.actual
    .map((val, i) => `${i * (200 / (wc - 1 || 1))},${60 - (val / 100) * 60}`)
    .join(" ");

  const curPhase = getPhase(todayWi >= 0 ? todayWi : wc - 1, wc);

  return (
    <div className="flex-none w-full xl:w-[320px] flex flex-col gap-6">
      {/* S-Curve Chart Glass Card */}
      <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-[2rem] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.05)] relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/30 rounded-full blur-3xl group-hover:bg-blue-200/40 transition-all duration-700" />
        
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center justify-between">
          Dinámica de Avance
          <span className="text-[#3B82F6] bg-blue-50 px-2 py-0.5 rounded-lg">{Math.round(currentActual)}%</span>
        </h3>
        
        <div className="h-[140px] relative mt-4 flex items-end justify-center">
          <svg width="260" height="100" viewBox="0 0 200 60" className="overflow-visible">
            {/* Soft Grid Lines */}
            <line x1="0" y1="0" x2="200" y2="0" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
            <line x1="0" y1="30" x2="200" y2="30" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
            <line x1="0" y1="60" x2="200" y2="60" stroke="#E2E8F0" strokeWidth="1.5" />
            
            {/* Planned Line (Pastel Blue) */}
            <motion.polyline
              points={ptsPlanned}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="5 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2 }}
            />
            {/* Actual Line (Pastel Green) */}
            <motion.polyline
              points={ptsActual}
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="drop-shadow-[0_4px_8px_rgba(16,185,129,0.2)]"
            />
          </svg>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Objetivo</p>
            <p className="text-2xl font-black text-slate-400 tracking-tight">
              {Math.round(sCurve.planned[todayWi >= 0 ? todayWi : sCurve.planned.length - 1] || 0)}%
            </p>
          </div>
          <div className="bg-[#DCFCE7]/40 backdrop-blur-sm rounded-2xl p-4 border border-[#BBF7D0]/60">
            <p className="text-[8px] font-black text-[#15803D] uppercase tracking-widest mb-1">Logrado</p>
            <p className="text-2xl font-black text-[#10B981] tracking-tight">{Math.round(currentActual)}%</p>
          </div>
        </div>
      </div>

      {/* Overview Phase Glass Card */}
      <div className="backdrop-blur-xl bg-[#0A2342] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
        
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-20 h-20 transform -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="16"
                fill="none"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - currentActual }}
                strokeLinecap="round"
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-lg font-black tracking-tighter">{Math.round(currentActual)}%</span>
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tighter leading-none mb-1">Fase {curPhase.short}</h4>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">{curPhase.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 pt-6 border-t border-white/5">
          <div>
            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-0.5">Planos</p>
            <p className="text-lg font-black">{allTasks.length}</p>
          </div>
          <div>
            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-0.5">Cronograma</p>
            <p className="text-lg font-black">{wc} Sem.</p>
          </div>
        </div>

        <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98]">
           Ver Reporte Detallado
        </button>
      </div>
    </div>
  );
};
