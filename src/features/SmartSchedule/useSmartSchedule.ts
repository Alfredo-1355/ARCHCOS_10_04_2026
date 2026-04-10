// src/features/SmartSchedule/useSmartSchedule.ts
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth, useProjects } from '../../contexts/DashboardContext';
import { ProjectSchedule, Category, TaskRow, TimeColumn, Project, TaskStatus } from '../../types/dashboard';
import { DWC_W, DWC_D, TEAM_MEMBERS, STATUS_ORDER } from './constants';
import {
  uid, buildWeeks, relabel, sanitizeSchedule, rehydrateSchedule,
  sendAssignmentMailto, ICON_COMPONENTS as ICON_MAP,
  addDays
} from './utils/helpers';
import { getResidentialTemplate } from './templates/residential';

// --- STORE & ENGINE ---
import { useGanttStore, GanttTask } from './store/useGanttStore';

// --- SUB-HOOKS ---
import { useTimeViewport } from './hooks/useTimeViewport';
import { useScheduleMetrics } from './hooks/useScheduleMetrics';
import { useScheduleSync } from './hooks/useScheduleSync';

export interface SmartNotification {
  title: string;
  message: string;
  type?: 'error' | 'success';
}

export interface UseSmartScheduleReturn {
  startDate: Date; setStartDate: (d: Date) => void;
  search: string; setSearch: (s: string) => void;
  zoom: number; setZoom: React.Dispatch<React.SetStateAction<number>>;
  categories: Category[]; weeks: TimeColumn[];
  statuses: Record<string, string>; schedule: ProjectSchedule | null;
  allTasks: TaskRow[]; wkLoad: number[]; todayWi: number;
  COL_W: number; FONT_SCALE: number;
  efficiencyScore: number;
  executionMetrics: {
    estCompletion: number; totalTasks: number; criticalCount: number;
    refinements: number; reviews: number; globalProgress: number;
  };
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
  updTimeframe: (catId: string, taskId: string, startDay: number, duration: number) => void;
  updAssignee: (planId: string, assigneeId: string | null) => void;
  updProg: (catId: string, taskId: string, prog: number) => void;
  toggleType: (cid: string, tid: string) => void;
  cycleStatus: (taskId: string) => void;
  gen: () => void;
  generating: boolean; statusMsg: string; saveStatus: 'idle' | 'saving' | 'saved';
  hovWk: number | null; setHovWk: (wi: number | null) => void;
  drag: { catId: string; taskId: string; initialWi: number } | null;
  setDrag: (d: { catId: string; taskId: string; initialWi: number } | null) => void;
  onMouseUp: (targetWi?: number) => void;
  sCurve: { planned: number[]; actual: number[] };
  notification: SmartNotification | null;
  setNotification: (n: SmartNotification | null) => void;
  toggleExpand: (cid: string) => void;
  timeScale: 'weeks' | 'days';
  toggleScale: () => void;
  emailStatusMap: Record<string, 'idle' | 'sending' | 'sent' | 'error'>;
  shiftTime: (direction: -1 | 1) => void;
  drawing: any;
  setDrawing: (d: any) => void;
  undo: () => void;
  redo: () => void;
}

export const useSmartSchedule = (project?: Project): UseSmartScheduleReturn => {
  const { user } = useAuth();
  const { updateProject } = useProjects();

  // --- ZUSTAND STORE (Undo/Redo, Drawing) ---
  const store = useGanttStore();
  const { drawing, setDrawing, updateTaskPosition, updateTaskDuration, undo, redo } = store;

  // --- CORE SCHEDULE STATE ---
  const [schedule, setSchedule] = useState<ProjectSchedule | null>(null);
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d;
  });
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hovWk, setHovWk] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ catId: string; taskId: string; initialWi: number } | null>(null);
  const [notification, setNotification] = useState<SmartNotification | null>(null);
  const [emailStatusMap, setEmailStatusMap] = useState<Record<string, 'idle' | 'sending' | 'sent' | 'error'>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  // Time viewport sub-hook (only shiftTime and timeScale are used from here;
  // toggleScale is overridden below to also mutate the schedule)
  const { timeScale: _vpTimeScale, shiftTime } = useTimeViewport('weeks');

  // --- REHYDRATION FROM FIREBASE ---
  useEffect(() => {
    if (project) {
      if (project.schedule) {
        const hyd = rehydrateSchedule(project.schedule);
        setSchedule(hyd);
        if (hyd.startDate) setStartDate(new Date(hyd.startDate));
        if (hyd.statuses) setStatuses(hyd.statuses);
        // Sync statuses from schedule
        const hydratedStatuses = hyd.statuses || {};
        setStatuses(hydratedStatuses);
      } else {
        setSchedule({
          categories: [],
          weeks: buildWeeks(DWC_W, 'weeks'),
          startDate: startDate.toISOString(),
          statuses: {},
          timeScale: 'weeks',
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  // Derived schedule working copy
  const cur = useMemo<ProjectSchedule>(
    () => schedule ?? {
      categories: [],
      weeks: buildWeeks(DWC_W, 'weeks'),
      startDate: startDate.toISOString(),
      statuses: {},
      timeScale: 'weeks',
    },
    [schedule, startDate]
  );

  const { categories, weeks } = cur;
  const wc = weeks.length;

  // --- AUTO-SAVE (1.5s debounce) ---
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!project || !schedule) return;

    const sanitized = sanitizeSchedule({ ...schedule, statuses });
    const existing = project.schedule
      ? sanitizeSchedule(rehydrateSchedule(project.schedule))
      : null;

    if (JSON.stringify(sanitized) === JSON.stringify(existing)) return;

    setSaveStatus('saving');
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
      try {
        await updateProject({ ...project, schedule: sanitized });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('idle');
        setNotification({
          title: 'Error al Guardar',
          message: 'No se pudo guardar. Intenta de nuevo.',
          type: 'error',
        });
      }
    }, 1500);

    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [schedule, statuses, project?.id]);

  // --- SCHEDULE MUTATION HELPERS ---
  const save = useCallback(
    (fn: (p: ProjectSchedule) => ProjectSchedule) => setSchedule(s => fn(s || cur)),
    [cur]
  );
  const setCats = useCallback(
    (fn: (p: Category[]) => Category[]) => save(s => ({ ...s, categories: fn(s.categories) })),
    [save]
  );

  // --- HANDLERS ---
  const toggleExpand = useCallback((cid: string) =>
    setCats(p => p.map(c => c.id === cid ? { ...c, expanded: !c.expanded } : c)),
    [setCats]
  );

  // toggleScale: mutates the schedule's timeScale and rebuilds columns
  const [timeScale, setTimeScaleLocal] = useState<'weeks' | 'days'>('weeks');
  const toggleScale = useCallback(() => save(s => {
    const next = s.timeScale === 'weeks' ? 'days' : 'weeks';
    const count = next === 'weeks' ? DWC_W : DWC_D;
    setTimeScaleLocal(next);
    return {
      ...s,
      timeScale: next,
      weeks: buildWeeks(count, next),
      categories: s.categories.map(c => ({
        ...c,
        tasks: c.tasks.map(t => ({ ...t, weeks: Array(count).fill(false) }))
      }))
    };
  }), [save]);

  const addWeek = useCallback(() => save(s => ({
    ...s,
    weeks: [
      ...s.weeks,
      {
        id: uid(),
        label: s.timeScale === 'weeks' ? `S${s.weeks.length + 1}` : (s.weeks.length + 1).toString().padStart(2, '0'),
        offset: (s.weeks[s.weeks.length - 1]?.offset ?? -7) + (s.timeScale === 'weeks' ? 7 : 1)
      }
    ],
    categories: s.categories.map(c => ({
      ...c,
      tasks: c.tasks.map(t => ({ ...t, weeks: [...t.weeks, false] }))
    })),
  })), [save]);

  const delWeek = useCallback((wi: number) => save(s => ({
    ...s,
    weeks: relabel(s.weeks.filter((_, i) => i !== wi), s.timeScale),
    categories: s.categories.map(c => ({
      ...c,
      tasks: c.tasks.map(t => ({ ...t, weeks: t.weeks.filter((_, i) => i !== wi) }))
    })),
  })), [save]);

  const insAfter = useCallback((wi: number) => save(s => {
    const nw = [...s.weeks];
    const inc = s.timeScale === 'weeks' ? 7 : 1;
    nw.splice(wi + 1, 0, { id: uid(), label: '', offset: (s.weeks[wi]?.offset ?? wi * inc) + inc });
    return {
      ...s,
      weeks: relabel(nw, s.timeScale),
      categories: s.categories.map(c => ({
        ...c,
        tasks: c.tasks.map(t => {
          const nws = [...(t.weeks || [])];
          nws.splice(wi + 1, 0, false);
          return { ...t, weeks: nws };
        }),
      })),
    };
  }), [save]);

  const renameWk = useCallback((wi: number, label: string) => save(s => ({
    ...s,
    weeks: s.weeks.map((w, i) => (i === wi ? { ...w, label } : w)),
  })), [save]);

  const addTask = useCallback((cid: string, type: TaskRow['type'] = 'refinement') => {
    const t: TaskRow = {
      id: uid(),
      name: type === 'review' ? 'Nueva Revisión' : 'Nuevo Plano',
      type,
      weeks: Array(wc).fill(false),
      progress: 0,
    };
    setCats(p => p.map(c => c.id !== cid ? c : { ...c, tasks: [...c.tasks, t], expanded: true }));
  }, [setCats, wc]);

  const addCat = useCallback(() => {
    const c: Category = {
      id: uid(),
      name: 'Nueva Disciplina',
      color: '#64748B',
      icon: ICON_MAP['Settings'],
      expanded: true,
      tasks: [],
    };
    setCats(p => [...p, c]);
  }, [setCats]);

  const delTask = useCallback((cid: string, tid: string) =>
    setCats(p => p.map(c => c.id !== cid ? c : { ...c, tasks: c.tasks.filter(t => t.id !== tid) })),
    [setCats]
  );

  const delCat = useCallback((cid: string) =>
    setCats(p => p.filter(c => c.id !== cid)),
    [setCats]
  );

  const updName = useCallback((cid: string, tid: string, name: string) =>
    setCats(p => p.map(c => c.id !== cid ? c : {
      ...c, tasks: c.tasks.map(t => t.id !== tid ? t : { ...t, name })
    })),
    [setCats]
  );

  const updCatName = useCallback((cid: string, name: string) =>
    setCats(p => p.map(c => c.id !== cid ? c : { ...c, name })),
    [setCats]
  );

  // SSOT time model: store startDay + duration instead of boolean arrays
  const updTimeframe = useCallback((cid: string, tid: string, startDay: number, duration: number) => {
    setCats(p => p.map(c => c.id !== cid ? c : {
      ...c,
      tasks: c.tasks.map(t => {
        if (t.id !== tid) return t;
        // Also project onto weeks array for legacy renderer compatibility
        const newWeeks = t.weeks.map((_, wi) => {
          const colStart = wi * 7;
          const colEnd = colStart + 7;
          return (startDay < colEnd) && ((startDay + duration) > colStart);
        });
        return { ...t, startDay, duration, weeks: newWeeks };
      })
    }));
    // Also update Zustand store for Opus engine
    const task = categories.flatMap(c => c.tasks).find(t => t.id === tid);
    if (task) {
      updateTaskPosition(tid, startDay);
      updateTaskDuration(tid, duration);
    }
  }, [setCats, categories, updateTaskPosition, updateTaskDuration]);

  // mailto: Outlook bridge — headless, no popups
  const updAssignee = useCallback((planId: string, assigneeId: string | null) => {
    const allTasks = categories.flatMap(c => c.tasks);
    const task = allTasks.find(t => t.id === planId);
    if (!task) return;

    const cat = categories.find(c => c.tasks.some(t => t.id === planId));
    let memberName: string | null = null;
    let memberEmail: string | null = null;

    if (assigneeId) {
      const member = TEAM_MEMBERS.find(m => m.id === assigneeId);
      if (!member) return;
      memberName = member.name;
      memberEmail = member.email;
    }

    setCats(prev => prev.map(c => ({
      ...c,
      tasks: c.tasks.map(t => t.id === planId ? {
        ...t,
        assigneeId,
        assigneeName: memberName,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.name || 'Sistema',
      } : t)
    })));

    // Open Outlook automatically — zero popups
    if (assigneeId && memberEmail) {
      sendAssignmentMailto({
        recipientName: memberName!,
        recipientEmail: memberEmail,
        taskName: task.name,
        categoryName: cat?.name || 'Disciplina',
        projectLabel: `[${project?.id || 'ID'}] ${project?.address || ''}`,
        assignorName: user?.name || 'ARCHCOS Admin',
      });
    }
  }, [categories, setCats, user, project]);

  const updProg = useCallback((cid: string, tid: string, prog: number) =>
    setCats(p => p.map(c => c.id !== cid ? c : {
      ...c, tasks: c.tasks.map(t => t.id !== tid ? t : { ...t, progress: Math.max(0, Math.min(100, prog)) })
    })),
    [setCats]
  );

  const toggleType = useCallback((cid: string, tid: string) => {
    const order: TaskRow['type'][] = ['critical', 'refinement', 'review', 'milestone'];
    setCats(p => p.map(c => c.id !== cid ? c : {
      ...c,
      tasks: c.tasks.map(t => t.id !== tid ? t : {
        ...t, type: order[(order.indexOf(t.type) + 1) % order.length]
      })
    }));
  }, [setCats]);

  const cycleStatus = useCallback((tid: string) => {
    setStatuses(prev => {
      const current = prev[tid] ?? 'not_started';
      const next = STATUS_ORDER[(STATUS_ORDER.indexOf(current as any) + 1) % STATUS_ORDER.length];
      return { ...prev, [tid]: next };
    });
  }, []);

  const gen = useCallback(() => {
    setGenerating(true);
    const steps = ['Arquetipando...', 'Calculando pesos...', 'Optimizando plan...'];
    let i = 0;
    setStatusMsg(steps[0]);
    const iv = setInterval(() => {
      i++;
      if (i < steps.length) {
        setStatusMsg(steps[i]);
      } else {
        clearInterval(iv);
        const isResidential = project?.subtype === 'Casa habitación' || project?.type === 'Residencial';
        if (isResidential) {
          const template = getResidentialTemplate(startDate.toISOString());
          save(() => ({ ...template, statuses: {} }));
        } else {
          const sqft = project?.sqft || 4000;
          const scaleFac = Math.max(1, sqft / 4000);
          save(s => ({ ...s, weeks: buildWeeks(Math.round(DWC_W * scaleFac), 'weeks') }));
        }
        setGenerating(false);
      }
    }, 500);
  }, [project, startDate, save]);

  // Drag & drop mouse-up handler
  const onMouseUp = useCallback((targetWi?: number) => {
    // Handle Opus painting end
    if (drawing && targetWi !== undefined) {
      const start = Math.min(drawing.startWi, targetWi);
      const end = Math.max(drawing.startWi, targetWi);
      const inc = timeScale === 'weeks' ? 7 : 1;
      updTimeframe(drawing.catId, drawing.taskId, start * inc, (end - start + 1) * inc);
    }
    setDrawing(null);

    // Handle drag-and-drop task move
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
                const ni = i + offset;
                if (ni >= 0 && ni < wc) nws[ni] = true;
              }
            });
            // Update SSOT startDay as well
            const newStartDay = (t.startDay ?? initialWi * 7) + offset * (timeScale === 'weeks' ? 7 : 1);
            return { ...t, weeks: nws, startDay: Math.max(0, newStartDay) };
          })
        }));
      }
    }
    setDrag(null);
  }, [drag, drawing, timeScale, wc, updTimeframe, setDrawing, setCats]);

  // --- DERIVED METRICS ---
  const allTasks = useMemo(() => categories.flatMap(c => c.tasks), [categories]);

  const todayWi = useMemo(() => {
    const t = new Date();
    const inc = timeScale === 'weeks' ? 7 : 1;
    for (let i = 0; i < weeks.length; i++) {
      const s = addDays(startDate, weeks[i].offset);
      const e = addDays(startDate, weeks[i].offset + inc);
      if (t >= s && t < e) return i;
    }
    return -1;
  }, [weeks, startDate, timeScale]);

  const wkLoad = useMemo(
    () => weeks.map((_, i) => allTasks.filter(t => t.weeks[i]).length),
    [allTasks, weeks]
  );

  const sCurve = useMemo(() => {
    const planned: number[] = [];
    const actual: number[] = [];
    if (!allTasks.length || wc === 0) return { planned, actual };
    let accumPlan = 0;
    for (let wi = 0; wi < wc; wi++) {
      let wkContribution = 0;
      allTasks.forEach(t => {
        const span = t.baselineWeeks?.filter(Boolean).length || t.weeks?.filter(Boolean).length || 1;
        const isPlan = t.baselineWeeks ? t.baselineWeeks[wi] : t.weeks?.[wi];
        if (isPlan) wkContribution += 1 / span;
      });
      accumPlan += (wkContribution / allTasks.length) * 100;
      planned.push(Math.min(100, accumPlan));
    }
    const currentActualTotal = allTasks.reduce((a, t) => a + (t.progress || 0), 0) / (allTasks.length || 1);
    for (let wi = 0; wi <= todayWi && wi < wc; wi++) {
      actual.push(Math.min(100, planned[wi] * (currentActualTotal / (planned[todayWi] || 1))));
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
    globalProgress: Math.round(allTasks.length
      ? allTasks.reduce((a, t) => a + t.progress, 0) / allTasks.length
      : 0),
  }), [allTasks, wc]);

  return {
    startDate, setStartDate,
    search, setSearch,
    zoom, setZoom,
    categories, weeks, statuses, schedule: cur,
    allTasks, wkLoad, todayWi,
    COL_W: Math.max(20, Math.round((timeScale === 'weeks' ? 60 : 40) * zoom)),
    FONT_SCALE: Math.max(1, zoom * 0.85),
    efficiencyScore, executionMetrics,
    addWeek, delWeek, insAfter, renameWk,
    addTask, addCat, delTask, delCat,
    updName, updCatName, updTimeframe, updAssignee, updProg,
    toggleType, cycleStatus, gen,
    generating, statusMsg, saveStatus,
    hovWk, setHovWk, drag, setDrag,
    onMouseUp,
    sCurve,
    notification, setNotification,
    toggleExpand,
    timeScale, toggleScale,
    emailStatusMap,
    shiftTime,
    drawing, setDrawing, undo, redo,
  };
};
