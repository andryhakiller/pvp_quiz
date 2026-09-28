const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function getBuf(url, referer) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return getBuf(res.headers.location, referer).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode + ' for ' + url));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function getWikiFileUrl(lang, title) {
  const apiUrl = 'https://' + lang + '.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=imageinfo&iiprop=url&format=json';
  const buf = await getBuf(apiUrl, 'https://' + lang + '.wikipedia.org/');
  const json = JSON.parse(buf.toString('utf8'));
  const page = Object.values(json.query.pages)[0];
  if (!page || !page.imageinfo || !page.imageinfo[0]) return null;
  return page.imageinfo[0].url;
}

const downloads = [
  { lang: 'ru', title: 'Файл:Кино. 1988. Группа крови.jpg', out: 'cover_kino_gruppa_krovi.png', cropTop: 0.12 },
  { lang: 'ru', title: 'Файл:Камнем по голове.jpg', out: 'cover_kish_kamnem.png', cropTop: 0.16 },
  { lang: 'ru', title: 'Файл:Гражданская Оборона Русское поле экспериментов.jpg', out: 'cover_grob_pole.png', cropTop: 0.14 },
  { lang: 'ru', title: 'Файл:Герой Асфальта-20 ЛЕТ.jpg', out: 'cover_aria_geroy.png', cropTop: 0.20 },
  { lang: 'ru', title: 'Файл:Колхозный панк, серия "Коллекция".jpg', out: 'cover_sektor_jawa.png', cropTop: 0.18 },
  { lang: 'en', title: 'File:Green Day - American Idiot album cover.png', out: 'cover_greenday_grenade.png', cropTop: 0.14 },
  { lang: 'en', title: 'File:NirvanaNevermindalbumcover.jpg', out: 'cover_nirvana_nevermind.png', cropTop: 0.16 },
  { lang: 'en', title: 'File:Californicationsingle.jpg', out: 'cover_rhcp_californication.png', cropTop: 0.14 },
  { lang: 'en', title: 'File:Daft Punk - Random Access Memories.png', out: 'cover_daft_punk_helmets.png', cropTop: 0 },
  { lang: 'en', title: 'File:Depeche Mode - Violator.png', out: 'cover_depeche_mode_rose.png', cropTop: 0.12 },
  { lang: 'en', title: 'File:TheClashLondonCallingalbumcover.jpg', out: 'cover_clash_london_calling.png', cropTop: 0.15 },
  { lang: 'en', title: 'File:Black Sabbath debut album.jpg', out: 'cover_black_sabbath_mill.png', cropTop: 0.15 },
  { lang: 'en', title: 'File:Blink-182 - Enema of the State cover.jpg', out: 'cover_blink182_nurse.png', cropTop: 0.15 },
  { lang: 'en', title: 'File:Acdc Highway to Hell.JPG', out: 'cover_acdc_horns.png', cropTop: 0.20 }
];

async function run() {
  console.log('Downloading batch 2 of', downloads.length, 'covers with 2500ms delay...');
  for (const item of downloads) {
    try {
      await sleep(2500);
      const u = await getWikiFileUrl(item.lang, item.title);
      if (!u) {
        console.log('⚠️ Could not resolve URL for', item.title);
        continue;
      }
      await sleep(1500);
      const imgBuf = await getBuf(u, 'https://' + item.lang + '.wikipedia.org/');
      let pipeline = sharp(imgBuf);
      if (item.cropTop > 0) {
        const meta = await pipeline.metadata();
        const topCut = Math.floor(meta.height * item.cropTop);
        pipeline = sharp(imgBuf).extract({
          left: 0,
          top: topCut,
          width: meta.width,
          height: meta.height - topCut
        });
      }
      const outPath = path.join(__dirname, '../public/images', item.out);
      await pipeline.resize(500, 500, { fit: 'cover' }).png().toFile(outPath);
      console.log('✅ Saved', item.out, fs.statSync(outPath).size, 'bytes');
    } catch (e) {
      console.log('❌ Error on', item.out, e.message);
    }
  }
  console.log('Batch 2 done!');
}
run();
