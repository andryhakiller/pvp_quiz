'use strict';
const express = require('express');
const app     = express();
const http    = require('http').createServer(app);
const io      = require('socket.io')(http);
const fs      = require('fs');
const path    = require('path');

app.use(express.static(path.join(__dirname, '../public')));

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_PLAYERS   = 6;
const PLAYER_COLORS = ['#FF595E', '#FFCA3A', '#4CC9F0', '#06D6A0', '#9F7AEA', '#FF8C42'];
const QUESTION_TIMEOUT_MS = 30_000;

const CAPITAL_POSITIONS = [
    { q:  4, r:  0 },
    { q:  4, r: -4 },
    { q:  0, r: -4 },
    { q: -4, r:  0 },
    { q: -4, r:  4 },
    { q:  0, r:  4 },
];

const HEX_DIRS = [
    {q:1,r:0},{q:1,r:-1},{q:0,r:-1},
    {q:-1,r:0},{q:-1,r:1},{q:0,r:1},
];

const DEFAULT_SCORES = {
    CAPTURE:           200,
    HOLD_CELL:         100,
    PVP_WIN:           600,
    PVP_DRAW_ATTACKER: 100,
    PVP_DRAW_DEFENDER: 100,
    WRONG_PENALTY:     100,   // очков снимается за неправильный ответ
};

// ─── QUESTIONS DB ─────────────────────────────────────────────────────────────

let QUESTIONS_RAW = [];
try {
    let qPath = path.join(__dirname, 'questions.json');
    if (!fs.existsSync(qPath) || fs.statSync(qPath).size < 100) {
        const rootPath = path.join(__dirname, '..', 'questions.json');
        if (fs.existsSync(rootPath) && fs.statSync(rootPath).size >= 100) {
            qPath = rootPath;
        }
    }
    const raw = fs.readFileSync(qPath, 'utf8');
    QUESTIONS_RAW = JSON.parse(raw);
    console.log(`✅ Loaded ${QUESTIONS_RAW.length} questions from ${path.basename(qPath)}`);
} catch (e) {
    console.error('❌ Cannot load questions.json:', e.message);
}

// Build category/subcategory index for lobby display
function buildCategoryIndex() {
    const index = {};
    for (const q of QUESTIONS_RAW) {
        if (!index[q.categoryId]) index[q.categoryId] = new Set();
        index[q.categoryId].add(q.subcategoryId);
    }
    // Convert sets to arrays
    const result = {};
    for (const [cat, subs] of Object.entries(index)) {
        result[cat] = [...subs];
    }
    return result;
}
const CATEGORY_INDEX = buildCategoryIndex();
console.log('📚 Categories:', Object.keys(CATEGORY_INDEX).join(', '));

// ─── STATE ────────────────────────────────────────────────────────────────────

let players       = {};
let isGameStarted = false;
let gameSettings  = {
    maxTurns:             15,
    disabledCategories:   [],
    disabledSubcategories:[],
    scores: { ...DEFAULT_SCORES },
};

let gs = {
    turnOrder:      [],
    turnIndex:      0,
    turnNumber:     1,
    board:          {},
    capitals:       {},
    usedIds:        new Set(),
    pendingCapture: null,
    activeDuel:     null,
    questionTimer:  null,  // active setTimeout handle
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const playerList   = () => Object.values(players);
const playerBySlot = s  => Object.values(players).find(p => p.slot === s);
const playerBySock = id => players[id];

function activeSlots() {
    return gs.turnOrder.filter(s => {
        const p = playerBySlot(s);
        return p && !p.eliminated;
    });
}

function currentSlot() {
    const a = activeSlots();
    return a.length ? a[gs.turnIndex % a.length] : null;
}

function isAdjacent(q1, r1, q2, r2) {
    return HEX_DIRS.some(d => q1 + d.q === q2 && r1 + d.r === r2);
}

function canReach(slot, tq, tr) {
    for (const [key, owner] of Object.entries(gs.board)) {
        if (owner === slot) {
            const [q, r] = key.split(',').map(Number);
            if (isAdjacent(q, r, tq, tr)) return true;
        }
    }
    return false;
}

function getEnabledCategories() {
    return Object.keys(CATEGORY_INDEX).filter(c => !gameSettings.disabledCategories.includes(c));
}

/** Returns all enabled subcategoryId strings */
function getEnabledSubcategories() {
    const enabledCats = getEnabledCategories();
    const subs = [];
    for (const catId of enabledCats) {
        for (const subId of (CATEGORY_INDEX[catId] || [])) {
            if (!gameSettings.disabledSubcategories.includes(subId)) {
                subs.push(subId);
            }
        }
    }
    return subs;
}

/**
 * Pick 3 unique subcategories using two-level fair random:
 *   1. Pick a random enabled category (all categories equally likely)
 *   2. Pick a random subcategory from it (all subs within that cat equally likely)
 * Retries up to 60 times to get 3 distinct results.
 */
function get3Subs() {
    const enabledCats = getEnabledCategories().filter(cat =>
        (CATEGORY_INDEX[cat] || []).some(s => !gameSettings.disabledSubcategories.includes(s))
    );
    if (!enabledCats.length) return [];

    const chosen = new Set();
    const result = [];
    let attempts = 0;

    while (result.length < 3 && attempts < 60) {
        attempts++;
        // Step 1: random category (equal weight)
        const cat = enabledCats[Math.floor(Math.random() * enabledCats.length)];
        // Step 2: random subcategory from that category (equal weight within cat)
        const subs = (CATEGORY_INDEX[cat] || []).filter(s => !gameSettings.disabledSubcategories.includes(s));
        if (!subs.length) continue;
        const sub = subs[Math.floor(Math.random() * subs.length)];
        if (!chosen.has(sub)) {
            chosen.add(sub);
            result.push(sub);
        }
    }
    return result;
}

/** Get a question by subcategoryId */
function getQuestion(subcategoryId) {
    const all = QUESTIONS_RAW.filter(q => {
        if (q.subcategoryId !== subcategoryId) return false;
        if (gameSettings.disabledCategories.includes(q.categoryId)) return false;
        return true;
    });

    if (!all.length) return null;

    let pool = all.filter(q => !gs.usedIds.has(q.id));
    if (!pool.length) {
        all.forEach(q => gs.usedIds.delete(q.id));
        pool = [...all];
    }

    const q = pool[Math.floor(Math.random() * pool.length)];
    gs.usedIds.add(q.id);
    return q;
}

function log(msg, type = 'info') {
    io.emit('log_msg', { msg, type });
}

// ─── QUESTION TIMER ───────────────────────────────────────────────────────────

function clearQuestionTimer() {
    if (gs.questionTimer) {
        clearTimeout(gs.questionTimer);
        gs.questionTimer = null;
    }
}

/**
 * Start a 30-second server-side timer.
 * onTimeout: called when timer fires (treat as pass).
 */
function startQuestionTimer(onTimeout) {
    clearQuestionTimer();
    gs.questionTimer = setTimeout(() => {
        gs.questionTimer = null;
        onTimeout();
    }, QUESTION_TIMEOUT_MS);
}

// ─── TURN & GAME FLOW ─────────────────────────────────────────────────────────

function nextTurn() {
    clearQuestionTimer();
    const al = activeSlots();
    if (al.length <= 1) { endGame(); return; }

    gs.turnIndex = (gs.turnIndex + 1) % al.length;
    if (gs.turnIndex === 0) gs.turnNumber++;

    if (gs.turnNumber > gameSettings.maxTurns) { endGame(); return; }

    const slot = al[gs.turnIndex];
    const p    = playerBySlot(slot);

    // Passive income at START of turn
    let income = 0;
    for (const [, owner] of Object.entries(gs.board)) {
        if (owner === slot) income += gameSettings.scores.HOLD_CELL;
    }
    if (income && p) {
        p.score += income;
        io.emit('score_update', { slot, score: p.score, added: income });
    }

    io.emit('turn_change', { slot, turnNumber: gs.turnNumber, maxTurns: gameSettings.maxTurns });
    if (p) log(`Ход: ${p.nickname}`, 'turn');
}

function endGame() {
    isGameStarted = false;
    clearQuestionTimer();
    const sorted = playerList().sort((a, b) => b.score - a.score);
    io.emit('game_over', sorted);
    log('🏆 Игра окончена!', 'end');
}

function eliminatePlayer(slot) {
    const p = playerBySlot(slot);
    if (!p || p.eliminated) return;

    p.eliminated = true;
    p.score      = 0;

    for (const key of Object.keys(gs.board)) {
        if (gs.board[key] === slot) delete gs.board[key];
    }

    gs.turnOrder = gs.turnOrder.filter(s => s !== slot);
    const al = activeSlots().length;
    if (al > 0) gs.turnIndex = gs.turnIndex % al;

    io.emit('player_eliminated', { slot, nickname: p.nickname });
    io.emit('board_full_sync',   { board: gs.board });
    io.emit('score_update',      { slot, score: 0, added: 0 });
    log(`💀 ${p.nickname} потерял столицу — выбывает!`, 'eliminate');
}

// ─── CAPTURE ANSWER RESOLUTION ────────────────────────────────────────────────

function resolveCaptureAnswer(socketId, answerIndex) {
    const pc = gs.pendingCapture;
    if (!pc || pc.socketId !== socketId) return;
    clearQuestionTimer();

    const me        = players[socketId];
    const isPass    = answerIndex === null;
    const isCorrect = !isPass && answerIndex === pc.question.correctIndex;

    io.emit('spectator_answer', {
        playerSlot:   me?.slot,
        chosenIndex:  answerIndex,
        correctIndex: pc.question.correctIndex,
        isCorrect,
        isPass,
    });

    if (isCorrect) {
        const key = `${pc.q},${pc.r}`;
        gs.board[key] = me.slot;
        me.score     += gameSettings.scores.CAPTURE;
        io.emit('board_update', { q: pc.q, r: pc.r, owner: me.slot });
        io.emit('score_update', { slot: me.slot, score: me.score, added: gameSettings.scores.CAPTURE });
        log(`✅ ${me.nickname} захватил клетку! (+${gameSettings.scores.CAPTURE})`, 'success');
    } else if (isPass) {
        log(`⏩ ${me?.nickname} пасует — клетка не захвачена`, 'info');
    } else {
        const penalty = gameSettings.scores.WRONG_PENALTY;
        if (me && penalty > 0) {
            me.score = Math.max(0, me.score - penalty);
            io.emit('score_update', { slot: me.slot, score: me.score, added: -penalty });
        }
        log(`❌ ${me?.nickname} ошибся — штраф ${penalty} очков`, 'fail');
    }

    gs.pendingCapture = null;
    setTimeout(() => nextTurn(), 2500);
}

// ─── DUEL LOGIC ───────────────────────────────────────────────────────────────

function startDuelRound(subcategoryId) {
    const d = gs.activeDuel;
    if (!d) return;

    const q = getQuestion(subcategoryId);
    if (!q) {
        resolveRound(null, null, null, subcategoryId);
        return;
    }

    d.topic        = subcategoryId;
    d.questionData = {
        id:           q.id,
        correctIndex: q.correctIndex,
        question:     q.question,
        options:      q.options,
        image:        q.image || null,
    };
    d.answers = { attacker: null, defender: null };

    // Send correctIndex to both fighters for instant reveal
    const clientQ = { question: q.question, options: q.options, image: q.image || null, correctIndex: q.correctIndex };

    const aSock = io.sockets.sockets.get(d.attackerSockId);
    const dSock = io.sockets.sockets.get(d.defenderSockId);
    if (aSock) aSock.emit('duel_question', { question: clientQ, round: d.round });
    if (dSock) dSock.emit('duel_question', { question: clientQ, round: d.round });

    io.emit('duel_round_started', {
        round:        d.round,
        topic:        subcategoryId,
        attackerSlot: d.attackerSlot,
        defenderSlot: d.defenderSlot,
    });

    // Server-side timeout for duel round
    startQuestionTimer(() => {
        // Auto-pass for anyone who hasn't answered
        const d2 = gs.activeDuel;
        if (!d2 || !d2.questionData) return;
        if (d2.answers.attacker === null) d2.answers.attacker = 'pass';
        if (d2.answers.defender === null) d2.answers.defender = 'pass';
        const aAns = d2.answers.attacker === 'pass' ? null : d2.answers.attacker;
        const dAns = d2.answers.defender === 'pass' ? null : d2.answers.defender;
        resolveRound(aAns, dAns, d2.questionData.correctIndex, d2.topic);
    });
}

function resolveRound(attackerAns, defenderAns, correctIndex, topic) {
    clearQuestionTimer();
    const d = gs.activeDuel;
    if (!d) return;

    let aCorrect = false, dCorrect = false;
    if (correctIndex !== null && correctIndex !== undefined) {
        aCorrect = attackerAns !== null && attackerAns === correctIndex;
        dCorrect = defenderAns !== null && defenderAns === correctIndex;
    }

    // Penalty for wrong answer in duel
    const penalty = gameSettings.scores.WRONG_PENALTY;
    if (attackerAns !== null && !aCorrect) {
        const atk = playerBySlot(d.attackerSlot);
        if (atk && penalty > 0) {
            atk.score = Math.max(0, atk.score - penalty);
            io.emit('score_update', { slot: d.attackerSlot, score: atk.score, added: -penalty });
        }
    }
    if (defenderAns !== null && !dCorrect) {
        const def = playerBySlot(d.defenderSlot);
        if (def && penalty > 0) {
            def.score = Math.max(0, def.score - penalty);
            io.emit('score_update', { slot: d.defenderSlot, score: def.score, added: -penalty });
        }
    }

    if      (aCorrect && !dCorrect) d.attackerWins++;
    else if (dCorrect && !aCorrect) d.defenderWins++;

    io.emit('duel_round_result', {
        round:          d.round,
        attackerSlot:   d.attackerSlot,
        defenderSlot:   d.defenderSlot,
        topic:          topic || d.topic,
        questionText:   d.questionData?.question   || null,
        questionOptions: d.questionData?.options   || null,
        attackerAnswer: attackerAns,
        defenderAnswer: defenderAns,
        correctIndex,
        attackerCorrect: aCorrect,
        defenderCorrect: dCorrect,
        attackerWins:   d.attackerWins,
        defenderWins:   d.defenderWins,
    });

    if (d.attackerWins >= 2 || d.defenderWins >= 2 || d.round >= 3) {
        setTimeout(() => finalizeDuel(), 3000);
        return;
    }

    d.round++;
    const subs3 = get3Subs();

    setTimeout(() => {
        if (!gs.activeDuel) return;

        if (d.round === 2) {
            const dSock = io.sockets.sockets.get(d.defenderSockId);
            if (dSock) dSock.emit('duel_pick_topic', { round: 2, picker: 'defender', categories: subs3 });
            io.emit('duel_next_round', { round: 2, picker: 'defender', attackerWins: d.attackerWins, defenderWins: d.defenderWins });
        } else {
            const rndSub = subs3[Math.floor(Math.random() * subs3.length)];
            io.emit('duel_next_round', { round: 3, picker: 'random', topic: rndSub, attackerWins: d.attackerWins, defenderWins: d.defenderWins });
            startDuelRound(rndSub);
        }
    }, 3000);
}

function finalizeDuel() {
    const d = gs.activeDuel;
    if (!d) return;
    clearQuestionTimer();

    const aWon = d.attackerWins > d.defenderWins;
    const tie  = d.attackerWins === d.defenderWins;

    const attacker = playerBySlot(d.attackerSlot);
    const defender = playerBySlot(d.defenderSlot);
    const key      = `${d.targetQ},${d.targetR}`;
    const isCapital = gs.capitals[d.defenderSlot] === key;

    if (aWon) {
        gs.board[key] = d.attackerSlot;
        if (attacker) {
            attacker.score += gameSettings.scores.PVP_WIN;
            io.emit('score_update', { slot: d.attackerSlot, score: attacker.score, added: gameSettings.scores.PVP_WIN });
        }
        io.emit('board_update', { q: d.targetQ, r: d.targetR, owner: d.attackerSlot });
        log(`⚔️ ${attacker?.nickname || '?'} победил в дуэли и захватил клетку!`, 'duel');
        if (isCapital) {
            setTimeout(() => eliminatePlayer(d.defenderSlot), 600);
        }
    } else if (tie) {
        if (attacker) {
            attacker.score += gameSettings.scores.PVP_DRAW_ATTACKER;
            io.emit('score_update', { slot: d.attackerSlot, score: attacker.score, added: gameSettings.scores.PVP_DRAW_ATTACKER });
        }
        if (defender) {
            defender.score += gameSettings.scores.PVP_DRAW_DEFENDER;
            io.emit('score_update', { slot: d.defenderSlot, score: defender.score, added: gameSettings.scores.PVP_DRAW_DEFENDER });
        }
        log(`🤝 Ничья — клетка остаётся у ${defender?.nickname || '?'}`, 'info');
    } else {
        if (defender) {
            defender.score += gameSettings.scores.PVP_WIN;
            io.emit('score_update', { slot: d.defenderSlot, score: defender.score, added: gameSettings.scores.PVP_WIN });
        }
        log(`🛡️ ${defender?.nickname || '?'} отстоял клетку!`, 'info');
    }

    io.emit('duel_ended', {
        attackerSlot:  d.attackerSlot,
        defenderSlot:  d.defenderSlot,
        attackerName:  attacker?.nickname || '?',
        defenderName:  defender?.nickname || '?',
        attackerWins:  d.attackerWins,
        defenderWins:  d.defenderWins,
        winner:        aWon ? 'attacker' : tie ? 'tie' : 'defender',
    });

    gs.activeDuel = null;
    setTimeout(() => nextTurn(), 2500);
}

// ─── SOCKET HANDLERS ──────────────────────────────────────────────────────────

io.on('connection', socket => {

    // ── JOIN ──
    socket.on('join_game', nickname => {
        if (isGameStarted)                            return socket.emit('error_msg', 'Игра уже идёт!');
        if (Object.keys(players).length >= MAX_PLAYERS) return socket.emit('error_msg', 'Нет свободных мест!');

        const takenSlots = Object.values(players).map(p => p.slot);
        let slot = 0;
        while (takenSlots.includes(slot)) slot++;

        players[socket.id] = {
            id:         socket.id,
            nickname:   (nickname || '').trim() || `Игрок ${slot + 1}`,
            slot,
            color:      PLAYER_COLORS[slot],
            score:      0,
            isAdmin:    Object.keys(players).length === 0,
            eliminated: false,
        };

        io.emit('update_player_list', playerList());
        socket.emit('joined_successfully', players[socket.id]);
        socket.emit('settings_updated', gameSettings);
        socket.emit('category_index', CATEGORY_INDEX);
    });

    // ── SETTINGS ──
    socket.on('update_settings', s => {
        if (!players[socket.id]?.isAdmin) return;
        if (s.maxTurns !== undefined)               gameSettings.maxTurns               = s.maxTurns;
        if (s.disabledCategories !== undefined)     gameSettings.disabledCategories     = s.disabledCategories;
        if (s.disabledSubcategories !== undefined)  gameSettings.disabledSubcategories  = s.disabledSubcategories;
        if (s.scores)                               gameSettings.scores = { ...gameSettings.scores, ...s.scores };
        io.emit('settings_updated', gameSettings);
    });

    // ── START ──
    socket.on('start_game', () => {
        const me = players[socket.id];
        if (!me?.isAdmin) return;
        if (Object.keys(players).length < 2) return socket.emit('error_msg', 'Нужно минимум 2 игрока!');

        isGameStarted       = true;
        gs.board            = {};
        gs.capitals         = {};
        gs.usedIds          = new Set();
        gs.turnIndex        = 0;
        gs.turnNumber       = 1;
        gs.activeDuel       = null;
        gs.pendingCapture   = null;
        clearQuestionTimer();

        const sorted = playerList().sort((a, b) => a.slot - b.slot);
        sorted.forEach(p => { p.score = 0; p.eliminated = false; });
        gs.turnOrder = sorted.map(p => p.slot);

        sorted.forEach(p => {
            const cap = CAPITAL_POSITIONS[p.slot];
            const key = `${cap.q},${cap.r}`;
            gs.board[key]       = p.slot;
            gs.capitals[p.slot] = key;
        });

        io.emit('game_started', {
            turn:     gs.turnOrder[0],
            players:  sorted,
            settings: gameSettings,
            board:    gs.board,
            capitals: gs.capitals,
        });

        log('🔥 Битва началась!', 'start');
        const first = playerBySlot(gs.turnOrder[0]);
        if (first) log(`Ход: ${first.nickname}`, 'turn');
    });

    // ── CELL CLICK ──
    socket.on('cell_clicked', ({ q, r }) => {
        const me = players[socket.id];
        if (!me || me.eliminated)    return;
        if (me.slot !== currentSlot()) return socket.emit('error_msg', 'Не твой ход!');
        if (gs.activeDuel)           return socket.emit('error_msg', 'Идёт дуэль!');
        if (gs.pendingCapture)       return socket.emit('error_msg', 'Дождись результата вопроса!');

        if (!canReach(me.slot, q, r)) return socket.emit('error_msg', 'Клетка не граничит с твоей территорией!');

        const key   = `${q},${r}`;
        const owner = gs.board[key];

        if (owner === me.slot) return socket.emit('error_msg', 'Это твоя клетка!');

        const subs = get3Subs();

        if (owner === undefined || owner === null) {
            gs.pendingCapture = { socketId: socket.id, q, r, question: null };
            socket.emit('show_topic_selection', { type: 'capture', q, r, categories: subs });
        } else {
            const defender = playerBySlot(owner);
            if (!defender || defender.eliminated) {
                gs.board[key] = undefined;
                gs.pendingCapture = { socketId: socket.id, q, r, question: null };
                socket.emit('show_topic_selection', { type: 'capture', q, r, categories: subs });
                return;
            }

            gs.activeDuel = {
                attackerSockId: socket.id,
                attackerSlot:   me.slot,
                defenderSockId: defender.id,
                defenderSlot:   owner,
                targetQ: q, targetR: r,
                round:        1,
                attackerWins: 0,
                defenderWins: 0,
                topic:        null,
                questionData: null,
                answers:      { attacker: null, defender: null },
            };

            io.emit('duel_started', {
                attackerSlot: me.slot,
                attackerName: me.nickname,
                defenderSlot: owner,
                defenderName: defender.nickname,
                targetQ: q, targetR: r,
            });
            log(`⚔️ ${me.nickname} атакует ${defender.nickname}!`, 'duel');
            socket.emit('duel_pick_topic', { round: 1, picker: 'attacker', categories: subs });
        }
    });

    // ── CAPTURE: topic selected ──
    socket.on('topic_selected', ({ topic, q, r }) => {
        const pc = gs.pendingCapture;
        if (!pc || pc.socketId !== socket.id) return;
        const me = players[socket.id];
        if (!me) return;

        const qObj = getQuestion(topic);
        if (!qObj) {
            socket.emit('error_msg', `В подтеме «${topic}» вопросы закончились. Выбери другую!`);
            socket.emit('show_topic_selection', { type: 'capture', q: pc.q, r: pc.r, categories: get3Subs() });
            return;
        }

        pc.question = { id: qObj.id, correctIndex: qObj.correctIndex };
        // Send correctIndex only to the answering player (for instant client-side reveal)
        const cq = { question: qObj.question, options: qObj.options, image: qObj.image || null, correctIndex: qObj.correctIndex };
        const spectatorQ = { question: qObj.question, options: qObj.options, image: qObj.image || null };

        socket.emit('ask_question', { question: cq, context: { type: 'capture', q, r } });

        socket.broadcast.emit('spectator_question', {
            playerSlot: me.slot,
            playerName: me.nickname,
            question:   spectatorQ,
        });

        // Start 30-second timer → auto-pass
        startQuestionTimer(() => {
            log(`⏱️ ${me.nickname} — время вышло, автоматический Пас`, 'info');
            io.emit('question_timeout', { playerSlot: me.slot });
            resolveCaptureAnswer(socket.id, null);
        });
    });

    // ── CAPTURE: answer ──
    socket.on('submit_answer', ({ answerIndex }) => {
        resolveCaptureAnswer(socket.id, answerIndex);
    });

    // ── CAPTURE: pass ──
    socket.on('pass_question', () => {
        resolveCaptureAnswer(socket.id, null);
    });

    // ── DUEL: topic chosen ──
    socket.on('duel_topic_selected', ({ topic }) => {
        const d = gs.activeDuel;
        if (!d) return;
        const isA = socket.id === d.attackerSockId;
        const isD = socket.id === d.defenderSockId;
        if (d.round === 1 && !isA) return;
        if (d.round === 2 && !isD) return;
        startDuelRound(topic);  // topic is now a subcategoryId
    });

    // ── DUEL: answer ──
    socket.on('duel_answer', ({ answerIndex }) => {
        const d = gs.activeDuel;
        if (!d || !d.questionData) return;

        const isA = socket.id === d.attackerSockId;
        const isD = socket.id === d.defenderSockId;
        if (!isA && !isD) return;

        if (isA && d.answers.attacker === null) d.answers.attacker = answerIndex;
        if (isD && d.answers.defender === null) d.answers.defender = answerIndex;

        if (d.answers.attacker !== null && d.answers.defender !== null) {
            const aAns = d.answers.attacker === 'pass' ? null : d.answers.attacker;
            const dAns = d.answers.defender === 'pass' ? null : d.answers.defender;
            resolveRound(aAns, dAns, d.questionData.correctIndex, d.topic);
        } else {
            socket.emit('duel_waiting_opponent');
        }
    });

    // ── DUEL: pass ──
    socket.on('duel_pass', () => {
        const d = gs.activeDuel;
        if (!d || !d.questionData) return;

        const isA = socket.id === d.attackerSockId;
        const isD = socket.id === d.defenderSockId;
        if (!isA && !isD) return;

        if (isA && d.answers.attacker === null) d.answers.attacker = 'pass';
        if (isD && d.answers.defender === null) d.answers.defender = 'pass';

        if (d.answers.attacker !== null && d.answers.defender !== null) {
            const aAns = d.answers.attacker === 'pass' ? null : d.answers.attacker;
            const dAns = d.answers.defender === 'pass' ? null : d.answers.defender;
            resolveRound(aAns, dAns, d.questionData.correctIndex, d.topic);
        } else {
            socket.emit('duel_waiting_opponent');
        }
    });

    // ── DISCONNECT ──
    socket.on('disconnect', () => {
        const me = players[socket.id];
        if (!me) return;
        delete players[socket.id];

        if (isGameStarted) {
            if (gs.activeDuel) {
                const d = gs.activeDuel;
                if (socket.id === d.attackerSockId || socket.id === d.defenderSockId) {
                    clearQuestionTimer();
                    gs.activeDuel = null;
                    io.emit('duel_ended', { winner: 'disconnect' });
                    nextTurn();
                }
            }
            if (gs.pendingCapture?.socketId === socket.id) {
                clearQuestionTimer();
                gs.pendingCapture = null;
                nextTurn();
            }
        } else {
            io.emit('update_player_list', playerList());
        }

        log(`${me.nickname} вышел из игры`, 'info');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`✅ Quiz Battle → http://localhost:${PORT}`));
