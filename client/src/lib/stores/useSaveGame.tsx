import { create } from 'zustand';
import type { Character, Item, DungeonCell, Position } from '@/types/game';

interface GameSave {
  id: number;
  userId: number;
  saveName: string;
  dungeonLevel: number;
  playerPosition: Position;
  createdAt: string;
  updatedAt: string;
}

interface SaveData {
  save: GameSave;
  characters: Character[];
  inventory: Item[];
  dungeonState: DungeonCell[][] | null;
  exploredRooms: Position[];
}

interface SaveGameStore {
  currentSaveId: number | null;
  saves: GameSave[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createSave: (userId: number, saveName: string, gameData: SaveGameData) => Promise<void>;
  loadSave: (userId: number, saveId: number) => Promise<SaveData | null>;
  updateSave: (userId: number, saveId: number, gameData: Partial<SaveGameData>) => Promise<void>;
  deleteSave: (userId: number, saveId: number) => Promise<void>;
  getSaves: (userId: number) => Promise<void>;
  setCurrentSaveId: (saveId: number | null) => void;
}

interface SaveGameData {
  playerPosition: Position;
  characters: Character[];
  inventory: Item[];
  dungeonData: DungeonCell[][];
  exploredRooms?: Position[];
  dungeonLevel?: number;
}

export const useSaveGame = create<SaveGameStore>((set, get) => ({
  currentSaveId: null,
  saves: [],
  isLoading: false,
  error: null,

  setCurrentSaveId: (saveId) => set({ currentSaveId: saveId }),

  createSave: async (userId: number, saveName: string, gameData: SaveGameData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saveName,
          playerPosition: gameData.playerPosition,
          characters: gameData.characters,
          inventory: gameData.inventory,
          dungeonData: gameData.dungeonData,
          exploredRooms: gameData.exploredRooms || [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create save');
      }

      const newSave = await response.json();
      set({ currentSaveId: newSave.id, isLoading: false });
      
      // Refresh the saves list
      await get().getSaves(userId);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadSave: async (userId: number, saveId: number): Promise<SaveData | null> => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/saves/${saveId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load save');
      }

      const data = await response.json();
      set({ currentSaveId: saveId, isLoading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateSave: async (userId: number, saveId: number, gameData: Partial<SaveGameData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/saves/${saveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerPosition: gameData.playerPosition,
          dungeonLevel: gameData.dungeonLevel,
          characters: gameData.characters,
          inventory: gameData.inventory,
          dungeonData: gameData.dungeonData,
          exploredRooms: gameData.exploredRooms,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update save');
      }

      set({ isLoading: false });
      
      // Refresh the saves list
      await get().getSaves(userId);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteSave: async (userId: number, saveId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/saves/${saveId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete save');
      }

      // Clear current save if it was deleted
      if (get().currentSaveId === saveId) {
        set({ currentSaveId: null });
      }

      set({ isLoading: false });
      
      // Refresh the saves list
      await get().getSaves(userId);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getSaves: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/saves`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get saves');
      }

      const saves = await response.json();
      set({ saves, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
