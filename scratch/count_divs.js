const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\alfre\\Desktop\\Programa_Arquitectonico_ARCHCOS\\src\\features\\SmartSchedule\\SmartSchedule.tsx', 'utf8');

let openDivs = 0;
let closeDivs = 0;
let lines = content.split('\n');

lines.forEach((line, index) => {
    let opens = (line.match(/<div(\s|>)/g) || []).length;
    let closes = (line.match(/<\/div>/g) || []).length;
    if (opens > 0 || closes > 0) {
        openDivs += opens;
        closeDivs += closes;
        // console.log(`${index + 1}: +${opens} -${closes} | Total: ${openDivs - closeDivs}`);
    }
});

console.log(`Final stats: Open: ${openDivs}, Close: ${closeDivs}, Balance: ${openDivs - closeDivs}`);
