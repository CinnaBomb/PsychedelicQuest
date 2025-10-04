# Supabase Setup Guide for PsychedelicQuest

This guide will help you set up Supabase as your database backend for saving and loading games.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: PsychedelicQuest (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is perfect to start
4. Click **"Create new project"** and wait for it to initialize (1-2 minutes)

## Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, click on **"Project Settings"** (gear icon in sidebar)
2. Navigate to **"Database"** in the left menu
3. Scroll down to **"Connection string"** section
4. Select **"Connection pooling"** tab (important for better performance!)
5. Choose **"Transaction"** mode
6. Copy the connection string that looks like:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with the database password you created in Step 1

## Step 3: Configure Environment Variables

1. In your project root, create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your connection string:
   ```
   DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:YOUR-PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   SESSION_SECRET=generate-a-random-string-here
   ```

3. Generate a random session secret (run this command):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 4: Push Database Schema to Supabase

Run this command to create all the necessary tables:

```bash
npm run db:push
```

This will create the following tables in your Supabase database:
- **users**: User accounts
- **game_saves**: Game save metadata (name, level, position, timestamps)
- **characters**: Party characters for each save
- **inventory**: Items for each save
- **dungeon_state**: Dungeon layout and explored rooms

## Step 5: Verify Database Setup

1. Go back to your Supabase dashboard
2. Click on **"Table Editor"** in the left sidebar
3. You should see all 5 tables: `users`, `game_saves`, `characters`, `inventory`, `dungeon_state`

## Step 6: Run Your Application

```bash
npm run dev
```

Your app should now be running at `http://localhost:5000` with full database support!

## API Endpoints

Your game now has these API endpoints for saving/loading:

### Get all saves for a user
```
GET /api/saves/:userId
```

### Get a specific save with all data
```
GET /api/saves/:userId/:saveId
```

### Create a new save
```
POST /api/saves
Body: {
  userId: number,
  saveName: string,
  playerPosition: {x: number, z: number},
  characters: Character[],
  inventory: Item[],
  dungeonData: DungeonCell[][],
  exploredRooms: Position[]
}
```

### Update an existing save
```
PUT /api/saves/:userId/:saveId
Body: {
  playerPosition?: {x: number, z: number},
  dungeonLevel?: number,
  characters?: Character[],
  inventory?: Item[],
  dungeonData?: DungeonCell[][],
  exploredRooms?: Position[]
}
```

### Delete a save
```
DELETE /api/saves/:userId/:saveId
```

## Troubleshooting

### Database connection errors
- Make sure your `DATABASE_URL` in `.env` is correct
- Check that you replaced `[YOUR-PASSWORD]` with your actual password
- Verify your Supabase project is active (not paused)

### Tables not created
- Run `npm run db:push` again
- Check the console for any error messages
- Verify your database password is correct

### Performance tips
- Always use the **Connection Pooling** URL (port 6543), not the direct connection
- Use **Transaction** mode for better performance with multiple queries
- The free tier gives you 500MB storage and 2GB data transfer - plenty for a game!

## Next Steps

To integrate saving/loading into your game UI, you'll need to:

1. Create a "Save Game" button that calls `POST /api/saves`
2. Create a "Load Game" menu that lists saves from `GET /api/saves/:userId`
3. Add auto-save functionality (e.g., every 5 minutes or on dungeon level change)
4. Add a "Delete Save" option in your load menu

Would you like me to create React components for the save/load UI?
