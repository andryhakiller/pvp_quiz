const fs = require('fs');
const path = require('path');
const SERVER_DIR = path.resolve(__dirname, '../server');

function patchFile(fileName, id, newQ, newOpts) {
  const p = path.join(SERVER_DIR, fileName);
  const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
  const item = arr.find(x => x.id === id);
  if (item) {
    if (newQ) item.question = newQ;
    if (newOpts) item.options = newOpts;
    fs.writeFileSync(p, JSON.stringify(arr, null, 2), 'utf8');
    console.log(`✅ Patched ${id} in ${fileName}`);
  }
}

patchFile('12.1.txt', 'sports_football_4', null, ["«Чудо в Стамбуле»", "«Битва на Энфилде»", "«Мюнхенская драма»", "«Римский камбэк»"]);
patchFile('12.6.txt', 'sports_esports_2', "Какой украинский снайпер (Александр Костылев) признан лучшим игроком в истории Counter-Strike: Global Offensive?", null);
patchFile('12.6.txt', 'sports_esports_13', "Какой легендарный украинский мидер Natus Vincere (Данил Ишутин) стал суперзвездой золотой эры Dota 2 благодаря виртуозной игре на герое Pudge?", null);
patchFile('12.6.txt', 'sports_esports_53', "Какой юный российский вундеркинд-снайпер (Илья Осипов) выступает за международный состав G2 Esports?", null);
patchFile('12.5.txt', 'sports_chess_63', "Через какую популярную арабскую игру VI–VIII веков древнеиндийская чатуранга эволюционировала и проникла в средневековую Европу?", null);
patchFile('12.7.txt', 'sports_general_73', "Какой непальский альпинист по прозвищу Нимсдай совершил невероятный подвиг «Project Possible», покорив все 14 восьмитысячников планеты всего за 6 месяцев?", null);
