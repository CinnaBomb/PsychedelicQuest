import { Character, CharacterClass, Spell } from '@/types/game';

export const CHARACTER_CLASSES: Record<CharacterClass, {
  name: string;
  baseStats: Character['stats'];
  spells: Spell[];
}> = {
  warrior: {
    name: 'Warrior',
    baseStats: {
      strength: 15,
      intelligence: 8,
      defense: 12,
      speed: 10
    },
    spells: [
      {
        id: 'power_attack',
        name: 'Power Attack',
        manaCost: 5,
        damage: 20,
        targetType: 'enemy'
      }
    ]
  },
  mage: {
    name: 'Mage',
    baseStats: {
      strength: 8,
      intelligence: 15,
      defense: 8,
      speed: 12
    },
    spells: [
      {
        id: 'fireball',
        name: 'Fireball',
        manaCost: 8,
        damage: 25,
        targetType: 'enemy'
      },
      {
        id: 'heal',
        name: 'Heal',
        manaCost: 6,
        healing: 20,
        targetType: 'ally'
      }
    ]
  }
};

export function createCharacter(name: string, characterClass: CharacterClass): Character {
  const classData = CHARACTER_CLASSES[characterClass];
  return {
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    class: characterClass,
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    experience: 0,
    experienceToNext: 100,
    stats: { ...classData.baseStats },
    equipment: {}
  };
}

export function calculateDamage(attacker: Character, target: Character | any): number {
  const baseDamage = attacker.stats.strength;
  const weaponDamage = attacker.equipment.weapon?.stats?.attack || 0;
  const totalDamage = baseDamage + weaponDamage;
  
  const defense = target.stats?.defense || target.defense || 0;
  const finalDamage = Math.max(1, totalDamage - defense);
  
  return Math.floor(finalDamage + Math.random() * 5);
}

export function gainExperience(character: Character, amount: number): Character {
  const newExp = character.experience + amount;
  let newLevel = character.level;
  let newExpToNext = character.experienceToNext;
  
  if (newExp >= character.experienceToNext) {
    newLevel++;
    newExpToNext = newLevel * 100;
    
    // Level up stat increases
    const statIncrease = {
      strength: character.class === 'warrior' ? 3 : 1,
      intelligence: character.class === 'mage' ? 3 : 1,
      defense: 2,
      speed: 1
    };
    
    return {
      ...character,
      level: newLevel,
      experience: newExp,
      experienceToNext: newExpToNext,
      maxHealth: character.maxHealth + 20,
      health: character.maxHealth + 20,
      maxMana: character.maxMana + (character.class === 'mage' ? 15 : 5),
      mana: character.maxMana + (character.class === 'mage' ? 15 : 5),
      stats: {
        strength: character.stats.strength + statIncrease.strength,
        intelligence: character.stats.intelligence + statIncrease.intelligence,
        defense: character.stats.defense + statIncrease.defense,
        speed: character.stats.speed + statIncrease.speed
      }
    };
  }
  
  return {
    ...character,
    experience: newExp
  };
}
