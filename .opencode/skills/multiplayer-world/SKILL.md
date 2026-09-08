---
name: multiplayer-world
description: Use when preparing or building real-time/shared features for the IARA EDU world — presence, co-op missions, multiplayer Arena, leaderboards, sync. Currently architecture-prep only: DO NOT add cross-user mutations or unfettered sync while the deterministic single-user e2e must stay green. Loads when editing game state sharing in src/game/GameWorld.jsx or the sync layer src/lib/sync.js.
---

# Multiplayer World (architecture prep)

The IARA EDU world is single-player today; multiplayer (FASE 6) will ride on the same React 18 + R3F 8 stack. Your job: keep the codebase **ready to become multiplayer** without breaking the offline-first, deterministic, single-user behavior.

## Rules today (non-negotiable)

- **All world state stays in `localStorage iara_voxel_world_<email>` + the platform DB (`src/api/db.js`, Upstash `iara:db` via `src/api/sync.js`).** Nothing in game logic may assume another client exists.
- The deterministic e2e stubs fetch (`GET→{users:[]}`, POST→echo) — any network feature must remain a *no-op* under that stub without throwing.
- Student privacy: multiplayer must be scoped, session-based, and never expose other students' save files/answers.

## The seams to build toward

- Shared, ref-based hot state (`playerPosRef`, `worldShared`) is already the right pattern — remote entities should be *copy-only* observers of these refs.
- Simulated "AI neighbors" (NPCs walking, birds, NPC routines) live on the same refs and can later be swapped for real peers.
- Arena = deterministic 4-round quiz (see `worldContent.js` ARENA_ROUNDS). A multiplayer mode will just share the round state + answers via a gateway object, keeping the scoring math identical.

## When you touch sync

Keep `src/lib/sync.js` calls outside `useFrame` and idempotent. Re-run `npm run build` + `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs` (35/35) after any change.