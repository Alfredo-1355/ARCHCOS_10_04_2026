const fs = require('fs');
const content = fs.readFileSync('src/features/SmartSchedule/SmartSchedule.tsx', 'utf8');

const s1 = content.indexOf('<div className="flex flex-col xl:flex-row gap-4">');
const lines = content.substring(s1).split('\n');

let open = 0;
let close = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // This Regex carefully avoids matching <div ... /> as an open tag!
  // It only matches <div > or <div className="..">
  const opensInLine = (line.match(/<div(\s+className="[^"]*")?(\s*id="[^"]*")?\s*>/g) || []).length;
  // A naive approach: count `<div ` but subtract `<div ... />`
  const naiveOpens = (line.match(/<div[\s>]/g) || []).length;
  const selfCloses = (line.match(/<div[^>]*\/>/g) || []).length;
  const actualOpens = naiveOpens - selfCloses;
  
  const closesInLine = (line.match(/<\/div>/g) || []).length;
  
  open += actualOpens;
  close += closesInLine;
  
  // Stop at the end of the ternary
  if (line.includes(')}')) {
    console.log('Final branch balance! Opens:', open, 'Closes:', close, 'Diff:', open - close);
    break;
  }
}
