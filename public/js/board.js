// ─────────────────────────────────────────────────────
// BOARD.JS — Hex Grid Rendering
// Flat-top axial coordinates, radius 4 → 61 cells
// ─────────────────────────────────────────────────────

const HEX_SIZE   = 36;
const DRAW_SIZE  = Math.round(HEX_SIZE * 0.80); // 80% → visible gap between tiles (Heroes-style)
const HEX_ORIGIN = { x: 440, y: 375 };

let canvas           = null;
let ctx              = null;
let gameCells        = [];
let selectedCell     = null;
let capitalsMap      = {};   // slot (int) → { q, r }
let currentPlayerSlot = null; // whose turn it is

// Shared globals from client.js (declared there, used here):
// currentPlayers  → array of player objects
// myPlayerId      → own socket id

const HEX_DIRS = [
    { q:1,r:0 }, { q:1,r:-1 }, { q:0,r:-1 },
    { q:-1,r:0 }, { q:-1,r:1 }, { q:0,r:1 },
];

// ─── HEX CELL ────────────────────────────────────────

class HexCell {
    constructor(q, r, owner = null) {
        this.q     = q;
        this.r     = r;
        this.owner = owner;
        this.cx    = HEX_ORIGIN.x + HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        this.cy    = HEX_ORIGIN.y + HEX_SIZE * (3 / 2 * r);
    }
    contains(px, py) {
        const dx = px - this.cx, dy = py - this.cy;
        return Math.sqrt(dx*dx + dy*dy) <= HEX_SIZE * 0.88;
    }
}

// ─── FIELD GENERATION ────────────────────────────────

function generateHexField(radius = 4) {
    const cells = [];
    for (let q = -radius; q <= radius; q++) {
        const rMin = Math.max(-radius, -q - radius);
        const rMax = Math.min(radius, -q + radius);
        for (let r = rMin; r <= rMax; r++) {
            cells.push(new HexCell(q, r, null));
        }
    }
    return cells;
}

// ─── DRAWING ─────────────────────────────────────────

function drawHex(cx, cy, size, fill, stroke, lw, dash = []) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i + Math.PI / 6; // +30° → pointy-top (Heroes style)
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawStar(cx, cy, size, color) {
    ctx.font = `bold ${Math.round(size * 0.55)}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', cx, cy);
}

function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ─── AVAILABLE MOVES ─────────────────────────────────

function getAvailableMoves() {
    const moves = new Set();
    const ownCells = gameCells.filter(c => c.owner === currentPlayerSlot);
    ownCells.forEach(cell => {
        HEX_DIRS.forEach(d => moves.add(`${cell.q + d.q},${cell.r + d.r}`));
    });
    ownCells.forEach(cell => moves.delete(`${cell.q},${cell.r}`));
    return moves;
}

// ─── MAIN DRAW ───────────────────────────────────────

function drawBoard() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isMyTurn = (
        currentPlayerSlot !== null &&
        typeof myPlayerId !== 'undefined' && myPlayerId !== null &&
        Array.isArray(currentPlayers) &&
        currentPlayers.some(p => p.slot === currentPlayerSlot && p.id === myPlayerId)
    );

    const availMoves = isMyTurn ? getAvailableMoves() : new Set();

    // ── Draw cells ──
    gameCells.forEach(cell => {
        const key  = `${cell.q},${cell.r}`;
        const isSel   = selectedCell && selectedCell.q === cell.q && selectedCell.r === cell.r;
        const isAvail = availMoves.has(key);

        // Capital detection
        let capSlot = null;
        for (const [s, pos] of Object.entries(capitalsMap)) {
            if (pos.q === cell.q && pos.r === cell.r) { capSlot = parseInt(s); break; }
        }

        // Base colours
        let fill   = '#111827'; // neutral dark
        let stroke = '#1f2b42';
        let lw     = 1;

        if (cell.owner !== null && Array.isArray(currentPlayers)) {
            const owner = currentPlayers.find(p => p.slot === cell.owner);
            if (owner) {
                // Player color with slight transparency
                fill   = owner.color + 'bb';
                stroke = owner.color;
                lw     = 1.5;
            }
        }

        // Capital ring
        if (capSlot !== null) {
            const capPlayer = Array.isArray(currentPlayers) && currentPlayers.find(p => p.slot === capSlot);
            if (capPlayer) {
                stroke = capPlayer.color;
                lw     = 2.5;
                ctx.shadowColor = capPlayer.color + '66';
                ctx.shadowBlur  = 8;
            }
        }

        // Selection glow
        if (isSel) {
            stroke = '#f0c040';
            lw     = 3;
            ctx.shadowColor = 'rgba(240,192,64,0.7)';
            ctx.shadowBlur  = 14;
        } else if (!capSlot) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur  = 0;
        }

        drawHex(cell.cx, cell.cy, DRAW_SIZE, fill, stroke, lw);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;

        // Available move dashed outline
        if (isAvail && !isSel) {
            drawHex(cell.cx, cell.cy, DRAW_SIZE - 1,
                'transparent', 'rgba(74,158,255,0.55)', 1.5, [4, 4]);
        }

        // Capital star
        if (capSlot !== null) {
            const capPlayer = Array.isArray(currentPlayers) && currentPlayers.find(p => p.slot === capSlot);
            const starColor = capPlayer ? capPlayer.color : '#fff';
            drawStar(cell.cx, cell.cy, DRAW_SIZE, starColor);
        }
    });

    // ── Player labels (outside the hex field) ──
    drawPlayerLabels();
}

// Label positions per slot (fixed, based on capital geometry at radius 4)
const LABEL_OFFSETS = [
    { x:  80, y:   0 },    // slot 0: right of rightmost capital
    { x:  60, y: -55 },    // slot 1: top-right
    { x: -60, y: -55 },    // slot 2: top-left
    { x: -80, y:   0 },    // slot 3: left of leftmost capital
    { x: -60, y:  55 },    // slot 4: bottom-left
    { x:  60, y:  55 },    // slot 5: bottom-right
];

function drawPlayerLabels() {
    if (!Array.isArray(currentPlayers)) return;

    currentPlayers.forEach(p => {
        const cap = capitalsMap[p.slot];
        if (!cap) return;
        const capCell = gameCells.find(c => c.q === cap.q && c.r === cap.r);
        if (!capCell) return;

        const off  = LABEL_OFFSETS[p.slot] || { x: 0, y: 0 };
        const lx   = Math.max(90, Math.min(canvas.width - 90, capCell.cx + off.x));
        const ly   = Math.max(18, Math.min(canvas.height - 18, capCell.cy + off.y));

        const income = gameCells.filter(c => c.owner === p.slot).length * 100;
        const label  = p.eliminated
            ? `${p.nickname}: 💀`
            : `${p.nickname}: ${p.score} | +${income}`;

        ctx.font = '11px "Space Grotesk", sans-serif';
        const tw   = ctx.measureText(label).width;
        const pw   = tw + 20;
        const ph   = 24;

        // Background pill
        ctx.fillStyle = p.eliminated
            ? 'rgba(255,77,109,0.25)'
            : 'rgba(0,0,0,0.82)';
        roundRect(lx - pw / 2, ly - ph / 2, pw, ph, 6);
        ctx.fill();

        // Border
        ctx.strokeStyle = p.eliminated ? 'rgba(255,77,109,0.5)' : p.color + '88';
        ctx.lineWidth   = 1;
        ctx.setLineDash([]);
        roundRect(lx - pw / 2, ly - ph / 2, pw, ph, 6);
        ctx.stroke();

        // Text
        ctx.fillStyle     = p.eliminated ? '#ff4d6d' : p.color;
        ctx.textAlign     = 'center';
        ctx.textBaseline  = 'middle';
        ctx.fillText(label, lx, ly);
    });
}

// ─── CLICK HANDLING ──────────────────────────────────

function handleCanvasClick(e) {
    if (!canvas) return;
    const rect  = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;

    for (const cell of gameCells) {
        if (cell.contains(mx, my)) {
            selectedCell = cell;
            drawBoard();
            if (typeof socket !== 'undefined') {
                socket.emit('cell_clicked', { q: cell.q, r: cell.r });
            }
            return;
        }
    }
}

// ─── PUBLIC API ───────────────────────────────────────

function initBoard(boardState, capitals) {
    canvas = document.getElementById('game-canvas');
    if (!canvas) { console.error('No #game-canvas'); return; }
    ctx = canvas.getContext('2d');

    // Fit to container
    canvas.width  = 900;
    canvas.height = 760;

    gameCells = generateHexField(4);

    // Apply server board state (capitals + any existing owned cells)
    if (boardState) {
        for (const [key, slot] of Object.entries(boardState)) {
            if (slot === undefined || slot === null) continue;
            const [q, r] = key.split(',').map(Number);
            const cell = gameCells.find(c => c.q === q && c.r === r);
            if (cell) cell.owner = slot;
        }
    }

    // Store capitals map
    capitalsMap = {};
    if (capitals) {
        for (const [slotStr, key] of Object.entries(capitals)) {
            const [q, r] = key.split(',').map(Number);
            capitalsMap[parseInt(slotStr)] = { q, r };
        }
    }

    drawBoard();
    canvas.addEventListener('click', handleCanvasClick);
    console.log(`Board ready: ${gameCells.length} cells, ${Object.keys(capitalsMap).length} capitals`);
}

function updateCellOwner(q, r, owner) {
    const cell = gameCells.find(c => c.q === q && c.r === r);
    if (cell) { cell.owner = owner; drawBoard(); }
}

function syncBoard(boardState) {
    gameCells.forEach(c => c.owner = null);
    for (const [key, slot] of Object.entries(boardState)) {
        if (slot === undefined || slot === null) continue;
        const [q, r] = key.split(',').map(Number);
        const cell = gameCells.find(c => c.q === q && c.r === r);
        if (cell) cell.owner = slot;
    }
    drawBoard();
}

function clearSelection() {
    selectedCell = null;
    drawBoard();
}

function setCurrentPlayerSlot(slot) {
    currentPlayerSlot = slot;
    drawBoard();
}
