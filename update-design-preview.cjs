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
          category: MIN_DIMENSIONS[space]?.category,
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#FAFAFA] overflow-y-auto no-scrollbar text-[#222222] font-sans print:bg-white print:p-0"
    >
      <style>{\`
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .print-break-before { page-break-before: always; }
          .print\\\\:hidden { display: none !important; }
          .print\\\\:shadow-none { box-shadow: none !important; }
        }
      \`}</style>

      {/* Top Bar for Screen */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-black/10 px-6 py-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Archcos" className="h-8 object-contain" onError={(e) => {
             e.currentTarget.style.display='none';
          }}/>
          <span className="font-bold tracking-tight text-xl">Design Brief</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-brand-ink text-white rounded-md text-sm font-medium hover:bg-black transition-all">
            <Printer size={18} /> IMPRIMIR PDF (DISEÑO)
          </button>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-[8.5in] mx-auto bg-white print:shadow-none shadow-xl my-8 print:my-0">
        
        {/* ======================================= */}
        {/* FASE 1: Contexto y Partido Arquitectónico */}
        {/* ======================================= */}
        <div className="p-12 print:p-8">
          <header className="border-b-[3px] border-black pb-6 mb-8 flex justify-between items-end">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-1">FASE 1: CONTEXTO Y PARTIDO ARQUITECTÓNICO</h4>
              <h1 className="text-4xl font-bold uppercase tracking-tighter leading-none text-black">
                {program.inhabitants[0]?.occupation || "PROJECT"} RESIDENCE
              </h1>
            </div>
            <div className="text-right text-xs uppercase font-bold text-black/60 space-y-1">
              <p>CITY, STATE, ZIP: LOCAL</p>
              <p>DATE: {new Date().toLocaleDateString()}</p>
            </div>
          </header>

          <div className="space-y-10">
            {/* Hero Numbers */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-100 p-6 rounded-lg text-center border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/50 block mb-2">Total Gross SqFt</span>
                <span className="text-4xl font-bold font-mono">{(areas.totalGross + areas.exteriorNet).toFixed(0)}</span>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg text-center border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/50 block mb-2">Net Interior SqFt</span>
                <span className="text-4xl font-bold font-mono">{areas.interiorNet.toFixed(0)}</span>
              </div>
              <div className="bg-brand-ink text-white p-6 rounded-lg text-center shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Circulation (+15%)</span>
                <span className="text-4xl font-bold font-mono">{areas.circulation.toFixed(0)}</span>
              </div>
            </div>

            {/* Volumetría Base */}
            <div className="flex flex-col gap-4">
               <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-black/10 pb-2"><Layers size={16}/> Volumetría Base</h3>
               <div className="grid grid-cols-3 gap-8">
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-black/40">Niveles / Plantas</span>
                    <p className="font-bold text-lg">{program.levels}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-black/40">Ceiling Height</span>
                    <p className="font-bold text-lg">{getCeilingValue()}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-black/40">Basement/Foundation</span>
                    <p className="font-bold text-lg uppercase">{t(program.basement)}</p>
                 </div>
               </div>
            </div>

            {/* Estilo Arquitectónico */}
            <div className="flex flex-col gap-4 bg-gray-50 border border-black/10 p-6 rounded-lg">
               <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-2"><Home size={16}/> Estilo Arquitectónico (Exterior)</h3>
               <div className="flex gap-16 items-center">
                 <div>
                    <span className="text-[10px] font-bold uppercase text-black/40 block">Estilo Principal</span>
                    <p className="font-bold text-2xl uppercase tracking-tight">{t(program.style)}</p>
                 </div>
                 <div className="h-12 w-[1px] bg-black/20"></div>
                 <div>
                    <span className="text-[10px] font-bold uppercase text-black/40 block">Roof Concept</span>
                    <p className="font-bold text-xl uppercase tracking-tight">{t(program.roofStyle)}</p>
                 </div>
                 <div className="h-12 w-[1px] bg-black/20"></div>
                 <div>
                    <span className="text-[10px] font-bold uppercase text-black/40 block">Floor Plan Flow</span>
                    <p className="font-bold text-xl uppercase tracking-tight">{t(program.floorPlanConcept)}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* FASE 2: Perfil de Usuario y Estilo de Vida */}
        {/* ======================================= */}
        <div className="p-12 print:p-8 print-break-before">
          <header className="border-b-[3px] border-black pb-4 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-1">FASE 2: EL FLUJO / FLOW</h4>
            <h1 className="text-3xl font-bold uppercase tracking-tighter leading-none text-black">
              Perfil de Usuario y Estilo de Vida
            </h1>
          </header>

          <div className="grid grid-cols-2 gap-x-16 gap-y-12">
            {/* Habitantes */}
            <div>
               <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b border-black/10 pb-2 mb-4"><Users size={16}/> Habitantes ({program.inhabitantsCount})</h3>
               <ul className="space-y-3">
                 {program.inhabitants.map((inh, i) => (
                   <li key={i} className="flex gap-4 items-center bg-gray-50 p-3 rounded">
                     <div className="font-bold text-lg w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">{inh.age || '?'}</div>
                     <div>
                       <span className="font-bold uppercase text-sm block">{inh.occupation || 'Residente'}</span>
                       <span className="text-[10px] uppercase font-bold text-black/50">{inh.gender || 'N/A'} - {inh.age ? \`\${inh.age} Yrs\` : ''}</span>
                     </div>
                   </li>
                 ))}
               </ul>
            </div>

            {/* Mascotas & Social */}
            <div className="space-y-10">
               <div>
                 <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b border-black/10 pb-2 mb-4"><Dog size={16}/> Mascotas</h3>
                 <div className="flex gap-3 flex-wrap">
                   {program.pets.length > 0 ? program.pets.map((pet, i) => (
                     <span key={i} className="px-4 py-2 border-2 border-black font-bold text-sm uppercase rounded">{t(pet)}</span>
                   )) : <span className="text-sm font-bold opacity-40 uppercase">Sin mascotas</span>}
                 </div>
                 {program.pets.length > 0 && <span className="text-[10px] mt-2 block font-bold text-red-600">* ALERTA DISEÑO: Ubicar Mudroom o puerta designada.</span>}
               </div>

               <div>
                 <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b border-black/10 pb-2 mb-4"><Users size={16}/> Dinámica Social</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded text-center">
                       <span className="text-[10px] font-bold uppercase text-black/50 block">Overnight Guests</span>
                       <span className="font-bold text-lg">{program.frequentGuests ? 'SÍ (FRECUENTE)' : 'NO'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded text-center">
                       <span className="text-[10px] font-bold uppercase text-black/50 block">Accessibility Needs</span>
                       <span className="font-bold text-lg">{program.accessibilityNeeds ? 'SÍ (WHEELCHAIR)' : 'NO'}</span>
                    </div>
                 </div>
               </div>
            </div>

            {/* Puntos Críticos */}
            <div className="col-span-2 mt-4 bg-[#fffdf0] border border-yellow-300 p-6 rounded-lg shadow-sm">
               <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-yellow-800"><CheckCircle2 size={16}/> Puntos Críticos de Diseño (Derivados de Estilo de Vida)</h3>
               <div className="grid grid-cols-2 gap-8">
                 <div>
                    <span className="text-xs font-bold uppercase text-yellow-800/60 block mb-2">Hobbies & Pasatiempos</span>
                    <ul className="list-disc list-inside space-y-1 font-bold text-sm">
                      {program.hobbies.length > 0 ? program.hobbies.map((h, i) => <li key={i}>{h}</li>) : <li className="opacity-50">Ninguno especificado</li>}
                    </ul>
                 </div>
                 <div>
                    <span className="text-xs font-bold uppercase text-yellow-800/60 block mb-2">Prioridades Extras detectadas</span>
                    <ul className="list-disc list-inside space-y-1 font-bold text-sm text-brand-ink">
                      {program.doubleHeight && <li>Entrada a Doble Altura (Grand Entry) requerida.</li>}
                      {program.floorPlanConcept === 'open' && <li>Plan Abierto: Estructurar soporte mayor.</li>}
                      {<li>Habitación Favorita/Central: {t(program.favoriteRoom)}</li>}
                    </ul>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* FASE 3: Programa de Necesidades */}
        {/* ======================================= */}
        <div className="p-12 print:p-8 print-break-before">
          <header className="border-b-[3px] border-black pb-4 mb-8 flex items-end justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-1">FASE 3: INVENTARIO DE ÁREAS</h4>
              <h1 className="text-3xl font-bold uppercase tracking-tighter leading-none text-black">
                Programa de Necesidades
              </h1>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">Total Interior Net: {areas.interiorNet.toFixed(0)} SqFt</p>
            </div>
          </header>

          <div className="space-y-12">
            {['SOCIAL', 'PRIVADOS', 'SERVICIOS', 'EXTERIORES'].map((cat) => {
              const catItems = areas.breakdown.filter(item => item.category === cat);
              if (catItems.length === 0) return null;
              
              const totalCategoryArea = catItems.reduce((acc, curr) => acc + curr.area, 0);

              return (
                <div key={cat} className="space-y-4">
                  <div className="flex justify-between items-center border-b-[2px] border-black/80 pb-2">
                    <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2"><Layout size={20}/> ZONA: {cat}</h3>
                    <span className="font-mono font-bold bg-black/5 px-3 py-1 rounded">Total: {totalCategoryArea.toFixed(0)} SqFt</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {catItems.map((item, idx) => (
                      <div key={idx} className="bg-white border text-black p-4 flex justify-between items-center shadow-sm">
                        <div className="flex flex-col">
                           <span className="font-bold text-sm uppercase">
                              {MIN_DIMENSIONS[item.name]?.label?.[language] || item.name}
                           </span>
                           {item.qty > 1 && <span className="text-[10px] font-bold text-brand-ink uppercase">Multiplicador: {item.qty} espacios × {item.baseArea.toFixed(0)} SqFt</span>}
                           {item.qty === 1 && <span className="text-[10px] text-black/40 font-mono">DIMS: {item.l}' × {item.w}'</span>}
                        </div>
                        <div className="text-right">
                           <span className="font-bold font-mono text-lg block">{item.area.toFixed(0)}</span>
                           <span className="text-[9px] uppercase font-bold text-black/40 tracking-widest block">SqFt Total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================= */}
        {/* FASE 4: Materialidad y Acabados */}
        {/* ======================================= */}
        <div className="p-12 print:p-8 print-break-before">
          <header className="border-b-[3px] border-black pb-4 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-1">FASE 4: LOS DETALLES</h4>
            <h1 className="text-3xl font-bold uppercase tracking-tighter leading-none text-black">
              Materialidad y Acabados
            </h1>
          </header>

          <div className="space-y-12">
            
            <div className="bg-black text-white p-8 rounded-xl shadow-lg">
               <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-white/20 pb-2"><Home size={16}/> Exteriores (Elevations)</h3>
               <div className="grid grid-cols-3 gap-8">
                  <div>
                     <span className="text-[10px] uppercase font-bold text-white/50 block mb-2">Paredes Exteriores / Siding</span>
                     <span className="text-xl font-bold">{t(program.finishes.walls)}</span>
                  </div>
                  <div>
                     <span className="text-[10px] uppercase font-bold text-white/50 block mb-2">Material de Techo / Roof</span>
                     <span className="text-xl font-bold">{t(program.finishes.roof)}</span>
                  </div>
                  <div>
                     <span className="text-[10px] uppercase font-bold text-white/50 block mb-2">Paleta de Color Base</span>
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-white" style={{backgroundColor: program.favoriteColor}}></div>
                        <span className="text-xl font-bold">{program.favoriteColor || 'N/A'}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div>
               <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-black/10 pb-2 mb-6"><Palette size={16}/> Interiores (Matriz de Acabados Base)</h3>
               <div className="overflow-hidden border border-black/10 rounded-lg shadow-sm">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-gray-100 text-[10px] uppercase tracking-widest text-black/60">
                       <th className="p-4 py-3 font-bold border-b border-black/10">Habitación Tipo</th>
                       <th className="p-4 py-3 font-bold border-b border-black/10">Piso (Floor)</th>
                       <th className="p-4 py-3 font-bold border-b border-black/10">Paredes (Wall)</th>
                       <th className="p-4 py-3 font-bold border-b border-black/10">Detalles Críticos</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     <tr className="border-b border-black/5">
                       <td className="p-4 font-bold">ZONAS SOCIALES <br/><span className="text-[10px] font-normal opacity-60">(Sala, Comedor, Pasillos)</span></td>
                       <td className="p-4 font-medium uppercase text-black/80">{t(program.finishes.floors)}</td>
                       <td className="p-4 font-medium uppercase text-black/80">PAINT (BASE)</td>
                       <td className="p-4 font-bold text-xs">
                          {program.floorPlanConcept === 'open' ? 'Integración Libre / Open Plan' : 'Pasillos Cerrados'}
                       </td>
                     </tr>
                     <tr className="border-b border-black/5 bg-gray-50/50">
                       <td className="p-4 font-bold">KITCHEN</td>
                       <td className="p-4 font-medium uppercase text-black/80">{t(program.finishes.floors) === 'tile' ? 'TILE / STONE' : t(program.finishes.floors)}</td>
                       <td className="p-4 font-medium uppercase text-black/80">PAINT / TILE BACKSPLASH</td>
                       <td className="p-4 font-bold text-xs space-y-1">
                          <p>Estufa: Eléctrica/Gas (TBD)</p>
                          <p>Isla Central Req.: Sí</p>
                       </td>
                     </tr>
                     <tr className="border-b border-black/5">
                       <td className="p-4 font-bold">BATHROOMS</td>
                       <td className="p-4 font-medium uppercase text-black/80">CERAMIC TILE (Hum.)</td>
                       <td className="p-4 font-medium uppercase text-black/80">TILE (Wet Areas)</td>
                       <td className="p-4 font-bold text-xs space-y-1">
                          {program.groundFloorSpaces.includes('full_bath') || program.upperFloorSpaces.includes('full_bath') ? 
                            <><p>Ducha/Shower: Sí</p><p>Sink: 2 (Master)</p></>
                          : <p>Medio Baño: Sí</p>}
                       </td>
                     </tr>
                     <tr className="border-b border-black/5 bg-gray-50/50">
                       <td className="p-4 font-bold">BEDROOMS</td>
                       <td className="p-4 font-medium uppercase text-black/80">{t(program.finishes.floors)}</td>
                       <td className="p-4 font-medium uppercase text-black/80">PAINT (BASE)</td>
                       <td className="p-4 font-bold text-xs space-y-1">
                          {program.groundFloorSpaces.includes('master_suite') || program.upperFloorSpaces.includes('master_suite') ? 
                            <><p>Cama Base: King Size</p><p>Walk-in Closet: Req.</p></>
                          : <p>Cama Base: Queen Size</p>}
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
               
               {program.forbiddenColors.length > 0 && (
                  <div className="mt-8 bg-red-50 border border-red-200 p-4 rounded text-red-800 text-sm">
                    <strong>⚠️ COLORES PROHIBIDOS (Hate Colors):</strong> {program.forbiddenColors.join(', ')}
                  </div>
               )}
            </div>

          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
`;

const finalContent = content.substring(0, startIndex) + newComponent + content.substring(endIndex);
fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log("Successfully replaced DesignBriefPreview");
