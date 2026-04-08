/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MULTIPLE_SPACES = [
  'secondary_bedrooms',
  'full_bathrooms',
  'secondary_walk_in_closet',
  'wall_closet',
  'half_bath',
  'garage',
  'guest_bedroom',
  'balconies'
];

export const NESTED_SPACES: Record<string, { parent: string, children: string[], prompt: { en: string, es: string } }[]> = {
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

export const MIN_DIMENSIONS: Record<string, { label: { en: string, es: string }, l: number, w: number, category: 'INTERIOR' | 'EXTERIOR' }> = {
  foyer: { label: { en: 'Foyer', es: 'Foyer (Recibidor)' }, l: 5, w: 5, category: 'INTERIOR' },
  living_room: { label: { en: 'Living Room / Family Room', es: 'Sala de Estar / Familiar' }, l: 12, w: 12, category: 'INTERIOR' },
  formal_dining: { label: { en: 'Formal Dining Room', es: 'Comedor Formal' }, l: 10, w: 12, category: 'INTERIOR' },
  breakfast_nook: { label: { en: 'Breakfast Nook', es: 'Rincón de Desayuno' }, l: 10, w: 10, category: 'INTERIOR' },
  half_bath: { label: { en: 'Half Bath (Powder Room)', es: 'Medio Baño / Visitas' }, l: 3, w: 5, category: 'INTERIOR' },
  terrace: { label: { en: 'Terrace (Social Area)', es: 'Terraza / Área Social' }, l: 8, w: 10, category: 'EXTERIOR' },
  home_theater: { label: { en: 'Home Theater', es: 'Sala de Cine' }, l: 12, w: 14, category: 'INTERIOR' },
  game_room: { label: { en: 'Game Room', es: 'Sala de Juegos' }, l: 12, w: 16, category: 'INTERIOR' },
  bar: { label: { en: 'Bar / Cantina', es: 'Bar / Cantina' }, l: 5, w: 6, category: 'INTERIOR' },
  wine_room: { label: { en: 'Wine Room / Wine Display', es: 'Cava de Vinos' }, l: 6, w: 8, category: 'INTERIOR' },
  music_room: { label: { en: 'Music Room', es: 'Sala de Música' }, l: 10, w: 10, category: 'INTERIOR' },
  vertical_circulation: { label: { en: 'Vertical Circulation', es: 'Circulación Vertical' }, l: 6, w: 8, category: 'INTERIOR' },
  main_stairs: { label: { en: 'Main Stairs', es: 'Escaleras Principales' }, l: 8, w: 10, category: 'INTERIOR' },
  elevator_prep: { label: { en: 'Elevator Prep', es: 'Preparación para Elevador' }, l: 5, w: 5, category: 'INTERIOR' },
  outdoor_living: { label: { en: 'Outdoor Living Room', es: 'Sala Exterior' }, l: 12, w: 12, category: 'EXTERIOR' },
  main_kitchen: { label: { en: 'Main Kitchen', es: 'Cocina Principal' }, l: 12, w: 15, category: 'INTERIOR' },
  pantry: { label: { en: 'Walk-in Pantry', es: 'Despensa' }, l: 6, w: 8, category: 'INTERIOR' },
  prep_kitchen: { label: { en: 'Scullery / Prep Kitchen', es: 'Cocina de Preparación' }, l: 8, w: 10, category: 'INTERIOR' },
  butlers_pantry: { label: { en: 'Butler\'s Pantry', es: 'Despensa del Mayordomo' }, l: 6, w: 8, category: 'INTERIOR' },
  service_entrance: { label: { en: 'Catering Entrance', es: 'Entrada de Servicio' }, l: 6, w: 6, category: 'INTERIOR' },
  coffee_bar: { label: { en: 'Coffee Bar', es: 'Estación de Café' }, l: 4, w: 6, category: 'INTERIOR' },
  baking_center: { label: { en: 'Baking Center', es: 'Centro de Repostería' }, l: 6, w: 8, category: 'INTERIOR' },
  drop_zone: { label: { en: 'Drop Zone', es: 'Zona de Descarga' }, l: 5, w: 6, category: 'INTERIOR' },
  laundry_room: { label: { en: 'Laundry Room', es: 'Cuarto de Lavado' }, l: 5, w: 6, category: 'INTERIOR' },
  linen_closet: { label: { en: 'Linen Closet', es: 'Cuarto de Blancos' }, l: 2, w: 3, category: 'INTERIOR' },
  mudroom: { label: { en: 'Mudroom', es: 'Cuarto de Transición' }, l: 5, w: 5, category: 'INTERIOR' },
  pet_room: { label: { en: 'Pet Room / Dog Wash', es: 'Cuarto de Mascotas' }, l: 5, w: 6, category: 'INTERIOR' },
  storage: { label: { en: 'Storage', es: 'Bodega' }, l: 4, w: 4, category: 'INTERIOR' },
  service_room: { label: { en: 'Service Room (with bath)', es: 'Cuarto de Servicio' }, l: 8, w: 10, category: 'INTERIOR' },
  mechanical_room: { label: { en: 'Mechanical / Utility Room', es: 'Cuarto de Máquinas' }, l: 5, w: 5, category: 'INTERIOR' },
  master_suite: { label: { en: 'Master Suite', es: 'Recámara Principal' }, l: 12, w: 14, category: 'INTERIOR' },
  in_law_suite: { label: { en: 'In-Law Suite (Casita)', es: 'Casita / Suite Huéspedes' }, l: 12, w: 16, category: 'INTERIOR' },
  master_closet: { label: { en: 'Master Walk-in Closet', es: 'Vestidor Principal' }, l: 6, w: 6, category: 'INTERIOR' },
  master_bath: { label: { en: 'Master Bathroom', es: 'Baño Principal' }, l: 8, w: 10, category: 'INTERIOR' },
  secondary_bedrooms: { label: { en: 'Secondary Bedrooms', es: 'Recámaras Secundarias' }, l: 10, w: 10, category: 'INTERIOR' },
  guest_bedroom: { label: { en: 'Guest Bedroom', es: 'Recámara de Huéspedes' }, l: 10, w: 10, category: 'INTERIOR' },
  full_bathrooms: { label: { en: 'Full Bathrooms', es: 'Baños Completos' }, l: 5, w: 8, category: 'INTERIOR' },
  secondary_walk_in_closet: { label: { en: 'Secondary Walk-in Closet', es: 'Vestidor Secundario' }, l: 5, w: 5, category: 'INTERIOR' },
  wall_closet: { label: { en: 'Wall Closet', es: 'Closet de Pared' }, l: 2, w: 6, category: 'INTERIOR' },
  office: { label: { en: 'Office / Study', es: 'Oficina / Estudio' }, l: 8, w: 10, category: 'INTERIOR' },
  library: { label: { en: 'Library', es: 'Biblioteca' }, l: 10, w: 10, category: 'INTERIOR' },
  nursery: { label: { en: 'Nursery', es: 'Cuarto de Bebé' }, l: 8, w: 9, category: 'INTERIOR' },
  gym: { label: { en: 'Home Gym', es: 'Gimnasio' }, l: 10, w: 10, category: 'INTERIOR' },
  yoga_studio: { label: { en: 'Yoga / Meditation Studio', es: 'Estudio de Yoga' }, l: 8, w: 8, category: 'INTERIOR' },
  private_spa: { label: { en: 'Private Sauna / Spa', es: 'Sauna / Spa Privado' }, l: 5, w: 5, category: 'INTERIOR' },
  safe_room: { label: { en: 'Safe Room / Panic Room', es: 'Habitación de Pánico' }, l: 4, w: 4, category: 'INTERIOR' },
  garage: { label: { en: 'Garage / Covered Carport', es: 'Cochera Techada' }, l: 12, w: 20, category: 'EXTERIOR' },
  garden: { label: { en: 'Front / Back Garden', es: 'Jardín' }, l: 15, w: 20, category: 'EXTERIOR' },
  pool: { label: { en: 'Swimming Pool', es: 'Alberca' }, l: 10, w: 20, category: 'EXTERIOR' },
  jacuzzi: { label: { en: 'Jacuzzi / Hot Tub', es: 'Jacuzzi' }, l: 6, w: 6, category: 'EXTERIOR' },
  front_porch: { label: { en: 'Front Porch', es: 'Porche Delantero' }, l: 5, w: 8, category: 'EXTERIOR' },
  courtyard: { label: { en: 'Courtyard / Interior Patio', es: 'Patio Interior' }, l: 10, w: 10, category: 'EXTERIOR' },
  outdoor_kitchen: { label: { en: 'Outdoor Kitchen', es: 'Cocina Exterior' }, l: 6, w: 8, category: 'EXTERIOR' },
  outdoor_dining: { label: { en: 'Outdoor Dining', es: 'Comedor Exterior' }, l: 10, w: 10, category: 'EXTERIOR' },
  firepit: { label: { en: 'Firepit Area', es: 'Fogatero' }, l: 12, w: 12, category: 'EXTERIOR' },
  pool_house: { label: { en: 'Pool House', es: 'Estancia de Alberca' }, l: 10, w: 12, category: 'EXTERIOR' },
  deck: { label: { en: 'Deck / Wooden Platform', es: 'Deck de Madera' }, l: 10, w: 10, category: 'EXTERIOR' },
  roof_garden: { label: { en: 'Roof Garden / Green Roof', es: 'Roof Garden' }, l: 10, w: 10, category: 'EXTERIOR' },
  balconies: { label: { en: 'Balconies', es: 'Balcones' }, l: 4, w: 6, category: 'EXTERIOR' },
  tool_shed: { label: { en: 'Tool Shed', es: 'Cuarto de Herramientas' }, l: 5, w: 5, category: 'EXTERIOR' }
};

export const WET_SPACES = ['half_bath','master_bath','full_bathrooms','laundry_room','mudroom','pet_room','mechanical_room'];
export const KITCHEN_SPACES = ['main_kitchen','prep_kitchen','outdoor_kitchen','butlers_pantry','coffee_bar','baking_center'];
export const CLOSET_SPACES = ['master_closet','secondary_walk_in_closet','wall_closet','storage','linen_closet'];
export const OUTDOOR_SPACES = ['garage','garden','terrace','outdoor_living','courtyard','front_porch','deck','pool_house','outdoor_dining','firepit','pool','jacuzzi','roof_garden','balconies','tool_shed'];

export function getSpaceType(spaceId: string) {
  if (WET_SPACES.includes(spaceId)) return 'wet';
  if (KITCHEN_SPACES.includes(spaceId)) return 'kitchen';
  if (CLOSET_SPACES.includes(spaceId)) return 'closet';
  if (OUTDOOR_SPACES.includes(spaceId)) return 'outdoor';
  return 'general';
}

export const CATEGORY_LABELS: Record<string, { en: string, es: string }> = {
  SOCIAL: { en: 'Social Areas', es: 'Áreas Sociales' },
  SERVICIOS: { en: 'Service Areas', es: 'Áreas de Servicio' },
  PRIVADOS: { en: 'Private Areas', es: 'Áreas Privadas' },
  EXTERIORES: { en: 'Exterior Areas', es: 'Áreas Exteriores' }
};

export const ZONE_CONFIG: Record<string, { label: string; color: string; bgClass: string; borderClass: string; }> = {
  SOCIAL:    { label: 'Áreas Sociales',  color: '#4A90D9', bgClass: 'bg-brand-blue/8',   borderClass: 'border-brand-blue/20'  },
  SERVICIOS: { label: 'Áreas de Servicio', color: '#27AE60', bgClass: 'bg-brand-green/8', borderClass: 'border-brand-green/20' },
  PRIVADOS:  { label: 'Áreas Privadas',  color: '#8E44AD', bgClass: 'bg-purple-50',      borderClass: 'border-purple-200'     },
  EXTERIORES:{ label: 'Áreas Exteriores', color: '#E67E22', bgClass: 'bg-orange-50',      borderClass: 'border-orange-200'     },
};

export const FLOOR_OPTIONS: Record<string, { value: string, labelEs: string }[]> = {
  outdoor: [
    { value: 'exterior_pavers',     labelEs: 'Adoquín / Pavers Exteriores' },
    { value: 'wood_deck',           labelEs: 'Duela de Madera / Composite' },
    { value: 'stamped_concrete',    labelEs: 'Concreto Estampado' },
    { value: 'natural_stone',       labelEs: 'Piedra Natural' },
    { value: 'porcelain_tile',      labelEs: 'Porcelana Exterior' },
    { value: 'grass_turf',          labelEs: 'Pasto Natural / Sintético' },
    { value: 'gravel',              labelEs: 'Gravilla' },
  ],
  closet:  [
    { value: 'wood_laminate',       labelEs: 'Madera / Laminado' },
    { value: 'carpet',              labelEs: 'Alfombra' },
    { value: 'vinyl_plank',         labelEs: 'Vinilo LVP' },
    { value: 'polished_concrete',   labelEs: 'Concreto Pulido' },
  ],
  wet: [
    { value: 'ceramic_tile',        labelEs: 'Azulejo / Cerámica' },
    { value: 'porcelain_tile',      labelEs: 'Porcelana' },
    { value: 'natural_stone',       labelEs: 'Piedra Natural' },
    { value: 'polished_concrete',   labelEs: 'Concreto Pulido' },
  ],
  general: [
    { value: 'hardwood',            labelEs: 'Madera Sólida (Hardwood)' },
    { value: 'wood_laminate',       labelEs: 'Madera / Laminado' },
    { value: 'vinyl_plank',         labelEs: 'Vinilo LVP' },
    { value: 'carpet',              labelEs: 'Alfombra' },
    { value: 'porcelain_tile',      labelEs: 'Porcelana / Tile Porcelánico' },
    { value: 'polished_concrete',   labelEs: 'Concreto Pulido' },
    { value: 'natural_stone',       labelEs: 'Piedra Natural' },
  ],
};

export const WALL_OPTIONS = [
  { value: 'smooth_paint',         labelEs: 'Pintura / Acabado Liso' },
  { value: 'textured_paint',       labelEs: 'Pintura con Textura (Llana / Yeso)' },
  { value: 'ceramic_tile',         labelEs: 'Azulejo / Cerámica' },
  { value: 'porcelain_tile',       labelEs: 'Porcelana' },
  { value: 'natural_stone',        labelEs: 'Piedra Natural' },
  { value: 'wood_paneling',        labelEs: 'Panelería de Madera' },
  { value: 'wallpaper',            labelEs: 'Papel Tapiz / Wallpaper' },
  { value: 'exposed_brick',        labelEs: 'Ladrillo Aparente' },
  { value: 'concrete',             labelEs: 'Concreto Expuesto / Aparente' },
  { value: 'shiplap',              labelEs: 'Shiplap / Tablón Rústico' },
];

export const CEILING_OPTIONS = [
  { value: 'smooth_paint',         labelEs: 'Pintura Lisa / Plafón Liso' },
  { value: 'coffered',             labelEs: 'Plafón Artesonado (Coffered)' },
  { value: 'tray',                 labelEs: 'Plafón en Bandeja (Tray Ceiling)' },
  { value: 'vaulted',              labelEs: 'Plafón Abovedado (Vaulted)' },
  { value: 'exposed_beam',         labelEs: 'Viga Expuesta / Beam Ceiling' },
  { value: 'wood_plank',           labelEs: 'Plafón de Madera (Planks)' },
  { value: 'gypsum_board',         labelEs: 'Tablaroca (Gypsum)' },
  { value: 'open_structure',       labelEs: 'Estructura Expuesta / Open' },
  { value: 'pergola',              labelEs: 'Pérgola / Semi-abierto (Exterior)' },
  { value: 'none',                 labelEs: 'Sin definir' },
];
