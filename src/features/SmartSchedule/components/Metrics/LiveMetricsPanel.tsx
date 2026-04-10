import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useGanttStore } from '../../store/useGanttStore';
import { Odometer } from './Odometer';
import { CheckCircle2, Clock, AlertTriangle, Route } from 'lucide-react';

export const LiveMetricsPanel: React.FC = () => {
  const { tasks } = useGanttStore();

  // Reactive Math using useMemo to decouple heavy derivations from drag loops
  const metrics = useMemo(() => {
    if (tasks.length === 0) return { score: 100, maxCols: 0, plannedCurve: [], actualCurve: [] };

    let maxPlannedEnd = 0;
    let maxActualEnd = 0;
    let criticalPathCount = 0;
    let sumProgress = 0;

    tasks.forEach(t => {
      const pEnd = t.baselineStartCol + t.durationCols;
      const aEnd = t.startCol + t.durationCols;
      if (pEnd > maxPlannedEnd) maxPlannedEnd = pEnd;
      if (aEnd > maxActualEnd) maxActualEnd = aEnd;
      if (t.type === 'critical' || t.zeroFloat) criticalPathCount++;
      sumProgress += t.progress || 0;
    });

    const timelineLength = Math.max(maxPlannedEnd, maxActualEnd) + 2; 

    // Efficiency Score (Ideal Duration / Projected Real Duration) * 100
    // Capped at 100, bottom at 0.
    const idealDuration = maxPlannedEnd || 1;
    const realDuration = maxActualEnd || 1;
    const rawScore = (idealDuration / realDuration) * 100;
    const score = Math.max(0, Math.min(100, rawScore));

    // S-Curve Arrays: Tasks started vs Time
    const plannedTasksByCol = new Array(timelineLength).fill(0);
    const actualTasksByCol = new Array(timelineLength).fill(0);

    tasks.forEach(t => {
      plannedTasksByCol[t.baselineStartCol] = (plannedTasksByCol[t.baselineStartCol] || 0) + 1;
      actualTasksByCol[t.startCol] = (actualTasksByCol[t.startCol] || 0) + 1;
    });

    const plannedCurve: { x: number, y: number }[] = [];
    const actualCurve: { x: number, y: number }[] = [];

    let cumP = 0;
    let cumA = 0;
    const peakYs = tasks.length || 1;

    for (let c = 0; c < timelineLength; c++) {
      cumP += plannedTasksByCol[c];
      cumA += actualTasksByCol[c];
      
      // Normalize Y between 0 and 100
      plannedCurve.push({ x: c, y: (cumP / peakYs) * 100 });
      actualCurve.push({ x: c, y: (cumA / peakYs) * 100 });
    }

    const globalProgress = sumProgress / (tasks.length || 1);

    return { 
      score, 
      maxCols: timelineLength,
      plannedCurve, 
      actualCurve,
      criticalPathCount,
      globalProgress,
      totalTasks: tasks.length,
      realDuration
    };
  }, [tasks]);

  // Generate SVG Path d string from points
  const drawPath = (points: {x:number,y:number}[], maxCols: number) => {
    if (points.length === 0) return "";
    const w = 240; // SVG Width
    const h = 80;  // SVG Height
    
    return "M " + points.map((p, i) => {
      const px = (p.x / Math.max(1, maxCols - 1)) * w;
      // Invert Y because SVG 0,0 is top-left
      const py = h - (p.y / 100) * h;
      return `${px},${py}`;
    }).join(" L ");
  };

  const plannedD = drawPath(metrics.plannedCurve, metrics.maxCols);
  const actualD = drawPath(metrics.actualCurve, metrics.maxCols);

  // Score UI configs
  const circleCircumference = 2 * Math.PI * 45; // r=45
  const strokeOffset = circleCircumference - (metrics.score / 100) * circleCircumference;

  return (
    <div className="w-full xl:w-72 flex-none flex flex-col gap-4">
      {/* EFFICIENCY GAUGE */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col items-center">
        <h3 className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase mb-4">SLA Efficiency</h3>
        <div className="w-32 h-32 relative flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform drop-shadow-sm">
            <circle 
              cx="64" cy="64" r="45" 
              fill="none" stroke="#F1F5F9" strokeWidth="12"
            />
            <motion.circle 
              cx="64" cy="64" r="45" 
              fill="none" 
              stroke={metrics.score > 90 ? "#0ea5e9" : metrics.score > 70 ? "#f59e0b" : "#ef4444"}
              strokeWidth="12"
              strokeDasharray={circleCircumference}
              animate={{ strokeDashoffset: strokeOffset, stroke: metrics.score > 90 ? "#0ea5e9" : metrics.score > 70 ? "#f59e0b" : "#ef4444" }}
              transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <Odometer value={metrics.score} className="text-3xl font-black text-[#0A2342]" />
             <span className="text-[8px] font-bold text-slate-400">SCORE</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-center font-medium text-[#475569] h-8">
          {metrics.score > 95 ? 'Eficiencia óptima. Proyecto a tiempo.' 
           : metrics.score > 80 ? 'Retraso aceptable en la ruta base.'
           : 'Desviación grave. Ruta Crítica afectada.'}
        </p>
      </div>

      {/* S-CURVE EXECUTION CHART */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-[#E2E8F0]">
        <h3 className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase mb-3 flex items-center justify-between">
           Execution S-Curve
           <span className="text-[8px] flex items-center gap-2">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 block"></span> Plan</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 block"></span> Actual</span>
           </span>
        </h3>
        
        <div className="w-full h-[80px] mt-2 relative">
           <svg className="w-full h-full overflow-visible" viewBox="0 0 240 80" preserveAspectRatio="none">
              {/* Baseline Curve */}
              <path 
                d={plannedD} 
                fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" 
              />
              {/* Actual Morphing Curve */}
              <motion.path 
                animate={{ d: actualD }}
                transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                className="drop-shadow-sm"
              />
           </svg>
        </div>
      </div>

      {/* EXECUTION STATS */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-[#E2E8F0] flex flex-col gap-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-[#64748B]">
             <Clock size={12} />
             <span className="text-[10px] font-bold uppercase">Est. Completion</span>
           </div>
           <span className="text-xs font-black text-[#0A2342]"><Odometer value={metrics.realDuration} /> Semanas</span>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-[#64748B]">
             <Route size={12} />
             <span className="text-[10px] font-bold uppercase">Ruta Crítica</span>
           </div>
           <span className="text-xs font-black text-rose-500">{metrics.criticalPathCount} Tareas</span>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-[#64748B]">
             <CheckCircle2 size={12} />
             <span className="text-[10px] font-bold uppercase">Total Planos</span>
           </div>
           <span className="text-xs font-black text-[#0A2342]">{metrics.totalTasks}</span>
        </div>
        <div className="h-px bg-slate-100 my-1"></div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-[#64748B]">
             <AlertTriangle size={12} />
             <span className="text-[10px] font-bold uppercase">Avance Global</span>
           </div>
           <span className="text-xs font-black text-emerald-600"><Odometer value={metrics.globalProgress} />%</span>
        </div>
      </div>

    </div>
  );
};
