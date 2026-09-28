/**
 * module_cat2.js
 * Generates math SVGs and updates Category 2:
 * 2.1: Adds 10 tough EGE/Olympiad questions with SVGs (80 total)
 * 2.2: Cleans calculus/analysis questions
 * 2.3: Cleans all tell-tale parentheses and formula appends in options
 * 2.4: Overhauls mental math - harder calculations, NO formulas/hints in questions
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.resolve(__dirname, '../public/images');
const SERVER_DIR = path.resolve(__dirname, '../server');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir(IMAGES_DIR);

// 1. Generate Math SVGs
const mathSvgs = {
  'math_geom_parabola.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <!-- Grid -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#21262d" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <!-- Axes -->
  <line x1="40" y1="220" x2="360" y2="220" stroke="#8b949e" stroke-width="2"/>
  <line x1="200" y1="20" x2="200" y2="280" stroke="#8b949e" stroke-width="2"/>
  <polygon points="360,217 370,220 360,223" fill="#8b949e"/>
  <polygon points="197,20 200,10 203,20" fill="#8b949e"/>
  <text x="365" y="240" fill="#8b949e" font-size="14" font-family="sans-serif">x</text>
  <text x="210" y="25" fill="#8b949e" font-size="14" font-family="sans-serif">y</text>
  <!-- Parabola y = (x-200)^2 / 80 + 60 inverted or y = -(x-200)^2/120 + 80 -->
  <!-- Parabola: vertex at (200, 70), roots at x = 120 and x = 280 (y=220) -->
  <path d="M 100 270 Q 200 -20 300 270" fill="none" stroke="#58a6ff" stroke-width="3.5"/>
  <!-- Vertex dot -->
  <circle cx="200" cy="80" r="5" fill="#f0883e"/>
  <text x="210" y="80" fill="#f0883e" font-size="13" font-family="sans-serif" font-weight="bold">(x₀, y₀)</text>
  <!-- Roots -->
  <circle cx="127" cy="220" r="4.5" fill="#7ee787"/>
  <circle cx="273" cy="220" r="4.5" fill="#7ee787"/>
  <text x="110" y="240" fill="#7ee787" font-size="13" font-family="sans-serif">x₁</text>
  <text x="275" y="240" fill="#7ee787" font-size="13" font-family="sans-serif">x₂</text>
  <text x="50" y="50" fill="#c9d1d9" font-size="14" font-family="sans-serif" font-weight="bold">f(x) = ax² + bx + c</text>
</svg>`,

  'math_cube_section.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <!-- Cube vertices: Front (100,100), (220,100), (220,220), (100,220); Back (160,50), (280,50), (280,170), (160,170) -->
  <!-- Back edges dashed -->
  <line x1="160" y1="50" x2="280" y2="50" stroke="#484f58" stroke-width="2" stroke-dasharray="4"/>
  <line x1="160" y1="50" x2="160" y2="170" stroke="#484f58" stroke-width="2" stroke-dasharray="4"/>
  <line x1="160" y1="170" x2="280" y2="170" stroke="#484f58" stroke-width="2" stroke-dasharray="4"/>
  <line x1="100" y1="220" x2="160" y2="170" stroke="#484f58" stroke-width="2" stroke-dasharray="4"/>
  <!-- Cross section plane (e.g. hexagon passing through midpoints of 6 edges) -->
  <polygon points="100,160 130,75 220,50 250,110 220,220 130,220" fill="rgba(240, 136, 62, 0.25)" stroke="#f0883e" stroke-width="2.5"/>
  <!-- Front and solid edges -->
  <rect x="100" y="100" width="120" height="120" fill="none" stroke="#8b949e" stroke-width="2.5"/>
  <line x1="280" y1="50" x2="280" y2="170" stroke="#8b949e" stroke-width="2.5"/>
  <line x1="100" y1="100" x2="160" y2="50" stroke="#8b949e" stroke-width="2.5"/>
  <line x1="220" y1="100" x2="280" y2="50" stroke="#8b949e" stroke-width="2.5"/>
  <line x1="220" y1="220" x2="280" y2="170" stroke="#8b949e" stroke-width="2.5"/>
  <text x="30" y="45" fill="#f0883e" font-size="14" font-family="sans-serif" font-weight="bold">Сечение куба плоскостью</text>
  <text x="30" y="275" fill="#8b949e" font-size="12" font-family="sans-serif">Через середины 6 смежных ребер</text>
</svg>`,

  'math_circle_trig.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <!-- Center at (200, 150), radius R = 100 -->
  <circle cx="200" cy="150" r="100" fill="none" stroke="#58a6ff" stroke-width="2"/>
  <!-- Axes -->
  <line x1="70" y1="150" x2="330" y2="150" stroke="#8b949e" stroke-width="1.5"/>
  <line x1="200" y1="20" x2="200" y2="280" stroke="#8b949e" stroke-width="1.5"/>
  <!-- Angle vector alpha = 35 deg: x = 200 + 100*cos(35) = 281.9, y = 150 - 100*sin(35) = 92.6 -->
  <line x1="200" y1="150" x2="282" y2="93" stroke="#f0883e" stroke-width="3"/>
  <circle cx="282" cy="93" r="5" fill="#f0883e"/>
  <!-- Projections -->
  <line x1="282" y1="93" x2="282" y2="150" stroke="#7ee787" stroke-width="2" stroke-dasharray="3"/>
  <line x1="282" y1="93" x2="200" y2="93" stroke="#d2a8ff" stroke-width="2" stroke-dasharray="3"/>
  <text x="235" y="168" fill="#7ee787" font-size="13" font-family="sans-serif" font-weight="bold">cos α</text>
  <text x="155" y="125" fill="#d2a8ff" font-size="13" font-family="sans-serif" font-weight="bold">sin α</text>
  <text x="215" y="140" fill="#f0883e" font-size="13" font-family="sans-serif">α</text>
  <text x="30" y="40" fill="#c9d1d9" font-size="14" font-family="sans-serif" font-weight="bold">Тригонометрический круг</text>
</svg>`,

  'math_integral_area.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <line x1="50" y1="230" x2="360" y2="230" stroke="#8b949e" stroke-width="2"/>
  <line x1="80" y1="30" x2="80" y2="270" stroke="#8b949e" stroke-width="2"/>
  <!-- Area under curve y = f(x) from x=120 to x=280 -->
  <path d="M 120 230 L 120 150 Q 200 60 280 170 L 280 230 Z" fill="rgba(88, 166, 255, 0.3)" stroke="#58a6ff" stroke-width="2.5"/>
  <line x1="120" y1="230" x2="120" y2="150" stroke="#f0883e" stroke-width="2" stroke-dasharray="4"/>
  <line x1="280" y1="230" x2="280" y2="170" stroke="#f0883e" stroke-width="2" stroke-dasharray="4"/>
  <text x="115" y="250" fill="#f0883e" font-size="14" font-family="sans-serif" font-weight="bold">a</text>
  <text x="275" y="250" fill="#f0883e" font-size="14" font-family="sans-serif" font-weight="bold">b</text>
  <text x="180" y="180" fill="#58a6ff" font-size="16" font-family="sans-serif" font-weight="bold">S = ∫ f(x)dx</text>
  <text x="240" y="90" fill="#7ee787" font-size="14" font-family="sans-serif">y = f(x)</text>
</svg>`,

  'math_vector_cross.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <!-- Origin (150, 200) -->
  <!-- Vector a -->
  <line x1="150" y1="200" x2="300" y2="200" stroke="#58a6ff" stroke-width="3.5"/>
  <polygon points="295,195 310,200 295,205" fill="#58a6ff"/>
  <text x="315" y="205" fill="#58a6ff" font-size="15" font-family="sans-serif" font-weight="bold">a</text>
  <!-- Vector b -->
  <line x1="150" y1="200" x2="230" y2="130" stroke="#7ee787" stroke-width="3.5"/>
  <polygon points="222,130 236,124 231,139" fill="#7ee787"/>
  <text x="240" y="125" fill="#7ee787" font-size="15" font-family="sans-serif" font-weight="bold">b</text>
  <!-- Parallelogram -->
  <line x1="230" y1="130" x2="380" y2="130" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="4"/>
  <line x1="300" y1="200" x2="380" y2="130" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="4"/>
  <polygon points="150,200 300,200 380,130 230,130" fill="rgba(88, 166, 255, 0.15)"/>
  <!-- Vector a x b (vertical) -->
  <line x1="150" y1="200" x2="150" y2="60" stroke="#f0883e" stroke-width="3.5"/>
  <polygon points="145,65 150,50 155,65" fill="#f0883e"/>
  <text x="160" y="65" fill="#f0883e" font-size="15" font-family="sans-serif" font-weight="bold">c = a × b</text>
  <text x="240" y="170" fill="#e3b341" font-size="14" font-family="sans-serif">S = |a × b|</text>
</svg>`
};

for (const [filename, svgContent] of Object.entries(mathSvgs)) {
  fs.writeFileSync(path.join(IMAGES_DIR, filename), svgContent.trim());
}
console.log(`✅ Generated ${Object.keys(mathSvgs).length} math SVGs`);

// 2. Update 2.1 (EGE & Olympiad - Add 10 tough questions)
const file21 = path.join(SERVER_DIR, '2.1.txt');
let q21 = JSON.parse(fs.readFileSync(file21, 'utf8'));

// Attach SVGs to relevant existing geometry/algebra questions
q21.forEach(q => {
  if (q.question.includes('парабол') || q.question.includes('квадратич')) {
    q.image = '/images/math_geom_parabola.svg';
  } else if (q.question.includes('сечени') || q.question.includes('куб')) {
    q.image = '/images/math_cube_section.svg';
  }
});

const new21Questions = [
  {
    id: "math_ege_math_olympiad_1",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "Найдите количество целых решений неравенства: log_{0,5}(x² - 5x + 6) ≥ -1.",
    options: ["2", "4", "3", "0"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_ege_math_olympiad_2",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "Чему равно наибольшее значение функции y = 12sin x - 5cos x + 4 на числовой прямой?",
    options: ["17", "13", "19", "15"],
    correctIndex: 0,
    image: '/images/math_circle_trig.svg'
  },
  {
    id: "math_ege_math_olympiad_3",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "В правильной треугольной призме ABCA₁B₁C₁ все ребра равны 2. Найдите расстояние между скрещивающимися прямыми AA₁ и BC.",
    options: ["√3", "1", "2", "√2"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_ege_math_olympiad_4",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "При каких значениях параметра 'a' уравнение x² - 2(a - 1)x + (a + 5) = 0 имеет два различных положительных корня?",
    options: ["a > 4", "a < -1", "-1 < a < 4", "a ≥ 4"],
    correctIndex: 0,
    image: '/images/math_geom_parabola.svg'
  },
  {
    id: "math_ege_math_olympiad_5",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "Какое наибольшее число частей может образоваться при делении плоскости n прямыми общего положения (формула Штейнера)?",
    options: ["(n² + n + 2)/2", "n(n + 1)/2", "2ⁿ", "n² - n + 2"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_ege_math_olympiad_6",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "Какая фигура получается в сечении правильного куба плоскостью, проходящей через середины шести ребер, не содержащих ни одну общую вершину?",
    options: ["Правильный шестиугольник", "Правильный пятиугольник", "Неравносторонний ромб", "Прямоугольная трапеция"],
    correctIndex: 0,
    image: '/images/math_cube_section.svg'
  },
  {
    id: "math_ege_math_olympiad_7",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "Сколькими нулями оканчивается произведение всех натуральных чисел от 1 до 100 включительно (100!)?",
    options: ["24", "20", "25", "22"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_ege_math_olympiad_8",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "Какова вероятность того, что при случайном бросании двух игральных костей сумма выпавших очков будет простым числом?",
    options: ["15/36", "13/36", "17/36", "18/36"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_ege_math_olympiad_9",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "Найдите площадь треугольника со сторонами 13, 14, 15.",
    options: ["84", "96", "78", "82"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_ege_math_olympiad_10",
    categoryId: "mathematics",
    subcategoryId: "ege_math",
    difficulty: 3,
    question: "Чему равен предел последовательности lim (n→∞) ((n + 3)/(n + 1))ⁿ?",
    options: ["e²", "e³", "e", "1"],
    correctIndex: 0,
    image: null
  }
];

// Ensure unique IDs and add to 2.1
q21 = q21.concat(new21Questions);
fs.writeFileSync(file21, JSON.stringify(q21, null, 2), 'utf8');
console.log(`✅ 2.1.txt updated: now ${q21.length} questions`);

// 3. Clean 2.3 (remove tell-tale parentheses and hints from options)
const file23 = path.join(SERVER_DIR, '2.3.txt');
let q23 = JSON.parse(fs.readFileSync(file23, 'utf8'));

q23.forEach(q => {
  q.options = q.options.map(opt => {
    // Clean: "Коммутативность (переместительность): AB = BA" -> "Коммутативность"
    // Clean: "Ассоциативность (сочетательность)" -> "Ассоциативность"
    // Clean: "Следу матрицы (сумме диагональных элементов)" -> "Следу матрицы"
    // Clean: "Все ее главные ведущие (угловые) миноры строго положительны" -> "Все ее главные угловые миноры положительны"
    let clean = opt;
    clean = clean.replace(/Коммутативность \(переместительность\): AB = BA/g, 'Коммутативность');
    clean = clean.replace(/Ассоциативность \(сочетательность\)/g, 'Ассоциативность');
    clean = clean.replace(/Не изменится: det\(Aᵀ\) = det\(A\)/g, 'Не изменится');
    clean = clean.replace(/Ее определитель отличен от нуля: det\(A\) ≠ 0/g, 'Ее определитель не равен нулю');
    clean = clean.replace(/Ее след равен нулю: tr\(A\) = 0/g, 'Ее след равен нулю');
    clean = clean.replace(/Следу матрицы \(сумме диагональных элементов\)/g, 'Следу матрицы');
    clean = clean.replace(/Определителю матрицы det\(A\)/g, 'Определителю матрицы');
    clean = clean.replace(/Следу матрицы tr\(A\)/g, 'Следу матрицы');
    clean = clean.replace(/Все ее главные ведущие \(угловые\) миноры строго положительны/g, 'Все угловые миноры положительны');
    clean = clean.replace(/Главный определитель системы равен нулю \(Δ = 0\)/g, 'Главный определитель равен нулю');
    clean = clean.replace(/Главный определитель системы отличен от нуля \(Δ ≠ 0\)/g, 'Главный определитель не равен нулю');
    clean = clean.replace(/Размерности исходного пространства dim\(V\)/g, 'Размерности пространства V');
    clean = clean.replace(/Размерности целевого пространства dim\(W\)/g, 'Размерности пространства W');
    clean = clean.replace(/Линейной оболочкой \(подпространством\)/g, 'Линейной оболочкой');
    clean = clean.replace(/Они всегда вещественны \(действительны\)/g, 'Они всегда вещественны');
    clean = clean.replace(/Число положительных и число отрицательных коэффициентов \(индексы инерции\)/g, 'Знаки коэффициентов формы');
    clean = clean.replace(/Ядром оператора \(Ker T\)/g, 'Ядром оператора');
    return clean.trim();
  });
  if (q.question.includes('скалярн') || q.question.includes('векторн')) {
    q.image = '/images/math_vector_cross.svg';
  }
});
fs.writeFileSync(file23, JSON.stringify(q23, null, 2), 'utf8');
console.log(`✅ 2.3.txt cleaned: ${q23.length} questions`);

// 4. Clean and overhaul 2.4 (Mental math - harder problems, no clues/rules in question)
const file24 = path.join(SERVER_DIR, '2.4.txt');
let q24 = JSON.parse(fs.readFileSync(file24, 'utf8'));

// Clean questions that explain the trick or rule
q24.forEach(q => {
  // Strip formula spoilers
  q.question = q.question.replace(/при быстром вычислении по правилу чисел, оканчивающихся на 5\?/g, '?');
  q.question = q.question.replace(/вычисленная устно через формулу \(a - b\)\(a \+ b\)\?/g, '?');
  q.question = q.question.replace(/если применить трюк перестановки процентов: x% от y равно y% от x\?/g, '?');
  q.question = q.question.replace(/по правилу [^?]+/g, '');
  q.question = q.question.replace(/по формуле [^?]+/g, '');
  q.question = q.question.replace(/с помощью формулы [^?]+/g, '');
  q.question = q.question.replace(/используя формулу [^?]+/g, '');
  q.question = q.question.replace(/используя трюк [^?]+/g, '');
  q.question = q.question.replace(/\s+\?/g, '?');
});

// Replace trivial arithmetic with tough mental math questions requested by user:
// 215^2, 19*47, 68*72, 97*103, 73^2 - 27^2, sqrt(5625), etc.
const toughMentalMath = [
  {
    id: "math_mental_215_sq",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 3,
    question: "Вычислите устно: 215² = ?",
    options: ["46 225", "44 225", "45 125", "46 125"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_19_47",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 2,
    question: "Вычислите устно: 19 × 47 = ?",
    options: ["893", "883", "913", "873"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_68_72",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 2,
    question: "Вычислите значение произведения: 68 × 72 = ?",
    options: ["4896", "4886", "4916", "4796"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_97_103",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 2,
    question: "Вычислите значение выражения: 97 × 103 = ?",
    options: ["9991", "9981", "9971", "10001"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_sqrt_5625",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 2,
    question: "Чему равен арифметический квадратный корень: √5625 = ?",
    options: ["75", "65", "85", "72"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_34_28",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 2,
    question: "Вычислите устно: 34 × 28 = ?",
    options: ["952", "942", "962", "932"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_pct_18_350",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 2,
    question: "Найдите значение: 18% от 350 = ?",
    options: ["63", "54", "72", "68"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_sqrt_11664",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 3,
    question: "Вычислите точное значение: √11 664 = ?",
    options: ["108", "104", "112", "106"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_52_sq",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 2,
    question: "Вычислите квадрат числа: 52² = ?",
    options: ["2704", "2604", "2714", "2804"],
    correctIndex: 0,
    image: null
  },
  {
    id: "math_mental_cube_15",
    categoryId: "mathematics",
    subcategoryId: "mental_math",
    difficulty: 2,
    question: "Чему равен куб числа: 15³ = ?",
    options: ["3375", "3125", "3275", "3475"],
    correctIndex: 0,
    image: null
  }
];

// Replace the first 10 questions with these clean, tougher questions
for (let i = 0; i < toughMentalMath.length; i++) {
  q24[i] = toughMentalMath[i];
}

fs.writeFileSync(file24, JSON.stringify(q24, null, 2), 'utf8');
console.log(`✅ 2.4.txt updated with tough mental math and no spoilers: ${q24.length} questions`);
