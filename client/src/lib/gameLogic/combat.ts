import { Character, Enemy, CombatAction } from '@/types/game';
import { calculateDamage } from './characters';

export interface CombatResult {
  damage?: number;
  healing?: number;
  message: string;
  targetDied?: boolean;
}

export function executeAction(
  actor: Character,
  action: CombatAction,
  target?: Character | Enemy,
  party?: Character[]
): CombatResult {
  switch (action.type) {
    case 'attack':
      if (!target) {
        return { message: 'No target selected for attack!' };
      }
      
      const damage = calculateDamage(actor, target);
      target.health = Math.max(0, target.health - damage);
      
      const targetDied = target.health <= 0;
      if ('isAlive' in target) {
        target.isAlive = !targetDied;
      }
      
      return {
        damage,
        message: `${actor.name} attacks ${target.name} for ${damage} damage!`,
        targetDied
      };
      
    case 'defend':
      return {
        message: `${actor.name} takes a defensive stance.`
      };
      
    case 'cast_spell':
      // Implement spell casting logic here
      return {
        message: `${actor.name} casts a spell!`
      };
      
    case 'use_item':
      // Implement item usage logic here
      return {
        message: `${actor.name} uses an item!`
      };
      
    default:
      return { message: 'Unknown action!' };
  }
}

export function enemyAI(enemy: Enemy, party: Character[]): CombatAction {
  // Simple AI: always attack the character with lowest health
  const alivePartyMembers = party.filter(char => char.health > 0);
  if (alivePartyMembers.length === 0) {
    return { type: 'defend' };
  }
  
  const target = alivePartyMembers.reduce((lowest, char) => 
    char.health < lowest.health ? char : lowest
  );
  
  return {
    type: 'attack',
    target: target.id
  };
}

export function calculateExperienceGain(enemy: Enemy): number {
  return Math.floor(enemy.maxHealth / 4) + enemy.attack;
}
