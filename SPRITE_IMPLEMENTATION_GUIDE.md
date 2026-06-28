# 🎨 Guía de Implementación de Sprites — Perrito Taquero

Este documento describe cómo se implementaron los sprites en el proyecto para que cualquier agente o desarrollador pueda agregar nuevos sprites siguiendo los mismos patrones.

---

## 📁 Estructura de Archivos del Proyecto

```
d:\Dalexa\14\
├── assets/
│   ├── sprites/                         ← Sprites PNG genéricos (decoraciones, objetos)
│   │   ├── bts music.png               ← Mesa de música BTS
│   │   └── house.png                   ← Casita del perro
│   ├── recortes perros fase 1/          ← Sprites PNG del perro (fase 1 / pelo corto)
│   │   ├── standing1.png               ← Perro parado (idle)
│   │   ├── rigth1.png                  ← Perro caminando frame 1
│   │   └── right2.png                  ← Perro caminando frame 2
│   └── fonts/
│       └── ...
├── js/
│   ├── game.js                          ← Lógica del juego (estado, colisiones, input)
│   ├── render.js                        ← Motor de renderizado en canvas (AQUÍ SE DIBUJAN LOS SPRITES)
│   └── screens.js                       ← Manejo de pantallas y flores del borde
├── css/
│   ├── main.css
│   ├── flowers.css
│   └── screens.css
├── index.html
└── sprite_implementation_guide.md       ← ESTA GUÍA
```

---

## 🖼️ Dos Sistemas de Sprites

El juego usa **dos sistemas diferentes** para dibujar sprites. Es importante entender cuándo usar cada uno:

### Sistema 1: Sprites de Imagen PNG (archivos `.png`)

Se usan para elementos que **requieren detalle visual real** o provienen de recortes de fotos/ilustraciones.

| Sprite | Archivo | Uso |
|--------|---------|-----|
| Mesa de música BTS | `assets/sprites/bts music.png` | Decoración estática centrada arriba |
| Casita del perro | `assets/sprites/house.png` | Decoración estática esquina superior izquierda |
| Perro parado (idle) | `assets/recortes perros fase 1/standing1.png` | Estado base del perro cuando no se mueve |
| Perro caminando F1 | `assets/recortes perros fase 1/rigth1.png` | Frame 1 de animación de caminar |
| Perro caminando F2 | `assets/recortes perros fase 1/right2.png` | Frame 2 de animación de caminar |

### Sistema 2: Matrices de Pixel Art (dibujadas directamente en canvas)

Se usan para elementos **pequeños que necesitan escalar limpiamente** al tamaño de la celda del grid. Cada sprite se define como una **matriz numérica 2D** donde cada número representa un color.

| Sprite | Tamaño Matriz | Ubicación en código |
|--------|---------------|---------------------|
| Taco (comida) | 12×12 | `js/render.js` -> `drawFood()` |
| Manzana dorada | 12×12 | `js/render.js` -> `drawFood()` |
| Plato de cerámica | rects | `js/render.js` -> `drawFood()` |
| Bowl de comida | 12×12 | `js/render.js` -> `drawObstacles()` |
| Pelota de tenis | 12×12 | `js/render.js` -> `drawObstacles()` |
| Estrella de juguete | 12×12 | `js/render.js` -> `drawObstacles()` |
| Perro evolucionado | 36×36 | `js/render.js` -> `drawSnake()` |
| Flores del borde | 10×10 | `js/screens.js` -> sección 6 |

---

## 🔧 Cómo Funciona Cada Sistema

### Sistema 1: Agregar un Nuevo Sprite PNG

#### 1. Colocar el archivo
Coloca el archivo `.png` en:
- **Objetos generales** → `assets/sprites/`
- **Sprites del perro** → `assets/recortes perros fase N/`

#### 2. Pre-cargar la imagen en `js/render.js`
Todas las imágenes se pre-cargan al inicio del archivo:

```javascript
const miNuevoSpriteImg = new Image();
miNuevoSpriteImg.src = 'assets/sprites/mi_imagen.png';
```

*Nota: No hagas `new Image()` dentro de funciones que se dibujan cada frame para evitar problemas de rendimiento.*

#### 3. Crear una función de dibujado
Ejemplo para un sprite estático:

```javascript
function drawMiNuevoSprite() {
    if (!miNuevoSpriteImg.complete || miNuevoSpriteImg.naturalWidth === 0) return;

    ctx.save();
    
    // Calcular tamaño proporcional al cellSize
    const spriteH = cellSize * 4;  // 4 celdas de alto
    const aspectRatio = miNuevoSpriteImg.naturalWidth / miNuevoSpriteImg.naturalHeight;
    const spriteW = spriteH * aspectRatio;
    
    // Sombra suave (opcional)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.drawImage(miNuevoSpriteImg, posX, posY, spriteW, spriteH);
    ctx.restore();
}
```

#### 4. Llamar la función en `renderFrame()`
Agrégala en el orden de capas que necesites dentro de `renderFrame()`.

---

### Sistema 2: Agregar un Nuevo Sprite de Pixel Art (Matriz)

#### 1. Diseñar la matriz
Define un array 2D donde `0` es transparente y los demás números representan colores:

```javascript
const huesoMatrix = [
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,1,2,2,1,0,0,1,2,2,1,0],
    [0,1,3,2,1,0,0,1,2,3,1,0],
    [0,0,1,2,1,1,1,1,2,1,0,0],
    [0,0,0,1,2,2,2,2,1,0,0,0]
];
```

#### 2. Definir el mapa de colores
```javascript
const huesoColors = {
    1: '#231F20', // Outline
    2: '#F5F2E7', // Relleno
    3: '#FFFFFF'  // Brillo
};
```

#### 3. Dibujar con `drawMatrixObject()`
Usa el helper disponible en `render.js`:

```javascript
function drawMiSpritePixelArt(gridX, gridY) {
    const px = gridX * cellSize;
    const py = gridY * cellSize;
    
    ctx.save();
    ctx.translate(px, py);

    const pSize = Math.max(1, Math.floor(cellSize / 12));
    const offset = Math.floor((cellSize - (pSize * 12)) / 2);
    ctx.translate(offset, offset);

    drawMatrixObject(huesoMatrix, huesoColors, pSize);
    ctx.restore();
}
```

---

## 🐕 Sistema de Animación del Perro

El estado de movimiento se controla mediante `isDogMoving` y `moveFrameToggle`.

- **Parado (idle)**: Dibuja `standing1.png`
- **Movimiento**: Alterna entre `rigth1.png` y `right2.png` cada tick.
- **Evolución**: Si `furLevel >= 5`, se dibuja el perro con la matriz pixel art 36×36 en lugar de las imágenes PNG.

Para añadir más fases de pelo, puedes crear `assets/recortes perros fase 2/` y condicionar qué imágenes cargar según `currentFur` en `drawSnake()`.

---

## 🚫 Errores Comunes a Evitar

- **No instanciar `new Image()` dentro de funciones de bucle** (causa parpadeos y bajo rendimiento).
- **Olvidar hacer `ctx.save()` y `ctx.restore()`** al rotar o trasladar el contexto.
- **Usar tamaños de pixel fijos** en vez de basarse en múltiplos de `cellSize` (lo que rompería el escalado responsivo).
