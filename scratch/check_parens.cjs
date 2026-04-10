const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\alfre\\Desktop\\Programa_Arquitectonico_ARCHCOS\\src\\features\\SmartSchedule\\SmartSchedule.tsx', 'utf8');

let parens = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let char of line) {
        if (char === '(') parens++;
        if (char === ')') parens--;
    }
    if (parens < 0) {
        console.log(`Mismatch at line ${i + 1}: ${line.trim()}`);
        process.exit(1);
    }
}
console.log(`Final balance: ${parens}`);
