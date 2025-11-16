#!/usr/bin/env node
import "dotenv/config";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

async function seedDefaultMaps() {
  console.log('🌱 Starting map migration to database...');
  
  const mapsDir = path.join(__dirname, 'client', 'public', 'maps');
  
  try {
    // Check if maps directory exists
    await fs.access(mapsDir);
    
    // Get all JSON files in maps directory
    const files = await fs.readdir(mapsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`📁 Found ${jsonFiles.length} map files:`, jsonFiles);
    
    for (const file of jsonFiles) {
      const mapId = file.replace('.json', '');
      const filePath = path.join(mapsDir, file);
      
      try {
        // Read the map file
        const mapData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        
        // Create a system user (id: 0) for default maps
        const systemUserId = 1; // We'll use user ID 1 as system user
        
        // Check if map already exists
        const existing = await sql`
          SELECT id FROM city_maps WHERE map_id = ${mapId}
        `;
        
        if (existing.length > 0) {
          console.log(`⚠️  Map "${mapId}" already exists in database, skipping...`);
          continue;
        }
        
        // Insert the map into database
        const result = await sql`
          INSERT INTO city_maps (user_id, map_id, name, description, map_data, is_public, version)
          VALUES (
            ${systemUserId},
            ${mapId},
            ${mapData.name || mapId},
            ${mapData.description || `Default map: ${mapId}`},
            ${JSON.stringify(mapData)},
            true,
            ${mapData.version || '1.0.0'}
          )
          RETURNING id, name
        `;
        
        console.log(`✅ Migrated "${mapData.name || mapId}" (${mapId}) to database`);
        
      } catch (error) {
        console.error(`❌ Error migrating map ${mapId}:`, error);
      }
    }
    
    console.log('🎉 Map migration completed!');
    
    // Verify migration
    const totalMaps = await sql`SELECT COUNT(*) as count FROM city_maps WHERE is_public = true`;
    console.log(`📊 Total public maps in database: ${totalMaps[0].count}`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('⚠️  Maps directory not found, creating default maps programmatically...');
      await createDefaultMaps();
    } else {
      console.error('❌ Error during migration:', error);
    }
  }
}

async function createDefaultMaps() {
  console.log('🏗️  Creating custom starting city map...');
  
  const systemUserId = 1;
  
  // Create the custom starting city map
  const customStartingCity = {
    id: "custom_starting_city",
    name: "Custom Starting City",
    description: "A customizable starting city for new adventurers - perfect for development and testing",
    size: { width: 20, height: 20 },
    startPosition: { x: 10, z: 10 },
    cells: [],
    connections: [],
    npcs: [],
    shops: [],
    theme: "city",
    dangerLevel: 1,
    discoveredByDefault: true,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Create grid cells for a simple open area with walls around the border
  for (let x = 0; x < customStartingCity.size.width; x++) {
    customStartingCity.cells[x] = [];
    for (let z = 0; z < customStartingCity.size.height; z++) {
      let cellType = 'floor';
      let walkable = true;
      let color = '#f3f4f6'; // Light gray floor
      
      // Create walls around the border
      if (x === 0 || x === customStartingCity.size.width - 1 || z === 0 || z === customStartingCity.size.height - 1) {
        cellType = 'wall';
        walkable = false;
        color = '#374151'; // Dark gray walls
      }
      
      // Add some decorative elements
      if (cellType === 'floor') {
        // Add some scattered decorations
        if ((x === 5 && z === 5) || (x === 15 && z === 5) || (x === 5 && z === 15) || (x === 15 && z === 15)) {
          cellType = 'decoration';
          walkable = false;
          color = '#10b981'; // Green decorations
        }
        
        // Add a few NPCs
        if ((x === 8 && z === 12) || (x === 12 && z === 8)) {
          cellType = 'npc';
          walkable = false;
          color = '#3b82f6'; // Blue NPC spots
        }
      }
      
      customStartingCity.cells[x][z] = {
        x,
        z,
        type: cellType,
        walkable,
        color
      };
    }
  }
  
  // Insert only the custom starting city map
  const defaultMaps = [customStartingCity];
  
  for (const map of defaultMaps) {
    try {
      // Check if map already exists
      const existing = await sql`
        SELECT id FROM city_maps WHERE map_id = ${map.id}
      `;
      
      if (existing.length > 0) {
        console.log(`⚠️  Map "${map.id}" already exists, skipping...`);
        continue;
      }
      
      await sql`
        INSERT INTO city_maps (user_id, map_id, name, description, map_data, is_public, version)
        VALUES (
          ${systemUserId},
          ${map.id},
          ${map.name},
          ${map.description},
          ${JSON.stringify(map)},
          true,
          ${map.version}
        )
      `;
      
      console.log(`✅ Created custom starting city map: ${map.name}`);
      
    } catch (error) {
      console.error(`❌ Error creating map ${map.id}:`, error);
    }
  }
}

// Create a system user if it doesn't exist
async function ensureSystemUser() {
  try {
    const existing = await sql`
      SELECT id FROM users WHERE id = 1
    `;
    
    if (existing.length === 0) {
      // Create system user
      await sql`
        INSERT INTO users (id, username, password)
        VALUES (1, 'system', 'system_password_not_used')
        ON CONFLICT (id) DO NOTHING
      `;
      console.log('✅ Created system user for default maps');
    }
  } catch (error) {
    console.error('Error ensuring system user:', error);
  }
}

// Main execution
async function main() {
  try {
    await ensureSystemUser();
    await seedDefaultMaps();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();