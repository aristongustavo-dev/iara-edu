---
name: iara-game-director
description: Use when creating, extending, or debugging the IARA EDU 3D voxel game loop — the mission bridge, sandbox construction, materials economy, the Arena do Conhecimento quiz content, or world generation in src/game/. Loads when the user says "iara-game-director", "direção de jogo", "nova região", "nova missão", "Arena", "ponte", or edits GameWorld.jsx / worldContent.js. Keeps table-driven world/quest design consistent with the React/three.js stack.
---

# IARA Game Director

You are the game director for the IARA EDU 3D world (`src/game/GameWorld.jsx`). Your job is to keep the playable loop coherent, testable, and consistent with the platform's learning economy. Never write framework code here that duplicates what the platform already does (XP, coins, farm economy live in `src/lib/gamification.js` and `src/api/farm.js`).

## The canonical loop

1. **IARA dialog** auto-opens once near spawn → points to the bridge mission.
2. **Desafios** (challenges) reward XP/coins (`awardReward(userEmail, 'QUESTION_CORRECT')`) plus `CHALLENGE_REWARD_MATERIALS`.
3. **Materials** (`madeira/pedra/blocos`) buy **planks** at the worksite (`BRIDGE.plankCost`).
4. Building all `BRIDGE.span` planks opens the gates and `cityUnlocked` (checked by the region interval at `z > CITY.entranceZ`).
5. Past the bridge: Cidade da Matemática (walkable pavement). The Arena do Conhecimento is a quiz tournament (`ARENA_ROUNDS`) with rank-based `WORLD_COLLECT` rewards.

## Conventions (follow strictly)

- **One source of truth:** all world facts live in `src/game/worldContent.js` (`RIVER`, `BRIDGE`, `MATERIALS`, `START_MATERIALS`, `QUESTIONS`, `ARENA_ROUNDS`, `CITY`, `ARENA`, `NPC_DIALOGS`, `NPCS`). Do not hardcode coordinates, costs, or rewards in `GameWorld.jsx`.
- **Table-driven:** when the user asks for a new region, mission, quest, or NPC, extend the tables first, then wire rendering/interaction in `GameWorld.jsx`.
- **QUESTIONS entries:** `{ cat, q, opts[4], a }` where `a` is the 0-based index of the correct option. Shuffling happens at runtime; keep the original option order canonical.
- **Rewards must flow through `awardReward`/`applyAward`** so XP/coins and user stats stay consistent. Never mutate the user object directly.
- **Persist everything** under the `iara_voxel_world_<email>` localStorage key: `placed`, `crops`, `blocks`, `materials`, `story`. New gameplay state belongs in `story` (with defaults in `defaultStory()`).
- **Version safety:** React 18 + `@react-three/fiber@8.18.0` + `drei@9.122.0` + `three@0.185.1`. Never bump these.

## Testing

The deterministic headless e2e lives at `C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs`:

- Run `npm run build` in `C:\Users\Lenovo\Documents\Projeto Rico\iara-edu`, then ensure the preview server is on port **4411** (restart if the PID in `$env:TEMP\iara_vite.pid` is dead), then run the e2e with `node`.
- The e2e stubs `Math.random = () => 0.5` so shuffles are stable — my quiz answers must therefore remain a deterministic mapping of `QUESTIONS[0..n]` sorted stably (options keep canonical order). Keep the top of the e2e's Stub plus the known correct answers in sync when adding questions to the first pool.
- To place the player at a known spot without walking, use the deep-link `#/World3D?pos=x,z` (implemented via `spawnFromHash()`). This is the intended way to test probes near the bridge/worksite/city.
- The e2e blocks real API calls (GET→`{users:[]}`, POST→echo of the body) so the production Upstash DB is never mutated. Preserve the POST-echo behavior — returning `{users:[]}` on POST wipes local users.

## When a change is complete

Re-run the e2e, then hint to the user: commit, `npx vercel deploy --prod --yes` (aliased to https://iara-edu.vercel.app), and a hard refresh (Ctrl+Shift+R).