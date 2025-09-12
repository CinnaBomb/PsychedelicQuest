import { useState } from 'react';
import { useGameState } from '@/lib/stores/useGameState';
import { useAudio } from '@/lib/stores/useAudio';
import { moveForward, moveBackward, turnLeft, turnRight, strafeLeft, strafeRight } from '@/lib/gameLogic/movement';
import { isValidPosition, getDungeonCell } from '@/lib/gameLogic/dungeon';

interface TouchButtonProps {
  onPress: () => void;
  onRelease: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function TouchButton({ onPress, onRelease, children, className = '', disabled = false }: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || activePointerId !== null) return;
    e.preventDefault();
    setIsPressed(true);
    setActivePointerId(e.pointerId);
    onPress();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (disabled || activePointerId !== e.pointerId) return;
    e.preventDefault();
    setIsPressed(false);
    setActivePointerId(null);
    onRelease();
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (disabled || activePointerId !== e.pointerId) return;
    e.preventDefault();
    setIsPressed(false);
    setActivePointerId(null);
    onRelease();
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (disabled || activePointerId !== e.pointerId) return;
    e.preventDefault();
    setIsPressed(false);
    setActivePointerId(null);
    onRelease();
  };

  return (
    <button
      className={`
        select-none bg-gray-900/90 hover:bg-gray-800/90 
        text-white border-2 border-gray-500 rounded-xl shadow-lg
        flex items-center justify-center font-bold text-xl
        transition-all duration-100 backdrop-blur-sm
        ${isPressed ? 'bg-gray-600/90 scale-90 shadow-inner' : 'shadow-md hover:shadow-lg'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-90'}
        ${className}
      `}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      disabled={disabled}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </button>
  );
}

export default function TouchControls() {
  const { 
    playerState, 
    updatePlayerPosition, 
    updatePlayerFacing,
    dungeon
  } = useGameState();
  
  const { playHit } = useAudio();

  const handleMoveForward = () => {
    const newPos = moveForward(playerState);
    if (isValidPosition(dungeon, newPos)) {
      updatePlayerPosition(newPos.x, newPos.z);
      console.log('Touch: Moved forward to:', newPos);
    } else {
      console.log('Touch: Cannot move forward - blocked');
    }
  };

  const handleMoveBackward = () => {
    const newPos = moveBackward(playerState);
    if (isValidPosition(dungeon, newPos)) {
      updatePlayerPosition(newPos.x, newPos.z);
      console.log('Touch: Moved backward to:', newPos);
    } else {
      console.log('Touch: Cannot move backward - blocked');
    }
  };

  const handleStrafeLeft = () => {
    const newPos = strafeLeft(playerState);
    if (isValidPosition(dungeon, newPos)) {
      updatePlayerPosition(newPos.x, newPos.z);
      console.log('Touch: Strafed left to:', newPos);
    } else {
      console.log('Touch: Cannot strafe left - blocked');
    }
  };

  const handleStrafeRight = () => {
    const newPos = strafeRight(playerState);
    if (isValidPosition(dungeon, newPos)) {
      updatePlayerPosition(newPos.x, newPos.z);
      console.log('Touch: Strafed right to:', newPos);
    } else {
      console.log('Touch: Cannot strafe right - blocked');
    }
  };

  const handleTurnLeft = () => {
    const newFacing = turnLeft(playerState.facing);
    updatePlayerFacing(newFacing);
    console.log('Touch: Turned left, now facing:', newFacing);
  };

  const handleTurnRight = () => {
    const newFacing = turnRight(playerState.facing);
    updatePlayerFacing(newFacing);
    console.log('Touch: Turned right, now facing:', newFacing);
  };

  const handleInteract = () => {
    const cell = getDungeonCell(dungeon, playerState.position);
    if (cell?.hasEnemy) {
      console.log('Touch: Interact with enemy!');
      playHit();
    } else if (cell?.hasItem) {
      console.log('Touch: Interact with item!');
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Movement Controls - Left Side */}
      <div 
        className="absolute pointer-events-auto"
        style={{
          left: 'max(8px, env(safe-area-inset-left))',
          bottom: 'max(16px, env(safe-area-inset-bottom))'
        }}
      >
        <div className="flex flex-col items-center space-y-3 p-2">
          {/* Backward Button (Up Arrow - Reversed) */}
          <TouchButton
            onPress={handleMoveBackward}
            onRelease={() => {}}
            className="w-20 h-20 text-2xl sm:w-16 sm:h-16 sm:text-xl"
          >
            ↑
          </TouchButton>
          
          {/* Left and Right Strafing */}
          <div className="flex space-x-3">
            <TouchButton
              onPress={handleStrafeLeft}
              onRelease={() => {}}
              className="w-20 h-20 text-2xl sm:w-16 sm:h-16 sm:text-xl"
            >
              ←
            </TouchButton>
            <TouchButton
              onPress={handleStrafeRight}
              onRelease={() => {}}
              className="w-20 h-20 text-2xl sm:w-16 sm:h-16 sm:text-xl"
            >
              →
            </TouchButton>
          </div>
          
          {/* Forward Button (Down Arrow - Reversed) */}
          <TouchButton
            onPress={handleMoveForward}
            onRelease={() => {}}
            className="w-20 h-20 text-2xl sm:w-16 sm:h-16 sm:text-xl"
          >
            ↓
          </TouchButton>
        </div>
      </div>

      {/* Turning Controls - Right Side */}
      <div 
        className="absolute pointer-events-auto"
        style={{
          right: 'max(8px, env(safe-area-inset-right))',
          bottom: 'max(16px, env(safe-area-inset-bottom))'
        }}
      >
        <div className="flex flex-col items-center space-y-3 p-2">
          {/* Interact Button */}
          <TouchButton
            onPress={handleInteract}
            onRelease={() => {}}
            className="w-20 h-14 text-sm font-bold sm:w-16 sm:h-12"
          >
            USE
          </TouchButton>
          
          {/* Turn Controls */}
          <div className="flex space-x-3">
            <TouchButton
              onPress={handleTurnLeft}
              onRelease={() => {}}
              className="w-20 h-20 text-2xl sm:w-16 sm:h-16 sm:text-xl"
            >
              ↺
            </TouchButton>
            <TouchButton
              onPress={handleTurnRight}
              onRelease={() => {}}
              className="w-20 h-20 text-2xl sm:w-16 sm:h-16 sm:text-xl"
            >
              ↻
            </TouchButton>
          </div>
        </div>
      </div>

      {/* Instructions - Top Center (hidden on small screens to save space) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto hidden sm:block">
        <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm text-center backdrop-blur-sm">
          <div className="font-bold">Touch Controls</div>
          <div className="text-xs opacity-80">Left: Move • Right: Turn & Use</div>
        </div>
      </div>
    </div>
  );
}