import React, { useRef, useEffect, useState } from 'react';
import { useGanttStore, isWeekend } from '../../store/useGanttStore';
import { GanttTaskNode } from './GanttTaskNode';
import { GanttConnectionLayer } from './GanttConnectionLayer';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  initialTotalCols?: number;
}

export const GanttCanvas: React.FC<Props> = ({ initialTotalCols = 100 }) => {
  const { 
    tasks, 
    colWidth, 
    rowHeight, 
    ghostLink, 
    setGhostLink, 
    addLink,
    clearSelection,
    isGenerating,
    timeScale
  } = useGanttStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);

  const displayCols = timeScale === 'weeks' ? 24 : 120;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ghostLink && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left + containerRef.current.scrollLeft;
        const relativeY = e.clientY - rect.top + containerRef.current.scrollTop;
        setGhostLink(ghostLink.sourceId, relativeX, relativeY);
      }
    };
    const handleMouseUp = () => { if (ghostLink) setGhostLink(null); };

    if (ghostLink) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [ghostLink, setGhostLink]);

  const getDayLabel = (col: number) => {
    if (timeScale === 'weeks') return `S${col + 1}`;
    const baseDate = new Date(2026, 3, 6); 
    const current = new Date(baseDate);
    current.setDate(baseDate.getDate() + col);
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return `${days[current.getDay()]} ${current.getDate()}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-auto bg-transparent custom-scrollbar selection:bg-transparent"
      onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}
      onClick={() => clearSelection()}
    >
      <div 
        className="relative"
        style={{ 
          width: displayCols * (timeScale === 'weeks' ? colWidth * 7 : colWidth), 
          height: Math.max(800, (tasks.length + 5) * rowHeight) 
        }}
      >
        {/* Background Grid Layer (Ultra Subtle) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: `${timeScale === 'weeks' ? colWidth * 7 : colWidth}px ${rowHeight}px`
          }}
        />

        {/* Weekend Highlight (Soft Glass) */}
        {timeScale === 'days' && (
          <div className="absolute inset-0 pointer-events-none flex">
            {Array.from({ length: displayCols }).map((_, i) => (
              <div 
                key={i}
                style={{ width: colWidth }}
                className={`${isWeekend(i) ? 'bg-slate-500/5' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Header (Glass) */}
        <div className="absolute top-0 left-0 flex backdrop-blur-md bg-white/40 border-b border-white/60 z-20 sticky top-0 transition-all">
          {Array.from({ length: displayCols }).map((_, i) => {
             const isWknd = timeScale === 'days' && isWeekend(i);
             return (
               <div 
                key={i} 
                className={`flex items-center justify-center text-[10px] font-black tracking-tighter border-r border-white/40 shrink-0 transition-colors
                  ${isWknd ? 'text-slate-400 opacity-50' : 'text-slate-600'}`}
                style={{ 
                  width: timeScale === 'weeks' ? colWidth * 7 : colWidth, 
                  height: 48
                }}
               >
                 {getDayLabel(i)}
               </div>
             );
          })}
        </div>

        {/* Loading Overlay (Glassmorphism) */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/40 backdrop-blur-xl z-50 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-sm font-black text-emerald-600 uppercase tracking-[0.3em] animate-pulse">Optimizando Arquetipo...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG Connection Layer */}
        {!isGenerating && <GanttConnectionLayer />}

        {/* Task Nodes Layer */}
        <div className="relative pt-[48px]">
          {tasks.map((task, index) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={(e) => e.stopPropagation()}
              onMouseUp={(e) => {
                if (ghostLink && ghostLink.sourceId !== task.id) {
                  e.stopPropagation();
                  addLink(ghostLink.sourceId, task.id);
                  setGhostLink(null);
                }
              }}
            >
              <GanttTaskNode task={task} rowIndex={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
