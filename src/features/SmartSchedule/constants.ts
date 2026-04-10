// src/features/SmartSchedule/constants.ts

// Scale Constants
export const DWC_W = 16;
export const DWC_D = 30;

// Official ARCHCOS Categories
export const OFFICIAL_CATEGORIES = [
  'Site & Landscape',
  'Arquitectónicos',
  'Estructurales',
  'Interiores',
  'MEP',
  'Civil',
  'Revisión Cliente & CA',
  'Permitting & Legal'
];

// Configuration & Mappings
export const PHASE_CONFIG = [
  { id: "sd", short: "SD", label: "Schematic Design", color: "#60A5FA", bg: "#EFF6FF", range: [0, 3] }, // Weeks 1-4
  { id: "dd", short: "DD", label: "Design Development", color: "#FACC15", bg: "#FEFCE8", range: [4, 7] }, // Weeks 5-8
  { id: "cd", short: "CD", label: "Construction Docs", color: "#34D399", bg: "#ECFDF5", range: [8, 11] }, // Weeks 9-12
  { id: "ca", short: "CA", label: "Contract Admin", color: "#A78BFA", bg: "#F5F3FF", range: [12, 15] }, // Weeks 13-16
];

export const STATUS_CFG: Record<string, { label: string; color: string; icon: string }> = {
  not_started: { label: 'Sin Iniciar', color: '#94A3B8', icon: 'Circle' },
  in_progress: { label: 'En Proceso', color: '#3B82F6', icon: 'Clock' },
  review: { label: 'En Revisión', color: '#F59E0B', icon: 'Eye' },
  completed: { label: 'Completado', color: '#10B981', icon: 'CheckCircle2' },
  blocked: { label: 'Bloqueado', color: '#EF4444', icon: 'AlertTriangle' }
};

export const STATUS_ORDER = ['not_started', 'in_progress', 'review', 'completed', 'blocked'];

export const BAR_TYPES = {
  critical: { label: 'Crítico (Ruta Crítica)', color: '#0F172A', icon: 'Zap' },
  refinement: { label: 'Refinamiento / Detalle', color: '#64748B', icon: 'LayoutGrid' },
  review: { label: 'Revisión Cliente', color: '#F59E0B', icon: 'Info' },
  milestone: { label: 'Milestone', color: '#F43F5E', icon: 'CheckCircle2' }
};

export const ICON_MAP: Record<string, string> = {
  Building2: 'Building2',
  Layers: 'Layers',
  Wrench: 'Wrench',
  MapPin: 'MapPin',
  CheckCircle2: 'CheckCircle2',
  Settings: 'Settings',
  LayoutGrid: 'LayoutGrid',
  Info: 'Info',
  Zap: 'Zap'
};

export const DEFAULT_ICON = 'LayoutGrid';

// Team Members (Official Technical Team ARCHCOS)
export const TEAM_MEMBERS = [
  { id: 'aldo_dominguez', name: 'Aldo Dominguez', avatar: 'AD', email: 'adominguez@archcos.com', color: '#A78BFA' },
  { id: 'arianna_calvo', name: 'Arianna Calvo', avatar: 'AC', email: 'acalvo@archcos.com', color: '#22D3EE' },
  { id: 'alonso_avila', name: 'Alonso Avila', avatar: 'AA', email: 'aavila@archcos.com', color: '#3B82F6' },
  { id: 'alejandra_cruz', name: 'Alejandra Cruz', avatar: 'AZ', email: 'acruz@archcos.com', color: '#D946EF' },
  { id: 'joanna_valle', name: 'Joanna Valle', avatar: 'JV', email: 'jvalle@archcos.com', color: '#F59E0B' },
  { id: 'adriana_sarro', name: 'Adriana Sarro', avatar: 'AS', email: 'adrianasarro@archcos.com', color: '#10B981' },
  { id: 'paola_macias', name: 'Paola Macias', avatar: 'PM', email: 'pmacias@archcos.com', color: '#EC4899' },
  { id: 'irving_flores', name: 'Irving Flores', avatar: 'IF', email: 'iflores@archcos.com', color: '#6366F1' },
  { id: 'alfredo_reyes', name: 'Alfredo Reyes', avatar: 'AR', email: 'areyes@archcos.com', color: '#EF4444' },
  { id: 'ruben_gaytan', name: 'Ruben Gaytan', avatar: 'RG', email: 'rgaytan@archcos.com', color: '#14B8A6' }
];

// --- LEGACY COMPAT: alias used by MetricsPanel ---
export const PHASES = PHASE_CONFIG;

/**
 * Returns the current phase object based on the current week index and total weeks.
 */
export function getPhase(currentWi: number, totalWeeks: number) {
  const progress = totalWeeks > 0 ? currentWi / totalWeeks : 0;
  // Map progress 0-1 to the 4 PHASE_CONFIG entries
  const idx = Math.min(PHASE_CONFIG.length - 1, Math.floor(progress * PHASE_CONFIG.length));
  return PHASE_CONFIG[idx];
}

