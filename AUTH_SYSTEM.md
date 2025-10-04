# 🔐 Authentication & Multi-User Save System

## What's New

Your PsychedelicQuest game now has:
- ✅ **User Authentication** - Login/Register system
- ✅ **Secure Sessions** - Session-based authentication  
- ✅ **Password Hashing** - Passwords securely hashed with bcrypt
- ✅ **Multi-User Saves** - Each user has their own save files
- ✅ **Protected API** - Save/load endpoints require authentication

## Features

### 🔑 Authentication
- **Register** - Create a new account with username/password
- **Login** - Access your account  
- **Logout** - End your session
- **Session Persistence** - Stay logged in across page refreshes (7 days)
- **Password Requirements** - Minimum 6 characters

### 💾 Multi-User Saves
- Each user can have unlimited save files
- Saves are automatically associated with the logged-in user
- Other users cannot access your saves
- Load game from any of your saves

## New API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new account | `{username, password}` |
| POST | `/api/auth/login` | Login | `{username, password}` |
| POST | `/api/auth/logout` | Logout | - |
| GET | `/api/auth/me` | Get current user | - |

### Game Saves (Protected - Requires Login)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/saves` | Get all saves for current user |
| GET | `/api/saves/:saveId` | Get specific save |
| POST | `/api/saves` | Create new save |
| PUT | `/api/saves/:saveId` | Update save |
| DELETE | `/api/saves/:saveId` | Delete save |

## New Components

### AuthScreen
Location: `client/src/components/game/AuthScreen.tsx`

Beautiful login/register screen with:
- Tabbed interface (Login/Register)
- Form validation
- Error handling
- Loading states

```tsx
import { AuthScreen } from '@/components/game/AuthScreen';

// Automatically shown when user is not logged in
```

### Updated SaveLoadMenu
Location: `client/src/components/game/SaveLoadMenu.tsx`

Now works with authentication:
- No longer needs `userId` prop
- Automatically uses logged-in user
- Shows user's saves only

```tsx
import { SaveLoadMenu } from '@/components/game/SaveLoadMenu';

<SaveLoadMenu onClose={() => setShowMenu(false)} />
```

## New Hooks

### useAuth
Location: `client/src/lib/stores/useAuth.tsx`

Authentication state management:

```tsx
import { useAuth } from '@/lib/stores/useAuth';

const { 
  user,           // Current user or null
  isLoading,      // Auth loading state
  error,          // Error message
  login,          // Login function
  register,       // Register function  
  logout,         // Logout function
  checkAuth       // Check if user is logged in
} = useAuth();

// Login
const success = await login('username', 'password');

// Register
const success = await register('username', 'password');

// Logout
await logout();

// Check auth on app load
useEffect(() => {
  checkAuth();
}, []);
```

## How It Works

### 1. App Initialization
```
App loads
    ↓
Check if user logged in (checkAuth)
    ↓
Not logged in → Show AuthScreen
    ↓
Logged in → Show game
```

### 2. Login Flow
```
User enters credentials
    ↓
POST /api/auth/login
    ↓
Server checks password (bcrypt)
    ↓
Valid → Create session
    ↓
Return user data
    ↓
Store in useAuth
    ↓
Show main menu
```

### 3. Save Game Flow
```
User clicks "Save Game"
    ↓
Enter save name
    ↓
POST /api/saves
    ↓
Server checks session (requireAuth middleware)
    ↓
Get userId from session
    ↓
Create save in database
    ↓
Associate with userId
    ↓
Return success
```

### 4. Load Game Flow
```
User clicks "Load Game"
    ↓
GET /api/saves (gets current user's saves)
    ↓
Display list of saves
    ↓
User selects save
    ↓
GET /api/saves/:saveId
    ↓
Server verifies save belongs to user
    ↓
Return save data
    ↓
Load into game state
```

## Security Features

### 🔒 Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Salted automatically

### 🛡️ Session Security
- HttpOnly cookies (JavaScript can't access)
- Secure flag in production (HTTPS only)
- 7-day expiration
- Secret key for signing (SESSION_SECRET)

### 🚫 Authorization
- `requireAuth` middleware on save endpoints
- Users can only access their own saves
- Session validates on every request

## Environment Variables

```env
# Session secret for signing cookies
SESSION_SECRET=abf8500c262fc2a20e56e4e22ed35d91dbf64f968d4c1aec650636a95bdfdd8c

# Database URL (Supabase)
DATABASE_URL=postgresql://...
```

## Updated App Flow

```
┌─────────────────────────────────┐
│         App Loads               │
│    Check Authentication         │
└─────────────┬───────────────────┘
              │
        ┌─────▼──────┐
        │ Logged in? │
        └─────┬──────┘
              │
      ┌───────┴───────┐
      │               │
    NO│               │YES
      │               │
┌─────▼──────┐  ┌─────▼──────────┐
│ AuthScreen │  │   Main Menu    │
│            │  │                │
│ - Login    │  │ - New Game     │
│ - Register │  │ - Load Game    │
└─────┬──────┘  │ - Logout       │
      │         └─────┬──────────┘
      │               │
      └───────┬───────┘
              │
      ┌───────▼────────┐
      │  Authenticated │
      │   Game Session │
      └────────────────┘
```

## Usage Examples

### Check if User is Logged In
```tsx
import { useAuth } from '@/lib/stores/useAuth';

function MyComponent() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.username}!</div>;
}
```

### Save Game (Authenticated)
```tsx
import { useSaveGame } from '@/lib/stores/useSaveGame';
import { useAuth } from '@/lib/stores/useAuth';

function SaveButton() {
  const { user } = useAuth();
  const { createSave } = useSaveGame();
  
  const handleSave = async () => {
    if (!user) return;
    
    await createSave(user.id, 'My Save', {
      // ... game data
    });
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### Show Logout Button
```tsx
import { useAuth } from '@/lib/stores/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

function LogoutButton() {
  const { logout, user } = useAuth();
  
  return (
    <div>
      <span>Logged in as: {user?.username}</span>
      <Button onClick={logout}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
```

## Database Schema

### users table
```sql
id SERIAL PRIMARY KEY
username TEXT UNIQUE NOT NULL
password TEXT NOT NULL  -- bcrypt hashed
```

### game_saves table
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users(id)  -- Links to user
save_name TEXT NOT NULL
dungeon_level INTEGER DEFAULT 1
player_position JSONB NOT NULL
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

## Testing

### 1. Register a New User
1. Start the app
2. Click "Register" tab
3. Enter username and password (min 6 chars)
4. Click "Create Account"
5. Should automatically log you in

### 2. Login
1. Click "Login" tab  
2. Enter credentials
3. Click "Login"
4. Should see main menu with username

### 3. Create a Save
1. Start a new game
2. Create characters
3. Play for a bit
4. Press ESC → Save/Load
5. Enter save name
6. Click "Create New Save"

### 4. Load a Save
1. From main menu, click "Load Game"
2. See list of your saves
3. Click "Load" on any save
4. Game should restore

### 5. Logout & Login
1. Click "Logout" from main menu
2. Should see login screen
3. Login again with same credentials
4. Your saves should still be there

## Files Created/Modified

### New Files
- ✅ `client/src/lib/stores/useAuth.tsx` - Authentication hook
- ✅ `client/src/components/game/AuthScreen.tsx` - Login/Register UI
- ✅ `AUTH_SYSTEM.md` - This documentation

### Modified Files
- ✅ `server/index.ts` - Added session middleware
- ✅ `server/routes.ts` - Added auth endpoints + requireAuth
- ✅ `client/src/App.tsx` - Added auth check + AuthScreen
- ✅ `client/src/lib/stores/useSaveGame.tsx` - Updated for auth
- ✅ `client/src/components/game/SaveLoadMenu.tsx` - Updated for auth
- ✅ `.env` - Added SESSION_SECRET

### Dependencies Added
- ✅ `bcryptjs` - Password hashing
- ✅ `express-session` - Session management (already installed)

## Troubleshooting

**Q: "Not authenticated" error when saving**  
A: Make sure you're logged in. Session may have expired (7 days).

**Q: Can't see my saves**  
A: Each user only sees their own saves. Make sure you're logged in with the correct account.

**Q: "Username already exists"**  
A: Try a different username. Usernames must be unique.

**Q: Session lost on refresh**  
A: Check that SESSION_SECRET is set in .env

**Q: Password too short error**  
A: Passwords must be at least 6 characters

## Next Steps

### Recommended Enhancements
1. **Email Verification** - Verify email addresses
2. **Password Reset** - "Forgot password" functionality
3. **OAuth** - Login with Google/Discord/etc.
4. **User Profiles** - Avatar, bio, stats
5. **Save Sharing** - Share saves with friends
6. **Leaderboards** - Global/friend leaderboards
7. **Two-Factor Auth** - Extra security layer

### Current Limitations
- No email verification
- No password reset
- Sessions stored in memory (lost on server restart)
  - For production, use Redis or database session store

## Production Checklist

Before deploying:
- [ ] Use strong SESSION_SECRET (32+ random chars)
- [ ] Enable HTTPS (secure cookies)
- [ ] Use persistent session store (Redis/database)
- [ ] Add rate limiting on auth endpoints
- [ ] Add password strength requirements
- [ ] Add CAPTCHA to prevent bots
- [ ] Set up error logging
- [ ] Add password reset flow
- [ ] Consider OAuth providers

---

**🎉 You're all set!** Your game now has full authentication and multi-user support!
