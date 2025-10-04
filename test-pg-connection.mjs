import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  const client = await pool.connect();
  console.log('✅ PostgreSQL connection successful!');
  
  const result = await client.query('SELECT 1 as test');
  console.log('Query result:', result.rows);
  
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('✅ Tables found:', tables.rows.map(t => t.table_name));
  
  client.release();
  await pool.end();
} catch (error) {
  console.error('❌ PostgreSQL connection failed:', error.message);
  process.exit(1);
}
