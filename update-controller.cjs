const fs = require('fs');

try {
  let code = fs.readFileSync('src/components/SmartScheduleView.tsx', 'utf8');

  // 1. Add Drag states to the main component
  const stateInjection = `
  const[dragItem,setDragItem]=useState<{catId:string;taskId:string}|null>(null);
  const[dragOverObj,setDragOverObj]=useState<{catId:string;taskId:string}|null>(null);
  const[avatarMenu,setAvatarMenu]=useState<{catId:string,taskId:string,wi:number,rect:DOMRect}|null>(null);
  `;
  
  if(!code.includes('dragItem')) {
    code = code.replace(/const\[drag,setDrag\]=useState<.*>\(null\);/g, "const[drag,setDrag]=useState<{catId:string;taskId:string;toggling:boolean}|null>(null);\n" + stateInjection);
  }

  // 2. Add Handler Functions just before `const gen=()=>{`
  const handlerInjection = `
  const onDragStartR=(e:any,catId:string,taskId:string)=>{setDragItem({catId,taskId});e.dataTransfer.effectAllowed='move';};
  const onDragOverR=(e:any,catId:string,taskId:string)=>{e.preventDefault();setDragOverObj({catId,taskId});};
  const onDropR=(e:any,catId:string,taskId:string)=>{
    e.preventDefault();if(!dragItem)return;
    setCats(prev=>{
      const p=JSON.parse(JSON.stringify(prev));
      const sC=p.find((c:any)=>c.id===dragItem.catId);if(!sC)return prev;
      const sIdx=sC.tasks.findIndex((t:any)=>t.id===dragItem.taskId);if(sIdx<0)return prev;
      const [moved]=sC.tasks.splice(sIdx,1);
      const tC=p.find((c:any)=>c.id===catId)||sC;
      let tIdx=tC.tasks.findIndex((t:any)=>t.id===taskId);if(tIdx<0)tIdx=tC.tasks.length;
      tC.tasks.splice(tIdx,0,moved);
      return p;
    });
    setDragItem(null);setDragOverObj(null);
  };
  
  const assignFromMenu=(uid:string, cid:string, tid:string)=>{
     updAssignee(cid,tid,uid);
     setAvatarMenu(null);
  };
  `;
  
  if(!code.includes('onDragStartR')) {
     code = code.replace(/const gen=\(\)=>\{/g, handlerInjection + "\n  const gen=()=>{");
  }

  // 3. Inject Draggable properties into the Row `div`
  // We look for: <div key={task.id} className="flex border-b border-[#F1F5F9] hover:bg-[#F8FAFC]/50 transition-colors group">
  // Since it has the task.id key, it's specific.
  const rowRegex = /<div key=\{task\.id\}\s+className="flex border-b border-\[#F1F5F9\] hover:bg-\[#F8FAFC\]\/50 transition-colors group"/g;
  code = code.replace(rowRegex, `<div key={task.id} draggable onDragStart={(e)=>onDragStartR(e,cat.id,task.id)} onDragOver={(e)=>onDragOverR(e,cat.id,task.id)} onDrop={(e)=>onDropR(e,cat.id,task.id)} className={\`flex border-b border-[#F1F5F9] hover:bg-[#F8FAFC]/50 transition-colors group \${dragOverObj?.taskId===task.id?'border-t-2 border-t-[#1A56DB]':''}\`}`);

  // 4. Double-Click Avatar logic in the Grid
  // We need to find the `Avatar Overlay` and change it, or inject a hidden circle that triggers `setAvatarMenu`.
  // Find `{!prev&&(isCrit||isRevT)&&task.progress>0&&<span className="relative z-10 text-[8px] font-black text-white px-0.5">{task.progress}%</span>}`
  // Find `{showAvatar && tm && (`
  
  const avatarFindStr = `{showAvatar && tm && (`;
  const avatarReplacement = `
  {!active && !prev && !next && (
     <div className="absolute opacity-0 group-hover:opacity-100 hover:scale-125 w-4 h-4 rounded-full border border-dashed border-[#CBD5E1] text-[#94A3B8] flex items-center justify-center text-[10px] z-20 cursor-pointer bg-white -left-2" 
          title="Asignar (Doble clic)" onClick={e=>e.stopPropagation()} onDoubleClick={(e)=>{e.stopPropagation();setAvatarMenu({catId:cat.id,taskId:task.id,wi,rect:e.currentTarget.getBoundingClientRect()});}}>+</div>
  )}
  {showAvatar && tm && (
    <div onClick={(e)=>e.stopPropagation()} onDoubleClick={(e)=>{e.stopPropagation();setAvatarMenu({catId:cat.id,taskId:task.id,wi,rect:e.currentTarget.getBoundingClientRect()});}}
  `;
  if(!code.includes('title="Asignar (Doble clic)"')) {
    code = code.replace(avatarFindStr, avatarReplacement);
  }

  // Remove pointer events none to allow avatar double click:
  // pointer-events-none might not be on the avatar wrapper itself.
  
  // 5. Add Avatar Floating Menu exactly before the final </div> of the Table section.
  const menuCode = `
            {/* AVATAR FLOATING MENU */}
            {avatarMenu && (
              <div style={{ position: 'fixed', top: avatarMenu.rect.bottom + 5, left: avatarMenu.rect.left, zIndex: 9999 }} className="bg-white border border-[#E2E8F0] shadow-xl rounded-xl w-48 p-2 flex flex-col gap-1 fade-in">
                <div className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest px-2 pb-1 border-b mb-1">Asignar Equipo</div>
                {TEAM_MEMBERS.map(tm => {
                  return (
                    <button key={tm.id} onClick={(e) => { e.stopPropagation(); assignFromMenu(tm.id, avatarMenu.catId, avatarMenu.taskId); }} className="flex items-center justify-between p-1.5 hover:bg-[#F8FAFC] rounded cursor-pointer text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#1A56DB] rounded-full text-white flex items-center justify-center text-[7px] font-bold">{tm.avatar}</div>
                        <span className="text-xs font-semibold text-[#0A192F]">{tm.name}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
  `;
  
  // We insert this before `{/* SIDEBAR SCORER */}`
  if(!code.includes('AVATAR FLOATING MENU')) {
     code = code.replace(/\{\/\* SIDEBAR SCORER \*\/\}/g, menuCode + "\n          {/* SIDEBAR SCORER */}");
  }
  
  // 6. Support onClick to close menu on the main wrapper
  code = code.replace(/<div className="bg-\[#F8FAFC\] h-full overflow-y-auto font-sans text-\[#0A192F\]" onMouseUp=\{onMouseUp\}>/, '<div className="bg-[#F8FAFC] h-full overflow-y-auto font-sans text-[#0A192F]" onMouseUp={onMouseUp} onClick={()=>setAvatarMenu(null)}>');

  fs.writeFileSync('src/components/SmartScheduleView.tsx', code);
  console.log("✓ Controller Phase 3 executed: Drag & Drop + DoubleClick applied.");
} catch(e) {
  console.error("Error: ", e);
}
