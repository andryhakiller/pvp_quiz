// download-images.js — скачивает все картинки из questions.json в public/images/
const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const QUESTIONS_PATH = path.join(__dirname, 'server', 'questions.json');
const OUT_DIR        = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function download(url, dest) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) { console.log('  skip (exists):', path.basename(dest)); resolve(); return; }
        const proto = url.startsWith('https') ? https : http;
        const file  = fs.createWriteStream(dest);
        proto.get(url, res => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                fs.unlinkSync(dest);
                download(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); console.log('  ✅', path.basename(dest)); resolve(); });
        }).on('error', err => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

function urlToFilename(url) {
    // Extract last path segment and sanitize
    const raw = url.split('/').pop().split('?')[0];
    return raw.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

async function main() {
    const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
    const toDownload = [];

    for (const q of questions) {
        if (q.image && q.image.startsWith('http')) {
            const filename = urlToFilename(q.image);
            toDownload.push({ q, url: q.image, filename });
        }
    }

    console.log(`Downloading ${toDownload.length} images...`);
    for (const item of toDownload) {
        const dest = path.join(OUT_DIR, item.filename);
        console.log(`↓ ${item.url}`);
        try {
            await download(item.url, dest);
            item.q.image = `/images/${item.filename}`;
        } catch (e) {
            console.error('  ❌ Failed:', e.message);
        }
    }

    fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf8');
    console.log('\n✅ questions.json updated with local paths');
}

main().catch(console.error);
