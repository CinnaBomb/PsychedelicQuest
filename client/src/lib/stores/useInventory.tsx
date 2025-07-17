import { create } from 'zustand';
import { Item } from '@/types/game';

interface InventoryState {
  items: Item[];
  
  // Actions
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  getItemsByType: (type: Item['type']) => Item[];
  hasItem: (itemId: string) => boolean;
  clearInventory: () => void;
}

export const useInventory = create<InventoryState>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item]
    }));
  },
  
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId)
    }));
  },
  
  getItemsByType: (type) => {
    return get().items.filter(item => item.type === type);
  },
  
  hasItem: (itemId) => {
    return get().items.some(item => item.id === itemId);
  },
  
  clearInventory: () => {
    set({ items: [] });
  }
}));
