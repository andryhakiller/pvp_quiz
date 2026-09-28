/**
 * trim_length_outliers.js
 * Automatically identifies questions where the correct option (or any option)
 * is an overly detailed explanation/essay, and trims it down to the core phrase
 * matching the length profile of the distractors.
 */

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.resolve(__dirname, '../server');
const files = fs.readdirSync(SERVER_DIR).filter(f => /^\d+\.\d+\.txt$/.test(f));

// Custom dictionary of replacements for known long explanations
const customTrims = {
  // 8.2
  "Резкое расширение жаберных полостей": "Создание зоны пониженного давления",
  "Бойл крепится на тонком волосе": "Крепление бойла на отдельном волосе",
  "Изогнутое внутрь колечко": "Быстрый разворот жалом вниз",
  "Тенденция монофильной лески": "Память формы к деформации",
  "Титан обладает эффектом": "Сверхупругость материала",
  "При угле падения солнечных лучей": "Линейная поляризация отраженного света",
  "Набегающий поток воды создает": "Гидродинамическое давление на пятак",
  "Тонкий плоский серповидный хвост": "Высокая подвижность серповидного хвоста",
  "Скошенный передний бортик": "Снижение трения витков лески",
  "Тонкий шнур имеет существенно": "Меньшее сопротивление потоку воды",
  "Удар пятачка квока о поверхность": "Кавитационный хлопок каверны",
  "Кислотное травление удаляет": "Химическая заточка без заусенцев",
  "Пилообразную траекторию с плавным": "Ступенчатая (пилообразная) проводка",
  "Время падения существенно увеличится": "Замедление падения из-за парусения",
  "Отрезок толстой прочной лески": "Шок-лидер для силового заброса",
  "Вогнутая чашеобразная выемка": "Вогнутая носовая выемка (чашка)",
  "При забросе вольфрамовый шарик": "Смещение центра тяжести назад",
  "Угол около 45–60° задействует": "Оптимальный угол изгиба бланка 45–60°",
  "При силовом броске давление": "Высокое точечное давление на палец",
  "Дополнительный механизм мгновенного": "Система свободного схода лески",
  "4-жильный шнур сплетен": "Высокая стойкость к абразиву о камни",
  "8-жильный шнур имеет": "Гладкая поверхность и круглое сечение",
  "Высокомодульный карбон с высокой": "Высокая тактильная чувствительность",
  "Лобовое сопротивление сжатию": "Сопротивление пробитию челюсти",
  "Смещение центра тяжести вперед": "Смещение центра массы для дальности",
  "Торпедообразное утолщение": "Передняя конусная огрузка шнура",
  "За счет кинетической энергии": "Энергия тяжелого нахлыстового шнура",
  "Образование и схлопывание пузырьков": "Кавитация на лопастях винта",
  "Латексный эластик вытягивается": "Резиновый амортизатор в бланке",
  "Широкая длинная лопата": "Большая заглубляющая лопасть",
  "Плоская металлическая пластина": "Металлический корпус раттлина",
  "Благодаря жесткому пластиковому": "Широкий планирующий разворот в сторону",
  "Узкий луч концентрирует": "Узкий направленный луч датчика",
  "Конусообразная форма узла": "Компактная конусная форма узла"
};

let totalAdjusted = 0;

files.sort().forEach(filename => {
  const filePath = path.join(SERVER_DIR, filename);
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fileAdjusted = 0;

  questions.forEach(q => {
    let cOpt = q.options[q.correctIndex];

    // Check custom trims
    for (const [key, replacement] of Object.entries(customTrims)) {
      if (cOpt.startsWith(key)) {
        q.options[q.correctIndex] = replacement;
        cOpt = replacement;
        fileAdjusted++;
        break;
      }
    }

    // Heuristic length balancer:
    const otherLens = q.options.filter((_, i) => i !== q.correctIndex).map(o => o.length);
    const avgOtherLen = otherLens.reduce((a, b) => a + b, 0) / otherLens.length;
    const maxOtherLen = Math.max(...otherLens);

    if (cOpt.length > maxOtherLen * 1.8 && (cOpt.length - avgOtherLen) > 25) {
      // Split by punctuation: colon, semicolon, em-dash, period, or comma
      const delimiters = [': ', ' — ', ' - ', '; ', '. ', ', '];
      for (const delim of delimiters) {
        if (cOpt.includes(delim)) {
          const parts = cOpt.split(delim);
          const head = parts[0].trim();
          if (head.length >= 10 && head.length <= maxOtherLen * 1.5) {
            q.options[q.correctIndex] = head;
            fileAdjusted++;
            break;
          }
        }
      }
    }
  });

  if (fileAdjusted > 0) {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    totalAdjusted += fileAdjusted;
    console.log(`✅ ${filename}: trimmed ${fileAdjusted} giveaway options`);
  }
});

console.log(`🎉 Total length outliers trimmed: ${totalAdjusted}`);
