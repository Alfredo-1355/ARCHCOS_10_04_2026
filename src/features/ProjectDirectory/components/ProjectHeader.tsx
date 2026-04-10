import React from 'react';
import { DashIcons as Icons } from '../../../constants/dashboard';
import { useAuth } from '../../../contexts/DashboardContext';

interface ProjectHeaderProps {
    navigate: (path: string) => void;
    onSyncCloud: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ navigate, onSyncCloud }) => {
    const { user } = useAuth();

    return (
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
            <div>
                <p className="text-[10px] font-black tracking-[0.4em] text-arch-text-muted uppercase mb-3 opacity-40">
                    Gestión Integral ARCHCOS
                </p>
                <h1 className="text-4xl font-bold text-arch-text tracking-tight">
                    Hola, {user?.name.split(' ')[0]}.
                </h1>
            </div>
            <div className="flex gap-4">
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={onSyncCloud}
                        className="bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-dark-blue py-3 px-6 text-[10px] font-black tracking-[0.3em] uppercase border border-brand-blue/30 transition-all flex items-center gap-2"
                    >
                        <Icons.Transform className="w-4 h-4" /> Sincronizar Nube
                    </button>
                )}
                <button
                    onClick={() => navigate('#/dashboard/nuevo')}
                    className="bg-brand-green text-brand-dark-green hover:bg-brand-blue py-3 px-6 text-[10px] font-black tracking-[0.3em] uppercase transition-all shadow-sm"
                >
                    + Nuevo Ingreso
                </button>
            </div>
        </header>
    );
};

export default ProjectHeader;
