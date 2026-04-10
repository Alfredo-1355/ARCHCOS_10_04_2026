import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Briefcase } from 'lucide-react';

interface Props {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  onBack: () => void;
}

export const ClientPortalOverlay: React.FC<Props> = ({ query, setQuery, onSearch, isSearching, onBack }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_rgba(174,217,230,0.15)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-100/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      
      <button 
        onClick={onBack} 
        className="absolute top-12 left-12 text-slate-400 hover:text-indigo-600 transition-all text-[10px] font-black tracking-[0.6em] uppercase flex items-center gap-8 group"
      >
        <span className="w-12 h-[1px] bg-slate-200 group-hover:w-20 group-hover:bg-indigo-600 transition-all" /> 
        Acceso STAFF
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center z-10"
      >
        <div className="mb-16 flex justify-center">
           <div className="h-14 flex items-center gap-4">
              <svg className="h-full aspect-square" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="25" width="60" height="60" rx="15" fill="#D4E6A5" fillOpacity="0.9" />
                  <rect x="35" y="15" width="60" height="60" rx="15" fill="#AED9E6" fillOpacity="0.8" />
              </svg>
              <div className="flex flex-col justify-center text-left">
                <span className="text-2xl font-bold tracking-tight text-slate-800" style={{ fontFamily: '"Playfair Display", serif' }}>ARCHCOS</span>
                <span className="text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase">Consultoría de Capital</span>
              </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase mb-4 leading-tight">
          Portal del Cliente
        </h1>
        <p className="text-[10px] font-black tracking-[0.6em] text-slate-400 uppercase mb-12">Digital Trust Infrastructure</p>
        
        <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-12 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[48px] relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          
          <div className="space-y-12">
            <div className="relative group">
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6">Credential ID</label>
              <input 
                type="text" 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="EXP-XXXX"
                onKeyDown={e => e.key === 'Enter' && onSearch()}
                className="w-full bg-transparent border-b-2 border-slate-100 pb-6 text-slate-900 text-center focus:border-indigo-500 transition-all outline-none font-sans font-black placeholder:opacity-10 text-4xl md:text-5xl tracking-tight" 
              />
            </div>
            
            <button 
              onClick={onSearch} 
              disabled={isSearching}
              className="w-full py-6 bg-slate-900 hover:bg-indigo-600 text-white transition-all text-[11px] font-black tracking-[0.4em] uppercase shadow-xl hover:shadow-2xl rounded-2xl flex items-center justify-center gap-6 group disabled:opacity-50"
            >
              {isSearching ? (
                <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"/> Verificando...</span>
              ) : (
                <>Acceder al Proyecto <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Secure Node</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Sync</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
