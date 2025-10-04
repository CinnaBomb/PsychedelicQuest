import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game Save Tables
export const gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  saveName: text("save_name").notNull(),
  dungeonLevel: integer("dungeon_level").notNull().default(1),
  playerPosition: jsonb("player_position").notNull(), // {x: number, z: number}
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  saveId: integer("save_id").references(() => gameSaves.id).notNull(),
  characterId: text("character_id").notNull(), // UUID from game
  name: text("name").notNull(),
  class: text("class").notNull(), // 'warrior' | 'mage'
  level: integer("level").notNull().default(1),
  health: integer("health").notNull(),
  maxHealth: integer("max_health").notNull(),
  mana: integer("mana").notNull(),
  maxMana: integer("max_mana").notNull(),
  experience: integer("experience").notNull().default(0),
  experienceToNext: integer("experience_to_next").notNull(),
  stats: jsonb("stats").notNull(), // {strength, intelligence, defense, speed}
  equipment: jsonb("equipment"), // {weapon?: Item, armor?: Item}
  isActive: boolean("is_active").default(false), // Currently selected character
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  saveId: integer("save_id").references(() => gameSaves.id).notNull(),
  items: jsonb("items").notNull(), // Array of Item objects
});

export const dungeonState = pgTable("dungeon_state", {
  id: serial("id").primaryKey(),
  saveId: integer("save_id").references(() => gameSaves.id).notNull(),
  dungeonData: jsonb("dungeon_data").notNull(), // DungeonCell[][]
  exploredRooms: jsonb("explored_rooms"), // Array of explored positions
});

// Insert schemas
export const insertGameSaveSchema = createInsertSchema(gameSaves).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
});

export const insertDungeonStateSchema = createInsertSchema(dungeonState).omit({
  id: true,
});

// Types
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
export type GameSave = typeof gameSaves.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type CharacterRecord = typeof characters.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertDungeonState = z.infer<typeof insertDungeonStateSchema>;
export type DungeonState = typeof dungeonState.$inferSelect;
