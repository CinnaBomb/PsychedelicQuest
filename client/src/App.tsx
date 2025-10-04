import { Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";

import GameScene from "./components/game/GameScene";
import GameUI from "./components/game/GameUI";
import CharacterCreation from "./components/game/CharacterCreation";
import Combat from "./components/game/Combat";
import Inventory from "./components/game/Inventory";
import { AuthScreen } from "./components/game/AuthScreen";
import { SaveLoadMenu } from "./components/game/SaveLoadMenu";

import { useGameState } from "./lib/stores/useGameState";
import { useParty } from "./lib/stores/useParty";
import { useAudio } from "./lib/stores/useAudio";
import { useAuth } from "./lib/stores/useAuth";
import { useSaveGame } from "./lib/stores/useSaveGame";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { LogOut, Save } from "lucide-react";

const queryClient = new QueryClient();

function MainMenu() {
  const { setPhase, setGameName } = useGameState();
  const { resetParty } = useParty();
  const { user, logout } = useAuth();
  const { saves, getSaves } = useSaveGame();
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newGameName, setNewGameName] = useState('');

  // Load saves to generate default name
  useEffect(() => {
    if (user) {
      getSaves(user.id);
    }
  }, [user, getSaves]);

  const handleNewGameClick = () => {
    // Generate default name based on existing saves
    const defaultName = `Game ${saves.length + 1}`;
    setNewGameName(defaultName);
    setShowNameDialog(true);
  };

  const handleStartNewGame = () => {
    const gameName = newGameName.trim() || `Game ${saves.length + 1}`;
    setGameName(gameName);
    resetParty();
    setPhase('character_creation');
    setShowNameDialog(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1" />
            <CardTitle className="text-3xl font-bold text-white flex-1 text-center">
              Undercroft RPG
            </CardTitle>
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-gray-400">
            Welcome, {user?.username}!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleNewGameClick}
            className="w-full py-3 text-lg"
          >
            New Game
          </Button>
          
          <Button 
            onClick={() => setShowSaveMenu(true)}
            variant="outline"
            className="w-full py-3 text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            Load Game
          </Button>
          
          <div className="text-center text-sm text-gray-500 space-y-1">
            <div>Movement: WASD or Arrow Keys</div>
            <div>Turn: Q/E Keys</div>
            <div>Interact: Space</div>
          </div>
        </CardContent>
      </Card>
      
      {showSaveMenu && (
        <SaveLoadMenu onClose={() => setShowSaveMenu(false)} />
      )}

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">New Game</DialogTitle>
            <DialogDescription className="text-gray-400">
              Give your adventure a name
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game-name" className="text-right text-gray-300">
                Name
              </Label>
              <Input
                id="game-name"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder={`Game ${saves.length + 1}`}
                className="col-span-3 bg-gray-700 border-gray-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStartNewGame();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)} className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button onClick={handleStartNewGame}>
              Start Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GameOverScreen() {
  const { setPhase, resetGame } = useGameState();
  const { resetParty } = useParty();

  const handleRestart = () => {
    resetGame();
    resetParty();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
      <Card className="w-full max-w-md bg-red-900 border-red-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Game Over
          </CardTitle>
          <p className="text-red-200">
            Your party has fallen in the depths of the dungeon
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleRestart}
            className="w-full py-3 text-lg"
            variant="outline"
          >
            Try Again
          </Button>
          
          <Button 
            onClick={() => setPhase('menu')}
            className="w-full py-3"
            variant="secondary"
          >
            Main Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SoundManager() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  useEffect(() => {
    // Load sounds
    const backgroundMusic = new Audio('/sounds/background.mp3');
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');

    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;

    setBackgroundMusic(backgroundMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return null;
}

function App() {
  const { phase } = useGameState();
  const [showCanvas, setShowCanvas] = useState(false);
  const { user, isLoading: authLoading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    setShowCanvas(true);
  }, []);

  // Show loading while checking authentication
  if (authLoading || !showCanvas) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white">
        <div>Loading...</div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthScreen />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <SoundManager />
        
        {phase === 'menu' && <MainMenu />}
        
        {phase === 'character_creation' && <CharacterCreation />}
        
        {phase === 'exploration' && (
          <>
            <Suspense fallback={
              <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white">
                <div>Loading game...</div>
              </div>
            }>
              <GameScene />
            </Suspense>
            <GameUI />
          </>
        )}
        
        {phase === 'combat' && (
          <>
            <Suspense fallback={null}>
              <GameScene />
            </Suspense>
            <GameUI />
            <Combat />
          </>
        )}
        
        {phase === 'inventory' && (
          <>
            <Suspense fallback={null}>
              <GameScene />
            </Suspense>
            <Inventory />
          </>
        )}
        
        {phase === 'game_over' && <GameOverScreen />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
