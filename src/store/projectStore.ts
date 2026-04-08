import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectData {
  id: string;
  projectName: string;
  location: string;
  clientName: string;
  estimatedDeliveryDate: string;
  type: string;
  status: string;
  timestamp: number;
  favoriteColor?: string;
  residentialProgram?: any;
  commercialForm?: any;
  architectural_program?: any;
  smartSchedule?: any;
}

interface ProjectStore {
  currentProject: ProjectData;
  updateProject: (data: Partial<ProjectData>) => void;
  resetProject: () => void;
  loadProject: (project: ProjectData) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProject: {
        id: '',
        projectName: '',
        location: '',
        clientName: '',
        estimatedDeliveryDate: '',
        type: 'Residencial',
        status: 'Boceto',
        timestamp: Date.now(),
        favoriteColor: '#E5E4E2',
        architectural_program: null,
      },
      updateProject: (data) => 
        set((state) => ({ 
          currentProject: { ...state.currentProject, ...data, timestamp: Date.now() } 
        })),
      loadProject: (project) =>
        set({ currentProject: { ...project, timestamp: Date.now() } }),
      resetProject: () => 
        set({ 
          currentProject: { 
            id: '', 
            projectName: '', 
            location: '', 
            clientName: '', 
            estimatedDeliveryDate: '', 
            type: 'Residencial', 
            status: 'Boceto', 
            timestamp: Date.now() 
          } 
        }),
    }),
    {
      name: 'archcos-project-storage',
    }
  )
);
