'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const PARENT_IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'images');

const USER_AGENT = 'QuizBattleBot/2.0 (quizbattle@gmail.com; educational app)';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url, referer) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': referer,
        'Accept': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error('JSON parse error: ' + err.message));
        }
      });
    }).on('error', reject);
  });
}

function fetchBuffer(url, referer) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': referer
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location, referer).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function getWikiFileUrl(domain, title) {
  const apiUrl = `https://${domain}/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
  const json = await fetchJson(apiUrl, `https://${domain}/`);
  const page = Object.values(json.query.pages || {})[0];
  if (!page || !page.imageinfo || !page.imageinfo[0] || !page.imageinfo[0].url) {
    return null;
  }
  return page.imageinfo[0].url;
}

const ITEMS = [
  // 1. The Beatles - Abbey Road (Iconic zebra crossing, NO text on original)
  {
    domain: 'en.wikipedia.org',
    title: 'File:The Beatles Abbey Road album cover.jpg',
    out: 'cover_beatles_abbey_road.png',
    cropTop: 0,
    cropBottom: 0
  },
  // 2. Pink Floyd - The Dark Side of the Moon (Prism + Rainbow on black, NO text)
  {
    domain: 'en.wikipedia.org',
    title: 'File:DarkSideOfTheMoon1973.jpg',
    out: 'cover_pink_floyd_prism.png',
    cropTop: 0,
    cropBottom: 0
  },
  // 3. Eminem - The Eminem Show (Red curtains & stage) - crop bottom title text
  {
    domain: 'en.wikipedia.org',
    title: 'File:The Eminem Show.jpg',
    out: 'cover_eminem_curtains.png',
    cropTop: 0,
    cropBottom: 0.18
  },
  // 4. The Prodigy - The Fat of the Land (Real beach crab photograph) - crop top text
  {
    domain: 'en.wikipedia.org',
    title: 'File:TheProdigy-TheFatOfTheLand.jpg',
    out: 'cover_prodigy_crab.png',
    cropTop: 0.18,
    cropBottom: 0
  },
  // 5. Linkin Park - Hybrid Theory (Stencil soldier with dragonfly wings) - crop top text
  {
    domain: 'en.wikipedia.org',
    title: 'File:Linkin Park Hybrid Theory Album Cover.jpg',
    out: 'cover_linkin_park_soldier.png',
    cropTop: 0.18,
    cropBottom: 0
  },
  // 6. Rammstein - Untitled 2019 (Real match photo on white, NO text)
  {
    domain: 'en.wikipedia.org',
    title: 'File:Rammstein - Rammstein.png',
    out: 'cover_rammstein_match.png',
    cropTop: 0,
    cropBottom: 0
  },
  // 7. The Velvet Underground & Nico (Andy Warhol yellow banana) - crop small bottom script
  {
    domain: 'en.wikipedia.org',
    title: 'File:Velvet Underground and Nico.jpg',
    out: 'cover_velvet_banana.png',
    cropTop: 0,
    cropBottom: 0.15
  },
  // 8. Joy Division - Unknown Pleasures (Radio waves of pulsar CP 1919, NO text)
  {
    domain: 'en.wikipedia.org',
    title: 'File:UnknownPleasuresVinyl.jpg',
    out: 'cover_joy_division_waves.png',
    cropTop: 0,
    cropBottom: 0
  },
  // 9. Radiohead - Kid A (Real Stanley Donwood artwork)
  {
    domain: 'en.wikipedia.org',
    title: 'File:Radioheadkida.png',
    out: 'cover_radiohead_bear.png',
    cropTop: 0,
    cropBottom: 0
  },
  // 10. Avicii - True (Real album cover) - crop bottom title
  {
    domain: 'en.wikipedia.org',
    title: 'File:Avicii - True (Album).png',
    out: 'cover_avicii_triangles.png',
    cropTop: 0,
    cropBottom: 0.22
  },
  // 11. The Rolling Stones - Sticky Fingers (Iconic jeans/zipper photo) - crop top
  {
    domain: 'en.wikipedia.org',
    title: 'File:The Rolling Stones - Sticky Fingers.png',
    out: 'cover_stones_tongue.png',
    cropTop: 0.15,
    cropBottom: 0
  },
  // 12. Slipknot - Self-titled (Band members in masks photo) - crop top text
  {
    domain: 'en.wikipedia.org',
    title: 'File:Slipknot - Slipknot2.jpg',
    out: 'cover_slipknot_nonagram.png',
    cropTop: 0.18,
    cropBottom: 0
  },
  // 13. Кино - Звезда по имени Солнце (Yellow eclipse disk on beige) - crop top band name
  {
    domain: 'ru.wikipedia.org',
    title: 'Файл:Звезда по имени Солнце.jpg',
    out: 'cover_kino_sun.png',
    cropTop: 0.16,
    cropBottom: 0
  },
  // 14. Король и Шут - Камнем по голове (1996) - Iconic original drawing by Andrey Knyazev
  // Crop top "КОРОЛЬ И ШУТ" and bottom "КАМНЕМ ПО ГОЛОВЕ" to preserve the pure art
  {
    domain: 'ru.wikipedia.org',
    title: 'Файл:Камнем по голове.jpg',
    out: 'cover_kish_kamnem.png',
    cropTop: 0.16,
    cropBottom: 0.16
  },
  // 15. Король и Шут - Акустический альбом (1999) - Iconic original drawing by Andrey Knyazev
  // Girl by candle at night window with devil/jester outside in moonlight
  {
    domain: 'ru.wikipedia.org',
    title: 'Файл:Акустический альбом.jpg',
    out: 'cover_kish_acoustic.png',
    cropTop: 0.16,
    cropBottom: 0.16
  }
];

async function main() {
  console.log(`Starting download of ${ITEMS.length} real album covers...`);

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    console.log(`[${i + 1}/${ITEMS.length}] Resolving ${item.title} from ${item.domain}...`);

    let directUrl = null;
    try {
      directUrl = await getWikiFileUrl(item.domain, item.title);
    } catch (err) {
      console.error(`  Error resolving ${item.title}: ${err.message}`);
    }

    if (!directUrl) {
      console.error(`  FAILED: No direct URL for ${item.title}`);
      continue;
    }

    await sleep(1000);

    let imgBuf = null;
    try {
      imgBuf = await fetchBuffer(directUrl, `https://${item.domain}/`);
    } catch (err) {
      console.error(`  Error downloading ${directUrl}: ${err.message}`);
      continue;
    }

    try {
      let pipeline = sharp(imgBuf);
      const meta = await pipeline.metadata();

      const topCut = item.cropTop ? Math.floor(meta.height * item.cropTop) : 0;
      const bottomCut = item.cropBottom ? Math.floor(meta.height * item.cropBottom) : 0;
      const extractHeight = meta.height - topCut - bottomCut;

      if (topCut > 0 || bottomCut > 0) {
        pipeline = sharp(imgBuf).extract({
          left: 0,
          top: topCut,
          width: meta.width,
          height: extractHeight
        });
      }

      const pngBuf = await pipeline
        .resize(600, 600, { fit: 'cover' })
        .png({ compressionLevel: 8 })
        .toBuffer();

      const targetPath1 = path.join(IMAGES_DIR, item.out);
      fs.writeFileSync(targetPath1, pngBuf);

      if (fs.existsSync(PARENT_IMAGES_DIR)) {
        const targetPath2 = path.join(PARENT_IMAGES_DIR, item.out);
        fs.writeFileSync(targetPath2, pngBuf);
      }

      console.log(`  ✅ Saved ${item.out} (${pngBuf.length} bytes, 600x600)`);
    } catch (err) {
      console.error(`  Error processing ${item.out}: ${err.message}`);
    }

    await sleep(1200);
  }

  // Remove the old fake drawn jester icon if it exists
  const oldJester1 = path.join(IMAGES_DIR, 'cover_kish_jester.png');
  const oldJester2 = path.join(PARENT_IMAGES_DIR, 'cover_kish_jester.png');
  if (fs.existsSync(oldJester1)) fs.unlinkSync(oldJester1);
  if (fs.existsSync(oldJester2)) fs.unlinkSync(oldJester2);
  console.log('Removed obsolete cover_kish_jester.png');

  console.log('Finished updating music covers!');
}

main().catch(console.error);
