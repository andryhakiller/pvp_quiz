/**
 * clean_all_leaks.js
 * Scans all questions for keyword leaks (where a word in the question gives away the correct answer).
 * Automatically removes spoilers from question text or balances options.
 */

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.resolve(__dirname, '../server');
const files = fs.readdirSync(SERVER_DIR).filter(f => /^\d+\.\d+\.txt$/.test(f));

// Custom handlers for known leak questions
const exactLeakFixes = [
  // Albright knot
  {
    matchQ: "Олбрайт",
    fixQ: "Какой узел используется для надежного связывания толстого монофила (или флюорокарбона) с тонкой плетенкой?",
    opts: ["Олбрайт", "Клинч", "Паломар", "Морковка"]
  },
  // Broad tapeworm
  {
    matchQ: "широкий лентец",
    fixQ: "Какой опасный ленточный червь передается человеку через сырую икру и щучье мясо (дифиллоботриоз)?",
    opts: ["Широкий лентец", "Бычий цепень", "Печеночный сосальщик", "Эхинококк"]
  },
  // Goliath tigerfish
  {
    matchQ: "тигровая рыба Голиаф",
    fixQ: "Какая свирепая рыба реки Конго обладает 32 зубами размером с зубы большой белой акулы?",
    opts: ["Тигровая рыба (Голиаф)", "Нильский окунь", "Африканский протоптер", "Рыба-слон"]
  },
  // Largemouth bass
  {
    matchQ: "большеротый окунь",
    fixQ: "Какая американская пресноводная рыба породила многомиллиардную индустрию басс-фишинга?",
    opts: ["Большеротый окунь", "Радужная форель", "Щука-маскинонг", "Панцирная щука"]
  },
  // Aksinya Astakhova
  {
    matchQ: "Степана Астахова",
    fixQ: "В «Тихом Доне» как звали главную возлюбленную Григория Мелехова, жену соседа Степана?",
    opts: ["Аксинья", "Наталья", "Дарья", "Дуняшка"]
  },
  // Levsha secret
  {
    matchQ: "Левша на смертном одре",
    fixQ: "Какую военную тайну британцев Левша просил передать государю перед смертью?",
    opts: ["Ружья кирпичом не чистят", "Порох бездымный делают", "Пули из свинца не льют", "Корабли железом не шьют"]
  },
  // Zamyatin "We"
  {
    matchQ: "Какую тайную операцию Единое Государство",
    fixQ: "В романе «Мы» какую процедуру проводило Единое Государство, чтобы лишить людей воображения?",
    opts: ["Великую Операцию (удаление фантазии)", "Химическую стерилизацию памяти", "Вживление золотого нейрочипа", "Гипнотическое кодирование мозга"]
  },
  // Zolotaia Baba
  {
    matchQ: "золотая реликвия вогулов",
    fixQ: "В романе «Сердце пармы» какая священная языческая реликвия вогулов играет ключевую роль?",
    opts: ["Золотая баба", "Серебряный идол", "Медный змей", "Рубиновый камень"]
  },
  // Mechanical Hound
  {
    matchQ: "Какой механический зверь",
    fixQ: "Какой роботизированный зверь выслеживает диссидентов в романе «451 градус по Фаренгейту»?",
    opts: ["Механический пес", "Стальной паук", "Кибер-ягуар", "Железный ворон"]
  },
  // One Flew Over the Cuckoo's Nest
  {
    matchQ: "Макмерфи сделали карательную лоботомию",
    fixQ: "Что совершает Вождь Бромден в финале романа «Над кукушкиным гнездом» из милосердия к другу?",
    opts: ["Душит подушкой", "Убивает старшую сестру", "Устраивает побег на катере", "Дает ядовитую таблетку"]
  },
  // Suskind Perfume
  {
    matchQ: "аномалия самого Гренуя",
    fixQ: "В романе «Парфюмер» какая особенность Жана-Батиста Гренуя приводила людей в безотчетный ужас?",
    opts: ["Полное отсутствие собственного запаха", "Отсутствие тени в солнечный полдень", "Отсутствие отпечатков пальцев", "Зрачки не реагировали на свет"]
  },
  // Javert
  {
    matchQ: "инспектор полиции неотступно преследует Жана Вальжана",
    fixQ: "Кто из героев романа «Отверженные» неотступно преследует Жана Вальжана, олицетворяя букву закона?",
    opts: ["Жавер", "Тенардье", "Фошлеван", "Шампматье"]
  },
  // Carmen
  {
    matchQ: "На какой фабрике в Севилье работала Кармен",
    fixQ: "На каком предприятии в Севилье работала Кармен при первой встрече с доном Хосе?",
    opts: ["Табачная фабрика", "Шелковая мануфактура", "Стекольный завод", "Оружейный завод"]
  },
  // Wheel fishing
  {
    matchQ: "Какое древнее рыболовное сооружение",
    fixQ: "Какое стационарное речное колесо с черпаками вращается течением для ловли лосося?",
    opts: ["Рыболовное колесо", "Стационарные котцы", "Береговой закол", "Донный вентерь"]
  }
];

let leakFixed = 0;

files.sort().forEach(file => {
  const filePath = path.join(SERVER_DIR, file);
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fileMod = false;

  questions.forEach(q => {
    // 1. Check exact leak dictionary
    for (const fix of exactLeakFixes) {
      if (q.question.includes(fix.matchQ)) {
        q.question = fix.fixQ;
        q.options = [...fix.opts];
        q.correctIndex = 0;
        fileMod = true;
        leakFixed++;
        return;
      }
    }

    // 2. Automated leak cleaner:
    // Check if correct option has words with length >= 5 that appear in question but in no distractor
    const cOpt = q.options[q.correctIndex];
    const otherOpts = q.options.filter((_, idx) => idx !== q.correctIndex);

    // Look for parenthetical words in question that match the correct option
    // e.g. "какой-то факт (термин) ..."
    const parenMatches = q.question.match(/\(([^)]+)\)/g);
    if (parenMatches) {
      parenMatches.forEach(pm => {
        const inside = pm.replace(/[()]/g, '').trim().toLowerCase();
        if (inside.length >= 4 && cOpt.toLowerCase().includes(inside)) {
          // The question literally had the answer inside parentheses! Remove it from question!
          q.question = q.question.replace(pm, '').replace(/\s{2,}/g, ' ').trim();
          fileMod = true;
          leakFixed++;
        }
      });
    }

    // Check if question text contains the unique word from cOpt
    const cWords = cOpt.split(/[^\p{L}\d]+/u).filter(w => w.length >= 6);
    for (const w of cWords) {
      const wLow = w.toLowerCase();
      const qLow = q.question.toLowerCase();
      if (qLow.includes(wLow) && !otherOpts.some(o => o.toLowerCase().includes(wLow))) {
        // If the question contains this word, can we remove it from question text?
        // E.g. "Какая золотая реликвия..." -> "Какая реликвия..."
        // Or in question "названный в честь X" -> remove "в честь X"
        const regName = new RegExp(`\\b(?:в честь|по имени|по кличке|названный|названная|названное|названная в честь)\\s+[^,\\.?!]+`, 'gi');
        if (regName.test(q.question)) {
          q.question = q.question.replace(regName, '').replace(/\s{2,}/g, ' ').trim();
          fileMod = true;
          leakFixed++;
          break;
        }

        // Or if option has an extra duplicate adjective matching question:
        // e.g. Q: "Какая тигровая рыба..." and opt: "Большая тигровая рыба"
        // Strip the duplicate adjective from option if option still has >= 4 chars
        const optWords = cOpt.split(' ');
        if (optWords.length > 1) {
          const stripped = optWords.filter(ow => ow.toLowerCase() !== wLow).join(' ');
          if (stripped.length >= 5) {
            q.options[q.correctIndex] = stripped;
            fileMod = true;
            leakFixed++;
            break;
          }
        }
      }
    }
  });

  if (fileMod) {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`✅ ${file}: cleaned keyword leaks`);
  }
});

console.log(`🎉 Total keyword leaks cleaned: ${leakFixed}`);
