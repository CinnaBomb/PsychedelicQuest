import { Item } from '@/types/game';

export const ITEMS: Record<string, Item> = {
  // Weapons
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 10 }
  },
  steel_sword: {
    id: 'steel_sword',
    name: 'Steel Sword',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 18 }
  },
  magic_staff: {
    id: 'magic_staff',
    name: 'Magic Staff',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 8, manaBonus: 20 }
  },
  
  // Armor
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: 'armor',
    rarity: 'common',
    stats: { defense: 8 }
  },
  chain_mail: {
    id: 'chain_mail',
    name: 'Chain Mail',
    type: 'armor',
    rarity: 'rare',
    stats: { defense: 15 }
  },
  mage_robes: {
    id: 'mage_robes',
    name: 'Mage Robes',
    type: 'armor',
    rarity: 'rare',
    stats: { defense: 5, manaBonus: 30 }
  },
  
  // Potions
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    type: 'potion',
    rarity: 'common',
    effect: { type: 'heal', value: 50 }
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    type: 'potion',
    rarity: 'common',
    effect: { type: 'mana', value: 30 }
  }
};

export function generateRandomItem(): Item {
  const itemKeys = Object.keys(ITEMS);
  const randomKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
  return { ...ITEMS[randomKey] };
}

export function getItemsByType(type: Item['type']): Item[] {
  return Object.values(ITEMS).filter(item => item.type === type);
}
