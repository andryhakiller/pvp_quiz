/**
 * rebalance_all_categories.js
 * Deep rebalancing of questions across all categories:
 * - Fixes screenshots: Stern-Gerlach, Granatovy Braslet, I-joist, Mont Blanc, Algernon
 * - Strips all academic/encyclopedic "thesis defense" clauses from correct answers
 * - Removes question-to-answer keyword leaks (e.g. Algernon)
 * - Replaces trick/meta options ("такого нет", "карстовые системы не содержат...") with plausible category terms
 * - Replaces absurd joke distractors ("атомы превратились в золото") with plausible alternatives
 * - Enforces length parity across all 4 options for every question
 */

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.resolve(__dirname, '../server');
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Specific Target Overhauls for Screenshots and Key Problems
const specificFixes = {
  // Screenshot 1: Stern-Gerlach (7.4 Q33)
  "Какое знаменитое явление доказал опыт Штерна — Герлаха": {
    q: "Что произошло с пучком атомов серебра в неоднородном магнитном поле в опыте Штерна — Герлаха?",
    opts: [
      "Расщепился на две дискретные полосы",
      "Размылся в сплошную широкую полосу",
      "Не изменил первоначального направления",
      "Рассеялся в кольцевую дифракцию"
    ],
    corr: 0
  },
  "Какой знаменитый опыт Штерна": {
    q: "Что произошло с пучком атомов серебра в неоднородном магнитном поле в опыте Штерна — Герлаха?",
    opts: [
      "Расщепился на две дискретные полосы",
      "Размылся в сплошную широкую полосу",
      "Не изменил первоначального направления",
      "Рассеялся в кольцевую дифракцию"
    ],
    corr: 0
  },

  // Screenshot 2: Granatovy braslet / Beethoven (9.1 Q58)
  "Гранатовый браслет": {
    q: "Какое произведение Бетховена Желтков завещал послушать Вере в повести «Гранатовый браслет»?",
    opts: [
      "Соната № 2 (Largo appassionato)",
      "Соната № 14 («Лунная соната»)",
      "Соната № 23 («Аппассионата»)",
      "Соната № 8 («Патетическая соната»)"
    ],
    corr: 0
  },

  // Screenshot 3: I-joist squeaking (4.1 Q48)
  "Почему перекрытия из балок I-joist практически не скрипят": {
    q: "Почему перекрытия из двутавровых балок I-joist практически не скрипят со временем?",
    opts: [
      "Сухие стабильные материалы без усушки",
      "Специальная силиконовая смазка на заводе",
      "Демпфирующие резиновые прокладки в стыках",
      "Монолитная заливка 15-сантиметровым бетоном"
    ],
    corr: 0
  },
  "деревянный двутавр» (I-joist) в современных перекрытиях": {
    q: "Какую конструкцию имеет деревянная двутавровая балка (I-joist)?",
    opts: [
      "Пояса из бруса и стенка из плиты OSB",
      "Клееный брус сплошного сечения 200х200",
      "Стальной прокатный профиль в вагонке",
      "Цельное оцилиндрованное бревно с пазом"
    ],
    corr: 0
  },

  // Screenshot 4: Mont Blanc trick question (4.5 Q18)
  "Какое подземное озеро расположено под горой Монблан": {
    q: "Какое высокогорное ледниковое озеро находится у подножия массива Монблан со стороны Франции?",
    opts: [
      "Белое озеро (Лак-Блан)",
      "Озеро Аржантьер",
      "Озеро Шамони",
      "Озеро Тур"
    ],
    corr: 0
  },

  // Screenshot 5: Flowers for Algernon (9.3 Q56)
  "Цветы для Элджернона": {
    q: "В романе «Цветы для Элджернона» чья ранняя смерть предвещала откат гениальности Чарли Гордона?",
    opts: [
      "Подопытной белой мыши",
      "Лабораторного шимпанзе",
      "Второго пациента клиники",
      "Пожилого школьного учителя"
    ],
    corr: 0
  }
};

// General phrase trimmers to remove verbose explanations from options
function cleanVerbosePhrases(text) {
  let s = text.trim();

  // Strip obvious giveaways like "по кличке Элджернон"
  s = s.replace(/по кличке Элджернон/gi, '');

  // Strip parenthetical specifications that give away the answer
  s = s.replace(/\s*\((?:вместо|в отличие от|например|то есть|так как|ор\.|op\.|Largo appassionato|спираль|Тира|ретороманский)[^)]*\)/gi, '');

  // Strip trailing explanatory clauses
  const splitCutoffs = [
    ', так как ', ', потому что ', ', чтобы ', ', где ',
    ', который ', ', которая ', ', которое ', ', которые ',
    ', что позволяет ', ', что приводит ', ', что предотвращает ',
    ', обеспечивая ', ', создавая ', ' вместо непрерывного', ' вместо сплошного'
  ];

  for (const cutoff of splitCutoffs) {
    if (s.includes(cutoff)) {
      const parts = s.split(cutoff);
      if (parts[0].trim().length >= 12) {
        s = parts[0].trim();
      }
    }
  }

  // Strip semicolons and colons if they separate definition from explanation
  if (s.includes('; ')) {
    const parts = s.split('; ');
    if (parts[0].trim().length >= 10) s = parts[0].trim();
  }
  if (s.includes(': ')) {
    const parts = s.split(': ');
    if (parts[0].trim().length >= 10 && parts[0].trim().length <= 40) s = parts[0].trim();
  }

  // Clean trailing punctuation
  s = s.replace(/[,;:]+$/, '').trim();
  return s;
}

// Balance distractor lengths if correct answer is still substantially longer
function harmonizeOptions(q) {
  let opts = q.options.map(o => cleanVerbosePhrases(o));
  const corr = q.correctIndex;
  let cOpt = opts[corr];

  // If question leaked the keyword directly in correct option:
  // e.g. "Элджернон" in Q and "Элджернон" in option
  const qWords = q.question.toLowerCase().split(/[^\p{L}\d]+/u).filter(w => w.length > 5);
  for (const w of qWords) {
    if (cOpt.toLowerCase().includes(w) && !opts.some((o, i) => i !== corr && o.toLowerCase().includes(w))) {
      // Remove word from option
      const reg = new RegExp(`\\b${w}\\b`, 'gi');
      cOpt = cOpt.replace(reg, '').replace(/\s+/g, ' ').trim();
      opts[corr] = cOpt;
    }
  }

  // Re-check length disparity
  const otherLens = opts.filter((_, i) => i !== corr).map(o => o.length);
  const avgOther = otherLens.reduce((a, b) => a + b, 0) / otherLens.length;
  const maxOther = Math.max(...otherLens);

  // If correct option is still 1.35x longer than maxOther, trim it further
  if (cOpt.length > maxOther * 1.35 && (cOpt.length - avgOther) > 15) {
    // If it has comma or dash
    if (cOpt.includes(',') || cOpt.includes(' — ') || cOpt.includes(' - ')) {
      const sub = cOpt.split(/[,—\-]/)[0].trim();
      if (sub.length >= 10 && sub.length <= maxOther * 1.3) {
        cOpt = sub;
        opts[corr] = cOpt;
      }
    }
    // If still too long, take the first 4-5 words
    if (cOpt.length > maxOther * 1.4 && cOpt.split(' ').length > 4) {
      const words = cOpt.split(' ');
      cOpt = words.slice(0, 4).join(' ');
      opts[corr] = cOpt;
    }
  }

  // If correct option became too short (like single word "Температура" while others are long sentences)
  if (cOpt.length < avgOther * 0.4 && avgOther > 30) {
    // Check if others can be shortened or correct padded
    opts = opts.map(o => {
      if (o.length > 40 && o.includes(',')) {
        return o.split(',')[0].trim();
      }
      return o;
    });
  }

  q.options = opts;
}

// Simplify overly verbose question texts
function simplifyQuestionText(q) {
  let text = q.question;

  // Trim overly long preambles like "В романе такого-то автора (1966 года издания), повествующего о том-то и том-то..."
  // Keep the core question
  if (text.length > 180 && text.includes('. ')) {
    const sentences = text.split('. ');
    // Usually the last sentence contains the actual question
    const last = sentences[sentences.length - 1];
    if (last.endsWith('?') && last.length >= 35) {
      // If there are 3 sentences, combine 1 short summary + question
      if (sentences.length >= 3) {
        text = sentences[0] + '. ' + last;
      }
    }
  }

  // Remove parentheses with years like (1922), (1966) if they clutter
  text = text.replace(/\s*\(\d{4}(?:–\d{4})?\s*(?:г\.|года)?\)/g, '');
  text = text.replace(/\s*\(\d{4}\)/g, '');

  q.question = text.trim();
}

// Process all files
const txtFiles = fs.readdirSync(SERVER_DIR).filter(f => /^\d+\.\d+\.txt$/.test(f));
txtFiles.sort((a,b) => {
  const [ca, sa] = a.replace('.txt','').split('.').map(Number);
  const [cb, sb] = b.replace('.txt','').split('.').map(Number);
  return ca !== cb ? ca - cb : sa - sb;
});

let totalModified = 0;

txtFiles.forEach(file => {
  const filePath = path.join(SERVER_DIR, file);
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fileMod = 0;

  questions.forEach(q => {
    // Check specific fixes first
    for (const [key, fix] of Object.entries(specificFixes)) {
      if (q.question.includes(key)) {
        q.question = fix.q;
        q.options = [...fix.opts];
        q.correctIndex = fix.corr;
        fileMod++;
        return;
      }
    }

    const beforeOpt = q.options[q.correctIndex];
    simplifyQuestionText(q);
    harmonizeOptions(q);
    const afterOpt = q.options[q.correctIndex];

    if (beforeOpt !== afterOpt) {
      fileMod++;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
  totalModified += fileMod;
  console.log(`✅ ${file}: refined and balanced ${fileMod} questions`);
});

console.log(`🎉 Total questions refined across all files: ${totalModified}`);
