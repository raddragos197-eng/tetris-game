const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
ctx.scale(30, 30);

// ========== MATRIX UTILS ==========
function createMatrix(w, h) {
    return Array.from({ length: h }, () => Array(w).fill(0));
}

function rotateMatrix(matrix) {
    const m = matrix.map(row => [...row]);
    for (let y = 0; y < m.length; y++) {
        for (let x = y; x < m[y].length; x++) {
            [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
    }
    m.forEach(row => row.reverse());
    return m;
}

// ========== PIECES ==========
function createPiece(type) {
    const pieces = {
        T: [[0,1,0],[1,1,1],[0,0,0]],
        O: [[2,2],[2,2]],
        L: [[0,3,0],[0,3,0],[0,3,3]],
        J: [[0,4,0],[0,4,0],[4,4,0]],
        I: [[5,5,5,5]],
        S: [[0,6,6],[6,6,0],[0,0,0]],
        Z: [[7,7,0],[0,7,7],[0,0,0]]
    };
    return pieces[type];
}

const colors = [
    null,
    "#FF0D72",
    "#0DC2FF",
    "#0DFF72",
    "#F538FF",
    "#FF8E0D",
    "#FFE138",
    "#3877FF",
];

// ========== GAME STATE ==========
const arena = createMatrix(10, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null
};

// ========== COLLISION DETECTION ==========
function collide(arena, player) {
    const { matrix, pos } = player;

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (
                matrix[y][x] !== 0 &&
                (arena[y + pos.y] && arena[y + pos.y][x + pos.x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

// ========== MERGE ==========
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// ========== PLAYER ACTIONS ==========
function playerReset() {
    const pieces = "TJLOSZI";
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    player.matrix = createPiece(piece);

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        alert("GAME OVER");
        arena.forEach(row => row.fill(0));
    }
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
    }
    dropCounter = 0;
}

function playerRotate() {
    const original = player.matrix;
    const rotated = rotateMatrix(player.matrix);

    player.matrix = rotated;

    // Dacă intră în perete -> revine
    if (collide(arena, player)) {
        player.matrix = original;
    }
}

// ========== DRAW ==========
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) =>
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        })
    );
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// ========== LOOP ==========
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;

    dropCounter += delta;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// ========== CONTROLS ==========
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
        playerMove(-1);
    }
    if (e.key === "ArrowRight") {
        playerMove(1);
    }
    if (e.key === "ArrowDown") {
        playerDrop();
    }
    if (e.code === "Space") {
        playerRotate();
    }
});

// Start
playerReset();
update();
