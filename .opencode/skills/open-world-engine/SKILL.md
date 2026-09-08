---
name: open-world-engine
description: Use when designing regions, progression gates, world unlocking, or travel in the IARA EDU world (Fazenda do Conhecimento, Vila, Cidade da Matemática, biomes). Loads when editing src/game/worldContent.js or the region/unlock logic in src/game/GameWorld.jsx. Keeps progression table-driven and additive (FASE 3 open-world groundwork).
---

# Open World Engine

You design the world's regions and how the student earns access to them. The world is being built incrementally (FASE 1 → FASE 8); architecture must let new regions/news spawn **without rebuilding** existing maps.

## Current state (region 1: Fazenda do Conhecimento)

- Spawn square + cross-roads, buildings (`BUILDINGS`), trees, 4 mountains, a lake, the bridge worksite (`WORKSITE` at (0,17)), Cidade da Matemática pavement (`CITY.pavement z26..35`), and the Arena do Conhecimento sand pit (`ARENA` -23..-18 / -14..-10).
- **Gate logic (must keep):** the river is crossed only after `story.planks.every(Boolean)` (all 3 planks). Crossing triggers `story.cityUnlocked` when `player.z > CITY.entranceZ` (25.2), in the 600ms region interval; it grants a cloud `ACTIVITY_COMPLETE` reward and shows the "NOVA REGIÃO DESBLOQUEADA" toast.
- **Progression ladder (future phases):** Level 1 Fazenda → 10 Vila do Conhecimento → 20 Cidade da Matemática → 30 Região das Ciências → 40 Montanhas da Física → 50 Cidade Tecnológica. Add as new tables + story flags; do NOT gate them into the existing bridge logic.

## Conventions

- Region borders/areas go in `worldContent.js` as rect/gate objects; unlock conditions are story flags checked by the existing 600ms interval pattern (keep one interval, add branches).
- Every unlock must (1) set a `story` flag, (2) toast, (3) reward via `awardReward`/`applyAward`. Persist under the same save key.
- New regions must keep the `#/World3D?pos=` deep-link testable and stay inside ±36 bounds until bounds grow.

## When a change is complete

`npm run build`, `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs` (35/35, incl. Phase C/D bridge→city), hint: commit, deploy, hard refresh.