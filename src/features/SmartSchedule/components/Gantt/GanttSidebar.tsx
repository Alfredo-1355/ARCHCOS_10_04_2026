import React from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, AlertCircle, Info, Activity } from 'lucide-react';

interface SidebarProps {
  efficiencyScore: number;
  metrics: {
    estCompletion: number;
    totalTasks: number;
    criticalCount: number;
    refinements: number;
    reviews: number;
    globalProgress: number;
  };
  sCurve: { planned: number[]; actual: number[] };
}

export const GanttSidebar: React.FC<SidebarProps> = ({ efficiencyScore, metrics, sCurve }) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="w-full xl:w-[400px] flex flex-col gap-6">
      {/* Efficiency Score Card */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Efficiency Score (SLA)</h3>
        
        <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <motion.circle 
                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray={440}
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * efficiencyScore) / 100 }}
                    className={getScoreColor(efficiencyScore)}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black tracking-tightest ${getScoreColor(efficiencyScore)}`}>{efficiencyScore}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Puntos</span>
            </div>
        </div>
        
        <div className="flex gap-4">
            <ScoreLegend label="Pobre" range="<50" color="bg-red-500" />
            <ScoreLegend label="Regular" range="50-80" color="bg-amber-500" />
            <ScoreLegend label="Excelente" range=">80" color="bg-emerald-500" />
        </div>
      </div>

      {/* Execution Metrics Card */}
      <div className="backdrop-blur-xl bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Target size={14} className="text-emerald-400" />
            Execution Metrics
        </h3>
        
        <div className="space-y-6">
            <MetricLine label="Est. Completion" value={`${metrics.estCompletion} Sem.`} />
            <MetricLine label="Total Planos" value={metrics.totalTasks} />
            <MetricLine label="Ruta Crítica" value={metrics.criticalCount} highlight={metrics.criticalCount > 5} />
            <MetricLine label="Refinamientos" value={metrics.refinements} />
            <MetricLine label="Revisiones" value={metrics.reviews} />
            <div className="pt-4 mt-6 border-t border-slate-800">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avance Global</span>
                    <span className="text-2xl font-black text-emerald-400 tabular-nums">{metrics.globalProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.globalProgress}%` }}
                        className="h-full bg-emerald-400"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* S-Curve Card */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity size={12} />
                Curva S — Dinámica
            </h3>
            {efficiencyScore < 70 && (
                <div className="bg-red-50 text-red-500 px-2 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
                    <AlertCircle size={12} />
                    <span className="text-[8px] font-black uppercase">Retraso</span>
                </div>
            )}
        </div>
        
        <div className="h-48 w-full relative">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Planned Curve */}
                <path 
                    d={`M 0 100 ${sCurve.planned.map((v, i) => `L ${(i / (sCurve.planned.length - 1)) * 100} ${100 - v}`).join(' ')}`}
                    fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 2" opacity="0.4"
                />
                {/* Actual Curve */}
                <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    d={`M 0 100 ${sCurve.actual.map((v, i) => `L ${(i / (sCurve.planned.length - 1)) * 100} ${100 - v}`).join(' ')}`}
                    fill="none" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round"
                />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest pt-2">
                <span>Inicio</span>
                <span>Objetivo</span>
            </div>
        </div>
        
        <div className="mt-8 flex gap-6">
            <LegendItem label="Planeado" color="bg-blue-300" dashed />
            <LegendItem label="Real" color="bg-teal-400" />
        </div>
      </div>
    </div>
  );
};

const MetricLine = ({ label, value, highlight }: { label: string, value: string | number, highlight?: boolean }) => (
    <div className="flex justify-between items-center group">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
        <span className={`text-sm font-black tracking-tight ${highlight ? 'text-red-400' : 'text-slate-200'}`}>{value}</span>
    </div>
);

const ScoreLegend = ({ label, range, color }: { label: string, range: string, color: string }) => (
    <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full ${color} mb-1`} />
        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[8px] font-black text-slate-500">{range}</span>
    </div>
);

const LegendItem = ({ label, color, dashed }: { label: string, color: string, dashed?: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-1 rounded-full ${color} ${dashed ? 'opacity-50' : ''}`} />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
);
