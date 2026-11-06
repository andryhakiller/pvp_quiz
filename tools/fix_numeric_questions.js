const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '..', 'questions.json');
const qs = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));

// Specific overrides dictionary for numeric questions
const NUMERIC_FIXES = {
  // Power of 10 / Googol / Constants
  'mathematics_numbers_13': {
    question: 'Какова степень десятки в числе Гугол?',
    numericAnswer: 100,
    unit: '',
    options: ['60', '80', '100', '120'],
    correctIndex: 2
  },
  'mathematics_numbers_17': {
    question: 'Каков порядок величины (показатель степени 10) числа возможных состояний кубика Рубика (4,3 × 10ⁿ)?',
    numericAnswer: 19,
    unit: '',
    options: ['14', '16', '19', '22'],
    correctIndex: 2
  },
  'physics_chemistry_numbers_3': {
    question: 'Каков порядок величины (показатель степени 10) постоянной Авогадро (6,02 × 10ⁿ моль⁻¹)?',
    numericAnswer: 23,
    unit: '',
    options: ['19', '21', '23', '26'],
    correctIndex: 2
  },
  'physics_chemistry_numbers_21': {
    question: 'Каков показатель отрицательной степени 10 в значении элементарного электрического заряда (1,6 × 10⁻ⁿ Кл)?',
    numericAnswer: 19,
    unit: '',
    options: ['16', '19', '21', '24'],
    correctIndex: 1
  },
  'physics_chemistry_numbers_22': {
    question: 'Каков показатель отрицательной степени 10 в значении постоянной Планка (6,63 × 10⁻ⁿ Дж·с)?',
    numericAnswer: 34,
    unit: '',
    options: ['28', '31', '34', '37'],
    correctIndex: 2
  },
  'physics_chemistry_numbers_28': {
    question: 'Каков показатель отрицательной степени 10 в значении гравитационной постоянной (6,67 × 10⁻ⁿ Н·м²/кг²)?',
    numericAnswer: 11,
    unit: '',
    options: ['8', '11', '14', '17'],
    correctIndex: 1
  },
  'physics_chemistry_numbers_50': {
    question: 'Каков показатель отрицательной степени 10 в значении постоянной Больцмана (1,38 × 10⁻ⁿ Дж/К)?',
    numericAnswer: 23,
    unit: '',
    options: ['19', '21', '23', '27'],
    correctIndex: 2
  },

  // Planar graph / Fractions / Probabilities
  'mathematics_numbers_36': {
    question: 'Каков коэффициент k перед V в формуле максимального числа ребер планарного графа (kV - 6) при V ≥ 3?',
    numericAnswer: 3,
    unit: '',
    options: ['2', '3', '4', '5'],
    correctIndex: 1
  },
  'mathematics_numbers_42': {
    question: 'Сколько благоприятных исходов (ровно 2 орла) существует при трехкратном подбрасывании правильной монеты?',
    numericAnswer: 3,
    unit: '',
    options: ['1', '2', '3', '4'],
    correctIndex: 2
  },
  'logic_chgk_numbers_12': {
    question: 'В известном парадоксе Монти Холла каков числитель вероятности выигрыша n/3 при смене первоначального выбора двери?',
    numericAnswer: 2,
    unit: '',
    options: ['1', '2', '3', '4'],
    correctIndex: 1
  },
  'logic_chgk_numbers_32': {
    question: 'Сколько всего равновероятных исходов возможно при подбрасывании правильной монеты 4 раза подряд?',
    numericAnswer: 16,
    unit: '',
    options: ['8', '12', '16', '32'],
    correctIndex: 2
  },
  'music_numbers_48': {
    question: 'Сколько четвертных нот содержится в одной целой ноте?',
    numericAnswer: 4,
    unit: '',
    options: ['2', '4', '8', '16'],
    correctIndex: 1
  },

  // Dimensions / Ranges / Spoiled in Question
  'construction_earth_numbers_8': {
    question: 'Какова стандартная длина одинарного строительного кирпича (ГОСТ) в миллиметрах?',
    numericAnswer: 250,
    unit: 'мм',
    options: ['210 мм', '250 мм', '280 мм', '300 мм'],
    correctIndex: 1
  },
  'cinema_arts_numbers_7': {
    question: 'Какова высота картины Леонардо да Винчи «Мона Лиза» (Джоконда) в сантиметрах?',
    numericAnswer: 77,
    unit: 'см',
    options: ['55 см', '67 см', '77 см', '92 см'],
    correctIndex: 2
  },
  'fishing_numbers_23': {
    question: 'При какой температуре воды (°C) обычно начинается ранневесенний нерест щуки?',
    numericAnswer: 4,
    unit: '°C',
    options: ['1 °C', '4 °C', '8 °C', '12 °C'],
    correctIndex: 1
  },
  'fishing_numbers_24': {
    question: 'При какой температуре воды (°C) обычно нерестится карась и сазан?',
    numericAnswer: 18,
    unit: '°C',
    options: ['10 °C', '14 °C', '18 °C', '24 °C'],
    correctIndex: 2
  },
  'transport_numbers_31': {
    question: 'Каков распространенный диаметр колес горных велосипедов (MTB) в дюймах помимо 29 дюймов?',
    numericAnswer: 27.5,
    unit: 'дюйма',
    options: ['24 дюйма', '26 дюймов', '27,5 дюйма', '32 дюйма'],
    correctIndex: 2
  },
  'literature_numbers_27': {
    question: 'За сколько рублей Чичиков в итоге сторговал ревизскую душу у Собакевича за штуку?',
    numericAnswer: 2.5,
    unit: 'рубля',
    options: ['1,5 рубля', '2 рубля', '2,5 рубля', '3 рубля'],
    correctIndex: 2
  },
  'literature_numbers_42': {
    question: 'Сколько миллионов рублей потребовал Остап Бендер у подпольного миллионера Корейко в «Золотом теленке»?',
    numericAnswer: 1,
    unit: 'млн рублей',
    options: ['500 тысяч', '1 млн рублей', '5 млн рублей', '10 млн рублей'],
    correctIndex: 1
  },
  'music_numbers_40': {
    question: 'Сколько полных минут длится композиция «November Rain» группы Guns N\' Roses (8 мин 57 с)?',
    numericAnswer: 8,
    unit: 'минут',
    options: ['6 минут', '7 минут', '8 минут', '10 минут'],
    correctIndex: 2
  },
  'sports_numbers_1': {
    question: 'Сколько полных километров составляет официальная дистанция классического марафона?',
    numericAnswer: 42,
    unit: 'км',
    options: ['40 км', '42 км', '43 км', '45 км'],
    correctIndex: 1
  },

  // Range dash units
  'geography_numbers_37': {
    question: 'Какова средняя глубина судоходной части пролива Босфор в районе Стамбула?',
    numericAnswer: 60,
    unit: 'м',
    options: ['25 м', '60 м', '120 м', '190 м'],
    correctIndex: 1
  },
  'geography_numbers_48': {
    question: 'Какова средняя толщина литосферных плит под океанами?',
    numericAnswer: 7,
    unit: 'км',
    options: ['7 км', '30 км', '60 км', '100 км'],
    correctIndex: 0
  },
  'transport_numbers_10': {
    question: 'Какова крейсерская скорость большинства современных среднемагистральных авиалайнеров (Boeing 737, Airbus A320)?',
    numericAnswer: 840,
    unit: 'км/ч',
    options: ['680 км/ч', '840 км/ч', '1000 км/ч', '1180 км/ч'],
    correctIndex: 1
  },
  'transport_numbers_13': {
    question: 'Какое рекомендуемое давление в шинах легковых автомобилей считается наиболее распространенным?',
    numericAnswer: 2.2,
    unit: 'бар',
    options: ['1,4 бар', '2,2 бар', '3,3 бар', '4,2 бар'],
    correctIndex: 1
  },
  'transport_numbers_34': {
    question: 'Какова осадка крупнейших океанских супертанкеров класса ULCC при полной загрузке?',
    numericAnswer: 25,
    unit: 'м',
    options: ['14 м', '25 м', '38 м', '48 м'],
    correctIndex: 1
  },
  'transport_numbers_35': {
    question: 'Сколько пассажирских мест насчитывает стандартная компоновка салона пассажирского самолета Airbus A320?',
    numericAnswer: 150,
    unit: 'мест',
    options: ['70 мест', '95 мест', '150 мест', '190 мест'],
    correctIndex: 2
  },
  'transport_numbers_39': {
    question: 'Какова максимальная длина крупнейших современных океанских контейнеровозов?',
    numericAnswer: 400,
    unit: 'м',
    options: ['190 м', '265 м', '400 м', '525 м'],
    correctIndex: 2
  },
  'transport_numbers_45': {
    question: 'Какова стандартная длина взлетно-посадочной полосы крупного международного аэропорта для приема дальнемагистральных лайнеров?',
    numericAnswer: 3500,
    unit: 'м',
    options: ['1400 м', '2000 м', '3500 м', '4800 м'],
    correctIndex: 2
  },
  'transport_numbers_46': {
    question: 'Сколько ступеней имеет механическая коробка передач тяжелого магистрального тягача с демультипликатором?',
    numericAnswer: 16,
    unit: 'ступеней',
    options: ['5 ступеней', '9 ступеней', '16 ступеней', '22 ступени'],
    correctIndex: 2
  },
  'construction_earth_numbers_10': {
    question: 'Какова примерная температура в центре ядра Земли?',
    numericAnswer: 5500,
    unit: '°C',
    options: ['2500 °C', '3800 °C', '5500 °C', '8500 °C'],
    correctIndex: 2
  },
  'construction_earth_numbers_18': {
    question: 'Какова средняя толщина континентальной земной коры?',
    numericAnswer: 35,
    unit: 'км',
    options: ['8 км', '35 км', '90 км', '165 км'],
    correctIndex: 1
  },
  'construction_earth_numbers_20': {
    question: 'Какова стандартная высота потолков в современных жилых домах комфорт-класса?',
    numericAnswer: 2.8,
    unit: 'м',
    options: ['2,3 м', '2,8 м', '3,5 м', '4,1 м'],
    correctIndex: 1
  },
  'construction_earth_numbers_25': {
    question: 'Каков типичный диаметр тоннелепроходческого механизированного комплекса (ТПМК) для двухпутных тоннелей метро?',
    numericAnswer: 10,
    unit: 'м',
    options: ['6 м', '8 м', '10 м', '16 м'],
    correctIndex: 2
  },
  'construction_earth_numbers_32': {
    question: 'Каков угол естественного откоса для сухого песчаного грунта?',
    numericAnswer: 32,
    unit: '°',
    options: ['18°', '32°', '48°', '58°'],
    correctIndex: 1
  },
  'construction_earth_numbers_33': {
    question: 'Какова стандартная комфортная высота подступенка лестничного марша в жилом здании?',
    numericAnswer: 15,
    unit: 'см',
    options: ['11 см', '15 см', '23 см', '29 см'],
    correctIndex: 1
  },
  'construction_earth_numbers_34': {
    question: 'Какова стандартная комфортная ширина проступи (ступени) лестницы в жилом здании?',
    numericAnswer: 30,
    unit: 'см',
    options: ['19 см', '23 см', '30 см', '39 см'],
    correctIndex: 2
  },
  'construction_earth_numbers_35': {
    question: 'Какова допустимая влажность древесины для внутренних несущих строительных конструкций?',
    numericAnswer: 12,
    unit: '%',
    options: ['6%', '12%', '28%', '42%'],
    correctIndex: 1
  },
  'construction_earth_numbers_38': {
    question: 'Какова насыпная плотность сухого строительного песка в килограммах на кубический метр?',
    numericAnswer: 1500,
    unit: 'кг/м³',
    options: ['900 кг/м³', '1500 кг/м³', '2200 кг/м³', '2800 кг/м³'],
    correctIndex: 1
  },
  'construction_earth_numbers_46': {
    question: 'Какова температура обжига клинкера во вращающейся цементной печи?',
    numericAnswer: 1450,
    unit: '°C',
    options: ['700 °C', '1000 °C', '1450 °C', '1850 °C'],
    correctIndex: 2
  },
  'cinema_arts_numbers_22': {
    question: 'Сколько кадров в секунду составляет стандартная частота съемки звукового кино со времен Золотого века Голливуда?',
    numericAnswer: 24,
    unit: 'кадра/с',
    options: ['16 кадров/с', '24 кадра/с', '36 кадров/с', '78 кадров/с'],
    correctIndex: 1
  },
  'physics_chemistry_numbers_39': {
    question: 'Каково номинальное напряжение стандартной однофазной бытовой электросети в России и странах Европы?',
    numericAnswer: 230,
    unit: 'В',
    options: ['110 В', '127 В', '230 В', '380 В'],
    correctIndex: 2
  },
  'physics_chemistry_numbers_44': {
    question: 'Какова длина волны света в середине видимого человеком диапазона (зеленая область спектра)?',
    numericAnswer: 550,
    unit: 'нм',
    options: ['190 нм', '550 нм', '1000 нм', '1750 нм'],
    correctIndex: 1
  },
  'fishing_numbers_6': {
    question: 'Какое максимальное напряжение электрического разряда способен генерировать взрослый электрический угорь?',
    numericAnswer: 600,
    unit: 'В',
    options: ['170 В', '400 В', '600 В', '1350 В'],
    correctIndex: 2
  },
  'fishing_numbers_9': {
    question: 'Какова средняя продолжительность жизни гренландской полярной акулы?',
    numericAnswer: 300,
    unit: 'лет',
    options: ['90 лет', '175 лет', '300 лет', '650 лет'],
    correctIndex: 2
  },
  'fishing_numbers_12': {
    question: 'Какова длина популярного микроджигового виброхвоста для ловли окуня в миллиметрах?',
    numericAnswer: 45,
    unit: 'мм',
    options: ['25 мм', '35 мм', '45 мм', '65 мм'],
    correctIndex: 2
  },
  'fishing_numbers_15': {
    question: 'Какова оптимальная концентрация растворенного кислорода в воде для жизнедеятельности лососевых рыб?',
    numericAnswer: 8,
    unit: 'мг/л',
    options: ['2.5 мг/л', '4.5 мг/л', '8 мг/л', '15 мг/л'],
    correctIndex: 2
  },
  'fishing_numbers_18': {
    question: 'Какова максимальная продолжительность жизни обыкновенной щуки в дикой природе?',
    numericAnswer: 25,
    unit: 'лет',
    options: ['9 лет', '17 лет', '25 лет', '55 лет'],
    correctIndex: 2
  },
  'fishing_numbers_25': {
    question: 'Каков типичный диаметр тонкой зимней монофильной лески для ловли на мормышку?',
    numericAnswer: 0.1,
    unit: 'мм',
    options: ['0,1 мм', '0,28 мм', '0,42 мм', '0,65 мм'],
    correctIndex: 0
  },
  'fishing_numbers_26': {
    question: 'Каков максимальный вес приманки для спиннинга класса ультралайт (Ultra Light)?',
    numericAnswer: 5,
    unit: 'г',
    options: ['5 г', '20 г', '60 г', '150 г'],
    correctIndex: 0
  },
  'fishing_numbers_27': {
    question: 'Каков верхний предел теста классического спиннинга класса медиум (Medium)?',
    numericAnswer: 28,
    unit: 'г',
    options: ['4 г', '28 г', '45 г', '100 г'],
    correctIndex: 1
  },
  'fishing_numbers_28': {
    question: 'Какова стандартная длина классического карпового удилища в футах?',
    numericAnswer: 12,
    unit: 'футов',
    options: ['7 футов', '10 футов', '12 футов', '16 футов'],
    correctIndex: 2
  },
  'fishing_numbers_29': {
    question: 'Какова дальность рекордных сверхдальних забросов оснастки в карпфишинге?',
    numericAnswer: 180,
    unit: 'м',
    options: ['50 м', '80 м', '180 м', '350 м'],
    correctIndex: 2
  },
  'fishing_numbers_30': {
    question: 'Сколько тысяч икринок способна выметать крупная самка речного сазана?',
    numericAnswer: 200,
    unit: 'тысяч',
    options: ['5 тысяч', '20 тысяч', '200 тысяч', '5000 тысяч'],
    correctIndex: 2
  },
  'fishing_numbers_33': {
    question: 'Какова максимальная длина китовой акулы — крупнейшей рыбы на Земле?',
    numericAnswer: 14,
    unit: 'м',
    options: ['8 м', '14 м', '23 м', '30 м'],
    correctIndex: 1
  },
  'fishing_numbers_34': {
    question: 'Какова максимальная масса взрослой китовой акулы?',
    numericAnswer: 20,
    unit: 'тонн',
    options: ['5 тонн', '20 тонн', '48 тонн', '90 тонн'],
    correctIndex: 1
  },
  'fishing_numbers_37': {
    question: 'Какова максимальная скорость плавания парусника — быстрейшей рыбы океана?',
    numericAnswer: 100,
    unit: 'км/ч',
    options: ['40 км/ч', '65 км/ч', '100 км/ч', '140 км/ч'],
    correctIndex: 2
  },
  'fishing_numbers_39': {
    question: 'Сколько рядов зубов расположено на челюстях белой акулы?',
    numericAnswer: 5,
    unit: 'рядов',
    options: ['1 ряд', '2 ряда', '5 рядов', '11 рядов'],
    correctIndex: 2
  },
  'fishing_numbers_40': {
    question: 'Какова максимальная длина гигантского кальмара (архитеутиса) с учетом щупалец?',
    numericAnswer: 12,
    unit: 'м',
    options: ['4 м', '12 м', '18 м', '38 м'],
    correctIndex: 1
  },
  'fishing_numbers_41': {
    question: 'На каком расстоянии друг от друга рекомендуется бурить лунки при активном поиске окуня зимой?',
    numericAnswer: 100,
    unit: 'см',
    options: ['8 см', '25 см', '100 см', '200 см'],
    correctIndex: 2
  },
  'fishing_numbers_42': {
    question: 'Какова стандартная длина популярного воблера-минноу для твичинга щуки?',
    numericAnswer: 90,
    unit: 'мм',
    options: ['90 мм', '140 мм', '190 мм', '250 мм'],
    correctIndex: 0
  },
  'fishing_numbers_43': {
    question: 'Каков самый популярный диаметр шнека зимнего ледобура для ловли окуня и плотвы?',
    numericAnswer: 130,
    unit: 'мм',
    options: ['90 мм', '110 мм', '130 мм', '220 мм'],
    correctIndex: 2
  },
  'fishing_numbers_44': {
    question: 'Какова стандартная высота теплого зимнего сапога из ЭВА для рыбалки со льда?',
    numericAnswer: 42,
    unit: 'см',
    options: ['20 см', '32 см', '42 см', '60 см'],
    correctIndex: 2
  },
  'fishing_numbers_49': {
    question: 'Какова минимальная толщина монолитного прозрачного льда, безопасная для одного рыболова?',
    numericAnswer: 5,
    unit: 'см',
    options: ['5 см', '12 см', '28 см', '45 см'],
    correctIndex: 0
  },
  'literature_numbers_19': {
    question: 'В каком году роман «Мастер и Маргарита» был впервые опубликован в СССР в журнале «Москва»?',
    numericAnswer: 1966,
    unit: 'год',
    options: ['1956 год', '1966 год', '1975 год', '1985 год'],
    correctIndex: 1
  },
  'music_numbers_18': {
    question: 'Каков стандартный темп (BPM) большинства классических треков в жанре Drum & Bass?',
    numericAnswer: 174,
    unit: 'BPM',
    options: ['115 BPM', '128 BPM', '145 BPM', '174 BPM'],
    correctIndex: 3
  },
  'music_numbers_19': {
    question: 'Каков типичный темп (BPM) классической танцевальной музыки в стиле House?',
    numericAnswer: 125,
    unit: 'BPM',
    options: ['95 BPM', '125 BPM', '145 BPM', '175 BPM'],
    correctIndex: 1
  },
  'sports_numbers_28': {
    question: 'Какова официальная масса футбольного мяча 5-го размера по регламенту ФИФА в начале матча?',
    numericAnswer: 430,
    unit: 'г',
    options: ['340 г', '430 г', '530 г', '620 г'],
    correctIndex: 1
  },
  'sports_numbers_48': {
    question: 'Какова официальная масса стандартной хоккейной шайбы?',
    numericAnswer: 160,
    unit: 'г',
    options: ['118 г', '160 г', '220 г', '290 г'],
    correctIndex: 1
  },

  // Number spoiled in question text
  'transport_numbers_15': {
    question: 'Сколько ведущих колес имеет классический трехосный полноприводный грузовой вездеход?',
    numericAnswer: 6,
    unit: 'колес'
  },
  'transport_numbers_43': {
    question: 'Каково стандартное октановое число автомобильного бензина марки Премиум по исследовательскому методу?',
    numericAnswer: 95,
    unit: ''
  },
  'physics_chemistry_numbers_45': {
    question: 'Чему равна энтропия идеального кристалла при абсолютном нуле температур согласно третьему началу термодинамики?',
    numericAnswer: 0,
    unit: 'Дж/К'
  },
  'fishing_numbers_13': {
    question: 'Какова масса популярного полунцового (1/2 унции) свинцового грузила типа «чебурашка» для джига?',
    numericAnswer: 14,
    unit: 'г'
  },
  'music_numbers_33': {
    question: 'В каком возрасте трагически погибли Джими Хендрикс, Дженис Джоплин, Джим Моррисон, Курт Кобейн и Эми Уайнхаус?',
    numericAnswer: 27,
    unit: 'лет'
  },
  'sports_numbers_9': {
    question: 'Сколько игроков выходит на поле в стартовом составе одной команды в классическом регби-юнион?',
    numericAnswer: 15,
    unit: 'игроков'
  },
  'sports_numbers_34': {
    question: 'Сколько кеглей расставляется в начале каждого фрейма в классическом боулинге (тенпин)?',
    numericAnswer: 10,
    unit: 'кеглей'
  }
};

let fixedCount = 0;
let strippedTrailingCount = 0;

for (const q of qs) {
  const isNumeric = q.type === 'numeric' || (q.subcategoryId && q.subcategoryId.endsWith('_numbers'));
  if (!isNumeric) continue;

  q.type = 'numeric';

  // Apply explicit fix if in dictionary
  if (NUMERIC_FIXES[q.id]) {
    const f = NUMERIC_FIXES[q.id];
    if (f.question !== undefined) q.question = f.question;
    if (f.numericAnswer !== undefined) q.numericAnswer = f.numericAnswer;
    if (f.unit !== undefined) q.unit = f.unit;
    if (f.options !== undefined) q.options = f.options;
    if (f.correctIndex !== undefined) q.correctIndex = f.correctIndex;
    fixedCount++;
  }

  // Strip trailing (в ...)? from question text
  // e.g. "Какова официальная площадь территории Российской Федерации (в млн км²)?" -> "Какова официальная площадь территории Российской Федерации?"
  const oldQ = q.question;
  let cleanedQ = q.question.replace(/\s*\([вВ]\s+[^\)]+\)\s*\??\s*$/, '?').trim();
  if (!cleanedQ.endsWith('?')) {
    // If it doesn't end with question mark or punctuation, add ?
    if (/[.!]$/.test(cleanedQ)) {
      cleanedQ = cleanedQ.slice(0, -1) + '?';
    } else {
      cleanedQ = cleanedQ + '?';
    }
  }
  // Remove any duplicate ??
  cleanedQ = cleanedQ.replace(/\?+/g, '?');

  if (cleanedQ !== oldQ) {
    q.question = cleanedQ;
    strippedTrailingCount++;
  }

  // Ensure unit has no leftover formula symbols or parenthesized junk
  if (q.unit) {
    q.unit = q.unit.replace(/^\s*[вВ]\s+/, '').replace(/[()]/g, '').trim();
  } else {
    q.unit = '';
  }
}

fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(qs, null, 2), 'utf8');
console.log(`✅ Numeric questions updated:`);
console.log(`   - Explicit dictionary fixes applied: ${fixedCount}`);
console.log(`   - Trailing redundant units stripped from questions: ${strippedTrailingCount}`);

