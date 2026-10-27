const fs = require('fs');
const path = require('path');

const { football, hockey } = require('./sports_data_1');
const { basketball, olympics } = require('./sports_data_2');
const { chess, esports, general } = require('./sports_data_3');

const SERVER_DIR = path.resolve(__dirname, '../server');

const sets = [
  { file: '12.1.txt', sub: 'sports_football', list: football },
  { file: '12.2.txt', sub: 'sports_hockey', list: hockey },
  { file: '12.3.txt', sub: 'sports_basketball', list: basketball },
  { file: '12.4.txt', sub: 'sports_olympics', list: olympics },
  { file: '12.5.txt', sub: 'sports_chess', list: chess },
  { file: '12.6.txt', sub: 'sports_esports', list: esports },
  { file: '12.7.txt', sub: 'sports_general', list: general },
];

let totalCount = 0;

sets.forEach(({ file, sub, list }) => {
  const formatted = list.map((item, idx) => ({
    id: `${sub}_${idx + 1}`,
    categoryId: 'sports',
    subcategoryId: sub,
    difficulty: item.diff || 1,
    question: item.q,
    options: item.opts,
    correctIndex: 0, // 0 will be deterministically shuffled across [0..3] by merge_and_validate
    image: null
  }));

  const outPath = path.join(SERVER_DIR, file);
  fs.writeFileSync(outPath, JSON.stringify(formatted, null, 2), 'utf8');
  console.log(`✅ Written ${formatted.length} questions to server/${file} (${sub})`);
  totalCount += formatted.length;
});

console.log(`🏆 Total sports questions created: ${totalCount}`);
