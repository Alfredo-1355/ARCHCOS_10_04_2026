import React, { useState, useMemo, useEffect } from "react";
import { Search, Info, RefreshCw, Zap, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Contexts & Hooks
import { useProjects } from "../../contexts/DashboardContext";
import { useSmartSchedule } from "./useSmartSchedule";

// Local Sub-components (Modular Architecture)
import { GanttHeader } from './components/Gantt/GanttHeader';
import { GanttSidebar } from './components/Gantt/GanttSidebar';
import { GanttTable } from './components/Gantt/GanttTable';
import { AssignmentNotifyToast } from './components/AssignmentNotifyToast';

// Local Utils
import { TEAM_MEMBERS, sendAssignmentEmail } from "./utils";

const SmartSchedule: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  const { projects: allProjects, activeProjectId, setActiveProjectId } = useProjects();
  
  const project = useMemo(() => 
    (allProjects || []).find(p => p.id === activeProjectId) || null,
    [allProjects, activeProjectId]
  );

  const hook = useSmartSchedule(project);

  const {
    startDate, setStartDate, search, setSearch, zoom, setZoom,
    categories, weeks, statuses, wkLoad, todayWi,
    COL_W, efficiencyScore, executionMetrics,
    addWeek, addTask, addCat, toggleWk, updAssignee, toggleType, cycleStatus, gen,
    generating, statusMsg, saveStatus, sCurve, assignToast, setAssignToast, toggleExpand,
    drag, setDrag, onMouseUp, hovWk, setHovWk
  } = hook;

  // --- Search Logic ---
  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.map(c => ({
      ...c,
      tasks: c.tasks.filter(t => t.name.toLowerCase().includes(q))
    })).filter(c => c.tasks.length > 0 || c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div 
      className="min-h-full bg-[#FBFDFF] font-sans text-[#0A192F] relative overflow-hidden" 
      onMouseUp={hook.onMouseUp}
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 p-6 xl:p-10 max-w-[2200px] mx-auto">
        <GanttHeader 
          project={project}
          allProjects={allProjects || []}
          activeProjectId={activeProjectId}
          setActiveProjectId={setActiveProjectId}
          startDate={startDate}
          setStartDate={setStartDate}
          addWeek={addWeek}
          onGenerate={gen}
          isGenerating={generating}
          statusMsg={statusMsg}
          navigate={navigate}
        />

        {/* PERSISTENCE TOAST */}
        <AnimatePresence>
          {project && saveStatus !== 'idle' && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className={`fixed bottom-10 left-10 flex items-center gap-4 px-8 py-4 rounded-3xl shadow-2xl z-50 backdrop-blur-2xl border border-white/60 ${saveStatus === 'saving' ? 'bg-amber-50/90 text-amber-700' : 'bg-emerald-50/90 text-emerald-700'}`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                 {saveStatus === 'saving' ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} className="fill-emerald-400 text-emerald-400" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{saveStatus === 'saving' ? 'Sincronizando' : 'Guardado'}</span>
                <span className="text-[9px] font-extrabold opacity-60">Base de Datos Firebase</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeProjectId ? (
          <div className="flex-1 backdrop-blur-xl bg-white/40 border-2 border-dashed border-white/60 rounded-[4rem] min-h-[600px] flex flex-col items-center justify-center p-12 text-center group transition-all hover:bg-white/50">
            <div className="w-32 h-32 mb-8 bg-white rounded-[3rem] shadow-2xl border border-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
               <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse" />
                  <LayoutGrid size={48} className="text-slate-200 relative z-10" />
               </div>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tightest mb-4">Arquitectura Schedule</h2>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-bold">Selecciona un proyecto del directorio para habilitar el motor de planificación y la visualización de ruta crítica.</p>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-10">
            {/* Main Stage */}
            <div className="flex-1 min-w-0 flex flex-col gap-8">
                {/* Search & Tool Area */}
                <div className="px-5 flex items-center gap-6">
                    <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white flex-1 max-w-lg flex items-center gap-4 group focus-within:border-blue-400 transition-all shadow-sm">
                        <Search size={18} className="text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Encontrar plano, entregable o categoría..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm font-black focus:outline-none w-full placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <GanttTable 
                    categories={filtered}
                    weeks={weeks}
                    statuses={statuses}
                    wkLoad={wkLoad}
                    colWidth={COL_W}
                    todayWi={todayWi}
                    toggleExpand={toggleExpand}
                    addTask={addTask}
                    addCat={addCat}
                    toggleWk={toggleWk}
                    cycleStatus={cycleStatus}
                    updAssignee={updAssignee}
                    setDrag={setDrag}
                    onMouseUp={onMouseUp}
                    hovWk={hovWk}
                    setHovWk={setHovWk}
                    TEAM_MEMBERS={TEAM_MEMBERS}
                />
            </div>

            {/* Insight Sidebar */}
            <GanttSidebar 
                efficiencyScore={efficiencyScore}
                metrics={executionMetrics}
                sCurve={sCurve}
            />
          </div>
        )}

        {/* Assignment Toast */}
        {assignToast && (
          <AssignmentNotifyToast
            toast={assignToast}
            sending={emailSending}
            sent={emailSent}
            onDismiss={() => { setAssignToast(null); setEmailSent(false); }}
            onConfirm={async () => {
              if (!assignToast) return;
              setEmailSending(true);
              const ok = await sendAssignmentEmail({
                recipientName:  assignToast.memberName,
                recipientEmail: assignToast.memberEmail,
                taskName:       assignToast.taskName,
                categoryName:   assignToast.catName,
                siblingTasks:   assignToast.siblingNames,
                projectLabel:   assignToast.projectLabel,
              });
              setEmailSending(false);
              setEmailSent(ok);
              if (ok) setTimeout(() => { setAssignToast(null); setEmailSent(false); }, 2000);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SmartSchedule;
