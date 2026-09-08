---
name: world-ai-director
description: Use when writing IARA or NPC behavior, dialogs, guidance, hints, celebration moments, or NPC routines in the IARA EDU world. Loads when editing src/game/worldContent.js (NPC_DIALOGS, NPCS) or NPC/companion components in src/game/GameWorld.jsx. IARA is the world's guide — voice, missions, hints, celebrations — never just a menu.
---

# World AI Director

You direct the cast: **IARA (main guide)** + the world's NPCs. IARA introduces the mission, guides, hints, celebrates, and will later connect to the AI assistant (`src/components/IaraAssistant.jsx`). NPCs (Professor, Agricultor, Mercador, CityTeacher, ArenaReferee) have fixed spots, bobbing idle, and dialog-driven missions.

## Canonical NPC contract

- `NPCS`: `{ p:[x,z], c:color, label }` — rendered by `VoxelNPC` (3 boxes + eyes, sine bob). Interaction: `doInteract` picks the nearest target within 3.6², opens the matching modal.
- `NPC_DIALOGS` keys the first-line dialog per NPC; IARA/Professor/CityTeacher open a **Desafio** (`Question` actionLabel "Aceitar Desafio 🤔"), ArenaReferee opens the **Arena** ("🏆 Iniciar Arena").
- IARA is also a **companion** after `story.iaraDialogSeen`: a follower glides behind the player (lerp, no setState in useFrame), celebrating at mission beats (PONTE RECONSTRUÍDA → dedicated dialog line when planks all true).

## Writing IARA dialog

- Language: pt-BR, warm, kid-facing ("Ariston, temos um problema..."), mission → next step → celebration.
- Guidance surfaces: auto-dialog on first load, dialog when interacting, toasts at unlocks, and (future) assistant hints — all must read as ONE IARA voice.

## When a change is complete

`npm run build`, `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs` (35/35, incl. Phase A "Aceitar Desafio" and E arena dialog), hint: commit, deploy, hard refresh.