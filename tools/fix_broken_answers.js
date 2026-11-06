const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '..', 'questions.json');
const qs = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));

const OPTION_FIXES = {
  'geography_physical_geography_24': {
    correctOpt: 'Чукотский автономный округ'
  },
  'geography_world_landmarks_390': {
    correctOpt: 'Тонкого бурения и извлечения грунта с противоположной стороны'
  },
  'geography_world_landmarks_402': {
    correctOpt: 'Поддерживает постоянный уровень грунтовых вод под песчаным основанием'
  },
  'geography_world_landmarks_415': {
    correctOpt: 'Перевернутую взвешенную цепную линию'
  },
  'math_ege_math_14': {
    correctOpt: 'Удвоенному радиусу описанной окружности (2R)'
  },
  'math_calculus_diffeq_110': {
    correctOpt: 'Потоком векторного поля через замкнутую поверхность'
  },
  'math_linalg_geometry_165': {
    correctOpt: 'Максимальное число линейно независимых строк (или столбцов)'
  },
  'math_linalg_geometry_183': {
    correctOpt: 'Свой собственный характеристический многочлен'
  },
  'math_linalg_geometry_193': {
    correctOpt: 'Произведению элементов главной диагонали'
  },
  'math_linalg_geometry_196': {
    correctOpt: 'Параллельность прямых и отношение отрезков одной прямой'
  },
  'math_linalg_geometry_205': {
    correctOpt: 'Для нахождения наилучшего приближенного решения несовместной системы (МНК)'
  },
  'math_mental_math_226': {
    correctOpt: 'Делится на 11 или равна 0'
  },
  'cinema_arts_franchises_cult_movies_23': {
    correctOpt: 'Обмазался толстым слоем холодной речной глины и грязи'
  },
  'cinema_arts_franchises_cult_movies_54': {
    correctOpt: 'Спортивный альманах Грейс за 1950–2000 годы'
  },
  'cinema_arts_modern_cinema_5': {
    correctOpt: 'Курт Рассел по ошибке разбил бесценную музейную гитару Martin 1870-х годов'
  },
  'cinema_arts_modern_cinema_8': {
    options: ['Дж. К. Симмонс', 'Майлз Теллер', 'Пол Райзер', 'Мелисса Бенойст']
  },
  'cinema_arts_modern_cinema_13': {
    correctOpt: 'Гипотеза лингвистической относительности Сепира — Уорфа'
  },
  'cinema_arts_modern_cinema_50': {
    correctOpt: 'Жареную курицу KFC'
  },
  'cinema_arts_modern_cinema_54': {
    correctOpt: 'Смонтирован так, чтобы казаться одним непрерывным дублем'
  },
  'cinema_arts_fine_arts_architecture_2': {
    correctOpt: 'Это единственное место во всем Париже, откуда ее не видно'
  },
  'cinema_arts_fine_arts_architecture_25': {
    correctOpt: 'Натуральный ультрамарин (ляпис-лазурь)'
  },
  'cinema_arts_soviet_russian_cinema_37': {
    options: [
      '«Улыбайтесь, господа. Улыбайтесь!»',
      '«Я понял, в чем ваша беда...»',
      '«Любовь — это теорема, которую каждый день надо доказывать»',
      '«Правда — это то, во что веришь»'
    ],
    correctIndex: 0
  },
  'cinema_arts_soviet_russian_cinema_55': {
    correctOpt: 'Отец так и не передал ему тайну литейного колокольного секрета'
  },
  'cinema_arts_soviet_russian_cinema_70': {
    options: [
      '«Песня о друге»',
      '«Вариации на цыганские темы»',
      '«Кони привередливые»',
      '«Охота на волков»'
    ],
    correctIndex: 1
  },
  'history_ancient_world_13': {
    correctOpt: 'Тактика изматывания противника мелкими стычками (тактика Фабия)'
  },
  'history_middle_ages_rus_70': {
    correctOpt: '«Два Рима пали, третий стоит, а четвертому не бывать»'
  },
  'history_empires_tsars_rus_69': {
    correctOpt: 'Денежная реформа Витте'
  },
  'history_world_wars_revolutions_27': {
    correctOpt: '30 декабря 1922 года'
  },
  'history_world_wars_revolutions_37': {
    correctOpt: 'Прямо на передовую линию фронта защищать подступы к Москве'
  },
  'history_post_1945_modern_46': {
    correctOpt: 'Бросок на Приштину'
  },
  'history_post_1945_modern_57': {
    correctOpt: 'Мюнхенская речь Владимира Путина 2007 года'
  },
  'history_post_1945_modern_69': {
    correctOpt: '«Один пояс — один путь»'
  },
  'history_science_history_discoveries_4': {
    correctOpt: '«Математические начала натуральной философии»'
  },
  'physics_chemistry_mkt_thermodynamics_24': {
    correctOpt: 'Сверхтекучесть жидкого гелия-4'
  },
  'physics_chemistry_mkt_thermodynamics_40': {
    correctOpt: 'До 70–80 °C'
  },
  'physics_chemistry_mkt_thermodynamics_56': {
    correctOpt: 'Процесс рассеяния фонона на электроне'
  },
  'physics_chemistry_mkt_thermodynamics_66': {
    correctOpt: 'S = (k · c³ · A) / (4 · G · ħ)'
  },
  'physics_chemistry_ege_physics_35': {
    correctOpt: 'q = q_max / √2'
  },
  'physics_chemistry_ege_physics_49': {
    correctOpt: 'λ = h / p = h / (m · v)'
  },
  'physics_chemistry_ege_physics_50': {
    correctOpt: 'N = N_0 / 8 (прошло 3 периода полураспада)'
  },
  'physics_chemistry_ege_physics_52': {
    correctOpt: 'Массовое число A не меняется, заряд Z увеличивается на 1'
  },
  'physics_chemistry_general_chemistry_43': {
    correctOpt: 'Фторсурьмяная кислота H[SbF6]'
  },
  'physics_chemistry_general_physics_core_11': {
    correctOpt: 'c = 1 / √(ε_0 · μ_0)'
  },
  'physics_chemistry_general_physics_core_14': {
    options: ['p = I / c', 'p = I · c', 'p = 2 · I / c', 'p = I / (2 · c)'],
    correctIndex: 2
  },
  'physics_chemistry_general_physics_core_25': {
    correctOpt: 'i · ħ · (∂ψ / ∂t) = Ĥψ = [-(ħ² / 2m)∇² + V]ψ'
  },
  'physics_chemistry_general_physics_core_47': {
    correctOpt: 'Φ_0 = h / (2e)'
  },
  'physics_chemistry_general_physics_core_48': {
    correctOpt: 'Закрепление вихрей Абрикосова на дефектах кристаллической решетки'
  },
  'physics_chemistry_general_physics_core_57': {
    correctOpt: 'Никакая локальная теория со скрытыми параметрами не может воспроизвести все квантовые явления'
  },
  'physics_chemistry_general_physics_core_68': {
    correctOpt: 'F/S ∝ 1 / d⁴'
  },
  'fishing_fish_habits_biology_53': {
    correctOpt: 'Хищник атакует жертву так, чтобы проглотить ее с головы'
  },
  'fishing_fish_habits_biology_69': {
    correctOpt: 'Исключительно по запаху через обонятельные ямки'
  },
  'fishing_fish_physics_mechanics_25': {
    correctOpt: 'Сохранение остаточной деформации формы лески после нагрузки'
  },
  'fishing_fish_physics_mechanics_33': {
    correctOpt: 'Тест вершинки подбирается под силу течения так, чтобы поклевки оставались заметны'
  },
  'fishing_fish_physics_mechanics_57': {
    correctOpt: 'Образование парогазовых пузырьков и кавитационная эрозия лопастей винта'
  },
  'fishing_fish_physics_mechanics_60': {
    correctOpt: 'Резиновый амортизатор в бланке штекера гасит рывки крупной рыбы'
  },
  'fishing_river_lake_fishing_16': {
    correctOpt: 'Оснастка с отдельным отводом грузила на тройном вертлюжке'
  },
  'fishing_river_lake_fishing_25': {
    correctOpt: 'Узкотелый плавающий воблер-минноу длиной 110–130 мм'
  },
  'fishing_river_lake_fishing_69': {
    correctOpt: 'Проводка глубоководных приманок за движущейся моторной лодкой (троллинг)'
  },
  'fishing_sea_fishing_20': {
    correctOpt: 'Морской червь нереис'
  },
  'fishing_extreme_conditions_fishing_5': {
    correctOpt: 'Специальный мембранный костюм-поплавок со встроенными плавучими вставками'
  },
  'fishing_extreme_conditions_fishing_36': {
    correctOpt: 'Категорически запрещено поить пострадавшего алкоголем'
  },
  'fishing_extreme_conditions_fishing_45': {
    correctOpt: 'Идти строго друг за другом с дистанцией 5–10 метров'
  },
  'fishing_extreme_conditions_fishing_48': {
    correctOpt: 'Плавучий полипропиленовый линь длиной 15–20 метров с петлей (конец Александрова)'
  },
  'fishing_extreme_conditions_fishing_57': {
    correctOpt: 'Абсолютно надежная бескатушечная конструкция («кобылка»)'
  },
  'fishing_extreme_conditions_fishing_60': {
    correctOpt: 'Анимация тяжелого виба короткими резкими подбросами'
  },
  'literature_russian_literature_23': {
    correctOpt: 'На высокое бесконечное небо над Аустерлицем'
  },
  'literature_russian_literature_34': {
    correctOpt: '«Не шалю, никого не трогаю, починяю примус»'
  },
  'literature_iconic_literature_41': {
    options: ['Время (то, что съедает всё на свете)', 'Тьма', 'Ветер', 'Смерть'],
    correctIndex: 0
  },
  'literature_iconic_literature_62': {
    correctOpt: 'Ослепительный солнечный свет и жара'
  },
  'literature_iconic_literature_63': {
    correctOpt: 'То, что он не плакал на похоронах своей матери'
  },
  'literature_foreign_literature_37': {
    correctOpt: 'Взорвать стратегический мост через ущелье в тылу врага'
  },
  'logic_chgk_deduction_7': {
    correctOpt: 'Длинные рукава боярского кафтана'
  }
};

let applied = 0;
for (const q of qs) {
  if (OPTION_FIXES[q.id]) {
    const f = OPTION_FIXES[q.id];
    if (f.options) {
      q.options = f.options;
      if (f.correctIndex !== undefined) q.correctIndex = f.correctIndex;
    } else if (f.correctOpt) {
      q.options[q.correctIndex] = f.correctOpt;
    }
    applied++;
  }

  // Also fix any unclosed quotation marks in any option
  if (q.options && Array.isArray(q.options)) {
    q.options = q.options.map(opt => {
      let t = opt.trim();
      // fix unclosed quotes like 'Text without closing
      if ((t.startsWith("'") && !t.endsWith("'") && (t.match(/'/g) || []).length % 2 !== 0)) {
        t = t + "'";
      }
      if ((t.startsWith("«") && !t.endsWith("»"))) {
        t = t + "»";
      }
      if ((t.startsWith('"') && !t.endsWith('"') && (t.match(/"/g) || []).length % 2 !== 0)) {
        t = t + '"';
      }
      // capitalize first letter if it starts lowercase
      if (/^[a-zа-яё]/.test(t) && !/^(q|c|p|i|d|h|e|m|v|log|sin|cos|tg|ctg|pH|kW)/.test(t)) {
        t = t.charAt(0).toUpperCase() + t.slice(1);
      }
      return t;
    });
  }
}

fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(qs, null, 2), 'utf8');
console.log(`✅ Broken options repaired! ${applied} targeted questions fixed.`);
