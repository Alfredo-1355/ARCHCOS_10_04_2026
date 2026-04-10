import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthContext, ProjectContext } from '../../contexts/DashboardContext';
import { DashIcons as Icons, INITIAL_PROJECTS, EMOJI_MAP, CATEGORY_ICONS } from '../../constants/dashboard';
import ProjectInfographicDashboard from '../../components/ProjectInfographicDashboard';
import { ProjectCardSkeleton } from '../../components/ui/Skeleton';

const ProjectDirectory = ({ navigate }: { navigate: (path: string) => void }) => {
    const { user } = useContext(AuthContext) || {};
    const { projects, deleteProject, startEdit, updateProject, setActiveProjectId, loading } = useContext(ProjectContext) || {};
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingReportId, setViewingReportId] = useState<string | null>(null);

    const filteredProjects = projects?.filter(p => 
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
    
    const selectedReport = projects?.find(p => p.id === viewingReportId);

    const stats = [
        { title: '⌾ Obras Activas', value: projects?.length || 0, bg: 'bg-brand-green/15' },
        { title: '◨ Fase de Diseño', value: projects?.filter(p => ['PROPUESTA', 'DISEÑO'].includes(p.stage)).length || 0, bg: 'bg-brand-blue/15' },
        { title: '◫ Revisión Legal', value: projects?.filter(p => p.stage === 'REVISIÓN').length || 0, bg: 'bg-white border border-arch-border/50' },
    ];

    const compressImage = (file: File, callback: (dataUrl: string) => void) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    callback(dataUrl);
                }
            };
        };
    };

    return (
        <div className="p-10 md:p-14 h-full overflow-y-auto slide-up relative z-10">
            <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
                <div>
                    <p className="text-[10px] font-black tracking-[0.4em] text-arch-text-muted uppercase mb-3 opacity-60">Gestión Integral ARCHCOS</p>
                    <h1 className="text-4xl font-bold text-arch-text tracking-tight">Hola, {user?.name?.split(' ')[0] || 'Arquitecto'}.</h1>
                </div>
                <div className="flex gap-4">
                    {user?.role === 'ADMIN' && (
                        <button 
                            onClick={async () => {
                                if (confirm("¿Deseas subir todos los proyectos iniciales a la nube de Firebase? Esto sobreescribirá datos con el mismo ID.")) {
                                    for (const p of INITIAL_PROJECTS) {
                                        await updateProject(p);
                                    }
                                    alert("Sincronización completa con archcosbasededatos.");
                                }
                            }}
                            className="bg-brand-blue/15 hover:bg-brand-blue/30 text-brand-dark-blue py-3 px-6 text-[10px] font-black tracking-[0.3em] uppercase border border-brand-blue/30 transition-all flex items-center gap-3 backdrop-blur-md shadow-soft rounded-xl"
                        >
                            <Icons.Transform className="w-4 h-4" /> Sincronizar Nube
                        </button>
                    )}
                    <button onClick={() => navigate('#/dashboard/nuevo')} className="bg-brand-green text-brand-dark-green hover:bg-brand-green/80 py-3 px-6 text-[10px] font-black tracking-[0.3em] uppercase transition-all shadow-soft hover:shadow-float hover:-translate-y-1 rounded-xl">
                        + Nuevo Ingreso
                    </button>
                </div>
            </header>

            {/* KPIs - Glassmorphism style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                        key={i} 
                        className={`p-8 rounded-2xl relative overflow-hidden backdrop-blur-3xl shadow-[0_4px_20px_rgba(26,43,60,0.03)] group transition-all duration-500 hover:scale-[1.02] ${stat.bg}`}
                    >
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-arch-text tracking-widest uppercase mb-4 opacity-70 mix-blend-color-burn">{stat.title}</p>
                            <p className="font-sans text-5xl text-arch-text mix-blend-color-burn font-bold">{stat.value}</p>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                            <Icons.Building className="w-32 h-32" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Directory & Search */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-bold text-2xl text-arch-text">Directorio de Proyectos</h3>
                <div className="relative w-full md:w-96 h-12 flex items-center bg-white/50 backdrop-blur-md rounded-2xl border border-arch-border/50 shadow-inner px-4 overflow-hidden group focus-within:bg-white focus-within:border-brand-sky/50 transition-all">
                    <Icons.Search className="text-arch-text-muted w-4 h-4 group-focus-within:text-brand-sky transition-colors" />
                    <input type="text" placeholder="Buscar por cliente o ubicación..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-3 h-full bg-transparent outline-none text-xs font-bold text-arch-text placeholder:text-arch-trim placeholder:font-light" />
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl border border-arch-border/50 shadow-[0_10px_40px_rgba(26,43,60,0.02)] rounded-3xl overflow-hidden">
                {loading ? (
                    <div className="divide-y divide-arch-border/30">
                        <ProjectCardSkeleton />
                        <ProjectCardSkeleton />
                        <ProjectCardSkeleton />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="p-16 text-center text-arch-text-muted font-light font-bold font-sans opacity-70">
                        <Icons.Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        El archivo se encuentra vacío en este momento.
                    </div>
                ) : (
                    <div className="divide-y divide-arch-border/30">
                        <AnimatePresence>
                            {filteredProjects.map((p) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    key={p.id} 
                                    onDoubleClick={() => setViewingReportId(p.id)}
                                    className="p-6 md:p-8 hover:bg-white/80 cursor-pointer transition-colors flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between group overflow-hidden"
                                    title="Doble clic para ver informe detallado"
                                >
                                    
                                    <div className="flex-1 flex gap-6 z-10 relative pointer-events-none">
                                        <div className="hidden sm:block w-20 h-20 bg-arch-sand/50 border border-arch-border/50 rounded-2xl flex-shrink-0 relative group/img overflow-hidden pointer-events-auto shadow-inner">
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.address} className="w-full h-full object-cover opacity-90 group-hover/img:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex justify-center items-center">
                                                    <span className="font-sans font-bold text-arch-text text-xl opacity-30">
                                                        {p.id.split('-')[1]?.substring(0)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity text-white bg-arch-text/60 backdrop-blur-md" title="Cambiar portada">
                                                <Icons.Folder className="w-4 h-4 mb-1" />
                                                <span className="text-[8px] tracking-widest uppercase font-semibold">Cambiar</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e: any) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 20 * 1024 * 1024) return alert("Imagen demasiado grande (máx 20MB)");
                                                        compressImage(file, (dataUrl) => updateProject({...p, imageUrl: dataUrl}));
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        <div className="pointer-events-auto">
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <h4 className="font-bold text-xl tracking-tight text-arch-text group-hover:text-brand-dark-blue transition-colors">{p.address}</h4>
                                                <span className="text-[10px] text-arch-text-muted tracking-wider font-bold opacity-60">#{p.id}</span>
                                                {p.clientName && (
                                                    <span className="text-[9px] bg-brand-sky/30 text-brand-dark-blue px-3 py-1 tracking-[0.2em] uppercase font-bold rounded-lg">{p.clientName}</span>
                                                )}
                                            </div>
                                            <p className="text-sm font-light text-arch-text-muted mb-4 max-w-xl leading-relaxed">{p.desc}</p>
                                            
                                            <div className="flex flex-wrap gap-3 text-[9px] tracking-widest uppercase font-bold items-center">
                                                <div className="flex items-center gap-2 text-brand-dark-green bg-brand-green/30 px-3 py-2 rounded-lg border border-brand-green/40">
                                                    {CATEGORY_ICONS[p.type] ? React.createElement(CATEGORY_ICONS[p.type], { className: "w-4 h-4" }) : <Icons.Building className="w-4 h-4" />}
                                                    <span className="text-[10px]">{p.type}</span>
                                                </div>
                                                <span className="text-arch-trim opacity-50">•</span>
                                                <span className="text-arch-text-muted">{p.subtype}</span>
                                                <span className="text-arch-text-muted hidden sm:inline">{EMOJI_MAP[p.procedure] || ''} {p.procedure}</span>
                                                
                                                <div className="flex gap-2 items-center ml-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setActiveProjectId(p.id); navigate('#/dashboard/asignacion'); }}
                                                        className="flex items-center gap-2 text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white px-3 py-1.5 border border-[#3B82F6]/30 bg-[#3B82F6]/5 rounded-lg transition-all group/btn"
                                                    >
                                                        <Icons.Settings className="w-3 h-3 group-hover/btn:rotate-90 transition-transform" />
                                                        Equipo
                                                    </button>
                                                    
                                                    <div className="flex items-center">
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (p.directoryUrl) window.open(p.directoryUrl, '_blank');
                                                                else if (user?.role === 'ADMIN') {
                                                                   const url = prompt("Introduce la URL de OneDrive/SharePoint para este proyecto:", p.directoryUrl || "");
                                                                   if (url !== null) updateProject({...p, directoryUrl: url});
                                                                } else alert("Carpeta no vinculada.");
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-1.5 border rounded-l-lg transition-all group/btn2 ${p.directoryUrl ? 'text-[#0078D4] border-[#0078D4]/30 bg-[#0078D4]/5 hover:bg-[#0078D4] hover:text-white' : 'text-arch-text-muted border-arch-border/50 bg-white/50 hover:bg-white'}`}
                                                        >
                                                            <Icons.Folder className="w-3 h-3 group-hover/btn2:scale-110 transition-transform" />
                                                            {p.directoryUrl ? 'OneDrive' : (user?.role === 'ADMIN' ? '+ Ligar OneDrive' : 'No Vinculado')}
                                                        </button>
                                                        {user?.role === 'ADMIN' && p.directoryUrl && (
                                                            <button 
                                                               onClick={(e) => {
                                                                   e.stopPropagation();
                                                                   const url = prompt("Actualizar URL de OneDrive:", p.directoryUrl || "");
                                                                   if (url !== null) updateProject({...p, directoryUrl: url});
                                                               }}
                                                               className="px-2 py-1.5 border-y border-r rounded-r-lg border-[#0078D4]/30 bg-[#0078D4]/10 text-[#0078D4] hover:bg-[#0078D4] hover:text-white transition-colors"
                                                               title="Editar URL"
                                                            >
                                                               <Icons.Edit className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full xl:w-auto flex items-center justify-between xl:justify-end gap-10 mt-4 xl:mt-0 relative z-10 pointer-events-auto">
                                        <div className="text-left xl:text-right">
                                            <p className="text-[9px] font-bold text-arch-text-muted uppercase tracking-[0.2em] mb-1 opacity-70">Fecha Obj.</p>
                                            <p className="text-sm font-bold text-arch-text">{p.deliveryDate || 'TBD'}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            <span className={`px-4 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase rounded-lg border shadow-sm ${p.badgeStyle}`}>
                                                {p.stage}
                                            </span>
                                            <div className="flex gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(p)} className="p-2 rounded-lg bg-white shadow-sm border border-arch-border/50 text-arch-text-muted hover:text-arch-brand-sky hover:border-arch-brand-sky transition-all"><Icons.Edit className="w-4 h-4" /></button>
                                                <button onClick={() => deleteProject(p.id)} className="p-2 rounded-lg bg-white shadow-sm border border-arch-border/50 text-arch-text-muted hover:text-red-500 hover:border-red-500 transition-all"><Icons.Trash className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>

                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Project Infographic Dashboard Overlay */}
            <AnimatePresence>
                {viewingReportId && selectedReport && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 z-[110] bg-[#FAFAFA]/90 backdrop-blur-2xl overflow-y-auto"
                    >
                        <ProjectInfographicDashboard 
                            project={selectedReport} 
                            onClose={() => setViewingReportId(null)} 
                            onUpdate={updateProject}
                            role={user?.role}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectDirectory;
