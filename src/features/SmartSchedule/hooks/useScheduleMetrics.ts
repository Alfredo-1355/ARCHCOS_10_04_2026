import { useMemo } from 'react';
import { Category, TaskRow, TimeColumn } from '../../../types/dashboard';
import { addDays } from '../utils/helpers';

export const useScheduleMetrics = (
    categories: Category[], // ATENCIÓN: Deben ser las categorías proyectadas (con task.weeks generado)
    visibleColumns: TimeColumn[],
    timeScale: 'weeks' | 'days',
    startDate: Date
) => {
    // 1. Extraemos tareas en un arreglo plano para cómputos globales
    const allTasks = useMemo(() => categories.flatMap(c => c.tasks), [categories]);

    // 2. Cálculo posicional de "Hoy" con respecto a la matriz dinámica
    const todayWi = useMemo(() => {
        const t = new Date();
        const inc = timeScale === 'weeks' ? 7 : 1;
        for (let i = 0; i < visibleColumns.length; i++) {
          const s = addDays(startDate, visibleColumns[i].offset);
          const e = addDays(startDate, visibleColumns[i].offset + inc);
          if (t >= s && t < e) return i;
        }
        return -1; // "Hoy" no está visible en el viewport
    }, [visibleColumns, startDate, timeScale]);

    // 3. Mapa de calor de carga de trabajo por columna visible
    const wkLoad = useMemo(() => {
        return visibleColumns.map((_, wi) => allTasks.filter(t => t.weeks && t.weeks[wi]).length);
    }, [allTasks, visibleColumns]);

    // 4. Motor de Curva S (Planeado vs Real)
    const sCurve = useMemo(() => {
        let planned: number[] = [];
        let actual: number[] = [];
        const wc = visibleColumns.length;
        if (!allTasks.length || wc === 0) return { planned, actual };

        let accumPlan = 0;
        
        // Fase 1: Calcular la contribución esperada por columna de tiempo
        for (let wi = 0; wi < wc; wi++) {
            let wkContribution = 0;
            allTasks.forEach(t => {
                // Approximate span to divide 100% effort across active columns
                const span = t.weeks?.filter(Boolean).length || 1; 
                // Usamos el arreglo bool[] generado por la proyección
                if (t.weeks?.[wi]) wkContribution += 1 / span;
            });
            accumPlan += (wkContribution / allTasks.length) * 100;
            planned.push(Math.min(100, accumPlan));
        }

        // Fase 2: Proyectar el performance "Real" actual contra lo que debió ser "Hoy"
        const currentActualTotal = allTasks.reduce((a, t) => a + (t.progress || 0), 0) / allTasks.length;
        for (let wi = 0; wi <= todayWi && wi < wc; wi++) {
            actual.push(Math.min(100, planned[wi] * (currentActualTotal / (planned[todayWi] || 1)) ));
        }

        return { planned, actual };
    }, [allTasks, visibleColumns.length, todayWi]);

    // 5. Motor de SLA/Eficiencia para los gauges del Dashboard
    const efficiencyScore = useMemo(() => {
        if (!allTasks.length) return 100;
        const avgProg = allTasks.reduce((a, t) => a + t.progress, 0) / allTasks.length;
        const expected = todayWi >= 0 && sCurve.planned[todayWi] ? sCurve.planned[todayWi] : 0;
        
        if (expected === 0) return 100; // No se esperaba inicio aún
        return Math.round(Math.min(100, (avgProg / expected) * 100)); // Relación Progreso/Expectativa
    }, [allTasks, todayWi, sCurve.planned]);

    // 6. Resumen Ejecutivo Rápido
    const executionMetrics = useMemo(() => ({
        estCompletion: visibleColumns.length,
        totalTasks: allTasks.length,
        criticalCount: allTasks.filter(t => t.type === 'critical').length,
        refinements: allTasks.filter(t => t.type === 'refinement').length,
        reviews: allTasks.filter(t => t.type === 'review').length,
        globalProgress: Math.round(allTasks.length ? allTasks.reduce((a, t) => a + t.progress, 0) / allTasks.length : 0)
    }), [allTasks, visibleColumns.length]);

    return {
        allTasks,
        todayWi,
        wkLoad,
        sCurve,
        efficiencyScore,
        executionMetrics
    };
};

