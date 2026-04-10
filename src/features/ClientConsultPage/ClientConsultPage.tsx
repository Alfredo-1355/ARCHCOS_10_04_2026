// src/features/ClientConsultPage/ClientConsultPage.tsx

import React, { useState } from 'react';
import { useProjects } from '../../contexts/DashboardContext';
import { DashIcons as Icons } from '../../constants/dashboard';

const ClientConsultPage = ({ navigate }: { navigate: (path: string) => void }) => {
  const { projects } = useProjects();
  const [query, setQuery] = useState('');
  const [activeProject, setActiveProject] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    const sanitizedQuery = query.trim().replace(/^#/, '').toUpperCase();
    setTimeout(() => {
      const found = projects.find((p: any) =>
        p.id.toUpperCase() === sanitizedQuery ||
        (p.clientName && p.clientName.toLowerCase().includes(query.toLowerCase().trim()))
      );
      setActiveProject(found || null);
      setIsSearching(false);
      if (!found) alert('Expediente no localizado en la infraestructura digital de ARCHCOS.');
    }, 1000);
  };

  const handleRequestMeeting = () => {
    if (!activeProject) return;
    const subject = encodeURIComponent(`Solicitud de Reunión: ${activeProject.address} (${activeProject.id})`);
    const body = encodeURIComponent(`Hola equipo ARCHCOS,\n\nMe gustaría solicitar una reunión para discutir los avances del proyecto ${activeProject.address}.\n\nSaludos.`);
    window.location.href = `mailto:rgaytan@archcos.com?subject=${subject}&body=${body}`;
  };

  const PHASES = ['Investigación', 'Concepto', 'Arquitectónico', 'Estructural', 'Ingenierías MEP', 'Renders'];

  const getPhaseProgress = (project: any, phaseIdx: number) => {
    if (!project.progressMap) return 0;
    const m = project.progressMap;
    switch (phaseIdx) {
      case 0: return m.area_investigacion || 0;
      case 1: return m.area_concepto || 0;
      case 2: return m.area_arquitectonico || 0;
      case 3: return m.area_estructural || 0;
      case 4: return Math.round(((m.area_electrico || 0) + (m.area_hidro || 0)) / 2);
      case 5: return m.area_grafico || 0;
      default: return 0;
    }
  };

  const calculateGlobalProgress = (project: any) => {
    if (!project.progressMap) return 0;
    const values: number[] = Object.values(project.progressMap);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  if (activeProject) {
    const globalProgress = calculateGlobalProgress(activeProject);
    return (
      <div className="min-h-screen bg-white text-arch-text p-6 md:p-14 overflow-x-hidden relative slide-up font-sans selection:bg-arch-brand-sky/20">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(174,217,230,0.1)_0%,_transparent_60%)] pointer-events-none" />
        <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start mb-24 relative z-10 border-b border-arch-border pb-12 gap-8">
          <div className="fade-in">
            <h1 className="font-bold text-5xl md:text-6xl tracking-tight mb-6 text-arch-text uppercase">{activeProject.address}</h1>
            <div className="flex flex-wrap items-center gap-6">
              <p className="text-arch-brand-sky text-[10px] tracking-[0.5em] uppercase flex items-center gap-4 font-bold bg-arch-brand-sky/10 px-4 py-2 border border-arch-brand-sky/20">
                EXP-ID: {activeProject.id}
              </p>
              <span className="text-arch-trim">|</span>
              <p className="text-arch-text-muted text-[10px] tracking-[0.3em] uppercase font-bold">Cliente: {activeProject.clientName}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end slide-up delay-200">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-arch-text-muted mb-3 ml-auto">PROGRESO PROYECTUAL</p>
            <div className="flex items-end gap-2">
              <p className="text-7xl font-bold text-arch-text tracking-tighter" style={{ fontFamily: 'Inter, Montserrat, sans-serif' }}>{globalProgress}%</p>
              <span className="text-arch-brand-sage font-bold mb-2">↑</span>
            </div>
            <button onClick={() => setActiveProject(null)} className="mt-10 bg-arch-sand/30 hover:bg-arch-text hover:text-white text-[9px] font-bold tracking-[0.4em] uppercase px-10 py-5 border border-arch-border transition-all flex items-center gap-4 group">
              <span className="w-6 h-[1px] bg-arch-text group-hover:bg-white transition-all" /> Nueva Consulta
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
          {/* Progress Tracker */}
          <div className="lg:col-span-4 bg-white border border-arch-border p-10 md:p-16 shadow-soft mb-12 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-arch-brand-sage to-transparent" />
            <h2 className="text-[11px] font-bold tracking-[0.5em] uppercase text-arch-brand-sage mb-20 flex items-center gap-4">ESTADO OPERATIVO DEL PROYECTO</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-16">
              {PHASES.map((phase, i) => {
                const progress = getPhaseProgress(activeProject, i);
                const circumference = 2 * Math.PI * 34;
                const offset = circumference - (progress / 100) * circumference;
                return (
                  <div key={i} className="flex flex-col items-center group/item scale-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="relative mb-8 flex items-center justify-center w-24 h-24 md:w-28 md:h-28">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="34" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-arch-sand" />
                        <circle cx="48" cy="48" r="34" stroke="url(#archGradient)" strokeWidth="3"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round" fill="transparent"
                          className="transition-all duration-1500 ease-out" />
                        <defs>
                          <linearGradient id="archGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D4E6A5" />
                            <stop offset="100%" stopColor="#AED9E6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center pb-1">
                        <span className={`text-xl font-bold tracking-tighter flex items-center justify-center ${progress === 100 ? 'text-arch-brand-sage scale-125' : 'text-arch-text-muted'}`}>
                          {progress === 100 ? <Icons.Check className="w-7 h-7" /> : `${progress}%`}
                        </span>
                      </div>
                    </div>
                    <p className="text-[8px] font-bold tracking-[0.4em] uppercase text-arch-trim mb-3">ETAPA 0{i + 1}</p>
                    <h4 className={`text-[10px] font-bold tracking-[0.15em] uppercase text-center ${progress > 0 ? 'text-arch-text' : 'text-arch-trim'}`}>{phase}</h4>
                    {i < PHASES.length - 1 && (
                      <div className="hidden lg:block absolute top-[52px] -right-[40px] w-20 h-[1px] bg-arch-border opacity-50" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Status & Deliverables */}
          <div className="lg:col-span-3 space-y-12">
            <section className="bg-arch-sand/20 border-l-2 border-arch-brand-sage p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Icons.Building className="w-32 h-32" />
              </div>
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-arch-text-muted mb-10 flex items-center gap-4">
                <span className="w-10 h-[1px] bg-arch-brand-sage/40" /> Bitácora Operativa
              </h3>
              <p className="font-bold text-3xl md:text-4xl leading-relaxed text-arch-text uppercase tracking-tight">
                {activeProject.status || 'Los sistemas de archivo están indexando los documentos técnicos para su revisión.'}
              </p>
            </section>
            <section>
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-arch-text-muted">Repositorio de Entregables Técnicos</h3>
                <span className="text-[9px] text-arch-brand-sky font-bold tracking-widest uppercase bg-arch-brand-sky/10 px-3 py-1 border border-arch-brand-sky/20">Secure Node V2.1</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeProject.deliverables?.map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-10 border border-arch-border bg-white hover:bg-arch-sand/20 hover:border-arch-brand-sky transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 h-[2px] bg-arch-brand-sky w-0 group-hover:w-full transition-all duration-500" />
                    <div className="flex items-center gap-8">
                      <div className="bg-arch-sand/50 p-6 text-[11px] font-bold text-arch-text-muted border border-arch-border group-hover:text-arch-brand-sky group-hover:border-arch-brand-sky transition-all font-mono uppercase">
                        {d.type}
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-arch-text group-hover:text-black transition-colors">{d.name}</span>
                        <span className="text-[9px] text-arch-trim uppercase tracking-widest mt-1 block tracking-tighter font-bold">Liberación Verificada</span>
                      </div>
                    </div>
                    <Icons.Check className="w-6 h-6 text-arch-trim group-hover:text-arch-brand-sage transition-all" />
                  </div>
                ))}
              </div>
            </section>
          </div>
          {/* Director & Contact Info */}
          <aside className="space-y-10">
            <div className="bg-white border border-arch-border p-10 shadow-float relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-arch-brand-sky" />
              <h4 className="text-[9px] font-bold tracking-[0.5em] uppercase text-arch-text-muted mb-12">Responsable Directo</h4>
              <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-arch-brand-sage flex items-center justify-center font-sans text-arch-text text-3xl font-bold shadow-soft">AR</div>
                <div>
                  <p className="text-2xl font-sans text-arch-text">Alfredo Reyes</p>
                  <p className="text-[9px] text-arch-brand-sky font-bold uppercase tracking-[0.2em] leading-none mt-3">Director de Diseño</p>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <button onClick={handleRequestMeeting} className="w-full py-5 bg-arch-text text-white hover:bg-arch-brand-sage hover:text-arch-text transition-all text-[10px] font-bold tracking-[0.4em] uppercase shadow-float">
                  Solicitar Reunión
                </button>
                <button className="w-full py-5 border border-arch-border hover:bg-arch-sand transition-all text-[10px] font-bold tracking-[0.4em] uppercase text-arch-text-muted">
                  Descargar Registro
                </button>
              </div>
            </div>
            <div className="p-8 border border-arch-border bg-arch-sand/10">
              <p className="text-[8px] tracking-[0.4em] uppercase text-arch-trim font-bold mb-4">Protocolo de Privacidad</p>
              <p className="text-[10px] text-arch-text-muted leading-relaxed font-light">Su sesión está protegida. Todos los activos arquitectónicos son propiedad confidencial de ARCHCOS Group.</p>
            </div>
          </aside>
        </main>
        <footer className="max-w-7xl mx-auto mt-40 py-20 border-t border-arch-border text-center transition-opacity opacity-30 hover:opacity-100">
          <Icons.Logo className="w-20 h-20 mx-auto mb-10 grayscale" />
          <p className="text-[10px] tracking-[1em] uppercase font-bold text-arch-trim">ARCHCOS INFRASTRUCTURE • DIGITAL RECORD PORTAL 2026</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden slide-up font-sans selection:bg-arch-brand-sky/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_rgba(174,217,230,0.1)_0%,_transparent_70%)] pointer-events-none" />
      <button onClick={() => navigate('#/login')} className="absolute top-12 left-12 text-arch-text-muted hover:text-arch-brand-sky transition-all text-[10px] font-bold tracking-[0.6em] uppercase flex items-center gap-8 group">
        <span className="w-12 h-[1px] bg-arch-trim group-hover:w-20 group-hover:bg-arch-brand-sky transition-all" /> ACCESO SISTEMA
      </button>
      <div className="max-w-3xl w-full text-center z-10 px-4">
        <div className="flex justify-center mb-20 scale-125 fade-in">
          <Icons.Logo className="w-24 h-24" />
        </div>
        <h1 className="font-sans text-7xl md:text-8xl mb-8 tracking-tighter text-arch-text uppercase leading-none slide-up">Portal Proyectos</h1>
        <p className="text-[11px] tracking-[0.8em] uppercase text-arch-text-muted mb-24 font-bold flex items-center justify-center gap-10 slide-up delay-100">
          NODO DE CONSULTA SEGURA <span className="w-2 h-2 rounded-full bg-arch-brand-sage animate-pulse" /> INFRAESTRUCTURA
        </p>
        <div className="bg-white border border-arch-border p-16 md:p-24 shadow-float relative max-w-2xl mx-auto slide-up delay-200">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-arch-brand-sky to-transparent" />
          <h2 className="text-[10px] font-bold tracking-[0.5em] uppercase text-arch-text-muted mb-20">Ingrese Credencial de Expediente</h2>
          <div className="space-y-16">
            <div className="relative group">
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="POL-0000-CLIENTE"
                className="w-full bg-transparent border-b border-arch-border pb-10 text-arch-text font-sans text-4xl md:text-5xl focus:border-arch-brand-sky transition-all placeholder:text-arch-trim outline-none text-center"
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-arch-brand-sky transition-all duration-700 group-focus-within:w-full" />
            </div>
            <button onClick={handleSearch} disabled={isSearching}
              className="w-full bg-arch-text hover:bg-arch-brand-sky text-white hover:text-arch-text py-8 px-16 text-[11px] font-bold tracking-[0.6em] uppercase transition-all shadow-float disabled:opacity-50 flex items-center justify-center gap-6 group">
              {isSearching ? <span className="animate-pulse">AUTENTICANDO...</span> : <>CONSULTAR EXPEDIENTE <span className="text-xl group-hover:translate-x-2 transition-transform">→</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientConsultPage;
