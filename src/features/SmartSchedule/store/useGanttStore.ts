import { create } from 'zustand';
import { ARCHITECTURAL_TEMPLATE } from '../data/projectTemplate';
import { generateSmartSchedule } from '../utils/scheduler';

export interface GanttTask {
  id: string;
  name: string;
  categoryId: string;
  type: "critical" | "refinement" | "review";
  startCol: number;
  baselineStartCol: number;
  durationCols: number;
  progress: number;
  assigneeId?: string | null;
  zeroFloat?: boolean;
}

export interface GanttLink {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Snapshot {
  tasks: GanttTask[];
  links: GanttLink[];
}

const MAX_HISTORY = 20;

interface GanttState {
  // Config
  zoomLevel: 1 | 2 | 3;
  colWidth: number;
  rowHeight: number;
  zenMode: boolean;
  timeScale: 'weeks' | 'days';
  
  // Data
  tasks: GanttTask[];
  links: GanttLink[];
  
  // Ephemeral State
  nodePositions: Record<string, NodePosition>;
  ghostLink: { sourceId: string; mouseX: number; mouseY: number } | null;
  draggedTaskId: string | null;
  selectedTaskIds: Set<string>;
  isGenerating: boolean;
  isHydrating: boolean;
  activeProjectId: string | null;

  // History (Temporal State)
  past: Snapshot[];
  future: Snapshot[];

  // Actions
  setZoomLevel: (level: 1 | 2 | 3) => void;
  setZenMode: (active: boolean) => void;
  setTimeScale: (scale: 'weeks' | 'days') => void;
  
  setTasks: (tasks: GanttTask[]) => void;
  setLinks: (links: GanttLink[]) => void;
  
  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  generateProjectSkeleton: (startOffset?: number) => Promise<void>;
  updateTaskPosition: (id: string, startCol: number) => void;
  updateTaskDuration: (id: string, durationCols: number) => void;
  setNodePosition: (id: string, pos: NodePosition) => void;
  setGhostLink: (sourceId: string | null, mouseX?: number, mouseY?: number) => void;
  addLink: (sourceId: string, targetId: string) => void;
  removeLink: (id: string) => void;
  setDraggedTaskId: (id: string | null) => void;
  toggleTaskSelection: (id: string, multiSelect: boolean) => void;
  clearSelection: () => void;
  clearStore: () => void;
  loadProjectSchedule: (projectId: string, tasks: GanttTask[], links: GanttLink[]) => void;
}

const getColWidthForZoom = (z: number) => {
  if (z === 1) return 20; // Macro
  if (z === 3) return 140; // Micro
  return 60; // Standard
};

// --- Business Day Logic ---
// We assume day 0 is a Monday for calculation simplicity
export const isWeekend = (dayIndex: number) => {
  const day = dayIndex % 7;
  return day === 5 || day === 6; // 5=Sat, 6=Sun
};

export const getNextBusinessDay = (dayIndex: number) => {
  let current = dayIndex;
  while (isWeekend(current)) {
    current++;
  }
  return current;
};

export const calculateEndDay = (startDay: number, duration: number) => {
  let count = 0;
  let current = startDay;
  while (count < duration) {
    if (!isWeekend(current)) {
      count++;
    }
    if (count < duration) current++;
  }
  return current + 1; // End is exclusive boundary
};
// ---------------------------

// Internal Cascade Engine Logic
function enforceCascade(tasks: GanttTask[], links: GanttLink[], modifiedIds: string[]): GanttTask[] {
  let nextTasks = [...tasks];
  let queue = [...modifiedIds];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentTask = nextTasks.find(t => t.id === currentId);
    if (!currentTask) continue;
    
    // Find downstream links (current is source)
    const childLinks = links.filter(l => l.sourceId === currentId);
    for (const link of childLinks) {
       const childId = link.targetId;
       const childTask = nextTasks.find(t => t.id === childId);
       if (!childTask) continue;
       
       // Calculate required start by skipping weekends
       const minStartCol = getNextBusinessDay(calculateEndDay(currentTask.startCol, currentTask.durationCols));
       
       if (childTask.startCol < minStartCol) {
          // Push child right to respect Finish-to-Start constraint
          const newStartCol = minStartCol;
          nextTasks = nextTasks.map(t => t.id === childId ? { ...t, startCol: newStartCol } : t);
          queue.push(childId); // Cascading update
       }
    }
  }
  return nextTasks;
}

export const useGanttStore = create<GanttState>((set, get) => ({
  zoomLevel: 2,
  colWidth: 60,
  rowHeight: 48,
  zenMode: false,
  timeScale: 'weeks',
  
  tasks: [],
  links: [],
  
  nodePositions: {},
  ghostLink: null,
  draggedTaskId: null,
  selectedTaskIds: new Set(),
  isGenerating: false,
  isHydrating: false,
  activeProjectId: null,

  past: [],
  future: [],

  setZoomLevel: (level) => set({ zoomLevel: level, colWidth: getColWidthForZoom(level) }),
  
  setZenMode: (active) => set({ 
    zenMode: active,
    // Cancel active interactions to prevent visual artifacts as per user rules
    ghostLink: null,
    draggedTaskId: null 
  }),

  setTimeScale: (scale) => set({ timeScale: scale }),
  
  setTasks: (tasks) => set({ tasks }),
  setLinks: (links) => set({ links }),
  
  saveSnapshot: () => set(state => {
    const currentState: Snapshot = {
      // Simple array/object clone since tasks are flat
      tasks: state.tasks.map(t => ({ ...t })),
      links: state.links.map(l => ({ ...l }))
    };
    
    const newPast = [...state.past, currentState];
    if (newPast.length > MAX_HISTORY) {
      newPast.shift(); // Remove oldest
    }

    return { past: newPast, future: [] };
  }),

  undo: () => set(state => {
    if (state.past.length === 0) return state;
    
    const currentState: Snapshot = {
      tasks: state.tasks.map(t => ({ ...t })),
      links: state.links.map(l => ({ ...l }))
    };

    const newPast = [...state.past];
    const previousState = newPast.pop()!;

    return {
      tasks: previousState.tasks,
      links: previousState.links,
      past: newPast,
      future: [currentState, ...state.future],
      ghostLink: null,
      draggedTaskId: null,
      selectedTaskIds: new Set()
    };
  }),

  redo: () => set(state => {
    if (state.future.length === 0) return state;

    const currentState: Snapshot = {
      tasks: state.tasks.map(t => ({ ...t })),
      links: state.links.map(l => ({ ...l }))
    };

    const newFuture = [...state.future];
    const nextState = newFuture.shift()!;

    return {
      tasks: nextState.tasks,
      links: nextState.links,
      past: [...state.past, currentState],
      future: newFuture,
      ghostLink: null,
      draggedTaskId: null,
      selectedTaskIds: new Set()
    };
  }),

  generateProjectSkeleton: async (startOffset = 0) => {
    set({ isGenerating: true });
    
    // Safety timeout to ensure UI is never permanently shielded
    const safetyTimeout = setTimeout(() => {
      const state = get();
      if (state.isGenerating) {
        console.warn("Gantt Generation safety timeout triggered.");
        set({ isGenerating: false });
      }
    }, 5000);

    // Simulate thinking/calculating
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      // For generator, we multiply duration by 5 (working days) or 7.
      const scaledTemplate = ARCHITECTURAL_TEMPLATE.map(t => ({
        ...t,
        duration: t.duration * 5
      }));

      const { tasks, links } = generateSmartSchedule(scaledTemplate, startOffset);
      
      const standardizedTasks = tasks.map(t => {
        const start = getNextBusinessDay(t.startCol);
        return { ...t, startCol: start, baselineStartCol: start };
      });

      const cascadedTasks = enforceCascade(standardizedTasks, links, standardizedTasks.map(t => t.id));

      set({ 
        tasks: cascadedTasks, 
        links, 
        isGenerating: false,
        past: [],
        future: [],
        nodePositions: {} 
      });
    } catch (err) {
      console.error("Gantt Generation failed:", err);
      set({ isGenerating: false });
    } finally {
      clearTimeout(safetyTimeout);
    }
  },

  updateTaskPosition: (id, startCol) => {
    const state = get();
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    if (task.startCol === startCol) return; // No change

    state.saveSnapshot(); // Interceptor

    set(st => {
      const delta = startCol - task.startCol;
      const isSelected = st.selectedTaskIds.has(id);
      const idsToMove = isSelected ? Array.from(st.selectedTaskIds) : [id];

      let nextTasks = st.tasks.map(t => {
        if (idsToMove.includes(t.id)) {
          let newStart = Math.max(0, t.startCol + delta);
          // Weekend Bounce
          if (isWeekend(newStart)) {
            newStart = getNextBusinessDay(newStart);
          }
          return { ...t, startCol: newStart };
        }
        return t;
      });

      // Apply cascade enforcement
      nextTasks = enforceCascade(nextTasks, st.links, idsToMove);

      return { tasks: nextTasks };
    });
  },

  updateTaskDuration: (id, durationCols) => {
    const state = get();
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    if (task.durationCols === durationCols) return;

    state.saveSnapshot();

    set(st => {
      let nextTasks = st.tasks.map(t => {
        if (t.id === id) {
          return { ...t, durationCols: Math.max(1, durationCols) };
        }
        return t;
      });

      // Cascade pushes any connected downstream blocks
      nextTasks = enforceCascade(nextTasks, st.links, [id]);

      return { tasks: nextTasks };
    });
  },

  setNodePosition: (id, pos) => set(state => ({
    nodePositions: { ...state.nodePositions, [id]: pos }
  })),

  setGhostLink: (sourceId, mouseX = 0, mouseY = 0) => set({
    ghostLink: sourceId ? { sourceId, mouseX, mouseY } : null
  }),

  addLink: (sourceId, targetId) => {
    const state = get();
    if (sourceId === targetId) return;
    if (state.links.find(l => l.sourceId === sourceId && l.targetId === targetId)) return;
    
    state.saveSnapshot(); // Interceptor

    set(st => {
      const newLink: GanttLink = {
        id: `link_${sourceId}_${targetId}`,
        sourceId,
        targetId
      };
      
      const nextLinks = [...st.links, newLink];
      const nextTasks = enforceCascade(st.tasks, nextLinks, [sourceId]);
      
      return { links: nextLinks, tasks: nextTasks, ghostLink: null };
    });
  },

  removeLink: (id) => {
    const state = get();
    state.saveSnapshot(); // Interceptor
    
    set(st => ({
      links: st.links.filter(l => l.id !== id)
    }));
  },

  setDraggedTaskId: (id) => set({ draggedTaskId: id }),

  toggleTaskSelection: (id, multiSelect) => set(state => {
    const newSelection = new Set(multiSelect ? Array.from(state.selectedTaskIds) : []);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    return { selectedTaskIds: newSelection };
  }),

  clearSelection: () => set({ selectedTaskIds: new Set() }),

  clearStore: () => set({
    tasks: [],
    links: [],
    past: [],
    future: [],
    nodePositions: {},
    ghostLink: null,
    draggedTaskId: null,
    selectedTaskIds: new Set(),
    activeProjectId: null,
    isHydrating: false
  }),

  loadProjectSchedule: (projectId, tasks, links) => set({
    activeProjectId: projectId,
    tasks,
    links,
    past: [],
    future: [],
    nodePositions: {},
    isHydrating: false
  })
}));
