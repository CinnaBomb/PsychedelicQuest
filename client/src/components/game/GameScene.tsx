import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';

import Player from './Player';
import Dungeon from './Dungeon';
import TouchControls from './TouchControls';
import { useGameState } from '@/lib/stores/useGameState';
import { useAudio } from '@/lib/stores/useAudio';
import { moveForward, moveBackward, turnLeft, turnRight } from '@/lib/gameLogic/movement';
import { isValidPosition, getDungeonCell } from '@/lib/gameLogic/dungeon';

// Define control mapping
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  turnLeft = 'turnLeft',
  turnRight = 'turnRight',
  interact = 'interact',
}

const keyMap = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.turnLeft, keys: ['KeyQ'] },
  { name: Controls.turnRight, keys: ['KeyE'] },
  { name: Controls.interact, keys: ['Space'] },
];

function CameraController() {
  const cameraRef = useRef<THREE.Camera>(null);
  const { playerState } = useGameState();

  useFrame(({ camera }) => {
    // Position camera behind and above the player
    const offset = new THREE.Vector3(0, 2, 3);
    const playerPosition = new THREE.Vector3(
      playerState.position.x,
      0.5,
      playerState.position.z
    );
    
    // Rotate offset based on player facing direction
    const angle = playerState.facing * Math.PI / 2;
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    
    camera.position.copy(playerPosition.add(offset));
    
    // Look at player position
    const lookAt = new THREE.Vector3(
      playerState.position.x,
      0.5,
      playerState.position.z
    );
    camera.lookAt(lookAt);
  });

  return null;
}

function PlayerController() {
  const [subscribe, getState] = useKeyboardControls<Controls>();
  const { 
    playerState, 
    updatePlayerPosition, 
    updatePlayerFacing,
    dungeon
  } = useGameState();
  
  const { playHit } = useAudio();

  useEffect(() => {
    const unsubscribe = subscribe(
      (state) => state,
      (state) => {
        // Handle movement
        if (state.forward) {
          const newPos = moveForward(playerState);
          if (isValidPosition(dungeon, newPos)) {
            updatePlayerPosition(newPos.x, newPos.z);
            console.log('Moved forward to:', newPos);
          } else {
            console.log('Cannot move forward - blocked');
          }
        }
        
        if (state.backward) {
          const newPos = moveBackward(playerState);
          if (isValidPosition(dungeon, newPos)) {
            updatePlayerPosition(newPos.x, newPos.z);
            console.log('Moved backward to:', newPos);
          } else {
            console.log('Cannot move backward - blocked');
          }
        }
        
        // Handle turning
        if (state.turnLeft) {
          const newFacing = turnLeft(playerState.facing);
          updatePlayerFacing(newFacing);
          console.log('Turned left, now facing:', newFacing);
        }
        
        if (state.turnRight) {
          const newFacing = turnRight(playerState.facing);
          updatePlayerFacing(newFacing);
          console.log('Turned right, now facing:', newFacing);
        }
        
        // Handle interaction
        if (state.interact) {
          const cell = getDungeonCell(dungeon, playerState.position);
          if (cell?.hasEnemy) {
            console.log('Interact with enemy!');
            playHit();
          } else if (cell?.hasItem) {
            console.log('Interact with item!');
          }
        }
      }
    );

    return unsubscribe;
  }, [subscribe, playerState, updatePlayerPosition, updatePlayerFacing, dungeon, playHit]);

  return null;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
    </>
  );
}

export default function GameScene() {
  return (
    <div className="relative w-full h-full">
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{
            position: [3, 2, 6],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "default"
          }}
        >
          <color attach="background" args={["#1a1a1a"]} />
          
          <Lights />
          <CameraController />
          <PlayerController />
          
          <Player />
          <Dungeon />
        </Canvas>
      </KeyboardControls>
      
      {/* Touch Controls Overlay */}
      <TouchControls />
    </div>
  );
}
