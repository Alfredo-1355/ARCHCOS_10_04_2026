import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Plus, XCircle, ChevronLeft } from 'lucide-react';
import { Category, TimeColumn, TaskRow, TaskStatus } from '../../../../types/dashboard';
import { PHASE_CONFIG, STATUS_CFG } from '../../constants';
import { getHeatmapColor } from '../../utils/helpers';
import { GanttTaskBar } from './GanttTaskBar';
import { useScrollSync } from '../../hooks/useScrollSync';
import { useGanttStore } from '../../store/useGanttStore';

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
  updTimeframe: (cid: string, tid: string, startDay: number, duration: number) => void;
  cycleStatus: (tid: string) => void;
  updAssignee: (tid: string, aid: string | null) => void;
  setDrag: (d: { catId: string; taskId: string; initialWi: number; action: 'move' | 'resize-left' | 'resize-right'; initialStart: number; initialDuration: number } | null) => void;
  onMouseUp: (targetWi?: number) => void;
  hovWk: number | null;
  setHovWk: (wi: number | null) => void;
  TEAM_MEMBERS: any[];
  emailStatusMap: Record<string, 'idle' | 'sending' | 'sent' | 'error'>;
  updName: (cid: string, tid: string, name: string) => void;
  delTask: (cid: string, tid: string) => void;
  timeScale: 'weeks' | 'days';
  shiftTime?: (direction: -1 | 1) => void;
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
  updTimeframe,
  cycleStatus,
  updAssignee,
  setDrag,
  onMouseUp,
  hovWk,
  setHovWk,
  TEAM_MEMBERS,
  emailStatusMap,
  updName,
  delTask,
  timeScale,
  shiftTime
}) => {
  const NAME_COL_W = 280;
  const ATTR_COLS_W = 180;
  const FIXED_COLS_W = NAME_COL_W + ATTR_COLS_W;

  // Opus Painting — read directly from global Zustand store
  const { drawing, setDrawing } = useGanttStore();

  const { leftRef, rightRef, onLeftScroll, onRightScroll } = useScrollSync();

  return (
    <div className="backdrop-blur-xl bg-white/50 border border-white/80 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)] relative">
      
      {/* Time-Shifting Floating Controls */}
      {shiftTime && (
          <div className="absolute top-4 right-8 z-[60] flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full px-2 py-1 shadow-lg">
             <button onClick={() => shiftTime(-1)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors" title="Retroceder">
                 <ChevronLeft size={16} />
             </button>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 cursor-default">
                 {timeScale === 'weeks' ? 'Semana' : 'Día'}
             </span>
             <button onClick={() => shiftTime(1)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors" title="Avanzar">
                 <ChevronRight size={16} />
             </button>
          </div>
      )}

      {/* Dual Panel Layout */}
      <div className="flex flex-1 min-h-0 relative select-none">
        
        {/* ================= PANEL IZQUIERDO ================= */}
        <div 
            ref={leftRef}
            onScroll={onLeftScroll}
            className="flex-none border-r border-white/60 overflow-y-auto no-scrollbar custom-scrollbar-hide bg-white/40 pb-32"
            style={{ width: FIXED_COLS_W }}
        >
            {/* Headers Izquierdos */}
            <div className="sticky top-0 z-[40] bg-white/80 backdrop-blur-md border-b border-white/80 flex flex-col">
                <div className="h-[41px] border-b border-white/40" /> 
                <div className="flex border-b border-white/60 h-[56px] items-center">
                    <div className="w-[280px] px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Arquetipo / Plano</div>
                    <div className="w-[60px] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Asig.</div>
                    <div className="w-[60px] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">%</div>
                    <div className="w-[60px] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Avance</div>
                </div>
            </div>

            {/* Lista de Categorías y Tareas */}
            <div className="divide-y divide-white/60">
                {categories.map(cat => {
                    const completedTasks = cat.tasks.filter(t => t.progress === 100).length;
                    const totalTasks = cat.tasks.length;
                    return (
                        <div key={`left-${cat.id}`}>
                            <div 
                                className="flex items-center bg-white/60 backdrop-blur-sm border-l-[12px] group hover:bg-white transition-colors cursor-pointer border-b border-white/40 shadow-sm h-[72px]" 
                                style={{ borderLeftColor: cat.color }}
                                onClick={() => toggleExpand(cat.id)}
                            >
                                <div className="flex items-center gap-4 pl-6">
                                    <div className="w-8 h-8 flex-none rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                        {cat.expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                    </div>
                                    <div className="flex flex-col min-w-0 pr-4">
                                        <span className="font-black text-sm tracking-tight text-slate-800 uppercase truncate">{cat.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                {completedTasks}/{totalTasks} Completados
                                            </span>
                                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden flex-none">
                                                <div className="h-full bg-emerald-400" style={{ width: `${(completedTasks/(totalTasks||1))*100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <AnimatePresence initial={false}>
                                {cat.expanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/10">
                                        {cat.tasks.map(task => {
                                            const taskStatus = statuses[task.id] as TaskStatus || 'not_started';
                                            const statusInfo = STATUS_CFG[taskStatus];
                                            const assignee = TEAM_MEMBERS.find(m => m.id === task.assigneeId);
                                            return (
                                                <div key={`left-task-${task.id}`} className="flex group/row h-14 hover:bg-white/80 transition-all border-b border-white/40 items-center">
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
                                                        <div className="flex-1 flex flex-col min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-black text-slate-700 tracking-tight truncate">{task.name}</span>
                                                                {taskStatus === 'delayed' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping flex-none" />}
                                                            </div>
                                                            {(!task.startDay && !task.weeks?.find(Boolean)) && (
                                                                <span className="text-[7px] font-black uppercase text-amber-500 tracking-widest">No Programado</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="w-[60px] flex items-center justify-center relative group/assignee">
                                                        <select
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full disabled:cursor-not-allowed"
                                                            value={task.assigneeId || ''}
                                                            disabled={emailStatusMap[task.id] === 'sending'}
                                                            onChange={(e) => updAssignee(task.id, e.target.value || null)}
                                                        >
                                                            <option value="">Sin Asignar</option>
                                                            {TEAM_MEMBERS.map(m => (
                                                                <option key={m.id} value={m.id}>{m.name}</option>
                                                            ))}
                                                        </select>
                                                        <div 
                                                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${
                                                                emailStatusMap[task.id] === 'sending' ? 'animate-pulse scale-90 opacity-50' : 'group-hover/assignee:scale-110 group-hover/assignee:shadow-md'
                                                            } ${emailStatusMap[task.id] === 'error' ? 'border-red-500 bg-red-50' : 'border-white'}`}
                                                            style={{ 
                                                                backgroundColor: emailStatusMap[task.id] === 'sending' ? '#94A3B8' : (assignee?.color || '#F1F5F9'),
                                                                color: (assignee || emailStatusMap[task.id] === 'sending') ? 'white' : '#94A3B8'
                                                            }}
                                                        >
                                                            {emailStatusMap[task.id] === 'sending' ? '...' : (assignee?.avatar || '--')}
                                                        </div>
                                                        {emailStatusMap[task.id] === 'sent' && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
                                                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="w-[60px] flex items-center justify-center">
                                                        <span className="text-[9px] font-black text-slate-600">{task.progress}%</span>
                                                    </div>
                                                    <div className="w-[60px] flex items-center justify-center px-4">
                                                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-400" style={{ width: `${task.progress}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="flex items-center h-14 pl-14 group/add">
                                            <button onClick={() => addTask(cat.id)} className="flex items-center gap-3 px-6 py-2 rounded-xl bg-white border border-slate-100 shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-all">
                                                <Plus size={14} className="text-emerald-500" />
                                                Agregar Plano
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* ================= PANEL DERECHO (Cronograma Visual Gantt) ================= */}
        <div 
            ref={rightRef}
            onScroll={onRightScroll}
            className="flex-1 overflow-auto custom-scrollbar bg-transparent pb-32"
            onMouseLeave={() => setHovWk(null)}
            onMouseUp={() => onMouseUp(hovWk ?? undefined)}
        >
            <div className="min-w-max">
                {/* Right Header - Sticky Top */}
                <div className="sticky top-0 z-[40] backdrop-blur-md flex flex-col">
                    <div className="flex bg-white/60 border-b border-white/80 h-[41px]">
                        {PHASE_CONFIG.map(phase => {
                            const baseSpan = phase.range[1] - phase.range[0] + 1;
                            const span = timeScale === 'weeks' ? baseSpan : baseSpan * 7;
                            return (
                                <div key={phase.id} className="flex-none border-r border-white/40 px-4 py-2 flex items-center gap-3" style={{ width: span * colWidth }}>
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: phase.color }}>{phase.short}</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">{phase.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex bg-white/40 border-b border-white/60 h-[56px]">
                        {weeks.map((wk, wi) => (
                            <div key={wk.id} className={`flex-none text-center border-r border-white/40 pt-4 pb-2 transition-all flex flex-col items-center gap-1 ${wi === todayWi ? 'bg-blue-50/50' : ''}`} style={{ width: colWidth }}>
                                <span className={`text-[10px] font-black tracking-widest ${wi === todayWi ? 'text-blue-600' : 'text-slate-400'}`}>{wk.label}</span>
                                <div className={`w-6 h-1 rounded-full ${getHeatmapColor(wkLoad[wi]).split(' ')[0]}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Body - Gantt Canvas */}
                <div className="divide-y divide-white/60">
                    {categories.map(cat => (
                        <div key={`right-${cat.id}`}>
                            {/* Empty Space Aligned with Left Category Header */}
                            <div className="bg-white/40 border-b border-white/40 h-[72px]" />
                            
                            <AnimatePresence initial={false}>
                                {cat.expanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        {cat.tasks.map(task => {
                                            const taskStatus = statuses[task.id] as TaskStatus || 'not_started';
                                            const assignee = TEAM_MEMBERS.find(m => m.id === task.assigneeId);
                                            const isDrawingThis = drawing?.taskId === task.id;

                                            return (
                                                <div 
                                                    key={`right-task-${task.id}`} 
                                                    className="flex h-14 hover:bg-slate-50/50 transition-all border-b border-white/40 relative group/gridrow"
                                                >
                                                    {/* Celdas de Tiempo (Painting triggers) */}
                                                    <div className="flex h-full w-full">
                                                        {weeks.map((wk, wi) => (
                                                            <div 
                                                                key={wk.id} 
                                                                className={`flex-none h-full border-r border-white/20 transition-colors ${wi === todayWi ? 'bg-blue-50/20' : ''} ${wi === hovWk ? 'bg-slate-100/50' : ''} hover:bg-slate-100/80 cursor-cell`} 
                                                                style={{ width: colWidth }} 
                                                                onMouseDown={() => setDrawing?.({ catId: cat.id, taskId: task.id, startWi: wi, currentWi: wi })}
                                                                onMouseEnter={() => {
                                                                    setHovWk(wi);
                                                                    if (drawing) setDrawing({ ...drawing, currentWi: wi });
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Drawing Preview Bar (Opus Mirror) */}
                                                    {isDrawingThis && (
                                                        <div 
                                                            className="absolute top-2 bottom-2 bg-blue-500/20 border-2 border-blue-500/50 border-dashed rounded-lg pointer-events-none z-20"
                                                            style={{
                                                                left: Math.min(drawing.startWi, drawing.currentWi) * colWidth,
                                                                width: (Math.abs(drawing.currentWi - drawing.startWi) + 1) * colWidth,
                                                            }}
                                                        />
                                                    )}

                                                    {/* Barra Flotante Gantt */}
                                                    <div 
                                                        className="absolute inset-y-0" 
                                                        onMouseDown={(e) => { 
                                                            e.stopPropagation();
                                                            const first = task.startDay !== undefined ? Math.floor(task.startDay / (timeScale === 'weeks' ? 7 : 1)) : task.weeks?.indexOf(true); 
                                                            if (first !== -1 && first !== undefined) setDrag({ catId: cat.id, taskId: task.id, initialWi: first, action: 'move', initialStart: task.startDay ?? 0, initialDuration: task.duration || 1 }); 
                                                        }}
                                                    >
                                                        <GanttTaskBar 
                                                            taskId={task.id} 
                                                            type={task.type || 'refinement'} 
                                                            weeks={task.weeks} 
                                                            status={taskStatus} 
                                                            colWidth={colWidth} 
                                                            assigneeInitials={assignee?.avatar || '??'} 
                                                            startDateLabel={task.startDay !== undefined ? `Día ${task.startDay}` : undefined} 
                                                            timeScale={timeScale} 
                                                            onContextMenu={(e) => {
                                                                e.preventDefault();
                                                                const newVal = window.prompt(`¿Cuántos días EXACTOS dura esta tarea?`, String(task.duration || 1));
                                                                if (newVal !== null) {
                                                                    const days = parseInt(newVal, 10);
                                                                    if (!isNaN(days)) updTimeframe(cat.id, task.id, task.startDay ?? 0, Math.max(1, days));
                                                                }
                                                            }}
                                                            onResizeLeft={(e) => {
                                                                e.stopPropagation();
                                                                const first = task.startDay !== undefined ? Math.floor(task.startDay / (timeScale === 'weeks' ? 7 : 1)) : -1;
                                                                if (first !== -1) setDrag({ catId: cat.id, taskId: task.id, initialWi: first, action: 'resize-left', initialStart: task.startDay ?? 0, initialDuration: task.duration || 1 });
                                                            }}
                                                            onResizeRight={(e) => {
                                                                e.stopPropagation();
                                                                const last = task.duration ? Math.floor((task.startDay! + task.duration! - 1) / (timeScale === 'weeks' ? 7 : 1)) : -1;
                                                                if (last !== -1) setDrag({ catId: cat.id, taskId: task.id, initialWi: last, action: 'resize-right', initialStart: task.startDay ?? 0, initialDuration: task.duration || 1 });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Espacio vacío para alinear el botón Add Task izquierdo */}
                                        <div className="h-14" /> 
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                    {/* Spacer */}
                    <div className="h-[120px]" />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
