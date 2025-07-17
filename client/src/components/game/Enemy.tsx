import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Enemy as EnemyType } from '@/types/game';

interface EnemyProps {
  enemy: EnemyType;
  onClick?: () => void;
}

export default function Enemy({ enemy, onClick }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Simple floating animation
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (!enemy.isAlive) return null;

  return (
    <mesh
      ref={meshRef}
      position={[enemy.position.x, 0.5, enemy.position.z]}
      onClick={onClick}
      castShadow
    >
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial color="#F44336" />
    </mesh>
  );
}
