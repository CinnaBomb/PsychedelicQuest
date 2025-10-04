import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

describe('Database Connection Tests', () => {
  let db: ReturnType<typeof drizzle>;
  let pool: pg.Pool;
  let client: pg.PoolClient;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    client = await pool.connect();
    db = drizzle(pool);
  });

  afterAll(async () => {
    if (client) client.release();
    if (pool) await pool.end();
  });

  test('DATABASE_URL is configured', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.DATABASE_URL).toContain('postgres');
  });

  test('Can connect to database', async () => {
    const result = await client.query('SELECT 1 as test');
    expect(result).toBeDefined();
    expect(result.rows[0].test).toBe(1);
  });

  test('Users table exists', async () => {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    expect(result.rows[0].exists).toBe(true);
  });

  test('Game_saves table exists', async () => {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'game_saves'
      );
    `);
    expect(result.rows[0].exists).toBe(true);
  });

  test('Characters table exists', async () => {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'characters'
      );
    `);
    expect(result.rows[0].exists).toBe(true);
  });

  test('Inventory table exists', async () => {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'inventory'
      );
    `);
    expect(result.rows[0].exists).toBe(true);
  });

  test('Dungeon_state table exists', async () => {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dungeon_state'
      );
    `);
    expect(result.rows[0].exists).toBe(true);
  });

  test('Can query users table', async () => {
    const result = await db.select().from(users).limit(1);
    expect(Array.isArray(result)).toBe(true);
  });

  test('Users table has correct columns', async () => {
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    const columns = result.rows.map((r: any) => r.column_name);
    expect(columns).toContain('id');
    expect(columns).toContain('username');
    expect(columns).toContain('password');
  });

  test('Game_saves table has foreign key to users', async () => {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'game_saves'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'users'
      );
    `);
    expect(result.rows[0].exists).toBe(true);
  });
});
