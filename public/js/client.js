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
    chgk_deduction:              '🧩 Логика: ЧГК-дедукция',
    everyday_design_logic:       '🧩 Логика: физика вещей',
    lateral_thinking_traps:      '🧩 Логика: мысленные ловушки',
    historical_wit:              '🧩 Логика: историческое остроумие',
    paradoxes_game_theory:       '🧩 Логика: парадоксы и теория игр',
};


function buildTopicFilter() {
    const container = el.topicFilter;
    if (!container) return;
    container.innerHTML = '';

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
        catCb.checked = true;
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

        for (const subId of subs) {
            const subLabel = SUBCATEGORY_LABELS[subId] || subId;
            const row = document.createElement('div');
            row.className = 'filter-sub-row';

            const subCb = document.createElement('input');
            subCb.type = 'checkbox';
            subCb.id   = `sub_${catId}_${subId}`;
            subCb.checked = true;
            subCb.dataset.catId = catId;
            subCb.dataset.subId = subId;
            subCb.className = 'filter-cb filter-sub-cb';

            const lbl = document.createElement('label');
            lbl.htmlFor = `sub_${catId}_${subId}`;
            lbl.className = 'filter-sub-label';
            lbl.textContent = subLabel;

            row.appendChild(subCb);
            row.appendChild(lbl);
            subList.appendChild(row);
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
            subList.querySelectorAll('.filter-sub-cb').forEach(cb => {
                cb.checked = catCb.checked;
            });
        });

        // Sub checkbox → sync cat checkbox state
        subList.addEventListener('change', () => {
            const all  = [...subList.querySelectorAll('.filter-sub-cb')];
            const any  = all.some(cb => cb.checked);
            const all_ = all.every(cb => cb.checked);
            catCb.checked = all_;
            catCb.indeterminate = any && !all_;
        });
    }
}

function collectFilterSettings() {
    const disabledCats = [];
    const disabledSubs = [];

    document.querySelectorAll('.filter-cat-cb').forEach(cb => {
        if (!cb.checked && !cb.indeterminate) {
            disabledCats.push(cb.id.replace('cat_', ''));
        }
    });

    document.querySelectorAll('.filter-sub-cb').forEach(cb => {
        if (!cb.checked) {
            disabledSubs.push(cb.dataset.subId);
        }
    });

    return { disabledCats, disabledSubs };
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

function buildQuestionHTML(q, round = null, isDuel = false) {
    const LETTERS = ['А', 'Б', 'В', 'Г'];
    const isSvg   = q.image && q.image.endsWith('.svg');
    const img     = q.image
        ? `<img src="${q.image}" class="question-image${isSvg ? ' flag-svg' : ''}" alt="Изображение к вопросу" onclick="zoomImage(this)">`
        : '';
    const title   = isDuel
        ? `<h3 class="modal-title">⚔️ Раунд ${round}</h3><p class="modal-subtitle qtext">${q.question}</p>`
        : `<h3 class="modal-title qtext">${q.question}</h3>`;
    const passEv  = isDuel ? 'passDuelAnswer()' : 'passCaptureAnswer()';
    const ansEv   = isDuel
        ? (i => `submitDuelAnswer(${i})`)
        : (i => `submitCaptureAnswer(${i})`);

    const answers = q.options.map((o, i) =>
        `<button class="answer-btn" id="ans-btn-${i}" onclick="${ansEv(i)}"><span class="ans-letter">${LETTERS[i]}</span>${o}</button>`
    ).join('');

    return `
        ${title}
        ${img}
        <div class="countdown-wrap">
            <div class="countdown-track"><div id="countdown-bar" class="countdown-fill"></div></div>
            <span id="countdown-num" class="countdown-num">30</span>
        </div>
        <div class="answer-buttons" id="answer-buttons-wrap">
            ${answers}
        </div>
        <button class="pass-btn" id="pass-btn" onclick="${passEv}">🏳️ Я не знаю / Пас</button>
    `;
}


function showCaptureQuestion(q) {
    openModal(buildQuestionHTML(q, null, false));
    startCountdown(30);
}

function showDuelQuestion(q, round) {
    openModal(buildQuestionHTML(q, round, true));
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
        if (chosenIndex !== null && chosenIndex !== undefined && i === chosenIndex && i !== correctIndex) {
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

el.applyBtn?.addEventListener('click', () => {
    const { disabledCats, disabledSubs } = collectFilterSettings();
    socket.emit('update_settings', {
        maxTurns: parseInt(el.settingTurns?.value) || 15,
        disabledCategories:    disabledCats,
        disabledSubcategories: disabledSubs,
        scores: {
            CAPTURE:       parseInt(el.scoreCapture?.value) || 200,
            HOLD_CELL:     parseInt(el.scoreHold?.value)    || 100,
            PVP_WIN:       parseInt(el.scorePvpWin?.value)  || 600,
            WRONG_PENALTY: parseInt(el.scorePenalty?.value) || 100,
        },
    });
    toast('Настройки применены', 'success');
});

el.startBtn?.addEventListener('click', () => socket.emit('start_game'));
el.restartBtn?.addEventListener('click', () => location.reload());

// ─── SOCKET EVENTS ────────────────────────────────────

// ──── LOBBY ────
socket.on('joined_successfully', player => {
    myPlayerId = player.id;
    mySlot     = player.slot;
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
});

// ──── GAME START ────
socket.on('game_started', ({ turn, players, settings, board, capitals }) => {
    currentPlayers = players;
    gameSettings   = settings;

    showScreen('game');

    if (el.maxRounds) el.maxRounds.textContent = settings.maxTurns;
    if (el.roundNum)  el.roundNum.textContent  = '1';

    if (typeof initBoard === 'function') {
        setTimeout(() => {
            initBoard(board, capitals);
            setCurrentPlayerSlot(turn);
            applyTurnUI(turn, 1);
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

socket.on('spectator_question', ({ playerSlot, playerName }) => {
    gameLog(`👀 ${playerName} отвечает...`, 'info');
});

socket.on('spectator_answer', ({ playerSlot, chosenIndex, correctIndex, isCorrect, isPass }) => {
    // Only close modal if we are a SPECTATOR (our instant reveal already handled it if we were the player)
    const p = currentPlayers.find(pl => pl.slot === playerSlot);
    if (p?.slot !== mySlot) {
        // We're a spectator — nothing to reveal in our modal
    }
    setTimeout(() => {
        closeModal();
        if (isPass) {
            gameLog(`⏩ ${p?.nickname} пасует`, 'info');
        } else if (isCorrect) {
            gameLog(`✅ ${p?.nickname} ответил верно!`, 'success');
            toast(`✅ ${p?.nickname} верно`, 'success');
        } else {
            gameLog(`❌ ${p?.nickname} ошибся — штраф!`, 'fail');
            toast(`❌ ${p?.nickname} ошибся — штраф!`, 'error');
        }
    }, 1800);
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

socket.on('duel_round_started', ({ round, topic, attackerSlot, defenderSlot }) => {
    const label = SUBCATEGORY_LABELS[topic] || topic;
    updateDuel(round, 0, 0, `Раунд ${round}: тема «${label}» — ждём ответов...`);
    gameLog(`🎯 Раунд ${round}: тема «${label}»`, 'duel');
});

socket.on('duel_question', ({ question, round }) => {
    _currentCorrectIdx = question.correctIndex ?? null;
    showDuelQuestion(question, round);
});

socket.on('duel_waiting_opponent', () => {
    showWaiting('Ответ принят! Ждём противника...');
});

socket.on('duel_round_result', ({
    round, attackerSlot, defenderSlot,
    questionText, questionOptions,
    attackerAnswer, defenderAnswer, correctIndex,
    attackerCorrect, defenderCorrect,
    attackerWins, defenderWins,
}) => {
    // Instant reveal already fired on click — just update duel overlay scores
    const aP = currentPlayers.find(p => p.slot === attackerSlot);
    const dP = currentPlayers.find(p => p.slot === defenderSlot);

    el.duelScoreA.textContent = attackerWins;
    el.duelScoreD.textContent = defenderWins;

    let roundMsg = '';
    if (attackerCorrect && !defenderCorrect) {
        roundMsg = `${aP?.nickname} берёт раунд! ⚔️`;
    } else if (defenderCorrect && !attackerCorrect) {
        roundMsg = `${dP?.nickname} берёт раунд! 🛡️`;
    } else if (attackerCorrect && defenderCorrect) {
        roundMsg = 'Оба ответили верно — ничья в раунде';
    } else {
        roundMsg = 'Оба ошиблись — ничья в раунде';
    }
    el.duelStatus.textContent = roundMsg;

    if (questionText) gameLog(`❓ ${questionText}`, 'duel');
    if (questionOptions) {
        const aAns = attackerAnswer !== null && attackerAnswer !== undefined ? questionOptions[attackerAnswer] : '—';
        const dAns = defenderAnswer !== null && defenderAnswer !== undefined ? questionOptions[defenderAnswer] : '—';
        gameLog(`⚔️ ${aP?.nickname}: «${aAns}» ${attackerCorrect ? '✅' : '❌'}`, attackerCorrect ? 'success' : 'fail');
        gameLog(`🛡️ ${dP?.nickname}: «${dAns}» ${defenderCorrect ? '✅' : '❌'}`, defenderCorrect ? 'success' : 'fail');
    }
    gameLog(`Счёт раунда ${round}: ${attackerWins}:${defenderWins}`, 'duel');
});

socket.on('duel_next_round', ({ round, picker, topic, attackerWins, defenderWins }) => {
    el.duelRoundLbl.textContent = `Раунд ${round} / 3`;
    el.duelScoreA.textContent   = attackerWins;
    el.duelScoreD.textContent   = defenderWins;

    if (picker === 'defender') {
        el.duelStatus.textContent = 'Защитник выбирает тему...';
    } else {
        const label = SUBCATEGORY_LABELS[topic] || topic || '?';
        el.duelStatus.textContent = topic ? `Рандомная тема: «${label}»...` : 'Рандомная тема...';
    }
});

socket.on('duel_ended', ({ attackerSlot, defenderSlot, attackerName, defenderName, attackerWins, defenderWins, winner }) => {
    closeModal();
    if (winner === 'disconnect') {
        el.duelStatus && (el.duelStatus.textContent = 'Игрок вышел из игры');
        setTimeout(() => closeDuelOverlay(), 2000);
        return;
    }

    const winnerName = winner === 'attacker' ? attackerName : winner === 'defender' ? defenderName : null;
    const msg = winnerName ? `🏆 ${winnerName} выиграл дуэль!` : `🤝 Ничья в дуэли!`;

    if (el.duelStatus) el.duelStatus.textContent = msg;
    gameLog(`${msg} (${attackerWins}:${defenderWins})`, 'duel');
    toast(msg, winner === 'tie' ? 'info' : 'duel', 3500);

    setTimeout(() => closeDuelOverlay(), 3500);
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
