import "dotenv/config";
import { beforeAll } from '@jest/globals';

// Test setup
beforeAll(() => {
  // Ensure we have a database connection
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set for tests');
  }
});
