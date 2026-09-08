import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { KeyboardControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import HUD from './components/HUD';
import VirtualJoystick from './components/VirtualJoystick';
import GameErrorBoundary from './components/GameErrorBoundary';
import { awardReward } from '@/lib/gamification';
import { useAuth } from '@/lib/AuthContext';
import { touchInput, setTouchInput } from './input';
import { getOrCreateFarm, getFarmFor, plantCrop, harvestCrop, advanceFarmDay } from '@/api/farm';
import { CROPS, getOrCreateCharacter } from '@/api/integrations';
import { avatarThemeFor } from './avatarTheme';
import {
  RIVER, BRIDGE, MATERIALS, START_MATERIALS, CHALLENGE_REWARD_MATERIALS,
  QUESTIONS, ARENA_ROUNDS, CITY, ARENA, NPC_DIALOGS, LANDMARKS,
} from './worldContent';

const GRAVITY = -20;
const JUMP_FORCE = 8;
const WALK_SPEED = 4;
const RUN_SPEED = 8;
const CROUCH_SPEED = 2;
const PLAYER_HEIGHT = 1.6;
const GROUND_TOP = 0.5;
const FEET_Y = GROUND_TOP + PLAYER_HEIGHT / 2;
const FEET_Y_CROUCH = GROUND_TOP + 0.5;
const WORLD_BOUNDS = 36;
const INSTANCE_CAP = 8000;
const PICK_RANGE = 1.9;
const PLAYER_BODY_PALETTE = ['#4A90D9', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6', '#00BCD4'];

const keyMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'crouch', keys: ['KeyC'] },
];

const toKey = (x, y, z) => `${x},${y},${z}`;

const C = {
  grass: '#6FBE5E',
  grassDark: '#5AA04B',
  dirt: '#8B5A2B',
  stone: '#9A9A9A',
  road: '#BCA268',
  wood: '#6B4226',
  plank: '#C89B6E',
  brick: '#B3512A',
  roof: '#8E5B2F',
  leaf: '#3D8B37',
  leafDark: '#32742E',
  water: '#4FC3F7',
  glass: '#B8E6FF',
  snow: '#F2F6F8',
  gold: '#FFD700',
  obsidian: '#2B2B45',
  sand: '#E8D5A3',
  fence: '#7A5230',
  fenceDark: '#5C3D22',
  city: '#D9D4C4',
  rail: '#7FA8B7',
};

const GLASSY = new Set([C.water, C.glass]);

const BLOCKS = [
  { id: 'terra', name: 'Terra', c: C.dirt },
  { id: 'grama', name: 'Grama', c: C.grass },
  { id: 'madeira', name: 'Madeira', c: C.wood },
  { id: 'tabuas', name: 'Tábuas', c: C.plank },
  { id: 'pedra', name: 'Pedra', c: C.stone },
  { id: 'tijolo', name: 'Tijolo', c: C.brick },
  { id: 'folha', name: 'Folha', c: C.leaf },
  { id: 'areia', name: 'Areia', c: C.sand },
  { id: 'vidro', name: 'Vidro', c: C.glass },
  { id: 'neve', name: 'Neve', c: C.snow },
  { id: 'ouro', name: 'Ouro', c: C.gold },
  { id: 'obsidiana', name: 'Obsidiana', c: C.obsidian },
];

const START_KIT = {
  terra: 48, grama: 24, madeira: 24, tabuas: 24, pedra: 24,
  tijolo: 16, folha: 24, areia: 16, vidro: 8, neve: 12, ouro: 4, obsidiana: 2,
};

const CROP_COLORS = {
  milho: '#F0C64A', trigo: '#D9B36A', cenoura: '#E8813B',
  alface: '#63B85B', cafe: '#C05E3A', cacau: '#7A4A2B',
};

const BUILDINGS = [
  { p: [-15, -15], w: 5, d: 4, h: 3, wall: C.plank, roof: C.wood },
  { p: [0, -13], w: 6, d: 5, h: 4, wall: '#5DADE2', roof: '#3A7BC8' },
  { p: [12, -10], w: 5, d: 4, h: 3, wall: C.wood, roof: C.roof },
  { p: [20, -5], w: 5, d: 5, h: 4, wall: '#58C08B', roof: '#27AE60' },
  { p: [-12, 10], w: 7, d: 5, h: 2, wall: C.gold, roof: C.brick },
  { p: [8, 12], w: 5, d: 4, h: 3, wall: '#E07B3A', roof: '#C94F1D' },
  { p: [18, 10], w: 4, d: 4, h: 3, wall: '#E8A33D', roof: C.roof },
  { p: [-20, -5], w: 5, d: 4, h: 3, wall: '#C89B6E', roof: C.wood },
  { p: [25, -15], w: 5, d: 5, h: 4, wall: '#A66BC4', roof: '#8E44AD' },
];

const TREES = [
  [-29, -29], [-25, 20], [29, -25], [29, 25], [-29, 5],
  [0, 28], [-20, 21], [25, -29], [-8, 20], [20, 27],
  [5, -20], [-28, 8], [22, 22], [-5, -28], [27, -7],
  [-16, 34], [6, 34],
];

const MOUNTAINS = [
  { p: [-22, 33], r: 5, h: 6 },
  { p: [30, -29], r: 6, h: 9 },
  { p: [29, 30], r: 5, h: 7 },
  { p: [-30, 31], r: 4, h: 5 },
];

const LAKE = { x0: 26, x1: 30, z0: 20, z1: 24 };

const CITY_BUILDINGS = [
  { p: [0.5, 30], w: 7, d: 6, h: 5, wall: '#8B4513', roof: '#F5F5F5', label: 'Biblioteca das Fórmulas' },
  { p: [-9, 29.5], w: 6, d: 6, h: 4, wall: '#F0F0F0', roof: '#37474F', label: 'Câmara dos Números' },
  { p: [9.5, 29], w: 5, d: 5, h: 4, wall: '#2ECC71', roof: '#1E8449', label: 'Laboratório de Física' },
  { p: [0.5, 33.5], w: 4, d: 4, h: 2, wall: '#4FC3F7', roof: C.gold, label: 'Observatório π' },
];

const COLLECTIBLES = [
  { id: 'coin', type: 'coin', p: [-5, 1, -5], c: C.gold },
  { id: 'gem', type: 'gem', p: [8, 1, -3], c: '#4FC3F7' },
  { id: 'heart', type: 'heart', p: [-8, 1, 8], c: '#FF6B6B' },
  { id: 'seed', type: 'seed', p: [15, 1, -8], c: '#4CAF50' },
  { id: 'star', type: 'star', p: [-15, 1, -8], c: '#B39DDB' },
  { id: 'cityCoin1', type: 'coin', p: [4, 1, 28], c: C.gold },
  { id: 'cityCoin2', type: 'gem', p: [-6, 1, 32], c: '#4FC3F7' },
  { id: 'cityCard', type: 'star', p: [10, 1, 34], c: '#B39DDB' },
  { id: 'arenaCup', type: 'gem', p: [-20.5, 1, -12.5], c: C.gold },
];

const NPCS = [
  { p: [0, -9], c: '#7C3AED', label: 'IARA' },
  { p: [2, -9], c: '#4A90D9', label: 'Professor' },
  { p: [-10, 12], c: '#8B6914', label: 'Agricultor' },
  { p: [15, 12], c: '#E67E22', label: 'Mercador' },
  { p: [0.5, 27.5], c: '#E91E63', label: 'CityTeacher' },
  { p: [ARENA.npc.x, ARENA.npc.z], c: ARENA.npc.c, label: 'ArenaReferee' },
];

const WORKSITE = { x: 0, z: 17, label: 'Ponte', name: 'Canteiro da Ponte' };

const worldShared = {
  front: null,
  ghost: { x: 0, y: 0, z: 0, ok: false, color: '#ffffff', visible: false },
  rot: 0,
  moving: false,
  cam: { yaw: 0, pitch: 0.59, dist: 8.2 },
};

const makeOccSet = (placed, crops) => {
  const set = new Set(STATIC_WORLD.occKeys);
  Object.keys(placed).forEach((k) => set.add(k));
  Object.keys(crops).forEach((k) => set.add(k));
  return set;
};

function computeFront({ px, pz, rot, placed, crops, mode, occSet, groundTop }) {
  const dirX = Math.sin(rot);
  const dirZ = Math.cos(rot);
  const fx = Math.round(px + dirX * PICK_RANGE);
  const fz = Math.round(pz + dirZ * PICK_RANGE);
  if (fx < -37 || fx > 37 || fz < -37 || fz > 37) return { x: fx, y: 1, z: fz, ok: false, purpose: 'none', color: '#ffffff' };
  const gTop = groundTop || STATIC_WORLD.groundTop;
  const groundId = gTop.get(`${fx},${fz}`);
  const occ = occSet || makeOccSet(placed, crops);

  const crop = crops[toKey(fx, 1, fz)];
  if (crop) {
    const def = CROPS.find((c) => c.id === crop.cropId);
    const mature = Date.now() - crop.plantedAt >= (def?.time || 60) * 1000;
    return { x: fx, y: 1, z: fz, ok: true, purpose: 'harvest', mature, color: mature ? '#FFD700' : '#9E9E9E' };
  }

  if (mode === 'plant') {
    const okGround = groundId === 'grass' || groundId === 'dirt';
    const occupied = occ.has(toKey(fx, 1, fz));
    return {
      x: fx, y: 1, z: fz, ok: okGround && !occupied,
      color: okGround && !occupied ? '#4CAF50' : '#E74C3C', purpose: 'plant',
    };
  }

  if (mode === 'build') {
    const placedHas = (y) => !!placed[toKey(fx, y, fz)];
    let placeY = 1;
    while (placeY <= 9 && occ.has(toKey(fx, placeY, fz))) placeY++;
    let placedTop = -1;
    for (let y = 9; y >= 1; y--) {
      if (placedHas(y)) { placedTop = y; break; }
    }
    let staticTop = -1;
    for (let y = 9; y >= 1; y--) {
      if (STATIC_WORLD.occKeys.has(toKey(fx, y, fz))) { staticTop = y; break; }
    }
    if (placedTop > staticTop) {
      return { x: fx, y: placedTop, z: fz, ok: true, purpose: 'break', color: '#E74C3C' };
    }
    const okGround = !!groundId && groundId !== 'water';
    return { x: fx, y: Math.min(placeY, 10), z: fz, ok: placeY <= 9 && okGround, purpose: 'place', color: '#ffffff' };
  }

  return { x: fx, y: 1, z: fz, ok: false, purpose: 'none', color: '#ffffff' };
}

function buildStaticWorld() {
  const cells = [];
  const solidKeys = new Set();
  const occKeys = new Set();
  const groundTop = new Map();

  const r0 = -36, r1 = 36;
  for (let x = r0; x <= r1; x++) {
    for (let z = r0; z <= r1; z++) {
      const inLake = x >= LAKE.x0 && x <= LAKE.x1 && z >= LAKE.z0 && z <= LAKE.z1;
      const onRoad = (Math.abs(x) <= 1 || Math.abs(z) <= 1) && !(x === 0 && z >= 6 && z <= 14);
      const inRiver = x >= RIVER.x0 && x <= RIVER.x1 && z >= RIVER.z0 && z <= RIVER.z1;
      const inCity = z >= CITY.pavement.z0 && z <= CITY.pavement.z1 && x >= CITY.pavement.x0 && x <= CITY.pavement.x1;
      const inArena = x >= ARENA.x0 && x <= ARENA.x1 && z >= ARENA.z0 && z <= ARENA.z1;
      let top = C.grass;
      let topId = 'grass';
      if (inRiver) { top = C.water; topId = 'water'; }
      else if (onRoad) { top = C.road; topId = 'road'; }
      else if (inCity) { top = C.city; topId = 'road'; }
      else if (inArena) { top = C.sand; topId = 'sand'; }
      cells.push({ x, y: -2, z, c: C.stone });
      cells.push({ x, y: -1, z, c: C.dirt });
      cells.push({ x, y: 0, z, c: top });
      groundTop.set(`${x},${z}`, topId);
    }
  }

  const pushBankWall = (z) => {
    for (let x = r0; x <= r1; x++) {
      if (BRIDGE.mouth.includes(x)) continue;
      for (let y = 1; y <= 3; y++) {
        cells.push({ x, y, z, c: C.fenceDark });
        solidKeys.add(toKey(x, y, z));
        occKeys.add(toKey(x, y, z));
      }
    }
  };
  pushBankWall(BRIDGE.gateSouthZ);
  pushBankWall(BRIDGE.gateNorthZ);

  BUILDINGS.concat(CITY_BUILDINGS).forEach((b) => {
    const x0 = Math.round(b.p[0] - b.w / 2);
    const x1 = x0 + b.w - 1;
    const z0 = Math.round(b.p[1] - b.d / 2);
    const z1 = z0 + b.d - 1;
    const cx = Math.round((x0 + x1) / 2);
    for (let y = 1; y <= b.h; y++) {
      for (let x = x0; x <= x1; x++) {
        for (let z = z0; z <= z1; z++) {
          if (x !== x0 && x !== x1 && z !== z0 && z !== z1) continue;
          const isFront = z === z1;
          if (isFront && x === cx && y <= 2) continue;
          if (b.w >= 5 && isFront && (x === cx - 1 || x === cx + 1) && (y === 2 || (y === 3 && b.h >= 3))) {
            cells.push({ x, y, z, c: C.glass });
            continue;
          }
          cells.push({ x, y, z, c: b.wall });
          solidKeys.add(toKey(x, y, z));
          occKeys.add(toKey(x, y, z));
        }
      }
    }
    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        cells.push({ x, y: b.h + 1, z, c: b.roof });
        occKeys.add(toKey(x, b.h + 1, z));
      }
    }
    if (b.h >= 3) {
      for (let x = x0 + 1; x <= x1 - 1; x++) {
        for (let z = z0 + 1; z <= z1 - 1; z++) {
          const edge = x === x0 + 1 || x === x1 - 1 || z === z0 + 1 || z === z1 - 1;
          if (edge) {
            cells.push({ x, y: b.h + 2, z, c: b.roof });
            occKeys.add(toKey(x, b.h + 2, z));
          }
        }
      }
    }
  });

  const pushTree = (px, pz, big) => {
    const trunkH = big ? 3 : 2;
    for (let y = 1; y <= trunkH; y++) {
      cells.push({ x: px, y, z: pz, c: C.wood });
      occKeys.add(toKey(px, y, pz));
    }
    const top = trunkH;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (Math.abs(dx) === 1 && Math.abs(dz) === 1) continue;
        cells.push({ x: px + dx, y: top + 1, z: pz + dz, c: C.leaf });
        occKeys.add(toKey(px + dx, top + 1, pz + dz));
      }
    }
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dz === 0) continue;
        if (Math.abs(dx) === 1 && Math.abs(dz) === 1) continue;
        cells.push({ x: px + dx, y: top + 2, z: pz + dz, c: dx === 0 || dz === 0 ? C.leaf : C.leafDark });
        occKeys.add(toKey(px + dx, top + 2, pz + dz));
      }
    }
  };

  TREES.forEach((t) => pushTree(t[0], t[1], (Math.abs(t[0]) + Math.abs(t[1])) % 3 === 0));

  MOUNTAINS.forEach((m) => {
    for (let ry = 0; ry < m.h; ry++) {
      const inset = Math.floor(ry * (m.r / m.h));
      const size = m.r - inset;
      const y = 1 + ry;
      for (let dx = -size; dx <= size; dx++) {
        for (let dz = -size; dz <= size; dz++) {
          if (dx === -size || dx === size || dz === -size || dz === size) {
            const isTop = y === m.h;
            cells.push({ x: m.p[0] + dx, y, z: m.p[1] + dz, c: isTop ? C.grassDark : C.stone });
            occKeys.add(toKey(m.p[0] + dx, y, m.p[1] + dz));
          }
        }
      }
    }
  });

  const arenaX0 = ARENA.x0, arenaX1 = ARENA.x1, arenaZ0 = ARENA.z0, arenaZ1 = ARENA.z1;
  for (let x = arenaX0 - 1; x <= arenaX1 + 1; x++) {
    for (let z = arenaZ0 - 1; z <= arenaZ1 + 1; z++) {
      const edge = x === arenaX0 - 1 || x === arenaX1 + 1 || z === arenaZ0 - 1 || z === arenaZ1 + 1;
      if (!edge) continue;
      const gate = z === arenaZ0 - 1 && (x === -20 || x === -21);
      if (gate) continue;
      for (let y = 1; y <= 2; y++) {
        cells.push({ x, y, z, c: C.fence });
        solidKeys.add(toKey(x, y, z));
        occKeys.add(toKey(x, y, z));
      }
    }
  }

  for (let x = -6; x <= 6; x += 2) {
    cells.push({ x, y: 1, z: 8, c: C.fence });
    occKeys.add(toKey(x, 1, 8));
    cells.push({ x, y: 2, z: 8, c: C.fence });
    occKeys.add(toKey(x, 2, 8));
  }

  return { cells, solidKeys, occKeys, groundTop };
}

const STATIC_WORLD = buildStaticWorld();

function buildMultiWorld({ placed, crops, progress }) {
  const occKeys = new Set(STATIC_WORLD.occKeys);
  const solidKeys = new Set(STATIC_WORLD.solidKeys);
  const groundTop = new Map(STATIC_WORLD.groundTop);

  Object.keys(placed).forEach((k) => {
    occKeys.add(k);
    solidKeys.add(k);
  });
  Object.keys(crops).forEach((k) => occKeys.add(k));

  const planks = progress?.planks || [false, false, false];
  const plankSet = new Set();
  const railCells = [];
  const gateCells = [];

  const pushGate = (zSide) => {
    BRIDGE.mouth.forEach((x) => {
      for (let y = 1; y <= 3; y++) {
        const cell = { x, y, z: zSide, c: C.fenceDark };
        gateCells.push(cell);
        occKeys.add(toKey(x, y, zSide));
        solidKeys.add(toKey(x, y, zSide));
      }
    });
  };

  if (!planks[0]) pushGate(BRIDGE.gateSouthZ);
  if (!planks[2]) pushGate(BRIDGE.gateNorthZ);

  BRIDGE.span.forEach((z, i) => {
    if (!planks[i]) return;
    BRIDGE.mouth.forEach((x) => {
      plankSet.add(`${x},${z}`);
    });
    [-2, 2].forEach((x) => {
      for (let y = 1; y <= 2; y++) {
        const cell = { x, y, z, c: C.fenceDark };
        railCells.push(cell);
        occKeys.add(toKey(x, y, z));
      }
    });
  });

  const staticCells = STATIC_WORLD.cells.filter((c) => !(c.y === 0 && plankSet.has(`${c.x},${c.z}`)));
  const plankCells = [];
  plankSet.forEach((k) => {
    const [x, z] = k.split(',').map(Number);
    plankCells.push({ x, y: 0, z, c: C.plank });
    groundTop.set(k, 'plank');
  });

  const placedCells = Object.values(placed).map((p) => ({
    x: p.x, y: p.y, z: p.z, c: (BLOCKS.find((b) => b.id === p.id) || { c: C.dirt }).c,
  }));

  return {
    cells: staticCells.concat(railCells).concat(gateCells).concat(plankCells).concat(placedCells),
    solidKeys,
    occKeys,
    groundTop,
    planks,
  };
}

function VoxelLayer({ cells, color, castShadow = true }) {
  const ref = useRef(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        transparent: GLASSY.has(color),
        opacity: GLASSY.has(color) ? 0.55 : 1,
        depthWrite: !GLASSY.has(color),
      }),
    [color]
  );

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < cells.length; i++) {
      dummy.position.set(cells[i].x, cells[i].y, cells[i].z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.count = cells.length;
    mesh.instanceMatrix.needsUpdate = true;
  }, [cells]);

  if (!cells.length) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, INSTANCE_CAP]}
      castShadow={castShadow}
      receiveShadow
      frustumCulled={false}
      renderOrder={GLASSY.has(color) ? 1 : 0}
    />
  );
}

function Voxels({ cells, opaqueCast = true }) {
  const layers = useMemo(() => {
    const byColor = {};
    cells.forEach((c) => {
      const arr = byColor[c.c] || (byColor[c.c] = []);
      arr.push(c);
    });
    return Object.entries(byColor).map(([c, list]) => ({ c, list }));
  }, [cells]);

  return layers.map((l) => <VoxelLayer key={l.c} cells={l.list} color={l.c} castShadow={opaqueCast && !GLASSY.has(l.c)} />);
}

function CropLayer({ crops, now }) {
  return crops.map((cr) => {
    const def = CROPS.find((c) => c.id === cr.cropId);
    const timeMs = (def?.time || 60) * 1000;
    const elapsed = Math.max(0, now - cr.plantedAt);
    const progress = Math.min(1, elapsed / timeMs);
    const grown = progress >= 1;
    const color = CROP_COLORS[cr.cropId] || '#C5F0A0';
    const scale = 0.32 + 0.3 * progress;
    return (
      <group key={`${cr.x}_${cr.y}_${cr.z}`} position={[cr.x, cr.y, cr.z]}>
        <mesh position={[0, 0.5 * scale, 0]} castShadow>
          <boxGeometry args={[scale, scale, scale]} />
          <meshStandardMaterial color={grown ? color : '#9CCB7A'} />
        </mesh>
        {grown && (
          <mesh position={[0, 0.5 * scale + 0.26, 0]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={C.leaf} />
          </mesh>
        )}
      </group>
    );
  });
}

function Ghost() {
  const group = useRef(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1.01, 1.01, 1.01), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9 }),
    []
  );

  useFrame(() => {
    if (!group.current) return;
    const g = worldShared.ghost;
    if (g && g.visible && g.ok) {
      group.current.visible = true;
      group.current.position.set(g.x, g.y, g.z);
      material.color.set(g.color);
    } else {
      group.current.visible = false;
    }
  });

  return (
    <group ref={group} visible={false}>
      <lineSegments geometry={edges} material={material} />
    </group>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
      />
      <hemisphereLight args={['#87CEEB', '#5DA65F', 0.4]} />
    </>
  );
}

function OrbitCamera({ target }) {
  const { camera, gl } = useThree();
  const st = useRef({ ...worldShared.cam });
  const cur = useRef({ ...worldShared.cam });
  const lookCur = useRef(new THREE.Vector3());
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      st.current.yaw -= dx * 0.006;
      st.current.pitch = THREE.MathUtils.clamp(st.current.pitch + dy * 0.006, 0.08, 1.25);
    };
    const onUp = () => { dragging.current = false; };
    const onWheel = (e) => {
      e.preventDefault();
      st.current.dist = THREE.MathUtils.clamp(st.current.dist + e.deltaY * 0.01, 4.5, 13);
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const playerPos = target?.current;
    if (!playerPos) return;
    worldShared.cam.yaw = st.current.yaw;
    worldShared.cam.pitch = st.current.pitch;
    worldShared.cam.dist = st.current.dist;

    const k = 1 - Math.pow(0.0005, delta);
    cur.current.yaw += (st.current.yaw - cur.current.yaw) * k;
    cur.current.pitch += (st.current.pitch - cur.current.pitch) * k;
    cur.current.dist += (st.current.dist - cur.current.dist) * k;

    const cp = Math.cos(cur.current.pitch);
    const sy = Math.sin(cur.current.yaw);
    const cy = Math.cos(cur.current.yaw);
    const desired = new THREE.Vector3(
      playerPos.x + sy * cur.current.dist * cp,
      playerPos.y + Math.sin(cur.current.pitch) * cur.current.dist,
      playerPos.z + cy * cur.current.dist * cp
    );
    camera.position.lerp(desired, 1 - Math.pow(0.0005, delta));
    const look = new THREE.Vector3(playerPos.x, playerPos.y + 0.6, playerPos.z);
    lookCur.current.lerp(look, 1 - Math.pow(0.0005, delta));
    camera.lookAt(lookCur.current);
  });

  return null;
}

function VoxelPlayer({
  positionRef,
  initialPosition = [0, FEET_Y, 8],
  seedColor,
  solidAt,
  avatar,
}) {
  const meshRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const isGrounded = useRef(true);
  const [, getKeys] = useKeyboardControls();

  const fallbackColor = useMemo(() => {
    let h = 0;
    const s = seedColor || '';
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return PLAYER_BODY_PALETTE[h % PLAYER_BODY_PALETTE.length];
  }, [seedColor]);
  const shirt = avatar?.shirt || fallbackColor;
  const pants = avatar?.pants || '#2E3A4B';
  const skin = avatar?.skin || '#FFD5B4';
  const hair = avatar?.hair || '#2B2B2B';

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const keys = getKeys();
    const cam = worldShared.cam || { yaw: 0 };
    const yaw = cam.yaw || 0;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    let ix = 0;
    let iz = 0;
    if (keys.forward) iz -= 1;
    if (keys.backward) iz += 1;
    if (keys.left) ix -= 1;
    if (keys.right) ix += 1;
    const t = touchInput.move;
    if (t && (t.x !== 0 || t.y !== 0)) {
      ix += t.x;
      iz -= t.y;
    }

    const direction = new THREE.Vector3(cosY * ix + sinY * iz, 0, -sinY * ix + cosY * iz);
    const hasInput = direction.lengthSq() > 0.000001;
    if (hasInput) direction.normalize();

    const crouch = !!keys.crouch;
    const speed = crouch ? CROUCH_SPEED : (keys.run || touchInput.run) ? RUN_SPEED : WALK_SPEED;

    if (hasInput) {
      const angle = Math.atan2(direction.x, direction.z);
      meshRef.current.rotation.y = angle;
      worldShared.rot = angle;
    }

    const baseY = crouch ? FEET_Y_CROUCH : FEET_Y;
    const targetScaleY = crouch ? 0.72 : 1;
    if (Math.abs(meshRef.current.scale.y - targetScaleY) > 0.001) {
      meshRef.current.scale.y += (targetScaleY - meshRef.current.scale.y) * 0.25;
    }

    velocity.current.x = direction.x * speed;
    velocity.current.z = direction.z * speed;
    velocity.current.y += GRAVITY * delta;

    if ((keys.jump || touchInput.jump) && isGrounded.current) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
    }

    const pos = meshRef.current.position;
    const tryX = pos.x + velocity.current.x * delta;
    const tryZ = pos.z + velocity.current.z * delta;

    if (!solidAt || !solidAt(tryX, pos.z)) pos.x = tryX;
    else velocity.current.x = 0;
    if (!solidAt || !solidAt(pos.x, tryZ)) pos.z = tryZ;
    else velocity.current.z = 0;

    pos.y += velocity.current.y * delta;
    if (pos.y <= baseY) {
      pos.y = baseY;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    pos.x = THREE.MathUtils.clamp(pos.x, -WORLD_BOUNDS, WORLD_BOUNDS);
    pos.z = THREE.MathUtils.clamp(pos.z, -WORLD_BOUNDS, WORLD_BOUNDS);

    worldShared.moving = Math.abs(velocity.current.x) > 0.02 || Math.abs(velocity.current.z) > 0.02;

    if (positionRef) positionRef.current = pos;
  });

  return (
    <group ref={meshRef} position={initialPosition}>
      <mesh position={[0, -0.25, 0]} castShadow>
        <boxGeometry args={[0.32, 0.5, 0.32]} />
        <meshStandardMaterial color={pants} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.58, 0.62, 0.34]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.52, 0.5, 0.42]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.54, 0.16, 0.44]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[-0.11, 0.66, 0.22]}>
        <boxGeometry args={[0.08, 0.1, 0.02]} />
        <meshStandardMaterial color="#2B2B2B" />
      </mesh>
      <mesh position={[0.11, 0.66, 0.22]}>
        <boxGeometry args={[0.08, 0.1, 0.02]} />
        <meshStandardMaterial color="#2B2B2B" />
      </mesh>
    </group>
  );
}

function VoxelNPC({ position, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = FEET_Y + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.06;
    }
  });
  return (
    <group ref={ref} position={[position[0], FEET_Y, position[1]]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.45, 0.42, 0.38]} />
        <meshStandardMaterial color="#FFD5B4" />
      </mesh>
      <mesh position={[-0.09, 0.62, 0.2]}>
        <boxGeometry args={[0.07, 0.09, 0.02]} />
        <meshStandardMaterial color="#2B2B2B" />
      </mesh>
      <mesh position={[0.09, 0.62, 0.2]}>
        <boxGeometry args={[0.07, 0.09, 0.02]} />
        <meshStandardMaterial color="#2B2B2B" />
      </mesh>
    </group>
  );
}

function Collectibles({ items, playerRef, onCollect }) {
  const [taken, setTaken] = useState({});

  useFrame(() => {
    const p = playerRef.current;
    if (!p) return;
    items.forEach((it) => {
      if (taken[it.id]) return;
      const dx = p.x - it.p[0];
      const dz = p.z - it.p[2];
      if (dx * dx + dz * dz < 2.4) {
        setTaken((prev) => (prev[it.id] ? prev : { ...prev, [it.id]: true }));
        onCollect(it.type);
      }
    });
  });

  return items
    .filter((it) => !taken[it.id])
    .map((it) => (
      <group key={it.id} position={it.p}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={it.c} emissive={it.c} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={it.c} emissive={it.c} emissiveIntensity={0.4} />
        </mesh>
      </group>
    ));
}

function LabelSprite({ text, position, color }) {
  const tex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    const r = 26;
    ctx.fillStyle = 'rgba(18,18,38,0.82)';
    ctx.beginPath();
    ctx.moveTo(r, 6);
    ctx.arcTo(506, 6, 506, 122, r);
    ctx.arcTo(506, 122, 6, 122, r);
    ctx.arcTo(6, 122, 6, 6, r);
    ctx.arcTo(6, 6, 506, 6, r);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = color || '#FFD700';
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 65);
    const t = new THREE.CanvasTexture(canvas);
    t.anisotropy = 4;
    return t;
  }, [text, color]);

  return (
    <sprite position={position} scale={[5.4, 1.35, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  );
}

function LandmarkLabels() {
  return LANDMARKS.map((l) => (
    <LabelSprite key={l.label} text={l.label} color={l.c} position={[l.p[0], l.y, l.p[1]]} />
  ));
}

function Clouds() {
  const refs = useRef([]);
  const INIT = [
    [-20, 16, -18], [10, 18, 5], [-6, 15, 22], [24, 17, -10],
  ];
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const base = INIT[i] || [0, 16, 0];
      g.position.x = base[0] + ((t * 1.2 + i * 24) % 96) - 12;
      g.position.z = base[2] + Math.sin(t * 0.25 + i * 2.1) * 3;
    });
  });
  return INIT.map((c, i) => (
    <group key={i} ref={(el) => { refs.current[i] = el; }} position={c}>
      <mesh>
        <boxGeometry args={[5, 1.1, 2.6]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
      <mesh position={[-1.6, 0.45, 0]}>
        <boxGeometry args={[2.8, 0.9, 2]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
      <mesh position={[1.8, 0.4, 0.3]}>
        <boxGeometry args={[2.4, 0.8, 1.8]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
    </group>
  ));
}

function WaterShimmer() {
  const matA = useRef();
  const matB = useRef();
  useFrame((state) => {
    const o = 0.22 + Math.sin(state.clock.elapsedTime * 1.4) * 0.1;
    if (matA.current) matA.current.opacity = o;
    if (matB.current) matB.current.opacity = o + 0.04;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.33, 23]}>
        <planeGeometry args={[72, 2]} />
        <meshStandardMaterial ref={matA} color="#5EC7FA" transparent depthWrite={false} side={THREE.DoubleSide} renderOrder={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[28, 0.33, 22]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial ref={matB} color="#5EC7FA" transparent depthWrite={false} side={THREE.DoubleSide} renderOrder={2} />
      </mesh>
    </group>
  );
}

function Birds() {
  const g1 = useRef();
  const g2 = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const fl = Math.sin(t * 10) * 0.5;
    if (g1.current) {
      g1.current.position.set(6 + Math.cos(t * 0.5) * 11, 10 + Math.sin(t * 0.9) * 1.4, 4 + Math.sin(t * 0.5) * 11);
      g1.current.rotation.y = -t * 0.5;
      if (g1.current.children[1]) g1.current.children[1].rotation.z = fl;
      if (g1.current.children[2]) g1.current.children[2].rotation.z = -fl;
    }
    if (g2.current) {
      g2.current.position.set(-8 + Math.cos(t * 0.4 + 3) * 9, 12 + Math.sin(t * 0.7 + 1) * 1.6, -6 + Math.sin(t * 0.4 + 3) * 9);
      g2.current.rotation.y = -t * 0.4;
      if (g2.current.children[1]) g2.current.children[1].rotation.z = fl;
      if (g2.current.children[2]) g2.current.children[2].rotation.z = -fl;
    }
  });
  return (
    <>
      <group ref={g1}>
        <mesh>
          <boxGeometry args={[0.16, 0.14, 0.34]} />
          <meshStandardMaterial color="#263238" />
        </mesh>
        <mesh position={[-0.22, 0.05, 0]}>
          <boxGeometry args={[0.32, 0.05, 0.14]} />
          <meshStandardMaterial color="#37474F" />
        </mesh>
        <mesh position={[0.22, 0.05, 0]}>
          <boxGeometry args={[0.32, 0.05, 0.14]} />
          <meshStandardMaterial color="#37474F" />
        </mesh>
      </group>
      <group ref={g2}>
        <mesh>
          <boxGeometry args={[0.16, 0.14, 0.34]} />
          <meshStandardMaterial color="#263238" />
        </mesh>
        <mesh position={[-0.22, 0.05, 0]}>
          <boxGeometry args={[0.32, 0.05, 0.14]} />
          <meshStandardMaterial color="#37474F" />
        </mesh>
        <mesh position={[0.22, 0.05, 0]}>
          <boxGeometry args={[0.32, 0.05, 0.14]} />
          <meshStandardMaterial color="#37474F" />
        </mesh>
      </group>
    </>
  );
}

function IaraCompanion({ playerPosRef }) {
  const ref = useRef();
  useFrame((state, delta) => {
    const g = ref.current;
    const p = playerPosRef?.current;
    if (!g || !p) return;
    const cam = worldShared.cam || { yaw: 0 };
    const yaw = cam.yaw || 0;
    const sy = Math.sin(yaw);
    const cy = Math.cos(yaw);
    const tx = p.x + sy * 1.4 + cy * -1.9;
    const tz = p.z + cy * 1.4 + sy * 1.9;
    const k = Math.min(1, delta * 4);
    g.position.x += (tx - g.position.x) * k;
    g.position.z += (tz - g.position.z) * k;
    const bobY = FEET_Y + Math.sin(state.clock.elapsedTime * 2.2) * 0.12;
    g.position.y += (bobY - g.position.y) * Math.min(1, delta * 6);
    g.rotation.y = Math.atan2(p.x - g.position.x, p.z - g.position.z);
  });
  return (
    <group ref={ref} position={[playerPosRef?.current?.x ?? 0, FEET_Y, playerPosRef?.current?.z ?? 8]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.32]} />
        <meshStandardMaterial color="#7C3AED" />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.45, 0.42, 0.38]} />
        <meshStandardMaterial color="#FFD5B4" />
      </mesh>
      <mesh position={[-0.09, 0.62, 0.2]}>
        <boxGeometry args={[0.07, 0.09, 0.02]} />
        <meshStandardMaterial color="#2B2B2B" />
      </mesh>
      <mesh position={[0.09, 0.62, 0.2]}>
        <boxGeometry args={[0.07, 0.09, 0.02]} />
        <meshStandardMaterial color="#2B2B2B" />
      </mesh>
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function GameScene({ playerPosRef, placed, crops, mode, seedColor, onCollect, progress, avatar, iaraGuide, spawnPos }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 800);
    return () => clearInterval(id);
  }, []);

  const world = useMemo(() => buildMultiWorld({ placed, crops, progress }), [placed, crops, progress]);
  const occSet = world.occKeys;
  const collisionSet = world.solidKeys;

  const solidAt = useMemo(
    () => (px, pz) => {
      for (let dx = -0.35; dx <= 0.35; dx += 0.7) {
        for (let dz = -0.35; dz <= 0.35; dz += 0.7) {
          const cx = Math.floor(px + dx);
          const cz = Math.floor(pz + dz);
          for (let y = 1; y <= 3; y++) {
            if (collisionSet.has(toKey(cx, y, cz))) return true;
          }
        }
      }
      return false;
    },
    [collisionSet]
  );

  const mergedCells = world.cells;

  useFrame(() => {
    const p = playerPosRef.current;
    if (!p) return;
    const ghost = computeFront({
      px: p.x,
      pz: p.z,
      rot: worldShared.rot || 0,
      placed,
      crops,
      mode,
      occSet,
      groundTop: world.groundTop,
    });
    worldShared.front = ghost;
    worldShared.ghost = ghost;
  });

  return (
    <>
      <Lighting />
      <OrbitCamera target={playerPosRef} />
      <KeyboardControls map={keyMap}>
        <VoxelPlayer
          positionRef={playerPosRef}
          seedColor={seedColor}
          avatar={avatar}
          initialPosition={spawnPos ? [spawnPos.x, FEET_Y, spawnPos.z] : [0, FEET_Y, 8]}
          solidAt={solidAt}
        />
      </KeyboardControls>

      <Voxels cells={mergedCells} />

      <CropLayer crops={Object.values(crops)} now={now} />

      {iaraGuide && <IaraCompanion playerPosRef={playerPosRef} />}
      {NPCS.filter((n) => !iaraGuide || n.label !== 'IARA').map((n) => (
        <VoxelNPC key={n.label} position={[n.p[0], n.p[1]]} color={n.c} />
      ))}

      <Collectibles items={COLLECTIBLES} playerRef={playerPosRef} onCollect={onCollect} />

      <Ghost />

      <Clouds />
      <WaterShimmer />
      <Birds />
      <LandmarkLabels />
    </>
  );
}

function VoxelHUD({
  page,
  setPage,
  blockOffset,
  setBlockOffset,
  slot,
  setSlot,
  blocks,
  seeds,
  farm,
  onPrimary,
  onRemove,
}) {
  const visibleBlocks = [];
  for (let i = 0; i < 9; i++) {
    const def = BLOCKS[(blockOffset + i) % BLOCKS.length];
    visibleBlocks.push(def);
  }

  const slotCount = (def) => (def ? (blocks[def.id] || 0) : 0);

  const seedList = seeds.filter((s) => farm && (farm.level || 1) >= (s.level || 1));
  const seedSlots = [];
  for (let i = 0; i < 9; i++) seedSlots.push(seedList[i] || null);
  const seedsCount = (id) => (farm?.inventories?.sementes?.[id] || 0);

  const activeDef = page === 0 ? visibleBlocks[slot] : seedSlots[slot];
  const activeColor = page === 0 ? activeDef?.c : C.leaf;
  const activeName = page === 0 ? activeDef?.name : activeDef?.name;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[95] pointer-events-none flex flex-col items-center pb-3 gap-2">
      <div className="pointer-events-auto bg-black/55 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white text-xs flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-sm border border-white/40"
          style={{ background: activeColor || '#888' }}
        />
        <span className="font-bold">{activeName || '—'}</span>
        <span className="text-white/50">
          {page === 0 ? `F colocar · R remover · E colher` : `F plantar · E colher`}
        </span>
      </div>

      <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-2xl p-2">
        <div className="flex flex-col">
          <button
            onClick={() => { setPage(0); setSlot(0); }}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${page === 0 ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            🧱 Construir
          </button>
          <button
            onClick={() => { setPage(1); setSlot(0); }}
            className={`mt-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${page === 1 ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            🌱 Plantar
          </button>
        </div>

        {page === 0 && (
          <button
            onClick={() => setBlockOffset((o) => (o + 3) % BLOCKS.length)}
            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white/10 text-white/70 hover:bg-white/20"
            title="Mais blocos"
          >
            « »
          </button>
        )}

        <div className="flex gap-1">
          {(page === 0 ? visibleBlocks : seedSlots).map((def, i) => {
            const isBlock = page === 0;
            const count = isBlock ? slotCount(def) : def ? seedsCount(def.id) : 0;
            return (
              <button
                key={`${page}-${i}`}
                onClick={() => setSlot(i)}
                className={`relative w-11 h-12 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                  slot === i ? 'border-white bg-white/20' : 'border-white/20 bg-black/40 hover:bg-white/10'
                } ${!def ? 'opacity-40' : ''}`}
              >
                {def ? (
                  <>
                    <span
                      className="w-5 h-5 rounded-sm border border-white/30"
                      style={{ background: isBlock ? def.c : CROP_COLORS[def.id] }}
                    />
                    <span className="text-[9px] text-white/80 mt-0.5 truncate max-w-full px-0.5">
                      {isBlock ? def.name : def.name}
                    </span>
                    <span className="absolute top-0.5 right-1 text-[9px] font-bold text-white/90">{count}</span>
                  </>
                ) : (
                  <span className="text-white/30 text-sm">·</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={onPrimary}
            className="px-2 py-2 rounded-lg text-[11px] font-bold bg-green-500 text-white hover:bg-green-400 active:scale-95"
          >
            {page === 0 ? '⬜' : '🌱'}
          </button>
          <button
            onClick={onRemove}
            className="px-2 py-2 rounded-lg text-[11px] font-bold bg-red-500/80 text-white hover:bg-red-500 active:scale-95"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

const makeQuestions = (cat, n) => {
  const pool = cat ? QUESTIONS.filter((q) => q.cat === cat) : [...QUESTIONS];
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((q) => {
      const opts = q.opts.map((o, i) => ({ o, i })).sort(() => Math.random() - 0.5);
      return { q: q.q, opts: opts.map((s) => s.o), a: opts.findIndex((s) => s.i === q.a) };
    });
};

const Overlay = ({ title, onClose, children, wide }) => (
  <div className="absolute inset-0 z-[96] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
    <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto`}>
      <div className="sticky top-0 flex items-center justify-between px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="font-bold text-sm">{title}</h2>
        <button onClick={onClose} className="text-white/80 hover:text-white font-black text-lg leading-none px-1">✕</button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

function DialogModal({ npc, text, onClose, actionLabel, onAction }) {
  return (
    <Overlay title={`${npc?.label === 'IARA' ? '🤖 IARA' : '🧑‍🏫'} ${npc?.label || 'Conversa'}`} onClose={onClose}>
      <div className="flex gap-3">
        <div
          className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-2xl ${npc?.label === 'IARA' ? 'bg-purple-600' : ''}`}
          style={npc?.label !== 'IARA' ? { background: npc?.c || '#7C3AED' } : null}
        >
          {npc?.label === 'IARA' ? '🤖' : '🧑‍🏫'}
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
          <div className="flex gap-2">
            {actionLabel && (
              <button
                onClick={onAction}
                className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-400"
              >
                {actionLabel}
              </button>
            )}
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300">
              Sair
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function QuizModal({ title, questions, onCorrect, onDone }) {
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState(null);
  const q = questions[idx];
  if (!q) return null;
  const answer = (i) => {
    if (picked !== null) return;
    setPicked(i);
    const isRight = i === q.a;
    if (isRight) {
      setCorrect((c) => c + 1);
      onCorrect && onCorrect();
    }
    setTimeout(() => {
      setPicked(null);
      if (idx + 1 >= questions.length) onDone(correct + (isRight ? 1 : 0));
      else setIdx(idx + 1);
    }, 900);
  };
  return (
    <Overlay title={`${title} — ${idx + 1}/${questions.length}`} onClose={() => onDone(correct)}>
      <p className="text-gray-800 font-semibold text-sm mb-3">{q.q}</p>
      <div className="grid gap-2">
        {q.opts.map((o, i) => {
          let cls = 'bg-gray-100 hover:bg-indigo-100 border-gray-200 text-gray-800';
          if (picked !== null) {
            if (i === q.a) cls = 'bg-green-100 border-green-400 text-green-800';
            else if (i === picked) cls = 'bg-red-100 border-red-400 text-red-700';
            else cls = 'bg-gray-50 border-gray-200 text-gray-400';
          }
          return (
            <button key={i} onClick={() => answer(i)} className={`text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${cls}`}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-3 text-center text-xs font-bold text-indigo-600">
          {picked === q.a ? '✅ Certo! Recompensas aplicadas.' : `😢 Errou! Resposta certa: ${q.opts[q.a]}`}
        </p>
      )}
    </Overlay>
  );
}

function ArenaModal({ onClose, onFinish }) {
  const [phase, setPhase] = useState('intro');
  const [roundIdx, setRoundIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const locked = useRef(false);

  const round = ARENA_ROUNDS[roundIdx];
  const pool = useMemo(
    () => (phase === 'q' || phase === 'between' ? makeQuestions(round.cat, round.n) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, roundIdx]
  );
  const q = pool[qIdx];

  useEffect(() => {
    if (phase !== 'q' || picked !== null || timeLeft > 0) return;
    resolve(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, picked, qIdx]);

  useEffect(() => {
    if (phase !== 'q' || picked !== null) return;
    const t = setTimeout(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearTimeout(t);
  }, [phase, picked, timeLeft]);

  const resolve = (choice) => {
    if (locked.current) return;
    locked.current = true;
    const isRight = choice !== null && choice === q.a;
    if (choice !== null) setPicked(choice);
    if (isRight) setScore((s) => s + 100);
    setTimeout(() => {
      locked.current = false;
      if (qIdx + 1 >= round.n) {
        if (roundIdx + 1 >= ARENA_ROUNDS.length) setPhase('results');
        else { setRoundIdx(roundIdx + 1); setQIdx(0); setTimeLeft(15); setPicked(null); setPhase('between'); }
      } else {
        setQIdx(qIdx + 1); setTimeLeft(15); setPicked(null);
      }
    }, 900);
  };

  if (phase === 'intro') {
    return (
      <Overlay title="🏆 ARENA DO CONHECIMENTO" onClose={onClose} wide>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">20 jogadores entram. Você corre contra rivais resolvendo desafios:</p>
          <div className="grid grid-cols-2 gap-2">
            {ARENA_ROUNDS.map((r) => (
              <div key={r.name} className="bg-indigo-50 rounded-xl px-3 py-2">
                <p className="text-xs font-bold text-indigo-700">{r.icon || '🧠'} {r.name}</p>
                <p className="text-[11px] text-gray-500">{r.n} questões</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setPhase('between'); setRoundIdx(0); setQIdx(0); setTimeLeft(15); setPicked(null); }}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:opacity-90"
          >
            🏁 Entrar na Arena
          </button>
        </div>
      </Overlay>
    );
  }

  if (phase === 'between') {
    return (
      <Overlay title={`R${roundIdx + 1}: ${round.name}`} onClose={onClose} wide>
        <div className="space-y-3 text-center">
          <p className="text-3xl font-black text-indigo-700">{ROUND_ICONS[round.name] || '🧠'}</p>
          <p className="font-bold text-gray-800">{round.name}</p>
          <p className="text-xs text-gray-500">Placar parcial: {score} pts</p>
          <button
            onClick={() => { setPhase('q'); }}
            className="px-6 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-400"
          >
            Começar rodada
          </button>
        </div>
      </Overlay>
    );
  }

  if (phase === 'results') {
    const rivals = [1500, 1100, 700];
    const rank = rivals.filter((r) => r > score).length + 1;
    return (
      <Overlay title="🏆 RESULTADO" onClose={onClose} wide>
        <div className="space-y-3 text-center">
          <p className={`text-5xl ${rank === 1 ? 'text-amber-500' : 'text-gray-500'}`}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎖️'}</p>
          <p className="text-xl font-black text-gray-800">{rank}º lugar! — {score} pts</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>🏅 Você: {score}</p>
            {rivals.map((r, i) => (
              <p key={i} className="text-gray-400">🥉 Rival {i + 1}: {r}</p>
            ))}
          </div>
          <button
            onClick={() => onFinish(rank, score)}
            className="px-6 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-400"
          >
            Coletar prêmio
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay title={`${round.name} — ${qIdx + 1}/${round.n}`} onClose={onClose} wide>
      <div className="mb-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-400 to-orange-400" style={{ width: `${(timeLeft / 15) * 100}%` }} />
      </div>
      <p className="text-[11px] text-right font-bold text-gray-500 mb-2">{timeLeft}s · {score} pts</p>
      <p className="text-gray-800 font-semibold text-sm mb-3">{q?.q}</p>
      <div className="grid gap-2">
        {q?.opts.map((o, i) => {
          let cls = 'bg-gray-100 hover:bg-indigo-100 border-gray-200 text-gray-800';
          if (picked !== null) {
            if (i === q.a) cls = 'bg-green-100 border-green-400 text-green-800';
            else if (i === picked) cls = 'bg-red-100 border-red-400 text-red-700';
            else cls = 'bg-gray-50 border-gray-200 text-gray-400';
          }
          return (
            <button key={i} onClick={() => resolve(i)} className={`text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${cls}`}>
              {o}
            </button>
          );
        })}
      </div>
    </Overlay>
  );
}

const ROUND_ICONS = { 'Frações': '🍕', 'Porcentagem': '💯', 'Geometria': '📐', 'Desafio Mestre': '👑' };

function BridgeModal({ planks, materials, onBuild, onClose, allDone }) {
  const cost = BRIDGE.plankCost;
  const next = planks.findIndex((p) => !p);
  return (
    <Overlay title="🌉 Canteiro da Ponte" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          Reconstrua a ponte para a <b>Cidade da Matemática</b>. Cada prancha usa materiais conquistados em Desafios.
        </p>
        <div className="flex gap-1.5">
          {BRIDGE.span.map((z, i) => (
            <div key={z} className={`flex-1 h-3 rounded ${planks[i] ? 'bg-green-500' : 'bg-gray-200'}`} title={`Prancha ${i + 1}`} />
          ))}
        </div>
        <p className="text-[11px] text-gray-500 text-center">{planks.filter(Boolean).length}/3 pranchas</p>
        <div className="grid grid-cols-3 gap-2">
          {MATERIALS.map((m) => (
            <div key={m.id} className="bg-gray-100 rounded-xl px-2 py-2 text-center">
              <p className="text-lg">{m.icon}</p>
              <p className="text-[11px] font-bold text-gray-700">{materials[m.id] || 0}</p>
              <p className="text-[9px] text-gray-500">{m.name}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-600">
          Custo por prancha: 🪵×{cost.madeira} 🪨×{cost.pedra} 🧱×{cost.blocos}
        </p>
        {!allDone && next !== -1 ? (
          <button
            onClick={onBuild}
            className="w-full px-4 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-400 disabled:opacity-40"
            disabled={materials.madeira < cost.madeira || materials.pedra < cost.pedra || materials.blocos < cost.blocos}
          >
            🔨 Construir prancha {next + 1}
          </button>
        ) : (
          <p className="text-center font-bold text-green-600">Ponte reconstruída! Atravesse-a. 🎉</p>
        )}
      </div>
    </Overlay>
  );
}

function InventoryModal({ blocks, materials, seeds, farm, onClose }) {
  return (
    <Overlay title="🎒 Inventário" onClose={onClose} wide>
      <p className="text-[11px] font-bold uppercase text-gray-400 mb-1">Materiais de construção</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {MATERIALS.map((m) => (
          <div key={m.id} className="bg-amber-50 rounded-xl px-2 py-2 text-center border border-amber-200">
            <p className="text-lg">{m.icon}</p>
            <p className="text-sm font-bold text-gray-800">{materials[m.id] || 0}</p>
            <p className="text-[10px] text-gray-500">{m.name}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] font-bold uppercase text-gray-400 mb-1">Blocos</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {BLOCKS.map((b) => (
          <div key={b.id} className="rounded-xl p-2 text-center border border-gray-200">
            <p className="w-5 h-5 mx-auto rounded-sm mb-1" style={{ background: b.c }} />
            <p className="text-[11px] font-bold text-gray-700">{blocks[b.id] || 0}</p>
            <p className="text-[9px] text-gray-500">{b.name}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] font-bold uppercase text-gray-400 mb-1">Sementes</p>
      <div className="grid grid-cols-3 gap-2">
        {seeds.map((s) => (
          <div key={s.id} className="rounded-xl p-2 text-center border border-gray-200">
            <p className="w-5 h-5 mx-auto rounded-sm mb-1" style={{ background: CROP_COLORS[s.id] }} />
            <p className="text-[11px] font-bold text-gray-700">{(farm?.inventories?.sementes?.[s.id] || 0)}</p>
            <p className="text-[9px] text-gray-500">{s.name}</p>
          </div>
        ))}
      </div>
    </Overlay>
  );
}

function MapModal({ playerPos, planks, cityUnlocked, onClose, arenaDone }) {
  const w = 200, h = 160;
  const toXY = (x, z) => ({ x: 100 + (x / 36) * 90, y: 80 - (z / 36) * 70 });
  const p = toXY(playerPos.x, playerPos.z);
  return (
    <Overlay title="🗺️ Mapa da Fazenda do Conhecimento" onClose={onClose} wide>
      <div className="relative w-full h-40 rounded-xl bg-gradient-to-b from-green-200 to-green-100 border border-gray-300" style={{ height: h, minHeight: h }}>
        <div className="absolute left-px top-0 bottom-0 w-2 bg-white/70" style={{ left: 100 }} />
        <div className="absolute bottom-0 h-2 bg-blue-300/80" style={{ left: 0, right: 0, bottom: 50 }} title="Rio" />
        <div className="absolute h-1.5 bg-amber-600 rounded" style={{ ...toXY(0, 23.5), width: 26, transform: 'translate(-50%,-50%)' }} title="Ponte" />
        <div className="absolute w-3 h-3 bg-indigo-500 rounded-sm" style={{ ...toXY(0, 30), transform: 'translate(-50%,-50%)' }} title="Cidade da Matemática" />
        <div className="absolute w-2.5 h-2.5 bg-orange-400 rounded-full" style={{ ...toXY(ARENA.npc.x, ARENA.npc.z), transform: 'translate(-50%,-50%)' }} title="Arena" />
        <div className="absolute w-3 h-3 bg-green-700 rounded-full" style={{ ...toXY(0, 8), transform: 'translate(-50%,-50%)' }} title="Spawn" />
        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full border border-black/30" style={{ ...p, transform: 'translate(-50%,-50%)' }} title="Você" />
        <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-600">
          {cityUnlocked ? 'Cidade da Matemática desbloqueada' : `Ponte ${planks.filter(Boolean).length}/3 ${arenaDone ? '· Arena ' : ''}`}
        </p>
      </div>
    </Overlay>
  );
}

const LoadingScreen = () => (
  <div className="fixed inset-0 z-[100] bg-gradient-to-b from-blue-400 to-green-400 flex flex-col items-center justify-center">
    <div className="text-6xl mb-4">🧱</div>
    <h1 className="text-2xl font-display font-bold text-white mb-2">IARA EDU</h1>
    <p className="text-white/80 text-sm mb-6">Gerando mundo em blocos...</p>
    <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
      <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }} />
    </div>
  </div>
);

const defaultStory = () => ({
  iaraDialogSeen: false,
  planks: [false, false, false],
  cityUnlocked: false,
  arenaDone: false,
  arenaBest: 0,
});

const spawnFromHash = () => {
  try {
    const m = /[?&#]pos=(-?[\d.]+),(-?[\d.]+)/.exec(window.location.href);
    if (m) return { x: parseFloat(m[1]), z: parseFloat(m[2]) };
  } catch (e) {}
  return null;
};

const GameWorld = ({ onClose, seedColor }) => {
  const { user } = useAuth();
  const userEmail = user?.email;
  const storageKey = `iara_voxel_world_${userEmail || 'anon'}`;

  const [loaded, setLoaded] = useState(false);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [farm, setFarm] = useState(null);

  const parseSaved = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          placed: parsed.placed || {},
          crops: parsed.crops || {},
          blocks: parsed.blocks || START_KIT,
          materials: { ...START_MATERIALS, ...(parsed.materials || {}) },
          story: { ...defaultStory(), ...(parsed.story || {}) },
          checkpoint: parsed.checkpoint || null,
        };
      }
    } catch (e) {}
    return { placed: {}, crops: {}, blocks: START_KIT, materials: { ...START_MATERIALS }, story: defaultStory(), checkpoint: null };
  };
  const [saved] = useState(parseSaved);
  const [character, setCharacter] = useState(null);
  const [checkpoint, setCheckpoint] = useState(null);

  const spawn = spawnFromHash();
  const spawnPos = spawn || saved.checkpoint || null;
  const playerPosRef = useRef(new THREE.Vector3(spawnPos?.x ?? 0, FEET_Y, spawnPos?.z ?? 8));
  const [posSnapshot, setPosSnapshot] = useState({ x: spawnPos?.x ?? 0, z: spawnPos?.z ?? 8 });

  const [page, setPage] = useState(0);
  const [blockOffset, setBlockOffset] = useState(0);
  const [slot, setSlot] = useState(0);

  const avatar = useMemo(() => avatarThemeFor(character, user?.email || 'iara'), [character, user]);

  const [placed, setPlaced] = useState(saved.placed);
  const [crops, setCrops] = useState(saved.crops);
  const [blocks, setBlocks] = useState(saved.blocks);
  const [materials, setMaterials] = useState(saved.materials);
  const [story, setStory] = useState(saved.story);

  const [modal, setModal] = useState(null);
  const [dialogNpc, setDialogNpc] = useState(null);
  const worldRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ placed, crops, blocks, materials, story, checkpoint }));
    } catch (e) {}
  }, [placed, crops, blocks, materials, story, checkpoint, storageKey]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    let f = getOrCreateFarm(user);
    if (f && f.mission_date !== new Date().toISOString().slice(0, 10)) {
      f = advanceFarmDay(f);
    }
    if (f) f = getFarmFor(user.email);
    setFarm(f);

    setCrops((prev) => {
      const next = {};
      const valid = new Set((f?.crops || []).map((c) => c.id));
      Object.keys(prev).forEach((k) => {
        if (valid.has(prev[k].farmCropId)) next[k] = prev[k];
      });
      return next;
    });
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    try {
      setCharacter(getOrCreateCharacter(user));
    } catch (e) { /* avatar fallback: seed por email */ }
  }, [user]);

  useEffect(() => {
    worldRef.current = buildMultiWorld({ placed, crops, progress: story });
  }, [placed, crops, story]);

  useEffect(() => {
    if (!loaded || story.iaraDialogSeen || modal) return;
    const t = setTimeout(() => {
      setDialogNpc({ p: [0, -9], c: '#7C3AED', label: 'IARA' });
      setModal({ type: 'dialog' });
      setStory((s) => ({ ...s, iaraDialogSeen: true }));
    }, 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, story.iaraDialogSeen]);

  useEffect(() => {
    const id = setInterval(() => {
      const p = playerPosRef.current;
      if (!p) return;
      setPosSnapshot({ x: p.x, z: p.z });
      if (worldShared.moving) {
        setCheckpoint((prev) => {
          if (prev && Math.hypot(p.x - prev.x, p.z - prev.z) < 1.5) return prev;
          return { x: p.x, z: p.z };
        });
      }
      if (p.z > CITY.entranceZ && !story.cityUnlocked && story.planks.every(Boolean)) {
        setStory((s) => ({ ...s, cityUnlocked: true }));
        pushToast('🎉 NOVA REGIÃO DESBLOQUEADA: Cidade da Matemática!');
        if (userEmail) {
          const r = awardReward(userEmail, 'ACTIVITY_COMPLETE');
          setXp((v) => v + (r?.xpGain || 0));
          setCoins((v) => v + (r?.coinGain || 0));
        }
      }
    }, 600);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.cityUnlocked, story.planks]);

  const pushToast = (text) => {
    setNotifications((p) => [...p, { id: Date.now() + Math.random(), text }]);
    setTimeout(() => setNotifications((p) => p.slice(1)), 2600);
  };

  const applyAward = (label, r) => {
    if (!r) return;
    setXp((p) => p + (r.xpGain || 0));
    setCoins((p) => p + (r.coinGain || 0));
    pushToast(`${label} +${r.xpGain || 0} XP +${r.coinGain || 0} 🪙`);
  };

  const grantChallenge = () => {
    if (userEmail) applyAward('✅ Desafio:', awardReward(userEmail, 'QUESTION_CORRECT'));
    setMaterials((m) => ({
      madeira: m.madeira + CHALLENGE_REWARD_MATERIALS.madeira,
      pedra: m.pedra + CHALLENGE_REWARD_MATERIALS.pedra,
      blocos: m.blocos + CHALLENGE_REWARD_MATERIALS.blocos,
    }));
    pushToast('+🪵 Madeira +🪨 Pedra +🧱 Blocos');
  };

  const handleCollect = (type) => {
    const rewards = {
      coin: { xp: 10, coins: 1, label: '+10 XP, +1 🪙' },
      gem: { xp: 25, coins: 3, label: '+25 XP, +3 💎' },
      heart: { xp: 15, coins: 1, label: '+15 XP, +1 ❤️' },
      seed: { xp: 20, coins: 2, label: '+20 XP, +2 🌱' },
      star: { xp: 30, coins: 5, label: '+30 XP, +5 ⭐' },
    };
    const r = rewards[type] || rewards.coin;
    setXp((p) => p + r.xp);
    setCoins((p) => p + r.coins);
    pushToast(`${r.label} +🧱`);
    if (userEmail) awardReward(userEmail, 'WORLD_COLLECT', { extraXp: r.xp, extraCoins: r.coins, item: type });
    const extra = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
    setBlocks((prev) => ({ ...prev, [extra.id]: (prev[extra.id] || 0) + 3 }));
  };

  const frontNow = () => {
    const p = playerPosRef.current;
    return computeFront({
      px: p.x,
      pz: p.z,
      rot: worldShared.rot || 0,
      placed,
      crops,
      mode: page === 0 ? 'build' : 'plant',
      groundTop: worldRef.current?.groundTop,
    });
  };

  const doPlace = () => {
    const g = frontNow();
    if (!g || g.purpose !== 'place' || !g.ok) { pushToast('Sem espaço aí. Ande para um local aberto.'); return; }
    const def = selectedBlock();
    if (!def) return;
    const have = blocks[def.id] || 0;
    if (have <= 0) { pushToast(`Sem ${def.name} no inventário. Colete itens!`); return; }
    const key = toKey(g.x, g.y, g.z);
    setPlaced((prev) => ({ ...prev, [key]: { x: g.x, y: g.y, z: g.z, id: def.id } }));
    setBlocks((prev) => ({ ...prev, [def.id]: have - 1 }));
  };

  const doRemove = () => {
    const g = frontNow();
    if (!g || g.purpose !== 'break' || !g.ok) { pushToast('Não há bloco seu para remover aqui.'); return; }
    const key = toKey(g.x, g.y, g.z);
    const cell = placed[key];
    if (!cell) return;
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setBlocks((prev) => ({ ...prev, [cell.id]: (prev[cell.id] || 0) + 1 }));
    pushToast(`${BLOCKS.find((b) => b.id === cell.id)?.name || 'Bloco'} removido`);
  };

  const doPlant = () => {
    const g = frontNow();
    if (!g || g.purpose !== 'plant' || !g.ok) { pushToast('Plante em terra ou grama livre.'); return; }
    const seedDef = selectedSeed();
    if (!seedDef) { pushToast('Escolha uma semente.'); return; }
    if (!farm) { pushToast('Entre para usar a fazenda.'); return; }
    const res = plantCrop(farm, seedDef.id);
    if (!res.ok) { pushToast(res.msg); return; }
    setFarm(res.farm);
    const newCrop = res.farm.crops[res.farm.crops.length - 1];
    const key = toKey(g.x, g.y, g.z);
    setCrops((prev) => ({
      ...prev,
      [key]: { x: g.x, y: g.y, z: g.z, cropId: seedDef.id, farmCropId: newCrop.id, plantedAt: newCrop.plantedAt || Date.now() },
    }));
  };

  const doHarvest = async () => {
    const g = frontNow();
    const cropCell = g && g.purpose === 'harvest' ? crops[toKey(g.x, g.y, g.z)] : null;
    if (!cropCell || !farm) return;
    const def = CROPS.find((c) => c.id === cropCell.cropId);
    if (!g.mature && !(Date.now() - cropCell.plantedAt >= (def?.time || 60) * 1000)) {
      pushToast(`${def?.emoji || '🌱'} Ainda crescendo. Volte já já!`);
      return;
    }
    const res = await harvestCrop(farm, cropCell.farmCropId);
    if (!res.ok) { pushToast(res.msg); return; }
    setFarm(res.farm);
    const key = toKey(cropCell.x, cropCell.y, cropCell.z);
    setCrops((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    pushToast(res.msg);
  };

  const handlePrimary = () => {
    if (!frontNow()) return;
    if (page === 0) doPlace();
    else doPlant();
  };

  const buildNextPlank = () => {
    const planks = story.planks.slice();
    const idx = planks.findIndex((p) => !p);
    if (idx === -1) return;
    const cost = BRIDGE.plankCost;
    if (materials.madeira < cost.madeira || materials.pedra < cost.pedra || materials.blocos < cost.blocos) {
      pushToast('Materiais insuficientes. Aceite Desafios com a IARA!');
      return;
    }
    setMaterials((m) => ({
      madeira: m.madeira - cost.madeira,
      pedra: m.pedra - cost.pedra,
      blocos: m.blocos - cost.blocos,
    }));
    planks[idx] = true;
    setStory((s) => ({ ...s, planks }));
    pushToast(`🌉 Prancha ${idx + 1}/3 construída!`);
    if (planks.every(Boolean)) {
      pushToast('✅ PONTE RECONSTRUÍDA! Atravesse para a Cidade da Matemática.');
      if (userEmail) applyAward('🏆 Missão concluída:', awardReward(userEmail, 'MISSION_COMPLETE'));
    }
  };

  const doInteract = () => {
    if (modal) return;
    const g = frontNow();
    const cropAt = g && g.purpose === 'harvest' ? crops[toKey(g.x, g.y, g.z)] : null;
    if (cropAt) { doHarvest(); return; }
    const p = playerPosRef.current;
    const targets = NPCS.map((n) => ({ x: n.p[0], z: n.p[1], kind: 'npc', label: n.label })).concat([
      { x: WORKSITE.x, z: WORKSITE.z, kind: 'site', label: WORKSITE.label },
    ]);
    let best = null;
    let bestD = 3.6 * 3.6;
    targets.forEach((t) => {
      const d = (p.x - t.x) ** 2 + (p.z - t.z) ** 2;
      if (d < bestD) { bestD = d; best = t; }
    });
    if (!best) { pushToast('🤷 Nada para interagir aqui. Procure a IARA na praça.'); return; }
    if (best.kind === 'site') {
      if (story.planks.every(Boolean)) { pushToast('🌉 Ponte reconstruída! Atravesse para a cidade.'); return; }
      setModal({ type: 'bridge' });
      return;
    }
    const npc = NPCS.find((n) => n.label === best.label);
    setDialogNpc(npc);
    setModal({ type: 'dialog' });
  };

  const handleInteractRef = useRef(doInteract);
  const handlePrimaryRef = useRef(handlePrimary);
  const handleRemoveRef = useRef(doRemove);
  const handleHarvestRef = useRef(doHarvest);
  useEffect(() => {
    handleInteractRef.current = doInteract;
    handlePrimaryRef.current = handlePrimary;
    handleRemoveRef.current = doRemove;
    handleHarvestRef.current = doHarvest;
  });

  useEffect(() => {
    const handler = (e) => {
      const code = e.code;
      if (modal) {
        if (code === 'Tab' || code === 'KeyM' || code === 'KeyQ' || code === 'Escape') {
          e.preventDefault();
          setModal(null);
        }
        return;
      }
      if (code === 'KeyF') { e.preventDefault(); handlePrimaryRef.current(); return; }
      if (code === 'KeyR') { e.preventDefault(); handleRemoveRef.current(); return; }
      if (code === 'KeyE') { e.preventDefault(); handleInteractRef.current(); return; }
      if (code === 'Tab') { e.preventDefault(); setModal({ type: 'inventory' }); return; }
      if (code === 'KeyM') { e.preventDefault(); setModal({ type: 'map' }); return; }
      if (code === 'KeyQ') {
        e.preventDefault();
        setPage((p) => (p === 0 ? 1 : 0));
        setSlot(0);
        return;
      }
      if (/^Digit[1-9]$/.test(code)) {
        setSlot(Number(code.slice(5)) - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  const selectedBlock = () => BLOCKS[(blockOffset + slot) % BLOCKS.length];
  const selectedSeed = () => {
    const seedList = CROPS.filter((c) => (farm?.level || 1) >= (c.level || 1));
    return seedList[slot] || seedList[0] || null;
  };

  const seeds = useMemo(
    () => CROPS.map((c) => ({ ...c, count: farm?.inventories?.sementes?.[c.id] || 0 })),
    [farm]
  );

  const renderModal = () => {
    switch (modal?.type) {
      case 'dialog': {
        const npc = dialogNpc;
        const text = npc?.label === 'IARA' && story.planks.every(Boolean)
          ? 'Incrível! A ponte está reconstruída. A Cidade da Matemática agora está aberta para você! 🎉'
          : (NPC_DIALOGS[npc?.label] || 'Olá! Explore a Fazenda do Conhecimento.');
        const action =
          npc?.label === 'IARA' || npc?.label === 'Professor' || npc?.label === 'CityTeacher'
            ? { label: 'Aceitar Desafio 🤔', open: 'challenge' }
            : npc?.label === 'ArenaReferee'
              ? { label: '🏆 Iniciar Arena', open: 'arena' }
              : null;
        return (
          <DialogModal
            npc={npc}
            text={text}
            onClose={() => setModal(null)}
            actionLabel={action?.label}
            onAction={() => setModal(action ? { type: action.open, title: `Desafio — ${npc.label}` } : null)}
          />
        );
      }
      case 'challenge':
        return (
          <QuizModal
            title={modal.title || 'Desafio Matemático'}
            questions={makeQuestions(null, 3)}
            onCorrect={grantChallenge}
            onDone={() => setModal(null)}
          />
        );
      case 'bridge':
        return (
          <BridgeModal
            planks={story.planks}
            materials={materials}
            onBuild={buildNextPlank}
            onClose={() => setModal(null)}
            allDone={story.planks.every(Boolean)}
          />
        );
      case 'arena':
        return (
          <ArenaModal
            onClose={() => setModal(null)}
            onFinish={(rank, score) => {
              const r = awardReward(userEmail, 'WORLD_COLLECT', { extraXp: rank === 1 ? 90 : 45, extraCoins: rank === 1 ? 30 : 15 });
              applyAward(`🏆 Arena: ${rank}º lugar!`, r);
              setStory((s) => ({ ...s, arenaDone: true, arenaBest: Math.max(s.arenaBest || 0, score) }));
              setModal(null);
            }}
          />
        );
      case 'inventory':
        return (
          <InventoryModal blocks={blocks} materials={materials} seeds={seeds} farm={farm} onClose={() => setModal(null)} />
        );
      case 'map':
        return (
          <MapModal
            playerPos={posSnapshot}
            planks={story.planks}
            cityUnlocked={story.cityUnlocked}
            arenaDone={story.arenaDone}
            onClose={() => setModal(null)}
          />
        );
      default:
        return null;
    }
  };

  if (!loaded) return <LoadingScreen />;

  return (
    <div className="fixed inset-0 z-[90] bg-black">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-[95] bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-xl font-bold text-sm backdrop-blur-sm transition-colors"
      >
        ← Sair do Mundo 3D
      </button>

      <HUD
        xp={xp}
        coins={coins}
        notifications={notifications}
        materials={materials}
        bridgeProgress={story.planks.filter(Boolean).length}
        bridgeTotal={BRIDGE.span.length}
        cityUnlocked={story.cityUnlocked}
      />

      <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 z-[95] bg-black/50 text-white/70 text-[11px] px-3 py-2 rounded-lg backdrop-blur-sm text-center">
        <p>
          <kbd className="bg-white/20 px-1 rounded">WASD</kbd> Mover · <kbd className="bg-white/20 px-1 rounded">SHIFT</kbd> Correr ·{' '}
          <kbd className="bg-white/20 px-1 rounded">ESPAÇO</kbd> Pular · <kbd className="bg-white/20 px-1 rounded">C</kbd> Agachar
        </p>
        <p className="mt-1">
          🖱️ Arraste para girar a câmera · Role para aproximar/afastar · A IARA te acompanha!
        </p>
        <p className="mt-1">
          <kbd className="bg-white/20 px-1 rounded">F</kbd> Colocar/Plantar · <kbd className="bg-white/20 px-1 rounded">R</kbd> Remover ·{' '}
          <kbd className="bg-white/20 px-1 rounded">E</kbd> Colher/Interagir · <kbd className="bg-white/20 px-1 rounded">Q</kbd> Página ·{' '}
          <kbd className="bg-white/20 px-1 rounded">TAB</kbd> Inventário · <kbd className="bg-white/20 px-1 rounded">M</kbd> Mapa
        </p>
      </div>

      <div className="md:hidden fixed bottom-5 left-5 z-[95]">
        <VirtualJoystick
          onChange={(v) => {
            if (v) setTouchInput({ move: v });
            else setTouchInput({ move: { x: 0, y: 0 } });
          }}
        />
      </div>
      <div className="md:hidden fixed bottom-32 right-5 z-[95] flex flex-col gap-2 items-center">
        <button
          onTouchStart={(e) => { e.preventDefault(); setTouchInput({ jump: true }); }}
          onTouchEnd={() => setTouchInput({ jump: false })}
          className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 text-white text-xl font-bold backdrop-blur-sm active:bg-white/40"
        >
          ⤒
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); setTouchInput({ run: true }); }}
          onTouchEnd={() => setTouchInput({ run: false })}
          className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 text-white text-xs font-bold backdrop-blur-sm active:bg-white/40"
        >
          RUN
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); handleInteractRef.current(); }}
          className="w-14 h-14 rounded-full bg-green-500/80 border-2 border-white/30 text-white text-xl font-bold backdrop-blur-sm active:bg-green-500"
        >
          ✋
        </button>
      </div>

      <VoxelHUD
        page={page}
        setPage={setPage}
        blockOffset={blockOffset}
        setBlockOffset={setBlockOffset}
        slot={slot}
        setSlot={setSlot}
        blocks={blocks}
        seeds={seeds}
        farm={farm}
        onPrimary={handlePrimary}
        onRemove={doRemove}
      />

      {renderModal()}

      <GameErrorBoundary>
        <Canvas
          shadows
          camera={{ position: [0, 5, 8], fov: 60, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => { gl.setClearColor('#87CEEB'); gl.shadowMap.enabled = true; }}
          fallback={<div className="fixed inset-0 flex items-center justify-center text-white">Carregando 3D...</div>}
        >
          <fog attach="fog" args={['#B0E0FF', 45, 110]} />
          <GameScene
            playerPosRef={playerPosRef}
            placed={placed}
            crops={crops}
            mode={page === 0 ? 'build' : 'plant'}
            seedColor={seedColor || user?.email}
            avatar={avatar}
            iaraGuide={loaded && story.iaraDialogSeen}
            spawnPos={spawnPos}
            onCollect={handleCollect}
            progress={story}
          />
        </Canvas>
      </GameErrorBoundary>
    </div>
  );
};

export default GameWorld;