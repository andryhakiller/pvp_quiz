'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const MAPPINGS = {
  // 35 Flags
  'flag_nepal.png': 'File:Flag of Nepal.svg',
  'flag_switzerland.png': 'File:Flag of Switzerland.svg',
  'flag_mozambique.png': 'File:Flag of Mozambique.svg',
  'flag_cyprus.png': 'File:Flag of Cyprus.svg',
  'flag_gdr.png': 'File:Flag of East Germany.svg',
  'flag_czechoslovakia.png': 'File:Flag of Czechoslovakia.svg',
  'flag_yugoslavia.png': 'File:Flag of Yugoslavia (1946–1992).svg',
  'flag_amsterdam.png': 'File:Flag of Amsterdam.svg',
  'flag_venice.png': 'File:Flag of Most Serene Republic of Venice.svg',
  'flag_corsica.png': 'File:Flag of Corsica.svg',
  'flag_sicily.png': 'File:Flag of Sicily.svg',
  'flag_basque.png': 'File:Flag of the Basque Country.svg',
  'flag_california.png': 'File:Flag of California.svg',
  'flag_maryland.png': 'File:Flag of Maryland.svg',
  'flag_russian_empire.png': 'File:Flag of the Russian Empire (black-yellow-white).svg',
  'flag_transnistria.png': 'File:Flag of Transnistria (state).svg',
  'flag_tibet.png': 'File:Flag of Tibet.svg',
  'flag_greenland.png': 'File:Flag of Greenland.svg',
  'flag_wales.png': 'File:Flag of Wales.svg',
  'flag_bavaria.png': 'File:Flag of Bavaria (lozengy).svg',
  'flag_calico_jack.png': 'File:Pirate Flag of Jack Rackham.svg',
  'flag_quebec.png': 'File:Flag of Quebec.svg',
  'flag_gadsden.png': 'File:Gadsden flag.svg',
  'flag_sealand.png': 'File:Flag of Sealand.svg',
  'flag_austria_hungary.png': 'File:Flag of Austria-Hungary (1867–1918).svg',
  'flag_uruguay.png': 'File:Flag of Uruguay.svg',
  'flag_belize.png': 'File:Flag of Belize.svg',
  'flag_bhutan.png': 'File:Flag of Bhutan.svg',
  'flag_grenada.png': 'File:Flag of Grenada.svg',
  'flag_barbados.png': 'File:Flag of Barbados.svg',
  'flag_eswatini.png': 'File:Flag of Eswatini.svg',
  'flag_turkmenistan.png': 'File:Flag of Turkmenistan.svg',
  'flag_kazakhstan.png': 'File:Flag of Kazakhstan.svg',
  'flag_south_africa.png': 'File:Flag of South Africa.svg',
  'flag_kiribati.png': 'File:Flag of Kiribati.svg',

  // 20 US States
  'us_state_oklahoma.png': 'File:Oklahoma in United States.svg',
  'us_state_texas.png': 'File:Texas in United States.svg',
  'us_state_florida.png': 'File:Florida in United States.svg',
  'us_state_california.png': 'File:California in United States.svg',
  'us_state_alaska.png': 'File:Alaska in United States.svg',
  'us_state_hawaii.png': 'File:Hawaii in United States.svg',
  'us_state_new_york.png': 'File:New York in United States.svg',
  'us_state_ohio.png': 'File:Ohio in United States.svg',
  'us_state_washington.png': 'File:Washington in United States.svg',
  'us_state_louisiana.png': 'File:Louisiana in United States.svg',
  'us_state_nevada.png': 'File:Nevada in United States.svg',
  'us_state_colorado.png': 'File:Colorado in United States.svg',
  'us_state_arizona.png': 'File:Arizona in United States.svg',
  'us_state_michigan.png': 'File:Michigan in United States.svg',
  'us_state_pennsylvania.png': 'File:Pennsylvania in United States.svg',
  'us_state_illinois.png': 'File:Illinois in United States.svg',
  'us_state_georgia.png': 'File:Georgia in United States.svg',
  'us_state_massachusetts.png': 'File:Massachusetts in United States.svg',
  'us_state_montana.png': 'File:Montana in United States.svg',
  'us_state_north_carolina.png': 'File:North Carolina in United States.svg',

  // 20 Russian Regions
  'ru_region_tatarstan.png': 'File:Tatarstan in Russia.svg',
  'ru_region_sakha_yakutia.png': 'File:Sakha in Russia.svg',
  'ru_region_bashkortostan.png': 'File:Bashkortostan in Russia.svg',
  'ru_region_dagestan.png': 'File:Dagestan in Russia.svg',
  'ru_region_karelia.png': 'File:Karelia in Russia.svg',
  'ru_region_buryatia.png': 'File:Map of Russia (2014–2022) - Buryatia.svg',
  'ru_region_kalmykia.png': 'File:Kalmykia in Russia.svg',
  'ru_region_tyva.png': 'File:Tuva in Russia.svg',
  'ru_region_chuvashia.png': 'File:Map of Russia (2014–2022) - Chuvashia.svg',
  'ru_region_udmurtia.png': 'File:Map of Russia (2014–2022) - Udmurtia.svg',
  'ru_region_komi.png': 'File:Komi in Russia.svg',
  'ru_region_chechnya.png': 'File:Map of Chechnya in Russia.svg',
  'ru_region_north_ossetia.png': 'File:North Ossetia-Alania in Russia.svg',
  'ru_region_altai_rep.png': 'File:Altai Republic in Russia.svg',
  'ru_region_khakassia.png': 'File:Khakassia in Russia.svg',
  'ru_region_kamchatka.png': 'File:Map of Russia (2014–2022) - Kamchatka Krai.svg',
  'ru_region_sakhalin.png': 'File:Sakhalin in Russia (undisputed).svg',
  'ru_region_crimea.png': 'File:Crimea in Russia.svg',
  'ru_region_yamal.png': 'File:Yamalo-Nenets in Russia.svg',
  'ru_region_chukotka.png': 'File:Chukotka in Russia.svg',

  // 20 Heraldry / Coats of Arms
  'heraldry_moscow.png': 'File:Coat of arms of Moscow.svg',
  'heraldry_perm.png': 'File:Coat of Arms of Perm.svg',
  'heraldry_spb.png': 'File:Coat of arms of Saint Petersburg (2003).svg',
  'heraldry_kazan.png': 'File:Coat of Arms of Kazan (Tatarstan).svg',
  'heraldry_chelyabinsk.png': 'File:Coat of Arms of Chelyabinsk.svg',
  'heraldry_nizhny_novgorod.png': 'File:Coat of Arms of Nizhny Novgorod.svg',
  'heraldry_samara.png': 'File:Coat of Arms of Samara (Samara oblast).svg',
  'heraldry_novosibirsk.png': 'File:Coat of Arms of Novosibirsk.svg',
  'heraldry_yekaterinburg.png': 'File:Coat of Arms of Yekaterinburg (Sverdlovsk oblast).svg',
  'heraldry_vladivostok.png': 'File:Coat of Arms of Vladivostok.svg',
  'heraldry_sevastopol.png': 'File:COA of Sevastopol.svg',
  'heraldry_yaroslavl.png': 'File:Coat of arms of Yaroslavl Oblast.svg',
  'heraldry_irkutsk.png': 'File:Coat of arms of Irkutsk Oblast.svg',
  'heraldry_norilsk.png': 'File:Coat of arms of Norilsk, Krasnoyarsk Krai.svg',
  'heraldry_vorkuta.png': 'File:Coat of Arms of Vorkuta.svg',
  'heraldry_magadan.png': 'File:Coat of Arms of Magadan oblast.svg',
  'heraldry_astrakhan.png': 'File:Coat of Arms of Astrakhan Oblast.svg',
  'heraldry_veliky_novgorod.png': 'File:Coat of Arms of Veliky Novgorod.svg',
  'heraldry_kaliningrad.png': 'File:Coat of Arms of Kaliningrad Oblast.svg',
  'heraldry_france.png': 'File:Arms of France (France Moderne).svg',

  // 15 Vexillology Symbols
  'vex_southern_cross.png': 'File:Flag of Australia.svg',
  'vex_pan_african.png': 'File:Flag of the UNIA.svg',
  'vex_pan_arab.png': 'File:Flag of the Arab Revolt.svg',
  'vex_nordic_cross.png': 'File:Flag of Denmark.svg',
  'vex_sun_of_may.png': 'File:Sol de Mayo-Bandera de Argentina.svg',
  'vex_maple_leaf.png': 'File:Flag of Canada (Pantone).svg',
  'vex_stars_and_stripes.png': 'File:Flag of the United States.svg',
  'vex_union_jack.png': 'File:Flag of the United Kingdom.svg',
  'vex_crescent_star.png': 'File:Flag of Turkey.svg',
  'vex_chakra_wheel.png': 'File:Ashoka Chakra.svg',
  'vex_albanian_eagle.png': 'File:Flag of Albania.svg',
  'vex_bhutan_dragon.png': 'File:Flag of Bhutan.svg',
  'vex_cedar_lebanon.png': 'File:Flag of Lebanon.svg',
  'vex_somalia_star.png': 'File:Flag of Somalia.svg',
  'vex_seychelles.png': 'File:Flag of Seychelles.svg',

  // 9 Transport
  'trans_wankel_rotor.png': 'File:Wankel Rotary Engine Mazda RX-7.jpg',
  'trans_boxer_engine.png': 'File:Boxer-engine.svg',
  'trans_turbocharger.png': 'File:Turbocharger transparent background.png',
  'trans_porsche_911.png': 'File:2013 Porsche 911 Carrera 4S (991) (9626546987).jpg',
  'trans_skyline_gtr.png': 'File:2001 Nissan Skyline GT-R V-Spec II R34 (99828).jpg',
  'trans_circuit_monaco.png': 'File:Circuit Monaco.svg',
  'trans_subaru_stars.png': 'File:Subaru logo.svg',
  'trans_belaz_mining.png': 'File:BelAZ 75710 1.png',
  'trans_ekranoplan_lun.png': 'File:Lun-class ekranoplan 1.jpg',

  // 4 Fish
  'fish_pike.png': 'File:Northern pike fish underwater esox lucius linnaeus.jpg',
  'fish_perch.png': 'File:Perch fish underwater perca fluviatilis.jpg',
  'fish_carp.png': 'File:Common Carp (Cyprinus carpio) (19488145985).jpg',
  'fish_catfish.png': 'File:Silurus glanis 02.jpg'
};

const USER_AGENT = 'QuizBattleBot/2.0 (quizbattle@gmail.com; educational app)';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error('JSON parse error: ' + err.message + ' from ' + url));
        }
      });
    }).on('error', reject);
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://commons.wikimedia.org/'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
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

async function resolveDirectUrls(titles) {
  const titleToUrl = new Map();
  const chunkSize = 40;
  for (let i = 0; i < titles.length; i += chunkSize) {
    const chunk = titles.slice(i, i + chunkSize);
    const apiUrl = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
      encodeURIComponent(chunk.join('|')) +
      '&prop=imageinfo&iiprop=url&format=json';
    const json = await fetchJson(apiUrl);
    const pages = Object.values(json.query.pages || {});
    for (const p of pages) {
      if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) {
        titleToUrl.set(p.title, p.imageinfo[0].url);
      }
    }
    await sleep(300);
  }
  return titleToUrl;
}

async function main() {
  console.log('--- Step 1: Resolving direct URLs from Wikimedia Commons API ---');
  const entries = Object.entries(MAPPINGS);
  const titles = entries.map(e => e[1]);
  const titleToUrl = await resolveDirectUrls(titles);
  console.log(`Resolved ${titleToUrl.size} URLs out of ${titles.length} requested titles.\n`);

  console.log('--- Step 2: Downloading and converting images to PNG via sharp ---');
  let downloadedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const [filename, wikiTitle] = entries[i];
    const outPath = path.join(OUT_DIR, filename);
    const directUrl = titleToUrl.get(wikiTitle);

    if (!directUrl) {
      console.error(`[${i + 1}/${entries.length}] ERROR: No direct URL for ${wikiTitle} -> ${filename}`);
      errorCount++;
      continue;
    }

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const rawBuf = await fetchBuffer(directUrl);
        const pngBuf = await sharp(rawBuf)
          .resize(800, null, { withoutEnlargement: true })
          .png({ compressionLevel: 8 })
          .toBuffer();

        fs.writeFileSync(outPath, pngBuf);
        downloadedCount++;
        success = true;
        console.log(`[${i + 1}/${entries.length}] OK: ${filename} (${pngBuf.length} bytes) from ${wikiTitle}`);
        break;
      } catch (err) {
        console.warn(`[${i + 1}/${entries.length}] Attempt ${attempt} failed for ${filename}: ${err.message}`);
        await sleep(1500 * attempt);
      }
    }

    if (!success) {
      console.error(`[${i + 1}/${entries.length}] FAILED after 3 attempts: ${filename}`);
      errorCount++;
    }

    // Rate limiting delay (1.0 second between requests to respect Wikimedia policy)
    await sleep(1000);
  }

  console.log(`\nDownload finished! Successfully processed: ${downloadedCount}/${entries.length}, Errors: ${errorCount}`);
  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error in downloader:', err);
  process.exit(1);
});
