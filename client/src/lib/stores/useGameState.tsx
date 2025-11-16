import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GamePhase, PlayerState, DungeonCell } from '@/types/game';
import { generateDungeon, DUNGEON_SIZE } from '@/lib/gameLogic/dungeon';
import { mapLoader } from '@/lib/gameLogic/mapLoader';

interface GameState {
  phase: GamePhase;
  playerState: PlayerState;
  dungeon: DungeonCell[][];
  currentMapId: string;
  gameName: string;
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  setGameName: (name: string) => void;
  initializeGame: () => Promise<void>;
  loadMap: (mapId: string, spawnPosition?: { x: number; z: number }) => Promise<void>;
  updatePlayerPosition: (x: number, z: number) => void;
  updatePlayerFacing: (facing: number | ((current: number) => number)) => void;
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
    currentMapId: '',
    gameName: '',
    
    setPhase: (phase) => set({ phase }),
    
    setGameName: (name) => set({ gameName: name }),
    
    initializeGame: async () => {
      console.log('🎮 Initializing game with custom_starting_city from database...');
      
      try {
        // Load the custom starting city map from database
        const cityMap = await mapLoader.loadMap('custom_starting_city');
        
        if (cityMap) {
          console.log(`✅ Successfully loaded "${cityMap.name}" from database`);
          const dungeon = mapLoader.convertToGameFormat(cityMap);
          const startPosition = cityMap.startPosition || { x: 10, z: 10 };
          
          set({
            phase: 'exploration',
            playerState: { ...initialPlayerState, position: startPosition },
            dungeon,
            currentMapId: 'custom_starting_city'
          });
          
          console.log(`🏁 Game initialized at position (${startPosition.x}, ${startPosition.z})`);
        } else {
          console.warn('⚠️ custom_starting_city not found in database, creating minimal fallback');
          
          // Create a minimal fallback map instead of random dungeon
          const fallbackDungeon = createMinimalMap();
          set({
            phase: 'exploration',
            playerState: { ...initialPlayerState, position: { x: 5, z: 5 } },
            dungeon: fallbackDungeon,
            currentMapId: 'fallback_map'
          });
          
          console.log('🆘 Using fallback map - please import custom_starting_city to database');
        }
      } catch (error) {
        console.error('❌ Critical error during game initialization:', error);
        
        // Emergency fallback
        const emergencyDungeon = createMinimalMap();
        set({
          phase: 'exploration',
          playerState: { ...initialPlayerState, position: { x: 5, z: 5 } },
          dungeon: emergencyDungeon,
          currentMapId: 'emergency_fallback'
        });
        
        console.log('🚨 Using emergency fallback due to initialization error');
      }
    },

    loadMap: async (mapId: string, spawnPosition?: { x: number; z: number }) => {
      try {
        const cityMap = await mapLoader.loadMap(mapId);
        if (cityMap) {
          const dungeon = mapLoader.convertToGameFormat(cityMap);
          const newPosition = spawnPosition || cityMap.startPosition;
          
          set({
            dungeon,
            currentMapId: mapId,
            playerState: { 
              ...get().playerState, 
              position: newPosition 
            }
          });
          
          console.log(`✅ Loaded map "${cityMap.name}" and moved player to`, newPosition);
        } else {
          console.error(`❌ Failed to load map: ${mapId}`);
        }
      } catch (error) {
        console.error(`❌ Error loading map ${mapId}:`, error);
      }
    },
    
    updatePlayerPosition: (x, z) => {
      set((state) => ({
        playerState: {
          ...state.playerState,
          position: { x, z }
        }
      }));
    },
    
    updatePlayerFacing: (facing: number | ((current: number) => number)) => {
      set((state) => {
        const newFacing = typeof facing === 'function' 
          ? facing(state.playerState.facing) 
          : facing;
        return {
          playerState: {
            ...state.playerState,
            facing: newFacing,
            direction: { x: 0, z: -1 } // Will be calculated based on facing
          }
        };
      });
    },
    
    resetGame: () => {
      set({
        phase: 'menu',
        playerState: initialPlayerState,
        dungeon: [],
        currentMapId: '',
        gameName: ''
      });
    }
  }))
);

// Helper function to create a minimal playable map
function createMinimalMap(): DungeonCell[][] {
  const size = 10;
  const map: DungeonCell[][] = [];
  
  for (let x = 0; x < size; x++) {
    map[x] = [];
    for (let z = 0; z < size; z++) {
      // Create walls around border, floor inside
      const isWall = x === 0 || x === size - 1 || z === 0 || z === size - 1;
      
      map[x][z] = {
        x,
        z,
        type: isWall ? 'wall' : 'floor'
      };
    }
  }
  
  return map;
}
