# Task 1 Report — HTML Scaffold + Three.js Scene

## What was implemented
- Created `carpeta-de-prueba/index.html` with a complete Three.js scene scaffold:
  - Sky blue background with fog
  - Perspective camera (45° FOV, positioned at (0, 10, 16))
  - WebGL renderer with antialiasing, shadows, ACES tone mapping
  - Ambient + hemisphere + directional sunlight with shadow maps
  - World group (empty, for future rotation)
  - Green CircleGeometry ground (receives shadows)
  - Animation loop via requestAnimationFrame
  - Window resize handler
  - Window exports: `__scene`, `__camera`, `__worldGroup`, `__renderer`
  - UI overlay: clue counter, dialogue box, interact hint, controls hint
  - Three.js 0.160.0 loaded via CDN (importmap)

## Files changed
- Created: `carpeta-de-prueba/index.html`

## Self-review findings
- Code matches the task brief exactly
- No issues — all imports, paths, and CDN URLs are valid
- OrbitControls imported but not instantiated (available for later use)

## Issues / Concerns
- None
