/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Building2, 
  ClipboardCheck, 
  FileText, 
  MapPin, 
  DollarSign,
  Download,
  Printer,
  Plus,
  Minus,
  Calculator,
  AlertCircle,
  X,
  Users,
  Gavel,
  Construction,
  FileCode,
  BookOpen,
  Zap,
  Calendar,
  Sparkles,
  XCircle,
  HelpCircle,
  PaintRoller,
  Maximize,
  Search,
  PiggyBank,
  Info
} from 'lucide-react';
import { COMMERCIAL_QUESTIONNAIRE } from './constants/commercial';
import { FormState, Phase, Question, LocalizedString } from './types/commercial';
import { useProjectStore } from './store/projectStore';
import { StickyStepper } from './components/StickyStepper';


const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'common.progress': 'PROGRESS', 'common.save': 'SAVE', 'common.help': 'HELP', 'common.phase': 'PHASE',
    'common.custom_areas': 'Custom Areas', 'common.add_custom_area': '+ Add custom space', 'common.configurator': 'Configurator',
    'common.new_custom_area': 'New Space', 'common.space_name': 'Space Name', 'common.width': 'Width', 'common.length': 'Length',
    'common.total_area': 'Total Area', 'common.based_on_net': 'Based on precise net area', 'common.sq_ft': 'SQFT',
    'common.integrate_program': 'Integrate to Program', 'common.net_program': 'Net Area', 'common.circulation': 'Circulation (20%)',
    'common.gross_total': 'Gross Expected Construction', 'common.select': 'SELECT', 'common.min_required': 'Min Req.',
    'common.quantity': 'Qty', 'common.units': 'units', 'common.summary_title': 'Blueprint Summary', 'common.ref': 'Ref',
    'common.binding_line': 'OFFICIAL RECORD', 'common.not_specified': 'Not specified', 'common.blueprint_summary': 'Blueprint Summary',
    'common.commercial_intake': 'Commercial Intake', 'common.download_pdf': 'Export PDF', 'common.generating': 'Exporting...',
    'common.print': 'Print Official Document', 'common.project_identity': 'Project Identity', 'common.location_viability': 'Location & Viability',
    'common.scope_of_work': 'Scope of Work', 'common.target_audience': 'Target Audience', 'common.operational_strategic': 'Operational & Strategic',
    'common.plans': 'Plans', 'common.restrictions': 'Restrictions', 'common.priority': 'Priority', 'common.estimated_budget': 'Estimated Budget',
    'common.tbd': 'TBD', 'common.target_timeline': 'Target Timeline', 'common.parametric_note': 'Parametric intelligence accounts for...',
    'common.additional_custom_areas': 'Specific Areas', 'common.start_new_questionnaire': 'Approve & Save to Database',
    'common.confidential_document': 'Confidential', 'common.generated_on': 'Generated on'
  },
  es: {
    'common.progress': 'PROGRESO', 'common.save': 'GUARDAR', 'common.help': 'AYUDA', 'common.phase': 'FASE',
    'common.custom_areas': 'Áreas Especiales', 'common.add_custom_area': '+ Añadir área designada', 'common.configurator': 'Configurador',
    'common.new_custom_area': 'Nuevo Espacio', 'common.space_name': 'Nombre del Espacio', 'common.width': 'Ancho (W) ft', 'common.length': 'Largo (L) ft',
    'common.total_area': 'Área Total', 'common.based_on_net': 'Dimensión Neta', 'common.sq_ft': 'SQFT',
    'common.integrate_program': 'Integrar al Programa', 'common.net_program': 'Subtotal Neto', 'common.circulation': 'Circulación (20%)',
    'common.gross_total': 'Total Estimado', 'common.select': 'SELECCIONAR', 'common.min_required': 'Mín Req.',
    'common.quantity': 'Cant.', 'common.units': 'unid.', 'common.summary_title': 'Resumen de Ficha', 'common.ref': 'Ref',
    'common.binding_line': 'REGISTRO APROBADO', 'common.not_specified': 'No especificado', 'common.blueprint_summary': 'Ficha de Integración',
    'common.commercial_intake': 'Consulta Comercial', 'common.download_pdf': 'Guardar en Expediente', 'common.generating': 'Procesando...',
    'common.print': 'Impresión Formal', 'common.project_identity': 'Identidad del Proyecto', 'common.location_viability': 'Ubicación y Variables',
    'common.scope_of_work': 'Alcance', 'common.target_audience': 'Público', 'common.operational_strategic': 'Indicadores',
    'common.plans': 'Planos', 'common.restrictions': 'Restricciones', 'common.priority': 'Prioridad', 'common.estimated_budget': 'Presupuesto',
    'common.tbd': 'TBD', 'common.target_timeline': 'Timeline Base', 'common.parametric_note': 'El motor paramétrico añade zonas de tolerancia...',
    'common.additional_custom_areas': 'Volumetría Adicional', 'common.start_new_questionnaire': 'Finalizar y Guardar en Proyecto',
    'common.confidential_document': 'Documento Confidencial', 'common.generated_on': 'Generado:'
  }
};

let currentLangGlobal = 'es';

const useTranslation = () => {
    const [lang, setLang] = React.useState(currentLangGlobal);
    const t = (key: string) => TRANSLATIONS[lang]?.[key] || key;
    return {
        t,
        i18n: {
             language: lang,
             changeLanguage: (l: string) => { currentLangGlobal = l; setLang(l); }
        }
    };
};

export default function CommercialApp({ onComplete, initialData }: { onComplete?: (data: any) => void, initialData?: any }) {
  const { currentProject, updateProject: syncGlobal } = useProjectStore();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'en' | 'es';

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  const [activeNavPhase, setActiveNavPhase] = useState(1);
  const [formState, setFormState] = useState<FormState>(initialData || {});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Refs for scroll sections
  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Compute visible phases based on form state conditions
  const visiblePhases = COMMERCIAL_QUESTIONNAIRE.filter(phase => 
    !phase.condition || phase.condition(formState)
  );

  const scrollToPhase = (phaseId: string | number) => {
    const section = phaseRefs.current[phaseId];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Track active phase on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const pId = entry.target.getAttribute('data-phase-id');
            const pIdx = visiblePhases.findIndex(p => p.id === pId);
            if (pIdx !== -1) setActiveNavPhase(pIdx + 1);
          }
        });
      },
      { threshold: 0.2, rootMargin: '-10% 0px -70% 0px' }
    );

    Object.values(phaseRefs.current).forEach(ref => {
      if (ref instanceof Element) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [visiblePhases]);

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [newCustomArea, setNewCustomArea] = useState({ name: '', width: 10, length: 10 });

  // Calculate Parametric SqFt
  const calculateSqFt = () => {
    let netSqFt = 0;
    const itemized: { name: string, qty: number, sqFt: number, subtotal: number, width?: number, length?: number }[] = [];

    visiblePhases.forEach(phase => {
      phase.questions.forEach(q => {
        if (q.type === 'Area Stepper' && q.minSqFt) {
          const qty = Number(formState[q.id]) || 0;
          const width = Number(formState[q.id + '_width']) || Math.sqrt(q.minSqFt);
          const length = Number(formState[q.id + '_length']) || Math.sqrt(q.minSqFt);
          const customSqFt = Number(formState[q.id + '_sqft']) || (Math.round(width * length));
          
          const subtotal = qty * customSqFt;
          if (qty > 0) {
            netSqFt += subtotal;
            const label = typeof q.label === 'string' ? q.label : q.label[currentLang];
            itemized.push({ 
              name: label, 
              qty, 
              sqFt: customSqFt, 
              subtotal,
              width: Math.round(width * 10) / 10,
              length: Math.round(length * 10) / 10
            });
          }
        }
      });
    });

    // Add custom areas
    if (formState.custom_areas) {
      formState.custom_areas.forEach(area => {
        const subtotal = area.qty * area.sqFt;
        netSqFt += subtotal;
        itemized.push({ 
          name: area.name, 
          qty: area.qty, 
          sqFt: area.sqFt, 
          subtotal,
          width: area.width,
          length: area.length
        });
      });
    }

    const circulationFactor = 0.20;
    const circulationSqFt = Math.round(netSqFt * circulationFactor);
    const grossSqFt = netSqFt + circulationSqFt;
    
    return { netSqFt, circulationSqFt, grossSqFt, itemized };
  };

  const currentStep = activeNavPhase;
  const totalSteps = visiblePhases.length;

  const getQuestionIcon = (iconName?: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'FileText': <FileText className="w-6 h-6" />,
      'ClipboardCheck': <ClipboardCheck className="w-6 h-6" />,
      'Users': <Users className="w-6 h-6" />,
      'MapPin': <MapPin className="w-6 h-6" />,
      'Gavel': <Gavel className="w-6 h-6" />,
      'Construction': <Construction className="w-6 h-6" />,
      'FileCode': <FileCode className="w-6 h-6" />,
      'BookOpen': <BookOpen className="w-6 h-6" />,
      'Zap': <Zap className="w-6 h-6" />,
      'Calendar': <Calendar className="w-6 h-6" />,
      'Sparkles': <Sparkles className="w-6 h-6" />,
      'XCircle': <XCircle className="w-6 h-6" />,
      'HelpCircle': <HelpCircle className="w-6 h-6" />,
      'PaintRoller': <PaintRoller className="w-6 h-6" />,
      'Maximize': <Maximize className="w-6 h-6" />,
      'Search': <Search className="w-6 h-6" />,
      'PiggyBank': <PiggyBank className="w-6 h-6" />,
      'DollarSign': <DollarSign className="w-6 h-6" />,
      'CheckCircle2': <CheckCircle2 className="w-6 h-6" />
    };
    return icons[iconName || ''] || <FileText className="w-6 h-6" />;
  };

  const handleInputChange = (questionId: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const addCustomArea = () => {
    if (!newCustomArea.name) return;
    const sqFt = Math.round(newCustomArea.width * newCustomArea.length);
    const newArea = {
      id: `custom_${Date.now()}`,
      name: newCustomArea.name,
      qty: 1,
      width: newCustomArea.width,
      length: newCustomArea.length,
      sqFt
    };
    setFormState(prev => ({
      ...prev,
      custom_areas: [...(prev.custom_areas || []), newArea]
    }));
    setIsCustomModalOpen(false);
    setNewCustomArea({ name: '', width: 10, length: 10 });
  };

  const updateCustomAreaQty = (id: string, delta: number) => {
    setFormState(prev => ({
      ...prev,
      custom_areas: prev.custom_areas?.map(area => 
        area.id === id ? { ...area, qty: Math.max(0, area.qty + delta) } : area
      ).filter(area => area.qty > 0)
    }));
  };

  const { netSqFt, circulationSqFt, grossSqFt, itemized } = calculateSqFt();

  const handleFinish = () => {
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  if (isSubmitted) {
    return <SummaryView 
      formState={formState} 
      visiblePhases={visiblePhases} 
      netSqFt={netSqFt} 
      circulationSqFt={circulationSqFt}
      grossSqFt={grossSqFt} 
      currentLang={currentLang}
      onReset={() => {
        setIsSubmitted(false);
        setActiveNavPhase(1);
        setFormState({});
      }} 
     onComplete={onComplete} />;
  }

  return (
    <div className="min-h-screen bg-arch-gray text-arch-ink font-sans selection:bg-arch-blue-dark selection:text-white">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(227,242,253,0.4),transparent_70%)]" />
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-arch-ink/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
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
              <span className="text-[9px] font-black text-arch-text/20 uppercase tracking-widest">{t('common.progress')}</span>
              <span className="text-[10px] font-black text-arch-text uppercase tracking-widest">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-32 h-1 bg-arch-border rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-arch-brand-sage"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-arch-surface border border-arch-border hover:border-arch-text/20 transition-all group"
            >
              <span className={`text-[10px] font-black tracking-widest transition-colors ${currentLang === 'en' ? 'text-arch-text' : 'text-arch-text/20 group-hover:text-arch-text/40'}`}>EN</span>
              <div className="w-px h-3 bg-arch-border" />
              <span className={`text-[10px] font-black tracking-widest transition-colors ${currentLang === 'es' ? 'text-arch-text' : 'text-arch-text/20 group-hover:text-arch-text/40'}`}>ES</span>
            </button>
            <button className="text-[9px] font-black uppercase tracking-widest text-arch-text/40 hover:text-arch-text transition-colors">{t('common.save')}</button>
            <div className="w-px h-4 bg-arch-border" />
            <button className="text-[9px] font-black uppercase tracking-widest text-arch-brand-sky">{t('common.help')}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Sticky Navigation */}
          <StickyStepper 
            onStepClick={(id) => scrollToPhase(id)}
            steps={visiblePhases.map((p, idx) => ({
              id: p.id,
              label: typeof p.title === 'string' ? p.title : p.title[currentLang],
              isCompleted: false, // Could be derived from completion logic
              isActive: activeNavPhase === idx + 1
            }))}
          />

          {/* Unified Vertical Stack */}
          <div className="flex-1 space-y-32">
            {visiblePhases.map((phase, pIdx) => {
              const visibleQuestions = phase.questions.filter(q => !q.condition || q.condition(formState));
              const isInventory = phase.id.startsWith('space-inventory');

              return (
                <section 
                  key={phase.id} 
                  ref={el => phaseRefs.current[phase.id] = el}
                  data-phase-id={phase.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-1000"
                >
                  {/* Phase Header */}
                  <div className="mb-16">
                    {pIdx === 0 && (
                      <div className="mb-12 p-8 bg-arch-blue/5 border border-arch-blue/10 rounded-3xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-2 h-2 rounded-full bg-arch-blue animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-arch-blue-dark uppercase">Identidad del Proyecto (SSOT)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                              <label className="text-[9px] font-bold text-arch-text/40 uppercase tracking-widest">Nombre del Proyecto</label>
                              <input 
                                value={currentProject.projectName} 
                                onChange={(e) => syncGlobal({ projectName: e.target.value })}
                                placeholder="Ej. Torre Comercial"
                                className="w-full bg-transparent border-b border-arch-border pb-1 font-bold text-sm focus:border-brand-blue outline-none transition-colors" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-bold text-arch-text/40 uppercase tracking-widest">Ubicación</label>
                              <input 
                                value={currentProject.location} 
                                onChange={(e) => syncGlobal({ location: e.target.value })}
                                placeholder="Ubicación Detallada"
                                className="w-full bg-transparent border-b border-arch-border pb-1 font-bold text-sm focus:border-brand-blue outline-none transition-colors" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-bold text-arch-text/40 uppercase tracking-widest">Cliente</label>
                              <input 
                                value={currentProject.clientName} 
                                onChange={(e) => syncGlobal({ clientName: e.target.value })}
                                placeholder="Propiedad / Grupo"
                                className="w-full bg-transparent border-b border-arch-border pb-1 font-bold text-sm focus:border-brand-blue outline-none transition-colors" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-bold text-arch-text/40 uppercase tracking-widest">Fecha Estimada</label>
                              <input 
                                type="date"
                                value={currentProject.estimatedDeliveryDate} 
                                onChange={(e) => syncGlobal({ estimatedDeliveryDate: e.target.value })}
                                className="w-full bg-transparent border-b border-arch-border pb-1 font-bold text-sm focus:border-brand-blue outline-none transition-colors" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-brand-dark-blue" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/30 uppercase">{t('common.phase')} {pIdx + 1}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-arch-ink tracking-tight mb-4 uppercase">
                      {typeof phase.title === 'string' ? phase.title : phase.title[currentLang]}
                    </h2>
                    <p className="text-lg text-arch-ink/50 max-w-2xl font-medium leading-relaxed">
                      {typeof phase.description === 'string' ? phase.description : phase.description[currentLang]}
                    </p>
                  </div>

                  <div className="space-y-16">
                    {/* Viability Alert */}
                    {phase.id === 'universal-viability' && formState.estimated_budget === '$100k - $250k' && (
                      <div className="bg-arch-blue/20 border border-arch-blue-dark/10 p-6 rounded-xl flex gap-4 items-start">
                        <AlertCircle className="w-5 h-5 text-arch-blue-dark shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-arch-blue-dark mb-1">Nota de Viabilidad ARCHCOS</h4>
                          <p className="text-xs font-medium text-arch-ink/60 leading-relaxed uppercase tracking-tighter">
                            En el mercado actual de Houston, los proyectos comerciales complejos suelen requerir una inversión base mayor.
                          </p>
                        </div>
                      </div>
                    )}

                    {isInventory ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        <div className="lg:col-span-2 space-y-12">
                          {visibleQuestions.map((q) => (
                            <div key={q.id} className="group">
                              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-arch-ink/40 mb-5 group-focus-within:text-arch-ink transition-colors">
                                {typeof q.label === 'string' ? q.label : q.label[currentLang]}
                              </label>
                              <QuestionField 
                                question={q} 
                                value={formState[q.id]} 
                                getQuestionIcon={getQuestionIcon}
                                currentLang={currentLang}
                                widthValue={formState[q.id + '_width']}
                                lengthValue={formState[q.id + '_length']}
                                onChange={(val) => handleInputChange(q.id, val)} 
                                onDimensionChange={(w, l) => {
                                  handleInputChange(q.id + '_width', w);
                                  handleInputChange(q.id + '_length', l);
                                  handleInputChange(q.id + '_sqft', Math.round(w * l));
                                }}
                              />
                            </div>
                          ))}
                          
                          {/* Custom Areas */}
                          {formState.custom_areas && formState.custom_areas.length > 0 && (
                             <div className="space-y-6 pt-10 border-t border-arch-ink/5">
                                {formState.custom_areas.map(area => (
                                  <div key={area.id} className="flex items-center justify-between bg-arch-green/10 p-6 rounded-2xl border border-arch-green-dark/10">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-arch-ink uppercase">{area.name}</span>
                                      <span className="text-[10px] font-medium text-arch-ink/30 uppercase tracking-widest">{area.width}ft x {area.length}ft = {area.sqFt} SqFt</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <button onClick={() => updateCustomAreaQty(area.id, -1)} className="w-10 h-10 rounded-full bg-white border border-arch-ink/10 flex items-center justify-center hover:bg-arch-ink hover:text-white transition-all"><Minus size={14}/></button>
                                      <span className="text-xl font-black w-8 text-center">{area.qty}</span>
                                      <button onClick={() => updateCustomAreaQty(area.id, 1)} className="w-10 h-10 rounded-full bg-white border border-arch-ink/10 flex items-center justify-center hover:bg-arch-ink hover:text-white transition-all"><Plus size={14}/></button>
                                    </div>
                                  </div>
                                ))}
                             </div>
                          )}

                          <button 
                            onClick={() => setIsCustomModalOpen(true)}
                            className="w-full py-6 border-2 border-dashed border-arch-ink/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/40 hover:border-arch-ink/30 hover:text-arch-ink transition-all flex items-center justify-center gap-3"
                          >
                            <Plus size={16}/> {t('common.add_custom_area')}
                          </button>
                        </div>
                        
                        {/* Sidebar Recap for Inventory */}
                        <div className="lg:sticky lg:top-32 space-y-6">
                           <div className="bg-white p-8 rounded-[3rem] shadow-elegant border border-arch-ink/5">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-dark-blue mb-8">Blueprint Summary</h3>
                              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto no-scrollbar">
                                 {itemized.map((it, idx) => (
                                   <div key={idx} className="flex justify-between items-center text-[10px]">
                                      <span className="font-bold text-brand-ink/60 uppercase">{it.name}</span>
                                      <span className="font-mono text-brand-ink/40">{it.subtotal.toLocaleString()} ft²</span>
                                   </div>
                                 ))}
                              </div>
                              <div className="pt-6 border-t border-brand-ink/5">
                                 <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40">Total Presupuestado</span>
                                    <div className="text-right">
                                       <span className="text-3xl font-black text-brand-dark-blue tracking-tighter">{grossSqFt.toLocaleString()}</span>
                                       <span className="text-[10px] font-bold text-brand-ink/20 ml-1">FT²</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-12 max-w-4xl">
                        {visibleQuestions.map((q) => (
                          <div key={q.id} className="group">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 rounded-lg bg-brand-neutral/40 text-brand-dark-blue">
                                   {getQuestionIcon(q.icon)}
                                </div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-arch-ink/40 group-focus-within:text-arch-ink transition-colors">
                                  {typeof q.label === 'string' ? q.label : q.label[currentLang]}
                                </label>
                             </div>
                             <QuestionField 
                                question={q} 
                                value={formState[q.id]} 
                                getQuestionIcon={getQuestionIcon}
                                currentLang={currentLang}
                                onChange={(val) => handleInputChange(q.id, val)} 
                             />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {pIdx === visiblePhases.length - 1 && (
                    <div className="mt-32 pt-16 border-t border-arch-ink/5 flex justify-center">
                      <button
                        onClick={handleFinish}
                        className="bg-brand-dark-blue text-white px-16 py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-6 hover:scale-[1.05] transition-all shadow-2xl active:scale-95"
                      >
                        Finalizar y Generar Expediente <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-20 text-center">
          <div className="flex justify-center gap-8 mb-6 opacity-20">
            <div className="w-px h-8 bg-arch-ink" />
            <div className="w-px h-8 bg-arch-ink" />
            <div className="w-px h-8 bg-arch-ink" />
          </div>
          <p className="text-[9px] text-arch-ink/30 font-black uppercase tracking-[0.4em]">
            ARCHCOS &copy; 2026 | Intelligent Intake System v2.0
          </p>
        </footer>
      </main>
    </div>
  );
}

function QuestionField({ 
  question, 
  value, 
  widthValue, 
  lengthValue, 
  onChange, 
  onDimensionChange, 
  getQuestionIcon,
  currentLang
}: { 
  question: Question, 
  value: any, 
  widthValue?: any,
  lengthValue?: any,
  onChange: (val: any) => void,
  onDimensionChange?: (w: number, l: number) => void,
  getQuestionIcon: (iconName?: string) => React.ReactNode,
  currentLang: 'en' | 'es'
}) {
  const { t } = useTranslation();
  const [sqFtError, setSqFtError] = useState(false);

  const getLocalizedLabel = (label: string | LocalizedString) => {
    return typeof label === 'string' ? label : label[currentLang];
  };

  switch (question.type) {
    case 'Texto Corto':
      return (
        <div className="relative group">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getLocalizedLabel(question.placeholder || '')}
            className="w-full bg-transparent border-b-2 border-arch-ink/15 py-6 focus:border-arch-ink outline-none transition-all text-3xl font-light placeholder:text-arch-ink/10"
          />
          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-arch-ink group-focus-within:w-full transition-all duration-500" />
        </div>
      );
    case 'Texto Largo':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getLocalizedLabel(question.placeholder || '')}
          rows={4}
          className="w-full bg-white border border-arch-ink/15 p-8 rounded-2xl shadow-soft focus:shadow-elegant focus:border-arch-ink/20 outline-none transition-all text-lg font-medium placeholder:text-arch-ink/10 resize-none"
        />
      );
    case 'Número':
      return (
        <div className="relative group max-w-[200px]">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getLocalizedLabel(question.placeholder || '')}
            className="w-full bg-transparent border-b-2 border-arch-ink/15 py-4 focus:border-arch-ink outline-none transition-all text-2xl font-black placeholder:text-arch-ink/10"
          />
          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-arch-ink group-focus-within:w-full transition-all duration-500" />
        </div>
      );
    case 'Fecha':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-xs bg-white border border-arch-ink/15 p-6 rounded-2xl shadow-soft focus:shadow-elegant outline-none transition-all text-xl font-medium"
        />
      );
    case 'Opción Múltiple':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {question.options?.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label[currentLang];
            const iconName = question.optionIcons?.[optValue];
            
            return (
              <button
                key={optValue}
                onClick={() => onChange(optValue)}
                className={`w-full text-left px-8 py-8 rounded-[32px] border-2 transition-all flex flex-col gap-6 group relative overflow-hidden ${
                  value === optValue 
                    ? 'bg-brand-blue/15 text-arch-ink border-brand-blue shadow-elegant' 
                    : 'bg-white border-arch-ink/15 text-arch-ink/60 hover:border-arch-ink/30 hover:shadow-soft'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${value === optValue ? 'bg-brand-blue/20 text-brand-blue' : 'bg-arch-gray text-arch-ink/20 group-hover:text-arch-ink/40'}`}>
                  {getQuestionIcon(iconName)}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold leading-tight">{optLabel}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${value === optValue ? 'text-brand-blue' : 'text-arch-ink/20'}`}>{t('common.select')}</span>
                </div>
                {value === optValue && (
                  <div className="absolute top-6 right-6 w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      );
    case 'Area Stepper':
      const qty = Number(value) || 0;
      const minSqFt = question.minSqFt || 0;
      const currentWidth = Number(widthValue) || Math.sqrt(minSqFt);
      const currentLength = Number(lengthValue) || Math.sqrt(minSqFt);
      const currentSqFt = Math.round(currentWidth * currentLength);
      
      const handleDimensionEdit = (w: number, l: number) => {
        const total = w * l;
        if (total < minSqFt) {
          setSqFtError(true);
          setTimeout(() => setSqFtError(false), 3000);
        } else {
          setSqFtError(false);
        }
        onDimensionChange?.(w, l);
      };

      return (
        <div className="flex flex-col gap-8 bg-white p-10 rounded-3xl shadow-soft border border-arch-ink/5 hover:shadow-elegant transition-all duration-500">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex flex-col flex-1 w-full">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-2 h-2 bg-arch-green-dark rounded-full" />
                <span className="text-[10px] uppercase font-black tracking-widest text-arch-ink"> {getLocalizedLabel(question.label)}</span>
              </div>
              
              <div className="flex flex-wrap items-end gap-8">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-4">{t('common.width')}</span>
                  <div className="relative group">
                    <input 
                      type="number"
                      value={Math.round(currentWidth * 10) / 10}
                      onChange={(e) => handleDimensionEdit(Number(e.target.value), currentLength)}
                      className="w-24 bg-arch-gray border-b-2 border-transparent py-4 px-2 text-2xl font-black outline-none focus:border-arch-ink focus:bg-white transition-all text-center rounded-t-lg"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-arch-ink group-focus-within:w-full transition-all duration-500" />
                  </div>
                </div>
                
                <div className="flex items-center h-16 text-arch-ink/10 font-light text-3xl">×</div>
                
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-4">{t('common.length')}</span>
                  <div className="relative group">
                    <input 
                      type="number"
                      value={Math.round(currentLength * 10) / 10}
                      onChange={(e) => handleDimensionEdit(currentWidth, Number(e.target.value))}
                      className="w-24 bg-arch-gray border-b-2 border-transparent py-4 px-2 text-2xl font-black outline-none focus:border-arch-ink focus:bg-white transition-all text-center rounded-t-lg"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-arch-ink group-focus-within:w-full transition-all duration-500" />
                  </div>
                </div>

                <div className="flex items-center h-16 text-arch-ink/10 font-light text-3xl">=</div>

                <div className="flex flex-col relative">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-4">Total {t('common.sq_ft')}</span>
                  <div className={`h-16 flex items-center px-10 rounded-2xl text-2xl font-black transition-all ${sqFtError ? 'bg-red-50 text-red-500 border border-red-200 animate-shake' : 'bg-arch-green/30 text-arch-green-dark border border-arch-green-dark/10'}`}>
                    {currentSqFt.toLocaleString()}
                  </div>
                  <AnimatePresence>
                    {sqFtError && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute -top-12 left-0 bg-arch-ink text-white text-[9px] font-black px-4 py-2 rounded-lg whitespace-nowrap z-10 shadow-2xl flex items-center gap-2"
                      >
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        {t('common.min_required')}: {minSqFt} FT²
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10 bg-arch-gray p-8 rounded-3xl border border-arch-ink/5 w-full lg:w-auto justify-center">
              <button 
                onClick={() => onChange(Math.max(0, qty - 1))}
                className="w-14 h-14 rounded-full bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center hover:bg-arch-ink hover:text-white transition-all active:scale-90"
              >
                <Minus className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center min-w-[80px]">
                <span className="text-[9px] font-black uppercase tracking-widest text-arch-ink/30 mb-2">{t('common.quantity')}</span>
                <span className="text-4xl font-black text-arch-ink">{qty}</span>
              </div>
              <button 
                onClick={() => onChange(qty + 1)}
                className="w-14 h-14 rounded-full bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center hover:bg-arch-ink hover:text-white transition-all active:scale-90"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      );
    case 'Chips':
      const chipValues = Array.isArray(value) ? value : [];
      const toggleChip = (v: string) => {
        if (chipValues.includes(v)) {
          onChange(chipValues.filter(item => item !== v));
        } else {
          onChange([...chipValues, v]);
        }
      };
      return (
        <div className="flex flex-wrap gap-3">
          {question.options?.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label[currentLang];
            
            return (
              <button
                key={optValue}
                onClick={() => toggleChip(optValue)}
                className={`px-6 py-3 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  chipValues.includes(optValue)
                    ? 'bg-brand-blue/15 text-arch-ink border-brand-blue shadow-soft'
                    : 'bg-white border-arch-ink/15 text-arch-ink/40 hover:border-arch-ink/30'
                }`}
              >
                {optLabel}
              </button>
            );
          })}
        </div>
      );
    case 'Image Picker':
      const STYLE_IMAGES: Record<string, string> = {
        'Modern Industrial':    '/assets/styles/modern-industrial.png',
        'Minimalist Corporate': '/assets/styles/minimalist-corporate.png',
        'Warm & Organic':       '/assets/styles/warm-organic.png',
        'Classic/Traditional':  '/assets/styles/classic-traditional.png',
        'High-Tech':            '/assets/styles/high-tech.png',
        'Transitional':         '/assets/styles/transicional.png',
      };
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {question.options?.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label[currentLang];
            const imgSrc = STYLE_IMAGES[optValue] || `/assets/styles/${optValue.replace(/[\s&/]+/g, '-').toLowerCase()}.png`;
            
            return (
              <button
                key={optValue}
                onClick={() => onChange(optValue)}
                className={`group relative aspect-[4/5] rounded-3xl overflow-hidden border-2 transition-all ${
                  value === optValue 
                    ? 'border-arch-blue-dark shadow-elegant scale-[1.02]' 
                    : 'border-transparent hover:border-arch-ink/10'
                }`}
              >
                <img 
                  src={imgSrc} 
                  alt={optLabel}
                  className={`w-full h-full object-cover transition-all duration-700 ${value === optValue ? 'scale-110' : 'group-hover:scale-105 grayscale-[0.3] group-hover:grayscale-0'}`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${value === optValue ? 'from-arch-blue-dark/80 via-transparent opacity-100' : 'from-arch-ink/70 via-transparent opacity-60 group-hover:opacity-100'}`} />
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-1 ${value === optValue ? 'text-arch-blue' : 'text-white/60'}`}>Style</span>
                  <span className="text-sm font-bold text-white leading-tight">{optLabel}</span>
                </div>
                {value === optValue && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-arch-blue-dark rounded-full flex items-center justify-center shadow-2xl">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      );
    case 'Checkboxes':
      const currentValues = Array.isArray(value) ? value : [];
      const toggleValue = (v: string) => {
        if (currentValues.includes(v)) {
          onChange(currentValues.filter(item => item !== v));
        } else {
          onChange([...currentValues, v]);
        }
      };
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options?.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label[currentLang];
            
            return (
              <button
                key={optValue}
                onClick={() => toggleValue(optValue)}
                className={`w-full text-left px-8 py-6 rounded-2xl border transition-all flex items-center justify-between group ${
                  currentValues.includes(optValue)
                    ? 'bg-arch-blue/20 border-arch-blue-dark text-arch-ink shadow-soft' 
                    : 'bg-white border-arch-ink/5 text-arch-ink/60 hover:border-arch-ink/20 hover:shadow-soft'
                }`}
              >
                <span className="text-[11px] font-black uppercase tracking-widest">{optLabel}</span>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${currentValues.includes(optValue) ? 'bg-arch-blue-dark border-arch-blue-dark' : 'bg-transparent border-arch-ink/10 group-hover:border-arch-ink/20'}`}>
                  {currentValues.includes(optValue) && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}

function SummaryView({ formState, visiblePhases, netSqFt, circulationSqFt, grossSqFt, onReset, currentLang, onComplete }: { 
  formState: FormState, 
  visiblePhases: Phase[], 
  netSqFt: number, 
  circulationSqFt: number,
  grossSqFt: number, 
  onReset: () => void,
  onComplete?: (data: any) => void,
  currentLang: 'en' | 'es'
}) {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  
  const generateOfficialPDF = async () => {
      window.print();
      return null;
  };


  
  const handleDownloadPDF = async () => {
      setIsGenerating(true);
      setTimeout(() => {
          onComplete?.(formState);
          setIsGenerating(false);
      }, 800);
  };


  
  const handlePrint = async () => {
      window.print();
  };


  const getOptionLabel = (questionId: string, value: any) => {
    if (!value) return null;
    const question = visiblePhases.flatMap(p => p.questions).find(q => q.id === questionId);
    if (question && question.options) {
      if (Array.isArray(value)) {
        return value.map(v => {
          const opt = question.options?.find(o => {
            if (typeof o === 'string') return o === v;
            return o.value === v;
          });
          if (!opt) return v;
          if (typeof opt === 'string') return opt;
          return typeof opt.label === 'string' ? opt.label : opt.label[currentLang];
        }).join(', ');
      }
      const option = question.options.find(opt => {
        if (typeof opt === 'string') return opt === value;
        return opt.value === value;
      });
      if (option) {
        if (typeof option === 'string') return option;
        return typeof option.label === 'string' ? option.label : option.label[currentLang];
      }
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-arch-gray text-arch-ink p-6 md:p-24 font-sans print:p-0 print:bg-white">
      <div 
        ref={reportRef} 
        className="max-w-5xl mx-auto bg-white shadow-elegant print:shadow-none print:max-w-none print:w-[210mm] print:mx-auto print:p-[20mm] rounded-[60px] print:rounded-none overflow-hidden relative"
      >
        {/* Official Document Markings */}
        <div className="absolute top-10 right-10 flex flex-col items-end opacity-20 pointer-events-none select-none no-print">
          <span className="text-[8px] font-black uppercase tracking-[0.5em]">{t('common.official_blueprint')}</span>
          <span className="text-[8px] font-medium uppercase tracking-widest mt-1">ID: ARCH-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
        </div>

        <div className="p-12 md:p-24">
          {/* Report Header & Dashboard - Section 1 */}
          <div className="pdf-section mb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 pb-12 border-b-2 border-arch-ink">
              <div>
                <div className="flex gap-1 mb-8">
                  <div className="w-8 h-8 bg-arch-green-dark rounded-sm" />
                  <div className="w-8 h-8 bg-arch-blue-dark rounded-sm" />
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-arch-ink mb-6 uppercase"> {t('common.blueprint_summary')}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-arch-ink/30">ARCHCOS Architecture</span>
                  <div className="w-12 h-px bg-arch-ink/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-arch-ink/30">{t('common.commercial_intake')}</span>
                </div>
              </div>
              <div className="mt-12 md:mt-0 flex gap-4 no-print">
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={isGenerating}
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-brand-blue/15 border border-brand-blue/40 text-arch-ink px-8 py-4 hover:bg-brand-blue/25 transition-all rounded-sm shadow-elegant disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isGenerating ? t('common.generating') : `${t('common.download_pdf')} (A4)`}
                </button>
                <button 
                  onClick={handlePrint} 
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-arch-ink/20 text-arch-ink px-8 py-4 hover:bg-brand-neutral transition-all rounded-sm"
                >
                  <Printer className="w-4 h-4" /> {t('common.print')}
                </button>
              </div>
            </div>

            {/* Project Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Identity Card */}
              <div className="lg:col-span-2 bg-white rounded-[40px] shadow-soft border border-arch-ink/5 overflow-hidden flex flex-col md:flex-row print:shadow-none">
                <div className="md:w-1/2 relative min-h-[300px]">
                  <img 
                    src={`https://picsum.photos/seed/${(formState.global_style as string || 'modern').replace(/\s+/g, '-').toLowerCase()}/1200/1600`} 
                    alt="Project Style"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/80 via-brand-dark-blue/20 to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-2 block">{t('common.project_identity')}</span>
                    <h2 className="text-4xl font-sans text-white tracking-tight leading-tight">{formState.project_name || t('common.not_specified')}</h2>
                    <div className="flex items-center gap-3 mt-6">
                      <div className="px-4 py-1.5 bg-arch-blue-dark/20 backdrop-blur-md border border-white/10 rounded-full">
                        <span className="text-[9px] font-black uppercase tracking-widest text-arch-blue-dark">{getOptionLabel('business_type', formState.business_type) || t('common.not_specified')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2 p-12 flex flex-col justify-between bg-white">
                  <div className="space-y-10">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-arch-ink/20 mb-4 block">{t('common.location_viability')}</span>
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-arch-gray flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-arch-ink/40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-arch-ink leading-snug">{formState.project_location || t('common.not_specified')}</p>
                          <p className="text-[10px] font-medium text-arch-ink/40 mt-1 uppercase tracking-wider">{getOptionLabel('legal_status', formState.legal_status) || t('common.not_specified')}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-arch-gray flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-arch-ink/40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-arch-ink leading-snug">{getOptionLabel('intervention_type', formState.intervention_type) || t('common.not_specified')}</p>
                          <p className="text-[10px] font-medium text-arch-ink/40 mt-1 uppercase tracking-wider">{t('common.scope_of_work')}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-arch-ink/20 mb-4 block">{t('common.target_audience')}</span>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(formState.target_audience) && formState.target_audience.map((tag: string) => (
                          <span key={tag} className="px-3 py-1 bg-arch-gray rounded-lg text-[9px] font-black uppercase tracking-widest text-arch-ink/60 border border-arch-ink/5">
                            {getOptionLabel('target_audience', tag)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-arch-ink/20 mb-4 block">{t('common.operational_strategic')}</span>
                      <div className="space-y-3">
                        {formState.as_built_plans && (
                          <div className="flex items-center gap-3">
                            <FileCode className="w-3.5 h-3.5 text-arch-blue-dark" />
                            <span className="text-[11px] font-bold text-arch-ink">{t('common.plans')}: {getOptionLabel('as_built_plans', formState.as_built_plans)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Gavel className="w-3.5 h-3.5 text-arch-blue-dark" />
                          <span className="text-[11px] font-bold text-arch-ink">{t('common.restrictions')}: {getOptionLabel('landlord_manual', formState.landlord_manual)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Zap className="w-3.5 h-3.5 text-arch-blue-dark" />
                          <span className="text-[11px] font-bold text-arch-ink">{t('common.priority')}: {getOptionLabel('strategic_priority', formState.strategic_priority)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-arch-ink/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-arch-ink/20 mb-1">{t('common.estimated_budget')}</span>
                      <span className="text-xl font-black text-arch-ink">{getOptionLabel('estimated_budget', formState.estimated_budget) || t('common.tbd')}</span>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-arch-ink/20 mb-1">{t('common.target_timeline')}</span>
                      <span className="text-xl font-black text-arch-green-dark">{formState.target_timeline ? new Date(formState.target_timeline as string).toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' }) : t('common.tbd')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Area Summary Card */}
              <div className="bg-brand-dark-blue rounded-[40px] p-12 shadow-elegant flex flex-col justify-between relative overflow-hidden print:shadow-none border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-12 block">{t('common.parametric_note')}</span>
                  
                  <div className="space-y-10">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">{t('common.net_program')}</p>
                        <p className="text-4xl font-black text-white tracking-tighter">{netSqFt.toLocaleString()} <span className="text-xs font-bold text-white/20 ml-1">{t('common.sq_ft')}</span></p>
                      </div>
                      <div className="w-12 h-px bg-white/10 mb-4" />
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">{t('common.circulation')}</p>
                        <p className="text-4xl font-black text-arch-green tracking-tighter">+{circulationSqFt.toLocaleString()} <span className="text-xs font-bold text-white/20 ml-1">{t('common.sq_ft')}</span></p>
                      </div>
                      <div className="w-12 h-px bg-white/10 mb-4" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-12 mt-12 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue mb-4">{t('common.gross_total')}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black text-white tracking-tighter">{grossSqFt.toLocaleString()}</p>
                    <span className="text-xl font-bold text-white/20">{t('common.sq_ft')}</span>
                  </div>
                  <p className="text-[10px] font-medium text-white/30 mt-6 leading-relaxed font-bold">
                    {t('common.parametric_note')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown - Section 2+ */}
          <div className="space-y-32">
            {visiblePhases.map((phase) => (
              <section key={phase.id} className="pdf-section relative pt-12">
                <div className="flex items-center gap-6 mb-16">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-arch-ink/20">
                    {typeof phase.title === 'string' ? phase.title : phase.title[currentLang]}
                  </h3>
                  <div className="flex-1 h-px bg-arch-ink/5" />
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
                {phase.questions.map((q) => {
                  const val = formState[q.id];
                  const isArea = q.type === 'Area Stepper';
                  const width = formState[q.id + '_width'] || Math.sqrt(q.minSqFt || 0);
                  const length = formState[q.id + '_length'] || Math.sqrt(q.minSqFt || 0);
                  const customSqFt = formState[q.id + '_sqft'] || (Math.round(width * length));
                  const label = typeof q.label === 'string' ? q.label : q.label[currentLang];
                  
                  return (
                    <div key={q.id} className="border-l-2 border-arch-ink/5 pl-8 hover:border-arch-blue-dark transition-colors">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-arch-ink/30 mb-4">{label}</h4>
                      <div className="text-xl font-sans text-arch-ink/80 leading-relaxed">
                        {isArea ? (
                          <div className="flex flex-col gap-2">
                            <span className="font-sans font-black">{val || 0} <span className="text-[10px] font-bold uppercase text-arch-ink/30">{t('common.units')}</span></span>
                            <span className="text-xs font-medium text-arch-ink/40">
                              {Math.round(width * 10) / 10}ft × {Math.round(length * 10) / 10}ft ({customSqFt.toLocaleString()} {t('common.sq_ft')})
                            </span>
                            <div className="w-full h-1 bg-arch-gray rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-arch-green-dark/20" style={{ width: `${Math.min(100, (customSqFt / 500) * 100)}%` }} />
                            </div>
                          </div>
                        ) : Array.isArray(val) ? (
                          <div className="flex flex-wrap gap-2">
                            {val.map(v => (
                              <span key={v} className="bg-arch-blue/30 text-arch-blue-dark text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest">{getOptionLabel(q.id, v)}</span>
                            ))}
                          </div>
                        ) : (
                          getOptionLabel(q.id, val) || <span className="text-arch-ink/10 font-bold">{t('common.not_specified')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Custom Areas in Summary */}
              {phase.id.startsWith('space-inventory') && formState.custom_areas && formState.custom_areas.length > 0 && (
                <div className="mt-20 pt-20 border-t border-arch-ink/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-arch-ink/20 mb-12">{t('common.additional_custom_areas')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
                    {formState.custom_areas.map(area => (
                      <div key={area.id} className="border-l-2 border-arch-green-dark pl-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-arch-ink/30 mb-4">{area.name}</h4>
                        <div className="text-xl font-sans text-arch-ink/80 leading-relaxed">
                          <div className="flex flex-col gap-2">
                            <span className="font-sans font-black">{area.qty} <span className="text-[10px] font-bold uppercase text-arch-ink/30">{t('common.units')}</span></span>
                            <span className="text-xs font-medium text-arch-ink/40">
                              {area.width}ft × {area.length}ft ({area.sqFt.toLocaleString()} {t('common.sq_ft')})
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="mt-40 pt-20 border-t border-arch-ink/10 text-center no-print">
          <button 
            onClick={() => onComplete?.(formState)}
            className="px-12 py-5 bg-brand-dark-blue text-white rounded-3xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-elegant"
          >
            {t('common.start_new_questionnaire')}
          </button>
        </div>
        
        {/* Footer for PDF */}
        <div className="hidden print:block mt-20 pt-10 border-t border-arch-ink/5 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-arch-ink/20">
            © 2026 ARCHCOS Architecture • {t('common.confidential_document')} • {t('common.generated_on')} {new Date().toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US')}
          </p>
        </div>
      </div>
    </div>
  );
}
