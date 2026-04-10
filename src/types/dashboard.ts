// Types for dashboard components
import React from 'react';

export type UserRole = 'ADMIN' | 'COLABORADOR' | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials?: string;
  color?: string;
}

export interface ProjectDeliverable {
  name: string;
  type: string;
  url?: string;
}

export interface Project {
  id: string;
  address: string;
  clientName: string;
  type: string;
  subtype: string;
  procedure: string;
  stage: string;
  creator: string;
  deliveryDate: string;
  desc: string;
  badgeStyle: string;
  imageUrl: string;
  assignments: Record<string, string[]>;
  progressMap: Record<string, number>;
  progress: number;
  status: string;
  deliverables: ProjectDeliverable[];
  schedule?: any;
  totalArea?: {
    value: number;
    unit: 'sqft' | 'm2';
  };
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
  estimatedCompletion?: string;
  createdAt?: string;
  sqft?: number;
}

export type TaskStatus = "not_started" | "in_progress" | "completed" | "delayed";

export interface TimeColumn {
  id: string;
  label: string;
  offset: number;
  isWeekend?: boolean;
}

export interface TaskRow {
  id: string;
  name: string;
  type: "critical" | "refinement" | "review" | "milestone";
  weeks: boolean[];
  progress: number;
  baselineWeeks?: boolean[];
  assigneeId?: string | null;
  zeroFloat?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: any; // Can be React.ElementType or string ID depending on layer
  tasks: TaskRow[];
  expanded: boolean;
}

export interface ProjectSchedule {
  categories: Category[];
  weeks: TimeColumn[];
  startDate: string;
  statuses: Record<string, TaskStatus>;
  timeScale: "weeks" | "days";
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export interface ProjectContextType {
  projects: Project[];
  addProject: (project: Partial<Project>) => Promise<boolean>;
  updateProject: (project: Project) => Promise<boolean>;
  deleteProject: (id: string) => Promise<void>;
  startEdit: (project: Project) => void;
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
}

export interface LoginPageProps {
  navigate: (path: string) => void;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  navigate: (path: string) => void;
}

export interface AssignmentModuleProps {}

export interface ProjectDirectoryProps {
  navigate: (path: string) => void;
}

export interface NewProjectWizardProps {
  navigate: (path: string) => void;
}

export interface MapPickerProps {}

export interface ProjectDetailedReportProps {
  projectId: string;
}

export interface ClientConsultPageProps {
  navigate: (path: string) => void;
}

