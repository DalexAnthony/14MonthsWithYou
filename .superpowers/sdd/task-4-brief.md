### Task 4: NPCs + Interactive Signs with Clues

**Files:**
- Modify: `carpeta-de-prueba/index.html` (insert after `biomes[data.id] = sector; });` and before `// --- World Rotation ---`)

**Interfaces:**
- Consumes: `worldGroup`, `biomeData` (from Task 3), `scene`
- Produces: `interactables` array, `cluesFound` counter, dialogue UI interaction

**Insertion point:** After `biomes[data.id] = sector; });` and before `// --- World Rotation ---`

- [ ] **Step 1: Insert clue data + NPC/sign creation + interaction system**

```javascript

// --- Clue System ---
const clues = [
  {
    npcText: 'Conejo: "Vi a tu amor pasar por aquí, iba hacia el bosque con algo en las manos..."',
    signText: 'Cartel: "Jardín de los Suspiros — donde todo comenzó"',
  },
  {
    npcText: 'Zorro: "Escuché que alguien preparaba algo especial en la playa. ¡Corre!"',
    signText: 'Cartel: "Bosque Encantado — dicen que los enamorados dejan mensajes aquí"',
  },
  {
    npcText: 'Pájaro: "Vi una figura vestida de azul cerca de la plaza del pueblo"',
    signText: 'Cartel: "Playa del Atardecer — el mejor lugar para una declaración"',
  },
  {
    npcText: 'Ardilla: "El chico de la sonrisa bonita preguntó por la floristería más cercana"',
    signText: 'Cartel: "Plaza Central — donde los corazones se encuentran"',
  },
  {
    npcText: 'Ciervo: "Lo vi cruzando el puente... llevaba algo que brillaba"',
    signText: 'Cartel: "Puente de los Suspiros — cruza y encuentra tu destino"',
  },
  {
    npcText: null,
    signText: 'Última pista: "Sigue el camino de pétalos... te está esperando"',
  },
];

// --- Interactive Objects ---
const interactables = [];
let cluesFound = 0;

function createNPC(angle, radius, color, type) {
  const group = new THREE.Group();

  // Body
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  body.position.y = 0.5;
  group.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
  );
  head.position.y = 0.9;
  group.add(head);

  // Features based on type
  if (type === 'rabbit') {
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 0.3, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      ear.position.set(side * 0.12, 1.15, 0);
      ear.rotation.z = side * 0.2;
      group.add(ear);
    }
  } else if (type === 'bird') {
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.25, 6),
        new THREE.MeshStandardMaterial({ color: 0x3498db })
      );
      wing.position.set(side * 0.25, 0.5, 0);
      wing.rotation.z = side * 0.5;
      group.add(wing);
    }
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.12, 6),
      new THREE.MeshStandardMaterial({ color: 0xff9900 })
    );
    beak.position.set(0, 0.85, 0.25);
    beak.rotation.x = 0.3;
    group.add(beak);
  } else if (type === 'squirrel') {
    const tail = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xcc7722 })
    );
    tail.position.set(0, 0.4, -0.25);
    tail.scale.set(1, 1, 0.5);
    group.add(tail);
    body.material.color.setHex(0xcc7722);
  } else if (type === 'deer') {
    for (const side of [-1, 1]) {
      const antler = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 0.3, 4),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      );
      antler.position.set(side * 0.12, 1.1, 0.05);
      antler.rotation.z = side * 0.4;
      group.add(antler);
    }
    body.material.color.setHex(0xcd853f);
  }

  const floatOffset = Math.random() * Math.PI * 2;

  // Glow ring
  const glowGeo = new THREE.RingGeometry(0.35, 0.45, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.1;
  group.add(glow);

  group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  group.userData = { floatOffset, glow, type: 'npc' };

  return group;
}

function createSign(angle, radius) {
  const group = new THREE.Group();

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  post.position.y = 0.4;
  group.add(post);

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.4, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xf5deb3 })
  );
  board.position.y = 0.85;
  board.castShadow = true;
  group.add(board);

  const glowGeo = new THREE.RingGeometry(0.4, 0.5, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.85;
  group.add(glow);

  group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  group.userData = { glow, type: 'sign' };

  return group;
}

// Place NPCs and signs in biomes (skip encounter biome — it has the boyfriend)
const npcTypes = ['rabbit', 'bird', 'squirrel', 'deer'];
const npcColors = [0xffffff, 0x3498db, 0xcc7722, 0xcd853f];

biomeData.forEach((data, i) => {
  if (data.id === 'encounter') return;
  const midAngle = (data.angleStart + data.angleEnd) / 2;
  const radius = 5.5;

  const npc = createNPC(midAngle, radius, npcColors[i] || 0xffffff, npcTypes[i] || 'rabbit');
  worldGroup.add(npc);
  interactables.push({ mesh: npc, biomeIndex: i, type: 'npc' });

  const sign = createSign(midAngle, radius + 2.5);
  worldGroup.add(sign);
  interactables.push({ mesh: sign, biomeIndex: i, type: 'sign' });
});
```

- [ ] **Step 2: Add interaction detection (insert after the NPC/sign placement)**

```javascript

// --- Interaction System ---
const dialogueBox = document.getElementById('dialogue-box');
const interactHint = document.getElementById('interact-hint');
const clueCounter = document.getElementById('clue-counter');
let nearInteractable = null;

function updateInteraction() {
  const facingAngle = -worldGroup.rotation.y;
  let normAngle = facingAngle % (Math.PI * 2);
  if (normAngle < 0) normAngle += Math.PI * 2;

  let currentBiomeIndex = -1;
  for (let i = 0; i < biomeData.length; i++) {
    let start = biomeData[i].angleStart;
    let end = biomeData[i].angleEnd;
    if (normAngle >= start && normAngle < end) {
      currentBiomeIndex = i;
      break;
    }
  }

  const nearby = interactables.find(
    (ia) => ia.biomeIndex === currentBiomeIndex && ia.biomeIndex <= cluesFound
  );

  if (nearby) {
    nearInteractable = nearby;
    interactHint.classList.add('visible');
  } else {
    nearInteractable = null;
    interactHint.classList.remove('visible');
  }

  clueCounter.textContent = `\u2726 Pista ${cluesFound} / 6`;
}

// Call updateInteraction in the animation loop
// IMPORTANT: Add `updateInteraction();` at the start of the animate() function

document.addEventListener('keydown', (e) => {
  if ((e.key === ' ' || e.key === 'Enter') && nearInteractable) {
    e.preventDefault();
    const idx = nearInteractable.biomeIndex;
    const clue = clues[idx];
    if (!clue) return;

    const message = nearInteractable.type === 'npc' ? clue.npcText : clue.signText;
    if (!message) return;

    dialogueBox.textContent = message;
    dialogueBox.classList.add('visible');

    if (idx >= cluesFound) {
      cluesFound++;
      clueCounter.textContent = `\u2726 Pista ${cluesFound} / 6`;
    }

    interactHint.classList.remove('visible');
    nearInteractable = null;
  }
});
```

- [ ] **Step 3: Add `updateInteraction();` to the animate function**

Find the animate function and add `updateInteraction();` as the first line inside it (before `requestAnimationFrame(animate);`).

- [ ] **Step 4: Verify interaction**

Open file in browser. Navigate to a biome with arrows. Expected: gold glow ring appears on NPCs/signs. Hint text "Presiona ESPACIO para interactuar" appears. Press Space. Dialogue box shows clue text.

- [ ] **Step 5: Commit**
