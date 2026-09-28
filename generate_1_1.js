'use strict';
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

function writeSvg(filename, content) {
    fs.writeFileSync(path.join(IMG_DIR, filename), content.trim(), 'utf8');
}

// ─── HELPER: SVG FLAG BUILDERS ───────────────────────────────────────────────
function svgFlagWrap(w, h, inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#111"/>
  ${inner}
</svg>`;
}

// Generate the 35 base flags
writeSvg('flag_nepal.svg', svgFlagWrap(300, 360, `
  <polygon points="0,0 240,160 80,160 270,360 0,360" fill="#DC143C" stroke="#003893" stroke-width="8"/>
  <circle cx="70" cy="110" r="30" fill="#FFF"/>
  <circle cx="70" cy="100" r="30" fill="#DC143C"/>
  <circle cx="80" cy="270" r="40" fill="#FFF"/>
`));

writeSvg('flag_switzerland.svg', svgFlagWrap(300, 300, `
  <rect width="300" height="300" fill="#D52B1E"/>
  <rect x="125" y="50" width="50" height="200" fill="#FFF"/>
  <rect x="50" y="125" width="200" height="50" fill="#FFF"/>
`));

writeSvg('flag_mozambique.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="90" fill="#006600"/>
  <rect y="90" width="450" height="15" fill="#FFF"/>
  <rect y="105" width="450" height="90" fill="#000"/>
  <rect y="195" width="450" height="15" fill="#FFF"/>
  <rect y="210" width="450" height="90" fill="#FCE100"/>
  <polygon points="0,0 200,150 0,300" fill="#D21034"/>
  <polygon points="60,110 75,155 120,155 85,180 98,225 60,198 22,225 35,180 0,155 45,155" fill="#FCE100"/>
  <line x1="25" y1="180" x2="95" y2="130" stroke="#000" stroke-width="6"/>
  <rect x="50" y="150" width="25" height="15" fill="#FFF" stroke="#000" stroke-width="2"/>
`));

writeSvg('flag_cyprus.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#FFF"/>
  <path d="M 170 140 Q 230 110 270 120 Q 320 90 350 80 Q 300 110 280 130 Q 240 160 190 170 Q 150 160 170 140 Z" fill="#D47600"/>
  <path d="M 180 220 Q 225 250 270 220" fill="none" stroke="#4E7037" stroke-width="8"/>
`));

writeSvg('flag_gdr.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="100" fill="#000"/>
  <rect y="100" width="450" height="100" fill="#DD0000"/>
  <rect y="200" width="450" height="100" fill="#FFCE00"/>
  <circle cx="225" cy="150" r="50" fill="none" stroke="#FFCE00" stroke-width="6"/>
  <line x1="210" y1="170" x2="240" y2="130" stroke="#FFCE00" stroke-width="6"/>
  <path d="M 215 130 L 225 115 L 235 130" fill="none" stroke="#FFCE00" stroke-width="4"/>
`));

writeSvg('flag_czechoslovakia.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="150" fill="#FFF"/>
  <rect y="150" width="450" height="150" fill="#D7141A"/>
  <polygon points="0,0 225,150 0,300" fill="#11457E"/>
`));

writeSvg('flag_yugoslavia.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="100" fill="#003893"/>
  <rect y="100" width="450" height="100" fill="#FFF"/>
  <rect y="200" width="450" height="100" fill="#DE0000"/>
  <polygon points="225,105 235,135 265,135 240,155 250,185 225,168 200,185 210,155 185,135 215,135" fill="#DE0000" stroke="#FCE100" stroke-width="3"/>
`));

writeSvg('flag_amsterdam.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="100" fill="#EA212D"/>
  <rect y="100" width="450" height="100" fill="#000"/>
  <rect y="200" width="450" height="100" fill="#EA212D"/>
  <g fill="#FFF" font-family="sans-serif" font-size="80" font-weight="900" text-anchor="middle">
    <text x="145" y="178">✕</text>
    <text x="225" y="178">✕</text>
    <text x="305" y="178">✕</text>
  </g>
`));

writeSvg('flag_venice.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#8B0000"/>
  <rect x="20" y="20" width="410" height="260" fill="none" stroke="#DAA520" stroke-width="4"/>
  <circle cx="180" cy="150" r="50" fill="#DAA520"/>
  <text x="180" y="160" font-size="40" text-anchor="middle" fill="#8B0000">🦁</text>
  <line x1="330" y1="70" x2="430" y2="70" stroke="#DAA520" stroke-width="8"/>
  <line x1="330" y1="120" x2="430" y2="120" stroke="#DAA520" stroke-width="8"/>
  <line x1="330" y1="180" x2="430" y2="180" stroke="#DAA520" stroke-width="8"/>
  <line x1="330" y1="230" x2="430" y2="230" stroke="#DAA520" stroke-width="8"/>
`));

writeSvg('flag_corsica.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#FFF"/>
  <circle cx="225" cy="150" r="60" fill="#111"/>
  <path d="M 180 135 Q 225 125 270 135" stroke="#FFF" stroke-width="12" fill="none"/>
  <path d="M 270 135 L 295 155" stroke="#FFF" stroke-width="8" fill="none"/>
`));

writeSvg('flag_sicily.svg', svgFlagWrap(450, 300, `
  <polygon points="0,0 450,0 0,300" fill="#FC3"/>
  <polygon points="450,0 450,300 0,300" fill="#D00"/>
  <circle cx="225" cy="150" r="40" fill="#FD8"/>
  <path d="M 225 110 L 225 70 M 190 170 L 150 190 M 260 170 L 300 190" stroke="#FD8" stroke-width="12" stroke-linecap="round"/>
`));

writeSvg('flag_basque.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#D52B1E"/>
  <line x1="0" y1="0" x2="450" y2="300" stroke="#009B48" stroke-width="40"/>
  <line x1="450" y1="0" x2="0" y2="300" stroke="#009B48" stroke-width="40"/>
  <rect x="205" y="0" width="40" height="300" fill="#FFF"/>
  <rect x="0" y="130" width="450" height="40" fill="#FFF"/>
`));

writeSvg('flag_california.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="250" fill="#FFF"/>
  <rect y="250" width="450" height="50" fill="#BD1021"/>
  <polygon points="60,40 66,58 84,58 70,70 75,88 60,76 45,88 50,70 36,58 54,58" fill="#BD1021"/>
  <ellipse cx="230" cy="150" rx="70" ry="40" fill="#6B4423"/>
  <circle cx="170" cy="135" r="25" fill="#6B4423"/>
`));

writeSvg('flag_maryland.svg', svgFlagWrap(450, 300, `
  <rect width="225" height="150" fill="#EAAA00"/>
  <rect x="225" width="225" height="150" fill="#FFF"/>
  <rect y="150" width="225" height="150" fill="#FFF"/>
  <rect x="225" y="150" width="225" height="150" fill="#EAAA00"/>
  <line x1="0" y1="0" x2="225" y2="150" stroke="#000" stroke-width="30"/>
  <line x1="225" y1="150" x2="450" y2="300" stroke="#000" stroke-width="30"/>
  <line x1="225" y1="0" x2="450" y2="150" stroke="#E03A3E" stroke-width="30"/>
  <line x1="0" y1="150" x2="225" y2="300" stroke="#E03A3E" stroke-width="30"/>
`));

writeSvg('flag_russian_empire.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="100" fill="#000"/>
  <rect y="100" width="450" height="100" fill="#F8B800"/>
  <rect y="200" width="450" height="100" fill="#FFF"/>
`));

writeSvg('flag_transnistria.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="120" fill="#E00"/>
  <rect y="120" width="450" height="60" fill="#090"/>
  <rect y="180" width="450" height="120" fill="#E00"/>
  <text x="60" y="70" font-size="40" fill="#FE0">☭</text>
`));

writeSvg('flag_tibet.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#1B4D89"/>
  <polygon points="225,150 0,300 450,300" fill="#FFF"/>
  <circle cx="225" cy="150" r="30" fill="#F4A900"/>
  <line x1="225" y1="150" x2="100" y2="0" stroke="#D32F2F" stroke-width="12"/>
  <line x1="225" y1="150" x2="225" y2="0" stroke="#D32F2F" stroke-width="12"/>
  <line x1="225" y1="150" x2="350" y2="0" stroke="#D32F2F" stroke-width="12"/>
`));

writeSvg('flag_greenland.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="150" fill="#FFF"/>
  <rect y="150" width="450" height="150" fill="#D00C27"/>
  <path d="M 180 70 A 80 80 0 0 0 180 230 A 80 80 0 0 1 180 70" fill="#D00C27"/>
  <path d="M 180 150 A 80 80 0 0 1 260 150 A 80 80 0 0 1 180 150" fill="#FFF"/>
`));

writeSvg('flag_wales.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="150" fill="#FFF"/>
  <rect y="150" width="450" height="150" fill="#00AB39"/>
  <text x="225" y="190" font-size="120" text-anchor="middle" fill="#D32F2F">🐉</text>
`));

writeSvg('flag_bavaria.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#0098D4"/>
  <g fill="#FFF">
    <polygon points="50,0 100,50 50,100 0,50"/>
    <polygon points="150,0 200,50 150,100 100,50"/>
    <polygon points="250,0 300,50 250,100 200,50"/>
    <polygon points="350,0 400,50 350,100 300,50"/>
    <polygon points="100,50 150,100 100,150 50,100"/>
    <polygon points="200,50 250,100 200,150 150,100"/>
    <polygon points="300,50 350,100 300,150 250,100"/>
    <polygon points="400,50 450,100 400,150 350,100"/>
    <polygon points="50,100 100,150 50,200 0,150"/>
    <polygon points="150,100 200,150 150,200 100,150"/>
    <polygon points="250,100 300,150 250,200 200,150"/>
    <polygon points="350,100 400,150 350,200 300,150"/>
  </g>
`));

writeSvg('flag_calico_jack.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#000"/>
  <circle cx="225" cy="120" r="45" fill="#FFF"/>
  <circle cx="210" cy="120" r="10" fill="#000"/>
  <circle cx="240" cy="120" r="10" fill="#000"/>
  <rect x="215" y="145" width="20" height="15" fill="#FFF"/>
  <line x1="140" y1="240" x2="310" y2="180" stroke="#FFF" stroke-width="12" stroke-linecap="round"/>
  <line x1="310" y1="240" x2="140" y2="180" stroke="#FFF" stroke-width="12" stroke-linecap="round"/>
`));

writeSvg('flag_quebec.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#003882"/>
  <rect x="200" width="50" height="300" fill="#FFF"/>
  <rect y="125" width="450" height="50" fill="#FFF"/>
  <text x="100" y="85" font-size="45" text-anchor="middle" fill="#FFF">⚜</text>
  <text x="350" y="85" font-size="45" text-anchor="middle" fill="#FFF">⚜</text>
  <text x="100" y="245" font-size="45" text-anchor="middle" fill="#FFF">⚜</text>
  <text x="350" y="245" font-size="45" text-anchor="middle" fill="#FFF">⚜</text>
`));

writeSvg('flag_gadsden.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#FDD20E"/>
  <ellipse cx="225" cy="220" rx="140" ry="25" fill="#4B6634"/>
  <path d="M 180 200 Q 225 100 270 190 Q 250 140 220 150 Q 200 130 180 180" fill="none" stroke="#222" stroke-width="16" stroke-linecap="round"/>
  <circle cx="220" cy="130" r="12" fill="#222"/>
  <text x="225" y="275" font-size="20" font-weight="900" text-anchor="middle" fill="#000" letter-spacing="3">DONT TREAD ON ME</text>
`));

writeSvg('flag_sealand.svg', svgFlagWrap(450, 300, `
  <polygon points="0,0 450,0 0,300" fill="#D32F2F"/>
  <polygon points="0,300 450,0 450,300" fill="#000"/>
  <polygon points="0,300 120,300 450,80 450,0 330,0 0,220" fill="#FFF"/>
`));

writeSvg('flag_austria_hungary.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="100" fill="#D81E05"/>
  <rect y="100" width="450" height="100" fill="#FFF"/>
  <rect y="200" width="225" height="100" fill="#D81E05"/>
  <rect x="225" y="200" width="225" height="100" fill="#3B8E37"/>
  <circle cx="120" cy="150" r="30" fill="#FFC72C"/>
  <circle cx="330" cy="150" r="30" fill="#FFC72C"/>
`));

writeSvg('flag_uruguay.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#FFF"/>
  <rect y="33" width="450" height="33" fill="#0038A8"/>
  <rect y="100" width="450" height="33" fill="#0038A8"/>
  <rect y="167" width="450" height="33" fill="#0038A8"/>
  <rect y="233" width="450" height="33" fill="#0038A8"/>
  <rect width="135" height="135" fill="#FFF"/>
  <circle cx="67" cy="67" r="28" fill="#FCD116" stroke="#9B6C00" stroke-width="2"/>
  <text x="67" y="77" font-size="26" text-anchor="middle" fill="#9B6C00">☀</text>
`));

writeSvg('flag_belize.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="30" fill="#D91024"/>
  <rect y="30" width="450" height="240" fill="#003F87"/>
  <rect y="270" width="450" height="30" fill="#D91024"/>
  <circle cx="225" cy="150" r="60" fill="#FFF"/>
  <circle cx="225" cy="150" r="54" fill="none" stroke="#2B7A27" stroke-width="4"/>
  <text x="225" y="165" font-size="45" text-anchor="middle">🌳</text>
`));

writeSvg('flag_bhutan.svg', svgFlagWrap(450, 300, `
  <polygon points="0,0 450,0 0,300" fill="#FFCC00"/>
  <polygon points="450,0 450,300 0,300" fill="#FF4E12"/>
  <text x="225" y="180" font-size="90" text-anchor="middle" fill="#FFF">🐉</text>
`));

writeSvg('flag_grenada.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#C8102E"/>
  <rect x="30" y="30" width="390" height="240" fill="#007A3D"/>
  <polygon points="30,30 420,30 225,150" fill="#FFD100"/>
  <polygon points="30,270 420,270 225,150" fill="#FFD100"/>
  <circle cx="225" cy="150" r="30" fill="#C8102E"/>
  <text x="225" y="160" font-size="30" text-anchor="middle" fill="#FFD100">★</text>
`));

writeSvg('flag_barbados.svg', svgFlagWrap(450, 300, `
  <rect width="150" height="300" fill="#00267F"/>
  <rect x="150" width="150" height="300" fill="#FFC726"/>
  <rect x="300" width="150" height="300" fill="#00267F"/>
  <text x="225" y="190" font-size="110" text-anchor="middle" fill="#000">🔱</text>
`));

writeSvg('flag_eswatini.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="60" fill="#4169E1"/>
  <rect y="60" width="450" height="15" fill="#FFD700"/>
  <rect y="75" width="450" height="150" fill="#B22222"/>
  <rect y="225" width="450" height="15" fill="#FFD700"/>
  <rect y="240" width="450" height="60" fill="#4169E1"/>
  <ellipse cx="225" cy="150" rx="80" ry="40" fill="#FFF" stroke="#000" stroke-width="4"/>
  <ellipse cx="205" cy="150" rx="40" ry="30" fill="#000"/>
`));

writeSvg('flag_turkmenistan.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#228844"/>
  <rect x="40" y="0" width="60" height="300" fill="#990022"/>
  <circle cx="160" cy="70" r="30" fill="#FFF"/>
  <circle cx="170" cy="70" r="30" fill="#228844"/>
  <text x="140" y="55" font-size="16" fill="#FFF">★</text>
  <text x="160" y="45" font-size="16" fill="#FFF">★</text>
  <text x="180" y="50" font-size="16" fill="#FFF">★</text>
  <text x="190" y="70" font-size="16" fill="#FFF">★</text>
  <text x="180" y="90" font-size="16" fill="#FFF">★</text>
`));

writeSvg('flag_kazakhstan.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="300" fill="#00AFCA"/>
  <circle cx="225" cy="130" r="45" fill="#FEC50C"/>
  <path d="M 160 190 Q 225 150 290 190 Q 225 170 160 190" fill="#FEC50C"/>
  <rect x="15" y="10" width="30" height="280" fill="none" stroke="#FEC50C" stroke-width="6"/>
`));

writeSvg('flag_south_africa.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="150" fill="#DE3831"/>
  <rect y="150" width="450" height="150" fill="#002395"/>
  <polygon points="0,0 180,150 0,300" fill="#000"/>
  <polygon points="0,0 220,150 0,300" fill="none" stroke="#FFB612" stroke-width="20"/>
  <path d="M 0,0 L 220,150 L 450,150 M 220,150 L 0,300" fill="none" stroke="#007A4D" stroke-width="50"/>
  <path d="M 0,0 L 220,150 L 450,150 M 220,150 L 0,300" fill="none" stroke="#FFF" stroke-width="70" stroke-linejoin="miter"/>
`));

writeSvg('flag_kiribati.svg', svgFlagWrap(450, 300, `
  <rect width="450" height="150" fill="#D4121A"/>
  <rect y="150" width="450" height="150" fill="#0055A5"/>
  <path d="M 0 175 Q 75 160 150 175 T 300 175 T 450 175" fill="none" stroke="#FFF" stroke-width="12"/>
  <path d="M 0 225 Q 75 210 150 225 T 300 225 T 450 225" fill="none" stroke="#FFF" stroke-width="12"/>
  <circle cx="225" cy="150" r="50" fill="#FFCC00"/>
  <polygon points="225,50 200,90 250,90" fill="#FFCC00"/>
`));

console.log('✅ Generated 35 base flag SVGs');
