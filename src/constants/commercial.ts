import { Phase } from '../types/commercial';

export const COMMERCIAL_QUESTIONNAIRE: Phase[] = [
  {
    id: 'universal-intake',
    title: { en: '1. UNIVERSAL INTAKE & VIABILITY', es: '1. INGESTA UNIVERSAL Y VIABILIDAD' },
    description: { en: 'Strategic data to define the identity, location, and financial parameters of the project.', es: 'Datos estratégicos para definir la identidad, ubicación y parámetros financieros del proyecto.' },
    questions: [
      { 
        id: 'project_name', 
        label: { en: 'Project Name', es: 'Nombre del Proyecto' }, 
        type: 'Texto Corto', 
        placeholder: { en: 'Ex: Don Emilio / Houston North Project', es: 'Ej: Don Emilio / Proyecto Houston North' },
        helperText: { en: 'This name will help us identify your blueprint in our system.', es: 'Este nombre nos servirá para identificar tu blueprint en nuestro sistema.' },
        icon: 'FileText',
        required: true 
      },
      { 
        id: 'business_type', 
        label: { en: 'Business Type (The Router)', es: 'Giro Comercial (El Enrutador)' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Restaurante/F&B', label: { en: 'Restaurant/F&B', es: 'Restaurante/F&B' } },
          { value: 'Salud/Clínica', label: { en: 'Healthcare/Clinic', es: 'Salud/Clínica' } },
          { value: 'Oficina Corporativa', label: { en: 'Corporate Office', es: 'Oficina Corporativa' } },
          { value: 'Retail', label: { en: 'Retail', es: 'Retail' } },
          { value: 'Industrial', label: { en: 'Industrial', es: 'Industrial' } }
        ],
        helperText: { en: 'ARCHCOS uses this data to activate the specific parametric calculation engine for your industry.', es: 'ARCHCOS utiliza este dato para activar el motor de cálculo paramétrico específico para tu industria.' },
        icon: 'ClipboardCheck',
        required: true 
      },
      { 
        id: 'target_audience', 
        label: { en: 'Target Audience', es: 'Público Objetivo' }, 
        type: 'Chips', 
        options: [
          { value: 'Families', label: { en: 'Families', es: 'Familias' } },
          { value: 'Young Adults', label: { en: 'Young Adults', es: 'Jóvenes Adultos' } },
          { value: 'Professionals/Executives', label: { en: 'Professionals/Executives', es: 'Profesionales/Ejecutivos' } },
          { value: 'Students', label: { en: 'Students', es: 'Estudiantes' } },
          { value: 'General Public', label: { en: 'General Public', es: 'Público General' } },
          { value: 'Specialized Patients', label: { en: 'Specialized Patients', es: 'Pacientes Especializados' } }
        ],
        helperText: { en: 'Knowing your end user allows us to design flows and aesthetics that connect with them.', es: 'Conocer a tu usuario final nos permite diseñar flujos y estéticas que conecten con ellos.' },
        icon: 'Users',
        required: true 
      },
      { 
        id: 'project_location', 
        label: { en: 'Project Location', es: 'Ubicación del Proyecto' }, 
        type: 'Texto Corto', 
        placeholder: { en: 'Ex: 2052 W 15th St, Houston, TX 77008', es: 'Ej: 2052 W 15th St, Houston, TX 77008' },
        helperText: { en: 'Location influences local building codes and necessary permits.', es: 'La ubicación influye en los códigos de construcción locales y permisos necesarios.' },
        icon: 'MapPin',
        required: true 
      },
      { 
        id: 'legal_status', 
        label: { en: 'Site Legal Status', es: 'Estatus Legal del Sitio' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Purchased', label: { en: 'Land/Local purchased', es: 'Terreno/Local comprado' } },
          { value: 'Lease Signed', label: { en: 'Lease agreement signed', es: 'Contrato de arrendamiento firmado' } },
          { value: 'Due Diligence', label: { en: 'In negotiation/Due Diligence process', es: 'En proceso de negociación/Due Diligence' } },
          { value: 'Searching', label: { en: 'Searching for options', es: 'Buscando opciones' } }
        ],
        helperText: { en: 'Knowing your legal stage helps us prioritize deliverable speed.', es: 'Saber en qué etapa legal estás nos ayuda a priorizar la velocidad de los entregables.' },
        icon: 'Gavel',
        required: true 
      },
      { 
        id: 'intervention_type', 
        label: { en: 'What is the scope of work?', es: '¿Cuál es el alcance de la obra?' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Ground-up', label: { en: 'Ground-up / New construction', es: 'Ground-up / Construcción desde cero' } },
          { value: 'Tenant Improvement', label: { en: 'Tenant Improvement / Interior Remodel', es: 'Tenant Improvement / Remodelación interior' } },
          { value: 'Expansion', label: { en: 'Expansion of existing building', es: 'Expansión de edificio existente' } }
        ],
        optionIcons: {
          'Ground-up': 'Construction',
          'Tenant Improvement': 'PaintRoller',
          'Expansion': 'Maximize'
        },
        helperText: { en: 'This defines whether we start from a blank sheet or if we must integrate existing structures into the new design.', es: 'Esto define si partiremos de una hoja en blanco o si debemos integrar estructuras existentes en el nuevo diseño.' },
        icon: 'Construction',
        required: true 
      },
      { 
        id: 'as_built_plans', 
        label: { en: 'Do you have current architectural plans of the local/building?', es: '¿Cuenta con los planos arquitectónicos actuales del local/edificio?' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Digital 3D/CAD', label: { en: 'Yes, in digital 3D/CAD format', es: 'Sí, en formato digital 3D/CAD' } },
          { value: 'PDF/Paper', label: { en: 'Yes, but in PDF or paper', es: 'Sí, pero en PDF o papel' } },
          { value: 'No plans', label: { en: 'No plans', es: 'No tengo planos' } }
        ],
        optionIcons: {
          'Digital 3D/CAD': 'FileCode',
          'PDF/Paper': 'FileText',
          'No plans': 'Search'
        },
        helperText: { en: 'Having precise plans accelerates the process. If you don\'t have them, our team will perform a survey.', es: 'Tener planos precisos acelera el proceso. Si no cuenta con ellos, nuestro equipo realizará un levantamiento.' },
        condition: (state) => state.intervention_type === 'Tenant Improvement' || state.intervention_type === 'Expansion',
        icon: 'FileCode',
        required: true 
      },
      { 
        id: 'landlord_manual', 
        label: { en: 'Does the building manager (Landlord) have a design criteria manual?', es: '¿El administrador del edificio (Landlord) tiene un manual de lineamientos de diseño (Tenant Criteria Manual)?' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Yes', label: { en: 'Yes', es: 'Sí' } },
          { value: 'No', label: { en: 'No', es: 'No' } },
          { value: 'Not sure', label: { en: 'Not sure', es: 'No estoy seguro' } }
        ],
        optionIcons: {
          'Yes': 'CheckCircle2',
          'No': 'XCircle',
          'Not sure': 'HelpCircle'
        },
        helperText: { en: 'Many shopping centers or corporate buildings have a "Tenant Criteria Manual". Knowing it avoids rejections in plan approval.', es: 'Muchos centros comerciales o edificios corporativos tienen un "Tenant Criteria Manual". Conocerlo evita rechazos en la aprobación de planos.' },
        icon: 'BookOpen',
        required: true 
      },
      { 
        id: 'strategic_priority', 
        label: { en: 'Regarding your estimated opening date, what is most critical for you?', es: 'Respecto a su fecha de apertura estimada, ¿qué es más crítico para usted?' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Time', label: { en: 'Open fast (Priority: Time)', es: 'Abrir rápido (Prioridad: Tiempo)' } },
          { value: 'Cost', label: { en: 'Keep budget low (Priority: Cost)', es: 'Mantener el presupuesto bajo (Prioridad: Costo)' } },
          { value: 'Quality', label: { en: 'Spectacular design (Priority: Quality)', es: 'Diseño espectacular (Prioridad: Calidad)' } }
        ],
        optionIcons: {
          'Time': 'Zap',
          'Cost': 'PiggyBank',
          'Quality': 'Sparkles'
        },
        helperText: { en: 'In architecture, the balance between time, cost, and quality is vital. Tell us what we should focus on most.', es: 'En arquitectura, el equilibrio entre tiempo, costo y calidad es vital. Díganos en qué debemos enfocarnos más.' },
        icon: 'Zap',
        required: true 
      },
      { 
        id: 'estimated_budget', 
        label: { en: 'Estimated Construction Budget', es: 'Presupuesto Estimado de Construcción' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: '< $250k', label: { en: '< $250k', es: '< $250k' } },
          { value: '$250k - $500k', label: { en: '$250k - $500k', es: '$250k - $500k' } },
          { value: '$500k - $850k', label: { en: '$500k - $850k', es: '$500k - $850k' } },
          { value: '$850k - $1.2M', label: { en: '$850k - $1.2M', es: '$850k - $1.2M' } },
          { value: '$1.2M - $2M', label: { en: '$1.2M - $2M', es: '$1.2M - $2M' } },
          { value: '$2M+', label: { en: '$2M+', es: '$2M+' } }
        ],
        helperText: { en: 'Helps us design realistically and suggest materials that keep the project within its financial viability.', es: 'Nos ayuda a diseñar de forma realista y sugerir materiales que mantengan el proyecto dentro de su viabilidad financiera.' },
        icon: 'DollarSign',
        required: true 
      },
      { 
        id: 'target_timeline', 
        label: { en: 'Target Timeline', es: 'Cronograma Objetivo' }, 
        type: 'Fecha', 
        helperText: { en: 'Defining an opening date allows us to plan permit and construction phases.', es: 'Definir una fecha de apertura nos permite planificar las fases de permisos y construcción.' },
        icon: 'Calendar',
        required: true 
      },
      { 
        id: 'global_style', 
        label: { en: 'Global Architectural Style', es: 'Estilo Arquitectónico Global' }, 
        type: 'Image Picker', 
        options: [
          { value: 'Modern Industrial', label: { en: 'Modern Industrial', es: 'Moderno Industrial' } },
          { value: 'Minimalist Corporate', label: { en: 'Minimalist Corporate', es: 'Corporativo Minimalista' } },
          { value: 'Warm & Organic', label: { en: 'Warm & Organic', es: 'Cálido y Orgánico' } },
          { value: 'Classic/Traditional', label: { en: 'Classic/Traditional', es: 'Clásico/Tradicional' } },
          { value: 'High-Tech', label: { en: 'High-Tech', es: 'Alta Tecnología' } },
          { value: 'Transitional', label: { en: 'Transitional', es: 'Transicional' } }
        ],
        helperText: { en: 'Your initial aesthetic preference guides the creative direction of our architects.', es: 'Tu preferencia estética inicial guía la dirección creativa de nuestros arquitectos.' },
        icon: 'Sparkles',
        required: true 
      },
    ],
  },
  // --- PHASE 2: SPACE INVENTORY & PARAMETRIC CALCULATOR ---
  {
    id: 'space-inventory-fb',
    title: { en: '2. SPACE INVENTORY (F&B)', es: '2. INVENTARIO ESPACIAL (F&B)' },
    description: { en: 'Define your restaurant areas. The system will calculate the minimum functional square footage.', es: 'Define las áreas de tu restaurante. El sistema calculará el metraje mínimo funcional.' },
    condition: (state) => state.business_type === 'Restaurante/F&B',
    questions: [
      { id: 'fb_dining', label: { en: 'Dining Area', es: 'Área de Comedor' }, type: 'Area Stepper', minSqFt: 400 },
      { id: 'fb_private_dining', label: { en: 'Private Dining', es: 'Salón Privado' }, type: 'Area Stepper', minSqFt: 200 },
      { id: 'fb_bar', label: { en: 'Bar / Lounge Area', es: 'Área de Bar / Lounge' }, type: 'Area Stepper', minSqFt: 150 },
      { id: 'fb_kitchen', label: { en: 'Main Kitchen (BOH)', es: 'Cocina Principal (BOH)' }, type: 'Area Stepper', minSqFt: 300 },
      { id: 'fb_prep', label: { en: 'Prep Kitchen', es: 'Área de Preparación' }, type: 'Area Stepper', minSqFt: 150 },
      { id: 'fb_dish', label: { en: 'Dishwashing Station', es: 'Estación de Lavado' }, type: 'Area Stepper', minSqFt: 80 },
      { id: 'fb_walkin_cool', label: { en: 'Walk-in Cooler', es: 'Walk-in Cooler' }, type: 'Area Stepper', minSqFt: 80 },
      { id: 'fb_walkin_freez', label: { en: 'Walk-in Freezer', es: 'Walk-in Freezer' }, type: 'Area Stepper', minSqFt: 60 },
      { id: 'fb_storage', label: { en: 'Dry Storage', es: 'Almacén Seco' }, type: 'Area Stepper', minSqFt: 100 },
      { id: 'fb_liquor', label: { en: 'Liquor Storage / Cellar', es: 'Cava / Almacén de Licores' }, type: 'Area Stepper', minSqFt: 40 },
      { id: 'fb_office', label: { en: 'Manager Office', es: 'Oficina de Manager' }, type: 'Area Stepper', minSqFt: 50 },
      { id: 'fb_breakroom', label: { en: 'Employee Breakroom', es: 'Cuarto de Empleados' }, type: 'Area Stepper', minSqFt: 80 },
      { id: 'fb_bath_staff', label: { en: 'Staff Restroom', es: 'Baño de Personal' }, type: 'Area Stepper', minSqFt: 40 },
      { id: 'fb_bath_ada', label: { en: 'Public ADA Restrooms', es: 'Baños ADA Públicos' }, type: 'Area Stepper', minSqFt: 60 },
      { id: 'fb_janitor', label: { en: 'Janitor\'s Closet', es: 'Janitor\'s Closet' }, type: 'Area Stepper', minSqFt: 20 },
      { id: 'fb_trash', label: { en: 'Trash / Recycling Room', es: 'Cuarto de Basura / Reciclaje' }, type: 'Area Stepper', minSqFt: 40 },
      { id: 'fb_loading', label: { en: 'Loading / Receiving Area', es: 'Área de Carga / Recepción' }, type: 'Area Stepper', minSqFt: 100 },
    ],
  },
  {
    id: 'space-inventory-office',
    title: { en: '2. SPACE INVENTORY (OFFICE)', es: '2. INVENTARIO ESPACIAL (OFICINAS)' },
    description: { en: 'Define your workspace. The system will calculate the minimum functional square footage.', es: 'Define los espacios de trabajo. El sistema calculará el metraje mínimo funcional.' },
    condition: (state) => state.business_type === 'Oficina Corporativa',
    questions: [
      { id: 'off_reception', label: { en: 'Reception / Lobby', es: 'Recepción / Lobby' }, type: 'Area Stepper', minSqFt: 150 },
      { id: 'off_open_work', label: { en: 'Workstations (Open Space)', es: 'Estaciones de Trabajo (Open Space)' }, type: 'Area Stepper', minSqFt: 50 },
      { id: 'off_exec_office', label: { en: 'Executive Office', es: 'Oficina Ejecutiva' }, type: 'Area Stepper', minSqFt: 150 },
      { id: 'off_private', label: { en: 'Standard Private Office', es: 'Oficina Privada Estándar' }, type: 'Area Stepper', minSqFt: 120 },
      { id: 'off_meeting_lg', label: { en: 'Large Meeting Room', es: 'Sala de Juntas Grande' }, type: 'Area Stepper', minSqFt: 300 },
      { id: 'off_meeting_sm', label: { en: 'Small Meeting Room (Huddle)', es: 'Sala de Juntas Pequeña (Huddle)' }, type: 'Area Stepper', minSqFt: 100 },
      { id: 'off_phone', label: { en: 'Phone Booth', es: 'Phone Booth (Privacidad)' }, type: 'Area Stepper', minSqFt: 15 },
      { id: 'off_training', label: { en: 'Training / Multipurpose Room', es: 'Sala de Capacitación / Multiusos' }, type: 'Area Stepper', minSqFt: 400 },
      { id: 'off_breakroom', label: { en: 'Breakroom / Kitchenette', es: 'Breakroom / Kitchenette' }, type: 'Area Stepper', minSqFt: 200 },
      { id: 'off_copy', label: { en: 'Copy / Print Room', es: 'Cuarto de Copiado / Impresión' }, type: 'Area Stepper', minSqFt: 60 },
      { id: 'off_it', label: { en: 'IT / Server Room', es: 'Cuarto de IT / Servidores' }, type: 'Area Stepper', minSqFt: 40 },
      { id: 'off_storage', label: { en: 'Storage / Archive', es: 'Almacén / Archivo' }, type: 'Area Stepper', minSqFt: 80 },
      { id: 'off_bath_ada', label: { en: 'ADA Restrooms', es: 'Baños ADA' }, type: 'Area Stepper', minSqFt: 60 },
      { id: 'off_janitor', label: { en: 'Janitor\'s Closet', es: 'Janitor\'s Closet' }, type: 'Area Stepper', minSqFt: 20 },
    ],
  },
  {
    id: 'space-inventory-medical',
    title: { en: '2. SPACE INVENTORY (HEALTHCARE)', es: '2. INVENTARIO ESPACIAL (HEALTHCARE)' },
    description: { en: 'Define your clinical areas. The system will calculate the minimum functional square footage.', es: 'Define las áreas clínicas. El sistema calculará el metraje mínimo funcional.' },
    condition: (state) => state.business_type === 'Salud/Clínica',
    questions: [
      { id: 'med_waiting', label: { en: 'Waiting Room', es: 'Sala de Espera' }, type: 'Area Stepper', minSqFt: 200 },
      { id: 'med_reception', label: { en: 'Reception / Check-in', es: 'Recepción / Check-in' }, type: 'Area Stepper', minSqFt: 100 },
      { id: 'med_exam', label: { en: 'Exam Room', es: 'Consultorio de Examen (Exam Room)' }, type: 'Area Stepper', minSqFt: 100 },
      { id: 'med_procedure', label: { en: 'Procedure Room', es: 'Sala de Procedimientos' }, type: 'Area Stepper', minSqFt: 150 },
      { id: 'med_nurse', label: { en: 'Nursing Station', es: 'Estación de Enfermería' }, type: 'Area Stepper', minSqFt: 80 },
      { id: 'med_lab', label: { en: 'Lab / Sample Collection', es: 'Laboratorio / Toma de Muestras' }, type: 'Area Stepper', minSqFt: 120 },
      { id: 'med_bio', label: { en: 'Bio-waste Room', es: 'Cuarto de Residuos Biológicos' }, type: 'Area Stepper', minSqFt: 40 },
      { id: 'med_storage', label: { en: 'Medical Supplies Storage', es: 'Almacén de Insumos Médicos' }, type: 'Area Stepper', minSqFt: 100 },
      { id: 'med_staff_lounge', label: { en: 'Staff Lounge', es: 'Staff Lounge' }, type: 'Area Stepper', minSqFt: 120 },
      { id: 'med_bath_staff', label: { en: 'Staff Restroom', es: 'Baño de Personal' }, type: 'Area Stepper', minSqFt: 40 },
      { id: 'med_bath_ada', label: { en: 'Patient ADA Restroom', es: 'Baño ADA Pacientes' }, type: 'Area Stepper', minSqFt: 65 },
      { id: 'med_it', label: { en: 'IT / Clinical Archive', es: 'Cuarto de IT / Archivo Clínico' }, type: 'Area Stepper', minSqFt: 60 },
      { id: 'med_janitor', label: { en: 'Janitor\'s Closet', es: 'Janitor\'s Closet' }, type: 'Area Stepper', minSqFt: 20 },
    ],
  },
  {
    id: 'space-inventory-retail',
    title: { en: '2. SPACE INVENTORY (RETAIL)', es: '2. INVENTARIO ESPACIAL (RETAIL)' },
    description: { en: 'Define your sales areas. The system will calculate the minimum functional square footage.', es: 'Define las áreas de venta. El sistema calculará el metraje mínimo funcional.' },
    condition: (state) => state.business_type === 'Retail',
    questions: [
      { id: 'ret_sales', label: { en: 'Sales Floor', es: 'Piso de Venta (Sales Floor)' }, type: 'Area Stepper', minSqFt: 500 },
      { id: 'ret_fitting', label: { en: 'Fitting Rooms', es: 'Probadores (Fitting Rooms)' }, type: 'Area Stepper', minSqFt: 25 },
      { id: 'ret_stock', label: { en: 'Stockroom / Storage', es: 'Bodega / Stockroom' }, type: 'Area Stepper', minSqFt: 150 },
      { id: 'ret_pos', label: { en: 'POS / Counter', es: 'Mostrador / POS' }, type: 'Area Stepper', minSqFt: 60 },
      { id: 'ret_window', label: { en: 'Display Windows', es: 'Escaparates / Display Windows' }, type: 'Area Stepper', minSqFt: 40 },
    ],
  },
  {
    id: 'space-inventory-industrial',
    title: { en: '2. SPACE INVENTORY (INDUSTRIAL)', es: '2. INVENTARIO ESPACIAL (INDUSTRIAL)' },
    description: { en: 'Define your operational areas. The system will calculate the minimum functional square footage.', es: 'Define las áreas operativas. El sistema calculará el metraje mínimo funcional.' },
    condition: (state) => state.business_type === 'Industrial',
    questions: [
      { id: 'ind_warehouse', label: { en: 'Warehouse Area', es: 'Área de Almacén (Warehouse)' }, type: 'Area Stepper', minSqFt: 1000 },
      { id: 'ind_dock', label: { en: 'Loading Dock', es: 'Andén de Carga (Loading Dock)' }, type: 'Area Stepper', minSqFt: 400 },
      { id: 'ind_office', label: { en: 'Mezzanine / Admin Office', es: 'Oficina Mezzanine / Administrativa' }, type: 'Area Stepper', minSqFt: 150 },
      { id: 'ind_restroom', label: { en: 'Staff Restrooms', es: 'Baños de Personal' }, type: 'Area Stepper', minSqFt: 80 },
      { id: 'ind_tool', label: { en: 'Tool / Maintenance Room', es: 'Cuarto de Herramientas / Mantenimiento' }, type: 'Area Stepper', minSqFt: 100 },
    ],
  },
  // --- PHASE 3: MATERIALITY & TECHNICAL QUALITY ---
  {
    id: 'materiality-fb',
    title: { en: '3. MATERIALITY & TECHNICAL QUALITY (F&B)', es: '3. MATERIALIDAD Y CALIDAD TÉCNICA (F&B)' },
    description: { en: 'Design requirements and health regulations for restaurants.', es: 'Exigencias de diseño y normativas de salud para restaurantes.' },
    condition: (state) => state.business_type === 'Restaurante/F&B',
    questions: [
      { 
        id: 'fb_floors', 
        label: { en: 'Kitchen Floors', es: 'Pisos en Cocina' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Epoxy', label: { en: 'Non-slip Epoxy (Health Dept Standard)', es: 'Epóxico Antiderrapante (Estándar Health Dept)' } },
          { value: 'Ceramic', label: { en: 'Industrial Ceramic', es: 'Cerámico Industrial' } },
          { value: 'Concrete', label: { en: 'Sealed Polished Concrete', es: 'Concreto Pulido Sellado' } }
        ] 
      },
      { 
        id: 'fb_hood', 
        label: { en: 'Exhaust System', es: 'Sistema de Extracción' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Type I', label: { en: 'Type I (Grease/Fire)', es: 'Tipo I (Grasa/Fuego)' } },
          { value: 'Type II', label: { en: 'Type II (Steam/Heat)', es: 'Tipo II (Vapor/Calor)' } },
          { value: 'None', label: { en: 'Not required', es: 'No requiere' } }
        ] 
      },
      { 
        id: 'fb_acoustics', 
        label: { en: 'Dining Area Acoustic Treatment', es: 'Tratamiento Acústico en Comedor' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Design Panels', label: { en: 'Design Acoustic Panels', es: 'Paneles Acústicos de Diseño' } },
          { value: 'Standard Ceiling', label: { en: 'Standard Acoustic Ceiling', es: 'Plafón Acústico Estándar' } },
          { value: 'None', label: { en: 'No treatment', es: 'Sin tratamiento' } }
        ] 
      },
      { 
        id: 'fb_grease_trap', 
        label: { en: 'Grease Trap', es: 'Trampa de Grasa' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Interior', label: { en: 'Interior (Under sink)', es: 'Interior (Bajo tarja)' } },
          { value: 'Exterior', label: { en: 'Exterior (Buried)', es: 'Exterior (Enterrada)' } },
          { value: 'Existing', label: { en: 'Existing', es: 'Existente' } }
        ] 
      },
    ],
  },
  {
    id: 'materiality-office',
    title: { en: '3. MATERIALITY & TECHNICAL QUALITY (OFFICE)', es: '3. MATERIALIDAD Y CALIDAD TÉCNICA (OFICINAS)' },
    description: { en: 'Corporate aesthetics and functionality.', es: 'Estética y funcionalidad corporativa.' },
    condition: (state) => state.business_type === 'Oficina Corporativa',
    questions: [
      { 
        id: 'off_style_detail', 
        label: { en: 'Design Aesthetic', es: 'Estética de Diseño' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Industrial', label: { en: 'Exposed Industrial', es: 'Industrial Expuesto' } },
          { value: 'Classic', label: { en: 'Classic Corporate', es: 'Corporativo Clásico' } },
          { value: 'Biophilic', label: { en: 'Biophilic (Plants/Natural)', es: 'Biofílico (Plantas/Natural)' } },
          { value: 'Minimalist', label: { en: 'Modern Minimalist', es: 'Minimalista Moderno' } }
        ] 
      },
      { 
        id: 'off_glass', 
        label: { en: 'Meeting Room Acoustic Privacy', es: 'Privacidad Acústica en Juntas' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Double Glass', label: { en: 'Double Glass (STC 45+)', es: 'Cristal Doble (STC 45+)' } },
          { value: 'Single Glass', label: { en: 'Single Glass', es: 'Cristal Sencillo' } },
          { value: 'Solid Wall', label: { en: 'Solid Wall with Window', es: 'Muro Sólido con Ventana' } }
        ] 
      },
      { 
        id: 'off_raised_floor', 
        label: { en: 'Data Infrastructure', es: 'Infraestructura de Datos' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Raised Floor', label: { en: 'Raised floor for cabling', es: 'Piso elevado para cableado' } },
          { value: 'Wall/Ceiling', label: { en: 'Wall/ceiling ducting', es: 'Canalización en muro/techo' } },
          { value: 'None', label: { en: 'Not required', es: 'No requiere' } }
        ] 
      },
    ],
  },
  {
    id: 'materiality-medical',
    title: { en: '3. MATERIALITY & TECHNICAL QUALITY (HEALTHCARE)', es: '3. MATERIALIDAD Y CALIDAD TÉCNICA (HEALTHCARE)' },
    description: { en: 'Clinical regulations and aseptic finishes.', es: 'Normativas clínicas y acabados asépticos.' },
    condition: (state) => state.business_type === 'Salud/Clínica',
    questions: [
      { 
        id: 'med_floors', 
        label: { en: 'Clinical Floors', es: 'Pisos Clínicos' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Medical Vinyl', label: { en: 'Medical Grade Vinyl (Seamless)', es: 'Vinil Grado Médico (Seamless)' } },
          { value: 'Porcelain', label: { en: 'Rectified Porcelain', es: 'Porcelanato Rectificado' } },
          { value: 'Clinical Epoxy', label: { en: 'Clinical Epoxy', es: 'Epóxico Clínico' } }
        ] 
      },
      { 
        id: 'med_radiation', 
        label: { en: 'Radiological Protection', es: 'Protección Radiológica' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Lead Lining', label: { en: 'Lead Lining', es: 'Blindaje de plomo (Lead Lining)' } },
          { value: 'None', label: { en: 'Not required', es: 'No requiere' } }
        ] 
      },
      { 
        id: 'med_lighting', 
        label: { en: 'Lighting Control', es: 'Control de Iluminación' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Dimmable', label: { en: 'Dimmable / Scenes', es: 'Dimerizable / Escenas' } },
          { value: 'Occupancy', label: { en: 'Occupancy Sensors', es: 'Sensores de Ocupación' } },
          { value: 'Standard', label: { en: 'Standard On/Off', es: 'Estándar On/Off' } }
        ] 
      },
      { 
        id: 'med_ceilings', 
        label: { en: 'Ceilings', es: 'Plafones' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Washable', label: { en: 'Washable Acoustic (Clean Room Standard)', es: 'Plafón Acústico Lavable (Clean Room Standard)' } },
          { value: 'Drywall', label: { en: 'Smooth Drywall', es: 'Drywall Liso' } },
          { value: 'Standard', label: { en: 'Standard', es: 'Estándar' } }
        ] 
      },
    ],
  },
  {
    id: 'materiality-retail',
    title: { en: '3. MATERIALITY & TECHNICAL QUALITY (RETAIL)', es: '3. MATERIALIDAD Y CALIDAD TÉCNICA (RETAIL)' },
    description: { en: 'Brand image and commercial durability.', es: 'Imagen de marca y durabilidad comercial.' },
    condition: (state) => state.business_type === 'Retail',
    questions: [
      { 
        id: 'ret_lighting', 
        label: { en: 'Accent Lighting (Display)', es: 'Iluminación de Acento (Display)' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'LED Tracks', label: { en: 'Adjustable LED tracks', es: 'Rieles LED ajustables' } },
          { value: 'Integrated', label: { en: 'Lighting integrated in furniture', es: 'Iluminación integrada en muebles' } },
          { value: 'Standard', label: { en: 'Standard', es: 'Estándar' } }
        ] 
      },
      { 
        id: 'ret_facade', 
        label: { en: 'Facade / Curb Appeal', es: 'Fachada / Curb Appeal' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Floor-to-Ceiling', label: { en: 'Floor-to-ceiling windows', es: 'Ventanales de piso a techo' } },
          { value: 'Custom Brand', label: { en: 'Custom brand facade', es: 'Fachada de marca personalizada' } },
          { value: 'Existing', label: { en: 'Existing', es: 'Existente' } }
        ] 
      },
      { 
        id: 'ret_security', 
        label: { en: 'Security Systems', es: 'Sistemas de Seguridad' }, 
        type: 'Checkboxes', 
        options: [
          { value: 'CCTV', label: { en: 'CCTV', es: 'CCTV' } },
          { value: 'EAS', label: { en: 'EAS (Theft antennas)', es: 'EAS (Antenas de robo)' } },
          { value: 'Metal Shutters', label: { en: 'Metal shutters', es: 'Cortinas metálicas' } }
        ] 
      },
    ],
  },
  {
    id: 'materiality-industrial',
    title: { en: '3. MATERIALITY & TECHNICAL QUALITY (INDUSTRIAL)', es: '3. MATERIALIDAD Y CALIDAD TÉCNICA (INDUSTRIAL)' },
    description: { en: 'Resistance and logistical operation.', es: 'Resistencia y operatividad logística.' },
    condition: (state) => state.business_type === 'Industrial',
    questions: [
      { 
        id: 'ind_floor_load', 
        label: { en: 'Floor Resistance', es: 'Resistencia de Piso' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Heavy', label: { en: 'Heavy load (Forklifts)', es: 'Carga pesada (Montacargas)' } },
          { value: 'Light', label: { en: 'Light load', es: 'Carga ligera' } },
          { value: 'Existing', label: { en: 'Existing', es: 'Existente' } }
        ] 
      },
      { 
        id: 'ind_hvac', 
        label: { en: 'Warehouse HVAC', es: 'Climatización de Almacén' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'Full', label: { en: 'Fully air-conditioned', es: 'Totalmente climatizado' } },
          { value: 'Forced', label: { en: 'Forced ventilation only', es: 'Solo ventilación forzada' } },
          { value: 'None', label: { en: 'Not required', es: 'No requiere' } }
        ] 
      },
      { 
        id: 'ind_lighting', 
        label: { en: 'Industrial Lighting', es: 'Iluminación Industrial' }, 
        type: 'Opción Múltiple', 
        options: [
          { value: 'LED High-bay', label: { en: 'LED High-bay', es: 'LED High-bay' } },
          { value: 'Standard', label: { en: 'Standard', es: 'Estándar' } },
          { value: 'Natural', label: { en: 'Natural (Skylights)', es: 'Natural (Tragaluces)' } }
        ] 
      },
    ],
  },
];
