import { Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";

import GameScene from "./components/game/GameScene";
import GameUI from "./components/game/GameUI";
import CharacterCreation from "./components/game/CharacterCreation";
import Combat from "./components/game/Combat";
import Inventory from "./components/game/Inventory";

import { useGameState } from "./lib/stores/useGameState";
import { useParty } from "./lib/stores/useParty";
import { useAudio } from "./lib/stores/useAudio";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

const queryClient = new QueryClient();

function MainMenu() {
  const { setPhase } = useGameState();
  const { resetParty } = useParty();

  const handleNewGame = () => {
    resetParty();
    setPhase('character_creation');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Undercroft RPG
          </CardTitle>
          <p className="text-gray-400">
            A classic dungeon crawler adventure
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleNewGame}
            className="w-full py-3 text-lg"
          >
            New Game
          </Button>
          
          <div className="text-center text-sm text-gray-500 space-y-1">
            <div>Movement: WASD or Arrow Keys</div>
            <div>Turn: Q/E Keys</div>
            <div>Interact: Space</div>
          </div>
        </CardContent>
      </Card>
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

  useEffect(() => {
    setShowCanvas(true);
  }, []);

  if (!showCanvas) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white">
        <div>Loading...</div>
      </div>
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
