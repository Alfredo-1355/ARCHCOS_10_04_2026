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
  const getMacroZone = (spaceName: string) => {
    for (const [zone, groups] of Object.entries(NESTED_SPACES)) {
      for (const group of groups) {
        if (group.parent === spaceName || group.children.includes(spaceName)) {
          return zone;
        }
      }
    }
    if (MIN_DIMENSIONS[spaceName]?.category === 'EXTERIOR') return 'EXTERIORES';
    return 'OTROS';
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

        breakdown.push({
          name: space,
          qty,
          l: dims.l,
          w: dims.w,
          area,
          macroZone: getMacroZone(space),
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
    return mainHeight;
  };

  const themeDarkBlue = '#0E3A56'; 
  const themeBrandBlue = '#1F82C0';
  const themeBrandGreen = '#8CC63F';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#E5E7EB] overflow-y-auto overflow-x-hidden no-scrollbar text-black font-sans print:bg-white print:p-0"
    >
      <style>{\`
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          @page { size: letter; margin: 0; }
          .print-page { 
             page-break-after: always; 
             box-shadow: none !important; 
             margin: 0 !important; 
             width: 8.5in !important; 
             height: 11in !important; 
             padding: 0.6in !important; 
             box-sizing: border-box;
             overflow: hidden;
          }
          .print\\\\:hidden { display: none !important; }
        }
      \`}</style>

      {/* Top Bar for Screen */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center print:hidden shadow-sm" style={{borderColor: \`\${themeBrandBlue}20\`}}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Archcos" className="h-8 object-contain" onError={(e) => {
             e.currentTarget.style.display='none';
          }}/>
          <span className="font-bold tracking-tight text-xl" style={{color: themeBrandBlue}}>Design Brief</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 text-white rounded-md text-sm font-bold transition-all hover:opacity-80 shadow-sm" style={{backgroundColor: themeBrandBlue}}>
            <Printer size={18} /> IMPRIMIR PDF (CARTA)
          </button>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 py-8 print:py-0 print:gap-0 w-full">
        
        {/* ======================================= */}
        {/* PAGE 1: Contexto y Partido Arquitectónico */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] min-h-[11in] bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] relative p-[0.6in] flex flex-col">
          <header className="border-b-[3px] pb-4 mb-8 flex justify-between items-end" style={{borderColor: themeBrandBlue}}>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">FASE 1: CONTEXTO Y PARTIDO ARQUITECTÓNICO</h4>
              <h1 className="text-3xl font-bold uppercase tracking-tighter leading-none text-black">
                {program.inhabitants[0]?.occupation || "PROJECT"} RESIDENCE
              </h1>
            </div>
            <div className="text-right text-[10px] uppercase font-bold text-black/60 space-y-1">
              <p>CITY, STATE, ZIP: LOCAL</p>
              <p>DATE: {new Date().toLocaleDateString()}</p>
            </div>
          </header>

          <div className="flex-1 flex flex-col gap-10">
            {/* Hero Numbers */}
            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 rounded-lg text-center border" style={{backgroundColor: '#F5FBFE', borderColor: \`\${themeBrandBlue}20\`}}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-black/50 block mb-1">Total Gross SqFt</span>
                <span className="text-3xl font-bold font-mono" style={{color: themeDarkBlue}}>{(areas.totalGross + areas.exteriorNet).toFixed(0)}</span>
              </div>
              <div className="p-5 rounded-lg text-center border" style={{backgroundColor: '#F7FCF0', borderColor: \`\${themeBrandGreen}30\`}}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-black/50 block mb-1">Net Interior SqFt</span>
                <span className="text-3xl font-bold font-mono text-black">{areas.interiorNet.toFixed(0)}</span>
              </div>
              <div className="text-white p-5 rounded-lg text-center shadow-md relative overflow-hidden" style={{backgroundColor: themeBrandBlue}}>
                <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent to-white"></div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/80 block mb-1 relative z-10">Circulation (+15%)</span>
                <span className="text-3xl font-bold font-mono relative z-10">{areas.circulation.toFixed(0)}</span>
              </div>
            </div>

            {/* Volumetría Base */}
            <div className="flex flex-col gap-4">
               <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b pl-2 pb-2" style={{borderColor: \`\${themeBrandGreen}50\`, color: themeDarkBlue}}>
                 <Layers size={14} color={themeBrandGreen}/> Volumetría Base
               </h3>
               <div className="grid grid-cols-3 gap-8 px-4">
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-black/40">Niveles / Plantas</span>
                    <p className="font-bold text-base">{program.levels}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-black/40">Ceiling Height</span>
                    <p className="font-bold text-base">{getCeilingValue()}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-black/40">Basement/Foundation</span>
                    <p className="font-bold text-base uppercase">{t(program.basement)}</p>
                 </div>
               </div>
            </div>

            {/* Estilo Arquitectónico */}
            <div className="flex flex-col gap-4 p-5 rounded-lg border mt-auto" style={{backgroundColor: '#F5FBFE', borderColor: \`\${themeBrandBlue}20\`}}>
               <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1" style={{color: themeBrandBlue}}>
                 <Home size={14}/> Estilo Arquitectónico (Exterior)
               </h3>
               <div className="flex gap-12 items-center px-2">
                 <div>
                    <span className="text-[9px] font-bold uppercase text-black/40 block">Estilo Principal</span>
                    <p className="font-bold text-xl uppercase tracking-tight">{t(program.style)}</p>
                 </div>
                 <div className="h-10 w-[1px]" style={{backgroundColor: \`\${themeBrandBlue}30\`}}></div>
                 <div>
                    <span className="text-[9px] font-bold uppercase text-black/40 block">Roof Concept</span>
                    <p className="font-bold text-base uppercase tracking-tight">{t(program.roofStyle)}</p>
                 </div>
                 <div className="h-10 w-[1px]" style={{backgroundColor: \`\${themeBrandBlue}30\`}}></div>
                 <div>
                    <span className="text-[9px] font-bold uppercase text-black/40 block">Floor Plan Flow</span>
                    <p className="font-bold text-base uppercase tracking-tight">{t(program.floorPlanConcept)}</p>
                 </div>
               </div>
            </div>
          </div>
          <div className="mt-auto text-center pt-8 text-[8px] font-bold uppercase tracking-[0.2em] text-black/20">
             PAGE 1 / 4
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 2: Perfil de Usuario y Estilo de Vida */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] min-h-[11in] bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeBrandGreen}}>
          <header className="border-b-[3px] pb-4 mb-8" style={{borderColor: themeBrandGreen}}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">FASE 2: EL FLUJO / FLOW</h4>
            <h1 className="text-3xl font-bold uppercase tracking-tighter leading-none text-black">
              Perfil de Usuario y Estilo de Vida
            </h1>
          </header>

          <div className="grid grid-cols-2 gap-x-12 gap-y-10 flex-1">
            {/* Habitantes */}
            <div className="flex flex-col">
               <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b pb-2 mb-4" style={{borderColor: \`\${themeBrandBlue}30\`, color: themeDarkBlue}}>
                 <Users size={14} color={themeBrandBlue}/> Habitantes ({program.inhabitantsCount})
               </h3>
               <ul className="space-y-2 flex-1">
                 {program.inhabitants.map((inh, i) => (
                   <li key={i} className="flex gap-3 items-center p-2 rounded border border-transparent" style={{backgroundColor: \`\${themeBrandBlue}08\`}}>
                     <div className="font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center text-white" style={{backgroundColor: themeBrandBlue}}>{inh.age || '?'}</div>
                     <div>
                       <span className="font-bold uppercase text-xs block">{inh.occupation || 'Residente'}</span>
                       <span className="text-[9px] uppercase font-bold text-black/50">{inh.gender || 'N/A'} - {inh.age ? \`\${inh.age} Yrs\` : ''}</span>
                     </div>
                   </li>
                 ))}
               </ul>
            </div>

            {/* Mascotas & Social */}
            <div className="flex flex-col gap-8">
               <div>
                 <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b pb-2 mb-4" style={{borderColor: \`\${themeBrandGreen}30\`, color: themeDarkBlue}}>
                   <Dog size={14} color={themeBrandGreen}/> Mascotas
                 </h3>
                 <div className="flex gap-2 flex-wrap">
                   {program.pets.length > 0 ? program.pets.map((pet, i) => (
                     <span key={i} className="px-3 py-1.5 border-2 font-bold text-xs uppercase rounded text-white" style={{backgroundColor: themeBrandGreen, borderColor: themeBrandGreen}}>{t(pet)}</span>
                   )) : <span className="text-xs font-bold opacity-40 uppercase border-2 p-1.5 rounded">Sin mascotas</span>}
                 </div>
                 {program.pets.length > 0 && <span className="text-[9px] mt-2 block font-bold" style={{color: '#C0392B'}}>* ALERTA DISEÑO: Ubicar Mudroom o puerta designada.</span>}
               </div>

               <div>
                 <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b pb-2 mb-4" style={{borderColor: \`\${themeBrandBlue}30\`, color: themeDarkBlue}}>
                   <Users size={14} color={themeBrandBlue}/> Dinámica Social
                 </h3>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded text-center border" style={{backgroundColor: '#F5FBFE', borderColor: \`\${themeBrandBlue}20\`}}>
                       <span className="text-[9px] font-bold uppercase text-black/50 block mb-1">Overnight Guests</span>
                       <span className="font-bold text-sm" style={{color: themeBrandBlue}}>{program.frequentGuests ? 'SÍ (FRECUENTE)' : 'NO'}</span>
                    </div>
                    <div className="p-3 rounded text-center border" style={{backgroundColor: '#F5FBFE', borderColor: \`\${themeBrandBlue}20\`}}>
                       <span className="text-[9px] font-bold uppercase text-black/50 block mb-1">Accessibility Req.</span>
                       <span className="font-bold text-sm" style={{color: themeBrandBlue}}>{program.accessibilityNeeds ? 'SÍ (WHEELCHAIR)' : 'NO'}</span>
                    </div>
                 </div>
               </div>
            </div>

            {/* Puntos Críticos */}
            <div className="col-span-2 mt-auto p-5 rounded-lg shadow-sm" style={{backgroundColor: \`\${themeBrandGreen}10\`, border: \`1px solid \${themeBrandGreen}50\`}}>
               <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3" style={{color: themeDarkBlue}}>
                 <CheckCircle2 size={14} color={themeBrandGreen}/> Puntos Críticos de Diseño (Derivados de Estilo de Vida)
               </h3>
               <div className="grid grid-cols-2 gap-8">
                 <div>
                    <span className="text-[10px] font-bold uppercase block mb-2" style={{color: \`\${themeDarkBlue}80\`}}>Hobbies & Pasatiempos</span>
                    <ul className="list-disc list-inside space-y-1 font-bold text-xs text-black">
                      {program.hobbies.length > 0 ? program.hobbies.map((h, i) => <li key={i}>{h}</li>) : <li className="opacity-50">Ninguno especificado</li>}
                    </ul>
                 </div>
                 <div>
                    <span className="text-[10px] font-bold uppercase block mb-2" style={{color: \`\${themeDarkBlue}80\`}}>Prioridades Extras detectadas</span>
                    <ul className="list-disc list-inside space-y-1 font-bold text-xs" style={{color: themeBrandBlue}}>
                      {program.doubleHeight && <li>Entrada a Doble Altura (Grand Entry) requerida.</li>}
                      {program.floorPlanConcept === 'open' && <li>Plan Abierto: Estructurar soporte mayor.</li>}
                      {<li>Habitación Favorita/Central: {t(program.favoriteRoom)}</li>}
                    </ul>
                 </div>
               </div>
            </div>
          </div>
          <div className="mt-auto text-center pt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-black/20">
             PAGE 2 / 4
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 3: Programa de Necesidades */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] min-h-[11in] bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeBrandBlue}}>
          <header className="border-b-[3px] pb-4 mb-6 flex items-end justify-between shrink-0" style={{borderColor: themeBrandBlue}}>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">FASE 3: INVENTARIO DE ÁREAS</h4>
              <h1 className="text-3xl font-bold uppercase tracking-tighter leading-none text-black">
                Programa de Necesidades
              </h1>
            </div>
            <div className="text-right">
              <p className="font-bold text-base" style={{color: themeBrandBlue}}>Total Interior Net: {areas.interiorNet.toFixed(0)} SqFt</p>
            </div>
          </header>

          <div className="flex-1 overflow-visible">
            <div className="flex flex-col gap-6">
              {['SOCIAL', 'PRIVADOS', 'SERVICIOS', 'EXTERIORES', 'OTROS'].map((cat) => {
                const catItems = areas.breakdown.filter(item => item.macroZone === cat);
                if (catItems.length === 0) return null;
                
                const totalCategoryArea = catItems.reduce((acc, curr) => acc + curr.area, 0);

                let headerColor = themeBrandBlue;
                if (cat === 'SOCIAL') headerColor = '#3498DB';
                if (cat === 'PRIVADOS') headerColor = '#9B59B6';
                if (cat === 'SERVICIOS') headerColor = '#E67E22';
                if (cat === 'EXTERIORES') headerColor = themeBrandGreen;

                return (
                  <div key={cat} className="space-y-3 shrink-0">
                    <div className="flex justify-between items-center border-b-[2px] pb-1" style={{borderColor: \`\${headerColor}40\`}}>
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{color: headerColor}}>
                        <Layout size={16}/> ZONA: {cat}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white" style={{backgroundColor: headerColor}}>Total: {totalCategoryArea.toFixed(0)} SqFt</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {catItems.map((item, idx) => (
                        <div key={idx} className="bg-white border p-3 flex justify-between items-center shadow-sm" style={{borderColor: \`\${headerColor}30\`, borderLeftWidth: '3px', borderLeftColor: headerColor}}>
                          <div className="flex flex-col">
                             <span className="font-bold text-xs uppercase text-black leading-tight">
                                {MIN_DIMENSIONS[item.name]?.label?.[language] || item.name}
                             </span>
                             {item.qty > 1 && <span className="text-[9px] font-bold uppercase mt-1" style={{color: headerColor}}>Mult: {item.qty} espacios × {item.baseArea.toFixed(0)} SqFt</span>}
                             <span className="text-[9px] text-black/60 font-mono mt-0.5">DIMS: {item.l}' × {item.w}'</span>
                          </div>
                          <div className="text-right pl-3">
                             <span className="font-bold font-mono text-base block leading-none" style={{color: headerColor}}>{item.area.toFixed(0)}</span>
                             <span className="text-[8px] uppercase font-bold text-black/40 tracking-widest block mt-1">SqFt</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-auto shrink-0 text-center pt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-black/20">
             PAGE 3 / 4
          </div>
        </div>

        {/* ======================================= */}
        {/* PAGE 4: Materialidad y Acabados */}
        {/* ======================================= */}
        <div className="print-page w-[8.5in] min-h-[11in] bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] relative p-[0.6in] flex flex-col border-t-[8px]" style={{borderColor: themeDarkBlue}}>
          <header className="border-b-[3px] pb-4 mb-8" style={{borderColor: themeDarkBlue}}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">FASE 4: LOS DETALLES</h4>
            <h1 className="text-3xl font-bold uppercase tracking-tighter leading-none text-black">
              Materialidad y Acabados
            </h1>
          </header>

          <div className="flex-1 flex flex-col gap-10">
            
            <div className="text-white p-6 rounded-xl shadow-md" style={{backgroundColor: themeDarkBlue}}>
               <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/20 pb-2"><Home size={14}/> Exteriores (Elevations)</h3>
               <div className="grid grid-cols-3 gap-6">
                  <div>
                     <span className="text-[9px] uppercase font-bold text-white/50 block mb-1">Paredes Exteriores / Siding</span>
                     <span className="text-lg font-bold">{t(program.finishes.walls)}</span>
                  </div>
                  <div>
                     <span className="text-[9px] uppercase font-bold text-white/50 block mb-1">Material de Techo / Roof</span>
                     <span className="text-lg font-bold">{t(program.finishes.roof)}</span>
                  </div>
                  <div>
                     <span className="text-[9px] uppercase font-bold text-white/50 block mb-1">Paleta de Color Base</span>
                     <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-white shadow-md relative" style={{backgroundColor: program.favoriteColor}}>
                          {(!program.favoriteColor || program.favoriteColor === '#E5E4E2' || program.favoriteColor === 'transparent') && (
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black"></span>
                          )}
                        </div>
                        <span className="text-lg font-bold">{program.favoriteColor || 'N/A'}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex-1">
               <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 pb-2 mb-4" style={{borderColor: \`\${themeBrandBlue}30\`, color: themeDarkBlue}}><Palette size={14}/> Interiores (Matriz de Acabados Base)</h3>
               <div className="overflow-hidden border rounded-lg shadow-sm" style={{borderColor: \`\${themeBrandBlue}20\`}}>
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="text-[9px] uppercase tracking-widest" style={{backgroundColor: \`\${themeBrandBlue}10\`, color: themeDarkBlue}}>
                       <th className="p-3 py-2 font-bold border-b" style={{borderColor: \`\${themeBrandBlue}20\`}}>Habitación Tipo</th>
                       <th className="p-3 py-2 font-bold border-b" style={{borderColor: \`\${themeBrandBlue}20\`}}>Piso (Floor)</th>
                       <th className="p-3 py-2 font-bold border-b" style={{borderColor: \`\${themeBrandBlue}20\`}}>Paredes (Wall)</th>
                       <th className="p-3 py-2 font-bold border-b" style={{borderColor: \`\${themeBrandBlue}20\`}}>Detalles Críticos</th>
                     </tr>
                   </thead>
                   <tbody className="text-xs text-black">
                     <tr className="border-b" style={{borderColor: \`\${themeBrandBlue}15\`}}>
                       <td className="p-3 font-bold" style={{color: themeBrandBlue}}>ZONAS SOCIALES <br/><span className="text-[9px] font-normal opacity-60 text-black">(Sala, Comedor, Pasillos)</span></td>
                       <td className="p-3 font-medium uppercase">{t(program.finishes.floors)}</td>
                       <td className="p-3 font-medium uppercase">PAINT (BASE)</td>
                       <td className="p-3 font-bold text-[10px]" style={{color: themeDarkBlue}}>
                          {program.floorPlanConcept === 'open' ? 'Integración Libre / Open Plan' : 'Pasillos Cerrados'}
                       </td>
                     </tr>
                     <tr className="border-b" style={{backgroundColor: '#F5FBFE', borderColor: \`\${themeBrandBlue}15\`}}>
                       <td className="p-3 font-bold" style={{color: themeBrandBlue}}>KITCHEN</td>
                       <td className="p-3 font-medium uppercase">{t(program.finishes.floors) === 'tile' ? 'TILE / STONE' : t(program.finishes.floors)}</td>
                       <td className="p-3 font-medium uppercase">PAINT / BACKSPLASH</td>
                       <td className="p-3 font-bold text-[10px] space-y-1" style={{color: themeDarkBlue}}>
                          <p>Estufa: Eléctrica/Gas (TBD)</p>
                          <p>Isla Central Req.: Sí</p>
                       </td>
                     </tr>
                     <tr className="border-b" style={{borderColor: \`\${themeBrandBlue}15\`}}>
                       <td className="p-3 font-bold" style={{color: themeBrandBlue}}>BATHROOMS</td>
                       <td className="p-3 font-medium uppercase">CERAMIC TILE</td>
                       <td className="p-3 font-medium uppercase">TILE (Wet Areas)</td>
                       <td className="p-3 font-bold text-[10px] space-y-1" style={{color: themeDarkBlue}}>
                          {program.groundFloorSpaces.includes('full_bath') || program.upperFloorSpaces.includes('full_bath') ? 
                            <><p>Ducha/Shower: Sí</p><p>Sink: 2 (Master)</p></>
                          : <p>Medio Baño: Sí</p>}
                       </td>
                     </tr>
                     <tr className="border-b" style={{backgroundColor: '#F5FBFE', borderColor: \`\${themeBrandBlue}15\`}}>
                       <td className="p-3 font-bold" style={{color: themeBrandBlue}}>BEDROOMS</td>
                       <td className="p-3 font-medium uppercase">{t(program.finishes.floors)}</td>
                       <td className="p-3 font-medium uppercase">PAINT (BASE)</td>
                       <td className="p-3 font-bold text-[10px] space-y-1" style={{color: themeDarkBlue}}>
                          {program.groundFloorSpaces.includes('master_suite') || program.upperFloorSpaces.includes('master_suite') ? 
                            <><p>Cama Base: King Size</p><p>Walk-in Closet: Req.</p></>
                          : <p>Cama Base: Queen Size</p>}
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
               
               {program.forbiddenColors.length > 0 && (
                  <div className="mt-6 bg-red-50 border border-red-200 p-3 rounded text-red-800 text-xs font-bold shadow-sm">
                    ⚠️ COLORES PROHIBIDOS (Hate Colors): {program.forbiddenColors.join(', ')}
                  </div>
               )}
            </div>

          </div>
          <div className="mt-auto text-center pt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-black/20">
             PAGE 4 / 4
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
`;

const finalContent = content.substring(0, startIndex) + newComponent + content.substring(endIndex);
fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log("Successfully refined DesignBriefPreview layout mapped strictly to US Letter sizes (8.5x11in).");
