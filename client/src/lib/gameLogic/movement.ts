import { Position, Direction, PlayerState } from '@/types/game';

export const DIRECTIONS: Direction[] = [
  { x: 0, z: -1 }, // North
  { x: 1, z: 0 },  // East
  { x: 0, z: 1 },  // South
  { x: -1, z: 0 }  // West
];

export function moveForward(playerState: PlayerState): Position {
  const direction = DIRECTIONS[playerState.facing];
  return {
    x: playerState.position.x - direction.x,
    z: playerState.position.z - direction.z
  };
}

export function moveBackward(playerState: PlayerState): Position {
  const direction = DIRECTIONS[playerState.facing];
  return {
    x: playerState.position.x + direction.x,
    z: playerState.position.z + direction.z
  };
}

export function turnLeft(facing: number): number {
  return (facing + 3) % 4;
}

export function turnRight(facing: number): number {
  return (facing + 1) % 4;
}

export function getDirectionVector(facing: number): Direction {
  return DIRECTIONS[facing];
}

export function getFacingAngle(facing: number): number {
  return facing * Math.PI / 2;
}

export function strafeLeft(playerState: PlayerState): Position {
  const leftFacing = (playerState.facing + 3) % 4; // Turn left from current facing
  const direction = DIRECTIONS[leftFacing];
  return {
    x: playerState.position.x - direction.x,
    z: playerState.position.z - direction.z
  };
}

export function strafeRight(playerState: PlayerState): Position {
  const rightFacing = (playerState.facing + 1) % 4; // Turn right from current facing
  const direction = DIRECTIONS[rightFacing];
  return {
    x: playerState.position.x - direction.x,
    z: playerState.position.z - direction.z
  };
}
