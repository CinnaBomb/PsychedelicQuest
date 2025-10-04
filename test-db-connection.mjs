import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

try {
  const result = await sql`SELECT 1 as test`;
  console.log('✅ Database connection successful!');
  console.log('Result:', result);
  
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('✅ Tables found:', tables.map(t => t.table_name));
  
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}
