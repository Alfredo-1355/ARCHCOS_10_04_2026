const fs = require('fs');
const content = fs.readFileSync('src/features/SmartSchedule/SmartSchedule.tsx', 'utf8');

const s1 = content.indexOf('<div className="flex flex-col xl:flex-row gap-4">');
const lines = content.substring(s1).split('\n');

let open = 0;
let close = 0;

for (let i = 0; i < Math.min(lines.length, 1200); i++) {
  const line = lines[i];
  
  const naiveOpens = (line.match(/<div[\s>]/g) || []).length;
  const selfCloses = (line.match(/<div[^>]*\/>/g) || []).length;
  const actualOpens = naiveOpens - selfCloses;
  const closesInLine = (line.match(/<\/div>/g) || []).length;
  
  open += actualOpens;
  close += closesInLine;
  
  if (line.includes('SIDEBAR')) {
     console.log('Balance before SIDEBAR: Opens:', open, 'Closes:', close, 'Diff:', open - close);
  }
  
  if (line.includes('{/* Assignment Email Toast */}')) {
    console.log('Balance before TOAST: Opens:', open, 'Closes:', close, 'Diff:', open - close);
    break;
  }
}
