'use strict';
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'public', 'images');
const OUT_FILE = path.join(__dirname, '..', 'server', '1.1.txt');
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

function writeSvg(filename, content) {
    fs.writeFileSync(path.join(IMG_DIR, filename), content.trim(), 'utf8');
}

function svgFlagWrap(w, h, inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#111"/>
  ${inner}
</svg>`;
}

function svgMapCard(title, silhouetteD, detailD = '', color = '#E63946') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 340" width="500" height="340">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${color}" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="500" height="340" fill="url(#bg)"/>
  <!-- Coordinate grid -->
  <g stroke="#334155" stroke-width="1" stroke-dasharray="4,4" opacity="0.4">
    <line x1="50" y1="0" x2="50" y2="340"/>
    <line x1="150" y1="0" x2="150" y2="340"/>
    <line x1="250" y1="0" x2="250" y2="340"/>
    <line x1="350" y1="0" x2="350" y2="340"/>
    <line x1="450" y1="0" x2="450" y2="340"/>
    <line x1="0" y1="70" x2="500" y2="70"/>
    <line x1="0" y1="170" x2="500" y2="170"/>
    <line x1="0" y1="270" x2="500" y2="270"/>
  </g>
  <!-- Compass mark -->
  <g transform="translate(450, 45)" stroke="#64748B" stroke-width="1.5" fill="none">
    <circle cx="0" cy="0" r="18"/>
    <path d="M 0 -14 L 4 -2 L 14 0 L 4 2 L 0 14 L -4 2 L -14 0 L -4 -2 Z" fill="#94A3B8"/>
    <polygon points="0,-14 4,-2 0,0 -4,-2" fill="#E2E8F0"/>
    <text x="0" y="-20" font-size="10" font-family="sans-serif" font-weight="700" fill="#94A3B8" text-anchor="middle">N</text>
  </g>
  <!-- Territory Silhouette -->
  <g filter="url(#glow)">
    <path d="${silhouetteD}" fill="${color}" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
  </g>
  ${detailD ? `<path d="${detailD}" fill="none" stroke="#FFFFFF88" stroke-width="1.5"/>` : ''}
  <!-- Subtitle badge -->
  <rect x="25" y="295" width="450" height="30" rx="6" fill="#00000066"/>
  <text x="250" y="315" font-family="sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle" letter-spacing="1">ГЕОГРАФИЧЕСКИЙ КОНТУР ТЕРРИТОРИИ</text>
</svg>`;
}

function svgShieldCard(title, shieldColor, emblemSvg, sub = 'ГЕРАЛЬДИЧЕСКИЙ СИМВОЛ') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="sbg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0B0F19"/>
    </radialGradient>
    <filter id="sh-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.7"/>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(#sbg)"/>
  <!-- Heraldic Shield -->
  <g filter="url(#sh-shadow)">
    <path d="M 100 50 L 300 50 L 300 230 C 300 320 200 360 200 360 C 200 360 100 320 100 230 Z" fill="${shieldColor}" stroke="#F1F5F9" stroke-width="5" stroke-linejoin="round"/>
    <path d="M 112 62 L 288 62 L 288 225 C 288 305 200 342 200 342 C 200 342 112 305 112 225 Z" fill="none" stroke="#FFFFFF33" stroke-width="2"/>
    ${emblemSvg}
  </g>
</svg>`;
}

// ─── GENERATE IMAGES ─────────────────────────────────────────────────────────

// 35 Base Flags
const flagSvgs = {
    'flag_nepal.svg': `<polygon points="0,0 240,160 80,160 270,360 0,360" fill="#DC143C" stroke="#003893" stroke-width="8"/><circle cx="70" cy="110" r="30" fill="#FFF"/><circle cx="70" cy="100" r="30" fill="#DC143C"/><circle cx="80" cy="270" r="40" fill="#FFF"/>`,
    'flag_switzerland.svg': `<rect width="300" height="300" fill="#D52B1E"/><rect x="125" y="50" width="50" height="200" fill="#FFF"/><rect x="50" y="125" width="200" height="50" fill="#FFF"/>`,
    'flag_mozambique.svg': `<rect width="450" height="90" fill="#006600"/><rect y="90" width="450" height="15" fill="#FFF"/><rect y="105" width="450" height="90" fill="#000"/><rect y="195" width="450" height="15" fill="#FFF"/><rect y="210" width="450" height="90" fill="#FCE100"/><polygon points="0,0 200,150 0,300" fill="#D21034"/><polygon points="60,110 75,155 120,155 85,180 98,225 60,198 22,225 35,180 0,155 45,155" fill="#FCE100"/><line x1="25" y1="180" x2="95" y2="130" stroke="#000" stroke-width="6"/><rect x="50" y="150" width="25" height="15" fill="#FFF" stroke="#000" stroke-width="2"/>`,
    'flag_cyprus.svg': `<rect width="450" height="300" fill="#FFF"/><path d="M 170 140 Q 230 110 270 120 Q 320 90 350 80 Q 300 110 280 130 Q 240 160 190 170 Q 150 160 170 140 Z" fill="#D47600"/><path d="M 180 220 Q 225 250 270 220" fill="none" stroke="#4E7037" stroke-width="8"/>`,
    'flag_gdr.svg': `<rect width="450" height="100" fill="#000"/><rect y="100" width="450" height="100" fill="#DD0000"/><rect y="200" width="450" height="100" fill="#FFCE00"/><circle cx="225" cy="150" r="50" fill="none" stroke="#FFCE00" stroke-width="6"/><line x1="210" y1="170" x2="240" y2="130" stroke="#FFCE00" stroke-width="6"/><path d="M 215 130 L 225 115 L 235 130" fill="none" stroke="#FFCE00" stroke-width="4"/>`,
    'flag_czechoslovakia.svg': `<rect width="450" height="150" fill="#FFF"/><rect y="150" width="450" height="150" fill="#D7141A"/><polygon points="0,0 225,150 0,300" fill="#11457E"/>`,
    'flag_yugoslavia.svg': `<rect width="450" height="100" fill="#003893"/><rect y="100" width="450" height="100" fill="#FFF"/><rect y="200" width="450" height="100" fill="#DE0000"/><polygon points="225,105 235,135 265,135 240,155 250,185 225,168 200,185 210,155 185,135 215,135" fill="#DE0000" stroke="#FCE100" stroke-width="3"/>`,
    'flag_amsterdam.svg': `<rect width="450" height="100" fill="#EA212D"/><rect y="100" width="450" height="100" fill="#000"/><rect y="200" width="450" height="100" fill="#EA212D"/><g fill="#FFF" font-family="sans-serif" font-size="80" font-weight="900" text-anchor="middle"><text x="145" y="178">✕</text><text x="225" y="178">✕</text><text x="305" y="178">✕</text></g>`,
    'flag_venice.svg': `<rect width="450" height="300" fill="#8B0000"/><rect x="20" y="20" width="410" height="260" fill="none" stroke="#DAA520" stroke-width="4"/><circle cx="180" cy="150" r="50" fill="#DAA520"/><text x="180" y="160" font-size="40" text-anchor="middle" fill="#8B0000">🦁</text><line x1="330" y1="70" x2="430" y2="70" stroke="#DAA520" stroke-width="8"/><line x1="330" y1="120" x2="430" y2="120" stroke="#DAA520" stroke-width="8"/><line x1="330" y1="180" x2="430" y2="180" stroke="#DAA520" stroke-width="8"/><line x1="330" y1="230" x2="430" y2="230" stroke="#DAA520" stroke-width="8"/>`,
    'flag_corsica.svg': `<rect width="450" height="300" fill="#FFF"/><circle cx="225" cy="150" r="60" fill="#111"/><path d="M 180 135 Q 225 125 270 135" stroke="#FFF" stroke-width="12" fill="none"/><path d="M 270 135 L 295 155" stroke="#FFF" stroke-width="8" fill="none"/>`,
    'flag_sicily.svg': `<polygon points="0,0 450,0 0,300" fill="#FC3"/><polygon points="450,0 450,300 0,300" fill="#D00"/><circle cx="225" cy="150" r="40" fill="#FD8"/><path d="M 225 110 L 225 70 M 190 170 L 150 190 M 260 170 L 300 190" stroke="#FD8" stroke-width="12" stroke-linecap="round"/>`,
    'flag_basque.svg': `<rect width="450" height="300" fill="#D52B1E"/><line x1="0" y1="0" x2="450" y2="300" stroke="#009B48" stroke-width="40"/><line x1="450" y1="0" x2="0" y2="300" stroke="#009B48" stroke-width="40"/><rect x="205" y="0" width="40" height="300" fill="#FFF"/><rect x="0" y="130" width="450" height="40" fill="#FFF"/>`,
    'flag_california.svg': `<rect width="450" height="250" fill="#FFF"/><rect y="250" width="450" height="50" fill="#BD1021"/><polygon points="60,40 66,58 84,58 70,70 75,88 60,76 45,88 50,70 36,58 54,58" fill="#BD1021"/><ellipse cx="230" cy="150" rx="70" ry="40" fill="#6B4423"/><circle cx="170" cy="135" r="25" fill="#6B4423"/>`,
    'flag_maryland.svg': `<rect width="225" height="150" fill="#EAAA00"/><rect x="225" width="225" height="150" fill="#FFF"/><rect y="150" width="225" height="150" fill="#FFF"/><rect x="225" y="150" width="225" height="150" fill="#EAAA00"/><line x1="0" y1="0" x2="225" y2="150" stroke="#000" stroke-width="30"/><line x1="225" y1="150" x2="450" y2="300" stroke="#000" stroke-width="30"/><line x1="225" y1="0" x2="450" y2="150" stroke="#E03A3E" stroke-width="30"/><line x1="0" y1="150" x2="225" y2="300" stroke="#E03A3E" stroke-width="30"/>`,
    'flag_russian_empire.svg': `<rect width="450" height="100" fill="#000"/><rect y="100" width="450" height="100" fill="#F8B800"/><rect y="200" width="450" height="100" fill="#FFF"/>`,
    'flag_transnistria.svg': `<rect width="450" height="120" fill="#E00"/><rect y="120" width="450" height="60" fill="#090"/><rect y="180" width="450" height="120" fill="#E00"/><text x="60" y="70" font-size="40" fill="#FE0">☭</text>`,
    'flag_tibet.svg': `<rect width="450" height="300" fill="#1B4D89"/><polygon points="225,150 0,300 450,300" fill="#FFF"/><circle cx="225" cy="150" r="30" fill="#F4A900"/><line x1="225" y1="150" x2="100" y2="0" stroke="#D32F2F" stroke-width="12"/><line x1="225" y1="150" x2="225" y2="0" stroke="#D32F2F" stroke-width="12"/><line x1="225" y1="150" x2="350" y2="0" stroke="#D32F2F" stroke-width="12"/>`,
    'flag_greenland.svg': `<rect width="450" height="150" fill="#FFF"/><rect y="150" width="450" height="150" fill="#D00C27"/><path d="M 180 70 A 80 80 0 0 0 180 230 A 80 80 0 0 1 180 70" fill="#D00C27"/><path d="M 180 150 A 80 80 0 0 1 260 150 A 80 80 0 0 1 180 150" fill="#FFF"/>`,
    'flag_wales.svg': `<rect width="450" height="150" fill="#FFF"/><rect y="150" width="450" height="150" fill="#00AB39"/><text x="225" y="190" font-size="120" text-anchor="middle" fill="#D32F2F">🐉</text>`,
    'flag_bavaria.svg': `<rect width="450" height="300" fill="#0098D4"/><g fill="#FFF"><polygon points="50,0 100,50 50,100 0,50"/><polygon points="150,0 200,50 150,100 100,50"/><polygon points="250,0 300,50 250,100 200,50"/><polygon points="350,0 400,50 350,100 300,50"/><polygon points="100,50 150,100 100,150 50,100"/><polygon points="200,50 250,100 200,150 150,100"/><polygon points="300,50 350,100 300,150 250,100"/><polygon points="400,50 450,100 400,150 350,100"/></g>`,
    'flag_calico_jack.svg': `<rect width="450" height="300" fill="#000"/><circle cx="225" cy="120" r="45" fill="#FFF"/><circle cx="210" cy="120" r="10" fill="#000"/><circle cx="240" cy="120" r="10" fill="#000"/><line x1="140" y1="240" x2="310" y2="180" stroke="#FFF" stroke-width="12" stroke-linecap="round"/><line x1="310" y1="240" x2="140" y2="180" stroke="#FFF" stroke-width="12" stroke-linecap="round"/>`,
    'flag_quebec.svg': `<rect width="450" height="300" fill="#003882"/><rect x="200" width="50" height="300" fill="#FFF"/><rect y="125" width="450" height="50" fill="#FFF"/><text x="100" y="85" font-size="45" text-anchor="middle" fill="#FFF">⚜</text><text x="350" y="85" font-size="45" text-anchor="middle" fill="#FFF">⚜</text><text x="100" y="245" font-size="45" text-anchor="middle" fill="#FFF">⚜</text><text x="350" y="245" font-size="45" text-anchor="middle" fill="#FFF">⚜</text>`,
    'flag_gadsden.svg': `<rect width="450" height="300" fill="#FDD20E"/><ellipse cx="225" cy="220" rx="140" ry="25" fill="#4B6634"/><path d="M 180 200 Q 225 100 270 190 Q 250 140 220 150 Q 200 130 180 180" fill="none" stroke="#222" stroke-width="16" stroke-linecap="round"/><circle cx="220" cy="130" r="12" fill="#222"/><text x="225" y="275" font-size="20" font-weight="900" text-anchor="middle" fill="#000" letter-spacing="3">DONT TREAD ON ME</text>`,
    'flag_sealand.svg': `<polygon points="0,0 450,0 0,300" fill="#D32F2F"/><polygon points="0,300 450,0 450,300" fill="#000"/><polygon points="0,300 120,300 450,80 450,0 330,0 0,220" fill="#FFF"/>`,
    'flag_austria_hungary.svg': `<rect width="450" height="100" fill="#D81E05"/><rect y="100" width="450" height="100" fill="#FFF"/><rect y="200" width="225" height="100" fill="#D81E05"/><rect x="225" y="200" width="225" height="100" fill="#3B8E37"/><circle cx="120" cy="150" r="30" fill="#FFC72C"/><circle cx="330" cy="150" r="30" fill="#FFC72C"/>`,
    'flag_uruguay.svg': `<rect width="450" height="300" fill="#FFF"/><rect y="33" width="450" height="33" fill="#0038A8"/><rect y="100" width="450" height="33" fill="#0038A8"/><rect y="167" width="450" height="33" fill="#0038A8"/><rect y="233" width="450" height="33" fill="#0038A8"/><rect width="135" height="135" fill="#FFF"/><circle cx="67" cy="67" r="28" fill="#FCD116" stroke="#9B6C00" stroke-width="2"/><text x="67" y="77" font-size="26" text-anchor="middle" fill="#9B6C00">☀</text>`,
    'flag_belize.svg': `<rect width="450" height="30" fill="#D91024"/><rect y="30" width="450" height="240" fill="#003F87"/><rect y="270" width="450" height="30" fill="#D91024"/><circle cx="225" cy="150" r="60" fill="#FFF"/><circle cx="225" cy="150" r="54" fill="none" stroke="#2B7A27" stroke-width="4"/><text x="225" y="165" font-size="45" text-anchor="middle">🌳</text>`,
    'flag_bhutan.svg': `<polygon points="0,0 450,0 0,300" fill="#FFCC00"/><polygon points="450,0 450,300 0,300" fill="#FF4E12"/><text x="225" y="180" font-size="90" text-anchor="middle" fill="#FFF">🐉</text>`,
    'flag_grenada.svg': `<rect width="450" height="300" fill="#C8102E"/><rect x="30" y="30" width="390" height="240" fill="#007A3D"/><polygon points="30,30 420,30 225,150" fill="#FFD100"/><polygon points="30,270 420,270 225,150" fill="#FFD100"/><circle cx="225" cy="150" r="30" fill="#C8102E"/><text x="225" y="160" font-size="30" text-anchor="middle" fill="#FFD100">★</text>`,
    'flag_barbados.svg': `<rect width="150" height="300" fill="#00267F"/><rect x="150" width="150" height="300" fill="#FFC726"/><rect x="300" width="150" height="300" fill="#00267F"/><text x="225" y="190" font-size="110" text-anchor="middle" fill="#000">🔱</text>`,
    'flag_eswatini.svg': `<rect width="450" height="60" fill="#4169E1"/><rect y="60" width="450" height="15" fill="#FFD700"/><rect y="75" width="450" height="150" fill="#B22222"/><rect y="225" width="450" height="15" fill="#FFD700"/><rect y="240" width="450" height="60" fill="#4169E1"/><ellipse cx="225" cy="150" rx="80" ry="40" fill="#FFF" stroke="#000" stroke-width="4"/><ellipse cx="205" cy="150" rx="40" ry="30" fill="#000"/>`,
    'flag_turkmenistan.svg': `<rect width="450" height="300" fill="#228844"/><rect x="40" y="0" width="60" height="300" fill="#990022"/><circle cx="160" cy="70" r="30" fill="#FFF"/><circle cx="170" cy="70" r="30" fill="#228844"/><text x="140" y="55" font-size="16" fill="#FFF">★</text>`,
    'flag_kazakhstan.svg': `<rect width="450" height="300" fill="#00AFCA"/><circle cx="225" cy="130" r="45" fill="#FEC50C"/><path d="M 160 190 Q 225 150 290 190 Q 225 170 160 190" fill="#FEC50C"/><rect x="15" y="10" width="30" height="280" fill="none" stroke="#FEC50C" stroke-width="6"/>`,
    'flag_south_africa.svg': `<rect width="450" height="150" fill="#DE3831"/><rect y="150" width="450" height="150" fill="#002395"/><polygon points="0,0 180,150 0,300" fill="#000"/><polygon points="0,0 220,150 0,300" fill="none" stroke="#FFB612" stroke-width="20"/><path d="M 0,0 L 220,150 L 450,150 M 220,150 L 0,300" fill="none" stroke="#007A4D" stroke-width="50"/>`,
    'flag_kiribati.svg': `<rect width="450" height="150" fill="#D4121A"/><rect y="150" width="450" height="150" fill="#0055A5"/><path d="M 0 175 Q 75 160 150 175 T 300 175 T 450 175" fill="none" stroke="#FFF" stroke-width="12"/><circle cx="225" cy="150" r="50" fill="#FFCC00"/><polygon points="225,50 200,90 250,90" fill="#FFCC00"/>`,
};

for (const [fn, inner] of Object.entries(flagSvgs)) {
    writeSvg(fn, svgFlagWrap(450, 300, inner));
}

// 20 US States Silhouette SVG Maps
// Oklahoma (with prominent panhandle!), Texas, Florida, California, Alaska, Hawaii, New York, Ohio, Washington, Louisiana, Nevada, Colorado, Arizona, Michigan, Pennsylvania, Illinois, Georgia, Massachusetts, Montana, North Carolina
const usStates = [
    { id: 'oklahoma', name: 'Оклахома', d: 'M 100 100 L 220 100 L 220 70 L 380 70 L 380 230 L 290 230 L 270 200 L 210 240 L 190 200 L 100 200 Z' },
    { id: 'texas', name: 'Техас', d: 'M 170 40 L 250 40 L 250 110 L 360 110 L 360 210 L 280 270 L 250 330 L 220 300 L 160 250 L 110 210 L 170 170 Z' },
    { id: 'florida', name: 'Флорида', d: 'M 100 80 L 290 80 L 330 180 L 340 270 L 320 280 L 290 230 L 270 140 L 100 120 Z' },
    { id: 'california', name: 'Калифорния', d: 'M 130 50 L 260 50 L 220 200 L 340 310 L 310 330 L 180 260 L 110 120 Z' },
    { id: 'alaska', name: 'Аляска', d: 'M 120 70 L 350 70 L 350 220 L 300 210 L 260 270 L 220 230 L 160 260 L 80 240 L 100 170 L 70 140 Z' },
    { id: 'hawaii', name: 'Гавайи', d: 'M 100 220 A 15 10 0 1 0 130 220 M 160 190 A 20 12 0 1 0 190 190 M 230 150 A 25 15 0 1 0 270 150 M 320 110 A 35 25 0 1 0 370 110' },
    { id: 'new_york', name: 'Нью-Йорк', d: 'M 210 60 L 320 60 L 320 190 L 360 230 L 320 270 L 250 230 L 140 210 L 140 140 Z' },
    { id: 'ohio', name: 'Огайо', d: 'M 130 80 L 330 80 L 350 220 L 270 270 L 180 260 L 130 230 Z' },
    { id: 'washington', name: 'Вашингтон', d: 'M 120 70 L 380 70 L 380 240 L 200 240 L 180 170 L 130 180 L 100 120 Z' },
    { id: 'louisiana', name: 'Луизиана', d: 'M 150 70 L 270 70 L 270 170 L 340 170 L 370 240 L 330 260 L 270 220 L 170 230 L 150 160 Z' },
    { id: 'nevada', name: 'Невада', d: 'M 140 50 L 330 50 L 330 250 L 250 320 L 180 200 Z' },
    { id: 'colorado', name: 'Колорадо', d: 'M 110 90 L 390 90 L 390 250 L 110 250 Z' },
    { id: 'arizona', name: 'Аризона', d: 'M 130 60 L 360 60 L 360 280 L 180 280 L 120 210 Z' },
    { id: 'michigan', name: 'Мичиган', d: 'M 100 80 L 260 80 L 260 110 L 140 110 Z M 270 130 L 330 130 L 350 230 L 280 260 L 270 190 Z' },
    { id: 'pennsylvania', name: 'Пенсильвания', d: 'M 100 90 L 380 90 L 400 180 L 370 240 L 100 240 Z' },
    { id: 'illinois', name: 'Иллинойс', d: 'M 180 60 L 280 60 L 280 150 L 310 240 L 250 290 L 200 240 L 180 140 Z' },
    { id: 'georgia', name: 'Джорджия', d: 'M 160 70 L 310 70 L 340 210 L 290 270 L 170 270 L 170 140 Z' },
    { id: 'massachusetts', name: 'Массачусетс', d: 'M 110 110 L 320 110 L 320 150 L 390 170 L 380 210 L 340 170 L 110 160 Z' },
    { id: 'montana', name: 'Монтана', d: 'M 90 70 L 410 70 L 410 230 L 190 230 L 150 180 L 120 170 Z' },
    { id: 'north_carolina', name: 'Северная Каролина', d: 'M 100 140 L 360 110 L 430 160 L 380 200 L 240 190 L 100 190 Z' },
];

for (const st of usStates) {
    writeSvg(`us_state_${st.id}.svg`, svgMapCard(`Штат США: ${st.name}`, st.d, '', '#E63946'));
}

// 20 Russian Republics / Regions Silhouette SVG Maps
const ruRegions = [
    { id: 'tatarstan', name: 'Республика Татарстан', d: 'M 130 90 L 260 80 L 370 120 L 360 210 L 280 250 L 190 240 L 120 170 Z', color: '#06D6A0' },
    { id: 'sakha_yakutia', name: 'Республика Саха (Якутия)', d: 'M 100 130 L 210 60 L 380 60 L 420 150 L 370 260 L 250 270 L 150 220 Z', color: '#4CC9F0' },
    { id: 'bashkortostan', name: 'Республика Башкортостан', d: 'M 170 70 L 290 70 L 330 180 L 280 270 L 170 260 L 140 160 Z', color: '#00A86B' },
    { id: 'dagestan', name: 'Республика Дагестан', d: 'M 210 60 L 270 90 L 300 230 L 230 300 L 170 250 L 190 150 Z', color: '#10B981' },
    { id: 'karelia', name: 'Республика Карелия', d: 'M 190 50 L 290 90 L 280 270 L 170 280 L 160 150 Z', color: '#3B82F6' },
    { id: 'buryatia', name: 'Республика Бурятия', d: 'M 140 90 L 270 70 L 370 140 L 330 250 L 210 250 L 190 170 Z', color: '#F59E0B' },
    { id: 'kalmykia', name: 'Республика Калмыкия', d: 'M 140 80 L 330 90 L 350 210 L 260 270 L 150 220 Z', color: '#FBBF24' },
    { id: 'tyva', name: 'Республика Тыва', d: 'M 110 130 L 240 90 L 380 120 L 360 220 L 210 240 L 130 200 Z', color: '#38BDF8' },
    { id: 'chuvashia', name: 'Чувашская Республика', d: 'M 170 80 L 310 80 L 320 220 L 260 260 L 170 240 Z', color: '#EF4444' },
    { id: 'udmurtia', name: 'Удмуртская Республика', d: 'M 180 60 L 300 80 L 300 250 L 210 270 L 160 180 Z', color: '#EC4899' },
    { id: 'komi', name: 'Республика Коми', d: 'M 160 50 L 330 80 L 360 230 L 240 270 L 130 180 Z', color: '#8B5CF6' },
    { id: 'chechnya', name: 'Чеченская Республика', d: 'M 210 80 L 300 90 L 300 240 L 200 250 L 180 160 Z', color: '#059669' },
    { id: 'north_ossetia', name: 'Северная Осетия — Алания', d: 'M 180 90 L 300 90 L 300 230 L 180 240 Z', color: '#E11D48' },
    { id: 'altai_rep', name: 'Республика Алтай', d: 'M 190 70 L 300 90 L 310 250 L 220 290 L 170 200 Z', color: '#0284C7' },
    { id: 'khakassia', name: 'Республика Хакасия', d: 'M 190 70 L 290 90 L 270 260 L 170 260 L 170 150 Z', color: '#D97706' },
    { id: 'kamchatka', name: 'Камчатский край', d: 'M 260 50 L 330 70 L 270 260 L 220 310 L 210 230 L 240 140 Z', color: '#0EA5E9' },
    { id: 'sakhalin', name: 'Сахалинская область', d: 'M 230 40 L 260 50 L 245 280 L 220 280 L 225 150 Z', color: '#6366F1' },
    { id: 'crimea', name: 'Республика Крым', d: 'M 160 120 L 290 100 L 380 140 L 310 210 L 170 230 L 120 180 Z', color: '#2563EB' },
    { id: 'yamal', name: 'Ямало-Ненецкий АО', d: 'M 150 70 L 310 50 L 360 210 L 260 260 L 130 180 Z', color: '#0D9488' },
    { id: 'chukotka', name: 'Чукотский АО', d: 'M 110 110 L 370 70 L 410 150 L 330 260 L 170 230 Z', color: '#64748B' },
];

for (const reg of ruRegions) {
    writeSvg(`ru_region_${reg.id}.svg`, svgMapCard(reg.name, reg.d, '', reg.color));
}

// 20 Heraldic Shields & City Symbols
const shields = [
    { id: 'france', color: '#002395', emblem: `<text x="200" y="220" font-size="110" text-anchor="middle" fill="#FFD700">⚜</text>`, q: 'Герб Франции (Флёр-де-лис)' },
    { id: 'perm', color: '#CC0000', emblem: `<circle cx="200" cy="180" r="50" fill="#FFF"/><text x="200" y="210" font-size="70" text-anchor="middle">🐻</text><rect x="175" y="110" width="50" height="20" fill="#FFD700"/>`, q: 'Герб города Перми (серебряный медведь с Евангелием)' },
    { id: 'spb', color: '#DC2626', emblem: `<line x1="140" y1="120" x2="260" y2="280" stroke="#FFF" stroke-width="14" stroke-linecap="round"/><line x1="260" y1="120" x2="140" y2="280" stroke="#FFF" stroke-width="14" stroke-linecap="round"/><line x1="200" y1="90" x2="200" y2="310" stroke="#FFD700" stroke-width="10"/><circle cx="200" cy="90" r="14" fill="#FFD700"/>`, q: 'Герб Санкт-Петербурга (скрещенные якоря и скипетр)' },
    { id: 'moscow', color: '#DC2626', emblem: `<circle cx="200" cy="170" r="60" fill="#2563EB"/><text x="200" y="210" font-size="75" text-anchor="middle">🗡️</text><path d="M 140 270 Q 200 240 260 280" stroke="#10B981" stroke-width="12" fill="none"/>`, q: 'Герб Москвы (Георгий Победоносец, поражающий змия)' },
    { id: 'kazan', color: '#FFF', emblem: `<text x="200" y="225" font-size="110" text-anchor="middle">🐉</text><rect x="100" y="50" width="200" height="20" fill="#15803D"/>`, q: 'Герб Казани (дракон Зилант с короной)' },
    { id: 'vladivostok', color: '#1D4ED8', emblem: `<text x="200" y="225" font-size="110" text-anchor="middle">🐅</text>`, q: 'Герб Владивостока (золотой амурский тигр)' },
    { id: 'sevastopol', color: '#DC2626', emblem: `<polygon points="200,90 230,170 310,170 245,215 270,290 200,245 130,290 155,215 90,170 170,170" fill="#FFD700"/><circle cx="200" cy="190" r="40" fill="#FFF"/>`, q: 'Герб Севастополя (Медаль «Золотая Звезда» и Памятник затопленным кораблям)' },
    { id: 'yaroslavl', color: '#CBD5E1', emblem: `<text x="200" y="220" font-size="95" text-anchor="middle">🐻</text><line x1="160" y1="120" x2="240" y2="240" stroke="#B91C1C" stroke-width="8"/>`, q: 'Герб Ярославля (черный медведь с золотой секирой)' },
    { id: 'nizhny_novgorod', color: '#FFF', emblem: `<text x="200" y="225" font-size="110" text-anchor="middle">🦌</text>`, q: 'Герб Нижнего Новгорода (червленый олень)' },
    { id: 'chelyabinsk', color: '#C2410C', emblem: `<text x="200" y="225" font-size="110" text-anchor="middle">🐫</text>`, q: 'Герб Челябинска (навьюченный верблюд)' },
    { id: 'samara', color: '#0284C7', emblem: `<text x="200" y="225" font-size="110" text-anchor="middle">🐐</text><rect x="100" y="280" width="200" height="20" fill="#15803D"/>`, q: 'Герб Самары (дикая белая коза на зеленой траве)' },
    { id: 'irkutsk', color: '#FFF', emblem: `<text x="200" y="220" font-size="90" text-anchor="middle">🐆</text><ellipse cx="235" cy="210" rx="20" ry="10" fill="#78350F"/>`, q: 'Герб Иркутска (бабр, держащий в зубах соболя)' },
    { id: 'norilsk', color: '#0284C7', emblem: `<text x="200" y="220" font-size="90" text-anchor="middle">🐻‍❄️</text><circle cx="200" cy="130" r="16" fill="#FBBF24"/>`, q: 'Герб Норильска (белый медведь с ключом)' },
    { id: 'vorkuta', color: '#0F172A', emblem: `<polygon points="200,90 280,240 120,240" fill="#475569"/><text x="200" y="220" font-size="80" text-anchor="middle">🦌</text>`, q: 'Герб Воркуты (северный олень над копром шахты)' },
    { id: 'yekaterinburg', color: '#15803D', emblem: `<rect x="150" y="140" width="100" height="90" fill="#B45309"/><text x="200" y="210" font-size="50" text-anchor="middle">🔥</text>`, q: 'Герб Екатеринбурга (рудопромывальная машина и плавильная печь)' },
    { id: 'novosibirsk', color: '#0284C7', emblem: `<path d="M 100 180 Q 200 130 300 180" stroke="#FFF" stroke-width="20" fill="none"/><line x1="200" y1="90" x2="200" y2="290" stroke="#000" stroke-width="12"/>`, q: 'Герб Новосибирска (Обь, мост Транссиба и черные соболи)' },
    { id: 'magadan', color: '#DC2626', emblem: `<text x="200" y="225" font-size="105" text-anchor="middle">🦌</text><line x1="100" y1="260" x2="300" y2="260" stroke="#0284C7" stroke-width="16"/>`, q: 'Герб Магадана (золотой олень над волнами Охотского моря)' },
    { id: 'astrakhan', color: '#0284C7', emblem: `<text x="200" y="160" font-size="65" text-anchor="middle">👑</text><line x1="140" y1="230" x2="260" y2="230" stroke="#FFD700" stroke-width="14"/>`, q: 'Герб Астрахани (царская корона и восточный меч)' },
    { id: 'veliky_novgorod', color: '#FFF', emblem: `<rect x="150" y="120" width="100" height="90" fill="#B45309"/><text x="170" y="200" font-size="50">🐻</text><text x="230" y="200" font-size="50">🐻</text>`, q: 'Герб Великого Новгорода (вечевое кресло и два медведя)' },
    { id: 'kaliningrad', color: '#0284C7', emblem: `<path d="M 140 220 L 260 220 L 240 260 L 160 260 Z" fill="#FFF"/><line x1="200" y1="110" x2="200" y2="220" stroke="#FFF" stroke-width="6"/>`, q: 'Герб Калининграда (серебряный парусник Кенигсберга)' },
];

for (const sh of shields) {
    writeSvg(`heraldry_${sh.id}.svg`, svgShieldCard(sh.q, sh.color, sh.emblem));
}

// 15 Vexillology Visual Trivia Icons
const vexCards = [
    { id: 'southern_cross', svg: `<rect width="450" height="300" fill="#00247D"/><g fill="#FFF"><circle cx="340" cy="80" r="10"/><circle cx="380" cy="140" r="10"/><circle cx="340" cy="220" r="12"/><circle cx="300" cy="150" r="10"/><circle cx="355" cy="175" r="7"/></g>` },
    { id: 'pan_african', svg: `<rect width="450" height="100" fill="#DE3831"/><rect y="100" width="450" height="100" fill="#000"/><rect y="200" width="450" height="100" fill="#007A3D"/>` },
    { id: 'pan_arab', svg: `<rect width="450" height="100" fill="#000"/><rect y="100" width="450" height="100" fill="#FFF"/><rect y="200" width="450" height="100" fill="#007A3D"/><polygon points="0,0 150,150 0,300" fill="#CE1126"/>` },
    { id: 'nordic_cross', svg: `<rect width="450" height="300" fill="#006AA7"/><rect x="130" width="45" height="300" fill="#FECC00"/><rect y="125" width="450" height="45" fill="#FECC00"/>` },
    { id: 'sun_of_may', svg: `<rect width="450" height="300" fill="#74ACDF"/><rect y="100" width="450" height="100" fill="#FFF"/><circle cx="225" cy="150" r="35" fill="#F6B40E" stroke="#853407" stroke-width="2"/><text x="225" y="162" font-size="32" text-anchor="middle" fill="#853407">☀</text>` },
    { id: 'maple_leaf', svg: `<rect width="112" height="300" fill="#FF0000"/><rect x="112" width="226" height="300" fill="#FFF"/><rect x="338" width="112" height="300" fill="#FF0000"/><text x="225" y="195" font-size="110" text-anchor="middle" fill="#FF0000">🍁</text>` },
    { id: 'stars_and_stripes', svg: `<rect width="450" height="300" fill="#B22234"/><g fill="#FFF"><rect y="23" width="450" height="23"/><rect y="69" width="450" height="23"/><rect y="115" width="450" height="23"/><rect y="161" width="450" height="23"/><rect y="207" width="450" height="23"/><rect y="253" width="450" height="23"/></g><rect width="180" height="161" fill="#3C3B6E"/><text x="90" y="95" font-size="50" text-anchor="middle" fill="#FFF">★ ★ ★</text>` },
    { id: 'union_jack', svg: `<rect width="450" height="300" fill="#012169"/><line x1="0" y1="0" x2="450" y2="300" stroke="#FFF" stroke-width="60"/><line x1="450" y1="0" x2="0" y2="300" stroke="#FFF" stroke-width="60"/><line x1="0" y1="0" x2="450" y2="300" stroke="#C8102E" stroke-width="20"/><line x1="450" y1="0" x2="0" y2="300" stroke="#C8102E" stroke-width="20"/><rect x="195" width="60" height="300" fill="#FFF"/><rect y="120" width="450" height="60" fill="#FFF"/><rect x="210" width="30" height="300" fill="#C8102E"/><rect y="135" width="450" height="30" fill="#C8102E"/>` },
    { id: 'crescent_star', svg: `<rect width="450" height="300" fill="#E30A17"/><circle cx="200" cy="150" r="70" fill="#FFF"/><circle cx="220" cy="150" r="56" fill="#E30A17"/><polygon points="275,130 282,148 300,148 286,160 291,178 275,166 260,178 265,160 250,148 268,148" fill="#FFF"/>` },
    { id: 'chakra_wheel', svg: `<rect width="450" height="100" fill="#FF9933"/><rect y="100" width="450" height="100" fill="#FFF"/><rect y="200" width="450" height="100" fill="#138808"/><circle cx="225" cy="150" r="40" fill="none" stroke="#000080" stroke-width="5"/><circle cx="225" cy="150" r="8" fill="#000080"/>` },
    { id: 'albanian_eagle', svg: `<rect width="450" height="300" fill="#E41E20"/><text x="225" y="195" font-size="120" text-anchor="middle" fill="#000">🦅</text>` },
    { id: 'bhutan_dragon', svg: `<polygon points="0,0 450,0 0,300" fill="#FFCC00"/><polygon points="450,0 450,300 0,300" fill="#FF4E12"/><text x="225" y="180" font-size="95" text-anchor="middle" fill="#FFF">🐉</text>` },
    { id: 'cedar_lebanon', svg: `<rect width="450" height="75" fill="#EE161F"/><rect y="75" width="450" height="150" fill="#FFF"/><rect y="225" width="450" height="75" fill="#EE161F"/><text x="225" y="180" font-size="95" text-anchor="middle" fill="#00A850">🌲</text>` },
    { id: 'somalia_star', svg: `<rect width="450" height="300" fill="#4189DD"/><polygon points="225,80 242,130 295,130 252,162 268,212 225,180 182,212 198,162 155,130 208,130" fill="#FFF"/>` },
    { id: 'seychelles', svg: `<polygon points="0,300 0,0 150,0" fill="#003F87"/><polygon points="0,300 150,0 300,0" fill="#FCD856"/><polygon points="0,300 300,0 450,0 450,100" fill="#D62828"/><polygon points="0,300 450,100 450,200" fill="#FFF"/><polygon points="0,300 450,200 450,300" fill="#007A3D"/>` },
];

for (const vc of vexCards) {
    writeSvg(`vex_${vc.id}.svg`, svgFlagWrap(450, 300, vc.svg));
}

console.log('✅ Generated all 110 vector SVGs in public/images');
