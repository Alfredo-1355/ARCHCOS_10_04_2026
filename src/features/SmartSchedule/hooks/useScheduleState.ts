import { useReducer, useCallback } from 'react';
import { Category, TaskRow, TaskStatus } from '../../../types/dashboard';
import { uid } from '../utils/helpers';
import { ICON_MAP, STATUS_ORDER } from '../constants';

// ----------------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------------
type ScheduleAction =
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY' }
  | { type: 'DELETE_CATEGORY'; payload: { catId: string } }
  | { type: 'RENAME_CATEGORY'; payload: { catId: string; name: string } }
  | { type: 'TOGGLE_EXPAND'; payload: { catId: string } }
  | { type: 'ADD_TASK'; payload: { catId: string; taskType: TaskRow['type']; defaultDuration: number } }
  | { type: 'DELETE_TASK'; payload: { catId: string; taskId: string } }
  | { type: 'RENAME_TASK'; payload: { catId: string; taskId: string; name: string } }
  | { type: 'UPDATE_TASK_ASSIGNEE'; payload: { taskId: string; assigneeId: string | null; assigneeName: string | null; updatedBy: string } }
  | { type: 'UPDATE_TASK_PROGRESS'; payload: { catId: string; taskId: string; progress: number } }
  | { type: 'CYCLE_TASK_TYPE'; payload: { catId: string; taskId: string } }
  | { type: 'UPDATE_TASK_TIMEFRAME'; payload: { catId: string; taskId: string; startDay: number; duration: number } };

// ----------------------------------------------------------------------------
// REDUCER (Puro y Seguro)
// ----------------------------------------------------------------------------
const scheduleReducer = (state: Category[], action: ScheduleAction): Category[] => {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return action.payload;

    case 'ADD_CATEGORY':
      return [
        ...state,
        { id: uid(), name: 'Nueva Disciplina', color: '#64748B', icon: ICON_MAP['Settings'], expanded: true, tasks: [] }
      ];

    case 'DELETE_CATEGORY':
      return state.filter(c => c.id !== action.payload.catId);

    case 'RENAME_CATEGORY':
      return state.map(c => c.id === action.payload.catId ? { ...c, name: action.payload.name } : c);

    case 'TOGGLE_EXPAND':
      return state.map(c => c.id === action.payload.catId ? { ...c, expanded: !c.expanded } : c);

    case 'ADD_TASK':
      return state.map(c => c.id === action.payload.catId ? {
        ...c,
        expanded: true,
        tasks: [...c.tasks, {
          id: uid(),
          name: action.payload.taskType === 'review' ? 'Nueva Revisión' : 'Nuevo Plano',
          type: action.payload.taskType,
          weeks: [], // Temporal fallback
          progress: 0,
          startDay: 0,
          duration: action.payload.defaultDuration
        }]
      } : c);

    case 'DELETE_TASK':
      return state.map(c => c.id === action.payload.catId ? {
        ...c,
        tasks: c.tasks.filter(t => t.id !== action.payload.taskId)
      } : c);

    case 'RENAME_TASK':
      return state.map(c => c.id === action.payload.catId ? {
        ...c,
        tasks: c.tasks.map(t => t.id === action.payload.taskId ? { ...t, name: action.payload.name } : t)
      } : c);

    case 'UPDATE_TASK_ASSIGNEE':
      return state.map(c => ({
        ...c,
        tasks: c.tasks.map(t => t.id === action.payload.taskId ? {
          ...t,
          assigneeId: action.payload.assigneeId,
          assigneeName: action.payload.assigneeName,
          updatedAt: new Date().toISOString(),
          updatedBy: action.payload.updatedBy
        } : t)
      }));

    case 'UPDATE_TASK_PROGRESS':
      return state.map(c => c.id === action.payload.catId ? {
        ...c,
        tasks: c.tasks.map(t => t.id === action.payload.taskId ? { ...t, progress: action.payload.progress } : t)
      } : c);

    case 'CYCLE_TASK_TYPE': {
      const order: TaskRow['type'][] = ['critical', 'refinement', 'review', 'milestone'];
      return state.map(c => c.id === action.payload.catId ? {
        ...c,
        tasks: c.tasks.map(t => {
          if (t.id !== action.payload.taskId) return t;
          const nextType = order[(order.indexOf(t.type) + 1) % order.length];
          return { ...t, type: nextType };
        })
      } : c);
    }

    case 'UPDATE_TASK_TIMEFRAME':
      return state.map(c => c.id === action.payload.catId ? {
        ...c,
        tasks: c.tasks.map(t => t.id === action.payload.taskId ? {
          ...t,
          startDay: action.payload.startDay,
          duration: action.payload.duration
        } : t)
      } : c);

    default:
      return state;
  }
};

// ----------------------------------------------------------------------------
// HOOK
// ----------------------------------------------------------------------------
export const useScheduleState = (initialCategories: Category[]) => {
  const [categories, dispatch] = useReducer(scheduleReducer, initialCategories);

  // Exponemos métodos limpios e inmutables para el componente orquestador
  const setCategories = useCallback((cats: Category[]) => dispatch({ type: 'SET_CATEGORIES', payload: cats }), []);
  const addCategory = useCallback(() => dispatch({ type: 'ADD_CATEGORY' }), []);
  const deleteCategory = useCallback((catId: string) => dispatch({ type: 'DELETE_CATEGORY', payload: { catId } }), []);
  const renameCategory = useCallback((catId: string, name: string) => dispatch({ type: 'RENAME_CATEGORY', payload: { catId, name } }), []);
  const toggleExpand = useCallback((catId: string) => dispatch({ type: 'TOGGLE_EXPAND', payload: { catId } }), []);
  
  const addTask = useCallback((catId: string, taskType: TaskRow['type'] = 'refinement', defaultDuration: number = 7) => 
    dispatch({ type: 'ADD_TASK', payload: { catId, taskType, defaultDuration } }), []);
  
  const deleteTask = useCallback((catId: string, taskId: string) => dispatch({ type: 'DELETE_TASK', payload: { catId, taskId } }), []);
  const renameTask = useCallback((catId: string, taskId: string, name: string) => dispatch({ type: 'RENAME_TASK', payload: { catId, taskId, name } }), []);
  const updateTaskProgress = useCallback((catId: string, taskId: string, progress: number) => 
    dispatch({ type: 'UPDATE_TASK_PROGRESS', payload: { catId, taskId, progress: Math.max(0, Math.min(100, progress)) } }), []);
  
  const cycleTaskType = useCallback((catId: string, taskId: string) => dispatch({ type: 'CYCLE_TASK_TYPE', payload: { catId, taskId } }), []);
  
  const updateTaskTimeframe = useCallback((catId: string, taskId: string, startDay: number, duration: number) => 
    dispatch({ type: 'UPDATE_TASK_TIMEFRAME', payload: { catId, taskId, startDay, duration } }), []);
    
  const updateTaskAssignee = useCallback((taskId: string, assigneeId: string | null, assigneeName: string | null, updatedBy: string) => 
    dispatch({ type: 'UPDATE_TASK_ASSIGNEE', payload: { taskId, assigneeId, assigneeName, updatedBy } }), []);

  return {
    categories,
    setCategories,
    addCategory,
    deleteCategory,
    renameCategory,
    toggleExpand,
    addTask,
    deleteTask,
    renameTask,
    updateTaskProgress,
    cycleTaskType,
    updateTaskTimeframe,
    updateTaskAssignee
  };
};

