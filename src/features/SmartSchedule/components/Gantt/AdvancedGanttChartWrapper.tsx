import React, { useEffect } from 'react';
import { GanttCanvas } from './GanttCanvas';
import { useGanttStore, GanttTask, GanttLink } from '../../store/useGanttStore';
import { motion } from 'motion/react';
import { ZoomIn, ZoomOut, Expand, Maximize2, RotateCcw, RotateCw } from 'lucide-react';

interface Props {
  tasks: any[]; 
}

export const AdvancedGanttChartWrapper: React.FC<Props> = ({ tasks }) => {
  const { 
    setTasks, 
    setLinks, 
    zoomLevel, 
    setZoomLevel, 
    zenMode, 
    setZenMode,
    undo,
    redo,
    past,
    future,
    timeScale,
    setTimeScale
  } = useGanttStore();

  useEffect(() => {
    // Transform original ARCHCOS tasks array to new GanttTask format
    const mappedTasks: GanttTask[] = tasks.map((t, index) => {
      let startCol = 0;
      let durationCols = 1;
      
      if (t.weeks && t.weeks.length > 0) {
        startCol = t.weeks.findIndex((w: boolean) => w === true);
        if (startCol === -1) startCol = 0; 
        
        const lastCol = t.weeks.lastIndexOf(true);
        if (lastCol !== -1 && lastCol >= startCol) {
          durationCols = (lastCol - startCol) + 1;
        }
      }

      return {
        id: t.id,
        name: t.name,
        categoryId: 'dummy',
        type: t.type || 'refinement',
        startCol,
        baselineStartCol: t.baselineWeeks 
          ? Math.max(0, t.baselineWeeks.findIndex((w: boolean) => w === true))
          : startCol,
        durationCols,
        progress: t.progress || 0,
        assigneeId: t.assigneeId,
        zeroFloat: t.zeroFloat
      };
    });

    setTasks(mappedTasks);

    if (mappedTasks.length > 2) {
      setLinks([
        { id: 'l1', sourceId: mappedTasks[0].id, targetId: mappedTasks[1].id },
        { id: 'l2', sourceId: mappedTasks[1].id, targetId: mappedTasks[2].id }
      ]);
    }
  }, [tasks, setTasks, setLinks]);

  // Keyboard Shortcuts for Predictive State
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl or Cmd key
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
        }
        if (e.key === 'y' || e.key === 'Y') {
           e.preventDefault();
           redo();
        }
      }
      
      if (e.key === 'Escape' && zenMode) {
        setZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, zenMode, setZenMode]);

  return (
    <motion.div 
      layout
      className={`flex flex-col overflow-hidden bg-white ${
        zenMode 
          ? 'fixed inset-0 z-50 rounded-none' 
          : 'relative w-full h-full rounded-xl border border-slate-200 shadow-inner'
      }`}
    >
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center z-10 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Advanced Gantt Engine</h3>
          <p className="text-[10px] text-slate-500">GPU Accelerated • Predictive State Active</p>
        </div>
        
        <div className="flex items-center gap-3">
          
          {/* Undo / Redo Controls */}
          <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
             <button 
                onClick={() => undo()} 
                disabled={past.length === 0}
                className="p-1.5 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity border-r border-slate-200"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw size={14} className="text-slate-600" />
             </button>
             <button 
                onClick={() => redo()} 
                disabled={future.length === 0}
                className="p-1.5 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                title="Redo (Ctrl+Shift+Z)"
              >
                <RotateCw size={14} className="text-slate-600" />
             </button>
          </div>

          {/* LOD Controls */}
          <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg">
             <button 
               onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1) as 1 | 2 | 3)}
               disabled={zoomLevel === 1}
               className="p-1 rounded text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-40"
             >
               <ZoomOut size={14} />
             </button>
             <span className="text-[10px] font-black w-14 text-center text-slate-600 uppercase">
               LOD {zoomLevel}
             </span>
             <button 
               onClick={() => setZoomLevel(Math.min(3, zoomLevel + 1) as 1 | 2 | 3)}
               disabled={zoomLevel === 3}
               className="p-1 rounded text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-40"
             >
               <ZoomIn size={14} />
             </button>
          </div>

           {/* Resolution Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl h-9 relative items-center">
             <button 
               onClick={() => setTimeScale('weeks')}
               className={`relative z-10 px-4 h-full text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${timeScale === 'weeks' ? 'text-indigo-600' : 'text-slate-400'}`}
             >
               Weeks
             </button>
             <button 
               onClick={() => setTimeScale('days')}
               className={`relative z-10 px-4 h-full text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${timeScale === 'days' ? 'text-indigo-600' : 'text-slate-400'}`}
             >
               Days
             </button>
             {/* Slider Background */}
             <motion.div 
               layoutId="toggle-pill"
               className="absolute bg-white shadow-sm rounded-lg h-7 top-1 bottom-1"
               animate={{ 
                 left: timeScale === 'weeks' ? 4 : 58,
                 width: timeScale === 'weeks' ? 52 : 46
               }}
               transition={{ type: "spring", stiffness: 400, damping: 30 }}
             />
          </div>

          {/* Zen Toggle */}
          <button 
            onClick={() => setZenMode(!zenMode)} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${
              zenMode 
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {zenMode ? <Expand size={12} /> : <Maximize2 size={12} />}
            {zenMode ? 'Exit Zen' : 'Zen Mode'}
          </button>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-[#F8FAFC]">
        <GanttCanvas />
      </div>
    </motion.div>
  );
};
