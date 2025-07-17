import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '@/lib/stores/useGameState';
import { getFacingAngle } from '@/lib/gameLogic/movement';

export default function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { playerState } = useGameState();

  useFrame(() => {
    if (meshRef.current) {
      // Update position
      meshRef.current.position.x = playerState.position.x;
      meshRef.current.position.z = playerState.position.z;
      meshRef.current.position.y = 0.5; // Half the height of the cube
      
      // Update rotation based on facing direction
      meshRef.current.rotation.y = getFacingAngle(playerState.facing);
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial color="#4CAF50" />
    </mesh>
  );
}
