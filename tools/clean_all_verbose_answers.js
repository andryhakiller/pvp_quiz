/**
 * clean_all_verbose_answers.js
 * Aggressively trims and simplifies all verbose, over-accurate academic options
 * across all files. Ensures options are punchy, conversational, and equal in weight.
 */

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.resolve(__dirname, '../server');
const files = fs.readdirSync(SERVER_DIR).filter(f => /^\d+\.\d+\.txt$/.test(f));

// Custom overrides for specific problematic questions
const customOverrides = {
  // 5.5 Q5: Michelangelo sculpture
  "единственная скульптура, которую Микеланджело": {
    opts: ["«Пьета» (Оплакивание Христа)", "«Давид»", "«Моисей»", "«Бахус» (Вакх)"],
    cOpt: "«Пьета» (Оплакивание Христа)"
  },
  // 5.5 Q6: Night Watch
  "Ночной дозор": {
    opts: ["Потемнел от старого лака и копоти", "Стрелки выходили строго в полночь", "Рембрандт рисовал при свечах", "Картина хранилась в сыром подвале"],
    cOpt: "Потемнел от старого лака и копоти"
  },
  // 5.5 Q10: Repin painting
  "Иван Грозный": {
    opts: ["«Иван Грозный и сын его Иван»", "«Бурлаки на Волге»", "«Запорожцы пишут письмо»", "«Не ждали»"],
    cOpt: "«Иван Грозный и сын его Иван»"
  },
  // 5.5 Q14: Pantheon oculus
  "дождя в римском Пантеоне": {
    opts: ["Стекает в дренажные отверстия в полу", "Натягивают шелковый тент под куполом", "Вода испаряется от теплого воздуха", "Окулюс закрывают бронзовой крышкой"],
    cOpt: "Стекает в дренажные отверстия в полу"
  },
  // 5.5 Q24: Sistine chapel
  "Сикстинской капеллы": {
    opts: ["Микеланджело", "Рафаэль", "Леонардо да Винчи", "Сандро Боттичелли"],
    cOpt: "Микеланджело"
  },
  // 5.5 Q49: Zaha Hadid
  "Захи Хадид": {
    opts: ["Текучие биоморфные формы без прямых углов", "Деревянное традиционное зодчество", "Строгий стеклянный конструктивизм", "Кирпичная готика с высокими шпилями"],
    cOpt: "Текучие биоморфные формы без прямых углов"
  },
  // 5.5 Q58: Pointillism
  "пуантилизма": {
    opts: ["Точечные мазки чистых спектральных цветов", "Живопись широким шпателем и мастихином", "Послойная полупрозрачная лессировка", "Разбрызгивание краски с ведра на холст"],
    cOpt: "Точечные мазки чистых спектральных цветов"
  },
  // 5.5 Q55: Highest dome
  "купол в мире": {
    opts: ["Собор Святого Петра в Ватикане", "Кафедральный собор Флоренции", "Собор Святого Павла в Лондоне", "Исаакиевский собор в Петербурге"],
    cOpt: "Собор Святого Петра в Ватикане"
  },
  // 4.5 Q41: Matera cave hotel
  "Сасси-ди-Матера": {
    q: "Какой древний пещерный город в регионе Базиликата в Италии превращен в уникальный отель и музей ЮНЕСКО?",
    opts: ["Матера (Сасси-ди-Матера)", "Каппадокия", "Петра", "Вардзия"],
    cOpt: "Матера (Сасси-ди-Матера)"
  },
  // 4.5 Q46: EPB shield
  "EPB shield": {
    q: "Как тоннелепроходческий щит EPB удерживает забой от обрушения в мягких грунтах?",
    opts: ["Давлением разработанного грунта", "Заморозкой жидким азотом", "Нагнетанием горячего битума", "Взрывной отбойкой породы"],
    cOpt: "Давлением разработанного грунта"
  }
};

let totalAdjusted = 0;

files.sort().forEach(file => {
  const filePath = path.join(SERVER_DIR, file);
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fileMod = false;

  questions.forEach(q => {
    // 1. Check custom overrides
    for (const [key, fix] of Object.entries(customOverrides)) {
      if (q.question.includes(key) || q.options.some(o => o.includes(key))) {
        if (fix.q) q.question = fix.q;
        q.options = [...fix.opts];
        q.correctIndex = fix.opts.indexOf(fix.cOpt);
        if (q.correctIndex === -1) q.correctIndex = 0;
        fileMod = true;
        totalAdjusted++;
        return;
      }
    }

    // 2. Generic aggressive trimming for over-accurate answers:
    const cOpt = q.options[q.correctIndex];
    const otherLens = q.options.filter((_, idx) => idx !== q.correctIndex).map(o => o.length);
    const avgOther = otherLens.reduce((a, b) => a + b, 0) / otherLens.length;
    const maxOther = Math.max(...otherLens);

    if (cOpt.length > maxOther * 1.25 && (cOpt.length - avgOther) > 10) {
      let trimmed = cOpt;

      // Cut at conjunctions or subordinate clauses
      const cuts = [
        ', так как', ', потому что', ', чтобы', ', обеспечивая', ', создавая',
        ', предотвращая', ', где', ', который', ', которая', ', которое', ', которые',
        ' с целью', ' за счет', ' путем', ' благодаря'
      ];
      for (const cut of cuts) {
        if (trimmed.includes(cut)) {
          const p = trimmed.split(cut)[0].trim();
          if (p.length >= 10) {
            trimmed = p;
            break;
          }
        }
      }

      // If still too long, take the first 4-5 words
      if (trimmed.length > maxOther * 1.3 && trimmed.split(' ').length > 4) {
        trimmed = trimmed.split(' ').slice(0, 4).join(' ');
      }

      trimmed = trimmed.replace(/[:;,—\-]+$/, '').trim();

      if (trimmed !== cOpt && trimmed.length >= 8) {
        q.options[q.correctIndex] = trimmed;
        fileMod = true;
        totalAdjusted++;
      }
    }
  });

  if (fileMod) {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`✅ ${file}: refined verbose options`);
  }
});

console.log(`🎉 Total verbose options trimmed: ${totalAdjusted}`);
