import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

// Extend Express Session type
declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: any, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================
  
  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      // Check if username already exists
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Check password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });
  
  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    res.json({
      id: req.session.userId,
      username: req.session.username,
    });
  });

  // ============================================
  // GAME SAVE ROUTES (Protected)
  // ============================================
  
  // Get all saves for current user
  app.get("/api/saves", requireAuth, async (req, res) => {
    try {
      const saves = await storage.getGameSaves(req.session.userId!);
      res.json(saves);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific save with all data
  app.get("/api/saves/:saveId", requireAuth, async (req, res) => {
    try {
      const saveId = parseInt(req.params.saveId);
      
      const gameSave = await storage.getGameSave(saveId, req.session.userId!);
      if (!gameSave) {
        return res.status(404).json({ error: "Save not found" });
      }
      
      const characters = await storage.getCharacters(saveId);
      const inventory = await storage.getInventory(saveId);
      const dungeonState = await storage.getDungeonState(saveId);
      
      res.json({
        save: gameSave,
        characters,
        inventory: inventory?.items || [],
        dungeonState: dungeonState?.dungeonData || null,
        exploredRooms: dungeonState?.exploredRooms || [],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new save
  app.post("/api/saves", requireAuth, async (req, res) => {
    try {
      const { saveName, playerPosition, characters: chars, inventory: inv, dungeonData, exploredRooms } = req.body;
      
      // Create the save
      const gameSave = await storage.createGameSave(req.session.userId!, saveName, playerPosition);
      
      // Save characters if provided
      if (chars && chars.length > 0) {
        const characterRecords = chars.map((char: any) => ({
          saveId: gameSave.id,
          characterId: char.id,
          name: char.name,
          class: char.class,
          level: char.level,
          health: char.health,
          maxHealth: char.maxHealth,
          mana: char.mana,
          maxMana: char.maxMana,
          experience: char.experience,
          experienceToNext: char.experienceToNext,
          stats: char.stats,
          equipment: char.equipment,
          isActive: char.isActive || false,
        }));
        await storage.saveCharacters(gameSave.id, characterRecords);
      }
      
      // Save inventory if provided
      if (inv) {
        await storage.saveInventory(gameSave.id, inv);
      }
      
      // Save dungeon state if provided
      if (dungeonData) {
        await storage.saveDungeonState(gameSave.id, dungeonData, exploredRooms);
      }
      
      res.json(gameSave);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update an existing save
  app.put("/api/saves/:saveId", requireAuth, async (req, res) => {
    try {
      const saveId = parseInt(req.params.saveId);
      const { playerPosition, dungeonLevel, characters: chars, inventory: inv, dungeonData, exploredRooms } = req.body;
      
      // Update the save metadata
      const updateData: any = {};
      if (playerPosition) updateData.playerPosition = playerPosition;
      if (dungeonLevel) updateData.dungeonLevel = dungeonLevel;
      
      const gameSave = await storage.updateGameSave(saveId, req.session.userId!, updateData);
      if (!gameSave) {
        return res.status(404).json({ error: "Save not found" });
      }
      
      // Update characters if provided
      if (chars && chars.length > 0) {
        const characterRecords = chars.map((char: any) => ({
          saveId: saveId,
          characterId: char.id,
          name: char.name,
          class: char.class,
          level: char.level,
          health: char.health,
          maxHealth: char.maxHealth,
          mana: char.mana,
          maxMana: char.maxMana,
          experience: char.experience,
          experienceToNext: char.experienceToNext,
          stats: char.stats,
          equipment: char.equipment,
          isActive: char.isActive || false,
        }));
        await storage.saveCharacters(saveId, characterRecords);
      }
      
      // Update inventory if provided
      if (inv) {
        await storage.saveInventory(saveId, inv);
      }
      
      // Update dungeon state if provided
      if (dungeonData) {
        await storage.saveDungeonState(saveId, dungeonData, exploredRooms);
      }
      
      res.json(gameSave);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a save
  app.delete("/api/saves/:saveId", requireAuth, async (req, res) => {
    try {
      const saveId = parseInt(req.params.saveId);
      
      const deleted = await storage.deleteGameSave(saveId, req.session.userId!);
      if (!deleted) {
        return res.status(404).json({ error: "Save not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // CITY MAP ROUTES
  // ============================================
  
  // Get all public maps + user's private maps
  app.get("/api/maps", requireAuth, async (req, res) => {
    try {
      const maps = await storage.getCityMaps(req.session.userId!);
      res.json(maps);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific map by ID
  app.get("/api/maps/:mapId", async (req, res) => {
    try {
      const mapId = req.params.mapId;
      const userId = req.session.userId || null;
      
      const map = await storage.getCityMapById(mapId, userId);
      if (!map) {
        return res.status(404).json({ error: "Map not found" });
      }
      
      res.json(map);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save a new map or update existing
  app.post("/api/maps", requireAuth, async (req, res) => {
    try {
      const { mapId, name, description, mapData, isPublic, version } = req.body;
      
      if (!mapId || !name || !mapData) {
        return res.status(400).json({ error: "mapId, name, and mapData are required" });
      }
      
      const mapRecord = await storage.saveCityMap({
        userId: req.session.userId!,
        mapId,
        name,
        description: description || '',
        mapData,
        isPublic: isPublic || false,
        version: version || '1.0.0'
      });
      
      res.json(mapRecord);
    } catch (error: any) {
      if (error.message.includes('unique constraint')) {
        // Map ID already exists, try updating instead
        try {
          const updated = await storage.updateCityMap(req.body.mapId, req.session.userId!, {
            name: req.body.name,
            description: req.body.description,
            mapData: req.body.mapData,
            isPublic: req.body.isPublic,
            version: req.body.version || '1.0.0'
          });
          
          if (!updated) {
            return res.status(404).json({ error: "Map not found or not owned by user" });
          }
          
          res.json(updated);
        } catch (updateError: any) {
          res.status(500).json({ error: updateError.message });
        }
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Delete a map
  app.delete("/api/maps/:mapId", requireAuth, async (req, res) => {
    try {
      const mapId = req.params.mapId;
      
      const deleted = await storage.deleteCityMap(mapId, req.session.userId!);
      if (!deleted) {
        return res.status(404).json({ error: "Map not found or not owned by user" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upload map to public/maps folder
  app.post("/api/maps/upload", async (req, res) => {
    try {
      const { mapData, filename } = req.body;
      
      if (!mapData || !filename) {
        return res.status(400).json({ error: "mapData and filename are required" });
      }

      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure maps directory exists
      const mapsDir = path.join(process.cwd(), 'client', 'public', 'maps');
      try {
        await fs.access(mapsDir);
      } catch {
        await fs.mkdir(mapsDir, { recursive: true });
      }
      
      // Write the map file
      const filePath = path.join(mapsDir, filename);
      await fs.writeFile(filePath, JSON.stringify(mapData, null, 2));
      
      res.json({ 
        success: true, 
        message: `Map uploaded successfully to /client/public/maps/${filename}`,
        filename,
        path: `/maps/${filename}`
      });
    } catch (error: any) {
      console.error('Error uploading map:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Import map from JSON file to database
  app.post("/api/maps/import-json/:mapId", requireAuth, async (req, res) => {
    try {
      const mapId = req.params.mapId;
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Try to read the JSON file
      const mapsDir = path.join(process.cwd(), 'client', 'public', 'maps');
      const filePath = path.join(mapsDir, `${mapId}.json`);
      
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const mapData = JSON.parse(fileContent);
        
        // Import the map into database
        const mapRecord = await storage.saveCityMap({
          userId: req.session.userId!,
          mapId: mapData.id || mapId,
          name: mapData.name || mapId,
          description: mapData.description || `Imported from ${mapId}.json`,
          mapData: mapData,
          isPublic: true,
          version: mapData.version || '1.0.0'
        });
        
        res.json({
          success: true,
          message: `Map "${mapData.name || mapId}" imported successfully`,
          mapRecord
        });
        
      } catch (fileError) {
        res.status(404).json({ error: `Map file ${mapId}.json not found` });
      }
    } catch (error: any) {
      console.error('Error importing map:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
