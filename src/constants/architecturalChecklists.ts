// src/constants/architecturalChecklists.ts
// Official ARCHCOS quality checklists per drawing/plan name.
// Relocated to shared constants to support both main project and standalone modules.

export interface ChecklistSection {
  title: string;
  items: string[];
}

export interface DrawingChecklist {
  drawingName: string;
  sections: ChecklistSection[];
}

// ─── Normalize a drawing name for lookup ──────────────────────────────────────
export function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ─── Checklist Map ────────────────────────────────────────────────────────────
const RAW_CHECKLISTS: DrawingChecklist[] = [
  {
    drawingName: 'Existing / Proposed Site Plan',
    sections: [
      {
        title: '1. Límites y Topografía',
        items: [
          'Límites de propiedad (Property lines) y servidumbres (Easements) claramente marcados.',
          'Líneas de colindancia (Setbacks) para construcción frontal, lateral y posterior.',
          'Zonas verdes (Green areas) y cálculo de superficie permeable.',
        ],
      },
      {
        title: '2. Accesos y Estacionamiento',
        items: [
          'Cortes de banqueta (Curb cuts) y dimensiones de las vías de acceso (Driveways).',
          'Tabla de análisis de estacionamiento (Requeridos vs. Provistos).',
          'Cajones "Van Accessible" con pasillos de acceso de tamaño reglamentario.',
        ],
      },
      {
        title: '3. Accesibilidad Exterior',
        items: [
          'Ruta accesible ininterrumpida desde la calle/estacionamiento hasta la entrada principal.',
          'Rampas accesibles con pendientes longitudinales (máx 1:12) y transversales (máx 1:48) acotadas.',
          'Superficies antiderrapantes y señalización táctil en transiciones de nivel.',
        ],
      },
      {
        title: '4. Infraestructura Exterior',
        items: [
          'Ubicación de postes eléctricos, transformadores y medidores.',
          'Ubicación de trampa de grasa (Grease Trap) exterior y conexiones pluviales/drenajes.',
          'Contenedores de basura (Dumpster enclosure) con radio de giro para camiones.',
        ],
      },
    ],
  },
  {
    drawingName: '1st & 2nd Floor Plan',
    sections: [
      {
        title: '1. Formato General y Cuadro de Datos',
        items: [
          'Nombre del Proyecto y Dirección completa.',
          'Título del Plano y Nomenclatura (ej. A-07).',
          'Escala gráfica o numérica correcta.',
        ],
      },
      {
        title: '2. Sistema de Dimensionamiento',
        items: [
          'Cotas Generales (Perímetro total).',
          'Cotas Interiores (Ejes, muros y aperturas).',
          'Líneas de Corte/Sección bien referenciadas.',
        ],
      },
      {
        title: '3. Representación Arquitectónica',
        items: [
          'Muros, Vanos y Abatimientos correctos.',
          'Circulaciones Verticales (Escaleras con flecha).',
          'Equipamiento Fijo y Mobiliario Sugerido.',
        ],
      },
      {
        title: '4. Etiquetas y Especificaciones Técnicas',
        items: [
          'Nomenclatura de Espacios y Alturas de Plafón.',
          'Niveles (FFL) y Dobles Alturas marcadas.',
          'Muros Cortafuego especificados (ej. Garage).',
        ],
      },
      {
        title: '5. Tablas de Resumen (Áreas)',
        items: [
          'Área Habitable desglosada y Total Living Space.',
          'Áreas No Habitables (Porches, patios, garajes).',
          'Huella del Edificio (Footprint) calculada.',
        ],
      },
    ],
  },
  {
    drawingName: 'Proposed Roof Plan',
    sections: [
      {
        title: '1. Geometría y Pendientes',
        items: [
          'Dirección de pendientes e inclinación numérica (Pitch, ej. 1/4" por pie).',
          'Juntas de expansión de techo y diseño geométrico (Limatesas, limahoyas).',
          'Crickets o sillas de agua dibujadas detrás de equipos para evitar encharcamientos.',
        ],
      },
      {
        title: '2. Drenaje Pluvial',
        items: [
          'Ubicación de drenajes de techo (Roof drains) o canalones (Gutters).',
          'Cantidad y ubicación de bajadas de agua pluvial (Downspouts).',
          'Drenajes de rebose (Overflow drains o scuppers) indicados.',
        ],
      },
      {
        title: '3. Equipos y Accesibilidad',
        items: [
          'Huella de equipos HVAC (Roof Top Units) y extractores.',
          'Plataformas de servicio (Walkpads / Walkboards) alrededor de equipos de mantenimiento.',
          'Escotillas de acceso al techo (Roof hatches) o escaleras de servicio.',
        ],
      },
    ],
  },
  {
    drawingName: 'Proposed Facades (Option A)',
    sections: [
      {
        title: '1. Niveles y Alturas Generales',
        items: [
          'Nivel de suelo natural (Natural Ground) y Nivel de Piso Terminado (FFL).',
          'Alturas de techo (Roof line) y parapetos.',
          'Altura libre bajo marquesinas, toldos o voladizos (Canopies).',
        ],
      },
      {
        title: '2. Materiales y Acabados',
        items: [
          'Leyenda o notas que especifiquen los materiales de fachada (Stucco, ladrillo, panel metálico).',
          'Modulación de perfiles de aluminio y vidrio (Storefront systems).',
          'Remates visuales (Copings, molduras o Cast Stone).',
        ],
      },
      {
        title: '3. Aperturas y Señalización',
        items: [
          'Ubicación de puertas exteriores y ventanas.',
          'Área designada para el letrero comercial (Signage band).',
          'Luminarias exteriores montadas en pared (Wall-mounted lighting).',
        ],
      },
    ],
  },
  {
    drawingName: 'Proposed Cross Sections',
    sections: [
      {
        title: '1. Niveles Verticales',
        items: [
          'Líneas de referencia vertical (Slab, Header line, Ceiling Height, Roof line).',
          'Cotas de plafones y cambios de nivel en techos (Soffits).',
          'Profundidad de cimientos o espesor de losa.',
        ],
      },
      {
        title: '2. Composición de Ensambles',
        items: [
          'Especificación de componentes del muro exterior e interior.',
          'Detalles de aislamiento térmico y acústico (R-values).',
          'Altura de muros demisorios (si llegan a plafón o hasta la cubierta/deck).',
        ],
      },
      {
        title: '3. Relación de Espacios y Equipamiento',
        items: [
          'Alzados que corten zonas críticas mostrando equipos grandes (Campanas de extracción, refrigeradores).',
          'Espacio libre (Clearance) por encima de equipos y debajo de plafones.',
        ],
      },
    ],
  },
  {
    drawingName: 'Life Safety & Fire Safety Plan',
    sections: [
      {
        title: '1. Cálculos de Ocupación',
        items: [
          'Clasificación de Uso (ej. A-2, B, M).',
          'Tabla de ocupantes con el factor correcto por área (Neto o Bruto).',
          'Carga total de ocupantes calculada correctamente.',
        ],
      },
      {
        title: '2. Rutas de Egreso',
        items: [
          'Cantidad de salidas requeridas vs. provistas.',
          'Líneas de distancia de viaje (Travel Distance) con cota de la distancia total.',
          'Verificación de que la ruta de egreso NO atraviese cocinas o cuartos de servicio.',
        ],
      },
      {
        title: '3. Señalización e Iluminación de Emergencia',
        items: [
          'Letreros luminosos de "EXIT" marcados sobre puertas de salida y corredores.',
          'Luces de emergencia en interiores y exterior de las descargas de salida (Exit Discharge).',
          'Señalización táctil en puertas de salida.',
        ],
      },
      {
        title: '4. Protección contra Incendios',
        items: [
          'Ubicación de extintores a distancias reglamentarias.',
          'Estrobos y estaciones manuales de alarma contra incendios (Pull stations).',
          'Muros cortafuego clasificados por horas (1-Hr, 2-Hr).',
        ],
      },
    ],
  },
  {
    drawingName: 'Accessibility Guidelines',
    sections: [
      {
        title: '1. Rutas Accesibles y Maniobras',
        items: [
          'Círculo de giro (60" de diámetro o en forma de T) marcado en planos de baño/cocina.',
          'Espacio libre de piso (Clear Floor Space) de 30"x48" en elementos clave.',
          'Espacios libres de maniobra en los lados de tracción/empuje de las puertas (Pull/Push clearances).',
        ],
      },
      {
        title: '2. Áreas de Servicio y Atención',
        items: [
          'Altura y profundidad libre de mostradores de atención (POS) acotadas.',
          'Rangos de alcance (Reach ranges) máximos y mínimos para interruptores y detectores.',
        ],
      },
      {
        title: '3. Referencias Normativas',
        items: [
          'Cotas referenciadas a las figuras del manual ADA o TAS.',
          'Detalles de barras de agarre, bebederos y señalización táctil.',
        ],
      },
    ],
  },
  {
    drawingName: 'Building Floor Penetration Plan',
    sections: [
      {
        title: '1. Plomería y Drenajes (Underground)',
        items: [
          'Ubicación precisa de drenajes de piso (Floor Sinks / Floor Drains).',
          'Rutas de descarga indirecta (Air Gaps) para fregaderos y fabricadores de hielo.',
          'Salidas de plomería para inodoros, lavabos y mop sinks.',
        ],
      },
      {
        title: '2. Conexiones Eléctricas y de Datos',
        items: [
          'Cajas de piso (Floor boxes) para electricidad o datos.',
          'Salidas desde el suelo (Stub-ups) referenciadas a la pared terminada más cercana.',
        ],
      },
      {
        title: '3. Sellado Contra Incendios',
        items: [
          'Especificaciones o notas sobre ensambles cortafuego (Firestopping) para las penetraciones.',
        ],
      },
    ],
  },
  {
    drawingName: 'Enlarged Restroom Plan & Elevations',
    sections: [
      {
        title: '1. Inodoros (Water Closets) y Lavabos',
        items: [
          'Centro del inodoro acotado (16" mínimo a 18" máximo a la pared lateral).',
          'Altura del lavabo y protección de tuberías (Knee/Toe clearance & pipe wrapping).',
          'Radio de abatimiento de puerta que no obstruya el espacio de maniobra interno.',
        ],
      },
      {
        title: '2. Accesorios y Barras de Agarre',
        items: [
          'Elevaciones mostrando la barra de 36" (posterior) y 42" (lateral) montadas a 33"-36" AFF.',
          'Ubicación acotada del dispensador de papel higiénico (7"-9" frente al WC).',
          'Altura de espejos (borde inferior reflectante máx a 40"), secadores de manos y jaboneras.',
        ],
      },
    ],
  },
  {
    drawingName: 'Interior Finish Plan',
    sections: [
      {
        title: '1. Tabla de Acabados (Finish Schedule)',
        items: [
          'Acabados de piso especificados por cuarto (Piso, Base, Muro, Plafón).',
          'Pisos y Muros en zonas de preparación lavables, lisos y no porosos (Requisito de Salud).',
        ],
      },
      {
        title: '2. Zoclos y Transiciones',
        items: [
          'Zoclo sanitario con curva (Coved tile base / Epoxy cove) en cocinas y baños.',
          'Tapetes empotrados (Walk-off mats) y perfiles de transición en puertas.',
        ],
      },
      {
        title: '3. Revestimientos Especiales',
        items: [
          'Muros en zonas húmedas protegidos con FRP o acero inoxidable a min 4\'-0" de altura.',
        ],
      },
    ],
  },
  {
    drawingName: 'Reflected Ceiling Plan',
    sections: [
      {
        title: '1. Modulación y Niveles',
        items: [
          'Parrilla del plafón reticular o acústico alineada y centrada.',
          'Cotas de cambios de nivel (Soffits) y alturas de plafón marcadas en cada cuarto.',
          'Cuadros de registro (Access panels) en techos cerrados.',
        ],
      },
      {
        title: '2. Iluminación y Dispositivos',
        items: [
          'Ubicación de luminarias, focos empotrados y lámparas colgantes (Pendants).',
          'Ubicación de luces de emergencia y letreros de salida luminosos.',
          'Ubicación de detectores de humo y estrobos visuales.',
        ],
      },
      {
        title: '3. Climatización y Extracción',
        items: [
          'Retornos de aire y difusores HVAC alineados a la retícula del plafón.',
          'Extractores de aire (Exhaust fans) en baños y rejillas de ventilación.',
        ],
      },
    ],
  },
  {
    drawingName: 'Doors & Windows Plan',
    sections: [
      {
        title: '1. Tablas y Especificaciones (Schedules)',
        items: [
          'Nomenclatura, Dimensiones (ancho y alto), tipo, material y acabado de cada puerta/ventana.',
          'Etiquetas de resistencia al fuego (Fire-rating en minutos u horas) donde sea aplicable.',
        ],
      },
      {
        title: '2. Funcionamiento y Dimensiones Físicas',
        items: [
          'Confirmación visual del sentido de apertura (Abatimiento).',
          'Ancho libre comprobado (Clear Width de mínimo 32" al abrir a 90 grados).',
        ],
      },
      {
        title: '3. Cerrajería y Herrajes (Hardware)',
        items: [
          'Cierrapuertas automáticos (Closers) y manijas tipo palanca (Lever handles comerciales).',
          'Barras antipánico (Panic hardware) en rutas de salida con alta ocupación.',
        ],
      },
    ],
  },
  {
    drawingName: 'Measurements Plan',
    sections: [
      {
        title: '1. Sistema de Cotas Generales',
        items: [
          'Cotas exteriores totales y parciales (Perímetro).',
          'Cotas que liguen elementos estructurales principales o ejes (Grid lines).',
        ],
      },
      {
        title: '2. Cotas Interiores y de Construcción',
        items: [
          'Cotas de muro a muro (a paños interiores/exteriores o centros, indicado claramente).',
          'Espesores de muro reales (incluyendo panel de yeso, CMU o acabados especiales).',
          'Cotas específicas que localicen puertas, ventanas, mochetas y divisiones de cubículos.',
        ],
      },
    ],
  },
  {
    drawingName: 'Electrical Lighting Plan',
    sections: [
      {
        title: '1. Distribución de Luminarias',
        items: [
          'Circuitos numerados y diferenciados.',
          'Tipo y potencia de cada luminaria.',
          'Interruptores y apagadores referenciados.',
        ],
      },
      {
        title: '2. Panel y Acometida',
        items: [
          'Diagrama unifilar actualizado.',
          'Calibre de conductores indicado.',
          'Protecciones (breakers) especificadas.',
        ],
      },
    ],
  },
  {
    drawingName: 'Water Plumbing Floor Plan',
    sections: [
      {
        title: '1. Red de Agua Fría y Caliente',
        items: [
          'Diámetros de tuberías indicados.',
          'Recorrido y pendientes de alimentación.',
          'Llaves de paso y válvulas marcadas.',
        ],
      },
      {
        title: '2. Muebles Sanitarios',
        items: [
          'Posición y referencia de cada mueble.',
          'Conexiones de agua fría y caliente.',
          'Trampa y ventilación de cada mueble.',
        ],
      },
    ],
  },
  {
    drawingName: 'DEFAULT',
    sections: [
      {
        title: '1. Formato General',
        items: [
          'Título, escala y nomenclatura correctos.',
          'Nombre del proyecto y número de plano.',
        ],
      },
      {
        title: '2. Contenido Técnico',
        items: [
          'Dimensiones y cotas completas.',
          'Notas y especificaciones incluidas.',
        ],
      },
      {
        title: '3. Revisión Final',
        items: [
          'Revisado contra planos relacionados.',
          'Sin conflictos con otras disciplinas.',
        ],
      },
    ],
  },
];

// ─── Pre-build lookup map ─────────────────────────────────────────────────────
const CHECKLIST_MAP = new Map<string, DrawingChecklist>();
RAW_CHECKLISTS.forEach(cl => {
  CHECKLIST_MAP.set(normalizeKey(cl.drawingName), cl);
});

// ─── Public lookup function ───────────────────────────────────────────────────
export function getChecklist(drawingName: string): DrawingChecklist {
  const key = normalizeKey(drawingName);

  // Exact match
  if (CHECKLIST_MAP.has(key)) return CHECKLIST_MAP.get(key)!;

  // Partial match
  for (const [mapKey, cl] of CHECKLIST_MAP.entries()) {
    if (key.includes(mapKey) || mapKey.includes(key)) return cl;
  }

  // Fallback to DEFAULT
  return CHECKLIST_MAP.get('default')!;
}

// ─── Render checklist as plain text for mailto body ───────────────────────────
export function renderChecklistText(drawingName: string, NL: string, TAB: string): string {
  const checklist = getChecklist(drawingName);

  const lines: string[] = [
    `────────────────────────────────────────────`,
    `📋 CHECKLIST DE REVISIÓN OBLIGATORIA: ${checklist.drawingName.toUpperCase()}`,
    `────────────────────────────────────────────`,
    ``,
  ];

  checklist.sections.forEach(section => {
    lines.push(section.title);
    section.items.forEach(item => {
      lines.push(`${TAB}[ ] ${item}`);
    });
    lines.push('');
  });

  return lines.join(NL);
}
