const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update the Print Button Text (around line 2548)
content = content.replace(
  'IMPRIMIR EXPEDIENTE TÉCNICO',
  'DESCARGAR EXPEDIENTE PDF COMPLETO'
);

// 2. Locate Page 3 in DesignBriefPreview
// Marker 1: PAGE 3: Programa de Necesidades
// Marker 2: PAGE 3 / 4

const startMarker = '{/* PAGE 3: Programa de Necesidades */}';
const endMarker = 'PAGE 3 / 4';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found in App.tsx!");
  process.exit(1);
}

// Extract the header and container setup up to the loop
const newPage3 = `{/* PAGE 3: Programa de Necesidades */}
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
                  <div key={cat} className="space-y-4 col-span-2 mb-2">
                    <div className="flex justify-between items-center border-b-[2px] pb-1.5" style={{borderColor: \`\${headerColor}40\`}}>
                      <div className="flex items-center gap-3">
                         <span className="p-1 rounded bg-gray-50 border border-gray-100"><Layout size={12} style={{color: headerColor}}/></span>
                         <h3 className="text-xs font-black uppercase tracking-[0.1em]" style={{color: headerColor}}>ZONA {cat}</h3>
                      </div>
                      <span className="text-[11px] font-black px-3 py-1 rounded-full text-white tracking-widest" style={{backgroundColor: headerColor}}>{totalCategoryArea.toFixed(0)} SQFT</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(groupedByParent).map(([pKey, itemsInGroup]) => {
                        const isSuite = itemsInGroup.length > 1 || (itemsInGroup.length === 1 && itemsInGroup[0].isParent);

                        return (
                          <div key={pKey} className={\`p-4 rounded-xl border shadow-sm transition-all \${isSuite ? 'col-span-1 bg-gray-50/20 border-gray-100' : 'col-span-1 bg-white border-gray-100'}\`}>
                            {isSuite && (
                              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                <span className="font-black text-[11px] uppercase tracking-tighter" style={{color: themeDarkBlue}}>{MIN_DIMENSIONS[pKey]?.label?.[language] || pKey}</span>
                                <span className="font-black font-mono text-[11px]" style={{color: headerColor}}>{itemsInGroup.reduce((sum, i) => sum + i.area, 0).toFixed(0)} SQFT</span>
                              </div>
                            )}

                            <div className="space-y-3">
                              {itemsInGroup.map(item => {
                                const details = (program.groundFloorDetails[item.name] || program.upperFloorDetails[item.name]) || {};
                                return (
                                  <div key={item.name} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                      <div className="flex flex-col">
                                        <span className="font-black text-[10px] uppercase text-gray-800 leading-tight">
                                           {(!isSuite || item.isParent) ? '' : '• '}{MIN_DIMENSIONS[item.name]?.label?.[language] || item.name}
                                        </span>
                                        <div className="flex items-center gap-4 mt-1">
                                          <span className="text-[9px] font-bold text-gray-400 font-mono flex items-center gap-1">
                                            <Maximize2 size={8}/> {item.l}' × {item.w}'
                                          </span>
                                          <span className="font-black font-mono text-[11px]" style={{color: headerColor}}>{item.area.toFixed(0)} SQFT</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tech Specs Block */}
                                    <div className="flex flex-wrap gap-2 items-center bg-white/60 p-2 rounded-lg border border-gray-100/50">
                                      {/* Materials */}
                                      {details.floorMaterial && (
                                        <span className="text-[8px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                          <div className="w-1 h-1 rounded-full bg-blue-400"></div> PISO: {t(details.floorMaterial)}
                                        </span>
                                      )}
                                      {details.wallMaterial && (
                                        <span className="text-[8px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div> MURO: {t(details.wallMaterial)}
                                        </span>
                                      )}

                                      {/* Equipment (dynamic icons/text) */}
                                      {(item.name === 'master_suite' || item.name === 'secondary_bedrooms' || item.name === 'guest_bedroom') && details.bed && (
                                        <span className="text-[8px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                                          BED: {t(details.bed)}
                                        </span>
                                      )}
                                      {item.name === 'main_kitchen' && details.stove && (
                                        <span className="text-[8px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">
                                          STOVE: {t(details.stove)}
                                        </span>
                                      )}
                                      {details.closet && (
                                        <span className="text-[8px] font-black uppercase flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">
                                          CLOSET: {t(details.closet)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Notes if any */}
                                    {details.notes && (
                                      <p className="text-[8px] italic text-gray-400 border-l-2 pl-2 mt-1" style={{borderColor: \`\${headerColor}30\`}}>
                                        "{details.notes}"
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
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
             <span>`;

const finalContent = content.substring(0, startIndex) + newPage3 + content.substring(endIndex);
fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log("Successfully detailed Phase 3 (Inventario Técnico) in the Design Brief and updated Print label.");
