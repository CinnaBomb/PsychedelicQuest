import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and, desc } from "drizzle-orm";
import {
  users,
  gameSaves,
  characters,
  inventory,
  dungeonState,
  type User,
  type InsertUser,
  type GameSave,
  type InsertGameSave,
  type CharacterRecord,
  type InsertCharacter,
  type Inventory,
  type InsertInventory,
  type DungeonState,
  type InsertDungeonState,
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game Save methods
  createGameSave(userId: number, saveName: string, playerPosition: any): Promise<GameSave>;
  getGameSaves(userId: number): Promise<GameSave[]>;
  getGameSave(saveId: number, userId: number): Promise<GameSave | undefined>;
  updateGameSave(saveId: number, userId: number, data: Partial<InsertGameSave>): Promise<GameSave | undefined>;
  deleteGameSave(saveId: number, userId: number): Promise<boolean>;
  
  // Character methods
  saveCharacters(saveId: number, charactersData: InsertCharacter[]): Promise<CharacterRecord[]>;
  getCharacters(saveId: number): Promise<CharacterRecord[]>;
  
  // Inventory methods
  saveInventory(saveId: number, items: any[]): Promise<Inventory>;
  getInventory(saveId: number): Promise<Inventory | undefined>;
  
  // Dungeon State methods
  saveDungeonState(saveId: number, dungeonData: any, exploredRooms?: any): Promise<DungeonState>;
  getDungeonState(saveId: number): Promise<DungeonState | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Game Save methods
  async createGameSave(
    userId: number,
    saveName: string,
    playerPosition: any,
  ): Promise<GameSave> {
    const [gameSave] = await db
      .insert(gameSaves)
      .values({
        userId,
        saveName,
        playerPosition,
        dungeonLevel: 1,
      })
      .returning();
    return gameSave;
  }

  async getGameSaves(userId: number): Promise<GameSave[]> {
    return await db
      .select()
      .from(gameSaves)
      .where(eq(gameSaves.userId, userId))
      .orderBy(desc(gameSaves.updatedAt));
  }

  async getGameSave(saveId: number, userId: number): Promise<GameSave | undefined> {
    const [gameSave] = await db
      .select()
      .from(gameSaves)
      .where(and(eq(gameSaves.id, saveId), eq(gameSaves.userId, userId)));
    return gameSave;
  }

  async updateGameSave(
    saveId: number,
    userId: number,
    data: Partial<InsertGameSave>,
  ): Promise<GameSave | undefined> {
    const [updated] = await db
      .update(gameSaves)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(gameSaves.id, saveId), eq(gameSaves.userId, userId)))
      .returning();
    return updated;
  }

  async deleteGameSave(saveId: number, userId: number): Promise<boolean> {
    // Delete related data first (characters, inventory, dungeon state)
    await db.delete(characters).where(eq(characters.saveId, saveId));
    await db.delete(inventory).where(eq(inventory.saveId, saveId));
    await db.delete(dungeonState).where(eq(dungeonState.saveId, saveId));
    
    // Delete the save
    const result = await db
      .delete(gameSaves)
      .where(and(eq(gameSaves.id, saveId), eq(gameSaves.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Character methods
  async saveCharacters(
    saveId: number,
    charactersData: InsertCharacter[],
  ): Promise<CharacterRecord[]> {
    // Delete existing characters for this save
    await db.delete(characters).where(eq(characters.saveId, saveId));
    
    // Insert new characters
    if (charactersData.length === 0) return [];
    return await db.insert(characters).values(charactersData).returning();
  }

  async getCharacters(saveId: number): Promise<CharacterRecord[]> {
    return await db
      .select()
      .from(characters)
      .where(eq(characters.saveId, saveId));
  }

  // Inventory methods
  async saveInventory(saveId: number, items: any[]): Promise<Inventory> {
    // Delete existing inventory
    await db.delete(inventory).where(eq(inventory.saveId, saveId));
    
    // Insert new inventory
    const [inv] = await db
      .insert(inventory)
      .values({ saveId, items })
      .returning();
    return inv;
  }

  async getInventory(saveId: number): Promise<Inventory | undefined> {
    const [inv] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.saveId, saveId));
    return inv;
  }

  // Dungeon State methods
  async saveDungeonState(
    saveId: number,
    dungeonData: any,
    exploredRooms?: any,
  ): Promise<DungeonState> {
    // Delete existing dungeon state
    await db.delete(dungeonState).where(eq(dungeonState.saveId, saveId));
    
    // Insert new dungeon state
    const [state] = await db
      .insert(dungeonState)
      .values({ saveId, dungeonData, exploredRooms })
      .returning();
    return state;
  }

  async getDungeonState(saveId: number): Promise<DungeonState | undefined> {
    const [state] = await db
      .select()
      .from(dungeonState)
      .where(eq(dungeonState.saveId, saveId));
    return state;
  }
}

export const storage = new DatabaseStorage();
