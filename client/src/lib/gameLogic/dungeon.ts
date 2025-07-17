import { DungeonCell, Position, Enemy } from '@/types/game';
import { generateRandomItem } from './items';

export const DUNGEON_SIZE = 20;

export function generateDungeon(): DungeonCell[][] {
  const dungeon: DungeonCell[][] = [];
  
  // Initialize with walls
  for (let x = 0; x < DUNGEON_SIZE; x++) {
    dungeon[x] = [];
    for (let z = 0; z < DUNGEON_SIZE; z++) {
      dungeon[x][z] = {
        x,
        z,
        type: 'wall'
      };
    }
  }
  
  // Create rooms and corridors
  createRooms(dungeon);
  createCorridors(dungeon);
  placeEnemies(dungeon);
  placeItems(dungeon);
  
  return dungeon;
}

function createRooms(dungeon: DungeonCell[][]): void {
  const rooms = [
    { x: 2, z: 2, width: 4, height: 4 },
    { x: 8, z: 2, width: 3, height: 3 },
    { x: 14, z: 3, width: 4, height: 3 },
    { x: 2, z: 8, width: 3, height: 4 },
    { x: 7, z: 9, width: 5, height: 4 },
    { x: 14, z: 8, width: 4, height: 5 },
    { x: 2, z: 15, width: 4, height: 3 },
    { x: 10, z: 15, width: 6, height: 3 }
  ];
  
  rooms.forEach(room => {
    for (let x = room.x; x < room.x + room.width; x++) {
      for (let z = room.z; z < room.z + room.height; z++) {
        if (x < DUNGEON_SIZE && z < DUNGEON_SIZE) {
          dungeon[x][z].type = 'floor';
        }
      }
    }
  });
}

function createCorridors(dungeon: DungeonCell[][]): void {
  // Horizontal corridors
  for (let z = 4; z < DUNGEON_SIZE; z += 6) {
    for (let x = 1; x < DUNGEON_SIZE - 1; x++) {
      dungeon[x][z].type = 'floor';
    }
  }
  
  // Vertical corridors
  for (let x = 6; x < DUNGEON_SIZE; x += 6) {
    for (let z = 1; z < DUNGEON_SIZE - 1; z++) {
      dungeon[x][z].type = 'floor';
    }
  }
}

function placeEnemies(dungeon: DungeonCell[][]): void {
  const enemyPositions = [
    { x: 10, z: 3 },
    { x: 15, z: 4 },
    { x: 3, z: 10 },
    { x: 9, z: 11 },
    { x: 15, z: 10 },
    { x: 12, z: 16 }
  ];
  
  enemyPositions.forEach((pos, index) => {
    if (dungeon[pos.x] && dungeon[pos.x][pos.z] && dungeon[pos.x][pos.z].type === 'floor') {
      dungeon[pos.x][pos.z].hasEnemy = true;
      dungeon[pos.x][pos.z].enemy = createEnemy(`enemy_${index}`, pos);
    }
  });
}

function placeItems(dungeon: DungeonCell[][]): void {
  let itemsPlaced = 0;
  const maxItems = 8;
  
  for (let x = 0; x < DUNGEON_SIZE && itemsPlaced < maxItems; x++) {
    for (let z = 0; z < DUNGEON_SIZE && itemsPlaced < maxItems; z++) {
      if (dungeon[x][z].type === 'floor' && !dungeon[x][z].hasEnemy && Math.random() < 0.1) {
        dungeon[x][z].hasItem = true;
        dungeon[x][z].item = generateRandomItem();
        itemsPlaced++;
      }
    }
  }
}

function createEnemy(id: string, position: Position): Enemy {
  const enemies = [
    { name: 'Goblin', health: 40, attack: 8, defense: 2 },
    { name: 'Orc', health: 60, attack: 12, defense: 4 },
    { name: 'Skeleton', health: 35, attack: 10, defense: 3 },
    { name: 'Troll', health: 80, attack: 15, defense: 6 }
  ];
  
  const template = enemies[Math.floor(Math.random() * enemies.length)];
  
  return {
    id,
    name: template.name,
    health: template.health,
    maxHealth: template.health,
    attack: template.attack,
    defense: template.defense,
    position,
    isAlive: true
  };
}

export function isValidPosition(dungeon: DungeonCell[][], position: Position): boolean {
  if (position.x < 0 || position.x >= DUNGEON_SIZE || position.z < 0 || position.z >= DUNGEON_SIZE) {
    return false;
  }
  
  return dungeon[position.x][position.z].type === 'floor';
}

export function getDungeonCell(dungeon: DungeonCell[][], position: Position): DungeonCell | null {
  if (position.x < 0 || position.x >= DUNGEON_SIZE || position.z < 0 || position.z >= DUNGEON_SIZE) {
    return null;
  }
  
  return dungeon[position.x][position.z];
}
