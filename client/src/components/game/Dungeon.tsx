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
