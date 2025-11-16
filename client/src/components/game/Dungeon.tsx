import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameState } from '@/lib/stores/useGameState';
import Enemy from './Enemy';
import { useCombat } from '@/lib/stores/useCombat';
import { useInventory } from '@/lib/stores/useInventory';

export default function Dungeon() {
  const { dungeon, setPhase } = useGameState();
  const { startCombat } = useCombat();
  const { addItem } = useInventory();
  
  // Load textures
  const floorTexture = useTexture('/textures/wood.jpg');
  const wallTexture = useTexture('/textures/sand.jpg');

  // Configure texture repetition
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(1, 1);
  wallTexture.repeat.set(1, 1);

  const { floors, walls, enemies, items } = useMemo(() => {
    const floors: JSX.Element[] = [];
    const walls: JSX.Element[] = [];
    const enemies: JSX.Element[] = [];
    const items: JSX.Element[] = [];

    dungeon.forEach((row, x) => {
      row.forEach((cell, z) => {
        const key = `${x}-${z}`;
        
        if (cell.type === 'floor') {
          floors.push(
            <mesh key={`floor-${key}`} position={[x, 0, z]} receiveShadow>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial map={floorTexture} />
            </mesh>
          );
          
          // Add enemy if present
          if (cell.hasEnemy && cell.enemy) {
            enemies.push(
              <Enemy
                key={`enemy-${key}`}
                enemy={cell.enemy}
                onClick={() => {
                  startCombat(cell.enemy!);
                  setPhase('combat');
                }}
              />
            );
          }
          
          // Add item if present
          if (cell.hasItem && cell.item) {
            items.push(
              <mesh
                key={`item-${key}`}
                position={[x, 0.3, z]}
                onClick={() => {
                  addItem(cell.item!);
                  cell.hasItem = false;
                  cell.item = undefined;
                }}
              >
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color="#FFD700" />
              </mesh>
            );
          }
        } else if (cell.type === 'wall') {
          walls.push(
            <mesh key={`wall-${key}`} position={[x, 1, z]} castShadow receiveShadow>
              <boxGeometry args={[1, 2, 1]} />
              <meshStandardMaterial map={wallTexture} />
            </mesh>
          );
        } else if (cell.type === 'stairs') {
          // Render stairs/exits with special glowing appearance
          floors.push(
            <mesh key={`exit-floor-${key}`} position={[x, 0, z]} receiveShadow>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
            </mesh>
          );
          
          // Add a glowing portal effect
          floors.push(
            <mesh key={`exit-portal-${key}`} position={[x, 0.5, z]}>
              <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
              <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} transparent opacity={0.7} />
            </mesh>
          );
        } else if (cell.type === 'door') {
          // Render doors
          floors.push(
            <mesh key={`door-floor-${key}`} position={[x, 0, z]} receiveShadow>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial map={floorTexture} />
            </mesh>
          );
          
          walls.push(
            <mesh key={`door-${key}`} position={[x, 0.5, z]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 1.5, 0.1]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          );
        }
      });
    });

    return { floors, walls, enemies, items };
  }, [dungeon, startCombat, setPhase, addItem, floorTexture, wallTexture]);

  return (
    <group>
      {/* Floor tiles */}
      {floors}
      
      {/* Wall tiles */}
      {walls}
      
      {/* Enemies */}
      {enemies}
      
      {/* Items */}
      {items}
    </group>
  );
}
