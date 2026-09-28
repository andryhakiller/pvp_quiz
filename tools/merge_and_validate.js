/**
 * merge_and_validate.js
 * Merges all server/*.txt into questions.json (both root and server/).
 * Validates integrity:
 * - 4 options per question
 * - correctIndex in [0..3]
 * - Balanced correctIndex distribution (seeded shuffle of options)
 * - All local images exist in public/
 * - Unique IDs
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SERVER_DIR = path.resolve(ROOT_DIR, 'server');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

// Simple deterministic PRNG for option shuffling
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const txtFiles = fs.readdirSync(SERVER_DIR).filter(f => /^\d+\.\d+\.txt$/.test(f));
txtFiles.sort((a,b) => {
  const [ca, sa] = a.replace('.txt','').split('.').map(Number);
  const [cb, sb] = b.replace('.txt','').split('.').map(Number);
  return ca !== cb ? ca - cb : sa - sb;
});

const allQuestions = [];
const idSet = new Set();
let missingImages = 0;
let totalImages = 0;

txtFiles.forEach(file => {
  const filePath = path.join(SERVER_DIR, file);
  const qs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  qs.forEach((q, qIdx) => {
    // 1. Check ID uniqueness
    if (!q.id) {
      q.id = `q_${file.replace('.txt','')}_${qIdx+1}`;
    }
    if (idSet.has(q.id)) {
      q.id = `${q.id}_${qIdx+1}`;
    }
    idSet.add(q.id);

    // 2. Validate options
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`File ${file} Q#${qIdx+1} does not have exactly 4 options!`);
    }

    // 3. Validate correctIndex
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
      throw new Error(`File ${file} Q#${qIdx+1} invalid correctIndex: ${q.correctIndex}`);
    }

    // 4. Validate image path
    if (q.image) {
      totalImages++;
      const relPath = q.image.startsWith('/') ? q.image.slice(1) : q.image;
      const fullImgPath = path.join(PUBLIC_DIR, relPath);
      if (!fs.existsSync(fullImgPath)) {
        console.error(`❌ Image not found: ${q.image} in ${file} (expected at ${fullImgPath})`);
        missingImages++;
        q.image = null; // Clean broken link
      }
    }

    // 5. Shuffle options deterministically based on question string hash
    // to guarantee an even ~25% distribution for options 0, 1, 2, 3
    let hash = 0;
    for (let c = 0; c < q.question.length; c++) {
      hash = (hash << 5) - hash + q.question.charCodeAt(c);
      hash |= 0;
    }
    const rng = seededRandom(Math.abs(hash) + qIdx + 42);

    const correctText = q.options[q.correctIndex];
    // Fisher-Yates shuffle
    const indices = [0, 1, 2, 3];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const shuffledOptions = indices.map(i => q.options[i]);
    const newCorrectIndex = shuffledOptions.indexOf(correctText);

    q.options = shuffledOptions;
    q.correctIndex = newCorrectIndex;

    allQuestions.push(q);
  });
});

console.log(`✅ Loaded and validated ${allQuestions.length} questions from ${txtFiles.length} files.`);
console.log(`🖼️ Images verified: ${totalImages} checked, ${missingImages} missing.`);

// Distribution check
const counts = [0, 0, 0, 0];
allQuestions.forEach(q => counts[q.correctIndex]++);
console.log(`📊 Shuffled correctIndex distribution: 0: ${counts[0]}, 1: ${counts[1]}, 2: ${counts[2]}, 3: ${counts[3]}`);

// Write to both server/questions.json and root questions.json
const rootQuestionsPath = path.join(ROOT_DIR, 'questions.json');
const serverQuestionsPath = path.join(SERVER_DIR, 'questions.json');

const jsonString = JSON.stringify(allQuestions, null, 2);
fs.writeFileSync(rootQuestionsPath, jsonString, 'utf8');
fs.writeFileSync(serverQuestionsPath, jsonString, 'utf8');

console.log(`💾 Saved to ${rootQuestionsPath}`);
console.log(`💾 Saved to ${serverQuestionsPath}`);
console.log(`🎉 Merge complete: ${allQuestions.length} questions ready for Quiz Battle!`);
