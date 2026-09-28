// ─────────────────────────────────────────────────────
// CLIENT.JS — Game UI & Socket Logic
// ─────────────────────────────────────────────────────

const socket = io();

// Globals shared with board.js
let myPlayerId     = null;
let mySlot         = null;
let currentPlayers = [];
let gameSettings   = {};
let categoryIndex  = {}; // { categoryId: [subcategoryId, ...] }

// Pending state
let _pendingQ          = null;
let _inDuel            = false;
let _currentCorrectIdx = null;  // correct answer index for current question (for instant reveal)

// Client-side countdown timer
let _countdownInterval = null;
let _countdownSecs     = 30;

// ─── SCREEN MANAGEMENT ───────────────────────────────

function showScreen(name) {
    ['login-screen','lobby-screen','game-screen','gameover-screen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', id !== name + '-screen');
    });
}

// ─── DOM SHORTCUTS ────────────────────────────────────

const $ = id => document.getElementById(id);

const el = {
    // login
    nickname:     $('nickname'),
    joinBtn:      $('join-btn'),
    rejoinSection:$('rejoin-section'),
    rejoinSlots:  $('rejoin-slots'),
    // lobby
    playersList:  $('players-list'),
    playerCount:  $('player-count'),
    lobbyMsg:     $('lobby-msg'),
    lobbySettings:$('lobby-settings'),
    applyBtn:     $('apply-btn'),
    startBtn:     $('start-btn'),
    settingTurns: $('setting-turns'),
    scoreCapture: $('score-capture'),
    scoreHold:    $('score-hold'),
    scorePvpWin:  $('score-pvp-win'),
    scorePenalty: $('score-penalty'),
    topicFilter:  $('topic-filter'),
    filterAllBtn: $('filter-all-btn'),
    filterNoneBtn:$('filter-none-btn'),
    lobbyLog:     $('lobby-log-body'),
    // game
    turnNum:      $('current-turn-num'),
    roundNum:     $('round-number'),
    maxRounds:    $('max-rounds'),
    turnNameSpan: $('turn-name'),
    scoresList:   $('scores-list'),
    chronicle:    $('chronicle-log'),
    turnBanner:   $('turn-banner'),
    // modal
    modalOverlay: $('modal-overlay'),
    modalContent: $('modal-content'),
    // duel
    duelOverlay:  $('duel-overlay'),
    duelAtkName:  $('duel-atk-name'),
    duelDefName:  $('duel-def-name'),
    duelRoundLbl: $('duel-round-label'),
    duelScoreA:   $('duel-score-a'),
    duelScoreD:   $('duel-score-d'),
    duelStatus:   $('duel-status'),
    // gameover
    finalScores:  $('final-scores'),
    restartBtn:   $('restart-btn'),
    abortBtnGame: $('abort-btn-game'),
};

// ─── TOASTS ───────────────────────────────────────────

function toast(msg, type = 'info', duration = 3200) {
    const div = document.createElement('div');
    div.className = `toast toast-${type}`;
    div.textContent = msg;
    $('toast-container').appendChild(div);
    setTimeout(() => div.remove(), duration);
}

// ─── LOG HELPERS ──────────────────────────────────────

function addEntry(target, msg, type) {
    if (!target) return;
    const d = document.createElement('div');
    d.className = `log-entry ${type}`;
    d.textContent = msg;
    target.appendChild(d);
    target.scrollTop = target.scrollHeight;
}

function gameLog(msg, type = 'info') {
    addEntry(el.chronicle, msg, type);
}

function lobbyLog(msg, type = 'info') {
    addEntry(el.lobbyLog, msg, type);
}

// ─── SCOREBOARD ───────────────────────────────────────

function updateScoreboard() {
    if (!el.scoresList) return;
    const sorted = [...currentPlayers].sort((a, b) => b.score - a.score);
    el.scoresList.innerHTML = sorted.map((p, i) => `
        <li style="border-color:${p.color}" class="${p.eliminated ? 's-elim' : ''}">
            <span class="s-rank">${i + 1}.</span>
            <span class="s-name" style="color:${p.color}">${p.nickname}${p.eliminated ? ' 💀' : ''}</span>
            <span class="s-pts" style="color:${p.color}">${p.score}</span>
        </li>
    `).join('');
}

function updateLobbyList() {
    if (!el.playersList) return;
    el.playersList.innerHTML = currentPlayers.map(p => `
        <li style="border-color:${p.color}">
            <span class="player-nick" style="color:${p.color}">${p.nickname}</span>
            <span class="player-score">${p.score}</span>
            ${p.isAdmin ? '<span class="player-crown">👑</span>' : ''}
        </li>
    `).join('');
    if (el.playerCount) el.playerCount.textContent = `${currentPlayers.length} / 6`;
}

function renderRejoinSlots(players) {
    if (!el.rejoinSection || !el.rejoinSlots) return;
    if (!players || players.length === 0) {
        el.rejoinSection.classList.add('hidden');
        return;
    }
    el.rejoinSection.classList.remove('hidden');

    const slotButtons = players.map(p => `
        <button class="rejoin-slot-btn" data-slot="${p.slot}" style="border-color: ${p.color}66;">
            <span class="rejoin-slot-color" style="background: ${p.color}; box-shadow: 0 0 10px ${p.color}88;"></span>
            <span class="rejoin-slot-name" style="color: ${p.color};">${p.nickname}</span>
            <span class="rejoin-slot-status">${p.connected ? 'В сети' : 'Офлайн'} · ${p.score} pts</span>
        </button>
    `).join('');

    const abortButton = `
        <button class="rejoin-slot-btn abort-slot-btn" id="rejoin-abort-btn">
            <span class="rejoin-slot-color abort-slot-icon">🛑</span>
            <span class="rejoin-slot-name abort-slot-title">Аборт гейм</span>
            <span class="rejoin-slot-status abort-slot-sub">Сбросить игру</span>
        </button>
    `;

    el.rejoinSlots.innerHTML = slotButtons + abortButton;

    el.rejoinSlots.querySelectorAll('.rejoin-slot-btn[data-slot]').forEach(btn => {
        btn.addEventListener('click', () => {
            const slot = parseInt(btn.dataset.slot);
            socket.emit('rejoin_game', { slot });
        });
    });

    const abortBtn = $('rejoin-abort-btn');
    if (abortBtn) {
        abortBtn.addEventListener('click', () => {
            if (confirm('Прервать текущую битву и сбросить игру в лобби?')) {
                socket.emit('abort_game');
            }
        });
    }
}

// ─── TOPIC FILTER (LOBBY) ─────────────────────────────

const CATEGORY_LABELS = {
    geography:         '🌍 География',
    mathematics:       '📐 Математика',
    transport:         '🚗 Транспорт',
    construction_earth:'🏗️ Строительство и геология',
    cinema_arts:       '🎬 Кино и искусство',
    history:           '📜 История',
    physics_chemistry: '⚗️ Физика и химия',
    fishing:           '🎣 Рыбалка',
    literature:        '📚 Литература',
    logic_chgk:        '🧩 Логика и ЧГК',
    music:             '🎵 Музыка',
};

const SUBCATEGORY_LABELS = {
    // 🌍 География
    flags_heraldry:              '🌍 География: вексиллология и гербы',
    languages_ethnography:       '🌍 География: языки и этнография',
    physical_geography:          '🌍 География: физическая география',
    world_landmarks:             '🌍 География: достопримечательности',
    // 📐 Математика
    ege_math:                    '📐 Математика: профильный ЕГЭ',
    calculus_diffeq:             '📐 Математика: матанализ и диф. уравнения',
    linalg_geometry:             '📐 Математика: линейная алгебра',
    mental_math:                 '📐 Математика: устный счёт',
    history_of_math:             '📐 Математика: история математики',
    // 🚗 Транспорт
    engines_mechanics:           '🚗 Транспорт: двигатели и механика',
    iconic_cars_culture:         '🚗 Транспорт: культовые тачки',
    motorsport_racing:           '🚗 Транспорт: автоспорт и Формула-1',
    brands_history_logos:        '🚗 Транспорт: бренды и логотипы',
    special_transport:           '🚗 Транспорт: особенный транспорт',
    // 🏗️ Строительство и геология
    residential_construction:    '🏗️ Стройка: загородное строительство',
    building_physics_mechanics:  '🏗️ Стройка: строительная физика',
    soil_mechanics_geotechnics:  '🏗️ Стройка: грунтоведение',
    historical_geology_tectonics:'🏗️ Стройка: историческая геология',
    underground_tunnels:         '🏗️ Стройка: подземные сооружения',
    // 🎬 Кино и искусство
    soviet_russian_cinema:       '🎬 Кино: советское и русское кино',
    franchises_cult_movies:      '🎬 Кино: культовые франшизы',
    modern_cinema:               '🎬 Кино: современное кино',
    childhood_cartoons:          '🎬 Кино: мультфильмы детства',
    fine_arts_architecture:      '🎬 Кино: изобразительное искусство',
    // 📜 История
    ancient_world:               '📜 История: древний мир',
    middle_ages_rus:             '📜 История: средневековье и Русь',
    empires_tsars_rus:           '📜 История: эпоха империй',
    world_wars_revolutions:      '📜 История: войны и революции',
    post_1945_modern:            '📜 История: мир после 1945',
    science_history_discoveries: '📜 История: история науки',
    // ⚗️ Физика и химия
    mkt_thermodynamics:          '⚗️ Физхим: МКТ и термодинамика',
    ege_physics:                 '⚗️ Физхим: задачи ЕГЭ по физике',
    general_chemistry:           '⚗️ Физхим: химия',
    general_physics_core:        '⚗️ Физхим: общая физика',
    // 🎣 Рыбалка
    fish_habits_biology:         '🎣 Рыбалка: рыбоведение',
    fish_physics_mechanics:      '🎣 Рыбалка: физика и механика рыб',
    river_lake_fishing:          '🎣 Рыбалка: речная и озёрная',
    sea_fishing:                 '🎣 Рыбалка: морская рыбалка',
    extreme_conditions_fishing:  '🎣 Рыбалка: экстремальная рыбалка',
    fishing_general_knowledge:   '🎣 Рыбалка: общий кругозор',
    // 📚 Литература
    russian_literature:          '📚 Литература: русская литература',
    iconic_literature:           '📚 Литература: культовые книги',
    foreign_literature:          '📚 Литература: зарубежная литература',
    // 🧩 Логика и ЧГК
    chgk_deduction:              '🧩 Логика: ЧГК и дедукция',
    // 🎵 Музыка
    russian_rock_punk:           '🎸 Музыка: рурок и панк',
    era_90s_10s:                 '📼 Музыка: хиты 90-х — 10-х',
    music_legends:               '👑 Музыка: мировые легенды',
    album_covers_merch:          '🖼️ Музыка: культовые обложки',
};


let _syncSettingsTimeout = null;

function getScoreVal(input, defaultVal) {
    if (!input) return defaultVal;
    const v = parseInt(input.value);
    return Number.isFinite(v) ? v : defaultVal;
}

function syncSettingsToServer() {
    const me = currentPlayers.find(p => p.id === myPlayerId);
    if (!me?.isAdmin) return; // Only admin updates settings

    const { disabledCategories, disabledSubcategories } = collectFilterSettings();
    socket.emit('update_settings', {
        maxTurns: getScoreVal(el.settingTurns, 15),
        disabledCategories,
        disabledSubcategories,
        scores: {
            CAPTURE:       getScoreVal(el.scoreCapture, 200),
            HOLD_CELL:     getScoreVal(el.scoreHold, 100),
            PVP_WIN:       getScoreVal(el.scorePvpWin, 600),
            WRONG_PENALTY: getScoreVal(el.scorePenalty, 100),
        },
    });
}

function debouncedSyncSettings() {
    clearTimeout(_syncSettingsTimeout);
    _syncSettingsTimeout = setTimeout(() => {
        syncSettingsToServer();
    }, 300);
}

function buildTopicFilter() {
    const container = el.topicFilter;
    if (!container) return;
    container.innerHTML = '';

    const disabledCats = new Set(gameSettings.disabledCategories || []);
    const disabledSubs = new Set(gameSettings.disabledSubcategories || []);

    for (const [catId, subs] of Object.entries(categoryIndex)) {
        const label = CATEGORY_LABELS[catId] || catId;

        const group = document.createElement('div');
        group.className = 'filter-group';

        // Category header row
        const header = document.createElement('div');
        header.className = 'filter-cat-row';

        const catCb = document.createElement('input');
        catCb.type = 'checkbox';
        catCb.id   = `cat_${catId}`;
        catCb.className = 'filter-cb filter-cat-cb';

        const catLabel = document.createElement('label');
        catLabel.htmlFor = `cat_${catId}`;
        catLabel.className = 'filter-cat-label';
        catLabel.textContent = label;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'filter-toggle-btn';
        toggleBtn.textContent = '▾';
        toggleBtn.title = 'Развернуть/свернуть';

        header.appendChild(catCb);
        header.appendChild(catLabel);
        header.appendChild(toggleBtn);
        group.appendChild(header);

        // Subcategory list
        const subList = document.createElement('div');
        subList.className = 'filter-sub-list';

        const isCatDisabled = disabledCats.has(catId);
        let checkedCount = 0;

        for (const subId of subs) {
            const subLabel = SUBCATEGORY_LABELS[subId] || subId;
            const row = document.createElement('div');
            row.className = 'filter-sub-row';

            const isSubDisabled = isCatDisabled || disabledSubs.has(subId);

            const subCb = document.createElement('input');
            subCb.type = 'checkbox';
            subCb.id   = `sub_${catId}_${subId}`;
            subCb.checked = !isSubDisabled;
            subCb.dataset.catId = catId;
            subCb.dataset.subId = subId;
            subCb.className = 'filter-cb filter-sub-cb';

            if (subCb.checked) checkedCount++;

            const lbl = document.createElement('label');
            lbl.htmlFor = `sub_${catId}_${subId}`;
            lbl.className = 'filter-sub-label';
            lbl.textContent = subLabel;

            row.appendChild(subCb);
            row.appendChild(lbl);
            subList.appendChild(row);
        }

        // Initialize catCb based on subcategories
        if (checkedCount === 0) {
            catCb.checked = false;
            catCb.indeterminate = false;
        } else if (checkedCount === subs.length) {
            catCb.checked = true;
            catCb.indeterminate = false;
        } else {
            catCb.checked = false;
            catCb.indeterminate = true;
        }

        group.appendChild(subList);
        container.appendChild(group);

        // Toggle button expand/collapse
        let expanded = false;
        subList.style.display = 'none';
        toggleBtn.addEventListener('click', () => {
            expanded = !expanded;
            subList.style.display = expanded ? 'block' : 'none';
            toggleBtn.textContent = expanded ? '▴' : '▾';
        });

        // Cat checkbox → toggle all subcats
        catCb.addEventListener('change', () => {
            catCb.indeterminate = false;
            subList.querySelectorAll('.filter-sub-cb').forEach(cb => {
                cb.checked = catCb.checked;
            });
            debouncedSyncSettings();
        });

        // Sub checkbox → sync cat checkbox state
        subList.addEventListener('change', () => {
            const all  = [...subList.querySelectorAll('.filter-sub-cb')];
            const any  = all.some(cb => cb.checked);
            const all_ = all.every(cb => cb.checked);
            catCb.checked = all_;
            catCb.indeterminate = any && !all_;
            debouncedSyncSettings();
        });
    }
}

function applySettingsToFilterUI(s) {
    if (!s || !el.topicFilter) return;
    const disabledCats = new Set(s.disabledCategories || []);
    const disabledSubs = new Set(s.disabledSubcategories || []);

    document.querySelectorAll('.filter-group').forEach(group => {
        const catCb = group.querySelector('.filter-cat-cb');
        if (!catCb) return;
        const catId = catCb.id.replace('cat_', '');
        const subCbs = [...group.querySelectorAll('.filter-sub-cb')];

        const isCatDisabled = disabledCats.has(catId);
        let checkedCount = 0;

        subCbs.forEach(subCb => {
            const subId = subCb.dataset.subId;
            const isSubDisabled = isCatDisabled || disabledSubs.has(subId);
            subCb.checked = !isSubDisabled;
            if (subCb.checked) checkedCount++;
        });

        if (checkedCount === 0) {
            catCb.checked = false;
            catCb.indeterminate = false;
        } else if (checkedCount === subCbs.length) {
            catCb.checked = true;
            catCb.indeterminate = false;
        } else {
            catCb.checked = false;
            catCb.indeterminate = true;
        }
    });
}

function collectFilterSettings() {
    const disabledCategories = [];
    const disabledSubcategories = [];

    document.querySelectorAll('.filter-group').forEach(group => {
        const catCb = group.querySelector('.filter-cat-cb');
        if (!catCb) return;
        const catId = catCb.id.replace('cat_', '');
        const subCbs = [...group.querySelectorAll('.filter-sub-cb')];

        const allUnchecked = subCbs.every(cb => !cb.checked);
        if (allUnchecked || (!catCb.checked && !catCb.indeterminate)) {
            disabledCategories.push(catId);
        }

        subCbs.forEach(cb => {
            if (!cb.checked || allUnchecked || (!catCb.checked && !catCb.indeterminate)) {
                disabledSubcategories.push(cb.dataset.subId);
            }
        });
    });

    return {
        disabledCategories:    [...new Set(disabledCategories)],
        disabledSubcategories: [...new Set(disabledSubcategories)],
        disabledCats:          [...new Set(disabledCategories)],
        disabledSubs:          [...new Set(disabledSubcategories)],
    };
}

// ─── MODAL ────────────────────────────────────────────

function openModal(html) {
    el.modalContent.innerHTML = html;
    el.modalOverlay.classList.remove('hidden');
}

function closeModal() {
    el.modalOverlay.classList.add('hidden');
    stopCountdown();
}

/** Fullscreen zoom overlay for question images */
window.zoomImage = function(imgEl) {
    const overlay = document.createElement('div');
    overlay.className = 'img-zoom-overlay';
    const big = document.createElement('img');
    big.src = imgEl.src;
    big.alt = imgEl.alt;
    overlay.appendChild(big);
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
};

function showTopicSelect(categories, isDuel = false, round = 1, picker = 'attacker') {
    const role  = isDuel
        ? (picker === 'attacker' ? '⚔️ Ты атакуешь — ' : '🛡️ Ты защищаешься — ')
        : '';
    const title = isDuel ? `${role}Раунд ${round}: выбери тему` : '🎯 Выбери тему';
    const fn    = isDuel ? 'pickDuelTopic' : 'pickCaptureTopic';

    openModal(`
        <h3 class="modal-title">${title}</h3>
        <p class="modal-subtitle">Выбери одну из трёх случайных подтем</p>
        <div class="topic-buttons">
            ${categories.map(sub => {
                const label = SUBCATEGORY_LABELS[sub] || sub;
                return `<button class="topic-btn" onclick="${fn}('${sub}')">${label}</button>`;
            }).join('')}
        </div>
    `);
}

// ─── COUNTDOWN TIMER ──────────────────────────────────

function startCountdown(secs = 30, onEnd) {
    stopCountdown();
    _countdownSecs = secs;
    updateCountdownDisplay();

    _countdownInterval = setInterval(() => {
        _countdownSecs--;
        updateCountdownDisplay();
        if (_countdownSecs <= 0) {
            stopCountdown();
            if (onEnd) onEnd();
        }
    }, 1000);
}

function stopCountdown() {
    if (_countdownInterval) {
        clearInterval(_countdownInterval);
        _countdownInterval = null;
    }
    _countdownSecs = 30;
}

function updateCountdownDisplay() {
    const bar = document.getElementById('countdown-bar');
    const num = document.getElementById('countdown-num');
    if (!bar || !num) return;
    num.textContent = _countdownSecs;
    const pct = (_countdownSecs / 30) * 100;
    bar.style.width = pct + '%';
    bar.className = 'countdown-fill' + (_countdownSecs <= 10 ? ' danger' : _countdownSecs <= 20 ? ' warning' : '');
}

// ─── QUESTION DISPLAY ─────────────────────────────────

window.zoomImage = function(imgEl) {
    if (!imgEl) return;
    const existing = document.getElementById('image-zoom-overlay');
    if (existing) { existing.remove(); return; }
    const overlay = document.createElement('div');
    overlay.id = 'image-zoom-overlay';
    overlay.className = 'image-zoom-overlay';
    overlay.onclick = () => overlay.remove();
    overlay.innerHTML = `<img src="${imgEl.src}" alt="Zoomed" class="zoomed-image">`;
    document.body.appendChild(overlay);
};

function buildQuestionHTML(q, round = null, isDuel = false, isSpectator = false) {
    const LETTERS = ['А', 'Б', 'В', 'Г'];
    const isSvg   = q.image && q.image.endsWith('.svg');
    const img     = q.image
        ? `<img src="${q.image}" class="question-image${isSvg ? ' flag-svg' : ''}" alt="Изображение к вопросу" onclick="zoomImage(this)">`
        : '';
    const spectatorBadge = isSpectator ? `<div class="spectator-badge">👀 Режим зрителя</div>` : '';
    const title   = isDuel
        ? `<h3 class="modal-title">⚔️ Раунд ${round}</h3><p class="modal-subtitle qtext">${q.question}</p>`
        : `<h3 class="modal-title qtext">${q.question}</h3>`;
    const passEv  = isDuel ? 'passDuelAnswer()' : 'passCaptureAnswer()';
    const ansEv   = isDuel
        ? (i => `submitDuelAnswer(${i})`)
        : (i => `submitCaptureAnswer(${i})`);

    const answers = q.options.map((o, i) =>
        isSpectator
            ? `<button class="answer-btn view-only" id="ans-btn-${i}" disabled><span class="ans-letter">${LETTERS[i]}</span>${o}</button>`
            : `<button class="answer-btn" id="ans-btn-${i}" onclick="${ansEv(i)}"><span class="ans-letter">${LETTERS[i]}</span>${o}</button>`
    ).join('');

    const passBtn = isSpectator ? '' : `<button class="pass-btn" id="pass-btn" onclick="${passEv}">🏳️ Я не знаю / Пас</button>`;

    return `
        ${spectatorBadge}
        ${title}
        ${img}
        <div class="countdown-wrap">
            <div class="countdown-track"><div id="countdown-bar" class="countdown-fill"></div></div>
            <span id="countdown-num" class="countdown-num">30</span>
        </div>
        <div class="answer-buttons" id="answer-buttons-wrap">
            ${answers}
        </div>
        ${passBtn}
    `;
}

function showCaptureQuestion(q) {
    openModal(buildQuestionHTML(q, null, false, false));
    startCountdown(30);
}

function showSpectatorCaptureQuestion(q) {
    openModal(buildQuestionHTML(q, null, false, true));
    startCountdown(30);
}

function showDuelQuestion(q, round) {
    openModal(buildQuestionHTML(q, round, true, false));
    startCountdown(30);
}

function showSpectatorDuelQuestion(q, round) {
    openModal(buildQuestionHTML(q, round, true, true));
    startCountdown(30);
}

/**
 * Highlight the correct answer and disable all buttons.
 * correctIndex: index of correct option
 * chosenIndex:  what the player chose (null = pass/timeout)
 */
function revealAnswer(correctIndex, chosenIndex) {
    stopCountdown();

    // Disable pass button
    const passBtn = document.getElementById('pass-btn');
    if (passBtn) passBtn.disabled = true;

    // Disable countdown bar
    const bar = document.getElementById('countdown-bar');
    if (bar) { bar.style.width = '0%'; bar.className = 'countdown-fill'; }

    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`ans-btn-${i}`);
        if (!btn) continue;
        btn.disabled = true;
        btn.classList.remove('ans-correct', 'ans-wrong', 'ans-chosen');

        if (i === correctIndex) {
            btn.classList.add('ans-correct');
        }
        if (chosenIndex !== null && chosenIndex !== undefined && chosenIndex !== 'pass' && i === chosenIndex && i !== correctIndex) {
            btn.classList.add('ans-wrong');
        }
    }
}

function revealDuelAnswers(correctIndex, attackerAnswer, defenderAnswer, aName, dName, aCorrect, dCorrect) {
    stopCountdown();
    const bar = document.getElementById('countdown-bar');
    if (bar) { bar.style.width = '0%'; bar.className = 'countdown-fill'; }

    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`ans-btn-${i}`);
        if (!btn) continue;
        btn.disabled = true;
        btn.classList.remove('ans-correct', 'ans-wrong', 'ans-chosen');

        if (i === correctIndex) {
            btn.classList.add('ans-correct');
        }
        if (attackerAnswer !== null && attackerAnswer !== undefined && attackerAnswer !== 'pass' && i === attackerAnswer && i !== correctIndex) {
            btn.classList.add('ans-wrong');
        }
        if (defenderAnswer !== null && defenderAnswer !== undefined && defenderAnswer !== 'pass' && i === defenderAnswer && i !== correctIndex) {
            btn.classList.add('ans-wrong');
        }
    }
}

function showWaiting(msg = 'Ждём результата...') {
    stopCountdown();
    openModal(`
        <div class="modal-wait">
            <span class="wait-icon">⏳</span>
            ${msg}
        </div>
    `);
}

// ─── GLOBAL ONCLICK HANDLERS ──────────────────────────

window.pickCaptureTopic = topic => {
    if (!_pendingQ) return;
    socket.emit('topic_selected', { topic, q: _pendingQ.q, r: _pendingQ.r });
    showWaiting('Получаем вопрос...');
};

window.submitCaptureAnswer = index => {
    stopCountdown();
    revealAnswer(_currentCorrectIdx, index);  // instant reveal
    setTimeout(() => {
        socket.emit('submit_answer', { answerIndex: index });
    }, 50);
    setTimeout(() => closeModal(), 2000);
};

window.passCaptureAnswer = () => {
    stopCountdown();
    revealAnswer(_currentCorrectIdx, null);   // show correct answer on pass
    setTimeout(() => {
        socket.emit('pass_question');
    }, 50);
    setTimeout(() => closeModal(), 2000);
};

window.pickDuelTopic = topic => {
    socket.emit('duel_topic_selected', { topic });
    showWaiting('Ждём начала раунда...');
};

window.submitDuelAnswer = index => {
    stopCountdown();
    revealAnswer(_currentCorrectIdx, index);  // instant reveal
    setTimeout(() => {
        socket.emit('duel_answer', { answerIndex: index });
    }, 50);
    setTimeout(() => showWaiting('Ждём ответа противника...'), 1800);
};

window.passDuelAnswer = () => {
    stopCountdown();
    revealAnswer(_currentCorrectIdx, null);   // show correct on pass
    setTimeout(() => {
        socket.emit('duel_pass');
    }, 50);
    setTimeout(() => showWaiting('Ждём ответа противника...'), 1800);
};

// ─── DUEL OVERLAY ─────────────────────────────────────

function showDuelOverlay(atkName, atkColor, defName, defColor) {
    el.duelAtkName.textContent  = atkName;
    el.duelAtkName.style.color  = atkColor;
    el.duelDefName.textContent  = defName;
    el.duelDefName.style.color  = defColor;
    el.duelScoreA.textContent   = '0';
    el.duelScoreD.textContent   = '0';
    el.duelRoundLbl.textContent = 'Раунд 1 / 3';
    el.duelStatus.textContent   = 'Атакующий выбирает тему...';
    el.duelOverlay.classList.remove('hidden');
}

function updateDuel(round, aWins, dWins, status) {
    if (el.duelRoundLbl) el.duelRoundLbl.textContent = `Раунд ${round} / 3`;
    if (el.duelScoreA)   el.duelScoreA.textContent   = aWins;
    if (el.duelScoreD)   el.duelScoreD.textContent   = dWins;
    if (el.duelStatus)   el.duelStatus.textContent   = status;
}

function closeDuelOverlay() {
    el.duelOverlay.classList.add('hidden');
    _inDuel = false;
}

// ─── TURN UI UPDATE ───────────────────────────────────

function applyTurnUI(slot, turnNumber) {
    const p = currentPlayers.find(pl => pl.slot === slot);
    if (!p) return;

    if (el.turnNum) {
        el.turnNum.textContent = turnNumber || '';
        el.turnNum.style.color = p.color;
    }
    if (el.turnNameSpan) {
        el.turnNameSpan.textContent = p.nickname;
        el.turnNameSpan.style.color = p.color;
    }
    if (el.roundNum && turnNumber) el.roundNum.textContent = turnNumber;

    if (el.turnBanner) {
        el.turnBanner.style.borderColor = p.id === myPlayerId
            ? p.color + '88' : 'transparent';
    }
}

// ─── BUTTONS ──────────────────────────────────────────

el.joinBtn?.addEventListener('click', () => {
    const nick = el.nickname.value.trim();
    if (!nick) { toast('Введи никнейм!', 'error'); return; }
    socket.emit('join_game', nick);
});

el.nickname?.addEventListener('keydown', e => {
    if (e.key === 'Enter') el.joinBtn.click();
});

el.filterAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.filter-cat-cb').forEach(cb => {
        cb.checked = true;
        cb.indeterminate = false;
    });
    document.querySelectorAll('.filter-sub-cb').forEach(cb => {
        cb.checked = true;
    });
    debouncedSyncSettings();
});

el.filterNoneBtn?.addEventListener('click', () => {
    document.querySelectorAll('.filter-cat-cb').forEach(cb => {
        cb.checked = false;
        cb.indeterminate = false;
    });
    document.querySelectorAll('.filter-sub-cb').forEach(cb => {
        cb.checked = false;
    });
    debouncedSyncSettings();
});

[el.settingTurns, el.scoreCapture, el.scoreHold, el.scorePvpWin, el.scorePenalty].forEach(input => {
    input?.addEventListener('input', () => debouncedSyncSettings());
});

el.applyBtn?.addEventListener('click', () => {
    syncSettingsToServer();
    toast('Настройки применены', 'success');
});

el.startBtn?.addEventListener('click', () => {
    const { disabledCategories, disabledSubcategories } = collectFilterSettings();
    const settings = {
        maxTurns: getScoreVal(el.settingTurns, 15),
        disabledCategories,
        disabledSubcategories,
        scores: {
            CAPTURE:       getScoreVal(el.scoreCapture, 200),
            HOLD_CELL:     getScoreVal(el.scoreHold, 100),
            PVP_WIN:       getScoreVal(el.scorePvpWin, 600),
            WRONG_PENALTY: getScoreVal(el.scorePenalty, 100),
        },
    };
    socket.emit('update_settings', settings);
    socket.emit('start_game', settings);
});
el.restartBtn?.addEventListener('click', () => location.reload());

el.abortBtnGame?.addEventListener('click', () => {
    if (confirm('Прервать текущую битву и сбросить игру в лобби?')) {
        socket.emit('abort_game');
    }
});

// ─── SOCKET EVENTS ────────────────────────────────────

// ──── LOBBY & REJOIN ────
socket.on('game_status', ({ isGameStarted, players }) => {
    if (isGameStarted) {
        renderRejoinSlots(players);
    } else {
        if (el.rejoinSection) el.rejoinSection.classList.add('hidden');
    }
});

socket.on('game_aborted', () => {
    closeModal();
    closeDuelOverlay();
    toast('🛑 Игра была сброшена (Аборт)!', 'error', 4500);
    const me = currentPlayers.find(p => p.id === myPlayerId);
    if (me) {
        showScreen('lobby');
        lobbyLog('🛑 Битва была прервана. Вы вернулись в лобби.', 'fail');
    } else {
        showScreen('login');
        if (el.rejoinSection) el.rejoinSection.classList.add('hidden');
    }
});

socket.on('joined_successfully', player => {
    myPlayerId = player.id;
    mySlot     = player.slot;
    try { sessionStorage.setItem('qb_slot', player.slot); } catch (e) {}
    showScreen('lobby');
    lobbyLog(`Привет, ${player.nickname}! 👋`, 'info');
});

socket.on('category_index', index => {
    categoryIndex = index;
    buildTopicFilter();
});

socket.on('update_player_list', players => {
    currentPlayers = players;
    updateLobbyList();

    const me = players.find(p => p.id === myPlayerId);
    if (me?.isAdmin) {
        el.lobbySettings?.classList.remove('hidden');
        if (el.lobbyMsg) el.lobbyMsg.textContent = '👑 Ты организатор. Настрой игру и жми НАЧАТЬ.';
    } else {
        el.lobbySettings?.classList.add('hidden');
        if (el.lobbyMsg) el.lobbyMsg.textContent = 'Ждём, пока организатор начнёт игру...';
    }

    updateScoreboard();
    if (typeof drawBoard === 'function') drawBoard();
});

socket.on('settings_updated', s => {
    gameSettings = s;
    if (el.settingTurns && s.maxTurns) el.settingTurns.value = s.maxTurns;
    if (s.scores) {
        if (el.scoreCapture) el.scoreCapture.value = s.scores.CAPTURE   || 200;
        if (el.scoreHold)    el.scoreHold.value    = s.scores.HOLD_CELL || 100;
        if (el.scorePvpWin)  el.scorePvpWin.value  = s.scores.PVP_WIN   || 600;
        if (el.scorePenalty) el.scorePenalty.value  = s.scores.WRONG_PENALTY || 100;
    }
    applySettingsToFilterUI(s);
});

// ──── GAME START ────
socket.on('game_started', ({ turn, players, settings, board, capitals, turnNumber }) => {
    currentPlayers = players;
    gameSettings   = settings;

    showScreen('game');

    if (el.maxRounds) el.maxRounds.textContent = settings.maxTurns;
    if (el.roundNum)  el.roundNum.textContent  = turnNumber || '1';

    if (typeof initBoard === 'function') {
        setTimeout(() => {
            initBoard(board, capitals);
            setCurrentPlayerSlot(turn);
            applyTurnUI(turn, turnNumber || 1);
            updateScoreboard();
        }, 80);
    }

    gameLog('🔥 Битва началась!', 'start');
});

// ──── TURN CHANGE ────
socket.on('turn_change', ({ slot, turnNumber, maxTurns }) => {
    setCurrentPlayerSlot(slot);
    applyTurnUI(slot, turnNumber);
    clearSelection();

    const p = currentPlayers.find(pl => pl.slot === slot);
    if (p?.id === myPlayerId) {
        toast(`🎯 Твой ход!`, 'info', 2000);
    }
});

// ──── SCORES ────
socket.on('score_update', ({ slot, score, added }) => {
    const p = currentPlayers.find(pl => pl.slot === slot);
    if (p) {
        p.score = score;
        updateScoreboard();
        if (typeof drawBoard === 'function') drawBoard();
    }
});

// ──── BOARD ────
socket.on('board_update', ({ q, r, owner }) => {
    updateCellOwner(q, r, owner);
});

socket.on('board_full_sync', ({ board }) => {
    syncBoard(board);
});

// ──── CAPTURE FLOW ────
socket.on('show_topic_selection', ({ type, q, r, categories }) => {
    _pendingQ = { q, r };
    showTopicSelect(categories, false);
});

socket.on('ask_question', ({ question }) => {
    _currentCorrectIdx = question.correctIndex ?? null;
    showCaptureQuestion(question);
});

socket.on('spectator_question', ({ playerSlot, playerName, question }) => {
    if (playerSlot !== mySlot) {
        if (question) {
            showSpectatorCaptureQuestion(question);
        }
        gameLog(`👀 ${playerName} отвечает...`, 'info');
    }
});

socket.on('spectator_answer', ({ playerSlot, chosenIndex, correctIndex, isCorrect, isPass }) => {
    const p = currentPlayers.find(pl => pl.slot === playerSlot);
    if (p?.slot !== mySlot) {
        revealAnswer(correctIndex, chosenIndex);
    }
    setTimeout(() => {
        closeModal();
        if (isPass) {
            gameLog(`⏩ ${p?.nickname || 'Игрок'} пасует`, 'info');
        } else if (isCorrect) {
            gameLog(`✅ ${p?.nickname || 'Игрок'} ответил верно!`, 'success');
            toast(`✅ ${p?.nickname || 'Игрок'} верно`, 'success');
        } else {
            gameLog(`❌ ${p?.nickname || 'Игрок'} ошибся — штраф!`, 'fail');
            toast(`❌ ${p?.nickname || 'Игрок'} ошибся — штраф!`, 'error');
        }
    }, 2200);
});

// Question timeout from server
socket.on('question_timeout', ({ playerSlot }) => {
    stopCountdown();
    revealAnswer(-1, null); // -1 = no correct highlight yet (server will send spectator_answer next)
    const p = currentPlayers.find(pl => pl.slot === playerSlot);
    if (p?.slot === mySlot) toast('⏱️ Время вышло — Пас!', 'error', 2500);
});

// ──── DUEL FLOW ────
socket.on('duel_started', ({ attackerSlot, attackerName, defenderSlot, defenderName }) => {
    const aP = currentPlayers.find(p => p.slot === attackerSlot);
    const dP = currentPlayers.find(p => p.slot === defenderSlot);
    showDuelOverlay(
        attackerName, aP?.color || '#fff',
        defenderName, dP?.color || '#888'
    );
    _inDuel = (mySlot === attackerSlot || mySlot === defenderSlot);
    gameLog(`⚔️ Дуэль: ${attackerName} vs ${defenderName}`, 'duel');
    toast('⚔️ Дуэль начинается!', 'duel', 2500);
});

socket.on('duel_pick_topic', ({ round, picker, categories }) => {
    showTopicSelect(categories, true, round, picker);
});

socket.on('duel_round_started', ({ round, topic, attackerScore, defenderScore, attackerSlot, defenderSlot }) => {
    const label = SUBCATEGORY_LABELS[topic] || topic;
    const sA = attackerScore !== undefined ? attackerScore : 0;
    const sD = defenderScore !== undefined ? defenderScore : 0;
    updateDuel(round, sA, sD, `Раунд ${round}: тема «${label}» — ждём ответов...`);
    gameLog(`🎯 Раунд ${round}: тема «${label}»`, 'duel');
});

socket.on('duel_question', ({ question, round }) => {
    _currentCorrectIdx = question.correctIndex ?? null;
    showDuelQuestion(question, round);
});

socket.on('duel_spectator_question', ({ round, topic, attackerSlot, defenderSlot, question }) => {
    if (mySlot !== attackerSlot && mySlot !== defenderSlot) {
        showSpectatorDuelQuestion(question, round);
    }
});

socket.on('duel_waiting_opponent', () => {
    showWaiting('Ответ принят! Ждём противника...');
});

socket.on('duel_round_result', ({
    round, attackerSlot, defenderSlot,
    questionText, questionOptions,
    attackerAnswer, defenderAnswer, correctIndex,
    attackerCorrect, defenderCorrect,
    attackerScore, defenderScore,
    attackerWins, defenderWins,
}) => {
    const sA = attackerScore !== undefined ? attackerScore : (attackerWins !== undefined ? attackerWins : 0);
    const sD = defenderScore !== undefined ? defenderScore : (defenderWins !== undefined ? defenderWins : 0);
    el.duelScoreA.textContent = sA;
    el.duelScoreD.textContent = sD;

    const aP = currentPlayers.find(p => p.slot === attackerSlot);
    const dP = currentPlayers.find(p => p.slot === defenderSlot);

    let roundMsg = '';
    if (attackerCorrect && !defenderCorrect) {
        roundMsg = `${aP?.nickname || 'Атакующий'} берёт раунд! (+1.0) ⚔️`;
    } else if (defenderCorrect && !attackerCorrect) {
        roundMsg = `${dP?.nickname || 'Защитник'} берёт раунд! (+1.0) 🛡️`;
    } else if (attackerCorrect && defenderCorrect) {
        roundMsg = 'Оба ответили верно (+1.0 каждому)';
    } else {
        roundMsg = 'Раунд завершён';
    }
    el.duelStatus.textContent = roundMsg;

    revealDuelAnswers(correctIndex, attackerAnswer, defenderAnswer, aP?.nickname, dP?.nickname, attackerCorrect, defenderCorrect);

    if (questionText) gameLog(`❓ ${questionText}`, 'duel');
    if (questionOptions) {
        const aAns = (attackerAnswer !== null && attackerAnswer !== undefined && attackerAnswer !== 'pass')
            ? questionOptions[attackerAnswer]
            : (attackerAnswer === 'pass' || attackerAnswer === null ? 'Пас' : '—');
        const dAns = (defenderAnswer !== null && defenderAnswer !== undefined && defenderAnswer !== 'pass')
            ? questionOptions[defenderAnswer]
            : (defenderAnswer === 'pass' || defenderAnswer === null ? 'Пас' : '—');
        gameLog(`⚔️ ${aP?.nickname || 'Атакующий'}: «${aAns}» ${attackerCorrect ? '✅ (+1.0)' : (attackerAnswer === null || attackerAnswer === 'pass' ? '🏳️ (+0.4)' : '❌ (штраф)')}`, attackerCorrect ? 'success' : 'fail');
        gameLog(`🛡️ ${dP?.nickname || 'Защитник'}: «${dAns}» ${defenderCorrect ? '✅ (+1.0)' : (defenderAnswer === null || defenderAnswer === 'pass' ? '🏳️ (+0.4)' : '❌ (штраф)')}`, defenderCorrect ? 'success' : 'fail');
    }
    gameLog(`Счёт дуэли: ${sA} : ${sD}`, 'duel');

    setTimeout(() => {
        closeModal();
    }, 2800);
});

socket.on('duel_next_round', ({ round, picker, topic, attackerScore, defenderScore, attackerWins, defenderWins }) => {
    const sA = attackerScore !== undefined ? attackerScore : (attackerWins !== undefined ? attackerWins : 0);
    const sD = defenderScore !== undefined ? defenderScore : (defenderWins !== undefined ? defenderWins : 0);
    el.duelRoundLbl.textContent = `Раунд ${round} / 3`;
    el.duelScoreA.textContent   = sA;
    el.duelScoreD.textContent   = sD;

    if (picker === 'defender') {
        el.duelStatus.textContent = 'Защитник выбирает тему...';
    } else {
        const label = SUBCATEGORY_LABELS[topic] || topic || '?';
        el.duelStatus.textContent = topic ? `Рандомная тема: «${label}»...` : 'Рандомная тема...';
    }
});

socket.on('duel_ended', ({ attackerSlot, defenderSlot, attackerName, defenderName, attackerScore, defenderScore, attackerWins, defenderWins, winner }) => {
    closeModal();
    const sA = attackerScore !== undefined ? attackerScore : (attackerWins !== undefined ? attackerWins : 0);
    const sD = defenderScore !== undefined ? defenderScore : (defenderWins !== undefined ? defenderWins : 0);
    el.duelScoreA.textContent = sA;
    el.duelScoreD.textContent = sD;

    if (winner === 'disconnect') {
        el.duelStatus && (el.duelStatus.textContent = 'Игрок вышел из игры');
        setTimeout(() => closeDuelOverlay(), 2000);
        return;
    }

    const winnerName = winner === 'attacker' ? attackerName : winner === 'defender' ? defenderName : null;
    const msg = winnerName ? `🏆 ${winnerName} выиграл дуэль! (${sA}:${sD})` : `🤝 Ничья в дуэли! (${sA}:${sD})`;

    if (el.duelStatus) el.duelStatus.textContent = msg;
    gameLog(`${msg} (${sA}:${sD})`, 'duel');
    toast(msg, winner === 'tie' ? 'info' : 'duel', 4000);

    setTimeout(() => closeDuelOverlay(), 4000);
});

// ──── ELIMINATION ────
socket.on('player_eliminated', ({ slot, nickname }) => {
    const p = currentPlayers.find(pl => pl.slot === slot);
    if (p) p.eliminated = true;

    updateScoreboard();
    if (typeof drawBoard === 'function') drawBoard();
    gameLog(`💀 ${nickname} выбыл из игры!`, 'eliminate');
    toast(`💀 ${nickname} выбыл!`, 'error', 5000);

    if (slot === mySlot) {
        toast('💀 Ты выбыл из игры. Продолжай наблюдать!', 'error', 8000);
    }
});

// ──── LOG BROADCAST ────
socket.on('log_msg', ({ msg, type }) => {
    gameLog(msg, type);
});

// ──── ERROR ────
socket.on('error_msg', msg => {
    toast('❌ ' + msg, 'error');
    closeModal();
});

// ──── GAME OVER ────
socket.on('game_over', players => {
    closeDuelOverlay();
    closeModal();

    const medals = ['🥇', '🥈', '🥉'];
    el.finalScores.innerHTML = players.map((p, i) => `
        <div class="final-row" style="border-color:${p.color}">
            <span class="final-medal">${medals[i] || (i + 1) + '.'}</span>
            <span class="final-name" style="color:${p.color}">${p.nickname}${p.eliminated ? ' 💀' : ''}</span>
            <span class="final-pts" style="color:${p.color}">${p.score} очков</span>
        </div>
    `).join('');

    showScreen('gameover');
});

console.log('✅ Quiz Battle client loaded');
