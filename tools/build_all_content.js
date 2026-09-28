'use strict';
const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..', 'server');
const IMG_DIR    = path.join(__dirname, '..', 'public', 'images');

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

function writeSvg(filename, content) {
    fs.writeFileSync(path.join(IMG_DIR, filename), content.trim(), 'utf8');
}

console.log('🚀 Starting content build...');
