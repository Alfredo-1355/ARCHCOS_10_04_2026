/**
 * @file users.ts
 * @description Datos de usuarios, proyectos iniciales, áreas de proyecto y catálogos
 * estáticos del dashboard de ARCHCOS. Extraídos de AdminDashboard.tsx para
 * mantener los datos separados de la lógica de UI.
 */

import type { User, Project, ProjectArea } from '../types/project';

// ─── Equipo ARCHCOS ───────────────────────────────────────────────────────────

export const USERS: User[] = [
  { id: 'u1',  email: 'adominguez@archcos.com',   password: 'ARCHCOS2026', name: 'Aldo Dominguez',   role: 'ADMIN',       initials: 'AD', color: '#8b5cf6' },
  { id: 'u2',  email: 'acalvo@archcos.com',        password: 'ARCHCOS2026', name: 'Arianna Calvo',    role: 'COLABORADOR', initials: 'AC', color: '#06b6d4' },
  { id: 'u3',  email: 'aavila@archcos.com',        password: 'ARCHCOS2026', name: 'Alonso Avila',     role: 'COLABORADOR', initials: 'AA', color: '#3b82f6' },
  { id: 'u4',  email: 'acruz@archcos.com',         password: 'ARCHCOS2026', name: 'Alejandra Cruz',   role: 'COLABORADOR', initials: 'AZ', color: '#d946ef' },
  { id: 'u5',  email: 'jvalle@archcos.com',        password: 'ARCHCOS2026', name: 'Joanna Valle',     role: 'COLABORADOR', initials: 'JV', color: '#f59e0b' },
  { id: 'u6',  email: 'adrianasarro@archcos.com',  password: 'ARCHCOS2026', name: 'Adriana Sarro',    role: 'ADMIN',       initials: 'AS', color: '#10b981' },
  { id: 'u7',  email: 'pmacias@archcos.com',       password: 'ARCHCOS2026', name: 'Paola Macias',     role: 'COLABORADOR', initials: 'PM', color: '#ec4899' },
  { id: 'u8',  email: 'iflores@archcos.com',       password: 'ARCHCOS2026', name: 'Irving Flores',    role: 'COLABORADOR', initials: 'IF', color: '#6366f1' },
  { id: 'u9',  email: 'areyes@archcos.com',        password: 'ARCHCOS2026', name: 'Alfredo Reyes',    role: 'ADMIN',       initials: 'AR', color: '#f43f5e' },
  { id: 'u10', email: 'rgaytan@archcos.com',       password: 'ARCHCOS2026', name: 'Ruben Gaytan',     role: 'ADMIN',       initials: 'RG', color: '#14b8a6' },
];

// ─── Proyectos de Muestra (Seed) ─────────────────────────────────────────────

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-1001',
    address: 'The Highland Residence',
    clientName: 'Fam. Thompson',
    type: 'Residencial',
    subtype: 'Custom Homes',
    procedure: 'Obra Nueva',
    stage: 'DISEÑO',
    creator: 'A. Reyes',
    deliveryDate: '2026-05-10',
    desc: 'Diseño interior y exterior de villa minimalista',
    badgeStyle: 'bg-arch-brand-sage/20 text-arch-text',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
    assignments: { area_grafico: ['u6', 'u5'], area_arquitectonico: ['u2', 'u1'] },
    progressMap: {
      area_investigacion: 100, area_concepto: 80, area_arquitectonico: 40,
      area_estructural: 20, area_electrico: 0, area_hidro: 0, area_grafico: 60,
    },
    progress: 40,
    status: 'Finalizando planos arquitectónicos base. Próximo inicio de Ingenierías (MEP).',
    deliverables: [
      { name: 'Concepto_V1.pdf', type: 'PDF' },
      { name: 'Planta_Arquitectonica.dwg', type: 'DWG' },
    ],
  },
  {
    id: 'PRJ-1002',
    address: 'Boutique M.',
    clientName: 'Marcus Fashion Group',
    type: 'Comercial',
    subtype: 'Retail',
    procedure: 'Remodelación',
    stage: 'EN OBRA',
    creator: 'R. Gaytan',
    deliveryDate: '2026-08-15',
    desc: 'Restauración completa de espacio comercial.',
    badgeStyle: 'bg-arch-brand-sky/20 text-arch-text',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
    assignments: {},
    progressMap: {
      area_investigacion: 100, area_concepto: 100, area_arquitectonico: 100,
      area_estructural: 90, area_electrico: 80, area_hidro: 85, area_grafico: 90,
    },
    progress: 85,
    status: 'Ejecución de obra en fase de acabados finos y luminarias.',
    deliverables: [{ name: 'Plano_Instalaciones.pdf', type: 'PDF' }],
  },
  {
    id: 'PRJ-1003',
    address: 'Studio 4A',
    clientName: 'Creativa S.A.',
    type: 'Oficinas corporativas',
    subtype: 'Tenant Build-out',
    procedure: 'Mantenimiento Mayor',
    stage: 'REVISIÓN',
    creator: 'A. Calvo',
    deliveryDate: '2026-04-20',
    desc: 'Adecuación de planta libre.',
    badgeStyle: 'bg-arch-sand text-arch-text opacity-70',
    imageUrl: 'https://images.unsplash.com/photo-1497215848143-6d53526dc0bb?w=400&q=80',
    assignments: {},
    progressMap: {
      area_investigacion: 100, area_concepto: 100, area_arquitectonico: 60,
      area_estructural: 40, area_electrico: 20, area_hidro: 20, area_grafico: 40,
    },
    progress: 65,
    status: 'En revisión municipal de permisos de ocupación.',
    deliverables: [{ name: 'Memoria_Calculo.pdf', type: 'PDF' }],
  },
];

// ─── Áreas de Trabajo ────────────────────────────────────────────────────────

export const PROJECT_AREAS: ProjectArea[] = [
  { id: 'area_investigacion', title: 'Investigación Preliminar & Información' },
  { id: 'area_concepto',      title: 'Diseño & Concept' },
  { id: 'area_arquitectonico',title: 'Proyecto Arquitectónico' },
  { id: 'area_estructural',   title: 'Estructural' },
  { id: 'area_electrico',     title: 'Instalación Eléctrica' },
  { id: 'area_hidro',         title: 'Instalación Hidrosanitaria' },
  { id: 'area_grafico',       title: 'Representación Gráfica (Renders)' },
];

// ─── Catálogos ───────────────────────────────────────────────────────────────

export const EMOJI_MAP: Record<string, string> = {
  'Residencial':              '⌂',
  'Comercial':                '◻',
  'Uso Mixto':                '⬒',
  'Cambio de uso':            '◬',
  'Obra Nueva (Permiso)':     '◱',
  'Obra Nueva':               '◱',
  'Remodelación / Adecuación':'◩',
  'Remodelación':             '◩',
  'Restauración Histórica':   '◪',
  'Mantenimiento Mayor':      '◧',
  'Permiso':                  '▧',
  'Aprobación':               '▣',
  'Otro':                     '○',
};

export const SUBTYPE_OPTIONS: Record<string, string[]> = {
  'Residencial':    ['Vivienda Unifamiliar', 'Multifamiliar / Depas', 'Vivienda de Interés Social', 'Residencias de Lujo'],
  'Comercial':      ['Retail / Locales', 'Restaurantes / Cafés', 'Hospitalidad / Hoteles', 'Clínicas / Salud'],
  'Uso Mixto':      ['Residencial + Comercial', 'Oficinas + Comercial', 'Desarrollo Urbano', 'Reutilización Industrial'],
  'Cambio de uso':  ['De Comercial a Residencial', 'De Oficina a Vivienda', 'De Bodega a Loft', 'De Terreno a Estacionamiento'],
};
