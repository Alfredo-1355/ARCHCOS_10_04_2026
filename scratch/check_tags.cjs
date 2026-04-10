const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\alfre\\Desktop\\Programa_Arquitectonico_ARCHCOS\\src\\features\\SmartSchedule\\SmartSchedule.tsx', 'utf8');

const tags = [
    { open: '<div', close: '</div>', count: 0 },
    { open: '<>', close: '</>', count: 0 },
    { open: '{', close: '}', count: 0 },
    { open: '(', close: ')', count: 0 }
];

let lines = content.split('\n');
let inReturn = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('return (')) inReturn = true;
    
    if (inReturn) {
        // Simple regex counts
        let openDivs = (line.match(/<div/g) || []).length;
        let closeDivs = (line.match(/<\/div>/g) || []).length;
        let openFrags = (line.match(/<>/g) || []).length;
        let closeFrags = (line.match(/<\/>/g) || []).length;
        
        tags[0].count += openDivs - closeDivs;
        tags[1].count += openFrags - closeFrags;
        
        if (tags[0].count < 0 || tags[1].count < 0) {
            console.log(`Mismatch at line ${i + 1}: Divs: ${tags[0].count}, Frags: ${tags[1].count}`);
            console.log(`Line: ${line.trim()}`);
        }
    }
}
console.log('Final counts in return block:');
tags.forEach(t => console.log(`${t.open}: ${t.count}`));
