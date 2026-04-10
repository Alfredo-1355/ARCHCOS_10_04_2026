const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\alfre\\Desktop\\Programa_Arquitectonico_ARCHCOS\\src\\features\\SmartSchedule\\SmartSchedule.tsx', 'utf8');

let braces = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let char of line) {
        if (char === '{') braces++;
        if (char === '}') braces--;
    }
    if (line.includes('return (')) {
        console.log(`Balance at line ${i + 1} (return start): ${braces}`);
    }
}
console.log(`Final balance: ${braces}`);
