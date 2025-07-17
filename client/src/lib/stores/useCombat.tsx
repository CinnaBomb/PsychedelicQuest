import { create } from 'zustand';
import { Enemy, CombatAction } from '@/types/game';
import { executeAction, enemyAI, calculateExperienceGain } from '@/lib/gameLogic/combat';

interface CombatState {
  currentEnemy: Enemy | null;
  combatLog: string[];
  isPlayerTurn: boolean;
  combatPhase: 'select_action' | 'select_target' | 'executing' | 'victory' | 'defeat';
  
  // Actions
  startCombat: (enemy: Enemy) => void;
  endCombat: () => void;
  executePlayerAction: (action: CombatAction) => void;
  executeEnemyTurn: () => void;
  addToLog: (message: string) => void;
  clearLog: () => void;
}

export const useCombat = create<CombatState>((set, get) => ({
  currentEnemy: null,
  combatLog: [],
  isPlayerTurn: true,
  combatPhase: 'select_action',
  
  startCombat: (enemy) => {
    set({
      currentEnemy: enemy,
      combatLog: [`Combat begins with ${enemy.name}!`],
      isPlayerTurn: true,
      combatPhase: 'select_action'
    });
  },
  
  endCombat: () => {
    set({
      currentEnemy: null,
      combatLog: [],
      isPlayerTurn: true,
      combatPhase: 'select_action'
    });
  },
  
  executePlayerAction: (action) => {
    const state = get();
    // This will be implemented with party integration
    console.log('Player action:', action);
  },
  
  executeEnemyTurn: () => {
    const state = get();
    if (!state.currentEnemy || !state.currentEnemy.isAlive) return;
    
    // This will be implemented with party integration
    console.log('Enemy turn');
  },
  
  addToLog: (message) => {
    set((state) => ({
      combatLog: [...state.combatLog, message]
    }));
  },
  
  clearLog: () => {
    set({ combatLog: [] });
  }
}));
