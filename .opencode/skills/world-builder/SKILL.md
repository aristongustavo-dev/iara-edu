---
name: world-builder
description: Use when designing or editing the IARA EDU 3D world layout — regions, terrain, buildings, trees, mountains, rivers, roads, landmarks, or the static world mesh grid. Loads when editing src/game/worldContent.js or the build* functions in src/game/GameWorld.jsx. Keeps the voxel map table-driven and collision-safe.
---

# World Builder

You shape the grid world of IARA EDU (`src/game/GameWorld.jsx`). The world is a 73×73 cell map (x/z in -36..36), every cell column `y=0` is a ground cap, `y<0` is underground bedrock.

## Canonical facts (single source of truth)

Everything lives in `src/game/worldContent.js`: `RIVER`, `BRIDGE`, `CITY`, `ARENA`, `LAKE` (in GameWorld), `NPC_DIALOGS`. Coordinates/costs/rewards are NEVER hardcoded in `GameWorld.jsx` — extend the tables, then wire rendering.

## Building rules (from game's buildMultiWorld/buildStaticWorld)

- Ground: grass by default; `road` on ||x|<=1 || ||z|<=1 (not the bridge gap); water in `RIVER`/`LAKE`; pavement in `CITY`; sand in `ARENA`.
- Occupancy (`occKeys`) vs solid (`solidKeys`): trees/mountains/buildings occupy but only walls/trunks/mountain rims are solid. Player collision checks only `y=1..3` solid cells at `(floor x, floor z)` (±0.35 feet).
- The `buildMultiWorld({ placed, crops, progress })` function merges player `placed` blocks, `crops`, and story-driven gates (bridge planks + `BRIDGE.mouth`) onto the static world. Keep it a pure function of those three inputs.
- `computeFront` resolves what F/R/E acts on: place → break → plant/harvest priority. Building/interiors: walls are solid, doors are a front gap at `z=z1`, windows become `C.glass`.

## When a change is complete

Re-run `npm run build`, then `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs` (35/35 must stay green), then hint: commit, deploy (`npx vercel deploy --prod --yes`), hard refresh.