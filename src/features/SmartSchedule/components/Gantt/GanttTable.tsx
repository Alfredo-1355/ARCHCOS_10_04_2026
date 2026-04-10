import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Plus, AlertTriangle, HelpCircle } from 'lucide-react';
import { Category, TimeColumn, TaskRow, TaskStatus } from '../../../../types/dashboard';
import { PHASE_CONFIG, getHeatmapColor, STATUS_CFG } from '../../utils';
import { GanttTaskBar } from './GanttTaskBar';

interface GanttTableProps {
  categories: Category[];
  weeks: TimeColumn[];
  statuses: Record<string, string>;
  wkLoad: number[];
  colWidth: number;
  todayWi: number;
  toggleExpand: (cid: string) => void;
  addTask: (cid: string) => void;
  addCat: () => void;
  toggleWk: (cid: string, tid: string, wi: number) => void;
  cycleStatus: (tid: string) => void;
  updAssignee: (cid: string, tid: string, aid: string) => void;
  setDrag: (d: { catId: string; taskId: string; initialWi: number } | null) => void;
  onMouseUp: (targetWi?: number) => void;
  hovWk: number | null;
  setHovWk: (wi: number | null) => void;
  TEAM_MEMBERS: any[];
}

export const GanttTable: React.FC<GanttTableProps> = ({
  categories,
  weeks,
  statuses,
  wkLoad,
  colWidth,
  todayWi,
  toggleExpand,
  addTask,
  addCat,
  toggleWk,
  cycleStatus,
  updAssignee,
  setDrag,
  onMouseUp,
  hovWk,
  setHovWk,
  TEAM_MEMBERS
}) => {
  const NAME_COL_W = 280;
  const ATTR_COLS_W = 180; // Asig(60) + %(60) + Av(60)
  const FIXED_COLS_W = NAME_COL_W + ATTR_COLS_W;

  return (
    <div className="backdrop-blur-xl bg-white/50 border border-white/80 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">
      {/* Scrollable Container */}
      <div className="overflow-auto flex-1 selection:bg-transparent custom-scrollbar relative">
        <div className="min-w-max pb-10">
          
          {/* Phase Header Row (Sticky Top) */}
          <div className="flex bg-white/60 sticky top-0 z-[40] backdrop-blur-md border-b border-white/80">
            <div style={{ width: FIXED_COLS_W }} className="flex-none bg-white/60 sticky left-0 z-[41] border-r border-white/40" />
            <div className="flex">
                {PHASE_CONFIG.map(phase => {
                    const span = phase.range[1] - phase.range[0] + 1;
                    return (
                        <div 
                            key={phase.id} 
                            className="flex-none border-l border-white/40 px-4 py-2 flex items-center gap-3 transition-colors hover:bg-white/40"
                            style={{ width: span * colWidth }}
                        >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: phase.color }}>
                                {phase.short}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">{phase.label}</span>
                        </div>
                    );
                })}
            </div>
          </div>

          {/* Column Header Row (Weeks + Heatmap - Sticky Top below Phase) */}
          <div className="flex bg-white/40 border-b border-white/60 sticky top-[41px] z-[35] backdrop-blur-md">
            {/* Sticky Identifier Columns */}
            <div className="flex-none sticky left-0 bg-white/60 z-[36] border-r border-white/60 flex h-full">
                <div className="w-[280px] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Arquetipo / Plano</div>
                <div className="w-[60px] px-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Asig.</div>
                <div className="w-[60px] px-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">%</div>
                <div className="w-[60px] px-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Avance</div>
            </div>
            
            {weeks.map((wk, wi) => (
              <div 
                key={wk.id} 
                className={`flex-none text-center border-l border-white/40 pt-4 pb-2 transition-all flex flex-col items-center gap-1 ${wi === todayWi ? 'bg-blue-50/50' : ''}`} 
                style={{ width: colWidth }}
              >
                <span className={`text-[10px] font-black tracking-widest ${wi === todayWi ? 'text-blue-600' : 'text-slate-400'}`}>{wk.label}</span>
                <div className={`w-6 h-1 rounded-full ${getHeatmapColor(wkLoad[wi]).split(' ')[0]}`} />
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="divide-y divide-white/60" onMouseLeave={() => setHovWk(null)}>
            {categories.map(cat => {
              const completedTasks = cat.tasks.filter(t => t.progress === 100).length;
              const totalTasks = cat.tasks.length;
              
              return (
                <div key={cat.id} className="group/cat">
                  {/* Category Header (Sticky Left) */}
                  <div 
                    className="flex items-center bg-white/40 backdrop-blur-sm py-4 border-l-[12px] group hover:bg-white transition-colors cursor-pointer sticky left-0 z-[10] border-r border-white/40 shadow-sm" 
                    style={{ borderLeftColor: cat.color }}
                    onClick={() => toggleExpand(cat.id)}
                  >
                    <div className="flex items-center gap-4 pl-6">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                        {cat.expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm tracking-tight text-slate-800 uppercase">{cat.name}</span>
                        <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {completedTasks}/{totalTasks} Completados
                             </span>
                             <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${(completedTasks/(totalTasks||1))*100}%` }} />
                             </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Rows */}
                  <AnimatePresence initial={false}>
                    {cat.expanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white/10"
                      >
                        {cat.tasks.map(task => {
                            const taskStatus = statuses[task.id] as TaskStatus || 'not_started';
                            const statusInfo = STATUS_CFG[taskStatus];
                            const assignee = TEAM_MEMBERS.find(m => m.id === task.assigneeId);
                            
                            return (
                                <div key={task.id} className="flex group/row h-14 hover:bg-white/80 transition-all border-b border-white/40">
                                    {/* Sticky Task Attributes */}
                                    <div className="flex-none sticky left-0 bg-white/80 backdrop-blur-sm z-[15] border-r border-white/60 flex items-center">
                                        <div className="w-[280px] flex items-center gap-4 px-8">
                                            <button 
                                                onClick={() => cycleStatus(task.id)}
                                                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all bg-white border border-slate-100 hover:shadow-sm flex-none"
                                            >
                                                <div 
                                                    className={`w-2.5 h-2.5 rounded-full shadow-sm ${taskStatus === 'not_started' ? 'border-2 border-slate-200' : ''}`} 
                                                    style={{ backgroundColor: taskStatus === 'not_started' ? 'transparent' : statusInfo?.color }}
                                                />
                                            </button>
                                            
                                            <div className="flex flex-col truncate">
                                                <span className="text-[11px] font-black text-slate-700 tracking-tight flex items-center gap-2">
                                                    {task.name}
                                                    {taskStatus === 'delayed' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                                                </span>
                                                {!task.weeks.find(Boolean) && (
                                                    <span className="text-[7px] font-black uppercase text-amber-500 tracking-widest">No Programado</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-[60px] flex items-center justify-center">
                                            <select 
                                                value={task.assigneeId || ''}
                                                onChange={(e) => updAssignee(cat.id, task.id, e.target.value)}
                                                className="bg-transparent text-[10px] font-black focus:outline-none appearance-none cursor-pointer text-slate-400 hover:text-slate-900 w-full text-center"
                                            >
                                                <option value="">--</option>
                                                {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.avatar}</option>)}
                                            </select>
                                        </div>

                                        <div className="w-[60px] flex items-center justify-center">
                                            <span className="text-[9px] font-black tabular-nums text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-50">{task.progress}%</span>
                                        </div>

                                        <div className="w-[60px] flex items-center justify-center px-4">
                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-400" style={{ width: `${task.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gantt Grid Cells & Bar */}
                                    <div className="relative flex" onMouseUp={() => onMouseUp(hovWk ?? undefined)}>
                                        {weeks.map((wk, wi) => (
                                            <div 
                                                key={wk.id}
                                                className={`flex-none h-full border-l border-white/20 transition-all ${wi === todayWi ? 'bg-blue-50/20' : ''} ${wi === hovWk ? 'bg-slate-100/50' : ''} hover:bg-slate-50/40 cursor-cell`}
                                                style={{ width: colWidth }}
                                                onClick={() => toggleWk(cat.id, task.id, wi)}
                                                onMouseEnter={() => setHovWk(wi)}
                                            />
                                        ))}
                                        
                                        <div onMouseDown={(e) => {
                                            e.stopPropagation();
                                            const first = task.weeks.indexOf(true);
                                            if (first !== -1) setDrag({ catId: cat.id, taskId: task.id, initialWi: first });
                                        }}>
                                            <GanttTaskBar 
                                                taskId={task.id}
                                                type={task.type || 'refinement'}
                                                weeks={task.weeks}
                                                status={taskStatus}
                                                colWidth={colWidth}
                                                assigneeInitials={assignee?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                                startDateLabel={task.weeks.indexOf(true) !== -1 ? `${weeks[task.weeks.indexOf(true)].label}` : undefined}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Inline Add Task */}
                        <div className="flex items-center h-14 pl-14 group/add sticky left-0 z-10 w-fit">
                            <button 
                                onClick={() => addTask(cat.id)}
                                className="flex items-center gap-3 px-6 py-2 rounded-xl bg-white border border-slate-100 shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-100 transition-all"
                            >
                                <Plus size={14} className="text-emerald-500" />
                                Agregar Plano en {cat.name}
                            </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Table Footer - Add Category */}
          <div className="mt-12 px-10 flex justify-center sticky left-0">
            <button 
                onClick={addCat}
                className="group flex items-center gap-5 px-12 py-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Plus size={20} strokeWidth={3} />
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Engine</span>
                    <span className="text-sm font-black text-white">Añadir Nueva Disciplina</span>
                </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
