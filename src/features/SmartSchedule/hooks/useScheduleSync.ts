import { useState, useEffect, useRef } from 'react';
import { Project, ProjectSchedule, Category } from '../../../../types/dashboard';
import { sanitizeSchedule, rehydrateSchedule } from '../utils/helpers';

export interface SyncNotification {
    title: string;
    message: string;
    type: 'error' | 'success';
}

export const useScheduleSync = (
    project: Project | null | undefined,
    currentSchedule: ProjectSchedule | null,
    updateProject: (project: Project) => Promise<void>,
    rollbackCategories: (categories: Category[]) => void,
    setNotification: (notif: SyncNotification | null) => void
) => {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const safeBackup = useRef<ProjectSchedule | null>(null);
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoad = useRef(true);

    // Inicializar el backup seguro cuando los datos provienen limpios de la DB
    useEffect(() => {
        if (project?.schedule && isFirstLoad.current) {
             safeBackup.current = sanitizeSchedule(rehydrateSchedule(project.schedule));
             isFirstLoad.current = false;
        }
    }, [project]);

    // Motor de Sincronización: Debounce + Optimistic + Rollback
    useEffect(() => {
        if (!project || !currentSchedule) return;
        
        // Evitamos que intente guardar si el usuario ni siquiera ha interactuado de verdad
        if (isFirstLoad.current) return;

        const sanitizedCurrent = sanitizeSchedule(currentSchedule);
        
        // Skip si no hay cambios reales contra el disco
        if (safeBackup.current && JSON.stringify(sanitizedCurrent) === JSON.stringify(safeBackup.current)) {
            return;
        }

        setSaveStatus('saving');
        
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                // Ejecutamos la mutación optimista hacia Firebase
                await updateProject({ ...project, schedule: sanitizedCurrent });
                
                // Si triunfa, actualizamos el snapshot seguro
                safeBackup.current = sanitizedCurrent; 
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);

            } catch (error) {
                console.error("Critical: Smart Schedule Sync Engine Failed", error);
                
                // Rollback Estratégico (Revert Local State)
                if (safeBackup.current) {
                    rollbackCategories(safeBackup.current.categories);
                }
                
                setSaveStatus('idle');
                setNotification({
                    title: 'Falla Red/DB Detectada',
                    message: 'No se pudo guardar la última acción. Se descartaron los cambios para evitar corrupción de datos.',
                    type: 'error'
                });
            }
        }, 1500); // 1.5s robust debounce

        return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
    }, [currentSchedule, project, updateProject, rollbackCategories, setNotification]);

    return { saveStatus };
};
