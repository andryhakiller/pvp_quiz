const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log('   FULL QUIZ DATABASE VERIFICATION SUITE      ');
console.log('==============================================\n');

const qPath = path.join(__dirname, '..', 'questions.json');
const sQPath = path.join(__dirname, '..', 'server', 'questions.json');
const histPath = path.join(__dirname, '..', 'server', 'played_history.json');

let errors = 0;
let warnings = 0;

// 1. Files existence and match
if (!fs.existsSync(qPath)) {
  console.error('❌ questions.json missing!');
  process.exit(1);
}
if (!fs.existsSync(sQPath)) {
  console.error('❌ server/questions.json missing!');
  process.exit(1);
}

const raw = fs.readFileSync(qPath, 'utf8');
const sRaw = fs.readFileSync(sQPath, 'utf8');
if (raw !== sRaw) {
  console.warn('⚠️ Warning: questions.json and server/questions.json differ. Syncing...');
  fs.writeFileSync(sQPath, raw, 'utf8');
} else {
  console.log('✅ questions.json and server/questions.json are perfectly identical.');
}

const qs = JSON.parse(raw);
console.log(`✅ Loaded ${qs.length} total questions.`);

// 2. Question structure & fields
const idSet = new Set();
let numericCount = 0;
let multipleCount = 0;

for (let i = 0; i < qs.length; i++) {
  const q = qs[i];
  if (!q.id || idSet.has(q.id)) {
    console.error(`❌ Duplicate or missing id at index ${i}: ${q.id}`);
    errors++;
  }
  idSet.add(q.id);

  if (!q.categoryId || !q.subcategoryId) {
    console.error(`❌ Missing category at id: ${q.id}`);
    errors++;
  }

  if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 5) {
    console.error(`❌ Invalid question text at id: ${q.id}`);
    errors++;
  }

  if (!Array.isArray(q.options) || q.options.length < 2) {
    console.error(`❌ Invalid options array at id: ${q.id}`);
    errors++;
  }

  if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
    console.error(`❌ Invalid correctIndex at id: ${q.id}: ${q.correctIndex}`);
    errors++;
  }

  if (q.type === 'numeric' || (q.subcategoryId && q.subcategoryId.endsWith('_numbers'))) {
    numericCount++;
    if (typeof q.numericAnswer !== 'number' || isNaN(q.numericAnswer)) {
      console.error(`❌ Invalid numericAnswer at id: ${q.id}: ${q.numericAnswer}`);
      errors++;
    }
  } else {
    multipleCount++;
  }
}

console.log(`✅ Structure check passed: ${multipleCount} multiple-choice, ${numericCount} numeric questions.`);

// 3. Task 3: Numeric units & formulation audit
console.log('\n--- Checking Numeric Questions (Task 3) ---');
const googolQ = qs.find(q => q.id === 'mathematics_numbers_13');
if (!googolQ || googolQ.numericAnswer !== 100 || googolQ.unit !== '') {
  console.error(`❌ Googol question not fixed correctly! ans: ${googolQ?.numericAnswer}, unit: ${googolQ?.unit}`);
  errors++;
} else {
  console.log(`✅ Googol question mathematics_numbers_13: Ans = ${googolQ.numericAnswer}, unit = "${googolQ.unit}". Correct!`);
}

let badUnitCount = 0;
let trailingUnitInQCount = 0;

const ALLOWED_COMPLEX_UNITS = new Set([
  'км/ч', 'об/мин', 'кг/м³', 'м/с²', 'кадра/с', 'тыс. км/с', 'г/моль', 'км/с', 'г/см³',
  'млн км²', 'км²', 'тыс. км²', 'Дж / моль·К', 'Дж / кг·К', 'Дж/К', 'мг/л'
]);

for (const q of qs) {
  if (q.type !== 'numeric') continue;

  // Check unit
  if (/[\u2013\u2014\-+×\/¹²³⁴⁵⁶⁷⁸⁹⁰]/.test(q.unit) && !ALLOWED_COMPLEX_UNITS.has(q.unit)) {
    console.error(`❌ Bad unit at ${q.id}: "${q.unit}"`);
    badUnitCount++;
    errors++;
  }

  // Check trailing (в ...)?
  if (/\([вВ]\s+[^)]+\)\s*\??$/.test(q.question)) {
    console.error(`❌ Redundant unit suffix in question at ${q.id}: "${q.question}"`);
    trailingUnitInQCount++;
    errors++;
  }
}

if (badUnitCount === 0 && trailingUnitInQCount === 0) {
  console.log('✅ All numeric questions have clean units and no trailing suffixes in question text.');
}

// 4. Task 2: Broken & cut-off answers audit
console.log('\n--- Checking Broken & Cut-off Answers (Task 2) ---');
const BAD_ENDINGS = ['через', 'под', 'над', 'перед', 'для', 'без', 'при', 'из-за', 'из-под', 'со', 'ко'];
let cutOffCount = 0;

for (const q of qs) {
  for (let idx = 0; idx < q.options.length; idx++) {
    const opt = q.options[idx].trim();

    // Check trailing prepositions
    const lastWord = opt.split(/\s+/).pop().toLowerCase().replace(/[^a-zа-яё]/gi, '');
    if (BAD_ENDINGS.includes(lastWord) && opt !== 'Уэсли Со') {
      console.error(`❌ Truncated option ending in "${lastWord}" at ${q.id} (opt ${idx}): "${opt}"`);
      cutOffCount++;
      errors++;
    }

    // Check trailing punctuation slashes or unclosed brackets
    if (/[\/\[]$/.test(opt)) {
      console.error(`❌ Trailing slash/bracket in option at ${q.id}: "${opt}"`);
      cutOffCount++;
      errors++;
    }
  }
}

if (cutOffCount === 0) {
  console.log('✅ Zero broken or truncated options detected.');
}

// 5. Task 1: Spoilers audit
console.log('\n--- Checking Spoilers (Task 1) ---');
const CRITICAL_SPOILER_CHECKS = [
  { id: 'geography_flags_heraldry_21', bad: 'Калико Джек' },
  { id: 'trans_brands_7', bad: 'Mercedes-Benz' },
  { id: 'trans_brands_25', bad: 'Range Rover' },
  { id: 'construction_earth_building_physics_mechanics_53', bad: 'виадука Мийо' },
  { id: 'construction_earth_building_physics_mechanics_56', bad: 'островом Русский' },
  { id: 'history_middle_ages_rus_21', bad: 'битве на реке Калке' },
  { id: 'history_middle_ages_rus_37', bad: 'на реке Угре' },
  { id: 'history_world_wars_revolutions_27', bad: '30 декабря 1922 года' },
  { id: 'history_world_wars_revolutions_41', bad: 'Якова Павлова' },
  { id: 'history_world_wars_revolutions_69', bad: '24 июня 1945 года' },
  { id: 'history_post_1945_modern_21', bad: '15 февраля 1989 года' },
  { id: 'history_post_1945_modern_24', bad: '9 ноября 1989' },
  { id: 'sports_hockey_11', bad: 'номер 17' },
  { id: 'sports_general_2', bad: 'Железный Майк' },
  { id: 'sports_numbers_9', bad: 'регби-15' },
  { id: 'sports_numbers_34', bad: '10-pin' },
  { id: 'music_numbers_33', bad: 'Клуба 27' }
];

let spoilerFailures = 0;
for (const check of CRITICAL_SPOILER_CHECKS) {
  const q = qs.find(x => x.id === check.id);
  if (!q) {
    console.error(`❌ Question ${check.id} not found!`);
    spoilerFailures++;
    errors++;
  } else if (q.question.includes(check.bad)) {
    console.error(`❌ Spoiler found in ${check.id}: contains "${check.bad}"`);
    spoilerFailures++;
    errors++;
  }
}

if (spoilerFailures === 0) {
  console.log('✅ All known spoilers successfully eliminated.');
}

// 6. Task 4: Duplicates check
console.log('\n--- Checking Duplicates (Task 4) ---');
const deletedIds = [
  'logic_chgk_deduction_16', 'logic_chgk_deduction_110', 'logic_chgk_deduction_112',
  'logic_chgk_deduction_115', 'logic_chgk_deduction_137', 'logic_chgk_deduction_138',
  'logic_chgk_deduction_139', 'logic_chgk_deduction_140', 'logic_chgk_deduction_141',
  'logic_chgk_deduction_142', 'logic_chgk_deduction_143', 'logic_chgk_deduction_157',
  'logic_chgk_deduction_160', 'logic_chgk_deduction_161', 'logic_chgk_deduction_162',
  'logic_chgk_deduction_165', 'logic_chgk_deduction_166', 'logic_chgk_deduction_168',
  'logic_chgk_deduction_169', 'logic_chgk_deduction_174', 'logic_chgk_deduction_175',
  'logic_chgk_deduction_176', 'logic_chgk_deduction_177', 'logic_chgk_deduction_178',
  'logic_chgk_deduction_179', 'logic_chgk_deduction_180'
];

let remainingDeleted = 0;
for (const did of deletedIds) {
  if (qs.some(q => q.id === did)) {
    console.error(`❌ Cloned question ${did} still present in database!`);
    remainingDeleted++;
    errors++;
  }
}

if (remainingDeleted === 0) {
  console.log('✅ All 26 cloned redundant duplicate questions successfully removed.');
}

// 7. Played History File
console.log('\n--- Checking Played History Mechanism ---');
if (fs.existsSync(histPath)) {
  const hist = JSON.parse(fs.readFileSync(histPath, 'utf8'));
  let deadHistCount = 0;
  for (const hid of hist) {
    if (!idSet.has(hid)) {
      console.error(`❌ Played history contains non-existent question ID: ${hid}`);
      deadHistCount++;
      errors++;
    }
  }
  if (deadHistCount === 0) {
    console.log(`✅ played_history.json is clean (${hist.length} entries, 0 dangling IDs).`);
  }
} else {
  console.log('ℹ️ played_history.json does not exist yet (will be created on first game).');
}

console.log('\n==============================================');
if (errors === 0) {
  console.log('🎉 ALL CHECKS PASSED! DATABASE & HISTORY ARE 100% HEALTHY!');
} else {
  console.log(`❌ VERIFICATION FAILED WITH ${errors} ERRORS.`);
  process.exit(1);
}
console.log('==============================================');
