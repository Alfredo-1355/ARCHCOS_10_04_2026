/**
 * @file architectural.ts
 * @description Tipos y datos iniciales para el Programa Arquitectónico Residencial.
 * Extraídos de App.tsx para mantener un único punto de verdad de los tipos.
 */

// ─── Tipos Primitivos ───────────────────────────────────────────────────────

/** Fase activa en la navegación de la app (1–5). */
export type AppPhase = 1 | 2 | 3 | 4 | 5;

/** Idioma activo de la interfaz. */
export type Language = 'en' | 'es';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface Inhabitant {
  ageRange: 'child' | 'teen' | 'adult' | 'elder';
  occupation: string;
}

export interface ArchitecturalProgram {
  // ── Fase 1: El Alma del Hogar ──
  inhabitantsCount: number;
  inhabitants: Inhabitant[];
  pets: string[];
  hobbies: string[];
  frequentGuests: boolean;
  accessibilityNeeds: boolean;
  style: string;
  favoriteColor: string;
  forbiddenColors: string[];
  favoriteRoom: string;

  // ── Fase 2: El Partido Arquitectónico ──
  levels: number;
  ceilingHeightMain: string;
  customCeilingHeightMain?: string;
  ceilingHeightUpper: string;
  customCeilingHeightUpper?: string;
  doubleHeight: boolean;
  basement: string;
  footprint: string;
  roofStyle: string;
  floorPlanConcept: string;

  // ── Fase 3: Distribución por Niveles ──
  groundFloorSpaces: string[];
  groundFloorDetails: Record<string, unknown>;
  upperFloorSpaces: string[];
  upperFloorDetails: Record<string, unknown>;
  spaceDimensions: Record<
    string,
    { l: number; w: number; isCustom: boolean; isCorrected: boolean; note?: string; field?: 'l' | 'w' }
  >;
  spaceQuantities: Record<string, number>;
  /** Presets de material por zona (controla todos los espacios de la zona, salvo override individual). */
  zoneMaterials: Record<string, { floor: string; wall: string; ceiling: string }>;
  /** Espacios que han sido personalizados individualmente desde el preset de zona. */
  customizedSpaces: string[];

  // ── Fase 4: Acabados y Materialidad ──
  finishes: {
    floors: string;
    walls: string;
    roof: string;
    mainMaterial: string;
    baseMaterial: string;
    accentMaterial: string;
    curatedPalette: string;
  };
}

// ─── Estado Inicial ─────────────────────────────────────────────────────────

export const INITIAL_PROGRAM: ArchitecturalProgram = {
  inhabitantsCount: 1,
  inhabitants: [{ ageRange: 'adult', occupation: '' }],
  pets: [],
  hobbies: [],
  frequentGuests: false,
  accessibilityNeeds: false,
  style: 'modern',
  favoriteColor: '#E5E4E2',
  forbiddenColors: [],
  favoriteRoom: 'living_room',
  levels: 1,
  ceilingHeightMain: 'standard_9ft',
  customCeilingHeightMain: '',
  ceilingHeightUpper: 'standard_8ft',
  customCeilingHeightUpper: '',
  doubleHeight: false,
  basement: 'none',
  footprint: 'rectangular',
  roofStyle: 'pitched',
  floorPlanConcept: 'open',
  groundFloorSpaces: [],
  groundFloorDetails: {},
  upperFloorSpaces: [],
  upperFloorDetails: {},
  spaceDimensions: {},
  spaceQuantities: {},
  zoneMaterials: {
    SOCIAL:     { floor: 'hardwood',        wall: 'smooth_paint', ceiling: 'smooth_paint' },
    SERVICIOS:  { floor: 'porcelain_tile',   wall: 'ceramic_tile',  ceiling: 'smooth_paint' },
    PRIVADOS:   { floor: 'hardwood',        wall: 'smooth_paint', ceiling: 'smooth_paint' },
    EXTERIORES: { floor: 'exterior_pavers', wall: 'smooth_paint', ceiling: 'open_sky'     },
  },
  customizedSpaces: [],
  finishes: {
    floors: 'wood_laminate',
    walls: 'warm_paint',
    roof: 'shingle',
    mainMaterial: 'stucco',
    baseMaterial: 'none',
    accentMaterial: 'none',
    curatedPalette: 'modern_farmhouse',
  },
};
