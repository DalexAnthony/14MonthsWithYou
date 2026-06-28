/* ============================================================
   RENDER.JS — Canvas Rendering Engine
   ============================================================
   Everything drawn on the canvas: grid background, Maltipoo dog
    with fluffy fur trail, taco/bone food with spawn animation,
   dog head with directional features, visual effects.
   ============================================================ */

/* ============================================================
   MUSIC TABLE SPRITES — Animated BTS Record Table (mesa1 & mesa2)
   Uses offscreen canvases to normalize both frames to the exact
   same pixel size, preventing any size flickering.
   ============================================================ */
const btsMesa1Raw = new Image();
const btsMesa2Raw = new Image();
let btsMesaNormalized = [null, null]; // Two offscreen canvases, same size
let btsMesaReady = false;

function normalizeBtsMesa() {
    if (!btsMesa1Raw.complete || btsMesa1Raw.naturalWidth === 0) return;
    if (!btsMesa2Raw.complete || btsMesa2Raw.naturalWidth === 0) return;

    // Use mesa1 dimensions as the standard size for both
    const w = btsMesa1Raw.naturalWidth;
    const h = btsMesa1Raw.naturalHeight;

    const c1 = document.createElement('canvas');
    c1.width = w; c1.height = h;
    c1.getContext('2d').drawImage(btsMesa1Raw, 0, 0, w, h);

    const c2 = document.createElement('canvas');
    c2.width = w; c2.height = h;
    c2.getContext('2d').drawImage(btsMesa2Raw, 0, 0, w, h);

    btsMesaNormalized = [c1, c2];
    btsMesaReady = true;
}

btsMesa1Raw.onload = () => {
    normalizeBtsMesa();
    if (typeof canvas !== 'undefined' && canvas) renderFrame();
};
btsMesa2Raw.onload = () => {
    normalizeBtsMesa();
    if (typeof canvas !== 'undefined' && canvas) renderFrame();
};
btsMesa1Raw.src = 'assets/bts mesa/mesa1.png';
btsMesa2Raw.src = 'assets/bts mesa/mesa2.png';

const cespedImg = new Image();
cespedImg.onload = () => {
    if (typeof canvas !== 'undefined' && canvas) renderFrame();
};
cespedImg.src = 'assets/sprites/cesped.png';

const dogHouseImg = new Image();
dogHouseImg.onload = () => {
    if (typeof canvas !== 'undefined' && canvas && (typeof gameRunning !== 'undefined' && gameRunning || typeof snake !== 'undefined' && snake.length > 0)) {
        renderFrame();
    }
};
dogHouseImg.src = 'assets/sprites/house.png';

function loadImg(src) {
    const img = new Image();
    img.onload = () => {
        if (typeof canvas !== 'undefined' && canvas && (typeof gameRunning !== 'undefined' && gameRunning || typeof snake !== 'undefined' && snake.length > 0)) {
            renderFrame();
        }
    };
    img.src = src;
    return img;
}

const dogPhase = {
    1: {
        standing: loadImg('assets/recortes perros fase 1/standing1.png'),
        right1: loadImg('assets/recortes perros fase 1/rigth1.png'),
        right2: loadImg('assets/recortes perros fase 1/right2.png'),
        left1: loadImg('assets/recortes perros fase 1/left1.png'),
        left2: loadImg('assets/recortes perros fase 1/left2.png'),
    },
    2: {
        standing: loadImg('assets/perro fase 2/standingfase2.png'),
        right1: loadImg('assets/perro fase 2/right1fase2.png'),
        right2: loadImg('assets/perro fase 2/right2fase2.png'),
        left1: loadImg('assets/perro fase 2/left1fase2.png'),
        left2: loadImg('assets/perro fase 2/left2fase2.png'),
    },
    3: {
        standing: loadImg('assets/perro fase 3/standingfase3.png'),
        right1: loadImg('assets/perro fase 3/right1fase3.png'),
        right2: loadImg('assets/perro fase 3/right2fase3.png'),
        left1: loadImg('assets/perro fase 3/left1fase3.png'),
        left2: loadImg('assets/perro fase 3/left2fase3.png'),
    },
    4: {
        standing: loadImg('assets/perro fase 4/standingfase4.png'),
        right1: loadImg('assets/perro fase 4/right1fase4.png'),
        right2: loadImg('assets/perro fase 4/right2fase4.png'),
        left1: loadImg('assets/perro fase 4/left1fase4.png'),
        left2: loadImg('assets/perro fase 4/left2fase4.png'),
    },
    5: {
        standing: loadImg('assets/perro fase 5/standingfase5.png'),
        right1: loadImg('assets/perro fase 5/right1fase5.png'),
        right2: loadImg('assets/perro fase 5/right2fase5.png'),
        left1: loadImg('assets/perro fase 5/left1fase5.png'),
        left2: loadImg('assets/perro fase 5/left2fase5.png'),
    },
    6: {
        standing: loadImg('assets/perro fase 6/standingfase6.png'),
        right1: loadImg('assets/perro fase 6/right1fase6.png'),
        right2: loadImg('assets/perro fase 6/right2fase6.png'),
        left1: loadImg('assets/perro fase 6/left1fase6.png'),
        left2: loadImg('assets/perro fase 6/left2fase6.png'),
    },
    7: {
        standing: loadImg('assets/perro fase 7/standingfase7.png'),
        right1: loadImg('assets/perro fase 7/right1fase7.png'),
        right2: loadImg('assets/perro fase 7/right2fase7.png'),
        left1: loadImg('assets/perro fase 7/left1fase7.png'),
        left2: loadImg('assets/perro fase 7/left2fase7.png'),
    },
    8: {
        standing: loadImg('assets/perro fase 8/standingfase8.png'),
        right1: loadImg('assets/perro fase 8/right1fase8.png'),
        right2: loadImg('assets/perro fase 8/right2fase8.png'),
        left1: loadImg('assets/perro fase 8/left1fase8.png'),
        left2: loadImg('assets/perro fase 8/left2fase8.png'),
    },
};

// Sprites de objetos
const taco1Img = loadImg('assets/objetos/taco1.png');
const taco2Img = loadImg('assets/objetos/taco2.png');
const patamarcaImg = loadImg('assets/sprites/patamarca.png');

// Portraits del perro
const portraitImgs = [
    loadImg('assets/portraits perro/portraitfase1.png'),
    loadImg('assets/portraits perro/portraitfase2.png'),
    loadImg('assets/portraits perro/portraitfase3.png'),
    loadImg('assets/portraits perro/portraitfase4.png'),
    loadImg('assets/portraits perro/portraitfase5.png'),
    loadImg('assets/portraits perro/portraitfase6.png'),
    loadImg('assets/portraits perro/portraitfase7.png'),
    loadImg('assets/portraits perro/portraitfase8.png'),
];

function updatePortrait(phase) {
    const img = document.getElementById('portrait-img');
    if (!img) return;
    const idx = Math.min(7, Math.max(0, phase - 1));
    const src = portraitImgs[idx].src;
    if (img.src !== src) img.src = src;
}

// Variables para animar el movimiento
let isDogMoving = false;
let moveFrameToggle = false;
let lastDogDirX = 1;  // 1 = right, -1 = left (default right)

/* ============================================================
   SECTION 1: CANVAS SETUP & SIZING
   ============================================================ */

/** @type {HTMLCanvasElement} */
let canvas;
/** @type {CanvasRenderingContext2D} */
let ctx;
/** Computed cell size in pixels */
let cellSize = 24;
/** Canvas pixel dimensions */
let canvasW = 0;
let canvasH = 0;

/** Cached grass tile pattern (rebuilt when cellSize changes) */
let grassPattern = null;
let grassPatternCellSize = 0;

/** Collect-effect particles drawn each frame */
let activeParticles = [];

/**
 * Initialize the canvas element and context.
 * Called once when the game screen is first shown.
 */
function initCanvas() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
}

/**
 * Resize canvas to fit its container while maintaining grid proportions.
 * Calculates optimal cell size based on available space.
 */
function resizeCanvas() {
    if (!canvas) return;

    const container = document.getElementById('game-container');
    if (!container) return;

    // Available space (subtract flower border padding)
    const style = getComputedStyle(container);
    const padH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const padV = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    // Max available dimensions — expanded to fill most of the viewport
    const maxW = Math.min(window.innerWidth - 10, 1100) - padH;
    const maxH = Math.min(window.innerHeight - 100, 750) - padV;

    // Calculate cell size to fit grid
    cellSize = Math.floor(Math.min(maxW / GRID_COLS, maxH / GRID_ROWS));
    cellSize = Math.max(cellSize, 14);  // Minimum cell size
    cellSize = Math.min(cellSize, 36);  // Maximum cell size — larger for big screens

    // Set canvas dimensions
    canvasW = cellSize * GRID_COLS;
    canvasH = cellSize * GRID_ROWS;
    canvas.width = canvasW;
    canvas.height = canvasH;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    grassPattern = null;
}

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    if (gameRunning || snake.length > 0) {
        renderFrame();
    }
});

/* ============================================================
   SECTION 2: MAIN RENDER FUNCTION
   ============================================================ */

/**
 * Render a complete frame: background, grid, food, snake.
 */
function renderFrame() {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Draw layers in order (back to front)
    drawBackground();
    drawGrid();
    drawObstacles();
    drawFood();
    drawSnake();
    drawMusicTable();
    drawParticles();
}

/**
 * Draw the static pixel-art obstacles (Bowl, Ball, Star) on the board.
 */
function drawObstacles() {
    if (typeof OBSTACLES === 'undefined') return;

    OBSTACLES.forEach(obs => {
        const px = obs.x * cellSize;
        const py = obs.y * cellSize;
        
        ctx.save();
        ctx.translate(px, py);

        const pSize = Math.max(1, Math.floor(cellSize / 12));
        const offset = Math.floor((cellSize - (pSize * 12)) / 2);
        ctx.translate(offset, offset);

        const colorOutline = '#231F20';

        if (obs.type === 'bowl') {
            // --- RED DOG FOOD BOWL ---
            // 12x12 Matrix
            // 0: trans, 1: outline, 2: red (#E74C3C), 3: light red (#FF6B6B), 4: food brown (#7E5109)
            const matrix = [
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,1,1,1,1,0,0,0,0],
                [0,0,0,1,4,4,4,4,1,0,0,0],
                [0,0,1,4,4,4,4,4,4,1,0,0],
                [0,1,3,3,3,3,3,3,3,3,1,0],
                [1,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,1],
                [0,1,1,1,1,1,1,1,1,1,1,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0]
            ];
            drawMatrixObject(matrix, { 1: colorOutline, 2: '#E74C3C', 3: '#FF6B6B', 4: '#7E5109' }, pSize);
        } else if (obs.type === 'ball') {
            // --- TENNIS BALL ---
            // 0: trans, 1: outline, 2: ball green (#C1F80A), 3: white curved line (#FFFFFF)
            const matrix = [
                [0,0,0,0,1,1,1,1,0,0,0,0],
                [0,0,1,1,2,2,2,2,1,1,0,0],
                [0,1,2,2,3,3,2,2,2,2,1,0],
                [0,1,2,3,2,2,3,2,2,2,1,0],
                [1,2,2,3,2,2,2,3,2,2,2,1],
                [1,2,2,3,2,2,2,3,2,2,2,1],
                [1,2,2,2,3,2,2,3,2,2,2,1],
                [1,2,2,2,2,3,3,2,2,2,2,1],
                [0,1,2,2,2,2,2,2,2,2,1,0],
                [0,0,1,1,2,2,2,2,1,1,0,0],
                [0,0,0,0,1,1,1,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0]
            ];
            drawMatrixObject(matrix, { 1: colorOutline, 2: '#C1F80A', 3: '#FFFFFF' }, pSize);
        } else if (obs.type === 'star') {
            // --- TOY STAR ---
            // 0: trans, 1: outline, 2: star gold (#F1C40F), 3: light gold (#FFEAA7)
            const matrix = [
                [0,0,0,0,0,1,1,0,0,0,0,0],
                [0,0,0,0,1,3,3,1,0,0,0,0],
                [0,0,0,1,3,2,2,3,1,0,0,0],
                [1,1,1,1,3,2,2,3,1,1,1,1],
                [1,3,3,3,2,2,2,2,3,3,3,1],
                [0,1,2,2,2,2,2,2,2,2,1,0],
                [0,0,1,2,2,2,2,2,2,1,0,0],
                [0,0,1,3,2,2,2,2,3,1,0,0],
                [0,1,3,2,3,1,1,3,2,3,1,0],
                [1,3,2,1,1,0,0,1,1,2,3,1],
                [1,1,1,0,0,0,0,0,0,1,1,1],
                [0,0,0,0,0,0,0,0,0,0,0,0]
            ];
            drawMatrixObject(matrix, { 1: colorOutline, 2: '#F1C40F', 3: '#FFEAA7' }, pSize);
        }
        ctx.restore();
    });
}

/**
 * Draw a pixel matrix helper.
 */
function drawMatrixObject(matrix, colors, pSize) {
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            const code = matrix[r][c];
            if (code === 0) continue;
            ctx.fillStyle = colors[code];
            ctx.fillRect(c * pSize, r * pSize, pSize, pSize);
        }
    }
}

function drawMusicTable() {
    if (!btsMesaReady) return;

    const elapsed = performance.now();
    const frameIndex = Math.floor(elapsed / 600) % 2;
    const src = btsMesaNormalized[frameIndex];
    if (!src) return;

    // Both normalized canvases share mesa1's dimensions
    const aspectRatio = src.width / src.height;
    const spriteH = cellSize * 4.5;
    const spriteW = spriteH * aspectRatio;

    const drawX = Math.floor((canvasW - spriteW) / 2);
    const drawY = 0;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.drawImage(src, drawX, drawY, spriteW, spriteH);
    ctx.restore();
}

/**
 * Draw a detailed 3x3 cell pixel-art dog house in the top-left corner.
 */
function drawDogHouse() {
    if (!dogHouseImg.complete || dogHouseImg.naturalWidth === 0) return;

    ctx.save();
    
    const spriteH = cellSize * 5.5;
    const aspectRatio = dogHouseImg.naturalWidth / dogHouseImg.naturalHeight;
    const spriteW = spriteH * aspectRatio;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.drawImage(dogHouseImg, -cellSize * 2.0, -cellSize * 0.5, spriteW, spriteH);

    ctx.restore();
}

/* ============================================================
   SECTION 3: BACKGROUND RENDERING
   ============================================================ */

/**
 * Draw the cesped sprite once, scaled to cover the canvas.
 */
function drawBackground() {
    if (!cespedImg.complete || cespedImg.naturalWidth === 0) return;

    if (grassPatternCellSize !== cellSize || !grassPattern) {
        const offscreen = document.createElement('canvas');
        const offCtx = offscreen.getContext('2d');
        const tileSizeW = cellSize * 8;
        const aspectRatio = cespedImg.naturalHeight / cespedImg.naturalWidth;
        const tileSizeH = tileSizeW * aspectRatio;
        offscreen.width = tileSizeW;
        offscreen.height = tileSizeH;
        offCtx.drawImage(cespedImg, 0, 0, tileSizeW, tileSizeH);
        grassPattern = ctx.createPattern(offscreen, 'repeat');
        grassPatternCellSize = cellSize;
    }

    ctx.save();
    ctx.fillStyle = grassPattern;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const vignette = ctx.createRadialGradient(
        canvasW / 2, canvasH / 2, canvasW * 0.3,
        canvasW / 2, canvasH / 2, canvasW * 0.8
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
}

/* ============================================================
   SECTION 4: GRID RENDERING
   ============================================================ */

/**
 * Draw subtle grid lines for the retro aesthetic.
 */
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'; // Very faint white overlay
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= GRID_COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, canvasH);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= GRID_ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(canvasW, y * cellSize);
        ctx.stroke();
    }
}

/* ============================================================
   SECTION 5: MALTIPOO DOG RENDERING
   ============================================================ */

/**
 * Draw the Maltipoo dog in retro pixel art style.
 * Full body sprite with organic messy fur growth based on furLevel.
 */
function drawSnake() {
    if (snake.length === 0) return;

    const head = snake[0];
    const cx = head.x * cellSize + cellSize / 2;
    const cy = head.y * cellSize + cellSize / 2;

    ctx.save();

    const currentRevealed = typeof revealedWordCount !== 'undefined' ? revealedWordCount : 0;
    const phase = Math.min(8, currentRevealed + 1);

    // Draw body trail (patamarca segments trailing behind the dog)
    for (let i = 1; i < snake.length; i++) {
        const seg = snake[i];
        const segCx = seg.x * cellSize + cellSize / 2;
        const segCy = seg.y * cellSize + cellSize / 2;
        const segT = 1 - (i / snake.length) * 0.15;
        const segSize = cellSize * 0.75 * segT;

        ctx.save();
        ctx.globalAlpha = Math.max(0.85, segT);
        if (patamarcaImg.complete && patamarcaImg.naturalWidth > 0) {
            const aspect = patamarcaImg.naturalWidth / patamarcaImg.naturalHeight;
            const sW = segSize * aspect;
            const sH = segSize;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 1;
            ctx.drawImage(patamarcaImg, segCx - sW / 2, segCy - sH / 2, sW, sH);
        }
        ctx.restore();
    }

    const sprites = dogPhase[phase];

    let currentSprite = sprites.standing;

    if (isDogMoving) {
        if (typeof direction !== 'undefined') {
            if (direction.x < 0) lastDogDirX = -1;
            else if (direction.x > 0) lastDogDirX = 1;
        }
        if (lastDogDirX < 0) {
            currentSprite = moveFrameToggle ? sprites.left1 : sprites.left2;
        } else {
            currentSprite = moveFrameToggle ? sprites.right1 : sprites.right2;
        }
    }

    if (currentSprite.complete && currentSprite.naturalWidth > 0) {
        const size = cellSize * 2.2;
        const aspectRatio = currentSprite.naturalWidth / currentSprite.naturalHeight;
        const sW = size * aspectRatio;
        const sH = size;

        const px = cx - sW / 2;
        const py = cy - sH / 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        ctx.drawImage(currentSprite, px, py, sW, sH);
        ctx.restore();
    }

    ctx.restore();
}

/**
 * Helper to draw a pixel block with outline.
 */
function drawPixelBlock(x, y, w, h, fillColor, outlineColor, pSize) {
    ctx.fillStyle = outlineColor;
    ctx.fillRect(x - pSize, y - pSize, w + pSize * 2, h + pSize * 2);
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
}

/* ============================================================
   SECTION 6: PIXEL ART FOOD (TACO / BONE) RENDERING
   ============================================================ */

/**
 * Draw pixel-art taco or bone.
 */
function drawFood() {
    const px = food.x * cellSize;
    const py = food.y * cellSize;
    const cx = px + cellSize / 2;
    const cy = py + cellSize / 2;

    const elapsed = performance.now() - tacoSpawnTime;
    let bob = Math.sin(elapsed * 0.005) * (cellSize * 0.04); // subtle hover bobbing

    ctx.save();
    ctx.translate(px, py + bob);

    const pSize = Math.max(1, Math.floor(cellSize / 12));
    const offset = Math.floor((cellSize - (pSize * 12)) / 2);
    ctx.translate(offset, offset);

    const renderBone = (typeof isBoneSpawned !== 'undefined' && isBoneSpawned);

    // --- DRAW A PIXEL-ART CERAMIC PLATE UNDER THE TACO/BONE ---
    ctx.save();
    // Shadow under the plate
    ctx.fillStyle = 'rgba(10, 25, 12, 0.2)';
    ctx.fillRect(0, pSize * 9, pSize * 12, pSize * 3);
    
    // Plate outer rim (Classic Blue)
    ctx.fillStyle = '#2980B9';
    ctx.fillRect(pSize, pSize * 8, pSize * 10, pSize * 3);
    
    // Plate inner base (White/Cream)
    ctx.fillStyle = '#ECF0F1';
    ctx.fillRect(pSize * 2, pSize * 8, pSize * 8, pSize * 2);
    ctx.restore();

    if (renderBone) {
        // --- PIXEL ART BONE ---
        // Golden halo glow
        ctx.fillStyle = 'rgba(255, 235, 150, 0.15)';
        ctx.fillRect(-pSize * 2, -pSize * 2, pSize * 16, pSize * 16);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
        ctx.fillRect(0, 0, pSize * 12, pSize * 12);

        // 12x12 Bone Matrix
        // 0: transparent, 1: outline (#231F20), 2: bone fill (#F5F2E7), 3: highlight (#FFFFFF)
        const boneMatrix = [
            [0,0,0,1,1,0,0,1,1,0,0,0],
            [0,0,1,2,2,1,1,2,2,1,0,0],
            [0,1,2,2,2,2,2,2,2,2,1,0],
            [0,1,2,2,2,3,3,2,2,2,1,0],
            [0,0,1,2,2,2,2,2,2,1,0,0],
            [0,0,0,1,2,2,2,2,1,0,0,0],
            [0,0,0,1,2,2,2,2,1,0,0,0],
            [0,0,1,2,2,2,2,2,2,1,0,0],
            [0,1,2,2,2,3,3,2,2,2,1,0],
            [0,1,2,2,2,2,2,2,2,2,1,0],
            [0,0,1,2,2,1,1,2,2,1,0,0],
            [0,0,0,1,1,0,0,1,1,0,0,0]
        ];

        const boneColors = {
            1: '#231F20',
            2: '#F5F2E7',
            3: '#FFFFFF'
        };

        for (let r = 0; r < 12; r++) {
            for (let c = 0; c < 12; c++) {
                const code = boneMatrix[r][c];
                if (code === 0) continue;
                ctx.fillStyle = boneColors[code];
                ctx.fillRect(c * pSize, r * pSize, pSize, pSize);
            }
        }
    } else {
        const tacoImg = (typeof currentTacoVariant !== 'undefined' && currentTacoVariant === 2) ? taco2Img : taco1Img;
        if (tacoImg.complete && tacoImg.naturalWidth > 0) {
            const size = cellSize * 1.2;
            const aspectRatio = tacoImg.naturalWidth / tacoImg.naturalHeight;
            const sW = size * aspectRatio;
            const sH = size;
            const tx = (cellSize - sW) / 2;
            const ty = (cellSize - sH) / 2 - pSize * 2;
            ctx.drawImage(tacoImg, tx, ty, sW, sH);
        }
    }

    ctx.restore();
}

/* ============================================================
   SECTION 7: SPECIAL EFFECTS
   ============================================================ */

/**
 * Draw retro pixelated collect particles.
 */
function drawCollectEffect(gx, gy) {
    const cx = gx * cellSize + cellSize / 2;
    const cy = gy * cellSize + cellSize / 2;
    const startTime = performance.now();

    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        activeParticles.push({
            cx,
            cy,
            vx: Math.cos(angle) * 1.5,
            vy: Math.sin(angle) * 1.5,
            size: Math.random() > 0.5 ? 3 : 2,
            startTime
        });
    }
}

function drawParticles() {
    if (!activeParticles.length) return;

    const now = performance.now();
    activeParticles = activeParticles.filter(p => {
        const elapsed = now - p.startTime;
        if (elapsed > 350) return false;

        const life = 1 - elapsed / 350;
        const x = p.cx + p.vx * (elapsed / 16);
        const y = p.cy + p.vy * (elapsed / 16);

        ctx.save();
        ctx.fillStyle = '#FFEAA7';
        ctx.globalAlpha = life;
        ctx.fillRect(x - p.size / 2, y - p.size / 2, p.size, p.size);
        ctx.restore();
        return true;
    });
}

/* ============================================================
   CONTINUOUS RENDER LOOP (for background animations)
   ============================================================ */
let renderLoopId = null;
let renderLastFrame = 0;
const GAME_RENDER_FPS = 30;
const GAME_RENDER_MS = 1000 / GAME_RENDER_FPS;

function startRenderLoop() {
    if (renderLoopId) cancelAnimationFrame(renderLoopId);
    renderLastFrame = 0;
    function loop(timestamp) {
        if (typeof currentScreen !== 'undefined' && currentScreen === 'game-screen') {
            if (timestamp - renderLastFrame >= GAME_RENDER_MS) {
                renderFrame();
                renderLastFrame = timestamp;
            }
            renderLoopId = requestAnimationFrame(loop);
        } else {
            renderLoopId = null;
        }
    }
    renderLoopId = requestAnimationFrame(loop);
}
