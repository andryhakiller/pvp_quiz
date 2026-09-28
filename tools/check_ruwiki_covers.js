const https = require('https');

async function getRuWikiUrl(title) {
  const url = 'https://ru.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=imageinfo&iiprop=url&format=json';
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'QuizBattleBot/2.0 (quizbattle@gmail.com)' } }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => {
        try {
          const page = Object.values(JSON.parse(d).query.pages)[0];
          resolve(page && page.imageinfo ? page.imageinfo[0].url : null);
        } catch(e) { resolve(null); }
      });
    });
  });
}

async function run() {
  const titles = [
    'Файл:Камнем по голове.jpg',
    'Файл:Акустический альбом.jpg',
    'Файл:Как в старой сказке.jpg',
    'Файл:Король и шут. Жаль, нет ружья.jpg',
    'Файл:Кино. 1988. Группа крови.jpg',
    'Файл:Звезда по имени Солнце (альбом).jpg',
    'Файл:Гражданская Оборона Русское поле экспериментов.jpg',
    'Файл:Герой Асфальта-20 ЛЕТ.jpg',
    'Файл:Колхозный панк, серия "Коллекция".jpg'
  ];
  for (const t of titles) {
    const u = await getRuWikiUrl(t);
    console.log(t, '==>', u);
  }
}
run();
