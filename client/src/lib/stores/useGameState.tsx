import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GamePhase, PlayerState, DungeonCell } from '@/types/game';
import { generateDungeon, DUNGEON_SIZE } from '@/lib/gameLogic/dungeon';

interface GameState {
  phase: GamePhase;
  playerState: PlayerState;
  dungeon: DungeonCell[][];
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  initializeGame: () => void;
  updatePlayerPosition: (x: number, z: number) => void;
  updatePlayerFacing: (facing: number) => void;
  resetGame: () => void;
}

const initialPlayerState: PlayerState = {
  position: { x: 3, z: 3 },
  direction: { x: 0, z: -1 },
  facing: 0
};

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: 'menu',
    playerState: initialPlayerState,
    dungeon: [],
    
    setPhase: (phase) => set({ phase }),
    
    initializeGame: () => {
      const dungeon = generateDungeon();
      set({
        phase: 'exploration',
        playerState: initialPlayerState,
        dungeon
      });
    },
    
    updatePlayerPosition: (x, z) => {
      set((state) => ({
        playerState: {
          ...state.playerState,
          position: { x, z }
        }
      }));
    },
    
    updatePlayerFacing: (facing) => {
      set((state) => ({
        playerState: {
          ...state.playerState,
          facing,
          direction: { x: 0, z: -1 } // Will be calculated based on facing
        }
      }));
    },
    
    resetGame: () => {
      set({
        phase: 'menu',
        playerState: initialPlayerState,
        dungeon: []
      });
    }
  }))
);
