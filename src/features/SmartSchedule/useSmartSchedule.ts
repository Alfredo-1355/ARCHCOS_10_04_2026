import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth, useProjects } from '../../contexts/DashboardContext';
import { ProjectSchedule, Category, TaskRow, TimeColumn, Project, TaskStatus } from '../../types/dashboard';
import { 
  uid, addDays, buildWeeks, relabel, 
  sanitizeSchedule, rehydrateSchedule, 
  TEAM_MEMBERS, STATUS_ORDER, sendAssignmentEmail 
} from './utils';
import { AssignToast } from './components/AssignmentNotifyToast';
import { getResidentialTemplate } from './templates/residential';

export interface UseSmartScheduleReturn {
  // State
  startDate: Date;
  setStartDate: (d: Date) => void;
  search: string;
  setSearch: (s: string) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  // Data
  categories: Category[];
  weeks: TimeColumn[];
  statuses: Record<string, string>;
  schedule: ProjectSchedule | null;
  // Derived
  allTasks: TaskRow[];
  wkLoad: number[];
  todayWi: number;
  COL_W: number;
  FONT_SCALE: number;
  efficiencyScore: number;
  executionMetrics: {
    estCompletion: number;
    totalTasks: number;
    criticalCount: number;
    refinements: number;
    reviews: number;
    globalProgress: number;
  };
  // Handlers
  addWeek: () => void;
  delWeek: (wi: number) => void;
  insAfter: (wi: number) => void;
  renameWk: (wi: number, label: string) => void;
  addTask: (catId: string, type?: TaskRow['type']) => void;
  addCat: () => void;
  delTask: (catId: string, taskId: string) => void;
  delCat: (catId: string) => void;
  updName: (catId: string, taskId: string, name: string) => void;
  updCatName: (catId: string, name: string) => void;
  toggleWk: (catId: string, taskId: string, wi: number, force?: boolean) => void;
  updAssignee: (catId: string, taskId: string, assigneeId: string) => void;
  updProg: (catId: string, taskId: string, prog: number) => void;
  toggleType: (cid: string, tid: string) => void;
  cycleStatus: (taskId: string) => void;
  gen: () => void;
  // Meta
  generating: boolean;
  statusMsg: string;
  saveStatus: 'idle' | 'saving' | 'saved';
  hovWk: number | null;
  setHovWk: (wi: number | null) => void;
  drag: { catId: string; taskId: string; initialWi: number } | null;
  setDrag: (d: { catId: string; taskId: string; initialWi: number } | null) => void;
  onMouseUp: (targetWi?: number) => void;
  sCurve: { planned: number[]; actual: number[] };
  assignToast: AssignToast | null;
  setAssignToast: (t: AssignToast | null) => void;
  toggleExpand: (cid: string) => void;
}

export const useSmartSchedule = (
  project?: Project,
): UseSmartScheduleReturn => {
  const { user } = useAuth();
  const { updateProject } = useProjects();
  const DWC = 16;
  const [schedule, setSchedule] = useState<ProjectSchedule | null>(null);
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d;
  });
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hovWk, setHovWk] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ catId: string; taskId: string; initialWi: number } | null>(null);
  const [assignToast, setAssignToast] = useState<AssignToast | null>(null);

  // --- REHYDRATION ---
  useEffect(() => {
    if (project) {
      if (project.schedule) setSchedule(rehydrateSchedule(project.schedule));
      else {
        setSchedule({
          categories: [],
          weeks: buildWeeks(DWC),
          startDate: startDate.toISOString(),
          statuses: {},
          timeScale: "weeks",
        });
      }
    }
  }, [project?.id]);

  const cur = useMemo<ProjectSchedule>(
    () => schedule ?? { categories: [], weeks: buildWeeks(DWC), startDate: startDate.toISOString(), statuses: {}, timeScale: "weeks" },
    [schedule, startDate]
  );
  
  const { categories, weeks, statuses } = cur;
  const wc = weeks.length;

  // --- AUTO-SAVE ---
  useEffect(() => {
    if (!project || !schedule) return;
    const sanitized = sanitizeSchedule(schedule);
    if (JSON.stringify(sanitized) === JSON.stringify(project.schedule)) return;
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      await updateProject({ ...project, schedule: sanitized });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 1200);
    return () => clearTimeout(timer);
  }, [schedule, project, updateProject]);

  // --- HANDLERS ---
  const save = (fn: (p: ProjectSchedule) => ProjectSchedule) => setSchedule(s => fn(s || cur));
  const setCats = (fn: (p: Category[]) => Category[]) => save(s => ({ ...s, categories: fn(s.categories) }));

  const addWeek = () => save(s => ({
    ...s,
    weeks: [...s.weeks, { id: uid(), label: `S${s.weeks.length + 1}`, offset: (s.weeks[s.weeks.length - 1]?.offset ?? -7) + 7 }],
    categories: s.categories.map(c => ({ ...c, tasks: c.tasks.map(t => ({ ...t, weeks: [...t.weeks, false] })) })),
  }));

  const delWeek = (wi: number) => save(s => ({
    ...s,
    weeks: relabel(s.weeks.filter((_, i) => i !== wi)),
    categories: s.categories.map(c => ({ ...c, tasks: c.tasks.map(t => ({ ...t, weeks: t.weeks.filter((_, i) => i !== wi) })) })),
  }));

  const insAfter = (wi: number) => save(s => {
    const nw = [...s.weeks];
    nw.splice(wi + 1, 0, { id: uid(), label: '', offset: (s.weeks[wi]?.offset ?? wi * 7) + 7 });
    return {
      ...s,
      weeks: relabel(nw),
      categories: s.categories.map(c => ({
        ...c,
        tasks: c.tasks.map(t => {
          const nws = [...(t.weeks || [])];
          nws.splice(wi + 1, 0, false);
          return { ...t, weeks: nws };
        }),
      })),
    };
  });

  const renameWk = (wi: number, label: string) => save(s => ({
    ...s,
    weeks: s.weeks.map((w, i) => (i === wi ? { ...w, label } : w)),
  }));

  const addTask = (cid: string, type: TaskRow['type'] = 'refinement') => {
    const t: TaskRow = { id: uid(), name: type === 'review' ? 'Nueva Revisión' : 'Nuevo Plano', type, weeks: Array(wc).fill(false), progress: 0 };
    setCats(p => p.map(c => (c.id !== cid ? c : { ...c, tasks: [...c.tasks, t], expanded: true })));
  };

  const addCat = () => {
    const c: Category = { id: uid(), name: 'Nueva Disciplina', color: '#64748B', icon: null as any, expanded: true, tasks: [] };
    setCats(p => [...p, c]);
  };

  const delTask = (cid: string, tid: string) => setCats(p => p.map(c => c.id !== cid ? c : { ...c, tasks: c.tasks.filter(t => t.id !== tid) }));
  const delCat = (cid: string) => setCats(p => p.filter(c => c.id !== cid));
  const updName = (cid: string, tid: string, name: string) => setCats(p => p.map(c => c.id !== cid ? c : { ...c, tasks: c.tasks.map(t => t.id !== tid ? t : { ...t, name }) }));
  const updCatName = (cid: string, name: string) => setCats(p => p.map(c => c.id !== cid ? c : { ...c, name }));
  const toggleExpand = (cid: string) => setCats(p => p.map(c => c.id !== cid ? c : { ...c, expanded: !c.expanded }));

  const toggleWk = (cid: string, tid: string, wi: number, force?: boolean) => setCats(p => p.map(c => c.id !== cid ? c : {
    ...c,
    tasks: c.tasks.map(t => t.id !== tid ? t : { ...t, weeks: t.weeks.map((v, i) => i === wi ? (force !== undefined ? force : !v) : v) })
  }));

  const updAssignee = (cid: string, tid: string, assigneeId: string) => {
    let cat: Category | undefined;
    let task: TaskRow | undefined;
    
    setCats(p => p.map(c => {
        if (c.id !== cid) return c;
        cat = c;
        return {
            ...c,
            tasks: c.tasks.map(t => {
                if (t.id !== tid) return t;
                if (t.assigneeId === assigneeId) return t; // No change
                task = t;
                return { ...t, assigneeId: (assigneeId || null) };
            })
        };
    }));

    // Trigger Notification if valid
    if (task && cat && assigneeId && assigneeId !== user?.id) {
        const member = TEAM_MEMBERS.find(m => m.id === assigneeId);
        if (member) {
            const payload = {
                recipientId: member.id,
                recipientName: member.name,
                recipientEmail: member.email,
                taskName: task.name,
                categoryName: cat.name,
                siblingTasks: cat.tasks.map(t => t.name).filter(n => n !== task?.name),
                projectLabel: `[${project?.id || 'ID'}] ${project?.address || ''}`
            };

            // 1. Show Toast
            setAssignToast(payload);

            // 2. Auto-open Mailto (Bug Restore)
            sendAssignmentEmail(payload);
        }
    }
  };

  const updProg = (cid: string, tid: string, prog: number) => setCats(p => p.map(c => c.id !== cid ? c : { ...c, tasks: c.tasks.map(t => t.id !== tid ? t : { ...t, progress: Math.max(0, Math.min(100, prog)) }) }));
  
  const toggleType = (cid: string, tid: string) => {
    const order: TaskRow['type'][] = ['critical', 'refinement', 'review', 'milestone'];
    setCats(p => p.map(c => c.id !== cid ? c : { ...c, tasks: c.tasks.map(t => t.id !== tid ? t : { ...t, type: order[(order.indexOf(t.type) + 1) % order.length] }) }));
  };

  const cycleStatus = (tid: string) => save(s => {
    const current = s.statuses[tid] ?? 'not_started';
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(current as any) + 1) % STATUS_ORDER.length];
    return { ...s, statuses: { ...s.statuses, [tid]: next } };
  });

  const gen = () => {
    setGenerating(true);
    const steps = ["Arquetipando...", "Calculando pesos...", "Optimizando plan..."];
    let i = 0; setStatusMsg(steps[0]);
    const iv = setInterval(() => {
      i++;
      if (i < steps.length) setStatusMsg(steps[i]);
      else {
        clearInterval(iv);
        
        // Determine template or parametric
        const isResidential = project?.subtype === 'Casa habitación' || project?.type === 'Residencial';
        
        if (isResidential) {
            const template = getResidentialTemplate(startDate.toISOString());
            save(() => template);
        } else {
            // Parametric adjustment fallback
            const sqft = project?.sqft || 4000;
            const scale = Math.max(1, sqft / 4000);
            save(s => ({ ...s, weeks: buildWeeks(Math.round(16 * scale)) }));
        }
        
        setGenerating(false);
      }
    }, 500);
  };

  // --- DRAG LOGIC ---
  const onMouseUp = (targetWi?: number) => {
    if (drag && targetWi !== undefined) {
        const { catId, taskId, initialWi } = drag;
        const offset = targetWi - initialWi;
        if (offset !== 0) {
            setCats(p => p.map(c => c.id !== catId ? c : {
                ...c,
                tasks: c.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    const nws = Array(wc).fill(false);
                    t.weeks.forEach((v, i) => {
                        if (v) {
                            const newIdx = i + offset;
                            if (newIdx >= 0 && newIdx < wc) nws[newIdx] = true;
                        }
                    });
                    return { ...t, weeks: nws };
                })
            }));
        }
    }
    setDrag(null);
  };

  // --- DERIVED ---
  const allTasks = useMemo(() => categories.flatMap(c => c.tasks), [categories]);
  
  const todayWi = useMemo(() => {
    const t = new Date();
    for (let i = 0; i < weeks.length; i++) {
      const s = addDays(startDate, weeks[i].offset);
      const e = addDays(startDate, weeks[i].offset + 7);
      if (t >= s && t < e) return i;
    }
    return -1;
  }, [weeks, startDate]);

  const wkLoad = useMemo(() => weeks.map((_, i) => allTasks.filter(t => t.weeks[i]).length), [allTasks, weeks]);

  const sCurve = useMemo(() => {
    let planned: number[] = [];
    let actual: number[] = [];
    if (!allTasks.length || wc === 0) return { planned, actual };
    
    let accumPlan = 0;
    for (let wi = 0; wi < wc; wi++) {
      let wkContribution = 0;
      allTasks.forEach(t => {
        const span = t.baselineWeeks?.filter(Boolean).length || (t.weeks?.filter(Boolean).length) || 1;
        const isPlan = t.baselineWeeks ? t.baselineWeeks[wi] : t.weeks?.[wi];
        if (isPlan) wkContribution += 1 / span;
      });
      accumPlan += (wkContribution / allTasks.length) * 100;
      planned.push(Math.min(100, accumPlan));
    }

    const currentActualTotal = allTasks.reduce((a, t) => a + (t.progress || 0), 0) / allProjectsTotalLoad;
    // Simplified actual curve based on current vs today
    for (let wi = 0; wi <= todayWi && wi < wc; wi++) {
        const ratio = (wi + 1) / (todayWi + 1);
        actual.push(Math.min(100, planned[wi] * (currentActualTotal / (planned[todayWi] || 1)) ));
    }
    return { planned, actual };
  }, [allTasks, wc, todayWi]);

  const efficiencyScore = useMemo(() => {
    if (!allTasks.length) return 100;
    const avgProg = allTasks.reduce((a, t) => a + t.progress, 0) / allTasks.length;
    const expected = todayWi >= 0 ? (sCurve.planned[todayWi] || 0) : 0;
    if (expected === 0) return 100;
    return Math.round(Math.min(100, (avgProg / expected) * 100));
  }, [allTasks, todayWi, sCurve.planned]);

  const executionMetrics = useMemo(() => ({
    estCompletion: wc,
    totalTasks: allTasks.length,
    criticalCount: allTasks.filter(t => t.type === 'critical').length,
    refinements: allTasks.filter(t => t.type === 'refinement').length,
    reviews: allTasks.filter(t => t.type === 'review').length,
    globalProgress: Math.round(allTasks.length ? allTasks.reduce((a, t) => a + t.progress, 0) / allTasks.length : 0)
  }), [allTasks, wc]);

  return {
    startDate, setStartDate, search, setSearch, zoom, setZoom,
    categories, weeks, statuses, schedule, allTasks, wkLoad, todayWi,
    COL_W: Math.max(20, Math.round(60 * zoom)),
    FONT_SCALE: Math.max(1, zoom * 0.85),
    efficiencyScore, executionMetrics,
    addWeek, delWeek, insAfter, renameWk, addTask, addCat, delTask, delCat,
    updName, updCatName, toggleWk, updAssignee, updProg, toggleType, cycleStatus, gen,
    generating, statusMsg, saveStatus, hovWk, setHovWk, drag, setDrag,
    onMouseUp,
    sCurve, assignToast, setAssignToast, toggleExpand,
  };
};

const allProjectsTotalLoad = 1; // placeholder for weighting
