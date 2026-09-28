'use strict';

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..', 'server');

// Files where images were spuriously added to non-image theoretical questions
const FILES_TO_CLEAN = [
  '2.1.txt',
  '2.3.txt',
  '4.5.txt',
  '8.1.txt',
  '8.2.txt',
  '8.3.txt',
  '8.4.txt',
  '8.5.txt',
  '8.6.txt'
];

let totalCleaned = 0;

for (const f of FILES_TO_CLEAN) {
  const filePath = path.join(SERVER_DIR, f);
  if (!fs.existsSync(filePath)) continue;

  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let countInFile = 0;

  for (const q of questions) {
    if (q.image) {
      delete q.image;
      countInFile++;
      totalCleaned++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
  console.log(`Cleaned ${countInFile} spurious image references from ${f}`);
}

console.log(`Total spurious images removed: ${totalCleaned}`);
