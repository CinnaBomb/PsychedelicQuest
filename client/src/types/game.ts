export interface Position {
  x: number;
  z: number;
}

export interface Direction {
  x: number;
  z: number;
}

export type CharacterClass = 'warrior' | 'mage';

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  experience: number;
  experienceToNext: number;
  stats: {
    strength: number;
    intelligence: number;
    defense: number;
    speed: number;
  };
  equipment: {
    weapon?: Item;
    armor?: Item;
  };
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  position: Position;
  isAlive: boolean;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'misc';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: {
    attack?: number;
    defense?: number;
    healthBonus?: number;
    manaBonus?: number;
  };
  effect?: {
    type: 'heal' | 'mana' | 'buff';
    value: number;
  };
}

export interface DungeonCell {
  x: number;
  z: number;
  type: 'floor' | 'wall' | 'door' | 'stairs';
  hasEnemy?: boolean;
  hasItem?: boolean;
  item?: Item;
  enemy?: Enemy;
}

export interface PlayerState {
  position: Position;
  direction: Direction;
  facing: number; // 0=north, 1=east, 2=south, 3=west
}

export type GamePhase = 'menu' | 'character_creation' | 'exploration' | 'combat' | 'inventory' | 'game_over';

export interface CombatAction {
  type: 'attack' | 'defend' | 'cast_spell' | 'use_item';
  target?: string; // enemy or character id
  spellId?: string;
  itemId?: string;
}

export interface Spell {
  id: string;
  name: string;
  manaCost: number;
  damage?: number;
  healing?: number;
  effect?: string;
  targetType: 'self' | 'ally' | 'enemy' | 'all_enemies';
}
