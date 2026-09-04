import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeyboardControls } from '@react-three/drei';
import { touchInput } from './input';

export const GRAVITY = -20;
export const JUMP_FORCE = 8;
export const WALK_SPEED = 4;
export const RUN_SPEED = 8;
export const PLAYER_HEIGHT = 1.6;
export const WORLD_BOUNDS = 45;

const PALETTE = ['#4A90D9', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6', '#00BCD4', '#E84393', '#6F42C1'];

const hashStr = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// ─── PLAYER ──────────────────────────────────────────────────────
export function Player({ positionRef, seedColor, initialPosition = [0, PLAYER_HEIGHT / 2, 0], onPosChange }) {
  const meshRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const isGrounded = useRef(true);
  const bodyColor = useRef(PALETTE[hashStr(seedColor) % PALETTE.length]);
  const lastSent = useRef({ x: 0, z: 0 });
  const [, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const keys = getKeys();
    const direction = new THREE.Vector3();

    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;

    const t = touchInput && touchInput.move;
    if (t && (t.x !== 0 || t.y !== 0)) {
      direction.x += t.x;
      direction.z -= t.y;
    }
    direction.normalize();

    const speed = (keys.run || touchInput?.run) ? RUN_SPEED : WALK_SPEED;

    if (direction.length() > 0) {
      const angle = Math.atan2(direction.x, direction.z);
      meshRef.current.rotation.y = angle;
    }

    velocity.current.x = direction.x * speed;
    velocity.current.z = direction.z * speed;
    velocity.current.y += GRAVITY * delta;

    const wantJump = keys.jump || touchInput?.jump;
    if (wantJump && isGrounded.current) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
    }

    meshRef.current.position.x += velocity.current.x * delta;
    meshRef.current.position.z += velocity.current.z * delta;
    meshRef.current.position.y += velocity.current.y * delta;

    if (meshRef.current.position.y <= PLAYER_HEIGHT / 2) {
      meshRef.current.position.y = PLAYER_HEIGHT / 2;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    meshRef.current.position.x = THREE.MathUtils.clamp(meshRef.current.position.x, -WORLD_BOUNDS, WORLD_BOUNDS);
    meshRef.current.position.z = THREE.MathUtils.clamp(meshRef.current.position.z, -WORLD_BOUNDS, WORLD_BOUNDS);

    if (positionRef) positionRef.current = meshRef.current.position;
    if (onPosChange) {
      const dx = Math.abs(meshRef.current.position.x - lastSent.current.x);
      const dz = Math.abs(meshRef.current.position.z - lastSent.current.z);
      if (dx + dz > 0.15) {
        lastSent.current = { x: meshRef.current.position.x, z: meshRef.current.position.z };
        onPosChange(meshRef.current.position.x, meshRef.current.position.z);
      }
    }
  });

  return (
    <group ref={meshRef} position={initialPosition}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 4, 12]} />
        <meshStandardMaterial color={bodyColor.current} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#FFD5B4" />
      </mesh>
      <mesh position={[-0.08, 0.88, 0.2]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.08, 0.88, 0.2]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

// ─── THIRD PERSON CAMERA ─────────────────────────────────────────
export function ThirdPersonCamera({ target, distance = 8, height = 5 }) {
  const { camera } = useThree();
  const offset = useRef(new THREE.Vector3(0, height, distance));
  const currentPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!target?.current) return;
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

export default Player;