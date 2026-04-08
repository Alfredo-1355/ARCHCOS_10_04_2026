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

function BeforeDesignOriginalView({ program, language, t, onClose, updateProgram }: { program: ArchitecturalProgram, language: Language, t: (key: any) => string, onClose: () => void, updateProgram?: any }) {
  const [data, setData] = useState<ArchitecturalProgram>(JSON.parse(JSON.stringify(program)));

  useEffect(() => {
    if (updateProgram) {
      updateProgram(data);
    }
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  const CheckboxText = ({ label, checked, onClick }: { label: string, checked: boolean, onClick: () => void }) => (
    <div className="flex flex-col items-center cursor-pointer hover:bg-black/5 px-1 py-0.5 rounded transition-colors select-none" onClick={onClick}>
      <span className={\`text-[9px] leading-tight \${checked ? 'font-bold underline decoration-[1.5px] decoration-black underline-offset-2' : 'opacity-60 font-normal'}\`}>{label}</span>
    </div>
  );

  const EditableText = ({ value, onChange, className = "", align="left" }: { value: string, onChange: (val: string) => void, className?: string, align?: "left"|"center"|"right" }) => (
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className={\`bg-transparent outline-none focus:bg-yellow-100/50 print:bg-transparent placeholder-black/30 text-\${align} border-b border-black \${className}\`}
    />
  );

  const getAgeValues = () => data.inhabitants.map(i => i.age).join(', ') || '';
  const getOccValues = () => data.inhabitants.map(i => i.occupation).join(', ') || '';
  const getHobValues = () => data.hobbies.join(', ') || '';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 overflow-y-auto no-scrollbar print:bg-white print:p-0"
    >
      <div className="min-h-screen flex flex-col items-center py-10 print:py-0">
        <div className="w-full max-w-[8.5in] flex justify-between items-center mb-6 px-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-brand-ink/80 text-white rounded-xl hover:bg-brand-ink transition-all backdrop-blur-md"
          >
            <ArrowLeft size={18} /> {t('back_to_summary')}
          </button>
          <div className="text-white text-sm opacity-80 backdrop-blur-md bg-black/20 px-4 py-2 rounded-xl">
             Los campos subrayados y las opciones son editables.
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-brand-blue-dark text-white font-bold rounded-xl hover:bg-brand-blue-dark/80 transition-all shadow-lg"
          >
            <Printer size={18} /> {language === 'en' ? 'Print Document' : 'Imprimir Documento'}
          </button>
        </div>

        <div className="w-[8.5in] bg-white text-black font-sans p-[0.4in] print:w-full print:p-0 mx-auto text-[10px] leading-tight flex flex-col gap-3 relative shadow-2xl print:shadow-none">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1 w-[35%]">
              <img src="/logo.png" alt="Archcos Logo" className="h-16 object-contain object-left mb-1" onError={(e) => {
                e.currentTarget.style.display='none';
                e.currentTarget.nextElementSibling!.style.display='block';
              }} />
              <div className="hidden" style={{display: 'none'}}>
                  <h1 className="text-4xl font-bold tracking-tighter">ARCHCOS</h1>
              </div>
              <p className="font-serif italic text-[10px] text-gray-800 tracking-widest pl-1 mt-1">Others build houses, we build HOMES!</p>
            </div>
            
            <div className="flex-1 flex justify-center pt-4">
              <div className="px-10 py-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border border-gray-300 shadow-sm relative ml-8">
                <h1 className="text-2xl font-serif tracking-widest text-gray-800 text-center uppercase">Before<br/>Design</h1>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black opacity-20" />
              </div>
            </div>

            <div className="w-[35%] text-right flex flex-col items-end gap-[4px] pt-2">
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Customer</span><EditableText align="right" value={data.inhabitants[0]?.occupation || ''} onChange={v => {let newData = {...data}; if(newData.inhabitants[0]) newData.inhabitants[0].occupation = v; setData(newData);}} className="flex-1 px-1 font-bold text-xs" /></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Address</span><EditableText align="right" value={data.footprint === 'rectangular' ? 'Standard Lot' : data.footprint === 'l_shape' ? 'Corner' : 'Estate'} onChange={v => setData({...data, footprint: v as any})} className="flex-1 px-1 font-bold text-xs" /></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">City, State, ZIP</span><EditableText align="right" value="Local" onChange={()=>{}} className="flex-1 px-1 font-bold text-xs" /></div>
              <div className="flex w-full items-end"><span className="text-left w-24 pr-2 text-xs">Date</span><EditableText align="right" value={new Date().toLocaleDateString()} onChange={()=>{}} className="flex-1 px-1 font-bold text-xs" /></div>
            </div>
          </div>

          {/* Construction Type */}
          <div className="flex justify-between font-bold mb-1 uppercase tracking-wider text-[11px] py-1">
            <div className="flex items-center"><span className="font-normal uppercase mr-2 opacity-80">TYPE OF CONSTRUCTION</span> <EditableText align="left" value="RESIDENTIAL" onChange={()=>{}} className="w-32 uppercase font-bold border-none" /></div>
            <div className="flex items-center"><span className="font-normal uppercase mr-2 opacity-80">SIZE</span> <EditableText align="center" value="" onChange={()=>{}} className="w-16 font-bold bg-yellow-100/30" /> <span className="font-normal uppercase ml-4 opacity-80 mr-2">SQFT</span> <EditableText align="center" value="" onChange={()=>{}} className="w-16 font-bold bg-yellow-100/30" /></div>
          </div>

          {/* Inside Spaces */}
          <div className="border-t-[3px] border-b-[3px] border-black py-4 mt-2">
            <span className="font-bold uppercase text-[10px] bg-gray-200 px-3 py-1">INSIDE SPACES</span>
            
            {/* Kitchen */}
            <div className="flex border-b border-gray-300 py-3 items-end mt-4">
              <div className="w-24 font-bold text-xs">Kitchen</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Stove</span> <CheckboxText label="Gas" checked={false} onClick={()=>{}}/><CheckboxText label="Electric" checked={true} onClick={()=>{}}/></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Refrigerator</span> <CheckboxText label="Small" checked={false} onClick={()=>{}}/><CheckboxText label="Highest" checked={true} onClick={()=>{}}/></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Dishwasher</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div> </div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Hood/Microwave</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div> </div>
              </div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Tile" checked={data.finishes.floors === 'tile'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'tile'}})}/><CheckboxText label="Wood" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Stone" checked={data.finishes.floors === 'stone'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'stone'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Laundry */}
            <div className="flex border-b border-gray-300 py-3 items-end">
              <div className="w-24 font-bold text-xs">Laundry</div>
              <div className="flex-1 flex gap-4 pr-12">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Washer</span> <div className="flex flex-col"><CheckboxText label="Commercial" checked={false} onClick={()=>{}}/><CheckboxText label="Special" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Dryer</span> <div className="flex flex-col"><CheckboxText label="Gas" checked={false} onClick={()=>{}}/><CheckboxText label="Electric" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Sink</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
              </div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={true} onClick={()=>{}}/><CheckboxText label="Warm" checked={false} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Bathroom */}
            <div className="flex border-b border-gray-300 py-3 items-end">
              <div className="w-24 font-bold text-xs">Bathroom</div>
              <div className="flex-1 flex gap-4">
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Shower</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Tub</span> <div className="flex flex-col"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Sink</span> <div className="flex flex-col"><CheckboxText label="1" checked={false} onClick={()=>{}}/><CheckboxText label="2" checked={true} onClick={()=>{}}/></div></div>
                <div className="flex gap-2 items-end"><span className="text-[9px] font-bold">Toilet</span> <div className="flex flex-col"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div></div>
              </div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={true} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={true} onClick={()=>{}}/><CheckboxText label="Paint" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>

            {/* Bedroom */}
            <div className="flex py-3 items-end">
              <div className="w-24 font-bold text-xs">Bedroom</div>
              <div className="flex-1 flex gap-2">
                <div className="flex gap-1 items-end"><span className="text-[9px] font-bold">Bed</span> <div className="flex flex-col gap-[2px]"><CheckboxText label="Twins" checked={false} onClick={()=>{}}/><CheckboxText label="Full" checked={false} onClick={()=>{}}/><CheckboxText label="Queen" checked={false} onClick={()=>{}}/><CheckboxText label="King" checked={true} onClick={()=>{}}/></div></div>
                <div className="flex gap-1 items-end pl-2">
                  <div className="flex flex-col items-end gap-[4px] mr-1 mb-1">
                     <span className="text-[9px] font-bold leading-none">Vanity Table</span>
                     <span className="text-[9px] font-bold leading-none">Dresser</span>
                     <span className="text-[9px] font-bold leading-none">Bureau</span>
                     <span className="text-[9px] font-bold leading-none mt-1">Closet</span>
                  </div> 
                  <div className="flex flex-col gap-[3px]">
                     <div className="flex gap-2 justify-start"><CheckboxText label="Yes" checked={true} onClick={()=>{}}/><CheckboxText label="No" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-2 justify-start"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-2 justify-start"><CheckboxText label="1" checked={true} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/></div>
                     <div className="flex gap-3 justify-start"><CheckboxText label="1" checked={false} onClick={()=>{}}/><CheckboxText label="2" checked={false} onClick={()=>{}}/><CheckboxText label="Walking" checked={true} onClick={()=>{}}/><span className="opacity-60 text-[9px]">Small</span></div>
                  </div>  
                </div>
              </div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Laminate" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Tile" checked={data.finishes.floors === 'tile'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'tile'}})}/><CheckboxText label="Wood" checked={data.finishes.floors === 'wood_laminate'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'wood_laminate'}})}/><CheckboxText label="Stone" checked={data.finishes.floors === 'stone'} onClick={()=>setData({...data, finishes: {...data.finishes, floors: 'stone'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Stucco" checked={true} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Ceiling</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Paint" checked={true} onClick={()=>{}}/><CheckboxText label="Stucco" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>
          </div>

          {/* Outside Spaces */}
          <div className="border-b-[3px] border-black py-4">
            <span className="font-bold uppercase text-[10px] bg-gray-200 px-3 py-1">OUTSIDE</span>
            <div className="flex py-1 mt-4 items-end">
              <div className="w-64 font-bold flex gap-1 items-center">4 Elevations with <EditableText value="" onChange={()=>{}} className="flex-1 bg-yellow-100/30" /></div>
              <div className="flex-1"></div>
              <div className="w-80 flex gap-4 pr-4">
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Floor</span><div className="flex flex-col"><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Wood" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={true} onClick={()=>{}}/><CheckboxText label="Concrete" checked={true} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Wall</span><div className="flex flex-col"><CheckboxText label="Brick" checked={data.finishes.walls==='brick'} onClick={()=>setData({...data, finishes: {...data.finishes, walls: 'brick'}})}/><CheckboxText label="Stucco" checked={data.finishes.walls!=='brick'} onClick={()=>setData({...data, finishes: {...data.finishes, walls: 'warm_paint'}})}/><CheckboxText label="Sidding" checked={false} onClick={()=>{}}/><CheckboxText label="Tile" checked={false} onClick={()=>{}}/><CheckboxText label="Steel" checked={false} onClick={()=>{}}/><CheckboxText label="Stone" checked={false} onClick={()=>{}}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Roof</span><div className="flex flex-col"><CheckboxText label="Clay Tile" checked={data.finishes.roof==='clay_tile'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'clay_tile'}})}/><CheckboxText label="Shingle" checked={data.finishes.roof==='shingle'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'shingle'}})}/><CheckboxText label="Steel" checked={data.finishes.roof==='steel'} onClick={()=>setData({...data, finishes: {...data.finishes, roof: 'steel'}})}/></div></div>
                 <div className="flex gap-1 items-end"><span className="text-[9px] mr-1 font-bold">Color</span><div className="flex flex-col"><CheckboxText label="Neutral" checked={false} onClick={()=>{}}/><CheckboxText label="Warm" checked={true} onClick={()=>{}}/><CheckboxText label="Cold" checked={false} onClick={()=>{}}/></div></div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-end border-b-[3px] border-black pb-2">
              <span className="font-bold uppercase text-[10px] bg-gray-200 px-3 py-1">QUESTIONS</span>
              <div className="flex w-[60%] border-l-2 border-black">
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80 pt-1">AGES</span>
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80 pt-1">OCCUPATIONS</span>
                <span className="font-bold uppercase text-[10px] w-1/3 text-center opacity-80 pt-1">HOBBIES</span>
              </div>
            </div>

            {/* Q1 */}
            <div className="flex gap-4">
              <div className="w-[40%] flex flex-col gap-3">
                <p>1.- How <strong className="font-bold">many persons</strong> will be living in this building?</p>
                <div className="flex justify-between px-6 font-bold opacity-60">
                  <span className={\`text-[9px] \${data.inhabitantsCount === 1 ? 'font-bold underline text-black opacity-100' : ''}\`}>1</span>
                  <span className={\`text-[9px] \${data.inhabitantsCount === 2 ? 'font-bold underline text-black opacity-100' : ''}\`}>2</span>
                  <span className={\`text-[9px] \${data.inhabitantsCount === 3 ? 'font-bold underline text-black opacity-100' : ''}\`}>3</span>
                  <span className={\`text-[9px] \${data.inhabitantsCount === 4 ? 'font-bold underline text-black opacity-100' : ''}\`}>4</span>
                  <span className={\`text-[9px] \${data.inhabitantsCount === 5 ? 'font-bold underline text-black opacity-100' : ''}\`}>5</span>
                  <span className={\`text-[9px] \${data.inhabitantsCount > 5 ? 'font-bold underline text-black opacity-100' : ''}\`}>+5</span>
                </div>
                <div className="flex gap-12 mt-2 px-4 font-bold w-full">
                  <CheckboxText label="Female" checked={data.inhabitants[0]?.gender === 'female'} onClick={() => {let d = {...data}; if(!d.inhabitants[0]) d.inhabitants[0]={gender:'female',age:0,occupation:''}; else d.inhabitants[0].gender='female'; setData(d);}} />
                  <div className="flex flex-col gap-1 items-start">
                     <CheckboxText label="Male" checked={data.inhabitants[0]?.gender === 'male'} onClick={() => {let d = {...data}; if(!d.inhabitants[0]) d.inhabitants[0]={gender:'male',age:0,occupation:''}; else d.inhabitants[0].gender='male'; setData(d);}} />
                     <div className="flex gap-4 items-start pt-2">
                        <div className="flex flex-col gap-[2px]">
                           <span className="font-bold text-[9px] text-center mb-1">Pet</span>
                           <span className="text-[9px] opacity-60">Cat</span>
                           <span className="text-[9px] opacity-60">Dog</span>
                           <span className="text-[9px] opacity-60">Mouse</span>
                        </div>
                        <div className="flex flex-col gap-[2px]">
                           <span className="font-bold text-[9px] text-center mb-1">Yes</span>
                           <CheckboxText label="Fish" checked={data.pets.includes('fish' as any)} onClick={()=>{let d={...data}; if(!d.pets.includes('fish' as any)) d.pets.push('fish' as any); else d.pets=d.pets.filter(p=>p!=='fish'); setData(d);}}/>
                           <CheckboxText label="Bird" checked={data.pets.includes('bird' as any)} onClick={()=>{let d={...data}; if(!d.pets.includes('bird' as any)) d.pets.push('bird' as any); else d.pets=d.pets.filter(p=>p!=='bird'); setData(d);}}/>
                           <span className="text-[9px] opacity-60">Other</span>
                        </div>
                        <div className="flex flex-col gap-[2px]">
                           <span className="font-bold text-[9px] text-center mb-1">No</span>
                           <CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/>
                           <CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/>
                           <CheckboxText label=" " checked={data.pets.length===0} onClick={()=>setData({...data, pets: []})}/>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              <div className="flex w-[60%] border-l-2 border-black pl-1">
                <div className="w-1/3 px-2 flex flex-col gap-2 py-1">
                    <EditableText align="center" value={getAgeValues()} onChange={(val) => {
                       let ages = val.split(',').map(s=>parseInt(s.trim())).filter(x=>!isNaN(x));
                       let newInh = [...data.inhabitants];
                       ages.forEach((a,idx) => { if(!newInh[idx]) newInh[idx] = {age:a, occupation:'', gender:''}; else newInh[idx].age = a; });
                       setData({...data, inhabitants: newInh});
                    }} className="w-full font-bold bg-yellow-100/30" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                </div>
                <div className="w-1/3 px-2 flex flex-col gap-2 py-1">
                    <EditableText align="center" value={getOccValues()} onChange={(val) => {
                       let occs = val.split(',').map(s=>s.trim());
                       let newInh = [...data.inhabitants];
                       occs.forEach((o,idx) => { if(!newInh[idx]) newInh[idx] = {age:0, occupation:o, gender:''}; else newInh[idx].occupation = o; });
                       setData({...data, inhabitants: newInh});
                    }} className="w-full font-bold bg-yellow-100/30" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                </div>
                <div className="w-1/3 px-2 flex flex-col gap-2 py-1">
                    <EditableText align="center" value={getHobValues()} onChange={(val) => setData({...data, hobbies: val.split(',').map(s=>s.trim())})} className="w-full font-bold bg-yellow-100/30" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                    <EditableText align="center" value="" onChange={()=>{}} className="w-full font-bold" />
                </div>
              </div>
            </div>

            {/* Q2 */}
            <div className="mt-8">
              <p>2.- Do you have <strong className="font-bold">frequent overnight guests?</strong></p>
              <div className="flex gap-6 font-bold px-2 mt-2">
                 <CheckboxText label="Yes" checked={data.frequentGuests} onClick={()=>setData({...data, frequentGuests: true})} />
                 <CheckboxText label="No" checked={!data.frequentGuests} onClick={()=>setData({...data, frequentGuests: false})} />
              </div>
            </div>

            {/* Q3 */}
            <div className="mt-4">
              <p>3.- What are your <strong className="font-bold">priorities</strong> for the house?</p>
              <div className="flex justify-between font-bold mt-3 w-full pr-12 text-[10px] opacity-60">
                <span className={\`\${false ? 'font-bold underline text-black opacity-100' : ''}\`}>Energy Efficiency</span>
                <span className={\`\${data.doubleHeight ? 'font-bold underline text-black opacity-100' : ''}\`}>Grand Entry</span>
                <span className={\`\${false ? 'font-bold underline text-black opacity-100' : ''}\`}>Circle Driveway</span>
                <span className={\`\${data.groundFloorSpaces.includes('pool') || data.upperFloorSpaces.includes('pool') ? 'font-bold underline text-black opacity-100' : ''}\`}>Swimming Pool</span>
                <span className={\`\${false ? 'font-bold underline text-black opacity-100' : ''}\`}>LED Lighting</span>
                <span className={\`\${data.groundFloorSpaces.includes('home_theater') ? 'font-bold underline text-black opacity-100' : ''}\`}>Surround-Sound Media Room</span>
              </div>
              <div className="flex gap-2 items-end mt-5">
                 <strong className="text-[10px] pb-0.5">Others</strong> 
                 <EditableText align="left" value="" onChange={()=>{}} className="flex-1 bg-yellow-100/30 h-5" />
              </div>
            </div>

            {/* Q4 */}
            <div className="mt-6">
              <p>4.- Are there any <strong className="font-bold">special concerns</strong> that need to be accommodated in the new design, such as accessibility for a <strong className="font-bold bg-gray-100 px-1 border border-black/10 shadow-sm">wheel chair or walker</strong>?</p>
              <div className="flex gap-6 items-center mt-3 font-bold px-2">
                 <CheckboxText label="Yes" checked={data.accessibilityNeeds} onClick={()=>setData({...data, accessibilityNeeds: true})} /> 
                 <CheckboxText label="No" checked={!data.accessibilityNeeds} onClick={()=>setData({...data, accessibilityNeeds: false})} /> 
              </div>
              <div className="flex gap-2 items-end mt-4">
                 <strong className="text-[10px] pb-0.5">Others</strong> 
                 <EditableText align="left" value="" onChange={()=>{}} className="flex-1 bg-yellow-100/30 h-5" />
              </div>
            </div>

            {/* Q5 - 8 split column */}
            <div className="mt-8 flex gap-12 border-t-[3px] border-black border-dashed pt-6 pl-4">
              <div className="w-1/2">
                <p className="mb-3">5.- Which <strong className="font-bold">architectural style</strong> do you prefer?</p>
                <div className="flex flex-col font-bold gap-2 items-start ml-2 opacity-60">
                  <span className={\`text-[9px] \${data.style === 'modern' ? 'font-bold underline text-black opacity-100' : ''}\`}>Modern</span>
                  <span className={\`text-[9px] \${data.style === 'contemporary' ? 'font-bold underline text-black opacity-100' : ''}\`}>Contemporary</span>
                  <span className={\`text-[9px] \${data.style === 'traditional' ? 'font-bold underline text-black opacity-100' : ''}\`}>Traditional</span>
                  <span className={\`text-[9px] \${data.style === 'classic_colonial' ? 'font-bold underline text-black opacity-100' : ''}\`}>Colonial</span>
                  <span className={\`text-[9px] \${data.style === 'ranch' ? 'font-bold underline text-black opacity-100' : ''}\`}>Ranch/Rambler</span>
                  <span className={\`text-[9px] \${data.style === 'cottage' ? 'font-bold underline text-black opacity-100' : ''}\`}>Bungalow</span>
                  <span className={\`text-[9px] \${false ? 'font-bold underline text-black opacity-100' : ''}\`}>Cape Cod</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-start pb-4 space-y-8">
                <div className="space-y-2">
                  <p>6.- Favorite Color</p>
                  <EditableText align="center" value={data.favoriteColor} onChange={v => setData({...data, favoriteColor: v})} className="w-64 font-bold pb-0.5 uppercase" />
                </div>
                <div className="space-y-2">
                  <p>7.- Hate Color</p>
                  <EditableText align="center" value={data.forbiddenColors.join(', ')} onChange={v => setData({...data, forbiddenColors: v.split(',').map(s=>s.trim())})} className="w-64 font-bold pb-0.5 uppercase" />
                </div>
                <div className="space-y-2">
                  <p>8.- Favorite Room</p>
                  <EditableText align="center" value={t(data.favoriteRoom)} onChange={() => {}} className="w-64 font-bold pb-0.5 uppercase" />
                </div>
              </div>
            </div>

          </div>

          <div className="mt-auto pt-12 flex gap-4 items-end pb-8 pl-4">
             <strong className="text-[10px] pb-0.5 whitespace-nowrap">Authorized<br/>Signature</strong> <div className="border-b border-black w-[30%] ml-2 border-dashed"></div>
             <strong className="text-[10px] ml-12 pb-0.5">Name:</strong> <EditableText align="center" value={data.inhabitants[0]?.occupation || ''} onChange={v=>{let d={...data}; if(d.inhabitants[0]) d.inhabitants[0].occupation = v; setData(d);}} className="w-48 font-bold uppercase" />
             <strong className="text-[10px] ml-12 pb-0.5">Date:</strong> <EditableText align="center" value={new Date().toLocaleDateString()} onChange={()=>{}} className="w-32 font-bold uppercase" />
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
console.log("Successfully styled BeforeDesignOriginalView");
