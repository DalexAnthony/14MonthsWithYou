# Task 4 Report: NPCs + Interactive Signs with Clues

## What I implemented

- **Clue System**: 6 clues with NPC dialog and sign text for each biome (garden, forest, beach, plaza, bridge, encounter)
- **NPC Characters**: `createNPC()` function with 4 animal types — rabbit (ears), bird (wings + beak), squirrel (tail), deer (antlers) — each with unique geometry features
- **Signs**: `createSign()` function with wooden post + board and green glow ring
- **Placement**: NPCs at radius 5.5, signs at radius 8, placed in all biomes except `encounter`
- **Interaction System**: 
  - `updateInteraction()` called each frame — determines current biome via world rotation angle, shows/hides interact hint, updates clue counter
  - Space/Enter key listener — shows dialogue box with NPC or sign text, increments `cluesFound`
  - Progressive unlocking: interactables appear only in biomes with index ≤ `cluesFound`

## Files changed

- `carpeta-de-prueba/index.html` — inserted ~230 lines of clue/NPC/interaction code; added `updateInteraction()` call in animate loop

## Self-review findings

- All function brackets match and are properly closed
- Both `keydown` listeners coexist without conflict (one handles arrows, one handles space/enter)
- The `encounter` biome is correctly skipped in NPC placement
- The `ia.biomeIndex <= cluesFound` condition creates progressive discovery
- Used `THREE.DoubleSide` for ring glow meshes so they're visible from the angled camera

## Issues or concerns

- NPC float animation (`floatOffset` in `userData`) is stored but not yet animated in the loop — the brief provides the property but no animation code was specified; NPCs are static for now
- The `dialogueBox` remains visible until the next interaction — the dialogue is not auto-dismissed or animated away
