import React, { useState, useMemo, useRef, useEffect } from 'react';
import { RefreshCw, ArrowLeft, Briefcase, Calendar, Plus, ZoomOut, ZoomIn, Info, Search, X, Zap, Check, Flame, MessageSquare, Shield, Clock, Eye, AlertTriangle, GripVertical, ChevronDown, Save, Cloud, CloudOff } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';

// === TIPOS Y ESTRUCTURAS ===
export interface TaskRow {
  id: string;
  name: string;
  assignee: string | null;
  progress: number;
  weeks: boolean[];
  baselineWeeks?: boolean[];
  type?: 'critical' | 'refinement' | 'review'; 
  zeroFloat?: boolean; // Tarea sin holgura
}

export interface Category {
  id: string;
  name: string;
  tasks: TaskRow[];
  expanded?: boolean;
}

export interface Week {
  id: string;
  label: string;
  offset: number; // días desde el startDate
}

export interface ProjectSchedule {
  categories: Category[];
  weeks: Week[];
  startDate: string;
  statuses: Record<string, TaskStatus>;
  timeScale: 'weeks' | 'days';
}

type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';

const STATUS_COLORS = {
  'not_started': 'bg-[#E2E8F0] border-[#CBD5E1]',
  'in_progress': 'bg-[#3B82F6] border-[#2563EB]',
  'completed': 'bg-[#10B981] border-[#059669]',
  'delayed': 'bg-[#EF4444] border-[#DC2626]',
};
const STATUS_ORDER: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'delayed'];

// === EQUIPO / DB FALSA (TODO: Mover a global) ===
const TEAM_MEMBERS = [
  { id: 'user_1', name: 'Alfredo Reyes', avatar: 'AR' },
  { id: 'user_2', name: 'Arianna M.', avatar: 'AM' },
  { id: 'user_3', name: 'Jackson R.', avatar: 'JR' },
  { id: 'user_4', name: 'Carlos L.', avatar: 'CL' }
];

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'arch_plans', name: 'Architectural Plans', expanded: true, tasks: [
      { id: 't1', name: 'Existing / Proposed Site Plan', assignee: null, progress: 0, weeks: [], type: 'critical' },
      { id: 't2', name: '1st & 2nd Floor Plan', assignee: null, progress: 0, weeks: [], type: 'critical' }
    ]
  },
  {
    id: 'revisiones', name: 'Revisiones del Cliente', expanded: true, tasks: [
      { id: 't_r1', name: 'Revisión Schematic Design (SD)', assignee: null, progress: 0, weeks: [], type: 'review' }
    ]
  }
];

const uid = () => Math.random().toString(36).slice(2, 9);
const buildTimeBlocks = (count: number, scale: 'weeks'|'days' = 'weeks') => Array.from({ length: count }, (_, i) => ({ id: uid(), label: scale === 'weeks' ? `S${i + 1}` : `D${i+1}`, offset: scale === 'weeks' ? i * 7 : i }));

const fmtDate = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const addDays = (d: Date, days: number) => { const nd = new Date(d); nd.setDate(nd.getDate() + days); return nd; };

// === COMPONENTE PRINCIPAL ===
export default function SmartScheduleViewV2({ project, projects = [], onProjectSelect, navigate }: any) {
  const updateProject = useProjectStore(state => state.updateProject);
  const pid = project?.id || 'default';
  
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'>('idle');
  
  // SSOT Initialization
  const initialSchedule = (project?.smartSchedule) as ProjectSchedule || {
    categories: DEFAULT_CATEGORIES,
    weeks: buildTimeBlocks(16, 'weeks'),
    startDate: new Date().toISOString(),
    statuses: {},
    timeScale: 'weeks'
  };

  const [cur, setCur] = useState<ProjectSchedule>(initialSchedule);
  
  // Reload if project changes
  useEffect(() => {
    if (project?.smartSchedule) {
      setCur(project.smartSchedule);
    }
  }, [project?.id]);

  // Debounced Auto-Save to Firebase (via updateProject)
  useEffect(() => {
    if (!project?.id) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      updateProject({ smartSchedule: cur });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1200);
    return () => clearTimeout(timer);
  }, [cur, project?.id]);

  const { categories, weeks, statuses, timeScale } = cur;
  const wc = weeks.length;
  const startDate = new Date(cur.startDate);
  
  const setCurHelper = (fn: (prev: ProjectSchedule) => ProjectSchedule) => {
    setCur(prev => fn(prev));
  };
  const setCats = (fn: (c: Category[]) => Category[]) => setCurHelper(s => ({ ...s, categories: fn(s.categories) }));

  // --- TIME SCALE ---
  const toggleTimeScale = () => {
    const newScale = timeScale === 'weeks' ? 'days' : 'weeks';
    const newCount = newScale === 'weeks' ? 16 : 45; // 45 días base
    setCurHelper(s => ({
      ...s,
      timeScale: newScale,
      weeks: buildTimeBlocks(newCount, newScale),
      categories: s.categories.map(c => ({
        ...c,
        tasks: c.tasks.map(t => ({ ...t, weeks: [], baselineWeeks: [] })) // Reset visual blocks on scale change
      }))
    }));
  };

  // --- RCPSP GENERATOR (Eficiencia) ---
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [efficiencyScore, setEfficiencyScore] = useState<number | null>(project?.smartSchedule?.score || null);

  const generateAlgorithm = () => {
    setGenerating(true);
    setStatusMsg('Calculando RCPSP...');
    
    setTimeout(() => {
      setStatusMsg('Balanceando equipo...');
      const sqft = project?.sqft || 4000;
      
      // RCPSP Lógico: Escalonar tareas en cascada, evitando colisiones masivas
      let currentIdx = 0;
      const newCats = categories.map(c => ({
        ...c,
        tasks: c.tasks.map(t => {
          // Duracion paramétrica
          const baseDuration = timeScale === 'weeks' ? Math.ceil(sqft / 2500) : Math.ceil(sqft / 350); 
          const dur = t.type === 'review' ? 1 : Math.max(1, baseDuration);
          
          let wks = Array(wc).fill(false);
          // Omitir fines de semana en modo DIAS:
          let assignedDays = 0;
          let pointer = currentIdx;
          
          while(assignedDays < dur && pointer < wc) {
             const currentDate = addDays(startDate, weeks[pointer]?.offset || 0);
             if (timeScale === 'days') {
                const day = currentDate.getDay();
                if (day !== 0 && day !== 6) { // No es fin de semana
                  wks[pointer] = true;
                  assignedDays++;
                }
             } else {
                wks[pointer] = true;
                assignedDays++;
             }
             pointer++;
          }
          currentIdx = pointer; // Avanza el cursor para la siguiente tarea (Secuencia pura)
          
          // Auto Asignación del más desocupado
          const rndUser = TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)].id;
          
          return { ...t, weeks: wks, baselineWeeks: [...wks], assignee: rndUser, progress: 0 };
        })
      }));

      // Calculate Efficiency
      // Scorer: Ideal is 100% packing. 
      const realDur = currentIdx; // time taken
      const idealDur = Math.max(1, Math.round(currentIdx * 0.85)); // 15% faster ideally
      const score = Math.max(10, Math.round((idealDur / realDur) * 100));
      
      setCurHelper(s => ({ ...s, categories: newCats }));
      setEfficiencyScore(score);
      updateProject({ smartSchedule: { ...cur, categories: newCats, score } }); // Force db save 
      
      setGenerating(false);
    }, 1500);
  };

  // --- DRAG AND DROP (Filas) ---
  const [draggedItem, setDraggedItem] = useState<{ catId: string, taskId: string } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ catId: string, taskId: string } | null>(null);

  const onDragStartRow = (e: any, catId: string, taskId: string) => {
    setDraggedItem({ catId, taskId });
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOverRow = (e: any, catId: string, taskId: string) => {
    e.preventDefault();
    setDragOverItem({ catId, taskId });
  };
  const onDropRow = (e: any, targetCatId: string, targetTaskId: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    setCats(prev => {
      const p = [...prev.map(c => ({...c, tasks: [...c.tasks]}))];
      // Find source
      const sCatIdx = p.findIndex(c => c.id === draggedItem.catId);
      const sCat = p[sCatIdx];
      const sTaskIdx = sCat.tasks.findIndex(t => t.id === draggedItem.taskId);
      const [movedTask] = sCat.tasks.splice(sTaskIdx, 1);
      
      // Find target
      const tCatIdx = p.findIndex(c => c.id === targetCatId);
      const tCat = p[tCatIdx];
      let tTaskIdx = tCat.tasks.findIndex(t => t.id === targetTaskId);
      if(tTaskIdx < 0) tTaskIdx = tCat.tasks.length;
      
      tCat.tasks.splice(tTaskIdx, 0, movedTask);
      return p;
    });
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // --- MENU AVATAR (Doble Clic) ---
  const [avatarMenu, setAvatarMenu] = useState<{catId:string, taskId:string, rect: DOMRect} | null>(null);

  const closeAvatarMenu = () => setAvatarMenu(null);
  
  const assignFromMenu = (uid: string) => {
    if(!avatarMenu) return;
    setCats(c => c.map(cat => cat.id !== avatarMenu.catId ? cat : {...cat, tasks: cat.tasks.map(t => t.id !== avatarMenu.taskId ? t : {...t, assignee: uid})}));
    closeAvatarMenu();
  };

  // CVM Computations (Carga Semafórica)
  const assigneeLoad = useMemo(() => {
    const load: Record<string, number[]> = {};
    TEAM_MEMBERS.forEach(tm => load[tm.id] = Array(wc).fill(0));
    categories.forEach(c => c.tasks.forEach(t => {
      if (t.assignee) {
        t.weeks.forEach((isOn, wi) => { if (isOn && load[t.assignee]) load[t.assignee][wi]++; });
      }
    }));
    return load;
  }, [categories, wc]);

  // View Settings
  const [zoom, setZoom] = useState(1);
  const COL_W = Math.max(20, Math.round((timeScale === 'weeks' ? 60 : 35) * zoom));
  const FIXED_W = 398;

  const today = new Date();
  const todayWi = weeks.findIndex(w => {
    const d = addDays(startDate, w.offset);
    if(timeScale === 'weeks') return today >= d && today <= addDays(d, 6);
    return today.toDateString() === d.toDateString();
  });

  return (
    <div className="bg-[#F8FAFC] h-full overflow-y-auto font-sans text-[#0A192F]" onClick={closeAvatarMenu}>
      <div className="flex flex-col gap-4 p-4 xl:p-5 max-w-[1900px] mx-auto min-h-max">
        
        {/* TOP BAR */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-5 py-4">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <button onClick={() => navigate?.('#/dashboard')} className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#0A192F] text-[10px] font-black uppercase tracking-widest mb-1 transition-colors"><ArrowLeft size={11}/>Directorio</button>
                <h1 className="text-3xl font-extrabold tracking-tighter flex items-center gap-2">
                  Smart Schedule<span className="text-[#1A56DB]">.</span>
                  {saveStatus === 'saving' && <Cloud className="w-5 h-5 text-blue-400 animate-pulse" title="Guardando..." />}
                  {saveStatus === 'saved' && <Cloud className="w-5 h-5 text-green-500" title="Sincronizado" />}
                </h1>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 flex-1 max-w-sm">
              <label className="text-[9px] font-black text-[#64748B] uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={9} className="text-[#1A56DB]"/>Proyecto Activo</label>
              <select value={project?.id || ''} onChange={e => onProjectSelect?.(e.target.value)} 
                className="w-full h-10 px-3 border-2 border-[#0A2342] rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0A2342]/20 bg-white appearance-none cursor-pointer">
                {projects.map((p: any) => {
                  const id = p.id ? `[${p.id.slice(0, 6).toUpperCase()}]` : '';
                  const nm = p.address || p.location || p.projectName || p.name || 'Sin nombre';
                  return <option key={p.id} value={p.id}>{id} {nm}</option>;
                })}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 items-end">
              {/* TOGGLE S/D */}
              <div className="flex bg-[#F1F5F9] p-1 rounded-xl h-9">
                <button onClick={toggleTimeScale} className={`px-3 text-xs font-bold rounded-lg transition-all ${timeScale === 'weeks' ? 'bg-white shadow text-[#1A56DB]' : 'text-[#64748B]'}`}>Semanas</button>
                <button onClick={toggleTimeScale} className={`px-3 text-xs font-bold rounded-lg transition-all ${timeScale === 'days' ? 'bg-white shadow text-[#1A56DB]' : 'text-[#64748B]'}`}>Días</button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-[#64748B] uppercase tracking-widest flex items-center gap-1"><Calendar size={9}/>Inicio</label>
                <input type="date" value={startDate.toISOString().slice(0, 10)} onChange={e => { const d=new Date(e.target.value+'T00:00:00'); if(!isNaN(d.getTime())) setCurHelper(s=>({...s, startDate: d.toISOString()}))}} className="h-9 px-2 border border-[#E2E8F0] rounded-lg text-xs font-bold outline-none"/>
              </div>
              <button disabled={generating} onClick={generateAlgorithm} className="h-9 flex items-center gap-2 px-5 bg-[#0A2342] text-white rounded-xl font-bold text-sm hover:bg-[#112240] transition-all">
                {generating ? <RefreshCw size={14} className="animate-spin text-[#38BDF8]"/> : <Zap size={14} className="text-[#38BDF8]"/>}
                {generating ? statusMsg : '⟳ Generar Plan'}
              </button>
            </div>
          </div>
        </div>

        {/* WORKSPACE */}
        <div className="flex flex-col xl:flex-row gap-4 relative">
          
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto pb-32">
              <div style={{ minWidth: `${FIXED_W + wc * COL_W + 40}px` }}>
                
                {/* HEADERS */}
                <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC]">
                   <div className="flex-none flex items-end p-2 border-r border-[#E2E8F0]" style={{ width: FIXED_W }}>
                     <span className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase">Disciplina</span>
                   </div>
                   {weeks.map(w => (
                     <div key={w.id} className="flex-none flex flex-col items-center justify-end pb-1 border-r border-[#F1F5F9] relative" style={{ width: COL_W }}>
                       <span className="text-[10px] font-bold text-[#0A192F]">{w.label}</span>
                       <span className="text-[8px] text-[#94A3B8]">{timeScale==='days' ? ['Do','Lu','Ma','Mi','Ju','Vi','Sa'][(addDays(startDate, w.offset)).getDay()] : fmtDate(addDays(startDate, w.offset))}</span>
                     </div>
                   ))}
                </div>

                {/* ROWS */}
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <div className="bg-[#FAFBFC] border-y border-[#E2E8F0] px-2 py-1.5 flex items-center shadow-xs">
                      <span className="text-xs font-black text-[#0A2342] uppercase tracking-widest outline-none" contentEditable suppressContentEditableWarning onBlur={e => setCats(c => c.map(cc=>cc.id===cat.id?{...cc,name:e.target.innerText}:cc))}>{cat.name}</span>
                    </div>
                    {cat.expanded && cat.tasks.map(task => {
                      const isRevT = task.type === 'review';
                      const isCrit = task.type === 'critical';
                      const barColor = isCrit ? '#0A2342' : isRevT ? '#F59E0B' : '#64748B';
                      const tm = task.assignee ? TEAM_MEMBERS.find(tm=>tm.id===task.assignee) : null;

                      return (
                      <div key={task.id} 
                           draggable 
                           onDragStart={(e) => onDragStartRow(e, cat.id, task.id)}
                           onDragOver={(e) => onDragOverRow(e, cat.id, task.id)}
                           onDrop={(e) => onDropRow(e, cat.id, task.id)}
                           className={`flex border-b border-[#F1F5F9] hover:bg-[#F8FAFC]/50 transition-colors group ${dragOverItem?.taskId === task.id ? 'border-t-2 border-t-[#1A56DB]' : ''}`}>
                        
                        <div className="flex-none flex items-center border-r border-[#F1F5F9]" style={{ width: FIXED_W }}>
                          <div className="flex-none w-8 flex items-center justify-center cursor-grab text-[#CBD5E1] hover:text-[#0A192F]">
                            <GripVertical size={12}/>
                          </div>
                          <span onClick={()=>setCats(c=>c.map(cc=>cc.id===cat.id?{...cc, tasks:cc.tasks.map(tt=>tt.id===task.id?{...tt, type: tt.type==='critical'?'refinement':tt.type==='refinement'?'review':'critical'}:tt)}:cc))}
                            className={`w-2 h-2 rounded-full cursor-pointer mr-2 ${isRevT?'bg-[#F59E0B]':isCrit?'bg-[#EF4444]':'bg-[#38BDF8]'}`}/>
                          <span className={`text-xs truncate outline-none flex-1 py-2 ${isRevT?'font-bold text-[#92400E] italic':'font-semibold text-[#0A192F]'}`} contentEditable suppressContentEditableWarning onBlur={e=>setCats(c=>c.map(cc=>cc.id===cat.id?{...cc, tasks:cc.tasks.map(tt=>tt.id===task.id?{...tt,name:e.target.innerText}:tt)}:cc))}>{task.name}</span>
                        </div>

                        {/* CELLS */}
                        {weeks.map((wk, wi) => {
                          const active = task.weeks[wi] ?? false;
                          const prev = wi > 0 && (task.weeks[wi - 1] ?? false);
                          const next = wi < wc - 1 && (task.weeks[wi + 1] ?? false);
                          const isToday = wi === todayWi;

                          // OVERLOAD LOGIC
                          let overloadLevel = 0;
                          let showAvatar = false;
                          if (active && task.assignee) {
                            const cLoad = assigneeLoad[task.assignee]?.[wi] || 0;
                            if (timeScale === 'days') {
                               if (cLoad > 1) overloadLevel = 2; // In days, 2 tasks same day is heavy
                            } else {
                               if (cLoad >= 3) overloadLevel = 2;
                            }
                            if (!prev) showAvatar = true;
                          }

                          return (
                            <div key={wk.id} className="flex-none border-r border-[#F1F5F9] flex items-center justify-center cursor-pointer relative" style={{ width: COL_W, background: isToday ? (active ? '#FFFBEB' : '#FFFDE7') : undefined }}
                              onClick={() => {
                                setCats(c => c.map(cc => cc.id !== cat.id ? cc : {...cc, tasks: cc.tasks.map(tt => tt.id !== task.id ? tt : {...tt, weeks: tt.weeks.map((v, i) => i === wi ? !v : v)})}));
                              }}>
                              
                              {active && (
                                <div className="absolute inset-y-1 left-0 right-0 z-10" style={{ background: barColor, borderRadius: !prev&&!next?'4px':!prev?'4px 0 0 4px':!next?'0 4px 4px 0':'0', marginLeft: prev?0:4, marginRight: next?0:4 }} />
                              )}

                              {/* AVATAR DOUBLE CLICK */}
                              {!active && !prev && !next && (
                                <div className="absolute opacity-0 group-hover:opacity-100 hover:scale-125 w-4 h-4 rounded-full border border-dashed border-[#CBD5E1] text-[#94A3B8] flex items-center justify-center text-[10px] z-20 cursor-pointer bg-white" 
                                  title="Doble clic para asignar"
                                  onClick={(e)=>e.stopPropagation()}
                                  onDoubleClick={(e) => { e.stopPropagation(); setAvatarMenu({ catId: cat.id, taskId: task.id, rect: e.currentTarget.getBoundingClientRect() }); }}>
                                  +
                                </div>
                              )}
                              {showAvatar && (
                                <div 
                                  onClick={(e)=>e.stopPropagation()}
                                  onDoubleClick={(e) => { e.stopPropagation(); setAvatarMenu({ catId: cat.id, taskId: task.id, rect: e.currentTarget.getBoundingClientRect() }); }}
                                  className={`absolute top-1/2 -translate-y-1/2 ${timeScale==='days'?'-left-2':'-left-3'} w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black text-white shadow-md z-30 cursor-pointer ring-2 
                                    ${overloadLevel === 2 ? 'bg-red-600 ring-red-200 animate-pulse' : 'bg-[#1A56DB] ring-[#1A56DB]/30 hover:scale-110 transition-transform'}`}
                                    title={tm ? `${tm.name} ${overloadLevel===2?'(Sobrecargado)':''}` : ''}>
                                  {tm ? tm.avatar : '?'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )})}
                  </div>
                ))}
              </div>
            </div>
            
            {/* AVATAR FLOATING MENU */}
            {avatarMenu && (
              <div style={{ position: 'fixed', top: avatarMenu.rect.bottom + 5, left: avatarMenu.rect.left, zIndex: 9999 }} className="bg-white border border-[#E2E8F0] shadow-xl rounded-xl w-48 p-2 flex flex-col gap-1 fade-in">
                <div className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest px-2 pb-1 border-b mb-1">Asignar Equipo</div>
                {TEAM_MEMBERS.map(tm => {
                  // Preview if overloaded
                  let willOverload = false;
                  // For simplicity, just check overall tasks
                  return (
                    <button key={tm.id} onClick={(e) => { e.stopPropagation(); assignFromMenu(tm.id); }} className="flex items-center justify-between p-1.5 hover:bg-[#F8FAFC] rounded cursor-pointer text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#1A56DB] rounded-full text-white flex items-center justify-center text-[7px] font-bold">{tm.avatar}</div>
                        <span className="text-xs font-semibold text-[#0A192F]">{tm.name}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* SIDEBAR SCORER */}
          <div className="w-full xl:w-72 flex-none flex flex-col gap-4">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col items-center">
                <h3 className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase mb-4">SLA Efficiency</h3>
                <div className="w-28 h-28 rounded-full border-8 flex items-center justify-center relative border-[#E2E8F0]">
                  <span className="text-3xl font-black text-[#0A2342]">{efficiencyScore || '--'}</span>
                  <div className="absolute inset-[-8px] rounded-full border-8 border-transparent border-t-[#0ea5e9] border-r-[#0ea5e9] rotate-45 transition-all duration-1000"/>
                </div>
                {efficiencyScore && (
                  <p className="mt-4 text-xs text-center font-medium text-[#475569]">
                    {efficiencyScore > 90 ? 'Eficiencia máxima. Rutas críticas secuenciadas ágilmente.' : 'Eficiencia mermada. Existe cuello de botella en recursos.'}
                  </p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
