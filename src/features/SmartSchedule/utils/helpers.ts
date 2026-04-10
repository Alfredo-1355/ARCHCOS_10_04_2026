// src/features/SmartSchedule/utils/helpers.ts
import React from 'react';
import { 
  Building2, Wrench, Layers, Image, MapPin, Eye, Briefcase, Settings,
  Calendar, Construction, Clock, RefreshCw, CheckCircle2, AlertTriangle
} from "lucide-react";
import { 
  TaskRow, TimeColumn, ProjectSchedule 
} from '../../../types/dashboard';

// --- ICON SERIALIZATION MAP ---
// This map connects string IDs stored in Firebase to actual Lucide components
export const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Building2, Wrench, Layers, Image, MapPin, Eye, Briefcase, Settings,
  Calendar, Construction, Clock, RefreshCw, CheckCircle2, AlertTriangle
};

export const DEFAULT_ICON = Settings;

// --- UTILITIES ---
export const uid = () => Math.random().toString(36).slice(2, 9);

export const addDays = (d: Date | string, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

// --- HEATMAP ---
export const getHeatmapColor = (load: number) => {
  if (load <= 2) return "bg-blue-50/30 text-blue-400"; // Normal
  if (load <= 5) return "bg-amber-50/50 text-amber-500 border-amber-200"; // Alta Carga
  return "bg-red-50/50 text-red-500 border-red-200 animate-pulse"; // Sobrecarga
};

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("es-MX", { month: "short", day: "numeric" });

export const fmtTime = (s: number) =>
  `${Math.floor(s / 3600).toString().padStart(2, "0")}:${Math.floor((s % 3600) / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

export const buildWeeks = (n: number, scale: 'weeks' | 'days' = 'weeks'): TimeColumn[] =>
  Array.from({ length: n }, (_, i) => ({
    id: uid(),
    label: scale === 'weeks' ? `S${i + 1}` : (i + 1).toString().padStart(2, '0'),
    offset: scale === 'weeks' ? i * 7 : i,
  }));

export const relabel = (ws: TimeColumn[], scale: 'weeks' | 'days' = 'weeks'): TimeColumn[] =>
  ws.map((w, i) => ({ ...w, label: scale === 'weeks' ? `S${i + 1}` : (i + 1).toString().padStart(2, '0') }));

/**
 * Proyecta el modelo de datos SSOT (offsets de días) a una vista visual de celdas.
 * Permite que ambas vistas (semanas/días) consuman la misma información.
 */
export function resolveGrid(
  task: TaskRow, 
  timeColumns: TimeColumn[], 
  scale: 'weeks' | 'days',
  isBaseline: boolean = false
): boolean[] {
  const start = isBaseline ? task.baselineStartDay : task.startDay;
  const dur = isBaseline ? task.baselineDuration : task.duration;

  // Migration/Safety Bypass: Si los datos SSOT no existen, intentamos el fallback legacy
  // o generamos un array por defecto adecuado a las columnas actuales.
  if (start === undefined || dur === undefined) {
      const legacyArr = isBaseline ? (task.baselineWeeks || []) : (task.weeks || []);
      if (legacyArr.length === timeColumns.length) return legacyArr;
      
      // Fallback absoluto: Array de falsos del tamaño correcto
      return Array(timeColumns.length).fill(false);
  }

  const inc = scale === 'weeks' ? 7 : 1;
  const end = start + dur;

  return timeColumns.map(col => {
    const colStart = col.offset;
    const colEnd = col.offset + inc;
    return (start < colEnd) && (end > colStart);
  });
}

// --- SERIALIZATION ---
export function sanitizeSchedule(schedule: ProjectSchedule): any {
  return {
    ...schedule,
    categories: schedule.categories.map(cat => {
      const iconId = Object.entries(ICON_COMPONENTS).find(([, comp]) => comp === cat.icon)?.[0] ?? 'Settings';
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
          
          // Persist the New SSOT Model
          startDay: task.startDay ?? null,
          duration: task.duration ?? null,
          baselineStartDay: task.baselineStartDay ?? null,
          baselineDuration: task.baselineDuration ?? null,

          progress: Number(task.progress ?? 0),
          assigneeId: task.assigneeId ?? null,
          assigneeName: task.assigneeName ?? null,
          updatedAt: task.updatedAt ?? null,
          updatedBy: task.updatedBy ?? null,
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
      icon: ICON_COMPONENTS[cat.iconId as string] ?? DEFAULT_ICON,
    })),
  };
}

// --- EMAIL CHECKLISTS ---
const CHECKLISTS: Record<string, string> = {
  '1st & 2nd Floor Plan': `1. Formato General y Cuadro de Datos
[ ] Nombre del Proyecto y Dirección completa.
[ ] Título del Plano y Nomenclatura (ej. A-07).
[ ] Escala gráfica o numérica correcta.

2. Sistema de Dimensionamiento
[ ] Cotas Generales (Perímetro total).
[ ] Cotas Interiores (Ejes, muros y aperturas).
[ ] Líneas de Corte/Sección bien referenciadas.

3. Representación Arquitectónica
[ ] Muros, Vanos y Abatimientos correctos.
[ ] Circulaciones Verticales (Escaleras con flecha).
[ ] Equipamiento Fijo y Mobiliario Sugerido.

4. Etiquetas y Especificaciones Técnicas
[ ] Nomenclatura de Espacios y Alturas de Plafón.
[ ] Niveles (FFL) y Dobles Alturas marcadas.
[ ] Muros Cortafuego especificados (ej. Garage).

5. Tablas de Resumen (Áreas)
[ ] Área Habitable desglosada y Total Living Space.
[ ] Áreas No Habitables (Porches, patios, garajes).
[ ] Huella del Edificio (Footprint) calculada.`,

  'Existing / Proposed Site Plan': `1. Información del Lote
[ ] Límites de propiedad y medidas perimetrales.
[ ] Número de lote y referencia catastral.
[ ] Orientación Norte y escala gráfica.

2. Elementos Existentes
[ ] Construcciones existentes delimitadas.
[ ] Árboles, cercas y elementos a conservar.
[ ] Servicios públicos visibles (postes, hidrantes).

3. Propuesta
[ ] Huella de construcción propuesta.
[ ] Accesos vehiculares y peatonales.
[ ] Retiros obligatorios (frente, fondo, laterales).

4. Cotas y Referencias
[ ] Cotas de linderos completas.
[ ] Curvas de nivel o pendientes indicadas.
[ ] Referencias a planos de construcción relacionados.`,

  'Proposed Roof Plan': `1. Geometría de la Cubierta
[ ] Forma y tipo de cubierta (plana, inclinada, mixta).
[ ] Pendientes indicadas con porcentaje y dirección.
[ ] Cumbrera, limatones y limahoyas señalados.

2. Elementos sobre Cubierta
[ ] Chimeneas, ductos y penetraciones.
[ ] Tragaluces y domos ubicados.
[ ] Equipos mecánicos (A/C, calentadores) indicados.

3. Drenaje
[ ] Bajantes pluviales ubicados.
[ ] Sentido del drenaje con flechas.
[ ] Canaletas perimetrales señaladas.

4. Cotas y Notas
[ ] Dimensiones generales de la cubierta.
[ ] Material de cubierta especificado.
[ ] Referencias a detalles constructivos.`,

  'Proposed Cross Sections': `1. Identificación
[ ] Referencia cruzada con planta (ej. A-A', B-B').
[ ] Escala indicada correctamente.
[ ] Nombre de espacios cortados etiquetados.

2. Elementos Estructurales
[ ] Cimentación visible en corte.
[ ] Muros, columnas y trabes seccionados.
[ ] Losas y entrepiso con espesores.

3. Alturas y Niveles
[ ] Altura de piso a plafón por nivel.
[ ] Nivel de terreno natural y desplante.
[ ] Altura total de edificación.

4. Acabados y Especificaciones
[ ] Materiales de muros y losas indicados.
[ ] Impermeabilización y aislamientos señalados.
[ ] Detalles referenciados donde aplique.`,

  'Exterior Renders': `1. Vistas Requeridas
[ ] Vista frontal (fachada principal).
[ ] Vista posterior y laterales.
[ ] Vista aérea o perspectiva general.

2. Calidad Visual
[ ] Materiales y texturas representados fielmente.
[ ] Iluminación natural coherente con orientación.
[ ] Entorno inmediato contextualizado.

3. Elementos de Escala
[ ] Vegetación y arbolado.
[ ] Figura humana para referencia de escala.
[ ] Vehículos en accesos si aplica.

4. Aprobación
[ ] Revisado contra planos de fachada aprobados.
[ ] Sin diferencias con planta y cortes.`,

  'DEFAULT': `1. Formato General
[ ] Título, escala y nomenclatura correctos.
[ ] Nombre del proyecto y número de plano.

2. Contenido Técnico
[ ] Dimensiones y cotas completas.
[ ] Notas y especificaciones incluidas.

3. Revisión Final
[ ] Revisado contra planos relacionados.
[ ] Sin conflictos con otras disciplinas.`
};

export function generarCuerpoCorreo(integrante: any, taskName: string, categoryName: string, projectLabel: string, assignorName: string): string {
    const checklist = CHECKLISTS[taskName] || CHECKLISTS['DEFAULT'];

    return `Hola ${integrante.name},

Se te ha asignado la elaboración del plano ${taskName} para el proyecto ${projectLabel}.

────────────────────────────────────────────
📋 CHECKLIST DE REVISIÓN OBLIGATORIA: ${taskName.toUpperCase()}
────────────────────────────────────────────

${checklist}

────────────────────────────────────────────
PLANOS ASIGNADOS EN ESTA CATEGORÍA (${categoryName}):
- ${taskName}
────────────────────────────────────────────

Comentarios adicionales: ___________________

Favor de confirmar de recibido y procesar según este estándar.

— Equipo ARCHCOS Studio Group`;
}

export function sendAssignmentMailto(payload: {
    recipientName:  string;
    recipientEmail: string;
    taskName:       string;
    categoryName:   string;
    projectLabel:   string;
    assignorName:   string;
}): void {
    const asunto = encodeURIComponent(`ASIGNACIÓN ARCHCOS: ${payload.projectLabel} - ${payload.taskName}`);
    const cuerpo = encodeURIComponent(generarCuerpoCorreo(
        { name: payload.recipientName },
        payload.taskName,
        payload.categoryName,
        payload.projectLabel,
        payload.assignorName
    ));

    window.location.href = `mailto:${payload.recipientEmail}?subject=${asunto}&body=${cuerpo}`;
}
