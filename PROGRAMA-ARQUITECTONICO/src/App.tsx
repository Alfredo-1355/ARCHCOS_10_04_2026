/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Heart, 
  Palette, 
  Layers, 
  Home, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Dog, 
  Cat, 
  Fish, 
  Bird,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Download,
  FileText,
  ClipboardList,
  Warehouse,
  Landmark,
  Box,
  Tractor,
  Sparkles,
  Hammer,
  Waves,
  Sun,
  Castle,
  Building2,
  Tent,
  Trees,
  Mountain,
  Factory,
  Sofa,
  UtensilsCrossed,
  BedDouble,
  PenTool,
  Bath,
  Share2,
  TreeDeciduous,
  X,
  Printer,
  Mail,
  ExternalLink,
  MapPin,
  Calendar,
  Maximize2,
  Layout,
  Info
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import ClientDashboard from './components/ClientDashboard';

// --- Types ---

type Phase = 1 | 2 | 3 | 4 | 5;
type Language = 'en' | 'es';

interface Inhabitant {
  gender: string;
  age: string;
  occupation: string;
}

interface ArchitecturalProgram {
  // Phase 1
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

  // Phase 2
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

  // Phase 3
  groundFloorSpaces: string[];
  groundFloorDetails: Record<string, any>;
  upperFloorSpaces: string[];
  upperFloorDetails: Record<string, any>;
  spaceDimensions: Record<string, { l: number, w: number, isCustom: boolean, isCorrected: boolean, note?: string, field?: 'l' | 'w' }>;
  spaceQuantities: Record<string, number>;

  // Phase 4
  finishes: {
    floors: string;
    walls: string;
    roof: string;
  };
}

const INITIAL_PROGRAM: ArchitecturalProgram = {
  inhabitantsCount: 1,
  inhabitants: [{ gender: '', age: '', occupation: '' }],
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
  finishes: {
    floors: 'wood_laminate',
    walls: 'warm_paint',
    roof: 'clay_tile'
  }
};

// --- Constants ---

const MULTIPLE_SPACES = [
  'secondary_bedrooms',
  'full_bathrooms',
  'secondary_walk_in_closet',
  'wall_closet',
  'half_bath',
  'garage',
  'guest_bedroom',
  'balconies'
];

const NESTED_SPACES: Record<string, { parent: string, children: string[], prompt: { en: string, es: string } }[]> = {
  SOCIAL: [
    { parent: 'foyer', children: [], prompt: { en: '', es: '' } },
    { parent: 'half_bath', children: [], prompt: { en: '', es: '' } },
    { 
      parent: 'living_room', 
      children: ['home_theater', 'game_room', 'music_room'],
      prompt: { 
        en: 'Would you like to add specialized entertainment areas?', 
        es: '¿Te gustaría añadir áreas especializadas de entretenimiento?' 
      }
    },
    { parent: 'formal_dining', children: [], prompt: { en: '', es: '' } },
    { 
      parent: 'terrace', 
      children: ['outdoor_living'],
      prompt: { 
        en: 'Shall we add an outdoor living area with a fireplace or firepit?', 
        es: '¿Añadimos una zona de estar exterior con chimenea o fogatero?' 
      }
    },
    { parent: 'bar', children: [], prompt: { en: '', es: '' } },
    {
      parent: 'vertical_circulation',
      children: ['main_stairs', 'elevator_prep'],
      prompt: { 
        en: 'For multi-level homes, what type of circulation do you prefer?', 
        es: 'Para casas de varios niveles, ¿qué tipo de circulación prefieres?' 
      }
    }
  ],
  SERVICIOS: [
    { 
      parent: 'main_kitchen', 
      children: [
        'pantry', 
        'prep_kitchen', 
        'butlers_pantry',
        'service_entrance',
        'coffee_bar',
        'baking_center',
        'wine_room',
        'breakfast_nook',
        'drop_zone'
      ],
      prompt: { 
        en: 'Would you like to add support areas, specialized stations, or logistics for your kitchen?', 
        es: '¿Deseas añadir áreas de apoyo, estaciones especializadas o logística para tu cocina?' 
      }
    },
    { 
      parent: 'laundry_room', 
      children: ['linen_closet', 'pet_room'],
      prompt: { 
        en: 'Shall we add organization spaces or pet care areas?', 
        es: '¿Añadimos espacios de organización o cuidado de mascotas?' 
      }
    },
    { 
      parent: 'storage', 
      children: ['mechanical_room'],
      prompt: { 
        en: 'Do you need a technical area for installations?', 
        es: '¿Necesitas un área técnica para instalaciones?' 
      }
    },
    { parent: 'service_room', children: [], prompt: { en: '', es: '' } },
  ],
  PRIVADOS: [
    { parent: 'in_law_suite', children: [], prompt: { en: '', es: '' } },
    { 
      parent: 'master_suite', 
      children: ['master_closet', 'master_bath'],
      prompt: { 
        en: 'Every great suite needs its complements. Shall we add them?', 
        es: 'Toda gran suite necesita sus complementos. ¿Los añadimos?' 
      }
    },
    { 
      parent: 'secondary_bedrooms', 
      children: ['full_bathrooms', 'secondary_walk_in_closet', 'wall_closet'],
      prompt: { 
        en: 'How do you prefer the bathrooms and storage for the additional bedrooms?', 
        es: '¿Cómo prefieres los baños y el almacenamiento para las recámaras adicionales?' 
      }
    },
    { 
      parent: 'office', 
      children: ['library'],
      prompt: { 
        en: 'Would you like to integrate a reading area or library?', 
        es: '¿Te gustaría integrar una zona de lectura o biblioteca?' 
      }
    },
    { 
      parent: 'gym', 
      children: ['yoga_studio', 'private_spa'],
      prompt: { 
        en: 'Do you want to turn it into a complete wellness center?', 
        es: '¿Quieres convertirlo en un centro de bienestar completo?' 
      }
    },
    { parent: 'guest_bedroom', children: [], prompt: { en: '', es: '' } },
    { parent: 'nursery', children: [], prompt: { en: '', es: '' } },
    { parent: 'safe_room', children: [], prompt: { en: '', es: '' } },
  ],
  EXTERIORES: [
    { 
      parent: 'garage', 
      children: ['tool_shed', 'mudroom'],
      prompt: { 
        en: 'Do you need space for tools or a transition zone from the garage?', 
        es: '¿Necesitas un espacio para herramientas o una zona de transición desde el garaje?' 
      }
    },
    { 
      parent: 'garden', 
      children: ['pool', 'jacuzzi', 'firepit', 'outdoor_living'],
      prompt: { 
        en: 'What relaxation elements would you like to integrate into the landscape?', 
        es: '¿Qué elementos de relajación te gustaría integrar al paisaje?' 
      }
    },
    { 
      parent: 'outdoor_kitchen', 
      children: ['outdoor_dining'],
      prompt: { 
        en: 'Shall we add a dining area next to the grill?', 
        es: '¿Añadimos una zona de comedor junto al asador?' 
      }
    },
    { parent: 'front_porch', children: [], prompt: { en: '', es: '' } },
    { parent: 'courtyard', children: [], prompt: { en: '', es: '' } },
    { 
      parent: 'deck', 
      children: ['roof_garden', 'balconies', 'pool_house'],
      prompt: { 
        en: 'Would you like to add additional levels or structures to the exterior?', 
        es: '¿Deseas añadir niveles o estructuras adicionales al exterior?' 
      }
    },
  ]
};

const MIN_DIMENSIONS: Record<string, { label: { en: string, es: string }, l: number, w: number, category: 'INTERIOR' | 'EXTERIOR' }> = {
  // SOCIAL
  foyer: { label: { en: 'Foyer', es: 'Foyer (Recibidor)' }, l: 5, w: 5, category: 'INTERIOR' },
  living_room: { label: { en: 'Living Room / Family Room', es: 'Living Room / Family Room (Sala de Estar / Sala Familiar)' }, l: 12, w: 12, category: 'INTERIOR' },
  formal_dining: { label: { en: 'Formal Dining Room', es: 'Formal Dining Room (Comedor Formal)' }, l: 10, w: 12, category: 'INTERIOR' },
  breakfast_nook: { label: { en: 'Breakfast Nook / Breakfast Room', es: 'Breakfast Nook / Breakfast Room (Rincón de Desayuno)' }, l: 10, w: 10, category: 'INTERIOR' },
  half_bath: { label: { en: 'Half Bath (Powder Room)', es: 'Half Bath (Medio Baño / Baño de Visitas)' }, l: 3, w: 5, category: 'INTERIOR' },
  terrace: { label: { en: 'Terrace (Social Area)', es: 'Terrace (Terraza / Área Social)' }, l: 8, w: 10, category: 'EXTERIOR' },
  home_theater: { label: { en: 'Home Theater', es: 'Home Theater (Sala de Cine)' }, l: 12, w: 14, category: 'INTERIOR' },
  game_room: { label: { en: 'Game Room', es: 'Game Room (Sala de Juegos)' }, l: 12, w: 16, category: 'INTERIOR' },
  bar: { label: { en: 'Bar / Cantina', es: 'Bar / Cantina' }, l: 5, w: 6, category: 'INTERIOR' },
  wine_room: { label: { en: 'Wine Room / Wine Display', es: 'Wine Room / Wine Display (Cava de Vinos)' }, l: 6, w: 8, category: 'INTERIOR' },
  music_room: { label: { en: 'Music Room', es: 'Music Room (Sala de Música)' }, l: 10, w: 10, category: 'INTERIOR' },
  vertical_circulation: { label: { en: 'Vertical Circulation', es: 'Vertical Circulation (Circulación Vertical)' }, l: 6, w: 8, category: 'INTERIOR' },
  main_stairs: { label: { en: 'Main Stairs', es: 'Main Stairs (Escaleras Principales)' }, l: 8, w: 10, category: 'INTERIOR' },
  elevator_prep: { label: { en: 'Elevator Prep', es: 'Elevator Prep (Preparación para Elevador)' }, l: 5, w: 5, category: 'INTERIOR' },
  outdoor_living: { label: { en: 'Outdoor Living Room', es: 'Outdoor Living Room (Sala Exterior)' }, l: 12, w: 12, category: 'EXTERIOR' },

  // SERVICIOS
  main_kitchen: { label: { en: 'Main Kitchen', es: 'Main Kitchen (Cocina Principal)' }, l: 12, w: 15, category: 'INTERIOR' },
  pantry: { label: { en: 'Walk-in Pantry', es: 'Walk-in Pantry (Despensa)' }, l: 6, w: 8, category: 'INTERIOR' },
  prep_kitchen: { label: { en: 'Scullery / Prep Kitchen', es: 'Scullery / Prep Kitchen (Cocina Sucia / de Preparación)' }, l: 8, w: 10, category: 'INTERIOR' },
  butlers_pantry: { label: { en: 'Butler\'s Pantry', es: 'Butler\'s Pantry (Despensa del Mayordomo)' }, l: 6, w: 8, category: 'INTERIOR' },
  service_entrance: { label: { en: 'Catering Entrance', es: 'Catering Entrance (Entrada de Servicio)' }, l: 6, w: 6, category: 'INTERIOR' },
  coffee_bar: { label: { en: 'Coffee Bar / Beverage Center', es: 'Coffee Bar / Beverage Center (Estación de Café y Bebidas)' }, l: 4, w: 6, category: 'INTERIOR' },
  baking_center: { label: { en: 'Baking Center', es: 'Baking Center (Centro de Repostería)' }, l: 6, w: 8, category: 'INTERIOR' },
  drop_zone: { label: { en: 'Drop Zone / Mom\'s Desk', es: 'Drop Zone / Mom\'s Desk (Zona de Descarga / Escritorio)' }, l: 5, w: 6, category: 'INTERIOR' },
  laundry_room: { label: { en: 'Laundry Room', es: 'Laundry Room (Cuarto de Lavado)' }, l: 5, w: 6, category: 'INTERIOR' },
  linen_closet: { label: { en: 'Linen Closet', es: 'Linen Closet (Cuarto de Blancos)' }, l: 2, w: 3, category: 'INTERIOR' },
  mudroom: { label: { en: 'Mudroom (Transition Zone)', es: 'Mudroom (Cuarto de Botas / Transición)' }, l: 5, w: 5, category: 'INTERIOR' },
  pet_room: { label: { en: 'Pet Room / Dog Wash', es: 'Pet Room / Dog Wash' }, l: 5, w: 6, category: 'INTERIOR' },
  storage: { label: { en: 'Storage', es: 'Storage (Bodega)' }, l: 4, w: 4, category: 'INTERIOR' },
  service_room: { label: { en: 'Service Room (with bath)', es: 'Service Room / Cuarto de Servicio (con baño)' }, l: 8, w: 10, category: 'INTERIOR' },
  mechanical_room: { label: { en: 'Mechanical / Utility Room', es: 'Mechanical / Utility Room (Cuarto de Máquinas / Instalaciones)' }, l: 5, w: 5, category: 'INTERIOR' },

  // PRIVADOS
  master_suite: { label: { en: 'Master Suite', es: 'Master Suite (Recámara Principal)' }, l: 12, w: 14, category: 'INTERIOR' },
  in_law_suite: { label: { en: 'In-Law Suite / Next-Gen Suite (Casita)', es: 'In-Law Suite / Next-Gen Suite (Casita)' }, l: 12, w: 16, category: 'INTERIOR' },
  master_closet: { label: { en: 'Master Walk-in Closet', es: 'Master Walk-in Closet (Vestidor Principal)' }, l: 6, w: 6, category: 'INTERIOR' },
  master_bath: { label: { en: 'Master Bathroom', es: 'Master Bathroom (Baño Principal)' }, l: 8, w: 10, category: 'INTERIOR' },
  secondary_bedrooms: { label: { en: 'Secondary Bedrooms', es: 'Secondary Bedrooms (Recámaras Secundarias)' }, l: 10, w: 10, category: 'INTERIOR' },
  guest_bedroom: { label: { en: 'Guest Bedroom', es: 'Guest Bedroom (Recámara de Huéspedes)' }, l: 10, w: 10, category: 'INTERIOR' },
  full_bathrooms: { label: { en: 'Full Bathrooms (Secondary / Shared)', es: 'Full Bathrooms / Baños Completos (Secundarios / Compartidos)' }, l: 5, w: 8, category: 'INTERIOR' },
  secondary_walk_in_closet: { label: { en: 'Secondary Walk-in Closet', es: 'Secondary Walk-in Closet (Vestidor Secundario)' }, l: 5, w: 5, category: 'INTERIOR' },
  wall_closet: { label: { en: 'Wall Closet', es: 'Wall Closet (Closet de Pared)' }, l: 2, w: 6, category: 'INTERIOR' },
  office: { label: { en: 'Office / Study', es: 'Office / Study (Oficina / Estudio)' }, l: 8, w: 10, category: 'INTERIOR' },
  library: { label: { en: 'Library', es: 'Library (Biblioteca)' }, l: 10, w: 10, category: 'INTERIOR' },
  nursery: { label: { en: 'Nursery', es: 'Nursery (Cuarto de Bebé)' }, l: 8, w: 9, category: 'INTERIOR' },
  gym: { label: { en: 'Home Gym', es: 'Home Gym (Gimnasio en Casa)' }, l: 10, w: 10, category: 'INTERIOR' },
  yoga_studio: { label: { en: 'Yoga / Meditation Studio', es: 'Yoga / Meditation Studio (Estudio de Yoga / Meditación)' }, l: 8, w: 8, category: 'INTERIOR' },
  private_spa: { label: { en: 'Private Sauna / Spa', es: 'Private Sauna / Spa (Sauna / Spa Privado)' }, l: 5, w: 5, category: 'INTERIOR' },
  safe_room: { label: { en: 'Safe Room / Panic Room', es: 'Safe Room / Panic Room (Habitación de Pánico)' }, l: 4, w: 4, category: 'INTERIOR' },

  // EXTERIORES
  garage: { label: { en: 'Garage / Covered Carport', es: 'Garage / Covered Carport (Garaje / Cochera Techada)' }, l: 12, w: 20, category: 'EXTERIOR' },
  garden: { label: { en: 'Front / Back Garden', es: 'Front / Back Garden (Jardín Frontal / Trasero)' }, l: 15, w: 20, category: 'EXTERIOR' },
  pool: { label: { en: 'Swimming Pool', es: 'Swimming Pool (Piscina / Alberca)' }, l: 10, w: 20, category: 'EXTERIOR' },
  jacuzzi: { label: { en: 'Jacuzzi / Hot Tub', es: 'Jacuzzi / Hot Tub (Jacuzzi / Hidromasaje)' }, l: 6, w: 6, category: 'EXTERIOR' },
  front_porch: { label: { en: 'Front Porch', es: 'Front Porch (Porche Delantero)' }, l: 5, w: 8, category: 'EXTERIOR' },
  courtyard: { label: { en: 'Courtyard / Interior Patio', es: 'Courtyard / Interior Patio (Patio Interior)' }, l: 10, w: 10, category: 'EXTERIOR' },
  outdoor_kitchen: { label: { en: 'Outdoor Kitchen / BBQ Area', es: 'Outdoor Kitchen / BBQ Area (Cocina de Exterior / Área de Asador)' }, l: 6, w: 8, category: 'EXTERIOR' },
  outdoor_dining: { label: { en: 'Outdoor Dining', es: 'Outdoor Dining (Comedor al Aire Libre)' }, l: 10, w: 10, category: 'EXTERIOR' },
  firepit: { label: { en: 'Firepit Area', es: 'Firepit Area (Fogatero)' }, l: 12, w: 12, category: 'EXTERIOR' },
  pool_house: { label: { en: 'Pool House', es: 'Pool House (Casa de Piscina)' }, l: 10, w: 12, category: 'EXTERIOR' },
  deck: { label: { en: 'Deck / Wooden Platform', es: 'Deck / Wooden Platform (Deck / Plataforma de Madera)' }, l: 10, w: 10, category: 'EXTERIOR' },
  roof_garden: { label: { en: 'Roof Garden / Green Roof', es: 'Roof Garden / Green Roof (Azotea Verde)' }, l: 10, w: 10, category: 'EXTERIOR' },
  balconies: { label: { en: 'Balconies', es: 'Balconies (Balcones)' }, l: 4, w: 6, category: 'EXTERIOR' },
  tool_shed: { label: { en: 'Tool Shed / Gardening', es: 'Tool Shed / Gardening (Cuarto de Herramientas / Jardinería)' }, l: 5, w: 5, category: 'EXTERIOR' }
};

const CATEGORY_LABELS: Record<string, { en: string, es: string }> = {
  SOCIAL: { en: 'Social Areas', es: 'Social Areas (Áreas Sociales)' },
  SERVICIOS: { en: 'Service Areas', es: 'Service Areas (Áreas de Servicio)' },
  PRIVADOS: { en: 'Private Areas', es: 'Private Areas (Áreas Privadas)' },
  EXTERIORES: { en: 'Exterior Areas', es: 'Exterior Areas (Áreas Exteriores)' }
};

const UI_TRANSLATIONS: Record<string, { en: string, es: string }> = {
  // Phase 1
  phase1_title: { en: 'Phase 1: The Soul of the Home', es: 'Fase 1: El Alma del Hogar' },
  phase1_subtitle: { en: 'A house is designed around those who inhabit it.', es: 'Una casa se diseña alrededor de quienes la habitan.' },
  phase1_prompt: { en: 'Tell us, who will bring life to these spaces?', es: 'Cuéntanos, ¿quiénes darán vida a estos espacios?' },
  how_many_people: { en: 'How many people will live here?', es: '¿Cuántas personas vivirán aquí?' },
  person: { en: 'Person', es: 'Persona' },
  gender: { en: 'Gender', es: 'Género' },
  male: { en: 'Male', es: 'Masculino' },
  female: { en: 'Female', es: 'Femenino' },
  other: { en: 'Other', es: 'Otro' },
  age: { en: 'Age', es: 'Edad' },
  occupation: { en: 'Main Occupation', es: 'Ocupación principal' },
  pets: { en: 'Pets', es: 'Mascotas' },
  dog: { en: 'Dog', es: 'Perro' },
  cat: { en: 'Cat', es: 'Gato' },
  fish: { en: 'Fish', es: 'Pez' },
  bird: { en: 'Bird', es: 'Ave' },
  phase1_routines_title: { en: 'Phase 1: Routines and Passions', es: 'Fase 1: Rutinas y Pasiones' },
  phase1_routines_subtitle: { en: 'Knowing what you love to do helps us create the perfect spaces for you.', es: 'Saber lo que amas hacer nos ayuda a crear los espacios perfectos para ti.' },
  hobbies: { en: 'Hobbies', es: 'Hobbies' },
  reading: { en: 'Reading', es: 'Lectura' },
  cooking: { en: 'Cooking', es: 'Cocina' },
  gardening: { en: 'Gardening', es: 'Jardinería' },
  sports: { en: 'Sports', es: 'Deportes' },
  art: { en: 'Art', es: 'Arte' },
  gaming: { en: 'Gaming', es: 'Videojuegos' },
  music: { en: 'Music', es: 'Música' },
  cinema: { en: 'Cinema', es: 'Cine' },
  overnight_guests: { en: 'Do you have overnight guests?', es: '¿Recibes invitados a dormir?' },
  yes: { en: 'Yes', es: 'Sí' },
  no: { en: 'No', es: 'No' },
  special_needs: { en: 'Special Needs', es: 'Necesidades Especiales' },
  priority: { en: 'It\'s a priority', es: 'Es prioridad' },
  special_needs_desc: { en: 'We consider ramps, wide hallways, and design for seniors.', es: 'Consideramos rampas, pasillos anchos y diseño para adultos mayores.' },
  phase1_aesthetics_title: { en: 'Phase 1: Identity and Aesthetics', es: 'Fase 1: Identidad y Estética' },
  phase1_aesthetics_subtitle: { en: 'Let\'s define the visual character of your home.', es: 'Definamos el carácter visual de tu hogar.' },
  arch_style: { en: 'Architectural Style', es: 'Estilo Arquitectónico' },
  arch_style_desc: { en: 'Slide to explore the different personalities your home can have.', es: 'Desliza para explorar las diferentes personalidades que puede tener tu hogar.' },
  favorite_color: { en: 'Favorite Color', es: 'Color Favorito' },
  color_desc: { en: 'The color you choose will define the atmosphere of your most intimate spaces.', es: 'El color que elijas definirá la atmósfera de tus espacios más íntimos.' },
  color_quote: { en: '"Favorite color is the starting point to create a palette that harmonizes with your lifestyle."', es: '"El color favorito es el punto de partida para crear una paleta que armonice con tu estilo de vida."' },
  forbidden_colors: { en: 'Forbidden Colors', es: 'Colores Prohibidos' },
  forbidden_colors_prompt: { en: 'What colors do you definitely NOT want to see in your home?', es: '¿Qué colores definitivamente NO quieres ver en tu hogar?' },
  personal_haven: { en: 'Your Personal Haven', es: 'Tu Refugio Personal' },
  personal_haven_prompt: { en: 'Select the space where you feel most comfortable and at peace.', es: 'Selecciona el espacio donde te sientes más cómodo y en paz.' },
  living_room_fav: { en: 'Living Room', es: 'Sala de Estar' },
  kitchen_fav: { en: 'Kitchen', es: 'Cocina' },
  terrace_fav: { en: 'Terrace', es: 'Terraza' },
  master_bedroom_fav: { en: 'Master Bedroom', es: 'Recámara Principal' },
  office_fav: { en: 'Office', es: 'Estudio' },
  garden_fav: { en: 'Garden', es: 'Jardín' },

  // Phase 2
  phase2_title: { en: 'Phase 2: The Architectural Concept', es: 'Fase 2: El Partido Arquitectónico' },
  phase2_subtitle: { en: 'It\'s time to give shape to your project.', es: 'Es momento de darle forma a tu proyecto.' },
  phase2_prompt: { en: 'How do you imagine the main structure?', es: '¿Cómo imaginas la estructura principal?' },
  '1_story': { en: '1 Story', es: '1 Planta' },
  '2_stories': { en: '2 Stories', es: '2 Plantas' },
  '3_stories': { en: '3 Stories+', es: '3 Plantas+' },
  ranch_bungalow: { en: 'Ranch / Bungalow', es: 'Ranch / Bungalow' },
  traditional_design: { en: 'Traditional Design', es: 'Diseño Tradicional' },
  vertical_loft: { en: 'Vertical / Loft', es: 'Vertical / Loft' },
  how_many_stories: { en: 'How many stories will your home have?', es: '¿Cuántas plantas tendrá tu hogar?' },
  ceiling_height_title: { en: 'Ceiling Height', es: 'Altura de Techos' },
  ceiling_height_prompt: { en: 'What clear height do you prefer for your spaces?', es: '¿Qué altura libre prefieres para tus espacios?' },
  ceiling_height_main: { en: 'Main Level Height', es: 'Altura Planta Baja' },
  ceiling_height_upper: { en: 'Upper Level Height', es: 'Altura Planta Alta' },
  standard_9ft: { en: 'Standard (9 ft)', es: 'Estándar (9 ft)' },
  spacious_10ft: { en: 'Spacious (10 ft)', es: 'Amplia (10 ft)' },
  luxury_12ft: { en: 'Luxury / Custom (12+ ft)', es: 'Lujo / Custom (12+ ft)' },
  standard_8ft: { en: 'Standard (8 ft)', es: 'Estándar (8 ft)' },
  double_height_label: { en: 'I want Double-Height areas (Living/Foyer)', es: 'Deseo áreas con Doble Altura (Sala/Recibidor)' },
  basement_title: { en: 'Basement / Foundation', es: 'Sótano / Cimentación' },
  basement_prompt: { en: 'Does the project require a subterranean level?', es: '¿El proyecto requiere nivel subterráneo?' },
  basement_none: { en: 'No (Slab on grade)', es: 'No (Losa / Slab on grade)' },
  basement_finished: { en: 'Finished Basement', es: 'Sótano Terminado' },
  basement_unfinished: { en: 'Unfinished Basement', es: 'Sótano sin terminar' },
  basement_walkout: { en: 'Walk-out Basement', es: 'Walk-out Basement (Sótano con salida)' },
  footprint_title: { en: 'Footprint / Layout Shape', es: 'Huella y Disposición' },
  footprint_prompt: { en: 'What general shape do you imagine for the layout?', es: '¿Qué forma general te imaginas para la distribución?' },
  footprint_rectangular: { en: 'Rectangular / Compact', es: 'Rectangular / Compacta' },
  footprint_rectangular_desc: { en: 'Efficient and ideal for narrow lots', es: 'Eficiente e ideal para terrenos estrechos' },
  footprint_l_shape: { en: 'L-Shape', es: 'Forma de "L"' },
  footprint_l_shape_desc: { en: 'Perfect for embracing a garden or pool', es: 'Perfecta para abrazar un jardín o piscina' },
  footprint_u_shape: { en: 'U-Shape (Courtyard)', es: 'Forma de "U" (Patio)' },
  footprint_u_shape_desc: { en: 'Centralized design around an interior patio', es: 'Diseño centralizado en torno a un patio interior' },
  roof_style_title: { en: 'Roof Style', es: 'Estilo de Cubierta' },
  roof_style_prompt: { en: 'What roof profile fits your vision?', es: '¿Qué perfil de techo se adapta a tu visión?' },
  roof_pitched: { en: 'Pitched / Gabled', es: 'Inclinado (Pitched / Gabled)' },
  roof_pitched_desc: { en: 'Classic, Farmhouse, Traditional', es: 'Clásico, Farmhouse, Tradicional' },
  roof_flat: { en: 'Flat / Low Slope', es: 'Plano (Flat / Low Slope)' },
  roof_flat_desc: { en: 'Modern, Contemporary', es: 'Moderno, Contemporáneo' },
  floor_plan_concept_title: { en: 'Floor Plan Concept', es: 'Concepto del Espacio Interior' },
  floor_plan_concept_prompt: { en: 'How do you imagine the flow in the social area (Kitchen/Living/Dining)?', es: '¿Cómo imaginas el flujo en el área social (Cocina/Sala/Comedor)?' },
  open_concept: { en: 'Open Concept', es: 'Concepto Abierto' },
  open_concept_desc: { en: 'Everything in a single continuous space', es: 'Todo en un solo gran espacio continuo' },
  traditional_layout: { en: 'Traditional Layout', es: 'Zonas Definidas' },
  traditional_layout_desc: { en: 'Rooms separated by walls or arches', es: 'Habitaciones separadas por muros o arcos' },

  // Phase 3
  phase3_title: { en: 'Phase 3: Distribution by Levels', es: 'Fase 3: Distribución por Niveles' },
  phase3_ground_floor: { en: 'Architectural Program: Define your home\'s spaces.', es: 'Programa Arquitectónico: Define los espacios de tu hogar.' },
  phase3_subtitle_ground: { en: 'Ground Floor: The heart of the home.', es: 'Planta Baja: El corazón del hogar.' },
  phase3_upper_floor: { en: 'Upper Floor: Your private haven.', es: 'Planta Alta: Tu refugio privado.' },
  phase3_subtitle_upper: { en: 'Upper Floor: Private and quiet spaces.', es: 'Planta Alta: Espacios privados y tranquilos.' },
  phase3_prompt: { en: 'Select the spaces you need on this level.', es: 'Selecciona los espacios que necesitas en este nivel' },
  select_spaces_prompt: { en: 'Select the spaces you need on this level.', es: 'Selecciona los espacios que necesitas en este nivel' },
  phase3_details_title: { en: 'Phase 3: Equipment and Details', es: 'Fase 3: Equipamiento y Detalles' },
  phase3_details_subtitle: { en: 'Excellent selection.', es: 'Excelente selección.' },
  phase3_details_prompt: { en: 'Now, let\'s get into the details of each room.', es: 'Ahora, entremos a los detalles de cada habitación.' },
  dimensions: { en: 'Dimensions (ft)', es: 'Dimensiones (ft)' },
  length: { en: 'Length (L)', es: 'Largo (L)' },
  width: { en: 'Width (W)', es: 'Ancho (W)' },
  net_area: { en: 'Net Area', es: 'Área Neta' },
  minimum: { en: 'Minimum', es: 'Mínimo' },
  corrected_to_min: { en: 'Adjusted to functional minimum of', es: 'Ajustado al mínimo funcional de' },
  auto: { en: 'Car', es: 'Auto' },
  autos: { en: 'Cars', es: 'Autos' },
  stove: { en: 'Stove', es: 'Estufa' },
  gas: { en: 'Gas', es: 'Gas' },
  electric: { en: 'Electric', es: 'Eléctrica' },
  induction: { en: 'Induction', es: 'Inducción' },
  refrigerator: { en: 'Refrigerator', es: 'Refrigerador' },
  standard: { en: 'Standard', es: 'Estándar' },
  double_door: { en: 'Double Door', es: 'Doble Puerta' },
  bed_size: { en: 'Bed Size', es: 'Tamaño de Cama' },
  king: { en: 'King', es: 'King' },
  queen: { en: 'Queen', es: 'Queen' },
  full: { en: 'Full', es: 'Matrimonial' },
  closet: { en: 'Closet', es: 'Closet' },
  walk_in: { en: 'Walk-in', es: 'Vestidor' },
  wall: { en: 'Wall', es: 'De muro' },
  extra_notes: { en: 'Extra notes', es: 'Notas extras' },
  extra_notes_placeholder: { en: 'e.g. Special lighting, extra power outlets...', es: 'Ej. Iluminación especial, tomas de corriente extra...' },

  // Phase 4
  phase4_title: { en: 'Phase 4: Finishes and Materiality', es: 'Fase 4: Acabados y Materialidad' },
  phase4_subtitle: { en: 'To finish, let\'s define the skin of your house.', es: 'Para terminar, definamos la piel de tu casa.' },
  phase4_prompt: { en: 'What textures do you prefer for interiors and exteriors?', es: '¿Qué texturas prefieres para los interiores y exteriores?' },
  floors: { en: 'Floors', es: 'Pisos' },
  wood_laminate: { en: 'Wood/Laminate', es: 'Madera/Laminado' },
  stone: { en: 'Stone', es: 'Piedra' },
  tile: { en: 'Tile', es: 'Azulejo/Tile' },
  polished_concrete: { en: 'Polished Concrete', es: 'Concreto Pulido' },
  interior_walls: { en: 'Interior Walls', es: 'Muros Interiores' },
  warm_paint: { en: 'Warm Paint', es: 'Pintura cálida' },
  cool_paint: { en: 'Cool Paint', es: 'Pintura fría' },
  wallpaper: { en: 'Wallpaper', es: 'Papel Tapiz' },
  natural_wood: { en: 'Natural Wood', es: 'Madera natural' },
  roof_material: { en: 'Roof Material', es: 'Techos (Roof)' },
  clay_tile: { en: 'Clay Tile', es: 'Teja de Barro' },
  shingle: { en: 'Shingle', es: 'Shingle' },
  steel: { en: 'Steel', es: 'Acero' },

  // Styles
  traditional: { en: 'Traditional', es: 'Tradicional' },
  ranch: { en: 'Ranch', es: 'Rancho' },
  classic_colonial: { en: 'Classic Colonial', es: 'Colonial Clásico' },
  modern: { en: 'Modern', es: 'Moderno' },
  modern_farmhouse: { en: 'Modern Farmhouse', es: 'Granja Moderna' },
  contemporary: { en: 'Contemporary', es: 'Contemporáneo' },
  craftsman: { en: 'Craftsman', es: 'Artesanal' },
  mediterranean: { en: 'Mediterranean', es: 'Mediterráneo' },
  spanish_style: { en: 'Spanish Style', es: 'Estilo Español' },
  french_colonial: { en: 'French Colonial', es: 'Colonial Francés' },
  victorian: { en: 'Victorian', es: 'Victoriano' },
  tudor: { en: 'Tudor', es: 'Tudor' },
  cottage: { en: 'Cottage', es: 'Casa de Campo' },
  rustic_cabin: { en: 'Rustic / Cabin', es: 'Rústico / Cabaña' },
  industrial_loft: { en: 'Industrial / Loft', es: 'Industrial / Loft' },

  // Phase 5
  phase5_title: { en: 'Final Result', es: 'Resultado Final' },
  phase5_subtitle: { en: 'Your Architectural Program is ready.', es: 'Tu Programa Arquitectónico está listo.' },
  phase5_prompt: { en: 'Here is the structured summary for your architect.', es: 'Aquí tienes el resumen estructurado para tu arquitecto.' },
  export_pdf: { en: 'Export PDF', es: 'Exportar PDF' },
  preview_brief: { en: 'Preview Design Brief', es: 'Previsualizar Design Brief' },
  download_official_pdf: { en: 'Download Official PDF', es: 'Descargar PDF Oficial' },
  back_to_summary: { en: 'Back to Summary', es: 'Volver al Resumen' },
  project_summary_web: { en: 'Project Summary Web', es: 'Resumen del Proyecto Web' },
  breakdown_title: { en: 'Breakdown of Selected Areas', es: 'Desglose de Áreas Seleccionadas' },
  corrected: { en: 'Corrected', es: 'Corregido' },
  custom: { en: 'Custom', es: 'Custom' },
  surface_analysis: { en: 'Surface Analysis', es: 'Análisis de Superficie' },
  subtotal_net: { en: 'Subtotal Net Area (Interior)', es: 'Subtotal Área Neta (Interior)' },
  circulation_walls: { en: 'Circulation and Walls (+15%)', es: 'Circulación y Muros (+15%)' },
  exterior_garage: { en: 'Exterior Areas / Garage', es: 'Áreas Exteriores / Garaje' },
  total_construction: { en: 'Estimated Total Construction', es: 'Total Estimado de Construcción' },
  project_identity: { en: 'Project Identity', es: 'Identidad del Proyecto' },
  style: { en: 'Style', es: 'Estilo' },
  levels: { en: 'Levels', es: 'Niveles' },
  ideal_haven: { en: 'Ideal Haven', es: 'Refugio Ideal' },
  story: { en: 'Story', es: 'Planta' },
  stories: { en: 'Stories', es: 'Plantas' },
  next_step: { en: 'Next Step', es: 'Siguiente Paso' },
  next_step_desc: { en: 'This document is the perfect basis for your architect to start the schematic design. Save time by eliminating measurement uncertainty.', es: 'Este documento es la base perfecta para que tu arquitecto inicie el diseño esquemático. Ahorra tiempo eliminando la incertidumbre de las medidas.' },
  view_original_pdf: { en: 'View BEFORE DESIGN ORIGINAL', es: 'Ver BEFORE DESIGN ORIGINAL' },
  legal_note: { en: '"This program has been validated under US functional standards (IRC Code), ensuring that each space is habitable and marketable."', es: '"Este programa ha sido validado bajo estándares funcionales de USA (IRC Code), asegurando que cada espacio sea habitable y vendible."' },

  // Client Review
  review_title: { en: 'Client Review', es: 'Revisión del Cliente' },
  review_confirm: { en: 'Confirm and Continue', es: 'Confirmar y Continuar' },
  review_edit: { en: 'Edit', es: 'Editar' },
  review_go_back: { en: 'Go Back to Edit', es: 'Regresar y Editar' },
  review_phase1_title: { en: 'Phase 1 Review: Profile & Aesthetics', es: 'Revisión Fase 1: Perfil y Estética' },
  review_phase1_desc: { en: 'Please confirm the information about who will live in the home and the preferred style.', es: 'Por favor confirma la información sobre quiénes vivirán en el hogar y el estilo preferido.' },
  review_phase2_title: { en: 'Phase 2 Review: Architectural Concept', es: 'Revisión Fase 2: Partido Arquitectónico' },
  review_phase2_desc: { en: 'Confirm the structure, levels, heights, and overall layout concept.', es: 'Confirma la estructura, niveles, alturas y concepto general de distribución.' },
  review_phase3_title: { en: 'Phase 3 Review: Spaces & Distribution', es: 'Revisión Fase 3: Espacios y Distribución' },
  review_phase3_desc: { en: 'Review all selected spaces and their dimensions before defining finishes.', es: 'Revisa todos los espacios seleccionados y sus dimensiones antes de definir los acabados.' },
  review_phase4_title: { en: 'Phase 4 Review: Finishes & Materiality', es: 'Revisión Fase 4: Acabados y Materialidad' },
  review_phase4_desc: { en: 'Final review of selected materials before generating your Architectural Program.', es: 'Revisión final de los materiales seleccionados antes de generar tu Programa Arquitectónico.' },
  review_approved: { en: '✓ Everything looks good', es: '✓ Todo se ve correcto' },
  review_inhabitants: { en: 'Inhabitants', es: 'Habitantes' },
  review_style: { en: 'Style', es: 'Estilo' },
  review_pets_hobbies: { en: 'Pets & Hobbies', es: 'Mascotas y Hobbies' },
  review_special: { en: 'Accessibility', es: 'Accesibilidad' },
  review_guests: { en: 'Frequent Guests', es: 'Visitas frecuentes' },
  review_levels_label: { en: 'Levels', es: 'Niveles' },
  review_ceiling: { en: 'Ceiling Height', es: 'Altura de Techos' },
  review_basement: { en: 'Basement', es: 'Sótano' },
  review_footprint: { en: 'Layout Shape', es: 'Forma de Planta' },
  review_roof: { en: 'Roof Style', es: 'Estilo de Cubierta' },
  review_floor_concept: { en: 'Floor Plan Concept', es: 'Concepto de Planta' },
  review_ground_spaces: { en: 'Ground Floor Spaces', es: 'Espacios en Planta Baja' },
  review_upper_spaces: { en: 'Upper Floor Spaces', es: 'Espacios en Planta Alta' },
  review_total_area: { en: 'Estimated Area', es: 'Área Estimada' },
  review_floors_finish: { en: 'Floors', es: 'Pisos' },
  review_walls_finish: { en: 'Interior Walls', es: 'Muros Interiores' },
  review_roof_finish: { en: 'Roof Material', es: 'Material de Techo' },
  review_checkpoint: { en: 'Checkpoint', es: 'Punto de Control' }
};

// --- Components ---

export default function App() {
  const [phase, setPhase] = useState<Phase>(1);
  const [screen, setScreen] = useState(1);
  const [language, setLanguage] = useState<Language>('es');
  const [program, setProgram] = useState<ArchitecturalProgram>(INITIAL_PROGRAM);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOriginalPdfOpen, setIsOriginalPdfOpen] = useState(false);
  const [showReview, setShowReview] = useState<Phase | null>(null);
  const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);

  const t = (key: any) => {
    if (typeof key === 'object' && key !== null) {
      return key[language] || '';
    }
    return UI_TRANSLATIONS[key]?.[language] || key;
  };

  const nextScreen = () => {
    if (phase === 1 && screen < 3) setScreen(screen + 1);
    else if (phase === 1 && screen === 3) { setShowReview(1); }
    else if (phase === 2) { setShowReview(2); }
    else if (phase === 3) {
      if (program.levels === 1) {
        if (screen < 2) setScreen(screen + 1);
        else { setShowReview(3); }
      } else {
        if (screen < 4) setScreen(screen + 1);
        else { setShowReview(3); }
      }
    }
    else if (phase === 4) { setShowReview(4); }
  };

  const confirmReview = () => {
    const r = showReview;
    setShowReview(null);
    if (r === 1) { setPhase(2); setScreen(1); }
    else if (r === 2) { setPhase(3); setScreen(1); }
    else if (r === 3) { setPhase(4); setScreen(1); }
    else if (r === 4) { setPhase(5); setScreen(1); }
  };

  const cancelReview = () => {
    setShowReview(null);
  };

  const prevScreen = () => {
    if (phase === 1 && screen > 1) setScreen(screen - 1);
    else if (phase === 2) { setPhase(1); setScreen(3); }
    else if (phase === 3) {
      if (screen > 1) setScreen(screen - 1);
      else { setPhase(2); setScreen(1); }
    }
    else if (phase === 4) {
      setPhase(3);
      setScreen(program.levels === 1 ? 2 : 4);
    }
    else if (phase === 5) { setPhase(4); setScreen(1); }
  };

  const updateProgram = (updates: Partial<ArchitecturalProgram>) => {
    setProgram(prev => ({ ...prev, ...updates }));
  };

  const areas = useMemo(() => {
    let interiorNet = 0;
    let exteriorNet = 0;
    const allSpaces = [...program.groundFloorSpaces, ...program.upperFloorSpaces];
    
    allSpaces.forEach(space => {
      const dims = program.spaceDimensions[space] || MIN_DIMENSIONS[space];
      const qty = program.spaceQuantities[space] || 1;
      if (dims) {
        const area = dims.l * dims.w * qty;
        const isExterior = MIN_DIMENSIONS[space]?.category === 'EXTERIOR';
        if (isExterior) exteriorNet += area;
        else interiorNet += area;
      }
    });

    const circulation = interiorNet * 0.15;
    const totalGross = interiorNet + circulation;
    return { interiorNet, exteriorNet, circulation, totalGross };
  }, [program.groundFloorSpaces, program.upperFloorSpaces, program.spaceDimensions, program.spaceQuantities]);

  return (
    <div className="min-h-screen bg-brand-neutral/30 flex flex-col items-center py-12 px-4">
      {/* Header with Language Selector */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-green-dark rounded-lg flex items-center justify-center text-brand-ink font-bold">B</div>
          <span className="font-bold tracking-tight text-brand-ink">Before Design</span>
        </div>
        
        <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 rounded-full border border-brand-ink/5 shadow-sm">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              language === 'en' ? 'bg-brand-ink text-white shadow-md' : 'text-brand-ink/40 hover:text-brand-ink'
            }`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('es')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              language === 'es' ? 'bg-brand-ink text-white shadow-md' : 'text-brand-ink/40 hover:text-brand-ink'
            }`}
          >
            ES
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-12 flex justify-between items-center relative">
        <div className="absolute h-1 bg-brand-ink/10 w-full top-1/2 -translate-y-1/2 z-0" />
        <div 
          className="absolute h-1 bg-brand-green-dark transition-all duration-500 top-1/2 -translate-y-1/2 z-0" 
          style={{ width: `${((phase - 1) / 4) * 100}%` }}
        />
        {[1, 2, 3, 4, 5].map((p) => (
          <div 
            key={p}
            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
              phase >= p ? 'bg-brand-green-dark text-brand-ink' : 'bg-white text-brand-ink/30 border border-brand-ink/10'
            }`}
          >
            {phase > p ? <CheckCircle2 size={20} /> : p}
          </div>
        ))}
      </div>

      <main className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {showReview !== null ? (
            <motion.div
              key={`review-${showReview}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ClientReviewScreen
                reviewPhase={showReview}
                program={program}
                language={language}
                t={t}
                onConfirm={confirmReview}
                onBack={cancelReview}
                areas={areas}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`${phase}-${screen}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass-card p-8 md:p-12"
            >
              {phase === 1 && <Phase1 screen={screen} program={program} updateProgram={updateProgram} language={language} t={t} />}
              {phase === 2 && <Phase2 screen={screen} program={program} updateProgram={updateProgram} language={language} t={t} />}
              {phase === 3 && <Phase3 screen={screen} program={program} updateProgram={updateProgram} language={language} t={t} />}
              {phase === 4 && <Phase4 screen={screen} program={program} updateProgram={updateProgram} language={language} t={t} />}
              {phase === 5 && <Phase5 program={program} language={language} t={t} setIsPreviewOpen={setIsPreviewOpen} setIsOriginalPdfOpen={setIsOriginalPdfOpen} setIsClientDashboardOpen={setIsClientDashboardOpen} />}

              {phase < 5 && (
                <div className="mt-12 flex justify-between items-center">
                  <button 
                    onClick={prevScreen}
                    disabled={phase === 1 && screen === 1}
                    className="flex items-center gap-2 text-brand-ink/60 hover:text-brand-ink transition-colors disabled:opacity-0"
                  >
                    <ArrowLeft size={20} /> {t('back')}
                  </button>
                  <button 
                    onClick={nextScreen}
                    className="btn-primary flex items-center gap-2"
                  >
                    {phase === 4 
                      ? t('finish')
                      : t('next')} <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Area Indicator */}
      {phase === 3 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-brand-ink text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 backdrop-blur-md border border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
                {t('estimated_total')}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-mono font-bold">{(areas.totalGross + areas.exteriorNet).toFixed(0)}</span>
                <span className="text-xs opacity-60">SqFt</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
                {t('interior')}
              </span>
              <span className="text-sm font-mono">{areas.totalGross.toFixed(0)} <small className="text-[10px]">SqFt</small></span>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isClientDashboardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-neutral/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <ClientDashboard onBack={() => setIsClientDashboardOpen(false)} />
          </motion.div>
        )}
        {isPreviewOpen && (
          <DesignBriefPreview 
            program={program} 
            language={language} 
            t={t} 
            onClose={() => setIsPreviewOpen(false)} 
          />
        )}
        {isOriginalPdfOpen && (
          <BeforeDesignOriginalView 
            program={program} 
            language={language} 
            t={t} 
            onClose={() => setIsOriginalPdfOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Phase Components ---

function Phase1({ screen, program, updateProgram, language, t }: { screen: number, program: ArchitecturalProgram, updateProgram: any, language: Language, t: (key: any) => string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const scrollTo = direction === 'left' ? scrollRef.current.scrollLeft - scrollAmount : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (screen === 1) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-brand-green-dark mb-2">
            <Users size={32} />
            <span className="text-sm font-semibold uppercase tracking-wider">{t('phase1_title')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium leading-tight">
            {t('phase1_subtitle')}
          </h2>
          <p className="text-brand-ink/60 text-lg">{t('phase1_prompt')}</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-brand-neutral rounded-3xl">
            <span className="text-lg font-medium">{t('how_many_people')}</span>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => {
                  const count = Math.max(1, program.inhabitantsCount - 1);
                  updateProgram({ 
                    inhabitantsCount: count,
                    inhabitants: program.inhabitants.slice(0, count)
                  });
                }}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-brand-ink hover:text-white transition-all"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-semibold w-8 text-center">{program.inhabitantsCount}</span>
              <button 
                onClick={() => {
                  const count = program.inhabitantsCount + 1;
                  updateProgram({ 
                    inhabitantsCount: count,
                    inhabitants: [...program.inhabitants, { gender: '', age: '', occupation: '' }]
                  });
                }}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-brand-ink hover:text-white transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.inhabitants.map((inh, idx) => (
              <div key={idx} className="p-6 bg-white border border-brand-ink/5 rounded-3xl space-y-4">
                <span className="text-sm font-medium text-brand-ink/40 uppercase">{t('person')} {idx + 1}</span>
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={inh.gender}
                    onChange={(e) => {
                      const newInh = [...program.inhabitants];
                      newInh[idx].gender = e.target.value;
                      updateProgram({ inhabitants: newInh });
                    }}
                    className="input-field"
                  >
                    <option value="">{t('gender')}</option>
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder={t('age')}
                    value={inh.age}
                    onChange={(e) => {
                      const newInh = [...program.inhabitants];
                      newInh[idx].age = e.target.value;
                      updateProgram({ inhabitants: newInh });
                    }}
                    className="input-field"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder={t('occupation')}
                  value={inh.occupation}
                  onChange={(e) => {
                    const newInh = [...program.inhabitants];
                    newInh[idx].occupation = e.target.value;
                    updateProgram({ inhabitants: newInh });
                  }}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <span className="text-lg font-medium">{t('pets')}</span>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'dog', label: t('dog'), icon: Dog },
                { id: 'cat', label: t('cat'), icon: Cat },
                { id: 'fish', label: t('fish'), icon: Fish },
                { id: 'bird', label: t('bird'), icon: Bird }
              ].map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => {
                    const newPets = program.pets.includes(pet.id)
                      ? program.pets.filter(p => p !== pet.id)
                      : [...program.pets, pet.id];
                    updateProgram({ pets: newPets });
                  }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${
                    program.pets.includes(pet.id) 
                      ? 'bg-brand-blue-dark text-brand-ink' 
                      : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                  }`}
                >
                  <pet.icon size={20} />
                  {pet.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 2) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-brand-blue-dark mb-2">
            <Heart size={32} />
            <span className="text-sm font-semibold uppercase tracking-wider">{t('phase1_routines_title')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium leading-tight">
            {t('phase1_routines_subtitle')}
          </h2>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-lg font-medium">{t('hobbies')}</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'reading', label: t('reading') },
                { id: 'cooking', label: t('cooking') },
                { id: 'gardening', label: t('gardening') },
                { id: 'sports', label: t('sports') },
                { id: 'art', label: t('art') },
                { id: 'gaming', label: t('gaming') },
                { id: 'music', label: t('music') },
                { id: 'cinema', label: t('cinema') }
              ].map((hobby) => (
                <button
                  key={hobby.id}
                  onClick={() => {
                    const newHobbies = program.hobbies.includes(hobby.id)
                      ? program.hobbies.filter(h => h !== hobby.id)
                      : [...program.hobbies, hobby.id];
                    updateProgram({ hobbies: newHobbies });
                  }}
                  className={`px-4 py-3 rounded-2xl text-center transition-all ${
                    program.hobbies.includes(hobby.id) 
                      ? 'bg-brand-green-dark text-brand-ink' 
                      : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                  }`}
                >
                  {hobby.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-brand-neutral rounded-3xl space-y-4">
              <span className="text-lg font-medium block">{t('overnight_guests')}</span>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={val ? 'si' : 'no'}
                    onClick={() => updateProgram({ frequentGuests: val })}
                    className={`flex-1 py-3 rounded-2xl transition-all ${
                      program.frequentGuests === val 
                        ? 'bg-brand-ink text-white' 
                        : 'bg-white text-brand-ink/60'
                    }`}
                  >
                    {val ? t('yes') : t('no')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-brand-neutral rounded-3xl space-y-4">
              <span className="text-lg font-medium block">{t('special_needs')}</span>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={val ? 'si' : 'no'}
                    onClick={() => updateProgram({ accessibilityNeeds: val })}
                    className={`flex-1 py-3 rounded-2xl transition-all ${
                      program.accessibilityNeeds === val 
                        ? 'bg-brand-ink text-white' 
                        : 'bg-white text-brand-ink/60'
                    }`}
                  >
                    {val ? t('priority') : t('no')}
                  </button>
                ))}
              </div>
              <p className="text-xs text-brand-ink/40">{t('special_needs_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 3) {
    return (
      <div className="space-y-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-brand-ink mb-2">
            <Palette size={32} />
            <span className="text-sm font-semibold uppercase tracking-wider">{t('phase1_aesthetics_title')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium leading-tight">
            {t('phase1_aesthetics_subtitle')}
          </h2>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-lg font-medium">{t('arch_style')}</span>
              <p className="text-sm text-brand-ink/50">{t('arch_style_desc')}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-full bg-white border border-brand-ink/10 flex items-center justify-center hover:bg-brand-ink hover:text-white transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-full bg-white border border-brand-ink/10 flex items-center justify-center hover:bg-brand-ink hover:text-white transition-all shadow-sm active:scale-95"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x scroll-smooth -mx-4 px-4"
          >
            {[
              { id: 'traditional', icon: Home },
              { id: 'ranch', icon: Warehouse },
              { id: 'classic_colonial', icon: Landmark },
              { id: 'modern', icon: Box },
              { id: 'modern_farmhouse', icon: Tractor },
              { id: 'contemporary', icon: Sparkles },
              { id: 'craftsman', icon: Hammer },
              { id: 'mediterranean', icon: Waves },
              { id: 'spanish_style', icon: Sun },
              { id: 'french_colonial', icon: Castle },
              { id: 'victorian', icon: Building2 },
              { id: 'tudor', icon: Tent },
              { id: 'cottage', icon: Trees },
              { id: 'rustic_cabin', icon: Mountain },
              { id: 'industrial_loft', icon: Factory }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => updateProgram({ style: style.id })}
                className={`min-w-[240px] h-56 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 transition-all snap-start border-2 ${
                  program.style === style.id 
                    ? 'bg-brand-ink text-white scale-105 shadow-2xl border-brand-ink' 
                    : 'bg-white border-brand-ink/5 text-brand-ink/60 hover:border-brand-ink/20 hover:bg-brand-neutral/30'
                }`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                  program.style === style.id ? 'bg-white/20 rotate-12' : 'bg-brand-neutral'
                }`}>
                  <style.icon size={40} strokeWidth={1.5} />
                </div>
                <div className="text-center px-4">
                  <span className="font-serif italic text-lg block leading-tight">
                    {t(style.id)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-8">
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-xl font-medium block">{t('favorite_color')}</span>
              <p className="text-sm text-brand-ink/50 leading-relaxed">
                {t('color_desc')}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              {['#F5F5F5', '#E5E4E2', '#D2B48C', '#BC8F8F', '#778899', '#556B2F', '#2F4F4F', '#FDF5E6'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateProgram({ favoriteColor: color })}
                  className={`w-14 h-14 rounded-full border-4 transition-all duration-300 hover:scale-110 ${
                    program.favoriteColor === color ? 'border-brand-ink scale-110 shadow-xl' : 'border-white shadow-sm'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative group">
                <input 
                  type="color" 
                  value={program.favoriteColor}
                  onChange={(e) => updateProgram({ favoriteColor: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-300 overflow-hidden ${
                    !['#F5F5F5', '#E5E4E2', '#D2B48C', '#BC8F8F', '#778899', '#556B2F', '#2F4F4F', '#FDF5E6'].includes(program.favoriteColor) 
                      ? 'border-brand-ink scale-110 shadow-xl' 
                      : 'border-white shadow-sm group-hover:border-brand-ink/20'
                  }`}
                  style={{ 
                    background: !['#F5F5F5', '#E5E4E2', '#D2B48C', '#BC8F8F', '#778899', '#556B2F', '#2F4F4F', '#FDF5E6'].includes(program.favoriteColor) 
                      ? program.favoriteColor 
                      : 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' 
                  }}
                >
                  <Plus size={24} className={!['#F5F5F5', '#E5E4E2', '#D2B48C', '#BC8F8F', '#778899', '#556B2F', '#2F4F4F', '#FDF5E6'].includes(program.favoriteColor) ? 'text-white drop-shadow-md' : 'text-brand-ink/40'} />
                </div>
              </div>
            </div>
            <p className="text-xs text-brand-ink/40 italic font-serif">
              {t('color_quote')}
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-xl font-medium block">{t('forbidden_colors')}</span>
              <p className="text-sm text-brand-ink/50 leading-relaxed">
                {t('forbidden_colors_prompt')}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              {['#FF00FF', '#FFFF00', '#00FF00', '#FF0000', '#0000FF', '#FFA500', '#800080', '#FFC0CB'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    const newForbidden = program.forbiddenColors.includes(color)
                      ? program.forbiddenColors.filter(c => c !== color)
                      : [...program.forbiddenColors, color];
                    updateProgram({ forbiddenColors: newForbidden });
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm ${
                    program.forbiddenColors.includes(color) ? 'ring-4 ring-brand-ink ring-offset-4 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {program.forbiddenColors.includes(color) && <Minus size={20} className="text-brand-ink" />}
                </button>
              ))}
              <div className="relative group">
                <input 
                  type="color" 
                  onChange={(e) => {
                    const color = e.target.value;
                    if (!program.forbiddenColors.includes(color)) {
                      updateProgram({ forbiddenColors: [...program.forbiddenColors, color] });
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="w-12 h-12 rounded-full border-2 border-dashed border-brand-ink/20 flex items-center justify-center transition-all group-hover:border-brand-ink/40 group-hover:bg-brand-neutral/30"
                  style={{ background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                >
                  <Plus size={20} className="text-brand-ink/40" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-8 border-t border-brand-ink/5">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-serif italic text-brand-ink/80">{t('personal_haven')}</h3>
            <p className="text-sm text-brand-ink/50">{t('personal_haven_prompt')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'living_room', key: 'living_room_fav', icon: Sofa },
              { id: 'main_kitchen', key: 'kitchen_fav', icon: UtensilsCrossed },
              { id: 'master_suite', key: 'master_bedroom_fav', icon: BedDouble },
              { id: 'office', key: 'office_fav', icon: PenTool },
              { id: 'terrace', key: 'terrace_fav', icon: Sun },
              { id: 'garden', key: 'garden_fav', icon: TreeDeciduous }
            ].map((room) => {
              return (
                <button
                  key={room.id}
                  onClick={() => updateProgram({ favoriteRoom: room.id })}
                  className={`p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all duration-500 border-2 ${
                    program.favoriteRoom === room.id 
                      ? 'bg-brand-ink text-white border-brand-ink shadow-xl scale-105' 
                      : 'bg-white border-brand-ink/5 text-brand-ink/60 hover:border-brand-ink/20 hover:bg-brand-neutral/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    program.favoriteRoom === room.id ? 'bg-white/20' : 'bg-brand-neutral'
                  }`}>
                    <room.icon size={24} />
                  </div>
                  <span className="text-sm font-medium text-center">{t(room.key)}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    );
  }
  return null;
}

function Phase2({ screen, program, updateProgram, language, t }: { screen: number, program: ArchitecturalProgram, updateProgram: any, language: Language, t: (key: any) => string }) {
  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-brand-green-dark mb-2">
          <Layers size={32} />
          <span className="text-sm font-semibold uppercase tracking-wider">{t('phase2_title')}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-medium leading-tight">
          {t('phase2_subtitle')}
        </h2>
        <p className="text-brand-ink/60 text-lg">{t('phase2_prompt')}</p>
      </div>

      <div className="space-y-12 pt-8 border-t border-brand-ink/5">
        {/* Levels Selection */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-medium">{t('how_many_stories')}</h3>
            <p className="text-brand-ink/60 text-sm">{t('phase2_prompt')}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 1, label: t('1_story'), icon: Home },
              { id: 2, label: t('2_stories'), icon: Layers },
              { id: 3, label: t('3_stories'), icon: Building2 }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateProgram({ levels: opt.id })}
                className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all border-2 ${
                  program.levels === opt.id 
                    ? 'bg-brand-ink text-white border-brand-ink shadow-lg scale-[1.02]' 
                    : 'bg-white text-brand-ink/60 border-brand-ink/5 hover:border-brand-ink/20'
                }`}
              >
                <opt.icon size={24} strokeWidth={program.levels === opt.id ? 2.5 : 1.5} />
                <span className="text-sm font-bold uppercase tracking-wider">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ceiling Height - Progressive Disclosure */}
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          key={program.levels}
          className="space-y-8 pt-8 border-t border-brand-ink/5"
        >
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-medium">{t('ceiling_height_title')}</h3>
              <p className="text-brand-ink/60 text-sm">{t('ceiling_height_prompt')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {program.levels === 1 ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {[
                      { id: 'standard_9ft', label: t('standard_9ft') },
                      { id: 'spacious_10ft', label: t('spacious_10ft') },
                      { id: 'luxury_12ft', label: t('luxury_12ft') },
                      { id: 'custom', label: t('custom') }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateProgram({ ceilingHeightMain: opt.id })}
                        className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all ${
                          program.ceilingHeightMain === opt.id 
                            ? 'bg-brand-ink text-white shadow-md' 
                            : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {program.ceilingHeightMain === 'custom' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 bg-brand-neutral/50 rounded-2xl border border-brand-ink/5"
                    >
                      <div className="flex-1">
                        <input 
                          type="text"
                          placeholder="Ex: 11.5"
                          value={program.customCeilingHeightMain}
                          onChange={(e) => updateProgram({ customCeilingHeightMain: e.target.value })}
                          className="w-full bg-transparent border-none focus:ring-0 text-brand-ink font-mono"
                        />
                      </div>
                      <span className="text-xs font-bold text-brand-ink/40 uppercase tracking-widest">Feet (ft)</span>
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">{t('ceiling_height_main')}</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'standard_9ft', label: '9 ft' },
                        { id: 'spacious_10ft', label: '10 ft' },
                        { id: 'luxury_12ft', label: '12+ ft' },
                        { id: 'custom', label: t('custom') }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => updateProgram({ ceilingHeightMain: opt.id })}
                          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all ${
                            program.ceilingHeightMain === opt.id 
                              ? 'bg-brand-ink text-white shadow-md' 
                              : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {program.ceilingHeightMain === 'custom' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-brand-neutral/50 rounded-2xl border border-brand-ink/5"
                      >
                        <div className="flex-1">
                          <input 
                            type="text"
                            placeholder="Ex: 11.5"
                            value={program.customCeilingHeightMain}
                            onChange={(e) => updateProgram({ customCeilingHeightMain: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 text-brand-ink font-mono"
                          />
                        </div>
                        <span className="text-xs font-bold text-brand-ink/40 uppercase tracking-widest">Feet (ft)</span>
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">{t('ceiling_height_upper')}</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'standard_8ft', label: '8 ft' },
                        { id: 'standard_9ft', label: '9 ft' },
                        { id: 'spacious_10ft', label: '10 ft' },
                        { id: 'custom', label: t('custom') }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => updateProgram({ ceilingHeightUpper: opt.id })}
                          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all ${
                            program.ceilingHeightUpper === opt.id 
                              ? 'bg-brand-ink text-white shadow-md' 
                              : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {program.ceilingHeightUpper === 'custom' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-brand-neutral/50 rounded-2xl border border-brand-ink/5"
                      >
                        <div className="flex-1">
                          <input 
                            type="text"
                            placeholder="Ex: 9.5"
                            value={program.customCeilingHeightUpper}
                            onChange={(e) => updateProgram({ customCeilingHeightUpper: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 text-brand-ink font-mono"
                          />
                        </div>
                        <span className="text-xs font-bold text-brand-ink/40 uppercase tracking-widest">Feet (ft)</span>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>

            {program.levels > 1 && (
              <button 
                onClick={() => updateProgram({ doubleHeight: !program.doubleHeight })}
                className="flex items-center gap-3 group cursor-pointer pt-2"
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  program.doubleHeight ? 'bg-brand-ink border-brand-ink' : 'border-brand-ink/20 group-hover:border-brand-ink/40'
                }`}>
                  {program.doubleHeight && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className="text-sm font-medium">{t('double_height_label')}</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Roof Style */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-medium">{t('roof_style_title')}</h3>
            <p className="text-brand-ink/60 text-sm">{t('roof_style_prompt')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'pitched', label: t('roof_pitched'), desc: t('roof_pitched_desc') },
              { id: 'flat', label: t('roof_flat'), desc: t('roof_flat_desc') }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateProgram({ roofStyle: opt.id })}
                className={`p-6 rounded-3xl text-left transition-all border-2 ${
                  program.roofStyle === opt.id 
                    ? 'bg-brand-ink text-white border-brand-ink shadow-lg' 
                    : 'bg-white text-brand-ink/60 border-brand-ink/5 hover:border-brand-ink/20'
                }`}
              >
                <span className="block text-lg font-semibold mb-1">{opt.label}</span>
                <span className="text-xs opacity-60 leading-relaxed">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Floor Plan Concept */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-medium">{t('floor_plan_concept_title')}</h3>
            <p className="text-brand-ink/60 text-sm">{t('floor_plan_concept_prompt')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'open', label: t('open_concept'), desc: t('open_concept_desc') },
              { id: 'traditional', label: t('traditional_layout'), desc: t('traditional_layout_desc') }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateProgram({ floorPlanConcept: opt.id })}
                className={`p-6 rounded-3xl text-left transition-all border-2 ${
                  program.floorPlanConcept === opt.id 
                    ? 'bg-brand-ink text-white border-brand-ink shadow-lg' 
                    : 'bg-white text-brand-ink/60 border-brand-ink/5 hover:border-brand-ink/20'
                }`}
              >
                <span className="block text-lg font-semibold mb-1">{opt.label}</span>
                <span className="text-xs opacity-60 leading-relaxed">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Basement Selection */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-medium">{t('basement_title')}</h3>
            <p className="text-brand-ink/60 text-sm">{t('basement_prompt')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'none', label: t('basement_none') },
              { id: 'finished', label: t('basement_finished') },
              { id: 'unfinished', label: t('basement_unfinished') },
              { id: 'walkout', label: t('basement_walkout') }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateProgram({ basement: opt.id })}
                className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                  program.basement === opt.id 
                    ? 'bg-brand-ink text-white border-brand-ink shadow-md' 
                    : 'bg-white text-brand-ink/60 border-brand-ink/5 hover:border-brand-ink/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footprint Selection */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-medium">{t('footprint_title')}</h3>
            <p className="text-brand-ink/60 text-sm">{t('footprint_prompt')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'rectangular', label: t('footprint_rectangular'), desc: t('footprint_rectangular_desc') },
              { id: 'l_shape', label: t('footprint_l_shape'), desc: t('footprint_l_shape_desc') },
              { id: 'u_shape', label: t('footprint_u_shape'), desc: t('footprint_u_shape_desc') }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateProgram({ footprint: opt.id })}
                className={`p-6 rounded-3xl text-left transition-all border-2 ${
                  program.footprint === opt.id 
                    ? 'bg-brand-ink text-white border-brand-ink shadow-lg' 
                    : 'bg-white text-brand-ink/60 border-brand-ink/5 hover:border-brand-ink/20'
                }`}
              >
                <span className="block text-lg font-semibold mb-1">{opt.label}</span>
                <span className="text-xs opacity-60 leading-relaxed">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase3({ screen, program, updateProgram, language, t }: { screen: number, program: ArchitecturalProgram, updateProgram: any, language: Language, t: (key: any) => string }) {
  // Screen 1: Planta Baja Selection
  // Screen 2: Planta Baja Details
  // Screen 3: Planta Alta Selection (if levels > 1)
  // Screen 4: Planta Alta Details (if levels > 1)

  const isGroundFloor = screen === 1 || screen === 2;
  const isDetails = screen === 2 || screen === 4;

  const currentSpaces = isGroundFloor ? program.groundFloorSpaces : program.upperFloorSpaces;
  const currentDetails = isGroundFloor ? program.groundFloorDetails : program.upperFloorDetails;

  const toggleSpace = (space: string) => {
    const list = isGroundFloor ? [...program.groundFloorSpaces] : [...program.upperFloorSpaces];
    const isRemoving = list.includes(space);
    let newList = isRemoving ? list.filter(s => s !== space) : [...list, space];
    
    // If removing a parent, also remove its children
    if (isRemoving) {
      Object.values(NESTED_SPACES).flat().forEach(group => {
        if (group.parent === space) {
          newList = newList.filter(s => !group.children.includes(s));
        }
      });
    }

    // Initialize dimensions and quantity if adding
    const newDims = { ...program.spaceDimensions };
    const newQtys = { ...program.spaceQuantities };
    if (!isRemoving) {
      const min = MIN_DIMENSIONS[space] || { l: 10, w: 10 };
      newDims[space] = { l: min.l, w: min.w, isCustom: false, isCorrected: false };
      newQtys[space] = 1;
    } else {
      delete newQtys[space];
    }

    if (isGroundFloor) updateProgram({ groundFloorSpaces: newList, spaceDimensions: newDims, spaceQuantities: newQtys });
    else updateProgram({ upperFloorSpaces: newList, spaceDimensions: newDims, spaceQuantities: newQtys });
  };

  const updateQuantity = (space: string, delta: number) => {
    const currentQty = program.spaceQuantities[space] || 1;
    const newQty = currentQty + delta;
    
    if (newQty <= 0) {
      toggleSpace(space);
    } else if (newQty <= 6) {
      updateProgram({
        spaceQuantities: {
          ...program.spaceQuantities,
          [space]: newQty
        }
      });
    }
  };

  const updateDimension = (space: string, field: 'l' | 'w', value: number) => {
    const min = MIN_DIMENSIONS[space] || { l: 1, w: 1 };
    const dims = { ...program.spaceDimensions[space] };
    
    let corrected = false;
    let note = '';
    let finalValue = value;

    if (field === 'l' && value < min.l) {
      finalValue = min.l;
      corrected = true;
      note = 'corrected_to_min';
    } else if (field === 'w' && value < min.w) {
      finalValue = min.w;
      corrected = true;
      note = 'corrected_to_min';
    }

    updateProgram({
      spaceDimensions: {
        ...program.spaceDimensions,
        [space]: {
          ...dims,
          [field]: finalValue,
          isCustom: true,
          isCorrected: corrected,
          note: note,
          field: field
        }
      }
    });
  };

  const updateDetail = (space: string, field: string, value: any) => {
    const details = isGroundFloor ? { ...program.groundFloorDetails } : { ...program.upperFloorDetails };
    if (!details[space]) details[space] = {};
    details[space][field] = value;
    
    if (isGroundFloor) updateProgram({ groundFloorDetails: details });
    else updateProgram({ upperFloorDetails: details });
  };

  if (!isDetails) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-brand-green-dark mb-2">
            <Home size={32} />
            <span className="text-sm font-semibold uppercase tracking-wider">{t('phase3_title')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium leading-tight">
            {isGroundFloor ? t('phase3_subtitle_ground') : t('phase3_subtitle_upper')}
          </h2>
          <p className="text-brand-ink/60 text-lg">{t('select_spaces_prompt')}</p>
        </div>

        <div className="space-y-12">
          {Object.entries(NESTED_SPACES).map(([category, groups]) => (
            <div key={category} className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-ink/30 border-b border-brand-ink/5 pb-2">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]?.[language] || category}
              </h3>
              <div className="space-y-4">
                {groups.map((group) => {
                  const isParentSelected = currentSpaces.includes(group.parent);
                  const parentQty = program.spaceQuantities[group.parent] || 1;
                  const parentAllowsMultiple = MULTIPLE_SPACES.includes(group.parent);
                  
                  const getQuantityLabel = (space: string, qty: number) => {
                    if (space.includes('Garaje') || space.includes('Garage')) return `${qty} ${qty === 1 ? t('auto') : t('autos')}`;
                    return qty;
                  };

                  return (
                    <div key={group.parent} className="space-y-3">
                      {/* Parent Chip */}
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => {
                            if (!isParentSelected) toggleSpace(group.parent);
                            else if (!parentAllowsMultiple) toggleSpace(group.parent);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              if (!isParentSelected) toggleSpace(group.parent);
                              else if (!parentAllowsMultiple) toggleSpace(group.parent);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                            isParentSelected
                              ? 'bg-brand-ink text-white shadow-lg scale-105'
                              : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                          } cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-green-dark`}
                        >
                          <span>{MIN_DIMENSIONS[group.parent]?.label?.[language] || group.parent}</span>
                          {isParentSelected && parentAllowsMultiple && (
                            <div className="flex items-center gap-2 ml-2 bg-white/10 rounded-lg px-1 py-0.5" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => updateQuantity(group.parent, -1)}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-[1rem] text-center text-xs font-bold">
                                {getQuantityLabel(group.parent, parentQty)}
                              </span>
                              <button 
                                onClick={() => updateQuantity(group.parent, 1)}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Children Revelation */}
                      <AnimatePresence>
                        {isParentSelected && group.children.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 pl-6 border-l-2 border-brand-ink/5 py-4 space-y-4">
                              <p className="text-xs font-serif italic text-brand-ink/40">
                                {t(group.prompt)}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {group.children.map((child) => {
                                  const isChildSelected = currentSpaces.includes(child);
                                  const childQty = program.spaceQuantities[child] || 1;
                                  const childAllowsMultiple = MULTIPLE_SPACES.includes(child);

                                  return (
                                    <div
                                      key={child}
                                      onClick={() => {
                                        if (!isChildSelected) toggleSpace(child);
                                        else if (!childAllowsMultiple) toggleSpace(child);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          if (!isChildSelected) toggleSpace(child);
                                          else if (!childAllowsMultiple) toggleSpace(child);
                                        }
                                      }}
                                      role="button"
                                      tabIndex={0}
                                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                                        isChildSelected
                                          ? 'bg-brand-green-dark/20 text-brand-ink border border-brand-green-dark/40 shadow-sm'
                                          : 'bg-brand-neutral/50 text-brand-ink/80 border border-transparent hover:bg-brand-neutral'
                                      } cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-green-dark`}
                                    >
                                      <span>{MIN_DIMENSIONS[child]?.label?.[language] || child}</span>
                                      {isChildSelected && childAllowsMultiple && (
                                        <div className="flex items-center gap-1.5 ml-1 bg-brand-ink/5 rounded-md px-1 py-0.5" onClick={(e) => e.stopPropagation()}>
                                          <button 
                                            onClick={() => updateQuantity(child, -1)}
                                            className="hover:bg-brand-ink/10 rounded transition-colors"
                                            aria-label="Disminuir cantidad"
                                          >
                                            <Minus size={10} />
                                          </button>
                                          <span className="min-w-[0.75rem] text-center text-[10px] font-bold">
                                            {getQuantityLabel(child, childQty)}
                                          </span>
                                          <button 
                                            onClick={() => updateQuantity(child, 1)}
                                            className="hover:bg-brand-ink/10 rounded transition-colors"
                                            aria-label="Aumentar cantidad"
                                          >
                                            <Plus size={10} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Details Screen
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-brand-blue-dark mb-2">
          <CheckCircle2 size={32} />
          <span className="text-sm font-semibold uppercase tracking-wider">{t('phase3_details_title')}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-medium leading-tight">
          {t('phase3_details_subtitle')}
        </h2>
        <p className="text-brand-ink/60 text-lg">{t('phase3_details_prompt')}</p>
      </div>

      <div className="space-y-4">
        {currentSpaces.map((space) => (
          <Accordion key={space} title={MIN_DIMENSIONS[space]?.label?.[language] || space}>
            <div className="p-6 bg-brand-neutral/50 rounded-2xl space-y-6">
              {/* Dimensions Engine */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-widest text-brand-ink/40">{t('dimensions_ft')}</span>
                  {program.spaceDimensions[space]?.isCorrected && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                      {t(program.spaceDimensions[space]?.note || '')} {MIN_DIMENSIONS[space]?.[program.spaceDimensions[space]?.field === 'l' ? 'l' : 'w']}'
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-brand-ink/60">{t('length')}</label>
                    <input 
                      type="number"
                      value={program.spaceDimensions[space]?.l}
                      onChange={(e) => updateDimension(space, 'l', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white border border-brand-ink/5 focus:ring-2 ring-brand-ink/10 outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-brand-ink/60">{t('width')}</label>
                    <input 
                      type="number"
                      value={program.spaceDimensions[space]?.w}
                      onChange={(e) => updateDimension(space, 'w', parseFloat(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white border border-brand-ink/5 focus:ring-2 ring-brand-ink/10 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-brand-ink/40 flex justify-between">
                  <span>{t('net_area')}: <strong className="text-brand-ink">{(program.spaceDimensions[space]?.l * program.spaceDimensions[space]?.w).toFixed(2)} SqFt</strong></span>
                  <span>{t('minimum')}: {MIN_DIMENSIONS[space]?.l}' x {MIN_DIMENSIONS[space]?.w}'</span>
                </div>
              </div>

              <div className="h-px bg-brand-ink/5" />

              {space.includes('kitchen') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('stove')}</label>
                    <div className="flex gap-2">
                      {['gas', 'electric', 'induction'].map(v => (
                        <button 
                          key={v}
                          onClick={() => updateDetail(space, 'stove', v)}
                          className={`flex-1 py-2 rounded-xl text-sm ${currentDetails[space]?.stove === v ? 'bg-brand-ink text-white' : 'bg-white'}`}
                        >{t(v)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('refrigerator')}</label>
                    <div className="flex gap-2">
                      {['standard', 'double_door'].map(v => (
                        <button 
                          key={v}
                          onClick={() => updateDetail(space, 'refri', v)}
                          className={`flex-1 py-2 rounded-xl text-sm ${currentDetails[space]?.refri === v ? 'bg-brand-ink text-white' : 'bg-white'}`}
                        >{t(v)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(space === 'master_suite' || space === 'secondary_bedrooms' || space === 'guest_bedroom') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('bed_size')}</label>
                    <div className="flex gap-2">
                      {['king', 'queen', 'full'].map(v => (
                        <button 
                          key={v}
                          onClick={() => updateDetail(space, 'bed', v)}
                          className={`flex-1 py-2 rounded-xl text-sm ${currentDetails[space]?.bed === v ? 'bg-brand-ink text-white' : 'bg-white'}`}
                        >{t(v)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('closet')}</label>
                    <div className="flex gap-2">
                      {['walk_in', 'wall'].map(v => (
                        <button 
                          key={v}
                          onClick={() => updateDetail(space, 'closet', v)}
                          className={`flex-1 py-2 rounded-xl text-sm ${currentDetails[space]?.closet === v ? 'bg-brand-ink text-white' : 'bg-white'}`}
                        >{t(v)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('extra_notes')}</label>
                <textarea 
                  placeholder={t('extra_notes_placeholder')}
                  value={currentDetails[space]?.notes || ''}
                  onChange={(e) => updateDetail(space, 'notes', e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                />
              </div>
            </div>
          </Accordion>
        ))}
      </div>
    </div>
  );
}

function Phase4({ screen, program, updateProgram, language, t }: { screen: number, program: ArchitecturalProgram, updateProgram: any, language: Language, t: (key: any) => string }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-brand-ink mb-2">
          <Palette size={32} />
          <span className="text-sm font-semibold uppercase tracking-wider">{t('phase4_title')}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-medium leading-tight">
          {t('phase4_subtitle')}
        </h2>
        <p className="text-brand-ink/60 text-lg">{t('phase4_prompt')}</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <span className="text-lg font-medium">{t('floors')}</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'wood_laminate', key: 'wood_laminate' },
              { id: 'stone', key: 'stone' },
              { id: 'tile', key: 'tile' },
              { id: 'polished_concrete', key: 'polished_concrete' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateProgram({ finishes: { ...program.finishes, floors: opt.id } })}
                className={`px-4 py-3 rounded-2xl text-sm transition-all ${
                  program.finishes.floors === opt.id 
                    ? 'bg-brand-ink text-white' 
                    : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                }`}
              >
                {t(opt.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-lg font-medium">{t('interior_walls')}</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'warm_paint', key: 'warm_paint' },
              { id: 'cool_paint', key: 'cool_paint' },
              { id: 'wallpaper', key: 'wallpaper' },
              { id: 'natural_wood', key: 'natural_wood' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateProgram({ finishes: { ...program.finishes, walls: opt.id } })}
                className={`px-4 py-3 rounded-2xl text-sm transition-all ${
                  program.finishes.walls === opt.id 
                    ? 'bg-brand-ink text-white' 
                    : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                }`}
              >
                {t(opt.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-lg font-medium">{t('roof')}</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'clay_tile', key: 'clay_tile' },
              { id: 'shingle', key: 'shingle' },
              { id: 'steel', key: 'steel' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateProgram({ finishes: { ...program.finishes, roof: opt.id } })}
                className={`px-4 py-3 rounded-2xl text-sm transition-all ${
                  program.finishes.roof === opt.id 
                    ? 'bg-brand-ink text-white' 
                    : 'bg-brand-neutral text-brand-ink/60 hover:bg-brand-neutral/80'
                }`}
              >
                {t(opt.key)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase5({ program, language, t, setIsPreviewOpen, setIsOriginalPdfOpen, setIsClientDashboardOpen }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, setIsPreviewOpen: (v: boolean) => void, setIsOriginalPdfOpen: (v: boolean) => void, setIsClientDashboardOpen: (v: boolean) => void }) {
  const areas = useMemo(() => {
    let interiorNet = 0;
    let exteriorNet = 0;
    const breakdown: any[] = [];

    const allSpaces = [...program.groundFloorSpaces, ...program.upperFloorSpaces];
    allSpaces.forEach(space => {
      const dims = program.spaceDimensions[space] || MIN_DIMENSIONS[space];
      const qty = program.spaceQuantities[space] || 1;
      if (dims) {
        const area = dims.l * dims.w * qty;
        const isExterior = MIN_DIMENSIONS[space]?.category === 'EXTERIOR';
        if (isExterior) exteriorNet += area;
        else interiorNet += area;

        breakdown.push({
          name: space,
          qty,
          l: dims.l,
          w: dims.w,
          area,
          isCustom: !!program.spaceDimensions[space]?.isCustom,
          isCorrected: !!program.spaceDimensions[space]?.isCorrected,
          note: program.spaceDimensions[space]?.note,
          isExterior
        });
      }
    });

    const circulation = interiorNet * 0.15;
    const totalGross = interiorNet + circulation;

    return { interiorNet, exteriorNet, circulation, totalGross, breakdown };
  }, [program.groundFloorSpaces, program.upperFloorSpaces, program.spaceDimensions, program.spaceQuantities]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-brand-ink/40 mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em]">{t('phase5_title')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight tracking-tighter">
            {t('phase5_subtitle')}
          </h2>
          <p className="text-brand-ink/60 text-lg font-serif italic">{t('phase5_prompt')}</p>
        </div>
        <button 
          onClick={() => generateBeforeDesignPDF(program, language, t)}
          className="btn-secondary flex items-center gap-2 whitespace-nowrap"
        >
          <Download size={20} /> {t('export_pdf')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Breakdown by Category */}
          <section className="space-y-8">
            <h3 className="font-bold text-brand-ink/30 uppercase text-[10px] tracking-[0.2em] border-b border-brand-ink/10 pb-4">{t('breakdown_title')}</h3>
            <div className="space-y-10">
              {['SOCIAL', 'PRIVADOS', 'SERVICIOS', 'EXTERIORES'].map((cat) => {
                const catItems = areas.breakdown.filter(item => item.isExterior ? cat === 'EXTERIORES' : MIN_DIMENSIONS[item.name]?.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat} className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-dark" />
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS][language]}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {catItems.map((item, idx) => (
                        <div key={idx} className="p-5 bg-white border border-brand-ink/5 rounded-2xl flex justify-between items-center hover:shadow-md transition-all group">
                          <div className="space-y-1">
                            <span className="text-sm font-semibold block group-hover:text-brand-blue-dark transition-colors">
                              {item.qty > 1 && <span className="text-brand-ink/30 mr-1 font-mono text-xs">{item.qty}x</span>}
                              {MIN_DIMENSIONS[item.name]?.label?.[language] || item.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-brand-ink/40 font-mono tracking-tighter">{item.l}' x {item.w}'</span>
                              {item.isCorrected && (
                                <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">{t('corrected')}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-sm text-brand-ink">{item.area.toFixed(0)}</span>
                            <span className="text-[10px] opacity-30 ml-1 font-mono">SqFt</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Surface Analysis */}
          <section className="p-10 bg-brand-neutral/40 rounded-[3rem] border border-brand-ink/5 space-y-8">
            <h3 className="font-bold text-brand-ink/30 uppercase text-[10px] tracking-[0.2em]">{t('surface_analysis')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-brand-ink/5">
                  <span className="text-sm text-brand-ink/60">{t('subtotal_net')}</span>
                  <span className="font-mono font-medium">{areas.interiorNet.toFixed(0)} SqFt</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-brand-ink/5">
                  <span className="text-sm text-brand-ink/60">{t('circulation_walls')}</span>
                  <span className="font-mono font-medium text-brand-ink/40">+{areas.circulation.toFixed(0)} SqFt</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-brand-ink/5">
                  <span className="text-sm text-brand-ink/60">{t('exterior_garage')}</span>
                  <span className="font-mono font-medium">{areas.exteriorNet.toFixed(0)} SqFt</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-brand-ink/5 flex flex-col justify-center items-center text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/30">{t('total_construction')}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-display font-bold text-brand-ink">{(areas.totalGross + areas.exteriorNet).toFixed(0)}</span>
                  <span className="text-sm font-medium opacity-30">SqFt</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="p-10 bg-brand-ink text-white rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <h3 className="font-bold text-white/30 uppercase text-[10px] tracking-[0.2em] relative z-10">{t('project_identity')}</h3>
            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('style')}</label>
                <p className="text-2xl font-serif italic text-brand-blue-dark">{t(program.style)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('levels')}</label>
                  <p className="text-lg font-medium">{program.levels} {program.levels === 1 ? t('story') : t('stories')}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('ceiling_height_title')}</label>
                  <p className="text-lg font-medium">{t(program.ceilingHeightMain)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('ideal_haven')}</label>
                <p className="text-lg font-medium">{MIN_DIMENSIONS[program.favoriteRoom]?.label?.[language] || program.favoriteRoom}</p>
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-white/40 leading-relaxed italic">
                  {t('legal_note')}
                </p>
              </div>

              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="w-full mt-4 py-4 bg-brand-blue-dark text-brand-ink font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <FileText size={20} />
                {t('preview_brief')}
              </button>

              <button 
                onClick={() => setIsClientDashboardOpen(true)}
                className="w-full mt-2 py-4 bg-brand-green-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-ink transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <Home size={20} />
                Portal del Cliente (Demo)
              </button>

              <button 
                onClick={() => setIsOriginalPdfOpen(true)}
                className="w-full py-3 border border-white/20 text-white/60 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                <ClipboardList size={16} />
                {t('view_original_pdf')}
              </button>
            </div>
          </section>

          <section className="p-10 bg-brand-blue-dark/5 border border-brand-blue-dark/10 rounded-[3rem] space-y-4">
            <div className="w-10 h-10 bg-brand-blue-dark/20 rounded-xl flex items-center justify-center text-brand-blue-dark">
              <Info size={20} />
            </div>
            <h3 className="font-bold text-brand-blue-dark uppercase text-[10px] tracking-[0.2em]">{t('next_step')}</h3>
            <p className="text-sm text-brand-ink/60 leading-relaxed font-medium">
              {t('next_step_desc')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// --- UI Helpers ---

const Accordion: React.FC<{ title: string, children: ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-brand-ink/5 rounded-3xl overflow-hidden bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center hover:bg-brand-neutral/30 transition-colors"
      >
        <span className="text-lg font-medium">{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- PDF Generation ---

async function generateBeforeDesignPDF(program: ArchitecturalProgram, language: Language, t: (key: any) => string) {
  try {
    // In a real scenario, we would load the template:
    // const pdfUrl = '/BEFORE_DESIGN.pdf';
    // const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    // const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // For now, we'll create a new one for demonstration
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { height } = page.getSize();
    
    page.drawText('ARCHCOS - DESIGN BRIEF', { x: 50, y: height - 50, size: 24, color: rgb(0.17, 0.24, 0.31) });
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: height - 80, size: 10 });
    
    page.drawText('PROJECT IDENTITY', { x: 50, y: height - 120, size: 14, color: rgb(0.17, 0.24, 0.31) });
    page.drawText(`Style: ${t(program.style)}`, { x: 50, y: height - 140, size: 12 });
    page.drawText(`Levels: ${program.levels}`, { x: 50, y: height - 160, size: 12 });
    page.drawText(`Ceiling Height: ${t(program.ceilingHeightMain)}`, { x: 50, y: height - 180, size: 12 });
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ARCHCOS_BeforeDesign_Project_${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please ensure the template is available.');
  }
}

// --- Preview Component ---

function DesignBriefPreview({ program, language, t, onClose }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, onClose: () => void }) {
  const areas = useMemo(() => {
    let interiorNet = 0;
    let exteriorNet = 0;
    const breakdown: any[] = [];

    const allSpaces = [...program.groundFloorSpaces, ...program.upperFloorSpaces];
    allSpaces.forEach(space => {
      const dims = program.spaceDimensions[space] || MIN_DIMENSIONS[space];
      const qty = program.spaceQuantities[space] || 1;
      if (dims) {
        const area = dims.l * dims.w * qty;
        const isExterior = MIN_DIMENSIONS[space]?.category === 'EXTERIOR';
        if (isExterior) exteriorNet += area;
        else interiorNet += area;

        breakdown.push({
          name: space,
          qty,
          l: dims.l,
          w: dims.w,
          area,
          category: MIN_DIMENSIONS[space]?.category
        });
      }
    });

    const circulation = interiorNet * 0.15;
    const totalGross = interiorNet + circulation;

    return { interiorNet, exteriorNet, circulation, totalGross, breakdown };
  }, [program]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#FAFAFA] overflow-y-auto no-scrollbar text-[#333333] font-sans"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-ink rounded flex items-center justify-center text-white font-bold">A</div>
          <span className="font-display font-bold tracking-tighter text-brand-ink">ARCHCOS</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => generateBeforeDesignPDF(program, language, t)}
            className="flex items-center gap-2 px-6 py-2 bg-brand-ink text-white rounded-full text-sm font-medium hover:bg-black transition-all"
          >
            <Download size={18} /> {t('download_official_pdf')}
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-16 space-y-24">
        {/* Header Section */}
        <header className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end border-b border-black/10 pb-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-display font-bold tracking-tighter leading-[0.9]">
              Design <br /> <span className="text-brand-ink">Brief.</span>
            </h1>
            <p className="font-serif italic text-xl text-black/60">
              {t('phase5_subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm uppercase tracking-widest font-bold text-black/40">
            <div className="space-y-1">
              <label>{t('person')}</label>
              <p className="text-brand-ink">Project Owner</p>
            </div>
            <div className="space-y-1">
              <label>Date</label>
              <p className="text-brand-ink">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </header>

        {/* Block 1: Architectural Concept */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-ink/30">01</span>
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{t('phase2_title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {[
              { label: t('style'), value: t(program.style), icon: <Palette size={20} /> },
              { label: t('levels'), value: `${program.levels} ${program.levels === 1 ? t('story') : t('stories')}`, icon: <Layers size={20} /> },
              { 
                label: t('ceiling_height_title'), 
                value: (() => {
                  const mainHeight = program.ceilingHeightMain === 'custom' 
                    ? `${program.customCeilingHeightMain || '0'} ft` 
                    : t(program.ceilingHeightMain);
                  const upperHeight = program.ceilingHeightUpper === 'custom' 
                    ? `${program.customCeilingHeightUpper || '0'} ft` 
                    : t(program.ceilingHeightUpper);
                  
                  return program.levels === 1 
                    ? mainHeight 
                    : `${t('ceiling_height_main')}: ${mainHeight} / ${t('ceiling_height_upper')}: ${upperHeight}`;
                })(),
                icon: <Maximize2 size={20} /> 
              },
              { label: t('roof_style_title'), value: t(program.roofStyle), icon: <Home size={20} /> },
              { label: t('floor_plan_concept_title'), value: t(program.floorPlanConcept), icon: <Layout size={20} /> },
              { label: t('ideal_haven'), value: MIN_DIMENSIONS[program.favoriteRoom]?.label?.[language] || program.favoriteRoom, icon: <Heart size={20} /> }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white border border-black/5 space-y-4">
                <div className="text-brand-ink/20">{item.icon}</div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/30">{item.label}</label>
                  <p className="text-lg font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Block 2: Surface Analysis */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-ink/30">02</span>
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{t('surface_analysis')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-12 bg-brand-ink text-white rounded-3xl space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Maximize2 size={24} />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest opacity-50">{t('total_construction')}</label>
                <p className="text-5xl font-display font-bold">{(areas.totalGross + areas.exteriorNet).toFixed(0)}</p>
                <p className="text-sm opacity-50 font-mono">Square Feet Total</p>
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-8 bg-white border border-black/5 rounded-3xl flex flex-col justify-between">
                <label className="text-xs uppercase tracking-widest font-bold text-black/30">{t('subtotal_net')}</label>
                <p className="text-3xl font-display font-bold">{areas.interiorNet.toFixed(0)} <span className="text-sm font-normal opacity-30">SqFt</span></p>
              </div>
              <div className="p-8 bg-white border border-black/5 rounded-3xl flex flex-col justify-between">
                <label className="text-xs uppercase tracking-widest font-bold text-black/30">{t('circulation_walls')}</label>
                <p className="text-3xl font-display font-bold text-brand-blue-dark">{areas.circulation.toFixed(0)} <span className="text-sm font-normal opacity-30">SqFt</span></p>
              </div>
              <div className="p-8 bg-white border border-black/5 rounded-3xl flex flex-col justify-between">
                <label className="text-xs uppercase tracking-widest font-bold text-black/30">{t('exterior_garage')}</label>
                <p className="text-3xl font-display font-bold">{areas.exteriorNet.toFixed(0)} <span className="text-sm font-normal opacity-30">SqFt</span></p>
              </div>
              <div className="p-8 bg-brand-neutral/50 border border-black/5 rounded-3xl flex flex-col justify-between italic">
                <p className="text-xs text-black/40 leading-relaxed">
                  {t('legal_note')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Block 3: Area Breakdown */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-ink/30">03</span>
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{t('breakdown_title')}</h2>
          </div>
          <div className="space-y-1">
            {['SOCIAL', 'PRIVADOS', 'SERVICIOS', 'EXTERIORES'].map((cat) => {
              const catItems = areas.breakdown.filter(item => item.category === cat);
              if (catItems.length === 0) return null;
              return (
                <div key={cat} className="group">
                  <div className="py-4 border-b border-black/5 flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black/40">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS][language]}</h4>
                    <span className="text-xs font-mono opacity-20">{catItems.length} Spaces</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 py-6">
                    {catItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-black/[0.03]">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-black/20">{(idx + 1).toString().padStart(2, '0')}</span>
                          <span className="text-sm font-medium">
                            {item.qty > 1 && <span className="text-black/30 mr-2">{item.qty}x</span>}
                            {MIN_DIMENSIONS[item.name]?.label?.[language] || item.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-black/40">{item.area.toFixed(0)} SqFt</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Block 4: Lifestyle & Finishes */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-ink/30">04</span>
              <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{t('phase4_title')}</h2>
            </div>
            <div className="space-y-6">
              {[
                { label: t('floors'), value: t(program.finishes.floors) },
                { label: t('interior_walls'), value: t(program.finishes.walls) },
                { label: t('roof_material'), value: t(program.finishes.roof) }
              ].map((f, i) => (
                <div key={i} className="flex justify-between items-end border-b border-black/5 pb-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/30">{f.label}</label>
                  <p className="text-lg font-serif italic">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-ink/30">05</span>
              <h2 className="text-2xl font-display font-bold uppercase tracking-tight">Lifestyle</h2>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-black/5 pb-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/30">{t('how_many_people')}</label>
                <p className="text-lg font-medium">{program.inhabitantsCount}</p>
              </div>
              <div className="flex justify-between items-end border-b border-black/5 pb-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/30">{t('pets')}</label>
                <p className="text-lg font-medium">{program.pets.length > 0 ? program.pets.map(p => t(p)).join(', ') : t('no')}</p>
              </div>
              <div className="flex justify-between items-end border-b border-black/5 pb-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/30">{t('overnight_guests')}</label>
                <p className="text-lg font-medium">{program.frequentGuests ? t('yes') : t('no')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-24 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">
          <div className="flex items-center gap-4">
            <span>© 2026 ARCHCOS</span>
            <span className="w-1 h-1 bg-black/10 rounded-full" />
            <span>Before Design Brief</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Mail size={12} />
              <span>contact@archcos.com</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink size={12} />
              <span>www.archcos.com</span>
            </div>
          </div>
        </footer>
      </div>
    </motion.div>
  );
}

// --- BEFORE DESIGN ORIGINAL View ---

function BeforeDesignOriginalView({ program, language, t, onClose }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  const Checkbox = ({ checked }: { checked: boolean }) => (
    <div className="w-4 h-4 border border-black flex items-center justify-center text-[10px] font-bold">
      {checked ? 'X' : ''}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 overflow-y-auto no-scrollbar print:bg-white print:p-0"
    >
      <div className="min-h-screen flex flex-col items-center py-10 print:py-0">
        {/* Controls */}
        <div className="w-full max-w-[8.5in] flex justify-between items-center mb-6 px-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all backdrop-blur-md"
          >
            <ArrowLeft size={18} /> {t('back_to_summary')}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-brand-blue-dark text-brand-ink font-bold rounded-xl hover:bg-white transition-all shadow-lg"
          >
            <Printer size={18} /> {language === 'en' ? 'Print Document' : 'Imprimir Documento'}
          </button>
        </div>

        {/* Paper Sheet */}
        <div className="w-[8.5in] min-h-[11in] bg-white shadow-2xl p-[0.5in] flex flex-col space-y-8 text-black font-sans print:shadow-none print:w-full print:min-h-0 print:p-0">
          
          {/* Header Section */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">A</div>
                <span className="text-2xl font-display font-bold tracking-tighter">ARCHCOS</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Architectural Design & Construction</p>
            </div>
            <div className="bg-gray-200 px-6 py-2 border border-black">
              <h1 className="text-xl font-bold uppercase tracking-widest">Before Design</h1>
            </div>
          </div>

          {/* Project Info Lines */}
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-end gap-2">
              <span className="font-bold uppercase text-[10px] whitespace-nowrap">Customer:</span>
              <div className="flex-1 border-b border-black pb-0.5 px-2 italic">
                {program.inhabitants[0]?.occupation || 'Project Owner'}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold uppercase text-[10px] whitespace-nowrap">Address:</span>
              <div className="flex-1 border-b border-black pb-0.5 px-2 italic">
                {program.footprint === 'rectangular' ? 'Standard Lot' : program.footprint === 'l_shape' ? 'Corner Lot' : 'U-Shape Lot'}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold uppercase text-[10px] whitespace-nowrap">Date:</span>
              <div className="flex-1 border-b border-black pb-0.5 px-2 italic">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Section 2: Inside Spaces Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest bg-gray-100 p-1 border border-black">Section 01: Inside Spaces</h2>
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-2 text-left w-1/4">Space</th>
                  <th className="border border-black p-2 text-left">Finish Type (Floors/Walls)</th>
                  <th className="border border-black p-2 text-left">Color Palettes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Kitchen', finish: program.finishes.floors, color: program.favoriteColor },
                  { name: 'Laundry', finish: program.finishes.floors, color: program.favoriteColor },
                  { name: 'Bathroom', finish: 'Tile / Porcelain', color: 'Neutral / White' },
                  { name: 'Bedroom', finish: program.finishes.floors, color: program.favoriteColor }
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="border border-black p-2 font-bold uppercase">{row.name}</td>
                    <td className="border border-black p-2">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                          <Checkbox checked={row.finish === 'wood_laminate' || row.finish === 'Laminate'} /> <span>Laminate</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Checkbox checked={row.finish === 'porcelain' || row.finish === 'Tile / Porcelain'} /> <span>Tile</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Checkbox checked={row.finish === 'stone'} /> <span>Stone</span>
                        </div>
                      </div>
                    </td>
                    <td className="border border-black p-2 italic">{row.color}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Outside Checkboxes */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest bg-gray-100 p-1 border border-black">Section 02: Outside</h2>
            <div className="grid grid-cols-3 gap-4 border border-black p-4 text-[10px]">
              <div className="space-y-2">
                <p className="font-bold border-b border-black pb-1 mb-2">Elevations</p>
                <div className="flex items-center gap-2"><Checkbox checked={program.style === 'modern'} /> <span>Modern</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={program.style === 'traditional'} /> <span>Traditional</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={program.style === 'industrial'} /> <span>Industrial</span></div>
              </div>
              <div className="space-y-2">
                <p className="font-bold border-b border-black pb-1 mb-2">Materials</p>
                <div className="flex items-center gap-2"><Checkbox checked={program.finishes.walls === 'brick'} /> <span>Brick</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={program.finishes.walls === 'stone'} /> <span>Stone</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={program.finishes.walls === 'warm_paint'} /> <span>Stucco</span></div>
              </div>
              <div className="space-y-2">
                <p className="font-bold border-b border-black pb-1 mb-2">Roofing</p>
                <div className="flex items-center gap-2"><Checkbox checked={program.roofStyle === 'flat'} /> <span>Flat</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={program.roofStyle === 'pitched'} /> <span>Pitched</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={program.finishes.roof === 'clay_tile'} /> <span>Clay Tile</span></div>
              </div>
            </div>
          </div>

          {/* Section 4: Questions */}
          <div className="space-y-2 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest bg-gray-100 p-1 border border-black">Section 03: Design Questions</h2>
            <div className="grid grid-cols-1 gap-3 text-[10px]">
              <div className="flex gap-2">
                <span className="font-bold">01.</span>
                <p>How many people will live in the house? <span className="border-b border-black px-2 italic">{program.inhabitantsCount}</span></p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">02.</span>
                <p>Do you have pets? <span className="border-b border-black px-2 italic">{program.pets.length > 0 ? program.pets.join(', ') : 'No'}</span></p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">03.</span>
                <p>What is your favorite room? <span className="border-b border-black px-2 italic">{t(program.favoriteRoom)}</span></p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">04.</span>
                <p>How many levels? <span className="border-b border-black px-2 italic">{program.levels}</span></p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">05.</span>
                <p>Ceiling Height: <span className="border-b border-black px-2 italic">
                  {program.ceilingHeightMain === 'custom' ? program.customCeilingHeightMain : program.ceilingHeightMain}
                </span></p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">06.</span>
                <p>Double Height Areas? <span className="border-b border-black px-2 italic">{program.doubleHeight ? 'Yes' : 'No'}</span></p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">07.</span>
                <p>Basement Type: <span className="border-b border-black px-2 italic">{t(program.basement)}</span></p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">08.</span>
                <p>Main Architectural Style: <span className="border-b border-black px-2 italic">{t(program.style)}</span></p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-black flex justify-between items-center text-[8px] uppercase tracking-widest font-bold opacity-40">
            <span>Archcos Before Design Standard Form</span>
            <span>Page 01 of 01</span>
            <span>Official Document</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
          }
          @page {
            size: letter;
            margin: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

// --- Client Review Screen ---

function ClientReviewScreen({
  reviewPhase,
  program,
  language,
  t,
  onConfirm,
  onBack,
  areas
}: {
  reviewPhase: Phase;
  program: ArchitecturalProgram;
  language: Language;
  t: (key: any) => string;
  onConfirm: () => void;
  onBack: () => void;
  areas: { interiorNet: number; exteriorNet: number; circulation: number; totalGross: number; };
}) {
  const phaseColors: Record<number, { bg: string; badge: string; border: string; accent: string }> = {
    1: { bg: 'from-emerald-50 to-teal-50', badge: 'bg-emerald-600', border: 'border-emerald-200', accent: 'text-emerald-700' },
    2: { bg: 'from-blue-50 to-indigo-50', badge: 'bg-blue-600', border: 'border-blue-200', accent: 'text-blue-700' },
    3: { bg: 'from-violet-50 to-purple-50', badge: 'bg-violet-600', border: 'border-violet-200', accent: 'text-violet-700' },
    4: { bg: 'from-amber-50 to-orange-50', badge: 'bg-amber-600', border: 'border-amber-200', accent: 'text-amber-700' },
  };
  const colors = phaseColors[reviewPhase] || phaseColors[1];

  const ReviewCard = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <div className={`p-4 bg-white rounded-2xl border ${colors.border} shadow-sm`}>
      <div className="flex items-start gap-3">
        {icon && <div className={`${colors.accent} mt-0.5 flex-shrink-0`}>{icon}</div>}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <div className="text-sm font-medium text-gray-800">{value}</div>
        </div>
      </div>
    </div>
  );

  const renderPhase1Content = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ReviewCard
        label={t('review_inhabitants')}
        icon={<Users size={16} />}
        value={
          <div className="space-y-1">
            <span className="block font-bold text-lg">{program.inhabitantsCount} {program.inhabitantsCount === 1 ? t('person') : (language === 'es' ? 'personas' : 'people')}</span>
            {program.inhabitants.slice(0, 3).map((inh, i) => (
              <span key={i} className="block text-xs text-gray-500">
                {t('person')} {i + 1}: {inh.gender ? t(inh.gender) : '—'}{inh.age ? `, ${inh.age} años` : ''}{inh.occupation ? ` · ${inh.occupation}` : ''}
              </span>
            ))}
          </div>
        }
      />
      <ReviewCard
        label={t('review_style')}
        icon={<Palette size={16} />}
        value={<span className="font-bold text-base capitalize">{t(program.style)}</span>}
      />
      <ReviewCard
        label={t('review_pets_hobbies')}
        icon={<Heart size={16} />}
        value={
          <div className="flex flex-wrap gap-1">
            {program.pets.length === 0 && program.hobbies.length === 0 && <span className="text-gray-400">—</span>}
            {program.pets.map(p => (
              <span key={p} className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge} text-white`}>{t(p)}</span>
            ))}
            {program.hobbies.map(h => (
              <span key={h} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{t(h)}</span>
            ))}
          </div>
        }
      />
      <ReviewCard
        label={t('review_special')}
        icon={<Info size={16} />}
        value={
          <div className="space-y-1">
            <span className="block">{t('review_guests')}: <strong>{program.frequentGuests ? t('yes') : t('no')}</strong></span>
            <span className="block">{t('special_needs')}: <strong>{program.accessibilityNeeds ? t('priority') : t('no')}</strong></span>
          </div>
        }
      />
      <ReviewCard
        label={t('personal_haven')}
        icon={<Home size={16} />}
        value={<span className="font-bold capitalize">{t(program.favoriteRoom + '_fav') || program.favoriteRoom}</span>}
      />
      <ReviewCard
        label={t('favorite_color')}
        icon={<Palette size={16} />}
        value={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: program.favoriteColor }} />
            <span className="font-mono text-sm">{program.favoriteColor}</span>
          </div>
        }
      />
    </div>
  );

  const renderPhase2Content = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ReviewCard
        label={t('review_levels_label')}
        icon={<Layers size={16} />}
        value={<span className="font-bold text-lg">{program.levels} {program.levels === 1 ? t('story') : t('stories')}</span>}
      />
      <ReviewCard
        label={t('review_ceiling')}
        icon={<Layout size={16} />}
        value={
          <div className="space-y-1">
            <span className="block">{t('ceiling_height_main')}: <strong>{t(program.ceilingHeightMain) || program.customCeilingHeightMain}</strong></span>
            {program.levels > 1 && (
              <span className="block">{t('ceiling_height_upper')}: <strong>{t(program.ceilingHeightUpper)}</strong></span>
            )}
            {program.doubleHeight && <span className={`block text-xs font-semibold ${colors.accent}`}>✓ {t('double_height_label')}</span>}
          </div>
        }
      />
      <ReviewCard
        label={t('review_basement')}
        icon={<Building2 size={16} />}
        value={<span className="font-bold">{t(program.basement)}</span>}
      />
      <ReviewCard
        label={t('review_footprint')}
        icon={<MapPin size={16} />}
        value={<span className="font-bold">{t('footprint_' + program.footprint)}</span>}
      />
      <ReviewCard
        label={t('review_roof')}
        icon={<Home size={16} />}
        value={<span className="font-bold">{t('roof_' + program.roofStyle)}</span>}
      />
      <ReviewCard
        label={t('review_floor_concept')}
        icon={<Layout size={16} />}
        value={<span className="font-bold">{program.floorPlanConcept === 'open' ? t('open_concept') : t('traditional_layout')}</span>}
      />
    </div>
  );

  const renderPhase3Content = () => {
    const groundCount = program.groundFloorSpaces.length;
    const upperCount = program.upperFloorSpaces.length;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ReviewCard
          label={t('review_total_area')}
          icon={<Maximize2 size={16} />}
          value={
            <div className="space-y-1">
              <span className="block font-bold text-xl">{(areas.totalGross + areas.exteriorNet).toFixed(0)} <small className="text-sm font-normal">SqFt</small></span>
              <span className="block text-xs text-gray-500">{t('subtotal_net')}: {areas.interiorNet.toFixed(0)} SqFt</span>
              <span className="block text-xs text-gray-500">{t('exterior_garage')}: {areas.exteriorNet.toFixed(0)} SqFt</span>
            </div>
          }
        />
        <ReviewCard
          label={t('review_ground_spaces')}
          icon={<Home size={16} />}
          value={
            <div>
              <span className="font-bold text-lg">{groundCount} {language === 'es' ? 'espacios' : 'spaces'}</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {program.groundFloorSpaces.slice(0, 6).map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {MIN_DIMENSIONS[s]?.label[language] || s}
                  </span>
                ))}
                {groundCount > 6 && <span className="text-xs text-gray-400">+{groundCount - 6} más</span>}
              </div>
            </div>
          }
        />
        {program.levels > 1 && (
          <ReviewCard
            label={t('review_upper_spaces')}
            icon={<Layers size={16} />}
            value={
              <div>
                <span className="font-bold text-lg">{upperCount} {language === 'es' ? 'espacios' : 'spaces'}</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {program.upperFloorSpaces.slice(0, 6).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {MIN_DIMENSIONS[s]?.label[language] || s}
                    </span>
                  ))}
                  {upperCount > 6 && <span className="text-xs text-gray-400">+{upperCount - 6} más</span>}
                </div>
              </div>
            }
          />
        )}
        <ReviewCard
          label={t('levels')}
          icon={<Building2 size={16} />}
          value={<span className="font-bold">{program.levels} {program.levels === 1 ? t('story') : t('stories')}</span>}
        />
      </div>
    );
  };

  const renderPhase4Content = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <ReviewCard
        label={t('review_floors_finish')}
        icon={<Layers size={16} />}
        value={<span className="font-bold">{t(program.finishes.floors)}</span>}
      />
      <ReviewCard
        label={t('review_walls_finish')}
        icon={<Layout size={16} />}
        value={<span className="font-bold">{t(program.finishes.walls)}</span>}
      />
      <ReviewCard
        label={t('review_roof_finish')}
        icon={<Home size={16} />}
        value={<span className="font-bold">{t(program.finishes.roof)}</span>}
      />
      <div className="col-span-1 md:col-span-3">
        <ReviewCard
          label={t('review_total_area')}
          icon={<Building2 size={16} />}
          value={
            <div className="flex flex-wrap gap-6">
              <div>
                <span className="text-xs text-gray-400 block">{t('subtotal_net')}</span>
                <span className="font-bold text-lg">{areas.interiorNet.toFixed(0)} SqFt</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">{t('exterior_garage')}</span>
                <span className="font-bold text-lg">{areas.exteriorNet.toFixed(0)} SqFt</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">{t('total_construction')}</span>
                <span className={`font-bold text-xl ${colors.accent}`}>{(areas.totalGross + areas.exteriorNet).toFixed(0)} SqFt</span>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );

  const titleKey = `review_phase${reviewPhase}_title`;
  const descKey = `review_phase${reviewPhase}_desc`;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} rounded-3xl p-1`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] p-8 md:p-12 shadow-xl">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`${colors.badge} text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg`}>
              <ClipboardList size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{t('review_checkpoint')}</span>
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${colors.accent} mb-1`}>
                {t('review_title')} · {language === 'es' ? 'Fase' : 'Phase'} {reviewPhase}
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                {t(titleKey)}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{t(descKey)}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px ${colors.border} border-t mb-8`} />

        {/* Phase-specific content */}
        <div className="mb-10">
          {reviewPhase === 1 && renderPhase1Content()}
          {reviewPhase === 2 && renderPhase2Content()}
          {reviewPhase === 3 && renderPhase3Content()}
          {reviewPhase === 4 && renderPhase4Content()}
        </div>

        {/* Confirmation banner */}
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${colors.border} bg-white mb-8`}>
          <CheckCircle2 size={20} className={colors.accent} />
          <p className="text-sm text-gray-600">
            {language === 'es'
              ? 'Revisa la información anterior. Si todo es correcto, confirma para continuar a la siguiente fase.'
              : 'Review the information above. If everything is correct, confirm to proceed to the next phase.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all font-medium w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={18} />
            {t('review_go_back')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl ${colors.badge} text-white font-semibold shadow-lg hover:opacity-90 hover:scale-105 transition-all w-full sm:w-auto justify-center`}
          >
            <CheckCircle2 size={18} />
            {t('review_confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
