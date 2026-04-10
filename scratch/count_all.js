
import fs from 'fs';

const content = fs.readFileSync('src/features/SmartSchedule/SmartSchedule.tsx', 'utf8');
const lines = content.split('\n');

let divBal = 0;
let braceBal = 0;
let parenBal = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const divOpen = (line.match(/<div/g) || []).length;
    const divClose = (line.match(/<\/div>/g) || []).length;
    divBal += divOpen - divClose;

    const braceOpen = (line.match(/{/g) || []).length;
    const braceClose = (line.match(/}/g) || []).length;
    braceBal += braceOpen - braceClose;

    const parenOpen = (line.match(/\(/g) || []).length;
    const parenClose = (line.match(/\)/g) || []).length;
    parenBal += parenOpen - parenClose;

    // We only care about the area after line 1120
    if (i + 1 >= 1120 && (divOpen > 0 || divClose > 0 || braceOpen > 0 || braceClose > 0 || parenOpen > 0 || parenClose > 0)) {
        console.log(`${i + 1}: D:${divBal} B:${braceBal} P:${parenBal} | ${line.trim()}`);
    }
}
