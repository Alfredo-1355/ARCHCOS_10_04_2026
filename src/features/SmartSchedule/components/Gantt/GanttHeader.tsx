import React from 'react';
import { ArrowLeft, Plus, Zap, RefreshCw, User, MapPin, Scale, Flag } from 'lucide-react';
import { Project } from '../../../../types/dashboard';
import { ProjectContextBar } from '../ProjectContextBar';

interface GanttHeaderProps {
  project: Project | null;
  allProjects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  startDate: Date;
  setStartDate: (d: Date) => void;
  addWeek: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  statusMsg: string;
  navigate?: (path: string) => void;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  project,
  allProjects,
  activeProjectId,
  setActiveProjectId,
  startDate,
  setStartDate,
  addWeek,
  onGenerate,
  isGenerating,
  statusMsg,
  navigate
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Upper Control Bar */}
      <header className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-[2.5rem] px-8 py-5 shadow-sm flex flex-col xl:flex-row gap-6 items-center justify-between transition-all hover:shadow-md">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate?.("#/dashboard")} 
            className="group w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-90"
          >
            <ArrowLeft size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tightest flex items-center gap-2">
              Smart Schedule<span className="text-emerald-400 animate-pulse">.</span>
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-0.5 whitespace-nowrap">Professional Engine v2.0</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl px-4">
          <ProjectContextBar 
            projects={allProjects} 
            activeProjectId={activeProjectId} 
            onSelect={setActiveProjectId} 
            isLoading={isGenerating} 
          />
        </div>

        <div className="flex items-center gap-4">
          {activeProjectId && (
            <>
              <div className="flex items-center gap-4 px-5 py-2 bg-white/40 border border-white/60 rounded-2xl h-14">
                 <div className="flex flex-col justify-center">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Inicio del Plan</span>
                   <input 
                     type="date" 
                     value={startDate.toISOString().slice(0, 10)} 
                     onChange={e => setStartDate(new Date(e.target.value + "T00:00:00"))} 
                     className="bg-transparent text-sm font-black focus:outline-none cursor-pointer" 
                   />
                 </div>
                 <div className="w-px h-8 bg-slate-200" />
                 <button 
                   onClick={addWeek} 
                   title="Agregar Semana"
                   className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors h-full px-2"
                 >
                   <Plus size={20} strokeWidth={2.5} />
                 </button>
              </div>
              
              <button 
                onClick={onGenerate} 
                disabled={isGenerating} 
                className="relative group h-14 px-8 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 overflow-hidden shadow-lg shadow-slate-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 relative z-10">
                  {isGenerating ? <RefreshCw size={18} className="animate-spin text-emerald-400" /> : <Zap size={18} className="text-emerald-400 fill-emerald-400" />}
                  {isGenerating ? statusMsg : "Generar Plan Base"}
                </div>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Simbología & Metadata Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start xl:items-stretch h-full">
          {/* Legend Section */}
          <div className="bg-white/40 backdrop-blur-md border border-white/80 rounded-[2rem] px-8 py-4 shadow-sm flex items-center gap-8 min-w-max">
            <LegendItem label="Crítico (ruta crítica)" color="bg-slate-900" />
            <LegendItem label="Refinamiento / Detalle" color="bg-slate-400" />
            <LegendItem label="Revisión cliente" color="bg-amber-500" />
            <LegendItem label="Civil / Renders" color="bg-emerald-500" />
            <LegendItem label="Milestone" color="bg-amber-500" isMilestone />
          </div>

          {/* Project Metadata */}
          {project && (
            <div className="flex-1 flex flex-wrap gap-4 h-full">
                <MetaItem label="ID Expediente" value={project.id || 'N/A'} icon={<Scale size={14}/>} />
                <MetaItem 
                    label="Responsable" 
                    value={project.creator || 'A. Reyes'} 
                    icon={<User size={14}/>} 
                    avatar={{ initials: project.creator?.split(' ').map(n=>n[0]).join('') || 'AR', color: 'bg-indigo-500' }}
                />
                <MetaItem label="Dirección de Obra" value={project.address || 'Ubicación no especificada'} icon={<MapPin size={14}/>} isTruncated />
                <div className="flex flex-col bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl px-6 py-3 shadow-sm flex-1 min-w-[140px]">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Flag size={14} />
                        Fase Legal
                    </span>
                    <div className="flex">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm border border-white/20 ${project.badgeStyle?.includes('sage') || project.stage === 'EN EJECUCIÓN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {project.stage || 'PROPUESTA'}
                        </span>
                    </div>
                </div>
            </div>
          )}
      </div>
    </div>
  );
};

const LegendItem = ({ label, color, isMilestone }: { label: string, color: string, isMilestone?: boolean }) => (
    <div className="flex items-center gap-3">
        {isMilestone ? (
            <div className={`w-3 h-3 rotate-45 shadow-sm border border-white/20 ${color}`} />
        ) : (
            <div className={`w-6 h-3 rounded shadow-sm border border-white/20 ${color}`} />
        )}
        <span className="text-[10px] font-black tracking-tight text-slate-500 uppercase">{label}</span>
    </div>
);

const MetaItem = ({ label, value, icon, isTruncated, avatar }: { label: string, value: string, icon: React.ReactNode, isTruncated?: boolean, avatar?: { initials: string, color: string } }) => (
    <div className="flex-1 min-w-[160px] flex flex-col bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl px-6 py-3 shadow-sm group hover:bg-white transition-colors">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            {icon}
            {label}
        </span>
        <div className="flex items-center gap-3">
            {avatar && (
                <div className={`w-6 h-6 rounded-lg ${avatar.color} text-white flex items-center justify-center text-[9px] font-black shadow-inner`}>
                    {avatar.initials}
                </div>
            )}
            <span className={`text-xs font-black text-slate-800 tracking-tight ${isTruncated ? 'truncate max-w-[120px]' : ''}`} title={isTruncated ? value : undefined}>
                {value}
            </span>
        </div>
    </div>
);
