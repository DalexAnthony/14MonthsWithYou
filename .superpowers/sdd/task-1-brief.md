### Task 1: HTML Scaffold + Three.js Scene

**Files:**
- Create: `carpeta-de-prueba/index.html`

**Interfaces:**
- Consumes: nothing
- Produces: Three.js scene with renderer, camera, lights, and animation loop

- [ ] **Step 1: Create HTML with Three.js CDN**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Encuentro Romántico</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #1a1a2e; font-family: 'Segoe UI', Arial, sans-serif; }
    canvas { display: block; }

    #ui-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 10;
    }
    #clue-counter {
      position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
      color: #fff; font-size: 18px; background: rgba(0,0,0,0.6);
      padding: 8px 20px; border-radius: 20px; font-weight: 600;
      letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.2);
    }
    #dialogue-box {
      position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
      width: 80%; max-width: 600px;
      background: rgba(0,0,0,0.75); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px; padding: 20px 28px;
      color: #fff; font-size: 17px; line-height: 1.6;
      opacity: 0; transition: opacity 0.5s ease;
      backdrop-filter: blur(8px);
    }
    #dialogue-box.visible { opacity: 1; }
    #interact-hint {
      position: absolute; bottom: 130px; left: 50%; transform: translateX(-50%);
      color: #ffd700; font-size: 14px; background: rgba(0,0,0,0.5);
      padding: 6px 16px; border-radius: 12px;
      opacity: 0; transition: opacity 0.3s;
    }
    #interact-hint.visible { opacity: 1; }

    #controls-hint {
      position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.4); font-size: 13px;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>

<div id="ui-overlay">
  <div id="clue-counter">✦ Pista 0 / 6</div>
  <div id="interact-hint">Presiona ESPACIO para interactuar</div>
  <div id="dialogue-box"></div>
  <div id="controls-hint">← →  para girar el mundo</div>
</div>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
  }
}
</script>

<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 30, 50);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 10, 16);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.prepend(renderer.domElement);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3a7d44, 0.6);
scene.add(hemisphereLight);

const sunLight = new THREE.DirectionalLight(0xffeedd, 1.8);
sunLight.position.set(10, 20, 5);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 40;
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -20;
scene.add(sunLight);

// --- World Group (rotates) ---
const worldGroup = new THREE.Group();
scene.add(worldGroup);

// --- Ground ---
const groundGeometry = new THREE.CircleGeometry(18, 64);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4a9e4a, roughness: 0.8 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
worldGroup.add(ground);

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Placeholder exports for other tasks ---
window.__scene = scene;
window.__camera = camera;
window.__worldGroup = worldGroup;
window.__renderer = renderer;
</script>
</body>
</html>
```

- [ ] **Step 2: Verify scene loads**

Open `index.html` in browser. Expected: green ground, sky blue background, lighting visible.

- [ ] **Step 3: Commit**
