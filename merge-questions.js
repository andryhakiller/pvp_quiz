/**
 * merge-questions.js
 * Merges all N.M.txt question files into questions.json
 * and downloads images for questions that have image descriptions.
 * Run: node merge-questions.js
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const SERVER_DIR   = path.join(__dirname, 'server');
const OUT_FILE     = path.join(SERVER_DIR, 'questions.json');
const IMG_DIR      = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

// ─── Map: image descriptions → real Wikimedia/web URLs ────────────────────────
// Key: question id
// Value: URL to download
const IMAGE_OVERRIDES = {
    // ── Geography / Flags & Heraldry (first 35) ───────────────────────────────
    'geography_flags_heraldry_1':  'https://flagcdn.com/w320/np.png',     // Nepal
    'geography_flags_heraldry_2':  'https://flagcdn.com/w160/ch.png',     // Switzerland (square)
    'geography_flags_heraldry_3':  'https://flagcdn.com/w320/mz.png',     // Mozambique
    'geography_flags_heraldry_4':  'https://flagcdn.com/w320/cy.png',     // Cyprus
    'geography_flags_heraldry_5':  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Flag_of_the_German_Democratic_Republic.svg/640px-Flag_of_the_German_Democratic_Republic.svg.png',  // GDR
    'geography_flags_heraldry_6':  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Flag_of_Czechoslovakia_%281920-1938%29.svg/640px-Flag_of_Czechoslovakia_%281920-1938%29.svg.png',   // Czechoslovakia
    'geography_flags_heraldry_7':  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Flag_of_Yugoslavia_%281946-1992%29.svg/640px-Flag_of_Yugoslavia_%281946-1992%29.svg.png',            // Yugoslavia
    'geography_flags_heraldry_8':  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Amsterdam.svg/640px-Flag_of_Amsterdam.svg.png',         // Amsterdam
    'geography_flags_heraldry_9':  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Flag_of_the_Most_Serene_Republic_of_Venice.svg/640px-Flag_of_the_Most_Serene_Republic_of_Venice.svg.png',
    'geography_flags_heraldry_10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Flag_of_Corsica.svg/640px-Flag_of_Corsica.svg.png',
    'geography_flags_heraldry_11': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Flag_of_Sicily.svg/640px-Flag_of_Sicily.svg.png',
    'geography_flags_heraldry_12': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Flag_of_the_Basque_Country.svg/640px-Flag_of_the_Basque_Country.svg.png',
    'geography_flags_heraldry_13': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Bear_Flag_%28no_text%29.svg/640px-Bear_Flag_%28no_text%29.svg.png',   // California
    'geography_flags_heraldry_14': 'https://flagcdn.com/w320/us-md.png',  // Maryland
    'geography_flags_heraldry_15': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Russia_%281858-1883%29.svg/640px-Flag_of_Russia_%281858-1883%29.svg.png',
    'geography_flags_heraldry_16': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Flag_of_Transnistria_%28state%29.svg/640px-Flag_of_Transnistria_%28state%29.svg.png',
    'geography_flags_heraldry_17': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Old_Tibetan_Flag.svg/640px-Old_Tibetan_Flag.svg.png',
    'geography_flags_heraldry_18': 'https://flagcdn.com/w320/gl.png',     // Greenland
    'geography_flags_heraldry_19': 'https://flagcdn.com/w320/gb-wls.png', // Wales
    'geography_flags_heraldry_20': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Flag_of_Bavaria_%28striped%29.svg/640px-Flag_of_Bavaria_%28striped%29.svg.png',
    'geography_flags_heraldry_21': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Calico_Jack.svg/640px-Flag_of_Calico_Jack.svg.png',
    'geography_flags_heraldry_22': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/ICS_Quebec.svg/640px-ICS_Quebec.svg.png',
    'geography_flags_heraldry_23': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Gadsden_flag.svg/640px-Gadsden_flag.svg.png',
    'geography_flags_heraldry_24': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Flag_of_Sealand.svg/640px-Flag_of_Sealand.svg.png',
    'geography_flags_heraldry_25': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Flag_of_Austria-Hungary_%281869-1918%29.svg/640px-Flag_of_Austria-Hungary_%281869-1918%29.svg.png',
    'geography_flags_heraldry_26': 'https://flagcdn.com/w320/uy.png',     // Uruguay
    'geography_flags_heraldry_27': 'https://flagcdn.com/w320/bz.png',     // Belize
    'geography_flags_heraldry_28': 'https://flagcdn.com/w320/bt.png',     // Bhutan
    'geography_flags_heraldry_29': 'https://flagcdn.com/w320/gd.png',     // Grenada
    'geography_flags_heraldry_30': 'https://flagcdn.com/w320/bb.png',     // Barbados
    'geography_flags_heraldry_31': 'https://flagcdn.com/w320/sz.png',     // Eswatini
    'geography_flags_heraldry_32': 'https://flagcdn.com/w320/tm.png',     // Turkmenistan
    'geography_flags_heraldry_33': 'https://flagcdn.com/w320/kz.png',     // Kazakhstan
    'geography_flags_heraldry_34': 'https://flagcdn.com/w320/za.png',     // South Africa
    'geography_flags_heraldry_35': 'https://flagcdn.com/w320/ki.png',     // Kiribati
};

// ─── Download helper ──────────────────────────────────────────────────────────
function download(url, dest, retries = 3) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) { resolve(false); return; }
        const proto = url.startsWith('https') ? https : http;
        const tmp   = dest + '.tmp';
        const file  = fs.createWriteStream(tmp);
        const req   = proto.get(url, { headers: { 'User-Agent': 'QuizBot/1.0' } }, res => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close(); fs.unlink(tmp, () => {});
                download(res.headers.location, dest, retries).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                file.close(); fs.unlink(tmp, () => {});
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                fs.renameSync(tmp, dest);
                resolve(true);
            });
        });
        req.on('error', err => {
            file.close(); fs.unlink(tmp, () => {});
            if (retries > 0) { setTimeout(() => download(url, dest, retries - 1).then(resolve).catch(reject), 1000); }
            else reject(err);
        });
        req.setTimeout(15000, () => { req.destroy(); });
    });
}

function urlToFilename(url) {
    return url.split('/').pop().split('?')[0].replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

// ─── Load and parse all .txt files ───────────────────────────────────────────
const TXT_FILES = fs.readdirSync(SERVER_DIR)
    .filter(f => /^\d+\.\d+\.txt$/.test(f))
    .sort((a, b) => {
        const [am, an] = a.replace('.txt','').split('.').map(Number);
        const [bm, bn] = b.replace('.txt','').split('.').map(Number);
        return am !== bm ? am - bm : an - bn;
    });

console.log(`Found ${TXT_FILES.length} question files: ${TXT_FILES.join(', ')}`);

let allQuestions = [];
for (const fname of TXT_FILES) {
    const fpath = path.join(SERVER_DIR, fname);
    let raw = fs.readFileSync(fpath, 'utf8').trim();

    // Fix 1: wrap bare objects (missing leading '[')
    if (!raw.startsWith('[')) raw = '[' + raw;
    // Fix 2: trailing comma before ] or }  →  remove it
    raw = raw.replace(/,(\s*[\]\}])/g, '$1');
    // Fix 3: merge adjacent arrays: }][  →  },{
    raw = raw.replace(/\}\s*\]\s*\[/g, '},');
    // Fix 4: ensure closing bracket
    if (!raw.endsWith(']')) raw = raw + ']';

    try {
        const parsed = JSON.parse(raw);
        console.log(`  ${fname}: ${parsed.length} questions (subcategory: ${parsed[0]?.subcategoryId})`);
        allQuestions = allQuestions.concat(parsed);
    } catch (e) {
        console.error(`  ❌ Parse error in ${fname}:`, e.message);
        // Try salvage: split on '][' manually
        const parts = raw.split(/\}\s*\]\s*\[/);
        let saved = 0;
        for (const part of parts) {
            let p = part.trim();
            if (!p.startsWith('[')) p = '[' + p;
            if (!p.endsWith(']')) p = p + ']';
            p = p.replace(/,(\s*[\]\}])/g, '$1');
            try {
                const parsed2 = JSON.parse(p);
                allQuestions = allQuestions.concat(parsed2);
                saved += parsed2.length;
            } catch {}
        }
        if (saved) console.log(`    ⚠️  Salvaged ${saved} questions from ${fname}`);
    }
}

// ─── Deduplicate by id ────────────────────────────────────────────────────────
const seen  = new Set();
const dedup = allQuestions.filter(q => {
    if (seen.has(q.id)) { console.warn(`  ⚠️  Duplicate id: ${q.id}`); return false; }
    seen.add(q.id);
    return true;
});
console.log(`\nTotal unique questions: ${dedup.length}`);

// ─── Apply image overrides and clear description strings ────────────────────
async function processImages() {
    for (const q of dedup) {
        const override = IMAGE_OVERRIDES[q.id];
        if (override) {
            const filename = urlToFilename(override);
            const dest     = path.join(IMG_DIR, filename);
            process.stdout.write(`  ↓ ${q.id} → ${filename} ... `);
            try {
                const downloaded = await download(override, dest);
                console.log(downloaded ? '✅' : 'skip');
                q.image = `/images/${filename}`;
            } catch (e) {
                console.log(`❌ ${e.message}`);
                q.image = null;
            }
        } else if (typeof q.image === 'string' && q.image.startsWith('http')) {
            // existing URL — download locally
            const filename = urlToFilename(q.image);
            const dest     = path.join(IMG_DIR, filename);
            try {
                const downloaded = await download(q.image, dest);
                console.log(`  ${downloaded ? '✅' : 'skip'} ${filename}`);
                q.image = `/images/${filename}`;
            } catch (e) {
                console.log(`  ❌ ${filename}: ${e.message}`);
                q.image = null;
            }
        } else if (typeof q.image === 'string' && q.image.length > 0 && !q.image.startsWith('/')) {
            // It's a text description — clear it
            q.image = null;
        }
    }
}

function balanceOptions(q) {
    if (!Array.isArray(q.options) || q.options.length !== 4) return;
    const correctText = q.options[q.correctIndex];
    if (correctText === undefined) return;
    const distractors = q.options.filter((_, idx) => idx !== q.correctIndex);
    let seed = 0;
    const idStr = String(q.id || q.question);
    for (let i = 0; i < idStr.length; i++) {
        seed = (seed * 31 + idStr.charCodeAt(i)) >>> 0;
    }
    for (let i = distractors.length - 1; i > 0; i--) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const j = seed % (i + 1);
        [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const targetIdx = seed % 4;
    const newOptions = [];
    let d = 0;
    for (let i = 0; i < 4; i++) {
        if (i === targetIdx) {
            newOptions.push(correctText);
        } else {
            newOptions.push(distractors[d++]);
        }
    }
    q.options = newOptions;
    q.correctIndex = targetIdx;
}

(async () => {
    console.log('\nDownloading images...');
    await processImages();

    console.log('\nBalancing options and correctIndex across all questions...');
    for (const q of dedup) {
        balanceOptions(q);
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(dedup, null, 2), 'utf8');
    console.log(`\n✅ Written ${dedup.length} questions to questions.json`);

    // Print category breakdown
    const cats = {};
    const ansDist = [0, 0, 0, 0];
    for (const q of dedup) {
        const key = `${q.categoryId}/${q.subcategoryId}`;
        cats[key] = (cats[key] || 0) + 1;
        if (q.correctIndex >= 0 && q.correctIndex < 4) ansDist[q.correctIndex]++;
    }
    console.log('\nBreakdown:');
    for (const [k, v] of Object.entries(cats)) console.log(`  ${k}: ${v}`);
    console.log(`\nAnswer distribution: [0: ${ansDist[0]}, 1: ${ansDist[1]}, 2: ${ansDist[2]}, 3: ${ansDist[3]}]`);
})();
