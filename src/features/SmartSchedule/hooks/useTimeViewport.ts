import { useState, useMemo, useCallback } from 'react';
import { Category, TimeColumn } from '../../../../types/dashboard';

export const useTimeViewport = (initialScale: 'weeks' | 'days' = 'weeks') => {
  const [timeScale, setTimeScale] = useState<'weeks' | 'days'>(initialScale);
  const [viewportStartOffset, setViewportStartOffset] = useState(0);

  const toggleScale = useCallback(() => {
    setTimeScale(prev => prev === 'weeks' ? 'days' : 'weeks');
  }, []);

  const shiftTime = useCallback((direction: -1 | 1) => {
      // Independentemente de la escala, empujamos el start offset 7 días lógicos 
      // para asegurar una navegación consistente sin requerir excesivos clics en vista de días.
      const amount = 7; 
      setViewportStartOffset(prev => Math.max(0, prev + (direction * amount)));
  }, []);

  // MATRIZ VISUAL: Exclusivamente derivada, generada a demanda.
  const visibleColumns = useMemo<TimeColumn[]>(() => {
      // Carga 16 semanas (Macro) o limite visual estricto de 30 días (Micro)
      const count = timeScale === 'weeks' ? 16 : 30; 
      
      return Array.from({ length: count }, (_, i) => {
          const step = timeScale === 'weeks' ? 5 : 1;
          const absoluteOffset = viewportStartOffset + (i * step);
          return {
              id: `col-${absoluteOffset}`,
              label: timeScale === 'weeks' ? `S${Math.floor(absoluteOffset / 5) + 1}` : (absoluteOffset + 1).toString().padStart(2, '0'),
              offset: absoluteOffset
          };
      });
  }, [viewportStartOffset, timeScale]);

  // MAGIA SSOT: Transforma los días invariables de la DB en la cuadrícula visual requerida
  // Agresivamente memoizado si visibleColumns no cambia.
  const projectCategories = useCallback((categories: Category[]): Category[] => {
      return categories.map(c => ({
        ...c,
        tasks: c.tasks.map(t => {
            const start = t.startDay ?? 0;
        const dur = t.duration ?? (timeScale === 'weeks' ? 5 : 1);
        const end = start + dur;
        const inc = timeScale === 'weeks' ? 5 : 1;

        const projectedWeeks = visibleColumns.map(col => {
            const colStart = col.offset;
            const colEnd = col.offset + inc;
            return (start < colEnd) && (end > colStart); // Retorna true si hay un solapamiento exacto
        });

            return {
                ...t,
                weeks: projectedWeeks
            };
        })
      }));
  }, [visibleColumns, timeScale]);

  return {
      timeScale,
      toggleScale,
      viewportStartOffset,
      shiftTime,
      visibleColumns,
      projectCategories
  };
};
