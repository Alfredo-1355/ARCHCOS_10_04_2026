const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const startMarker = '// --- Preview Component ---';
const endMarker = '// --- BEFORE DESIGN ORIGINAL View ---';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found in App.tsx!");
  process.exit(1);
}

const newComponent = `// --- Preview Component ---

function DesignBriefPreview({ program, language, t, onClose }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, onClose: () => void }) {
  
  const getGroupInfo = (spaceName: string) => {
    for (const [zone, groups] of Object.entries(NESTED_SPACES)) {
      for (const group of groups) {
        if (group.parent === spaceName || group.children.includes(spaceName)) {
          return { zone, parentKey: group.parent, isParent: group.parent === spaceName };
        }
      }
    }
    if (MIN_DIMENSIONS[spaceName]?.category === 'EXTERIOR') {
      return { zone: 'EXTERIORES', parentKey: spaceName, isParent: true };
    }
    return { zone: 'OTROS', parentKey: spaceName, isParent: true };
  };

  const areas = useMemo(() => {
    let interiorNet = 0;
    let exteriorNet = 0;
    const breakdown: any[] = [];

    const allSpaces = [...program.groundFloorSpaces, ...program.upperFloorSpaces];
    allSpaces.forEach(space => {
      const dims = program.spaceDimensions[space] || MIN_DIMENSIONS[space];
      const qty = program.spaceQuantities[space] || 1;
      if (dims) {
        const area = dims.l * dims.w * qty;
        const isExterior = MIN_DIMENSIONS[space]?.category === 'EXTERIOR';
        if (isExterior) exteriorNet += area;
        else interiorNet += area;

        const info = getGroupInfo(space);
        breakdown.push({
          name: space,
          qty,
          l: dims.l,
          w: dims.w,
          area,
          macroZone: info.zone,
          parentKey: info.parentKey,
          isParent: info.isParent,
          baseArea: dims.l * dims.w
        });
      }
    });

    const circulation = interiorNet * 0.15;
    const totalGross = interiorNet + circulation;

    return { interiorNet, exteriorNet, circulation, totalGross, breakdown };
  }, [program]);

  const handlePrint = () => {
    window.print();
  };

  const getCeilingValue = () => {
    const mainHeight = program.ceilingHeightMain === 'custom' 
      ? \`\${program.customCeilingHeightMain || '0'} ft\` 
      : t(program.ceilingHeightMain);
    const upperHeight = program.ceilingHeightUpper === 'custom'
      ? \`\${program.customCeilingHeightUpper || '0'} ft\`
      : t(program.ceilingHeightUpper);
      
    if (program.levels > 1) {
      return \`L1: \${mainHeight} | L2: \${upperHeight}\`;
    }
    return mainHeight;
  };

  const themeDarkBlue = '#0E3A56'; 
  const themeBrandBlue = '#1F82C0';
  const themeBrandGreen = '#8CC63F';

  const PhaseNotes = ({ color, title }: { color: string, title?: string }) => (
    <div className="mt-auto pt-6">
      <div className="border-t-2 border-dashed rounded-lg p-4 flex flex-col bg-gray-50/50" style={{borderColor: \`\${color}30\`}}>
         <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{color: \`\${color}80\`}}>
           <PenTool size={12}/> {title || "Notas de Diseño y Ajustes Técnicos"}
         </h3>
         <div className="space-y-4 flex-1">
           <div className="border-b" style={{borderColor: \`\${color}15\`}}></div>
           <div className="border-b" style={{borderColor: \`\${color}15\`}}></div>
         </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#F0F2F5] overflow-y-auto overflow-x-hidden no-scrollbar text-[#333] font-sans print:bg-white print:p-0"
    >
      <style>{\`
        @media print {
          body * { visibility: hidden; }
          #db-container, #db-container * { visibility: visible; }
          #db-container { position: absolute; left: 0; top: 0; margin: 0; padding: 0; width: 100%; box-sizing: border-box; }
          
          @page { size: letter; margin: 0; }
          .print-page { 
             page-break-after: always; 
             box-shadow: none !important; 
             margin: 0 !important; 
             width: 8.5in !important; 
             height: 11in !important; 
             padding: 0.5in !important; 
             box-sizing: border-box;
             overflow: hidden;
             border: none !important;
          }
          .print\\\\:hidden { display: none !important; }
        }
      \`}</style>

      {/* Top Bar for Screen */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b px-8 py-4 flex justify-between items-center print:hidden shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Archcos" className="h-10 object-contain" onError={(e) => {
             e.currentTarget.style.display='none';
          }}/>
          <div className="w-px h-8 bg-gray-200"></div>
          <span className="font-bold tracking-tight text-xl text-gray-800">Design Brief <span className="font-normal text-gray-400">/ Previsualización</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 px-8 py-2.5 text-white rounded-full text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-blue/20" 
            style={{backgroundColor: themeBrandBlue}}
          >
            <Printer size={18} /> IMPRIMIR EXPEDIENTE TÉCNICO
          </button>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-500">
            <X size={24} />
          </button>
        </div>
      </div>

      <div id="db-container" className="flex flex-col items-center gap-12 py-12 print:py-0 print:gap-0 w-full">
        
        {/* ======================================= */}
        {/* PAGE 1: Contexto y Partido Arquitectónico */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] min-h-[11in] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative p-[0.6in] flex flex-col border border-gray-100 ring-1 ring-black/5">
          <header className="border-b-[4px] pb-6 mb-10 flex justify-between items-end" style={{borderColor: themeBrandBlue}}>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                <Box size={32} className="text-brand-blue" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">FASE 1: CONTEXTO Y PARTIDO</h4>
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-gray-900">
                  {program.inhabitants[0]?.occupation || "DISEÑO"} <span style={{color: themeBrandBlue}}>RESIDENCE</span>
                </h1>
              </div>
            </div>
            <div className="text-right text-[10px] uppercase font-bold text-gray-500 space-y-1">
              <p className="flex items-center justify-end gap-2"><MapPin size={10}/> LOCALIZACIÓN: TBD</p>
              <p className="flex items-center justify-end gap-2"><Calendar size={10}/> EXPEDICIÓN: {new Date().toLocaleDateString()}</p>
            </div>
          </header>

          <div className="flex-1 flex flex-col">
            {/* Hero Numbers */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="p-6 rounded-2xl text-center border transition-all hover:border-brand-blue/30" style={{backgroundColor: '#F8FAFC', borderColor: \`\${themeBrandBlue}15\`}}>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Total Gross</span>
                <span className="text-4xl font-black font-mono tracking-tighter" style={{color: themeDarkBlue}}>{(areas.totalGross + areas.exteriorNet).toFixed(0)}</span>
                <span className="text-[10px] font-bold text-gray-400 block mt-1">SQFT TOTAL</span>
              </div>
              <div className="p-6 rounded-2xl text-center border transition-all hover:border-brand-green/30" style={{backgroundColor: '#F9FEF5', borderColor: \`\${themeBrandGreen}15\`}}>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Net Interior</span>
                <span className="text-4xl font-black font-mono tracking-tighter" style={{color: '#2D4A1A'}}>{areas.interiorNet.toFixed(0)}</span>
                <span className="text-[10px] font-bold text-gray-400 block mt-1">SQFT NETO</span>
              </div>
              <div className="text-white p-6 rounded-2xl text-center shadow-xl shadow-brand-blue/10 relative overflow-hidden" style={{backgroundColor: themeBrandBlue}}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block mb-2 relative z-10">Circulación</span>
                <span className="text-4xl font-black font-mono tracking-tighter relative z-10">{areas.circulation.toFixed(0)}</span>
                <span className="text-[10px] font-bold text-white/50 block mt-1 relative z-10">+15% FACTOR</span>
              </div>
            </div>

            {/* Volumetría Base */}
            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-8 mb-8">
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                 <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100"><Layers size={16} color={themeBrandGreen}/></div>
                 Volumetría y Alturas
               </h3>
               <div className="grid grid-cols-3 gap-12">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Niveles</span>
                    <p className="font-black text-2xl tracking-tighter text-gray-800">{program.levels}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Alturas Libres</span>
                    <p className="font-black text-xl tracking-tighter text-gray-800 leading-tight">{getCeilingValue()}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Cimentación</span>
                    <p className="font-black text-xl uppercase tracking-tighter text-gray-800">{t(program.basement)}</p>
                 </div>
               </div>
            </div>

            {/* Estilo Arquitectónico */}
            <div className="p-8 rounded-2xl border" style={{backgroundColor: '#F8FAFC', borderColor: \`\${themeBrandBlue}20\`}}>
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeBrandBlue}}>
                 <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100"><Home size={16}/></div>
                 Partido Conceptual
               </h3>
               <div className="grid grid-cols-3 gap-8 items-center">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Estilo</span>
                    <p className="font-black text-2xl uppercase tracking-tighter text-gray-800">{t(program.style)}</p>
                 </div>
                 <div className="space-y-1 border-x px-8 border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Techumbres</span>
                    <p className="font-black text-xl uppercase tracking-tighter text-gray-800">{t(program.roofStyle)}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Concepto</span>
                    <p className="font-black text-xl uppercase tracking-tighter text-gray-800">{t(program.floorPlanConcept)}</p>
                 </div>
               </div>
            </div>

            <PhaseNotes color={themeBrandBlue} title="Notas de Contexto y Partido" />
          </div>
          
          <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-300">
             <span>ARCHCOS STUDIO GROUP</span>
             <span>PÁGINA 01 / 04</span>
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 2: Perfil de Usuario y Estilo de Vida */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] min-h-[11in] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeBrandGreen}}>
          <header className="border-b-[4px] pb-6 mb-10 flex items-center gap-6" style={{borderColor: themeBrandGreen}}>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Users size={32} style={{color: themeBrandGreen}} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">FASE 2: EL FLUJO / FLOW</h4>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900">
                Perfil de Habitalidad
              </h1>
            </div>
          </header>

          <div className="flex flex-col flex-1">
            <div className="grid grid-cols-2 gap-10 mb-8">
              {/* Habitantes */}
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                   Dinámica de Residentes ({program.inhabitantsCount})
                 </h3>
                 <div className="space-y-3">
                   {program.inhabitants.map((inh, i) => (
                     <div key={i} className="flex gap-4 items-center p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                       <div className="font-black text-base w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md shadow-brand-blue/30" style={{backgroundColor: themeBrandBlue}}>{inh.age || '?'}</div>
                       <div>
                         <span className="font-black uppercase text-xs block text-gray-800">{inh.occupation || 'Residente'}</span>
                         <span className="text-[9px] uppercase font-bold text-gray-400">{inh.gender || 'N/A'} • {inh.age ? \`\${inh.age} AÑOS\` : ''}</span>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Mascotas & Social */}
              <div className="flex flex-col gap-8">
                 <div>
                   <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                     Entorno y Mascotas
                   </h3>
                   <div className="flex gap-2 flex-wrap min-h-[44px]">
                     {program.pets.length > 0 ? program.pets.map((pet, i) => (
                       <span key={i} className="px-4 py-2 border font-black text-[10px] uppercase rounded-lg bg-white shadow-sm flex items-center gap-2" style={{color: themeBrandGreen, borderColor: \`\${themeBrandGreen}30\`}}>
                         <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: themeBrandGreen}}></div>
                         {t(pet)}
                       </span>
                     )) : <span className="text-xs font-bold opacity-30 uppercase italic">Sin mascotas registradas</span>}
                   </div>
                 </div>

                 <div>
                   <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                     Parámetros de Diseño
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                         <span className="text-[9px] font-black uppercase text-gray-400 block mb-2">Huéspedes</span>
                         <span className="font-black text-sm tracking-tight text-gray-700">{program.frequentGuests ? 'SÍ (FRECUENTE)' : 'NO RECURRENTE'}</span>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                         <span className="text-[9px] font-black uppercase text-gray-400 block mb-2">Accesibilidad</span>
                         <span className="font-black text-sm tracking-tight text-gray-700">{program.accessibilityNeeds ? 'REQUISITO: SÍ' : 'ESTÁNDAR'}</span>
                      </div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Puntos Críticos */}
            <div className="p-8 rounded-2xl border border-dashed transition-all hover:bg-white" style={{backgroundColor: \`\${themeBrandGreen}05\`, borderColor: \`\${themeBrandGreen}40\`}}>
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                 <CheckCircle2 size={16} color={themeBrandGreen}/> Hallazgos de Estilo de Vida
               </h3>
               <div className="grid grid-cols-2 gap-12">
                 <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-3 underline decoration-gray-200 underline-offset-4">Influencia Hobbies</span>
                    <div className="flex gap-2 flex-wrap">
                      {program.hobbies.length > 0 ? program.hobbies.map((h, i) => <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-white shadow-sm border border-gray-100">{h}</span>) : <span className="opacity-30 text-[10px] italic">No declarados</span>}
                    </div>
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-3 underline decoration-gray-200 underline-offset-4">Activadores Técnicos</span>
                    <ul className="space-y-2 font-black text-xs" style={{color: themeBrandBlue}}>
                      {program.doubleHeight && <li className="flex items-start gap-2">• Doble Altura Requerida en Áreas Públicas.</li>}
                      {program.floorPlanConcept === 'open' && <li className="flex items-start gap-2">• Transparencia y fluidez espacial máxima.</li>}
                      <li className="flex items-start gap-2">• Núcleo de Vida: {t(program.favoriteRoom)}.</li>
                    </ul>
                 </div>
               </div>
            </div>

            <PhaseNotes color={themeBrandGreen} title="Notas sobre Estilo de Vida y Circulaciones" />
          </div>
          
          <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-300">
             <span>ARCHCOS STUDIO GROUP</span>
             <span>PÁGINA 02 / 04</span>
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 3: Programa de Necesidades */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] min-h-[11in] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeBrandBlue}}>
          <header className="border-b-[4px] pb-6 mb-8 flex items-end justify-between shrink-0" style={{borderColor: themeBrandBlue}}>
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Layout size={32} style={{color: themeBrandBlue}} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">FASE 3: INVENTARIO TÉCNICO</h4>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900">
                  Programa de Necesidades
                </h1>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-widest">NET INTERIOR</span>
              <p className="font-black text-2xl tracking-tighter" style={{color: themeBrandBlue}}>{areas.interiorNet.toFixed(0)} SQFT</p>
            </div>
          </header>

          <div className="flex-1 overflow-visible">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {['SOCIAL', 'PRIVADOS', 'SERVICIOS', 'EXTERIORES', 'OTROS'].map((cat) => {
                const catItems = areas.breakdown.filter(item => item.macroZone === cat);
                if (catItems.length === 0) return null;

                const totalCategoryArea = catItems.reduce((acc, curr) => acc + curr.area, 0);

                let headerColor = themeBrandBlue;
                if (cat === 'SOCIAL') headerColor = '#3498DB';
                if (cat === 'PRIVADOS') headerColor = '#9B59B6';
                if (cat === 'SERVICIOS') headerColor = '#E67E22';
                if (cat === 'EXTERIORES') headerColor = themeBrandGreen;

                const groupedByParent: Record<string, any[]> = {};
                catItems.forEach(item => {
                  const pKey = item.parentKey || item.name;
                  if (!groupedByParent[pKey]) groupedByParent[pKey] = [];
                  groupedByParent[pKey].push(item);
                });

                return (
                  <div key={cat} className="space-y-3 col-span-2 mb-2">
                    <div className="flex justify-between items-center border-b-[2px] pb-1.5" style={{borderColor: \`\${headerColor}40\`}}>
                      <div className="flex items-center gap-3">
                         <span className="p-1 rounded bg-gray-50 border border-gray-100"><Layout size={12} style={{color: headerColor}}/></span>
                         <h3 className="text-xs font-black uppercase tracking-[0.1em]" style={{color: headerColor}}>ZONA {cat}</h3>
                      </div>
                      <span className="text-[10px] font-black px-3 py-0.5 rounded-full text-white tracking-widest" style={{backgroundColor: headerColor}}>{totalCategoryArea.toFixed(0)} SQFT</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(groupedByParent).map(([pKey, itemsInGroup]) => {
                        if (itemsInGroup.length === 1 && !itemsInGroup[0].isParent && pKey === itemsInGroup[0].name) {
                          const item = itemsInGroup[0];
                          return (
                            <div key={item.name} className="group bg-white border border-gray-100 p-4 flex justify-between items-center rounded-xl shadow-sm transition-all hover:shadow-md hover:border-gray-200">
                              <div className="flex flex-col">
                                 <span className="font-black text-[10px] uppercase text-gray-800 leading-tight mb-1">
                                    {MIN_DIMENSIONS[item.name]?.label?.[language] || item.name}
                                 </span>
                                 <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 font-mono">
                                    <Maximize2 size={10}/> {item.l}' × {item.w}'
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className="font-black font-mono text-base block tracking-tighter" style={{color: headerColor}}>{item.area.toFixed(0)}</span>
                                 <span className="text-[7px] font-black uppercase text-gray-300">SQFT</span>
                              </div>
                            </div>
                          );
                        }

                        const parentLabel = MIN_DIMENSIONS[pKey]?.label?.[language] || pKey;
                        const totalGroupArea = itemsInGroup.reduce((sum, i) => sum + i.area, 0);

                        return (
                          <div key={pKey} className="p-4 rounded-2xl border shadow-sm col-span-1 border-gray-100" style={{backgroundColor: \`\${headerColor}03\`}}>
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                               <span className="font-black text-[11px] uppercase tracking-tighter" style={{color: themeDarkBlue}}>{parentLabel}</span>
                               <span className="font-black font-mono text-[11px]" style={{color: headerColor}}>{totalGroupArea.toFixed(0)} SQFT</span>
                            </div>
                            <div className="space-y-2">
                              {itemsInGroup.map(item => (
                                <div key={item.name} className="flex justify-between items-center bg-white/40 p-2 rounded-lg border border-transparent hover:border-gray-100">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-[9px] uppercase text-gray-600">
                                      {item.isParent ? 'Principal' : '• ' + (MIN_DIMENSIONS[item.name]?.label?.[language] || item.name)}
                                    </span>
                                  </div>
                                  <div className="text-right flex items-center gap-3">
                                    <span className="text-[8px] text-gray-400 font-mono italic">{item.l}'×{item.w}'</span>
                                    <span className="font-black font-mono text-xs" style={{color: headerColor}}>{item.area.toFixed(0)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <PhaseNotes color={themeBrandBlue} title="Notas sobre el Programa de Necesidades" />
          </div>
          
          <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-300">
             <span>ARCHCOS STUDIO GROUP</span>
             <span>PÁGINA 03 / 04</span>
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 4: Materialidad y Acabados */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] min-h-[11in] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeDarkBlue}}>
          <header className="border-b-[4px] pb-6 mb-10 flex items-center gap-6" style={{borderColor: themeDarkBlue}}>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Palette size={32} style={{color: themeDarkBlue}} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">FASE 4: LOS DETALLES</h4>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900">
                Materialidad y Acabados
              </h1>
            </div>
          </header>

          <div className="flex-1 flex flex-col">
            
            <div className="text-white p-8 rounded-2xl shadow-xl mb-12 relative overflow-hidden" style={{backgroundColor: themeDarkBlue}}>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-8 border-b border-white/10 pb-4"><Home size={16}/> Requerimientos de Envolvente</h3>
               <div className="grid grid-cols-3 gap-10">
                  <div className="space-y-1">
                     <span className="text-[10px] uppercase font-black text-white/40 block mb-2 tracking-widest">Paredes Exteriores</span>
                     <span className="text-xl font-black tracking-tighter">{t(program.finishes.walls)}</span>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[10px] uppercase font-black text-white/40 block mb-2 tracking-widest">Techumbres</span>
                     <span className="text-xl font-black tracking-tighter">{t(program.finishes.roof)}</span>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[10px] uppercase font-black text-white/40 block mb-2 tracking-widest">Concepto Cromático</span>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-white/30 shadow-inner" style={{backgroundColor: program.favoriteColor}}></div>
                        <span className="text-xl font-black tracking-tighter uppercase">{program.favoriteColor || 'N/A'}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{color: themeDarkBlue}}>
                 <div className="p-2 rounded-lg bg-gray-50 border border-gray-100"><Sparkles size={16} style={{color: themeBrandBlue}}/></div>
                 Especificaciones por Zona
               </h3>
               <div className="overflow-hidden border rounded-2xl shadow-sm border-gray-100">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="text-[9px] font-black uppercase tracking-wider" style={{backgroundColor: '#F8FAFC', color: themeDarkBlue}}>
                       <th className="p-5 border-b border-gray-100">Habitación</th>
                       <th className="p-5 border-b border-gray-100">Piso / Solado</th>
                       <th className="p-5 border-b border-gray-100">Paramentos</th>
                       <th className="p-5 border-b border-gray-100">Atributos Extra</th>
                     </tr>
                   </thead>
                   <tbody className="text-xs text-gray-700">
                     <tr className="border-b border-gray-50 transition-colors hover:bg-gray-50/30">
                       <td className="p-5 font-black uppercase text-gray-900 leading-tight">SOCIALES <br/><span className="text-[8px] font-bold text-gray-400">Sala, Comedor</span></td>
                       <td className="p-5 font-bold uppercase">{t(program.finishes.floors)}</td>
                       <td className="p-5 font-bold uppercase">Pintura Base Archcos</td>
                       <td className="p-5 font-black" style={{color: themeBrandBlue}}>
                          {program.floorPlanConcept === 'open' ? 'Fluidez Abierta' : 'Estructura Compartimentada'}
                       </td>
                     </tr>
                     <tr className="border-b border-gray-50 bg-gray-50/20 transition-colors hover:bg-gray-50/50">
                       <td className="p-5 font-black uppercase text-gray-900">COCINA</td>
                       <td className="p-5 font-bold uppercase">{t(program.finishes.floors) === 'tile' ? 'Piedra / Cerámica' : t(program.finishes.floors)}</td>
                       <td className="p-5 font-bold uppercase">Pintura Lavable</td>
                       <td className="p-5 font-black space-y-1" style={{color: themeBrandBlue}}>
                          <p>Isla: Mandatorio</p>
                       </td>
                     </tr>
                     <tr className="border-b border-gray-50 transition-colors hover:bg-gray-50/30">
                       <td className="p-5 font-black uppercase text-gray-900">BAÑOS</td>
                       <td className="p-5 font-bold uppercase">Antiderrapante TBD</td>
                       <td className="p-5 font-bold uppercase">Mármol / Azulejo</td>
                       <td className="p-5 font-black" style={{color: themeBrandBlue}}>
                          Mono-mando Negro
                       </td>
                     </tr>
                     <tr className="bg-gray-50/10 transition-colors hover:bg-gray-50/40">
                       <td className="p-5 font-black uppercase text-gray-900">RECAMARAS</td>
                       <td className="p-5 font-bold uppercase">{t(program.finishes.floors)}</td>
                       <td className="p-5 font-bold uppercase">Acústico / Térmico</td>
                       <td className="p-5 font-black" style={{color: themeBrandBlue}}>
                          Acabado Premium
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
               
               {program.forbiddenColors.length > 0 && (
                  <div className="mt-8 bg-red-600 p-5 rounded-2xl text-white text-xs font-black shadow-lg shadow-red-200">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> COLORES RESTRINGIDOS: {program.forbiddenColors.join(', ')}</span>
                  </div>
               )}
            </div>

            <PhaseNotes color={themeDarkBlue} title="Notas sobre Especificaciones y Acabados" />
          </div>
          
          <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-300">
             <span>ARCHCOS STUDIO GROUP</span>
             <span>PÁGINA 04 / 04</span>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
`;

const finalContent = content.substring(0, startIndex) + newComponent + content.substring(endIndex);
fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log("Successfully refined DesignBriefPreview with phase notes, improved didactics, and brand colors.");
