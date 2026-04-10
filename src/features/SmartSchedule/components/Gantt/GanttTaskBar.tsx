import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BAR_TYPES, STATUS_CFG } from '../../constants';
import { TaskStatus } from '../../../../types/dashboard';

interface GanttTaskBarProps {
  taskId: string;
  type: 'critical' | 'refinement' | 'review' | 'milestone';
  weeks: boolean[];
  status: TaskStatus;
  colWidth: number;
  assigneeInitials?: string;
  startDateLabel?: string;
  timeScale?: 'weeks' | 'days';
  lastDateLabel?: string;
  onContextMenu?: (e: React.MouseEvent) => void;
  onResizeLeft?: (e: React.MouseEvent) => void;
  onResizeRight?: (e: React.MouseEvent) => void;
}

export const GanttTaskBar: React.FC<GanttTaskBarProps> = ({
  taskId,
  type,
  weeks,
  status,
  colWidth,
  assigneeInitials,
  startDateLabel,
  timeScale = 'weeks',
  lastDateLabel,
  onContextMenu,
  onResizeLeft,
  onResizeRight
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const barRef = useRef<HTMLDivElement>(null);

  const firstWi = weeks.indexOf(true);
  const lastWi = weeks.lastIndexOf(true);
  
  if (firstWi === -1) return null;

  const duration = lastWi - firstWi + 1;
  const cfg = BAR_TYPES[type] || BAR_TYPES.refinement;
  const statusInfo = STATUS_CFG[status];

  const handleMouseEnter = () => {
    if (barRef.current) {
        const rect = barRef.current.getBoundingClientRect();
        setCoords({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 12
        });
        setShowTooltip(true);
    }
  };

  const isMilestone = type === 'milestone';

  return (
    <div 
      className="absolute h-full flex items-center group/bar z-10"
      style={{ 
        left: firstWi * colWidth,
        width: isMilestone ? colWidth : (duration * colWidth),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
      onContextMenu={onContextMenu}
    >
      <motion.div 
        ref={barRef}
        layoutId={`bar-${taskId}`}
        className={`relative ${isMilestone ? 'w-6 h-6 rotate-45 mx-auto' : 'h-10 w-full rounded-2xl'} shadow-xl border border-white/20 flex items-center justify-center transition-all group-hover/bar:scale-[1.05] group-hover/bar:brightness-110 active:scale-95 cursor-grab active:cursor-grabbing overflow-hidden`}
        style={{ 
          backgroundColor: cfg.color,
        }}
      >
        {/* Resize Handles */}
        {!isMilestone && duration > 0 && onResizeLeft && (
            <div 
                className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/40 active:bg-white/60 z-20 transition-colors"
                onMouseDown={onResizeLeft}
            />
        )}
        
        {!isMilestone && duration > 0 && onResizeRight && (
            <div 
                className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/40 active:bg-white/60 z-20 transition-colors"
                onMouseDown={onResizeRight}
            />
        )}
        {!isMilestone && (
            <div 
                className="absolute left-0 top-0 bottom-0 w-1.5 opacity-80"
                style={{ 
                    backgroundColor: statusInfo?.color || '#94A3B8', 
                    boxShadow: `0 0 15px ${statusInfo?.color || '#94A3B8'}` 
                }}
            />
        )}
        
        {isMilestone ? (
            <div className="-rotate-45 text-[8px] font-black text-white/90">!</div>
        ) : (
            <>
                <div className="flex-none flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 mx-4 shadow-sm">
                    <span className="text-[7px] font-black text-white/90 uppercase tracking-tighter tabular-nums whitespace-nowrap">
                        {startDateLabel || `S${firstWi + 1}`}
                    </span>
                </div>

                <div className="flex-1 flex justify-center">
                    <div className="w-6 h-6 rounded-lg bg-white/20 border border-white/20 text-white text-[10px] font-black flex items-center justify-center shadow-inner">
                        {assigneeInitials || '??'}
                    </div>
                </div>

                {duration > 1 && (
                    <div className="flex-none flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 mr-4">
                        <span className="text-[7px] font-black text-white/80 uppercase tracking-tighter tabular-nums whitespace-nowrap">
                            {lastDateLabel || (timeScale === 'weeks' ? `S${lastWi + 1}` : (lastWi + 1).toString().padStart(2, '0'))}
                        </span>
                    </div>
                )}
            </>
        )}

        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </motion.div>

      {showTooltip && createPortal(
          <div 
            style={{ 
                position: 'fixed',
                top: coords.y,
                left: coords.x,
                transform: 'translateX(-50%)',
                zIndex: 9999,
            }}
            className="pointer-events-none animate-in fade-in zoom-in duration-200"
          >
              <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl border border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-w-[180px]">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{cfg.label}</span>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusInfo?.color }} />
                  </div>
                  <div className="space-y-2">
                      <TooltipItem label="Rango" value={`${startDateLabel} → ${lastDateLabel}`} />
                      <TooltipItem label="Duración" value={`${duration} ${timeScale === 'weeks' ? (duration === 1 ? 'Semana' : 'Semanas') : (duration === 1 ? 'Día' : 'Días')}`} />
                      <TooltipItem label="Estado" value={statusInfo?.label} color={statusInfo?.color} />
                  </div>
              </div>
              <div className="w-3 h-3 bg-slate-900 rotate-45 absolute -top-1.5 left-1/2 -translate-x-1/2 border-l border-t border-slate-700" />
          </div>,
          document.body
      )}
    </div>
  );
};

const TooltipItem = ({ label, value, color }: { label: string, value: string, color?: string }) => (
    <div className="flex justify-between items-center gap-4">
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-black text-slate-200" style={{ color: color }}>{value}</span>
    </div>
);
