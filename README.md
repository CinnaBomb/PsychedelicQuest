# 🎮 PsychedelicQuest

A first-person 3D dungeon crawler game built with React Three Fiber, featuring immersive psychedelic visuals, real-time combat, and a persistent save system.

![Game Banner](generated-icon.png)

## ✨ Features

- 🕹️ **First-Person 3D Gameplay** - Navigate through procedurally generated dungeons
- ⚔️ **Real-Time Combat** - Battle enemies with an engaging combat system
- 🎨 **Psychedelic Visuals** - Stunning visual effects and atmosphere
- 💾 **Save/Load System** - Persistent game progress with Supabase backend
- 🔐 **User Authentication** - Secure login and registration system
- 📱 **Responsive Controls** - WASD + Arrow keys support, with touch controls for mobile
- 🎵 **Immersive Audio** - Background music and sound effects

## 🎮 Controls

### Movement
- **W / ↑** - Move Forward
- **S / ↓** - Move Backward
- **A / ←** - Strafe Left
- **D / →** - Strafe Right

### Camera
- **Q** - Turn Left
- **E** - Turn Right

### Actions
- **Space** - Interact/Attack

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Supabase recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CinnaBomb/PsychedelicQuest.git
   cd PsychedelicQuest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your database**
   
   The easiest way is to use Supabase (free tier available):
   
   ```bash
   ./setup-supabase.sh
   ```
   
   Or follow the [detailed setup guide](QUICKSTART.md)

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   ```

5. **Push database schema**
   ```bash
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5000`

## 🏗️ Tech Stack

### Frontend
- **React** - UI framework
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Visual effects
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend
- **Express** - Web server
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database access
- **Supabase** - Backend as a service (optional but recommended)

### Build Tools
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety
- **esbuild** - Fast bundler

## 📁 Project Structure

```
PsychedelicQuest/
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── game/   # Game-specific components
│   │   │   └── ui/     # UI components
│   │   ├── lib/        # Utilities and logic
│   │   │   ├── gameLogic/  # Game mechanics
│   │   │   └── stores/     # State management
│   │   └── types/      # TypeScript types
│   └── public/         # Static assets
├── server/             # Backend code
│   ├── index.ts       # Express server
│   └── routes.ts      # API routes
├── shared/            # Shared types and schemas
│   └── schema.ts     # Database schema
└── tests/            # Test files
```

## 🎯 Game Features

### Character System
- Character creation with customizable attributes
- Level progression system
- Inventory management
- Equipment system

### Dungeon System
- Procedurally generated dungeons
- Multiple room types and layouts
- Interactive objects and items
- Enemy encounters

### Combat System
- Turn-based combat mechanics
- Multiple enemy types
- Health and damage system
- Victory and defeat conditions

### Save System
- Automatic and manual saves
- Multiple save slots
- Cloud storage via Supabase
- Save/Load game progress

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test:watch
```

Generate coverage report:
```bash
npm test:coverage
```

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Authentication System](AUTH_SYSTEM.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Supabase Setup](SUPABASE_SETUP.md)
- [Implementation Details](IMPLEMENTATION_COMPLETE.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)

## 📧 Contact

Project Link: [https://github.com/CinnaBomb/PsychedelicQuest](https://github.com/CinnaBomb/PsychedelicQuest)

---

Made with ❤️ and ✨ psychedelic vibes
