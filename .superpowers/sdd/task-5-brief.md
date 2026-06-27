### Task 5: Boyfriend Character + Ending Scene

**Files:**
- Modify: `carpeta-de-prueba/index.html`

**Interfaces:**
- Consumes: `worldGroup`, `biomeData`, `cluesFound`, `scene`, `girlTime`, `dialogueBox`
- Produces: boyfriend with flowers + chocolates, heart particles, ending trigger

**Insertion point:** Insert boyfriend + bouquet + chocolate + hearts code BEFORE `// --- World Rotation ---` 

**Modifications to animate function:** Add NPC float animation, heart animation, ending check.

- [ ] **Step 1: Add boyfriend character + bouquet + chocolates code (insert before `// --- World Rotation ---`)**

```javascript

// --- Boyfriend Character ---
function createBoyfriend() {
  const group = new THREE.Group();

  // Body (shirt)
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.0, 8), bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  group.add(body);

  // Pants
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7 });
  const pants = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 0.5, 8), pantsMat);
  pants.position.y = 0.25;
  group.add(pants);

  // Head
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfde8d0, roughness: 0.2 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), headMat);
  head.position.y = 1.3;
  head.castShadow = true;
  group.add(head);

  // Hair (short)
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 1 });
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.37, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
  hair.position.y = 1.45;
  hair.scale.y = 0.5;
  group.add(hair);

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a5276 });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
    eye.position.set(side * 0.15, 1.35, 0.32);
    group.add(eye);
  }

  // Smile
  const smileMat = new THREE.MeshStandardMaterial({ color: 0xcc4444 });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12, Math.PI), smileMat);
  smile.position.set(0, 1.25, 0.35);
  smile.rotation.x = -0.2;
  group.add(smile);

  // Arms (reaching forward)
  const armMat = new THREE.MeshStandardMaterial({ color: 0xfde8d0, roughness: 0.2 });
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), armMat);
    arm.position.set(side * 0.55, 0.9, 0.1);
    arm.rotation.z = side * 0.3;
    arm.rotation.x = -0.3;
    arm.castShadow = true;
    group.add(arm);
  }

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5 });
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.4, 6), legMat);
    leg.position.set(side * 0.2, 0.2, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  // Shoes
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.5 });
  for (const side of [-1, 1]) {
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.3), shoeMat);
    shoe.position.set(side * 0.2, 0.04, 0.05);
    group.add(shoe);
  }

  return group;
}

const boyfriend = createBoyfriend();

// --- Flowers (Lilies) Bouquet ---
function createBouquet() {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d8a2d });
  for (let i = 0; i < 5; i++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), stemMat);
    stem.position.set((Math.random() - 0.5) * 0.15, 0.25, (Math.random() - 0.5) * 0.15);
    group.add(stem);
  }
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, emissive: 0xfff8f0, emissiveIntensity: 0.1 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xffdd44 });
  for (let i = 0; i < 5; i++) {
    const xOff = (Math.random() - 0.5) * 0.2;
    const zOff = (Math.random() - 0.5) * 0.2;
    for (let p = 0; p < 6; p++) {
      const pAngle = (p / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), petalMat);
      petal.position.set(xOff + Math.cos(pAngle) * 0.07, 0.5, zOff + Math.sin(pAngle) * 0.07);
      petal.scale.set(1, 0.3, 1);
      group.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), centerMat);
    center.position.set(xOff, 0.5, zOff);
    group.add(center);
  }
  const wrapMat = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.6 });
  const wrap = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.2, 8), wrapMat);
  wrap.position.y = 0.1;
  group.add(wrap);
  return group;
}

const bouquet = createBouquet();

// --- Chocolates Box ---
function createChocolateBox() {
  const group = new THREE.Group();
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.5 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.2), boxMat);
  box.position.y = 0.06;
  box.castShadow = true;
  group.add(box);
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.04), ribbonMat);
  ribbon1.position.y = 0.12;
  group.add(ribbon1);
  const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.22), ribbonMat);
  ribbon2.position.y = 0.12;
  group.add(ribbon2);
  const bowMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  for (const side of [-1, 1]) {
    const bowLoop = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.015, 6, 8), bowMat);
    bowLoop.position.set(side * 0.05, 0.16, 0);
    group.add(bowLoop);
  }
  return group;
}

const chocolateBox = createChocolateBox();

// Position in encounter biome
const encounterBiome = biomeData[5];
const encounterMid = (encounterBiome.angleStart + encounterBiome.angleEnd) / 2;
const encounterRadius = 3;

boyfriend.position.set(Math.cos(encounterMid) * encounterRadius, 0, Math.sin(encounterMid) * encounterRadius);
boyfriend.lookAt(0, 1, 0);

bouquet.position.set(Math.cos(encounterMid) * encounterRadius + 0.5, 1.0, Math.sin(encounterMid) * encounterRadius);
chocolateBox.position.set(Math.cos(encounterMid) * encounterRadius - 0.4, 0.8, Math.sin(encounterMid) * encounterRadius);

worldGroup.add(boyfriend);
worldGroup.add(bouquet);
worldGroup.add(chocolateBox);

// Hearts particles
const heartCount = 30;
const heartPositions = new Float32Array(heartCount * 3);
const heartSpeeds = [];
for (let i = 0; i < heartCount; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 0.5 + Math.random() * 2;
  heartPositions[i * 3] = Math.cos(a) * r;
  heartPositions[i * 3 + 1] = Math.random() * 3;
  heartPositions[i * 3 + 2] = Math.sin(a) * r;
  heartSpeeds.push({ x: (Math.random() - 0.5) * 0.005, y: 0.005 + Math.random() * 0.01, z: (Math.random() - 0.5) * 0.005 });
}
const heartGeo = new THREE.BufferGeometry();
heartGeo.setAttribute('position', new THREE.BufferAttribute(heartPositions, 3));
const heartMat = new THREE.PointsMaterial({ color: 0xff1493, size: 0.12, transparent: true, opacity: 0.7 });
const hearts = new THREE.Points(heartGeo, heartMat);
hearts.position.set(Math.cos(encounterMid) * encounterRadius, 1.5, Math.sin(encounterMid) * encounterRadius);
worldGroup.add(hearts);

// --- Ending Trigger ---
let endingStarted = false;

function checkEnding() {
  if (cluesFound >= 6 && !endingStarted) {
    endingStarted = true;

    const targetAngle = -encounterMid;
    const startRotation = worldGroup.rotation.y;
    let progress = 0;

    function rotateToEncounter() {
      if (progress >= 1) return;
      progress += 0.02;
      worldGroup.rotation.y = startRotation + (targetAngle - startRotation) * Math.min(progress, 1);
      if (progress < 1) requestAnimationFrame(rotateToEncounter);
    }
    rotateToEncounter();

    setTimeout(() => {
      dialogueBox.textContent = '¡Lo encontraste!';
      dialogueBox.classList.add('visible');
      setTimeout(() => {
        dialogueBox.textContent = 'Él se arrodilla y te entrega un ramo de lirios y una caja de chocolates...';
        setTimeout(() => {
          dialogueBox.textContent = '¡Feliz final!';
        }, 3000);
      }, 2500);
    }, 3000);
  }
}
```

- [ ] **Step 2: Add to the animate function — NPC float animation + heart animation + ending check**

The current animate function should be updated to include these additions AFTER the existing code but BEFORE `renderer.render(scene, camera);`:

```javascript
// In the animate function, ADD after the girl facing code and before renderer.render:

  // Animate NPC float
  worldGroup.children.forEach((child) => {
    if (child.userData && child.userData.floatOffset !== undefined) {
      const floatY = Math.sin(girlTime * 2 + child.userData.floatOffset) * 0.1;
      child.position.y = floatY;
      if (child.userData.glow) {
        child.userData.glow.material.opacity = 0.3 + Math.sin(girlTime * 3 + child.userData.floatOffset) * 0.2;
      }
    }
  });

  // Animate encounter hearts
  const hPos = hearts.geometry.attributes.position.array;
  for (let i = 0; i < heartCount; i++) {
    hPos[i * 3 + 1] += heartSpeeds[i].y;
    if (hPos[i * 3 + 1] > 3.5) hPos[i * 3 + 1] = 0;
  }
  hearts.geometry.attributes.position.needsUpdate = true;

  // Animate bouquet sway
  bouquet.rotation.z = Math.sin(girlTime * 1.5) * 0.1;

  // Check ending
  checkEnding();
```

- [ ] **Step 3: Verify ending**

Open file. Find all 6 clues (navigate to each biome, press Space). After 6th clue: auto-rotation to encounter zone, boyfriend visible with lilies and chocolates, hearts floating, dialogue shows ending.

- [ ] **Step 4: Commit**
