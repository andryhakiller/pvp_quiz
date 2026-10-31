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
    undoBtnGame:  $('undo-btn-game'),
    // profile customizer
    myProfileCard:        $('my-profile-card'),
    colorPalette:         $('color-palette'),
    emojiPalette:         $('emoji-palette'),
    profilePreviewBadge:  $('profile-preview-badge'),
    // banter & reactions
    reactionsContainer:   $('reactions-container'),
    bmBar:                $('bm-bar'),
    chatToggleBtn:        $('chat-toggle-btn'),
    chatUnreadBadge:      $('chat-unread-badge'),
    // chat drawer
    chatDrawer:           $('chat-drawer'),
    chatOnlineCount:      $('chat-online-count'),
    chatCloseBtn:         $('chat-close-btn'),
    chatMessages:         $('chat-messages'),
    chatForm:             $('chat-form'),
    chatInput:            $('chat-input'),
};

// ─── AUDIO SYNTHESIZER (Web Audio API) ─────────────────
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playPopSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    } catch (e) {}
}

function playNotificationSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    } catch (e) {}
}

// ─── PROFILE CUSTOMIZER (COLOR & CAPITAL EMOJI) ───────
const PRESET_COLORS = [
    '#FF595E', '#FFCA3A', '#4CC9F0', '#06D6A0', '#9F7AEA', '#FF8C42',
    '#F72585', '#7209B7', '#4361EE', '#10B981', '#F59E0B', '#EC4899',
    '#00F5D4', '#B5179E'
];

const PRESET_EMOJIS = [
    '👑', '🏰', '🗿', '⚡', '🚀', '🔥', '🦁', '🐱',
    '💀', '🎯', '💎', '🐉', '⚔️', '🪐', '🍕', '🤡'
];

let _customizerInitialized = false;

function initProfileCustomizer() {
    if (!el.colorPalette || !el.emojiPalette || _customizerInitialized) return;
    _customizerInitialized = true;

    // Color swatches
    el.colorPalette.innerHTML = '';
    PRESET_COLORS.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'color-dot';
        btn.style.backgroundColor = c;
        btn.dataset.color = c;
        btn.title = c;
        btn.onclick = () => selectMyColor(c);
        el.colorPalette.appendChild(btn);
    });

    // Custom color picker
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'color-picker-input';
    picker.title = 'Выбрать свой цвет';
    picker.onchange = (e) => selectMyColor(e.target.value);
    el.colorPalette.appendChild(picker);

    // Emoji swatches
    el.emojiPalette.innerHTML = '';
    PRESET_EMOJIS.forEach(em => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-btn';
        btn.textContent = em;
        btn.dataset.emoji = em;
        btn.title = em;
        btn.onclick = () => selectMyEmoji(em);
        el.emojiPalette.appendChild(btn);
    });
}

function selectMyColor(color) {
    const me = currentPlayers.find(p => p.id === myPlayerId);
    if (!me) return;
    me.color = color;
    socket.emit('update_profile', { color });
    updateProfileCustomizerUI();
    updateLobbyList();
    if (typeof drawBoard === 'function') drawBoard();
}

function selectMyEmoji(capitalEmoji) {
    const me = currentPlayers.find(p => p.id === myPlayerId);
    if (!me) return;
    me.capitalEmoji = capitalEmoji;
    socket.emit('update_profile', { capitalEmoji });
    updateProfileCustomizerUI();
    updateLobbyList();
    if (typeof drawBoard === 'function') drawBoard();
}

function updateProfileCustomizerUI() {
    initProfileCustomizer();
    const me = currentPlayers.find(p => p.id === myPlayerId);
    if (!me) {
        el.myProfileCard?.classList.add('hidden');
        return;
    }
    el.myProfileCard?.classList.remove('hidden');

    const curColor = me.color || '#4a9eff';
    const curEmoji = me.capitalEmoji || '👑';

    // Highlight active color
    if (el.colorPalette) {
        el.colorPalette.querySelectorAll('.color-dot').forEach(dot => {
            const isActive = dot.dataset.color?.toLowerCase() === curColor.toLowerCase();
            dot.classList.toggle('active', isActive);
        });
    }

    // Highlight active emoji
    if (el.emojiPalette) {
        el.emojiPalette.querySelectorAll('.emoji-btn').forEach(btn => {
            const isActive = btn.dataset.emoji === curEmoji;
            btn.classList.toggle('active', isActive);
        });
    }

    // Update preview badge
    if (el.profilePreviewBadge) {
        el.profilePreviewBadge.textContent = `${curEmoji} ${me.nickname}`;
        el.profilePreviewBadge.style.color = curColor;
        el.profilePreviewBadge.style.borderColor = curColor;
        el.profilePreviewBadge.style.boxShadow = `0 2px 10px ${curColor}44`;
    }
}

// ─── BM BANTER & FLOATING REACTIONS ───────────────────
function spawnReaction(emoji, nickname, color) {
    playPopSound();
    if (!el.reactionsContainer) return;

    const div = document.createElement('div');
    div.className = 'floating-reaction';

    // Randomize horizontal position around center (15% to 80%)
    const randomLeft = 15 + Math.random() * 70;
    div.style.left = `${randomLeft}%`;

    const bubble = document.createElement('div');
    bubble.className = 'reaction-bubble';
    bubble.textContent = emoji;

    const sender = document.createElement('div');
    sender.className = 'reaction-sender';
    sender.textContent = nickname;
    sender.style.color = color || '#ffffff';
    sender.style.borderColor = color ? (color + 'aa') : 'rgba(74, 158, 255, 0.6)';

    div.appendChild(bubble);
    div.appendChild(sender);
    el.reactionsContainer.appendChild(div);

    setTimeout(() => div.remove(), 2600);
}

function initBMBar() {
    document.querySelectorAll('.bm-btn').forEach(btn => {
        btn.onclick = () => {
            const emoji = btn.dataset.emoji;
            if (emoji) {
                socket.emit('send_reaction', { emoji });
            }
        };
    });
}

// ─── LIVE CHAT DRAWER ─────────────────────────────────
let unreadChatCount = 0;

function toggleChat(forceOpen) {
    if (!el.chatDrawer) return;
    const isClosed = el.chatDrawer.classList.contains('hidden');
    const open = (forceOpen !== undefined) ? forceOpen : isClosed;

    if (open) {
        el.chatDrawer.classList.remove('hidden');
        unreadChatCount = 0;
        if (el.chatUnreadBadge) {
            el.chatUnreadBadge.textContent = '0';
            el.chatUnreadBadge.classList.add('hidden');
        }
        if (el.chatInput) el.chatInput.focus();
        if (el.chatMessages) el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
    } else {
        el.chatDrawer.classList.add('hidden');
    }
}

function renderChatMessage(msg) {
    if (!el.chatMessages) return;
    const isMine = (msg.slot !== -1 && msg.slot === mySlot) ||
                   (msg.nickname && currentPlayers.find(p => p.id === myPlayerId)?.nickname === msg.nickname);

    const row = document.createElement('div');
    row.className = `chat-msg-row ${isMine ? 'mine' : 'theirs'}`;

    const header = document.createElement('div');
    header.className = 'chat-msg-header';

    const sender = document.createElement('span');
    sender.className = 'chat-sender-name';
    sender.style.color = msg.color || '#4a9eff';
    sender.textContent = `${msg.capitalEmoji || '💬'} ${msg.nickname}`;

    const time = document.createElement('span');
    time.className = 'chat-msg-time';
    time.textContent = msg.time || '';

    header.appendChild(sender);
    header.appendChild(time);

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.textContent = msg.text;
    if (msg.color) {
        bubble.style.borderColor = isMine ? (msg.color + '66') : (msg.color + '44');
    }

    row.appendChild(header);
    row.appendChild(bubble);

    el.chatMessages.appendChild(row);
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

function initChat() {
    if (el.chatToggleBtn) {
        el.chatToggleBtn.onclick = () => toggleChat();
    }
    if (el.chatCloseBtn) {
        el.chatCloseBtn.onclick = () => toggleChat(false);
    }
    if (el.chatForm) {
        el.chatForm.onsubmit = (e) => {
            e.preventDefault();
            const text = el.chatInput?.value.trim();
            if (text) {
                socket.emit('send_chat', { text });
                if (el.chatInput) el.chatInput.value = '';
            }
        };
    }
}

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
            <span class="s-name" style="color:${p.color}">${p.capitalEmoji || '👑'} ${p.nickname}${p.eliminated ? ' 💀' : ''}</span>
            <span class="s-pts" style="color:${p.color}">${p.score}</span>
        </li>
    `).join('');
}

function updateLobbyList() {
    if (!el.playersList) return;
    el.playersList.innerHTML = currentPlayers.map(p => `
        <li style="border-color:${p.color}">
            <span class="player-capital-emoji" style="font-size:1.15rem; line-height:1; user-select:none;">${p.capitalEmoji || '👑'}</span>
            <span class="player-nick" style="color:${p.color}">${p.nickname}</span>
            <span class="player-score">${p.score}</span>
            ${p.isAdmin ? '<span class="player-crown" title="Организатор">👑</span>' : ''}
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
            <span class="rejoin-slot-name" style="color: ${p.color};">${p.capitalEmoji || '👑'} ${p.nickname}</span>
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
    sports:            '🏆 Спорт',
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
    // 🏆 Спорт
    sports_football:             '⚽ Спорт: футбол',
    sports_hockey:               '🏒 Спорт: хоккей',
    sports_basketball:           '🏀 Спорт: баскетбол',
    sports_olympics:             '🥇 Спорт: олимпиада',
    sports_chess:                '♟️ Спорт: шахматы',
    sports_esports:              '🎮 Спорт: киберспорт',
    sports_general:              '🥊 Спорт: разный спорт',
    // 🔢 Подкатегории «Числа» (только в дуэлях)
    geography_numbers:           '🌍 География: числа',
    mathematics_numbers:         '📐 Математика: числа',
    transport_numbers:           '🚗 Транспорт: числа',
    construction_earth_numbers:  '🏗️ Стройка: числа',
    cinema_arts_numbers:         '🎬 Кино: числа',
    history_numbers:             '📜 История: числа',
    physics_chemistry_numbers:   '⚗️ Физхим: числа',
    fishing_numbers:             '🎣 Рыбалка: числа',
    literature_numbers:          '📚 Литература: числа',
    logic_chgk_numbers:          '🧩 Логика: числа',
    music_numbers:               '🎸 Музыка: числа',
    sports_numbers:              '🏆 Спорт: числа',
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

let _modalCloseTimer = null;

function openModal(html) {
    if (_modalCloseTimer) {
        clearTimeout(_modalCloseTimer);
        _modalCloseTimer = null;
    }
    // Remove any leftover elements inside modal-box that are not #modal-content
    const extraCards = el.modalOverlay.querySelectorAll('.modal-box > *:not(#modal-content)');
    extraCards.forEach(card => card.remove());

    el.modalContent.innerHTML = html;
    el.modalOverlay.classList.remove('hidden');
    const numInput = el.modalContent.querySelector('#numeric-input');
    if (numInput && !numInput.disabled) {
        setTimeout(() => numInput.focus(), 60);
    }
}

function closeModal() {
    if (_modalCloseTimer) {
        clearTimeout(_modalCloseTimer);
        _modalCloseTimer = null;
    }
    el.modalOverlay.classList.add('hidden');
    const extraCards = el.modalOverlay.querySelectorAll('.modal-box > *:not(#modal-content)');
    extraCards.forEach(card => card.remove());
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
    const isSvg   = q.image && q.image.endsWith('.svg');
    const img     = q.image
        ? `<img src="${q.image}" class="question-image${isSvg ? ' flag-svg' : ''}" alt="Изображение к вопросу" onclick="zoomImage(this)">`
        : '';
    const spectatorBadge = isSpectator ? `<div class="spectator-badge">👀 Режим зрителя</div>` : '';
    const title   = isDuel
        ? `<h3 class="modal-title">⚔️ Раунд ${round}</h3><p class="modal-subtitle qtext">${q.question}</p>`
        : `<h3 class="modal-title qtext">${q.question}</h3>`;
    const passEv  = isDuel ? 'passDuelAnswer()' : 'passCaptureAnswer()';

    if (q.type === 'numeric') {
        const unitHtml = q.unit ? `<span class="numeric-unit-badge">${q.unit}</span>` : '';
        const inputArea = isSpectator
            ? `<div class="numeric-spectator-hint">Игроки вводят число с клавиатуры...</div>`
            : `
                <div class="numeric-input-card">
                    <div class="numeric-field-row">
                        <input type="text"
                               inputmode="decimal"
                               id="numeric-input"
                               class="numeric-input"
                               placeholder="Введите число..."
                               autocomplete="off"
                               onkeydown="if(event.key==='Enter') submitDuelNumericAnswer()">
                        ${unitHtml}
                    </div>
                    <button id="numeric-submit-btn" class="numeric-submit-btn" onclick="submitDuelNumericAnswer()">
                        <span>Ответить</span> <kbd>↵ Enter</kbd>
                    </button>
                </div>
            `;
        const passBtn = isSpectator ? '' : `<button class="pass-btn" id="pass-btn" onclick="${passEv}">🏳️ Я не знаю / Пас</button>`;

        return `
            ${spectatorBadge}
            ${title}
            ${img}
            <div class="countdown-wrap">
                <div class="countdown-track"><div id="countdown-bar" class="countdown-fill"></div></div>
                <span id="countdown-num" class="countdown-num">30</span>
            </div>
            ${inputArea}
            ${passBtn}
        `;
    }

    const LETTERS = ['А', 'Б', 'В', 'Г'];
    const ansEv   = isDuel
        ? (i => `submitDuelAnswer(${i})`)
        : (i => `submitCaptureAnswer(${i})`);

    const answers = (q.options || []).map((o, i) =>
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

function revealNumericDuelResult({
    numericAnswer, unit,
    aName, dName,
    aAns, dAns,
    aDiff, dDiff,
    aCorrect, dCorrect,
    aPass, dPass
}) {
    stopCountdown();
    const bar = document.getElementById('countdown-bar');
    if (bar) { bar.style.width = '0%'; bar.className = 'countdown-fill'; }

    const aRowClass = aCorrect ? 'winner' : (aPass ? 'pass' : 'loser');
    const dRowClass = dCorrect ? 'winner' : (dPass ? 'pass' : 'loser');

    const passBtn = el.modalContent.querySelector('#pass-btn');
    if (passBtn) passBtn.remove();

    const resultHtml = `
        <div class="numeric-result-card">
            <div class="numeric-target-box">
                <span class="numeric-target-label">🎯 Точный правильный ответ:</span>
                <span class="numeric-target-val">${numericAnswer} ${unit || ''}</span>
            </div>
            <div class="numeric-players-compare">
                <div class="numeric-player-row ${aRowClass}">
                    <div class="numeric-player-info">
                        <span>⚔️ ${aName}</span>
                        ${aCorrect ? '<span class="badge-win">Победа (+1.0)</span>' : (aPass ? '<span class="badge-pass">Пас (+0.4)</span>' : '<span class="badge-fail">Дальше</span>')}
                    </div>
                    <div class="numeric-player-ans">
                        <span class="numeric-player-guess">${aPass ? 'Пас' : (aAns !== null && aAns !== undefined ? `${aAns} ${unit || ''}` : '—')}</span>
                        ${!aPass && aDiff !== null ? `<span class="numeric-player-diff">разница: ±${aDiff}</span>` : ''}
                    </div>
                </div>
                <div class="numeric-player-row ${dRowClass}">
                    <div class="numeric-player-info">
                        <span>🛡️ ${dName}</span>
                        ${dCorrect ? '<span class="badge-win">Победа (+1.0)</span>' : (dPass ? '<span class="badge-pass">Пас (+0.4)</span>' : '<span class="badge-fail">Дальше</span>')}
                    </div>
                    <div class="numeric-player-ans">
                        <span class="numeric-player-guess">${dPass ? 'Пас' : (dAns !== null && dAns !== undefined ? `${dAns} ${unit || ''}` : '—')}</span>
                        ${!dPass && dDiff !== null ? `<span class="numeric-player-diff">разница: ±${dDiff}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    const waitBox = el.modalContent.querySelector('.modal-wait');
    const inputCard = el.modalContent.querySelector('.numeric-input-card');
    const spectatorHint = el.modalContent.querySelector('.numeric-spectator-hint');
    const answerBtns = el.modalContent.querySelector('.answer-buttons');

    if (inputCard) {
        inputCard.outerHTML = resultHtml;
    } else if (waitBox) {
        waitBox.outerHTML = resultHtml;
    } else if (spectatorHint) {
        spectatorHint.outerHTML = resultHtml;
    } else if (answerBtns) {
        answerBtns.outerHTML = resultHtml;
    } else {
        el.modalContent.innerHTML = `
            <h3 class="modal-title">⚔️ Результат раунда</h3>
            ${resultHtml}
        `;
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
    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`ans-btn-${i}`);
        if (btn) {
            btn.disabled = true;
            if (i === index) btn.classList.add('ans-chosen');
        }
    }
    const passBtn = document.getElementById('pass-btn');
    if (passBtn) passBtn.disabled = true;
    socket.emit('submit_answer', { answerIndex: index });
};

window.passCaptureAnswer = () => {
    stopCountdown();
    const passBtn = document.getElementById('pass-btn');
    if (passBtn) passBtn.disabled = true;
    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`ans-btn-${i}`);
        if (btn) btn.disabled = true;
    }
    socket.emit('pass_question');
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

window.submitDuelNumericAnswer = () => {
    const inp = document.getElementById('numeric-input');
    if (!inp) return;
    const raw = inp.value.trim();
    if (!raw) {
        inp.classList.add('input-error-shake');
        setTimeout(() => inp.classList.remove('input-error-shake'), 400);
        return;
    }
    const clean = raw.replace(/\s+/g, '').replace(',', '.');
    const val = parseFloat(clean);
    if (isNaN(val)) {
        inp.classList.add('input-error-shake');
        setTimeout(() => inp.classList.remove('input-error-shake'), 400);
        return;
    }

    stopCountdown();
    inp.disabled = true;
    const btn = document.getElementById('numeric-submit-btn');
    if (btn) btn.disabled = true;
    const passBtn = document.getElementById('pass-btn');
    if (passBtn) passBtn.disabled = true;

    socket.emit('duel_numeric_answer', { value: val });
    showWaiting('Число отправлено! Ждём ответа противника...');
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

el.undoBtnGame?.addEventListener('click', () => {
    socket.emit('undo_turn');
});

// ─── SOCKET EVENTS ────────────────────────────────────

socket.on('close_modals', () => {
    closeModal();
    closeDuelOverlay();
    stopCountdown();
});

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
    el.bmBar?.classList.remove('hidden');
    updateProfileCustomizerUI();
    lobbyLog(`Привет, ${player.nickname}! 👋`, 'info');
});

socket.on('category_index', index => {
    categoryIndex = index;
    buildTopicFilter();
});

socket.on('update_player_list', players => {
    currentPlayers = players;
    updateLobbyList();
    updateProfileCustomizerUI();

    if (el.chatOnlineCount) {
        const count = players.length;
        const word = (count === 1) ? 'игрок' : (count >= 2 && count <= 4) ? 'игрока' : 'игроков';
        el.chatOnlineCount.textContent = `${count} ${word}`;
    }

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
    el.bmBar?.classList.remove('hidden');

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
    revealAnswer(correctIndex, chosenIndex);
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
    round, isNumeric, numericAnswer, unit,
    attackerSlot, defenderSlot,
    questionText, questionOptions,
    attackerAnswer, defenderAnswer,
    attackerDiff, defenderDiff,
    correctIndex,
    attackerCorrect, defenderCorrect,
    attackerPass, defenderPass,
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
    if (isNumeric) {
        if (attackerCorrect && !defenderCorrect) {
            roundMsg = `${aP?.nickname || 'Атакующий'} был ближе и берёт раунд! (+1.0) ⚔️`;
        } else if (defenderCorrect && !attackerCorrect) {
            roundMsg = `${dP?.nickname || 'Защитник'} был ближе и берёт раунд! (+1.0) 🛡️`;
        } else if (attackerCorrect && defenderCorrect) {
            roundMsg = 'Оба назвали одинаково близкие числа (+1.0 каждому)';
        } else if (attackerPass && defenderPass) {
            roundMsg = 'Оба игрока спасовали (+0.4 каждому)';
        } else {
            roundMsg = 'Раунд завершён';
        }
        el.duelStatus.textContent = roundMsg;

        revealNumericDuelResult({
            numericAnswer, unit,
            aName: aP?.nickname || 'Атакующий',
            dName: dP?.nickname || 'Защитник',
            aAns: attackerAnswer,
            dAns: defenderAnswer,
            aDiff: attackerDiff,
            dDiff: defenderDiff,
            aCorrect: attackerCorrect,
            dCorrect: defenderCorrect,
            aPass: attackerPass,
            dPass: defenderPass,
        });

        if (questionText) gameLog(`❓ ${questionText}`, 'duel');
        gameLog(`🎯 Точный ответ: ${numericAnswer} ${unit || ''}`, 'duel');
        const aAnsStr = attackerPass ? 'Пас' : `${attackerAnswer} ${unit || ''} (разница: ±${attackerDiff})`;
        const dAnsStr = defenderPass ? 'Пас' : `${defenderAnswer} ${unit || ''} (разница: ±${defenderDiff})`;
        gameLog(`⚔️ ${aP?.nickname || 'Атакующий'}: «${aAnsStr}» ${attackerCorrect ? '✅ (+1.0)' : (attackerPass ? '🏳️ (+0.4)' : '❌')}`, attackerCorrect ? 'success' : 'fail');
        gameLog(`🛡️ ${dP?.nickname || 'Защитник'}: «${dAnsStr}» ${defenderCorrect ? '✅ (+1.0)' : (defenderPass ? '🏳️ (+0.4)' : '❌')}`, defenderCorrect ? 'success' : 'fail');
        gameLog(`Счёт дуэли: ${sA} : ${sD}`, 'duel');
    } else {
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
    }
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

// ──── BM REACTIONS & CHAT ────
socket.on('player_reaction', ({ slot, nickname, color, emoji }) => {
    spawnReaction(emoji, nickname, color);
});

socket.on('chat_history', history => {
    if (!el.chatMessages) return;
    el.chatMessages.innerHTML = '<div class="chat-system-msg">🔥 Беймить разрешено! Отправляй эмоции и подкалывай друзей 😈</div>';
    if (Array.isArray(history)) {
        history.forEach(msg => renderChatMessage(msg));
    }
});

socket.on('chat_message', msg => {
    renderChatMessage(msg);
    const isClosed = el.chatDrawer?.classList.contains('hidden');
    if (isClosed) {
        unreadChatCount++;
        if (el.chatUnreadBadge) {
            el.chatUnreadBadge.textContent = unreadChatCount > 99 ? '99+' : unreadChatCount;
            el.chatUnreadBadge.classList.remove('hidden');
        }
        playNotificationSound();
    }
});

// ──── GAME OVER ────
socket.on('game_over', players => {
    closeDuelOverlay();
    closeModal();

    if (!Array.isArray(players) || players.length === 0) return;

    const medals = ['🥇', '🥈', '🥉'];

    // Calculate MVP Highlights across players
    const highlights = [];

    // 1. Top Accuracy (min 2 answers)
    const accRanked = [...players]
        .filter(p => p.stats && p.stats.totalQuestions >= 2)
        .map(p => ({
            p,
            pct: Math.round((p.stats.correctQuestions / p.stats.totalQuestions) * 100),
            ratio: `${p.stats.correctQuestions}/${p.stats.totalQuestions}`
        }))
        .sort((a, b) => b.pct - a.pct || b.p.stats.correctQuestions - a.p.stats.correctQuestions);

    if (accRanked.length > 0 && accRanked[0].pct >= 40) {
        highlights.push({
            icon: '🧠',
            title: 'Главный эрудит',
            name: accRanked[0].p.nickname,
            color: accRanked[0].p.color,
            val: `${accRanked[0].pct}% (${accRanked[0].ratio})`,
        });
    }

    // 2. Conqueror (most cells captured)
    const cellRanked = [...players]
        .filter(p => p.stats && p.stats.cellsCaptured > 0)
        .sort((a, b) => (b.stats?.cellsCaptured || 0) - (a.stats?.cellsCaptured || 0));

    if (cellRanked.length > 0 && cellRanked[0].stats.cellsCaptured >= 2) {
        highlights.push({
            icon: '🗺️',
            title: 'Генерал экспансии',
            name: cellRanked[0].nickname,
            color: cellRanked[0].color,
            val: `${cellRanked[0].stats.cellsCaptured} клеток`,
        });
    }

    // 3. Duelist (most duel wins)
    const duelRanked = [...players]
        .filter(p => p.stats && p.stats.duelsWon > 0)
        .sort((a, b) => (b.stats?.duelsWon || 0) - (a.stats?.duelsWon || 0));

    if (duelRanked.length > 0) {
        highlights.push({
            icon: '⚔️',
            title: 'Непобедимый дуэлянт',
            name: duelRanked[0].nickname,
            color: duelRanked[0].color,
            val: `${duelRanked[0].stats.duelsWon} побед`,
        });
    }

    // 4. Number sniper (closest numeric guess)
    const sniperRanked = [...players]
        .filter(p => p.stats && p.stats.bestNumericDiff !== null && p.stats.bestNumericDiff !== undefined)
        .sort((a, b) => a.stats.bestNumericDiff - b.stats.bestNumericDiff);

    if (sniperRanked.length > 0) {
        highlights.push({
            icon: '🎯',
            title: 'Числовой снайпер',
            name: sniperRanked[0].nickname,
            color: sniperRanked[0].color,
            val: `разница ±${sniperRanked[0].stats.bestNumericDiff}`,
        });
    }

    let highlightsHtml = '';
    if (highlights.length > 0) {
        highlightsHtml = `
            <div class="final-highlights-box">
                <div class="final-highlights-title">✨ Номинации битвы</div>
                <div class="final-highlights-grid">
                    ${highlights.map(h => `
                        <div class="highlight-chip">
                            <span class="highlight-icon">${h.icon}</span>
                            <div class="highlight-text">
                                <span class="highlight-label">${h.title}</span>
                                <span class="highlight-player" style="color:${h.color}">${h.name}</span>
                                <span class="highlight-detail">${h.val}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const cardsHtml = players.map((p, i) => {
        const isWinner = i === 0 && !p.eliminated;
        const st = p.stats || {};
        const totalQ = st.totalQuestions || 0;
        const corrQ = st.correctQuestions || 0;
        const accPct = totalQ > 0 ? Math.round((corrQ / totalQ) * 100) : 0;
        const fav = st.favoriteCategory;

        let favHtml = '';
        if (fav && fav.categoryId) {
            const label = CATEGORY_LABELS[fav.categoryId] || fav.categoryId;
            favHtml = `
                <div class="player-favorite-cat">
                    <span class="fav-icon">⭐</span>
                    <span class="fav-title">Любимая категория:</span>
                    <strong class="fav-name">${label}</strong>
                    <span class="fav-stats">(${fav.correct}/${fav.total} • ${fav.pct}%)</span>
                </div>
            `;
        } else {
            favHtml = `
                <div class="player-favorite-cat empty">
                    <span class="fav-icon">⭐</span>
                    <span class="fav-title">Любимая категория:</span>
                    <span class="fav-name-none">— (мало ответов)</span>
                </div>
            `;
        }

        const chips = [];
        chips.push(`<span class="stat-pill">🎯 Точность: <b>${corrQ}/${totalQ}</b> (${accPct}%)</span>`);
        chips.push(`<span class="stat-pill">🗺️ Захвачено: <b>${st.cellsCaptured || 0}</b></span>`);
        chips.push(`<span class="stat-pill">⚔️ Дуэли: <b>${st.duelsWon || 0} / ${st.duelsPlayed || 0}</b></span>`);
        if (st.capitalsTaken > 0) {
            chips.push(`<span class="stat-pill capital">👑 Столиц взято: <b>${st.capitalsTaken}</b></span>`);
        }
        if (st.bestNumericDiff !== null && st.bestNumericDiff !== undefined) {
            chips.push(`<span class="stat-pill sniper">🎯 Снайпер: <b>±${st.bestNumericDiff}</b></span>`);
        }

        return `
            <div class="final-card ${isWinner ? 'winner-card' : ''}" style="border-left-color: ${p.color};">
                <div class="final-card-header">
                    <div class="final-player-info">
                        <span class="final-medal">${medals[i] || (i + 1) + '.'}</span>
                        <span class="final-avatar">${p.capitalEmoji || '👑'}</span>
                        <span class="final-name" style="color: ${p.color}">
                            ${p.nickname}
                            ${p.eliminated ? '<span class="status-badge elim">💀 Выбыл</span>' : (isWinner ? '<span class="status-badge win">🏆 Победитель</span>' : '')}
                        </span>
                    </div>
                    <div class="final-pts" style="color: ${p.color}">
                        ${p.score} <small>очков</small>
                    </div>
                </div>

                ${favHtml}

                <div class="final-stats-pills">
                    ${chips.join('')}
                </div>
            </div>
        `;
    }).join('');

    el.finalScores.innerHTML = highlightsHtml + cardsHtml;
    showScreen('gameover');
});

// Initialize BM bar & chat listeners
initBMBar();
initChat();

console.log('✅ Quiz Battle client loaded');
