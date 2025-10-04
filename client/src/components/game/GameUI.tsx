import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useParty } from '@/lib/stores/useParty';
import { useGameState } from '@/lib/stores/useGameState';
import { useCombat } from '@/lib/stores/useCombat';
import { CHARACTER_CLASSES } from '@/lib/gameLogic/characters';

export default function GameUI() {
  const { party, activeCharacterIndex } = useParty();
  const { phase, setPhase, playerState } = useGameState();
  const { currentEnemy } = useCombat();
  const [showPartyDetails, setShowPartyDetails] = useState(false);

  if (party.length === 0) return null;

  const activeCharacter = party[activeCharacterIndex];
  const directionNames = ['North', 'East', 'South', 'West'];
  const currentDirection = directionNames[playerState.facing];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 pointer-events-auto">
        <div className="flex justify-between items-start">
          {/* Active Character Status */}
          <Card className="bg-black/80 border-gray-600 text-white min-w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {activeCharacter.name} - Level {activeCharacter.level} {CHARACTER_CLASSES[activeCharacter.class].name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Health</span>
                  <span>{activeCharacter.health}/{activeCharacter.maxHealth}</span>
                </div>
                <Progress 
                  value={(activeCharacter.health / activeCharacter.maxHealth) * 100} 
                  className="h-2 bg-gray-700"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Mana</span>
                  <span>{activeCharacter.mana}/{activeCharacter.maxMana}</span>
                </div>
                <Progress 
                  value={(activeCharacter.mana / activeCharacter.maxMana) * 100} 
                  className="h-2 bg-gray-700"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Experience</span>
                  <span>{activeCharacter.experience}/{activeCharacter.experienceToNext}</span>
                </div>
                <Progress 
                  value={(activeCharacter.experience / activeCharacter.experienceToNext) * 100} 
                  className="h-2 bg-gray-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Game Controls */}
          <div className="flex items-center space-x-4">
            {/* Compass Indicator */}
            <Card className="bg-black/90 border-gray-600 text-white">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Facing</div>
                <div className="text-lg font-bold text-yellow-400">{currentDirection}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {playerState.facing === 0 && '↑'}
                  {playerState.facing === 1 && '→'}
                  {playerState.facing === 2 && '↓'}
                  {playerState.facing === 3 && '←'}
                </div>
              </CardContent>
            </Card>
            
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPartyDetails(!showPartyDetails)}
                className="bg-black/80 border-gray-600 text-white hover:bg-gray-700"
              >
                Party
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhase('inventory')}
                className="bg-black/80 border-gray-600 text-white hover:bg-gray-700"
              >
                Inventory
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhase('menu')}
                className="bg-black/80 border-gray-600 text-white hover:bg-gray-700"
              >
                Menu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Party Details Panel */}
      {showPartyDetails && (
        <div className="absolute top-20 left-4 pointer-events-auto">
          <Card className="bg-black/90 border-gray-600 text-white w-80">
            <CardHeader>
              <CardTitle className="text-sm">Party Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {party.map((character, index) => (
                <div 
                  key={character.id} 
                  className={`p-2 rounded ${index === activeCharacterIndex ? 'bg-blue-600/50' : 'bg-gray-700/50'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{character.name}</span>
                    <span className="text-xs">Lvl {character.level}</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    HP: {character.health}/{character.maxHealth} | 
                    MP: {character.mana}/{character.maxMana}
                  </div>
                  <div className="text-xs text-gray-400">
                    {CHARACTER_CLASSES[character.class].name}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Combat Enemy Info */}
      {currentEnemy && phase === 'combat' && (
        <div className="absolute top-4 right-4 pointer-events-auto">
          <Card className="bg-red-900/80 border-red-600 text-white min-w-48">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{currentEnemy.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Health</span>
                  <span>{currentEnemy.health}/{currentEnemy.maxHealth}</span>
                </div>
                <Progress 
                  value={(currentEnemy.health / currentEnemy.maxHealth) * 100} 
                  className="h-2 bg-gray-700"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Card className="bg-black/80 border-gray-600 text-white">
          <CardContent className="p-4">
            <div className="text-center text-sm space-y-2">
              <div>Movement: WASD or Arrow Keys</div>
              <div>Turn: Q/E Keys</div>
              <div>Press Space to interact</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
