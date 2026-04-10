// src/features/AssignmentModule/AssignmentModule.tsx

import React from 'react';
import { useAssignments } from './useAssignments';
import { DashIcons as Icons } from '../../constants/dashboard';

const AssignmentModule = () => {
  const {
    user,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isSaving,
    demoRole,
    setDemoRole,
    assignments,
    progressMap,
    toggleAssign,
    updateProgress,
    saveAll,
    USERS,
    PROJECT_AREAS,
  } = useAssignments();

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="h-full bg-white p-10 md:p-14 overflow-y-auto slide-up font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <div>
          <div className="flex items-center gap-6 mb-3">
            <h1 className="text-4xl font-sans tracking-tight text-arch-text">
              Gestión de Equipo &amp; Progreso<span className="text-arch-brand-sage">.</span>
            </h1>
            <button
              onClick={() => setDemoRole(demoRole === 'ADMIN' ? 'COLABORADOR' : 'ADMIN')}
              className="bg-arch-sand/50 hover:bg-arch-text hover:text-white text-[9px] uppercase tracking-[0.3em] px-4 py-2 border border-arch-border text-arch-text-muted transition-all font-bold"
            >
              Simulación: {demoRole} ⇋
            </button>
          </div>
          <p className="text-arch-text-muted font-light text-sm font-bold">
            Administración centralizada de capital humano y metas operativas.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-widest text-arch-text-muted font-bold">
              Seleccionar Expediente
            </span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="bg-arch-sand/30 border border-arch-border px-4 py-3 text-xs font-bold tracking-widest uppercase text-arch-text outline-none transition-all"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </select>
          </div>
          {demoRole === 'ADMIN' && (
            <button
              onClick={saveAll}
              className="bg-arch-text hover:bg-arch-brand-sky hover:text-arch-text text-white py-2 px-10 text-[10px] font-bold tracking-[0.3em] uppercase transition-all mt-auto shadow-float"
            >
              {isSaving ? 'Sincronizando' : 'Consolidar Cambios'}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PROJECT_AREAS.map(area => {
          const areaUserIds = Array.isArray(assignments[area.id])
            ? assignments[area.id]
            : assignments[area.id]
            ? [assignments[area.id]]
            : [];
          const areaProgress = progressMap[area.id] || 0;
          const isMyTask = areaUserIds.includes(user?.id);

          return (
            <div
              key={area.id}
              className={`p-10 border transition-all duration-700 relative overflow-hidden flex flex-col ${
                isMyTask ? 'border-arch-brand-sage bg-arch-brand-sage/5' : 'border-arch-border bg-white hover:border-arch-brand-sky'
              }`}
            >
              {/* Progress bar */}
              <div
                className="absolute top-0 left-0 h-1 bg-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: `${areaProgress}%` }}
              />

              {isMyTask && (
                <div className="absolute top-4 right-4 animate-pulse">
                  <span className="bg-arch-brand-sage text-arch-text text-[9px] font-bold px-3 py-1 tracking-widest uppercase">
                    Team Lead
                  </span>
                </div>
              )}

              <div className="flex items-center gap-6 mb-12 mt-4">
                <div
                  className={`w-14 h-14 border flex items-center justify-center transition-all ${
                    areaProgress === 100 ? 'bg-arch-brand-sage border-arch-brand-sage text-arch-text' : 'bg-arch-sand/50 text-arch-text'
                  }`}
                >
                  {areaProgress === 100 ? <Icons.Check className="w-8 h-8" /> : <Icons.Building className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-sans text-2xl tracking-tight text-arch-text leading-tight">
                    {area.title}
                  </h3>
                  <p className="text-[10px] font-bold tracking-widest text-arch-text-muted uppercase mt-1">
                    SLA Efficiency: {areaProgress}%
                  </p>
                </div>
              </div>

              {/* Progress Management */}
              <div className="flex-1 space-y-10">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-arch-text-muted">
                      Estado de Avance
                    </label>
                    <span className="text-xs font-mono font-bold text-arch-text">{areaProgress}%</span>
                  </div>
                  {demoRole === 'ADMIN' ? (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={areaProgress}
                      onChange={e => updateProgress(area.id, e.target.value)}
                      className="w-full h-1.5 bg-arch-sand rounded-none appearance-none cursor-pointer accent-cyan-400"
                    />
                  ) : (
                    <div className="w-full h-1.5 bg-arch-sand overflow-hidden">
                      <div className="h-full bg-arch-brand-sage transition-all duration-1000" style={{ width: `${areaProgress}%` }} />
                    </div>
                  )}
                </div>

                {/* Team Management */}
                <div className="border-t border-arch-border pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-arch-text-muted">
                      Equipo Técnico
                    </label>
                    <span className="text-[10px] text-arch-text-muted font-mono">Count: {areaUserIds.length}</span>
                  </div>
                  {demoRole === 'ADMIN' ? (
                    <div className="grid grid-cols-3 gap-2">
                      {USERS.map(u => {
                        const isSelected = areaUserIds.includes(u.id);
                        return (
                          <button
                            key={u.id}
                            onClick={() => toggleAssign(area.id, u.id)}
                            className={`flex flex-col items-center gap-2 p-3 transition-all border ${
                              isSelected ? 'border-arch-brand-sage bg-arch-brand-sage/10 opacity-100' : 'border-transparent opacity-30 grayscale hover:opacity-100'
                            }`}
                          >
                            <div
                              style={{ backgroundColor: u.color }}
                              className="w-10 h-10 flex items-center justify-center text-[10px] font-bold text-white shadow-soft"
                            >
                              {u.initials}
                            </div>
                            <span className="text-[8px] uppercase tracking-widest font-bold truncate w-full text-center">
                              {u.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center min-h-[48px]">
                      {areaUserIds.length > 0 ? (
                        <div className="flex -space-x-4">
                          {areaUserIds.map((uid, idx) => {
                            const u = USERS.find(user => user.id === uid);
                            if (!u) return null;
                            return (
                              <div
                                key={u.id}
                                style={{ backgroundColor: u.color, zIndex: 10 - idx }}
                                title={u.name}
                                className="w-12 h-12 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-soft hover:scale-110 transition-transform cursor-help"
                              >
                                {u.initials}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-arch-text-muted opacity-40">
                          Pendiente de formación
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentModule;
