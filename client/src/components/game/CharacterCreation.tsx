import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParty, MAX_PARTY_SIZE } from '@/lib/stores/useParty';
import { useGameState } from '@/lib/stores/useGameState';
import { CharacterClass, Character } from '@/types/game';
import { CHARACTER_CLASSES } from '@/lib/gameLogic/characters';
import { Trash2, Edit2, Check, X, Sparkles } from 'lucide-react';

// Cute and normal cat names
const CAT_NAMES = [
  'Luna', 'Oliver', 'Bella', 'Milo', 'Simba', 'Cleo', 'Leo', 'Nala',
  'Charlie', 'Lucy', 'Max', 'Lily', 'Oscar', 'Chloe', 'Jack', 'Sophie',
  'Felix', 'Daisy', 'Jasper', 'Willow', 'Tiger', 'Gracie', 'Smokey', 'Penny',
  'Shadow', 'Molly', 'Mittens', 'Ginger', 'Boots', 'Whiskers', 'Misty', 'Oreo',
  'Pumpkin', 'Cookie', 'Pepper', 'Patches', 'Dusty', 'Midnight', 'Snowball', 'Fluffy',
  'Muffin', 'Butterscotch', 'Caramel', 'Cinnamon', 'Mocha', 'Pickles', 'Noodles', 'Biscuit',
  'Mango', 'Peaches', 'Oliver', 'Rosie', 'Toby', 'Ruby', 'Ziggy', 'Olive'
];

const getRandomName = (usedNames: Set<string>): string => {
  const availableNames = CAT_NAMES.filter(name => !usedNames.has(name));
  if (availableNames.length === 0) {
    // Fallback to numbered names if we run out
    return `Cat ${Math.floor(Math.random() * 1000)}`;
  }
  return availableNames[Math.floor(Math.random() * availableNames.length)];
};

export default function CharacterCreation() {
  const [characterName, setCharacterName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('anubis_guardian');
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState<CharacterClass>('anubis_guardian');
  const { addCharacter, party, removeCharacter, updateCharacter, resetParty } = useParty();
  const { setPhase, initializeGame } = useGameState();

  const handleCreateCharacter = () => {
    if (characterName.trim()) {
      addCharacter(characterName, selectedClass);
      setCharacterName('');
    }
  };

  const handleStartEdit = (character: Character) => {
    setEditingCharacterId(character.id);
    setEditName(character.name);
    setEditClass(character.class);
  };

  const handleCancelEdit = () => {
    setEditingCharacterId(null);
    setEditName('');
  };

  const handleSaveEdit = (characterId: string) => {
    if (editName.trim()) {
      // Get the class data for the new class
      const classData = CHARACTER_CLASSES[editClass];
      updateCharacter(characterId, {
        name: editName,
        class: editClass,
        stats: { ...classData.baseStats }
      });
      setEditingCharacterId(null);
      setEditName('');
    }
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (confirm('Are you sure you want to remove this character from your party?')) {
      removeCharacter(characterId);
    }
  };

  const handleQuickStart = () => {
    // Clear existing party
    resetParty();
    
    // Get all class keys
    const classes: CharacterClass[] = Object.keys(CHARACTER_CLASSES) as CharacterClass[];
    const usedNames = new Set<string>();
    
    // Create one character for each class
    classes.forEach((classKey) => {
      const name = getRandomName(usedNames);
      usedNames.add(name);
      addCharacter(name, classKey);
    });
  };

  const handleStartGame = () => {
    initializeGame();
  };

  const isPartyFull = party.length >= MAX_PARTY_SIZE;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl h-full grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Character Creation */}
        <Card className="bg-gray-800 border-gray-700 flex flex-col h-full">
          <CardHeader className="pb-2 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-white text-base sm:text-lg">Create Character ({party.length}/{MAX_PARTY_SIZE})</CardTitle>
              {!isPartyFull && party.length === 0 && (
                <Button 
                  onClick={handleQuickStart}
                  variant="outline"
                  size="sm"
                  className="h-8 border-purple-500 text-purple-300 hover:bg-purple-500/20 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Quick Start
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 flex-1 overflow-hidden flex flex-col">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5">Name</label>
              <Input
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter character name"
                className="bg-gray-700 border-gray-600 text-white h-9"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5">Choose Your Class</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {Object.entries(CHARACTER_CLASSES).map(([classKey, classData]) => (
                  <button
                    key={classKey}
                    onClick={() => setSelectedClass(classKey as CharacterClass)}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-left ${
                      selectedClass === classKey 
                        ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20' 
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-bold text-xs sm:text-sm text-white leading-tight">
                          {classData.name}
                        </h3>
                        {selectedClass === classKey && (
                          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-gray-300 mb-2 leading-tight line-clamp-2">
                        {classData.description}
                      </p>
                      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[8px] sm:text-[9px] text-gray-400 mt-auto">
                        <div className="flex items-center gap-0.5">
                          <span className="text-red-400">⚔️</span>
                          <span>STR {classData.baseStats.strength}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-purple-400">🧠</span>
                          <span>INT {classData.baseStats.intelligence}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-blue-400">🛡️</span>
                          <span>DEF {classData.baseStats.defense}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-green-400">⚡</span>
                          <span>SPD {classData.baseStats.speed}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleCreateCharacter}
              disabled={!characterName.trim() || isPartyFull}
              className="w-full h-9"
            >
              {isPartyFull ? `Party Full (${MAX_PARTY_SIZE} max)` : 'Add to Party'}
            </Button>
            {isPartyFull && (
              <p className="text-amber-400 text-xs sm:text-sm text-center">
                ✨ Your party is complete! Ready to start your journey.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Party Overview */}
        <Card className="bg-gray-800 border-gray-700 flex flex-col h-full">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-white text-base sm:text-lg">Your Party</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 min-h-0">
            {party.length === 0 ? (
              <p className="text-gray-400 text-sm">No characters created yet</p>
            ) : (
              <div className="space-y-2 flex-1 min-h-0">
                {party.map((character, index) => (
                  <div key={character.id} className="bg-gray-700 p-2 rounded-lg border border-gray-600">
                    {editingCharacterId === character.id ? (
                      /* Edit Mode */
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white h-8 text-sm"
                          placeholder="Character name"
                        />
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400">Select Class:</label>
                          {Object.entries(CHARACTER_CLASSES).map(([classKey, classData]) => (
                            <button
                              key={classKey}
                              onClick={() => setEditClass(classKey as CharacterClass)}
                              className={`w-full p-1.5 rounded border text-left transition-all ${
                                editClass === classKey 
                                  ? 'border-blue-500 bg-blue-500/20' 
                                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-[10px] text-white">{classData.name}</div>
                                  <div className="text-[8px] text-gray-400 mt-0.5">
                                    STR {classData.baseStats.strength} | INT {classData.baseStats.intelligence} | DEF {classData.baseStats.defense} | SPD {classData.baseStats.speed}
                                  </div>
                                </div>
                                {editClass === classKey && (
                                  <div className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(character.id)}
                            className="flex-1 h-8 text-xs"
                            disabled={!editName.trim()}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="flex-1 h-8 text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-white truncate">{character.name}</div>
                          <div className="text-xs text-gray-300">
                            Lv{character.level} {CHARACTER_CLASSES[character.class].name}
                          </div>
                          <div className="flex gap-2 mt-0.5 text-[9px] text-gray-400">
                            <span>HP {character.health}/{character.maxHealth}</span>
                            <span>MP {character.mana}/{character.maxMana}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-x-1.5 mt-0.5 text-[8px] text-gray-400">
                            <span>STR {character.stats.strength}</span>
                            <span>INT {character.stats.intelligence}</span>
                            <span>DEF {character.stats.defense}</span>
                            <span>SPD {character.stats.speed}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(character)}
                            className="h-6 w-6 p-0 hover:bg-blue-600/20 hover:text-blue-400"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCharacter(character.id)}
                            className="h-6 w-6 p-0 hover:bg-red-600/20 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {party.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700 space-y-2 flex-shrink-0">
                <Button onClick={handleStartGame} className="w-full h-9">
                  Start Adventure
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPhase('menu')}
                  className="w-full h-9"
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
