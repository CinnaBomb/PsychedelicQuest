import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParty } from '@/lib/stores/useParty';
import { useGameState } from '@/lib/stores/useGameState';
import { CharacterClass } from '@/types/game';
import { CHARACTER_CLASSES } from '@/lib/gameLogic/characters';

export default function CharacterCreation() {
  const [characterName, setCharacterName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const { addCharacter } = useParty();
  const { setPhase, initializeGame } = useGameState();

  const handleCreateCharacter = () => {
    if (characterName.trim()) {
      addCharacter(characterName, selectedClass);
      setCharacterName('');
    }
  };

  const handleStartGame = () => {
    initializeGame();
  };

  const { party } = useParty();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Creation */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create Character</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter character name"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CHARACTER_CLASSES).map(([classKey, classData]) => (
                  <Button
                    key={classKey}
                    variant={selectedClass === classKey ? "default" : "outline"}
                    onClick={() => setSelectedClass(classKey as CharacterClass)}
                    className="p-4 h-auto flex flex-col items-start"
                  >
                    <div className="font-semibold">{classData.name}</div>
                    <div className="text-xs opacity-75">
                      STR: {classData.baseStats.strength} | 
                      INT: {classData.baseStats.intelligence}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleCreateCharacter}
              disabled={!characterName.trim()}
              className="w-full"
            >
              Add to Party
            </Button>
          </CardContent>
        </Card>

        {/* Party Overview */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Your Party</CardTitle>
          </CardHeader>
          <CardContent>
            {party.length === 0 ? (
              <p className="text-gray-400">No characters created yet</p>
            ) : (
              <div className="space-y-3">
                {party.map((character, index) => (
                  <div key={character.id} className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{character.name}</div>
                        <div className="text-sm text-gray-300">
                          Level {character.level} {CHARACTER_CLASSES[character.class].name}
                        </div>
                      </div>
                      <div className="text-sm">
                        HP: {character.health}/{character.maxHealth}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {party.length > 0 && (
              <div className="mt-6 space-y-2">
                <Button onClick={handleStartGame} className="w-full">
                  Start Adventure
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPhase('menu')}
                  className="w-full"
                >
                  Back to Menu
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
