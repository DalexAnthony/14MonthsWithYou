### Task 6: Polish — Camera, Transitions, Particles, UI Fixes

**Files:**
- Modify: `carpeta-de-prueba/index.html`

- [ ] **Step 1: Remove unused OrbitControls import (line 66)**

Change: `import { OrbitControls } from '...';`
To: (remove the line, as OrbitControls is never used)

- [ ] **Step 2: Prevent Space from scrolling page**

Add this near the top of the script, after the imports:

```javascript
// Prevent Space from scrolling
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Spacebar') e.preventDefault();
});
```

- [ ] **Step 3: Add click-to-dismiss dialogue**

Add after the Space keydown handler in the interaction system:

```javascript
// Click to dismiss dialogue
document.addEventListener('click', () => {
  dialogueBox.classList.remove('visible');
});
```

- [ ] **Step 4: Add ambient particles**

Add this code near the end of the script (before `// --- World Rotation ---`):

```javascript
// --- Ambient Particles ---
const particleCount = 200;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
  particlePos[i] = (Math.random() - 0.5) * 40;
  particlePos[++i] = Math.random() * 12;
  particlePos[++i] = (Math.random() - 0.5) * 40;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.4 });
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);
```

And in the animate function, add this line before `renderer.render(scene, camera);`:
```javascript
  particles.rotation.y += 0.0002;
```

- [ ] **Step 5: Add intro camera animation**

Add this code near the end (before `// --- World Rotation ---`):

```javascript
// --- Intro Animation ---
let introProgress = 1;

function startIntro() {
  introProgress = 0;
  const startY = camera.position.y;
  const startZ = camera.position.z;
  const targetY = 8;
  const targetZ = 14;

  function animateIntro() {
    if (introProgress >= 1) {
      camera.position.y = targetY;
      camera.position.z = targetZ;
      camera.lookAt(0, 0, 0);
      return;
    }
    introProgress += 0.015;
    const ease = 1 - Math.pow(1 - introProgress, 3);
    camera.position.y = startY + (targetY - startY) * ease;
    camera.position.z = startZ + (targetZ - startZ) * ease;
    camera.lookAt(0, 0, 0);
    requestAnimationFrame(animateIntro);
  }
  animateIntro();
}

setTimeout(startIntro, 300);
```

- [ ] **Step 6: Add controls hint fade on first interaction**

Add this after `cluesFound++` in the interaction keydown handler:
```javascript
    // Hide controls hint on first interaction
    const controlsHint = document.getElementById('controls-hint');
    if (controlsHint) controlsHint.style.display = 'none';
```

- [ ] **Step 7: Commit**

Commit with message: "feat: polish with particles, intro animation, UI fixes"
