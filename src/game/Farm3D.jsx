import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Player, ThirdPersonCamera, PLAYER_HEIGHT } from './Player';
import { setTouchInput } from './input';
import VirtualJoystick from './components/VirtualJoystick';
import GameErrorBoundary from './components/GameErrorBoundary';
import { useAuth } from '@/lib/AuthContext';
import { getOrCreateFarm, plantCrop, harvestCrop, saveFarm, advanceFarmDay } from '@/api/farm';
import { CROPS, farmLevelFor, energyMaxFor } from '@/api/integrations';

// Keyboard controls config shared with Player
export const keyMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'jump', keys: ['Space'] },
];

// ─── FARM LAYOUT ─────────────────────────────────────────────────
const PLOT_COLS = 4;
const PLOT_ROWS = 3;
const PLOT_SPACING = 2.4;
const PLOTS = [];
for (let r = 0; r < PLOT_ROWS; r++) {
  for (let c = 0; c < PLOT_COLS; c++) {
    PLOTS.push({
      index: PLOTS.length,
      x: Math.round((c - (PLOT_COLS - 1) / 2) * PLOT_SPACING * 10) / 10,
      z: Math.round((r - (PLOT_ROWS - 1) / 2) * PLOT_SPACING * 10) / 10,
    });
  }
}

// NPC / objects positions
const PLAYER_SPAWN = [0, PLAYER_HEIGHT / 2, 6];
const NPC_FARMER = { x: 0, z: 6.5, name: 'Agricultor', color: '#8B6914' };
const NPC_IARA = { x: 8, z: 0, name: 'IARA', color: '#7C3AED' };
const BARN_POS = { x: 0, z: -9 };
const HOUSE_POS = { x: 8, z: -7 };
const WELL_POS = { x: -8, z: 5 };
const COINS = [
  { x: -5, z: -6 }, { x: 6, z: -3 }, { x: -6, z: 3 }, { x: 5, z: 6 }, { x: 0, z: 9 },
];

// ─── CROP VISUALS (3D) ───────────────────────────────────────────
const CROP_STYLE = {
  milho: { color: '#F5C518', stem: '#4CAF50' },
  trigo: { color: '#E6C229', stem: '#8BC34A' },
  cenoura: { color: '#FF8C00', top: '#4CAF50' },
  alface: { color: '#7CB342' },
  cafe: { color: '#6D4C41', berry: '#C0392B' },
  cacau: { color: '#5D4037', pod: '#8D6E63' },
};

// Crop 3D model (grows with progress 0..1)
function Crop3D({ cropId, progress }) {
  const ref = useRef();
  const style = CROP_STYLE[cropId] || CROP_STYLE.milho;
  const grown = progress >= 1;
  const scale = useMemo(() => {
    if (progress <= 0) return 0;
    if (progress < 0.35) return 0.25 + (progress / 0.35) * 0.2;
    if (progress < 1) return 0.45 + ((progress - 0.35) / 0.65) * 0.55;
    return 1;
  }, [progress]);
  const visibility = progress <= 0 ? 'hidden' : 'visible';

  useFrame((state) => {
    if (!ref.current) return;
    const bob = grown ? Math.sin(state.clock.elapsedTime * 2) * 0.04 : 0;
    ref.current.scale.setScalar(scale);
    ref.current.position.y = bob;
  });

  if (progress <= 0) return null;

  return (
    <group ref={ref}>
      {cropId === 'milho' && (
        <>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 1.1, 8]} />
            <meshStandardMaterial color={style.stem} />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.06, 0.5, 8]} />
            <meshStandardMaterial color={style.color} />
          </mesh>
        </>
      )}
      {cropId === 'trigo' && (
        <>
          {[-0.12, 0, 0.12].map((x, i) => (
            <mesh key={i} position={[x, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.05, 1, 6]} />
              <meshStandardMaterial color={style.stem} />
            </mesh>
          ))}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.12 + i * 0.12, 0.95, 0]} rotation={[0.3, 0, i * 0.4]} castShadow>
              <coneGeometry args={[0.12, 0.35, 6]} />
              <meshStandardMaterial color={style.color} />
            </mesh>
          ))}
        </>
      )}
      {cropId === 'cenoura' && (
        <>
          <mesh position={[0, 0.3, 0]} castShadow>
            <coneGeometry args={[0.14, 0.6, 8]} />
            <meshStandardMaterial color={style.color} />
          </mesh>
          {[-0.08, 0, 0.08].map((x, i) => (
            <mesh key={i} position={[x, 0.62, 0]} rotation={[0.2, 0, (i - 1) * 0.3]} castShadow>
              <coneGeometry args={[0.05, 0.28, 6]} />
              <meshStandardMaterial color={style.top} />
            </mesh>
          ))}
        </>
      )}
      {cropId === 'alface' && (
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.42, 10, 10]} />
          <meshStandardMaterial color={style.color} />
        </mesh>
      )}
      {cropId === 'cafe' && (
        <>
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.38, 10, 10]} />
            <meshStandardMaterial color={style.color} />
          </mesh>
          {[[0, 0.35, 0.3], [0.25, 0.15, 0], [-0.25, 0.1, 0], [0, 0.5, -0.2]].map((p, i) => (
            <mesh key={i} position={p} castShadow>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={style.berry} />
            </mesh>
          ))}
        </>
      )}
      {cropId === 'cacau' && (
        <>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
            <meshStandardMaterial color={style.color} />
          </mesh>
          <mesh position={[0, 0.85, 0]} castShadow>
            <sphereGeometry args={[0.32, 8, 8]} />
            <meshStandardMaterial color={style.pod} />
          </mesh>
          {[0.2, -0.15, 0].map((x, i) => (
            <mesh key={i} position={[x, 0.55, i * 0.15]} rotation={[0, 0, 0.3]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
              <meshStandardMaterial color={style.pod} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

// ─── PLOT (canteiro) ─────────────────────────────────────────────
function Plot({ x, z, crop, now, selected }) {
  const grown = crop && now - crop.plantedAt >= (CROPS.find((c) => c.id === crop.cropId)?.time || 0) * 1000;
  const elapsed = crop ? Math.min(1, (now - crop.plantedAt) / ((CROPS.find((c) => c.id === crop.cropId)?.time || 1) * 1000)) : 0;
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = 0;
  });

  return (
    <group position={[x, 0, z]}>
      {/* Dirt */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.15, 1.6]} />
        <meshStandardMaterial color="#8B5A2B" />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0.12, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.75, 0.12, 0.12]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.12, 1.75]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      {/* Crop */}
      {crop && <Crop3D cropId={crop.cropId} progress={elapsed} />}
      {/* Ready sparkle */}
      {grown && (
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial emissive="#FFD700" emissiveIntensity={0.6} color="#FFD700" />
        </mesh>
      )}
    </group>
  );
}

// ─── NPC ─────────────────────────────────────────────────────────
function NPC({ pos, color, label, emoji }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2 + pos.x) * 0.05;
    }
  });
  return (
    <group ref={ref} position={[pos.x, 0, pos.z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.5, 4, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[0.23, 12, 12]} />
        <meshStandardMaterial color="#FFD5B4" />
      </mesh>
      {/* Name tag */}
      <sprite position={[0, 1.5, 0]}>
        <spriteMaterial transparent opacity={0} />
      </sprite>
    </group>
  );
}

// ─── BARN ────────────────────────────────────────────────────────
function Barn({ position }) {
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.8, 3.5]} />
        <meshStandardMaterial color="#C0392B" />
      </mesh>
      <mesh position={[0, 3.3, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[4.4, 1, 3.9]} />
        <meshStandardMaterial color="#7F1D1D" />
      </mesh>
      {/* Roof peak */}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2 - 0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 4.6, 1.4]} />
        <meshStandardMaterial color="#A93226" />
      </mesh>
      <mesh position={[0, 1, 1.77]}>
        <planeGeometry args={[1.2, 1.6]} />
        <meshStandardMaterial color="#D35400" />
      </mesh>
      <mesh position={[1.5, 2, 1.77]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial color="#FFF8E1" />
      </mesh>
      <mesh position={[-1.5, 2, 1.77]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial color="#FFF8E1" />
      </mesh>
    </group>
  );
}

// ─── WELL ────────────────────────────────────────────────────────
function Well({ position }) {
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.8, 12]} />
        <meshStandardMaterial color="#7F8C8D" />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.15, 1.4, 0.15]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      <mesh position={[0.6, 0, 0]}>
        <boxGeometry args={[0.15, 1, 0.15]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      <mesh position={[0.3, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#3E2723" />
      </mesh>
    </group>
  );
}

// ─── TREE ────────────────────────────────────────────────────────
function Tree({ x, z, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + x) * 0.02;
    }
  });
  return (
    <group ref={ref} position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 2, 8]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <sphereGeometry args={[1.1, 8, 8]} />
        <meshStandardMaterial color="#3D8B37" />
      </mesh>
      <mesh position={[0.6, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
    </group>
  );
}

// ─── FENCE ───────────────────────────────────────────────────────
function Fence({ from, to }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const segments = Math.max(1, Math.round(length / 2));
  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => {
        const t = segments === 1 ? 0.5 : i / (segments - 1);
        const x = from[0] + dx * t;
        const z = from[1] + dz * t;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[0.15, 0.8, 0.08]} />
              <meshStandardMaterial color="#8D6E63" />
            </mesh>
            <mesh position={[0, 0.65, 1]} castShadow>
              <boxGeometry args={[2, 0.12, 0.06]} />
              <meshStandardMaterial color="#A1887F" />
            </mesh>
            <mesh position={[0, 0.3, 1]} castShadow>
              <boxGeometry args={[2, 0.1, 0.06]} />
              <meshStandardMaterial color="#A1887F" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── COLLECTIBLE COIN ────────────────────────────────────────────
function Coin({ pos, onCollect }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 1.5;
    ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
  });
  return (
    <mesh ref={ref} position={[pos.x, 1, pos.z]} onClick={() => onCollect?.(pos)}>
      <cylinderGeometry args={[0.3, 0.3, 0.12, 16]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  );
}

// ─── PATH (estrada de terra) ─────────────────────────────────────
function DirtPath({ points, width = 1.6 }) {
  const curve = useMemo(() => {
    const pts = points.map((p) => new THREE.Vector3(p[0], 0.02, p[1]));
    return new THREE.CatmullRomCurve3(pts);
  }, [points]);
  const mesh = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, width / 2, 4, false);
  }, [curve, width]);
  return (
    <mesh geometry={mesh} position={[0, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#C8A96A" />
    </mesh>
  );
}

// Optional ?tp=x,y,z to override the initial spawn (automated testing only; ignored by normal users)
const tpParams = (() => {
  try {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get('tp');
    if (!t) return null;
    const [x, y = PLAYER_HEIGHT / 2, z] = t.split(',').map(Number);
    if ([x, z].some((n) => !Number.isFinite(n))) return null;
    return [x, Number.isFinite(y) ? y : PLAYER_HEIGHT / 2, z];
  } catch (e) { return null; }
})();
const INITIAL_POSITION = tpParams || PLAYER_SPAWN;

// ─── INTERACTION PROBE ───────────────────────────────────────────
function InteractionProbe({ playerRef, targets, radius, onTarget }) {
  const last = useRef(null);
  useFrame(() => {
    if (!playerRef.current) return;
    const px = playerRef.current.x;
    const pz = playerRef.current.z;
    let best = null;
    let bestD = radius * radius;
    for (const t of targets) {
      const dx = px - t.x;
      const dz = pz - t.z;
      const d = dx * dx + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    const id = best ? `${best.type}_${best.index ?? ''}` : null;
    if (id !== last.current) {
      last.current = id;
      onTarget(best ? { ...best, distance: Math.sqrt(bestD) } : null);
    }
  });
  return null;
}

// ─── LOADING ─────────────────────────────────────────────────────
function FarmLoading() {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-sky-400 to-green-400 flex flex-col items-center justify-center">
      <div className="text-6xl mb-4 animate-bounce-soft">🌾</div>
      <h1 className="text-2xl font-display font-bold text-white mb-2">Fazendinha 3D</h1>
      <p className="text-white/80 text-sm mb-6">Preparando a terra...</p>
      <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );
}

// ─── FARM SCENE ──────────────────────────────────────────────────
function FarmScene({ farm, now, selectedCrop, playerPosRef, onTarget, onCoin, seedColor }) {
  // build targets: plots + npcs + coins
  const plotTargets = PLOTS.map((p) => {
    const cropRow = farm.crops?.[p.index];
    const cropDef = cropRow ? CROPS.find((c) => c.id === cropRow.cropId) : null;
    const grown = cropRow && cropDef ? now - cropRow.plantedAt >= cropDef.time * 1000 : false;
    return { type: 'plot', index: p.index, x: p.x, z: p.z, cropRow, cropDef, grown };
  });
  const npcTargets = [
    { type: 'npc', name: NPC_FARMER.name, x: NPC_FARMER.x, z: NPC_FARMER.z },
    { type: 'npc', name: NPC_IARA.name, x: NPC_IARA.x, z: NPC_IARA.z },
  ];
  const coinTargets = COINS.map((c, i) => ({ type: 'coin', index: i, x: c.x, z: c.z }));
  const targets = [...plotTargets, ...npcTargets, ...coinTargets];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <hemisphereLight args={['#87CEEB', '#5DA65F', 0.45]} />

      <ThirdPersonCamera target={playerPosRef} distance={7} height={4.5} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60, 20, 20]} />
        <meshStandardMaterial color="#69B34C" />
      </mesh>

      {/* Dirt paths */}
      <DirtPath points={[[-14, -12], [-4, -6], [0, 0], [6, 6], [12, 12]]} />
      <DirtPath points={[[-12, 12], [-6, 6], [0, 0], [6, -6], [12, -12]]} />

      {/* Plots */}
      {PLOTS.map((p) => (
        <Plot key={p.index} x={p.x} z={p.z} crop={farm.crops?.[p.index]} now={now} selected={selectedCrop} />
      ))}

      {/* Buildings */}
      <Barn position={BARN_POS} />
      {/* House of the student */}
      <group position={[HOUSE_POS.x, 0, HOUSE_POS.z]}>
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 2, 3]} />
          <meshStandardMaterial color="#FFB74D" />
        </mesh>
        <mesh position={[0, 2.4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <coneGeometry args={[2.6, 1.4, 4]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.8, 1.51]}>
          <planeGeometry args={[0.9, 1.2]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      </group>
      <Well position={WELL_POS} />

      {/* Trees */}
      <Tree x={-6} z={-11} scale={1.2} />
      <Tree x={6} z={-14} scale={1.1} />
      <Tree x={-13} z={-2} scale={1} />
      <Tree x={-14} z={10} scale={1.1} />
      <Tree x={13} z={-8} scale={1} />
      <Tree x={14} z={4} scale={1.2} />
      <Tree x={2} z={-16} scale={0.9} />
      <Tree x={12} z={14} scale={1} />

      {/* Fences */}
      <Fence from={[-6, -7.4]} to={[6, -7.4]} />
      <Fence from={[-6, 7.4]} to={[6, 7.4]} />

      {/* NPCs */}
      <NPC pos={NPC_FARMER} color={NPC_FARMER.color} label="Agricultor" emoji="🧑‍🌾" />
      <NPC pos={NPC_IARA} color={NPC_IARA.color} label="IARA" emoji="🧜‍♀️" />

      {/* Player avatar */}
      <Player positionRef={playerPosRef} seedColor={seedColor} initialPosition={INITIAL_POSITION} />

      {/* Collectible coins */}
      {COINS.map((c, i) => (
        <Coin key={i} pos={c} onCollect={onCoin} />
      ))}

      <InteractionProbe playerRef={playerPosRef} targets={targets} radius={2.4} onTarget={onTarget} />
    </>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────
const Farm3D = ({ onClose, onOpenClassic }) => {
  const { user, refreshUser } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [farm, setFarm] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [selectedCrop, setSelectedCrop] = useState('milho');
  const [target, setTarget] = useState(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
  const [dialog, setDialog] = useState(null);
  const [reward, setReward] = useState(null);
  const [collectedCoins, setCollectedCoins] = useState(new Set());
  const playerPosRef = useRef(new THREE.Vector3(0, PLAYER_HEIGHT / 2, 6));

  const loadFarm = useCallback(() => {
    if (!user) return null;
    let f = getOrCreateFarm(user);
    if (f && f.mission_date !== new Date().toISOString().slice(0, 10)) f = advanceFarmDay(f);
    setFarm(f);
    return f;
  }, [user]);

  useEffect(() => { loadFarm(); }, [loadFarm]);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1300);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!reward) return;
    const t = setTimeout(() => setReward(null), 2600);
    return () => clearTimeout(t);
  }, [reward]);

  const level = farmLevelFor(farm?.xp || 0);
  const energyMax = energyMaxFor(farm?.xp || 0);
  const inventory = farm?.inventories?.sementes || {};
  const seedsLeft = inventory[selectedCrop] || 0;

  // Keyboard: E interact, Escape menu, M classic
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyE') handleInteract();
      if (e.code === 'Escape') onClose();
      if (e.code === 'KeyM') onOpenClassic();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, farm, selectedCrop, playerPos, collectedCoins, dialog]);

  const handleInteract = async () => {
    if (!target) return;
    if (dialog) return setDialog(null);
    if (target.type === 'plot') {
      const row = farm.crops?.[target.index];
      if (row) {
        if (target.grown) {
          const res = await harvestCrop(farm, row.id);
          if (res.ok) {
            setReward({ xp: res.earned.xp, milhos: res.earned.milhos, emoji: res.earned.emoji });
            setFarm(res.farm);
            refreshUser?.();
          }
        }
      } else if ((inventory[selectedCrop] || 0) >= 1 && farm.crops.length < PLOTS.length) {
        const res = plantCrop(farm, selectedCrop);
        if (res.ok) {
          setFarm(res.farm);
        }
      }
    } else if (target.type === 'npc') {
      if (target.name === 'Agricultor') {
        setDialog({
          title: '🧑‍🌾 Agricultor João',
          emoji: '🌾',
          text: 'Oi, jardineiro! Aproxime-se de um canteiro vazio e pressione E para plantar. Quando a planta crescer, volte e colha para ganhar XP e milhos!',
        });
      } else if (target.name === 'IARA') {
        setDialog({
          title: '🧜‍♀️ IARA',
          emoji: '🎓',
          text: 'Olá! Esta é a Fazendinha 3D. Ande pelo campo, plante suas sementes, cuide das plantas e colha as recompensas. Cada colheita vale XP e milhos!',
        });
      }
    } else if (target.type === 'coin') {
      const idx = target.index;
      if (!collectedCoins.has(idx)) {
        const patch = { ...farm, milhos: (farm.milhos || 0) + 3 };
        saveFarm(patch);
        setFarm(patch);
        setCollectedCoins((s) => new Set(s).add(idx));
        setReward({ xp: 0, milhos: 3, emoji: '🪙' });
      }
    }
  };

  // build interaction prompt
  const prompt = useMemo(() => {
    if (!target) return null;
    if (target.type === 'plot') {
      const row = farm.crops?.[target.index];
      if (row) {
        const cropDef = CROPS.find((c) => c.id === row.cropId);
        if (target.grown) return { label: `🧺 Colher ${cropDef?.emoji} +${cropDef?.xp} XP e +${cropDef?.xp} 🌽`, action: 'harvest' };
        const left = Math.max(0, Math.ceil((cropDef.time * 1000 - (now - row.plantedAt)) / 1000));
        return { label: `⏳ Crescendo em ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, action: 'wait' };
      }
      if (seedsLeft >= 1) {
        const cd = CROPS.find((c) => c.id === selectedCrop);
        return { label: `🌱 Plantar ${cd?.emoji} ${cd?.name} (${seedsLeft})`, action: 'plant' };
      }
      return { label: '❌ Sem sementes', action: 'none' };
    }
    if (target.type === 'npc') return { label: `💬 Falar com ${target.name}`, action: 'npc' };
    if (target.type === 'coin') return { label: `🪙 Coletar +3 milhos`, action: 'coin' };
    return null;
  }, [target, farm, selectedCrop, seedsLeft, now]);

  if (!loaded) return <FarmLoading />;

  const ClassicButton = ({ className = '' }) => (
    <button onClick={onOpenClassic} className={`bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm transition-colors ${className}`}>
      📋 Visão Clássica
    </button>
  );

  return (
    <GameErrorBoundary>
      <div className="fixed inset-0 z-[90] bg-black">
        {/* Top bar */}
        <div className="absolute top-3 left-3 z-[96] flex items-center gap-2">
          <button onClick={onClose} className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-xl font-bold text-sm backdrop-blur-sm transition-colors">
            ← Sair
          </button>
          <ClassicButton />
        </div>

        {/* HUD */}
        <div className="absolute top-3 right-3 z-[96] space-y-2">
          {/* Level + XP */}
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-white min-w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏡</span>
              <span className="font-bold text-sm">Fazenda Nv {level}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, ((farm?.xp || 0) % 100) / 100 * 100)}%` }} />
            </div>
          </div>
          {/* Wallet */}
          <div className="flex gap-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white flex items-center gap-1.5">
              <span>🌽</span><span className="font-bold text-sm">{farm?.milhos || 0}</span>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white flex items-center gap-1.5">
              <span>💎</span><span className="font-bold text-sm">{farm?.gemas || 0}</span>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white flex items-center gap-1.5">
              <span>⚡</span><span className="font-bold text-sm">{farm?.energy ?? 0}/{energyMax}</span>
            </div>
          </div>
        </div>

        {/* Seed selector */}
        <div className="absolute top-40 md:top-44 right-3 z-[96] flex flex-col gap-1.5 max-w-[130px]">
          <p className="text-[10px] text-white/70 font-bold bg-black/40 rounded-lg px-2 py-1 backdrop-blur-sm">🌱 Sementes</p>
          {CROPS.filter((c) => level >= (c.level || 1)).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCrop(c.id)}
              className={`text-left rounded-lg px-2 py-1 text-xs font-bold backdrop-blur-sm transition-all ${selectedCrop === c.id ? 'bg-amber-500 text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
            >
              {c.emoji} {c.name} <span className="opacity-70">({inventory[c.id] || 0})</span>
            </button>
          ))}
        </div>

        {/* Interaction prompt */}
        {prompt && !dialog && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[97]">
            <div className="bg-black/70 backdrop-blur-sm text-white font-bold text-sm px-5 py-2.5 rounded-xl animate-pop-in shadow-xl border border-white/10">
              {prompt.label} <span className="ml-2 bg-white/20 rounded px-1.5 py-0.5 text-[10px]">E</span>
            </div>
          </div>
        )}

        {/* Dialog */}
        {dialog && (
          <div className="absolute inset-x-0 bottom-6 z-[98] flex justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 animate-pop-in">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{dialog.emoji}</span>
                <div className="flex-1">
                  <p className="font-heading font-bold text-foreground">{dialog.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{dialog.text}</p>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={() => setDialog(null)} className="bg-primary text-white text-sm font-bold px-4 py-1.5 rounded-lg">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reward */}
        {reward && (
          <div className="pointer-events-none absolute inset-0 z-[99] flex items-center justify-center">
            <div className="bg-white/95 card-playful px-8 py-6 text-center space-y-1 shadow-2xl animate-reward-pop rounded-2xl">
              <span className="text-6xl block animate-bounce-soft">{reward.emoji}</span>
              {reward.xp > 0 && <p className="text-2xl font-display font-bold text-emerald-600">+{reward.xp} XP</p>}
              {reward.milhos > 0 && <p className="text-xl font-display font-bold text-amber-500">+{reward.milhos} 🌽 milhos</p>}
            </div>
          </div>
        )}

        {/* Desktop hint */}
        <div className="hidden md:block absolute bottom-3 left-3 z-[96] bg-black/50 text-white/70 text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
          <p><kbd className="bg-white/20 px-1 rounded">WASD</kbd> Andar &nbsp; <kbd className="bg-white/20 px-1 rounded">SHIFT</kbd> Correr &nbsp; <kbd className="bg-white/20 px-1 rounded">SPACE</kbd> Pular &nbsp; <kbd className="bg-white/20 px-1 rounded">E</kbd> Plantar/Colher &nbsp; <kbd className="bg-white/20 px-1 rounded">M</kbd> Clássico</p>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden fixed bottom-5 left-4 z-[96]">
          <VirtualJoystick onChange={(v) => setTouchInput(v ? { move: v } : { move: { x: 0, y: 0 } })} />
        </div>
        <div className="md:hidden fixed bottom-8 right-4 z-[96] flex flex-col gap-3 items-center">
          <button
            onClick={() => {
              if (dialog) setDialog(null);
              else handleInteract();
            }}
            onTouchEnd={(e) => { e.preventDefault(); if (dialog) setDialog(null); else handleInteract(); }}
            className="w-16 h-16 rounded-full bg-amber-400 text-black text-xl font-bold shadow-lg active:bg-amber-300 flex items-center justify-center"
          >
            🧺
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); setTouchInput({ jump: true }); }}
            onTouchEnd={() => setTouchInput({ jump: false })}
            className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 text-white text-xl font-bold backdrop-blur-sm active:bg-white/40"
          >⤒</button>
          <button
            onTouchStart={(e) => { e.preventDefault(); setTouchInput({ run: true }); }}
            onTouchEnd={() => setTouchInput({ run: false })}
            className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 text-white text-xs font-bold backdrop-blur-sm active:bg-white/40"
          >RUN</button>
        </div>

        {/* 3D Canvas */}
        <Canvas
          shadows
          camera={{ position: [0, 4.5, 7], fov: 55, near: 0.1, far: 120 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => { gl.setClearColor('#87CEEB'); gl.shadowMap.enabled = true; }}
        >
          <fog attach="fog" args={['#B0E0FF', 35, 60]} />
          <KeyboardControls map={keyMap}>
            <FarmScene
              farm={farm || { crops: [], milhos: 0 }}
              now={now}
              selectedCrop={selectedCrop}
              playerPosRef={playerPosRef}
              seedColor={user?.email || 'student'}
              onTarget={setTarget}
              onCoin={(pos) => {
                const idx = COINS.findIndex((c) => c.x === pos.x && c.z === pos.z);
                if (idx >= 0 && !collectedCoins.has(idx)) {
                  const patch = { ...farm, milhos: (farm?.milhos || 0) + 3 };
                  saveFarm(patch);
                  setFarm(patch);
                  setCollectedCoins((s) => new Set(s).add(idx));
                  setReward({ xp: 0, milhos: 3, emoji: '🪙' });
                }
              }}
            />
          </KeyboardControls>
        </Canvas>
      </div>
    </GameErrorBoundary>
  );
};

export default Farm3D;