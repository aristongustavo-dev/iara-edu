---
name: game-asset-generator
description: Use when creating 3D/visual assets for the IARA EDU world — voxel characters, NPCS, buildings, props, labels/signs, decorative scenery. Loads when editing meshes in src/game/GameWorld.jsx or adding visual identity. Everything must be procedural — never add external GLTF/texture/font network assets.
---

# Game Asset Generator

All IARA EDU 3D assets are **procedural** — built from `three` boxes/meshes and canvas textures. No GLTF imports, no external fonts, no CDN assets (the deterministic e2e asserts **zero `pageerror`s**; network font/asset loads are forbidden).

## Canonical building blocks

- **Voxel look:** the whole world uses `boxGeometry` + `meshStandardMaterial`. Palette colors live in the `C` object at the top of `GameWorld.jsx` (grass, dirt, wood, plank, brick, roof, leaf, water, glass, snow, gold, obsidian, sand, fence, city, rail).
- **Characters** (`VoxelPlayer`/`VoxelNPC`): 3 stacked boxes (legs, torso, head) + 2 eye boxes, bob/rotate in `useFrame`. Player avatar colors come from `src/game/avatarTheme.js` (emoji → shirt/pants/hair/skin palette).
- **Labels/signs:** `canvas`-painted `THREE.CanvasTexture` sprites (rounded rect + bold text, no font fetch). Keep textures few (~4), dispose nothing each frame.
- **Nature:** trees = wood trunk + leaf cubes (`pushTree`), mountains = concentric stone/green caps, water = `#4FC3F7` top cap; animated water shimmer/clouds/birds are lightweight sine-driven groups (see immersive-3d-world).
- **Performance:** prefer few geometries + `InstancedMesh` (`INSTANCE_CAP 8000`) for shared voxel cells; keep per-frame allocation low.

## When a change is complete

`npm run build`, then `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs` (35/35, zero pageerrors), then hint: commit, deploy, hard refresh.