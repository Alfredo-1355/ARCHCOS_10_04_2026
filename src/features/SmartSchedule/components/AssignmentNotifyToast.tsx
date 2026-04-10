import React from 'react';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

export interface AssignToast {
  catId:       string;
  catName:     string;
  taskId:      string;
  taskName:    string;
  siblingNames:string[];
  memberId:    string;
  memberName:  string;
  memberEmail: string;
  projectLabel:string;
  progress:    number;
}

interface Props {
  toast: AssignToast;
  onConfirm: () => void;
  onDismiss: () => void;
  sending: boolean;
  sent: boolean;
}

export const AssignmentNotifyToast: React.FC<Props> = ({ 
  toast, onConfirm, onDismiss, sending, sent 
}) => (
  <div style={{ position:'fixed', bottom:32, right:32, zIndex:9999, maxWidth:400, width:'calc(100% - 64px)' }}>
    <div className="bg-white border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-8 max-w-[420px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[#D4E6A5]/20 flex items-center justify-center flex-shrink-0 mt-1">
          <Mail className="w-7 h-7 text-[#D4E6A5]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#94A3B8] mb-1.5 font-sans">
            Notificación de Asignación
          </p>
          <p className="text-xl font-black text-slate-800 leading-none mb-2">
            ¿Notificar a <span className="text-[#D4E6A5]">{toast.memberName}</span>?
          </p>
          <div className="space-y-1">
            <p className="text-[13px] text-[#94A3B8] font-bold leading-relaxed">
              Espacio: <span className="text-slate-600">{toast.taskName}</span> · {toast.catName}
            </p>
            <p className="text-[11px] text-[#94A3B8] font-medium leading-none truncate">
              Proyecto: {toast.projectLabel}
            </p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-slate-300 hover:text-slate-600 transition-colors mt-1">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="mt-8">
        {sent ? (
          <div className="flex items-center gap-3 justify-center py-4 text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 size={16} /> Notificación enviada con éxito
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={onConfirm}
              disabled={sending}
              className="flex-2 flex-[1.5] flex items-center justify-center gap-3 bg-[#1B2733] hover:bg-[#D4E6A5] hover:text-[#1B2733] text-white text-[11px] font-black uppercase tracking-[0.25em] py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-slate-200 active:scale-95"
            >
              {sending ? (
                <><Loader2 size={14} className="animate-spin" /> Procesando...</>
              ) : (
                <><Mail size={14} /> Enviar y Guardar</>
              )}
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#94A3B8] hover:text-slate-800 border border-slate-100 rounded-2xl transition-all hover:bg-slate-50 active:scale-95"
            >
              Omitir
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
