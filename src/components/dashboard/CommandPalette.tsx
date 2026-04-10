import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashIcons as Icons } from '../../constants/dashboard';
import { ProjectContext } from '../../contexts/DashboardContext';

const CommandPalette = ({ navigate }: { navigate: (path: string) => void }) => {
    const { 
        projects, 
        isCommandPaletteOpen, 
        setCommandPaletteOpen, 
        setActiveProjectId,
        paretoFocus,
        setParetoFocus
    } = useContext(ProjectContext) || {};

    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen?.((prev: boolean) => !prev);
            }
            if (e.key === 'Escape') {
                setCommandPaletteOpen?.(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setCommandPaletteOpen]);

    useEffect(() => {
        if (isCommandPaletteOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setSearch('');
        }
    }, [isCommandPaletteOpen]);

    const filteredProjects = projects?.filter(p => 
        p.address.toLowerCase().includes(search.toLowerCase()) || 
        p.id.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleAction = (action: () => void) => {
        action();
        setCommandPaletteOpen?.(false);
    };

    return (
        <AnimatePresence>
            {isCommandPaletteOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                    {/* Deep Blur Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-arch-text/20 backdrop-blur-md"
                        onClick={() => setCommandPaletteOpen?.(false)}
                    />

                    {/* Palette Body */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full max-w-2xl bg-white/70 backdrop-blur-3xl border border-arch-border/50 shadow-[0_30px_100px_rgba(26,43,60,0.2)] rounded-3xl overflow-hidden relative z-10 flex flex-col mx-4"
                    >
                        {/* Input Area */}
                        <div className="relative border-b border-arch-border/30 px-6 py-5 flex items-center gap-4 bg-white/40">
                            <Icons.Search className="w-6 h-6 text-brand-sky" />
                            <input 
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Do anything... (Search projects, create task)"
                                className="w-full bg-transparent outline-none text-xl font-light text-arch-text placeholder:text-arch-trim"
                            />
                            <div className="flex gap-2">
                                <kbd className="px-2 py-1 bg-arch-sand rounded-lg text-[9px] font-mono font-bold text-arch-text-muted border border-arch-border">ESC</kbd>
                            </div>
                        </div>

                        {/* Results Area */}
                        <div className="max-h-[50vh] overflow-y-auto no-scrollbar p-3">
                            <AnimatePresence>
                                {/* Quick Actions */}
                                {search.length === 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
                                        <p className="px-4 py-2 text-[9px] font-black tracking-widest uppercase text-arch-text-muted opacity-60">Acciones Globales</p>
                                        <div className="space-y-1">
                                            <button onClick={() => handleAction(() => navigate('#/dashboard/nuevo'))}
                                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white transition-colors text-left group">
                                                <div className="p-2 bg-brand-green/20 text-brand-dark-green rounded-lg group-hover:scale-110 transition-transform"><Icons.Plus className="w-4 h-4" /></div>
                                                <span className="text-sm font-semibold text-arch-text group-hover:text-brand-dark-green">New Project Workspace</span>
                                            </button>
                                            <button onClick={() => handleAction(() => navigate('#/dashboard/asignacion'))}
                                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white transition-colors text-left group">
                                                <div className="p-2 bg-brand-sky/20 text-brand-dark-blue rounded-lg group-hover:scale-110 transition-transform"><Icons.Settings className="w-4 h-4" /></div>
                                                <span className="text-sm font-semibold text-arch-text group-hover:text-brand-dark-blue">Add Team Member / Assignments</span>
                                            </button>
                                            <button onClick={() => handleAction(() => setParetoFocus?.(!paretoFocus))}
                                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white transition-colors text-left group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${paretoFocus ? 'bg-orange-500/20 text-orange-600' : 'bg-arch-sand text-arch-text-muted'}`}><Icons.Check className="w-4 h-4" /></div>
                                                    <span className="text-sm font-semibold text-arch-text">Toggle Pareto 80/20 Focus</span>
                                                </div>
                                                <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-1 ${paretoFocus ? 'bg-orange-500' : 'bg-arch-sand border border-arch-border'}`}>
                                                    <div className={`w-2 h-2 rounded-full bg-white transition-transform ${paretoFocus ? 'transform translate-x-4' : ''}`} />
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Search Results */}
                                {search.length > 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <p className="px-4 py-2 text-[9px] font-black tracking-widest uppercase text-arch-text-muted opacity-60">Proyectos / Gantt</p>
                                        {filteredProjects.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-arch-text-muted font-light text-sm">No match found</div>
                                        ) : (
                                            <div className="space-y-1">
                                                {filteredProjects.map(p => (
                                                    <button 
                                                        key={p.id}
                                                        onClick={() => handleAction(() => {
                                                            setActiveProjectId?.(p.id);
                                                            navigate('#/dashboard/cronograma');
                                                        })}
                                                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white transition-colors text-left group"
                                                    >
                                                        <div className="p-2 bg-arch-sand text-arch-text rounded-lg group-hover:bg-brand-blue/20 group-hover:text-brand-dark-blue transition-colors">
                                                            <Icons.Calendar className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-arch-text">{p.address}</span>
                                                            <span className="text-[10px] text-arch-text-muted tracking-widest font-mono">Jump to Smart Schedule</span>
                                                        </div>
                                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[10px] uppercase font-bold text-brand-dark-blue flex items-center gap-2">
                                                                Enter <kbd className="px-2 py-0.5 bg-brand-sky/20 rounded">↵</kbd>
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
