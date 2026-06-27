### Task 3: Create 6 Biomes Around the Circle

**Files:**
- Modify: `carpeta-de-prueba/index.html` (append after the girl character code section, before the `animate` function)

**Interfaces:**
- Consumes: `worldGroup` (existing), `scene` (existing)
- Produces: 6 biome sectors with terrain decorations, stored in `biomes` object

**Insertion point:** After the `let girlTime = 0;` line and before `// --- World Rotation ---`.

- [ ] **Step 1: Add biome creation code (insert after `let girlTime = 0;`)**

```javascript

// --- Biomes ---
const biomeColors = {
  garden:     { ground: 0x7ec87e, decor: 0xff69b4, name: 'Jardín de Flores' },
  forest:     { ground: 0x2d7d2d, decor: 0x228B22, name: 'Bosque Encantado' },
  beach:      { ground: 0xf4d03f, decor: 0x85c1e9, name: 'Playa al Atardecer' },
  plaza:      { ground: 0xcc9966, decor: 0xc0392b, name: 'Plaza de la Ciudad' },
  bridge:     { ground: 0x8b7d6b, decor: 0x6c5ce7, name: 'Puente Mirador' },
  encounter:  { ground: 0xffb6c1, decor: 0xff1493, name: 'El Encuentro' },
};

const biomeData = [
  { id: 'garden',    angleStart: 0,     angleEnd: Math.PI / 3,  clueIndex: 0 },
  { id: 'forest',    angleStart: Math.PI / 3,   angleEnd: 2 * Math.PI / 3, clueIndex: 1 },
  { id: 'beach',     angleStart: 2 * Math.PI / 3, angleEnd: Math.PI,       clueIndex: 2 },
  { id: 'plaza',     angleStart: Math.PI,        angleEnd: 4 * Math.PI / 3, clueIndex: 3 },
  { id: 'bridge',    angleStart: 4 * Math.PI / 3, angleEnd: 5 * Math.PI / 3, clueIndex: 4 },
  { id: 'encounter', angleStart: 5 * Math.PI / 3, angleEnd: 2 * Math.PI,    clueIndex: 5 },
];
```

- [ ] **Step 2: Add the `createBiomeSector` function and execute it (append after biomeData)**

```javascript
function createBiomeSector(biome, data) {
  const group = new THREE.Group();
  const colors = biomeColors[biome.id];
  const midAngle = (data.angleStart + data.angleEnd) / 2;
  const radius = 14;

  // Colored ground wedge
  const wedgeShape = new THREE.Shape();
  wedgeShape.moveTo(0, 0);
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = data.angleStart + (data.angleEnd - data.angleStart) * t;
    wedgeShape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  wedgeShape.lineTo(0, 0);

  const wedgeGeo = new THREE.ShapeGeometry(wedgeShape);
  const wedgeMat = new THREE.MeshStandardMaterial({ color: colors.ground, roughness: 0.9, side: THREE.DoubleSide });
  const wedge = new THREE.Mesh(wedgeGeo, wedgeMat);
  wedge.rotation.x = -Math.PI / 2;
  wedge.position.y = 0.01;
  wedge.receiveShadow = true;
  group.add(wedge);

  // Decorations
  switch (biome.id) {
    case 'garden': {
      for (let i = 0; i < 12; i++) {
        const a = data.angleStart + Math.random() * (data.angleEnd - data.angleStart);
        const r = 2 + Math.random() * 8;
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 6),
          new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0xff69b4 : 0xffeb3b })
        );
        flower.position.set(Math.cos(a) * r, 0.1, Math.sin(a) * r);
        group.add(flower);
      }
      for (let i = 0; i < 4; i++) {
        const a = data.angleStart + Math.random() * (data.angleEnd - data.angleStart);
        const r = 3 + Math.random() * 6;
        const bush = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0x2d8a2d })
        );
        bush.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
        group.add(bush);
      }
      break;
    }
    case 'forest': {
      for (let i = 0; i < 8; i++) {
        const a = data.angleStart + Math.random() * (data.angleEnd - data.angleStart);
        const r = 2 + Math.random() * 8;
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.25, 1.5, 6),
          new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        trunk.position.set(Math.cos(a) * r, 0.75, Math.sin(a) * r);
        trunk.castShadow = true;
        group.add(trunk);
        const foliage = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0x228B22 })
        );
        foliage.position.set(Math.cos(a) * r, 1.8, Math.sin(a) * r);
        foliage.castShadow = true;
        group.add(foliage);
      }
      break;
    }
    case 'beach': {
      for (let i = 0; i < 3; i++) {
        const a = data.angleStart + Math.random() * (data.angleEnd - data.angleStart);
        const r = 13 + Math.random() * 2;
        const water = new THREE.Mesh(
          new THREE.CircleGeometry(1.5, 12),
          new THREE.MeshStandardMaterial({ color: 0x3498db, transparent: true, opacity: 0.5 })
        );
        water.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r);
        water.rotation.x = -Math.PI / 2;
        group.add(water);
      }
      for (let i = 0; i < 3; i++) {
        const a = data.angleStart + Math.random() * (data.angleEnd - data.angleStart);
        const r = 4 + Math.random() * 4;
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.2, 1.8, 6),
          new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        trunk.position.set(Math.cos(a) * r, 0.9, Math.sin(a) * r);
        trunk.castShadow = true;
        group.add(trunk);
        const fronds = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0x2d8a2d })
        );
        fronds.position.set(Math.cos(a) * r, 2.1, Math.sin(a) * r);
        fronds.scale.y = 0.3;
        group.add(fronds);
      }
      break;
    }
    case 'plaza': {
      for (let i = 0; i < 4; i++) {
        const a = data.angleStart + Math.random() * (data.angleEnd - data.angleStart);
        const r = 3 + Math.random() * 5;
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.08, 1.2, 6),
          new THREE.MeshStandardMaterial({ color: 0x555555 })
        );
        post.position.set(Math.cos(a) * r, 0.6, Math.sin(a) * r);
        group.add(post);
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffdd44, emissive: 0xffdd44, emissiveIntensity: 0.3 })
        );
        lamp.position.set(Math.cos(a) * r, 1.3, Math.sin(a) * r);
        group.add(lamp);
      }
      for (let i = 0; i < 3; i++) {
        const a = data.angleStart + Math.random() * (data.angleEnd - data.angleStart);
        const r = 7 + Math.random() * 4;
        const building = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.6 + Math.random() * 0.5, 0.8),
          new THREE.MeshStandardMaterial({ color: 0xe8d5b7 })
        );
        building.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
        building.castShadow = true;
        group.add(building);
      }
      break;
    }
    case 'bridge': {
      for (let i = 0; i < 5; i++) {
        const a = data.angleStart + (data.angleEnd - data.angleStart) * (i / 5);
        const r = 6;
        const arch = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.1, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x8B7D6B })
        );
        arch.position.set(Math.cos(a) * r, 1.2 + Math.sin(i * Math.PI / 5) * 0.6, Math.sin(a) * r);
        arch.castShadow = true;
        group.add(arch);
      }
      const railingMat = new THREE.MeshStandardMaterial({ color: 0x6c5ce7, emissive: 0x6c5ce7, emissiveIntensity: 0.1 });
      for (let i = 0; i < 4; i++) {
        const a = data.angleStart + (data.angleEnd - data.angleStart) * (i / 4);
        const r = 5.5;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), railingMat);
        pillar.position.set(Math.cos(a) * r, 1.4, Math.sin(a) * r);
        group.add(pillar);
      }
      break;
    }
    case 'encounter': {
      for (let i = 0; i < 20; i++) {
        const a = data.angleStart + Math.random() * (data.angleEnd - data.angleStart);
        const r = 2 + Math.random() * 8;
        const heart = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0xff1493, emissive: 0xff1493, emissiveIntensity: 0.2 })
        );
        heart.position.set(Math.cos(a) * r, 0.15 + Math.random() * 0.1, Math.sin(a) * r);
        group.add(heart);
      }
      for (let i = 0; i < 8; i++) {
        const a = data.angleStart + (data.angleEnd - data.angleStart) * (i / 8);
        const r = 2 + i * 1.2;
        const carpet = new THREE.Mesh(
          new THREE.PlaneGeometry(0.6, 0.8),
          new THREE.MeshStandardMaterial({ color: 0xcc0000, side: THREE.DoubleSide })
        );
        carpet.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r);
        carpet.rotation.y = -a + Math.PI / 2;
        carpet.rotation.x = -Math.PI / 2;
        group.add(carpet);
      }
      break;
    }
  }

  // Biome label (colored sphere floating above)
  const label = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: colors.decor, emissiveIntensity: 0.3 })
  );
  label.position.set(Math.cos(midAngle) * 8, 3.5, Math.sin(midAngle) * 8);
  group.add(label);

  return group;
}

// Create all biomes
const biomes = {};
biomeData.forEach((data) => {
  const sector = createBiomeSector({ id: data.id }, data);
  worldGroup.add(sector);
  biomes[data.id] = sector;
});
```

- [ ] **Step 3: Verify biomes visible**

Open file in browser. Expected: 6 colored sectors visible around the circle, with decorations matching each biome.

- [ ] **Step 4: Commit**
