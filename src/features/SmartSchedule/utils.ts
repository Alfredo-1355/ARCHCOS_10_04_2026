import React from 'react';
import { 
  Building2, Wrench, Layers, Image, MapPin, Eye, Briefcase, Settings,
  Calendar, Construction, Clock, RefreshCw, CheckCircle2, AlertTriangle
} from "lucide-react";
import { USERS } from "../../constants/dashboard";
import { renderChecklistText } from '../ArchitecturalProgram/archcosChecklists';
import { 
  TaskStatus, TaskRow, TimeColumn, Category, ProjectSchedule 
} from '../../types/dashboard';

// --- PHASES ---
export const PHASE_CONFIG = [
  { id: "sd", short: "SD", label: "Schematic Design", color: "#60A5FA", bg: "#EFF6FF", range: [0, 3] }, // Weeks 1-4
  { id: "dd", short: "DD", label: "Design Development", color: "#FACC15", bg: "#FEFCE8", range: [4, 7] }, // Weeks 5-8
  { id: "cd", short: "CD", label: "Construction Docs", color: "#34D399", bg: "#ECFDF5", range: [8, 11] }, // Weeks 9-12
  { id: "ca", short: "CA", label: "Contract Admin", color: "#A78BFA", bg: "#F5F3FF", range: [12, 15] }, // Weeks 13-16
];

export const getPhaseAt = (wi: number) => {
  return PHASE_CONFIG.find(p => wi >= p.range[0] && wi <= p.range[1]) || PHASE_CONFIG[3];
};

// --- STATUS CFG ---
export const STATUS_CFG: Record<TaskStatus, { label: string; color: string; icon: React.FC<any> }> = {
  not_started: { label: "No iniciada", color: "#94A3B8", icon: Clock },
  in_progress: { label: "En progreso", color: "#60A5FA", icon: RefreshCw }, // Pastel Blue
  completed:   { label: "Completada", color: "#34D399", icon: CheckCircle2 }, // Pastel Green
  delayed:     { label: "Retrasada",  color: "#FCA5A5", icon: AlertTriangle }, // Soft Red
};

export const STATUS_ORDER: TaskStatus[] = ["not_started", "in_progress", "completed", "delayed"];

// --- BAR TYPES ---
export const BAR_TYPES = {
  critical:   { label: "Crítico",     colorPv: "#1A2744", text: "text-white" },
  refinement: { label: "Refinamiento", colorPv: "#94A3B8", text: "text-slate-900" },
  review:     { label: "Rev. Cliente", colorPv: "#F59E0B", text: "text-white" },
  milestone:  { label: "Milestone",     colorPv: "#F59E0B", text: "text-white" },
};

// --- HEATMAP ---
export const getHeatmapColor = (load: number) => {
  if (load <= 2) return "bg-blue-50/30 text-blue-400"; // Normal
  if (load <= 5) return "bg-amber-50/50 text-amber-500 border-amber-200"; // Alta Carga
  return "bg-red-50/50 text-red-500 border-red-200 animate-pulse"; // Sobrecarga
};

// --- TEAM MEMBERS ---
export const TEAM_MEMBERS = USERS.map(u => ({
  id: u.id,
  name: u.name,
  role: u.role,
  avatar: u.initials,
  color: u.color,
  email: u.email,
}));

// --- ICON SERIALIZATION ---
export const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Wrench, Layers, Image, MapPin, Eye, Briefcase, Settings,
  Calendar, Construction,
};
export const DEFAULT_ICON = Settings;

// --- UTILITIES ---
export const uid = () => Math.random().toString(36).slice(2, 9);

export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("es-MX", { month: "short", day: "numeric" });

export const fmtTime = (s: number) =>
  `${Math.floor(s / 3600).toString().padStart(2, "0")}:${Math.floor((s % 3600) / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

export const buildWeeks = (n: number): TimeColumn[] =>
  Array.from({ length: n }, (_, i) => ({
    id: uid(),
    label: `S${i + 1}`,
    offset: i * 7,
  }));

export const relabel = (ws: TimeColumn[]): TimeColumn[] =>
  ws.map((w, i) => ({ ...w, label: `S${i + 1}` }));

// --- SERIALIZATION ---
export function sanitizeSchedule(schedule: ProjectSchedule): any {
  return {
    ...schedule,
    categories: schedule.categories.map(cat => {
      const iconId = Object.entries(ICON_MAP).find(([, comp]) => comp === cat.icon)?.[0] ?? 'Settings';
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        iconId,
        expanded: !!cat.expanded,
        tasks: cat.tasks.map(task => ({
          id: task.id,
          name: task.name,
          type: task.type,
          weeks: Array.isArray(task.weeks) ? task.weeks.map(Boolean) : [],
          baselineWeeks: Array.isArray(task.baselineWeeks) ? task.baselineWeeks.map(Boolean) : [],
          progress: Number(task.progress ?? 0),
          assigneeId: task.assigneeId ?? null,
          zeroFloat: !!task.zeroFloat,
        })),
      };
    }),
    weeks: schedule.weeks.map(w => ({ id: w.id, label: w.label, offset: Number(w.offset) })),
    statuses: schedule.statuses || {},
    startDate: schedule.startDate || new Date().toISOString(),
    timeScale: schedule.timeScale || 'weeks',
  };
}

export function rehydrateSchedule(raw: any): ProjectSchedule {
  return {
    ...raw,
    categories: (raw.categories || []).map((cat: any) => ({
      ...cat,
      icon: ICON_MAP[cat.iconId as string] ?? DEFAULT_ICON,
    })),
  };
}

// --- EMAIL ---
export function buildArchcosMailto(payload: {
  recipientName:  string;
  recipientEmail: string;
  taskName:       string;
  categoryName:   string;
  siblingTasks:   string[];
  projectLabel:   string;
}): string {
  const NL = '%0D%0A';
  const TAB = '%20%20';

  const idMatch = payload.projectLabel.match(/\[([^\]]+)\]/);
  const projId   = idMatch ? idMatch[1] : 'ID';
  const projAddr = payload.projectLabel.replace(/\[[^\]]+\]\s*/, '').trim();

  const subject = encodeURIComponent(`Asignación: ${payload.taskName} — ${projId} ${projAddr}`);
  const checklistBlock = renderChecklistText(payload.taskName, NL, TAB);
  
  // Format siblings list
  const siblingsBlock = payload.siblingTasks.length > 0 
    ? payload.siblingTasks.map(t => `${TAB}• ${encodeURIComponent(t)}`).join(NL)
    : `${TAB}• ${encodeURIComponent(payload.taskName)}`;

  const body = [
    `Hola ${encodeURIComponent(payload.recipientName)},`,
    ``,
    `Se te ha asignado la elaboración del plano ${encodeURIComponent(payload.taskName)} para el proyecto ${encodeURIComponent(projId)} - ${encodeURIComponent(projAddr)}.`,
    ``,
    checklistBlock,
    ``,
    `${encodeURIComponent('────────────────────────────────────────────')}`,
    `${encodeURIComponent('PLANOS ASIGNADOS EN ESTA CATEGORÍA (')}${encodeURIComponent(payload.categoryName)}):`,
    siblingsBlock,
    `${encodeURIComponent('────────────────────────────────────────────')}`,
    ``,
    `Comentarios adicionales: ___________________`,
    ``,
    `Favor de confirmar de recibido y procesar según este estándar.`,
    ``,
    `${encodeURIComponent('— Equipo ARCHCOS Studio Group')}`,
  ].join(NL);

  return `mailto:${payload.recipientEmail}?subject=${subject}&body=${body}`;
}

// Wrapper — opens the mailto link and returns immediately (always succeeds)
export async function sendAssignmentEmail(payload: {
  recipientName:  string;
  recipientEmail: string;
  taskName:       string;
  categoryName:   string;
  siblingTasks:   string[];
  projectLabel:   string;
}): Promise<boolean> {
  const link = buildArchcosMailto(payload);
  window.location.href = link;
  // Small delay for UI feedback
  await new Promise(r => setTimeout(r, 600));
  return true;
}
