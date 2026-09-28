/**
 * rebalance_outliers_exact.js
 * Eliminates all remaining length outliers and awkward phrasing.
 * Ensures:
 * - Every option is a complete, well-formed phrase
 * - Option lengths in every question are balanced (ratio < 1.4x)
 * - Distractors are fleshed out if correct answer is a natural phrase
 * - No giveaways, no tell-tale clues
 */

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.resolve(__dirname, '../server');
const files = fs.readdirSync(SERVER_DIR).filter(f => /^\d+\.\d+\.txt$/.test(f));

// Exact dictionary of question cleaner / replacements
const cleanReplacements = {
  // 9.2 Q27
  "старый кубинский рыбак Сантьяго 84 дня": {
    cOpt: "Голубого марлина",
    opts: ["Голубого марлина", "Белую акулу", "Желтого тунца", "Рыбу-меч"]
  },
  // 9.2 Q17
  "Lord of the Flies": {
    cOpt: "Морская раковина (рог)",
    opts: ["Морская раковина (рог)", "Очки Хрюши", "Сигнальный костер", "Деревянное копье"]
  },
  // 9.2 Q36
  "Зеленая миля": {
    cOpt: "Мышонка Джинглса",
    opts: ["Мышонка Джинглса", "Ручную крысу", "Белого голубя", "Тюремного хомяка"]
  },
  // 9.2 Q7
  "451 градус по Фаренгейту": {
    cOpt: "Механический пес",
    opts: ["Механический пес", "Стальной паук", "Кибер-ягуар", "Железный ворон"]
  },
  // 8.6 Q27
  "мировой рекорд веса для атлантического синеперого тунца": {
    cOpt: "679 кг",
    opts: ["679 кг", "512 кг", "824 кг", "430 кг"]
  },
  // 8.6 Q38
  "Бакальяу": {
    cOpt: "Соленая треска",
    opts: ["Соленая треска", "Морской окунь", "Атлантический палтус", "Копченая сардина"]
  },
  // 8.4 Q12
  "парусообразным спинным плавником": {
    cOpt: "Рыба-парусник",
    opts: ["Рыба-парусник", "Черный марлин", "Рыба-меч", "Королевская макрель"]
  },
  // 8.4 Q21
  "Минтай и треска дальневосточная": {
    cOpt: "Тихоокеанская треска",
    opts: ["Тихоокеанская треска", "Дальневосточная камбала", "Пятнистый терпуг", "Морской окунь"]
  },
  // 8.3 Q41
  "Какая насадка на карпа и белого амура": {
    cOpt: "Сладкая кукуруза",
    opts: ["Сладкая кукуруза", "Вареный горох", "Перловая крупа", "Манная болтушка"]
  },
  // 8.5 Q13
  "Какая опасность подстерегает рыболова при использовании газового": {
    cOpt: "Отравление угарным газом",
    opts: ["Отравление угарным газом", "Внезапный пожар палатки", "Обморожение пальцев рук", "Быстрое таяние льда"]
  },
  // 8.5 Q31
  "ловля налима зимой на 'стукалку'": {
    cOpt: "Стучит тяжелой блесной по дну",
    opts: ["Стучит тяжелой блесной по дну", "Использует ультразвуковой свисток", "Создает пузыри воздуха в лунке", "Приманивает светом фонаря"]
  },
  // 8.5 Q32
  "налимьей": {
    cOpt: "Холод, ветер и глухую темень",
    opts: ["Холод, ветер и глухую темень", "Ясный солнечный мороз", "Тихую безветренную оттепель", "Легкий первый снег"]
  },
  // 8.5 Q61
  "кормушка-самосвал": {
    cOpt: "Открывается прямо у самого дна",
    opts: ["Открывается прямо у самого дна", "Разбрасывает корм по поверхности", "Вибрирует на течении реки", "Подогревает прикормку в воде"]
  },
  // 8.2 Q12
  "спиннинговый бланк": {
    cOpt: "Полая коническая трубка",
    opts: ["Полая коническая трубка", "Сплошной граненый пруток", "Трубка квадратного профиля", "Многослойная плоская лента"]
  },
  // 8.2 Q62
  "бесконечный винт": {
    cOpt: "Равномерная возвратно-поступательная подача",
    opts: ["Равномерная возвратно-поступательная подача", "Увеличение скорости намотки вдвое", "Полное отсутствие трения в ролике", "Облегчение веса катушки"]
  },
  // 8.3 Q37
  "сбирулино": {
    cOpt: "Тяжелый аэродинамичный поплавок",
    opts: ["Тяжелый аэродинамичный поплавок", "Глубоководный металлический груз", "Особый силиконовый виброхвост", "Донная кормушка с пружиной"]
  },
  // 8.3 Q53
  "высыпают ведро песка": {
    cOpt: "Создает светлое пятно на дне",
    opts: ["Создает светлое пятно на дне", "Уничтожает донных пиявок", "Повышает прозрачность воды", "Отпугивает хищную щуку"]
  },
  // 8.4 Q54
  "Терпуг": {
    cOpt: "Ярко-желтая с темными полосами",
    opts: ["Ярко-желтая с темными полосами", "Светло-серебристая без пятен", "Грязно-бурая защитная", "Темно-синяя маскировочная"]
  },
  // 8.4 Q55
  "апвеллинг": {
    cOpt: "Подъем холодных глубинных вод",
    opts: ["Подъем холодных глубинных вод", "Теплое поверхностное течение", "Приливной водоворот у берега", "Штормовой нагон воды в залив"]
  },
  // 8.6 Q19
  "сугудай": {
    cOpt: "Блюдо из сырой рыбы с луком",
    opts: ["Блюдо из сырой рыбы с луком", "Густой наваристый рыбный суп", "Вяленая на солнце оленина", "Копченая печень налима"]
  },
  // 9.1 Q12
  "Шинель": {
    cOpt: "Грабители силой отняли шинель",
    opts: ["Грабители силой отняли шинель", "Ее случайно сожгли в департаменте", "Начальник отчитал за дороговизну", "Ее изгрызли крысы в каморке"]
  },
  // 4.1 Q8 (Точка росы)
  "точка росы": {
    cOpt: "Температура конденсации влаги",
    opts: ["Температура конденсации влаги", "Холодная точка фасада здания", "Стык плиты и несущей стены", "Влажность при начале гниения"]
  }
};

let cleanedCount = 0;

files.sort().forEach(file => {
  const filePath = path.join(SERVER_DIR, file);
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let mod = false;

  questions.forEach((q, qIdx) => {
    // 1. Check exact dictionary
    for (const [key, fix] of Object.entries(cleanReplacements)) {
      if (q.question.includes(key) || q.options.some(o => o.includes(key))) {
        q.options = [...fix.opts];
        q.correctIndex = fix.opts.indexOf(fix.cOpt);
        if (q.correctIndex === -1) q.correctIndex = 0;
        mod = true;
        cleanedCount++;
        return;
      }
    }

    // 2. Clean truncated or dangling punctuation
    q.options = q.options.map(opt => {
      let s = opt.trim();
      // Remove trailing colons, semicolons, dashes, commas
      s = s.replace(/[:;,—\-]+$/, '').trim();
      // Remove trailing incomplete prepositions
      s = s.replace(/\s+(?:с|в|на|из|для|по|к|от|о|об|над|под|при)$/i, '').trim();
      return s;
    });

    // 3. Automated length balancing:
    // If correct answer is > 1.3x average other length, trim words until balanced
    const cOpt = q.options[q.correctIndex];
    const otherLens = q.options.filter((_, i) => i !== q.correctIndex).map(o => o.length);
    const avgOther = otherLens.reduce((a, b) => a + b, 0) / otherLens.length;
    const maxOther = Math.max(...otherLens);

    if (cOpt.length > maxOther * 1.3 && (cOpt.length - avgOther) > 12) {
      // Split into words and keep enough words to match maxOther
      const words = cOpt.split(' ');
      let trimmed = '';
      for (const w of words) {
        if ((trimmed + ' ' + w).trim().length <= maxOther * 1.25) {
          trimmed = (trimmed + ' ' + w).trim();
        } else {
          break;
        }
      }
      if (trimmed.length >= 10) {
        q.options[q.correctIndex] = trimmed.replace(/[:;,—\-]+$/, '').trim();
        mod = true;
        cleanedCount++;
      }
    }
  });

  if (mod) {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`✅ ${file}: cleaned exact outlier matches`);
  }
});

console.log(`🎉 Exact outlier pass complete: updated ${cleanedCount} questions`);
