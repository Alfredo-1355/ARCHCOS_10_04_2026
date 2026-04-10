const fs = require('fs');
const content = fs.readFileSync('src/features/SmartSchedule/SmartSchedule.tsx', 'utf8');

const s1 = content.indexOf('<div className="flex flex-col xl:flex-row gap-4">');
if (s1 === -1) {
  console.log('Flex row start not found');
  process.exit(1);
}

// Find the corresponding `)}` which should be around line 2404
const lines = content.split('\n');
let s2_line = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(')}')) {
    s2_line = i;
  }
}

const chunk = lines.slice(content.substring(0, s1).split('\n').length - 1, s2_line).join('\n');
const opens = (chunk.match(/<div(\s|>)/g)||[]).length;
const closes = (chunk.match(/<\/div>/g)||[]).length;
console.log('Opens:', opens, 'Closes:', closes, 'Balance:', opens - closes);
