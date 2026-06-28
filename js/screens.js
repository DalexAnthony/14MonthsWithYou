/* ============================================================
   SCREENS.JS — Screen Management, Transitions & Celebrations
   ============================================================
   Manages the three screens (start, game, end), generates the
   SVG flower border, handles transitions between screens,
   creates the falling flower celebration animation, and reveals
   the parchment card with the complete message.
   ============================================================ */

/* ============================================================
   SECTION 1: SCREEN TRANSITION MANAGEMENT
   ============================================================ */

/** Current active screen ID */
let currentScreen = 'start-screen';

/**
 * Show a specific screen and hide all others.
 * @param {string} screenId — ID of the screen to show
 */
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        currentScreen = screenId;
    }

    if (screenId !== 'game-screen' && typeof stopAmbientHeartsLoop === 'function') {
        stopAmbientHeartsLoop();
    }
}

/* ============================================================
   SECTION 2: START SCREEN — Pixel background & init
   ============================================================ */

const SHARED_HEART_MATRIX = [
    [0,0,1,0,1,0,0],
    [0,1,2,1,2,1,0],
    [1,2,3,3,3,2,1],
    [1,2,3,3,3,2,1],
    [0,1,2,3,2,1,0],
    [0,0,1,2,1,0,0],
    [0,0,0,1,0,0,0]
];

const START_DECO_SPRITES = {
    star: {
        matrix: [
            [0,0,0,0,1,0,0,0,0],
            [0,0,0,1,2,1,0,0,0],
            [0,0,1,2,2,2,1,0,0],
            [0,1,2,2,2,2,2,1,0],
            [1,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,1,0],
            [0,0,1,2,2,2,1,0,0],
            [0,0,0,1,2,1,0,0,0],
            [0,0,0,0,1,0,0,0,0],
        ],
        colors: { 1: '#231F20', 2: '#FFD700' }
    },
    taco: {
        matrix: [
            [0,0,0,1,1,1,1,1,1,1,1,0],
            [0,0,1,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,1],
            [1,3,3,2,2,4,2,2,5,2,2,1],
            [0,1,6,6,6,6,6,6,6,6,6,1],
            [0,0,1,1,1,1,1,1,1,1,1,0],
        ],
        colors: { 1: '#231F20', 2: '#D4A056', 3: '#C49040', 4: '#FF6B9D', 5: '#6DB35A', 6: '#8B6914' }
    },
    bone: {
        matrix: [
            [0,0,0,1,1,0,0,1,1,0,0],
            [0,0,1,2,2,1,1,2,2,1,0],
            [0,1,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,3,3,2,2,2,2,1],
            [0,0,1,2,2,2,2,2,2,1,0],
            [0,0,0,1,2,2,2,2,1,0,0],
            [0,0,1,2,2,2,2,2,2,1,0],
            [0,1,2,2,3,3,2,2,2,2,1],
            [0,0,1,2,2,1,1,2,2,1,0],
            [0,0,0,1,1,0,0,1,1,0,0],
        ],
        colors: { 1: '#231F20', 2: '#F5F2E7', 3: '#FFFFFF' }
    },
    heart: {
        matrix: SHARED_HEART_MATRIX,
        colors: { 1: '#400713', 2: '#601323', 3: '#9C6EA3' }
    },
    heart2: {
        matrix: SHARED_HEART_MATRIX,
        colors: { 1: '#250B3A', 2: '#5D2986', 3: '#C39BD3' }
    }
};

const START_DECO_WEIGHTS = [
    ['star', 16], ['taco', 22], ['bone', 14], ['heart', 18], ['heart2', 18]
];

let startDecoResizeTimer = null;

function startMatrixToSVG(matrix, colors, size) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    let rects = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const code = matrix[r][c];
            if (!code) continue;
            rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="${colors[code]}" />`;
        }
    }
    return `<svg viewBox="0 0 ${cols} ${rows}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;shape-rendering:crispEdges">${rects}</svg>`;
}

function pickWeightedStartDeco() {
    const total = START_DECO_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
    let roll = Math.random() * total;
    for (const [type, weight] of START_DECO_WEIGHTS) {
        roll -= weight;
        if (roll <= 0) return type;
    }
    return 'star';
}

function getStartWindowExclusion() {
    const screen = document.getElementById('start-screen');
    const windowEl = document.querySelector('#start-screen .retro-window');
    if (!screen || !windowEl) return null;

    const screenRect = screen.getBoundingClientRect();
    const winRect = windowEl.getBoundingClientRect();
    const pad = 48;

    return {
        left: winRect.left - screenRect.left - pad,
        top: winRect.top - screenRect.top - pad,
        width: winRect.width + pad * 2,
        height: winRect.height + pad * 2,
        screenW: screenRect.width,
        screenH: screenRect.height
    };
}

function isInsideStartWindow(x, y, bounds) {
    return x >= bounds.left &&
        x <= bounds.left + bounds.width &&
        y >= bounds.top &&
        y <= bounds.top + bounds.height;
}

function createStartDecoElement(x, y, type, size) {
    const sprite = START_DECO_SPRITES[type];
    if (!sprite) return null;

    const el = document.createElement('div');
    el.className = `start-pixel-deco start-pixel-deco--${type}`;
    el.style.left = `${x - size / 2}px`;
    el.style.top = `${y - size / 2}px`;
    el.style.setProperty('--float-duration', `${2.5 + Math.random() * 3.5}s`);
    el.style.setProperty('--float-delay', `${Math.random() * 5}s`);
    el.style.setProperty('--deco-opacity', `${0.45 + Math.random() * 0.45}`);
    if (Math.random() > 0.5) {
        el.style.setProperty('--sway-x', `${-8 + Math.random() * 16}px`);
    }
    el.innerHTML = startMatrixToSVG(sprite.matrix, sprite.colors, size);
    return el;
}

function initStartScreenDecorations() {
    const container = document.getElementById('start-pixel-bg');
    const bounds = getStartWindowExclusion();
    if (!container || !bounds) return;

    container.innerHTML = '';

    const cols = Math.max(8, Math.floor(bounds.screenW / 110));
    const rows = Math.max(6, Math.floor(bounds.screenH / 95));
    const cellW = bounds.screenW / cols;
    const cellH = bounds.screenH / rows;
    const fragment = document.createDocumentFragment();
    let placed = 0;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (Math.random() > 0.82) continue;

            const x = col * cellW + cellW * (0.15 + Math.random() * 0.7);
            const y = row * cellH + cellH * (0.15 + Math.random() * 0.7);
            if (isInsideStartWindow(x, y, bounds)) continue;

            const type = pickWeightedStartDeco();
            const sizeRoll = Math.random();
            const size = sizeRoll < 0.4 ? 16 + Math.random() * 8
                : sizeRoll < 0.8 ? 22 + Math.random() * 12
                : 32 + Math.random() * 14;

            const el = createStartDecoElement(x, y, type, size);
            if (el) {
                fragment.appendChild(el);
                placed++;
            }
        }
    }

    // Extra density in corners and edges
    const edgePoints = [
        [0.06, 0.12], [0.94, 0.1], [0.05, 0.88], [0.92, 0.9],
        [0.12, 0.5], [0.88, 0.48], [0.5, 0.06], [0.48, 0.94],
        [0.08, 0.35], [0.9, 0.65], [0.15, 0.75], [0.85, 0.25]
    ];
    edgePoints.forEach(([px, py]) => {
        const x = bounds.screenW * px + (Math.random() - 0.5) * 40;
        const y = bounds.screenH * py + (Math.random() - 0.5) * 40;
        if (isInsideStartWindow(x, y, bounds)) return;
        const type = pickWeightedStartDeco();
        const el = createStartDecoElement(x, y, type, 20 + Math.random() * 18);
        if (el) fragment.appendChild(el);
    });

    container.appendChild(fragment);
}

function scheduleStartDecoRefresh() {
    clearTimeout(startDecoResizeTimer);
    startDecoResizeTimer = setTimeout(() => {
        if (typeof currentScreen !== 'undefined' && currentScreen === 'start-screen') {
            initStartScreenDecorations();
        }
    }, 250);
}

window.addEventListener('resize', scheduleStartDecoRefresh);

/**
 * Initialize the start screen. Attach button handlers.
 */
function initStartScreen() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            transitionToGame();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (currentScreen !== 'start-screen') return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            transitionToGame();
        }
    });

    requestAnimationFrame(() => initStartScreenDecorations());
}

/**
 * Transition from start screen to game screen.
 */
function transitionToGame() {
    showScreen('game-screen');

    // Initialize canvas and game after screen is visible
    setTimeout(() => {
        initCanvas();
        initGame();
        generateFlowerBorder();
        renderFrame();
        initAmbientHearts();
        
        // Start continuous background animation loop
        if (typeof startRenderLoop === 'function') {
            startRenderLoop();
        }

        // Game will start on first input (keyboard/touch/dpad)

        // Start background music
        const audio = document.getElementById('bg-music');
        if (audio) {
            audio.volume = 0.5;
            audio.play().catch(() => {});
        }
    }, 100);
}

/* ============================================================
   SECTION 3: END SCREEN — Celebration & Card Reveal
   ============================================================ */

/**
 * Transition to the end screen with celebration.
 * Called when the snake completes the entire message.
 */
function showEndScreen() {
    // Stop the game
    stopGameLoop();

    // Prepare the card content
    prepareCard();

    // Show end screen
    showScreen('end-screen');

    // Start the falling flowers animation
    setTimeout(() => {
        createFallingFlowers();
    }, 200);

    // Create sparkle effects
    setTimeout(() => {
        createSparkles();
    }, 1500);
}

/**
 * Populate the card with the complete message.
 */
function prepareCard() {
    const messageEl = document.getElementById('card-message-text');
    if (messageEl) {
        messageEl.textContent = SECRET_MESSAGE;
    }
}

/**
 * Create falling flower/petal SVG elements for the celebration.
 * Generates 30-40 falling petals with varying sizes, colors, and timing.
 */
function createFallingFlowers() {
    const container = document.getElementById('falling-flowers');
    if (!container) return;

    // Clear any existing petals
    container.innerHTML = '';

    const petalCount = 35;
    const colors = [
        { petal: '#F7EFE2', center: '#601323' },  // Cream/burgundy
        { petal: '#E8CCD1', center: '#601323' },  // Blush/burgundy
        { petal: '#E5AD9C', center: '#400713' },  // Peach/dark burgundy
        { petal: '#9C6EA3', center: '#F7EFE2' },  // Mauve/cream
        { petal: '#E5C384', center: '#601323' }   // Gold/burgundy
    ];

    for (let i = 0; i < petalCount; i++) {
        const colorSet = colors[Math.floor(Math.random() * colors.length)];
        const size = 16 + Math.random() * 24;  // 16–40px
        const leftPos = Math.random() * 100;    // 0–100% horizontal
        const delay = Math.random() * 4;         // 0–4s delay
        const duration = 5 + Math.random() * 4;  // 5–9s fall duration
        const swayX = -40 + Math.random() * 80;  // Sway range

        const petal = document.createElement('div');
        petal.className = 'falling-petal';
        petal.style.left = `${leftPos}%`;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.setProperty('--fall-duration', `${duration}s`);
        petal.style.setProperty('--fall-delay', `${delay}s`);
        petal.style.setProperty('--sway-x', `${swayX}px`);

        // Create a small SVG petal/flower
        if (Math.random() > 0.4) {
            // Full flower
            petal.innerHTML = createMiniFlowerSVG(size, colorSet.petal, colorSet.center);
        } else {
            // Single petal
            petal.innerHTML = createSinglePetalSVG(size, colorSet.petal);
        }

        container.appendChild(petal);
    }
}

/**
 * Create sparkle elements around the card.
 */
function createSparkles() {
    const endScreen = document.getElementById('end-screen');
    if (!endScreen) return;

    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${10 + Math.random() * 80}%`;
        sparkle.style.top = `${10 + Math.random() * 80}%`;
        sparkle.style.animationDelay = `${1.5 + Math.random() * 3}s`;
        sparkle.style.animation = `sparkle ${1.5 + Math.random() * 2}s ease-in-out ${1.5 + Math.random() * 3}s infinite`;
        endScreen.appendChild(sparkle);
    }
}

/* ============================================================
   SECTION 4B: BONE CELEBRATION — Pixel hearts & fireworks
   Outside the play canvas, around the flower border.
   ============================================================ */

const BONE_HEART_MATRIX = SHARED_HEART_MATRIX;

const BONE_HEART_COLORS = { 1: '#E74C3C', 2: '#C0392B', 3: '#FF6B9D' };

const AMBIENT_HEART_PALETTES = [
    { 1: '#231F20', 2: '#601323', 3: '#8C2539', glow: 'rgba(96, 19, 35, 0.5)' },
    { 1: '#250B3A', 2: '#3C165A', 3: '#5D2986', glow: 'rgba(93, 41, 134, 0.5)' },
    { 1: '#400713', 2: '#721C3A', 3: '#9C6EA3', glow: 'rgba(140, 37, 57, 0.45)' },
    { 1: '#231F20', 2: '#5D2986', 3: '#C39BD3', glow: 'rgba(157, 62, 161, 0.4)' },
    { 1: '#400713', 2: '#601323', 3: '#5D2986', glow: 'rgba(96, 19, 35, 0.45)' },
    { 1: '#250B3A', 2: '#8C2539', 3: '#9C6EA3', glow: 'rgba(140, 37, 57, 0.4)' },
    { 1: '#231F20', 2: '#721C3A', 3: '#E8CCD1', glow: 'rgba(114, 28, 58, 0.35)' },
    { 1: '#400713', 2: '#3C165A', 3: '#8C2539', glow: 'rgba(60, 22, 90, 0.45)' },
    { 1: '#250B3A', 2: '#601323', 3: '#C39BD3', glow: 'rgba(93, 41, 134, 0.4)' },
    { 1: '#231F20', 2: '#400713', 3: '#5D2986', glow: 'rgba(64, 7, 19, 0.5)' },
];

const FIREWORK_COLORS = ['#FFD700', '#FF6B9D', '#00BFFF', '#FF8C42', '#E5C384', '#FFFFFF'];

let ambientHeartsResizeTimer = null;
let ambientHeartsData = [];
let ambientHeartsRaf = null;
let ambientHeartsCanvas = null;
let ambientHeartsCtx = null;
let heartSpriteCache = null;
let ambientLastFrame = 0;
const AMBIENT_FPS = 30;
const AMBIENT_FRAME_MS = 1000 / AMBIENT_FPS;

function getBoardExclusionBounds() {
    const container = document.getElementById('game-container');
    const screen = document.getElementById('game-screen');
    if (!container || !screen) return null;

    const screenRect = screen.getBoundingClientRect();
    const boardRect = container.getBoundingClientRect();
    const pad = 10;

    return {
        left: boardRect.left - screenRect.left - pad,
        top: boardRect.top - screenRect.top - pad,
        width: boardRect.width + pad * 2,
        height: boardRect.height + pad * 2,
        screenW: screenRect.width,
        screenH: screenRect.height
    };
}

function isInsideBoard(x, y, bounds) {
    return x >= bounds.left &&
        x <= bounds.left + bounds.width &&
        y >= bounds.top &&
        y <= bounds.top + bounds.height;
}

function pickBackgroundHeartPoint(bounds) {
    for (let attempt = 0; attempt < 40; attempt++) {
        const x = Math.random() * bounds.screenW;
        const y = Math.random() * bounds.screenH;
        if (!isInsideBoard(x, y, bounds)) {
            return { x, y };
        }
    }

    const zones = [
        () => ({ x: Math.random() * Math.max(bounds.left, 1), y: Math.random() * bounds.screenH }),
        () => ({
            x: bounds.left + bounds.width + Math.random() * Math.max(bounds.screenW - bounds.left - bounds.width, 1),
            y: Math.random() * bounds.screenH
        }),
        () => ({ x: Math.random() * bounds.screenW, y: Math.random() * Math.max(bounds.top, 1) }),
        () => ({
            x: Math.random() * bounds.screenW,
            y: bounds.top + bounds.height + Math.random() * Math.max(bounds.screenH - bounds.top - bounds.height, 1)
        })
    ];
    return zones[Math.floor(Math.random() * zones.length)]();
}

function buildHeartSprites() {
    if (heartSpriteCache) return heartSpriteCache;

    heartSpriteCache = AMBIENT_HEART_PALETTES.map((palette) => {
        const { glow, ...colors } = palette;
        const sprite = document.createElement('canvas');
        sprite.width = 7;
        sprite.height = 7;
        const sctx = sprite.getContext('2d');
        for (let r = 0; r < BONE_HEART_MATRIX.length; r++) {
            for (let c = 0; c < BONE_HEART_MATRIX[r].length; c++) {
                const code = BONE_HEART_MATRIX[r][c];
                if (!code) continue;
                sctx.fillStyle = colors[code];
                sctx.fillRect(c, r, 1, 1);
            }
        }
        return sprite;
    });
    return heartSpriteCache;
}

function createAmbientHeartState(bounds) {
    const sizeOptions = [14, 21, 28, 35, 42];
    const size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
    const pt = pickBackgroundHeartPoint(bounds);

    return {
        x: pt.x,
        y: pt.y,
        size,
        palette: Math.floor(Math.random() * AMBIENT_HEART_PALETTES.length),
        alpha: 0.4 + Math.random() * 0.55,
        swayX: 10 + Math.random() * 22,
        swayY: 12 + Math.random() * 24,
        speedX: 1.1 + Math.random() * 1.6,
        speedY: 0.9 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2
    };
}

function ensureAmbientHeartsCanvas() {
    const layer = document.getElementById('ambient-hearts');
    if (!layer) return null;

    if (!ambientHeartsCanvas) {
        ambientHeartsCanvas = document.createElement('canvas');
        ambientHeartsCanvas.id = 'ambient-hearts-canvas';
        layer.innerHTML = '';
        layer.appendChild(ambientHeartsCanvas);
        ambientHeartsCtx = ambientHeartsCanvas.getContext('2d', { alpha: true });
        ambientHeartsCtx.imageSmoothingEnabled = false;
    }
    return ambientHeartsCanvas;
}

function drawAmbientHeartsFrame(timestamp) {
    if (!ambientHeartsCtx || !ambientHeartsCanvas || !ambientHeartsData.length) return;

    const logicalW = ambientHeartsCanvas.clientWidth || ambientHeartsCanvas.width;
    const logicalH = ambientHeartsCanvas.clientHeight || ambientHeartsCanvas.height;
    ambientHeartsCtx.clearRect(0, 0, logicalW, logicalH);

    const sprites = buildHeartSprites();
    const t = timestamp * 0.001;

    ambientHeartsCtx.imageSmoothingEnabled = false;

    for (let i = 0; i < ambientHeartsData.length; i++) {
        const heart = ambientHeartsData[i];
        const bobX = Math.sin(t * heart.speedX + heart.phase) * heart.swayX;
        const bobY = Math.sin(t * heart.speedY + heart.phase2) * heart.swayY;
        const cx = Math.round(heart.x + bobX);
        const cy = Math.round(heart.y + bobY);
        const size = heart.size;
        const pulse = 0.82 + 0.18 * Math.sin(t * 1.4 + heart.phase2);
        const half = size / 2;

        ambientHeartsCtx.globalAlpha = heart.alpha * pulse;
        ambientHeartsCtx.drawImage(
            sprites[heart.palette],
            cx - half,
            cy - half,
            size,
            size
        );
    }

    ambientHeartsCtx.globalAlpha = 1;
}

function ambientHeartsLoop(timestamp) {
    if (typeof currentScreen === 'undefined' || currentScreen !== 'game-screen') {
        stopAmbientHeartsLoop();
        return;
    }

    if (timestamp - ambientLastFrame >= AMBIENT_FRAME_MS) {
        drawAmbientHeartsFrame(timestamp);
        ambientLastFrame = timestamp;
    }

    ambientHeartsRaf = requestAnimationFrame(ambientHeartsLoop);
}

function startAmbientHeartsLoop() {
    stopAmbientHeartsLoop();
    ambientLastFrame = 0;
    ambientHeartsRaf = requestAnimationFrame(ambientHeartsLoop);
}

function stopAmbientHeartsLoop() {
    if (ambientHeartsRaf) {
        cancelAnimationFrame(ambientHeartsRaf);
        ambientHeartsRaf = null;
    }
    if (ambientHeartsCtx && ambientHeartsCanvas) {
        ambientHeartsCtx.clearRect(0, 0, ambientHeartsCanvas.width, ambientHeartsCanvas.height);
    }
}

function initAmbientHearts() {
    const bounds = getBoardExclusionBounds();
    const canvas = ensureAmbientHeartsCanvas();
    if (!canvas || !bounds || bounds.screenW === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(bounds.screenW * dpr);
    canvas.height = Math.floor(bounds.screenH * dpr);
    canvas.style.width = `${bounds.screenW}px`;
    canvas.style.height = `${bounds.screenH}px`;
    ambientHeartsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ambientHeartsCtx.imageSmoothingEnabled = false;

    buildHeartSprites();

    const area = bounds.screenW * bounds.screenH;
    const count = Math.min(190, Math.max(90, Math.floor(area / 3200)));
    ambientHeartsData = [];
    for (let i = 0; i < count; i++) {
        ambientHeartsData.push(createAmbientHeartState(bounds));
    }

    drawAmbientHeartsFrame(performance.now());

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
        startAmbientHeartsLoop();
    }
}

function scheduleAmbientHeartsRefresh() {
    clearTimeout(ambientHeartsResizeTimer);
    ambientHeartsResizeTimer = setTimeout(() => {
        if (typeof currentScreen !== 'undefined' && currentScreen === 'game-screen') {
            initAmbientHearts();
        }
    }, 250);
}

window.addEventListener('resize', scheduleAmbientHeartsRefresh);

function boneMatrixToSVG(matrix, colors, size) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    let rects = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const code = matrix[r][c];
            if (code === 0) continue;
            rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="${colors[code]}" />`;
        }
    }
    return `<svg viewBox="0 0 ${cols} ${rows}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;shape-rendering:crispEdges">${rects}</svg>`;
}

function pickEdgePoint(canvasLeft, canvasTop, canvasW, canvasH, margin) {
    const edge = Math.floor(Math.random() * 4);
    const t = Math.random();
    switch (edge) {
        case 0: return { x: canvasLeft + t * canvasW, y: canvasTop - margin };
        case 1: return { x: canvasLeft + canvasW + margin, y: canvasTop + t * canvasH };
        case 2: return { x: canvasLeft + t * canvasW, y: canvasTop + canvasH + margin };
        default: return { x: canvasLeft - margin, y: canvasTop + t * canvasH };
    }
}

function spawnBoneHeart(layer, canvasLeft, canvasTop, canvasW, canvasH) {
    const margin = 8 + Math.random() * 18;
    const pt = pickEdgePoint(canvasLeft, canvasTop, canvasW, canvasH, margin);
    const size = 14 + Math.random() * 16;
    const el = document.createElement('div');
    el.className = 'bone-fx-heart';
    el.style.left = `${pt.x - size / 2}px`;
    el.style.top = `${pt.y - size / 2}px`;
    el.style.setProperty('--drift-x', `${-30 + Math.random() * 60}px`);
    el.style.setProperty('--drift-y', `${-70 - Math.random() * 50}px`);
    el.innerHTML = boneMatrixToSVG(BONE_HEART_MATRIX, BONE_HEART_COLORS, size);
    layer.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

function spawnFireworkBurst(layer, canvasLeft, canvasTop, canvasW, canvasH) {
    const margin = 4 + Math.random() * 12;
    const pt = pickEdgePoint(canvasLeft, canvasTop, canvasW, canvasH, margin);
    const burst = document.createElement('div');
    burst.className = 'bone-fx-burst';
    burst.style.left = `${pt.x}px`;
    burst.style.top = `${pt.y}px`;

    const sparkCount = 10 + Math.floor(Math.random() * 6);
    const baseDist = 28 + Math.random() * 32;

    for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
        const dist = baseDist * (0.6 + Math.random() * 0.5);
        const spark = document.createElement('span');
        spark.className = 'bone-fx-spark';
        spark.style.background = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        spark.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        spark.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        spark.style.setProperty('--burst-dur', `${700 + Math.random() * 350}ms`);
        burst.appendChild(spark);
    }

    layer.appendChild(burst);
    setTimeout(() => burst.remove(), 1200);
}

function spawnPixelStar(layer, canvasLeft, canvasTop, canvasW, canvasH) {
    const margin = 6 + Math.random() * 14;
    const pt = pickEdgePoint(canvasLeft, canvasTop, canvasW, canvasH, margin);
    const el = document.createElement('div');
    el.className = 'bone-fx-star';
    el.style.left = `${pt.x - 3}px`;
    el.style.top = `${pt.y - 3}px`;
    el.style.background = FIREWORK_COLORS[Math.floor(Math.random() * 3)];
    el.style.setProperty('--drift-x', `${-20 + Math.random() * 40}px`);
    el.style.setProperty('--drift-y', `${-35 - Math.random() * 30}px`);
    el.style.boxShadow = '1px 1px 0 rgba(0,0,0,0.4)';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

/**
 * Pixel-art celebration around the board when Giorgio eats a bone.
 * @param {number} boneNumber — how many bones collected (1–7+)
 */
function triggerBoneCelebration(boneNumber) {
    const layer = document.getElementById('bone-celebration');
    const canvas = document.getElementById('game-canvas');
    const wrap = document.getElementById('game-board-wrap');
    const container = document.getElementById('game-container');
    if (!layer || !canvas || !wrap) return;

    const wrapRect = wrap.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const left = canvasRect.left - wrapRect.left;
    const top = canvasRect.top - wrapRect.top;
    const w = canvasRect.width;
    const h = canvasRect.height;

    const intensity = boneNumber >= 7 ? 1.4 : 1;
    const heartCount = Math.floor((4 + Math.random() * 3) * intensity);
    const burstCount = Math.floor((3 + Math.random() * 2) * intensity);
    const starCount = Math.floor((2 + Math.random() * 2) * intensity);

    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => spawnBoneHeart(layer, left, top, w, h), i * 60);
    }
    for (let i = 0; i < burstCount; i++) {
        setTimeout(() => spawnFireworkBurst(layer, left, top, w, h), i * 90);
    }
    for (let i = 0; i < starCount; i++) {
        setTimeout(() => spawnPixelStar(layer, left, top, w, h), i * 75);
    }

    if (container) {
        container.classList.remove('bone-glow');
        void container.offsetWidth;
        container.classList.add('bone-glow');
        setTimeout(() => container.classList.remove('bone-glow'), 750);
    }
}

/* ============================================================
   SECTION 4: PHASE 8 MODAL
   ============================================================ */

/**
 * Build a small pixel-art heart.
 */
function buildPixelHeart() {
    const container = document.getElementById('pixel-heart');
    if (!container || container.children.length > 0) return;
    // 7x7 mini heart: 1 = red, 2 = dark red, 3 = pink
    const heart = [
        [0,0,1,0,1,0,0],
        [0,1,2,1,2,1,0],
        [1,2,3,3,3,2,1],
        [1,2,3,3,3,2,1],
        [0,1,2,3,2,1,0],
        [0,0,1,2,1,0,0],
        [0,0,0,1,0,0,0]
    ];
    const colors = { 1: '#E74C3C', 2: '#C0392B', 3: '#FF6B9D' };
    for (const row of heart) {
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        for (const c of row) {
            const cell = document.createElement('span');
            if (c !== 0) {
                cell.style.background = colors[c];
                cell.style.boxShadow = 'inset 0 0 0 0.5px rgba(255,255,255,0.15)';
            }
            rowEl.appendChild(cell);
        }
        container.appendChild(rowEl);
    }
}

/**
 * Show the phase 8 pixel modal.
 */
const LETTER_TEXT = `Eres tan hermosa que me pregunto una cosa: ¿será que estoy en un sueño? Yo creo que sí, porque no me puedo explicar cómo alguien tan hermosa puede existir en esta vida. Tus ojos, tu pelo, tu voz y todo de ti es algo sin duda perfecto, cosas que no encuentro en nadie más. Y si es un sueño, no me quiero despertar, porque quiero que seas mi vida.

Sos muy hermosa y yo no quiero que te veas hermosa sin yo estar ahí para mirarte. Sos tan bella que no me olvido de ti, y nunca jamás me olvidaría de ti, pues dime, ¿quién tiene esas cosas que tú tienes? Esos ojos hermosos, esa boca tuya… ¿quién más puede tenerlos? Nadie más, y mi cariño, ¿a quién se lo di a guardar sino a ti?

Solo quiero que sepas que todavía sigo vivo y nada más es por ti.

— Anthony Andino`;

function typeLetterText() {
    const el = document.getElementById('letter-text');
    if (!el) return;
    el.textContent = '';
    let i = 0;
    function type() {
        if (i < LETTER_TEXT.length) {
            const ch = LETTER_TEXT[i];
            if (ch === '\n') {
                el.textContent += '\n';
            } else {
                el.textContent += ch;
            }
            i++;
            const delay = ch === '\n' ? 300 : 20 + Math.random() * 25;
            setTimeout(type, delay);
        }
    }
    type();
}

function showPhaseModal() {
    const modal = document.getElementById('phase-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(typeLetterText, 600);
}

/**
 * Hide the phase 8 modal and show continue prompt.
 */
function hidePhaseModal() {
    const modal = document.getElementById('phase-modal');
    if (!modal) return;
    modal.style.display = 'none';
    const prompt = document.getElementById('continue-prompt');
    if (prompt) prompt.style.display = 'flex';
}

function hideContinuePrompt() {
    const prompt = document.getElementById('continue-prompt');
    if (prompt) prompt.style.display = 'none';
    if (typeof gameRunning !== 'undefined' && !gameRunning && typeof startGameLoop === 'function') {
        startGameLoop();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('modal-close-x');
    if (btn) {
        btn.addEventListener('click', hidePhaseModal);
    }

    const retryBtn = document.getElementById('death-retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', retryGame);
    }

    const continueBtn = document.getElementById('continue-yes-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', hideContinuePrompt);
    }

    const continueNoBtn = document.getElementById('continue-no-btn');
    if (continueNoBtn) {
        continueNoBtn.addEventListener('click', () => {
            const prompt = document.getElementById('continue-prompt');
            if (prompt) prompt.style.display = 'none';
            if (typeof showScreen === 'function') showScreen('start-screen');
        });
    }

    // Music player controls + playlist
    const audio = document.getElementById('bg-music');
    const playBtn = document.getElementById('music-play');
    const prevBtn = document.getElementById('music-prev');
    const nextBtn = document.getElementById('music-next');
    const volSlider = document.getElementById('music-volume');
    const volLabel = document.getElementById('music-vol-pct');
    const trackEl = document.getElementById('music-track');

    const SONG_LIST = [
        { file: 'stillwithyou.mp3',      title: 'Still With You' },
        { file: 'itsdefinitleoyou.mp3',   title: "It's Definitely You" },
        { file: 'Dimple.mp3',            title: 'Dimple' },
        { file: 'Anpanman.mp3',          title: 'Anpanman' },
        { file: '21stCenturyGirl.mp3',   title: '21st Century Girl' },
    ];

    let currentSongIndex = 0;

    function loadSong(index) {
        currentSongIndex = (index + SONG_LIST.length) % SONG_LIST.length;
        const song = SONG_LIST[currentSongIndex];
        audio.src = `assets/songs/${song.file}`;
        if (trackEl) trackEl.textContent = song.title;
        audio.addEventListener('canplay', () => {
            audio.play().catch(() => {});
        }, { once: true });
        audio.load();
    }

    function nextSong() {
        loadSong(currentSongIndex + 1);
    }

    function prevSong() {
        loadSong(currentSongIndex - 1);
    }

    loadSong(0);

    if (playBtn) playBtn.textContent = 'PAUSA';

    if (audio && playBtn) {
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.textContent = 'PAUSA';
            } else {
                audio.pause();
                playBtn.textContent = 'PLAY';
            }
        });
    }

    if (audio && volSlider && volLabel) {
        volSlider.addEventListener('input', () => {
            const val = parseInt(volSlider.value);
            audio.volume = val / 100;
            volLabel.textContent = val + '%';
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSong);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSong);
    }

    if (audio) {
        audio.addEventListener('ended', nextSong);
        audio.addEventListener('pause', () => {
            if (playBtn) playBtn.textContent = 'PLAY';
        });
        audio.addEventListener('play', () => {
            if (playBtn) playBtn.textContent = 'PAUSA';
        });
    }
});

/* ============================================================
   SECTION 5: PLAY AGAIN — Reset Everything
   ============================================================ */

/**
 * Reset everything and go back to start screen.
 */
function playAgain() {
    // Clear falling flowers
    const fallingContainer = document.getElementById('falling-flowers');
    if (fallingContainer) fallingContainer.innerHTML = '';

    // Remove sparkles
    document.querySelectorAll('#end-screen .sparkle').forEach(el => el.remove());

    // Reset card animations by removing and re-adding the card container class
    const cardContainer = document.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.style.animation = 'none';
        cardContainer.offsetHeight; // Force reflow
        cardContainer.style.animation = '';
    }

    const cardMessage = document.querySelector('.card-message');
    if (cardMessage) {
        cardMessage.style.animation = 'none';
        cardMessage.offsetHeight;
        cardMessage.style.animation = '';
    }

    const cardFooter = document.querySelector('.card-footer');
    if (cardFooter) {
        cardFooter.style.animation = 'none';
        cardFooter.offsetHeight;
        cardFooter.style.animation = '';
    }

    // Go to start
    showScreen('start-screen');
    requestAnimationFrame(() => initStartScreenDecorations());
}

/* ============================================================
   SECTION 5: FLOWER BORDER GENERATION
   ============================================================
   Creates an organic, dense, multi-species botanical garland
   around the game board. Five flower types: orange chrysanthemums,
   purple cornflowers, yellow sunflowers, white daisies, and
   pink cosmos — layered over dense dark green foliage.
   ============================================================ */

/**
 * Generate a lush, organic, multi-species botanical garland.
 * Layers: 1) Dense leaves  2) Vine backbone  3) Mixed flowers
 */
function generateFlowerBorder() {
    const container = document.getElementById('flower-border');
    if (!container) return;
    container.innerHTML = '';

    const canvasEl = document.getElementById('game-canvas');
    if (!canvasEl) return;

    const cw = canvasEl.offsetWidth;
    const ch = canvasEl.offsetHeight;
    const borderW = parseFloat(getComputedStyle(document.getElementById('game-container')).paddingLeft);

    const totalW = cw + borderW * 2;
    const totalH = ch + borderW * 2;

    const leavesList = [];
    const flowersList = [];

    /**
     * Populate elements along a path segment with organic jitter.
     * Creates overlapping layers of leaves and random flower species.
     */
    function populateGarlandPath(startX, startY, endX, endY, baseRot) {
        const dist = Math.hypot(endX - startX, endY - startY);
        const step = 10; // Ultra-dense: every 10px
        const steps = Math.floor(dist / step);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = startX + (endX - startX) * t;
            const py = startY + (endY - startY) * t;

            // Random organic jitter perpendicular to path
            const jitterX = (Math.random() - 0.5) * borderW * 0.7;
            const jitterY = (Math.random() - 0.5) * borderW * 0.7;
            const finalX = px + jitterX;
            const finalY = py + jitterY;

            const size = 11 + Math.random() * 10; // 11–21px — fits perfectly within narrow border
            const rot = baseRot + (Math.random() - 0.5) * 120;
            const animDelay = Math.random() * 5;
            const animDuration = 4 + Math.random() * 4;

            // Layer 1: Dense background leaves (2 per position for thickness)
            for (let li = 0; li < 2; li++) {
                leavesList.push({
                    x: finalX + (Math.random() - 0.5) * 6,
                    y: finalY + (Math.random() - 0.5) * 6,
                    size: size * (0.7 + Math.random() * 0.4),
                    rotation: rot + (Math.random() - 0.5) * 180,
                    delay: animDelay + Math.random(),
                    duration: animDuration
                });
            }

            // Layer 2: Flowers — weighted random selection for variety
            const rand = Math.random();
            let flowerType;
            if (rand < 0.22)       flowerType = 'chrysanthemum'; // Orange mums
            else if (rand < 0.42)  flowerType = 'cornflower';    // Purple/blue
            else if (rand < 0.58)  flowerType = 'sunflower';     // Yellow
            else if (rand < 0.74)  flowerType = 'daisy';         // White
            else if (rand < 0.87)  flowerType = 'cosmos';        // Pink
            else                   flowerType = null;             // Gap (leaves only)

            if (flowerType) {
                const fSize = flowerType === 'sunflower' ? size * 1.1 : size * (0.7 + Math.random() * 0.3);
                flowersList.push({
                    type: flowerType,
                    x: finalX - fSize / 2,
                    y: finalY - fSize / 2,
                    size: fSize,
                    rotation: Math.random() * 360,
                    delay: animDelay,
                    duration: animDuration
                });
            }
        }
    }

    // Trace the 4 edges at the garland centerline
    const margin = borderW * 0.5;

    // Top edge
    populateGarlandPath(margin, margin, totalW - margin, margin, 0);
    // Right edge
    populateGarlandPath(totalW - margin, margin, totalW - margin, totalH - margin, 90);
    // Bottom edge
    populateGarlandPath(totalW - margin, totalH - margin, margin, totalH - margin, 180);
    // Left edge
    populateGarlandPath(margin, totalH - margin, margin, margin, 270);

    // Extra density at corners (overlap for no gaps)
    const cornerPositions = [
        { x: margin, y: margin },
        { x: totalW - margin, y: margin },
        { x: totalW - margin, y: totalH - margin },
        { x: margin, y: totalH - margin }
    ];
    cornerPositions.forEach(corner => {
        for (let c = 0; c < 6; c++) {
            const cSize = 12 + Math.random() * 8;
            const cJX = (Math.random() - 0.5) * borderW * 0.5;
            const cJY = (Math.random() - 0.5) * borderW * 0.5;
            leavesList.push({
                x: corner.x + cJX,
                y: corner.y + cJY,
                size: cSize,
                rotation: Math.random() * 360,
                delay: Math.random() * 3,
                duration: 5 + Math.random() * 3
            });
            const types = ['chrysanthemum', 'cornflower', 'sunflower', 'daisy', 'cosmos'];
            flowersList.push({
                type: types[Math.floor(Math.random() * types.length)],
                x: corner.x + cJX - cSize / 2,
                y: corner.y + cJY - cSize / 2,
                size: cSize,
                rotation: Math.random() * 360,
                delay: Math.random() * 3,
                duration: 5 + Math.random() * 3
            });
        }
    });

    // --- Render Layer 1: Dense Foliage ---
    leavesList.forEach(config => {
        const leafEl = document.createElement('div');
        leafEl.className = 'leaf anim-leaf';
        leafEl.style.left = `${config.x}px`;
        leafEl.style.top = `${config.y}px`;
        leafEl.style.transform = `rotate(${config.rotation}deg)`;
        leafEl.style.setProperty('--anim-delay', `${config.delay}s`);
        leafEl.style.setProperty('--anim-duration', `${config.duration}s`);
        leafEl.style.setProperty('--leaf-start', `${-3 + Math.random() * 6}deg`);
        leafEl.style.setProperty('--leaf-mid', `${Math.random() * 4}deg`);
        leafEl.style.setProperty('--leaf-end', `${-2 + Math.random() * 4}deg`);
        leafEl.innerHTML = createLeafSVG(config.size);
        container.appendChild(leafEl);
    });

    // --- Render Layer 2: Flowers (all species mixed) ---
    flowersList.forEach(config => {
        const flowerEl = document.createElement('div');
        flowerEl.className = `flower flower--md anim-sway anim-bloom`;
        flowerEl.style.left = `${config.x}px`;
        flowerEl.style.top = `${config.y}px`;
        flowerEl.style.setProperty('--anim-delay', `${config.delay}s`);
        flowerEl.style.setProperty('--anim-duration', `${config.duration}s`);
        flowerEl.style.setProperty('--sway-start', `${-1.5 + Math.random() * 3}deg`);
        flowerEl.style.setProperty('--sway-end', `${Math.random() * 3}deg`);
        flowerEl.style.transform = `rotate(${config.rotation}deg)`;

        let svgContent;
        switch (config.type) {
            case 'chrysanthemum': svgContent = createChrysanthemumSVG(config.size); break;
            case 'cornflower':    svgContent = createCornflowerSVG(config.size);    break;
            case 'sunflower':     svgContent = createSunflowerSVG(config.size);     break;
            case 'daisy':         svgContent = createDaisySVG(config.size);         break;
            case 'cosmos':        svgContent = createCosmosSVG(config.size);        break;
            default:              svgContent = createWhiteFlowerSVG(config.size);
        }

        flowerEl.innerHTML = svgContent;
        container.appendChild(flowerEl);
    });

    // --- Render Layer 3: Delicate vine underlines ---
    createVineLines(container, cw, ch, borderW);
}

/* ============================================================
   SECTION 6: SVG FLOWER GENERATORS — Pixel Art
   ============================================================ */

/**
 * Helper to convert a matrix of color codes into a pixel art SVG.
 * @param {Array<Array<number>>} matrix - Grid of color codes
 * @param {Object} colors - Map of color code to hex value
 * @param {number} size - Desired output width/height in px
 */
function matrixToPixelSVG(matrix, colors, size) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const pSize = 1; // logical pixel size inside viewBox
    
    let rects = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const code = matrix[r][c];
            if (code === 0) continue;
            const fill = colors[code] || '#FFFFFF';
            rects += `<rect x="${c}" y="${r}" width="${pSize}" height="${pSize}" fill="${fill}" />`;
        }
    }
    
    return `<svg viewBox="0 0 ${cols} ${rows}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges;">
        ${rects}
    </svg>`;
}

/**
 * Orange Chrysanthemum in pixel art (Now Purple/Burgundy variation).
 */
function createChrysanthemumSVG(size) {
    const matrix = [
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,2,3,3,2,1,0,0],
        [0,1,2,2,3,3,2,2,1,0],
        [1,3,2,2,4,4,2,2,3,1],
        [1,3,3,4,4,4,4,3,3,1],
        [1,3,3,4,4,4,4,3,3,1],
        [1,3,2,2,4,4,2,2,3,1],
        [0,1,2,2,3,3,2,2,1,0],
        [0,0,1,2,3,3,2,1,0,0],
        [0,0,0,1,1,1,1,0,0,0]
    ];
    const colors = {
        1: '#231F20', // Outline
        2: '#5D2986', // Deep purple
        3: '#8D3FA1', // Violet-purple
        4: '#4A0818'  // Dark burgundy center
    };
    return matrixToPixelSVG(matrix, colors, size);
}

/**
 * Purple Cornflower in pixel art.
 */
function createCornflowerSVG(size) {
    const matrix = [
        [0,0,1,1,0,0,1,1,0,0],
        [0,1,2,2,1,1,2,2,1,0],
        [1,2,3,3,2,2,3,3,2,1],
        [1,2,3,3,3,3,3,3,2,1],
        [0,1,2,3,4,4,3,2,1,0],
        [0,1,2,3,4,4,3,2,1,0],
        [1,2,3,3,3,3,3,3,2,1],
        [1,2,3,3,2,2,3,3,2,1],
        [0,1,2,2,1,1,2,2,1,0],
        [0,0,1,1,0,0,1,1,0,0]
    ];
    const colors = {
        1: '#231F20', // Outline
        2: '#4A0D22', // Dark Burgundy
        3: '#721C3A', // Medium Burgundy
        4: '#9B5B9C'  // Bright Purple center
    };
    return matrixToPixelSVG(matrix, colors, size);
}

/**
 * Yellow Sunflower in pixel art (Now Purple/Burgundy variation).
 */
function createSunflowerSVG(size) {
    const matrix = [
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,2,2,1,0],
        [1,2,2,3,3,3,3,2,2,1],
        [1,2,2,3,3,3,3,2,2,1],
        [1,2,2,3,3,3,3,2,2,1],
        [1,2,2,3,3,3,3,2,2,1],
        [0,1,2,2,2,2,2,2,1,0],
        [0,0,1,2,2,2,2,1,0,0],
        [0,0,0,1,1,1,1,0,0,0]
    ];
    const colors = {
        1: '#231F20', // Outline
        2: '#800020', // Burgundy
        3: '#3A001A'  // Deep dark plum center
    };
    return matrixToPixelSVG(matrix, colors, size);
}

/**
 * White Daisy in pixel art (Now Violet/Purple variation).
 */
function createDaisySVG(size) {
    const matrix = [
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,2,2,1,0],
        [1,2,2,3,3,3,3,2,2,1],
        [1,2,2,3,3,3,3,2,2,1],
        [1,2,2,3,3,3,3,2,2,1],
        [1,2,2,3,3,3,3,2,2,1],
        [0,1,2,2,2,2,2,2,1,0],
        [0,0,1,2,2,2,2,1,0,0],
        [0,0,0,1,1,1,1,0,0,0]
    ];
    const colors = {
        1: '#231F20', // Outline
        2: '#C39BD3', // Soft lavender
        3: '#5B2C6F'  // Violet center
    };
    return matrixToPixelSVG(matrix, colors, size);
}

/**
 * Pink Cosmos in pixel art (Now Plum/Burgundy variation).
 */
function createCosmosSVG(size) {
    const matrix = [
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,2,2,2,2,1,0,0],
        [0,1,2,2,3,3,2,2,1,0],
        [1,2,3,3,4,4,3,3,2,1],
        [1,2,3,4,4,4,4,3,2,1],
        [1,2,3,4,4,4,4,3,2,1],
        [1,2,3,3,4,4,3,3,2,1],
        [0,1,2,2,3,3,2,2,1,0],
        [0,0,1,2,2,2,2,1,0,0],
        [0,0,0,1,1,1,1,0,0,0]
    ];
    const colors = {
        1: '#231F20', // Outline
        2: '#6C3483', // Purple
        3: '#A569BD', // Light purple
        4: '#4A0818'  // Burgundy center
    };
    return matrixToPixelSVG(matrix, colors, size);
}

/**
 * Fallback White Flower.
 */
function createWhiteFlowerSVG(size) {
    return createDaisySVG(size);
}

/**
 * Pixel Art Leaf.
 */
function createLeafSVG(size) {
    const matrix = [
        [0,0,0,0,1,1,0,0,0,0],
        [0,0,0,1,2,2,1,0,0,0],
        [0,0,1,2,3,2,2,1,0,0],
        [0,0,1,2,2,3,2,1,0,0],
        [0,1,2,2,2,2,3,2,1,0],
        [0,1,2,2,2,2,2,2,1,0],
        [0,0,1,2,2,2,2,1,0,0],
        [0,0,0,1,2,2,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]
    ];
    const colors = {
        1: '#231F20', // Outline
        2: '#1E372C', // Dark Green
        3: '#2C4D3E'  // Highlight Green
    };
    return matrixToPixelSVG(matrix, colors, size);
}

/**
 * Create a mini flower for falling petals animation.
 */
function createMiniFlowerSVG(size, petalColor, centerColor) {
    const half = size / 2;
    const pr = half * 0.35;
    let petals = '';
    for (let i = 0; i < 5; i++) {
        const angle = (360 / 5) * i;
        petals += `<ellipse cx="${half}" cy="${half * 0.4}" rx="${pr * 0.5}" ry="${pr}" 
                    fill="${petalColor}" opacity="0.85" 
                    transform="rotate(${angle}, ${half}, ${half})"/>`;
    }
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        ${petals}
        <circle cx="${half}" cy="${half}" r="${half * 0.15}" fill="${centerColor}"/>
    </svg>`;
}

/**
 * Create a single falling petal SVG.
 */
function createSinglePetalSVG(size, color) {
    const half = size / 2;
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="${half}" cy="${half}" rx="${half * 0.4}" ry="${half * 0.75}" 
                 fill="${color}" opacity="0.8" transform="rotate(${Math.random() * 40 - 20}, ${half}, ${half})"/>
    </svg>`;
}

/**
 * Create decorative vine lines along the border edges.
 */
function createVineLines(container, cw, ch, borderW) {
    const positions = [
        { w: cw + 20, h: 16, dir: 'horizontal', left: borderW - 10, top: borderW - 10 },
        { w: cw + 20, h: 16, dir: 'horizontal', left: borderW - 10, top: borderW + ch + 2 },
        { w: 16, h: ch + 20, dir: 'vertical', left: borderW - 10, top: borderW - 10 },
        { w: 16, h: ch + 20, dir: 'vertical', left: borderW + cw + 2, top: borderW - 10 }
    ];

    positions.forEach(pos => {
        const vine = createVineSVG(pos.w, pos.h, pos.dir);
        vine.style.left = `${pos.left}px`;
        vine.style.top = `${pos.top}px`;
        container.appendChild(vine);
    });
}

/**
 * Create a single wavy vine SVG element.
 */
function createVineSVG(width, height, orientation) {
    const el = document.createElement('div');
    el.className = 'vine-line';
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;

    let path;
    if (orientation === 'horizontal') {
        const segments = Math.ceil(width / 30);
        let d = `M0,${height / 2}`;
        for (let i = 0; i < segments; i++) {
            const x1 = (i + 0.5) * (width / segments);
            const y1 = i % 2 === 0 ? height * 0.2 : height * 0.8;
            const x2 = (i + 1) * (width / segments);
            const y2 = height / 2;
            d += ` Q${x1},${y1} ${x2},${y2}`;
        }
        path = d;
    } else {
        const segments = Math.ceil(height / 30);
        let d = `M${width / 2},0`;
        for (let i = 0; i < segments; i++) {
            const x1 = i % 2 === 0 ? width * 0.2 : width * 0.8;
            const y1 = (i + 0.5) * (height / segments);
            const x2 = width / 2;
            const y2 = (i + 1) * (height / segments);
            d += ` Q${x1},${y1} ${x2},${y2}`;
        }
        path = d;
    }

    el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <path d="${path}" fill="none" stroke="#4A7A4A" stroke-width="1" stroke-linecap="round" opacity="0.3"/>
    </svg>`;

    return el;
}

/* ============================================================
   SECTION 7: DOM READY — Initialize Everything
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for fonts to load before initializing
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            initStartScreen();
            setupMobileControls();
        });
    } else {
        // Fallback: init after a short delay
        setTimeout(() => {
            initStartScreen();
            setupMobileControls();
        }, 500);
    }

    // Play again button
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', playAgain);
    }
});
