import { Position } from './game';

export type CellType = 'floor' | 'wall' | 'door' | 'exit' | 'npc' | 'shop' | 'chest' | 'enemy' | 'decoration';

export type TransportType = 'gate' | 'portal' | 'road' | 'teleporter' | 'stairs';

export interface CityCell {
  x: number;
  z: number;
  type: CellType;
  walkable: boolean;
  // Optional properties for interactive cells
  interactable?: boolean;
  npcId?: string;
  shopId?: string;
  itemId?: string;
  enemyId?: string;
  description?: string;
  // Visual properties
  color?: string;
  texture?: string;
}

export interface CityConnection {
  id: string;
  targetCityId: string;
  exitPosition: Position;
  entrancePosition: Position; // Where you spawn in target city
  transportType: TransportType;
  name: string; // "To Mystic Bazaar"
  description?: string;
  requiresKey?: boolean;
  keyItemId?: string;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  position: Position;
  dialogue: string[];
  questIds?: string[];
  shopId?: string;
  sprite?: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  items: string[]; // Array of item IDs
  npcId: string; // Which NPC runs this shop
}

export interface CityMap {
  id: string;
  name: string;
  description: string;
  size: { width: number; height: number };
  startPosition: Position;
  cells: CityCell[][];
  connections: CityConnection[];
  npcs: NPC[];
  shops: Shop[];
  // Metadata
  theme: 'village' | 'dungeon' | 'city' | 'temple' | 'forest' | 'desert' | 'underground';
  dangerLevel: number; // 1-10, affects enemy strength
  discoveredByDefault: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

// Editor-specific types
export interface EditorTool {
  id: string;
  name: string;
  cellType: CellType;
  icon: string;
  description: string;
  color: string;
}

export interface EditorState {
  currentTool: EditorTool;
  mapSize: { width: number; height: number };
  showGrid: boolean;
  showConnections: boolean;
  selectedCell: Position | null;
  isDrawing: boolean;
}