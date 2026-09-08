---
name: gamification-platform
description: Use when adding or changing XP, coins (Iara Coins), levels, badges/conquistas, streaks, or any reward in the IARA EDU platform (3D world or pages). Loads when editing src/lib/gamification.js, src/api/farm.js, or wiring new rewards into src/game/GameWorld.jsx. Keeps every reward flowing through the platform economy.
---

# Gamification Platform

You own the learning-economy layer of IARA EDU. Every reward must flow through the canonical platform functions so XP, coins, levels, and badges stay consistent across pages and the 3D world.

## The sacred laws

- **XP/coins/levels/badges live in `src/lib/gamification.js` and the characters store (`src/api/integrations.js` -> `getOrCreateCharacter`).** Never hand-roll a parallel economy inside `GameWorld.jsx`.
- World rewards go through **`awardReward(email, kind, opts)`** — kinds already in use: `QUESTION_CORRECT`, `ACTIVITY_COMPLETE`, `MISSION_COMPLETE`, `WORLD_COLLECT` (+ `extraXp`, `extraCoins`, `item`). Add new kinds there, not inline.
- In the 3D world, always mirror a reward with the local `applyAward(label, r)` helper (toast) and keep the *visual* X `/coins` HUD counters in sync.
- Farm economy (`src/api/farm.js`) is a separate layer: planting/harvesting mutates the farm, never the character directly.

## Conventions

- Material/consumable economies that are **world-only** (madeira/pedra/blocos, block inventory) live in the world save (`blocks`, `materials` under `iara_voxel_world_<email>`) — they are NOT character coins.
- Re-use existing reward sizes: collectibles grant the `handleCollect` map (10/25/15/20/30 XP), arena 45/90 XP by rank, bridge = `MISSION_COMPLETE`.
- Anything that permanently boosts a student must be persisted + asserted by the e2e (temp `voxel_world_e2e.mjs`) before you call it done.

## Testing

The deterministic e2e asserts exact XP numbers (e.g. arena +45 XP, farm harvest +10 XP). If you change a reward amount, update the matching assert in the temp e2e and keep `Math.random = () => 0.5` stubbing intact.

## When a change is complete

Re-run `npm run build`, restart the preview on 4411 if needed, run `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs`, then hint: commit, `npx vercel deploy --prod --yes`, hard refresh (Ctrl+Shift+R).