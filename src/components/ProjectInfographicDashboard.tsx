/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Maximize2, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Layers, 
  ChevronRight, 
  Home,
  Info,
  ExternalLink,
  ChevronDown,
  Users,
  FileText,
  CheckCircle2,
  ShieldCheck,
  FileQuestion,
  X,
  Download,
  Folder,
  Edit
} from 'lucide-react';
import { 
  NESTED_SPACES, 
  ZONE_CONFIG, 
  MIN_DIMENSIONS 
} from '../constants/architectural';
import BudgetManagerView from './BudgetManagerView';

const USERS = [
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
];

interface ProjectInfographicDashboardProps {
  project: any;
  onClose: () => void;
  onUpdate?: (updatedProject: any) => Promise<boolean>;
  role?: string;
}

const ProjectInfographicDashboard: React.FC<ProjectInfographicDashboardProps> = ({ project, onClose, onUpdate, role }) => {
  const program = project.architectural_program || {};
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Inline Editing States
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingPropType, setIsEditingPropType] = useState(false);
  const [isEditingSiteArea, setIsEditingSiteArea] = useState(false);
  const [tempName, setTempName] = useState(project.name || project.address || '');
  const [tempLocation, setTempLocation] = useState(project.location || project.address || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setUploadedImage(fileUrl);
    }
  };

  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  // --- Data Calculations ---
  
  const stats = useMemo(() => {
    const dimensions = program.spaceDimensions || {};
    const quantities = program.spaceQuantities || {};
    
    let totalSqFt = 0;
    const zoneBreakdown: Record<string, number> = {
      SOCIAL: 0,
      PRIVADOS: 0,
      SERVICIOS: 0,
      EXTERIORES: 0
    };

    Object.entries(dimensions).forEach(([spaceId, dim]: [string, any]) => {
      const qty = quantities[spaceId] || 1;
      const area = dim.l * dim.w * qty;
      totalSqFt += area;

      // Find zone
      let foundZone = 'SOCIAL';
      for (const [zone, groups] of Object.entries(NESTED_SPACES)) {
        if (groups.some(g => g.parent === spaceId || g.children.includes(spaceId))) {
          foundZone = zone;
          break;
        }
      }
      zoneBreakdown[foundZone] += area;
    });

    const circulationFactor = 1.15; // 15% circulation
    const totalWithCirculation = Math.round(totalSqFt * circulationFactor);

    // Parametric Budget ($180 - $240 per SqFt)
    const minBudget = totalWithCirculation * 180;
    const maxBudget = totalWithCirculation * 240;

    return {
      netArea: Math.round(totalSqFt),
      totalArea: totalWithCirculation,
      minBudget,
      maxBudget,
      zoneBreakdown,
      zones: Object.entries(zoneBreakdown).map(([id, area]) => ({
        id,
        area,
        percentage: totalSqFt > 0 ? (area / totalSqFt) * 100 : 0,
        ...ZONE_CONFIG[id]
      }))
    };
  }, [program]);

  const activeZoneDetails = useMemo(() => {
    if (!activeZoneId) return null;
    const dimensions = program?.spaceDimensions || {};
    const quantities = program?.spaceQuantities || {};
    const results: any[] = [];
    let maxArea = 0;
    let zoneTotal = 0;
    
    Object.entries(dimensions).forEach(([spaceId, dim]: [string, any]) => {
      const qty = quantities[spaceId] || 1;
      const area = dim.l * dim.w * qty;
      let foundZone = 'SOCIAL';
      for (const [zone, groups] of Object.entries(NESTED_SPACES)) {
        if (groups.some(g => g.parent === spaceId || g.children.includes(spaceId))) {
          foundZone = zone;
          break;
        }
      }
      if (foundZone === activeZoneId && area > 0) {
         const label = spaceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
         results.push({ id: spaceId, label, area });
         if (area > maxArea) maxArea = area;
         zoneTotal += area;
      }
    });
    
    results.sort((a, b) => b.area - a.area);
    const zoneBase = stats.zones.find(z => z.id === activeZoneId);
    
    return {
       ...zoneBase,
       spaces: results,
       maxArea,
       zoneTotal
    };
  }, [activeZoneId, program, stats.zones]);

  // --- Helpers ---
  
  const formatDate = (date: any) => {
    if (!date) return 'TBD';
    const d = new Date(date.seconds ? date.seconds * 1000 : date);
    return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleUpdateField = async (field: string, value: any) => {
    if (!onUpdate) return;
    setIsSaving(true);
    const updated = { ...project, [field]: value };
    // Synchronize both conceptual 'name' and 'address' if it's the main identifier
    if (field === 'name') updated.address = value;
    if (field === 'address') updated.location = value;
    
    const success = await onUpdate(updated);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
    setIsSaving(false);
  };

  const EditableField = ({ 
    value, 
    onSave, 
    isEditing, 
    setIsEditing, 
    className, 
    inputClassName,
    type = "text"
  }: any) => {
    const [localVal, setLocalVal] = useState(value);
    
    if (isEditing) {
      return (
        <div className="relative flex items-center gap-2">
          <input 
            autoFocus
            type={type}
            value={localVal}
            aria-label={`Editar ${value}`}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={() => {
              onSave(localVal);
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave(localVal);
                setIsEditing(false);
              }
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className={`bg-white border-b-2 border-brand-blue outline-none py-1 ${inputClassName}`}
          />
          <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
        </div>
      );
    }

    return (
      <div 
        className={`cursor-pointer hover:bg-black/5 rounded px-2 -ml-2 transition-colors border-b border-transparent hover:border-black/10 group flex items-center gap-2 ${className}`}
        onClick={() => setIsEditing(true)}
      >
        {value}
        <Edit className="w-4 h-4 opacity-0 group-hover:opacity-20 transition-opacity" />
      </div>
    );
  };

  // --- Donut Chart Custom SVG ---
  const DonutChart = () => {
    let cumulativePercent = 0;
    const radius = 70;
    const strokeWidth = 25;
    const center = 100;
    const circumference = 2 * Math.PI * radius;

    return (
      <svg viewBox="0 0 200 200" className="w-full h-full max-w-[280px]">
        {stats.zones.map((zone) => {
          const dashArray = `${(zone.percentage * circumference) / 100} ${circumference}`;
          const dashOffset = -((cumulativePercent * circumference) / 100);
          cumulativePercent += zone.percentage;

          return (
            <motion.circle
              key={zone.id}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={zone.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          );
        })}
        <circle cx={center} cy={center} r={radius - strokeWidth} fill="white" />
        <text x={center} y={center - 5} textAnchor="middle" className="text-[10px] font-black uppercase tracking-widest fill-arch-ink/30">Total</text>
        <text x={center} y={center + 15} textAnchor="middle" className="text-xl font-black fill-arch-ink">{stats.totalArea} <tspan fontSize="10">SqFt</tspan></text>
      </svg>
    );
  };
  
  // --- Dynamic Timeline Phasing ---
  const projectPhases = useMemo(() => {
    const progressMap = project.progressMap || {};
    const deliveryDate = project.deliveryDate ? new Date(project.deliveryDate) : new Date();
    
    // Helper to calculate estimated dates
    const addMonths = (date: Date, months: number) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);
      return d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
    };

    const getStatus = (areaKey: string, phaseIndex: number) => {
      const prog = progressMap[areaKey] || 0;
      if (prog === 100) return 'past';
      
      const stages = ['PROPUESTA', 'DISEÑO', 'REVISIÓN', 'EN OBRA', 'COMPLETADO'];
      const currentStageIdx = stages.indexOf(project.stage || 'DISEÑO');
      
      if (phaseIndex === currentStageIdx) return 'active';
      if (phaseIndex < currentStageIdx) return 'past';
      return 'future';
    };

    return [
      { 
        label: "Schematic Design", 
        status: getStatus('area_concepto', 0), 
        code: "SD",
        percentage: `${progressMap.area_concepto || 0}%`,
        tasks: [
          { text: "Levantamiento Físico", done: (progressMap.area_investigacion || 0) >= 50 },
          { text: "Investigación Normativa", done: (progressMap.area_investigacion || 0) === 100 },
          { text: "Programa de Necesidades", done: (progressMap.area_concepto || 0) >= 40 }
        ]
      },
      { 
        label: "Design Development", 
        status: getStatus('area_arquitectonico', 1), 
        code: "DD",
        percentage: `${progressMap.area_arquitectonico || 0}%`,
        tasks: [
          { text: "Plantas Arquitectónicas", done: (progressMap.area_arquitectonico || 0) >= 40 },
          { text: "Cortes y Fachadas", done: (progressMap.area_arquitectonico || 0) >= 80 },
          { text: "Modelo 3D (BIM)", done: (progressMap.area_grafico || 0) >= 50 }
        ]
      },
      { 
        label: "Const. Documents", 
        status: getStatus('area_estructural', 2), 
        code: "CD",
        percentage: `${progressMap.area_estructural || 0}%`,
        date: `Est. ${addMonths(deliveryDate, 2)}`,
        tasks: [
          { text: "Planos Estructurales", done: (progressMap.area_estructural || 0) === 100 },
          { text: "Ingenierías (MEP)", done: (progressMap.area_electrico || 0) >= 50 },
          { text: "Catálogo de Conceptos", done: (progressMap.area_arquitectonico || 0) === 100 }
        ]
      },
      { 
        label: "Permitting", 
        status: project.stage === 'REVISIÓN' ? 'active' : (['EN OBRA', 'COMPLETADO'].includes(project.stage) ? 'past' : 'future'), 
        code: "PR",
        date: `Est. ${addMonths(deliveryDate, 4)}`,
        percentage: project.stage === 'REVISIÓN' ? '50%' : (['EN OBRA', 'COMPLETADO'].includes(project.stage) ? '100%' : '0%')
      },
      { 
        label: "Construction", 
        status: project.stage === 'EN OBRA' ? 'active' : (project.stage === 'COMPLETADO' ? 'past' : 'future'), 
        code: "CA",
        date: `Est. ${addMonths(deliveryDate, 8)}`,
        percentage: project.stage === 'EN OBRA' ? '20%' : (project.stage === 'COMPLETADO' ? '100%' : '0%')
      }
    ];
  }, [project]);

  // --- Dynamic Team Mapping ---
  const projectTeam = useMemo(() => {
    const assignments = project.assignments || {};
    const creatorName = project.creator || 'A. Reyes';
    
    // Find creator user object
    const creatorUser = USERS.find(u => u.name.includes(creatorName) || creatorName.includes(u.initials)) || USERS[8];

    // Get unique technical collaborators from assignments
    const collabIds = new Set<string>();
    Object.values(assignments).forEach((ids: any) => {
      if (Array.isArray(ids)) ids.forEach(id => collabIds.add(id));
    });

    const specialists = Array.from(collabIds).map(id => USERS.find(u => u.id === id)).filter(Boolean);

    return {
      lead: creatorUser,
      client: { name: project.clientName || 'Cliente Confidencial', initials: 'C', color: '#10b981' },
      specialists: specialists.slice(0, 3) // Show top 3
    };
  }, [project]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-arch-ink font-sans p-6 md:p-12">
      <AnimatePresence>
        {isBudgetOpen && (
          <BudgetManagerView 
            project={project} 
            targetBudget={(stats.minBudget + stats.maxBudget) / 2}
            onClose={() => setIsBudgetOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto flex justify-between items-start mb-12">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative group">
              <select 
                value={project.stage || 'DISEÑO'}
                onChange={(e) => handleUpdateField('stage', e.target.value)}
                className="appearance-none px-4 py-1.5 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-blue/20 cursor-pointer hover:bg-brand-blue/20 transition-all outline-none"
                title="Cambiar fase del proyecto"
                aria-label="Seleccionar fase del proyecto"
              >
                {['PROPUESTA', 'DISEÑO', 'REVISIÓN', 'EN OBRA', 'COMPLETADO'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <ChevronDown size={10} className="text-brand-blue" />
              </div>
            </div>

            <span className="text-arch-ink/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              ID: {project.id?.substring(0, 10)}
              {saveSuccess && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-brand-green flex items-center gap-1 normal-case tracking-normal">
                  <ShieldCheck size={12} /> <span className="text-[8px] font-bold">Sincronizado</span>
                </motion.span>
              )}
            </span>
          </div>
          
          <EditableField 
            value={project.name || project.address || 'Proyecto Sin Nombre'} 
            onSave={(val: string) => handleUpdateField('name', val)}
            isEditing={isEditingName}
            setIsEditing={setIsEditingName}
            className="text-4xl font-black tracking-tight text-arch-ink uppercase"
            inputClassName="text-4xl font-black uppercase w-full max-w-2xl"
          />

          <div className="flex items-center gap-2 mt-2">
            <MapPin size={14} className="text-arch-ink/30" />
            <EditableField 
              value={project.location || project.address || 'Ubicación no especificada'} 
              onSave={(val: string) => handleUpdateField('location', val)}
              isEditing={isEditingLocation}
              setIsEditing={setIsEditingLocation}
              className="text-arch-ink/50 font-medium text-sm"
              inputClassName="text-sm font-medium w-96"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            title="Regresar al Directorio"
            aria-label="Cerrar dashboard y volver al directorio"
            className="w-12 h-12 rounded-2xl bg-white shadow-soft border border-arch-ink/5 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-arch-ink/40 hover:text-arch-ink"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* === ROW 1: HERO & METRICS === */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
          
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2rem] p-8 shadow-elegant border border-arch-ink/5 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-blue/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <Maximize2 className="text-brand-blue mb-6 opacity-40" size={32} />
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-2">Total Estimado</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl xl:text-5xl font-black tracking-tighter">{stats.totalArea}</span>
                <span className="text-base font-bold text-arch-ink/40 uppercase">SqFt</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2rem] p-8 shadow-elegant border border-arch-ink/5 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <Calendar className="text-purple-400 mb-6 opacity-40" size={32} />
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-2">Fecha Objetivo</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl xl:text-3xl font-black tracking-tighter uppercase">{formatDate(project.targetDate || Date.now() + (365 * 24 * 60 * 60 * 1000))}</span>
              </div>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2rem] p-8 shadow-elegant border border-arch-ink/5 relative overflow-hidden group border-b-4 border-b-brand-green">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-green/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <DollarSign className="text-brand-green mb-6 opacity-40" size={32} />
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-2">Presupuesto Paramétrico</span>
              <div className="flex flex-col">
                <span className="text-xl xl:text-2xl font-black tracking-tighter text-arch-ink/80">{formatCurrency(stats.minBudget)} —</span>
                <span className="text-xl xl:text-2xl font-black tracking-tighter">{formatCurrency(stats.maxBudget)}</span>
              </div>
            </motion.div>
          </div>

          {/* Visual Progress Bar (Flow) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[2rem] p-8 shadow-elegant border border-arch-ink/5 relative lg:overflow-visible">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-6 font-sans">Secuencia del Proyecto</h4>
             
             <div className="relative flex justify-between items-start w-full min-h-[60px]">
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 w-full h-1.5 bg-arch-gray -translate-y-1/2 z-0 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-brand-blue transition-all duration-1000" 
                     style={{ width: `${(['PROPUESTA', 'DISEÑO', 'REVISIÓN', 'EN OBRA', 'COMPLETADO'].indexOf(project.stage || 'DISEÑO') / 4) * 100}%` }} 
                   />
                </div>
                
                {projectPhases.map((phase, i) => (
                   <div key={i} className="relative z-10 flex flex-col items-center gap-3 group cursor-default">
                     <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center font-black text-xs transition-all ${
                       phase.status === 'past' ? 'bg-brand-green text-white shadow-soft ring-4 ring-brand-green/20' :
                       phase.status === 'active' 
                         ? 'bg-brand-blue text-white shadow-soft ring-4 ring-brand-blue/20 animate-pulse' 
                         : 'bg-white text-arch-ink/30 border border-arch-gray/80 ring-2 ring-white'
                     }`}>
                       {phase.status === 'past' ? <CheckCircle2 size={18} strokeWidth={3} /> : phase.code}
                     </div>
                     <div className="flex flex-col items-center text-center">
                       <span className={`text-[9px] font-bold uppercase tracking-widest hidden md:block transition-colors ${
                         phase.status === 'active' ? 'text-brand-blue' : phase.status === 'past' ? 'text-brand-green' : 'text-arch-ink/30'
                       }`}>
                         {phase.label}
                       </span>
                       {phase.status === 'future' && (
                          <span className="text-[8px] font-black uppercase text-arch-ink/20 mt-1 hidden md:block tracking-widest">{phase.date}</span>
                       )}
                     </div>

                     {/* Micro-Card Tooltip */}
                     {(phase.status === 'active' || phase.status === 'past') && (
                       <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white border border-arch-border shadow-float rounded-2xl p-4 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0">
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[10px] font-black tracking-widest uppercase text-arch-ink/40">Progreso</span>
                             <span className={`text-xs font-black ${phase.status === 'active' ? 'text-brand-blue' : 'text-brand-green'}`}>{phase.percentage}</span>
                          </div>
                          <div className="space-y-2.5">
                             {phase.tasks?.map((task, j) => (
                               <div key={j} className="flex items-start gap-2">
                                  <div className={`w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 border ${
                                    task.done ? 'bg-brand-green border-brand-green text-white shadow-soft' : 'border-arch-ink/20 bg-arch-gray'
                                  }`}>
                                     {task.done && <CheckCircle2 size={8} strokeWidth={4} />}
                                  </div>
                                  <span className={`text-[9px] font-black tracking-tight uppercase leading-none ${task.done ? 'text-arch-ink/30 line-through' : 'text-arch-ink'}`}>
                                    {task.text}
                                  </span>
                               </div>
                             ))}
                          </div>
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-arch-border rotate-45" />
                       </div>
                     )}
                   </div>
                ))}
             </div>
          </motion.div>

        </div>

        {/* --- HERO RIGHT: Featured Render / Upload Zone --- */}
        <div className="lg:col-span-4 flex flex-col relative">
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
              title="Selector de imagen para Render principal"
              aria-label="Selector de imagen para Render principal"
           />
           <button 
             className="bg-arch-ink w-full flex-grow rounded-[2rem] shadow-elegant overflow-hidden relative group min-h-[300px] cursor-pointer block text-left"
             onClick={() => fileInputRef.current?.click()}
             title="Haz clic para subir un nuevo render u objeto"
             aria-label="Haz clic para subir un nuevo render u objeto"
           >
              
              <img 
                src={uploadedImage || "/assets/hero_render.png"} 
                alt="Featured Render" 
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ${uploadedImage ? 'animate-anti-gravity scale-90' : 'group-hover:scale-105'}`} 
                style={uploadedImage ? { objectFit: 'contain' } : {}}
              />
              
              {/* Vignette/Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-8 flex flex-col justify-end pointer-events-none z-10">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md self-start text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full mb-3 shadow-soft border border-white/20">
                    {uploadedImage ? 'OBJETO FLOTANTE' : 'Exterior Render'}
                  </span>
                  <h3 className="text-white text-2xl font-black">{project.name || 'Concepto Base'}</h3>
              </div>

              {!uploadedImage && (
                <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/20 transition-colors duration-500 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-4 bg-white/20 backdrop-blur-md rounded-full text-white">
                     <span className="text-[10px] uppercase font-bold tracking-widest">+ Subir Imagen</span>
                  </div>
                </div>
              )}
           </button>
        </div>


        {/* === ROW 2: SPATIAL DATA & QUICK LINKS (8 cols) === */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-elegant border border-arch-ink/5">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                <DonutChart />
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                <div className="mb-8">
                  <h3 className="text-2xl font-black tracking-tight uppercase mb-2">Distribución Espacial</h3>
                  <p className="text-arch-ink/50 text-sm font-medium">Análisis de áreas sociales vs. operativas.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {stats.zones.map((zone) => (
                    <div 
                      key={zone.id} 
                      onClick={() => setActiveZoneId(zone.id)}
                      className="p-4 rounded-2xl border border-arch-ink/5 hover:bg-arch-gray/20 hover:border-brand-blue/30 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: zone.color }} />
                          <span className="text-[11px] font-black uppercase tracking-widest">{zone.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-arch-ink/80">{Math.round(zone.percentage)}%</span>
                          <ChevronRight className="text-brand-blue opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={16} />
                        </div>
                      </div>
                      <div className="mt-3 w-full h-1.5 bg-arch-ink/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${zone.percentage}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full" style={{ backgroundColor: zone.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="relative group">
               <button 
                 onClick={() => project.rendersUrl ? window.open(project.rendersUrl, '_blank') : alert('URL de Renders no configurada')}
                 className="w-full flex items-center justify-between p-6 bg-white rounded-[1.5rem] border border-arch-ink/5 shadow-soft hover:shadow-elegant hover:scale-[1.02] active:scale-95 transition-all group/btn"
               >
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue"><Layers size={20} /></div>
                   <div className="text-left">
                     <span className="block text-sm font-black uppercase text-arch-ink">RENDERS</span>
                     <span className="block text-[9px] uppercase tracking-widest text-arch-ink/40">Visualización 3D</span>
                   </div>
                 </div>
                 <ExternalLink size={16} className="text-arch-ink/20 group-hover/btn:text-brand-blue" />
               </button>
               {role === 'ADMIN' && (
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     const url = prompt('Ingrese la URL para RENDERS:', project.rendersUrl || '');
                     if (url !== null) handleUpdateField('rendersUrl', url);
                   }}
                   className="absolute top-2 right-2 p-1.5 bg-brand-blue text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-float z-20"
                   title="Editar URL de Renders"
                 >
                   <Edit size={10} />
                 </button>
               )}
             </div>

             <div className="relative group">
               <button 
                 onClick={() => project.pdfUrl ? window.open(project.pdfUrl, '_blank') : alert('URL de Planos no configurada')}
                 className="w-full flex items-center justify-between p-6 bg-white rounded-[1.5rem] border border-arch-ink/5 shadow-soft hover:shadow-elegant hover:scale-[1.02] active:scale-95 transition-all group/btn"
               >
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-brand-green/10 rounded-xl text-brand-green"><FileText size={20} /></div>
                   <div className="text-left">
                     <span className="block text-sm font-black uppercase text-arch-ink">Planos PDF</span>
                     <span className="block text-[9px] uppercase tracking-widest text-arch-ink/40">Set de Diseño</span>
                   </div>
                 </div>
                 <Download size={16} className="text-arch-ink/20 group-hover/btn:text-brand-green" />
               </button>
               {role === 'ADMIN' && (
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     const url = prompt('Ingrese la URL para Planos PDF:', project.pdfUrl || '');
                     if (url !== null) handleUpdateField('pdfUrl', url);
                   }}
                   className="absolute top-2 right-2 p-1.5 bg-brand-green text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-float z-20"
                   title="Editar URL de Planos"
                 >
                   <Edit size={10} />
                 </button>
               )}
             </div>

             <div className="relative group">
               <button 
                 onClick={() => project.directoryUrl ? window.open(project.directoryUrl, '_blank') : alert('URL de Directorio no configurada')}
                 className="w-full flex items-center justify-between p-6 bg-white rounded-[1.5rem] border border-arch-ink/5 shadow-soft hover:shadow-elegant hover:scale-[1.02] active:scale-95 transition-all group/btn"
               >
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-arch-sand/20 rounded-xl text-arch-ink/70"><Folder size={20} /></div>
                   <div className="text-left">
                     <span className="block text-sm font-black uppercase text-arch-ink">Directorio</span>
                     <span className="block text-[9px] uppercase tracking-widest text-arch-ink/40">Archivos Cloud</span>
                   </div>
                 </div>
                 <ExternalLink size={16} className="text-arch-ink/20 group-hover/btn:text-arch-ink" />
               </button>
               {role === 'ADMIN' && (
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     const url = prompt('Ingrese la URL para el DIRECTORIO:', project.directoryUrl || '');
                     if (url !== null) handleUpdateField('directoryUrl', url);
                   }}
                   className="absolute top-2 right-2 p-1.5 bg-arch-ink text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-float z-20"
                   title="Editar URL de Directorio"
                 >
                   <Edit size={10} />
                 </button>
               )}
             </div>
          </div>
        </div>

        {/* === ROW 2 RIGHT: TEAM & CONTEXT (4 cols) === */}
        <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
           
           {/* Team Box */}
           <div className="bg-white rounded-[2rem] p-8 shadow-elegant border border-arch-ink/5">
              <h3 className="text-lg font-black tracking-tight uppercase mb-6 flex items-center gap-3">
                 <Users size={18} className="text-arch-ink/40" /> Equipo Principal
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-3 hover:bg-arch-gray/20 rounded-xl transition-colors">
                    <div style={{ backgroundColor: projectTeam.lead.color }} className="w-10 h-10 text-white rounded-full flex items-center justify-center font-black text-sm shadow-soft">
                      {projectTeam.lead.initials}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold leading-none mb-1.5">{projectTeam.lead.name}</p>
                       <p className="text-[9px] font-black tracking-widest uppercase text-arch-ink/40">Lead Architect</p>
                    </div>
                 </div>
                 
                 {projectTeam.specialists.map((u, i) => (
                   <div key={i} className="flex items-center gap-4 p-3 hover:bg-arch-gray/20 rounded-xl transition-colors">
                      <div style={{ backgroundColor: u.color }} className="w-10 h-10 text-white rounded-full flex items-center justify-center font-black text-sm shadow-soft">
                        {u.initials}
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold leading-none mb-1.5">{u.name}</p>
                         <p className="text-[9px] font-black tracking-widest uppercase text-arch-ink/40">Consultant / Technical</p>
                      </div>
                   </div>
                 ))}

                 <div className="flex items-center gap-4 p-3 hover:bg-arch-gray/20 rounded-xl transition-colors">
                    <div style={{ backgroundColor: projectTeam.client.color }} className="w-10 h-10 text-white rounded-full flex items-center justify-center font-black text-sm shadow-soft">
                      {projectTeam.client.initials}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold leading-none mb-1.5">{projectTeam.client.name}</p>
                       <p className="text-[9px] font-black tracking-widest uppercase text-arch-ink/40">Propietario</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Contexto del Sitio */}
           <div className="bg-white flex-grow rounded-[2rem] p-8 shadow-elegant border border-arch-ink/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-arch-gray/20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-10 h-10 rounded-[1rem] bg-brand-blue/10 flex items-center justify-center mb-6">
                <MapPin className="text-brand-blue" size={18} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase mb-6 text-arch-ink">Contexto del Sitio</h3>
              <div className="space-y-3 flex-grow">
                <div className="p-4 rounded-xl bg-arch-gray/30 border border-arch-ink/5 relative overflow-hidden">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-arch-ink/40 mb-1">Tipo de Terreno</span>
                  <EditableField 
                    value={project.procedure || 'Ground-up Construction'} 
                    onSave={(val: string) => handleUpdateField('procedure', val)}
                    isEditing={isEditingPropType}
                    setIsEditing={setIsEditingPropType}
                    className="text-sm font-bold tracking-tight text-arch-ink"
                    inputClassName="text-sm font-bold w-full"
                  />
                </div>
                <div className="p-4 rounded-xl bg-arch-gray/30 border border-arch-ink/5 relative overflow-hidden">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-arch-ink/40 mb-1">Superficie Terreno</span>
                  <div className="flex items-center gap-1">
                    <EditableField 
                      value={project.siteArea || '12,500'} 
                      onSave={(val: string) => handleUpdateField('siteArea', val)}
                      isEditing={isEditingSiteArea}
                      setIsEditing={setIsEditingSiteArea}
                      className="text-sm font-bold tracking-tight text-arch-ink"
                      inputClassName="text-sm font-bold w-24"
                    />
                    <span className="text-sm font-bold text-arch-ink">SqFt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === ROW 3: MOODBOARD & CODES === */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 shadow-elegant border border-arch-ink/5">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h3 className="text-2xl font-black tracking-tight uppercase mb-2">Moodboard de Materialidad</h3>
                <p className="text-arch-ink/50 text-sm font-medium">Concepto estético y paleta curada.</p>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-arch-gray/30 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-arch-ink">{program.finishes?.curatedPalette || 'Modern Farmhouse'}</span>
             </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 xl:gap-6">
            {[
              { label: 'Cuerpo', value: program.finishes?.mainMaterial || 'Stucco', color: program.finishes?.mainMaterial === 'Concreto' ? '#7F8C8D' : '#E5E4E2' },
              { label: 'Zócalo', value: program.finishes?.baseMaterial || 'Stone', color: '#7F8C8D' },
              { label: 'Acentos', value: program.finishes?.accentMaterial || 'Wood', color: '#B97A57' },
              { label: 'Cubierta', value: program.finishes?.roof || 'Shingle', color: '#2C3E50' },
              { label: 'Ventanería', value: program.finishes?.windows || 'Aluminio Negro', color: '#1B1B1B' },
              { label: 'Paisaje', value: 'Natural', color: '#577c46' },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="space-y-3">
                <div className="aspect-square rounded-[1.5rem] shadow-elegant border-4 border-white overflow-hidden relative group">
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" style={{ backgroundColor: item.color }} title={`Material: ${item.value}`} />
                  {item.value === 'Stone' && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />
                  )}
                </div>
                <div className="text-center px-1">
                  <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-1">{item.label}</span>
                  <span className="text-[10px] font-bold uppercase truncate block">{item.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Normativa & Códigos */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-elegant border border-arch-ink/5">
           <h3 className="text-lg font-black tracking-tight uppercase mb-8 flex items-center gap-3">
              <ShieldCheck size={18} className="text-arch-ink/40" /> Códigos & Permisos
           </h3>
           
           <div className="space-y-4">
              {/* Zonificación */}
              <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${(project.progressMap?.area_investigacion || 0) >= 50 ? 'bg-[#F2F8F5] border-brand-green/10' : 'bg-white border-arch-border shadow-soft'}`}>
                 <div className="flex items-center gap-4">
                    <div className={`${(project.progressMap?.area_investigacion || 0) >= 50 ? 'bg-brand-green' : 'bg-arch-ink/10'} text-white p-1.5 rounded-full`}>
                      {(project.progressMap?.area_investigacion || 0) >= 50 ? <CheckCircle2 size={12} /> : <Info size={12} className="text-arch-ink/40" />}
                    </div>
                    <div>
                       <span className="block text-sm font-bold">Zonificación</span>
                       <span className="block text-[9px] font-black uppercase tracking-widest text-arch-ink/40">Restricciones Revisadas</span>
                    </div>
                 </div>
                 <span className={`px-2 py-1 text-[9px] font-black tracking-widest rounded-md uppercase ${(project.progressMap?.area_investigacion || 0) >= 50 ? 'bg-brand-green/20 text-brand-green' : 'bg-arch-ink/5 text-arch-ink/40'}`}>
                   {(project.progressMap?.area_investigacion || 0) >= 50 ? 'OK' : 'EN TRÁMITE'}
                 </span>
              </div>

              {/* Código */}
              <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${(project.progressMap?.area_investigacion || 0) >= 80 ? 'bg-[#F2F8F5] border-brand-green/10' : 'bg-white border-arch-border shadow-soft'}`}>
                 <div className="flex items-center gap-4">
                    <div className={`${(project.progressMap?.area_investigacion || 0) >= 80 ? 'bg-brand-green' : 'bg-arch-ink/10'} text-white p-1.5 rounded-full`}>
                      {(project.progressMap?.area_investigacion || 0) >= 80 ? <CheckCircle2 size={12} /> : <ShieldCheck size={12} className="text-arch-ink/40" />}
                    </div>
                    <div>
                       <span className="block text-sm font-bold">Código (IBC/IRC)</span>
                       <span className="block text-[9px] font-black uppercase tracking-widest text-arch-ink/40">Cumplimiento Vida & Seguridad</span>
                    </div>
                 </div>
                 <span className={`px-2 py-1 text-[9px] font-black tracking-widest rounded-md uppercase ${(project.progressMap?.area_investigacion || 0) >= 80 ? 'bg-brand-green/20 text-brand-green' : 'bg-arch-ink/5 text-arch-ink/40'}`}>
                   {(project.progressMap?.area_investigacion || 0) >= 80 ? 'OK' : 'PENDIENTE'}
                 </span>
              </div>

              {/* City Permit */}
              <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${(project.progressMap?.area_investigacion || 0) === 100 ? 'bg-[#F2F8F5] border-brand-green/10' : 'bg-white border-arch-border shadow-soft'}`}>
                 <div className="flex items-center gap-4">
                    <div className={`${(project.progressMap?.area_investigacion || 0) === 100 ? 'bg-brand-green' : 'bg-brand-blue/10'} text-white p-1.5 rounded-full`}>
                      {(project.progressMap?.area_investigacion || 0) === 100 ? <CheckCircle2 size={12} /> : <FileQuestion size={12} className="text-brand-blue" />}
                    </div>
                    <div>
                       <span className="block text-sm font-bold">City Permit</span>
                       <span className="block text-[9px] font-black uppercase tracking-widest text-arch-ink/40">Aprobación de Autoridades</span>
                    </div>
                 </div>
                 <span className={`px-2 py-1 text-[9px] font-black tracking-widest rounded-md uppercase ${(project.progressMap?.area_investigacion || 0) === 100 ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-blue/10 text-brand-blue'}`}>
                   {(project.progressMap?.area_investigacion || 0) === 100 ? 'APROBADO' : 'EN REVISIÓN'}
                 </span>
              </div>
           </div>
        </div>

      </div>

      {/* --- SPATIAL SLIDE-OVER PANEL --- */}
      <AnimatePresence>
         {activeZoneDetails && (
            <div className="fixed inset-0 z-50 flex justify-end">
               {/* Backdrop */}
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 onClick={() => setActiveZoneId(null)}
                 className="absolute inset-0 bg-arch-ink/20 backdrop-blur-sm"
               />
               
               {/* Panel */}
               <motion.div 
                 initial={{ x: '100%' }} 
                 animate={{ x: 0 }} 
                 exit={{ x: '100%' }} 
                 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                 className="relative w-full max-w-md h-full bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto border-l border-arch-border border-opacity-50 overflow-y-auto no-scrollbar"
               >
                  {/* Header */}
                  <div className="p-8 border-b border-arch-border sticky top-0 bg-white/90 backdrop-blur-md z-10">
                     <button 
                       onClick={() => setActiveZoneId(null)}
                       className="absolute top-8 right-8 p-2 rounded-full hover:bg-arch-gray text-arch-ink/40 hover:text-arch-ink transition-colors"
                       title="Cerrar desglose espacial"
                       aria-label="Cerrar desglose espacial"
                     >
                       <X size={20} />
                     </button>
                     <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-white mb-6 shadow-soft" style={{ backgroundColor: activeZoneDetails.color }}>
                        <Maximize2 size={20} strokeWidth={2.5} />
                     </div>
                     <span className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: activeZoneDetails.color }}>Desglose de Zona</span>
                     <h2 className="text-3xl font-black">{activeZoneDetails.label}</h2>
                     <p className="text-arch-ink/50 mt-2 font-medium">
                       Esta zona representa el <strong className="text-arch-ink">{Math.round(activeZoneDetails.percentage)}%</strong> del programa arquitectónico, equivalente a <strong className="text-arch-ink">{Math.round(activeZoneDetails.zoneTotal)} SqFt</strong> de área interior computable.
                     </p>
                  </div>

                  {/* Body: Bar Graphs (Data Visualization) */}
                  <div className="p-8 space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-arch-ink/30 mb-2">Composición del Espacio</h4>
                     
                     {activeZoneDetails.spaces.length === 0 ? (
                       <div className="p-6 text-center border-2 border-dashed border-arch-border rounded-2xl">
                          <p className="text-arch-ink/40 text-sm font-bold uppercase">No hay cuartos definidos</p>
                       </div>
                     ) : (
                       activeZoneDetails.spaces.map((space: any, idx: number) => {
                          const barWidth = Math.max(10, (space.area / activeZoneDetails.maxArea) * 100);
                          const portionPercent = (space.area / activeZoneDetails.zoneTotal) * 100;
                          
                          return (
                            <div key={idx} className="group">
                               <div className="flex justify-between items-end mb-2">
                                  <span className="text-sm font-bold uppercase text-arch-ink/80 group-hover:text-arch-ink transition-colors">{space.label}</span>
                                  <div className="text-right">
                                    <span className="block text-xs font-black" style={{ color: activeZoneDetails.color }}>{Math.round(space.area)} SqFt</span>
                                    <span className="text-[9px] font-bold text-arch-ink/30 uppercase tracking-widest">{portionPercent.toFixed(1)}% de zona</span>
                                  </div>
                               </div>
                               <div className="h-4 p-0.5 rounded-full border border-arch-border bg-arch-gray w-full flex items-center">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${barWidth}%` }} 
                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                    className="h-full rounded-full shadow-sm" 
                                    style={{ backgroundColor: activeZoneDetails.color, opacity: 0.8 + (idx * 0.05) }} 
                                  />
                               </div>
                            </div>
                          );
                       })
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>



    </div>
  );
};

export default ProjectInfographicDashboard;
