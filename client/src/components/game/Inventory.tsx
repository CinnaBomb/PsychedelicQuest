import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/lib/stores/useInventory';
import { useParty } from '@/lib/stores/useParty';
import { useGameState } from '@/lib/stores/useGameState';
import { Item } from '@/types/game';

export default function Inventory() {
  const { items } = useInventory();
  const { party, activeCharacterIndex, updateCharacter } = useParty();
  const { setPhase } = useGameState();

  const activeCharacter = party[activeCharacterIndex];

  const getRarityColor = (rarity: Item['rarity']) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-orange-500'
    };
    return colors[rarity];
  };

  const equipItem = (item: Item) => {
    if (!activeCharacter) return;

    if (item.type === 'weapon') {
      updateCharacter(activeCharacter.id, {
        equipment: {
          ...activeCharacter.equipment,
          weapon: item
        }
      });
    } else if (item.type === 'armor') {
      updateCharacter(activeCharacter.id, {
        equipment: {
          ...activeCharacter.equipment,
          armor: item
        }
      });
    }
  };

  const useItem = (item: Item) => {
    if (!activeCharacter || !item.effect) return;

    if (item.effect.type === 'heal') {
      const newHealth = Math.min(
        activeCharacter.maxHealth,
        activeCharacter.health + item.effect.value
      );
      updateCharacter(activeCharacter.id, { health: newHealth });
    } else if (item.effect.type === 'mana') {
      const newMana = Math.min(
        activeCharacter.maxMana,
        activeCharacter.mana + item.effect.value
      );
      updateCharacter(activeCharacter.id, { mana: newMana });
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Inventory</h2>
            <Button
              variant="outline"
              onClick={() => setPhase('exploration')}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Close
            </Button>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-auto">
            {/* Character Equipment */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {activeCharacter?.name || 'No Character'} - Equipment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCharacter && (
                  <>
                    <div>
                      <label className="text-sm text-gray-400">Weapon</label>
                      <div className="mt-1 p-3 bg-gray-700 rounded">
                        {activeCharacter.equipment.weapon ? (
                          <div>
                            <div className="font-medium text-white">
                              {activeCharacter.equipment.weapon.name}
                            </div>
                            <div className="text-sm text-gray-300">
                              Attack: +{activeCharacter.equipment.weapon.stats?.attack || 0}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500">No weapon equipped</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">Armor</label>
                      <div className="mt-1 p-3 bg-gray-700 rounded">
                        {activeCharacter.equipment.armor ? (
                          <div>
                            <div className="font-medium text-white">
                              {activeCharacter.equipment.armor.name}
                            </div>
                            <div className="text-sm text-gray-300">
                              Defense: +{activeCharacter.equipment.armor.stats?.defense || 0}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500">No armor equipped</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <div className="text-sm text-gray-400">Stats</div>
                      <div className="text-sm text-white space-y-1">
                        <div>Strength: {activeCharacter.stats.strength}</div>
                        <div>Intelligence: {activeCharacter.stats.intelligence}</div>
                        <div>Defense: {activeCharacter.stats.defense}</div>
                        <div>Speed: {activeCharacter.stats.speed}</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Inventory Items */}
            <div className="col-span-2 space-y-4">
              {Object.entries(groupedItems).map(([type, typeItems]) => (
                <Card key={type} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white capitalize">
                      {type}s ({typeItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {typeItems.map((item, index) => (
                        <div
                          key={`${item.id}_${index}`}
                          className="p-3 bg-gray-700 rounded border border-gray-600 hover:border-gray-500 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-white">{item.name}</div>
                            <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
                              {item.rarity}
                            </Badge>
                          </div>
                          
                          {item.stats && (
                            <div className="text-sm text-gray-300 mb-2">
                              {item.stats.attack && `Attack: +${item.stats.attack}`}
                              {item.stats.defense && `Defense: +${item.stats.defense}`}
                              {item.stats.healthBonus && `Health: +${item.stats.healthBonus}`}
                              {item.stats.manaBonus && `Mana: +${item.stats.manaBonus}`}
                            </div>
                          )}
                          
                          {item.effect && (
                            <div className="text-sm text-green-400 mb-2">
                              {item.effect.type === 'heal' && `Heals ${item.effect.value} HP`}
                              {item.effect.type === 'mana' && `Restores ${item.effect.value} MP`}
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            {(item.type === 'weapon' || item.type === 'armor') && (
                              <Button
                                size="sm"
                                onClick={() => equipItem(item)}
                                className="flex-1"
                              >
                                Equip
                              </Button>
                            )}
                            
                            {item.effect && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => useItem(item)}
                                className="flex-1"
                              >
                                Use
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {items.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="py-12 text-center">
                    <div className="text-gray-400">Your inventory is empty</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Explore the dungeon to find items!
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
