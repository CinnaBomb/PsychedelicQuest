import { CityMap, CityCell } from '@/types/city';
import { DungeonCell } from '@/types/game';

// Available maps registry - using only custom_starting_city for development
const AVAILABLE_MAPS = [
  'custom_starting_city',
  // Add more map IDs here as you create them in the editor
] as const;

export type MapId = typeof AVAILABLE_MAPS[number];

class MapLoader {
  private loadedMaps = new Map<string, CityMap>();

  /**
   * Load a map from the database (prioritized) or public/maps directory as fallback
   */
  async loadMap(mapId: string): Promise<CityMap | null> {
    try {
      // Check cache first
      if (this.loadedMaps.has(mapId)) {
        console.log(`✅ Loaded map "${mapId}" from cache`);
        return this.loadedMaps.get(mapId)!;
      }

      // Try to load from database first (prioritized)
      try {
        const response = await fetch(`/api/maps/${mapId}`);
        if (response.ok) {
          const mapRecord = await response.json();
          const cityMap = mapRecord.mapData as CityMap;
          this.loadedMaps.set(mapId, cityMap);
          console.log(`✅ Loaded map "${mapId}" from database`);
          return cityMap;
        } else if (response.status === 404) {
          console.log(`⚠️ Map "${mapId}" not found in database`);
        } else {
          console.warn(`⚠️ Database error for "${mapId}": ${response.status}`);
        }
      } catch (dbError) {
        console.warn(`⚠️ Database connection failed for "${mapId}":`, dbError);
      }

      // Only fallback to JSON if database fails and it's a development scenario
      if (mapId === 'custom_starting_city') {
        try {
          const response = await fetch(`/maps/${mapId}.json`);
          if (response.ok) {
            const cityMap = await response.json() as CityMap;
            this.loadedMaps.set(mapId, cityMap);
            console.log(`⚠️ Loaded map "${mapId}" from JSON fallback - consider importing to database`);
            return cityMap;
          }
        } catch (jsonError) {
          console.log(`❌ JSON file also failed for "${mapId}":`, jsonError);
        }
      }

      console.log(`❌ Map "${mapId}" not found in database or file system`);
      return null;
    } catch (error) {
      console.error(`❌ Error loading map "${mapId}":`, error);
      return null;
    }
  }

  /**
   * Convert CityMap to DungeonCell format for the game engine
   */
  /**
   * Convert a CityMap to the game's DungeonCell format
   */
  convertToGameFormat(cityMap: CityMap): DungeonCell[][] {
    const gameGrid: DungeonCell[][] = [];
    
    for (let x = 0; x < cityMap.size.width; x++) {
      gameGrid[x] = [];
      for (let z = 0; z < cityMap.size.height; z++) {
        const cityCell = cityMap.cells[x] && cityMap.cells[x][z];
        
        if (!cityCell) {
          // Empty cell - create a wall
          gameGrid[x][z] = {
            x,
            z,
            type: 'wall',
          };
        } else {
          // Convert city cell to dungeon cell
          let cellType: 'floor' | 'wall' | 'door' | 'stairs' = 'floor';
          
          // Map CityCell types to DungeonCell types
          switch (cityCell.type) {
            case 'wall':
              cellType = 'wall';
              break;
            case 'door':
              cellType = 'door';
              break;
            case 'exit':
              cellType = 'stairs'; // Exits become stairs in dungeon format
              break;
            default:
              cellType = cityCell.walkable ? 'floor' : 'wall';
          }
          
          gameGrid[x][z] = {
            x,
            z,
            type: cellType,
            hasEnemy: cityCell.type === 'enemy',
            hasItem: cityCell.type === 'chest' || cityCell.itemId !== undefined,
          };
        }
      }
    }
    
    return gameGrid;
  }

  /**
   * Save a map created in the editor to the database
   */
  async saveMapToStorage(cityMap: CityMap, isPublic: boolean = false): Promise<boolean> {
    try {
      // Save to database
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId: cityMap.id,
          name: cityMap.name,
          description: cityMap.description,
          mapData: cityMap,
          isPublic,
          version: cityMap.version
        })
      });

      if (response.ok) {
        // Update cache
        this.loadedMaps.set(cityMap.id, cityMap);
        console.log(`✅ Saved map "${cityMap.name}" to database`);
        
        // Also save to localStorage as backup
        const mapJson = JSON.stringify(cityMap, null, 2);
        localStorage.setItem(`saved_map_${cityMap.id}`, mapJson);
        
        return true;
      } else {
        const error = await response.json();
        console.error(`❌ Failed to save map to database:`, error);
        
        // Fallback to localStorage only
        const mapJson = JSON.stringify(cityMap, null, 2);
        localStorage.setItem(`saved_map_${cityMap.id}`, mapJson);
        this.loadedMaps.set(cityMap.id, cityMap);
        console.log(`⚠️ Saved map "${cityMap.name}" to localStorage as fallback`);
        
        return false;
      }
    } catch (error) {
      console.error(`❌ Error saving map:`, error);
      
      // Fallback to localStorage only
      try {
        const mapJson = JSON.stringify(cityMap, null, 2);
        localStorage.setItem(`saved_map_${cityMap.id}`, mapJson);
        this.loadedMaps.set(cityMap.id, cityMap);
        console.log(`⚠️ Saved map "${cityMap.name}" to localStorage as fallback`);
        return false;
      } catch (localError) {
        console.error('Failed to save to localStorage as well:', localError);
        return false;
      }
    }
  }

  /**
   * Load a map from database or localStorage
   */
  async loadMapFromStorage(mapId: string): Promise<CityMap | null> {
    try {
      // Try database first
      try {
        const response = await fetch(`/api/maps/${mapId}`);
        if (response.ok) {
          const mapRecord = await response.json();
          const cityMap = mapRecord.mapData as CityMap;
          this.loadedMaps.set(mapId, cityMap);
          console.log(`✅ Loaded map "${mapId}" from database`);
          return cityMap;
        }
      } catch (dbError) {
        console.log(`⚠️ Database load failed for "${mapId}", trying localStorage...`);
      }
      
      // Fallback to localStorage
      const mapJson = localStorage.getItem(`saved_map_${mapId}`);
      if (!mapJson) {
        return null;
      }
      
      const mapData: CityMap = JSON.parse(mapJson);
      const validatedMap = this.validateAndFixMap(mapData);
      
      this.loadedMaps.set(mapId, validatedMap);
      console.log(`✅ Loaded map "${mapId}" from localStorage`);
      return validatedMap;
    } catch (error) {
      console.error(`❌ Failed to load map from storage: ${mapId}`, error);
      return null;
    }
  }

  /**
   * Get all available maps from database and localStorage
   */
  async getAvailableMaps(): Promise<{ id: string; name: string; description?: string; isPublic: boolean; source: 'database' | 'localStorage' }[]> {
    const maps: { id: string; name: string; description?: string; isPublic: boolean; source: 'database' | 'localStorage' }[] = [];
    
    // Get maps from database
    try {
      const response = await fetch('/api/maps');
      if (response.ok) {
        const dbMaps = await response.json();
        dbMaps.forEach((map: any) => {
          maps.push({
            id: map.mapId,
            name: map.name,
            description: map.description,
            isPublic: map.isPublic,
            source: 'database'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching maps from database:', error);
    }
    
    // Get maps from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('saved_map_')) {
        const mapId = key.replace('saved_map_', '');
        // Skip if already loaded from database
        if (!maps.find(m => m.id === mapId)) {
          try {
            const mapJson = localStorage.getItem(key);
            if (mapJson) {
              const mapData = JSON.parse(mapJson) as CityMap;
              maps.push({
                id: mapId,
                name: mapData.name || mapId,
                description: mapData.description,
                isPublic: false,
                source: 'localStorage'
              });
            }
          } catch (error) {
            console.error(`Error parsing localStorage map ${mapId}:`, error);
          }
        }
      }
    }
    
    return maps;
  }

  /**
   * Get list of saved maps from localStorage
   */
  getSavedMapIds(): string[] {
    const savedMaps: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('saved_map_')) {
        savedMaps.push(key.replace('saved_map_', ''));
      }
    }
    return savedMaps;
  }

  /**
   * Validate and fix map data structure
   */
  private validateAndFixMap(mapData: CityMap): CityMap {
    // Ensure cells array is properly structured
    if (!mapData.cells || !Array.isArray(mapData.cells)) {
      mapData.cells = this.createEmptyMapCells(mapData.size.width, mapData.size.height);
    }

    // Ensure cells array has correct dimensions
    if (mapData.cells.length !== mapData.size.width) {
      mapData.cells = this.createEmptyMapCells(mapData.size.width, mapData.size.height);
    }

    // Fill in missing cells
    for (let x = 0; x < mapData.size.width; x++) {
      if (!mapData.cells[x] || !Array.isArray(mapData.cells[x])) {
        mapData.cells[x] = [];
      }
      
      for (let z = 0; z < mapData.size.height; z++) {
        if (!mapData.cells[x][z]) {
          mapData.cells[x][z] = {
            x,
            z,
            type: 'floor',
            walkable: true,
            color: '#f3f4f6'
          };
        }
      }
    }

    // Ensure other required fields
    if (!mapData.connections) mapData.connections = [];
    if (!mapData.npcs) mapData.npcs = [];
    if (!mapData.shops) mapData.shops = [];
    
    return mapData;
  }

  /**
   * Create empty map cells
   */
  private createEmptyMapCells(width: number, height: number): CityCell[][] {
    const cells: CityCell[][] = [];
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
    return cells;
  }
}

export const mapLoader = new MapLoader();