const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

content = content.replace(
  /<BeforeDesignOriginalView[\s\S]*?\/>/g,
  '<BeforeDesignOriginalView program={program} language={language} t={t} onClose={() => setIsOriginalPdfOpen(false)} updateProgram={updateProgram} />'
);

const marker = '// --- BEFORE DESIGN ORIGINAL View ---';
const startIndex = content.indexOf(marker);

if (startIndex === -1) {
  console.error("Marker not found in App.tsx!");
  process.exit(1);
}

const newComponent = `// --- BEFORE DESIGN ORIGINAL View ---

function BeforeDesignOriginalView({ program, language, t, onClose, updateProgram }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, onClose: () => void, updateProgram?: any }) {
  // Local state initialized from program, for rapid editing before printing
  const [data, setData] = useState<ArchitecturalProgram>(JSON.parse(JSON.stringify(program)));

  // Save changes back to the main app state when exiting, if desired, or just keep locally.
  useEffect(() => {
    if (updateProgram) {
      updateProgram(data);
    }
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  const toggleCheck = (category: string, field: string, value: string) => {
    // A primitive generic toggle to handle custom local states 
    // Usually handled differently based on exact model, so let's do custom fast-edits:
    setData(prev => {
      let next = { ...prev };
      // Deep clone inside if necessary to mutate safely
      return next;
    });
  };

  // Generic controlled checkbox for UI mocking
  const CheckboxText = ({ label, checked, onClick }: { label: string, checked: boolean, onClick: () => void }) => (
    <div className="flex flex-col items-center cursor-pointer hover:bg-black/5 p-0.5 rounded transition-colors select-none" onClick={onClick}>
      <span className={\`font-bold text-[9px] leading-tight \${checked ? '' : 'opacity-60 font-normal'}\`}>{label}</span>
      {checked && <div className="h-[2px] w-full bg-black -mt-0.5" />}
    </div>
  );

  // Editable text component
  const EditableText = ({ value, onChange, className = "" }: { value: string, onChange: (val: string) => void, className?: string }) => (
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className={\`bg-transparent outline-none focus:bg-yellow-100/50 print:bg-transparent placeholder-black/30 \${className}\`}
    />
  );

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
          <div className="text-white text-sm opacity-80 backdrop-blur-md bg-black/20 px-4 py-2 rounded-xl">
             ¡Todos los campos son editables! Haz clic para modificarlos.
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-brand-blue-dark text-white font-bold rounded-xl hover:bg-brand-blue-dark/80 transition-all shadow-lg"
          >
            <Printer size={18} /> {language === 'en' ? 'Print Document' : 'Imprimir Documento'}
          </button>
        </div>

        {/* Paper Sheet - 8.5x11 inches aspect ratio */}
        <div className="w-[8.5in] bg-white text-black font-sans p-[0.4in] print:w-full print:p-0 mx-auto text-[10px] leading-tight flex flex-col gap-3 relative shadow-2xl print:shadow-none">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1 w-[40%]">
              <div className="flex flex-col gap-1 mb-1">
                <div className="flex items-center">
                    {/* ORIGINAL LOGO IMPLEMENTATION */}
                    {/* The user should place logo.png in public folder */}
                    <img src="/logo.png" alt="Archcos Logo" className="h-[50px] object-contain" onError={(e) => {
                      e.currentTarget.style.display='none';
                      e.currentTarget.nextElementSibling!.style.display='flex';
                    }} />
                    {/* Fallback CSS Logo if image not found */}
                    <div className="hidden items-center" style={{display: 'none'}}>
                      <div className="w-10 h-10 bg-[#8CC63F] flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm rounded-sm">
                          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1F82C0]" />
                          <div className="w-full h-1/2 bg-white/30 absolute bottom-0" />
                          <Layout size={20} className="text-white z-10" />
                      </div>
                      <span className="text-3xl font-bold text-gray-700 tracking-tighter" style={{fontFamily: 'Arial, Helvetica, sans-serif', marginLeft: '-4px'}}>ARCHCOS</span>
                    </div>
                </div>
              </div>
              <p className="font-serif italic text-[10px] mt-1 text-gray-800 tracking-widest pl-1">Others build houses, we build HOMES!</p>
            </div>
            
            <div className="flex-1 flex justify-center pt-2">
              <div className="px-8 py-2 bg-gradient-to-r from-gray-100 via-white to-gray-100 border-x border-t border-gray-300 shadow-sm relative mr-12">
                <h1 className="text-2xl font-serif tracking-widest text-gray-800">BEFORE DESIGN</h1>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black" />
              </div>
            </div>

            <div className="w-[30%] text-right flex flex-col items-end gap-[1px]">
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Customer</span><div className="border-b border-gray-500 flex-1 px-1 text-right font-bold text-xs"><EditableText value={data.inhabitants[0]?.occupation || ''} onChange={v => {let newData = {...data}; if(newData.inhabitants[0]) newData.inhabitants[0].occupation = v; setData(newData);}} className="w-full text-right" /></div></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Address</span><div className="border-b border-gray-500 flex-1 px-1 text-right font-bold text-xs"><EditableText value={data.footprint === 'rectangular' ? 'Standard Lot' : data.footprint === 'l_shape' ? 'Corner' : 'Estate'} onChange={v => setData({...data, footprint: v as any})} className="w-full text-right" /></div></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">City, State, ZIP</span><div className="border-b border-gray-500 flex-1 px-1 text-right font-bold text-xs"><EditableText value="Local" onChange={()=>{}} className="w-full text-right" /></div></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Date</span><div className="border-b border-gray-500 flex-1 px-1 text-right font-bold text-xs"><EditableText value={new Date().toLocaleDateString()} onChange={()=>{}} className="w-full text-right" /></div></div>
            </div>
          </div>

          {/* Construction Type */}
          <div className="flex justify-between font-bold mb-1 uppercase tracking-wider text-xs bg-gray-50 py-1">
            <div className="px-2 flex items-center"><span className="font-normal uppercase mr-2 opacity-80">TYPE OF CONSTRUCTION</span> <EditableText value="Residential" onChange={()=>{}} className="w-32 uppercase" /></div>
            <div className="px-2 flex items-center"><span className="font-normal uppercase mr-2 opacity-80">SIZE</span> <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 w-16 text-center focus:border-black transition-colors" /> <span className="font-normal uppercase ml-4 opacity-80 mr-2">SQFT</span> <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 w-16 text-center focus:border-black transition-colors" /></div>
          </div>

          {/* Inside Spaces */}
          <div className="border-t-2 border-b-2 border-black py-2 mt-2">
            <span className="font-bold uppercase text-[10px] bg-gray-200 px-2 py-0.5">INSIDE SPACES</span>
            
            {/* Kitchen */}
            <div className="flex border-b border-gray-300 py-2 items-end mt-1">
              <div className="w-24 font-bold text-xs">Kitchen</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Stove</span> <CheckboxText label="Gas" checked={false} onClick={()=>{}}/><CheckboxText label="Electric" checked={true} onClick={()=>{}}/></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Refrigerator</span> <CheckboxText label="Small" checked={false} onClick={()=>{}}/><CheckboxText label="Highest" checked={true} onClick={()=>{}}/></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Dishwasher</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div> </div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Hood/Microwave</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div> </div>
              </div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Tile" checked={data.finishes.floors === 'tile'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'tile'}})}/><CheckboxText label="Wood" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Stone" checked={data.finishes.floors === 'stone'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'stone'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Laundry */}
            <div className="flex border-b border-gray-300 py-2 items-end">
              <div className="w-24 font-bold text-xs">Laundry</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Washer</span> <div className="flex flex-col"><CheckboxText label="Commercial" checked={false} onClick={()=>{}}/><CheckboxText label="Special" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Dryer</span> <div className="flex flex-col"><CheckboxText label="Gas" checked={false} onClick={()=>{}}/><CheckboxText label="Electric" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Sink</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
              </div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={true} onClick={()=>{}}/><CheckboxText label="Warm" checked={false} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Bathroom */}
            <div className="flex border-b border-gray-300 py-2 items-end">
              <div className="w-24 font-bold text-xs">Bathroom</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Shower</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Tub</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Sink</span> <div className="flex flex-col"><CheckboxText label="1" checked={false} onClick={()=>{}}/><CheckboxText label="2" checked={true} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Toilet</span> <div className="flex flex-col"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div></div>
              </div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={true} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={true} onClick={()=>{}}/><CheckboxText label="Paint" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Bedroom */}
            <div className="flex py-2 items-end">
              <div className="w-24 font-bold text-xs">Bedroom</div>
              <div className="flex-1 flex gap-2">
                <div className="flex gap-1 items-end"><span className="text-[9px] font-bold">Bed</span> <div className="flex flex-col"><CheckboxText label="Twins" checked={false} onClick={()=>{}}/><CheckboxText label="Full" checked={false} onClick={()=>{}}/><CheckboxText label="Queen" checked={false} onClick={()=>{}}/><CheckboxText label="King" checked={true} onClick={()=>{}}/></div></div>
                <div className="flex gap-1 items-end pl-2">
                  <div className="flex flex-col items-end gap-[1px]">
                     <span className="text-[9px] font-bold">Vanity Table</span>
                     <span className="text-[9px] font-bold">Dresser</span>
                     <span className="text-[9px] font-bold">Bureau</span>
                     <span className="text-[9px] font-bold">Closet</span>
                  </div> 
                  <div className="flex flex-col gap-[1px]">
                     <div className="flex gap-2"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-2"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-2"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-2"><CheckboxText label="1" checked={false} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/><CheckboxText label="Walking" checked={true} onClick={()=>{}}/><CheckboxText label="Small" checked={false} onClick={()=>{}}/></div>
                  </div>  
                </div>
              </div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Tile" checked={data.finishes.floors === 'tile'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'tile'}})}/><CheckboxText label="Wood" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Stone" checked={data.finishes.floors === 'stone'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'stone'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>
          </div>

          {/* Outside Spaces */}
          <div className="border-b-2 border-black py-2">
             <span className="font-bold uppercase text-[10px] bg-gray-200 px-2 py-0.5">OUTSIDE</span>
            <div className="flex py-1 mt-2 items-end">
              <div className="w-48 font-bold flex gap-1 items-center">4 Elevations with <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 w-24 focus:border-black transition-colors" /></div>
              <div className="flex-1"></div>
              <div className="w-72 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={true} onClick={()=>{}}/><CheckboxText label="Concrete" checked={true} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Brick" checked={data.finishes.walls==='brick'} onClick={()=>setData({...data, finishes: {...data.finishes, walls: 'brick'}})}/><CheckboxText label="Stucco" checked={data.finishes.walls!=='brick'} onClick={()=>setData({...data, finishes: {...data.finishes, walls: 'warm_paint'}})}/><CheckboxText label="Sidding" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Steel" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Roof</span><div className="flex flex-col"><CheckboxText label="Clay Tile" checked={data.finishes.roof==='clay_tile'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'clay_tile'}})}/><CheckboxText label="Shingle" checked={data.finishes.roof==='shingle'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'shingle'}})}/><CheckboxText label="Steel" checked={data.finishes.roof==='steel'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'steel'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
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
                  {[1,2,3,4,5].map(n => <CheckboxText key={n} label={n.toString()} checked={data.inhabitantsCount === n} onClick={()=>setData({...data, inhabitantsCount: n})} />)}
                  <CheckboxText label="+5" checked={data.inhabitantsCount > 5} onClick={()=>setData({...data, inhabitantsCount: 6})} />
                </div>
                <div className="flex gap-12 mt-1 px-4 font-bold w-full">
                  <CheckboxText label="Female" checked={data.inhabitants[0]?.gender === 'female'} onClick={() => {let d = {...data}; if(!d.inhabitants[0]) d.inhabitants[0]={gender:'female',age:0,occupation:''}; else d.inhabitants[0].gender='female'; setData(d);}} />
                  <CheckboxText label="Male" checked={data.inhabitants[0]?.gender === 'male'} onClick={() => {let d = {...data}; if(!d.inhabitants[0]) d.inhabitants[0]={gender:'male',age:0,occupation:''}; else d.inhabitants[0].gender='male'; setData(d);}} />
                </div>
              </div>
              <div className="flex w-[60%]">
                <div className="w-1/3 px-2 flex flex-col gap-[3px] py-1 border-l-2 border-black">
                    <EditableText value={data.inhabitants.map(i => i.age).join(', ') || ''} onChange={(val) => {
                       let ages = val.split(',').map(s=>parseInt(s.trim())).filter(x=>!isNaN(x));
                       let newInh = [...data.inhabitants];
                       ages.forEach((a,idx) => { if(!newInh[idx]) newInh[idx] = {age:a, occupation:'', gender:''}; else newInh[idx].age = a; });
                       setData({...data, inhabitants: newInh});
                    }} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                    <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                    <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                </div>
                <div className="w-1/3 px-2 flex flex-col gap-[3px] py-1">
                    <EditableText value={data.inhabitants.map(i => i.occupation).join(', ') || ''} onChange={(val) => {
                       let occs = val.split(',').map(s=>s.trim());
                       let newInh = [...data.inhabitants];
                       occs.forEach((o,idx) => { if(!newInh[idx]) newInh[idx] = {age:0, occupation:o, gender:''}; else newInh[idx].occupation = o; });
                       setData({...data, inhabitants: newInh});
                    }} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                    <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                    <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                </div>
                <div className="w-1/3 px-2 flex flex-col gap-[3px] py-1">
                    <EditableText value={data.hobbies.join(', ') || ''} onChange={(val) => setData({...data, hobbies: val.split(',').map(s=>s.trim())})} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                    <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                    <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 text-center font-bold text-[10px] w-full" />
                </div>
              </div>
            </div>
            {/* Pets */}
            <div className="flex gap-3 items-end ml-[12%] font-bold text-[9px] -mt-5 pb-3 block">
               <div className="flex flex-col items-center"><span className="text-[9px] mb-[2px]">Pet</span><span className="font-normal opacity-70">Cat</span><span className="font-normal opacity-70">Dog</span><span className="font-normal opacity-70">Mouse</span></div>
               <div className="flex flex-col items-center"><span className="text-[9px] mb-[2px]">Yes</span><CheckboxText label="Fish" checked={data.pets.includes('fish' as any)} onClick={()=>{let d={...data}; if(!d.pets.includes('fish' as any)) d.pets.push('fish' as any); else d.pets=d.pets.filter(p=>p!=='fish'); setData(d);}}/><CheckboxText label="Bird" checked={data.pets.includes('bird' as any)} onClick={()=>{let d={...data}; if(!d.pets.includes('bird' as any)) d.pets.push('bird' as any); else d.pets=d.pets.filter(p=>p!=='bird'); setData(d);}}/><CheckboxText label="Other" checked={false} onClick={()=>{}}/></div>
               <div className="flex flex-col items-center"><span className="text-[9px] mb-[2px]">No</span><CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/><CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/><CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/></div>
            </div>

            {/* Q2 */}
            <div className="mt-1">
              <p>2.- Do you have <strong className="font-bold">frequent overnight guests?</strong></p>
              <div className="flex gap-6 font-bold px-2 mt-1">
                 <CheckboxText label="Yes" checked={data.frequentGuests} onClick={()=>setData({...data, frequentGuests: true})} />
                 <CheckboxText label="No" checked={!data.frequentGuests} onClick={()=>setData({...data, frequentGuests: false})} />
              </div>
            </div>

            {/* Q3 */}
            <div className="mt-2">
              <p>3.- What are your <strong className="font-bold">priorities</strong> for the house?</p>
              <div className="flex justify-between font-bold mt-1.5 w-full pr-12">
                <CheckboxText label="Energy Efficiency" checked={false} onClick={()=>{}} />
                <CheckboxText label="Grand Entry" checked={data.doubleHeight} onClick={()=>setData({...data, doubleHeight: !data.doubleHeight})} />
                <CheckboxText label="Circle Driveway" checked={false} onClick={()=>{}} />
                <CheckboxText label="Swimming Pool" checked={data.groundFloorSpaces.includes('pool') || data.upperFloorSpaces.includes('pool')} onClick={()=>{}} />
                <CheckboxText label="LED Lighting" checked={false} onClick={()=>{}} />
                <CheckboxText label="Surround-Sound Media Room" checked={data.groundFloorSpaces.includes('home_theater')} onClick={()=>{}} />
              </div>
              <div className="flex gap-2 items-end mt-4"><strong className="text-[10px] pb-0.5">Others</strong> <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 flex-1 focus:border-black transition-colors" /></div>
            </div>

            {/* Q4 */}
            <div className="mt-4">
              <p>4.- Are there any <strong className="font-bold">special concerns</strong> that need to be accommodated in the new design, such as accessibility for a <strong className="font-bold border-b border-gray-200 bg-gray-100 px-1">wheel chair or walker</strong>?</p>
              <div className="flex gap-6 items-center mt-2 font-bold px-2">
                 <CheckboxText label="Yes" checked={data.accessibilityNeeds} onClick={()=>setData({...data, accessibilityNeeds: true})} /> 
                 <CheckboxText label="No" checked={!data.accessibilityNeeds} onClick={()=>setData({...data, accessibilityNeeds: false})} /> 
              </div>
              <div className="flex gap-2 items-end mt-2 ml-20 -mt-6">
                 <strong className="text-[10px] pb-0.5">Others</strong> <EditableText value="" onChange={()=>{}} className="border-b border-gray-400 flex-1 ml-2 focus:border-black transition-colors" />
              </div>
            </div>

            {/* Q5 - 8 split column */}
            <div className="mt-4 flex gap-12">
              <div className="w-1/2">
                <p>5.- Which <strong className="font-bold">architectural style</strong> do you prefer?</p>
                <div className="flex flex-col font-bold mt-1 gap-1 items-start ml-2">
                  <CheckboxText label="Modern" checked={data.style === 'modern'} onClick={()=>setData({...data, style: 'modern'})} />
                  <CheckboxText label="Contemporary" checked={data.style === 'contemporary'} onClick={()=>setData({...data, style: 'contemporary'})} />
                  <CheckboxText label="Traditional" checked={data.style === 'traditional'} onClick={()=>setData({...data, style: 'traditional'})} />
                  <CheckboxText label="Colonial" checked={data.style === 'classic_colonial'} onClick={()=>setData({...data, style: 'classic_colonial'})} />
                  <CheckboxText label="Ranch/Rambler" checked={data.style === 'ranch'} onClick={()=>setData({...data, style: 'ranch'})} />
                  <CheckboxText label="Bungalow" checked={data.style === 'cottage'} onClick={()=>setData({...data, style: 'cottage'})} />
                  <CheckboxText label="Cape Cod" checked={false} onClick={()=>{}} />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end pb-4 space-y-6">
                <div className="space-y-1">
                  <p>6.- Favorite Color</p>
                  <EditableText value={data.favoriteColor} onChange={v => setData({...data, favoriteColor: v})} className="border-b border-gray-400 w-full font-bold px-2 pb-0.5 uppercase focus:border-black transition-colors" />
                </div>
                <div className="space-y-1">
                  <p>7.- Hate Color</p>
                  <EditableText value={data.forbiddenColors.join(', ')} onChange={v => setData({...data, forbiddenColors: v.split(',').map(s=>s.trim())})} className="border-b border-gray-400 w-full font-bold px-2 pb-0.5 uppercase focus:border-black transition-colors" />
                </div>
                <div className="space-y-1">
                  <p>8.- Favorite Room</p>
                  <EditableText value={t(data.favoriteRoom)} onChange={() => {}} className="border-b border-gray-400 w-full font-bold px-2 pb-0.5 uppercase focus:border-black transition-colors" />
                </div>
              </div>
            </div>

          </div>

          <div className="mt-auto pt-8 flex gap-4 items-end pb-4">
             <strong className="text-[10px] pb-0.5">Authorized Signature</strong> <div className="border-b border-gray-400 w-[30%]"></div>
             <strong className="text-[10px] ml-4 pb-0.5">Name:</strong> <div className="border-b border-gray-400 w-[30%] px-2 font-bold uppercase"><EditableText value={data.inhabitants[0]?.occupation || ''} onChange={v=>{let d={...data}; if(d.inhabitants[0]) d.inhabitants[0].occupation = v; setData(d);}} className="w-full text-center" /></div>
             <strong className="text-[10px] ml-4 pb-0.5">Date:</strong> <div className="border-b border-gray-400 w-32 px-2 font-bold uppercase text-center"><EditableText value={new Date().toLocaleDateString()} onChange={()=>{}} className="w-full text-center" /></div>
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
console.log("Successfully replaced BeforeDesignOriginalView with interactive version and image logo.");
