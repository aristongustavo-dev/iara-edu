---
name: educational-adventure-engine
description: Use when creating or changing the educational mission/quest layer of the IARA EDU world — missions triggered by the world (like RECONSTRUA A PONTE), challenges, quizzes, the Arena do Conhecimento, NPC missions, or learning content. Loads when editing src/game/worldContent.js (QUESTIONS/ARENA_ROUNDS/NPC_DIALOGS) or mission code in src/game/GameWorld.jsx. Missions must be world events, not 3D-background quizzes.
---

# Educational Adventure Engine

Missions ARE the world: content provokes world events. The student doesn't answer a quiz with a 3D backdrop — they fix the world with what they learn.

## Canonical mission (RECONSTRUA A PONTE)

1. IARA dialog (auto-opens ~2.2s after load) sets the mission.
2. `Desafio` (3 questions via `makeQuestions`) → `QUESTION_CORRECT` rewards + `CHALLENGE_REWARD_MATERIALS` (madeira 2/pedra 1/blocos 1 per run).
3. Materials buy planks at the worksite (`BRIDGE.plankCost`), 3 planks rebuild the bridge.
4. Crossing (`z > CITY.entranceZ` + all planks) unlocks the city (`ACTIVITY_COMPLETE`) — visual world change, not just a modal.
5. MISSION_COMPLETE reward fires on the last plank.

## Question-answer contract (deterministic!)

- `QUESTIONS`: `{ cat, q, opts[4], a }`, `a` = 0-based index of the correct option. `makeQuestions` shuffles at runtime with `Math.random`.
- The deterministic e2e stubs `Math.random=()=>0.5` → shuffles stay canonical, so the correct answers are exactly `QUESTIONS[cat-pool]` in **original order**. New questions added to the FIRST pool of each category change the mapping — keep the temp e2e's `ARENA_ANSWERS`/`['3/4','1/2','2/3']` list in sync.
- Arena = `ARENA_ROUNDS` (4 rounds × 3), score 100/answer, 15s timer, ranks vs fixed rivals (1500/1100/700) → 12/12 = 1200, `WORLD_COLLECT` +45 XP (rank 2) / +90 (rank 1).

## When a change is complete

`npm run build`, `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs` (35/35 incl. phases A/C/E), hint: commit, deploy, hard refresh.