const fs = require('fs');
const content = fs.readFileSync('src/features/SmartSchedule/SmartSchedule.tsx', 'utf8');

const s1 = content.indexOf('<div className="flex flex-col xl:flex-row gap-4">');
const s2 = content.indexOf('{/* Assignment Email Toast */}', s1);

let chunk = content.substring(s1, s2);
const opens = (chunk.match(/<div(\s|>)/g)||[]).length;
const closes = (chunk.match(/<\/div>/g)||[]).length;
console.log('Ternary True Branch Opens:', opens, 'Closes:', closes, 'Diff:', opens - closes);
