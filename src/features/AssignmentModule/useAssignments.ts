// src/features/AssignmentModule/useAssignments.ts

import { useState, useContext, useEffect } from 'react';
import { AuthContext, ProjectContext } from '../../contexts/DashboardContext';
import { USERS, PROJECT_AREAS } from '../../constants/dashboard';

export const useAssignments = () => {
  const { user } = useContext(AuthContext);
  const { projects, updateProject, activeProjectId } = useContext(ProjectContext);

  const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId || (projects[0] && projects[0].id) || '');
  const [isSaving, setIsSaving] = useState(false);
  const [demoRole, setDemoRole] = useState(user?.role || 'ADMIN');

  // Sync with global activeProjectId if it changes
  useEffect(() => {
    if (activeProjectId) setSelectedProjectId(activeProjectId);
  }, [activeProjectId]);

  const currentProject = projects.find((p: any) => p.id === selectedProjectId);
  const assignments = currentProject?.assignments || {};
  const progressMap = currentProject?.progressMap || {};

  const toggleAssign = (areaId: string, userId: string) => {
    if (demoRole !== 'ADMIN') return;
    const currentAreaList = Array.isArray(assignments[areaId]) ? assignments[areaId] : (assignments[areaId] ? [assignments[areaId]] : []);
    const newList = currentAreaList.includes(userId)
      ? currentAreaList.filter((id: string) => id !== userId)
      : [...currentAreaList, userId];
    const newAssignments = { ...assignments, [areaId]: newList };
    updateProject({ ...currentProject, assignments: newAssignments });
  };

  const updateProgress = (areaId: string, value: string) => {
    if (demoRole !== 'ADMIN') return;
    const newProgressMap = { ...progressMap, [areaId]: parseInt(value) };
    const values: number[] = Object.values(newProgressMap);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    let newStage = currentProject.stage;
    if (avg === 100) {
      newStage = 'REVISIÓN';
    } else if (currentProject.stage === 'REVISIÓN' && avg < 100) {
      newStage = 'DISEÑO';
    }
    updateProject({ ...currentProject, progressMap: newProgressMap, progress: avg, stage: newStage });
  };

  const saveAll = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return {
    user,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isSaving,
    demoRole,
    setDemoRole,
    assignments,
    progressMap,
    currentProject,
    toggleAssign,
    updateProgress,
    saveAll,
    USERS,
    PROJECT_AREAS,
  };
};
