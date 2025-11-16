import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useParty } from '@/lib/stores/useParty';
import { useGameState } from '@/lib/stores/useGameState';
import { useCombat } from '@/lib/stores/useCombat';
import { CHARACTER_CLASSES } from '@/lib/gameLogic/characters';
import Minimap from './Minimap';

export default function GameUI() {
  const { party, activeCharacterIndex } = useParty();
  const { phase, setPhase, playerState, currentMapId } = useGameState();
  const { currentEnemy } = useCombat();
  const [showPartyDetails, setShowPartyDetails] = useState(false);

  if (party.length === 0) return null;

  const activeCharacter = party[activeCharacterIndex];
  const directionNames = ['North', 'East', 'South', 'West'];
  const currentDirection = directionNames[playerState.facing];
  
  // Format map name for display
  const mapDisplayName = currentMapId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Unknown Area';

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 pointer-events-auto">
        <div className="flex justify-end items-start">
          {/* Game Controls */}
          <div className="flex items-center space-x-4">
            {/* Minimap */}
            <Minimap size={140} />
            
            {/* Map Location Indicator */}
            <Card className="bg-black/90 border-purple-600 text-white">
              <CardContent className="p-3 text-center min-w-32">
                <div className="text-xs text-purple-400 mb-1">Location</div>
                <div className="text-sm font-semibold text-purple-200">{mapDisplayName}</div>
                <div className="text-xs text-purple-400 mt-1">
                  ({playerState.position.x}, {playerState.position.z})
                </div>
              </CardContent>
            </Card>
            
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
                {showPartyDetails ? 'Hide Stats' : 'Party Stats'}
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

      {/* Centered Party Display */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center justify-center space-x-3">
          {party.map((character, index) => {
            const isActive = index === activeCharacterIndex;
            const healthPercent = (character.health / character.maxHealth) * 100;
            const manaPercent = (character.mana / character.maxMana) * 100;
            
            return (
              <Card 
                key={character.id}
                className={`
                  bg-black/90 text-white transition-all duration-300
                  ${isActive 
                    ? 'border-yellow-500 border-2 scale-110 shadow-lg shadow-yellow-500/50' 
                    : 'border-gray-600 border scale-100 opacity-80 hover:opacity-100'
                  }
                `}
              >
                <CardHeader className={`pb-2 ${isActive ? 'px-4 pt-3' : 'px-3 pt-2'}`}>
                  <CardTitle className={`${isActive ? 'text-sm' : 'text-xs'} text-center`}>
                    <div className={`font-bold ${isActive ? 'text-yellow-400' : 'text-white'}`}>
                      {character.name}
                    </div>
                    <div className={`${isActive ? 'text-xs' : 'text-[10px]'} text-gray-400 mt-1`}>
                      Level {character.level} {CHARACTER_CLASSES[character.class].name}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-2 ${isActive ? 'px-4 pb-3' : 'px-3 pb-2'}`}>
                  <div>
                    <div className={`flex justify-between ${isActive ? 'text-xs' : 'text-[10px]'} mb-1`}>
                      <span>HP</span>
                      <span>{character.health}/{character.maxHealth}</span>
                    </div>
                    <Progress 
                      value={healthPercent}
                      className={`${isActive ? 'h-2' : 'h-1.5'} bg-gray-700`}
                    />
                  </div>
                  <div>
                    <div className={`flex justify-between ${isActive ? 'text-xs' : 'text-[10px]'} mb-1`}>
                      <span>MP</span>
                      <span>{character.mana}/{character.maxMana}</span>
                    </div>
                    <Progress 
                      value={manaPercent}
                      className={`${isActive ? 'h-2' : 'h-1.5'} bg-gray-700`}
                    />
                  </div>
                  {isActive && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>EXP</span>
                        <span>{character.experience}/{character.experienceToNext}</span>
                      </div>
                      <Progress 
                        value={(character.experience / character.experienceToNext) * 100}
                        className="h-2 bg-gray-700"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Extended Party Details Panel (for detailed stats) */}
      {showPartyDetails && (
        <div className="absolute top-20 left-4 pointer-events-auto">
          <Card className="bg-black/90 border-gray-600 text-white w-80">
            <CardHeader>
              <CardTitle className="text-sm">Detailed Party Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {party.map((character, index) => (
                <div 
                  key={character.id} 
                  className={`p-3 rounded ${index === activeCharacterIndex ? 'bg-yellow-600/30 border border-yellow-500' : 'bg-gray-700/50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{character.name}</span>
                    <span className="text-xs bg-gray-600 px-2 py-1 rounded">Lvl {character.level}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-400">Health</div>
                      <div>{character.health}/{character.maxHealth}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Mana</div>
                      <div>{character.mana}/{character.maxMana}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Strength</div>
                      <div>{character.stats.strength}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Defense</div>
                      <div>{character.stats.defense}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {CHARACTER_CLASSES[character.class].name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    EXP: {character.experience}/{character.experienceToNext}
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

      {/* Movement Guide */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
        <Card className="bg-black/80 border-gray-600 text-white">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div>WASD / Arrow Keys: Move</div>
              <div>Space: Interact</div>
              <div>I: Inventory</div>
              <div>M: Minimap</div>
              <div>Esc: Menu</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
