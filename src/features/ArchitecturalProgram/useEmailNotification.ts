// src/features/ArchitecturalProgram/useEmailNotification.ts
// Direct mailto: trigger with drawing-specific ARCHCOS Quality Checklists.

import { useState, useCallback } from 'react';
import { renderChecklistText } from './archcosChecklists';

export interface NotificationPayload {
  recipientName:  string;
  recipientEmail: string;
  spaceName:      string;    // Drawing / space name
  m2:             number;
  projectLabel:   string;    // e.g. "[PRJ-1002] Boutique M."
  progressPct:    number;
}

export type NotificationStatus = 'idle' | 'sending' | 'sent' | 'error';

// ─── Build the mailto URL with the drawing-specific ARCHCOS checklist ──────────
function buildMailtoUrl(payload: NotificationPayload): string {
  const NL  = '%0D%0A';
  const TAB = '%20%20';

  const idMatch = payload.projectLabel.match(/\[([^\]]+)\]/);
  const projId   = idMatch ? idMatch[1] : 'ID';
  const projAddr = payload.projectLabel.replace(/\[[^\]]+\]\s*/, '').trim();

  const subject = encodeURIComponent(
    `\uD83C\uDFD7\uFE0F ASIGNACI\u00D3N ARCHCOS: ${projId} - ${payload.spaceName}`
  );

  // Drawing-specific checklist (auto-matched by drawing name)
  const checklistBlock = renderChecklistText(payload.spaceName, NL, TAB);

  const body = [
    `Hola ${encodeURIComponent(payload.recipientName)},`,
    `Se te ha asignado la elaboraci${encodeURIComponent('ó')}n del plano ${encodeURIComponent(payload.spaceName)} para el proyecto ${encodeURIComponent(projId)} - ${encodeURIComponent(projAddr)}.`,
    `Avance requerido: ${payload.progressPct}%`,
    ``,
    checklistBlock,
    `${encodeURIComponent('────────────────────────────────────────────')}`,
    `Comentarios adicionales: ___________________`,
    ``,
    `Favor de confirmar de recibido y procesar seg${encodeURIComponent('ú')}n este est${encodeURIComponent('á')}ndar.`,
    ``,
    `${encodeURIComponent('— Equipo ARCHCOS Studio Group')}`,
  ].join(NL);

  return `mailto:${payload.recipientEmail}?subject=${subject}&body=${body}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useEmailNotification = () => {
  const [statusMap, setStatusMap] = useState<Record<string, NotificationStatus>>({});

  const setStatus = (rowId: string, status: NotificationStatus) =>
    setStatusMap(prev => ({ ...prev, [rowId]: status }));

  const sendNotification = useCallback(
    async (rowId: string, payload: NotificationPayload): Promise<boolean> => {
      setStatus(rowId, 'sending');
      try {
        const url = buildMailtoUrl(payload);
        window.open(url, '_blank');
        await new Promise(r => setTimeout(r, 600));
        setStatus(rowId, 'sent');
        return true;
      } catch (err) {
        console.error('[Mailto] Error:', err);
        setStatus(rowId, 'error');
        return false;
      }
    },
    []
  );

  const resetStatus = useCallback((rowId: string) => {
    setStatus(rowId, 'idle');
  }, []);

  return { statusMap, sendNotification, resetStatus };
};
