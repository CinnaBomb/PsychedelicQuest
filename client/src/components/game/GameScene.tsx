import { useEffect, useRef, useState } from 'react';
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
import { moveForward, moveBackward, turnLeft, turnRight, strafeLeft, strafeRight } from '@/lib/gameLogic/movement';
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
  
  // Track current and target angles for smooth rotation
  const [currentAngle, setCurrentAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);

  // Update target angle when player facing changes
  useEffect(() => {
    const newTargetAngle = -playerState.facing * Math.PI / 2;
    setTargetAngle(newTargetAngle);
  }, [playerState.facing]);

  useFrame(({ camera }, delta) => {
    // Smoothly interpolate between current and target angle
    const rotationSpeed = 4; // Adjust this for faster/slower rotation
    let angleDiff = targetAngle - currentAngle;
    
    // Handle angle wrapping - always take the shortest path
    while (angleDiff > Math.PI) {
      angleDiff -= 2 * Math.PI;
    }
    while (angleDiff < -Math.PI) {
      angleDiff += 2 * Math.PI;
    }
    
    // Interpolate smoothly
    const newCurrentAngle = currentAngle + angleDiff * rotationSpeed * delta;
    setCurrentAngle(newCurrentAngle);
    
    // Position camera at player's eye level (first person)
    const eyeHeight = 1.6; // Eye level height
    const playerPosition = new THREE.Vector3(
      playerState.position.x,
      eyeHeight,
      playerState.position.z
    );
    
    // Set camera at player position
    camera.position.copy(playerPosition);
    
    // Look in the direction the player is facing
    const forwardDirection = new THREE.Vector3(0, 0, -1); // Default forward is negative Z
    forwardDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), newCurrentAngle);
    
    const lookAtTarget = playerPosition.clone().add(forwardDirection);
    camera.lookAt(lookAtTarget);
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
  const lastTurnLeftState = useRef(false);
  const lastTurnRightState = useRef(false);
  const lastTurnLeftTime = useRef(0);
  const lastTurnRightTime = useRef(0);
  const TURN_DEBOUNCE_MS = 150; // Minimum time between turns

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
        
        // Handle strafing
        if (state.left) {
          const newPos = strafeLeft(playerState);
          if (isValidPosition(dungeon, newPos)) {
            updatePlayerPosition(newPos.x, newPos.z);
            console.log('Strafed left to:', newPos);
          } else {
            console.log('Cannot strafe left - blocked');
          }
        }
        
        if (state.right) {
          const newPos = strafeRight(playerState);
          if (isValidPosition(dungeon, newPos)) {
            updatePlayerPosition(newPos.x, newPos.z);
            console.log('Strafed right to:', newPos);
          } else {
            console.log('Cannot strafe right - blocked');
          }
        }
        
        // Handle turning - only on key press (not held) with debounce
        const now = Date.now();
        if (state.turnLeft && !lastTurnLeftState.current && (now - lastTurnLeftTime.current) > TURN_DEBOUNCE_MS) {
          updatePlayerFacing((currentFacing) => {
            const newFacing = turnLeft(currentFacing);
            console.log('Q PRESSED: Turned left from', currentFacing, 'to', newFacing, ['North', 'East', 'South', 'West'][newFacing]);
            return newFacing;
          });
          lastTurnLeftTime.current = now;
        }
        lastTurnLeftState.current = state.turnLeft;
        
        if (state.turnRight && !lastTurnRightState.current && (now - lastTurnRightTime.current) > TURN_DEBOUNCE_MS) {
          updatePlayerFacing((currentFacing) => {
            const newFacing = turnRight(currentFacing);
            console.log('E PRESSED: Turned right from', currentFacing, 'to', newFacing, ['North', 'East', 'South', 'West'][newFacing]);
            return newFacing;
          });
          lastTurnRightTime.current = now;
        }
        lastTurnRightState.current = state.turnRight;
        
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
