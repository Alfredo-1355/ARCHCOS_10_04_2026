import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  PieChart, 
  DollarSign,
  ChevronDown,
  Building2,
  HardHat,
  Wrench,
  PaintBucket,
  FileSignature
} from 'lucide-react';

interface BudgetManagerViewProps {
  onClose: () => void;
  project: any;
  targetBudget: number; // Midpoint of parametric
}

const CATEGORY_ICONS: any = {
  soft_costs: FileSignature,
  foundation: HardHat,
  structure: Building2,
  mep: Wrench,
  finishes: PaintBucket
};

const DEFAULT_DISTRIBUTION = [
  { id: 'soft_costs', name: 'Honorarios y Soft Costs', percentage: 10, items: [{ name: 'Permisos de Ciudad', cost: 0 }, { name: 'Arquitectura e Ings', cost: 0 }] },
  { id: 'foundation', name: 'Terracería y Cimentación', percentage: 15, items: [{ name: 'Excavación', cost: 0 }, { name: 'Losa de Fundación', cost: 0 }] },
  { id: 'structure', name: 'Estructura (Core & Shell)', percentage: 25, items: [{ name: 'Acero / Concreto', cost: 0 }, { name: 'Muros Perimetrales', cost: 0 }, { name: 'Cubiertas', cost: 0 }] },
  { id: 'mep', name: 'Sistemas MEP', percentage: 20, items: [{ name: 'Instalación Eléctrica', cost: 0 }, { name: 'HVAC (Clima)', cost: 0 }, { name: 'Plomería', cost: 0 }] },
  { id: 'finishes', name: 'Acabados Interiores', percentage: 30, items: [{ name: 'Pisos y Pintura', cost: 0 }, { name: 'Carpintería (Millwork)', cost: 0 }, { name: 'Baños y Cocina', cost: 0 }] },
];

const BudgetManagerView: React.FC<BudgetManagerViewProps> = ({ onClose, project, targetBudget }) => {
  // Pre-fill budget based on distribution %
  const [categories, setCategories] = useState(() => {
    return DEFAULT_DISTRIBUTION.map(cat => {
      const categoryTotal = targetBudget * (cat.percentage / 100);
      const itemsCount = cat.items.length;
      return {
        ...cat,
        cost: categoryTotal,
        items: cat.items.map(item => ({ ...item, cost: categoryTotal / itemsCount }))
      };
    });
  });

  const [expandedCats, setExpandedCats] = useState<string[]>(['structure', 'finishes']);

  const toggleCat = (id: string) => {
     setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const currentTotal = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.reduce((s, item) => s + item.cost, 0), 0);
  }, [categories]);

  const updateItemCost = (catId: string, itemIdx: number, newCostStr: string) => {
     const newCost = parseFloat(newCostStr.replace(/[^0-9.]/g, '')) || 0;
     setCategories(prev => prev.map(cat => {
        if (cat.id !== catId) return cat;
        const newItems = [...cat.items];
        newItems[itemIdx] = { ...newItems[itemIdx], cost: newCost };
        const newTotal = newItems.reduce((s, item) => s + item.cost, 0);
        return { ...cat, items: newItems, cost: newTotal };
     }));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const colors = ['#A8DADC', '#457B9D', '#1D3557', '#E63946', '#D4E6A5'];

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute inset-0 z-[100] bg-arch-neutral flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="bg-white border-b border-arch-border px-8 py-5 flex items-center justify-between shadow-soft shrink-0">
        <div className="flex items-center gap-6">
           <button onClick={onClose} className="p-3 bg-arch-gray hover:bg-arch-border transition-colors rounded-full text-arch-ink"><ArrowLeft size={20}/></button>
           <div>
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-1">Presupuesto Paramétrico</span>
              <h2 className="text-2xl font-black">{project.name || 'Proyecto Actual'}</h2>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-3 px-6 py-3 bg-white border border-arch-border hover:bg-arch-gray transition-colors rounded-full font-bold text-sm">
             <Download size={16} /> Exportar Excel
           </button>
           <button onClick={onClose} className="flex items-center gap-3 px-6 py-3 bg-brand-green text-white hover:bg-[#c2d790] transition-colors rounded-full font-bold text-sm shadow-md">
             <Save size={16} /> Guardar Presupuesto
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-10 flex gap-10 flex-col lg:flex-row">
         
         {/* Left: Interactive Breakdown Table (CSI Accordion) */}
         <div className="flex-1 space-y-6 max-w-4xl">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Desglose por Fase Constructiva (CSI)</h3>
            
            <div className="space-y-4">
               {categories.map((cat, i) => {
                 const Icon = CATEGORY_ICONS[cat.id] || Building2;
                 const isExpanded = expandedCats.includes(cat.id);
                 const catPercent = (cat.cost / currentTotal) * 100 || 0;
                 return (
                   <div key={cat.id} className="bg-white rounded-[1.5rem] shadow-elegant overflow-hidden border border-arch-border">
                      {/* Accordion Header */}
                      <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-arch-gray/30 transition-colors" onClick={() => toggleCat(cat.id)}>
                         <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full text-white" style={{ backgroundColor: colors[i] }}><Icon size={18} /></div>
                            <div>
                               <h4 className="font-bold text-lg">{cat.name}</h4>
                               <span className="text-[10px] uppercase font-black tracking-widest text-arch-ink/40">Fase {i + 1}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="text-right">
                               <span className="block text-xl font-black relative group" style={{ color: colors[i] }}>
                                  {formatCurrency(cat.cost)}
                                  <div className="w-full h-1 bg-arch-gray mt-1 rounded-full overflow-hidden">
                                    <div className="h-full transition-all duration-300" style={{ width: `${catPercent}%`, backgroundColor: colors[i] }} />
                                  </div>
                               </span>
                               <span className="text-[10px] font-bold text-arch-ink/40 uppercase">{catPercent.toFixed(1)}% del Total</span>
                            </div>
                            <div className={`p-2 rounded-full border border-arch-ink/10 transition-transform ${isExpanded ? 'rotate-180 bg-arch-gray' : ''}`}>
                               <ChevronDown size={18} className="text-arch-ink/40" />
                            </div>
                         </div>
                      </div>

                      {/* Accordion Body */}
                      <AnimatePresence>
                         {isExpanded && (
                           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-arch-ink/5 bg-arch-neutral/30">
                              <div className="p-6 space-y-3">
                                 {cat.items.map((item, j) => (
                                    <div key={j} className="flex justify-between items-center bg-white p-4 rounded-xl border border-arch-border shadow-sm">
                                       <span className="font-bold text-sm text-arch-ink/80">{item.name}</span>
                                       <div className="flex items-center gap-2">
                                          <DollarSign size={14} className="text-arch-ink/40" />
                                          <input 
                                            type="text" 
                                            className="w-32 bg-arch-gray/50 border border-arch-ink/10 rounded-lg px-3 py-2 font-black text-right focus:outline-none focus:border-brand-blue focus:bg-white transition-colors"
                                            value={formatCurrency(item.cost).replace('$', '')}
                                            onChange={(e) => updateItemCost(cat.id, j, e.target.value)}
                                          />
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                 );
               })}
            </div>
         </div>

         {/* Right: Data Visualization Sticky Panel */}
         <div className="w-full lg:w-[380px] shrink-0">
            <div className="sticky top-10 bg-arch-ink rounded-[2rem] p-8 shadow-elegant text-white overflow-hidden group">
               {/* Decorative background blur */}
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-blue/20 rounded-full blur-[80px]" />
               <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-green/20 rounded-full blur-[80px]" />
               
               <h3 className="text-lg font-black tracking-tight uppercase mb-8 relative z-10 flex items-center gap-3">
                  <PieChart size={20} className="text-brand-green" /> Analytics de Costos
               </h3>

               {/* Doughnut Chart representation via SVG */}
               <div className="w-full aspect-square relative z-10 mb-8 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-[200px] h-[200px] -rotate-90 filter drop-shadow-2xl">
                    <circle cx="100" cy="100" r="80" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="30" />
                    {categories.map((cat, i) => {
                       const prevTotal = categories.slice(0, i).reduce((sum, c) => sum + c.cost, 0);
                       const circumference = 2 * Math.PI * 80;
                       const percentage = currentTotal > 0 ? (cat.cost / currentTotal) : 0;
                       const prevPercentage = currentTotal > 0 ? (prevTotal / currentTotal) : 0;
                       const dashArray = `${percentage * circumference || 0} ${circumference}`;
                       const dashOffset = -(prevPercentage * circumference);
                       return (
                         <motion.circle 
                           key={cat.id}
                           cx="100" cy="100" r="80" 
                           fill="transparent" 
                           stroke={colors[i]} 
                           strokeWidth="30" 
                           strokeDasharray={dashArray} 
                           strokeDashoffset={dashOffset}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1, strokeDasharray: dashArray, strokeDashoffset: dashOffset }}
                           transition={{ duration: 1 }}
                         />
                       );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                     <span className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">Costo Total</span>
                     <span className="text-2xl font-black">{formatCurrency(currentTotal)}</span>
                  </div>
               </div>

               {/* Variance vs Parametric */}
               <div className="relative z-10 space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Target Budget</span>
                        <span className="text-xs font-bold text-white/80">{formatCurrency(targetBudget)}</span>
                     </div>
                     <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${currentTotal > targetBudget ? 'bg-red-400' : 'bg-brand-green'}`} style={{ width: `${Math.min(100, (currentTotal / targetBudget) * 100)}%` }} />
                     </div>
                     {currentTotal > targetBudget && (
                        <p className="text-[9px] font-black text-red-400 mt-2 uppercase tracking-widest">+ {formatCurrency(currentTotal - targetBudget)} Over Budget</p>
                     )}
                  </div>
               </div>

            </div>
         </div>

      </div>
    </motion.div>
  );
};

export default BudgetManagerView;
