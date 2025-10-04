# 🎮 Game Save System - Quick Reference

## What We Built

A complete save/load system for PsychedelicQuest using Supabase (PostgreSQL database). Players can now save their progress and load it later!

## Database Schema

### Tables Created
1. **users** - Player accounts
2. **game_saves** - Save file metadata (name, level, position, timestamps)
3. **characters** - Party characters for each save
4. **inventory** - Items for each save  
5. **dungeon_state** - Dungeon layout and explored areas

## Setup Steps

### Quick Setup (Automated)
```bash
./setup-supabase.sh
```

### Manual Setup
1. **Create Supabase Project** at [supabase.com](https://supabase.com)
2. **Get Connection String**: Project Settings > Database > Connection Pooling (Transaction mode)
3. **Create .env file**:
   ```bash
   cp .env.example .env
   # Edit .env and add your DATABASE_URL and SESSION_SECRET
   ```
4. **Push Schema**:
   ```bash
   npm run db:push
   ```
5. **Run App**:
   ```bash
   npm run dev
   ```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## API Endpoints

All endpoints are prefixed with `/api/saves`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/saves/:userId` | Get all saves for a user |
| GET | `/api/saves/:userId/:saveId` | Get specific save with all data |
| POST | `/api/saves` | Create new save |
| PUT | `/api/saves/:userId/:saveId` | Update existing save |
| DELETE | `/api/saves/:userId/:saveId` | Delete save |

## React Integration

### Hook: `useSaveGame`

Located at: `client/src/lib/stores/useSaveGame.tsx`

```typescript
import { useSaveGame } from '@/lib/stores/useSaveGame';

// In your component
const { createSave, loadSave, saves, getSaves } = useSaveGame();

// Create a save
await createSave(userId, 'My Save', {
  playerPosition: { x: 5, z: 5 },
  characters: partyCharacters,
  inventory: items,
  dungeonData: dungeon,
  dungeonLevel: 1
});

// Load a save
const data = await loadSave(userId, saveId);
```

### Component: `SaveLoadMenu`

Located at: `client/src/components/game/SaveLoadMenu.tsx`

```tsx
import { SaveLoadMenu } from '@/components/game/SaveLoadMenu';

// In your game UI
<SaveLoadMenu userId={1} onClose={() => setShowSaveMenu(false)} />
```

## Features

✅ **Create Saves** - Name your saves and create multiple save files  
✅ **Load Saves** - Restore complete game state from any save  
✅ **Update Saves** - Overwrite existing saves with current progress  
✅ **Delete Saves** - Remove unwanted saves  
✅ **Auto-timestamps** - Tracks creation and last update time  
✅ **Complete State** - Saves characters, inventory, position, dungeon, and level  

## Integration with Your Game

To add save/load to your game UI:

### 1. Add to Game Menu
```tsx
// In your game menu component
import { useState } from 'react';
import { SaveLoadMenu } from '@/components/game/SaveLoadMenu';

function GameMenu() {
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  return (
    <>
      <button onClick={() => setShowSaveMenu(true)}>
        Save / Load Game
      </button>
      
      {showSaveMenu && (
        <SaveLoadMenu 
          userId={1} // Get from your auth system
          onClose={() => setShowSaveMenu(false)} 
        />
      )}
    </>
  );
}
```

### 2. Add Quick Save Hotkey
```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'F5') { // Quick save
      const { createSave } = useSaveGame.getState();
      const { playerPosition, characters } = // ... get from stores
      
      createSave(userId, `Quick Save ${new Date().toLocaleString()}`, {
        playerPosition,
        characters,
        // ... rest of game state
      });
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### 3. Auto-Save System
```tsx
// Auto-save every 5 minutes
useEffect(() => {
  const autoSave = setInterval(() => {
    const { currentSaveId, updateSave } = useSaveGame.getState();
    if (currentSaveId) {
      updateSave(userId, currentSaveId, {
        // ... current game state
      });
    }
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(autoSave);
}, []);
```

## Files Created/Modified

### New Files
- `SUPABASE_SETUP.md` - Detailed setup guide
- `README_SAVES.md` - This file
- `.env.example` - Environment template
- `setup-supabase.sh` - Automated setup script
- `client/src/lib/stores/useSaveGame.tsx` - Save management hook
- `client/src/components/game/SaveLoadMenu.tsx` - Save/Load UI

### Modified Files
- `shared/schema.ts` - Added game save tables
- `server/storage.ts` - Added database methods
- `server/routes.ts` - Added API endpoints
- `.gitignore` - Added .env to ignore list

## Troubleshooting

**Q: Database connection fails**  
A: Check your DATABASE_URL in .env - make sure you're using the Connection Pooling URL (port 6543) and your password is correct

**Q: Tables not created**  
A: Run `npm run db:push` - check console for errors

**Q: Can't save game**  
A: Make sure you have a valid userId (you may need to implement user authentication first)

**Q: Save menu doesn't appear**  
A: Check browser console for errors - make sure all imports are correct

## Next Steps

1. **Add User Authentication** - Currently using hardcoded userId
2. **Add Save Slots UI** - Limit to 3-5 save slots per user
3. **Add Save Screenshots** - Capture and store dungeon preview
4. **Cloud Save Indicator** - Show cloud icon when save completes
5. **Conflict Resolution** - Handle saves from multiple devices

## Need Help?

- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup
- View Supabase dashboard at [app.supabase.com](https://app.supabase.com)
- Check the Table Editor to see your data
- Use SQL Editor to run custom queries

---

Built with ❤️ using React, TypeScript, Supabase, and Drizzle ORM
