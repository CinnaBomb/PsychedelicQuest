import { describe, it, expect } from '@jest/globals';
import { 
  moveForward, 
  moveBackward, 
  strafeLeft, 
  strafeRight,
  turnLeft,
  turnRight,
  DIRECTIONS 
} from '../client/src/lib/gameLogic/movement';
import { PlayerState } from '../client/src/types/game';

describe('Movement System', () => {
  // Helper to create a player state at origin
  const createPlayer = (facing: number): PlayerState => ({
    position: { x: 5, z: 5 },
    direction: DIRECTIONS[facing],
    facing: facing
  });

  describe('Forward Movement', () => {
    it('should move north when facing north (0)', () => {
      const player = createPlayer(0); // Facing North
      const newPos = moveForward(player);
      // North is { x: 0, z: -1 }, so moving forward should decrease z
      expect(newPos.x).toBe(5);
      expect(newPos.z).toBe(4); // 5 + (-1) = 4
    });

    it('should move east when facing east (1)', () => {
      const player = createPlayer(1); // Facing East
      const newPos = moveForward(player);
      // East is { x: 1, z: 0 }, so moving forward should increase x
      expect(newPos.x).toBe(6); // 5 + 1 = 6
      expect(newPos.z).toBe(5);
    });

    it('should move south when facing south (2)', () => {
      const player = createPlayer(2); // Facing South
      const newPos = moveForward(player);
      // South is { x: 0, z: 1 }, so moving forward should increase z
      expect(newPos.x).toBe(5);
      expect(newPos.z).toBe(6); // 5 + 1 = 6
    });

    it('should move west when facing west (3)', () => {
      const player = createPlayer(3); // Facing West
      const newPos = moveForward(player);
      // West is { x: -1, z: 0 }, so moving forward should decrease x
      expect(newPos.x).toBe(4); // 5 + (-1) = 4
      expect(newPos.z).toBe(5);
    });
  });

  describe('Backward Movement', () => {
    it('should move south when facing north (0)', () => {
      const player = createPlayer(0); // Facing North
      const newPos = moveBackward(player);
      // Moving backward from north should go south (increase z)
      expect(newPos.x).toBe(5);
      expect(newPos.z).toBe(6); // 5 - (-1) = 6
    });

    it('should move west when facing east (1)', () => {
      const player = createPlayer(1); // Facing East
      const newPos = moveBackward(player);
      // Moving backward from east should go west (decrease x)
      expect(newPos.x).toBe(4); // 5 - 1 = 4
      expect(newPos.z).toBe(5);
    });

    it('should move north when facing south (2)', () => {
      const player = createPlayer(2); // Facing South
      const newPos = moveBackward(player);
      // Moving backward from south should go north (decrease z)
      expect(newPos.x).toBe(5);
      expect(newPos.z).toBe(4); // 5 - 1 = 4
    });

    it('should move east when facing west (3)', () => {
      const player = createPlayer(3); // Facing West
      const newPos = moveBackward(player);
      // Moving backward from west should go east (increase x)
      expect(newPos.x).toBe(6); // 5 - (-1) = 6
      expect(newPos.z).toBe(5);
    });
  });

  describe('Strafe Left Movement', () => {
    it('should move west when facing north (0)', () => {
      const player = createPlayer(0); // Facing North
      const newPos = strafeLeft(player);
      // Strafing left from north should go west (decrease x)
      expect(newPos.x).toBe(4); // Should move left (west)
      expect(newPos.z).toBe(5);
    });

    it('should move north when facing east (1)', () => {
      const player = createPlayer(1); // Facing East
      const newPos = strafeLeft(player);
      // Strafing left from east should go north (decrease z)
      expect(newPos.x).toBe(5);
      expect(newPos.z).toBe(4); // Should move left (north)
    });

    it('should move east when facing south (2)', () => {
      const player = createPlayer(2); // Facing South
      const newPos = strafeLeft(player);
      // Strafing left from south should go east (increase x)
      expect(newPos.x).toBe(6); // Should move left (east)
      expect(newPos.z).toBe(5);
    });

    it('should move south when facing west (3)', () => {
      const player = createPlayer(3); // Facing West
      const newPos = strafeLeft(player);
      // Strafing left from west should go south (increase z)
      expect(newPos.x).toBe(5);
      expect(newPos.z).toBe(6); // Should move left (south)
    });
  });

  describe('Strafe Right Movement', () => {
    it('should move east when facing north (0)', () => {
      const player = createPlayer(0); // Facing North
      const newPos = strafeRight(player);
      // Strafing right from north should go east (increase x)
      expect(newPos.x).toBe(6); // Should move right (east)
      expect(newPos.z).toBe(5);
    });

    it('should move south when facing east (1)', () => {
      const player = createPlayer(1); // Facing East
      const newPos = strafeRight(player);
      // Strafing right from east should go south (increase z)
      expect(newPos.x).toBe(5);
      expect(newPos.z).toBe(6); // Should move right (south)
    });

    it('should move west when facing south (2)', () => {
      const player = createPlayer(2); // Facing South
      const newPos = strafeRight(player);
      // Strafing right from south should go west (decrease x)
      expect(newPos.x).toBe(4); // Should move right (west)
      expect(newPos.z).toBe(5);
    });

    it('should move north when facing west (3)', () => {
      const player = createPlayer(3); // Facing West
      const newPos = strafeRight(player);
      // Strafing right from west should go north (decrease z)
      expect(newPos.x).toBe(5);
      expect(newPos.z).toBe(4); // Should move right (north)
    });
  });

  describe('Turning', () => {
    it('should turn left correctly', () => {
      expect(turnLeft(0)).toBe(3); // North -> West
      expect(turnLeft(1)).toBe(0); // East -> North
      expect(turnLeft(2)).toBe(1); // South -> East
      expect(turnLeft(3)).toBe(2); // West -> South
    });

    it('should turn right correctly', () => {
      expect(turnRight(0)).toBe(1); // North -> East
      expect(turnRight(1)).toBe(2); // East -> South
      expect(turnRight(2)).toBe(3); // South -> West
      expect(turnRight(3)).toBe(0); // West -> North
    });
  });

  describe('Direction Consistency', () => {
    it('forward then backward should return to original position', () => {
      const player = createPlayer(0);
      const forward = moveForward(player);
      const playerAtForward = { ...player, position: forward };
      const back = moveBackward(playerAtForward);
      expect(back.x).toBe(player.position.x);
      expect(back.z).toBe(player.position.z);
    });

    it('strafe left then strafe right should return to original position', () => {
      const player = createPlayer(1);
      const left = strafeLeft(player);
      const playerAtLeft = { ...player, position: left };
      const right = strafeRight(playerAtLeft);
      expect(right.x).toBe(player.position.x);
      expect(right.z).toBe(player.position.z);
    });

    it('four left turns should face original direction', () => {
      let facing = 0;
      facing = turnLeft(facing);
      facing = turnLeft(facing);
      facing = turnLeft(facing);
      facing = turnLeft(facing);
      expect(facing).toBe(0);
    });

    it('four right turns should face original direction', () => {
      let facing = 2;
      facing = turnRight(facing);
      facing = turnRight(facing);
      facing = turnRight(facing);
      facing = turnRight(facing);
      expect(facing).toBe(2);
    });
  });
});
