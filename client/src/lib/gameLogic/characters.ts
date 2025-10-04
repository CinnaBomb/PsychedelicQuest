import { Character, CharacterClass, Spell } from '@/types/game';

export const CHARACTER_CLASSES: Record<CharacterClass, {
  name: string;
  description: string;
  baseStats: Character['stats'];
  spells: Spell[];
}> = {
  anubis_guardian: {
    name: 'Anubis Guardian',
    description: 'Fierce protector of souls, wielding the strength of the jackal god',
    baseStats: {
      strength: 15,
      intelligence: 8,
      defense: 13,
      speed: 9
    },
    spells: [
      {
        id: 'jackal_strike',
        name: 'Jackal Strike',
        manaCost: 5,
        damage: 20,
        targetType: 'enemy'
      },
      {
        id: 'soul_shield',
        name: 'Soul Shield',
        manaCost: 8,
        healing: 15,
        targetType: 'ally'
      }
    ]
  },
  dream_weaver: {
    name: 'Dream Weaver',
    description: 'Manipulator of reality and illusions from the eternal dream',
    baseStats: {
      strength: 7,
      intelligence: 16,
      defense: 7,
      speed: 13
    },
    spells: [
      {
        id: 'psychic_blast',
        name: 'Psychic Blast',
        manaCost: 8,
        damage: 25,
        targetType: 'enemy'
      },
      {
        id: 'astral_heal',
        name: 'Astral Heal',
        manaCost: 6,
        healing: 20,
        targetType: 'ally'
      }
    ]
  },
  scarab_mystic: {
    name: 'Scarab Mystic',
    description: 'Channel the transformative power of the sacred beetle',
    baseStats: {
      strength: 10,
      intelligence: 13,
      defense: 10,
      speed: 11
    },
    spells: [
      {
        id: 'metamorphosis',
        name: 'Metamorphosis',
        manaCost: 7,
        damage: 18,
        targetType: 'enemy'
      },
      {
        id: 'regeneration',
        name: 'Regeneration',
        manaCost: 5,
        healing: 18,
        targetType: 'ally'
      }
    ]
  },
  sphinx_sage: {
    name: 'Sphinx Sage',
    description: 'Ancient wisdom keeper who bends fate with riddles and prophecy',
    baseStats: {
      strength: 9,
      intelligence: 15,
      defense: 11,
      speed: 10
    },
    spells: [
      {
        id: 'riddle_curse',
        name: 'Riddle Curse',
        manaCost: 9,
        damage: 23,
        targetType: 'enemy'
      },
      {
        id: 'prophecy_ward',
        name: 'Prophecy Ward',
        manaCost: 7,
        healing: 16,
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
      strength: character.class === 'anubis_guardian' ? 3 : character.class === 'scarab_mystic' ? 2 : 1,
      intelligence: character.class === 'dream_weaver' || character.class === 'sphinx_sage' ? 3 : character.class === 'scarab_mystic' ? 2 : 1,
      defense: 2,
      speed: character.class === 'dream_weaver' ? 2 : 1
    };
    
    return {
      ...character,
      level: newLevel,
      experience: newExp,
      experienceToNext: newExpToNext,
      maxHealth: character.maxHealth + 20,
      health: character.maxHealth + 20,
      maxMana: character.maxMana + (character.class === 'dream_weaver' || character.class === 'sphinx_sage' ? 15 : character.class === 'scarab_mystic' ? 10 : 5),
      mana: character.maxMana + (character.class === 'dream_weaver' || character.class === 'sphinx_sage' ? 15 : character.class === 'scarab_mystic' ? 10 : 5),
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
