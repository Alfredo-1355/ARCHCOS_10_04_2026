const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const marker = '// --- BEFORE DESIGN ORIGINAL View ---';
const startIndex = content.indexOf(marker);

if (startIndex === -1) {
  console.error("Marker not found in App.tsx!");
  process.exit(1);
}

const newComponent = `// --- BEFORE DESIGN ORIGINAL View ---

function BeforeDesignOriginalView({ program, language, t, onClose }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  const CheckboxText = ({ label, checked }: { label: string, checked: boolean }) => (
    <div className="flex flex-col items-center">
      <span className={\`font-bold text-[9px] leading-tight \${checked ? '' : 'opacity-60 font-normal'}\`}>{label}</span>
      {checked && <div className="h-[2px] w-full bg-black -mt-0.5" />}
    </div>
  );

  const getAgeValues = () => program.inhabitants.map(i => i.age).join(', ') || '';
  const getOccValues = () => program.inhabitants.map(i => i.occupation).join(', ') || '';
  const getHobValues = () => program.hobbies.join(', ') || '';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 overflow-y-auto no-scrollbar print:bg-white print:p-0"
    >
      <div className="min-h-screen flex flex-col items-center py-10 print:py-0">
        {/* Controls */}
        <div className="w-full max-w-[8.5in] flex justify-between items-center mb-6 px-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-brand-ink/80 text-white rounded-xl hover:bg-brand-ink transition-all backdrop-blur-md"
          >
            <ArrowLeft size={18} /> {t('back_to_summary')}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-brand-blue-dark text-white font-bold rounded-xl hover:bg-brand-blue-dark/80 transition-all shadow-lg"
          >
            <Printer size={18} /> {language === 'en' ? 'Print Document' : 'Imprimir Documento'}
          </button>
        </div>

        {/* Paper Sheet - 8.5x11 inches aspect ratio */}
        <div className="w-[8.5in] bg-white text-black font-sans p-[0.4in] print:w-full print:p-0 mx-auto text-[10px] leading-tight flex flex-col gap-3">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1 w-[40%]">
              <div className="flex flex-col gap-1 mb-1">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#8CC63F] flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm rounded-sm">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1F82C0]" />
                        <div className="w-full h-1/2 bg-white/30 absolute bottom-0" />
                        <Layout size={20} className="text-white z-10" />
                    </div>
                    <span className="text-3xl font-bold text-gray-700 tracking-tighter" style={{fontFamily: 'Arial, Helvetica, sans-serif', marginLeft: '-4px'}}>ARCHCOS</span>
                </div>
              </div>
              <p className="font-serif italic text-[10px] mt-1 text-gray-800">Others build houses, we build HOMES!</p>
            </div>
            
            <div className="flex-1 flex justify-center pt-2">
              <div className="px-6 py-1 bg-gray-100 border-x border-t border-gray-300 shadow-sm relative mr-12">
                <h1 className="text-xl font-serif tracking-widest text-gray-800">BEFORE DESIGN</h1>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black" />
              </div>
            </div>

            <div className="w-[30%] text-right flex flex-col items-end gap-[1px]">
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Customer</span><div className="border-b border-gray-500 flex-1 px-1 text-right font-bold text-xs">{program.inhabitants[0]?.occupation || ''}</div></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Address</span><div className="border-b border-gray-500 flex-1 px-1 text-right font-bold text-xs">{program.footprint === 'rectangular' ? 'Standard Lot' : program.footprint === 'l_shape' ? 'Corner' : 'Estate'}</div></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">City, State, ZIP</span><div className="border-b border-gray-500 flex-1 px-1 text-right font-bold text-xs">Local</div></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Date</span><div className="border-b border-gray-500 flex-1 px-1 text-right font-bold text-xs">{new Date().toLocaleDateString()}</div></div>
            </div>
          </div>

          {/* Construction Type */}
          <div className="flex justify-between font-bold mb-1 uppercase tracking-wider text-xs bg-gray-50 py-1">
            <div className="px-2"><span className="font-normal uppercase mr-2 opacity-80">TYPE OF CONSTRUCTION</span> Residential</div>
            <div className="px-2"><span className="font-normal uppercase mr-2 opacity-80">SIZE</span> ____ <span className="font-normal uppercase ml-4 opacity-80">SQFT</span> ____</div>
          </div>

          {/* Inside Spaces */}
          <div className="border-t-2 border-b-2 border-black py-2 mt-2">
            <span className="font-bold uppercase text-[10px] bg-gray-200 px-2 py-0.5">INSIDE SPACES</span>
            
            {/* Kitchen */}
            <div className="flex border-b border-gray-300 py-2 items-end mt-1">
              <div className="w-24 font-bold text-xs">Kitchen</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Stove</span> <CheckboxText label="Gas" checked={false} /><CheckboxText label="Electric" checked={true} /></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Refrigerator</span> <CheckboxText label="Small" checked={false} /><CheckboxText label="Highest" checked={true} /></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Dishwasher</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} /><CheckboxText label="No" checked={false} /></div> </div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Hood/Microwave</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} /><CheckboxText label="No" checked={false} /></div> </div>
              </div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={program.finishes.floors === 'wood_laminate'}/><CheckboxText label="Tile" checked={program.finishes.floors === 'tile'}/><CheckboxText label="Wood" checked={program.finishes.floors === 'wood_laminate'}/><CheckboxText label="Stone" checked={program.finishes.floors === 'stone'}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true}/><CheckboxText label="Tile" checked={false}/><CheckboxText label="Paint" checked={true}/><CheckboxText label="Stone" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false}/><CheckboxText label="Paint" checked={true}/><CheckboxText label="Stucco" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false}/><CheckboxText label="Warm" checked={true}/><CheckboxText label="Cold" checked={false}/></div></div>
              </div>
            </div>

            {/* Laundry */}
            <div className="flex border-b border-gray-300 py-2 items-end">
              <div className="w-24 font-bold text-xs">Laundry</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Washer</span> <div className="flex flex-col"><CheckboxText label="Commercial" checked={false} /><CheckboxText label="Special" checked={false} /></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Dryer</span> <div className="flex flex-col"><CheckboxText label="Gas" checked={false} /><CheckboxText label="Electric" checked={false} /></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Sink</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} /><CheckboxText label="No" checked={false} /></div></div>
              </div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={true}/><CheckboxText label="Tile" checked={false}/><CheckboxText label="Wood" checked={false}/><CheckboxText label="Stone" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true}/><CheckboxText label="Tile" checked={false}/><CheckboxText label="Paint" checked={false}/><CheckboxText label="Stone" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false}/><CheckboxText label="Paint" checked={true}/><CheckboxText label="Stucco" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={true}/><CheckboxText label="Warm" checked={false}/><CheckboxText label="Cold" checked={false}/></div></div>
              </div>
            </div>

            {/* Bathroom */}
            <div className="flex border-b border-gray-300 py-2 items-end">
              <div className="w-24 font-bold text-xs">Bathroom</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Shower</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} /><CheckboxText label="No" checked={false} /></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Tub</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} /><CheckboxText label="No" checked={false} /></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Sink</span> <div className="flex flex-col"><CheckboxText label="1" checked={false} /><CheckboxText label="2" checked={true} /></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Toilet</span> <div className="flex flex-col"><CheckboxText label="1" checked={true} /><CheckboxText label="2" checked={false} /></div></div>
              </div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={false}/><CheckboxText label="Tile" checked={true}/><CheckboxText label="Wood" checked={false}/><CheckboxText label="Stone" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={false}/><CheckboxText label="Tile" checked={true}/><CheckboxText label="Paint" checked={false}/><CheckboxText label="Stone" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false}/><CheckboxText label="Paint" checked={true}/><CheckboxText label="Stucco" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false}/><CheckboxText label="Warm" checked={true}/><CheckboxText label="Cold" checked={false}/></div></div>
              </div>
            </div>

            {/* Bedroom */}
            <div className="flex py-2 items-end">
              <div className="w-24 font-bold text-xs">Bedroom</div>
              <div className="flex-1 flex gap-2">
                <div className="flex gap-1 items-end"><span className="text-[9px] font-bold">Bed</span> <div className="flex flex-col"><CheckboxText label="Twins" checked={false}/><CheckboxText label="Full" checked={false}/><CheckboxText label="Queen" checked={false}/><CheckboxText label="King" checked={true}/></div></div>
                <div className="flex gap-1 items-end pl-2">
                  <div className="flex flex-col items-end gap-[1px]">
                     <span className="text-[9px] font-bold">Vanity Table</span>
                     <span className="text-[9px] font-bold">Dresser</span>
                     <span className="text-[9px] font-bold">Bureau</span>
                     <span className="text-[9px] font-bold">Closet</span>
                  </div> 
                  <div className="flex flex-col gap-[1px]">
                     <div className="flex gap-2"><CheckboxText label="Yes" checked={true}/><CheckboxText label="No" checked={false}/></div>
                     <div className="flex gap-2"><CheckboxText label="1" checked={true}/><CheckboxText label="2" checked={false}/></div>
                     <div className="flex gap-2"><CheckboxText label="1" checked={true}/><CheckboxText label="2" checked={false}/></div>
                     <div className="flex gap-2"><CheckboxText label="1" checked={false}/><CheckboxText label="2" checked={false}/><CheckboxText label="Walking" checked={true}/><CheckboxText label="Small" checked={false}/></div>
                  </div>  
                </div>
              </div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={program.finishes.floors === 'wood_laminate'}/><CheckboxText label="Tile" checked={program.finishes.floors === 'tile'}/><CheckboxText label="Wood" checked={program.finishes.floors === 'wood_laminate'}/><CheckboxText label="Stone" checked={program.finishes.floors === 'stone'}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true}/><CheckboxText label="Tile" checked={false}/><CheckboxText label="Paint" checked={true}/><CheckboxText label="Stone" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false}/><CheckboxText label="Paint" checked={true}/><CheckboxText label="Stucco" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false}/><CheckboxText label="Warm" checked={true}/><CheckboxText label="Cold" checked={false}/></div></div>
              </div>
            </div>
          </div>

          {/* Outside Spaces */}
          <div className="border-b-2 border-black py-2">
            <span className="font-bold uppercase text-[10px] bg-gray-200 px-2 py-0.5">OUTSIDE</span>
            <div className="flex py-1 mt-2 items-end">
              <div className="w-48 font-bold flex gap-1 items-center">4 Elevations with <div className="border-b border-gray-400 w-24"></div></div>
              <div className="flex-1"></div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false}/><CheckboxText label="Wood" checked={false}/><CheckboxText label="Stone" checked={true}/><CheckboxText label="Concrete" checked={true}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Brick" checked={program.finishes.walls==='brick'}/><CheckboxText label="Stucco" checked={program.finishes.walls!=='brick'}/><CheckboxText label="Sidding" checked={false}/><CheckboxText label="Tile" checked={false}/><CheckboxText label="Steel" checked={false}/><CheckboxText label="Stone" checked={false}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Roof</span><div className="flex flex-col"><CheckboxText label="Clay Tile" checked={program.finishes.roof==='clay_tile'}/><CheckboxText label="Shingle" checked={program.finishes.roof==='shingle'}/><CheckboxText label="Steel" checked={program.finishes.roof==='steel'}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false}/><CheckboxText label="Warm" checked={true}/><CheckboxText label="Cold" checked={false}/></div></div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end border-b-2 border-black pb-1">
              <span className="font-bold uppercase text-[10px] bg-gray-200 px-2 py-0.5">QUESTIONS</span>
              <div className="flex w-[60%] border-l-2 border-black">
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80">Ages</span>
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80">Occupations</span>
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80">Hobbies</span>
              </div>
            </div>

            {/* Q1 */}
            <div className="flex gap-4">
              <div className="w-[40%] flex flex-col gap-2">
                <p>1.- How <strong className="font-bold">many persons</strong> will be living in this building?</p>
                <div className="flex justify-between px-6 font-bold">
                  <CheckboxText label="1" checked={program.inhabitantsCount === 1} />
                  <CheckboxText label="2" checked={program.inhabitantsCount === 2} />
                  <CheckboxText label="3" checked={program.inhabitantsCount === 3} />
                  <CheckboxText label="4" checked={program.inhabitantsCount === 4} />
                  <CheckboxText label="5" checked={program.inhabitantsCount === 5} />
                  <CheckboxText label="+5" checked={program.inhabitantsCount > 5} />
                </div>
                <div className="flex gap-12 mt-1 px-4 font-bold w-full">
                  <CheckboxText label="Female" checked={program.inhabitants[0]?.gender === 'female'} />
                  <CheckboxText label="Male" checked={program.inhabitants[0]?.gender === 'male'} />
                </div>
              </div>
              <div className="flex w-[60%]">
                <div className="w-1/3 px-2 flex flex-col gap-[3px] py-1 border-l-2 border-black">
                    <div className="border-b border-gray-400 text-center font-bold text-[10px] h-4 leading-none inline-flex items-end justify-center pb-0.5">{getAgeValues()}</div>
                    <div className="border-b border-gray-400 h-4"></div>
                    <div className="border-b border-gray-400 h-4"></div>
                </div>
                <div className="w-1/3 px-2 flex flex-col gap-[3px] py-1">
                    <div className="border-b border-gray-400 text-center font-bold text-[10px] h-4 leading-none inline-flex items-end justify-center pb-0.5">{getOccValues()}</div>
                    <div className="border-b border-gray-400 h-4"></div>
                    <div className="border-b border-gray-400 h-4"></div>
                </div>
                <div className="w-1/3 px-2 flex flex-col gap-[3px] py-1">
                    <div className="border-b border-gray-400 text-center font-bold text-[10px] h-4 leading-none inline-flex items-end justify-center pb-0.5">{getHobValues()}</div>
                    <div className="border-b border-gray-400 h-4"></div>
                    <div className="border-b border-gray-400 h-4"></div>
                </div>
              </div>
            </div>
            {/* Pets */}
            <div className="flex gap-3 items-end ml-[12%] font-bold text-[9px] -mt-5 pb-3 block">
               <div className="flex flex-col items-center"><span className="text-[9px] mb-[2px]">Pet</span><span className="font-normal opacity-70">Cat</span><span className="font-normal opacity-70">Dog</span><span className="font-normal opacity-70">Mouse</span></div>
               <div className="flex flex-col items-center"><span className="text-[9px] mb-[2px]">Yes</span><CheckboxText label="Fish" checked={program.pets.includes('fish')}/><CheckboxText label="Bird" checked={program.pets.includes('bird')}/><CheckboxText label="Other" checked={false}/></div>
               <div className="flex flex-col items-center"><span className="text-[9px] mb-[2px]">No</span><CheckboxText label=" " checked={program.pets.length===0}/><CheckboxText label=" " checked={program.pets.length===0}/><CheckboxText label=" " checked={program.pets.length===0}/></div>
            </div>

            {/* Q2 */}
            <div className="mt-1">
              <p>2.- Do you have <strong className="font-bold">frequent overnight guests?</strong></p>
              <div className="flex gap-6 font-bold px-2 mt-1">
                 <CheckboxText label="Yes" checked={program.frequentGuests} />
                 <CheckboxText label="No" checked={!program.frequentGuests} />
              </div>
            </div>

            {/* Q3 */}
            <div className="mt-2">
              <p>3.- What are your <strong className="font-bold">priorities</strong> for the house?</p>
              <div className="flex justify-between font-bold mt-1.5 w-full pr-12">
                <CheckboxText label="Energy Efficiency" checked={false} />
                <CheckboxText label="Grand Entry" checked={program.doubleHeight} />
                <CheckboxText label="Circle Driveway" checked={false} />
                <CheckboxText label="Swimming Pool" checked={program.groundFloorSpaces.includes('pool') || program.upperFloorSpaces.includes('pool')} />
                <CheckboxText label="LED Lighting" checked={false} />
                <CheckboxText label="Surround-Sound Media Room" checked={program.groundFloorSpaces.includes('home_theater')} />
              </div>
              <div className="flex gap-2 items-end mt-4"><strong className="text-[10px] pb-0.5">Others</strong> <div className="border-b border-gray-400 flex-1"></div></div>
            </div>

            {/* Q4 */}
            <div className="mt-4">
              <p>4.- Are there any <strong className="font-bold">special concerns</strong> that need to be accommodated in the new design, such as accessibility for a <strong className="font-bold border-b border-gray-200 bg-gray-100 px-1">wheel chair or walker</strong>?</p>
              <div className="flex gap-6 items-center mt-2 font-bold px-2">
                 <CheckboxText label="Yes" checked={program.accessibilityNeeds} /> 
                 <CheckboxText label="No" checked={!program.accessibilityNeeds} /> 
              </div>
              <div className="flex gap-2 items-end mt-2 ml-20 -mt-6">
                 <strong className="text-[10px] pb-0.5">Others</strong> <div className="border-b border-gray-400 flex-1 ml-2"></div>
              </div>
            </div>

            {/* Q5 - 8 split column */}
            <div className="mt-4 flex gap-12">
              <div className="w-1/2">
                <p>5.- Which <strong className="font-bold">architectural style</strong> do you prefer?</p>
                <div className="flex flex-col font-bold mt-1 gap-1 items-start ml-2">
                  <CheckboxText label="Modern" checked={program.style === 'modern'} />
                  <CheckboxText label="Contemporary" checked={program.style === 'contemporary'} />
                  <CheckboxText label="Traditional" checked={program.style === 'traditional'} />
                  <CheckboxText label="Colonial" checked={program.style === 'classic_colonial'} />
                  <CheckboxText label="Ranch/Rambler" checked={program.style === 'ranch'} />
                  <CheckboxText label="Bungalow" checked={program.style === 'cottage'} />
                  <CheckboxText label="Cape Cod" checked={false} />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end pb-4 space-y-6">
                <div className="space-y-1">
                  <p>6.- Favorite Color</p>
                  <div className="border-b border-gray-400 w-full font-bold px-2 pb-0.5 uppercase">{program.favoriteColor}</div>
                </div>
                <div className="space-y-1">
                  <p>7.- Hate Color</p>
                  <div className="border-b border-gray-400 w-full font-bold px-2 pb-0.5 uppercase">{program.forbiddenColors.join(', ')}</div>
                </div>
                <div className="space-y-1">
                  <p>8.- Favorite Room</p>
                  <div className="border-b border-gray-400 w-full font-bold px-2 pb-0.5 uppercase">{t(program.favoriteRoom)}</div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-auto pt-8 flex gap-4 items-end pb-4">
             <strong className="text-[10px] pb-0.5">Authorized Signature</strong> <div className="border-b border-gray-400 w-[30%]"></div>
             <strong className="text-[10px] ml-4 pb-0.5">Name:</strong> <div className="border-b border-gray-400 w-[30%] px-2 font-bold uppercase">{program.inhabitants[0]?.occupation || ''}</div>
             <strong className="text-[10px] ml-4 pb-0.5">Date:</strong> <div className="border-b border-gray-400 w-32 px-2 font-bold uppercase">{new Date().toLocaleDateString()}</div>
          </div>

        </div>
      </div>

      <style>{\`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: letter;
            margin: 0;
            padding: 0;
          }
          .print\\\\:hidden {
            display: none !important;
          }
          .print\\\\:p-0 {
            padding: 0 !important;
          }
          .print\\\\:w-full {
            width: 8.5in !important;
            margin: 0 auto;
          }
        }
      \`}</style>
    </motion.div>
  );
}
`;

const finalContent = content.substring(0, startIndex) + newComponent;
fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log("Successfully replaced BeforeDesignOriginalView");
