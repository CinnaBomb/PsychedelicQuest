# Save System Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        GAME CLIENT                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Game Components                        │    │
│  │  - CharacterCreation.tsx                           │    │
│  │  - GameScene.tsx                                   │    │
│  │  - Inventory.tsx                                   │    │
│  │  - Dungeon.tsx                                     │    │
│  └───────────────────┬────────────────────────────────┘    │
│                      │                                      │
│  ┌───────────────────▼────────────────────────────────┐    │
│  │           Game State Stores (Zustand)              │    │
│  │  - useGameState (position, dungeon, level)         │    │
│  │  - useParty (characters)                           │    │
│  │  - useInventory (items)                            │    │
│  │  - useSaveGame (save operations) ◄─── NEW!        │    │
│  └───────────────────┬────────────────────────────────┘    │
│                      │                                      │
│  ┌───────────────────▼────────────────────────────────┐    │
│  │          SaveLoadMenu Component                     │    │
│  │  - Create save                                      │    │
│  │  - Load save                                        │    │
│  │  - Update save                                      │    │
│  │  - Delete save                                      │    │
│  └───────────────────┬────────────────────────────────┘    │
└────────────────────┬─┴──────────────────────────────────────┘
                     │
                     │ HTTP API Calls
                     │ (fetch)
                     │
┌────────────────────▼───────────────────────────────────────┐
│                    EXPRESS SERVER                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              API Routes (routes.ts)                  │  │
│  │  GET    /api/saves/:userId                          │  │
│  │  GET    /api/saves/:userId/:saveId                  │  │
│  │  POST   /api/saves                                  │  │
│  │  PUT    /api/saves/:userId/:saveId                  │  │
│  │  DELETE /api/saves/:userId/:saveId                  │  │
│  └──────────────────┬──────────────────────────────────┘  │
│                     │                                      │
│  ┌──────────────────▼──────────────────────────────────┐  │
│  │           Storage Layer (storage.ts)                │  │
│  │  - createGameSave()                                 │  │
│  │  - getGameSaves()                                   │  │
│  │  - updateGameSave()                                 │  │
│  │  - deleteGameSave()                                 │  │
│  │  - saveCharacters()                                 │  │
│  │  - saveInventory()                                  │  │
│  │  - saveDungeonState()                               │  │
│  └──────────────────┬──────────────────────────────────┘  │
└────────────────────┬┴──────────────────────────────────────┘
                     │
                     │ Drizzle ORM
                     │
┌────────────────────▼───────────────────────────────────────┐
│                   SUPABASE DATABASE                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                     Tables                           │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │    users     │  │  game_saves  │                │  │
│  │  │─────────────│  │──────────────│                │  │
│  │  │ id          │  │ id           │                │  │
│  │  │ username    │  │ userId ──────┼──┐             │  │
│  │  │ password    │  │ saveName     │  │             │  │
│  │  └──────────────┘  │ dungeonLevel │  │             │  │
│  │                    │ playerPos    │  │             │  │
│  │                    │ createdAt    │  │             │  │
│  │                    │ updatedAt    │  │             │  │
│  │                    └──────────────┘  │             │  │
│  │                           ▲          │             │  │
│  │  ┌────────────────────────┼──────────┼─────────┐  │  │
│  │  │      characters        │          │         │  │  │
│  │  │────────────────────────┘          │         │  │  │
│  │  │ id                                │         │  │  │
│  │  │ saveId ◄──────────────────────────┘         │  │  │
│  │  │ characterId                                 │  │  │
│  │  │ name, class, level, health, etc.            │  │  │
│  │  │ stats (JSONB)                               │  │  │
│  │  │ equipment (JSONB)                           │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         inventory                            │  │  │
│  │  │─────────────────────────────────────────────│  │  │
│  │  │ id                                           │  │  │
│  │  │ saveId ◄─────────────────────────────────────┼──┘  │
│  │  │ items (JSONB array)                          │     │
│  │  └─────────────────────────────────────────────┘     │
│  │                                                       │
│  │  ┌─────────────────────────────────────────────┐     │
│  │  │       dungeon_state                          │     │
│  │  │─────────────────────────────────────────────│     │
│  │  │ id                                           │     │
│  │  │ saveId ◄─────────────────────────────────────┼─────┘
│  │  │ dungeonData (JSONB)                          │
│  │  │ exploredRooms (JSONB)                        │
│  │  └─────────────────────────────────────────────┘
│  └─────────────────────────────────────────────────────┘
└────────────────────────────────────────────────────────────┘
```

## Save Game Flow

```
Player clicks "Save Game"
         │
         ▼
┌─────────────────────┐
│ Enter save name     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Collect game state  │
│ - Player position   │
│ - Characters        │
│ - Inventory         │
│ - Dungeon data      │
│ - Current level     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ POST /api/saves     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Create save record  │
│ in game_saves       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Save characters     │
│ to characters table │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Save items to       │
│ inventory table     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Save dungeon to     │
│ dungeon_state table │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Return save ID      │
│ ✅ Save complete!   │
└─────────────────────┘
```

## Load Game Flow

```
Player selects save to load
           │
           ▼
┌──────────────────────────┐
│ GET /api/saves/:userId   │
│         /:saveId         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Fetch save metadata      │
│ from game_saves          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Fetch characters         │
│ from characters table    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Fetch inventory          │
│ from inventory table     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Fetch dungeon state      │
│ from dungeon_state table │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Return complete data     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Update Zustand stores    │
│ - useGameState           │
│ - useParty               │
│ - useInventory           │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Set game phase to        │
│ 'exploration'            │
│ ✅ Load complete!        │
└──────────────────────────┘
```

## File Structure

```
PsychedelicQuest/
├── client/
│   └── src/
│       ├── components/
│       │   └── game/
│       │       └── SaveLoadMenu.tsx ◄── UI Component
│       ├── lib/
│       │   └── stores/
│       │       ├── useSaveGame.tsx ◄── Save operations
│       │       ├── useGameState.tsx
│       │       ├── useParty.tsx
│       │       └── useInventory.tsx
│       └── examples/
│           └── SaveIntegrationExample.tsx ◄── Integration guide
├── server/
│   ├── routes.ts ◄── API endpoints
│   └── storage.ts ◄── Database operations
├── shared/
│   └── schema.ts ◄── Database schema (5 tables)
├── .env ◄── Your Supabase credentials (create this)
├── .env.example ◄── Template
├── setup-supabase.sh ◄── Automated setup
├── SUPABASE_SETUP.md ◄── Detailed guide
├── README_SAVES.md ◄── Quick reference
└── SETUP_COMPLETE.md ◄── This summary
```

## Tech Stack

- **Frontend**: React + TypeScript + Zustand
- **Backend**: Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **UI**: Radix UI + Tailwind CSS

## Key Technologies

- **Zustand** - State management (lightweight, no boilerplate)
- **Drizzle ORM** - Type-safe database queries
- **Neon Serverless** - PostgreSQL driver for Supabase
- **JSONB** - Store complex game data efficiently
- **Connection Pooling** - Better performance for serverless

## Why This Design?

1. **Normalized Schema**: Separate tables for characters, inventory, dungeon
   - ✅ Easier to query individual parts
   - ✅ More efficient updates
   - ✅ Better data integrity

2. **JSONB for Complex Data**: Store stats, equipment as JSON
   - ✅ Flexible schema
   - ✅ No need for many join tables
   - ✅ Can query within JSON if needed

3. **Zustand Stores**: Separate concerns
   - ✅ Each store manages its own domain
   - ✅ Easy to test and maintain
   - ✅ Minimal re-renders

4. **RESTful API**: Standard HTTP endpoints
   - ✅ Easy to understand
   - ✅ Can use with any frontend
   - ✅ Cacheable

5. **Supabase**: Modern PostgreSQL hosting
   - ✅ Free tier available
   - ✅ Automatic backups
   - ✅ Built-in dashboard
   - ✅ Real-time capabilities (optional)
