/* ============================================================
   GAME.JS — Snake Game Logic (Word-by-Word Mechanic)
   ============================================================
   Core game mechanics: movement, collision detection, food/bone
   spawning, message word tracking, speed management, input.
   The snake eats 5 tacos 🌮 to make a special golden bone 🦴
   spawn. Eating the bone reveals the next word in the message.
   ============================================================ */

/* ============================================================
   SECTION 1: GAME CONSTANTS & CONFIGURATION
   ============================================================ */

/** Grid dimensions (rectangular — wider than tall) */
const GRID_COLS = 32;
const GRID_ROWS = 18;

/** Speed settings (milliseconds per game tick) */
const INITIAL_SPEED = 220;
const SPEED_INCREMENT = 1.2;    // speed increase step
const MIN_SPEED = 85;           // speed cap

/** Starting snake length */
const INITIAL_SNAKE_LENGTH = 1;

/**
 * The secret message to reveal.
 * Replace this with your own message!
 */
const SECRET_MESSAGE = "Hola mi amor, esta carta es especialmente para ti. Quiero que sepas que cada momento a tu lado es un regalo que atesoro con todo mi corazón. Tu sonrisa ilumina mis días y tu risa es la melodía más bonita del mundo. Gracias por estar siempre a mi lado. Eres la persona más increíble que conozco. Te amo con todo mi ser, hoy y por siempre.";

/**
 * Split the message into words.
 */
const MESSAGE_WORDS = SECRET_MESSAGE.split(/\s+/);

/* ============================================================
   SECTION 2: GAME STATE
   ============================================================ */

/** Snake body: array of {x, y} positions. Index 0 = head. */
let snake = [];

/** Current movement direction */
let direction = { x: 1, y: 0 };

/** Queued direction */
let nextDirection = { x: 1, y: 0 };

/** Food (taco/bone) position */
let food = { x: 0, y: 0 };

/** Tacos eaten since last bone */
let tacosEatenCount = 0;

/** Words revealed so far */
let revealedWordCount = 0;

/** Is the special bone currently spawned? */
let isBoneSpawned = false;

/** Is the game currently running? */
let gameRunning = false;

/** Game loop interval ID */
let gameLoop = null;

/** Current speed (ms per tick) */
let speed = INITIAL_SPEED;

/** Is the game paused? */
let isPaused = false;

/** Taco spawn animation timestamp */
let tacoSpawnTime = 0;

/** Last tick timestamp (ms) — for throttling held keys */
let lastTickTime = 0;

/** Death animation flag */
let isDying = false;

/** Track if the game has been won */
let hasWon = false;

/** Fur growth level (increases each taco eaten, visual only) */
let furLevel = 0;

/** How many body segments to grow (classic snake mechanic) */
let growCounter = 0;

/** Dog stops after eating, waiting for next input */
let waitingAfterEat = false;

/** Which taco sprite to show (1 or 2), picked randomly on each spawn */
let currentTacoVariant = 1;

/** Has the phase 8 modal been shown? */
let phaseModalShown = false;

/** Solid obstacles scattered on the grass board */
const OBSTACLES = (function generateObstacles() {
    const arr = [];
    // BTS music table: centered at top (columns 13-18, rows 0-4)
    for (let x = 13; x <= 18; x++) {
        for (let y = 0; y <= 4; y++) {
            arr.push({ x, y });
        }
    }
    return arr;
})();

/* ============================================================
   SECTION 3: GAME INITIALIZATION
   ============================================================ */

/**
 * Initialize/reset the game state to starting conditions.
 */
function initGame() {
    const startX = Math.floor(GRID_COLS / 2);
    const startY = Math.floor(GRID_ROWS / 2);

    snake = [{ x: startX, y: startY }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    tacosEatenCount = 0;
    revealedWordCount = 0;
    isBoneSpawned = false;
    speed = INITIAL_SPEED;
    isPaused = false;
    isDying = false;
    hasWon = false;
    furLevel = 0;
    growCounter = 0;
    waitingAfterEat = false;
    phaseModalShown = false;
    lastTickTime = 0;
    if (typeof updatePortrait === 'function') updatePortrait(1);

    // Resetear variables de movimiento del render.js
    if (typeof isDogMoving !== 'undefined') isDogMoving = false;
    if (typeof moveFrameToggle !== 'undefined') moveFrameToggle = false;
    if (typeof lastDogDirX !== 'undefined') lastDogDirX = 1;

    // Spawn first taco
    spawnFood();

    // Update UI
    updateProgressDisplay();
    updateHUD();
}

/**
 * Start the game loop with setInterval for continuous snake movement.
 */
function startGameLoop() {
    gameRunning = true;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameTick, speed);
}

/**
 * Stop the game loop.
 */
function stopGameLoop() {
    gameRunning = false;
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
}

/**
 * Restart the game loop (e.g., after speed changes).
 */
function restartGameLoop() {
    if (gameRunning) {
        stopGameLoop();
        startGameLoop();
    }
}

/* ============================================================
   SECTION 4: GAME TICK — Main Update Loop
   ============================================================ */

function gameTick() {
    if (isPaused || isDying) return;

    // Apply direction
    direction = { ...nextDirection };

    // Indicar que se está moviendo y alternar fotograma de la animación
    if (typeof isDogMoving !== 'undefined') isDogMoving = true;
    if (typeof moveFrameToggle !== 'undefined') moveFrameToggle = !moveFrameToggle;

    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };

    // Border collision kills
    if (newHead.x < 0 || newHead.x >= GRID_COLS || newHead.y < 0 || newHead.y >= GRID_ROWS) {
        handleDeath();
        return;
    }

    // Obstacle collision check
    for (const obs of OBSTACLES) {
        if (obs.x === newHead.x && obs.y === newHead.y) {
            handleDeath();
            return;
        }
    }

    // Self-collision — skip tail segment when it will move away this tick
    const bodyCheckLimit = growCounter > 0 ? snake.length : snake.length - 1;
    for (let i = 0; i < bodyCheckLimit; i++) {
        if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
            handleDeath();
            return;
        }
    }

    // Move: add new head to front
    snake.unshift(newHead);

    // Handle growth: keep the tail if growing, otherwise pop it
    if (growCounter > 0) {
        growCounter--;
    } else {
        snake.pop();
    }

    // Check food collision
    if (newHead.x === food.x && newHead.y === food.y) {
        const wasBone = isBoneSpawned;
        handleEatTaco();
        if (hasWon) return;

        // If it was the bone (phase change), stop and show standing sprite
        if (wasBone) {
            waitingAfterEat = true;
            stopGameLoop();
            if (typeof isDogMoving !== 'undefined') isDogMoving = false;
            renderFrame();
            return;
        }
    }

    // Render frame
    renderFrame();
}

/* ============================================================
   SECTION 5: FOOD / TACO / APPLE MECHANICS
   ============================================================ */

/**
 * Spawn food. If tacosEatenCount is 5, the food spawned will be the special bone.
 */
function spawnFood() {
    const occupied = new Set();
    for (const seg of snake) {
        occupied.add(`${seg.x},${seg.y}`);
    }

    const emptyCells = [];
    for (let x = 0; x < GRID_COLS; x++) {
        for (let y = 0; y < GRID_ROWS; y++) {
            // Block obstacles
            let isObstacle = false;
            for (const obs of OBSTACLES) {
                if (x === obs.x && y === obs.y) {
                    isObstacle = true;
                    break;
                }
            }
            if (isObstacle) continue;
            
            if (!occupied.has(`${x},${y}`)) {
                emptyCells.push({ x, y });
            }
        }
    }

    if (emptyCells.length === 0) {
        handleWin();
        return;
    }

    const idx = Math.floor(Math.random() * emptyCells.length);
    food = emptyCells[idx];
    tacoSpawnTime = performance.now();

    // Check if we need to spawn the special bone
    if (tacosEatenCount >= 4) {
        isBoneSpawned = true;
    } else {
        isBoneSpawned = false;
        // Randomly pick which taco sprite to show
        currentTacoVariant = Math.random() < 0.5 ? 1 : 2;
    }
}

function handleEatTaco() {
    furLevel++;
    growCounter++;

    if (isBoneSpawned) {
        revealedWordCount++;
        tacosEatenCount = 0;
        isBoneSpawned = false;

        const newPhase = Math.min(8, revealedWordCount + 1);
        speed = Math.max(MIN_SPEED, INITIAL_SPEED - (newPhase - 1) * 20);
        restartGameLoop();
        if (typeof updatePortrait === 'function') {
            updatePortrait(newPhase);
        }

        // Show phase 8 modal when reaching final phase
        if (newPhase === 8 && !phaseModalShown) {
            phaseModalShown = true;
            stopGameLoop();
            setTimeout(() => {
                if (typeof showPhaseModal === 'function') {
                    showPhaseModal();
                }
            }, 400);
        }

        if (typeof drawCollectEffect === 'function') {
            drawCollectEffect(food.x, food.y);
        }

        if (typeof triggerBoneCelebration === 'function') {
            triggerBoneCelebration(revealedWordCount);
        }

        // Check if message is fully complete
        if (revealedWordCount >= MESSAGE_WORDS.length) {
            handleWin();
            return;
        }
    } else {
        tacosEatenCount++;

        if (typeof drawCollectEffect === 'function') {
            drawCollectEffect(food.x, food.y);
        }
    }

    // Spawn next food
    spawnFood();

    // Update UI
    updateProgressDisplay();
    updateHUD();
}

/* ============================================================
   SECTION 6: DEATH & WIN CONDITIONS
   ============================================================ */

function handleDeath() {
    isDying = true;
    stopGameLoop();

    const overlay = document.getElementById('death-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function retryGame() {
    const overlay = document.getElementById('death-overlay');
    if (overlay) overlay.style.display = 'none';
    isDying = false;
    initGame();
    renderFrame();
    // Game will start on first input
}

function showScissorsMsg(text) {
    const el = document.getElementById('scissors-msg');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function haircutReset() {
    const currentPhase = revealedWordCount + 1;

    if (currentPhase < 7) {
        showScissorsMsg('Todavía no puedes cortarle el pelo hasta la fase 7');
        return;
    }

    furLevel = 0;
    revealedWordCount = 0;
    isBoneSpawned = false;
    phaseModalShown = false;
    tacosEatenCount = 0;
    if (typeof updatePortrait === 'function') updatePortrait(1);

    updateProgressDisplay();
    updateHUD();
    spawnFood();
    renderFrame();

    if (!gameRunning && typeof startGameLoop === 'function') {
        startGameLoop();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const scissorsFrame = document.getElementById('scissors-frame');
    if (scissorsFrame) {
        scissorsFrame.addEventListener('click', haircutReset);
    }
});

function handleWin() {
    hasWon = true;
    stopGameLoop();

    setTimeout(() => {
        if (typeof showEndScreen === 'function') {
            showEndScreen();
        }
    }, 800);
}

/* ============================================================
   SECTION 7: UI UPDATES
   ============================================================ */

/**
 * Update word progress display.
 */
function updateProgressDisplay() {
    const progressEl = document.getElementById('message-progress');
    if (!progressEl) return;

    let html = '';
    for (let i = 0; i < MESSAGE_WORDS.length; i++) {
        const word = MESSAGE_WORDS[i];
        if (i < revealedWordCount) {
            html += `<span class="revealed">${word}</span> `;
        } else {
            // Replace letters with dots
            const dots = word.replace(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, '•');
            html += `<span class="hidden-char">${dots}</span> `;
        }
    }

    progressEl.innerHTML = html.trim();
}

/**
 * Update the HUD.
 */
function updateHUD() {
    const tacoEl = document.getElementById('taco-count');
    if (tacoEl) {
        if (isBoneSpawned) {
            tacoEl.innerHTML = `🦴 <span style="color: var(--color-gold-light); font-weight: bold; animation: pulse 1s infinite;">¡Come el Hueso para revelar la siguiente palabra!</span>`;
        } else {
            tacoEl.textContent = `🌮 Tacos para hueso: ${tacosEatenCount} / 4`;
        }
    }

    const lettersEl = document.getElementById('hud-letters');
    if (lettersEl) {
        const bonesShown = Math.min(revealedWordCount, 7);
        lettersEl.innerHTML = `🦴 Huesos: <span>${bonesShown}</span> / 7`;
    }

    const speedEl = document.getElementById('hud-speed');
    if (speedEl) {
        const speedPercent = Math.round(((INITIAL_SPEED - speed) / (INITIAL_SPEED - MIN_SPEED)) * 100);
        speedEl.innerHTML = `Velocidad: <span>${speedPercent}%</span>`;
    }
}

/* ============================================================
   SECTION 8: INPUT HANDLING — Keyboard
   ============================================================ */

document.addEventListener('keydown', (e) => {
    if (isDying) return;

    // If dog is waiting after eating bone (phase change), wake it up on any key
    if (waitingAfterEat) {
        const dirKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D'];
        if (dirKeys.includes(e.key)) {
            e.preventDefault();
            waitingAfterEat = false;
            // Set direction from the key pressed
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
                    break;
                case 'ArrowDown': case 's': case 'S':
                    if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft': case 'a': case 'A':
                    if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
                    break;
                case 'ArrowRight': case 'd': case 'D':
                    if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
                    break;
            }
            startGameLoop();
            return;
        }
        return;
    }

    // First key press — start the game with this direction (no reverse guard)
    if (!gameRunning && !isPaused) {
        const dirKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D'];
        if (dirKeys.includes(e.key)) {
            e.preventDefault();
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W': nextDirection = { x: 0, y: -1 }; break;
                case 'ArrowDown': case 's': case 'S': nextDirection = { x: 0, y: 1 }; break;
                case 'ArrowLeft': case 'a': case 'A': nextDirection = { x: -1, y: 0 }; break;
                case 'ArrowRight': case 'd': case 'D': nextDirection = { x: 1, y: 0 }; break;
            }
            startGameLoop();
            return;
        }
        return;
    }

    if (isPaused) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y === 1) break;
            nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y === -1) break;
            nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x === 1) break;
            nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x === -1) break;
            nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
        case 'p':
        case 'P':
            isPaused = !isPaused;
            if (isPaused) {
                stopGameLoop();
            } else {
                startGameLoop();
            }
            renderFrame();
            break;
    }
});

// No keyup handler needed for continuous snake movement

/* ============================================================
   SECTION 9: INPUT HANDLING — Touch / Swipe (Mobile)
   ============================================================ */

let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (isDying) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

    let newDir = null;
    if (!gameRunning) {
        // First swipe — no reverse guard
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) newDir = { x: 1, y: 0 };
            else newDir = { x: -1, y: 0 };
        } else {
            if (dy > 0) newDir = { x: 0, y: 1 };
            else newDir = { x: 0, y: -1 };
        }
    } else {
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && direction.x !== -1) newDir = { x: 1, y: 0 };
            else if (dx < 0 && direction.x !== 1) newDir = { x: -1, y: 0 };
        } else {
            if (dy > 0 && direction.y !== -1) newDir = { x: 0, y: 1 };
            else if (dy < 0 && direction.y !== 1) newDir = { x: 0, y: -1 };
        }
    }

    if (newDir) {
        nextDirection = newDir;
        if (waitingAfterEat) {
            waitingAfterEat = false;
        }
        if (!gameRunning || waitingAfterEat) {
            startGameLoop();
        }
    }
}, { passive: true });

/* ============================================================
   SECTION 10: MOBILE D-PAD BUTTON HANDLING
   ============================================================ */
function setupMobileControls() {
    const btnUp    = document.getElementById('ctrl-up');
    const btnDown  = document.getElementById('ctrl-down');
    const btnLeft  = document.getElementById('ctrl-left');
    const btnRight = document.getElementById('ctrl-right');

    function handleDpad(dirCheck, newDir) {
        return (e) => {
            e.preventDefault();
            if (isDying) return;
            // First input: no reverse guard, start game loop
            if (!gameRunning) {
                nextDirection = newDir;
                startGameLoop();
                return;
            }
            if (dirCheck()) return; // prevent reverse
            nextDirection = newDir;
            if (waitingAfterEat) {
                waitingAfterEat = false;
                startGameLoop();
            }
        };
    }

    function bindDpad(btn, dirCheck, newDir) {
        if (!btn) return;
        const handler = handleDpad(dirCheck, newDir);
        btn.addEventListener('touchstart', handler, { passive: false });
        btn.addEventListener('mousedown', handler);
    }

    bindDpad(btnUp, () => direction.y === 1, { x: 0, y: -1 });
    bindDpad(btnDown, () => direction.y === -1, { x: 0, y: 1 });
    bindDpad(btnLeft, () => direction.x === 1, { x: -1, y: 0 });
    bindDpad(btnRight, () => direction.x === -1, { x: 1, y: 0 });
}

/**
 * Check if the full message has been collected.
 */
function isMessageComplete() {
    return revealedWordCount >= MESSAGE_WORDS.length;
}
