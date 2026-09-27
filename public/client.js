const socket = io();
let myPlayer = null;
let currentPlayers = [];
let gameBoard = []; // Храним клетки для перерисовки

// === DOM ELEMENTS ===
const screens = {
    login: document.getElementById('login-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};
const modal = document.getElementById('quiz-modal');

// === LOBBY LOGIC ===
document.getElementById('join-btn').onclick = () => {
    socket.emit('join_game', document.getElementById('nickname').value);
};

document.getElementById('start-btn').onclick = () => socket.emit('start_game');

// Checkbox logic for settings
window.toggleTopic = (name) => { /* logic to emit update_settings */ };

// === SOCKET EVENTS ===
socket.on('joined_successfully', (p) => {
    myPlayer = p;
    screens.login.classList.add('hidden');
    screens.lobby.classList.remove('hidden');
});

socket.on('update_player_list', (list) => {
    currentPlayers = list;
    const listEl = document.getElementById('players-list');
    listEl.innerHTML = list.map(p => 
        `<li style="border-color:${p.color}">${p.nickname} [${p.score}] ${p.isAdmin?'👑':''}</li>`
    ).join('');
    
    if(myPlayer && list.find(p => p.id === myPlayer.id).isAdmin) {
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('lobby-settings').classList.remove('hidden');
    }
});

socket.on('game_started', ({turn}) => {
    screens.lobby.classList.add('hidden');
    screens.game.classList.remove('hidden');
    initBoard(); // Из board.js
    updateTurnUI(turn);
});

socket.on('show_topic_selection', ({categories, type, q, r, targetOwner}) => {
    modal.classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = `
        <h3>Выбери тему</h3>
        ${categories.map(c => 
            `<button onclick="socket.emit('topic_selected', {topic:'${c}', type:'${type}', q:${q}, r:${r}, targetOwner:${targetOwner}})">${c}</button>`
        ).join('')}
    `;
});

socket.on('ask_question', ({question}) => {
    document.getElementById('modal-content').innerHTML = `
        <h3>${question.question}</h3>
        ${question.image ? `<img src="${question.image}">` : ''}
        ${question.options.map((o, i) => 
            `<button onclick="socket.emit('submit_answer', {answerIndex:${i}}); modal.classList.add('hidden');">${o}</button>`
        ).join('')}
    `;
});

socket.on('spectator_question', ({playerSlot, question}) => {
    // Показать плашку спектатора (код из прошлого ответа)
});

socket.on('board_update', ({q, r, owner}) => {
    // Обновить клетку и перерисовать
    const cell = gameBoard.find(c => c.q === q && c.r === r);
    if(cell) cell.owner = owner;
    drawBoard();
});
