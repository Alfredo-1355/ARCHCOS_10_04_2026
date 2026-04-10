const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\alfre\\Desktop\\Programa_Arquitectonico_ARCHCOS\\src\\features\\SmartSchedule\\SmartSchedule.tsx', 'utf8');

let braces = 0;
let parens = 0;
let inReturn = false;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('return (')) inReturn = true;
    if (!inReturn) continue;

    for (let char of line) {
        if (char === '{') braces++;
        if (char === '}') braces--;
        if (char === '(') parens++;
        if (char === ')') parens--;
    }
    if (braces < 0) {
        console.log(`Negative braces balance found at line ${i + 1}: ${line.trim()}`);
        // break;
    }
}
