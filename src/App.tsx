/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, ReactNode, useRef } from 'react';
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
  Info,
  RotateCcw
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import { useProjectStore } from './store/projectStore';
import { useAutoSave } from './hooks/useAutoSave';
import { StickyStepper } from './components/StickyStepper';


// --- Types ---

type Phase = 1 | 2 | 3 | 4 | 5;
type Language = 'en' | 'es';

interface Inhabitant {
  ageRange: 'child' | 'teen' | 'adult' | 'elder';
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
  // Zone-level material presets (controls all spaces in a zone unless overridden)
  zoneMaterials: Record<string, { floor: string; wall: string; ceiling: string }>;
  // Which spaces have been individually overridden from their zone preset
  customizedSpaces: string[];

  // Phase 4
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

const INITIAL_PROGRAM: ArchitecturalProgram = {
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
    SOCIAL:    { floor: 'hardwood',         wall: 'smooth_paint', ceiling: 'smooth_paint' },
    SERVICIOS: { floor: 'porcelain_tile',    wall: 'ceramic_tile',  ceiling: 'smooth_paint' },
    PRIVADOS:  { floor: 'hardwood',         wall: 'smooth_paint', ceiling: 'smooth_paint' },
    EXTERIORES:{ floor: 'exterior_pavers',  wall: 'smooth_paint', ceiling: 'open_sky'     },
  },
  customizedSpaces: [],
  finishes: {
    floors: 'wood_laminate',
    walls: 'warm_paint',
    roof: 'shingle',
    mainMaterial: 'stucco',
    baseMaterial: 'none',
    accentMaterial: 'none',
    curatedPalette: 'modern_farmhouse'
  }
};

// --- Constants ---

import { 
  MULTIPLE_SPACES, 
  NESTED_SPACES, 
  MIN_DIMENSIONS, 
  CATEGORY_LABELS,
  ZONE_CONFIG,
  FLOOR_OPTIONS,
  WALL_OPTIONS,
  CEILING_OPTIONS,
  getSpaceType
} from './constants/architectural';

import { UI_TRANSLATIONS } from './constants/translations';

// --- Components ---

const PhaseSection = React.forwardRef<HTMLDivElement, { children: React.ReactNode, phaseNum: number, isActive: boolean }>(({ children, phaseNum, isActive }, ref) => {
  return (
    <div 
      ref={ref} 
      data-phase={phaseNum}
      // FIX: Removed harsh `blur + opacity-25 + scale-down` on inactive phases.
      // Those effects made text completely unreadable while the user read Phase 1
      // or scrolled between sections. Now inactive sections are just subtly dimmed (opacity-70)
      // which keeps them fully legible and doesn't cause layout shifts from scale.
      className={`min-w-0 transition-all duration-700 ${
        isActive ? 'opacity-100' : 'opacity-70'
      }`}
    >
      <div className={`glass-card p-6 md:p-10 relative transition-all duration-700 ${
        isActive ? 'ring-2 ring-brand-blue/20 shadow-float' : 'shadow-soft'
      }`}>
         {children}
      </div>
    </div>
  );
});



export default function App({ initialData, onChange }: { initialData?: any, onChange?: (data: any) => void }) {
  const { currentProject, updateProject: syncGlobal } = useProjectStore();
  const [phase, setPhase] = useState<Phase>(1);
  const [activeNavPhase, setActiveNavPhase] = useState(1);
  const [language, setLanguage] = useState<Language>('es');
  
  // Initialize program from SSOT or default
  const [program, setProgram] = useState<ArchitecturalProgram>(
    initialData || currentProject.residentialProgram || INITIAL_PROGRAM
  );
  
  // Auto-Save background sync
  useAutoSave(program, (updated) => {
    syncGlobal({ residentialProgram: updated });
    if (onChange) onChange(updated);
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOriginalPdfOpen, setIsOriginalPdfOpen] = useState(false);
  const [isPrintingDocument, setIsPrintingDocument] = useState(false);

  // Refs for scroll sections
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLDivElement>(null);
  const phase4Ref = useRef<HTMLDivElement>(null);

  // Stable translation helper - memoized by language to prevent Phase re-renders.
  const t = useCallback((key: any) => {
    if (typeof key === 'object' && key !== null) {
      return key[language] || '';
    }
    return UI_TRANSLATIONS[key]?.[language] || key;
  }, [language]);

  // Stable state updater - memoized to prevent Phase child re-renders on every
  // parent state change (e.g. activeNavPhase changing while user scrolls).
  const updateProgram = (updates: Partial<ArchitecturalProgram>) => {
    setProgram(prev => {
      const newProgram = { ...prev, ...updates };
      if (onChange) onChange(newProgram);
      return newProgram;
    });
  };

  // Stable scroll handler - depends on nothing mutable.
  const scrollToPhase = useCallback((p: number) => {
    const refs: Record<number, React.RefObject<HTMLDivElement>> = {
      1: phase1Ref, 2: phase2Ref, 3: phase3Ref, 4: phase4Ref
    };
    refs[p]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPhase(p as Phase);
  }, []);

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

  if (isPrintingDocument) {
    return (
      <div className="bg-white w-full print-root">
        <DesignBriefPreview 
          program={program} 
          language={language} 
          t={t} 
          onClose={() => setIsPreviewOpen(false)} 
          isPrintingMode={true} 
          onPrintStateChange={setIsPrintingDocument}
        />
      </div>
    );
  }

  return (
    // ROOT: w-full instead of min-h-screen so it fills the parent container
    // exactly when embedded inside AdminDashboard without double-scroll.
    <div className="w-full min-h-screen bg-arch-gray text-arch-text font-sans selection:bg-brand-blue selection:text-arch-text">

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(212,230,165,0.2),transparent_70%)]" />
      </div>

      {/* Header: full-width with generous side padding, no artificial max-width cap */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-arch-border sticky top-0 z-50 shadow-soft">
        <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <div className="h-10 flex items-center gap-3">
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
                <div className="flex flex-col justify-center">
                    <span className="text-xl font-bold tracking-tight text-arch-text leading-none" style={{ fontFamily: '"Playfair Display", serif' }}>ARCHCOS</span>
                    <span className="text-[7px] font-black tracking-[0.4em] text-arch-textMuted uppercase mt-1">Studio Group</span>
                </div>
            </div>
            <div className="w-px h-8 bg-arch-border mx-6 hidden lg:block" />
            <div className="hidden lg:flex flex-col">
              <span className="text-[10px] font-black text-arch-text/30 uppercase tracking-[0.2em] mb-0.5">Expediente Activo</span>
              <span className="text-sm font-bold text-arch-text truncate max-w-[200px]">{currentProject.projectName || 'Sin Identificar'}</span>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-arch-text/20 uppercase tracking-widest">{t('progress')}</span>
              <span className="text-[10px] font-black text-arch-text uppercase tracking-widest">
                {Math.round(((phase - 1) / 4) * 100)}%
              </span>
            </div>
            <div className="w-32 h-1 bg-arch-border rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-green"
                initial={{ width: 0 }}
                animate={{ width: `${((phase - 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 rounded-full border border-arch-border shadow-sm">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  language === 'en' ? 'bg-brand-blue text-arch-text shadow-md' : 'text-arch-text/40 hover:text-arch-text'
                }`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  language === 'es' ? 'bg-brand-blue text-arch-text shadow-md' : 'text-arch-text/40 hover:text-arch-text'
                }`}
              >
                ES
              </button>
            </div>
            <div className="w-px h-4 bg-arch-border mx-2" />
            <button className="text-[9px] font-black uppercase tracking-widest text-arch-brand-sky">{t('help')}</button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: full-width, lean side padding, compact vertical spacing */}
      <main className="w-full px-4 md:px-8 py-8 md:py-12">

        {phase === 5 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="phase-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass-card p-8 md:p-12 mb-12"
            >
              <Phase5 
                program={program} 
                language={language} 
                t={t} 
                setIsPreviewOpen={setIsPreviewOpen} 
                setIsOriginalPdfOpen={setIsOriginalPdfOpen} 
                setPhase={setPhase} 
                setScreen={() => {}} 
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          // Responsive flex: stepper collapses on narrow viewports, content takes all remaining space
          <div className="flex flex-row gap-6 items-start">
            {/* Sticky Navigation — stays narrow, content gets ALL remaining space */}
            <StickyStepper 
              onStepClick={scrollToPhase}
              steps={[
                { id: 1, label: t('phase1'), isCompleted: !!(program.style), isActive: activeNavPhase === 1 },
                { id: 2, label: t('phase2_title'), isCompleted: !!(program.levels), isActive: activeNavPhase === 2 },
                { id: 3, label: t('phase3_title'), isCompleted: program.groundFloorSpaces.length > 0, isActive: activeNavPhase === 3 },
                { id: 4, label: t('phase4_title'), isCompleted: !!(program.finishes.mainMaterial), isActive: activeNavPhase === 4 },
              ]}
            />

            {/* Single Page Content Stack — flex-1 means it takes ALL remaining horizontal space */}
            <div className="flex-1 min-w-0 space-y-12">
              <PhaseSection ref={phase1Ref} phaseNum={1} isActive={activeNavPhase === 1}>
                <Phase1 program={program} updateProgram={updateProgram} language={language} t={t} />
              </PhaseSection>

              <PhaseSection ref={phase2Ref} phaseNum={2} isActive={activeNavPhase === 2}>
                <Phase2 program={program} updateProgram={updateProgram} language={language} t={t} />
              </PhaseSection>

              <PhaseSection ref={phase3Ref} phaseNum={3} isActive={activeNavPhase === 3}>
                <Phase3 program={program} updateProgram={updateProgram} language={language} t={t} />
              </PhaseSection>

              <PhaseSection ref={phase4Ref} phaseNum={4} isActive={activeNavPhase === 4}>
                <Phase4 program={program} updateProgram={updateProgram} language={language} t={t} />
                
                <div className="mt-12 flex justify-center pt-8 border-t border-arch-ink/5">
                  <button 
                    onClick={() => setPhase(5)}
                    className="px-12 py-5 bg-brand-green text-arch-text font-black rounded-2xl hover:scale-[1.03] transition-all flex items-center gap-4 group shadow-xl tracking-[0.3em] text-xs uppercase"
                  >
                    {t('finish')} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </PhaseSection>
            </div>
          </div>
        )}
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
        {isPreviewOpen && (
          <DesignBriefPreview 
            program={program} 
            language={language} 
            t={t} 
            onClose={() => setIsPreviewOpen(false)} 
            isPrintingMode={false}
            onPrintStateChange={setIsPrintingDocument}
          />
        )}
        {isOriginalPdfOpen && (
          <BeforeDesignOriginalView program={program} language={language} t={t} onClose={() => setIsOriginalPdfOpen(false)} updateProgram={updateProgram} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Phase Components ---

function Phase1({ program, updateProgram, language, t }: { program: ArchitecturalProgram, updateProgram: any, language: Language, t: (key: any) => string }) {
  const { currentProject, updateProject: syncGlobal } = useProjectStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const scrollTo = direction === 'left' ? scrollRef.current.scrollLeft - scrollAmount : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-24">
      {/* SECTION: Identity (SSOT) */}
      <section className="p-8 bg-brand-blue/5 border border-brand-blue/10 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark-blue">Identidad del Proyecto (SSOT)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="space-y-2">
              <label htmlFor="proj-name-res" className="text-[9px] font-bold text-arch-text-muted uppercase tracking-widest">Nombre del Proyecto</label>
              <input 
                id="proj-name-res"
                value={currentProject.projectName} 
                onChange={(e) => syncGlobal({ projectName: e.target.value })}
                placeholder="Ej. Casa Bosque"
                title="Nombre del Proyecto"
                className="w-full bg-transparent border-b border-arch-border pb-1 font-bold text-sm focus:border-brand-blue outline-none transition-colors" />
           </div>
           <div className="space-y-2">
              <label htmlFor="proj-loc-res" className="text-[9px] font-bold text-arch-text-muted uppercase tracking-widest">Ubicación</label>
              <input 
                id="proj-loc-res"
                value={currentProject.location} 
                onChange={(e) => syncGlobal({ location: e.target.value })}
                placeholder="Ciudad, País"
                title="Ubicación"
                className="w-full bg-transparent border-b border-arch-border pb-1 font-bold text-sm focus:border-brand-blue outline-none transition-colors" />
           </div>
           <div className="space-y-2">
              <label htmlFor="proj-cli-res" className="text-[9px] font-bold text-arch-text-muted uppercase tracking-widest">Cliente</label>
              <input 
                id="proj-cli-res"
                value={currentProject.clientName} 
                onChange={(e) => syncGlobal({ clientName: e.target.value })}
                placeholder="Nombre del Cliente"
                title="Cliente"
                className="w-full bg-transparent border-b border-arch-border pb-1 font-bold text-sm focus:border-brand-blue outline-none transition-colors" />
           </div>
           <div className="space-y-2">
              <label htmlFor="proj-date-res" className="text-[9px] font-bold text-arch-text-muted uppercase tracking-widest">Fecha Estimada</label>
              <input 
                id="proj-date-res"
                type="date"
                value={currentProject.estimatedDeliveryDate} 
                onChange={(e) => syncGlobal({ estimatedDeliveryDate: e.target.value })}
                title="Fecha Estimada"
                className="w-full bg-transparent border-b border-arch-border pb-1 font-bold text-sm focus:border-brand-blue outline-none transition-colors" />
           </div>
        </div>
      </section>

      {/* SECTION: Inhabitants */}
      <section className="space-y-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-blue" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/30 uppercase">{t('phase1')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-arch-ink tracking-tight mb-4 uppercase">
            {t('phase1_subtitle')}
          </h2>
          <p className="text-lg text-arch-ink/50 max-w-2xl font-medium leading-relaxed">
            {t('phase1_prompt')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <span className="text-lg font-medium block">{t('how_many_people')}</span>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => {
                  const currentCount = program.inhabitants.length;
                  if (currentCount > 1) {
                    updateProgram({ inhabitants: program.inhabitants.slice(0, -1) });
                  }
                }}
                title="Restar habitante"
                className="w-14 h-14 rounded-full bg-white border border-arch-ink/10 flex items-center justify-center hover:bg-brand-ink hover:text-white transition-all active:scale-95 shadow-soft"
              >
                <Minus size={20} />
              </button>
              <span className="text-5xl font-black tabular-nums w-12 text-center text-arch-ink">{program.inhabitants.length}</span>
              <button 
                onClick={() => {
                  const currentCount = program.inhabitants.length;
                  if (currentCount < 10) {
                    updateProgram({ 
                      inhabitants: [...program.inhabitants, { ageRange: 'adult', occupation: '' }] 
                    });
                  }
                }}
                title="Sumar habitante"
                className="w-14 h-14 rounded-full bg-white border border-arch-ink/10 flex items-center justify-center hover:bg-brand-ink hover:text-white transition-all active:scale-95 shadow-soft"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {program.inhabitants.map((inh, idx) => (
              <div key={idx} className="p-6 bg-brand-neutral/30 rounded-3xl space-y-4 border border-brand-ink/5 group hover:border-brand-blue/20 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-ink/30 italic">Persona {idx + 1}</span>
                  <select 
                    title="Rango de edad"
                    value={inh.ageRange}
                    onChange={(e) => {
                      const newInh = [...program.inhabitants];
                      newInh[idx].ageRange = e.target.value as any;
                      updateProgram({ inhabitants: newInh });
                    }}
                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-arch-text cursor-pointer focus:ring-0"
                  >
                    <option value="child">Child</option>
                    <option value="teen">Teen</option>
                    <option value="adult">Adult</option>
                    <option value="elder">Senior</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  placeholder={t('occupation')}
                  title="Ocupación"
                  value={inh.occupation}
                  onChange={(e) => {
                    const newInh = [...program.inhabitants];
                    newInh[idx].occupation = e.target.value;
                    updateProgram({ inhabitants: newInh });
                  }}
                  className="w-full bg-transparent border-b border-arch-border py-2 text-sm focus:border-brand-blue outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12 border-t border-brand-ink/5">
          <span className="text-lg font-medium block mb-6">{t('pets')}</span>
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
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border-2 ${
                  program.pets.includes(pet.id) 
                    ? 'bg-brand-blue/15 border-brand-blue text-arch-text' 
                    : 'bg-brand-neutral border-transparent text-brand-ink/60 hover:bg-brand-neutral/80'
                }`}
              >
                <pet.icon size={20} />
                {pet.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-ink/5 to-transparent" />

      {/* SECTION: Routines */}
      <section className="space-y-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center">
              <Heart className="w-5 h-5 text-brand-green-dark" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/30 uppercase">{t('phase1')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-arch-ink tracking-tight mb-4 uppercase">
            {t('phase1_routines_subtitle')}
          </h2>
          <p className="text-lg text-arch-ink/50 max-w-2xl font-medium leading-relaxed">
            {t('phase1_routines_title')}
          </p>
        </div>

        <div className="space-y-12">
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
                  className={`px-4 py-3 rounded-2xl text-center transition-all border-2 ${
                    program.hobbies.includes(hobby.id) 
                      ? 'bg-brand-green/15 border-brand-green text-arch-text' 
                      : 'bg-brand-neutral border-transparent text-brand-ink/60 hover:bg-brand-neutral/80'
                  }`}
                >
                  {hobby.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-brand-neutral rounded-3xl space-y-4 border border-brand-ink/5">
              <span className="text-lg font-medium block">{t('overnight_guests')}</span>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={val ? 'si' : 'no'}
                    onClick={() => updateProgram({ frequentGuests: val })}
                    className={`flex-1 py-3 rounded-2xl transition-all border-2 ${
                      program.frequentGuests === val 
                        ? 'bg-brand-blue/15 border-brand-blue text-arch-text' 
                        : 'bg-white border-transparent text-brand-ink/60 hover:bg-arch-gray'
                    }`}
                  >
                    {val ? t('yes') : t('no')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-brand-neutral rounded-3xl space-y-4 border border-brand-ink/5">
              <span className="text-lg font-medium block">{t('special_needs')}</span>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={val ? 'si' : 'no'}
                    onClick={() => updateProgram({ accessibilityNeeds: val })}
                    className={`flex-1 py-3 rounded-2xl transition-all border-2 ${
                      program.accessibilityNeeds === val 
                        ? 'bg-brand-blue/15 border-brand-blue text-arch-text' 
                        : 'bg-white border-transparent text-brand-ink/60 hover:bg-arch-gray'
                    }`}
                  >
                    {val ? t('priority') : t('no')}
                  </button>
                ))}
              </div>
              <p className="text-xs text-brand-ink/40 leading-relaxed">{t('special_needs_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-ink/5 to-transparent" />

      {/* SECTION: Aesthetics */}
      <section className="space-y-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center">
              <Palette className="w-5 h-5 text-arch-text" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/30 uppercase">{t('phase1')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-arch-ink tracking-tight mb-4 uppercase">
            {t('phase1_aesthetics_subtitle')}
          </h2>
          <p className="text-lg text-arch-ink/50 max-w-2xl font-medium leading-relaxed">
            {t('phase1_aesthetics_title')}
          </p>
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
                title="Scroll left"
                className="w-12 h-12 rounded-full bg-white border border-brand-ink/10 flex items-center justify-center hover:bg-brand-blue/20 hover:text-arch-text transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                title="Scroll right"
                className="w-12 h-12 rounded-full bg-white border border-brand-ink/10 flex items-center justify-center hover:bg-brand-blue/20 hover:text-arch-text transition-all shadow-sm active:scale-95"
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
                    ? 'bg-brand-green/15 text-arch-text scale-105 shadow-elegant border-brand-green' 
                    : 'bg-white border-brand-ink/5 text-brand-ink/60 hover:border-brand-ink/20 hover:bg-brand-neutral/30'
                }`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                  program.style === style.id ? 'bg-brand-green/20 rotate-12' : 'bg-brand-neutral'
                }`}>
                  <style.icon size={40} strokeWidth={1.5} />
                </div>
                <div className="text-center px-4">
                  <span className="font-bold text-lg block leading-tight">
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
                  onClick={() => syncGlobal({ favoriteColor: color })}
                  title={`Seleccionar color ${color}`}
                  className={`w-14 h-14 rounded-full border-4 transition-all duration-300 hover:scale-110 ${
                    currentProject.favoriteColor === color ? 'border-brand-blue scale-110 shadow-xl' : 'border-white shadow-sm'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative group">
                <input 
                  type="color" 
                  title="Color personalizado"
                  value={currentProject.favoriteColor || '#E5E4E2'}
                  onChange={(e) => syncGlobal({ favoriteColor: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-300 overflow-hidden ${
                    !['#F5F5F5', '#E5E4E2', '#D2B48C', '#BC8F8F', '#778899', '#556B2F', '#2F4F4F', '#FDF5E6'].includes(currentProject.favoriteColor || '#E5E4E2') 
                      ? 'border-brand-blue scale-110 shadow-xl' 
                      : 'border-white shadow-sm group-hover:border-brand-blue/20'
                  }`}
                  style={{ 
                    background: !['#F5F5F5', '#E5E4E2', '#D2B48C', '#BC8F8F', '#778899', '#556B2F', '#2F4F4F', '#FDF5E6'].includes(currentProject.favoriteColor || '#E5E4E2') 
                      ? (currentProject.favoriteColor || '#E5E4E2')
                      : 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' 
                  }}
                >
                  <Plus size={24} className={!['#F5F5F5', '#E5E4E2', '#D2B48C', '#BC8F8F', '#778899', '#556B2F', '#2F4F4F', '#FDF5E6'].includes(currentProject.favoriteColor || '#E5E4E2') ? 'text-white drop-shadow-md' : 'text-brand-ink/40'} />
                </div>
              </div>
            </div>
            <p className="text-xs text-brand-ink/40 font-light italic">
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
                  title={`Alternar color prohibido ${color}`}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm ${
                    program.forbiddenColors.includes(color) ? 'ring-4 ring-brand-blue ring-offset-4 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative group">
                <input 
                  type="color" 
                  title="Color prohibido personalizado"
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

        <div className="space-y-8 pt-12 border-t border-brand-ink/5">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-brand-ink/80"> {t('personal_haven')}</h3>
            <p className="text-sm text-brand-ink/50 leading-relaxed">{t('personal_haven_prompt')}</p>
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
                      ? 'bg-brand-blue/15 text-arch-text border-brand-blue shadow-elegant scale-105' 
                      : 'bg-white border-brand-ink/5 text-arch-ink/60 hover:border-brand-ink/20 hover:bg-brand-neutral/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    program.favoriteRoom === room.id ? 'bg-brand-blue/20' : 'bg-brand-neutral'
                  }`}>
                    <room.icon size={24} />
                  </div>
                  <span className="text-sm font-medium text-center">{t(room.key)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function Phase2({ program, updateProgram, language, t }: { program: ArchitecturalProgram, updateProgram: any, language: Language, t: (key: any) => string }) {
  return (
    <div className="space-y-12 pb-20">
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center">
            <Layers className="w-5 h-5 text-brand-green-dark" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/30 uppercase">{t('phase2_title')}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-arch-ink tracking-tight mb-4 uppercase">
          {t('phase2_subtitle')}
        </h2>
        <p className="text-lg text-arch-ink/50 max-w-2xl font-medium leading-relaxed">
          {t('phase2_prompt')}
        </p>
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
                          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all border-2 ${
                            program.ceilingHeightMain === opt.id 
                              ? 'bg-brand-blue/15 border-brand-blue text-arch-text shadow-sm' 
                              : 'bg-brand-neutral border-transparent text-brand-ink/60 hover:bg-brand-neutral/80'
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
                          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all border-2 ${
                            program.ceilingHeightUpper === opt.id 
                              ? 'bg-brand-blue/15 border-brand-blue text-arch-text shadow-sm' 
                              : 'bg-brand-neutral border-transparent text-brand-ink/60 hover:bg-brand-neutral/80'
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
                  program.doubleHeight ? 'bg-brand-blue border-brand-blue' : 'border-brand-ink/20 group-hover:border-brand-ink/40'
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
                    ? 'bg-brand-blue/15 border-brand-blue text-arch-text shadow-elegant' 
                    : 'bg-white border-brand-ink/5 text-brand-ink/60 hover:border-brand-ink/20'
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

function Phase3({ program, updateProgram, language, t }: { program: ArchitecturalProgram, updateProgram: any, language: Language, t: (key: any) => string }) {
  // Screen 1: Planta Baja Selection
  // Screen 2: Planta Baja Details
  // Screen 3: Planta Alta Selection (if levels > 1)
  // Screen 4: Planta Alta Details (if levels > 1)

  const { currentProject, updateProject: syncGlobal } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'selection' | 'details'>('selection');

  const groundSpaces = program.groundFloorSpaces;
  const upperSpaces = program.upperFloorSpaces;
  const allSpaces = [...groundSpaces, ...upperSpaces];

  const updateCategoryMaterial = (isGF: boolean, spacesInCategory: string[], field: 'floorMaterial' | 'wallMaterial', value: string) => {
    const details = isGF ? { ...program.groundFloorDetails } : { ...program.upperFloorDetails };
    spacesInCategory.forEach(space => {
      details[space] = { ...details[space], [field]: value };
    });
    updateProgram({ [isGF ? 'groundFloorDetails' : 'upperFloorDetails']: details });
  };

  const getCategoryStatus = (isGF: boolean, spacesInCategory: string[], field: 'floorMaterial' | 'wallMaterial'): string | undefined => {
    if (spacesInCategory.length === 0) return undefined;
    const details = isGF ? program.groundFloorDetails : program.upperFloorDetails;
    const firstVal = details[spacesInCategory[0]]?.[field];
    if (firstVal === undefined) {
      const allUndefined = spacesInCategory.every(space => details[space]?.[field] === undefined);
      return allUndefined ? undefined : 'mixed';
    }
    const allMatch = spacesInCategory.every(space => details[space]?.[field] === firstVal);
    return allMatch ? firstVal : 'mixed';
  };


  const toggleSpace = (isGF: boolean, space: string) => {
    const list = isGF ? [...program.groundFloorSpaces] : [...program.upperFloorSpaces];
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

    if (isGF) updateProgram({ groundFloorSpaces: newList, spaceDimensions: newDims, spaceQuantities: newQtys });
    else updateProgram({ upperFloorSpaces: newList, spaceDimensions: newDims, spaceQuantities: newQtys });
  };

  const updateQuantity = (space: string, delta: number) => {
    const currentQty = program.spaceQuantities[space] || 1;
    const newQty = currentQty + delta;
    
    if (newQty <= 0) {
      // We need to know which floor it was on to toggle correctly. 
      // Simplified: toggle on both or assume ground if not found.
      const isGF = program.groundFloorSpaces.includes(space);
      toggleSpace(isGF, space);
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

  const updateDetail = (isGF: boolean, space: string, field: string, value: any) => {
    const details = isGF ? { ...program.groundFloorDetails } : { ...program.upperFloorDetails };
    if (!details[space]) details[space] = {};
    details[space][field] = value;
    
    if (isGF) updateProgram({ groundFloorDetails: details });
    else updateProgram({ upperFloorDetails: details });
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-brand-blue" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/30 uppercase">{t('phase3_title')}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-arch-ink tracking-tight mb-4 uppercase">
          {t('phase3_subtitle_ground')}
        </h2>
        <p className="text-lg text-arch-ink/50 max-w-2xl font-medium leading-relaxed">
          {t('select_spaces_prompt')}
        </p>
      </div>

      {/* TABS FOR UX CLARITY WITHIN SECTION */}
      <div className="flex gap-1 bg-brand-neutral p-1 rounded-2xl w-fit mb-12">
        <button 
          onClick={() => setActiveTab('selection')}
          className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'selection' ? 'bg-white text-arch-text shadow-sm' : 'text-arch-text/40 hover:text-arch-text/60'}`}
        >
          1. {t('selection')}
        </button>
        <button 
          onClick={() => setActiveTab('details')}
          className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'details' ? 'bg-white text-arch-text shadow-sm' : 'text-arch-text/40 hover:text-arch-text/60'}`}
        >
          2. {t('dimensions_details')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'selection' ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-20"
          >
            {/* GROUND FLOOR SELECTION */}
            <div className="space-y-12">
               <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-brand-ink/5" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-ink/20 italic">Planta Baja</span>
                 <div className="h-px flex-1 bg-brand-ink/5" />
               </div>
               <SpaceSelectionGrid 
                 spaces={groundSpaces} 
                 toggleSpace={(s: string) => toggleSpace(true, s)} 
                 updateQuantity={updateQuantity}
                 program={program}
                 language={language}
                 t={t}
               />
            </div>

            {/* UPPER FLOOR SELECTION (IF APPLICABLE) */}
            {program.levels > 1 && (
              <div className="space-y-12 pt-12 border-t border-brand-ink/5">
                 <div className="flex items-center gap-4">
                   <div className="h-px flex-1 bg-brand-ink/5" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-ink/20 italic">Planta Alta</span>
                   <div className="h-px flex-1 bg-brand-ink/5" />
                 </div>
                 <SpaceSelectionGrid 
                   spaces={upperSpaces} 
                   toggleSpace={(s: string) => toggleSpace(false, s)} 
                   updateQuantity={updateQuantity}
                   program={program}
                   language={language}
                   t={t}
                 />
              </div>
            )}
            
            <div className="flex justify-center pt-12">
               <button 
                 onClick={() => setActiveTab('details')}
                 className="px-12 py-5 bg-brand-ink text-white rounded-3xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-elegant"
               >
                 Continuar a Detalles Tecnicos
               </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-20"
          >
            <SpaceDetailsGrid 
              program={program}
              updateProgram={updateProgram}
              updateDimension={updateDimension}
              updateDetail={updateDetail}
              language={language}
              t={t}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper components for Phase 3 to avoid monolith render
function SpaceSelectionGrid({ spaces, toggleSpace, updateQuantity, program, language, t }: any) {
  return (
    <div className="space-y-12">
      {Object.entries(NESTED_SPACES).map(([category, groups]) => (
        <div key={category} className="space-y-4">
          {/* Zone Header */}
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-brand-ink/30 border-b border-brand-ink/5 pb-3">
            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]?.[language] || category}
          </h3>

          {/* Each group: parent chip + children panel */}
          <div className="space-y-3">
            {groups.map((group: any) => {
              const isSelected = spaces.includes(group.parent);
              const qty = program.spaceQuantities[group.parent] || 1;
              const allowsMultiple = MULTIPLE_SPACES.includes(group.parent);
              const hasChildren = group.children.length > 0;

              return (
                <div key={group.parent} className="space-y-2">
                  {/* ── Parent Chip ── */}
                  <div
                    onClick={() => toggleSpace(group.parent)}
                    className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border-2 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-brand-blue/15 border-brand-blue text-arch-text shadow-sm'
                        : 'bg-white border-arch-border text-arch-text/60 hover:border-arch-text/30 hover:bg-arch-gray'
                    }`}
                  >
                    {/* Checkmark when selected */}
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                    <span>{MIN_DIMENSIONS[group.parent]?.label?.[language] || group.parent}</span>

                    {/* Quantity control for multi-allowed spaces */}
                    {isSelected && allowsMultiple && (
                      <div
                        className="flex items-center gap-1.5 ml-1 bg-brand-blue/20 rounded-lg px-1.5 py-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          title="Reducir cantidad"
                          onClick={() => updateQuantity(group.parent, -1)}
                          className="p-0.5 hover:bg-brand-blue/30 rounded transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="min-w-[1.2rem] text-center text-xs font-black">{qty}</span>
                        <button
                          title="Aumentar cantidad"
                          onClick={() => updateQuantity(group.parent, 1)}
                          className="p-0.5 hover:bg-brand-blue/30 rounded transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Children Panel (nested sub-areas) ── */}
                  <AnimatePresence>
                    {isSelected && hasChildren && (
                      <motion.div
                        key={`children-${group.parent}`}
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-6 mt-1 pl-4 border-l-2 border-brand-blue/20 space-y-2 pb-1">
                          {/* Contextual prompt */}
                          {group.prompt[language] && (
                            <p className="text-[11px] text-arch-text-muted font-medium italic py-1">
                              {group.prompt[language]}
                            </p>
                          )}
                          {/* Child chips */}
                          <div className="flex flex-wrap gap-2">
                            {group.children.map((child: string) => {
                              const childSelected = spaces.includes(child);
                              const childQty = program.spaceQuantities[child] || 1;
                              const childMultiple = MULTIPLE_SPACES.includes(child);

                              return (
                                <div
                                  key={child}
                                  onClick={() => toggleSpace(child)}
                                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer select-none ${
                                    childSelected
                                      ? 'bg-brand-green/20 border-brand-green/50 text-brand-dark-green shadow-sm'
                                      : 'bg-white border-arch-border text-arch-text/50 hover:border-arch-text/30 hover:bg-arch-gray/60'
                                  }`}
                                >
                                  {childSelected && (
                                    <span className="w-3 h-3 rounded-full bg-brand-green flex items-center justify-center shrink-0">
                                      <svg viewBox="0 0 10 10" className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </span>
                                  )}
                                  <span>{MIN_DIMENSIONS[child]?.label?.[language] || child}</span>
                                  {/* Quantity for multi-allowed child */}
                                  {childSelected && childMultiple && (
                                    <div
                                      className="flex items-center gap-1 ml-1 bg-brand-green/25 rounded px-1 py-0.5"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button onClick={() => updateQuantity(child, -1)} className="hover:opacity-70 transition-opacity" title="Disminuir cantidad" aria-label="Disminuir cantidad"><Minus size={9} /></button>
                                      <span className="text-[10px] font-black min-w-[0.8rem] text-center">{childQty}</span>
                                      <button onClick={() => updateQuantity(child, 1)} className="hover:opacity-70 transition-opacity" title="Aumentar cantidad" aria-label="Aumentar cantidad"><Plus size={9} /></button>
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
  );
}

// ─── Helper: resolve which NESTED_SPACES zone owns a space ─────────────────
function getZoneFor(spaceId: string): string | null {
  for (const [zone, groups] of Object.entries(NESTED_SPACES)) {
    for (const g of groups) {
      if (g.parent === spaceId || g.children.includes(spaceId)) return zone;
    }
  }
  return null;
}

// ─── Zone Material Controller ───────────────────────────────────────────────
function ZoneMaterialController({ program, updateProgram, updateDetail, language }: any) {
  const [expanded, setExpanded] = React.useState(true);

  // Apply zone material to ALL non-customized spaces in that zone
  const applyZoneMaterial = (zone: string, field: 'floor' | 'wall' | 'ceiling', value: string) => {
    // 1. Update zoneMaterials record
    const newZoneMaterials = {
      ...program.zoneMaterials,
      [zone]: { ...program.zoneMaterials?.[zone], [field]: value }
    };

    // 2. Map field to detail key
    const detailKey = field === 'floor' ? 'floorMaterial' : field === 'wall' ? 'wallMaterial' : 'ceilingMaterial';

    // 3. Collect all spaces in this zone (parents + children)
    const zoneSpaces: string[] = [];
    for (const g of NESTED_SPACES[zone] || []) {
      zoneSpaces.push(g.parent, ...g.children);
    }

    // 4. Stamp every selected space that isn't customized
    const customized = program.customizedSpaces || [];
    const allSelected = [...program.groundFloorSpaces, ...program.upperFloorSpaces];
    const newGFD = { ...program.groundFloorDetails };
    const newUFD = { ...program.upperFloorDetails };

    for (const spaceId of zoneSpaces) {
      if (!allSelected.includes(spaceId)) continue;
      if (customized.includes(`${spaceId}:${detailKey}`)) continue; // skip individual overrides
      const isGF = program.groundFloorSpaces.includes(spaceId);
      const target = isGF ? newGFD : newUFD;
      if (!target[spaceId]) target[spaceId] = {};
      target[spaceId][detailKey] = value;
    }

    updateProgram({
      zoneMaterials: newZoneMaterials,
      groundFloorDetails: newGFD,
      upperFloorDetails: newUFD,
    });
  };

  const zones = Object.entries(ZONE_CONFIG).filter(([zone]) =>
    NESTED_SPACES[zone]?.some(g =>
      [...program.groundFloorSpaces, ...program.upperFloorSpaces].includes(g.parent) ||
      g.children.some((c: string) => [...program.groundFloorSpaces, ...program.upperFloorSpaces].includes(c))
    )
  );

  if (zones.length === 0) return null;

  return (
    <div className="rounded-3xl border border-arch-border bg-white shadow-soft overflow-hidden mb-8">
      {/* Controller Header */}
      <button
        className="w-full flex items-center justify-between px-8 py-5 hover:bg-arch-gray/30 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
        title="Expandir/Colapsar controlador de materialidad por zona"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue/20 to-purple-100 flex items-center justify-center">
            <Layers size={17} className="text-brand-blue" />
          </div>
          <div>
            <h4 className="text-sm font-black text-arch-text uppercase tracking-[0.2em]">
              Controlador de Materialidad Global
            </h4>
            <p className="text-[10px] text-arch-text-muted font-medium">
              Aplica materiales a todas las áreas de una zona · Edición individual convierte a Personalizado
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-arch-text-muted" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-arch-border"
          >
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {zones.map(([zone, cfg]) => {
                const zm = program.zoneMaterials?.[zone] || { floor: '', wall: '', ceiling: '' };
                const floorOpts = zone === 'EXTERIORES' ? FLOOR_OPTIONS.outdoor : FLOOR_OPTIONS.general;

                return (
                  <div key={zone} className={`rounded-2xl border p-5 space-y-4 ${cfg.bgClass} ${cfg.borderClass}`}>
                    {/* Zone label */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-arch-text">
                        {cfg.label}
                      </span>
                    </div>

                    {/* Pisos */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-arch-text-muted">Pisos</label>
                      <select
                        title={`Material de pisos para ${cfg.label}`}
                        value={zm.floor || floorOpts[0].value}
                        onChange={e => applyZoneMaterial(zone, 'floor', e.target.value)}
                        className="w-full bg-white/80 border border-white rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      >
                        {floorOpts.map(o => <option key={o.value} value={o.value}>{o.labelEs}</option>)}
                      </select>
                    </div>

                    {/* Muros — only interior zones */}
                    {zone !== 'EXTERIORES' && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-arch-text-muted">Muros</label>
                        <select
                          title={`Material de muros para ${cfg.label}`}
                          value={zm.wall || 'smooth_paint'}
                          onChange={e => applyZoneMaterial(zone, 'wall', e.target.value)}
                          className="w-full bg-white/80 border border-white rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                        >
                          {WALL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.labelEs}</option>)}
                        </select>
                      </div>
                    )}

                    {/* Plafón */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-arch-text-muted">Plafón</label>
                      <select
                        title={`Acabado de plafón para ${cfg.label}`}
                        value={zm.ceiling || 'smooth_paint'}
                        onChange={e => applyZoneMaterial(zone, 'ceiling', e.target.value)}
                        className="w-full bg-white/80 border border-white rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      >
                        {CEILING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.labelEs}</option>)}
                      </select>
                    </div>

                    {/* Spaces count in this zone that are selected */}
                    <div className="text-[9px] text-arch-text-muted font-medium pt-1 border-t border-white/60">
                      {(() => {
                        const allSel = [...program.groundFloorSpaces, ...program.upperFloorSpaces];
                        const inZone = (NESTED_SPACES[zone] || []).flatMap((g: any) => [g.parent, ...g.children]).filter((s: string) => allSel.includes(s));
                        const customCount = inZone.filter((s: string) =>
                          ['floorMaterial','wallMaterial','ceilingMaterial'].some(f => (program.customizedSpaces || []).includes(`${s}:${f}`))
                        ).length;
                        return `${inZone.length} espacio${inZone.length !== 1 ? 's' : ''} · ${customCount > 0 ? `${customCount} personalizado${customCount !== 1 ? 's' : ''}` : 'todos bajo zona'}`;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpaceDetailsGrid({ program, updateProgram, updateDimension, updateDetail, language, t }: any) {
  const allSpaces = [...program.groundFloorSpaces, ...program.upperFloorSpaces];
  
  const getDetail = (space: string, field: string) =>
    program.groundFloorDetails[space]?.[field] ?? program.upperFloorDetails[space]?.[field] ?? '';

  // Called on individual space detail change — marks the space+field as "custom"
  const onDetail = (space: string, field: string, value: string) => {
    const key = `${space}:${field}`;
    const customized: string[] = program.customizedSpaces || [];
    const isGF = program.groundFloorSpaces.includes(space);
    
    // Batch update: mark as customized AND update the specific detail field
    const updates: any = {
      customizedSpaces: customized.includes(key) ? customized : [...customized, key]
    };

    if (isGF) {
      updates.groundFloorDetails = { 
        ...program.groundFloorDetails, 
        [space]: { ...program.groundFloorDetails[space], [field]: value }
      };
    } else {
      updates.upperFloorDetails = { 
        ...program.upperFloorDetails, 
        [space]: { ...program.upperFloorDetails[space], [field]: value }
      };
    }

    updateProgram(updates);
  };

  // Reset a space+field to follow its zone preset
  const resetToZone = (space: string, fields: string[]) => {
    const zone = getZoneFor(space);
    const zm = zone ? program.zoneMaterials?.[zone] : null;
    const customized: string[] = program.customizedSpaces || [];
    const keysToReset = fields.map(f => `${space}:${f}`);
    const newCustomized = customized.filter(k => !keysToReset.includes(k));

    const updates: any = { customizedSpaces: newCustomized };

    if (zm) {
      const isGF = program.groundFloorSpaces.includes(space);
      if (isGF) {
        updates.groundFloorDetails = { 
          ...program.groundFloorDetails, 
          [space]: { 
            ...program.groundFloorDetails[space], 
            floorMaterial: zm.floor,
            wallMaterial: zm.wall,
            ceilingMaterial: zm.ceiling
          }
        };
      } else {
        updates.upperFloorDetails = { 
          ...program.upperFloorDetails, 
          [space]: { 
            ...program.upperFloorDetails[space], 
            floorMaterial: zm.floor,
            wallMaterial: zm.wall,
            ceilingMaterial: zm.ceiling
          }
        };
      }
    }
    
    updateProgram(updates);
  };

  const area = (space: string) => {
    const l = program.spaceDimensions[space]?.l || 0;
    const w = program.spaceDimensions[space]?.w || 0;
    return (l * w);
  };

  const isCustomized = (space: string) => {
    const customized: string[] = program.customizedSpaces || [];
    return ['floorMaterial','wallMaterial','ceilingMaterial'].some(f => customized.includes(`${space}:${f}`));
  };

  return (
    <div className="space-y-4">
      {/* ── Zone Material Controller Panel ── */}
      <ZoneMaterialController
        program={program}
        updateProgram={updateProgram}
        updateDetail={updateDetail}
        language={language}
      />

      {/* ── Individual Space Cards ── */}
      {allSpaces.map(space => {
        const spaceType = getSpaceType(space);
        const isExterior = MIN_DIMENSIONS[space]?.category === 'EXTERIOR';
        const isGF = program.groundFloorSpaces.includes(space);
        const floorOpts = FLOOR_OPTIONS[spaceType] || FLOOR_OPTIONS.general;
        const sqft = area(space);
        const spaceZone = getZoneFor(space);
        const spaceIsCustom = isCustomized(space);

        return (
          <div key={space} className="bg-white rounded-3xl border border-arch-border shadow-soft overflow-hidden">
            {/* ─── Card Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-arch-border bg-arch-gray/40">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isExterior ? 'bg-brand-green/15' : 'bg-brand-blue/10'}`}>
                  <Maximize2 size={17} className={isExterior ? 'text-brand-dark-green' : 'text-brand-blue'} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-arch-text leading-none">
                    {MIN_DIMENSIONS[space]?.label?.[language] || space}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-arch-text-muted">
                      {isGF ? 'Planta Baja' : 'Planta Alta'} · {isExterior ? 'Exterior' : 'Interior'}
                    </span>
                    {/* Zone / Custom badge */}
                    {spaceZone && (
                      spaceIsCustom ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-[9px] font-black uppercase tracking-wider text-amber-700">
                            Personalizado
                          </span>
                          <button
                            title="Restablecer a material de zona"
                            onClick={() => resetToZone(space, ['floorMaterial','wallMaterial','ceilingMaterial'])}
                            className="text-[9px] font-black uppercase tracking-wider text-arch-text-muted hover:text-arch-text transition-colors flex items-center gap-1"
                          >
                            <RotateCcw size={10} />
                            Zona
                          </button>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-arch-border text-[9px] font-black uppercase tracking-wider text-arch-text-muted">
                          ↳ {ZONE_CONFIG[spaceZone]?.label || spaceZone}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
              {/* Live area badge in header */}
              <div className={`px-4 py-2 rounded-xl text-right ${isExterior ? 'bg-brand-green/10' : 'bg-brand-blue/8'}`}>
                <div className={`text-xl font-black font-mono leading-none ${isExterior ? 'text-brand-dark-green' : 'text-brand-blue'}`}>
                  {sqft > 0 ? sqft.toFixed(1) : '—'}
                  <span className="text-xs font-bold ml-1">SqFt</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-50 mt-0.5">Área Neta</div>
              </div>
            </div>

            {/* ─── Card Body ───────────────────────────────────────── */}
            <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

              {/* ── Column 1: Dimensiones ── */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-arch-text-muted block">
                  01 · Dimensiones
                </span>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Largo (ft)</label>
                    <input
                      type="number"
                      title="Largo del espacio en pies"
                      min={MIN_DIMENSIONS[space]?.l || 1}
                      value={program.spaceDimensions[space]?.l || ''}
                      onChange={e => updateDimension(space, 'l', parseFloat(e.target.value))}
                      className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 font-mono text-sm font-bold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    />
                    <div className="text-[9px] text-arch-text-muted opacity-60">Min: {MIN_DIMENSIONS[space]?.l || 1} ft</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Ancho (ft)</label>
                    <input
                      type="number"
                      title="Ancho del espacio en pies"
                      min={MIN_DIMENSIONS[space]?.w || 1}
                      value={program.spaceDimensions[space]?.w || ''}
                      onChange={e => updateDimension(space, 'w', parseFloat(e.target.value))}
                      className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 font-mono text-sm font-bold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    />
                    <div className="text-[9px] text-arch-text-muted opacity-60">Min: {MIN_DIMENSIONS[space]?.w || 1} ft</div>
                  </div>
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-arch-text-muted">
                      <span>L × A</span>
                      <span>{program.spaceDimensions[space]?.l || 0} × {program.spaceDimensions[space]?.w || 0} ft</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-arch-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isExterior ? 'bg-brand-green' : 'bg-brand-blue'}`}
                        style={{ width: `${Math.min(100, (sqft / 400) * 100)}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-arch-text-muted opacity-50">
                      {sqft < 100 ? 'Espacio compacto' : sqft < 200 ? 'Espacio estándar' : sqft < 350 ? 'Espacio amplio' : 'Suite / Área grande'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Column 2: Pisos + Muros ── */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-arch-text-muted block">
                  02 · Acabados — Suelo & Muros
                </span>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Pisos</label>
                    <select
                      title="Material del piso"
                      value={getDetail(space, 'floorMaterial') || floorOpts[0].value}
                      onChange={e => onDetail(space, 'floorMaterial', e.target.value)}
                      className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                    >
                      {floorOpts.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.labelEs}</option>
                      ))}
                    </select>
                  </div>
                  {!isExterior && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Muros / Paredes</label>
                      <select
                        title="Material de los muros"
                        value={getDetail(space, 'wallMaterial') || 'smooth_paint'}
                        onChange={e => onDetail(space, 'wallMaterial', e.target.value)}
                        className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      >
                        {WALL_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.labelEs}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Column 3: Plafón + Spec ── */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-arch-text-muted block">
                  03 · Plafón & Esp. del Espacio
                </span>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Plafón / Techo</label>
                    <select
                      title="Acabado del plafón"
                      value={getDetail(space, 'ceilingMaterial') || 'smooth_paint'}
                      onChange={e => onDetail(space, 'ceilingMaterial', e.target.value)}
                      className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                    >
                      {CEILING_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.labelEs}</option>
                      ))}
                    </select>
                  </div>
                  {spaceType === 'kitchen' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Gabinetes</label>
                      <select title="Estilo de gabinetes" value={getDetail(space, 'cabinetStyle') || 'shaker'} onChange={e => onDetail(space, 'cabinetStyle', e.target.value)} className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-green/20 transition-all">
                        <option value="shaker">Shaker (Clásico)</option>
                        <option value="flat_panel">Panel Plano / Moderno</option>
                        <option value="raised_panel">Panel Elevado (Tradicional)</option>
                        <option value="glass_front">Frente de Vidrio</option>
                        <option value="open_shelving">Anaqueles Abiertos</option>
                      </select>
                    </div>
                  )}
                  {spaceType === 'wet' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Ducha / Tina</label>
                      <select title="Configuración de baño" value={getDetail(space, 'bathConfig') || 'shower_only'} onChange={e => onDetail(space, 'bathConfig', e.target.value)} className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-green/20 transition-all">
                        <option value="shower_only">Walk-in Shower</option>
                        <option value="tub_only">Tina (Freestanding / Drop-in)</option>
                        <option value="shower_and_tub">Regadera + Tina</option>
                        <option value="steam_shower">Regadera de Vapor</option>
                        <option value="powder_only">Solo WC + Lavabo</option>
                      </select>
                    </div>
                  )}
                  {spaceType === 'closet' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Sistema</label>
                      <select title="Sistema de organización del closet" value={getDetail(space, 'closetSystem') || 'custom_built_in'} onChange={e => onDetail(space, 'closetSystem', e.target.value)} className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-green/20 transition-all">
                        <option value="custom_built_in">Empotrado a Medida</option>
                        <option value="modular">Sistema Modular</option>
                        <option value="open_wardrobe">Vestidor Abierto</option>
                        <option value="walk_in">Walk-in con Isla Central</option>
                        <option value="reach_in">Reach-in (Shallow)</option>
                      </select>
                    </div>
                  )}
                  {spaceType === 'outdoor' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Cubierta</label>
                      <select title="Tipo de cubierta exterior" value={getDetail(space, 'coverType') || 'open_sky'} onChange={e => onDetail(space, 'coverType', e.target.value)} className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-green/20 transition-all">
                        <option value="open_sky">Al Aire Libre</option>
                        <option value="pergola">Pérgola</option>
                        <option value="solid_roof">Techo Sólido</option>
                        <option value="shade_sail">Toldo / Vela de Sombra</option>
                        <option value="glass_roof">Techo de Vidrio / Cristal</option>
                        <option value="retractable">Toldo Retráctil</option>
                      </select>
                    </div>
                  )}
                  {spaceType === 'general' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Iluminación</label>
                      <select title="Tipo de iluminación principal" value={getDetail(space, 'lightingType') || 'recessed'} onChange={e => onDetail(space, 'lightingType', e.target.value)} className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-green/20 transition-all">
                        <option value="recessed">Plafones Embutidos</option>
                        <option value="chandelier">Candil / Araña</option>
                        <option value="pendant">Lámparas Colgantes</option>
                        <option value="track">Carril de Iluminación</option>
                        <option value="natural_skylights">Luz Natural / Claraboyas</option>
                        <option value="cove">Iluminación Indirecta (Cove)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Column 4: Notas ── */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-arch-text-muted block">
                  04 · Notas del Espacio
                </span>
                <div className="space-y-3">
                  <textarea
                    title="Notas adicionales para este espacio"
                    placeholder="Requerimientos especiales, referencias visuales, observaciones del cliente..."
                    value={getDetail(space, 'notes') || ''}
                    onChange={e => onDetail(space, 'notes', e.target.value)}
                    rows={5}
                    className="w-full bg-brand-neutral/60 border border-arch-border/60 rounded-xl px-4 py-3 text-xs font-medium text-arch-text placeholder-arch-text-muted/40 outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none transition-all leading-relaxed"
                  />
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase text-arch-text-muted/70 tracking-widest">Características</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'natural_light', label: 'Luz Natural' },
                        { id: 'double_height', label: 'Doble Altura' },
                        { id: 'acoustic', label: 'Acústico' },
                        { id: 'smart_tech', label: 'Smart Home' },
                      ].map(tag => {
                        const tags: string[] = getDetail(space, 'tags') ? getDetail(space, 'tags').split(',') : [];
                        const active = tags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            title={tag.label}
                            onClick={() => {
                              const next = active ? tags.filter(t => t !== tag.id) : [...tags, tag.id];
                              onDetail(space, 'tags', next.join(','));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${
                              active ? 'bg-brand-green/20 border-brand-green/40 text-brand-dark-green' : 'bg-white border-arch-border text-arch-text-muted hover:border-arch-text/30'
                            }`}
                          >
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })}

      {allSpaces.length === 0 && (
        <div className="text-center py-24 text-arch-text-muted">
          <Maximize2 size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest opacity-40">
            Selecciona espacios en el Paso 1 para configurar sus detalles aquí.
          </p>
        </div>
      )}
    </div>
  );
}

function Phase4({ program, updateProgram, language, t }: { program: ArchitecturalProgram, updateProgram: any, language: Language, t: (key: any) => string }) {
  const themes = [
    { id: 'modern_farmhouse', key: 'modern_farmhouse', colors: 'from-slate-50 to-slate-200', desc: { en: 'Timeless whites & charcoal accents', es: 'Blancos atemporales y acentos carbón' } },
    { id: 'desert_contemporary', key: 'desert_contemporary', colors: 'from-orange-100 to-orange-200', desc: { en: 'Warm earth tones & organic textures', es: 'Tonos tierra y texturas orgánicas' } },
    { id: 'urban_modern', key: 'urban_modern', colors: 'from-gray-300 to-gray-500', desc: { en: 'Industrial grays & concrete finishes', es: 'Grises industriales y acabados concreto' } },
    { id: 'coastal_transitional', key: 'coastal_transitional', colors: 'from-blue-100 to-blue-200', desc: { en: 'Soft blues & natural wood elements', es: 'Azules suaves y elementos de madera' } }
  ];

  const materialZones = [
    { label: 'main_material', field: 'mainMaterial', options: ['stucco', 'brick', 'siding', 'stone'], icon: <Layers size={16}/> },
    { label: 'base_material', field: 'baseMaterial', options: ['none', 'stone', 'brick', 'concrete'], icon: <Box size={16}/> },
    { label: 'accent_material', field: 'accentMaterial', options: ['none', 'wood_siding', 'metal_panels', 'stone'], icon: <Sparkles size={16}/> }
  ];

  return (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center">
            <Palette className="w-5 h-5 text-brand-blue" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/30 uppercase">{t('phase4_title')}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-arch-ink tracking-tight mb-4 uppercase">
          {t('phase4_subtitle')}
        </h2>
        <p className="text-lg text-arch-ink/50 max-w-2xl font-medium leading-relaxed">
          {t('phase4_prompt')}
        </p>
      </div>

      {/* CURATED PALETTES */}
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-ink/40">{t('color_palettes')}</h3>
          <div className="h-px flex-1 bg-brand-ink/5" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateProgram({ finishes: { ...program.finishes, curatedPalette: opt.id } })}
              className={`group p-1 rounded-3xl transition-all duration-500 relative ${
                program.finishes.curatedPalette === opt.id 
                  ? 'bg-brand-dark-blue shadow-2xl scale-[1.05] z-10' 
                  : 'bg-transparent hover:scale-[1.02]'
              }`}
            >
              <div className={`p-6 rounded-[calc(1.5rem-4px)] flex flex-col items-center gap-4 h-full ${
                program.finishes.curatedPalette === opt.id ? 'bg-white' : 'bg-white border border-brand-ink/5'
              }`}>
                <div className={`w-full h-24 rounded-2xl bg-gradient-to-br shadow-inner mb-2 ${opt.colors}`} />
                <div className="space-y-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest block text-center ${program.finishes.curatedPalette === opt.id ? 'text-brand-dark-blue' : 'text-brand-ink/60'}`}>
                    {t(opt.key)}
                  </span>
                  <p className="text-[8px] font-medium leading-relaxed opacity-40 text-center uppercase tracking-tighter">
                    {opt.desc[language]}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* EXTERIOR MATERIALITY */}
      <div className="space-y-10 pt-10 border-t border-brand-ink/5">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-ink/40">{t('outside')}</h3>
          <div className="h-px flex-1 bg-brand-ink/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {materialZones.map((zone) => (
            <div key={zone.field} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="text-brand-blue/40">{zone.icon}</div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-ink/60">{t(zone.label)}</label>
              </div>
              <div className="flex flex-col gap-2">
                {zone.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateProgram({ finishes: { ...program.finishes, [zone.field]: opt } })}
                    className={`px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all text-center border-2 ${
                      (program.finishes as any)[zone.field] === opt 
                        ? 'bg-brand-dark-blue text-white border-brand-dark-blue shadow-lg scale-[1.02]' 
                        : 'bg-brand-neutral border-transparent text-brand-ink/40 hover:border-brand-ink/10 hover:bg-white'
                    }`}
                  >
                    {t(opt)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function Phase5({ program, language, t, setIsPreviewOpen, setIsOriginalPdfOpen, setPhase, setScreen }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, setIsPreviewOpen: (v: boolean) => void, setIsOriginalPdfOpen: (v: boolean) => void, setPhase: (phase: Phase) => void, setScreen: (screen: number) => void }) {
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
      <div className="mb-20 leading-relaxed">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center">
            <FileText className="w-5 h-5 text-brand-blue-dark" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/30 uppercase">{t('phase5_title')}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-arch-ink tracking-tight mb-4 uppercase">
          {t('phase5_subtitle')}
        </h2>
        <p className="text-lg text-arch-ink/50 max-w-2xl font-medium leading-relaxed">
          {t('phase5_prompt')}
        </p>
      </div>

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

          {/* Edición de Fases */}
          <section className="p-10 bg-brand-green-dark/10 rounded-[3rem] border border-brand-green-dark/20 space-y-8 relative overflow-hidden">
            <h3 className="font-bold text-brand-green-dark uppercase text-[10px] tracking-[0.2em]">Editar Fases</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => { setPhase(1); setScreen(1); }} className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-md hover:bg-white transition-all text-left flex items-center justify-between group">
                <div>
                  <span className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest block mb-1">Fase 1</span>
                  <span className="text-sm font-medium text-brand-ink group-hover:text-brand-green-dark transition-colors">Alma del Hogar / Estética</span>
                </div>
                <PenTool size={16} className="text-brand-ink/20 group-hover:text-brand-green-dark transition-colors" />
              </button>
              <button onClick={() => { setPhase(2); setScreen(1); }} className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-md hover:bg-white transition-all text-left flex items-center justify-between group">
                <div>
                  <span className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest block mb-1">Fase 2</span>
                  <span className="text-sm font-medium text-brand-ink group-hover:text-brand-green-dark transition-colors">Concepto Arquitectónico</span>
                </div>
                <PenTool size={16} className="text-brand-ink/20 group-hover:text-brand-green-dark transition-colors" />
              </button>
              <button onClick={() => { setPhase(3); setScreen(1); }} className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-md hover:bg-white transition-all text-left flex items-center justify-between group">
                <div>
                  <span className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest block mb-1">Fase 3</span>
                  <span className="text-sm font-medium text-brand-ink group-hover:text-brand-green-dark transition-colors">Distribución de Espacios</span>
                </div>
                <PenTool size={16} className="text-brand-ink/20 group-hover:text-brand-green-dark transition-colors" />
              </button>
              <button onClick={() => { setPhase(4); setScreen(1); }} className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-md hover:bg-white transition-all text-left flex items-center justify-between group">
                <div>
                  <span className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest block mb-1">Fase 4</span>
                  <span className="text-sm font-medium text-brand-ink group-hover:text-brand-green-dark transition-colors">Acabados y Materialidad</span>
                </div>
                <PenTool size={16} className="text-brand-ink/20 group-hover:text-brand-green-dark transition-colors" />
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="p-10 bg-brand-dark-blue text-white rounded-[3rem] space-y-8 shadow-elegant relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <h3 className="font-bold text-white/30 uppercase text-[10px] tracking-[0.2em] relative z-10">{t('project_identity')}</h3>
            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('style')}</label>
                <p className="text-2xl font-bold text-brand-blue-dark"> {t(program.style)}</p>
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
                <p className="text-[10px] text-white/40 leading-relaxed font-bold">
                  {t('legal_note')}
                </p>
              </div>

              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="w-full mt-4 py-4 bg-brand-blue/20 text-white border border-brand-blue/30 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-blue/30 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <FileText size={20} />
                {t('preview_brief')}
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

          <section className="p-10 bg-brand-blue/5 border border-brand-blue/10 rounded-[3rem] space-y-4">
            <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue">
              <Info size={20} />
            </div>
            <h3 className="font-bold text-brand-blue uppercase text-[10px] tracking-[0.2em]">{t('next_step')}</h3>
            <p className="text-sm text-arch-text/60 leading-relaxed font-medium">
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
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
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

function DesignBriefPreview({ program, language, t, onClose, isPrintingMode = false, onPrintStateChange }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, onClose: () => void, isPrintingMode?: boolean, onPrintStateChange?: (p: boolean) => void }) {
  
  useEffect(() => {
    if (isPrintingMode) {
      window.scrollTo(0, 0);
    }
  }, [isPrintingMode]);
  const getGroupInfo = (spaceName: string) => {
    for (const [zone, groups] of Object.entries(NESTED_SPACES)) {
      for (const group of groups) {
        if (group.parent === spaceName || group.children.includes(spaceName)) {
          return { zone, parentKey: group.parent, isParent: group.parent === spaceName };
        }
      }
    }
    if (MIN_DIMENSIONS[spaceName]?.category === 'EXTERIOR') {
      return { zone: 'EXTERIORES', parentKey: spaceName, isParent: true };
    }
    return { zone: 'OTROS', parentKey: spaceName, isParent: true };
  };

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

        const info = getGroupInfo(space);
        breakdown.push({
          name: space,
          qty,
          l: dims.l,
          w: dims.w,
          area,
          macroZone: info.zone,
          parentKey: info.parentKey,
          isParent: info.isParent,
          baseArea: dims.l * dims.w
        });
      }
    });

    const circulation = interiorNet * 0.15;
    const totalGross = interiorNet + circulation;

    const interiorByZone = breakdown.reduce((acc: any, curr) => {
      if (MIN_DIMENSIONS[curr.name]?.category !== 'EXTERIOR') {
        acc[curr.macroZone] = (acc[curr.macroZone] || 0) + curr.area;
      }
      return acc;
    }, {});

    const exteriorByZone = breakdown.reduce((acc: any, curr) => {
      if (MIN_DIMENSIONS[curr.name]?.category === 'EXTERIOR') {
        acc[curr.macroZone] = (acc[curr.macroZone] || 0) + curr.area;
      }
      return acc;
    }, {});

    return { interiorNet, exteriorNet, circulation, totalGross, breakdown, interiorByZone, exteriorByZone };
  }, [program]);

  const handlePrint = () => {
    window.print();
  };

  const getCeilingValue = () => {
    const mainHeight = program.ceilingHeightMain === 'custom' 
      ? `${program.customCeilingHeightMain || '0'} ft` 
      : t(program.ceilingHeightMain);
    const upperHeight = program.ceilingHeightUpper === 'custom'
      ? `${program.customCeilingHeightUpper || '0'} ft`
      : t(program.ceilingHeightUpper);
      
    if (program.levels > 1) {
      return `L1: ${mainHeight} | L2: ${upperHeight}`;
    }
    return mainHeight;
  };

  const themeDarkBlue = '#0E3A56'; 
  const themeBrandBlue = '#1F82C0';
  const themeBrandGreen = '#8CC63F';

  const PhaseNotes = ({ color, title }: { color: string, title?: string }) => (
    <div className="mt-auto pt-6">
      <div className="border-t-2 border-dashed rounded-lg p-4 flex flex-col bg-gray-50/50" style={{borderColor: `${color}30`}}>
         <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{color: `${color}80`}}>
           <PenTool size={12}/> {title || "Notas de Diseño y Ajustes Técnicos"}
         </h3>
         <div className="space-y-4 flex-1">
           <div className="border-b" style={{borderColor: `${color}15`}}></div>
           <div className="border-b" style={{borderColor: `${color}15`}}></div>
         </div>
      </div>
    </div>
  );

  return (
    <div 
      className={isPrintingMode 
        // Print mode: bare white root, handled by @media print rules.
        ? "bg-white text-[#333] font-sans w-full" 
        // Screen fullscreen overlay FIX:
        // - `fixed inset-0` = true viewport lock (100vw × 100vh), no shift.
        // - `overflow-x-hidden` = absolutely prevent horizontal page breakage
        //   caused by the inner w-[8.5in] document cards.
        // - `overflow-y-auto` = allow vertical scrolling within this container only.
        // - `scrollbar-gutter: stable` prevents layout shift when scrollbar appears.
        : "fixed inset-0 z-[100] bg-[#F0F2F5] overflow-y-auto overflow-x-hidden no-scrollbar text-[#333] font-sans"}
    >
      <style>{`
        @media print {
          @page { size: letter; margin: 0; }
          body, html, #root { background: white !important; margin: 0 !important; padding: 0 !important; }
          
          .print-page { 
             break-after: page;
             page-break-after: always; 
             box-shadow: none !important; 
             margin: 0 !important; 
             width: 8.5in !important; 
             height: 11in !important; 
             padding: 0.6in !important; 
             box-sizing: border-box;
             border: none !important;
             background: white !important;
          }
          
          .print-page:last-child {
             page-break-after: auto;
             break-after: auto;
          }
        }
      `}</style>

      {/* Top Bar for Screen */}
      {!isPrintingMode && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Archcos" className="h-10 object-contain" onError={(e) => {
             e.currentTarget.style.display='none';
          }}/>
          <div className="w-px h-8 bg-gray-200"></div>
          <span className="font-bold tracking-tight text-xl text-gray-800">Design Brief <span className="font-normal text-gray-400">/ Previsualización</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 px-8 py-2.5 text-white rounded-full text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-blue/20" 
            style={{backgroundColor: themeBrandBlue}}
          >
            <Printer size={18} /> DESCARGAR EXPEDIENTE PDF COMPLETO
          </button>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-500" title="Cerrar vista de PDF" aria-label="Cerrar vista de PDF">
            <X size={24} />
          </button>
        </div>
      </div>
      )}

      {/* FIX: The inner centering wrapper uses `w-full` on mobile and restricts to
          `max-w-[8.5in]` for document sizing. `mx-auto` centers it. Horizontal 
          padding `px-4` ensures it never touches screen edges on small viewports. */}
      <div id="db-container" className={`flex flex-col items-center w-full mx-auto ${isPrintingMode ? 'gap-0 py-0 max-w-none' : 'gap-12 py-12 max-w-[1100px] px-4'}`}>
        
        {/* ======================================= */}
        {/* PAGE 1: Contexto y Partido Arquitectónico */}
        {/* ======================================= */}
        {/* FIX: `w-[8.5in]` is correct for print. On screen, `max-w-full` prevents
            it from overflowing the viewport. The wrapper above constrains everything. */}
        <div className="print-page w-[8.5in] max-w-full min-h-[11in] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative p-[0.6in] flex flex-col border border-gray-100 ring-1 ring-black/5">
          <header className="border-b-[4px] pb-6 mb-10 flex justify-between items-end" style={{borderColor: themeBrandBlue}}>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                <Box size={32} className="text-brand-blue" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">FASE 1: CONTEXTO Y PARTIDO</h4>
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-gray-900">
                  {program.inhabitants[0]?.occupation || "DISEÑO"} <span style={{color: themeBrandBlue}}>RESIDENCE</span>
                </h1>
              </div>
            </div>
            <div className="text-right text-[10px] uppercase font-bold text-gray-500 space-y-1">
              <p className="flex items-center justify-end gap-2"><MapPin size={10}/> LOCALIZACIÓN: TBD</p>
              <p className="flex items-center justify-end gap-2"><Calendar size={10}/> EXPEDICIÓN: {new Date().toLocaleDateString()}</p>
            </div>
          </header>

          <div className="flex-1 flex flex-col">
            {/* Hero Numbers */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="p-6 rounded-2xl text-center border transition-all hover:border-brand-blue/30" style={{backgroundColor: '#F8FAFC', borderColor: `${themeBrandBlue}15`}}>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Total Gross</span>
                <span className="text-4xl font-black font-mono tracking-tighter" style={{color: themeDarkBlue}}>{(areas.totalGross + areas.exteriorNet).toFixed(0)}</span>
                <span className="text-[10px] font-bold text-gray-400 block mt-1">SQFT TOTAL</span>
              </div>
              <div className="p-6 rounded-2xl text-center border transition-all hover:border-brand-green/30" style={{backgroundColor: '#F9FEF5', borderColor: `${themeBrandGreen}15`}}>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Net Interior</span>
                <span className="text-4xl font-black font-mono tracking-tighter" style={{color: '#2D4A1A'}}>{areas.interiorNet.toFixed(0)}</span>
                <span className="text-[10px] font-bold text-gray-400 block mt-1">SQFT NETO</span>
              </div>
              <div className="text-white p-6 rounded-2xl text-center shadow-xl shadow-brand-blue/10 relative overflow-hidden" style={{backgroundColor: themeBrandBlue}}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block mb-2 relative z-10">Circulación</span>
                <span className="text-4xl font-black font-mono tracking-tighter relative z-10">{areas.circulation.toFixed(0)}</span>
                <span className="text-[10px] font-bold text-white/50 block mt-1 relative z-10">+15% FACTOR</span>
              </div>
            </div>

            {/* Volumetría Base */}
            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-8 mb-8">
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                 <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100"><Layers size={16} color={themeBrandGreen}/></div>
                 Volumetría y Alturas
               </h3>
               <div className="grid grid-cols-3 gap-12">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Niveles</span>
                    <p className="font-black text-2xl tracking-tighter text-gray-800">{program.levels}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Alturas Libres</span>
                    <p className="font-black text-xl tracking-tighter text-gray-800 leading-tight">{getCeilingValue()}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Cimentación</span>
                    <p className="font-black text-xl uppercase tracking-tighter text-gray-800">{t(program.basement)}</p>
                 </div>
               </div>
            </div>

            {/* Estilo Arquitectónico */}
            <div className="p-8 rounded-2xl border" style={{backgroundColor: '#F8FAFC', borderColor: `${themeBrandBlue}20`}}>
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeBrandBlue}}>
                 <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100"><Home size={16}/></div>
                 Partido Conceptual
               </h3>
               <div className="grid grid-cols-3 gap-8 items-center">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Estilo</span>
                    <p className="font-black text-2xl uppercase tracking-tighter text-gray-800">{t(program.style)}</p>
                 </div>
                 <div className="space-y-1 border-x px-8 border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Techumbres</span>
                    <p className="font-black text-xl uppercase tracking-tighter text-gray-800">{t(program.roofStyle)}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Concepto</span>
                    <p className="font-black text-xl uppercase tracking-tighter text-gray-800">{t(program.floorPlanConcept)}</p>
                 </div>
               </div>
            </div>

            <PhaseNotes color={themeBrandBlue} title="Notas de Contexto y Partido" />
          </div>
          
          <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-300">
             <span>ARCHCOS STUDIO GROUP</span>
             <span>PÁGINA 01 / 04</span>
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 2: Perfil de Usuario y Estilo de Vida */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] max-w-full min-h-[11in] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeBrandGreen}}>
          <header className="border-b-[4px] pb-6 mb-10 flex items-center gap-6" style={{borderColor: themeBrandGreen}}>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Users size={32} style={{color: themeBrandGreen}} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">FASE 2: EL FLUJO / FLOW</h4>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900">
                Perfil de Habitalidad
              </h1>
            </div>
          </header>

          <div className="flex flex-col flex-1">
            <div className="grid grid-cols-2 gap-10 mb-8">
              {/* Habitantes */}
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                   Dinámica de Residentes ({program.inhabitantsCount})
                 </h3>
                 <div className="space-y-3">
                   {program.inhabitants.map((inh, i) => (
                     <div key={i} className="flex gap-4 items-center p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                       <div className="font-black text-[10px] w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md shadow-brand-blue/30 uppercase" style={{backgroundColor: themeBrandBlue}}>
                         {inh.ageRange === 'child' ? 'C' : inh.ageRange === 'teen' ? 'T' : inh.ageRange === 'adult' ? 'A' : 'S'}
                       </div>
                       <div>
                         <span className="font-black uppercase text-xs block text-gray-800">{inh.occupation || 'Residente'}</span>
                         <span className="text-[9px] uppercase font-bold text-gray-400">{t(inh.ageRange)}</span>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Mascotas & Social */}
              <div className="flex flex-col gap-8">
                 <div>
                   <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                     Entorno y Mascotas
                   </h3>
                   <div className="flex gap-2 flex-wrap min-h-[44px]">
                     {program.pets.length > 0 ? program.pets.map((pet, i) => (
                       <span key={i} className="px-4 py-2 border font-black text-[10px] uppercase rounded-lg bg-white shadow-sm flex items-center gap-2" style={{color: themeBrandGreen, borderColor: `${themeBrandGreen}30`}}>
                         <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: themeBrandGreen}}></div>
                         {t(pet)}
                       </span>
                     )) : <span className="text-xs font-bold opacity-30 uppercase font-bold">Sin mascotas registradas</span>}
                   </div>
                 </div>

                 <div>
                   <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                     Parámetros de Diseño
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                         <span className="text-[9px] font-black uppercase text-gray-400 block mb-2">Huéspedes</span>
                         <span className="font-black text-sm tracking-tight text-gray-700">{program.frequentGuests ? 'SÍ (FRECUENTE)' : 'NO RECURRENTE'}</span>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                         <span className="text-[9px] font-black uppercase text-gray-400 block mb-2">Accesibilidad</span>
                         <span className="font-black text-sm tracking-tight text-gray-700">{program.accessibilityNeeds ? 'REQUISITO: SÍ' : 'ESTÁNDAR'}</span>
                      </div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Puntos Críticos */}
            <div className="p-8 rounded-2xl border border-dashed transition-all hover:bg-white" style={{backgroundColor: `${themeBrandGreen}05`, borderColor: `${themeBrandGreen}40`}}>
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                 <CheckCircle2 size={16} color={themeBrandGreen}/> Hallazgos de Estilo de Vida
               </h3>
               <div className="grid grid-cols-2 gap-12">
                 <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-3 underline decoration-gray-200 underline-offset-4">Influencia Hobbies</span>
                    <div className="flex gap-2 flex-wrap">
                      {program.hobbies.length > 0 ? program.hobbies.map((h, i) => <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-white shadow-sm border border-gray-100">{h}</span>) : <span className="opacity-30 text-[10px] font-bold">No declarados</span>}
                    </div>
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-3 underline decoration-gray-200 underline-offset-4">Activadores Técnicos</span>
                    <ul className="space-y-2 font-black text-xs" style={{color: themeBrandBlue}}>
                      {program.doubleHeight && <li className="flex items-start gap-2">• Doble Altura Requerida en Áreas Públicas.</li>}
                      {program.floorPlanConcept === 'open' && <li className="flex items-start gap-2">• Transparencia y fluidez espacial máxima.</li>}
                      <li className="flex items-start gap-2">• Núcleo de Vida: {t(program.favoriteRoom)}.</li>
                    </ul>
                 </div>
               </div>
            </div>

            <PhaseNotes color={themeBrandGreen} title="Notas sobre Estilo de Vida y Circulaciones" />
          </div>
          
          <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-300">
             <span>ARCHCOS STUDIO GROUP</span>
             <span>PÁGINA 02 / 04</span>
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 3: Programa de Necesidades (DETALLADO) */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] max-w-full min-h-[11in] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeBrandBlue}}>
          <header className="border-b-[4px] pb-6 mb-8 flex items-end justify-between shrink-0" style={{borderColor: themeBrandBlue}}>
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Layout size={32} style={{color: themeBrandBlue}} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">FASE 3: INVENTARIO TÉCNICO</h4>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900">
                  Programa de Necesidades
                </h1>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-widest">NET INTERIOR</span>
              <p className="font-black text-2xl tracking-tighter" style={{color: themeBrandBlue}}>{areas.interiorNet.toFixed(0)} SQFT</p>
            </div>
          </header>

          <div className="flex-1 overflow-visible">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {['SOCIAL', 'PRIVADOS', 'SERVICIOS', 'EXTERIORES', 'OTROS'].map((cat) => {
                const catItems = areas.breakdown.filter(item => item.macroZone === cat);
                if (catItems.length === 0) return null;

                const totalCategoryArea = catItems.reduce((acc, curr) => acc + curr.area, 0);

                let headerColor = themeBrandBlue;
                if (cat === 'SOCIAL') headerColor = '#3498DB';
                if (cat === 'PRIVADOS') headerColor = '#9B59B6';
                if (cat === 'SERVICIOS') headerColor = '#E67E22';
                if (cat === 'EXTERIORES') headerColor = themeBrandGreen;

                const groupedByParent: Record<string, any[]> = {};
                catItems.forEach(item => {
                  const pKey = item.parentKey || item.name;
                  if (!groupedByParent[pKey]) groupedByParent[pKey] = [];
                  groupedByParent[pKey].push(item);
                });

                return (
                  <div key={cat} className="space-y-4 col-span-2 mb-2">
                    <div className="flex justify-between items-center border-b-[2px] pb-1.5" style={{borderColor: `${headerColor}40`}}>
                      <div className="flex items-center gap-3">
                         <span className="p-1 rounded bg-gray-50 border border-gray-100"><Layout size={12} style={{color: headerColor}}/></span>
                         <h3 className="text-xs font-black uppercase tracking-[0.1em]" style={{color: headerColor}}>ZONA {cat}</h3>
                      </div>
                      <span className="text-[11px] font-black px-3 py-1 rounded-full text-white tracking-widest" style={{backgroundColor: headerColor}}>{totalCategoryArea.toFixed(0)} SQFT</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(groupedByParent).map(([pKey, itemsInGroup]) => {
                        const isSuite = itemsInGroup.length > 1 || (itemsInGroup.length === 1 && itemsInGroup[0].isParent);

                        return (
                          <div key={pKey} className={`p-4 rounded-xl border shadow-sm transition-all ${isSuite ? 'col-span-1 bg-gray-50/20 border-gray-100' : 'col-span-1 bg-white border-gray-100'}`}>
                            {isSuite && (
                              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                <span className="font-black text-[11px] uppercase tracking-tighter" style={{color: themeDarkBlue}}>{MIN_DIMENSIONS[pKey]?.label?.[language] || pKey}</span>
                                <span className="font-black font-mono text-[11px]" style={{color: headerColor}}>{itemsInGroup.reduce((sum, i) => sum + i.area, 0).toFixed(0)} SQFT</span>
                              </div>
                            )}

                            <div className="space-y-3">
                              {itemsInGroup.map(item => {
                                const details = (program.groundFloorDetails[item.name] || program.upperFloorDetails[item.name]) || {};
                                return (
                                  <div key={item.name} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-[10px] uppercase text-gray-800 leading-tight">
                                             {(!isSuite || item.isParent) ? '' : '• '}{MIN_DIMENSIONS[item.name]?.label?.[language] || item.name}
                                          </span>
                                          {MIN_DIMENSIONS[item.name]?.category === 'EXTERIOR' ? (
                                            <span className="text-[6px] font-black px-1 py-0.5 rounded-[2px] bg-emerald-50 text-emerald-600 border border-emerald-100/50 uppercase tracking-tighter">EXT</span>
                                          ) : (
                                            <span className="text-[6px] font-black px-1 py-0.5 rounded-[2px] bg-gray-50 text-gray-400 border border-gray-100/50 uppercase tracking-tighter">INT</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                          <span className="text-[9px] font-bold text-gray-400 font-mono flex items-center gap-1">
                                            <Maximize2 size={8}/> {item.l}' × {item.w}'
                                          </span>
                                          <span className="font-black font-mono text-[11px]" style={{color: headerColor}}>{item.area.toFixed(0)} SQFT</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Especificaciones Técnicas Detalladas */}
                                    <div className="flex flex-wrap gap-1.5 items-center bg-white/60 p-2 rounded-lg border border-gray-100/50">
                                      {details.floorMaterial && (
                                        <span className="text-[7px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                          PISO: {t(details.floorMaterial)}
                                        </span>
                                      )}
                                      {details.wallMaterial && (
                                        <span className="text-[7px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                          MURO: {t(details.wallMaterial)}
                                        </span>
                                      )}
                                      {details.bed && (
                                        <span className="text-[7px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                          BED: {t(details.bed)}
                                        </span>
                                      )}
                                      {details.stove && (
                                        <span className="text-[7px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                                          ESTUFA: {t(details.stove)}
                                        </span>
                                      )}
                                      {details.closet && (
                                        <span className="text-[7px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">
                                          CLOSET: {t(details.closet)}
                                        </span>
                                      )}
                                    </div>

                                    {details.notes && (
                                      <p className="text-[8px] font-bold text-gray-400 border-l-2 pl-2 mt-1" style={{borderColor: `${headerColor}30`}}>
                                        "{details.notes}"
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Metodología de Sumatoria (Didáctica y Desglosada) */}
            <div className="mt-8 bg-[#F8FAFC] rounded-2xl border border-gray-100 p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                    <Maximize2 size={16} className="text-brand-blue" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#0E3A56]">Metodología de Sumatoria Téchnica</h3>
               </div>
               
               <div className="space-y-4">
                  {/* Desglose por Zonas Interiores */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-2 underline decoration-gray-200">Desglose de Áreas Netas (Interiores)</span>
                    
                    {['SOCIAL', 'PRIVADOS', 'SERVICIOS'].map(zone => {
                      const area = areas.interiorByZone[zone] || 0;
                      if (area === 0) return null;
                      
                      let zoneColor = '#3498DB'; // SOCIAL
                      if (zone === 'PRIVADOS') zoneColor = '#9B59B6';
                      if (zone === 'SERVICIOS') zoneColor = '#E67E22';
                      
                      return (
                        <div key={zone} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: zoneColor}}></div>
                            <span>Σ Área {CATEGORY_LABELS[zone]?.[language] || zone}</span>
                            <span className="text-[6px] font-black px-1 py-0.5 rounded-[2px] bg-gray-50 text-gray-400 border border-gray-100/50 uppercase tracking-tighter ml-1">INT</span>
                          </div>
                          <span className="font-mono" style={{color: zoneColor}}>{area.toFixed(0)} SQFT</span>
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[10px] font-black uppercase text-[#0E3A56]">
                       <span>Subtotal Área Neta Interior</span>
                       <span className="font-mono">{areas.interiorNet.toFixed(0)} SQFT</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-amber-600/80 bg-amber-50/30 p-2 rounded-lg border border-amber-100/30">
                    <div className="flex flex-col">
                       <span>+ Factor de Circulaciones y Muros (+15%)</span>
                       <span className="text-[7px] lowercase font-bold font-medium opacity-70">Buffer para muros estructurales y pasillos</span>
                    </div>
                    <span className="font-mono">{areas.circulation.toFixed(0)} SQFT</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tighter text-[#0E3A56] pt-1">
                    <span>= Área Bruta (Construcción Interior)</span>
                    <span className="font-mono" style={{color: themeBrandBlue}}>{areas.totalGross.toFixed(0)} SQFT</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#8CC63F]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#8CC63F'}}></div>
                      <span>+ Σ Áreas Exteriores / Cocheras (Todas las zonas)</span>
                      <span className="text-[6px] font-black px-1 py-0.5 rounded-[2px] bg-emerald-50 text-emerald-600 border border-emerald-100/50 uppercase tracking-tighter ml-1">EXT</span>
                    </div>
                    <span className="font-mono">{areas.exteriorNet.toFixed(0)} SQFT</span>
                  </div>

                  <div className="h-[2px] bg-[#0E3A56] my-2"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[12px] font-black uppercase tracking-tighter text-[#0E3A56]">TOTAL ESTIMADO DE CONSTRUCCIÓN</span>
                       <span className="text-[8px] text-gray-400 font-bold uppercase font-bold mt-0.5">*Cálculo basado en estándares de la industria arquitectónica.</span>
                    </div>
                    <span className="text-3xl font-black font-mono tracking-tighter" style={{color: themeBrandBlue}}>{(areas.totalGross + areas.exteriorNet).toFixed(0)} <span className="text-xs">SQFT</span></span>
                  </div>
               </div>
            </div>

            <PhaseNotes color={themeBrandBlue} title="Notas sobre el Programa de Necesidades" />

          </div>
          
          <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-300">
             <span>ARCHCOS STUDIO GROUP</span>
             <span>PÁGINA 03 / 04</span>
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 4: Materialidad y Acabados */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] max-w-full min-h-[11in] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeDarkBlue}}>
          <header className="border-b-[4px] pb-6 mb-10 flex items-center gap-6" style={{borderColor: themeDarkBlue}}>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Palette size={32} style={{color: themeDarkBlue}} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">FASE 4: LOS DETALLES</h4>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900">
                Materialidad y Acabados
              </h1>
            </div>
          </header>

          <div className="flex-1 flex flex-col">
            <div className="bg-gray-900 text-white p-8 rounded-2xl mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-8 border-b border-white/10 pb-4"><Home size={16}/> Requerimientos de Envolvente</h3>
               <div className="grid grid-cols-4 gap-8">
                   <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-white/40 block mb-2 tracking-widest">Muros (Principal)</span>
                      <span className="text-lg font-black tracking-tighter leading-tight">{t(program.finishes.mainMaterial)}</span>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-white/40 block mb-2 tracking-widest">Basamento</span>
                      <span className="text-lg font-black tracking-tighter leading-tight">{t(program.finishes.baseMaterial)}</span>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-white/40 block mb-2 tracking-widest">Acentos</span>
                      <span className="text-lg font-black tracking-tighter leading-tight uppercase font-mono">{t(program.finishes.accentMaterial)}</span>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-white/40 block mb-2 tracking-widest">Estilo Curado</span>
                      <div className="flex items-center gap-2">
                         <div className={`w-4 h-4 rounded-full border border-white/30 shadow-inner bg-gradient-to-br ${
                           program.finishes.curatedPalette === 'modern_farmhouse' ? 'from-slate-50 to-slate-200' : 
                           program.finishes.curatedPalette === 'desert_contemporary' ? 'from-orange-100 to-orange-200' : 
                           program.finishes.curatedPalette === 'urban_modern' ? 'from-gray-300 to-gray-500' : 
                           'from-blue-100 to-blue-200'
                         }`}></div>
                         <span className="text-xs font-black tracking-tighter uppercase">{t(program.finishes.curatedPalette)}</span>
                      </div>
                   </div>
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                 <div className="p-2 rounded-lg bg-gray-50 border border-gray-100"><Sparkles size={16} style={{color: themeBrandBlue}}/></div>
                 Especificaciones por Zona
               </h3>
               <div className="overflow-hidden border rounded-2xl shadow-sm border-gray-100">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="text-[9px] font-black uppercase tracking-wider" style={{backgroundColor: '#F8FAFC', color: themeDarkBlue}}>
                       <th className="p-5 border-b border-gray-100">Habitación</th>
                       <th className="p-5 border-b border-gray-100">Piso / Solado</th>
                       <th className="p-5 border-b border-gray-100">Paramentos</th>
                       <th className="p-5 border-b border-gray-100">Atributos Extra</th>
                     </tr>
                   </thead>
                   <tbody className="text-xs text-gray-700">
                     <tr className="border-b border-gray-50 transition-colors hover:bg-gray-50/30">
                       <td className="p-5 font-black uppercase text-gray-900 leading-tight">SOCIALES <br/><span className="text-[8px] font-bold text-gray-400">Sala, Comedor</span></td>
                       <td className="p-5 font-bold uppercase">{t(program.finishes.floors)}</td>
                       <td className="p-5 font-bold uppercase">Pintura Base Archcos</td>
                       <td className="p-5 font-black" style={{color: themeBrandBlue}}>
                          {program.floorPlanConcept === 'open' ? 'Fluidez Abierta' : 'Estructura Compartimentada'}
                       </td>
                     </tr>
                     <tr className="border-b border-gray-50 bg-gray-50/20 transition-colors hover:bg-gray-50/50">
                       <td className="p-5 font-black uppercase text-gray-900">COCINA</td>
                       <td className="p-5 font-bold uppercase">{t(program.finishes.floors) === 'tile' ? 'Piedra / Cerámica' : t(program.finishes.floors)}</td>
                       <td className="p-5 font-bold uppercase">Pintura Lavable</td>
                       <td className="p-5 font-black space-y-1" style={{color: themeBrandBlue}}>
                          <p>Isla: Mandatorio</p>
                       </td>
                     </tr>
                     <tr className="border-b border-gray-50 transition-colors hover:bg-gray-50/30">
                       <td className="p-5 font-black uppercase text-gray-900">BAÑOS</td>
                       <td className="p-5 font-bold uppercase">Antiderrapante TBD</td>
                       <td className="p-5 font-bold uppercase">Mármol / Azulejo</td>
                       <td className="p-5 font-black" style={{color: themeBrandBlue}}>
                          Mono-mando Negro
                       </td>
                     </tr>
                     <tr className="bg-gray-50/10 transition-colors hover:bg-gray-50/40">
                       <td className="p-5 font-black uppercase text-gray-900">RECAMARAS</td>
                       <td className="p-5 font-bold uppercase">{t(program.finishes.floors)}</td>
                       <td className="p-5 font-bold uppercase">Acústico / Térmico</td>
                       <td className="p-5 font-black" style={{color: themeBrandBlue}}>
                          Acabado Premium
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
               
               {program.forbiddenColors.length > 0 && (
                  <div className="mt-8 bg-red-600 p-5 rounded-2xl text-white text-xs font-black shadow-lg shadow-red-200">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> COLORES RESTRINGIDOS: {program.forbiddenColors.join(', ')}</span>
                  </div>
               )}
            </div>

            <PhaseNotes color={themeDarkBlue} title="Notas sobre Especificaciones y Acabados" />
          </div>
          
          <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-300">
             <span>ARCHCOS STUDIO GROUP</span>
             <span>PÁGINA 04 / 04</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
// --- BEFORE DESIGN ORIGINAL View ---

function BeforeDesignOriginalView({ program, language, t, onClose, updateProgram }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, onClose: () => void, updateProgram?: any }) {
  const [data, setData] = useState<ArchitecturalProgram>(JSON.parse(JSON.stringify(program)));

  useEffect(() => {
    if (updateProgram) {
      updateProgram(data);
    }
  }, [data, updateProgram]);


  const handlePrint = () => {
    window.print();
  };

  const CheckboxText = ({ label, checked, onClick }: { label: string, checked: boolean, onClick: () => void }) => (
    <div className="flex flex-col items-center cursor-pointer hover:bg-black/5 px-1 py-0.5 rounded transition-colors select-none" onClick={onClick}>
      <span className={`text-[9px] leading-tight ${checked ? 'font-bold underline decoration-[1.5px] decoration-black underline-offset-2' : 'opacity-60 font-normal'}`}>{label}</span>
    </div>
  );

  const EditableText = ({ value, onChange, className = "", align="left" }: { value: string, onChange: (val: string) => void, className?: string, align?: "left"|"center"|"right" }) => (
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className={`bg-transparent outline-none focus:bg-yellow-100/50 print:bg-transparent placeholder-black/30 text-${align} border-b border-black ${className}`}
    />
  );

  const getAgeValues = () => data.inhabitants.map(i => i.age).join(', ') || '';
  const getOccValues = () => data.inhabitants.map(i => i.occupation).join(', ') || '';
  const getHobValues = () => data.hobbies.join(', ') || '';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // FULLSCREEN OVERLAY FIX (BeforeDesignOriginalView):
      // `fixed inset-0` = viewport-anchored, no shifting relative to scrolled content.
      // `overflow-y-auto` = vertical scroll only inside this overlay.
      // `overflow-x-hidden` = absolutely clamp the w-[8.5in] inner doc from overflowing.
      className="fixed inset-0 z-[60] bg-black/40 overflow-y-auto overflow-x-hidden no-scrollbar print:bg-white print:p-0"
    >
      {/* FIX: `min-h-screen` + `flex-col items-center` centers the doc card vertically
          and horizontally. `px-4` ensures breathing room on narrow screens. */}
      <div className="min-h-screen flex flex-col items-center py-10 px-4 print:py-0">

        <div className="w-full max-w-[8.5in] flex justify-between items-center mb-6 px-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-brand-ink/80 text-white rounded-xl hover:bg-brand-ink transition-all backdrop-blur-md"
          >
            <ArrowLeft size={18} /> {t('back_to_summary')}
          </button>
          <div className="text-white text-sm opacity-80 backdrop-blur-md bg-black/20 px-4 py-2 rounded-xl">
             Los campos subrayados y las opciones son editables.
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-brand-blue-dark text-white font-bold rounded-xl hover:bg-brand-blue-dark/80 transition-all shadow-lg"
          >
            <Printer size={18} /> {language === 'en' ? 'Print Document' : 'Imprimir Documento'}
          </button>
        </div>

        {/* FIX: Changed from `w-[8.5in]` (hard pixel value that overflows small screens)
            to `w-full max-w-[8.5in]` — the document is correctly sized for print but
            shrinks responsively to fit any screen. `mx-auto` keeps it centered. */}
        <div className="w-full max-w-[8.5in] mx-auto bg-white text-black font-sans p-[0.4in] print:w-full print:p-0 text-[10px] leading-tight flex flex-col gap-3 relative shadow-2xl print:shadow-none">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1 w-[35%]">
              <img src="/logo.png" alt="Archcos Logo" className="h-16 object-contain object-left mb-1" onError={(e) => {
                e.currentTarget.style.display='none';
                e.currentTarget.nextElementSibling!.style.display='block';
              }} />
              <div className="hidden" style={{display: 'none'}}>
                  <h1 className="text-4xl font-bold tracking-tighter">ARCHCOS</h1>
              </div>
              <p className="font-bold text-[10px] text-gray-800 tracking-[0.3em] pl-1 mt-1 uppercase"> Others build houses, we build HOMES!</p>
            </div>
            
            <div className="flex-1 flex justify-center pt-4">
              <div className="px-10 py-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border border-gray-300 shadow-sm relative ml-8">
                <h1 className="text-2xl font-black tracking-[0.4em] text-gray-800 text-center uppercase leading-none"> Before<br/>Design</h1>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black opacity-20" />
              </div>
            </div>

            <div className="w-[35%] text-right flex flex-col items-end gap-[4px] pt-2">
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Customer</span><EditableText align="right" value={data.inhabitants[0]?.occupation || ''} onChange={v => {let newData = {...data}; if(newData.inhabitants[0]) newData.inhabitants[0].occupation = v; setData(newData);}} className="flex-1 px-1 font-bold text-xs" /></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Address</span><EditableText align="right" value={data.footprint === 'rectangular' ? 'Standard Lot' : data.footprint === 'l_shape' ? 'Corner' : 'Estate'} onChange={v => setData({...data, footprint: v as any})} className="flex-1 px-1 font-bold text-xs" /></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">City, State, ZIP</span><EditableText align="right" value="Local" onChange={()=>{}} className="flex-1 px-1 font-bold text-xs" /></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Date</span><EditableText align="right" value={new Date().toLocaleDateString()} onChange={()=>{}} className="flex-1 px-1 font-bold text-xs" /></div>
            </div>
          </div>

          {/* Construction Type */}
          <div className="flex justify-between font-bold mb-1 uppercase tracking-wider text-[11px] py-1">
            <div className="flex items-center"><span className="font-normal uppercase mr-2 opacity-80">TYPE OF CONSTRUCTION</span> <EditableText align="left" value="RESIDENTIAL" onChange={()=>{}} className="w-32 uppercase font-bold border-none" /></div>
            <div className="flex items-center"><span className="font-normal uppercase mr-2 opacity-80">SIZE</span> <EditableText align="center" value="" onChange={()=>{}} className="w-16 font-bold bg-yellow-100/30" /> <span className="font-normal uppercase ml-4 opacity-80 mr-2">SQFT</span> <EditableText align="center" value="" onChange={()=>{}} className="w-16 font-bold bg-yellow-100/30" /></div>
          </div>

          {/* Inside Spaces */}
          <div className="border-t-[3px] border-b-[3px] border-black py-4 mt-2">
            <span className="font-bold uppercase text-[10px] bg-gray-200 px-3 py-1">INSIDE SPACES</span>
            
            {/* Kitchen */}
            <div className="flex border-b border-gray-300 py-3 items-end mt-4">
              <div className="w-24 font-bold text-xs">Kitchen</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Stove</span> <CheckboxText label="Gas" checked={false} onClick={()=>{}}/><CheckboxText label="Electric" checked={true} onClick={()=>{}}/></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Refrigerator</span> <CheckboxText label="Small" checked={false} onClick={()=>{}}/><CheckboxText label="Highest" checked={true} onClick={()=>{}}/></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Dishwasher</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div> </div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Hood/Microwave</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div> </div>
              </div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Tile" checked={data.finishes.floors === 'tile'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'tile'}})}/><CheckboxText label="Wood" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Stone" checked={data.finishes.floors === 'stone'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'stone'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Laundry */}
            <div className="flex border-b border-gray-300 py-3 items-end">
              <div className="w-24 font-bold text-xs">Laundry</div>
              <div className="flex-1 flex gap-4 pr-12">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Washer</span> <div className="flex flex-col"><CheckboxText label="Commercial" checked={false} onClick={()=>{}}/><CheckboxText label="Special" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Dryer</span> <div className="flex flex-col"><CheckboxText label="Gas" checked={false} onClick={()=>{}}/><CheckboxText label="Electric" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Sink</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
              </div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={true} onClick={()=>{}}/><CheckboxText label="Warm" checked={false} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Bathroom */}
            <div className="flex border-b border-gray-300 py-3 items-end">
              <div className="w-24 font-bold text-xs">Bathroom</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Shower</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Tub</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Sink</span> <div className="flex flex-col"><CheckboxText label="1" checked={false} onClick={()=>{}}/><CheckboxText label="2" checked={true} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Toilet</span> <div className="flex flex-col"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div></div>
              </div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={true} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={true} onClick={()=>{}}/><CheckboxText label="Paint" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Bedroom */}
            <div className="flex py-3 items-end">
              <div className="w-24 font-bold text-xs">Bedroom</div>
              <div className="flex-1 flex gap-2">
                <div className="flex gap-1 items-end"><span className="text-[9px] font-bold">Bed</span> <div className="flex flex-col gap-[2px]"><CheckboxText label="Twins" checked={false} onClick={()=>{}}/><CheckboxText label="Full" checked={false} onClick={()=>{}}/><CheckboxText label="Queen" checked={false} onClick={()=>{}}/><CheckboxText label="King" checked={true} onClick={()=>{}}/></div></div>
                <div className="flex gap-1 items-end pl-2">
                  <div className="flex flex-col items-end gap-[4px] mr-1 mb-1">
                     <span className="text-[9px] font-bold leading-none">Vanity Table</span>
                     <span className="text-[9px] font-bold leading-none">Dresser</span>
                     <span className="text-[9px] font-bold leading-none">Bureau</span>
                     <span className="text-[9px] font-bold leading-none mt-1">Closet</span>
                  </div> 
                  <div className="flex flex-col gap-[3px]">
                     <div className="flex gap-2 justify-start"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-2 justify-start"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-2 justify-start"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-3 justify-start"><CheckboxText label="1" checked={false} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/><CheckboxText label="Walking" checked={true} onClick={()=>{}}/><span className="opacity-60 text-[9px]">Small</span></div>
                  </div>  
                </div>
              </div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Tile" checked={data.finishes.floors === 'tile'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'tile'}})}/><CheckboxText label="Wood" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Stone" checked={data.finishes.floors === 'stone'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'stone'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>
          </div>

          {/* Outside Spaces */}
          <div className="border-b-[3px] border-black py-4">
            <span className="font-bold uppercase text-[10px] bg-gray-200 px-3 py-1">OUTSIDE</span>
            <div className="flex py-1 mt-4 items-end">
              <div className="w-64 font-bold flex gap-1 items-center">4 Elevations with <EditableText value="" onChange={()=>{}} className="flex-1 bg-yellow-100/30" /></div>
              <div className="flex-1"></div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={true} onClick={()=>{}}/><CheckboxText label="Concrete" checked={true} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Brick" checked={data.finishes.walls==='brick'} onClick={()=>setData({...data, finishes: {...data.finishes, walls: 'brick'}})}/><CheckboxText label="Stucco" checked={data.finishes.walls!=='brick'} onClick={()=>setData({...data, finishes: {...data.finishes, walls: 'warm_paint'}})}/><CheckboxText label="Sidding" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Steel" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Roof</span><div className="flex flex-col"><CheckboxText label="Clay Tile" checked={data.finishes.roof==='clay_tile'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'clay_tile'}})}/><CheckboxText label="Shingle" checked={data.finishes.roof==='shingle'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'shingle'}})}/><CheckboxText label="Steel" checked={data.finishes.roof==='steel'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'steel'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-end border-b-[3px] border-black pb-2">
              <span className="font-bold uppercase text-[10px] bg-gray-200 px-3 py-1">QUESTIONS</span>
              <div className="flex w-[60%] border-l-2 border-black">
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80 pt-1">AGES</span>
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80 pt-1">OCCUPATIONS</span>
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80 pt-1">HOBBIES</span>
              </div>
            </div>

            {/* Q1 */}
            <div className="flex gap-4">
              <div className="w-[40%] flex flex-col gap-3">
                <p>1.- How <strong className="font-bold">many persons</strong> will be living in this building?</p>
                <div className="flex justify-between px-6 font-bold opacity-60">
                  <span className={`text-[9px] ${data.inhabitantsCount === 1 ? 'font-bold underline text-black opacity-100' : ''}`}>1</span>
                  <span className={`text-[9px] ${data.inhabitantsCount === 2 ? 'font-bold underline text-black opacity-100' : ''}`}>2</span>
                  <span className={`text-[9px] ${data.inhabitantsCount === 3 ? 'font-bold underline text-black opacity-100' : ''}`}>3</span>
                  <span className={`text-[9px] ${data.inhabitantsCount === 4 ? 'font-bold underline text-black opacity-100' : ''}`}>4</span>
                  <span className={`text-[9px] ${data.inhabitantsCount === 5 ? 'font-bold underline text-black opacity-100' : ''}`}>5</span>
                  <span className={`text-[9px] ${data.inhabitantsCount > 5 ? 'font-bold underline text-black opacity-100' : ''}`}>+5</span>
                </div>
                <div className="flex gap-12 mt-2 px-4 font-bold w-full">
                  <CheckboxText label="Female" checked={data.inhabitants[0]?.gender === 'female'} onClick={() => {let d = {...data}; if(!d.inhabitants[0]) d.inhabitants[0]={gender:'female',age:0,occupation:''}; else d.inhabitants[0].gender='female'; setData(d);}} />
                  <div className="flex flex-col gap-1 items-start">
                     <CheckboxText label="Male" checked={data.inhabitants[0]?.gender === 'male'} onClick={() => {let d = {...data}; if(!d.inhabitants[0]) d.inhabitants[0]={gender:'male',age:0,occupation:''}; else d.inhabitants[0].gender='male'; setData(d);}} />
                     <div className="flex gap-4 items-start pt-2">
                        <div className="flex flex-col gap-[2px]">
                           <span className="font-bold text-[9px] text-center mb-1">Pet</span>
                           <span className="text-[9px] opacity-60">Cat</span>
                           <span className="text-[9px] opacity-60">Dog</span>
                           <span className="text-[9px] opacity-60">Mouse</span>
                        </div>
                        <div className="flex flex-col gap-[2px]">
                           <span className="font-bold text-[9px] text-center mb-1">Yes</span>
                           <CheckboxText label="Fish" checked={data.pets.includes('fish' as any)} onClick={()=>{let d={...data}; if(!d.pets.includes('fish' as any)) d.pets.push('fish' as any); else d.pets=d.pets.filter(p=>p!=='fish'); setData(d);}}/>
                           <CheckboxText label="Bird" checked={data.pets.includes('bird' as any)} onClick={()=>{let d={...data}; if(!d.pets.includes('bird' as any)) d.pets.push('bird' as any); else d.pets=d.pets.filter(p=>p!=='bird'); setData(d);}}/>
                           <span className="text-[9px] opacity-60">Other</span>
                        </div>
                        <div className="flex flex-col gap-[2px]">
                           <span className="font-bold text-[9px] text-center mb-1">No</span>
                           <CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/>
                           <CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/>
                           <CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              <div className="flex w-[60%] border-l-2 border-black pl-1">
                <div className="w-1/3 px-2 flex flex-col gap-2 py-1">
                    <EditableText align="center" value={getAgeValues()} onChange={(val) => {
                       let ages = val.split(',').map(s=>parseInt(s.trim())).filter(x=>!isNaN(x));
                       let newInh = [...data.inhabitants];
                       ages.forEach((a,idx) => { if(!newInh[idx]) newInh[idx] = {age:a, occupation:'', gender:''}; else newInh[idx].age = a; });
                       setData({...data, inhabitants: newInh});
                    }} className="w-full font-bold bg-yellow-100/30" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                </div>
                <div className="w-1/3 px-2 flex flex-col gap-2 py-1">
                    <EditableText align="center" value={getOccValues()} onChange={(val) => {
                       let occs = val.split(',').map(s=>s.trim());
                       let newInh = [...data.inhabitants];
                       occs.forEach((o,idx) => { if(!newInh[idx]) newInh[idx] = {age:0, occupation:o, gender:''}; else newInh[idx].occupation = o; });
                       setData({...data, inhabitants: newInh});
                    }} className="w-full font-bold bg-yellow-100/30" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                </div>
                <div className="w-1/3 px-2 flex flex-col gap-2 py-1">
                    <EditableText align="center" value={getHobValues()} onChange={(val) => setData({...data, hobbies: val.split(',').map(s=>s.trim())})} className="w-full font-bold bg-yellow-100/30" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                </div>
              </div>
            </div>

            {/* Q2 */}
            <div className="mt-8">
              <p>2.- Do you have <strong className="font-bold">frequent overnight guests?</strong></p>
              <div className="flex gap-6 font-bold px-2 mt-2">
                 <CheckboxText label="Yes" checked={data.frequentGuests} onClick={()=>setData({...data, frequentGuests: true})} />
                 <CheckboxText label="No" checked={!data.frequentGuests} onClick={()=>setData({...data, frequentGuests: false})} />
              </div>
            </div>

            {/* Q3 */}
            <div className="mt-4">
              <p>3.- What are your <strong className="font-bold">priorities</strong> for the house?</p>
              <div className="flex justify-between font-bold mt-3 w-full pr-12 text-[10px] opacity-60">
                <span className={`${false ? 'font-bold underline text-black opacity-100' : ''}`}>Energy Efficiency</span>
                <span className={`${data.doubleHeight ? 'font-bold underline text-black opacity-100' : ''}`}>Grand Entry</span>
                <span className={`${false ? 'font-bold underline text-black opacity-100' : ''}`}>Circle Driveway</span>
                <span className={`${data.groundFloorSpaces.includes('pool') || data.upperFloorSpaces.includes('pool') ? 'font-bold underline text-black opacity-100' : ''}`}>Swimming Pool</span>
                <span className={`${false ? 'font-bold underline text-black opacity-100' : ''}`}>LED Lighting</span>
                <span className={`${data.groundFloorSpaces.includes('home_theater') ? 'font-bold underline text-black opacity-100' : ''}`}>Surround-Sound Media Room</span>
              </div>
              <div className="flex gap-2 items-end mt-5">
                 <strong className="text-[10px] pb-0.5">Others</strong> 
                 <EditableText align="left" value="" onChange={()=>{}} className="flex-1 bg-yellow-100/30 h-5" />
              </div>
            </div>

            {/* Q4 */}
            <div className="mt-6">
              <p>4.- Are there any <strong className="font-bold">special concerns</strong> that need to be accommodated in the new design, such as accessibility for a <strong className="font-bold bg-gray-100 px-1 border border-black/10 shadow-sm">wheel chair or walker</strong>?</p>
              <div className="flex gap-6 items-center mt-3 font-bold px-2">
                 <CheckboxText label="Yes" checked={data.accessibilityNeeds} onClick={()=>setData({...data, accessibilityNeeds: true})} /> 
                 <CheckboxText label="No" checked={!data.accessibilityNeeds} onClick={()=>setData({...data, accessibilityNeeds: false})} /> 
              </div>
              <div className="flex gap-2 items-end mt-4">
                 <strong className="text-[10px] pb-0.5">Others</strong> 
                 <EditableText align="left" value="" onChange={()=>{}} className="flex-1 bg-yellow-100/30 h-5" />
              </div>
            </div>

            {/* Q5 - 8 split column */}
            <div className="mt-8 flex gap-12 border-t-[3px] border-black border-dashed pt-6 pl-4">
              <div className="w-1/2">
                <p className="mb-3">5.- Which <strong className="font-bold">architectural style</strong> do you prefer?</p>
                <div className="flex flex-col font-bold gap-2 items-start ml-2 opacity-60">
                  <span className={`text-[9px] ${data.style === 'modern' ? 'font-bold underline text-black opacity-100' : ''}`}>Modern</span>
                  <span className={`text-[9px] ${data.style === 'contemporary' ? 'font-bold underline text-black opacity-100' : ''}`}>Contemporary</span>
                  <span className={`text-[9px] ${data.style === 'traditional' ? 'font-bold underline text-black opacity-100' : ''}`}>Traditional</span>
                  <span className={`text-[9px] ${data.style === 'classic_colonial' ? 'font-bold underline text-black opacity-100' : ''}`}>Colonial</span>
                  <span className={`text-[9px] ${data.style === 'ranch' ? 'font-bold underline text-black opacity-100' : ''}`}>Ranch/Rambler</span>
                  <span className={`text-[9px] ${data.style === 'cottage' ? 'font-bold underline text-black opacity-100' : ''}`}>Bungalow</span>
                  <span className={`text-[9px] ${false ? 'font-bold underline text-black opacity-100' : ''}`}>Cape Cod</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-start pb-4 space-y-8">
                <div className="space-y-2">
                  <p>6.- Favorite Color</p>
                  <EditableText align="center" value={data.favoriteColor} onChange={v => setData({...data, favoriteColor: v})} className="w-64 font-bold pb-0.5 uppercase" />
                </div>
                <div className="space-y-2">
                  <p>7.- Hate Color</p>
                  <EditableText align="center" value={data.forbiddenColors.join(', ')} onChange={v => setData({...data, forbiddenColors: v.split(',').map(s=>s.trim())})} className="w-64 font-bold pb-0.5 uppercase" />
                </div>
                <div className="space-y-2">
                  <p>8.- Favorite Room</p>
                  <EditableText align="center" value={t(data.favoriteRoom)} onChange={() => {}} className="w-64 font-bold pb-0.5 uppercase" />
                </div>
              </div>
            </div>

          </div>

          <div className="mt-auto pt-12 flex gap-4 items-end pb-8 pl-4">
             <strong className="text-[10px] pb-0.5 whitespace-nowrap">Authorized<br/>Signature</strong> <div className="border-b border-black w-[30%] ml-2 border-dashed"></div>
             <strong className="text-[10px] ml-12 pb-0.5">Name:</strong> <EditableText align="center" value={data.inhabitants[0]?.occupation || ''} onChange={v=>{let d={...data}; if(d.inhabitants[0]) d.inhabitants[0].occupation = v; setData(d);}} className="w-48 font-bold uppercase" />
             <strong className="text-[10px] ml-12 pb-0.5">Date:</strong> <EditableText align="center" value={new Date().toLocaleDateString()} onChange={()=>{}} className="w-32 font-bold uppercase" />
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: letter;
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:w-full {
            width: 8.5in !important;
            margin: 0 auto;
          }
        }
      `}</style>
    </motion.div>
  );
}
