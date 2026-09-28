/**
 * generate_music_covers.js
 * Generates iconic album cover artworks and music symbols WITHOUT band/album names.
 * Used for visual trivia in Subcategory 11.4 (album_covers_merch).
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.resolve(__dirname, '../public/images');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const covers = {
  // 1. Pink Floyd - The Dark Side of the Moon (Prism + Rainbow on black)
  'cover_pink_floyd_prism.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- White incoming beam -->
  <line x1="20" y1="230" x2="160" y2="190" stroke="#ffffff" stroke-width="4"/>
  <!-- Glass Triangle Prism -->
  <polygon points="200,80 120,260 280,260" fill="rgba(255,255,255,0.05)" stroke="#ffffff" stroke-width="3"/>
  <line x1="160" y1="190" x2="225" y2="198" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
  <!-- Dispersed Rainbow Beam -->
  <polygon points="225,198 400,230 400,240 225,198" fill="#e63946"/>
  <polygon points="225,198 400,240 400,250 225,198" fill="#f4a261"/>
  <polygon points="225,198 400,250 400,260 225,198" fill="#e9c46a"/>
  <polygon points="225,198 400,260 400,270 225,198" fill="#2a9d8f"/>
  <polygon points="225,198 400,270 400,280 225,198" fill="#457b9d"/>
  <polygon points="225,198 400,280 400,290 225,198" fill="#7209b7"/>
</svg>`,

  // 2. Nirvana - Nevermind (Baby underwater + dollar on fishhook)
  'cover_nirvana_nevermind.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#48cae4"/>
      <stop offset="40%" stop-color="#0077b6"/>
      <stop offset="100%" stop-color="#023e8a"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#ocean)"/>
  <!-- Water ripples top -->
  <path d="M 0 40 Q 100 20 200 40 T 400 40 L 400 0 L 0 0 Z" fill="#90e0ef" opacity="0.5"/>
  <!-- Baby silhouette swimming left to right -->
  <ellipse cx="180" cy="220" rx="45" ry="30" fill="#fbc4ab" transform="rotate(-15 180 220)"/>
  <circle cx="230" cy="195" r="22" fill="#fbc4ab"/>
  <!-- Baby limbs -->
  <path d="M 215 225 Q 240 255 250 270" stroke="#fbc4ab" stroke-width="12" stroke-linecap="round"/>
  <path d="M 170 240 Q 185 275 195 290" stroke="#fbc4ab" stroke-width="12" stroke-linecap="round"/>
  <path d="M 220 185 Q 250 170 270 165" stroke="#fbc4ab" stroke-width="10" stroke-linecap="round"/>
  <!-- Air bubbles -->
  <circle cx="245" cy="160" r="5" fill="#ffffff" opacity="0.7"/>
  <circle cx="255" cy="140" r="8" fill="#ffffff" opacity="0.6"/>
  <circle cx="265" cy="115" r="4" fill="#ffffff" opacity="0.8"/>
  <!-- Fishing line and Dollar bill on hook -->
  <line x1="330" y1="0" x2="330" y2="140" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2"/>
  <path d="M 330 140 C 330 155, 345 155, 345 145" fill="none" stroke="#e0e1dd" stroke-width="2.5"/>
  <!-- Dollar bill -->
  <rect x="315" y="150" width="45" height="24" fill="#52b788" stroke="#1b4332" stroke-width="1.5" rx="2" transform="rotate(10 335 160)"/>
  <circle cx="337" cy="162" r="6" fill="#2d6a4f"/>
</svg>`,

  // 3. The Beatles - Abbey Road (4 silhouettes on zebra crossing)
  'cover_beatles_abbey_road.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- Road and background trees -->
  <rect width="100%" height="100%" fill="#2b2d42"/>
  <rect y="0" width="100%" height="140" fill="#1b4332"/>
  <line x1="0" y1="140" x2="400" y2="140" stroke="#6c757d" stroke-width="4"/>
  <!-- Zebra crossing stripes in perspective -->
  <polygon points="20,180 80,180 60,380 -20,380" fill="#edf2f4"/>
  <polygon points="110,180 170,180 170,380 90,380" fill="#edf2f4"/>
  <polygon points="200,180 260,180 280,380 200,380" fill="#edf2f4"/>
  <polygon points="290,180 350,180 390,380 310,380" fill="#edf2f4"/>
  <!-- 4 walking figures in single file moving left to right -->
  <!-- Figure 1 (John - all white) -->
  <circle cx="330" cy="175" r="10" fill="#ffffff"/>
  <polygon points="325,185 335,185 340,240 320,240" fill="#ffffff"/>
  <line x1="324" y1="240" x2="315" y2="285" stroke="#ffffff" stroke-width="6"/>
  <line x1="334" y1="240" x2="345" y2="285" stroke="#ffffff" stroke-width="6"/>
  <!-- Figure 2 (Ringo - black suit) -->
  <circle cx="260" cy="178" r="9.5" fill="#000000"/>
  <polygon points="255,188 265,188 268,240 252,240" fill="#111111"/>
  <line x1="254" y1="240" x2="246" y2="285" stroke="#111111" stroke-width="6"/>
  <line x1="264" y1="240" x2="274" y2="285" stroke="#111111" stroke-width="6"/>
  <!-- Figure 3 (Paul - barefoot, suit) -->
  <circle cx="190" cy="178" r="9.5" fill="#000000"/>
  <polygon points="185,188 195,188 198,240 182,240" fill="#22223b"/>
  <line x1="184" y1="240" x2="175" y2="285" stroke="#22223b" stroke-width="6"/>
  <line x1="194" y1="240" x2="208" y2="285" stroke="#22223b" stroke-width="6"/>
  <!-- Figure 4 (George - denim blue) -->
  <circle cx="120" cy="180" r="9.5" fill="#000000"/>
  <polygon points="115,190 125,190 128,240 112,240" fill="#3a86ff"/>
  <line x1="114" y1="240" x2="105" y2="285" stroke="#3a86ff" stroke-width="6"/>
  <line x1="124" y1="240" x2="135" y2="285" stroke="#3a86ff" stroke-width="6"/>
</svg>`,

  // 4. Queen - Queen II / Bohemian Rhapsody (4 lit faces in diamond)
  'cover_queen_diamond_faces.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#050505"/>
  <!-- Top Face (Freddie with crossed arms) -->
  <circle cx="200" cy="110" r="28" fill="#e0a96d" opacity="0.85"/>
  <path d="M 180 150 Q 200 170 220 150 L 230 180 Q 200 190 170 180 Z" fill="#c99256"/>
  <!-- Left Face (Brian May with bushy hair) -->
  <circle cx="120" cy="210" r="42" fill="#332211" opacity="0.6"/>
  <circle cx="120" cy="210" r="25" fill="#e0a96d" opacity="0.85"/>
  <!-- Right Face (John Deacon) -->
  <circle cx="280" cy="210" r="25" fill="#e0a96d" opacity="0.85"/>
  <!-- Bottom Face (Roger Taylor) -->
  <circle cx="200" cy="285" r="25" fill="#e0a96d" opacity="0.85"/>
  <circle cx="200" cy="275" r="32" fill="#d4a373" opacity="0.3"/>
</svg>`,

  // 5. Metallica - Master of Puppets (White cemetery crosses + strings from sky)
  'cover_metallica_puppets.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="sky_red" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b7094c"/>
      <stop offset="50%" stop-color="#892b64"/>
      <stop offset="100%" stop-color="#1b1b1b"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky_red)"/>
  <!-- Two ominous puppet master hands in clouds -->
  <!-- Left strings -->
  <line x1="120" y1="40" x2="80" y2="280" stroke="#f1faee" stroke-width="1.5" opacity="0.75"/>
  <line x1="140" y1="40" x2="160" y2="270" stroke="#f1faee" stroke-width="1.5" opacity="0.75"/>
  <!-- Right strings -->
  <line x1="260" y1="40" x2="240" y2="270" stroke="#f1faee" stroke-width="1.5" opacity="0.75"/>
  <line x1="280" y1="40" x2="320" y2="280" stroke="#f1faee" stroke-width="1.5" opacity="0.75"/>
  <!-- Cemetery Ground -->
  <ellipse cx="200" cy="350" rx="250" ry="100" fill="#2d1305"/>
  <!-- White crosses on green grass mound -->
  <!-- Center big cross with military helmet -->
  <rect x="194" y="220" width="12" height="90" fill="#f8f9fa"/>
  <rect x="175" y="240" width="50" height="10" fill="#f8f9fa"/>
  <ellipse cx="200" cy="222" rx="14" ry="8" fill="#4a5759"/>
  <!-- Left Cross 1 -->
  <rect x="85" y="245" width="10" height="70" fill="#e9ecef"/>
  <rect x="70" y="260" width="40" height="8" fill="#e9ecef"/>
  <!-- Left Cross 2 -->
  <rect x="135" y="260" width="8" height="55" fill="#ced4da"/>
  <rect x="123" y="272" width="32" height="7" fill="#ced4da"/>
  <!-- Right Cross 1 -->
  <rect x="305" y="245" width="10" height="70" fill="#e9ecef"/>
  <rect x="290" y="260" width="40" height="8" fill="#e9ecef"/>
  <!-- Right Cross 2 -->
  <rect x="255" y="260" width="8" height="55" fill="#ced4da"/>
  <rect x="243" y="272" width="32" height="7" fill="#ced4da"/>
</svg>`,

  // 6. Green Day - American Idiot (Hand holding bleeding heart grenade)
  'cover_greenday_grenade.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#111111"/>
  <!-- Pale arm coming from bottom right -->
  <path d="M 230 400 L 210 260 L 260 250 L 300 400 Z" fill="#e9ecef"/>
  <!-- Fist fingers clutching -->
  <circle cx="215" cy="245" r="14" fill="#ced4da"/>
  <circle cx="225" cy="235" r="14" fill="#ced4da"/>
  <circle cx="240" cy="235" r="14" fill="#ced4da"/>
  <!-- Heart-shaped hand grenade -->
  <!-- Grenade pin mechanism on top -->
  <rect x="180" y="100" width="30" height="25" fill="#495057"/>
  <circle cx="165" cy="112" r="12" fill="none" stroke="#ced4da" stroke-width="3"/>
  <!-- Red heart body -->
  <path d="M 195 130 C 195 100, 140 100, 140 145 C 140 190, 195 240, 195 240 C 195 240, 250 190, 250 145 C 250 100, 195 100, 195 130 Z" fill="#d90429" stroke="#ef233c" stroke-width="2"/>
  <!-- Dripping blood streaks down the arm -->
  <path d="M 195 240 C 200 280, 210 330, 220 400" stroke="#d90429" stroke-width="12" stroke-linecap="round"/>
  <circle cx="205" cy="300" r="7" fill="#d90429"/>
  <circle cx="215" cy="360" r="9" fill="#d90429"/>
</svg>`,

  // 7. Daft Punk - Random Access Memories (Split chrome & gold robot helmets)
  'cover_daft_punk_helmets.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#080808"/>
  <!-- Left Side: Silver Helmet (Thomas Bangalter) -->
  <path d="M 200 100 C 130 100, 90 140, 90 220 C 90 280, 140 310, 200 310 Z" fill="#adb5bd" stroke="#e9ecef" stroke-width="2"/>
  <!-- Silver Visor Horizontal line -->
  <path d="M 95 190 L 200 190 L 200 225 L 95 225 Z" fill="#000000"/>
  <line x1="100" y1="205" x2="200" y2="205" stroke="#48cae4" stroke-width="3"/>
  <!-- Right Side: Gold Helmet (Guy-Manuel) -->
  <path d="M 200 100 C 270 100, 310 140, 310 220 C 310 280, 260 310, 200 310 Z" fill="#d4af37" stroke="#ffd166" stroke-width="2"/>
  <!-- Gold Visor Smooth Bubble -->
  <path d="M 200 150 C 260 150, 290 180, 290 230 C 290 270, 250 285, 200 285 Z" fill="#111111"/>
  <!-- Center dividing line -->
  <line x1="200" y1="95" x2="200" y2="315" stroke="#ffffff" stroke-width="3"/>
</svg>`,

  // 8. Gorillaz - Demon Days (4 character profile boxes in 2x2 grid)
  'cover_gorillaz_grid.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#1a1a1a"/>
  <!-- 2x2 boxes with colored backgrounds -->
  <!-- Top Left: 2D (blue hair) -->
  <rect x="20" y="20" width="170" height="170" fill="#d90429"/>
  <circle cx="105" cy="115" r="38" fill="#e0a96d"/>
  <path d="M 65 105 Q 105 50 145 105" fill="#0077b6"/>
  <circle cx="115" cy="115" r="6" fill="#000000"/>
  <!-- Top Right: Noodle (green/cap) -->
  <rect x="210" y="20" width="170" height="170" fill="#3a86ff"/>
  <circle cx="295" cy="115" r="36" fill="#e0a96d"/>
  <rect x="260" y="80" width="70" height="25" fill="#495057" rx="6"/>
  <!-- Bottom Left: Murdoc (greenish skin, crooked nose) -->
  <rect x="20" y="210" width="170" height="170" fill="#ffb703"/>
  <circle cx="105" cy="295" r="38" fill="#8cb369"/>
  <path d="M 70 280 Q 105 250 140 280" fill="#111111"/>
  <!-- Bottom Right: Russel (cap, big jaw) -->
  <rect x="210" y="210" width="170" height="170" fill="#fb8500"/>
  <circle cx="295" cy="295" r="42" fill="#582f0e"/>
  <rect x="260" y="255" width="70" height="20" fill="#dc2f02" rx="4"/>
  <circle cx="310" cy="295" r="5" fill="#ffffff"/>
</svg>`,

  // 9. Joy Division - Unknown Pleasures (Radio pulsar waves CP 1919)
  'cover_joy_division_waves.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#050505"/>
  <!-- Pulsar signal lines stacked vertically with central peaks -->
  <g stroke="#ffffff" stroke-width="2" fill="none">
    <path d="M 80 120 L 160 120 Q 200 80 240 120 L 320 120"/>
    <path d="M 80 145 L 150 145 Q 185 85 200 145 Q 215 95 250 145 L 320 145"/>
    <path d="M 80 170 L 140 170 Q 170 90 200 170 Q 230 80 260 170 L 320 170"/>
    <path d="M 80 195 L 135 195 Q 165 75 195 195 Q 225 110 265 195 L 320 195"/>
    <path d="M 80 220 L 140 220 Q 180 130 205 220 Q 235 90 260 220 L 320 220"/>
    <path d="M 80 245 L 145 245 Q 175 150 200 245 Q 225 130 255 245 L 320 245"/>
    <path d="M 80 270 L 150 270 Q 185 180 200 270 Q 215 190 250 270 L 320 270"/>
    <path d="M 80 295 L 160 295 Q 200 240 240 295 L 320 295"/>
  </g>
</svg>`,

  // 10. The Velvet Underground & Nico (Andy Warhol yellow banana on white)
  'cover_velvet_banana.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#f8f9fa"/>
  <!-- Curved yellow banana with brown spots -->
  <path d="M 80 320 C 130 330, 270 310, 320 140 C 310 170, 240 270, 100 290 Z" fill="#ffd166" stroke="#111111" stroke-width="4"/>
  <!-- Stem top -->
  <path d="M 320 140 L 330 115 L 340 125 L 325 145 Z" fill="#582f0e" stroke="#111111" stroke-width="2"/>
  <!-- Bottom tip -->
  <circle cx="85" cy="318" r="7" fill="#582f0e"/>
  <!-- Black Peel marks -->
  <path d="M 160 300 Q 220 270 270 200" stroke="#582f0e" stroke-width="3" fill="none"/>
</svg>`,

  // 11. David Bowie - Aladdin Sane (Lightning bolt across face)
  'cover_bowie_lightning.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#e9ecef"/>
  <!-- Pale face silhouette -->
  <circle cx="200" cy="200" r="95" fill="#f8edeb"/>
  <!-- Red & Blue lightning bolt zigzag across right eye -->
  <!-- Blue shadow line -->
  <polygon points="185,70 220,170 195,190 230,290 215,290 180,190 205,170 170,70" fill="#0077b6"/>
  <!-- Red main bolt -->
  <polygon points="195,70 230,170 205,190 240,290 225,290 190,190 215,170 180,70" fill="#e63946"/>
</svg>`,

  // 12. The Rolling Stones - Tongue and Lips logo
  'cover_stones_tongue.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Lips -->
  <path d="M 100 200 C 100 130, 160 120, 200 145 C 240 120, 300 130, 300 200 C 300 240, 240 270, 200 270 C 160 270, 100 240, 100 200 Z" fill="#d90429" stroke="#ffffff" stroke-width="5"/>
  <!-- Mouth interior dark -->
  <ellipse cx="200" cy="205" rx="80" ry="35" fill="#300000"/>
  <!-- White teeth row -->
  <rect x="145" y="180" width="110" height="15" rx="6" fill="#ffffff"/>
  <!-- Giant protruding red tongue -->
  <path d="M 140 210 C 140 280, 150 330, 200 330 C 250 330, 260 280, 260 210 Z" fill="#ef233c" stroke="#ffffff" stroke-width="5"/>
  <!-- Tongue center crease -->
  <line x1="200" y1="215" x2="200" y2="300" stroke="#800f2f" stroke-width="4"/>
</svg>`,

  // 13. The Prodigy - The Fat of the Land (Giant crab on sand)
  'cover_prodigy_crab.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- Blue sky and beach sand -->
  <rect width="100%" height="220" fill="#48cae4"/>
  <rect y="220" width="100%" height="180" fill="#e9d8a6"/>
  <!-- Giant crab body center -->
  <ellipse cx="200" cy="240" rx="55" ry="38" fill="#9b2226" stroke="#6b0504" stroke-width="3"/>
  <!-- Raised giant claws -->
  <!-- Left claw -->
  <path d="M 150 230 C 110 200, 80 150, 95 110 C 120 120, 125 150, 155 190" fill="#ae2012" stroke="#6b0504" stroke-width="3"/>
  <circle cx="85" cy="115" r="14" fill="#bb3e03"/>
  <!-- Right claw -->
  <path d="M 250 230 C 290 200, 320 150, 305 110 C 280 120, 275 150, 245 190" fill="#ae2012" stroke="#6b0504" stroke-width="3"/>
  <circle cx="315" cy="115" r="14" fill="#bb3e03"/>
  <!-- Stalk eyes -->
  <line x1="185" y1="210" x2="180" y2="185" stroke="#6b0504" stroke-width="4"/>
  <circle cx="180" cy="182" r="6" fill="#000000"/>
  <line x1="215" y1="210" x2="220" y2="185" stroke="#6b0504" stroke-width="4"/>
  <circle cx="220" cy="182" r="6" fill="#000000"/>
</svg>`,

  // 14. Eminem - The Eminem Show (Red theatre stage curtains)
  'cover_eminem_curtains.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- Dark stage background -->
  <rect width="100%" height="100%" fill="#111111"/>
  <!-- Wooden stage floor -->
  <polygon points="0,320 400,320 400,400 0,400" fill="#3d2617"/>
  <!-- Spotlight on floor -->
  <ellipse cx="200" cy="350" rx="90" ry="30" fill="#ffd166" opacity="0.3"/>
  <!-- Heavy red velvet curtains draped on left and right -->
  <!-- Left Curtain folds -->
  <path d="M 0 0 L 140 0 C 110 120, 120 220, 70 320 L 0 320 Z" fill="#780000"/>
  <path d="M 30 0 C 60 120, 50 220, 20 320" stroke="#c1121f" stroke-width="12" fill="none"/>
  <!-- Right Curtain folds -->
  <path d="M 400 0 L 260 0 C 290 120, 280 220, 330 320 L 400 320 Z" fill="#780000"/>
  <path d="M 370 0 C 340 120, 350 220, 380 320" stroke="#c1121f" stroke-width="12" fill="none"/>
  <!-- Top Valance ruffle -->
  <path d="M 0 0 Q 50 40 100 0 Q 150 40 200 0 Q 250 40 300 0 Q 350 40 400 0 L 400 0 L 0 0 Z" fill="#540b0e"/>
</svg>`,

  // 15. Red Hot Chili Peppers - Californication (Inverted orange sky & swimming pool)
  'cover_rhcp_californication.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- Top: Water/swimming pool in the sky! -->
  <rect width="100%" height="220" fill="#0077b6"/>
  <path d="M 0 60 Q 100 40 200 60 T 400 60" stroke="#90e0ef" stroke-width="3" fill="none" opacity="0.6"/>
  <path d="M 0 120 Q 100 100 200 120 T 400 120" stroke="#90e0ef" stroke-width="3" fill="none" opacity="0.6"/>
  <!-- Bottom: Orange fiery glowing sky/horizon in the pool basin! -->
  <rect y="220" width="100%" height="180" fill="#f77f00"/>
  <ellipse cx="200" cy="220" rx="180" ry="70" fill="#d62828" opacity="0.7"/>
  <!-- Modernist pool deck border -->
  <line x1="0" y1="220" x2="400" y2="220" stroke="#eae2b7" stroke-width="6"/>
</svg>`,

  // 16. Кино - Звезда по имени Солнце (Черный квадрат и белое затмение)
  'cover_kino_sun.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Total solar eclipse glowing corona -->
  <circle cx="200" cy="200" r="115" fill="#f8f9fa" opacity="0.2"/>
  <circle cx="200" cy="200" r="95" fill="#f8f9fa" opacity="0.4"/>
  <circle cx="200" cy="200" r="82" fill="#ffffff"/>
  <!-- Black Moon disk covering Sun -->
  <circle cx="200" cy="200" r="76" fill="#0a0a0a"/>
  <!-- Thin solar ring shimmer -->
  <circle cx="200" cy="200" r="77" fill="none" stroke="#f8f9fa" stroke-width="2"/>
</svg>`,

  // 17. Король и Шут - Фирменный череп в шутовском колпаке
  'cover_kish_jester.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#111111"/>
  <!-- Jester Cap (3 horns with bells) -->
  <path d="M 200 150 C 160 90, 80 80, 70 140 C 95 150, 130 150, 150 170" fill="#9d0208" stroke="#f8f9fa" stroke-width="2.5"/>
  <circle cx="68" cy="142" r="10" fill="#ffb703"/>
  <path d="M 200 150 C 240 90, 320 80, 330 140 C 305 150, 270 150, 250 170" fill="#03045e" stroke="#f8f9fa" stroke-width="2.5"/>
  <circle cx="332" cy="142" r="10" fill="#ffb703"/>
  <path d="M 180 150 C 190 70, 210 70, 220 150" fill="#ffb703"/>
  <circle cx="200" cy="65" r="10" fill="#ffb703"/>
  <!-- Laughing grinning skull -->
  <circle cx="200" cy="220" r="55" fill="#f8f9fa"/>
  <!-- Eye sockets -->
  <ellipse cx="180" cy="210" rx="14" ry="18" fill="#111111"/>
  <ellipse cx="220" cy="210" rx="14" ry="18" fill="#111111"/>
  <!-- Nose cavity -->
  <polygon points="200,225 194,240 206,240" fill="#111111"/>
  <!-- Wide evil toothy grin -->
  <path d="M 165 255 Q 200 285 235 255" stroke="#111111" stroke-width="5" fill="none"/>
  <line x1="175" y1="258" x2="175" y2="270" stroke="#111111" stroke-width="3"/>
  <line x1="190" y1="262" x2="190" y2="274" stroke="#111111" stroke-width="3"/>
  <line x1="205" y1="262" x2="205" y2="274" stroke="#111111" stroke-width="3"/>
  <line x1="220" y1="258" x2="220" y2="270" stroke="#111111" stroke-width="3"/>
</svg>`,

  // 18. Linkin Park - Hybrid Theory (Soldier with dragonfly wings)
  'cover_linkin_park_soldier.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- Rough textured street wall background -->
  <rect width="100%" height="100%" fill="#4a4e69"/>
  <rect x="20" y="20" width="360" height="360" fill="#22223b" opacity="0.5"/>
  <!-- Giant delicate dragonfly wings behind soldier -->
  <ellipse cx="130" cy="150" rx="80" ry="25" fill="rgba(242, 233, 228, 0.4)" stroke="#f2e9e4" stroke-width="1.5" transform="rotate(-30 130 150)"/>
  <ellipse cx="270" cy="150" rx="80" ry="25" fill="rgba(242, 233, 228, 0.4)" stroke="#f2e9e4" stroke-width="1.5" transform="rotate(30 270 150)"/>
  <ellipse cx="120" cy="190" rx="60" ry="18" fill="rgba(242, 233, 228, 0.3)" stroke="#f2e9e4" stroke-width="1.5" transform="rotate(-15 120 190)"/>
  <ellipse cx="280" cy="190" rx="60" ry="18" fill="rgba(242, 233, 228, 0.3)" stroke="#f2e9e4" stroke-width="1.5" transform="rotate(15 280 190)"/>
  <!-- Street combat soldier silhouette in stencil spray paint style -->
  <!-- Helmet -->
  <circle cx="200" cy="140" r="22" fill="#c9ada7"/>
  <!-- Body holding flag / rifle staff -->
  <polygon points="185,160 215,160 225,270 175,270" fill="#c9ada7"/>
  <line x1="185" y1="270" x2="175" y2="340" stroke="#c9ada7" stroke-width="12"/>
  <line x1="215" y1="270" x2="225" y2="340" stroke="#c9ada7" stroke-width="12"/>
  <!-- Tall triangular flag staff -->
  <line x1="230" y1="60" x2="210" y2="340" stroke="#f2e9e4" stroke-width="3.5"/>
  <polygon points="230,60 270,80 225,100" fill="#9a8c98"/>
</svg>`,

  // 19. Rammstein - Matchstick on white (Untitled album 2019)
  'cover_rammstein_match.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <!-- Solitary unlit wooden matchstick centered vertically -->
  <!-- Red phosphor head -->
  <ellipse cx="200" cy="130" rx="12" ry="18" fill="#9d0208"/>
  <circle cx="200" cy="122" r="10" fill="#ba181b"/>
  <!-- Wooden stick -->
  <rect x="193" y="140" width="14" height="170" fill="#eddcd2" stroke="#ddb892" stroke-width="1"/>
  <!-- Subtle shadow on white -->
  <rect x="207" y="145" width="6" height="165" fill="#000000" opacity="0.08"/>
</svg>`,

  // 20. AC/DC - Hells Bells / Angus Young iconic schoolboy cap and devil horns
  'cover_acdc_horns.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Glowing red devil horns headband -->
  <path d="M 120 180 Q 200 205 280 180" stroke="#333333" stroke-width="10" fill="none"/>
  <!-- Left glowing horn -->
  <path d="M 130 180 C 120 140, 100 110, 80 80 C 110 95, 140 130, 150 180 Z" fill="#d90429" stroke="#ff4d6d" stroke-width="3"/>
  <!-- Right glowing horn -->
  <path d="M 270 180 C 280 140, 300 110, 320 80 C 290 95, 260 130, 250 180 Z" fill="#d90429" stroke="#ff4d6d" stroke-width="3"/>
  <!-- Lightning bolt between horns -->
  <polygon points="195,120 220,120 205,170 230,170 185,250 195,190 175,190" fill="#ffb703" stroke="#fff" stroke-width="1.5"/>
</svg>`,

  // 21. Slipknot - Nonagram (9-pointed star)
  'cover_slipknot_nonagram.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#111111"/>
  <!-- 9-pointed star (nonagram) in distressed red/white -->
  <circle cx="200" cy="200" r="130" fill="none" stroke="#d90429" stroke-width="4" stroke-dasharray="8,6"/>
  <!-- 3 overlapping equilateral triangles forming regular nonagram -->
  <polygon points="200,75 308,262 92,262" fill="none" stroke="#e9ecef" stroke-width="3"/>
  <polygon points="281,105 242,320 77,175" fill="none" stroke="#e9ecef" stroke-width="3"/>
  <polygon points="119,105 323,175 158,320" fill="none" stroke="#e9ecef" stroke-width="3"/>
  <!-- Inner tribal logo letter S -->
  <path d="M 220 150 C 180 150, 170 180, 200 200 C 230 220, 220 250, 180 250" fill="none" stroke="#d90429" stroke-width="8" stroke-linecap="round"/>
</svg>`,

  // 22. Blink-182 - Enema of the State (Nurse with blue rubber glove)
  'cover_blink182_nurse.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- Clinical white/cyan background -->
  <rect width="100%" height="100%" fill="#e0fbfc"/>
  <!-- Red Cross inside white circle -->
  <circle cx="200" cy="90" r="45" fill="#ffffff" stroke="#e63946" stroke-width="4"/>
  <rect x="188" y="60" width="24" height="60" fill="#e63946"/>
  <rect x="170" y="78" width="60" height="24" fill="#e63946"/>
  <!-- Hand pulling on bright blue latex surgical glove -->
  <path d="M 140 350 L 170 230 C 180 210, 230 210, 240 230 L 260 350 Z" fill="#00b4d8" stroke="#0077b6" stroke-width="3"/>
  <!-- Fingers of glove stretching -->
  <rect x="160" y="180" width="16" height="50" rx="8" fill="#48cae4"/>
  <rect x="180" y="165" width="16" height="65" rx="8" fill="#48cae4"/>
  <rect x="200" y="165" width="16" height="65" rx="8" fill="#48cae4"/>
  <rect x="220" y="180" width="16" height="50" rx="8" fill="#48cae4"/>
</svg>`,

  // 23. Radiohead - Kid A / Bear logo (Grinning modified bear head)
  'cover_radiohead_bear.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0d1b2a"/>
  <!-- Sharp round bear silhouette with round ears -->
  <circle cx="130" cy="140" r="42" fill="#e0e1dd"/>
  <circle cx="270" cy="140" r="42" fill="#e0e1dd"/>
  <circle cx="200" cy="220" r="95" fill="#e0e1dd"/>
  <!-- Oversized round black cartoon eyes -->
  <circle cx="160" cy="200" r="22" fill="#0d1b2a"/>
  <circle cx="240" cy="200" r="22" fill="#0d1b2a"/>
  <!-- Menacing zigzag razor teeth row -->
  <polygon points="140,260 150,240 160,260 170,240 180,260 190,240 200,260 210,240 220,260 230,240 240,260 250,240 260,260 250,275 150,275" fill="#0d1b2a"/>
</svg>`,

  // 24. Michael Jackson - White glove & Fedora hat silhouette
  'cover_mj_hat_glove.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Black Fedora Hat with white light rim -->
  <path d="M 80 170 C 130 160, 270 160, 320 170 C 340 175, 310 190, 200 190 C 90 190, 60 175, 80 170 Z" fill="#212529" stroke="#ffffff" stroke-width="2"/>
  <path d="M 130 170 C 130 100, 160 90, 200 95 C 240 90, 270 100, 270 170 Z" fill="#161a1d"/>
  <rect x="130" y="160" width="140" height="10" fill="#ffffff"/>
  <!-- Sparkling white rhinestone glove -->
  <path d="M 160 330 L 160 260 C 160 230, 240 230, 240 260 L 240 330 Z" fill="#f8f9fa" stroke="#adb5bd" stroke-width="2"/>
  <!-- Rhinestone sparkles -->
  <circle cx="180" cy="270" r="4" fill="#48cae4"/>
  <circle cx="200" cy="285" r="4" fill="#ffd166"/>
  <circle cx="220" cy="270" r="4" fill="#48cae4"/>
  <circle cx="190" cy="305" r="4" fill="#e63946"/>
  <circle cx="210" cy="305" r="4" fill="#06d6a0"/>
</svg>`,

  // 25. Avicii - Triangle logo (Two triangles forming AV)
  'cover_avicii_triangles.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#050505"/>
  <!-- Left Triangle (A without crossbar) -->
  <polygon points="135,110 80,290 150,290" fill="#ffffff"/>
  <polygon points="145,110 200,290 165,290" fill="#ffffff"/>
  <!-- Right Triangle inverted (V) -->
  <polygon points="200,110 255,290 235,110" fill="#ffffff"/>
  <polygon points="265,110 320,110 265,290" fill="#ffffff"/>
</svg>`
};

let genCount = 0;
for (const [file, content] of Object.entries(covers)) {
  fs.writeFileSync(path.join(IMAGES_DIR, file), content.trim());
  genCount++;
}
console.log(`✅ Generated ${genCount} iconic music album/merch SVGs in public/images/`);
