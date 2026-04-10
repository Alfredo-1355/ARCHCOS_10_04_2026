import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Download, FileText, ArrowLeft, Mail, MessageSquare, 
  ShieldCheck, MousePointer2, Construction, DollarSign, MapPin, 
  Hash, Users, LayoutDashboard, Building2, Zap, ChevronRight
} from 'lucide-react';
import { useGanttStore } from '../../SmartSchedule/store/useGanttStore';
import { USERS, PROJECT_AREAS } from '../../../constants/users';

interface ClientDashboardProps {
  project: any;
  onBack?: () => void;
  onDownloadReport?: () => void;
}

// --- PREMIUM SUB-COMPONENTS ---

/**
 * Trust Gauge: Visual Transparency - Construction Progress vs. Budget Spent
 */
const TrustGauge = ({ progress, budget }: { progress: number; budget: any }) => {
  const budgetUsedPct = budget?.total > 0 ? Math.round((budget.spent / budget.total) * 100) : 0;
  const isHealthy = budgetUsedPct <= progress + 5;
  const parity = progress - budgetUsedPct;

  return (
    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-8 rounded-[2.5rem] shadow-soft relative overflow-hidden group">
      <div className="flex justify-between items-start mb-8 text-left">
        <div>
          <h3 className="text-[9px] font-black tracking-[0.4em] text-slate-400 uppercase mb-2">Indicador de Confianza</h3>
          <p className="text-sm font-bold text-slate-800">Paridad Avance vs Inversión</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isHealthy ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
          {isHealthy ? 'Saludable' : 'Alerta'}
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="relative h-16 flex items-center">
            <div className="absolute w-full h-1.5 bg-slate-100 rounded-full" />
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${budgetUsedPct}%` }}
               className="absolute h-1.5 bg-slate-200 rounded-full"
            />
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               className="absolute h-1.5 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ left: `${progress}%`, scale: 1 }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-lg"
            />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center bg-white/50 p-4 rounded-2xl border border-white/40">
           <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Avance Físico</p>
              <p className="text-lg font-black text-slate-800">{progress}%</p>
           </div>
           <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Presupuesto</p>
              <p className="text-lg font-black text-slate-800">{budgetUsedPct}%</p>
           </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/30 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        <p className="text-[9px] text-slate-500 italic font-medium leading-relaxed text-left">
          {parity >= 0 
            ? `Inversión ${parity}% optimizada respecto al trabajo ejecutado.` 
            : `Desvío del ${Math.abs(parity)}% identificado.`}
        </p>
      </div>
    </div>
  );
};

const TeamMemberCard = ({ member, role }: { member: any; role: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group/card text-left">
      <div 
        className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 hover:bg-white hover:shadow-float transition-all cursor-pointer"
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[10px] shadow-md flex-shrink-0"
          style={{ backgroundColor: member.color || '#CBD5E1' }}
        >
          {member.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-slate-800 truncate">{member.name}</p>
          <p className="text-[8px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">{role}</p>
        </div>
        <MousePointer2 size={12} className="text-slate-300 group-hover/card:text-indigo-400 transition-colors" />
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl z-50 border border-white/10"
          >
            <p className="text-[10px] font-bold mb-4 text-white/90">Contacte a su líder de proyecto.</p>
            <div className="flex flex-col gap-2">
              <a href={`mailto:${member.email}`} className="py-2.5 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                <Mail size={10} /> Enviar Email
              </a>
              <a href={`https://wa.me/521234567890`} target="_blank" rel="noreferrer" className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                <MessageSquare size={10} /> WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PhaseGauge = ({ name, progress, index }: { name: string; progress: number; index: number }) => {
  const isCompleted = progress === 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group flex flex-col items-center"
    >
      <div className="relative w-28 h-28 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-slate-50" />
          <motion.circle
            cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray="264"
            initial={{ strokeDashoffset: 264 }}
            animate={{ strokeDashoffset: 264 - (264 * progress) / 100 }}
            transition={{ duration: 1.5, ease: "circOut", delay: index * 0.1 }}
            className={isCompleted ? "text-emerald-400" : "text-sky-300"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-light text-slate-800">{Math.round(progress)}<span className="text-[8px] ml-0.5 opacity-40">%</span></span>
        </div>
      </div>
      <div className="text-center space-y-1">
        <span className="inline-block px-1.5 py-0.5 bg-slate-50 text-[7px] font-black tracking-widest text-slate-400 uppercase rounded">0{index + 1}</span>
        <h3 className="text-[9px] font-bold tracking-[0.1em] text-slate-800 uppercase leading-tight max-w-[80px]">{name}</h3>
      </div>
    </motion.div>
  );
};

const KinematicSCurve = ({ planned, actual }: { planned: string; actual: string }) => {
  return (
    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-10 text-left">
        <div>
          <h3 className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase mb-2">Histórico & Proyección</h3>
          <p className="text-xl font-playfair italic text-slate-800">Curva Operativa S-Curve</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Real</span>
          </div>
        </div>
      </div>
      <div className="h-[260px] w-full relative">
        <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d overflow-visible">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line key={p} x1="0" y1={300 - p * 300} x2="1000" y2={300 - p * 300} stroke="#F1F5F9" strokeWidth="1" />
          ))}
          <motion.path d={planned} fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="5,5" />
          <motion.path d={actual} fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ d: actual, pathLength: 1 }} transition={{ duration: 1.5 }} />
        </svg>
      </div>
    </div>
  );
};

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ project, onBack, onDownloadReport }) => {
  const { tasks, setTasks } = useGanttStore();
  
  const handleApprove = (taskId: string) => {
    const nextTasks = tasks.map(t => t.id === taskId ? { ...t, progress: 100 } : t);
    setTasks(nextTasks);
  };

  const metrics = useMemo(() => {
    if (!tasks || tasks.length === 0) return { totalProgress: 0, phases: [], plannedPath: 'M 0 300 L 1000 300', actualPath: 'M 0 300 L 1000 300' };
    const categories: Record<string, { total: number; count: number }> = {};
    tasks.forEach(t => {
      const cat = t.categoryId || 'General';
      if (!categories[cat]) categories[cat] = { total: 0, count: 0 };
      categories[cat].total += t.progress;
      categories[cat].count++;
    });
    const phases = Object.entries(categories).map(([name, stats]) => ({
      name,
      progress: Math.round(stats.total / stats.count)
    }));
    const totalProgress = Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length);
    const totalCols = Math.max(...tasks.map(t => t.startCol + t.durationCols), 1);
    const steps = 30;
    let plannedPts = "M 0 300";
    let actualPts = "M 0 300";
    for (let i = 0; i <= steps; i++) {
        const col = (i / steps) * totalCols;
        const x = (i / steps) * 1000;
        let pSum = 0; let aSum = 0;
        tasks.forEach(t => {
            const tStartB = t.baselineStartCol || 0;
            const tEndB = tStartB + t.durationCols;
            if (col >= tEndB) pSum += 100;
            else if (col > tStartB) pSum += ((col - tStartB) / (tEndB - tStartB)) * 100;
            const tStartA = t.startCol;
            const tEndA = t.startCol + t.durationCols;
            if (col >= tEndA) aSum += t.progress;
            else if (col > tStartA) aSum += ((col - tStartA) / (tEndA - tStartA)) * t.progress;
        });
        const yP = 300 - (pSum / (tasks.length * 100)) * 280;
        const yA = 300 - (aSum / (tasks.length * 100)) * 280;
        plannedPts += ` L ${x} ${yP}`;
        actualPts += ` L ${x} ${yA}`;
    }
    return { totalProgress, phases, plannedPath: plannedPts, actualPath: actualPts };
  }, [tasks]);

  const upcomingTask = useMemo(() => {
    return [...tasks].filter(t => t.type === 'review' && t.progress < 100).sort((a, b) => a.startCol - b.startCol)[0];
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700 text-left">
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <header className="flex flex-col lg:flex-row justify-between items-start mb-20 gap-12 text-left">
          <div className="flex-1">
            <div className="flex items-center gap-6 mb-8">
              <button onClick={onBack} className="p-2 transition-transform hover:-translate-x-1"><ArrowLeft size={18} className="text-slate-400" /></button>
              <div className="w-12 h-[1px] bg-emerald-400" />
              <p className="text-[10px] font-black tracking-[0.4em] text-emerald-600 uppercase">Client Access Portal</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-playfair italic text-slate-900 leading-[1.1] mb-8 max-w-3xl">{project.address}</h1>
            <div className="flex flex-wrap gap-8 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />ID: {project.id}</div>
              <div className="flex items-center gap-2"><MapPin size={12} className="text-slate-200" /> {project.type} · {project.subtype}</div>
              <div className="flex items-center gap-2"><Hash size={12} className="text-slate-200" /> Area: {project.totalArea?.value?.toLocaleString()} {project.totalArea?.unit}</div>
              <div className="flex items-center gap-2"><Clock size={12} className="text-slate-200" /> Entrega: {project.estimatedCompletion || 'TBD'}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-6 w-full lg:w-auto">
             <div className="text-right">
                <p className="text-7xl md:text-9xl font-playfair font-black text-slate-900 tracking-tighter leading-none relative">
                   {metrics.totalProgress || project.progress}<span className="text-3xl text-emerald-400 absolute top-4 -right-8">%</span>
                </p>
                <p className="text-[9px] font-black tracking-[0.4em] text-slate-300 uppercase mt-4">Progreso Consolidado</p>
             </div>
             <button onClick={onDownloadReport} className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 rounded-full text-[9px] font-black tracking-[0.2em] text-white uppercase hover:bg-indigo-600 transition-all shadow-xl">
                Exportar Reporte Ejecutivo <Download size={14} />
             </button>
          </div>
        </header>

        <section className="mb-20 bg-white/40 backdrop-blur-3xl border border-white/60 p-10 md:p-14 rounded-[3rem] relative overflow-hidden shadow-soft">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8 text-left">
              <div>
                <h2 className="text-[9px] font-black tracking-[0.3em] text-emerald-600 uppercase mb-2">Project Roadmap</h2>
                <p className="text-2xl font-playfair italic text-slate-800">Evolución de Activos</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Completado</div>
                 <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-sky-200" /> En Proceso</div>
              </div>
           </div>
           <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar justify-start md:justify-center">
              {metrics.phases.map((ph, idx) => (
                <PhaseGauge key={ph.name} name={(PROJECT_AREAS.find(a => a.id === ph.name)?.title || ph.name).replace('Instalación ', '').toUpperCase()} progress={ph.progress} index={idx} />
              ))}
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
                <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-12 rounded-[2.5rem] relative overflow-hidden shadow-soft text-left">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                   <div className="flex justify-between items-center mb-10">
                      <p className="text-[10px] font-black tracking-[0.4em] text-indigo-600 uppercase">Secure Portal Status</p>
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 tracking-widest uppercase">
                         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Sync Active
                      </div>
                   </div>
                   <h2 className="text-4xl font-playfair italic text-slate-800 leading-[1.2] mb-12">
                      Sincronización de activos digitales en curso. Los últimos cambios técnicos ya están disponibles.
                   </h2>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><LayoutDashboard size={20} /></div>
                      <div>
                        <p className="text-[12px] font-bold text-slate-800">Operational Integrity</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Infrastructure Protocol</p>
                      </div>
                   </div>
                </div>
                <KinematicSCurve planned={metrics.plannedPath} actual={metrics.actualPath} />
            </div>

            <aside className="lg:col-span-4 space-y-12">
                <TrustGauge progress={metrics.totalProgress || project.progress} budget={project.budget} />

                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-left relative overflow-hidden shadow-2xl">
                   <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-8"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">Upcoming Milestone</span></div>
                      {upcomingTask ? (
                        <>
                          <h3 className="text-3xl font-playfair italic text-white mb-4">{upcomingTask.name}</h3>
                          <p className="text-xs text-slate-400 mb-10 leading-relaxed italic">Revisión técnica programada. Su aprobación es necesaria para desbloquear la siguiente fase táctica.</p>
                          <button onClick={() => handleApprove(upcomingTask.id)} className="w-full py-5 bg-white text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3"><ShieldCheck size={14} /> Revisar y Aprobar</button>
                        </>
                      ) : (
                        <div className="py-10 text-center text-slate-500 italic text-sm">No hay entregables pendientes.</div>
                      )}
                   </div>
                   <div className="absolute -right-12 -bottom-12 opacity-5 text-white"><FileText size={200} /></div>
                </div>

                <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-10 rounded-[2.5rem] text-left shadow-soft">
                   <h3 className="text-[9px] font-black tracking-[0.4em] text-slate-400 uppercase mb-8">Personal Asignado</h3>
                   <div className="space-y-4">
                      {Object.entries(project.assignments || {}).map(([areaId, uids]: any) => {
                        const areaTitle = PROJECT_AREAS.find(a => a.id === areaId)?.title || areaId;
                        return (uids as string[]).map(uid => {
                          const user = USERS.find(u => u.id === uid);
                          if (!user) return null;
                          return <TeamMemberCard key={uid} member={user} role={areaTitle.replace('Proyecto ', '')} />;
                        });
                      })}
                   </div>
                </div>
            </aside>
        </div>
      </main>
    </div>
  );
};
