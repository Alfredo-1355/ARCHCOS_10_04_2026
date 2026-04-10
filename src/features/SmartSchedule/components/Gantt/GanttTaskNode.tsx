import React from 'react';
import { GanttTask, useGanttStore } from '../../store/useGanttStore';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, GripVertical, User, CheckCircle2 } from 'lucide-react';

interface Props {
  task: GanttTask;
  rowIndex: number;
}

export const GanttTaskNode: React.FC<Props> = ({ task, rowIndex }) => {
  const { 
    colWidth, 
    rowHeight, 
    setGhostLink, 
    toggleTaskSelection, 
    selectedTaskIds,
    timeScale
  } = useGanttStore();

  const isSelected = selectedTaskIds.has(task.id);
  const unitWidth = timeScale === 'weeks' ? colWidth * 7 : colWidth;
  
  // Calculate position
  const x = task.startCol * unitWidth;
  const y = rowIndex * rowHeight;
  const width = Math.max(unitWidth, task.durationCols * unitWidth);

  // Status Colors (Pastel)
  const getStatusColor = () => {
    if (task.progress === 100) return '#10B981'; // Pastel Green
    if (task.type === 'critical') return '#F87171'; // Pastel Red/Coral
    return '#3B82F6'; // Pastel Blue
  };

  const statusColor = getStatusColor();

  return (
    <div 
      className="absolute group transition-all duration-300"
      style={{ 
        left: x, 
        top: y + (rowHeight * 0.15), 
        width: width, 
        height: rowHeight * 0.7 
      }}
    >
      {/* Selection Glow */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-[-4px] rounded-2xl border-2 border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)] z-0"
          />
        )}
      </AnimatePresence>

      {/* Main Glass Capsule */}
      <div 
        onClick={() => toggleTaskSelection(task.id, false)}
        className="relative w-full h-full backdrop-blur-md bg-white/40 border border-white/60 rounded-xl shadow-sm hover:shadow-md hover:bg-white/60 transition-all cursor-move flex items-center px-3 gap-2 overflow-hidden group-active:scale-[0.98]"
      >
        {/* Progress Background Layer */}
        <div 
          className="absolute inset-0 z-0 transition-all duration-1000 ease-out"
          style={{ 
            width: `${task.progress}%`, 
            backgroundColor: `${statusColor}1A`, // 10% opacity
            borderRight: `2px solid ${statusColor}33`
          }}
        />

        {/* Drag Handle */}
        <div className="z-10 text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing">
          <GripVertical size={14} />
        </div>

        {/* Task Info */}
        <div className="z-10 flex-1 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
             {task.progress === 100 && <CheckCircle2 size={12} className="text-[#10B981] shrink-0" />}
             <span className="text-[11px] font-black tracking-tight text-slate-800 truncate uppercase">
               {task.name}
             </span>
          </div>
          {width > 120 && (
            <div className="flex items-center gap-2 mt-0.5">
               <div className="flex-1 h-1 bg-slate-200/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    className="h-full transition-all duration-1000"
                    style={{ backgroundColor: statusColor }}
                  />
               </div>
               <span className="text-[9px] font-black text-slate-400 tabular-nums">{task.progress}%</span>
            </div>
          )}
        </div>

        {/* Connect Dot */}
        <div 
          onMouseDown={() => setGhostLink(task.id, x + width, y + rowHeight/2)}
          className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair z-20"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white hover:scale-125 hover:bg-emerald-500 transition-all" />
        </div>
      </div>

      {/* Resize Handle (Simplified for visual) */}
      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 group-hover:bg-slate-300/20" />
    </div>
  );
};
