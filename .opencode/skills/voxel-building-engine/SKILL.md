---
name: voxel-building-engine
description: Use when working on the IARA EDU sandbox/construction system — placing/removing blocks, crops planting/harvesting, block palette, ghost preview, collision, or persistence of the build state. Loads when editing computeFront/doPlace/doRemove/doPlant/doHarvest/Voxels/Ghost in src/game/GameWorld.jsx. Keeps the build loop and its save-file stable.
---

# Voxel Building Engine

You own the sandbox mechanic: place/remove blocks, plant/harvest crops, ghost preview, and the exact persistence shape the deterministic e2e depends on.

## The loop

- **Palette:** 12 `BLOCKS` (terra, grama, madeira, tabuas, pedra, tijolo, folha, areia, vidro, neve, ouro, obsidiana). `START_KIT` seeds the inventory; players earn +3 random blocks from collectibles.
- **Place/plant/remove dispatch on F/R/E:** `handlePrimary` (F = place on page 0, plant on page 1 via `KeyQ` toggle), `KeyR` remove, `KeyE` interact/harvest. Front target comes from `computeFront({px, pz, rot, placed, crops, mode, occSet, groundTop})` — `rot = worldShared.rot` (default 0). Only the player's own `placed` blocks can be removed; crops need mature (`plantedAt` + `CROPS` time).
- **Collision:** `solidAt(px,pz)` probes feet ±0.35 over `y=1..3` in `world.solidKeys`. Player is clamped to ±`WORLD_BOUNDS` (36).
- **Persistence (exact shape):** localStorage key `iara_voxel_world_<email>` = `{ placed, crops, blocks, materials, story, checkpoint }`. `parseSaved` merges defaults (`START_KIT`, `START_MATERIALS`, `defaultStory()`); keep missing keys safe (e2e writes `blocks: undefined` on purpose).
- Crops live **both** in the world save (voxel cell) and the farm (`src/api/farm.js` via `plantCrop`/`harvestCrop`) — keep the two in sync; `plantedAt` comes from the farm crop.

## E2E-fragile invariants

- Spawn default `(0,8)` → front `(0,10)` with rot=0. Never change default spawn or default rot without updating `voxel_world_e2e.mjs`.
- `#/World3D?pos=x,z` (deep link) overrides spawn for tests. `checkpoint` only updates when the player actually **walks** (>0.5 from last), never on teleport — Phase F depends on spawn landing at `(0,8)`.

## When a change is complete

`npm run build`, `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs` (35/35), hint: commit, deploy, hard refresh.