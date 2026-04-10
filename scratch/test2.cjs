const fs = require('fs');
const content = fs.readFileSync('src/features/SmartSchedule/SmartSchedule.tsx', 'utf8');

// The ternary ends at 2404
const lines = content.split('\n');
for (let i = 2390; i <= 2410; i++) {
  console.log(i+1, lines[i]);
}
