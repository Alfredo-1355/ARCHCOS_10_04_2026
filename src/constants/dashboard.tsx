import React from 'react';

// --- MINIMALIST ICONS ---
export const DashIcons = {
    Building: ({ className = "w-6 h-6" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M3 21h18M5 21V5h14v16M9 9h6M9 13h6M9 17h6" />
        </svg>
    ),
    Check: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 12.611L8.923 17.5 20 6.5" />
        </svg>
    ),
    Search: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg width="1em" height="1em" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    Folder: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M3 7v10h18V9h-9l-2-2H3z" />
        </svg>
    ),
    Plus: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 5v14m-7-7h14" />
        </svg>
    ),
    Settings: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
    Info: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 11v9m0-16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    LogOut: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        </svg>
    ),
    Edit: ({ className = "w-4 h-4" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M11 4H4v16h16v-7m-3-9l4 4-9 9H8v-4l9-9z" />
        </svg>
    ),
    Trash: ({ className = "w-4 h-4" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
        </svg>
    ),
    MapPin: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" strokeWidth="1.5" />
        </svg>
    ),
    Calendar: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    // --- BRAND LOGO ---
    Logo: ({ className = "h-12", showText = true }: { className?: string, showText?: boolean }) => (
        <div className={`flex items-center gap-4 ${className}`}>
            <svg className="h-full aspect-square" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="25" width="60" height="60" rx="15" fill="#D4E6A5" fillOpacity="0.9" />
                <rect x="35" y="15" width="60" height="60" rx="15" fill="#AED9E6" fillOpacity="0.8" />
                <g transform="translate(42, 38)">
                    <rect x="0" y="0" width="16" height="16" fill="white" rx="1" />
                    <rect x="2" y="2" width="5.5" height="5.5" fill="#AED9E6" fillOpacity="0.4" />
                    <rect x="8.5" y="2" width="5.5" height="5.5" fill="#AED9E6" fillOpacity="0.4" />
                    <rect x="2" y="8.5" width="5.5" height="5.5" fill="#AED9E6" fillOpacity="0.4" />
                    <rect x="8.5" y="8.5" width="5.5" height="5.5" fill="#AED9E6" fillOpacity="0.4" />
                </g>
            </svg>
            {showText && (
                <div className="flex flex-col justify-center">
                    <span className="text-2xl font-bold tracking-tight text-arch-text leading-none">ARCHCOS</span>
                    <span className="text-[8px] font-black tracking-[0.5em] text-arch-text-muted uppercase mt-1">Studio Group</span>
                </div>
            )}
        </div>
    ),
    Home: ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="1.2" d="M3 12l9-9 9 9M5 10v11h14V10M9 21v-6h6v6"></path></svg>,
    Store: ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="1.2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path d="M9 22V12h6v10M12 2v2M4.5 9h15"></path></svg>,
    City: ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="1.2" d="M3 21h18M5 21V7l8-4v18M17 21V11l4-2v12M9 9h0M9 13h0M9 17h0"></path></svg>,
    Transform: ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="1.2" d="M4 4v5h5M20 20v-5h-5M4 9c0 4.418 3.582 8 8 8s8-3.582 8-8M20 15c0-4.418-3.582-8-8-8s-8 3.582-8 8"></path></svg>
};

export const CATEGORY_ICONS: Record<string, React.FC<any>> = {
    'Residencial': DashIcons.Home,
    'Comercial': DashIcons.Store,
    'Uso Mixto': DashIcons.City,
    'Cambio de uso': DashIcons.Transform
};

export const USERS = [
    { id: 'u1', email: 'adominguez@archcos.com', password: 'ARCHCOS2026', name: 'Aldo Dominguez', role: 'ADMIN', initials: 'AD', color: '#8b5cf6' },
    { id: 'u2', email: 'acalvo@archcos.com', password: 'ARCHCOS2026', name: 'Arianna Calvo', role: 'COLABORADOR', initials: 'AC', color: '#06b6d4' },
    { id: 'u3', email: 'aavila@archcos.com', password: 'ARCHCOS2026', name: 'Alonso Avila', role: 'COLABORADOR', initials: 'AA', color: '#3b82f6' },
    { id: 'u4', email: 'acruz@archcos.com', password: 'ARCHCOS2026', name: 'Alejandra Cruz', role: 'COLABORADOR', initials: 'AZ', color: '#d946ef' },
    { id: 'u5', email: 'jvalle@archcos.com', password: 'ARCHCOS2026', name: 'Joanna Valle', role: 'COLABORADOR', initials: 'JV', color: '#f59e0b' },
    { id: 'u6', email: 'adrianasarro@archcos.com', password: 'ARCHCOS2026', name: 'Adriana Sarro', role: 'ADMIN', initials: 'AS', color: '#10b981' },
    { id: 'u7', email: 'pmacias@archcos.com', password: 'ARCHCOS2026', name: 'Paola Macias', role: 'COLABORADOR', initials: 'PM', color: '#ec4899' },
    { id: 'u8', email: 'iflores@archcos.com', password: 'ARCHCOS2026', name: 'Irving Flores', role: 'COLABORADOR', initials: 'IF', color: '#6366f1' },
    { id: 'u9', email: 'areyes@archcos.com', password: 'ARCHCOS2026', name: 'Alfredo Reyes', role: 'ADMIN', initials: 'AR', color: '#f43f5e' },
    { id: 'u10', email: 'rgaytan@archcos.com', password: 'ARCHCOS2026', name: 'Ruben Gaytan', role: 'ADMIN', initials: 'RG', color: '#14b8a6' },
    // Specific Auth Mock Users
    { id: 'admin-id', email: 'admin@archcos.com', password: 'admin', name: 'Santiago Reyes', role: 'ADMIN', initials: 'SR', color: '#111827' },
    { id: 'colab-id', email: 'colab@archcos.com', password: 'colab', name: 'Arq. Colaborador', role: 'COLABORADOR', initials: 'AC', color: '#374151' },
];

export const INITIAL_PROJECTS = [
    { id: 'PRJ-1001', address: 'The Highland Residence', clientName: 'Fam. Thompson', type: 'Residencial', subtype: 'Custom Homes', procedure: 'Obra Nueva', stage: 'DISEÑO', creator: 'A. Reyes', deliveryDate: '2026-05-10', desc: 'Diseño interior y exterior de villa minimalista', badgeStyle: 'bg-arch-brand-sage/20 text-arch-text', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80', assignments: { area_grafico: ['u6', 'u5'], area_arquitectonico: ['u2', 'u1'] }, progressMap: { area_investigacion: 100, area_concepto: 80, area_arquitectonico: 40, area_estructural: 20, area_electrico: 0, area_hidro: 0, area_grafico: 60 }, progress: 40, status: 'Finalizando planos arquitectónicos base. Próximo inicio de Ingenierías (MEP).', deliverables: [{ name: 'Concepto_V1.pdf', type: 'PDF' }, { name: 'Planta_Arquitectonica.dwg', type: 'DWG' }], totalArea: { value: 4500, unit: 'sqft' }, budget: { total: 850000, spent: 467500, currency: 'USD' }, estimatedCompletion: '2026-12-15' },
    { id: 'PRJ-1002', address: 'Boutique M.', clientName: 'Marcus Fashion Group', type: 'Comercial', subtype: 'Retail', procedure: 'Remodelación', stage: 'EN OBRA', creator: 'R. Gaytan', deliveryDate: '2026-08-15', desc: 'Restauración completa de espacio comercial.', badgeStyle: 'bg-arch-brand-sky/20 text-arch-text', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', assignments: { area_arquitectonico: ['u9', 'u10'], area_grafico: ['u4'] }, progressMap: { area_investigacion: 100, area_concepto: 100, area_arquitectonico: 100, area_estructural: 90, area_electrico: 80, area_hidro: 85, area_grafico: 90 }, progress: 85, status: 'Ejecución de obra en fase de acabados finos y luminarias.', deliverables: [{ name: 'Plano_Instalaciones.pdf', type: 'PDF' }], totalArea: { value: 1200, unit: 'm2' }, budget: { total: 2400000, spent: 1800000, currency: 'USD' }, estimatedCompletion: '2026-10-20' },
    { id: 'PRJ-1003', address: 'Studio 4A', clientName: 'Creativa S.A.', type: 'Oficinas corporativas', subtype: 'Tenant Build-out', procedure: 'Mantenimiento Mayor', stage: 'REVISIÓN', creator: 'A. Calvo', deliveryDate: '2026-04-20', desc: 'Adecuación de planta libre.', badgeStyle: 'bg-arch-sand text-arch-text opacity-70', imageUrl: 'https://images.unsplash.com/photo-1497215848143-6d53526dc0bb?w=400&q=80', assignments: { area_investigacion: ['u2'] }, progressMap: { area_investigacion: 100, area_concepto: 100, area_arquitectonico: 60, area_estructural: 40, area_electrico: 20, area_hidro: 20, area_grafico: 40 }, progress: 65, status: 'En revisión municipal de permisos de ocupación.', deliverables: [{ name: 'Memoria_Calculo.pdf', type: 'PDF' }], totalArea: { value: 3200, unit: 'sqft' }, budget: { total: 350000, spent: 315000, currency: 'USD' }, estimatedCompletion: '2026-11-05' },
];

export const EMOJI_MAP: Record<string, string> = {
    'Residencial': '⌂', 'Comercial': '◻', 'Uso Mixto': '⬒', 'Cambio de uso': '◬',
    'Obra Nueva (Permiso)': '◱', 'Obra Nueva': '◱', 'Remodelación / Adecuación': '◩', 'Remodelación': '◩', 'Restauración Histórica': '◪', 'Mantenimiento Mayor': '◧', 'Permiso': '▧', 'Aprobación': '▣', 'Otro': '○'
};

export const PROJECT_AREAS = [
    { id: 'area_investigacion', title: 'Investigación Preliminar & Información' },
    { id: 'area_concepto', title: 'Diseño & Concept' },
    { id: 'area_arquitectonico', title: 'Proyecto Arquitectónico' },
    { id: 'area_estructural', title: 'Estructural' },
    { id: 'area_electrico', title: 'Instalación Eléctrica' },
    { id: 'area_hidro', title: 'Instalación Hidrosanitaria' },
    { id: 'area_grafico', title: 'Representación Gráfica (Renders)' }
];

export const SUBTYPE_OPTIONS: Record<string, string[]> = {
    'Residencial': ['Casa habitación', 'Vivienda Unifamiliar', 'Multifamiliar / Depas', 'Vivienda de Interés Social', 'Residencias de Lujo'],
    'Comercial': ['Retail / Locales', 'Restaurantes / Cafés', 'Hospitalidad / Hoteles', 'Clínicas / Salud'],
    'Uso Mixto': ['Residencial + Comercial', 'Oficinas + Comercial', 'Desarrollo Urbano', 'Reutilización Industrial'],
    'Cambio de uso': ['De Comercial a Residencial', 'De Oficina a Vivienda', 'De Bodega a Loft', 'De Terreno a Estacionamiento']
};
