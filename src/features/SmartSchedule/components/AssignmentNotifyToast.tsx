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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-5 backdrop-blur-xl">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
          <Mail size={16} className="text-[#1A56DB]" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-0.5">Asignación de Planos</p>
          <p className="text-sm font-bold text-[#0A192F] leading-snug">
            ¿Notificar a <span className="text-[#1A56DB]">{toast.memberName}</span>?
          </p>
          <div className="mt-2 bg-[#F8FAFC] rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8] mb-1.5">{toast.catName}</p>
            {toast.siblingNames.map(n => (
              <p key={n} className="text-[11px] text-[#475569] font-medium leading-snug">• {n}</p>
            ))}
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-1.5 truncate">{toast.projectLabel}</p>
        </div>
        <button onClick={onDismiss} className="text-[#94A3B8] hover:text-[#0A192F] text-xl leading-none mt-0.5">×</button>
      </div>
      {sent ? (
        <div className="flex items-center gap-2 justify-center py-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
          <CheckCircle2 size={14} /> Notificación enviada
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={sending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0A2342] hover:bg-[#1A56DB] text-white text-[10px] font-black uppercase tracking-[0.25em] py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {sending ? <><Loader2 size={12} className="animate-spin" /> Enviando...</> : <><Mail size={12} /> Enviar Notificación</>}
          </button>
          <button onClick={onDismiss} className="px-4 text-[10px] font-black uppercase tracking-widest text-[#94A3B8] hover:text-[#0A192F] border border-[#E2E8F0] rounded-xl transition-colors">
            Omitir
          </button>
        </div>
      )}
    </div>
  </div>
);
