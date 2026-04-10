// src/features/ArchitecturalProgram/ArchitecturalProgram.tsx
// Fully integrated with DashboardContext: projects, team members, Firebase persistence.
// Includes EmailJS automated assignment notifications.

import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ProjectContext, AuthContext } from '../../contexts/DashboardContext';
import { USERS } from '../../constants/dashboard';
import { useEmailNotification, NotificationPayload } from './useEmailNotification';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ProgramRow {
  id: string;
  zone: string;
  space: string;
  quantity: number;
  m2Unit: number;
  totalM2: number;
  assignedUserId: string;
  progress: number;
  notes: string;
}

interface ToastPayload {
  rowId: string;
  memberName: string;
  memberEmail: string;
  spaceName: string;
  m2: number;
  projectLabel: string;
  progress: number;
}

const DEFAULT_ZONES = [
  { zone: 'Zona Social',      spaces: ['Sala de Espera / Lobby', 'Sala de Reuniones', 'Recepción', 'Área de Descanso'] },
  { zone: 'Zona Privada',     spaces: ['Oficinas Privadas', 'Dirección General', 'Sala de Juntas Ejecutiva', 'Archivo'] },
  { zone: 'Zona de Servicio', spaces: ['Cocina / Kitchenette', 'Bodega', 'Cuarto de Limpieza', 'Estación de Trabajo'] },
  { zone: 'Zona Exterior',    spaces: ['Estacionamiento', 'Jardín / Terraza', 'Acceso Vehicular', 'Depósito Exterior'] },
];

const generateId = () => `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const buildDefaultRows = (): ProgramRow[] =>
  DEFAULT_ZONES.flatMap(({ zone, spaces }) =>
    spaces.map(space => ({
      id: generateId(), zone, space,
      quantity: 1, m2Unit: 20, totalM2: 20,
      assignedUserId: '', progress: 0, notes: '',
    }))
  );

// ─── Confirmation Toast ─────────────────────────────────────────────────────────
const AssignmentToast = ({
  payload,
  onConfirm,
  onDismiss,
  isSending,
}: {
  payload: ToastPayload;
  onConfirm: () => void;
  onDismiss: () => void;
  isSending: boolean;
}) => (
  <div className="fixed bottom-8 right-8 z-[9999] animate-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-6 max-w-[380px] w-full">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-arch-brand-sage/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Mail className="w-5 h-5 text-arch-brand-sage" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-arch-text-muted mb-1">
            Notificación de Asignación
          </p>
          <p className="text-sm font-bold text-arch-text leading-snug mb-1">
            ¿Notificar a <span className="text-arch-brand-sage">{payload.memberName}</span>?
          </p>
          <p className="text-[11px] text-arch-text-muted leading-relaxed">
            Espacio: <strong>{payload.spaceName}</strong> · {payload.m2} m² · {payload.progress}% requerido
          </p>
          <p className="text-[10px] text-arch-text-muted mt-1 truncate">
            Proyecto: {payload.projectLabel}
          </p>
        </div>
        <button onClick={onDismiss} className="text-arch-text-muted hover:text-arch-text text-lg leading-none flex-shrink-0">
          ×
        </button>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={onConfirm}
          disabled={isSending}
          className="flex-1 flex items-center justify-center gap-2 bg-arch-text hover:bg-arch-brand-sage hover:text-arch-text text-white text-[10px] font-black uppercase tracking-[0.3em] py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {isSending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...</>
          ) : (
            <><Mail className="w-3.5 h-3.5" /> Enviar y Guardar</>
          )}
        </button>
        <button
          onClick={onDismiss}
          className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-arch-text-muted hover:text-arch-text border border-arch-border rounded-xl transition-colors"
        >
          Omitir
        </button>
      </div>
    </div>
  </div>
);

// ─── Envelope Icon with status ───────────────────────────────────────────────────
const EnvelopeStatus = ({
  rowId,
  status,
  onClick,
}: {
  rowId: string;
  status: 'idle' | 'sending' | 'sent' | 'error';
  onClick: () => void;
}) => {
  if (status === 'sending') return <Loader2 className="w-4 h-4 text-arch-brand-sky animate-spin" />;
  if (status === 'sent')    return <CheckCircle className="w-4 h-4 text-emerald-500" title="Notificación enviada" />;
  if (status === 'error')   return <XCircle className="w-4 h-4 text-red-400" title="Error al enviar" />;
  return (
    <button onClick={onClick} title="Enviar notificación" className="opacity-40 hover:opacity-100 transition-opacity">
      <Mail className="w-4 h-4 text-arch-text-muted hover:text-arch-brand-sky" />
    </button>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const ArchitecturalProgram = () => {
  const { projects, updateProject } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);
  const { statusMap, sendNotification } = useEmailNotification();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [rows, setRows] = useState<ProgramRow[]>(buildDefaultRows());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [filterZone, setFilterZone] = useState<string>('Todas');
  const [pendingToast, setPendingToast] = useState<ToastPayload | null>(null);

  // Load saved rows when project changes
  useEffect(() => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (project?.architectural_program_rows) {
      setRows(project.architectural_program_rows);
    } else {
      setRows(buildDefaultRows());
    }
  }, [selectedProjectId, projects]);

  // Computed
  const totalM2  = rows.reduce((acc, r) => acc + r.totalM2, 0);
  const avgProgress = rows.length > 0
    ? Math.round(rows.reduce((acc, r) => acc + r.progress, 0) / rows.length) : 0;
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectLabel = selectedProject
    ? `[${selectedProject.id}] ${selectedProject.address || selectedProject.projectName || 'Sin nombre'}`
    : '—';
  const isAdmin = user?.role === 'ADMIN';

  // ─── Row operations ─────────────────────────────────────────────────────────
  const updateRow = useCallback(<K extends keyof ProgramRow>(
    id: string, key: K, value: ProgramRow[K]
  ) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [key]: value };
      if (key === 'quantity' || key === 'm2Unit') {
        updated.totalM2 = updated.quantity * updated.m2Unit;
      }
      return updated;
    }));
  }, []);

  // Handle assignment change → trigger toast if a user was selected
  const handleAssignChange = useCallback((rowId: string, newUserId: string) => {
    updateRow(rowId, 'assignedUserId', newUserId);

    if (!newUserId) return;
    const assignedUser = USERS.find(u => u.id === newUserId);
    if (!assignedUser) return;

    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    setPendingToast({
      rowId,
      memberName:   assignedUser.name,
      memberEmail:  assignedUser.email,
      spaceName:    row.space || 'Espacio sin nombre',
      m2:           row.totalM2,
      projectLabel,
      progress:     row.progress,
    });
  }, [rows, projectLabel, updateRow]);

  const handleToastConfirm = async () => {
    if (!pendingToast) return;
    // Save first
    await _saveRows();
    // Send email
    const payload: NotificationPayload = {
      recipientName:  pendingToast.memberName,
      recipientEmail: pendingToast.memberEmail,
      spaceName:      pendingToast.spaceName,
      m2:             pendingToast.m2,
      projectLabel:   pendingToast.projectLabel,
      progressPct:    pendingToast.progress,
    };
    await sendNotification(pendingToast.rowId, payload);
    setPendingToast(null);
  };

  const handleManualEnvelope = async (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row || !row.assignedUserId) return;
    const user = USERS.find(u => u.id === row.assignedUserId);
    if (!user) return;
    const payload: NotificationPayload = {
      recipientName:  user.name,
      recipientEmail: user.email,
      spaceName:      row.space || 'Espacio sin nombre',
      m2:             row.totalM2,
      projectLabel,
      progressPct:    row.progress,
    };
    await sendNotification(rowId, payload);
  };

  const addRow = (zone: string) => setRows(prev => [...prev, {
    id: generateId(), zone, space: '',
    quantity: 1, m2Unit: 20, totalM2: 20,
    assignedUserId: '', progress: 0, notes: '',
  }]);
  const deleteRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));

  // ─── Firebase save ───────────────────────────────────────────────────────────
  const _saveRows = async () => {
    if (!selectedProjectId || !selectedProject) return;
    setIsSaving(true);
    try {
      const progressMap: Record<string, number> = {};
      rows.forEach(r => { if (r.assignedUserId) progressMap[r.id] = r.progress; });
      await updateProject({
        ...selectedProject,
        architectural_program_rows: rows,
        progress: avgProgress,
        progressMap: { ...selectedProject.progressMap, ...progressMap },
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Grouped display ─────────────────────────────────────────────────────────
  const allZones     = Array.from(new Set(rows.map(r => r.zone)));
  const visibleZones = filterZone === 'Todas' ? allZones : [filterZone];

  return (
    <div className="h-full flex flex-col bg-[#F0F2F5] overflow-hidden font-sans">

      {/* ── Header ── */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 px-10 py-7 flex flex-wrap items-center justify-between gap-6 shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-arch-text">
            Programa Arquitectónico<span className="text-arch-brand-sage">.</span>
          </h1>
          <p className="text-arch-text-muted text-[11px] uppercase tracking-widest font-semibold mt-1">
            Control de zonas · m² · recursos humanos · notificaciones automáticas
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Project selector */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted">Expediente Activo</span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="bg-white/80 backdrop-blur border border-arch-border/60 px-4 py-2.5 text-xs font-bold tracking-wider text-arch-text outline-none rounded-lg min-w-[220px] hover:border-arch-brand-sage transition-colors"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.id}] {p.address || p.projectName || 'Sin nombre'}
                </option>
              ))}
            </select>
          </div>

          {/* Zone filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted">Filtrar Zona</span>
            <select
              value={filterZone}
              onChange={e => setFilterZone(e.target.value)}
              className="bg-white/80 backdrop-blur border border-arch-border/60 px-4 py-2.5 text-xs font-bold tracking-wider text-arch-text outline-none rounded-lg hover:border-arch-brand-sky transition-colors"
            >
              <option value="Todas">Todas las Zonas</option>
              {allZones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          {/* Save */}
          {isAdmin && (
            <button
              onClick={_saveRows}
              disabled={isSaving}
              className={`mt-auto px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-md rounded-lg ${
                saveStatus === 'saved' ? 'bg-arch-brand-sage text-arch-text' :
                saveStatus === 'error' ? 'bg-red-500 text-white' :
                'bg-arch-text hover:bg-arch-brand-sky hover:text-arch-text text-white'
              }`}
            >
              {isSaving ? 'Guardando...' : saveStatus === 'saved' ? '✓ Guardado' : saveStatus === 'error' ? '✗ Error' : 'Consolidar'}
            </button>
          )}
        </div>
      </header>

      {/* ── KPI Strip ── */}
      <div className="flex gap-4 px-10 py-4 flex-shrink-0 flex-wrap">
        {[
          { label: 'Total M²',        value: `${totalM2.toLocaleString()} m²`,  color: 'bg-arch-brand-sage/20 text-arch-brand-sage' },
          { label: 'Avance Global',   value: `${avgProgress}%`,                 color: 'bg-arch-brand-sky/20 text-arch-brand-sky' },
          { label: 'Espacios',        value: rows.length,                        color: 'bg-purple-100 text-purple-600' },
          { label: 'Personal asignado', value: new Set(rows.filter(r => r.assignedUserId).map(r => r.assignedUserId)).size,
            color: 'bg-amber-100 text-amber-600' },
          { label: 'Notif. enviadas', value: Object.values(statusMap).filter(s => s === 'sent').length,
            color: 'bg-emerald-100 text-emerald-600' },
        ].map(kpi => (
          <div key={kpi.label} className={`${kpi.color} rounded-xl px-6 py-3 flex items-center gap-3`}>
            <span className="text-[9px] uppercase tracking-widest font-black opacity-70">{kpi.label}</span>
            <span className="text-xl font-black">{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* ── EmailJS Setup Banner (only shown when not configured) ── */}
      {(import.meta.env.VITE_EMAILJS_SERVICE_ID === undefined) && (
        <div className="mx-10 mb-2 px-6 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] text-amber-700 font-semibold">
            <strong>Modo Demo:</strong> EmailJS no configurado. Las notificaciones se simularán en consola. 
            Añade <code className="font-mono bg-amber-100 px-1 rounded">VITE_EMAILJS_SERVICE_ID</code>, 
            <code className="font-mono bg-amber-100 px-1 rounded">VITE_EMAILJS_TEMPLATE_ID</code> y 
            <code className="font-mono bg-amber-100 px-1 rounded">VITE_EMAILJS_PUBLIC_KEY</code> en tu <code>.env</code> para activarlas.
          </p>
        </div>
      )}

      {/* ── Table Area ── */}
      <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8">
        {visibleZones.map(zone => {
          const zoneRows = rows.filter(r => r.zone === zone);
          const zoneM2   = zoneRows.reduce((a, r) => a + r.totalM2, 0);

          return (
            <div key={zone} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">

              {/* Zone Header */}
              <div className="flex items-center justify-between px-8 py-4 border-b border-arch-border/30 bg-white/50">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-arch-brand-sage rounded-full" />
                  <div>
                    <h2 className="font-black text-arch-text tracking-tight">{zone}</h2>
                    <span className="text-[10px] text-arch-text-muted font-bold uppercase tracking-widest">
                      {zoneRows.length} espacios · {zoneM2.toLocaleString()} m² total
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => addRow(zone)}
                    className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-arch-brand-sage/10 hover:bg-arch-brand-sage/30 text-arch-text border border-arch-brand-sage/30 rounded-lg transition-all"
                  >
                    + Añadir Espacio
                  </button>
                )}
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_2fr_1.2fr_0.7fr] gap-2 px-8 py-2.5 text-[9px] font-black uppercase tracking-widest text-arch-text-muted bg-arch-border/5">
                <span>Espacio / Plano</span>
                <span className="text-center">Cant.</span>
                <span className="text-center">m²/Ud</span>
                <span className="text-center">Total m²</span>
                <span>Responsable</span>
                <span className="text-center">Avance %</span>
                <span className="text-center">Notif.</span>
              </div>

              {/* Rows */}
              {zoneRows.map(row => {
                const assignedUser = USERS.find(u => u.id === row.assignedUserId);
                const emailStatus  = statusMap[row.id] || 'idle';

                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_2fr_1.2fr_0.7fr] gap-2 px-8 py-3 border-t border-arch-border/20 hover:bg-white/60 transition-colors items-center group"
                  >
                    {/* Space name */}
                    <input
                      value={row.space}
                      onChange={e => updateRow(row.id, 'space', e.target.value)}
                      disabled={!isAdmin}
                      placeholder="Nombre del espacio..."
                      className="bg-transparent border-b border-transparent hover:border-arch-border focus:border-arch-brand-sage outline-none text-sm font-medium text-arch-text placeholder:text-arch-text-muted/40 transition-colors w-full"
                    />

                    {/* Qty */}
                    <input type="number" min={1} value={row.quantity}
                      onChange={e => updateRow(row.id, 'quantity', Number(e.target.value))}
                      disabled={!isAdmin}
                      className="bg-transparent text-center text-sm font-black text-arch-text border-b border-transparent hover:border-arch-border focus:border-arch-brand-sage outline-none w-full transition-colors"
                    />

                    {/* m²/unit */}
                    <input type="number" min={1} value={row.m2Unit}
                      onChange={e => updateRow(row.id, 'm2Unit', Number(e.target.value))}
                      disabled={!isAdmin}
                      className="bg-transparent text-center text-sm font-black text-arch-text border-b border-transparent hover:border-arch-border focus:border-arch-brand-sage outline-none w-full transition-colors"
                    />

                    {/* Total m² */}
                    <span className="text-center text-sm font-black text-arch-brand-sage">
                      {row.totalM2.toLocaleString()}
                    </span>

                    {/* Assigned member */}
                    <div className="flex items-center gap-2">
                      {assignedUser && (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: assignedUser.color }}
                          title={assignedUser.name}
                        >
                          {assignedUser.initials}
                        </div>
                      )}
                      <select
                        value={row.assignedUserId}
                        onChange={e => handleAssignChange(row.id, e.target.value)}
                        disabled={!isAdmin}
                        className="bg-white/90 backdrop-blur border border-arch-border/50 rounded-lg px-2 py-1 text-xs font-bold text-arch-text outline-none flex-1 hover:border-arch-brand-sage transition-colors min-w-0"
                      >
                        <option value="">— Sin Asignar —</option>
                        {USERS.filter(u => !u.email.includes('admin@') && !u.email.includes('colab@')).map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col items-center gap-1 px-2">
                      <span className="text-[9px] font-black text-arch-text-muted">{row.progress}%</span>
                      <input
                        type="range" min={0} max={100} step={5} value={row.progress}
                        onChange={e => updateRow(row.id, 'progress', Number(e.target.value))}
                        disabled={!isAdmin}
                        className="w-full h-1.5 accent-arch-brand-sage cursor-pointer"
                      />
                    </div>

                    {/* Notification icon */}
                    <div className="flex items-center justify-center gap-2">
                      {row.assignedUserId && (
                        <EnvelopeStatus
                          rowId={row.id}
                          status={emailStatus}
                          onClick={() => handleManualEnvelope(row.id)}
                        />
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 text-sm transition-all ml-1"
                          title="Eliminar fila"
                        >✕</button>
                      )}
                    </div>
                  </div>
                );
              })}

              {zoneRows.length === 0 && (
                <div className="px-8 py-6 text-[11px] text-arch-text-muted italic">
                  Esta zona no tiene espacios aún.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Confirmation Toast ── */}
      {pendingToast && (
        <AssignmentToast
          payload={pendingToast}
          onConfirm={handleToastConfirm}
          onDismiss={() => setPendingToast(null)}
          isSending={statusMap[pendingToast.rowId] === 'sending'}
        />
      )}
    </div>
  );
};

export default ArchitecturalProgram;
