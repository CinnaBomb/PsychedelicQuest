# Undercroft RPG - Architectural Overview

## Overview

This is a 3D dungeon crawler RPG built with React, Three.js, Express, and PostgreSQL. The application features a classic dungeon exploration experience with party-based combat, character creation, inventory management, and procedural dungeon generation. The architecture follows a full-stack approach with a React frontend using Three.js for 3D rendering and an Express backend with PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **3D Rendering**: Three.js via @react-three/fiber and @react-three/drei
- **UI Components**: Custom component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a dark theme design system
- **State Management**: Zustand for client-side state management
- **Build Tool**: Vite with custom configuration for 3D assets

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Development**: Hot module replacement via Vite integration

### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared code in a single repository
2. **Type Safety**: Shared TypeScript interfaces between frontend and backend
3. **3D Game Engine**: Three.js for hardware-accelerated 3D graphics
4. **Component-Based UI**: Modular React components with Radix UI foundation
5. **Real-time Audio**: Web Audio API integration for game sounds

## Key Components

### Game Systems
- **Character Creation**: Multi-class character system (Warrior, Mage)
- **Party Management**: Multi-character party with active character switching
- **Combat System**: Turn-based combat with actions, spells, and items
- **Dungeon Generation**: Procedural room and corridor generation
- **Inventory System**: Equipment, consumables, and item rarity system
- **Audio System**: Background music and sound effects with mute controls

### 3D Rendering
- **Player Character**: 3D cube representation with rotation animations
- **Dungeon Environment**: Textured floors, walls, and lighting
- **Enemy Entities**: Animated enemy models with floating animations
- **Camera System**: Third-person follow camera with smooth transitions
- **Shader Support**: GLSL shader integration for advanced effects

### State Management Stores
- **Game State**: Overall game phase and dungeon data
- **Party Management**: Character stats, equipment, and party composition
- **Combat System**: Turn-based combat logic and enemy interactions
- **Inventory**: Item management and equipment handling
- **Audio Controls**: Sound management and mute functionality

## Data Flow

1. **Game Initialization**: User creates characters → Party store populated → Dungeon generated
2. **Movement**: Keyboard input → Movement validation → Player position updated → 3D scene rendered
3. **Combat Flow**: Enemy interaction → Combat state activated → Turn-based actions → Results applied
4. **Inventory Management**: Item collection → Inventory store → Equipment effects applied
5. **Persistence**: Game state → Express API → PostgreSQL via Drizzle ORM

## External Dependencies

### Core Technologies
- **React Three Fiber**: 3D scene management and rendering
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Accessible component primitives
- **Zustand**: Lightweight state management

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Production bundling for server code

### Asset Handling
- **GLSL Loader**: Shader file processing
- **3D Asset Support**: .gltf, .glb model loading
- **Audio Files**: .mp3, .ogg, .wav support
- **Font Loading**: Inter font integration

## Deployment Strategy

### Development Mode
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with live reload
- **Database**: Drizzle migrations with push commands

### Production Build
- **Frontend**: Vite build → static assets in dist/public
- **Backend**: ESBuild bundle → single JavaScript file
- **Database**: PostgreSQL connection via environment variables
- **Deployment**: Node.js server serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Production/development mode switching
- **Build Process**: Parallel frontend and backend compilation

The architecture emphasizes type safety, modern development practices, and performant 3D rendering while maintaining a clean separation between game logic, rendering, and data persistence layers.