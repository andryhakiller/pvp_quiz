/**
 * fix_last_13.js
 * Fixes the final 13 length and leak outliers to achieve 100% parity across all 3,190 questions.
 */

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.resolve(__dirname, '../server');

function updateFile(filename, updater) {
  const p = path.join(SERVER_DIR, filename);
  const qs = JSON.parse(fs.readFileSync(p, 'utf8'));
  updater(qs);
  fs.writeFileSync(p, JSON.stringify(qs, null, 2), 'utf8');
  console.log(`✅ Fixed in ${filename}`);
}

// 1. 1.2 Q29: Нахичевань
updateFile('1.2.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('Нахичеванск') || q.options.some(o => o.includes('Нахичеванск'))) {
      q.options = ["Нахичевань", "Карабах", "Аджария", "Гагаузия"];
      q.correctIndex = 0;
    }
  });
});

// 2. 2.2 Q28: Экспонента радиус сходимости
updateFile('2.2.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('радиус сходимости') && q.question.includes('экспонент')) {
      q.options = ["Бесконечность (∞)", "Единица (1)", "Число e", "Ноль (0)"];
      q.correctIndex = 0;
    }
  });
});

// 3. 4.4 Q36: Срединно-океанический хребет
updateFile('4.4.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('65 000 км') || q.options.some(o => o.includes('Срединно-Океанический'))) {
      q.options = ["Срединно-океанический хребет", "Кордильерский горный пояс", "Гималайская горная цепь", "Андийский горный массив"];
      q.correctIndex = 0;
    }
  });
});

// 4. 5.1 Q47: Джентльмены удачи (цемент)
updateFile('5.1.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('Джентльмены удачи') || q.options.some(o => o.includes('цементным'))) {
      q.options = ["Цемент", "Нефть", "Квас", "Мазут"];
      q.correctIndex = 0;
    }
  });
});

// 5. 5.3 Q70: Социальная сеть ("The")
updateFile('5.3.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('Социальная сеть') || q.options.some(o => o.includes('Drop the'))) {
      q.question = "Какое лишнее слово посоветовал выбросить Шон Паркер из названия The Facebook в фильме «Социальная сеть»?";
      q.options = ["Артикль «The»", "Слово «Book»", "Слово «Net»", "Слово «Face»"];
      q.correctIndex = 0;
    }
  });
});

// 6. 5.4 Q59: Зверополис (Блиц)
updateFile('5.4.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('Зверополис') || q.options.some(o => o.includes('скорость без границ'))) {
      q.options = ["Блиц", "Молния", "Спиди", "Турбо"];
      q.correctIndex = 0;
    }
  });
});

// 7. 5.5 Q53: Исаакиевский собор (колонны)
updateFile('5.5.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('Исаакиевский собор') && q.question.includes('колонн')) {
      q.options = ["48 колонн", "24 колонны", "12 колонн", "64 колонны"];
      q.correctIndex = 0;
    }
  });
});

// 8. 6.5 Q51: Сирия
updateFile('6.5.txt', qs => {
  qs.forEach(q => {
    if (q.options.some(o => o.includes('Сирийская Арабская'))) {
      q.options = ["Сирия", "Ливия", "Ирак", "Йемен"];
      q.correctIndex = 0;
    }
    if (q.options.some(o => o.includes('Евразийский экономический союз'))) {
      q.options = ["ЕАЭС", "СНГ", "ОДКБ", "ГУАМ"];
      q.correctIndex = 0;
    }
  });
});

// 9. 7.1 Q20: Энергия Гиббса
updateFile('7.1.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('самопроизвольное протекание') || q.options.some(o => o.includes('Гиббса'))) {
      q.question = "Какое условие определяет самопроизвольное протекание реакции при постоянных давлении и температуре?";
      q.options = ["ΔG < 0", "ΔG > 0", "ΔH > 0", "ΔS < 0"];
      q.correctIndex = 0;
    }
  });
});

// 10. 7.2 Q59: Кадмий в реакторах
updateFile('7.2.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('захвата тепловых нейтронов') || q.options.some(o => o.includes('Карбид бора'))) {
      q.options = ["Кадмий", "Свинец", "Медь", "Алюминий"];
      q.correctIndex = 0;
    }
  });
});

// 11. 7.3 Q30: Криолит
updateFile('7.3.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('Al2O3') && q.question.includes('алюминия')) {
      q.question = "В расплаве какого минерала (Na3AlF6) растворяют глинозем Al2O3 при электролитическом получении алюминия?";
      q.options = ["Криолит", "Флюорит", "Галит", "Сильвинит"];
      q.correctIndex = 0;
    }
  });
});

// 12. 7.4 Q50: YBCO
updateFile('7.4.txt', qs => {
  qs.forEach(q => {
    if (q.question.includes('YBa2Cu3O7') || q.options.some(o => o.includes('Купратный ВТСП'))) {
      q.options = ["Оксид иттрия-бария-меди", "Титанат бария-стронция", "Оксид лантана-стронция", "Купрат висмута-свинца"];
      q.correctIndex = 0;
    }
  });
});

console.log('🎉 All 13 final outliers cleanly resolved!');
