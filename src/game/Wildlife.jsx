import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ANIMAL_DEFS } from './worldContent';

const PASTURE = [
  [-6, 1], [6, -2], [-4, -4], [4, 1], [-8, -3], [8, -1],
  [-1, -6], [1, -4], [7, -5], [-7, -6], [3, -2], [-3, 0],
];

const WILDLIFE_ANCHORS = [
  { type: 'coelho', p: [-24, -10], color: '#E8D5C2' },
  { type: 'coelho', p: [20, -18], color: '#E8D5C2' },
  { type: 'esquilo', p: [-27, 18], color: '#C89B6E' },
  { type: 'esquilo', p: [16, 21], color: '#C89B6E' },
  { type: 'coelho', p: [-9, 20], color: '#E8D5C2' },
  { type: 'esquilo', p: [-18, -20], color: '#C89B6E' },
  { type: 'coelho', p: [22, 6], color: '#E8D5C2' },
  { type: 'esquilo', p: [4, -24], color: '#C89B6E' },
];

const BUTTERFLY_ANCHORS = [
  [-10, 4], [10, 0], [0, 9], [-5, -6], [14, -2], [-14, 2],
];

const BIRD_ANCHORS = [
  { base: [-16, 10, -14], amp: 9, ph: 0 },
  { base: [14, 11, 12], amp: 8, ph: 2 },
];

function VoxelAnimal({ def, anchor, seed }) {
  const ref = useRef();
  const phase = seed * 1.37;
  const w = def.w || 0.7;
  const h = def.h || 0.6;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const bob = Math.sin(t * 2.4 + phase) * 0.05;
    const driftX = Math.sin(t * 0.5 + phase) * 0.7;
    const driftZ = Math.cos(t * 0.45 + phase) * 0.7;
    const yaw = Math.sin(t * 0.7 + phase) * 0.5;
    ref.current.position.x = anchor[0] + driftX;
    ref.current.position.z = anchor[1] + driftZ;
    ref.current.position.y = bob;
    ref.current.rotation.y = yaw;
  });

  const legColor = def.id === 'vaca' || def.id === 'cavalo' ? '#B99A7E' : def.spot;
  const headOnRight = true;

  return (
    <group ref={ref} position={[anchor[0], 0, anchor[1]]}>
      <group rotation={[0, Math.PI, 0]}>
        <mesh position={[0, h * 0.5, 0]} castShadow>
          <boxGeometry args={[w, h * 0.55, w * 0.6]} />
          <meshStandardMaterial color={def.color} />
        </mesh>
        {def.id === 'vaca' && def.color === '#F5F5F5' && (
          <>
            <mesh position={[-w * 0.15, h * 0.55, 0]}>
              <boxGeometry args={[w * 0.16, h * 0.16, w * 0.5]} />
              <meshStandardMaterial color={def.spot} />
            </mesh>
            <mesh position={[w * 0.2, h * 0.62, 0]}>
              <boxGeometry args={[w * 0.16, h * 0.14, w * 0.44]} />
              <meshStandardMaterial color={def.spot} />
            </mesh>
          </>
        )}
        <mesh position={[headOnRight ? w * 0.42 : -w * 0.42, h * 0.58, 0]} castShadow>
          <boxGeometry args={[w * 0.42, h * 0.4, w * 0.46]} />
          <meshStandardMaterial color={def.color} />
        </mesh>
        {def.id === 'cavalo' && (
          <mesh position={[headOnRight ? w * 0.62 : -w * 0.62, h * 0.9, 0]}>
            <boxGeometry args={[w * 0.1, h * 0.5, w * 0.1]} />
            <meshStandardMaterial color={def.spot} />
          </mesh>
        )}
        {legColor && (
          <>
            <mesh position={[-w * 0.2, -h * 0.28, w * 0.18]}>
              <boxGeometry args={[w * 0.14, h * 0.3, w * 0.14]} />
              <meshStandardMaterial color={legColor} />
            </mesh>
            <mesh position={[w * 0.2, -h * 0.28, w * 0.18]}>
              <boxGeometry args={[w * 0.14, h * 0.3, w * 0.14]} />
              <meshStandardMaterial color={legColor} />
            </mesh>
            <mesh position={[-w * 0.2, -h * 0.28, -w * 0.18]}>
              <boxGeometry args={[w * 0.14, h * 0.3, w * 0.14]} />
              <meshStandardMaterial color={legColor} />
            </mesh>
            <mesh position={[w * 0.2, -h * 0.28, -w * 0.18]}>
              <boxGeometry args={[w * 0.14, h * 0.3, w * 0.14]} />
              <meshStandardMaterial color={legColor} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

export function FarmAnimals({ farm }) {
  const animals = farm?.animals || [];
  if (!animals.length) return null;
  return animals.map((a, i) => {
    const def = ANIMAL_DEFS[a.id] || ANIMAL_DEFS.galinha;
    const anchor = PASTURE[i % PASTURE.length];
    return <VoxelAnimal key={`${a.id}_${i}`} def={{ ...def, id: a.id }} anchor={[...anchor]} seed={i} />;
  });
}

function GroundWildlife({ anchor, type, c }) {
  const ref = useRef();
  const seed = anchor[0] * 0.3 + anchor[1] * 0.7;
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const hop = Math.abs(Math.sin(t * 2 + seed)) * 0.22;
    const driftX = Math.sin(t * 0.4 + seed) * 0.5;
    const driftZ = Math.cos(t * 0.5 + seed) * 0.5;
    ref.current.position.x = anchor[0] + driftX;
    ref.current.position.z = anchor[1] + driftZ;
    ref.current.position.y = hop;
    ref.current.rotation.y = Math.sin(t * 0.6 + seed) * 0.6;
  });
  const size = type === 'coelho' ? 0.36 : 0.3;
  return (
    <group ref={ref} position={anchor}>
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size, size * 0.55, size * 0.7]} />
        <meshStandardMaterial color={c} />
      </mesh>
      <mesh position={[0, size * 0.95, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.42, size * 0.5]} />
        <meshStandardMaterial color={c} />
      </mesh>
      {type === 'coelho' && (
        <>
          <mesh position={[-size * 0.15, size * 1.15, -size * 0.32]}>
            <boxGeometry args={[size * 0.12, size * 0.45, size * 0.1]} />
            <meshStandardMaterial color={c} />
          </mesh>
          <mesh position={[size * 0.15, size * 1.15, -size * 0.32]}>
            <boxGeometry args={[size * 0.12, size * 0.45, size * 0.1]} />
            <meshStandardMaterial color={c} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Butterfly({ anchor, i }) {
  const ref = useRef();
  const seed = i * 2.3 + anchor[0] * 0.1;
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const flap = Math.sin(t * 14 + seed) * 0.45;
    ref.current.position.x = anchor[0] + Math.sin(t * 1.1 + seed) * 2.4;
    ref.current.position.z = anchor[1] + Math.cos(t * 0.9 + seed) * 2.4;
    ref.current.position.y = 1.1 + Math.sin(t * 1.6 + seed) * 0.7;
    ref.current.rotation.y = t * (0.8 + (i % 2) * 0.3);
    if (ref.current.children[0]) ref.current.children[0].rotation.z = flap;
    if (ref.current.children[1]) ref.current.children[1].rotation.z = -flap;
  });
  const c = i % 2 === 0 ? '#EC4899' : '#FFD54F';
  return (
    <group ref={ref} position={[anchor[0], 1.1, anchor[1]]}>
      <mesh>
        <boxGeometry args={[0.16, 0.02, 0.05]} />
        <meshStandardMaterial color="#2B2B2B" />
      </mesh>
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.14, 0.02, 0.1]} />
        <meshStandardMaterial color={c} />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <boxGeometry args={[0.14, 0.02, 0.1]} />
        <meshStandardMaterial color={c} />
      </mesh>
    </group>
  );
}

function FlyingBird({ anchor, i }) {
  const ref = useRef();
  const ph = i;
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const fl = Math.sin(t * 10 + ph) * 0.5;
    if (ref.current.children[1]) ref.current.children[1].rotation.z = fl;
    if (ref.current.children[2]) ref.current.children[2].rotation.z = -fl;
    const x = anchor.base[0] + Math.cos(t * 0.5 + anchor.ph) * anchor.amp;
    const z = anchor.base[2] + Math.sin(t * 0.5 + anchor.ph) * anchor.amp;
    const y = anchor.base[1] + Math.sin(t * 0.8 + anchor.ph) * 1.4;
    if (ref.current.position) ref.current.position.set(x, y, z);
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.16, 0.13, 0.32]} />
        <meshStandardMaterial color="#37474F" />
      </mesh>
      <mesh position={[-0.2, 0.04, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.12]} />
        <meshStandardMaterial color="#546E7A" />
      </mesh>
      <mesh position={[0.2, 0.04, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.12]} />
        <meshStandardMaterial color="#546E7A" />
      </mesh>
    </group>
  );
}

export default function Wildlife({ farm }) {
  return (
    <>
      <FarmAnimals farm={farm} />
      {WILDLIFE_ANCHORS.map((a, i) => (
        <GroundWildlife key={i} anchor={[a.p[0], a.p[1]]} type={a.type} c={a.color} />
      ))}
      {BUTTERFLY_ANCHORS.map((a, i) => (
        <Butterfly key={i} anchor={a} i={i} />
      ))}
      {BIRD_ANCHORS.map((a, i) => (
        <FlyingBird key={i} anchor={a} i={i} />
      ))}
    </>
  );
}