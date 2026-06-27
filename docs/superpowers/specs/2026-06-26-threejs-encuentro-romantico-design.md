# Design: Mini-Juego Three.js — Encuentro Romántico

## Resumen
Juego 3D en mundo rotatorio donde una chica busca a su novio. Ella está en el centro y el mundo gira a su alrededor. Al explorar diferentes biomas, encuentra carteles y NPCs que dan pistas. Tras 6 pistas, llega al encuentro final donde el novio la espera con lirios y chocolates.

## Stack
- **Runtime:** HTML + Three.js vía CDN (un solo archivo)
- **Hosting:** Archivo local, sin dependencias

## Arquitectura

### Sistema de Coordenadas
- Chica en `(0, 0, 0)` — fija
- Mundo distribuye objetos en un círculo de radio ~12 unidades alrededor
- Cámara en perspectiva, ligeramente elevada, mirando a la chica
- Rotación del mundo: teclas izquierda/derecha giran un `group` contenedor

### Biomas (en orden circular, ~60° cada uno)
1. **Jardín de flores** (0°–60°) — terreno verde con flores, cartel con pista 1
2. **Bosque encantado** (60°–120°) — árboles, NPC conejo da pista 2
3. **Playa al atardecer** (120°–180°) — arena, agua, cartel + NPC pájaro (pistas 3-4)
4. **Plaza ciudad** (180°–240°) — adoquín, faroles, NPC ardilla da pista 5
5. **Puente mirador** (240°–300°) — arco/puente, cartel da pista 6
6. **El encuentro** (300°–360°) — zona especial con el novio y decoración romántica

### Personajes
- **Chica:** Geometrías low-poly — cilindro (vestido rosado) + esfera (cabeza) + cilindros (brazos/piernas)
- **Novio:** Similar, colores azul/gris, sostiene lirios (geometrías blancas) + caja de chocolates (cubo marrón)
- **NPCs:** Animales low-poly (cono + esferas) — conejo, pájaro, ardilla

### Interacción
- NPCs y carteles tienen un halo brillante/partículas para indicar interactuabilidad
- Al hacer clic o al estar cerca + tecla Espacio: muestra un cuadro de diálogo con la pista
- Pistas son frases románticas que guían al siguiente bioma

### Flujo del juego
1. Carga del mundo — animación de fade-in
2. La chica está en el centro, el mundo gira suavemente como bienvenida
3. Jugador gira el mundo con ←/→ (o A/D)
4. Al encontrar un interactuable, aparece texto con pista
5. Progresión: cada pista revela más sobre dónde está el novio
6. Pista final: el mundo se alinea automáticamente hacia el encuentro
7. Escena final: el novio aparece, se inclina, entrega flores y chocolates
8. Corazones flotantes (partículas) celebran el encuentro

### UI
- Indicador de pista actual (ej. "Pista 2/6")
- Brújula o indicador de dirección hacia el novio (se activa tras pista 3)
- Diálogos con fade-in/fade-out
- Botón de reinicio

## Decisiones Técnicas
- Modelos hechos con geometrías Three.js (BoxGeometry, SphereGeometry, CylinderGeometry) — sin assets externos
- Materiales MeshStandardMaterial con colores vivos
- Iluminación: AmbientLight + DirectionalLight + HemisphereLight
- Sombras básicas
- Animaciones: rotación de objetos, floating animation en NPCs, partículas para corazones

## Anti-patrones a evitar
- No usar emojis como íconos en UI
- No cargar modelos externos (mantenerlo autocontenido)
- No mutar objetos Three.js directamente — usar group transforms

## Próximos pasos
- Plan de implementación (writing-plans)
- Implementación TDD
- Review
