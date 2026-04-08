const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Find the start of the Details Screen logic inside Phase3 component
// It starts with:
//   // Details Screen
//   return (
//     <div className="space-y-8">
//       <div className="space-y-2">

const startMarker = "  // Details Screen";
const endMarker = "  );\n}\n\nfunction Phase4";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found in App.tsx!");
  process.exit(1);
}

const newLogic = `  // Details Screen
  
  const groupedSpaces: Record<string, string[]> = {
    SOCIAL: [],
    PRIVADOS: [],
    SERVICIOS: [],
    EXTERIORES: [],
    OTROS: []
  };

  currentSpaces.forEach(space => {
    let category = 'OTROS';
    for (const [zone, groups] of Object.entries(NESTED_SPACES)) {
      for (const group of groups) {
        if (group.parent === space || group.children.includes(space)) {
          category = zone;
          break;
        }
      }
      if (category !== 'OTROS') break;
    }
    if (category === 'OTROS' && MIN_DIMENSIONS[space]?.category === 'EXTERIOR') {
      category = 'EXTERIORES';
    }
    groupedSpaces[category].push(space);
  });

  const categoriesOrder = ['SOCIAL', 'PRIVADOS', 'SERVICIOS', 'EXTERIORES', 'OTROS'];

  const themeDarkBlue = '#0E3A56'; 
  const themeBrandBlue = '#1F82C0';
  const themeBrandGreen = '#8CC63F';

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-brand-blue-dark mb-2">
          <CheckCircle2 size={32} />
          <span className="text-sm font-semibold uppercase tracking-wider">{t('phase3_details_title')}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-medium leading-tight">
          {t('phase3_details_subtitle')}
        </h2>
        <p className="text-brand-ink/60 text-lg">{t('phase3_details_prompt')}</p>
      </div>

      <div className="space-y-12">
        {categoriesOrder.map((cat) => {
          const spacesInCategory = groupedSpaces[cat];
          if (spacesInCategory.length === 0) return null;

          let headerColor = themeBrandBlue;
          if (cat === 'SOCIAL') headerColor = '#3498DB';
          if (cat === 'PRIVADOS') headerColor = '#9B59B6';
          if (cat === 'SERVICIOS') headerColor = '#E67E22';
          if (cat === 'EXTERIORES') headerColor = themeBrandGreen;

          return (
            <div key={cat} className="space-y-6">
              <div className="flex items-center gap-4 pb-3 border-b-2" style={{borderColor: \`\${headerColor}30\`}}>
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{backgroundColor: \`\${headerColor}15\`}}>
                   <Layout size={16} style={{color: headerColor}}/>
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-widest" style={{color: themeDarkBlue}}>
                   {CATEGORY_LABELS[cat]?.[language] || \`ZONA \${cat}\`}
                 </h3>
                 <div className="ml-auto">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white" style={{backgroundColor: headerColor}}>
                      {spacesInCategory.length} Espacios
                    </span>
                 </div>
              </div>

              <div className="space-y-4">
                {spacesInCategory.map((space) => (
                  <Accordion key={space} title={MIN_DIMENSIONS[space]?.label?.[language] || space}>
                    <div className="p-6 bg-brand-neutral/50 rounded-2xl space-y-8">
                      {/* Dimensions Engine */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold uppercase tracking-widest text-brand-ink/40">{t('dimensions_ft')}</span>
                          {program.spaceDimensions[space]?.isCorrected && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                              {t(program.spaceDimensions[space]?.note || '')} {MIN_DIMENSIONS[space]?.[program.spaceDimensions[space]?.field === 'l' ? 'l' : 'w']}'
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">{t('length')}</label>
                            <input 
                              type="number"
                              value={program.spaceDimensions[space]?.l}
                              onChange={(e) => updateDimension(space, 'l', parseFloat(e.target.value))}
                              className="w-full p-3 rounded-xl bg-white border border-brand-ink/10 focus:ring-2 outline-none transition-all font-mono shadow-sm"
                              style={{'--tw-ring-color': \`\${themeBrandBlue}50\`} as React.CSSProperties}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">{t('width')}</label>
                            <input 
                              type="number"
                              value={program.spaceDimensions[space]?.w}
                              onChange={(e) => updateDimension(space, 'w', parseFloat(e.target.value))}
                              className="w-full p-3 rounded-xl bg-white border border-brand-ink/10 focus:ring-2 outline-none transition-all font-mono shadow-sm"
                              style={{'--tw-ring-color': \`\${themeBrandBlue}50\`} as React.CSSProperties}
                            />
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-brand-ink/50 flex justify-between bg-white/50 p-2 rounded-lg border border-brand-ink/5">
                          <span>{t('net_area')}: <strong style={{color: themeBrandBlue}}>{(program.spaceDimensions[space]?.l * program.spaceDimensions[space]?.w).toFixed(2)} SqFt</strong></span>
                          <span>{t('minimum')}: {MIN_DIMENSIONS[space]?.l}' x {MIN_DIMENSIONS[space]?.w}'</span>
                        </div>
                      </div>

                      <div className="h-px w-full" style={{backgroundColor: \`\${themeBrandBlue}15\`}} />
                      
                      {/* Material Selectors */}
                      <div className="space-y-4">
                        <span className="text-sm font-semibold uppercase tracking-widest" style={{color: themeDarkBlue}}>Materialidad de la Habitación</span>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: headerColor}}></div> {t('floors')}</label>
                            <div className="flex flex-wrap gap-2">
                              {['wood_laminate', 'stone', 'tile', 'polished_concrete'].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => updateDetail(space, 'floorMaterial', v)}
                                  className={\`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all \${currentDetails[space]?.floorMaterial === v ? 'text-white shadow-md scale-105' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-400'}\`}
                                  style={currentDetails[space]?.floorMaterial === v ? {backgroundColor: headerColor} : {}}
                                >
                                  {t(v)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: themeDarkBlue}}></div> {t('interior_walls')}</label>
                            <div className="flex flex-wrap gap-2">
                              {['warm_paint', 'cool_paint', 'wallpaper', 'natural_wood'].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => updateDetail(space, 'wallMaterial', v)}
                                  className={\`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all \${currentDetails[space]?.wallMaterial === v ? 'text-white shadow-md scale-105' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-400'}\`}
                                  style={currentDetails[space]?.wallMaterial === v ? {backgroundColor: themeDarkBlue} : {}}
                                >
                                  {t(v)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px w-full" style={{backgroundColor: \`\${themeBrandBlue}15\`}} />

                      {space.includes('kitchen') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400">{t('stove')}</label>
                            <div className="flex gap-2">
                              {['gas', 'electric', 'induction'].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => updateDetail(space, 'stove', v)}
                                  className={\`flex-1 py-2 rounded-lg text-[10px] font-black uppercase \${currentDetails[space]?.stove === v ? 'text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}\`}
                                  style={currentDetails[space]?.stove === v ? {backgroundColor: themeDarkBlue} : {}}
                                >{t(v)}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400">{t('refrigerator')}</label>
                            <div className="flex gap-2">
                              {['standard', 'double_door'].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => updateDetail(space, 'refri', v)}
                                  className={\`flex-1 py-2 rounded-lg text-[10px] font-black uppercase \${currentDetails[space]?.refri === v ? 'text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}\`}
                                  style={currentDetails[space]?.refri === v ? {backgroundColor: themeDarkBlue} : {}}
                                >{t(v)}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {(space === 'master_suite' || space === 'secondary_bedrooms' || space === 'guest_bedroom') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400">{t('bed_size')}</label>
                            <div className="flex gap-2">
                              {['king', 'queen', 'full'].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => updateDetail(space, 'bed', v)}
                                  className={\`flex-1 py-2 rounded-lg text-[10px] font-black uppercase \${currentDetails[space]?.bed === v ? 'text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}\`}
                                  style={currentDetails[space]?.bed === v ? {backgroundColor: themeDarkBlue} : {}}
                                >{t(v)}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400">{t('closet')}</label>
                            <div className="flex gap-2">
                              {['walk_in', 'wall'].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => updateDetail(space, 'closet', v)}
                                  className={\`flex-1 py-2 rounded-lg text-[10px] font-black uppercase \${currentDetails[space]?.closet === v ? 'text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}\`}
                                  style={currentDetails[space]?.closet === v ? {backgroundColor: themeDarkBlue} : {}}
                                >{t(v)}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{color: themeDarkBlue}}><PenTool size={12}/> {t('extra_notes')} (Opcional)</label>
                        <textarea 
                          placeholder={t('extra_notes_placeholder')}
                          value={currentDetails[space]?.notes || ''}
                          onChange={(e) => updateDetail(space, 'notes', e.target.value)}
                          className="w-full bg-white p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 shadow-sm min-h-[100px] resize-none text-sm text-gray-700"
                          style={{'--tw-ring-color': \`\${themeBrandBlue}40\`} as React.CSSProperties}
                        />
                      </div>
                    </div>
                  </Accordion>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>`;

const finalContent = content.substring(0, startIndex) + newLogic + "\n" + content.substring(endIndex);
fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log("Successfully updated Phase 3 Details Screen with grouping and material selectors.");
