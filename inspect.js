const fs = require('fs');
const path = require('path');

function robustParse(raw) {
  let s = raw.replace(/,(\s*[\]\}])/g, '$1');
  s = s.replace(/\]\s*\[/g, ',');
  s = s.trim();
  if (!s.startsWith('[')) s = '[' + s;
  if (!s.endsWith(']')) s = s + ']';
  try {
    return JSON.parse(s);
  } catch (e) {
    const objs = [];
    const re = /\{\s*"id"[\s\S]*?\n\s*\}/g;
    let m;
    while ((m = re.exec(raw)) !== null) {
      try {
        let clean = m[0].replace(/,(\s*[\]\}])/g, '$1');
        objs.push(JSON.parse(clean));
      } catch (err) {}
    }
    return objs;
  }
}

const files = fs.readdirSync('./server').filter(f => f.endsWith('.txt'));
for (const f of files) {
  const raw = fs.readFileSync(path.join('./server', f), 'utf8');
  const arr = robustParse(raw);
  const subcats = {};
  arr.forEach(x => {
    const k = (x.categoryId || 'no_cat') + ' / ' + (x.subcategoryId || 'no_sub');
    subcats[k] = (subcats[k] || 0) + 1;
  });
  console.log(`${f} -> count=${arr.length} subcats=${JSON.stringify(subcats)}`);
}
