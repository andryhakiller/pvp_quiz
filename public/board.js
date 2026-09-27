// ============================================
// PENTAGON QUIZ BATTLE - BOARD.JS
// Гексагональная сетка в форме пентагона
// ============================================

// === КОНСТАНТЫ ===
const HEX_SIZE = 30;           // Радиус гексагона (пиксели)
const HEX_ORIGIN = {x: 400, y: 400}; // Центр поля на Canvas
const HEX_WIDTH = HEX_SIZE * Math.sqrt(3);
const HEX_HEIGHT = HEX_SIZE * 2;

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let canvas = null;
let ctx = null;
let gameCells = [];
let selectedCell = null; // Для подсвечивания хода
let currentPlayers = [];

// ============================================
// КЛАСС ГЕКСАГОНАЛЬНОЙ КЛЕТКИ
// ============================================
class HexCell {
    constructor(q, r, owner = null) {
        this.q = q;        // Axial координата Q
        this.r = r;        // Axial координата R
        this.owner = owner; // null или slotId (0-4)
        this.pixels = this.axialToPixel(q, r);
    }

    /**
     * Конвертация Axial координат (q, r) в пиксели Canvas
     * Формула для flat-top гексагонов:
     * x = size * (√3 * q + √3/2 * r)
     * y = size * (3/2 * r)
     */
    axialToPixel(q, r) {
        const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = HEX_SIZE * (3 / 2 * r);
        
        return {
            x: HEX_ORIGIN.x + x,
            y: HEX_ORIGIN.y + y
        };
    }

    /**
     * Проверка, находится ли точка внутри гексагона
     * Используется для обработки кликов
     */
    containsPoint(px, py) {
        const dx = px - this.pixels.x;
        const dy = py - this.pixels.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Приблизительная проверка через окружность
        return distance < HEX_SIZE * 0.85;
    }

    /**
     * Получение 6 соседних гексов в Axial координатах
     */
    getNeighbors() {
        const directions = [
            {q: 1, r: 0},
            {q: 1, r: -1},
            {q: 0, r: -1},
            {q: -1, r: 0},
            {q: -1, r: 1},
            {q: 0, r: 1}
        ];
        
        return directions.map(d => ({
            q: this.q + d.q,
            r: this.r + d.r
        }));
    }

    /**
     * Проверка, является ли эта клетка соседом другой клетки
     */
    isNeighbor(otherQ, otherR) {
        const neighbors = this.getNeighbors();
        return neighbors.some(n => n.q === otherQ && n.r === otherR);
    }
}

// ============================================
// ГЕНЕРАЦИЯ ПОЛЯ
// ============================================

/**
 * Генерирует пентагональное поле с 5 лучами
 * Структура:
 * - Центр (0,0)
 * - 5 лучей по 4 клетки каждый (расстояние между игроками = 4)
 * - Заполняющие кольца между лучами
 * - Итого: ~45 клеток
 */
function generatePentagonField() {
    const cells = [];

    // === 1. ЦЕНТРАЛЬНАЯ КЛЕТКА ===
    cells.push(new HexCell(0, 0, null));

    // === 2. ПЯТЬ ЛУЧЕЙ (Стартовые позиции) ===
    // 6 возможных направлений в гексагональной сетке
    const directions = [
        {q: 1, r: 0},       // Восток
        {q: 1, r: -1},      // Северо-восток
        {q: 0, r: -1},      // Северо-запад
        {q: -1, r: 0},      // Запад
        {q: -1, r: 1},      // Юго-запад
        {q: 0, r: 1}        // Юго-восток
    ];

    // Для пентагона выбираем 5 направлений (индексы 0, 1, 2, 4, 5)
    // Пропускаем 3 (противоположное 0), чтобы получить правильный пентагон
    const pentagonDirs = [0, 1, 2, 4, 5];

    pentagonDirs.forEach((dirIndex, playerSlot) => {
        const dir = directions[dirIndex];

        // Создаем луч из 4 клеток
        for (let dist = 1; dist <= 4; dist++) {
            const q = dir.q * dist;
            const r = dir.r * dist;

            // Первая клетка (dist=1) — это база/столица игрока
            const isBase = (dist === 1);
            const owner = isBase ? playerSlot : null;

            cells.push(new HexCell(q, r, owner));
        }
    });

    // === 3. ПЕРВОЕ КОЛЬЦО (radius = 1 от центра) ===
    const ring1Coords = [
        {q: 1, r: 0},
        {q: 1, r: -1},
        {q: 0, r: -1},
        {q: -1, r: 0},
        {q: -1, r: 1},
        {q: 0, r: 1}
    ];

    ring1Coords.forEach(coord => {
        const exists = cells.some(c => c.q === coord.q && c.r === coord.r);
        if (!exists) {
            cells.push(new HexCell(coord.q, coord.r, null));
        }
    });

    // === 4. ВТОРОЕ КОЛЬЦО (radius = 2 от центра) ===
    const ring2Coords = [
        {q: 2, r: 0},
        {q: 2, r: -1},
        {q: 2, r: -2},
        {q: 1, r: -2},
        {q: 0, r: -2},
        {q: -1, r: -1},
        {q: -2, r: 0},
        {q: -2, r: 1},
        {q: -2, r: 2},
        {q: -1, r: 2},
        {q: 0, r: 2},
        {q: 1, r: 1}
    ];

    ring2Coords.forEach(coord => {
        const exists = cells.some(c => c.q === coord.q && c.r === coord.r);
        if (!exists) {
            cells.push(new HexCell(coord.q, coord.r, null));
        }
    });

    // === 5. ТРЕТЬЕ КОЛЬЦО (radius = 3, частичное для пентагона) ===
    const ring3Coords = [
        {q: 3, r: -2},
        {q: 2, r: -3},
        {q: 1, r: -3},
        {q: 0, r: -3},
        {q: -2, r: -1},
        {q: -3, r: 1},
        {q: -3, r: 2},
        {q: -2, r: 3},
        {q: -1, r: 3},
        {q: 0, r: 3},
        {q: 2, r: 1},
        {q: 3, r: 0}
    ];

    ring3Coords.forEach(coord => {
        const exists = cells.some(c => c.q === coord.q && c.r === coord.r);
        // Фильтруем, оставляя только те, что в форме пентагона
        if (!exists) {
            cells.push(new HexCell(coord.q, coord.r, null));
        }
    });

    return cells;
}

// ============================================
// ОТРИСОВКА
// ============================================

/**
 * Рисует один гексагон на Canvas
 * @param {CanvasRenderingContext2D} ctx - Контекст Canvas
 * @param {number} x - X координата центра
 * @param {number} y - Y координата центра
 * @param {number} size - Радиус гексагона
 * @param {string} fillColor - Цвет заполнения
 * @param {string} strokeColor - Цвет обводки
 * @param {number} lineWidth - Толщина обводки
 */
function drawHexagon(ctx, x, y, size, fillColor, strokeColor = '#2b2d42', lineWidth = 2) {
    ctx.beginPath();

    // Рисуем 6 углов гексагона (flat-top)
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i; // 60 градусов между углами
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(hx, hy);
        } else {
            ctx.lineTo(hx, hy);
        }
    }

    ctx.closePath();

    // Заполнение
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Обводка
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

/**
 * Отрисовка всего поля и всех гексагонов
 */
function drawBoard() {
    if (!ctx) return;

    // Очистка Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем каждый гексагон
    gameCells.forEach(cell => {
        let color = '#edf2f4'; // Нейтральная (светло-серая)
        let strokeColor = '#2b2d42';
        let lineWidth = 2;

        // Если клетка принадлежит игроку
        if (cell.owner !== null) {
            const owner = currentPlayers.find(p => p.slot === cell.owner);
            if (owner) {
                color = owner.color;
                lineWidth = 3;
            }
        }

        // Если это центр (столица)
        if (cell.q === 0 && cell.r === 0) {
            color = '#DDCDFF'; // Лавандовый для центра
            lineWidth = 4;
            strokeColor = '#6A4C93';
        }

        // Если это выбранная клетка (подсвечивание)
        if (selectedCell && selectedCell.q === cell.q && selectedCell.r === cell.r) {
            lineWidth = 4;
            strokeColor = '#FFD8BE';
            ctx.shadowColor = 'rgba(255, 216, 190, 0.6)';
            ctx.shadowBlur = 15;
        } else {
            ctx.shadowColor = 'transparent';
        }

        drawHexagon(ctx, cell.pixels.x, cell.pixels.y, HEX_SIZE, color, strokeColor, lineWidth);

        // Отрисовка координат для отладки (опционально)
        ctx.fillStyle = '#2b2d42';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${cell.q},${cell.r}`, cell.pixels.x, cell.pixels.y);

        ctx.shadowColor = 'transparent';
    });
}

/**
 * Отрисовка индикатора хода (подсветка соседних клеток)
 */
function drawMovePossibilities(playerSlot) {
    if (!ctx) return;

    // Находим все клетки игрока
    const playerHexes = gameCells.filter(c => c.owner === playerSlot);

    // Для каждой клетки получаем соседей
    const possibleMoves = new Set();
    playerHexes.forEach(hex => {
        const neighbors = hex.getNeighbors();
        neighbors.forEach(n => possibleMoves.add(`${n.q},${n.r}`));
    });

    // Подсвечиваем возможные ходы полупрозрачной окружностью
    gameCells.forEach(cell => {
        const key = `${cell.q},${cell.r}`;
        if (possibleMoves.has(key) && cell.owner !== playerSlot) {
            ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
            ctx.beginPath();
            ctx.arc(cell.pixels.x, cell.pixels.y, HEX_SIZE, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// ============================================
// ОБРАБОТКА КЛИКОВ
// ============================================

/**
 * Обработка клика по Canvas
 * Находит клетку под курсором и отправляет на сервер
 */
function handleCanvasClick(e) {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Ищем клетку под курсором
    for (let cell of gameCells) {
        if (cell.containsPoint(mouseX, mouseY)) {
            selectedCell = cell;
            drawBoard();

            console.log(`Clicked cell: (${cell.q}, ${cell.r}), Owner: ${cell.owner}`);

            // Отправляем координаты на сервер
            socket.emit('cell_clicked', {q: cell.q, r: cell.r});
            return;
        }
    }
}

// ============================================
// ОБНОВЛЕНИЕ СОСТОЯНИЯ
// ============================================

/**
 * Обновление владельца клетки после успешного захвата
 */
function updateCellOwner(q, r, newOwner) {
    const cell = gameCells.find(c => c.q === q && c.r === r);
    if (cell) {
        cell.owner = newOwner;
        drawBoard();
        console.log(`Cell (${q}, ${r}) now owned by player ${newOwner}`);
    }
}

/**
 * Обновление списка игроков (для получения цветов)
 */
function updatePlayers(players) {
    currentPlayers = players;
    drawBoard();
}

/**
 * Очистка выделения клетки
 */
function clearSelection() {
    selectedCell = null;
    drawBoard();
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

/**
 * Инициализация Canvas и запуск игрового поля
 * Вызывается при старте игры
 */
function initBoard() {
    // Получаем Canvas элемент
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    ctx = canvas.getContext('2d');

    // Устанавливаем размеры Canvas
    canvas.width = 800;
    canvas.height = 800;

    // Генерируем поле
    gameCells = generatePentagonField();
    console.log(`Generated ${gameCells.length} hexagonal cells`);

    // Первоначальная отрисовка
    drawBoard();

    // Подписываемся на клики
    canvas.addEventListener('click', handleCanvasClick);

    console.log('Board initialized successfully');
}

/**
 * Проверка, может ли игрок атаковать клетку
 * (она должна быть соседской к одной из его клеток)
 */
function canAttackCell(playerSlot, targetQ, targetR) {
    const playerCells = gameCells.filter(c => c.owner === playerSlot);

    return playerCells.some(hex => {
        return hex.isNeighbor(targetQ, targetR);
    });
}

/**
 * Получение расстояния между двумя клетками в гексах
 * (для возможных бонусов за дальние захваты)
 */
function getHexDistance(q1, r1, q2, r2) {
    // В Axial координатах расстояние = (|q1-q2| + |r1-r2| + |q1+r1-q2-r2|) / 2
    return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs((q1 + r1) - (q2 + r2))) / 2;
}

/**
 * Проверка, является ли клетка столицей (базой) игрока
 */
function isCapitalCell(q, r) {
    const cell = gameCells.find(c => c.q === q && c.r === r);
    if (!cell) return false;

    // Проверяем, является ли это первой клеткой луча (дистанция 1 от центра в направлении луча)
    // Все базы имеют ровно одного соседа в направлении центра
    const neighbors = cell.getNeighbors();
    const centerNeighbor = neighbors.find(n => {
        const dist = getHexDistance(n.q, n.r, 0, 0);
        return dist === 0; // Это центр
    });

    return centerNeighbor !== undefined && cell.owner !== null;
}

/**
 * Получение типа клетки (для отображения и расчета очков)
 */
function getCellType(q, r) {
    if (q === 0 && r === 0) return 'center'; // Центр
    if (isCapitalCell(q, r)) return 'capital'; // Столица игрока
    return 'neutral'; // Нейтральная
}

// ============================================
// SOCKET.IO СОБЫТИЯ
// ============================================

// Обновление доски при захвате клетки
socket?.on('board_update', ({q, r, owner}) => {
    updateCellOwner(q, r, owner);
});

// Обновление списка игроков (для синхронизации цветов)
socket?.on('update_player_list', (players) => {
    updatePlayers(players);
});

// Очистка выделения при смене хода
socket?.on('turn_change', ({slot}) => {
    clearSelection();
    drawBoard();
});

// Вызов инициализации при старте игры
socket?.on('game_started', () => {
    setTimeout(() => initBoard(), 100); // Небольшая задержка для инициализации
});
