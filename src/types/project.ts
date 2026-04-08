/**
 * @file project.ts
 * @description Tipos de datos para Projectos, Usuarios y Áreas de proyecto
 * en el AdminDashboard de ARCHCOS.
 */

// ─── Usuarios ────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'COLABORADOR';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  initials: string;
  color: string;
}

// ─── Entregables ─────────────────────────────────────────────────────────────

export interface Deliverable {
  name: string;
  type: string;
}

// ─── Proyectos ───────────────────────────────────────────────────────────────

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
  imageUrl?: string;
  directoryUrl?: string;
  assignments: Record<string, string[]>;
  progressMap: Record<string, number>;
  progress: number;
  status: string;
  deliverables: Deliverable[];
  createdAt?: string;
  sizeSqft?: string;
  /** Programa arquitectónico embebido (residencial o comercial). */
  architectural_program?: unknown;
  /** Datos del programa comercial. */
  commercialData?: unknown;
}

// ─── Áreas de Proyecto ───────────────────────────────────────────────────────

export interface ProjectArea {
  id: string;
  title: string;
}
