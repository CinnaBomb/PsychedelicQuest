import { useMemo } from 'react';
import { useGameState } from '@/lib/stores/useGameState';

interface MinimapProps {
  size?: number;
}

export default function Minimap({ size = 120 }: MinimapProps) {
  const { dungeon, playerState, currentMapId } = useGameState();

  const minimapData = useMemo(() => {
    if (!dungeon || dungeon.length === 0) return null;

    const mapWidth = dungeon.length;
    const mapHeight = dungeon[0]?.length || 0;
    
    if (mapWidth === 0 || mapHeight === 0) return null;

    // Calculate cell size based on minimap size
    const cellSize = Math.max(1, Math.floor(size / Math.max(mapWidth, mapHeight)));
    const actualWidth = mapWidth * cellSize;
    const actualHeight = mapHeight * cellSize;

    return {
      mapWidth,
      mapHeight,
      cellSize,
      actualWidth,
      actualHeight
    };
  }, [dungeon, size]);

  const getCellColor = (x: number, z: number) => {
    if (!dungeon[x] || !dungeon[x][z]) return '#1f2937'; // gray-800 for unknown

    const cell = dungeon[x][z];
    
    // Player position - bright red dot
    if (playerState.position.x === x && playerState.position.z === z) {
      return '#ef4444'; // red-500
    }
    
    // Special interactive elements first (higher priority)
    if (cell.hasEnemy) {
      return '#dc2626'; // red-600 - enemies
    }
    
    if (cell.hasItem) {
      return '#fbbf24'; // amber-400 - items/treasures
    }
    
    // Color based on cell type
    switch (cell.type) {
      case 'floor':
        return '#6b7280'; // gray-500 - walkable areas
      case 'wall':
        return '#1f2937'; // gray-800 - walls/obstacles
      case 'door':
        return '#f59e0b'; // amber-500 - doors
      case 'stairs':
        return '#8b5cf6'; // violet-500 - stairs/exits
      default:
        return '#374151'; // gray-700 - unknown
    }
  };

  if (!minimapData) {
    return (
      <div 
        className="bg-black/90 border border-gray-600 rounded p-2 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 text-xs">No Map</span>
      </div>
    );
  }

  const { mapWidth, mapHeight, cellSize, actualWidth, actualHeight } = minimapData;

  return (
    <div className="bg-black/90 border border-gray-600 rounded p-2">
      {/* Map title */}
      <div className="text-center mb-1">
        <div className="text-xs text-purple-400 font-semibold">
          {currentMapId.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </div>
      </div>
      
      {/* Minimap grid */}
      <div 
        className="relative mx-auto border border-gray-500"
        style={{ 
          width: actualWidth, 
          height: actualHeight,
          maxWidth: size - 16,
          maxHeight: size - 32
        }}
      >
        <svg width={actualWidth} height={actualHeight} className="block">
          {/* Render map cells */}
          {Array.from({ length: mapWidth }, (_, x) =>
            Array.from({ length: mapHeight }, (_, z) => (
              <rect
                key={`${x}-${z}`}
                x={x * cellSize}
                y={z * cellSize}
                width={cellSize}
                height={cellSize}
                fill={getCellColor(x, z)}
                stroke={cellSize > 2 ? '#374151' : 'none'}
                strokeWidth={cellSize > 2 ? 0.5 : 0}
              />
            ))
          )}
          
          {/* Player direction indicator */}
          {cellSize >= 3 && (
            <g transform={`translate(${playerState.position.x * cellSize + cellSize/2}, ${playerState.position.z * cellSize + cellSize/2})`}>
              {/* Direction arrow */}
              {playerState.facing === 0 && ( // North
                <polygon points="0,-3 -2,2 2,2" fill="#fbbf24" stroke="#000" strokeWidth="0.5" />
              )}
              {playerState.facing === 1 && ( // East
                <polygon points="3,0 -2,-2 -2,2" fill="#fbbf24" stroke="#000" strokeWidth="0.5" />
              )}
              {playerState.facing === 2 && ( // South
                <polygon points="0,3 -2,-2 2,-2" fill="#fbbf24" stroke="#000" strokeWidth="0.5" />
              )}
              {playerState.facing === 3 && ( // West
                <polygon points="-3,0 2,-2 2,2" fill="#fbbf24" stroke="#000" strokeWidth="0.5" />
              )}
            </g>
          )}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-1 text-center">
        <div className="flex justify-center items-center space-x-1 text-xs flex-wrap">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">You</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-violet-500"></div>
            <span className="text-gray-400">Exit</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-600"></div>
            <span className="text-gray-400">Enemy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-amber-400"></div>
            <span className="text-gray-400">Item</span>
          </div>
        </div>
      </div>
    </div>
  );
}