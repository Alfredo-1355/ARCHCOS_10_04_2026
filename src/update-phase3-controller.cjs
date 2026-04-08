const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const startMarkerPhase3Body = "function Phase3({ screen, program, updateProgram, language, t }";
const startIndexPhase3 = content.indexOf(startMarkerPhase3Body);

if (startIndexPhase3 === -1) {
  console.error("Markers not found in App.tsx!");
  process.exit(1);
}

// 1. Inject updateCategoryMaterial and getCategoryStatus right after currentDetails definition
const insertMarker1 = "const currentDetails = isGroundFloor ? program.groundFloorDetails : program.upperFloorDetails;";
const insertIndex1 = content.indexOf(insertMarker1, startIndexPhase3) + insertMarker1.length;

const topDownBottomUpLogic = `

  const updateCategoryMaterial = (spacesInCategory: string[], field: 'floorMaterial' | 'wallMaterial', value: string) => {
    const newDetails = { ...currentDetails };
    spacesInCategory.forEach(space => {
      newDetails[space] = { ...newDetails[space], [field]: value };
    });
    updateProgram({ [isGroundFloor ? 'groundFloorDetails' : 'upperFloorDetails']: newDetails });
  };

  const getCategoryStatus = (spacesInCategory: string[], field: 'floorMaterial' | 'wallMaterial'): string | undefined => {
    if (spacesInCategory.length === 0) return undefined;
    const firstVal = currentDetails[spacesInCategory[0]]?.[field];
    if (firstVal === undefined) {
      const allUndefined = spacesInCategory.every(space => currentDetails[space]?.[field] === undefined);
      return allUndefined ? undefined : 'mixed';
    }
    const allMatch = spacesInCategory.every(space => currentDetails[space]?.[field] === firstVal);
    return allMatch ? firstVal : 'mixed';
  };
`;

content = content.slice(0, insertIndex1) + topDownBottomUpLogic + content.slice(insertIndex1);

// 2. Inject Master Controller UI into details screen iteration
const marker2 = "              <div className=\"flex items-center gap-4 pb-3 border-b-2\" style={{borderColor: `\\${headerColor}30`}}>";
const marker2Index = content.indexOf(marker2);

const marker2End = "              </div>\n\n              <div className=\"space-y-4\">";
const marker2EndIndex = content.indexOf(marker2End) + "              </div>\n\n".length;

const masterControllerUI = `              {/* Master Material Controller for Category */}
              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-brand-ink/5 mb-6 transition-all" style={{boxShadow: \`inset 0 4px 20px rgba(0,0,0,0.01)\`}}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] mb-4 flex items-center gap-2" style={{color: themeDarkBlue}}>
                  <Layers size={14}/> Controlador Maestro: Materialidad de Zona
                </h4>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: headerColor}}></div> {t('floors')} (General)</label>
                        {getCategoryStatus(spacesInCategory, 'floorMaterial') === 'mixed' && <span className="text-[8px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">Personalizado / Múltiples</span>}
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {['wood_laminate', 'stone', 'tile', 'polished_concrete'].map(v => {
                           const status = getCategoryStatus(spacesInCategory, 'floorMaterial');
                           const isActive = status === v;
                           return (
                             <button
                               key={v}
                               onClick={() => updateCategoryMaterial(spacesInCategory, 'floorMaterial', v)}
                               className={\`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all \${isActive ? 'text-white shadow-md scale-[1.03] ring-2 ring-offset-2' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-gray-50'}\`}
                               style={isActive ? {backgroundColor: headerColor, '--tw-ring-color': headerColor} as any : {}}
                             >{t(v)}</button>
                           );
                        })}
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: themeDarkBlue}}></div> {t('interior_walls')} (General)</label>
                        {getCategoryStatus(spacesInCategory, 'wallMaterial') === 'mixed' && <span className="text-[8px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">Personalizado / Múltiples</span>}
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {['warm_paint', 'cool_paint', 'wallpaper', 'natural_wood'].map(v => {
                           const status = getCategoryStatus(spacesInCategory, 'wallMaterial');
                           const isActive = status === v;
                           return (
                             <button
                               key={v}
                               onClick={() => updateCategoryMaterial(spacesInCategory, 'wallMaterial', v)}
                               className={\`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all \${isActive ? 'text-white shadow-md scale-[1.03] ring-2 ring-offset-2' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-gray-50'}\`}
                               style={isActive ? {backgroundColor: themeDarkBlue, '--tw-ring-color': themeDarkBlue} as any : {}}
                             >{t(v)}</button>
                           );
                        })}
                     </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">`;

content = content.substring(0, marker2EndIndex) + masterControllerUI + content.substring(marker2EndIndex + "              <div className=\"space-y-4\">".length);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully injected Master Controller Top-Down / Bottom-Up state architecture.");
