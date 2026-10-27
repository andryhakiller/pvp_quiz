const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.resolve(__dirname, '../server');
const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf8'));

const qMap = new Map();
questions.forEach(q => {
  qMap.set(q.id, q);
});

const files = fs.readdirSync(SERVER_DIR).filter(f => /^\d+\.\d+\.txt$/.test(f));
let updatedCount = 0;

files.forEach(f => {
  const filePath = path.join(SERVER_DIR, f);
  const arr = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let modified = false;

  arr.forEach((q, idx) => {
    const fixed = qMap.get(q.id);
    if (fixed) {
      if (q.question !== fixed.question || JSON.stringify(q.options) !== JSON.stringify(fixed.options) || q.correctIndex !== fixed.correctIndex) {
        arr[idx] = { ...fixed };
        modified = true;
        updatedCount++;
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
  }
});

console.log(`✅ Synced ${updatedCount} fixed questions back into server/*.txt files.`);
