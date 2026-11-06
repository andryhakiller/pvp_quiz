const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '..', 'questions.json');
let qs = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));

// 1. Reword cross-category collisions to unique interesting questions
const REWORD_COLLISIONS = {
  'math_ege_math_11': {
    question: 'Сколько граней имеет правильный додекаэдр?',
    options: ['8', '10', '12', '20'],
    correctIndex: 2
  },
  'physics_chemistry_general_chemistry_14': {
    question: 'Какой водородный показатель pH имеет водный раствор сильной кислоты с концентрацией ионов водорода [H⁺] = 10⁻³ моль/л?',
    options: ['pH = 1.0', 'pH = 3.0', 'pH = 7.0', 'pH = 11.0'],
    correctIndex: 1
  },
  'sports_basketball_20': {
    question: 'Какова продолжительность четверти в матчах Национальной баскетбольной ассоциации (НБА)?',
    options: ['8 минут', '10 минут', '12 минут', '15 минут'],
    correctIndex: 2
  },
  'sports_general_47': {
    question: 'Сколько очков приносит игроку в снукере забитый шар максимального (черного) достоинства?',
    options: ['4 очка', '5 очков', '6 очков', '7 очков'],
    correctIndex: 3
  },
  'history_empires_tsars_rus_56': {
    question: 'За какую сумму золотом Российская империя продала полуостров Аляска Соединенным Штатам Америки в 1867 году?',
    options: ['1,5 миллиона долларов', '7,2 миллиона долларов', '15 миллионов долларов', '50 миллионов долларов'],
    correctIndex: 1
  },
  'history_post_1945_modern_47': {
    question: 'В каком городе и на каком стадионе состоялся финальный матч чемпионата мира по футболу FIFA 2018 в России?',
    options: [
      'Москва, стадион «Лужники»',
      'Санкт-Петербург, стадион «Газпром Арена»',
      'Сочи, стадион «Фишт»',
      'Казань, «Ак Барс Арена»'
    ],
    correctIndex: 0
  },
  'music_legends_35': {
    question: 'На каком легендарном трехдневном рок-фестивале «мира и музыки» в августе 1969 года Джими Хендрикс исполнил свой знаменитый психоделический гимн США?',
    options: ['Вудсток', 'Монтерей', 'Остров Уайт', 'Альтамонт'],
    correctIndex: 0
  },
  'fishing_numbers_37': {
    question: 'Какова максимальная скорость плавания синего тунца — одного из быстрейших пелагических хищников океана?',
    numericAnswer: 70,
    unit: 'км/ч',
    options: ['40 км/ч', '55 км/ч', '70 км/ч', '95 км/ч'],
    correctIndex: 2
  }
};

let rewordedCount = 0;
for (const q of qs) {
  if (REWORD_COLLISIONS[q.id]) {
    const r = REWORD_COLLISIONS[q.id];
    if (r.question) q.question = r.question;
    if (r.options) q.options = r.options;
    if (r.correctIndex !== undefined) q.correctIndex = r.correctIndex;
    if (r.numericAnswer !== undefined) q.numericAnswer = r.numericAnswer;
    if (r.unit !== undefined) q.unit = r.unit;
    rewordedCount++;
  }
}

// 2. Cloned redundant CHGK questions to delete
const DUPLICATE_IDS_TO_REMOVE = new Set([
  'logic_chgk_deduction_16',   // Canary in mine (duplicate of underground_tunnels_56)
  'logic_chgk_deduction_110',  // Diamond hardness 10 (duplicate of historical_geology_25)
  'logic_chgk_deduction_112',  // Baikal (duplicate of historical_geology_9)
  'logic_chgk_deduction_115',  // Sargasso sea (duplicate of physical_geography_38)
  'logic_chgk_deduction_137',  // Vostok-1 (duplicate of science_history_27)
  'logic_chgk_deduction_138',  // Gagarin (duplicate of science_history_27)
  'logic_chgk_deduction_139',  // Leonov (duplicate of science_history_29)
  'logic_chgk_deduction_140',  // Armstrong on Moon (duplicate of science_history_30)
  'logic_chgk_deduction_141',  // Luna-3 (duplicate of science_history_66)
  'logic_chgk_deduction_142',  // Hubble (duplicate of science_history_64)
  'logic_chgk_deduction_143',  // James Webb (duplicate of science_history_65)
  'logic_chgk_deduction_157',  // Lunokhod-1 (duplicate of science_history_67)
  'logic_chgk_deduction_160',  // Battle on Ice 1242 (duplicate of history_numbers_13)
  'logic_chgk_deduction_161',  // Kulikovo 1380 (duplicate of history_numbers_1)
  'logic_chgk_deduction_162',  // Stand on Ugra 1480 (duplicate of middle_ages_rus_37)
  'logic_chgk_deduction_165',  // Poltava 1709 (duplicate of empires_tsars_rus_24)
  'logic_chgk_deduction_166',  // 1812 (duplicate of history_numbers_4)
  'logic_chgk_deduction_168',  // Aurora (duplicate of world_wars_revolutions_19)
  'logic_chgk_deduction_169',  // Stalingrad (duplicate of world_wars_revolutions_40)
  'logic_chgk_deduction_174',  // Cheops pyramid (duplicate of ancient_world_3)
  'logic_chgk_deduction_175',  // Colosseum (duplicate of ancient_world_17)
  'logic_chgk_deduction_176',  // Great wall (duplicate of world_landmarks_363)
  'logic_chgk_deduction_177',  // Taj Mahal (duplicate of world_landmarks_382)
  'logic_chgk_deduction_178',  // Parthenon (duplicate of ancient_world_4)
  'logic_chgk_deduction_179',  // Mona Lisa (duplicate of fine_arts_architecture_3)
  'logic_chgk_deduction_180',  // Michelangelo (duplicate of fine_arts_architecture_4)
]);

const initialLen = qs.length;
qs = qs.filter(q => !DUPLICATE_IDS_TO_REMOVE.has(q.id));
const removedCount = initialLen - qs.length;

fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(qs, null, 2), 'utf8');
console.log(`✅ Deduplication complete:`);
console.log(`   - Reworded colliding questions: ${rewordedCount}`);
console.log(`   - Deleted exact redundant duplicate questions: ${removedCount}`);
console.log(`   - Total questions remaining: ${qs.length}`);

// 3. Clean played_history.json
const cleanHistoryFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      const hist = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(hist)) {
        const cleaned = hist.filter(id => !DUPLICATE_IDS_TO_REMOVE.has(id));
        fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf8');
        console.log(`   - Purged deleted IDs from ${filePath}`);
      }
    } catch (e) {
      console.warn(`Could not clean history file ${filePath}:`, e.message);
    }
  }
};

cleanHistoryFile(path.join(__dirname, '..', 'server', 'played_history.json'));
cleanHistoryFile('E:/Antigravity/Quiz battle/quiz-battle/server/played_history.json');

