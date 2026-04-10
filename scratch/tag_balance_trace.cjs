const fs = require('fs');
const content = fs.readFileSync('src/features/SmartSchedule/SmartSchedule.tsx', 'utf8');

const s1 = content.indexOf('<div className="flex flex-col xl:flex-row gap-4">');
if (s1 === -1) {
    console.error("Could not find start point");
    process.exit(1);
}
const lines = content.substring(s1).split('\n');

let open = 0;
let close = 0;

console.log("Tracing DIV balance from line " + (content.substring(0, s1).split('\n').length) + ":");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const absLineNum = content.substring(0, s1).split('\n').length + i;
  
  const naiveOpens = (line.match(/<div[\s>]/g) || []).length;
  const selfCloses = (line.match(/<div[^>]*\/>/g) || []).length;
  const actualOpens = naiveOpens - selfCloses;
  const closesInLine = (line.match(/<\/div>/g) || []).length;
  
  if (actualOpens !== 0 || closesInLine !== 0) {
      open += actualOpens;
      close += closesInLine;
      console.log(`Line ${absLineNum}: Open=${open}, Close=${close}, Balance=${open - close} | ${line.trim().substring(0, 40)}`);
  }
  
  if (line.includes('SIDEBAR')) {
     console.log('--- SIDEBAR reached ---');
  }
  
  if (line.includes('{/* Assignment Email Toast */}')) {
    console.log('--- TOAST reached ---');
    break;
  }
}
