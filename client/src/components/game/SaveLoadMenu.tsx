import { useState, useEffect } from 'react';
import { useSaveGame } from '@/lib/stores/useSaveGame';
import { useAuth } from '@/lib/stores/useAuth';
import { useGameState } from '@/lib/stores/useGameState';
import { useParty } from '@/lib/stores/useParty';
import { useInventory } from '@/lib/stores/useInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Save, Trash2, Download } from 'lucide-react';

interface SaveLoadMenuProps {
  onClose: () => void;
}

export function SaveLoadMenu({ onClose }: SaveLoadMenuProps) {
  const [saveName, setSaveName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [mode, setMode] = useState<'save' | 'load'>('save');

  const { user } = useAuth();
  const { saves, isLoading, error, createSave, loadSave, deleteSave, getSaves, currentSaveId } = useSaveGame();
  const { phase, playerState, dungeon, gameName, setPhase } = useGameState();
  const { party } = useParty();
  const { items } = useInventory();

  useEffect(() => {
    if (user) {
      getSaves(user.id);
    }
  }, [user, getSaves]);

  // Set default save name from gameName when component mounts
  useEffect(() => {
    if (gameName && !saveName) {
      setSaveName(gameName);
    }
  }, [gameName, saveName]);

  const handleSaveGame = async () => {
    if (!user) return;
    
    // Use gameName as default if saveName is empty
    const finalSaveName = saveName.trim() || gameName || `Game ${saves.length + 1}`;
    
    if (!finalSaveName) {
      alert('Please enter a save name');
      return;
    }

    try {
      await createSave(user.id, finalSaveName, {
        playerPosition: playerState.position,
        characters: party,
        inventory: items,
        dungeonData: dungeon,
        dungeonLevel: 1, // TODO: Track dungeon level in game state
        exploredRooms: [],
      });
      setSaveName('');
      alert('Game saved successfully!');
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
    }
  };

  const handleUpdateSave = async (saveId: number) => {
    if (!user) return;
    try {
      await useSaveGame.getState().updateSave(user.id, saveId, {
        playerPosition: playerState.position,
        characters: party,
        inventory: items,
        dungeonData: dungeon,
        dungeonLevel: 1,
        exploredRooms: [],
      });
      alert('Game updated successfully!');
    } catch (error: any) {
      alert(`Failed to update: ${error.message}`);
    }
  };

  const handleLoadGame = async (saveId: number) => {
    if (!user) return;
    try {
      const data = await loadSave(user.id, saveId);
      if (!data) {
        alert('Failed to load save');
        return;
      }

      // Update game state with loaded data
      const gameState = useGameState.getState();
      const partyState = useParty.getState();
      const inventoryState = useInventory.getState();

      // Update player position
      gameState.updatePlayerPosition(data.save.playerPosition.x, data.save.playerPosition.z);

      // Load dungeon
      gameState.dungeon = data.dungeonState || dungeon;

      // Load characters - clear existing party first
      partyState.resetParty();
      data.characters.forEach((char: any) => {
        // Since addCharacter creates a new character, we need to restore the full state differently
        // For now, we'll just add a note that this needs proper implementation
        partyState.addCharacter(char.name, char.class as 'warrior' | 'mage');
      });

      // Load inventory
      inventoryState.items = data.inventory;

      // Return to game
      setPhase('exploration');
      onClose();
      alert('Game loaded successfully!');
    } catch (error: any) {
      alert(`Failed to load: ${error.message}`);
    }
  };

  const handleDeleteSave = async (saveId: number) => {
    if (!user) return;
    try {
      await deleteSave(user.id, saveId);
      setDeleteConfirmId(null);
      alert('Save deleted successfully!');
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>Save & Load Game</CardTitle>
          <CardDescription>
            Manage your game saves
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Button
              variant={mode === 'save' ? 'default' : 'outline'}
              onClick={() => setMode('save')}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Game
            </Button>
            <Button
              variant={mode === 'load' ? 'default' : 'outline'}
              onClick={() => setMode('load')}
            >
              <Download className="w-4 h-4 mr-2" />
              Load Game
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {error && (
            <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {mode === 'save' && (
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder={gameName || "Enter save name..."}
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveGame()}
                />
                <Button onClick={handleSaveGame} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span className="ml-2">Create New Save</span>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              {mode === 'save' ? 'Overwrite Existing Save' : 'Available Saves'}
            </h3>
            
            {isLoading && saves.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : saves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No saves found. Create your first save!
              </div>
            ) : (
              saves.map((save) => (
                <Card key={save.id} className={save.id === currentSaveId ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{save.saveName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Level {save.dungeonLevel} • {formatDate(save.updatedAt)}
                        </p>
                        {save.id === currentSaveId && (
                          <span className="text-xs text-primary">Currently Active</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {mode === 'save' ? (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateSave(save.id)}
                            disabled={isLoading}
                          >
                            Overwrite
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleLoadGame(save.id)}
                            disabled={isLoading}
                          >
                            Load
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteConfirmId(save.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-6">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Save?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this save file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteSave(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
