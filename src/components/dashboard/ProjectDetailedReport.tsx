import React from 'react';
import { DashIcons as Icons, CATEGORY_ICONS, PROJECT_AREAS } from '../../constants/dashboard';

const ProjectDetailedReport = ({ project, onClose }: { project: any, onClose: () => void }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-arch-surface font-sans p-6 md:p-16 print:p-0">
            <div className="max-w-6xl mx-auto">
                {/* Header Controls */}
                <div className="flex justify-between items-center mb-16 no-print">
                    <button onClick={onClose} className="flex items-center gap-3 text-arch-text-muted hover:text-arch-text transition-all group">
                        <div className="w-10 h-10 rounded-full border border-arch-border flex items-center justify-center group-hover:bg-arch-trim transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </div>
                        <span className="font-bold text-[10px] uppercase tracking-widest">Volver al Directorio</span>
                    </button>
                    <div className="flex gap-4">
                        <button onClick={handlePrint} className="flex items-center gap-3 bg-brand-dark-blue hover:bg-brand-ink text-white px-8 py-4 rounded-none transition-all shadow-float group">
                            <Icons.Logo className="w-4 h-4 invert" showText={false} />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Descargar Informe PDF</span>
                        </button>
                    </div>
                </div>

                {/* Report Canvas */}
                <div className="bg-white border border-arch-border p-12 md:p-24 shadow-elegant print:shadow-none print:border-none relative overflow-hidden">
                    {/* Watermark Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
                        <Icons.Logo className="w-[800px] h-[800px]" showText={false} />
                    </div>

                    {/* Section 1: Identity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-8 opacity-40">
                                <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">ARCHCOS Dossier Oficial</span>
                            </div>
                            <h1 className="text-6xl font-bold tracking-tighter text-arch-text mb-6 uppercase leading-none">{project.address}</h1>
                            <div className="flex items-center gap-4 text-arch-text-muted mb-12">
                                <span className="font-mono text-xs uppercase tracking-widest">Project ID: {project.id}</span>
                                <span className="w-1 h-1 bg-arch-border rounded-full"></span>
                                <span className="font-bold text-[10px] uppercase tracking-widest">Status: {project.stage}</span>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="flex flex-col border-l-2 border-brand-blue pl-6">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Propietario / Cliente</span>
                                    <span className="text-2xl font-semibold">{project.clientName || 'Sin Especificar'}</span>
                                </div>
                                <div className="flex flex-col border-l-2 border-arch-border pl-6">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Ubicación del Proyecto</span>
                                    <span className="text-lg font-medium">{project.address}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-end items-start lg:items-end text-left lg:text-right">
                            <div className="mb-12">
                                <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mb-6 shadow-soft ${project.badgeStyle}`}>
                                    {CATEGORY_ICONS[project.type] ? React.createElement(CATEGORY_ICONS[project.type], { className: "w-16 h-16" }) : <Icons.Building className="w-16 h-16" />}
                                </div>
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-arch-text">{project.type}</h2>
                                <p className="text-arch-text-muted text-[10px] uppercase tracking-widest font-black mt-2">{project.subtype}</p>
                            </div>
                            <div className="p-6 bg-brand-neutral border border-arch-border text-center min-w-[200px]">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-arch-text-muted mb-2 block">Fecha Entrega Objetiva</span>
                                <span className="text-xl font-bold text-brand-dark-blue">{project.deliveryDate || 'TBD'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Summary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24 py-12 border-t border-b border-arch-border relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Avance Global</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tighter">{project.progress || 0}</span>
                                <span className="text-xs font-black text-brand-blue">%</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Entregables Activos</span>
                            <span className="text-3xl font-semibold">{project.deliverables?.length || 0} Docs</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Equipo Asignado</span>
                            <span className="text-3xl font-semibold">{Object.keys(project.assignments || {}).length} Áreas</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Último Update</span>
                            <span className="text-xs font-mono">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>

                    {/* Section 3: Phase Progress Details */}
                    <div className="space-y-16 relative z-10">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-arch-text whitespace-nowrap">Análisis de Ejecución por Fase</h3>
                            <div className="h-px w-full bg-arch-border"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                            {PROJECT_AREAS.map(area => {
                                const progress = project.progressMap?.[area.id] || 0;
                                return (
                                    <div key={area.id} className="space-y-4 group">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-arch-text-muted group-hover:text-arch-text transition-colors">{area.title}</span>
                                            <span className="font-mono text-xs font-bold">{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-arch-bg border border-arch-border relative rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-brand-green' : 'bg-brand-blue'}`} 
                                                 style={{ width: `${progress}%` }}>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 4: Project Narrative */}
                    <div className="mt-24 pt-16 border-t border-arch-border relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-arch-text-muted mb-8">Estado de Obra & Descripción</h3>
                        <div className="bg-arch-neutral p-10 text-xl font-light text-arch-text leading-relaxed italic border-l-4 border-brand-green">
                            "{project.status || 'No hay actualizaciones de estado registradas recientemente para este expediente.'}"
                        </div>
                    </div>

                    {/* Section 5: Signature & Branding */}
                    <div className="mt-32 pt-20 border-t border-arch-border flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-arch-text-muted">
                            Emitido por: {project.creator} • ARCHCOS Digital 2026
                        </div>
                        <Icons.Logo className="h-10 opacity-30" />
                    </div>
                </div>

                {/* Footer (No Print) */}
                <div className="mt-12 text-center no-print">
                    <p className="text-[9px] font-bold text-arch-text-muted uppercase tracking-[0.3em] opacity-40">
                        Documento generado dinámicamente bajo arquitectura SSOT (Single Source of Truth).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailedReport;
