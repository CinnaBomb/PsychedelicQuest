import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCombat } from '@/lib/stores/useCombat';
import { useParty } from '@/lib/stores/useParty';
import { useGameState } from '@/lib/stores/useGameState';
import { useAudio } from '@/lib/stores/useAudio';
import { CombatAction } from '@/types/game';
import { executeAction, enemyAI, calculateExperienceGain } from '@/lib/gameLogic/combat';

export default function Combat() {
  const { 
    currentEnemy, 
    combatLog, 
    isPlayerTurn, 
    combatPhase,
    endCombat,
    addToLog
  } = useCombat();
  
  const { party, activeCharacterIndex, updateCharacter, giveExperience } = useParty();
  const { setPhase } = useGameState();
  const { playHit } = useAudio();
  
  const [selectedAction, setSelectedAction] = useState<CombatAction['type'] | null>(null);
  
  const activeCharacter = party[activeCharacterIndex];

  useEffect(() => {
    if (!isPlayerTurn && currentEnemy?.isAlive) {
      // Execute enemy turn after a delay
      const timer = setTimeout(() => {
        executeEnemyTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, currentEnemy]);

  const executePlayerAction = (action: CombatAction) => {
    if (!currentEnemy || !activeCharacter) return;

    const result = executeAction(activeCharacter, action, currentEnemy);
    addToLog(result.message);

    if (result.damage) {
      playHit();
      updateCharacter(currentEnemy.id, { health: currentEnemy.health });
    }

    // Check if enemy died
    if (result.targetDied) {
      const expGain = calculateExperienceGain(currentEnemy);
      addToLog(`${currentEnemy.name} defeated! Gained ${expGain} experience.`);
      
      // Give experience to all alive party members
      party.forEach(char => {
        if (char.health > 0) {
          giveExperience(char.id, expGain);
        }
      });

      setTimeout(() => {
        endCombat();
        setPhase('exploration');
      }, 2000);
      return;
    }

    // Enemy turn
    setTimeout(() => {
      executeEnemyTurn();
    }, 1000);
  };

  const executeEnemyTurn = () => {
    if (!currentEnemy?.isAlive) return;

    const alivePartyMembers = party.filter(char => char.health > 0);
    if (alivePartyMembers.length === 0) {
      addToLog('All party members have fallen! Game Over.');
      setPhase('game_over');
      return;
    }

    const enemyAction = enemyAI(currentEnemy, alivePartyMembers);
    const target = alivePartyMembers.find(char => char.id === enemyAction.target) || alivePartyMembers[0];
    
    // Simple enemy attack
    const damage = Math.floor(currentEnemy.attack * (0.8 + Math.random() * 0.4));
    const finalDamage = Math.max(1, damage - (target.stats?.defense || 0));
    
    updateCharacter(target.id, { 
      health: Math.max(0, target.health - finalDamage) 
    });

    addToLog(`${currentEnemy.name} attacks ${target.name} for ${finalDamage} damage!`);
    playHit();

    if (target.health - finalDamage <= 0) {
      addToLog(`${target.name} has fallen!`);
    }
  };

  const handleAction = (actionType: CombatAction['type']) => {
    const action: CombatAction = { type: actionType };
    executePlayerAction(action);
    setSelectedAction(null);
  };

  if (!currentEnemy) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl h-full max-h-96 grid grid-cols-2 gap-4 p-4">
        {/* Combat Log */}
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Combat Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {combatLog.map((message, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-800 rounded">
                    {message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Combat Actions */}
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {isPlayerTurn && activeCharacter.health > 0 ? (
              <div className="space-y-3">
                <div className="text-sm mb-4">
                  <div>{activeCharacter.name}'s turn</div>
                  <div className="text-gray-400">
                    HP: {activeCharacter.health}/{activeCharacter.maxHealth} | 
                    MP: {activeCharacter.mana}/{activeCharacter.maxMana}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleAction('attack')}
                    className="p-4 h-auto"
                    variant="destructive"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Attack</div>
                      <div className="text-xs opacity-75">Basic melee attack</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handleAction('defend')}
                    className="p-4 h-auto"
                    variant="outline"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Defend</div>
                      <div className="text-xs opacity-75">Reduce incoming damage</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handleAction('cast_spell')}
                    className="p-4 h-auto"
                    variant="secondary"
                    disabled={activeCharacter.mana < 5}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Cast Spell</div>
                      <div className="text-xs opacity-75">Use magic abilities</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handleAction('use_item')}
                    className="p-4 h-auto"
                    variant="outline"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Use Item</div>
                      <div className="text-xs opacity-75">Consume potion/item</div>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-lg mb-2">Enemy Turn</div>
                <div className="text-gray-400">Waiting for {currentEnemy.name} to act...</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
