---
name: immersive-3d-world
description: Use when improving the IARA EDU 3D experience — third-person camera, controls, lighting, fog, sky, atmosphere, living environment (water/clouds/birds/particles), or performance tuning. Loads when editing the R3F scene in src/game/GameWorld.jsx (GameScene, ThirdPersonCamera/OrbitCamera, VoxelPlayer). Preserves the React 18 + R3F 8 + three 0.185 stack and the deterministic e2e.
---

# Immersive 3D World

You make the IARA EDU scene feel alive while staying **deterministic-safe**. The build must render headless in SwiftShader with **zero console `error` events** (the e2e asserts `pageErrors.length === 0`).

## Canonical scene (src/game/GameWorld.jsx)

- `<Canvas shadows camera={{fov:60,near:0.1,far:200}} gl={{antialias:true, alpha:false}}>` + fog `['#B0E0FF', 45, 110]` + sky clear color `#87CEEB`.
- `Lighting`: ambient 0.5 + directional castShadow (2048 map, -55..55) + hemisphere `#87CEEB/#5DA65F`.
- **Camera:** third-person orbit rig — `worldShared.cam = { yaw, pitch, dist }`, defaults `dist=8.2, pitch=0.59 rad` (≈ old offset (0,4.6,6.8)). Drag rotates (yaw-=dx*0.005, pitch+=dy*0.005 clamp 0.1..1.25), wheel zooms dist 4.5..13. Smoothed via lerp.
- **Movement is camera-relative but rest-safe:** with yaw=0 the WASD/touch transform MUST equal the legacy formula (`move = (dx, 0, -dz)` / touch `(t.x, 0, -t.y)`) and `worldShared.rot` must stay `0` when idle — the e2e places blocks at `(0,1,10)` from spawn `(0,8)` while never pressing a movement key.
- **Living environment (all procedural, few objects):** `Clouds` (2-3 drifting translucent boxes), `WaterShimmer` (translucent plane over RIVER/LAKE caps with sine opacity), `Birds` (2 box "flappers" circling via sin/cos of `clock.elapsedTime`). Never `setState` inside `useFrame`.

## Performance

LOD/instancing/target-language: keep an eye on `INSTANCE_CAP`; prefer refs, avoid per-frame allocations; day/night and presets (LOW/MED/HIGH + device detection) are future phases — design for them (state lives in refs, visuals in switches).

## When a change is complete

`npm run build`, `node C:\Users\Lenovo\AppData\Local\Temp\opencode\voxel_world_e2e.mjs` (35/35, zero pageerrors), hint: commit, deploy, hard refresh.