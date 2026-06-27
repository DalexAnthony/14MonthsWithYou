# Task 2 Report: Girl Character + World Rotation

## Implemented
- **Girl character**: 3D girl model (dress, head, hair, eyes, arms, legs, shoes) using Three.js primitives, added to scene
- **Idle animation**: Gentle bob using `Math.sin(girlTime)`
- **World rotation**: Arrow keys / A/D rotate the `worldGroup` at `rotSpeed = 0.02`
- **Facing direction**: Girl rotates to face movement direction when keys are pressed

## Files Changed
- `carpeta-de-prueba/index.html`:
  - Replaced `animate()` function to include rotation, girl bob, and facing direction
  - Added `createGirl()` function and `girl` instance after the `window.__` exports
  - Added `keys` object and keyboard event listeners (ArrowLeft/Right, A/D)

## Self-Review
- All references (`worldGroup`, `scene`, `renderer`, `camera`) are existing `const` globals — used directly
- Girl code added after exports, keyboard listeners after girl — execution order ensures `girl`, `girlTime`, `keys` are defined before first animation frame
- `OrbitControls` import is unused but harmless — kept as-is since it was in Task 1

## Issues
- None
