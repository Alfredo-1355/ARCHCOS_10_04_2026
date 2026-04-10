import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../../../types/dashboard';
import { ChevronDown, Briefcase, Zap, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectContextBarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelect: (id: string | null) => void;
  isLoading?: boolean;
}

export const ProjectContextBar: React.FC<ProjectContextBarProps> = ({
  projects = [],
  activeProjectId,
  onSelect,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Re-calculate position whenever it opens or window resizes
  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  // Filter logic: Check multiple properties since the schema uses 'address' as name
  const filteredProjects = projects.filter(p => {
    const term = searchQuery.toLowerCase();
    const name = (p.projectName || p.address || '').toLowerCase();
    const client = (p.clientName || '').toLowerCase();
    return name.includes(term) || client.includes(term) || p.id.toLowerCase().includes(term);
  });

  return (
    <div className="relative w-full group" ref={containerRef}>
      {/* Main Selector Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-14 px-6 flex items-center justify-between backdrop-blur-md bg-white border-2 transition-all cursor-pointer rounded-2xl ${isOpen ? 'border-emerald-400 ring-8 ring-emerald-500/5 shadow-xl' : 'border-slate-100 hover:border-emerald-200 shadow-sm'}`}
      >
        <div className="flex items-center gap-4 overflow-hidden">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeProject ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
            {isLoading ? <Zap size={18} className="animate-spin" /> : (activeProject ? <CheckCircle2 size={18} /> : <Briefcase size={18} />)}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              {activeProject ? `[${activeProject.id}] Proyecto Activo` : 'Proyecto en Pantalla'}
            </span>
            <span className="text-sm font-black text-slate-900 tracking-tight truncate">
              {activeProject ? (activeProject.projectName || activeProject.address) : 'Seleccionar Proyecto...'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {!activeProject && !isLoading && (
                <span className="hidden sm:inline text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md animate-pulse">Vincular para iniciar</span>
            )}
            <ChevronDown size={20} className={`text-slate-300 transition-transform duration-500 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop for closing */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[9998] bg-slate-900/5 backdrop-blur-[4px]"
              />
              
              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                style={{
                    position: 'absolute',
                    top: coords.top + 8,
                    left: coords.left,
                    width: coords.width,
                    zIndex: 9999
                }}
                className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden p-4 origin-top"
              >
                {/* Search Bar */}
                <div className="flex items-center gap-3 px-5 py-4 mb-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                   <Search size={16} className="text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Buscar por cliente, nombre o ubicación..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none w-full placeholder:text-slate-400 placeholder:font-medium" 
                    autoFocus
                   />
                </div>

                {/* Project List */}
                <div className="max-h-[360px] overflow-y-auto space-y-2 custom-scrollbar px-1 pb-2">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelect(p.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${activeProjectId === p.id ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200' : 'bg-white border-2 border-transparent hover:border-emerald-100 hover:bg-emerald-50/30'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${activeProjectId === p.id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
                          <Briefcase size={20} />
                        </div>
                        
                        <div className="flex flex-col text-left overflow-hidden flex-1">
                          <span className="text-sm font-black text-slate-800 tracking-tight truncate group-hover:text-slate-900">
                              {p.projectName || p.address}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{p.id}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                              <span className="text-[10px] font-bold text-slate-400 truncate">
                                  {p.address || 'Sin Ubicación'}
                              </span>
                          </div>
                        </div>

                        {activeProjectId === p.id && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                              <CheckCircle2 size={14} />
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center px-8 border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                        <AlertCircle size={28} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">No se encontraron proyectos</p>
                      <p className="text-xs font-bold text-slate-400 max-w-[240px] leading-relaxed">
                        {searchQuery ? 'Prueba con otro término o limpia el buscador.' : 'Asegúrate de haber sincronizado los proyectos en el Directorio General primero.'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
