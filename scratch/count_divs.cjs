const fs = require('fs');
const path = 'c:\\Users\\alfre\\Desktop\\Programa_Arquitectonico_ARCHCOS\\src\\features\\SmartSchedule\\SmartSchedule.tsx';
const content = fs.readFileSync(path, 'utf8');

let openDivs = 0;
let closeDivs = 0;
let lines = content.split('\n');

console.log("Analyzing DIV balance...");
lines.forEach((line, index) => {
    // Basic regex for divs
    let opens = (line.match(/<div(\s|>)/g) || []).length;
    let closes = (line.match(/<\/div>/g) || []).length;
    if (opens > 0 || closes > 0) {
        openDivs += opens;
        closeDivs += closes;
        // if (openDivs !== closeDivs) {
        //     console.log(`Line ${index + 1}: Balance ${openDivs - closeDivs} (Opens: ${opens}, Closes: ${closes})`);
        // }
    }
});

console.log(`Final stats: Open: ${openDivs}, Close: ${closeDivs}, Balance: ${openDivs - closeDivs}`);

// Also check Parentheses and Braces in the return statement
let returnStartIndex = content.indexOf('return (');
if (returnStartIndex === -1) {
    console.log("Could not find 'return ('");
} else {
    let returnContent = content.substring(returnStartIndex);
    let braces = 0;
    let parens = 0;
    for (let i = 0; i < returnContent.length; i++) {
        if (returnContent[i] === '{') braces++;
        if (returnContent[i] === '}') braces--;
        if (returnContent[i] === '(') parens++;
        if (returnContent[i] === ')') parens--;
    }
    console.log(`Return balance: Braces: ${braces}, Parens: ${parens}`);
}
