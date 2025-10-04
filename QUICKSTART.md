# 🚀 Quick Start Guide

## You're Almost Ready!

Your authentication and save system is now fully set up. Here's what you need to do to get it running:

## Step 1: Set Up Supabase Database

You need a PostgreSQL database. The easiest way is Supabase (free tier):

### Option A: Use the Setup Script
```bash
./setup-supabase.sh
```

### Option B: Manual Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Name it "PsychedelicQuest"
   - Set a strong database password (SAVE THIS!)
   - Choose a region
   - Wait 1-2 minutes for setup

2. **Get Connection String**
   - In your project, go to **Project Settings** (gear icon)
   - Click **Database** in left menu
   - Scroll to **Connection string**
   - Select **Connection pooling** tab
   - Choose **Transaction** mode
   - Copy the URL (looks like):
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
     ```

3. **Add to .env File**
   - Open `/workspaces/PsychedelicQuest/.env`
   - Replace the DATABASE_URL line with your actual connection string
   - Make sure to replace `[YOUR-PASSWORD]` with your database password!

4. **Push Database Schema**
   ```bash
   npm run db:push
   ```
   This creates all the tables (users, game_saves, characters, inventory, dungeon_state)

## Step 2: Start the App

```bash
npm run dev
```

The app will start on **http://localhost:5000**

## Step 3: Test It Out

1. **Register** - Create a new account
2. **Start Game** - Click "New Game"
3. **Create Characters** - Build your party
4. **Play** - Explore the dungeon
5. **Save** - Press ESC, click "Save Game"
6. **Load** - Go back to menu, click "Load Game"

## What You Have Now

### ✅ Authentication System
- User registration with password hashing
- Login/logout functionality
- Session-based authentication
- Automatic session persistence (7 days)

### ✅ Multi-User Save System
- Each user has their own save files
- Unlimited saves per user
- Save complete game state:
  - Player position
  - All characters with stats/equipment
  - Inventory items
  - Dungeon layout
  - Current level
- Load any save to restore game

### ✅ Secure API
- Protected save endpoints
- Users can only access their own data
- Password hashing with bcrypt
- Session security with HttpOnly cookies

## Your .env File Should Look Like This:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres.xxxxx:YOUR-ACTUAL-PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true

# Session Secret (already set)
SESSION_SECRET=abf8500c262fc2a20e56e4e22ed35d91dbf64f968d4c1aec650636a95bdfdd8c
```

## Troubleshooting

### "DATABASE_URL must be set" error
- Make sure you've added your Supabase connection string to `.env`
- Check that the file is named `.env` (not `.env.txt`)
- Restart the dev server after changing `.env`

### "Connection failed" error
- Verify your database password is correct
- Make sure you're using the **Connection Pooling** URL (port 6543)
- Check that your Supabase project is active

### Tables not created
- Run `npm run db:push`
- Check the console for errors
- Verify DATABASE_URL is correct

### Can't login after registering
- Check browser console for errors
- Make sure SESSION_SECRET is set in .env
- Try clearing browser cookies

## Documentation Files

- **SUPABASE_SETUP.md** - Detailed Supabase setup
- **AUTH_SYSTEM.md** - Authentication system docs
- **README_SAVES.md** - Save system reference
- **ARCHITECTURE.md** - System architecture diagrams
- **SETUP_COMPLETE.md** - Feature summary

## Next Steps After Setup

1. **Test Everything** - Register, play, save, load
2. **Customize UI** - Modify the auth screen colors/text
3. **Add Features** - Auto-save, quick-save (F5), etc.
4. **Deploy** - When ready, deploy to a hosting service

## Need Help?

1. Check the documentation files listed above
2. Look at the Supabase dashboard to see your data
3. Check browser console for frontend errors
4. Check terminal for server errors

---

**Once you've set up your database, you're ready to go!** 🎮

Run: `npm run dev` and enjoy your game with full authentication and save system!
