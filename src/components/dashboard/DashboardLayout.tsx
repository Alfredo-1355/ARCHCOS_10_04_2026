import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, ProjectContext } from '../../contexts/DashboardContext';
import { DashIcons as Icons } from '../../constants/dashboard';
import CommandPalette from './CommandPalette';

const DashboardLayout = ({ children, navigate }: { children: React.ReactNode, navigate: (path: string) => void }) => {
    const { user, logout } = useContext(AuthContext) || {};
    const { setCommandPaletteOpen } = useContext(ProjectContext) || {};
    const [currentPath, setCurrentPath] = useState(window.location.hash);
    
    // Remount animation trigger on path change
    const [animationKey, setAnimationKey] = useState(Date.now());

    useEffect(() => {
        if (window.location.hash !== currentPath) {
            setCurrentPath(window.location.hash);
            setAnimationKey(Date.now()); // Force re-render of main content animation
        }
    }, [window.location.hash]);

    const isActive = (path: string) => window.location.hash === path;

    const baseNavClass = "w-full flex items-center gap-4 px-6 py-4 transition-all duration-500 ease-out transform group";
    const activeNavClass = "text-arch-text scale-[1.02] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white/80 rounded-r-2xl border-r-4";
    const inactiveNavClass = "text-arch-text-muted hover:text-arch-text hover:bg-white/40 hover:scale-[1.02] hover:shadow-sm rounded-r-2xl border-transparent";

    return (
        <div className="flex h-screen bg-[#F0F2F5] overflow-hidden text-arch-text font-sans selection:bg-brand-sky/30 relative">
            
            {/* Global Ambient Background Glow (Glassmorphism context) */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-sky/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-green/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />

            {/* Sidebar with Glassmorphism */}
            <aside className="w-[340px] bg-white/60 backdrop-blur-2xl border-r border-arch-border/50 flex flex-col justify-between hidden md:flex z-20 shadow-[4px_0_30px_rgba(0,0,0,0.02)] slide-up">
                <div className="p-10">
                    <div className="mb-16 transform transition-transform hover:scale-105 duration-500 origin-left cursor-pointer" onClick={() => navigate('#/dashboard')}>
                        <Icons.Logo className="h-10 text-arch-text drop-shadow-[0_4px_12px_rgba(26,43,60,0.1)]" />
                    </div>
                    
                    <nav className="space-y-10 pr-6 relative">
                        {/* REPOSITORIO DE PROYECTOS */}
                        <div className="slide-up delay-100 relative z-10">
                            <p className="text-[9px] font-black text-arch-text-muted tracking-[0.4em] uppercase mb-5 ml-6 opacity-60">Repositorio Global</p>
                            <div className="space-y-2">
                                <button onClick={() => navigate('#/dashboard')} 
                                    className={`${baseNavClass} ${isActive('#/dashboard') ? activeNavClass + ' border-arch-text' : inactiveNavClass}`}>
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('#/dashboard') ? 'bg-arch-border shadow-inner' : 'bg-transparent group-hover:bg-arch-border/50'}`}>
                                        <Icons.Folder className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive('#/dashboard') ? 'text-arch-text' : ''}`} />
                                    </div>
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Directorio General</span>
                                </button>
                                <button onClick={() => navigate('#/dashboard/nuevo')} 
                                    className={`${baseNavClass} ${isActive('#/dashboard/nuevo') || isActive('#/dashboard/editar') ? activeNavClass + ' border-brand-green' : inactiveNavClass}`}>
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('#/dashboard/nuevo') || isActive('#/dashboard/editar') ? 'bg-brand-green/40 shadow-inner' : 'bg-transparent group-hover:bg-arch-border/50'}`}>
                                        <Icons.Plus className={`w-5 h-5 transition-transform duration-500 ${isActive('#/dashboard/nuevo') ? 'rotate-90' : 'group-hover:rotate-90'} ${isActive('#/dashboard/nuevo') || isActive('#/dashboard/editar') ? 'text-brand-dark-green' : ''}`} />
                                    </div>
                                    <span className="font-bold text-[11px] uppercase tracking-widest">{isActive('#/dashboard/editar') ? 'Editar Proyecto' : 'Nuevo Proyecto'}</span>
                                </button>
                                <button onClick={() => navigate('#/dashboard/consultas')} 
                                    className={`${baseNavClass} ${isActive('#/dashboard/consultas') ? activeNavClass + ' border-[#3B82F6]' : inactiveNavClass}`}>
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('#/dashboard/consultas') ? 'bg-brand-blue/50 shadow-inner' : 'bg-transparent group-hover:bg-arch-border/50'}`}>
                                        <Icons.Building className={`w-5 h-5 transition-transform duration-500 group-hover:-translate-y-1 ${isActive('#/dashboard/consultas') ? 'text-[#1d4ed8]' : ''}`} />
                                    </div>
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Portal Clientes</span>
                                </button>
                            </div>
                        </div>

                        {/* GESTIÓN ESTRATÉGICA */}
                        <div className="slide-up delay-200 relative z-10 mt-10">
                            <div className="flex items-center justify-between mx-6 mb-5">
                                <p className="text-[9px] font-black text-arch-text-muted tracking-[0.4em] uppercase opacity-60">Gestión Estratégica</p>
                                <button onClick={() => setCommandPaletteOpen?.(true)} className="flex items-center gap-2 bg-arch-border/30 hover:bg-arch-border/80 px-2 py-1 rounded text-[8px] font-mono font-bold text-arch-text-muted transition-colors uppercase cursor-pointer group" title="Open Command Palette">
                                    <Icons.Search className="w-3 h-3 group-hover:text-brand-sky transition-colors" />
                                    Ctrl+K
                                </button>
                            </div>
                            <div className="space-y-2">
                                <button onClick={() => navigate('#/dashboard/asignacion')} 
                                    className={`${baseNavClass} ${isActive('#/dashboard/asignacion') ? activeNavClass + ' border-brand-green' : inactiveNavClass}`}>
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('#/dashboard/asignacion') ? 'bg-brand-green/40 shadow-inner' : 'bg-transparent group-hover:bg-arch-border/50'}`}>
                                        <Icons.Settings className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-45 ${isActive('#/dashboard/asignacion') ? 'text-brand-dark-green' : ''}`} />
                                    </div>
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Gestión de Equipo</span>
                                </button>
                                <button onClick={() => navigate('#/dashboard/cronograma')} 
                                    className={`${baseNavClass} ${isActive('#/dashboard/cronograma') ? activeNavClass + ' border-[#3B82F6]' : inactiveNavClass}`}>
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('#/dashboard/cronograma') ? 'bg-brand-blue/50 shadow-inner' : 'bg-transparent group-hover:bg-arch-border/50'}`}>
                                        <Icons.Calendar className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive('#/dashboard/cronograma') ? 'text-[#1d4ed8]' : ''}`} />
                                    </div>
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Smart Schedule</span>
                                </button>
                                <button onClick={() => navigate('#/dashboard/programa')} 
                                    className={`${baseNavClass} ${isActive('#/dashboard/programa') ? activeNavClass + ' border-purple-400' : inactiveNavClass}`}>
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('#/dashboard/programa') ? 'bg-purple-100 shadow-inner' : 'bg-transparent group-hover:bg-arch-border/50'}`}>
                                        <Icons.Transform className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive('#/dashboard/programa') ? 'text-purple-600' : ''}`} />
                                    </div>
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Programa Arq.</span>
                                </button>
                            </div>
                        </div>
                    </nav>
                </div>
                
                <div className="p-8 pb-10">
                    <div className="flex items-center justify-between border-t border-arch-border/50 pt-8 mt-auto slide-up delay-300">
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('#/dashboard')}>
                            <div className="w-11 h-11 rounded-2xl bg-arch-text flex items-center justify-center text-white font-bold text-sm shadow-[0_8px_20px_rgba(26,43,60,0.3)] transition-transform duration-500 group-hover:scale-110">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase tracking-widest leading-none mb-1 text-arch-text group-hover:text-brand-dark-green transition-colors">{user?.name}</span>
                                <span className="text-[9px] text-[#3B82F6] font-black uppercase tracking-widest">{user?.role}</span>
                            </div>
                        </div>
                        <button onClick={logout} 
                            className="p-3 rounded-2xl bg-white/40 border border-transparent hover:bg-white hover:border-red-500/20 hover:shadow-soft transition-all duration-400 text-arch-text-muted hover:text-red-500 hover:rotate-[15deg]">
                            <Icons.LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Global Command Palette */}
            <CommandPalette navigate={navigate} />

            {/* Main Content Area with global transition */}
            <main 
                key={animationKey} 
                className="flex-1 flex flex-col h-screen overflow-hidden relative fade-in z-10"
                style={{ animationDuration: '0.8s', animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                {/* Optional Subtle Overlay inner fade */}
                <div className="absolute inset-0 bg-white/30 pointer-events-none fade-in z-0" style={{animationDuration: '1.2s'}} />
                
                {/* Content itself */}
                <div className="relative z-10 h-full w-full overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
