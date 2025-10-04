// Example Integration: Add this to your main game UI component
// NOTE: This is a REFERENCE EXAMPLE showing integration patterns
// You'll need to adapt the property names to match your actual game stores

import { useState, useEffect, useRef } from 'react';
import { SaveLoadMenu } from '@/components/game/SaveLoadMenu';
import { useSaveGame } from '@/lib/stores/useSaveGame';
import { useGameState } from '@/lib/stores/useGameState';
import { useParty } from '@/lib/stores/useParty';
import { useInventory } from '@/lib/stores/useInventory';
import { Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This is an EXAMPLE - integrate these patterns into your actual game UI

export function GameUIWithSaves() {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const { currentSaveId, updateSave } = useSaveGame();
  const { playerPosition, dungeonData, dungeonLevel } = useGameState();
  const { characters } = useParty();
  const { items } = useInventory();

  // Quick save to current save slot (F5 key)
  const handleQuickSave = async () => {
    if (!currentSaveId) {
      alert('No active save. Please create a save first.');
      setShowSaveMenu(true);
      return;
    }

    try {
      await updateSave(1, currentSaveId, { // Replace 1 with actual userId
        playerPosition,
        characters,
        inventory: items,
        dungeonData,
        dungeonLevel,
      });
      
      // Show success notification (you can replace with your own toast/notification)
      console.log('✅ Game saved!');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F5 - Quick Save
      if (e.key === 'F5') {
        e.preventDefault();
        handleQuickSave();
      }
      // F9 - Open Save/Load Menu
      if (e.key === 'F9') {
        e.preventDefault();
        setShowSaveMenu(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSaveId, playerPosition, characters, items, dungeonData, dungeonLevel]);

  return (
    <div className="game-container">
      {/* Your existing game UI */}
      
      {/* Add Save/Load buttons to your UI */}
      <div className="game-controls">
        <Button
          onClick={handleQuickSave}
          disabled={!currentSaveId}
          variant="outline"
          size="sm"
        >
          <Save className="w-4 h-4 mr-2" />
          Quick Save (F5)
        </Button>
        
        <Button
          onClick={() => setShowSaveMenu(true)}
          variant="outline"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Save/Load (F9)
        </Button>
      </div>

      {/* Save/Load Menu Modal */}
      {showSaveMenu && (
        <SaveLoadMenu
          userId={1} // TODO: Replace with actual userId from authentication
          onClose={() => setShowSaveMenu(false)}
        />
      )}
    </div>
  );
}

// Auto-save example - add this to your main game component
export function useAutoSave(interval = 5 * 60 * 1000) { // Default: 5 minutes
  const { currentSaveId, updateSave } = useSaveGame();
  const { playerPosition, dungeonData, dungeonLevel } = useGameState();
  const { characters } = useParty();
  const { items } = useInventory();

  useEffect(() => {
    if (!currentSaveId) return; // Don't auto-save if no active save

    const autoSaveTimer = setInterval(async () => {
      try {
        await updateSave(1, currentSaveId, { // Replace 1 with actual userId
          playerPosition,
          characters,
          inventory: items,
          dungeonData,
          dungeonLevel,
        });
        console.log('🔄 Auto-saved at', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, interval);

    return () => clearInterval(autoSaveTimer);
  }, [currentSaveId, playerPosition, characters, items, dungeonData, dungeonLevel, interval]);
}

// Save on important events (level up, dungeon level change, etc.)
export function useSaveOnEvents() {
  const { currentSaveId, updateSave } = useSaveGame();
  const { playerPosition, dungeonData, dungeonLevel } = useGameState();
  const { characters } = useParty();
  const { items } = useInventory();
  const prevDungeonLevel = useRef(dungeonLevel);

  useEffect(() => {
    // Save when dungeon level changes
    if (currentSaveId && dungeonLevel !== prevDungeonLevel.current) {
      updateSave(1, currentSaveId, { // Replace 1 with actual userId
        playerPosition,
        characters,
        inventory: items,
        dungeonData,
        dungeonLevel,
      }).then(() => {
        console.log('✅ Saved on dungeon level change');
      });
      prevDungeonLevel.current = dungeonLevel;
    }
  }, [dungeonLevel, currentSaveId]);
}

// Example: Add to your main App.tsx or game component
/*
function App() {
  useAutoSave(); // Enable auto-save
  useSaveOnEvents(); // Save on important events
  
  return <GameUIWithSaves />;
}
*/
