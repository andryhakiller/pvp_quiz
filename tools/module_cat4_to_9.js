/**
 * module_cat4_to_9.js
 * Generates SVGs for Geology and Fishing, cleans and balances Categories 4 to 9:
 * Cat 4: Construction & Mining (4.1 - 4.5)
 * Cat 5: Cinema & Arts (5.1 - 5.5)
 * Cat 6: History (6.1 - 6.6)
 * Cat 7: Physics & Chemistry (7.1 - 7.4)
 * Cat 8: Fishing (8.1 - 8.6)
 * Cat 9: Literature (9.1 - 9.3)
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.resolve(__dirname, '../public/images');
const SERVER_DIR = path.resolve(__dirname, '../server');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir(IMAGES_DIR);

// 1. Generate Fishing and Geology SVGs
const artSvgs = {
  'fish_pike.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#071b26"/>
  <!-- Pike silhouette (elongated torpedo body, duck-bill snout) -->
  <path d="M 40 120 C 60 110, 110 100, 190 100 C 270 100, 310 115, 330 125 L 370 95 L 360 125 L 370 155 L 330 130 C 300 145, 230 155, 170 155 C 110 155, 70 140, 40 130 Z" fill="#2d6a4f" stroke="#74c69d" stroke-width="2.5"/>
  <!-- Dorsal and anal fins set far back -->
  <polygon points="290,102 320,80 325,108" fill="#1b4332" stroke="#74c69d" stroke-width="1.5"/>
  <polygon points="290,150 320,170 325,145" fill="#1b4332" stroke="#74c69d" stroke-width="1.5"/>
  <!-- Pectoral and pelvic fins -->
  <polygon points="90,140 105,165 115,145" fill="#52b788"/>
  <polygon points="190,155 205,175 215,155" fill="#52b788"/>
  <!-- Eye -->
  <circle cx="70" cy="118" r="5" fill="#d8f3dc"/>
  <circle cx="70" cy="118" r="2.5" fill="#081c15"/>
  <!-- Spots -->
  <circle cx="140" cy="120" r="4" fill="#95d5b2" opacity="0.6"/>
  <circle cx="170" cy="128" r="4.5" fill="#95d5b2" opacity="0.6"/>
  <circle cx="210" cy="122" r="4" fill="#95d5b2" opacity="0.6"/>
  <circle cx="250" cy="130" r="3.5" fill="#95d5b2" opacity="0.6"/>
  <text x="200" y="225" fill="#95d5b2" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">Обыкновенная щука (Esox lucius)</text>
</svg>`,

  'fish_perch.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#071b26"/>
  <!-- Perch silhouette (humpbacked body, spiny dorsal fin) -->
  <path d="M 60 135 C 80 115, 120 85, 190 85 C 260 85, 295 110, 315 125 L 360 100 L 350 130 L 360 160 L 315 140 C 285 175, 220 185, 160 185 C 110 185, 80 160, 60 145 Z" fill="#40916c" stroke="#95d5b2" stroke-width="2.5"/>
  <!-- Spiny first dorsal fin -->
  <polygon points="130,95 145,55 160,50 180,55 200,65 210,88" fill="#1b4332" stroke="#d90429" stroke-width="2"/>
  <!-- Dark vertical tiger stripes -->
  <line x1="140" y1="95" x2="145" y2="165" stroke="#1b4332" stroke-width="7" stroke-linecap="round"/>
  <line x1="180" y1="90" x2="185" y2="175" stroke="#1b4332" stroke-width="7" stroke-linecap="round"/>
  <line x1="220" y1="92" x2="225" y2="170" stroke="#1b4332" stroke-width="7" stroke-linecap="round"/>
  <line x1="260" y1="102" x2="263" y2="155" stroke="#1b4332" stroke-width="6" stroke-linecap="round"/>
  <!-- Red fins -->
  <polygon points="180,185 195,210 210,185" fill="#ef233c"/>
  <polygon points="250,165 265,190 280,155" fill="#ef233c"/>
  <!-- Eye -->
  <circle cx="95" cy="125" r="6" fill="#ffb703"/>
  <circle cx="95" cy="125" r="3" fill="#081c15"/>
  <text x="200" y="235" fill="#95d5b2" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">Речной окунь (Perca fluviatilis)</text>
</svg>`,

  'fish_carp.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#071b26"/>
  <!-- Massive deep body, golden scales -->
  <path d="M 50 145 C 80 105, 140 75, 210 75 C 280 75, 315 110, 330 130 L 375 100 L 365 135 L 375 170 L 330 145 C 295 185, 220 200, 160 200 C 100 200, 70 175, 50 155 Z" fill="#b08968" stroke="#ddb892" stroke-width="2.5"/>
  <!-- Long dorsal fin -->
  <path d="M 160 82 Q 240 75 290 110" fill="none" stroke="#7f5539" stroke-width="12" stroke-linecap="round"/>
  <!-- Barbels (whiskers) at mouth -->
  <path d="M 55 155 Q 50 170 65 175" fill="none" stroke="#ddb892" stroke-width="2.5"/>
  <!-- Eye -->
  <circle cx="85" cy="130" r="6" fill="#ffe6a7"/>
  <circle cx="85" cy="130" r="3" fill="#081c15"/>
  <text x="200" y="235" fill="#ddb892" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">Сазан / Карп (Cyprinus carpio)</text>
</svg>`,

  'fish_catfish.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#071b26"/>
  <!-- Giant flat head, long tapering tail without scales -->
  <path d="M 40 135 C 70 115, 120 110, 200 115 C 280 120, 340 130, 370 135 L 350 150 L 370 165 C 310 165, 210 165, 150 160 C 90 155, 60 150, 40 145 Z" fill="#343a40" stroke="#6c757d" stroke-width="2.5"/>
  <!-- Giant long upper whiskers (barbels) -->
  <path d="M 65 130 Q 110 85 160 90" fill="none" stroke="#ced4da" stroke-width="3" stroke-linecap="round"/>
  <path d="M 65 150 Q 110 185 150 180" fill="none" stroke="#ced4da" stroke-width="3" stroke-linecap="round"/>
  <!-- Small eye -->
  <circle cx="85" cy="125" r="4" fill="#f8f9fa"/>
  <circle cx="85" cy="125" r="2" fill="#000"/>
  <text x="200" y="225" fill="#ced4da" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">Европейский сом (Silurus glanis)</text>
</svg>`,

  'geo_mohs_scale.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <text x="200" y="35" fill="#58a6ff" font-size="15" font-family="sans-serif" font-weight="bold" text-anchor="middle">Шкала твердости Мооса (1 - 10)</text>
  <!-- Step bars -->
  <rect x="50" y="160" width="25" height="30" fill="#8b949e"/>
  <text x="62" y="210" fill="#8b949e" font-size="12" font-family="sans-serif" text-anchor="middle">1 Тальк</text>
  <rect x="85" y="150" width="25" height="40" fill="#8b949e"/>
  <text x="97" y="210" fill="#8b949e" font-size="12" font-family="sans-serif" text-anchor="middle">2 Гипс</text>
  <rect x="120" y="140" width="25" height="50" fill="#7ee787"/>
  <text x="132" y="210" fill="#7ee787" font-size="12" font-family="sans-serif" text-anchor="middle">3 Кальцит</text>
  <rect x="155" y="130" width="25" height="60" fill="#7ee787"/>
  <text x="167" y="210" fill="#7ee787" font-size="12" font-family="sans-serif" text-anchor="middle">5 Апатит</text>
  <rect x="190" y="115" width="25" height="75" fill="#f0883e"/>
  <text x="202" y="210" fill="#f0883e" font-size="12" font-family="sans-serif" text-anchor="middle">7 Кварц</text>
  <rect x="225" y="95" width="25" height="95" fill="#f0883e"/>
  <text x="237" y="210" fill="#f0883e" font-size="12" font-family="sans-serif" text-anchor="middle">8 Топаз</text>
  <rect x="260" y="75" width="25" height="115" fill="#d2a8ff"/>
  <text x="272" y="210" fill="#d2a8ff" font-size="12" font-family="sans-serif" text-anchor="middle">9 Корунд</text>
  <rect x="295" y="55" width="25" height="135" fill="#58a6ff"/>
  <text x="307" y="210" fill="#58a6ff" font-size="12" font-family="sans-serif" text-anchor="middle">10 Алмаз</text>
</svg>`,

  'geo_open_pit.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <!-- Pit benches -->
  <!-- Surface level -->
  <line x1="20" y1="60" x2="80" y2="60" stroke="#8b949e" stroke-width="3"/>
  <line x1="80" y1="60" x2="100" y2="90" stroke="#f0883e" stroke-width="2.5"/>
  <line x1="100" y1="90" x2="140" y2="90" stroke="#8b949e" stroke-width="3"/>
  <line x1="140" y1="90" x2="160" y2="130" stroke="#f0883e" stroke-width="2.5"/>
  <line x1="160" y1="130" x2="190" y2="130" stroke="#8b949e" stroke-width="3"/>
  <line x1="190" y1="130" x2="205" y2="175" stroke="#f0883e" stroke-width="2.5"/>
  <!-- Pit floor -->
  <line x1="205" y1="175" x2="235" y2="175" stroke="#7ee787" stroke-width="4"/>
  <!-- Right side benches -->
  <line x1="235" y1="175" x2="250" y2="130" stroke="#f0883e" stroke-width="2.5"/>
  <line x1="250" y1="130" x2="280" y2="130" stroke="#8b949e" stroke-width="3"/>
  <line x1="280" y1="130" x2="300" y2="90" stroke="#f0883e" stroke-width="2.5"/>
  <line x1="300" y1="90" x2="340" y2="90" stroke="#8b949e" stroke-width="3"/>
  <line x1="340" y1="90" x2="360" y2="60" stroke="#f0883e" stroke-width="2.5"/>
  <line x1="360" y1="60" x2="380" y2="60" stroke="#8b949e" stroke-width="3"/>
  <text x="220" y="200" fill="#7ee787" font-size="12" font-family="sans-serif" text-anchor="middle">Дно карьера (подошва)</text>
  <text x="120" y="80" fill="#f0883e" font-size="11" font-family="sans-serif">Берма / Уступ</text>
  <text x="200" y="35" fill="#c9d1d9" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">Схема открытых горных работ (Карьер)</text>
</svg>`
};

for (const [filename, svgContent] of Object.entries(artSvgs)) {
  fs.writeFileSync(path.join(IMAGES_DIR, filename), svgContent.trim());
}
console.log(`✅ Generated ${Object.keys(artSvgs).length} art SVGs for Fish and Geo`);

// 2. Cleaning and Length Harmonization Function
function cleanAndBalanceFile(filename) {
  const filePath = path.join(SERVER_DIR, filename);
  if (!fs.existsSync(filePath)) return;
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  questions.forEach(q => {
    // 1. Clean quotes around options if present
    q.options = q.options.map(opt => {
      let clean = opt.trim();
      // Remove enclosing quotes
      if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith('«') && clean.endsWith('»'))) {
        clean = clean.slice(1, -1).trim();
      }
      return clean;
    });

    // 2. Clean asymmetric parenthetical explanations
    // Check if ONLY correctIndex has parenthesis
    const hasParen = q.options.map(o => /\([^)]+\)/.test(o));
    if (hasParen[q.correctIndex] && hasParen.filter(Boolean).length === 1) {
      // Clean parenthesis from correct answer
      q.options[q.correctIndex] = q.options[q.correctIndex].replace(/\s*\([^)]+\)/g, '').trim();
    }

    // Also strip common giveaway parentheses even if present in more than 1 option
    q.options = q.options.map(opt => {
      let clean = opt;
      // Remove trailing clarifications like (длинное пояснение)
      clean = clean.replace(/\s*\((?:Тира|Троя|финно-угорская|ретороманский|сейсмосенсорная система|спираль|первая мировая|вторая мировая|хет-трик|определитель|сумма)\)/gi, '');
      return clean.trim();
    });

    // 3. Length Parity Balance:
    // If the correct option is significantly longer (> 2.0x min length and diff > 20 chars),
    // we trim subordinate clauses from correct option or balance distractors
    const cOpt = q.options[q.correctIndex];
    const otherLens = q.options.filter((_, i) => i !== q.correctIndex).map(o => o.length);
    const avgOtherLen = otherLens.reduce((a, b) => a + b, 0) / otherLens.length;

    if (cOpt.length > avgOtherLen * 1.9 && (cOpt.length - avgOtherLen) > 20) {
      // If it contains a comma or dash, often the first part before the comma/dash is the clean answer
      if (cOpt.includes(',') || cOpt.includes(' — ') || cOpt.includes(' - ')) {
        const parts = cOpt.split(/[,—\-]/);
        if (parts[0].trim().length >= 10) {
          q.options[q.correctIndex] = parts[0].trim();
        }
      }
    }

    // 4. Attach relevant SVGs if applicable
    if (filename.startsWith('8.')) {
      if (q.question.includes('щук') || q.question.includes('Щук')) {
        q.image = '/images/fish_pike.svg';
      } else if (q.question.includes('окун') || q.question.includes('Окун')) {
        q.image = '/images/fish_perch.svg';
      } else if (q.question.includes('карп') || q.question.includes('сазан')) {
        q.image = '/images/fish_carp.svg';
      } else if (q.question.includes('сом') || q.question.includes('Сом')) {
        q.image = '/images/fish_catfish.svg';
      }
    } else if (filename.startsWith('4.')) {
      if (q.question.includes('Моос') || q.question.includes('твердост')) {
        q.image = '/images/geo_mohs_scale.svg';
      } else if (q.question.includes('карьер') || q.question.includes('уступ') || q.question.includes('открыт')) {
        q.image = '/images/geo_open_pit.svg';
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
}

// Clean all files in Categories 4 through 9
const catFiles = [
  '4.1.txt', '4.2.txt', '4.3.txt', '4.4.txt', '4.5.txt',
  '5.1.txt', '5.2.txt', '5.3.txt', '5.4.txt', '5.5.txt',
  '6.1.txt', '6.2.txt', '6.3.txt', '6.4.txt', '6.5.txt', '6.6.txt',
  '7.1.txt', '7.2.txt', '7.3.txt', '7.4.txt',
  '8.1.txt', '8.2.txt', '8.3.txt', '8.4.txt', '8.5.txt', '8.6.txt',
  '9.1.txt', '9.2.txt', '9.3.txt'
];

catFiles.forEach(f => {
  cleanAndBalanceFile(f);
  console.log(`✅ Cleaned and balanced: ${f}`);
});

console.log("🎉 All files from 4.1 to 9.3 cleaned and balanced!");
