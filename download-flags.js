/**
 * download-flags.js — downloads special SVG flags not available on flagcdn
 * Run: node download-flags.js
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

const OUT_DIR = path.join(__dirname, 'public', 'images');

// Map: new filename → Wikimedia SVG URL (direct, no thumb)
// We download the SVG directly
const FLAGS = {
    'flag_gdr.svg':          'https://upload.wikimedia.org/wikipedia/commons/a/a7/Flag_of_the_German_Democratic_Republic.svg',
    'flag_czechoslovakia.svg':'https://upload.wikimedia.org/wikipedia/commons/4/4e/Flag_of_Czechoslovakia_%281920-1938%29.svg',
    'flag_yugoslavia.svg':   'https://upload.wikimedia.org/wikipedia/commons/6/61/Flag_of_Yugoslavia_%281946-1992%29.svg',
    'flag_amsterdam.svg':    'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Amsterdam.svg',
    'flag_venice.svg':       'https://upload.wikimedia.org/wikipedia/commons/b/b5/Flag_of_the_Most_Serene_Republic_of_Venice.svg',
    'flag_corsica.svg':      'https://upload.wikimedia.org/wikipedia/commons/b/b8/Flag_of_Corsica.svg',
    'flag_sicily.svg':       'https://upload.wikimedia.org/wikipedia/commons/2/2b/Flag_of_Sicily.svg',
    'flag_basque.svg':       'https://upload.wikimedia.org/wikipedia/commons/2/2d/Flag_of_the_Basque_Country.svg',
    'flag_russia_1858.svg':  'https://upload.wikimedia.org/wikipedia/commons/5/5b/Flag_of_Russia_%281858-1883%29.svg',
    'flag_transnistria.svg': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Flag_of_Transnistria_%28state%29.svg',
    'flag_tibet.svg':        'https://upload.wikimedia.org/wikipedia/commons/2/2e/Old_Tibetan_Flag.svg',
    'flag_bavaria.svg':      'https://upload.wikimedia.org/wikipedia/commons/1/1f/Flag_of_Bavaria_%28striped%29.svg',
    'flag_calico_jack.svg':  'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Calico_Jack.svg',
    'flag_ics_quebec.svg':   'https://upload.wikimedia.org/wikipedia/commons/d/d1/ICS_Quebec.svg',
    'flag_gadsden.svg':      'https://upload.wikimedia.org/wikipedia/commons/1/1a/Gadsden_flag.svg',
    'flag_sealand.svg':      'https://upload.wikimedia.org/wikipedia/commons/f/f4/Flag_of_Sealand.svg',
    'flag_austria_hungary.svg':'https://upload.wikimedia.org/wikipedia/commons/6/68/Flag_of_Austria-Hungary_%281869-1918%29.svg',
    // California Bear Flag (PNG available)
    'flag_california.png':   'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Bear_Flag_%28no_text%29.svg/400px-Bear_Flag_%28no_text%29.svg.png',
};

// Map: question id → new local filename
const QUESTION_MAP = {
    'geography_flags_heraldry_5':  'flag_gdr.svg',
    'geography_flags_heraldry_6':  'flag_czechoslovakia.svg',
    'geography_flags_heraldry_7':  'flag_yugoslavia.svg',
    'geography_flags_heraldry_8':  'flag_amsterdam.svg',
    'geography_flags_heraldry_9':  'flag_venice.svg',
    'geography_flags_heraldry_10': 'flag_corsica.svg',
    'geography_flags_heraldry_11': 'flag_sicily.svg',
    'geography_flags_heraldry_12': 'flag_basque.svg',
    'geography_flags_heraldry_13': 'flag_california.png',
    'geography_flags_heraldry_15': 'flag_russia_1858.svg',
    'geography_flags_heraldry_16': 'flag_transnistria.svg',
    'geography_flags_heraldry_17': 'flag_tibet.svg',
    'geography_flags_heraldry_20': 'flag_bavaria.svg',
    'geography_flags_heraldry_21': 'flag_calico_jack.svg',
    'geography_flags_heraldry_22': 'flag_ics_quebec.svg',
    'geography_flags_heraldry_23': 'flag_gadsden.svg',
    'geography_flags_heraldry_24': 'flag_sealand.svg',
    'geography_flags_heraldry_25': 'flag_austria_hungary.svg',
};

function download(url, dest) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) { resolve('skip'); return; }
        const file = fs.createWriteStream(dest + '.tmp');
        const req  = https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QuizBot/1.0; +https://quiz.local)' }
        }, res => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close(); fs.unlink(dest + '.tmp', () => {});
                download(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                file.close(); fs.unlink(dest + '.tmp', () => {});
                reject(new Error('HTTP ' + res.statusCode));
                return;
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); fs.renameSync(dest + '.tmp', dest); resolve('ok'); });
        });
        req.on('error', err => { file.close(); fs.unlink(dest + '.tmp', () => {}); reject(err); });
        req.setTimeout(20000, () => req.destroy());
    });
}

async function main() {
    // Download files
    for (const [fname, url] of Object.entries(FLAGS)) {
        const dest = path.join(OUT_DIR, fname);
        process.stdout.write('  ' + fname + ' ... ');
        try {
            const r = await download(url, dest);
            console.log(r === 'skip' ? '⏭ skip' : '✅');
        } catch (e) {
            console.log('❌ ' + e.message);
        }
    }

    // Update questions.json
    const qPath = path.join(__dirname, 'server', 'questions.json');
    const questions = JSON.parse(fs.readFileSync(qPath, 'utf8'));
    let updated = 0;
    for (const q of questions) {
        if (QUESTION_MAP[q.id]) {
            q.image = '/images/' + QUESTION_MAP[q.id];
            updated++;
        }
    }
    fs.writeFileSync(qPath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`\nUpdated ${updated} question image paths in questions.json`);
}

main().catch(console.error);
