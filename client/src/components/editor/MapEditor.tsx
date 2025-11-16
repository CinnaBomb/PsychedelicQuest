import React, { useState, useEffect, useCallback } from 'react';
import { CityMap, CityCell, EditorTool, EditorState } from '@/types/city';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/stores/useAuth';
import { 
  Save, 
  Download, 
  Upload, 
  Grid3X3, 
  Square, 
  DoorOpen, 
  MapPin, 
  Users, 
  ShoppingCart,
  TreePine,
  Loader2,
  Plus,
  RefreshCw
} from 'lucide-react';

// Editor tools for painting cells
const EDITOR_TOOLS: EditorTool[] = [
  { id: 'floor', name: 'Floor', cellType: 'floor', icon: 'Square', description: 'Walkable floor', color: '#f3f4f6' },
  { id: 'wall', name: 'Wall', cellType: 'wall', icon: 'Square', description: 'Blocking wall', color: '#374151' },
  { id: 'door', name: 'Door', cellType: 'door', icon: 'DoorOpen', description: 'Openable door', color: '#8b5cf6' },
  { id: 'exit', name: 'Exit', cellType: 'exit', icon: 'MapPin', description: 'Map transition', color: '#22c55e' },
  { id: 'npc', name: 'NPC', cellType: 'npc', icon: 'Users', description: 'Non-player character', color: '#3b82f6' },
  { id: 'shop', name: 'Shop', cellType: 'shop', icon: 'ShoppingCart', description: 'Shop entrance', color: '#f59e0b' },
  { id: 'chest', name: 'Chest', cellType: 'chest', icon: 'Square', description: 'Treasure chest', color: '#eab308' },
  { id: 'decoration', name: 'Decoration', cellType: 'decoration', icon: 'TreePine', description: 'Decorative element', color: '#10b981' },
];

export default function MapEditor() {
  const { user } = useAuth();
  const [currentMap, setCurrentMap] = useState<CityMap | null>(null);
  const [mapSource, setMapSource] = useState<'database' | 'json' | 'created' | null>(null);
  const [availableMaps, setAvailableMaps] = useState<any[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>('custom_starting_city');
  const [showNewMapDialog, setShowNewMapDialog] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [editorState, setEditorState] = useState<EditorState>({
    currentTool: EDITOR_TOOLS[0],
    mapSize: { width: 20, height: 20 },
    showGrid: true,
    showConnections: false,
    selectedCell: null,
    isDrawing: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with available maps and selected map
  useEffect(() => {
    loadAvailableMaps();
    loadOrCreateMap(selectedMapId);
  }, []);
  
  useEffect(() => {
    if (selectedMapId) {
      loadOrCreateMap(selectedMapId);
    }
  }, [selectedMapId]);

  const loadAvailableMaps = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/maps');
      if (response.ok) {
        const maps = await response.json();
        setAvailableMaps(maps);
        console.log('✅ Loaded available maps:', maps.length);
      }
    } catch (error) {
      console.error('Error loading available maps:', error);
    }
  };

  const loadOrCreateMap = async (mapId: string = 'custom_starting_city') => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Looking for ${mapId} in database...`);
      
      // Try to load specified map from database first
      const response = await fetch(`/api/maps/${mapId}`);
      
      if (response.ok) {
        const mapRecord = await response.json();
        setCurrentMap(mapRecord.mapData);
        setMapSource('database');
        console.log(`✅ Loaded ${mapId} from database`);
        setError(null);
        return;
      }
      
      console.log('📁 Map not in database, checking for JSON file to import...');
      
      // If not in database and it's custom_starting_city, try to load from JSON and import it
      if (mapId === 'custom_starting_city') {
        try {
          const jsonResponse = await fetch('/maps/custom_starting_city.json');
          if (jsonResponse.ok) {
            const mapData = await jsonResponse.json() as CityMap;
            
            console.log('📥 Found JSON file, importing to database...');
            
            // Import this map into the database
            const importResponse = await fetch('/api/maps', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mapId: 'custom_starting_city',
                name: mapData.name || 'Custom Starting City',
                description: mapData.description || 'Imported from JSON file',
                mapData: mapData,
                isPublic: true,
                version: mapData.version || '1.0.0'
              })
            });
            
            if (importResponse.ok) {
              setCurrentMap(mapData);
              setMapSource('database');
              console.log('✅ Imported custom_starting_city from JSON to database');
              setError(null);
              await loadAvailableMaps(); // Refresh the maps list
              return;
            } else {
              const importError = await importResponse.json();
              console.error('❌ Failed to import JSON to database:', importError);
              setError(`Failed to import JSON: ${importError.error}`);
            }
          }
        } catch (importError) {
          console.warn('⚠️ Could not import from JSON:', importError);
        }
      }
      
      console.log(`🆕 Creating new ${mapId} map...`);
      
      // Create a new map if neither database nor JSON worked
      const newMap = createNewMap(mapId);
      setCurrentMap(newMap);
      
      // Try to save it immediately to database
      try {
        const saveResponse = await fetch('/api/maps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mapId: newMap.id,
            name: newMap.name,
            description: newMap.description,
            mapData: newMap,
            isPublic: true,
            version: newMap.version
          })
        });
        
        if (saveResponse.ok) {
          console.log(`✅ Created and saved new ${mapId} to database`);
          setMapSource('database');
          setError(null);
          await loadAvailableMaps(); // Refresh the maps list
        } else {
          const saveError = await saveResponse.json();
          console.warn('⚠️ Created map but failed to save to database:', saveError);
          setError(`Created map but couldn't save to database: ${saveError.error}`);
        }
      } catch (saveError) {
        console.warn('⚠️ Created map but failed to save to database:', saveError);
        setMapSource('created');
        setError('Created map but couldn\'t save to database. You can manually save it.');
      }
      
    } catch (error) {
      console.error('❌ Error during map loading:', error);
      setError('Failed to load map. Creating new map.');
      setMapSource('created');
      const newMap = createNewMap();
      setCurrentMap(newMap);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewMap = (mapId: string = 'custom_starting_city'): CityMap => {
    const { width, height } = editorState.mapSize;
    const cells: CityCell[][] = [];
    
    // Initialize cells
    for (let x = 0; x < width; x++) {
      cells[x] = [];
      for (let z = 0; z < height; z++) {
        cells[x][z] = {
          x,
          z,
          type: 'floor',
          walkable: true,
          color: '#f3f4f6'
        };
      }
    }
    
    return {
      id: mapId,
      name: mapId.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: `A customizable map: ${mapId}`,
      size: { width, height },
      startPosition: { x: Math.floor(width / 2), z: Math.floor(height / 2) },
      cells,
      connections: [],
      npcs: [],
      shops: [],
      theme: 'city',
      dangerLevel: 1,
      discoveredByDefault: true,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const handleCellClick = useCallback((x: number, z: number) => {
    if (!currentMap || !user) return;
    
    const newMap = { ...currentMap };
    const tool = editorState.currentTool;
    
    // Update the cell
    if (!newMap.cells[x]) newMap.cells[x] = [];
    
    newMap.cells[x][z] = {
      x,
      z,
      type: tool.cellType,
      walkable: tool.cellType !== 'wall' && tool.cellType !== 'decoration',
      color: tool.color
    };
    
    newMap.updatedAt = new Date().toISOString();
    setCurrentMap(newMap);
  }, [currentMap, editorState.currentTool, user]);

  const saveMap = async () => {
    if (!currentMap || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapId: currentMap.id,
          name: currentMap.name,
          description: currentMap.description,
          mapData: currentMap,
          isPublic: true,
          version: currentMap.version
        })
      });
      
      if (response.ok) {
        console.log('✅ Map saved successfully');
        setMapSource('database');
        setError(null);
        await loadAvailableMaps(); // Refresh the maps list
      } else {
        const errorData = await response.json();
        setError(`Failed to save: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving map:', error);
      setError('Failed to save map');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewMapFromDialog = async () => {
    if (!newMapName.trim() || !user) return;
    
    const mapId = newMapName.toLowerCase().replace(/\s+/g, '_');
    
    // Check if map already exists
    if (availableMaps.some(map => map.mapId === mapId)) {
      setError('A map with this name already exists');
      return;
    }
    
    setSelectedMapId(mapId);
    setShowNewMapDialog(false);
    setNewMapName('');
    await loadOrCreateMap(mapId);
  };

  const importFromJson = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/maps/import-json/${selectedMapId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Imported map from JSON:', result.message);
        // Reload the map and refresh list
        await loadOrCreateMap(selectedMapId);
        await loadAvailableMaps();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Failed to import: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error importing map:', error);
      setError('Failed to import map from JSON');
    } finally {
      setIsLoading(false);
    }
  };

  const exportMap = () => {
    if (!currentMap) return;
    
    const dataStr = JSON.stringify(currentMap, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentMap.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateMapProperty = (property: keyof CityMap, value: any) => {
    if (!currentMap) return;
    
    setCurrentMap({
      ...currentMap,
      [property]: value,
      updatedAt: new Date().toISOString()
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to use the map editor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !currentMap) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading map editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Map Editor</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span>Tool: <span className="text-white">{editorState.currentTool.name}</span></span>
              {mapSource && (
                <span>
                  Source: <Badge variant={mapSource === 'database' ? 'default' : 'outline'} className="text-xs h-5">
                    {mapSource === 'database' ? '💾' : 
                     mapSource === 'json' ? '📄' : '🆕'}
                  </Badge>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={saveMap} 
              size="sm"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : null}
              Save
            </Button>
            
            <Button 
              onClick={exportMap} 
              variant="outline" 
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Export
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tools Sidebar */}
        <div className="w-60 bg-gray-800 border-r border-gray-700 flex flex-col overflow-y-auto">
          {/* Drawing Tools */}
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-xs font-semibold mb-2 text-gray-300 uppercase tracking-wide">Tools</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {EDITOR_TOOLS.map((tool) => (
                <Button
                  key={tool.id}
                  variant={editorState.currentTool.id === tool.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-10 flex flex-col items-center gap-0.5 p-1 text-xs"
                  onClick={() => setEditorState(prev => ({ ...prev, currentTool: tool }))}
                >
                  <div
                    className="w-2.5 h-2.5 rounded border border-white/20"
                    style={{ backgroundColor: tool.color }}
                  />
                  <span className="text-[10px] leading-none">{tool.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Map Properties */}
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-xs font-semibold mb-2 text-gray-300 uppercase tracking-wide">Map Selection</h3>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-400">Current Map</Label>
                <Select value={selectedMapId} onValueChange={setSelectedMapId}>
                  <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white text-xs h-7">
                    <SelectValue placeholder="Select a map" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaps.map((map) => (
                      <SelectItem key={map.mapId} value={map.mapId}>
                        {map.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="map-name" className="text-xs text-gray-400">Name</Label>
                <Input
                  id="map-name"
                  value={currentMap?.name || ''}
                  onChange={(e) => updateMapProperty('name', e.target.value)}
                  className="mt-1 bg-gray-700 border-gray-600 text-white text-xs h-7"
                  placeholder="Map name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <Label className="text-xs text-gray-400">W</Label>
                  <Input
                    type="number"
                    value={currentMap?.size.width || 20}
                    onChange={(e) => updateMapProperty('size', { 
                      ...currentMap?.size, 
                      width: parseInt(e.target.value) || 20 
                    })}
                    min="5"
                    max="25"
                    className="mt-1 bg-gray-700 border-gray-600 text-white text-xs h-7"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400">H</Label>
                  <Input
                    type="number"
                    value={currentMap?.size.height || 20}
                    onChange={(e) => updateMapProperty('size', { 
                      ...currentMap?.size, 
                      height: parseInt(e.target.value) || 20 
                    })}
                    min="5"
                    max="25"
                    className="mt-1 bg-gray-700 border-gray-600 text-white text-xs h-7"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* View Options */}
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-xs font-semibold mb-2 text-gray-300 uppercase tracking-wide">View</h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-grid" className="text-xs text-gray-400">Grid</Label>
                <Switch
                  id="show-grid"
                  checked={editorState.showGrid}
                  onCheckedChange={(checked) => 
                    setEditorState(prev => ({ ...prev, showGrid: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 flex-1">
            <h3 className="text-xs font-semibold mb-2 text-gray-300 uppercase tracking-wide">Actions</h3>
            <div className="space-y-1.5">
              <Button 
                onClick={() => {
                  setNewMapName('');
                  setShowNewMapDialog(true);
                }} 
                variant="outline" 
                size="sm"
                className="w-full justify-start text-xs h-7"
              >
                New Map
              </Button>
              
              <Button 
                onClick={importFromJson} 
                variant="outline" 
                size="sm"
                className="w-full justify-start text-xs h-7"
                disabled={isLoading}
              >
                Import JSON
              </Button>
              
              <Button 
                onClick={() => loadOrCreateMap(selectedMapId)} 
                variant="outline" 
                size="sm"
                className="w-full justify-start text-xs h-7"
              >
                Reload
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-900 p-2">
          {isLoading && !currentMap ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : currentMap ? (
            <div className="flex items-center justify-center min-h-full p-4">
              <div 
                className="inline-block border border-gray-600 bg-gray-800 shadow-lg rounded"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${currentMap.size.width}, 14px)`,
                  gridTemplateRows: `repeat(${currentMap.size.height}, 14px)`,
                  gap: editorState.showGrid ? '1px' : '0',
                  maxWidth: 'calc(100vw - 280px)',
                  maxHeight: 'calc(100vh - 120px)'
                }}
              >
                {Array.from({ length: currentMap.size.height }, (_, z) =>
                  Array.from({ length: currentMap.size.width }, (_, x) => {
                    const cell = currentMap.cells[x]?.[z];
                    const isStartPosition = 
                      currentMap.startPosition.x === x && currentMap.startPosition.z === z;
                    
                    return (
                      <div
                        key={`${x}-${z}`}
                        className={`
                          w-3.5 h-3.5 cursor-pointer transition-all duration-75 hover:brightness-110 active:scale-95
                          ${editorState.showGrid ? 'border border-gray-600' : ''}
                          ${isStartPosition ? 'ring-1 ring-blue-400' : ''}
                        `}
                        style={{
                          backgroundColor: cell?.color || '#f3f4f6',
                        }}
                        onClick={() => handleCellClick(x, z)}
                        title={`${x}, ${z}${isStartPosition ? ' (Start)' : ''} - ${cell?.type || 'floor'}`}
                      />
                    );
                  })
                ).flat()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-sm">No map loaded</p>
            </div>
          )}
        </div>
      </div>
      
      {/* New Map Dialog */}
      {showNewMapDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 w-80 mx-4">
            <h3 className="text-lg font-semibold mb-3">Create New Map</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-map-name" className="text-xs text-gray-400">Map Name</Label>
                <Input
                  id="new-map-name"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  className="mt-1 bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter map name"
                  onKeyPress={(e) => e.key === 'Enter' && createNewMapFromDialog()}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={() => setShowNewMapDialog(false)}
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createNewMapFromDialog}
                  size="sm"
                  disabled={!newMapName.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
