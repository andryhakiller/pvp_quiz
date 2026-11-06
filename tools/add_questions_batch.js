const fs = require('fs');
const path = require('path');

const qPath = path.join(__dirname, '..', 'questions.json');
const sQPath = path.join(__dirname, '..', 'server', 'questions.json');
let qs = JSON.parse(fs.readFileSync(qPath, 'utf8'));

const existingIds = new Set(qs.map(q => q.id));

const newQuestions = [
  // ==========================================
  // 1. ancient_world (71 - 80)
  // ==========================================
  {
    id: 'history_ancient_world_71',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 2,
    question: 'Какое грандиозное морское сражение 480 г. до н.э. решило исход греко-персидских войн благодаря узкому проливу между материком и островом?',
    options: ['Битва при Саламине', 'Битва при Марафоне', 'Битва при Фермопилах', 'Битва при Платеях'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_ancient_world_72',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 2,
    question: 'Какой древнегреческий законодатель в VII в. до н.э. составил первые писаные законы Афин, вошедшие в поговорку своей крайней суровостью?',
    options: ['Мудрец Солон', 'Архонт Драконт', 'Реформатор Клисфен', 'Тиран Писистрат'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_ancient_world_73',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 1,
    question: 'Какой карфагенский полководец в 216 г. до н.э. окружил и уничтожил превосходящую римскую армию в битве при Каннах?',
    options: ['Гамилькар Барка', 'Гасдрубал Барка', 'Ганнибал Барка', 'Магон Барка'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_ancient_world_74',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 2,
    question: 'Какой богатейший римский полководец подавил крупнейшее восстание рабов в 71 г. до н.э. и погиб в походе против Парфии?',
    options: ['Гней Помпей Великий', 'Марк Лициний Красс', 'Луций Корнелий Сулла', 'Гай Юлий Цезарь'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_ancient_world_75',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 2,
    question: 'Какой древнеегипетский фараон XVIII династии провел религиозную реформу, установив культ единого солнечного диска Атона?',
    options: ['Тутмос III', 'Эхнатон', 'Рамсес II', 'Тутанхамон'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_ancient_world_76',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 2,
    question: 'Какая столица древней Ассирии на реке Тигр славилась огромной царской библиотекой клинописных глиняных табличек Ашшурбанипала?',
    options: ['Вавилон', 'Ур', 'Ниневия', 'Персеполь'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_ancient_world_77',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 2,
    question: 'В ходе какого морского сражения 31 г. до н.э. флот Октавиана разгромил объединенные силы Марка Антония и царицы Клеопатры?',
    options: ['Битва при Акциуме', 'Битва при Милах', 'Битва при Экноме', 'Битва при Филиппах'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_ancient_world_78',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 1,
    question: 'Какой афинский стратег V в. до н.э. превратил город в центр демократии и инициировал возведение шедевров Акрополя?',
    options: ['Фемистокл', 'Перикл', 'Алкивиад', 'Милтиад'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_ancient_world_79',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 2,
    question: 'Какой ученый и механик из Сиракуз сконструировал зеркала и подъемные метательные машины для обороны города от римлян?',
    options: ['Пифагор Самосский', 'Архимед Сиракузский', 'Евклид Александрийский', 'Герон Александрийский'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_ancient_world_80',
    categoryId: 'history',
    subcategoryId: 'ancient_world',
    difficulty: 2,
    question: 'Какое название носила тяжеловооруженная пехота граждан древнегреческих полисов, составлявшая основу монолитной фаланги?',
    options: ['Гоплиты', 'Пельтасты', 'Гипасписты', 'Экдромы'],
    correctIndex: 0,
    image: null
  },

  // ==========================================
  // 2. middle_ages_rus (71 - 80)
  // ==========================================
  {
    id: 'history_middle_ages_rus_71',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 1,
    question: 'Какой древнерусский князь объединил под своей властью Новгород и Киев в 882 году, сделав Киев столицей Древнерусского государства?',
    options: ['Рюрик Новгородский', 'Вещий Олег', 'Игорь Рюрикович', 'Святослав Храбрый'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_middle_ages_rus_72',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 1,
    question: 'Какая киевская княгиня впервые на Руси установила фиксированный размер дани («уроки») и постоянные места её сбора («погосты»)?',
    options: ['Княгиня Ольга', 'Анна Ярославна', 'Ефросинья Полоцкая', 'Мария Добронега'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_middle_ages_rus_73',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 1,
    question: 'При каком киевском князе был составлен первый на Руси писаный свод законов — Краткая редакция «Русской Правды»?',
    options: ['Владимир Мономах', 'Владимир Святославич', 'Ярослав Мудрый', 'Мстислав Великий'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_middle_ages_rus_74',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 2,
    question: 'Какой княжеский съезд 1097 года провозгласил важнейший принцип удельного периода: «Каждый да держит отчину свою»?',
    options: ['Любечский съезд', 'Уветичский съезд', 'Долобский съезд', 'Киевский собор'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_middle_ages_rus_75',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 2,
    question: 'Какое историческое прозвище получил владимиро-суздальский князь Всеволод Юрьевич за многочисленное мужское потомство?',
    options: ['Красное Солнышко', 'Большое Гнездо', 'Боголюбский', 'Долгорукий'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_middle_ages_rus_76',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 2,
    question: 'Какая битва 1378 года в Рязанской земле стала первой крупной победой московских полков над ордынским войском мурзы Бегича?',
    options: ['Битва на реке Воже', 'Битва на реке Пьяне', 'Битва на реке Сити', 'Липицкая битва'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_middle_ages_rus_77',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 1,
    question: 'При каком великом московском князе вокруг Кремля в 1367 году были возведены первые неприступные белокаменные стены?',
    options: ['Иван Калита', 'Семен Гордый', 'Дмитрий Донской', 'Василий I'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_middle_ages_rus_78',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 2,
    question: 'Какой древнерусский город весной 1238 года держал оборону против войск хана Батыя целых семь недель, за что был назван «злым городом»?',
    options: ['Торжок', 'Козельск', 'Вщиж', 'Дмитров'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_middle_ages_rus_79',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 2,
    question: 'Какой великий литовский князь нанес сокрушительное поражение Тевтонскому ордену в Грюнвальдской битве 1410 года совместно с королем Ягайло?',
    options: ['Гедимин', 'Ольгерд', 'Витовт', 'Миндовг'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_middle_ages_rus_80',
    categoryId: 'history',
    subcategoryId: 'middle_ages_rus',
    difficulty: 1,
    question: 'Какой византийский патриарх и ученый создал славянскую азбуку (глаголицу и кириллицу) вместе со своим братом Мефодием в IX веке?',
    options: ['Кирилл Философ', 'Фотий Великий', 'Иоанн Дамаскин', 'Иларион Русин'],
    correctIndex: 0,
    image: null
  },

  // ==========================================
  // 3. empires_tsars_rus (71 - 80)
  // ==========================================
  {
    id: 'history_empires_tsars_rus_71',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 1,
    question: 'Какой российский монарх учредил в 1722 году «Табель о рангах», разделившую военную, гражданскую и придворную службу на 14 рангов?',
    options: ['Петр I Великий', 'Екатерина I', 'Петр II', 'Анна Иоанновна'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_72',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 2,
    question: 'В ходе какого морского сражения 1714 года русский галерный флот одержал первую в истории флота победу над шведской эскадрой?',
    options: ['Гренгамское сражение', 'Гангутское сражение', 'Чесменский бой', 'Синопское сражение'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_73',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 1,
    question: 'Какая российская императрица основала Смольный институт благородных девиц и открыла Вольное экономическое общество?',
    options: ['Елизавета Петровна', 'Анна Иоанновна', 'Екатерина II Великая', 'Екатерина I'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_74',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 1,
    question: 'Какой русский полководец не потерпел ни одного поражения в более чем 60 сражениях и совершил легендарный переход через Альпы?',
    options: ['Михаил Кутузов', 'Петр Багратион', 'Александр Суворов', 'Петр Румянцев'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_75',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 2,
    question: 'Какое тайное дворянское общество декабристов было создано в Санкт-Петербурге под руководством Никиты Муравьева и Сергея Трубецкого?',
    options: ['Северное общество', 'Южное общество', 'Общество соединенных славян', 'Орден русских рыцарей'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_76',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 2,
    question: 'Какой выдающийся реформатор при императоре Александре I разработал проект конституции «Введение к уложению государственных законов»?',
    options: ['Алексей Аракчеев', 'Михаил Сперанский', 'Николай Новосильцев', 'Виктор Кочубей'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_77',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 1,
    question: 'Какое казачье-крестьянское восстание 1773–1775 годов охватило Урал и Поволжье, предводитель которого объявил себя царем Петром III?',
    options: ['Восстание Степана Разина', 'Восстание Емельяна Пугачева', 'Восстание Кондратия Булавина', 'Восстание Ивана Болотникова'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_78',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 2,
    question: 'Какой мирный трактат 1774 года завершил русско-турецкую войну, предоставив России крепости Керчь и Кинбурн и независимость Крыма?',
    options: ['Ясский мирный договор', 'Кючук-Кайнарджийский мир', 'Бухарестский мирный договор', 'Адрианпольский мир'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_79',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 2,
    question: 'Какой российский император получил прозвище «Миротворец» за то, что в годы его царствования империя не вела ни одной большой войны?',
    options: ['Николай I', 'Александр II', 'Александр III', 'Николай II'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_empires_tsars_rus_80',
    categoryId: 'history',
    subcategoryId: 'empires_tsars_rus',
    difficulty: 2,
    question: 'Какая система оборонительных укреплений из лесных завалов, рвов и частоколов защищала южные границы Руси от набегов степняков в XVI–XVII вв.?',
    options: ['Засечная черта', 'Линия Маннергейма', 'Вал Адриана', 'Белгородская стена'],
    correctIndex: 0,
    image: null
  },

  // ==========================================
  // 4. world_wars_revolutions (71 - 80)
  // ==========================================
  {
    id: 'history_world_wars_revolutions_71',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 1,
    question: 'Убийство какого австрийского эрцгерцога в Сараеве в июне 1914 года послужило формальным поводом к началу Первой мировой войны?',
    options: ['Франц Фердинанд', 'Рудольф Габсбург', 'Карл I', 'Альбрехт Австрийский'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_72',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 2,
    question: 'Какая позиционная битва 1916 года во Франции с гигантскими потерями с обеих сторон получила в историографии название «мясорубка»?',
    options: ['Битва на Сомме', 'Битва при Вердене', 'Битва на Марне', 'Битва при Камбре'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_73',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 1,
    question: 'Какой сепаратный мирный договор подписало советское правительство с Германией и ее союзниками в марте 1918 года?',
    options: ['Версальский мир', 'Брест-Литовский мир', 'Рижский мирный договор', 'Рапалльский договор'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_74',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 2,
    question: 'Какой военачальник Белого движения возглавлял Вооруженные силы Юга России (ВСЮР) и издал директиву о походе на Москву в 1919 году?',
    options: ['Александр Колчак', 'Антон Деникин', 'Петр Врангель', 'Лавр Корнилов'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_75',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 1,
    question: 'Какое танковое встречное сражение июля 1943 года у узловой железнодорожной станции стало кульминационной точкой Курской битвы?',
    options: ['Сражение под Бродами', 'Сражение под Прохоровкой', 'Сражение у озера Балатон', 'Сражение под Дубно'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_76',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 1,
    question: 'Какая стратегическая наступательная операция Красной Армии летом 1944 года привела к разгрому немецкой группы армий «Центр» и освобождению Минска?',
    options: ['Операция «Багратион»', 'Операция «Искра»', 'Операция «Кольцо»', 'Операция «Румянцев»'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_77',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 1,
    question: 'В каком курортном городе Крыма в феврале 1945 года лидеры «Большой тройки» (Сталин, Рузвельт, Черчилль) согласовали послевоенное устройство мира?',
    options: ['Тегеран', 'Ялта', 'Потсдам', 'Касабланка'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_78',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 2,
    question: 'Какой советский разведчик в Токио передал в Москву осенью 1941 года стратегические данные о том, что Япония не откроет второй фронт на Дальнем Востоке?',
    options: ['Николай Кузнецов', 'Рихард Зорге', 'Павел Судоплатов', 'Рудольф Абель'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_79',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 1,
    question: 'Какой Маршал Советского Союза руководил войсками 1-го Белорусского фронта во время победоносного штурма Берлина весной 1945 года?',
    options: ['Иван Конев', 'Константин Рокоссовский', 'Георгий Жуков', 'Александр Василевский'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_world_wars_revolutions_80',
    categoryId: 'history',
    subcategoryId: 'world_wars_revolutions',
    difficulty: 1,
    question: 'Какое кодовое название носила грандиозная десантная операция западных союзников по высадке в Нормандии 6 июня 1944 года («День Д»)?',
    options: ['Операция «Оверлорд»', 'Операция «Торч»', 'Операция «Маркет Гарден»', 'Операция «Хаски»'],
    correctIndex: 0,
    image: null
  },

  // ==========================================
  // 5. post_1945_modern (71 - 80)
  // ==========================================
  {
    id: 'history_post_1945_modern_71',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 1,
    question: 'Какой государственный план экономической помощи США странам Западной Европы после Второй мировой войны был предложен в 1947 году?',
    options: ['Доктрина Трумэна', 'План Маршалла', 'План Моргентау', 'План Дауэса'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_post_1945_modern_72',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 1,
    question: 'Какой военно-политический союз социалистических государств был создан в 1955 году в ответ на вступление ФРГ в блок НАТО?',
    options: ['СЭВ', 'Организация Варшавского договора', 'Коминформ', 'Движение неприсоединения'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_post_1945_modern_73',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 1,
    question: 'В каком году произошел опаснейший кризис вокруг советских ракет на Острове Свободы, поставивший сверхдержавы на грань ядерной войны?',
    options: ['1956 год', '1962 год', '1968 год', '1973 год'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_post_1945_modern_74',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 2,
    question: 'В какой восточноевропейской стране события весны 1968 года с попыткой построения «социализма с человеческим лицом» закончились вводом войск ОВД?',
    options: ['Венгрия', 'Чехословакия', 'Польша', 'Болгария'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_post_1945_modern_75',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 2,
    question: 'Какой советский академик, один из создателей водородной бомбы, стал всемирно известным правозащитником и нобелевским лауреатом мира?',
    options: ['Игорь Курчатов', 'Андрей Сахаров', 'Лев Ландау', 'Петр Капица'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_post_1945_modern_76',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 1,
    question: 'Какое соглашение подписали лидеры России, Украины и Белоруссии в декабре 1991 года, зафиксировав распад СССР и создание СНГ?',
    options: ['Беловежские соглашения', 'Новоогаревский договор', 'Алма-Атинский протокол', 'Будапештский меморандум'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_post_1945_modern_77',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 1,
    question: 'Какой южноафриканский борец с расовой сегрегацией провел в заключении 27 лет и в 1994 году стал первым чернокожим президентом ЮАР?',
    options: ['Десмонд Туту', 'Нельсон Мандела', 'Стив Бико', 'Табо Мбеки'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_post_1945_modern_78',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 2,
    question: 'Какой двусторонний договор между СССР и США, подписанный в 1987 году, впервые в истории полностью ликвидировал целый класс ракет средней и меньшей дальности?',
    options: ['Договор ОСВ-1', 'Договор ОСВ-2', 'Договор о РСМД', 'Договор СНВ-1'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_post_1945_modern_79',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 2,
    question: 'Какой межгосударственный союз оформился в 1993 году после вступления в силу Маастрихтского договора, введя единое европейское гражданство?',
    options: ['Европейский союз', 'Шенгенская зона', 'Совет Европы', 'Лига Наций'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_post_1945_modern_80',
    categoryId: 'history',
    subcategoryId: 'post_1945_modern',
    difficulty: 1,
    question: 'Какой политический принцип эпохи Перестройки провозгласил открытость информации, ослабление цензуры и публичную дискуссию?',
    options: ['Хозрасчет', 'Гласность', 'Ускорение', 'Кооперация'],
    correctIndex: 1,
    image: null
  },

  // ==========================================
  // 6. science_history_discoveries (71 - 80)
  // ==========================================
  {
    id: 'history_science_history_discoveries_71',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 1,
    question: 'Какой польский астроном в трактате «О вращении небесных сфер» 1543 года научно обосновал гелиоцентрическую модель строения мира?',
    options: ['Тихо Браге', 'Николай Коперник', 'Джордано Бруно', 'Иоганн Кеплер'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_science_history_discoveries_72',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 1,
    question: 'Какой немецкий физик-экспериментатор в 1895 году открыл Х-лучи и стал самым первым лауреатом Нобелевской премии по физике?',
    options: ['Макс Планк', 'Вильгельм Рентген', 'Генрих Герц', 'Людвиг Больцман'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_science_history_discoveries_73',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 1,
    question: 'Какая исследовательница стала первой в истории женщиной, удостоенной двух Нобелевских премий — по физике (1903) и по химии (1911)?',
    options: ['Ирен Жолио-Кюри', 'Мария Склодовская-Кюри', 'Лиза Мейтнер', 'Розалинд Франклин'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_science_history_discoveries_74',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 1,
    question: 'Какой британский микробиолог в 1928 году открыл антибактериальные свойства грибка Penicillium, положив начало эпохе антибиотиков?',
    options: ['Луи Пастер', 'Роберт Кох', 'Александр Флеминг', 'Эдвард Дженнер'],
    correctIndex: 2,
    image: null
  },
  {
    id: 'history_science_history_discoveries_75',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 1,
    question: 'Какой естествоиспытатель в 1859 году опубликовал фундаментальный труд «Происхождение видов путем естественного отбора»?',
    options: ['Жан-Батист Ламарк', 'Чарльз Дарвин', 'Альфред Уоллес', 'Грегор Мендель'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_science_history_discoveries_76',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 2,
    question: 'Какой немецкий астроном открыл, что орбиты всех планет Солнечной системы являются не круговыми, а эллиптическими?',
    options: ['Галилео Галилей', 'Иоганн Кеплер', 'Клавдий Птолемей', 'Рене Декарт'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_science_history_discoveries_77',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 1,
    question: 'Какой французский ученый опроверг гипотезу самозарождения микробов и создал технологию температурного обеззараживания напитков?',
    options: ['Антуан Лавуазье', 'Луи Пастер', 'Клод Бернар', 'Рене Лаэннек'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_science_history_discoveries_78',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 1,
    question: 'Кто из ученых в 1953 году расшифровал пространственную структуру молекулы ДНК в виде спирали из двух комплементарных цепей?',
    options: ['Джеймс Уотсон и Фрэнсис Крик', 'Карл Линней и Жорж Кювье', 'Томас Морган и Артур Корнберг', 'Макс Дельбрюк и Сальвадор Лурия'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'history_science_history_discoveries_79',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 2,
    question: 'Какой физик сформулировал классическую систему уравнений электромагнитного поля и предсказал существование электромагнитных волн?',
    options: ['Майкл Фарадей', 'Джеймс Клерк Максвелл', 'Христиан Эрстед', 'Андре-Мари Ампер'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'history_science_history_discoveries_80',
    categoryId: 'history',
    subcategoryId: 'science_history_discoveries',
    difficulty: 2,
    question: 'Какой древнегреческий ученый вычислил радиус и длину окружности Земли с поразительной точностью по углу полуденной тени в двух городах?',
    options: ['Аристарх Самосский', 'Эратосфен Киренский', 'Гиппарх Никейский', 'Анаксимандр Милетский'],
    correctIndex: 1,
    image: null
  },

  // ==========================================
  // 7. history_numbers [ДУЭЛЬНАЯ ТЕМА] (51 - 60)
  // ==========================================
  {
    id: 'history_numbers_51',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 2,
    question: 'В каком году состоялось морское Трафальгарское сражение, в котором эскадра адмирала Нельсона разбила франко-испанский флот?',
    options: ['1799 год', '1805 год', '1812 год', '1815 год'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 1805,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_52',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 2,
    question: 'В каком году пресеклась правящая династия московских Рюриковичей со смертью бездетного царя Федора Ивановича?',
    options: ['1584 год', '1598 год', '1605 год', '1613 год'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 1598,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_53',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 2,
    question: 'В каком году новгородский князь Олег совершил легендарный поход на Царьград, прибив свой щит к вратам византийской столицы?',
    options: ['882 год', '907 год', '945 год', '988 год'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 907,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_54',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 1,
    question: 'В каком году пала Западная Римская империя после низложения малолетнего императора Ромула Августула вождем Одоакром?',
    options: ['410 год', '455 год', '476 год', '529 год'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 476,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_55',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 2,
    question: 'В каком году нашей эры произошел великий пожар Рима, в организации которого император Нерон обвинил христианскую общину?',
    options: ['44 год', '54 год', '64 год', '79 год'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 64,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_56',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 1,
    question: 'В каком году царь Петр I заложил Петропавловскую крепость на Заячьем острове, основав Санкт-Петербург?',
    options: ['1696 год', '1700 год', '1703 год', '1709 год'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 1703,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_57',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 2,
    question: 'В каком году на конвенте в Филадельфии была принята первая в мировой истории действующая писаная Конституция США?',
    options: ['1776 год', '1783 год', '1787 год', '1791 год'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 1787,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_58',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 1,
    question: 'В каком году началась Великая французская революция со штурма парижанами средневековой крепости-тюрьмы Бастилия?',
    options: ['1789 год', '1792 год', '1794 год', '1799 год'],
    correctIndex: 0,
    type: 'numeric',
    numericAnswer: 1789,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_59',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 1,
    question: 'В каком году произошла битва при Ватерлоо, завершившаяся окончательным крушением наполеоновской империи?',
    options: ['1805 год', '1812 год', '1814 год', '1815 год'],
    correctIndex: 3,
    type: 'numeric',
    numericAnswer: 1815,
    unit: 'год',
    image: null
  },
  {
    id: 'history_numbers_60',
    categoryId: 'history',
    subcategoryId: 'history_numbers',
    difficulty: 1,
    question: 'В каком году экспедиция Христофора Колумба достигла острова Сан-Сальвадор, открыв европейцам Новый Свет?',
    options: ['1488 год', '1492 год', '1498 год', '1502 год'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 1492,
    unit: 'год',
    image: null
  },

  // ==========================================
  // 8. engines_mechanics (71 - 80)
  // ==========================================
  {
    id: 'trans_engines_71',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 1,
    question: 'Какой вал в газораспределительном механизме автомобиля отвечает за своевременное открытие и закрытие клапанов цилиндров?',
    options: ['Коленчатый вал', 'Распределительный вал', 'Балансирный вал', 'Карданный вал'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_engines_72',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 2,
    question: 'Какой узел системы смазки двигателя внутреннего сгорания охлаждает моторное масло потоком набегающего воздуха или антифриза?',
    options: ['Масляный фильтр', 'Масляный радиатор', 'Масляный насос', 'Поддон картера'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_engines_73',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 2,
    question: 'Какой тип нагнетателя приводится механическим ремнем от коленвала, обеспечивая мгновенный наддув без эффекта турбоямы на низах?',
    options: ['Турбокомпрессор', 'Механический компрессор', 'Электрический бустер', 'Интеркулер'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_engines_74',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 1,
    question: 'Какой элемент выхлопной системы предназначен для дожига токсичных оксидов углерода и азота при высокой температуре?',
    options: ['Выпускной коллектор', 'Каталитический нейтрализатор', 'Резонатор', 'Пламегаситель'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_engines_75',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 2,
    question: 'Какая деталь механической коробки передач выравнивает угловые скорости шестерен перед вводом в зацепление для плавного переключения?',
    options: ['Синхронизатор', 'Первичный вал', 'Вилка включения', 'Маховик'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'trans_engines_76',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 2,
    question: 'Какая конструкция автомобильной подвески использует два поперечных А-образных рычага разной длины на каждое колесо?',
    options: ['Стойка Макферсон', 'Двухрычажная подвеска', 'Торсионная балка', 'Зависимый неразрезной мост'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_engines_77',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 2,
    question: 'Какой узел в классической автоматической трансмиссии передает и трансформирует крутящий момент от мотора посредством потоков жидкости?',
    options: ['Гидротрансформатор', 'Планетарный редуктор', 'Фрикционный тормоз', 'Соленоидный блок'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'trans_engines_78',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 2,
    question: 'С какой целью в системе впуска моторов с наддувом воздух пропускают через специальный теплообменник — интеркулер?',
    options: ['Для подогрева топлива зимой', 'Для охлаждения сжатого воздуха', 'Для отделения капель масла', 'Для сброса избыточного давления'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_engines_79',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 2,
    question: 'Какое опасное явление взрывного самовоспламенения бензина с образованием ударных волн может привести к разрушению поршней?',
    options: ['Кавитация топлива', 'Детонация смеси', 'Дисбаланс коленвала', 'Прогар клапана'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_engines_80',
    categoryId: 'transport',
    subcategoryId: 'engines_mechanics',
    difficulty: 1,
    question: 'Какой ключевой агрегат системы рулевого управления преобразует поворот рулевого колеса в поступательное перемещение боковых тяг?',
    options: ['Рулевая рейка', 'Рулевой демпфер', 'Поворотный кулак', 'Торсионный вал'],
    correctIndex: 0,
    image: null
  },

  // ==========================================
  // 9. iconic_cars_culture (71 - 80)
  // ==========================================
  {
    id: 'trans_culture_71',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 1,
    question: 'Какой японский полноприводный седан с оппозитным турбомотором Boxer вел многолетнее соперничество с Lancer Evolution в ралли?',
    options: ['Subaru Impreza WRX STI', 'Nissan Skyline GT-R', 'Toyota Celica GT-Four', 'Mazda RX-7 Turbo'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'trans_culture_72',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 1,
    question: 'Какой британский спортивный автомобиль с кузовом купе традиционно ассоциируется с образом секретного агента 007 Джеймса Бонда?',
    options: ['Jaguar E-Type', 'Aston Martin DB5', 'Lotus Esprit', 'Bentley Continental'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_culture_73',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 1,
    question: 'Какой немецкий спорткар с задним расположением оппозитного шестицилиндрового двигателя сохраняет свой силуэт с 1963 года?',
    options: ['Porsche 911', 'BMW M1', 'Audi R8', 'Mercedes-Benz 300 SL'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'trans_culture_74',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 2,
    question: 'Какой культовый японский спорткар с двухсекционным роторно-поршневым мотором Ванкеля выпускался компанией Mazda?',
    options: ['Mazda MX-5 Miata', 'Mazda RX-7', 'Mazda Cosmo', 'Mazda 323 GTR'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_culture_75',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 2,
    question: 'Какое компактное японское заднеприводное купе 1980-х годов с индексом кузова AE86 стало легендой дрифта благодаря аниме Initial D?',
    options: ['Toyota Sprinter Trueno', 'Nissan Silvia S13', 'Honda Civic Type R', 'Mitsubishi Starion'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'trans_culture_76',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 2,
    question: 'Какой итальянский суперкар 1970-х годов с клиновидным футуристическим дизайном Марчелло Гандини впервые ввел моду на двери-ножницы?',
    options: ['Lamborghini Countach', 'Ferrari Testarossa', 'De Tomaso Pantera', 'Lancia Stratos'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'trans_culture_77',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 2,
    question: 'Какой американский спорткар 1990-х годов оснащался исполинским 8-литровым мотором V10, в разработке которого участвовала Lamborghini?',
    options: ['Chevrolet Corvette ZR-1', 'Dodge Viper RT/10', 'Ford GT', 'Shelby Cobra 427'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_culture_78',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 1,
    question: 'Какой черный немецкий седан представительского класса в кузове E38 прославился в культовом российском криминальном боевике 2003 года?',
    options: ['Mercedes-Benz S-Class W140', 'BMW 750iL E38', 'Audi A8 D2', 'Volkswagen Phaeton'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_culture_79',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 1,
    question: 'Какой британский рамный внедорожник с алюминиевым кузовом и непрерывной историей с 1948 года стал символом экспедиций по бездорожью?',
    options: ['Land Rover Defender', 'Toyota Land Cruiser 70', 'Jeep Wrangler', 'Mercedes-Benz G-Class'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'trans_culture_80',
    categoryId: 'transport',
    subcategoryId: 'iconic_cars_culture',
    difficulty: 1,
    question: 'Какое японское спорткупе с битурбо мотором RB26DETT и полным приводом получило от прессы грозное прозвище «Годзилла»?',
    options: ['Nissan Silvia S15', 'Nissan Skyline GT-R R32', 'Toyota Supra A80', 'Mitsubishi 3000GT'],
    correctIndex: 1,
    image: null
  },

  // ==========================================
  // 10. motorsport_racing (71 - 80)
  // ==========================================
  {
    id: 'trans_racing_71',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 2,
    question: 'Какая европейская трасса Формулы-1 известна сложнейшей сверхскоростной связкой крутых поворотов «Красная вода» и «Радийон»?',
    options: ['Монца в Италии', 'Спа-Франкоршам в Бельгии', 'Сильверстоун в Англии', 'Нюрбургринг в Германии'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_72',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 1,
    question: 'Какой бразильский трехкратный чемпион Формулы-1, признанный мастер дождевых гонок, трагически разбился в Имоле в мае 1994 года?',
    options: ['Нельсон Пике', 'Айртон Сенна', 'Эмерсон Фиттипальди', 'Рубенс Баррикелло'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_73',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 1,
    question: 'Какая классическая суточная автогонка на выносливость ежегодно проводится во Франции на кольце Сарта с 1923 года?',
    options: ['24 часа Спа', '24 часа Ле-Мана', '24 часа Нюрбургринга', '12 часов Себринга'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_74',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 1,
    question: 'Какой немецкий гонщик Формулы-1 завоевал рекордные пять чемпионских титулов подряд в составе Scuderia Ferrari в 2000–2004 годах?',
    options: ['Себастьян Феттель', 'Михаэль Шумахер', 'Нико Росберг', 'Хайнц-Харальд Френтцен'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_75',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 1,
    question: 'Как называется регулируемое заднее антикрыло в Формуле-1, позволяющее снизить аэродинамическое сопротивление при обгоне?',
    options: ['Система KERS', 'Система DRS', 'Система MGU-H', 'Система ERS'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_76',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 2,
    question: 'Какая знаменитая кольцевая гонка США на 500 миль входит в неофициальную «Тройную корону мирового автоспорта»?',
    options: ['Daytona 500', 'Indianapolis 500', 'Sebring 1000', 'Pikes Peak Hillclimb'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_77',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 2,
    question: 'Какой французский раллийный пилот является девятикратным чемпионом мира WRC, выиграв все титулы подряд с Citroën?',
    options: ['Себастьен Ожье', 'Себастьен Лёб', 'Дидье Ориоль', 'Стефан Петерансель'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_78',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 1,
    question: 'Какой флаг маршалы показывают гонщику на трассе, требуя немедленно пропустить опережающую его на круг машину лидера?',
    options: ['Желтый флаг', 'Синий флаг', 'Белый флаг', 'Черно-белый флаг'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_79',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 2,
    question: 'Какая высокоскоростная итальянская трасса с поворотом Параболика принимает национальный Гран-при с 1950 года?',
    options: ['Имола', 'Монца', 'Муджелло', 'Фьорано'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_racing_80',
    categoryId: 'transport',
    subcategoryId: 'motorsport_racing',
    difficulty: 2,
    question: 'Какая легендарная категория ралли 1980-х годов с мощнейшими монстрами свыше 500 л.с. была отменена FIA из соображений безопасности?',
    options: ['Группа 4', 'Группа B', 'Группа A', 'Группа C'],
    correctIndex: 1,
    image: null
  },

  // ==========================================
  // 11. brands_history_logos (71 - 80)
  // ==========================================
  {
    id: 'trans_brands_71',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 1,
    question: 'Какое геральдическое животное золотого цвета на черном щите украшает официальную эмблему итальянской марки Lamborghini?',
    options: ['Вздыбленный конь', 'Разъяренный бык', 'Атакующий скорпион', 'Бегущий леопард'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_72',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 1,
    question: 'Что символизируют четыре сплетенных металлических кольца на эмблеме немецкого автопроизводителя Audi?',
    options: ['Четыре ведущих колеса', 'Объединение четырех компаний в концерн Auto Union', 'Четыре такта рабочего цикла двигателя', 'Четыре германских земли'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_73',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 1,
    question: 'Какая скандинавская марка первой внедрила трехточечный ремень безопасности и открыла свой патент для спасения жизней всеми брендами?',
    options: ['Saab', 'Volvo', 'Scania', 'Koenigsegg'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_74',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 1,
    question: 'Какой немецкий инженер в 1886 году получил патент на первый в мире работоспособный трехколесный экипаж с бензиновым двигателем?',
    options: ['Готтлиб Даймлер', 'Карл Бенц', 'Вильгельм Майбах', 'Фердинанд Порше'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_75',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 1,
    question: 'Какое античное холодное оружие бога морей Нептуна с фонтана в Болонье изображено на эмблеме спорткаров Maserati?',
    options: ['Гарпун', 'Трезубец', 'Копье', 'Палаш'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_76',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 1,
    question: 'Какая южнокорейская компания, чье имя переводится как «Восходящая из Азии», производит модели Rio, Ceed и Sportage?',
    options: ['Hyundai', 'Kia', 'Genesis', 'Daewoo'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_77',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 1,
    question: 'Какая немецкая автомобильная марка из Штутгарта использует на своем гербе черного коня, взятого с исторического герба родного города?',
    options: ['BMW', 'Porsche', 'Mercedes-Benz', 'Opel'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_78',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 1,
    question: 'Какой промышленник в 1913 году впервые в мире наладил поточную непрерывную конвейерную сборку доступного массового автомобиля?',
    options: ['Уолтер Крайслер', 'Генри Форд', 'Джон Додж', 'Уильям Дюрант'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_79',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 2,
    question: 'Какая японская марка изменила одну согласную в фамилии основателя ради счастливого числа из 8 черт в иероглифическом написании?',
    options: ['Nissan', 'Toyota', 'Honda', 'Mazda'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_brands_80',
    categoryId: 'transport',
    subcategoryId: 'brands_history_logos',
    difficulty: 2,
    question: 'Какая элитарная французская марка гиперкаров со штаб-квартирой в Мольсеме была основана итальянским конструктором Этторе в 1909 году?',
    options: ['Alpine', 'Bugatti', 'Delahaye', 'Venturi'],
    correctIndex: 1,
    image: null
  },

  // ==========================================
  // 12. special_transport (71 - 80)
  // ==========================================
  {
    id: 'trans_special_71',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 1,
    question: 'Какой крупнейший в мире советский шестимоторный транспортный самолет создавался для транспортировки орбитального челнока «Буран»?',
    options: ['Ан-124 «Руслан»', 'Ан-225 «Мрия»', 'Ил-76', 'Ан-22 «Антей»'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_special_72',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 2,
    question: 'Как называется класс скоростных судов, использующих эффект аэродинамического экрана над поверхностью воды для бреющего полета?',
    options: ['Глиссеры', 'Экранопланы', 'Катамараны', 'Суда на подводных крыльях'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_special_73',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 2,
    question: 'Какой тип глубоководного автономного аппарата («Триест») с поплавком из бензина опустился на дно Марианского желоба в 1960 году?',
    options: ['Батисфера', 'Батискаф', 'Мезоскаф', 'Гидростат'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_special_74',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 2,
    question: 'Как называется специальное судно технического флота с землесосом или ковшами для углубления дна судоходных рек и морских каналов?',
    options: ['Земснаряд', 'Плавдок', 'Кабельтов', 'Лихтер'],
    correctIndex: 0,
    image: null
  },
  {
    id: 'trans_special_75',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 1,
    question: 'Какой вид внеуличного пассажирского транспорта перемещается по одной несущей железобетонной или стальной балке на эстакаде?',
    options: ['Фуникулер', 'Монорельс', 'Траволатор', 'Метрополитен'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_special_76',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 2,
    question: 'Какой советский атомный ледокол проекта 10520 в августе 1977 года стал первым в мире надводным судном, дошедшим до Северного полюса?',
    options: ['Ледокол «Ленин»', 'Ледокол «Арктика»', 'Ледокол «Таймыр»', 'Ледокол «Ямал»'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_special_77',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 2,
    question: 'Какое название носит специальная гусеничная машина-снегоуплотнитель для профилирования и подготовки горнолыжных трасс?',
    options: ['Снегоболотоход', 'Ратрак', 'Скрепер', 'Вездеход-амфибия'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_special_78',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 1,
    question: 'Какой сверхтяжелый карьерный самосвал грузоподъемностью 450 тонн с гибридным приводом занесен в Книгу рекордов Гиннесса?',
    options: ['КамАЗ-Мастер', 'БелАЗ-75710', 'Caterpillar 797F', 'Liebherr T 282B'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_special_79',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 1,
    question: 'Как называется рельсовый канатный транспорт с двумя вагонами в противовесе для подъема пассажиров по крутым горным склонам?',
    options: ['Эскалатор', 'Фуникулер', 'Люлечный подъемник', 'Паттерностер'],
    correctIndex: 1,
    image: null
  },
  {
    id: 'trans_special_80',
    categoryId: 'transport',
    subcategoryId: 'special_transport',
    difficulty: 1,
    question: 'Какой тип управляемого летательного аппарата легче воздуха с жестким дюралевым каркасом строила немецкая фирма графа Цеппелина?',
    options: ['Аэростат', 'Дирижабль', 'Автожир', 'Орнитоптер'],
    correctIndex: 1,
    image: null
  },

  // ==========================================
  // 13. transport_numbers [ДУЭЛЬНАЯ ТЕМА] (51 - 60)
  // ==========================================
  {
    id: 'transport_numbers_51',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 1,
    question: 'Какова официальная ширина железнодорожной колеи на территории России и стран бывшего СССР в миллиметрах?',
    options: ['1435 мм', '1520 мм', '1600 мм', '1676 мм'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 1520,
    unit: 'мм',
    image: null
  },
  {
    id: 'transport_numbers_52',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 2,
    question: 'Какова ширина стандартной европейской железнодорожной колеи (Стефенсоновской колеи) в миллиметрах?',
    options: ['1000 мм', '1435 мм', '1520 мм', '1524 мм'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 1435,
    unit: 'мм',
    image: null
  },
  {
    id: 'transport_numbers_53',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 1,
    question: 'Сколько цилиндров насчитывает монструозный двигатель гиперкаров Bugatti Veyron и Chiron со схемой компоновки W16?',
    options: ['8 цилиндров', '12 цилиндров', '16 цилиндров', '20 цилиндров'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 16,
    unit: 'цилиндров',
    image: null
  },
  {
    id: 'transport_numbers_54',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 2,
    question: 'Сколько всего колес на стойках шасси насчитывал гигантский транспортный самолет Ан-225 «Мрия»?',
    options: ['16 колес', '24 колеса', '32 колеса', '40 колес'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 32,
    unit: 'колеса',
    image: null
  },
  {
    id: 'transport_numbers_55',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 1,
    question: 'Каково номинальное напряжение стандартной бортовой сети легковых автомобилей со свинцово-кислотным аккумулятором в вольтах?',
    options: ['6 В', '12 В', '24 В', '48 В'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 12,
    unit: 'В',
    image: null
  },
  {
    id: 'transport_numbers_56',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 1,
    question: 'Сколько клапанов приходится на один цилиндр в классическом четырехцилиндровом моторе с шестнадцатью клапанами (16V)?',
    options: ['2 клапана', '3 клапана', '4 клапана', '5 клапанов'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 4,
    unit: 'клапана',
    image: null
  },
  {
    id: 'transport_numbers_57',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 1,
    question: 'Какова максимально разрешенная скорость движения легкового автомобиля на автомагистралях в РФ по ПДД при отсутствии особых знаков?',
    options: ['90 км/ч', '110 км/ч', '120 км/ч', '130 км/ч'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 110,
    unit: 'км/ч',
    image: null
  },
  {
    id: 'transport_numbers_58',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 1,
    question: 'Сколько передач для движения вперед имеет стандартная пятиступенчатая механическая коробка переключения передач?',
    options: ['4 передачи', '5 передач', '6 передач', '7 передач'],
    correctIndex: 1,
    type: 'numeric',
    numericAnswer: 5,
    unit: 'передач',
    image: null
  },
  {
    id: 'transport_numbers_59',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 2,
    question: 'Каков рабочий объем знаменитого американского мотора V8 Chevy Small-Block 350 в кубических дюймах (около 5,7 литра)?',
    options: ['289', '302', '350', '427'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 350,
    unit: '',
    image: null
  },
  {
    id: 'transport_numbers_60',
    categoryId: 'transport',
    subcategoryId: 'transport_numbers',
    difficulty: 2,
    question: 'Какова максимальная эксплуатационная скорость пассажирского сверхзвукового лайнера Concorde в числах Маха с точностью до сотых?',
    options: ['1.45 Маха', '1.75 Маха', '2.04 Маха', '2.50 Маха'],
    correctIndex: 2,
    type: 'numeric',
    numericAnswer: 2.04,
    unit: 'Маха',
    image: null
  }
];

console.log(`Adding ${newQuestions.length} new questions...`);

// Check for ID collisions
for (const q of newQuestions) {
  if (existingIds.has(q.id)) {
    console.error(`ID collision: ${q.id} already exists!`);
    process.exit(1);
  }
}

// Append new questions
const updated = qs.concat(newQuestions);
fs.writeFileSync(qPath, JSON.stringify(updated, null, 2), 'utf8');
fs.writeFileSync(sQPath, JSON.stringify(updated, null, 2), 'utf8');

console.log(`✅ Successfully added ${newQuestions.length} questions! Total now: ${updated.length}`);

