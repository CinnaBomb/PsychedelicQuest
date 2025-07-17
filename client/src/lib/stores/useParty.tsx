import { create } from 'zustand';
import { Character } from '@/types/game';
import { createCharacter, gainExperience } from '@/lib/gameLogic/characters';

interface PartyState {
  party: Character[];
  activeCharacterIndex: number;
  
  // Actions
  addCharacter: (name: string, characterClass: 'warrior' | 'mage') => void;
  removeCharacter: (id: string) => void;
  setActiveCharacter: (index: number) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  healCharacter: (id: string, amount: number) => void;
  restoreMana: (id: string, amount: number) => void;
  giveExperience: (id: string, amount: number) => void;
  resetParty: () => void;
}

export const useParty = create<PartyState>((set, get) => ({
  party: [],
  activeCharacterIndex: 0,
  
  addCharacter: (name, characterClass) => {
    const character = createCharacter(name, characterClass);
    set((state) => ({
      party: [...state.party, character]
    }));
  },
  
  removeCharacter: (id) => {
    set((state) => ({
      party: state.party.filter(char => char.id !== id)
    }));
  },
  
  setActiveCharacter: (index) => {
    set({ activeCharacterIndex: index });
  },
  
  updateCharacter: (id, updates) => {
    set((state) => ({
      party: state.party.map(char => 
        char.id === id ? { ...char, ...updates } : char
      )
    }));
  },
  
  healCharacter: (id, amount) => {
    set((state) => ({
      party: state.party.map(char => 
        char.id === id 
          ? { ...char, health: Math.min(char.maxHealth, char.health + amount) }
          : char
      )
    }));
  },
  
  restoreMana: (id, amount) => {
    set((state) => ({
      party: state.party.map(char => 
        char.id === id 
          ? { ...char, mana: Math.min(char.maxMana, char.mana + amount) }
          : char
      )
    }));
  },
  
  giveExperience: (id, amount) => {
    set((state) => ({
      party: state.party.map(char => 
        char.id === id ? gainExperience(char, amount) : char
      )
    }));
  },
  
  resetParty: () => {
    set({
      party: [],
      activeCharacterIndex: 0
    });
  }
}));
