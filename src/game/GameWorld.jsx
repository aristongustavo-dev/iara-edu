import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { KeyboardControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import HUD from './components/HUD';
import VirtualJoystick from './components/VirtualJoystick';
import GameErrorBoundary from './components/GameErrorBoundary';
import { awardReward } from '@/lib/gamification';
import { useAuth } from '@/lib/AuthContext';
import { touchInput, setTouchInput } from './input';

// ─── WORLD CONSTANTS ─────────────────────────────────────────────
const GRAVITY = -20;
const JUMP_FORCE = 8;
const WALK_SPEED = 4;
const RUN_SPEED = 8;
const PLAYER_HEIGHT = 1.6;

// ─── KEYBOARD MAP ────────────────────────────────────────────────
const keyMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'interact', keys: ['KeyE'] },
];

// ─── THIRD PERSON CAMERA ─────────────────────────────────────────
function ThirdPersonCamera({ target }) {
  const { camera } = useThree();
  const offset = useRef(new THREE.Vector3(0, 5, 8));
  const currentPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!target.current) return;
    const playerPos = target.current;
    const desiredPos = new THREE.Vector3(
      playerPos.x + offset.current.x,
      playerPos.y + offset.current.y,
      playerPos.z + offset.current.z
    );
    currentPos.current.lerp(desiredPos, 1 - Math.pow(0.001, delta));
    currentLookAt.current.lerp(playerPos, 1 - Math.pow(0.001, delta));
    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// ─── PLAYER ──────────────────────────────────────────────────────
function Player({ positionRef }) {
  const meshRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const isGrounded = useRef(true);
  const [, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const keys = getKeys();
    const direction = new THREE.Vector3();

    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;
    direction.normalize();

    // Mobile touch input
    const t = touchInput;
    if (t.move && (t.move.x !== 0 || t.move.y !== 0)) {
      direction.x += t.move.x;
      direction.z -= t.move.y;
      direction.normalize();
    }

    const speed = (keys.run || t.run) ? RUN_SPEED : WALK_SPEED;

    // Face direction of movement
    if (direction.length() > 0) {
      const angle = Math.atan2(direction.x, direction.z);
      meshRef.current.rotation.y = angle;
    }

    // Apply horizontal movement
    velocity.current.x = direction.x * speed;
    velocity.current.z = direction.z * speed;

    // Gravity
    velocity.current.y += GRAVITY * delta;

    // Jump
    if ((keys.jump || t.jump) && isGrounded.current) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
    }

    // Update position
    meshRef.current.position.x += velocity.current.x * delta;
    meshRef.current.position.z += velocity.current.z * delta;
    meshRef.current.position.y += velocity.current.y * delta;

    // Ground collision
    if (meshRef.current.position.y <= PLAYER_HEIGHT / 2) {
      meshRef.current.position.y = PLAYER_HEIGHT / 2;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    // World bounds
    meshRef.current.position.x = THREE.MathUtils.clamp(meshRef.current.position.x, -45, 45);
    meshRef.current.position.z = THREE.MathUtils.clamp(meshRef.current.position.z, -45, 45);

    // Update position ref for camera
    if (positionRef) {
      positionRef.current = meshRef.current.position;
    }
  });

  return (
    <group ref={meshRef} position={[0, PLAYER_HEIGHT / 2, 0]}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#4A90D9" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#FFD5B4" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.08, 0.88, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.08, 0.88, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

// ─── GROUND ──────────────────────────────────────────────────────
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshStandardMaterial color="#5DA65F" />
    </mesh>
  );
}

// ─── ROAD ────────────────────────────────────────────────────────
function Road({ points, width = 2 }) {
  const shape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    return s;
  }, [width]);

  const curve = React.useMemo(() => {
    const pts = points.map((p) => new THREE.Vector3(p[0], 0.01, p[1]));
    return new THREE.CatmullRomCurve3(pts);
  }, [points]);

  const tubeGeo = React.useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, width / 2, 4, false);
  }, [curve, width]);

  return (
    <mesh geometry={tubeGeo} position={[0, 0.01, 0]} rotation={[0, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#C4A265" />
    </mesh>
  );
}

// ─── BUILDING ────────────────────────────────────────────────────
function Building({ position, size, color, label, roofColor }) {
  const [w, h, d] = size;
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, h + 0.3, 0]} castShadow>
        <boxGeometry args={[w + 0.3, 0.5, d + 0.3]} />
        <meshStandardMaterial color={roofColor || '#8B4513'} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.5, d / 2 + 0.01]}>
        <planeGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      {/* Windows */}
      <mesh position={[-w / 4, h * 0.6, d / 2 + 0.01]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[w / 4, h * 0.6, d / 2 + 0.01]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
    </group>
  );
}

// ─── TREE ────────────────────────────────────────────────────────
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
        <meshStandardMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#3D8B37" />
      </mesh>
    </group>
  );
}

// ─── WATER ───────────────────────────────────────────────────────
function Water({ position, size }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#4FC3F7" transparent opacity={0.7} />
    </mesh>
  );
}

// ─── NPC ─────────────────────────────────────────────────────────
function NPC({ position, color, label, emoji }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFD5B4" />
      </mesh>
    </group>
  );
}

// ─── COLLECTIBLE ─────────────────────────────────────────────────
function Collectible({ position, color, onCollect }) {
  const ref = useRef();
  const [visible, setVisible] = useState(true);
  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });
  if (!visible) return null;
  return (
    <mesh ref={ref} position={position} onClick={() => { setVisible(false); onCollect?.(); }}>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

// ─── MOUNTAIN ────────────────────────────────────────────────────
function Mountain({ position, height = 10, radius = 8 }) {
  return (
    <mesh position={[position[0], height / 2, position[2]]} castShadow>
      <coneGeometry args={[radius, height, 8]} />
      <meshStandardMaterial color="#6B8E6B" />
    </mesh>
  );
}

// ─── LIGHTING ────────────────────────────────────────────────────
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
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight args={['#87CEEB', '#5DA65F', 0.4]} />
    </>
  );
}

// ─── LOADING ─────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-blue-400 to-green-400 flex flex-col items-center justify-center">
      <div className="text-6xl mb-4">🏫</div>
      <h1 className="text-2xl font-display font-bold text-white mb-2">IARA EDU</h1>
      <p className="text-white/80 text-sm mb-6">Carregando o mundo...</p>
      <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );
}

// ─── GAME WORLD SCENE ────────────────────────────────────────────
function GameScene({ onCollect }) {
  const playerPosRef = useRef(new THREE.Vector3());

  return (
    <>
      <Lighting />
      <ThirdPersonCamera target={playerPosRef} />
      <KeyboardControls map={keyMap}>
        <Player positionRef={playerPosRef} />
      </KeyboardControls>

      {/* Ground */}
      <Ground />

      {/* Roads */}
      <Road points={[[-40, 0], [-10, 0], [0, 0], [10, 0], [40, 0]]} width={2.5} />
      <Road points={[[0, -40], [0, -10], [0, 0], [0, 10], [0, 40]]} width={2.5} />

      {/* Buildings */}
      <Building position={[-15, 0, -15]} size={[5, 3, 4]} color="#8B5E3C" roofColor="#A0522D" label="Casa" />
      <Building position={[0, 0, -12]} size={[6, 4, 5]} color="#4A90D9" roofColor="#3A7BC8" label="Escola" />
      <Building position={[12, 0, -10]} size={[5, 3.5, 4]} color="#8B4513" roofColor="#A0522D" label="Biblioteca" />
      <Building position={[20, 0, -5]} size={[5, 4, 5]} color="#2ECC71" roofColor="#27AE60" label="Laboratório" />
      <Building position={[-12, 0, 10]} size={[7, 2.5, 5]} color="#DAA520" roofColor="#B8860B" label="Fazenda" />
      <Building position={[8, 0, 12]} size={[5, 3, 4]} color="#E67E22" roofColor="#D35400" label="Mercado" />
      <Building position={[18, 0, 10]} size={[4, 3, 4]} color="#F39C12" roofColor="#E67E22" label="Praça" />
      <Building position={[-20, 0, -5]} size={[5, 3.5, 4]} color="#CD853F" roofColor="#8B6914" label="Museu" />
      <Building position={[25, 0, -15]} size={[5, 4, 5]} color="#9B59B6" roofColor="#8E44AD" label="Centro Tech" />

      {/* Trees */}
      {[[-30, 0, -30], [-25, 0, 20], [30, 0, -25], [35, 0, 25], [-35, 0, 5], [0, 0, 30], [-20, 0, 25], [25, 0, -30], [-8, 0, 20], [15, 0, 25]].map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} scale={0.8 + Math.random() * 0.4} />
      ))}

      {/* Mountains */}
      <Mountain position={[-35, 0, -35]} height={12} radius={8} />
      <Mountain position={[35, 0, -35]} height={15} radius={10} />
      <Mountain position={[35, 0, 35]} height={10} radius={7} />

      {/* Water */}
      <Water position={[30, 0.05, 20]} size={[8, 6]} />

      {/* NPCs */}
      <NPC position={[0, 0.8, -9]} color="#7C3AED" label="IARA" />
      <NPC position={[2, 0.8, -9]} color="#4A90D9" label="Professor" />
      <NPC position={[-10, 0.8, 12]} color="#8B6914" label="Agricultor" />
      <NPC position={[15, 0.8, 12]} color="#E67E22" label="Mercador" />

      {/* Collectibles */}
      <Collectible position={[-5, 1, -5]} color="#FFD700" onCollect={() => onCollect?.('coin')} />
      <Collectible position={[8, 1, -3]} color="#4FC3F7" onCollect={() => onCollect?.('gem')} />
      <Collectible position={[-8, 1, 8]} color="#FF6B6B" onCollect={() => onCollect?.('heart')} />
      <Collectible position={[15, 1, -8]} color="#4CAF50" onCollect={() => onCollect?.('seed')} />
      <Collectible position={[-15, 1, -8]} color="#9B59B6" onCollect={() => onCollect?.('star')} />
    </>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
const GameWorld = ({ onClose }) => {
  const { user } = useAuth();
  const userEmail = user?.email;
  const [loaded, setLoaded] = useState(false);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleCollect = (type) => {
    const rewards = { coin: { xp: 10, coins: 1, label: '+10 XP, +1 🪙' }, gem: { xp: 25, coins: 3, label: '+25 XP, +3 💎' }, heart: { xp: 15, coins: 1, label: '+15 XP, +1 ❤️' }, seed: { xp: 20, coins: 2, label: '+20 XP, +2 🌱' }, star: { xp: 30, coins: 5, label: '+30 XP, +5 ⭐' } };
    const r = rewards[type] || rewards.coin;
    setXp((p) => p + r.xp);
    setCoins((p) => p + r.coins);
    setNotifications((p) => [...p, { id: Date.now(), text: r.label }]);
    setTimeout(() => setNotifications((p) => p.slice(1)), 2500);
    if (userEmail) awardReward(userEmail, 'WORLD_COLLECT', { extraXp: r.xp, extraCoins: r.coins, item: type });
  };

  if (!loaded) return <LoadingScreen />;

  return (
    <div className="fixed inset-0 z-[90] bg-black">
      {/* Back button */}
      <button onClick={onClose} className="absolute top-4 left-4 z-[95] bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-xl font-bold text-sm backdrop-blur-sm transition-colors">
        ← Sair do Mundo 3D
      </button>

      {/* HUD */}
      <HUD xp={xp} coins={coins} notifications={notifications} />

      {/* Desktop controls hint */}
      <div className="hidden md:block absolute bottom-4 left-4 z-[95] bg-black/50 text-white/70 text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
        <p><kbd className="bg-white/20 px-1 rounded">WASD</kbd> Mover &nbsp; <kbd className="bg-white/20 px-1 rounded">SHIFT</kbd> Correr &nbsp; <kbd className="bg-white/20 px-1 rounded">SPACE</kbd> Pular</p>
      </div>

      {/* Mobile controls */}
      <div className="md:hidden fixed bottom-5 left-5 z-[95]">
        <VirtualJoystick
          onChange={(v) => {
            if (v) setTouchInput({ move: v });
            else setTouchInput({ move: { x: 0, y: 0 } });
          }}
        />
      </div>
      <div className="md:hidden fixed bottom-8 right-6 z-[95] flex flex-col gap-3 items-center">
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
      <GameErrorBoundary>
        <Canvas
          shadows
          camera={{ position: [0, 5, 8], fov: 60, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => { gl.setClearColor('#87CEEB'); gl.shadowMap.enabled = true; }}
          fallback={<div className="fixed inset-0 flex items-center justify-center text-white">Carregando 3D...</div>}
        >
          <fog attach="fog" args={['#B0E0FF', 40, 80]} />
          <GameScene onCollect={handleCollect} />
        </Canvas>
      </GameErrorBoundary>
    </div>
  );
};

export default GameWorld;
