### Task 2: Girl Character + World Rotation

**Files:**
- Modify: `carpeta-de-prueba/index.html` (append after the `window.__` exports section)

**Interfaces:**
- Consumes: `window.__scene`, `window.__worldGroup`, `window.__camera` from Task 1
- Produces: girl character at origin, keyboard rotation handler, idle animation

**Important - exact insertion point:** Replace the existing `animate` function and append the new code AFTER the `window.__` exports at the end of the script.

- [ ] **Step 1: Add girl character creation (append after exports)**

```javascript

// --- Girl Character ---
function createGirl() {
  const group = new THREE.Group();

  // Body (dress)
  const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.2, 8);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff6b9d, roughness: 0.3 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfde8d0, roughness: 0.2 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.4;
  head.castShadow = true;
  group.add(head);

  // Hair
  const hairGeo = new THREE.SphereGeometry(0.37, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x4a2800, roughness: 1 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 1.55;
  hair.scale.y = 0.6;
  group.add(hair);

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2d1b00 });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
    eye.position.set(side * 0.15, 1.45, 0.32);
    group.add(eye);
  }

  // Arms
  const armMat = new THREE.MeshStandardMaterial({ color: 0xfde8d0, roughness: 0.2 });
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), armMat);
    arm.position.set(side * 0.55, 1.0, 0);
    arm.rotation.z = side * 0.2;
    arm.castShadow = true;
    group.add(arm);
  }

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0xfde8d0, roughness: 0.3 });
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 6), legMat);
    leg.position.set(side * 0.2, 0.25, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  // Shoes
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xff6b9d, roughness: 0.5 });
  for (const side of [-1, 1]) {
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.28), shoeMat);
    shoe.position.set(side * 0.2, 0.04, 0.05);
    group.add(shoe);
  }

  return group;
}

const girl = createGirl();
scene.add(girl);

// Girl idle animation (gentle bob)
let girlTime = 0;
```

- [ ] **Step 2: Add world rotation controls (replace the existing `animate` function)**

```javascript

// --- World Rotation ---
const keys = { left: false, right: false };

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

// Replace the existing animate function
function animate() {
  requestAnimationFrame(animate);

  const rotSpeed = 0.02;
  if (keys.left) worldGroup.rotation.y += rotSpeed;
  if (keys.right) worldGroup.rotation.y -= rotSpeed;

  // Girl bob
  girlTime += 0.03;
  girl.position.y = Math.sin(girlTime) * 0.05;

  // Face the direction of movement
  if (keys.left) girl.rotation.y = Math.PI / 4;
  else if (keys.right) girl.rotation.y = -Math.PI / 4;
  else girl.rotation.y = 0;

  renderer.render(scene, camera);
}
```

- [ ] **Step 3: Verify rotation**

Open file in browser. Expected: girl visible at center. Arrow keys rotate the world. Girl bobs gently and faces movement direction.

- [ ] **Step 4: Commit**
