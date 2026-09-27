const fs = require('fs');
const path = require('path');

function robustParse(raw) {
  let s = raw.replace(/,(\s*[\]\}])/g, '$1');
  s = s.replace(/\]\s*\[/g, ',');
  s = s.trim();
  if (!s.startsWith('[')) s = '[' + s;
  if (!s.endsWith(']')) s = s + ']';
  try {
    return JSON.parse(s);
  } catch (e) {
    const objs = [];
    const re = /\{\s*"id"[\s\S]*?\n\s*\}/g;
    let m;
    while ((m = re.exec(raw)) !== null) {
      try {
        let clean = m[0].replace(/,(\s*[\]\}])/g, '$1');
        objs.push(JSON.parse(clean));
      } catch (err) {}
    }
    return objs;
  }
}

function dedupByQuestion(arr) {
  const seen = new Set();
  const res = [];
  for (const q of arr) {
    const key = q.question.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      res.push(q);
    }
  }
  return res;
}

// Read 1.2 and 1.3
const q12 = robustParse(fs.readFileSync('./server/1.2.txt', 'utf8'));
const q13 = robustParse(fs.readFileSync('./server/1.3.txt', 'utf8'));

const phys = [...q12, ...q13].filter(q => q.subcategoryId === 'physical_geography');
const lang = [...q12, ...q13].filter(q => q.subcategoryId === 'languages_ethnography');

console.log('Total physical:', phys.length, 'Total languages:', lang.length);

const uniquePhys = dedupByQuestion(phys);
const uniqueLang = dedupByQuestion(lang);
console.log('Unique physical:', uniquePhys.length, 'Unique languages:', uniqueLang.length);

// Select exactly 70 best questions for physical_geography
const selectedPhys = uniquePhys.slice(0, 70).map((q, idx) => ({
  id: `geography_physical_geography_${idx + 1}`,
  categoryId: 'geography',
  subcategoryId: 'physical_geography',
  difficulty: q.difficulty || (idx % 3 + 1),
  question: q.question,
  options: q.options,
  correctIndex: q.correctIndex !== undefined ? q.correctIndex : (q.correct ? q.options.indexOf(q.correct) : 0),
  image: q.image || null
}));

// Select exactly 70 best questions for languages_ethnography
const selectedLang = uniqueLang.slice(0, 70).map((q, idx) => ({
  id: `geography_languages_ethnography_${idx + 1}`,
  categoryId: 'geography',
  subcategoryId: 'languages_ethnography',
  difficulty: q.difficulty || (idx % 3 + 1),
  question: q.question,
  options: q.options,
  correctIndex: q.correctIndex !== undefined ? q.correctIndex : (q.correct ? q.options.indexOf(q.correct) : 0),
  image: q.image || null
}));

fs.writeFileSync('./server/1.2.txt', JSON.stringify(selectedPhys, null, 2), 'utf8');
fs.writeFileSync('./server/1.3.txt', JSON.stringify(selectedLang, null, 2), 'utf8');
console.log('Wrote 70 questions to 1.2.txt (physical_geography)');
console.log('Wrote 70 questions to 1.3.txt (languages_ethnography)');

// Fix 2.1.txt if needed
const q21 = robustParse(fs.readFileSync('./server/2.1.txt', 'utf8'));
let fixed21 = 0;
q21.forEach(q => {
  if (q.categoryId !== 'mathematics') {
    q.categoryId = 'mathematics';
    fixed21++;
  }
});
if (fixed21 > 0) {
  fs.writeFileSync('./server/2.1.txt', JSON.stringify(q21, null, 2), 'utf8');
  console.log(`Fixed ${fixed21} categoryId in 2.1.txt`);
}
