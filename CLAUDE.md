# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive 3D first-person walkthrough experience built with Three.js for presenting a position statement through 6 themed story rooms. This is an academic project that combines game-like navigation with narrative content displayed on in-world text panels.

## Running the Application

Start the development server:
```bash
npm start
```

The application runs at `http://localhost:5173` (configurable via `PORT` environment variable).

## Architecture

### Core Files

- **index.html**: Entry point with Three.js import map (CDN-loaded from unpkg.com v0.161.0)
- **src/main.js**: Main entry point that initializes scene, controls, physics, and room lifecycle
- **server.js**: Simple Node.js HTTP server with MIME type handling
- **style.css**: UI overlays, HUD, modals, and subtitle styling

### Modular Structure

The codebase is organized into three main directories under `src/`:

#### `src/core/` - Core Game Systems
- **audio.js**: Audio system with room audio management, boss sting playback, and pause/resume controls
- **collision.js**: Collision detection system with Box3-based collision boxes for interactive objects
- **spells.js**: Spell casting system (wand creation, lightning beam effects, raycasting for spell hits)
- **subtitles.js**: Subtitle system with word-per-second timing and room transcript management

#### `src/utils/` - Shared Utilities
- **textPanel.js**: Canvas-based text panel generation (title + body paragraphs on 1024x640 canvas)
- **textures.js**: Texture loading and caching system
- **geometry.js**: Shared geometric primitives and helper functions
- **animations.js**: Reusable animation patterns (particle systems, floating objects, etc.)

#### `src/rooms/` - Room Definitions
- **roomConfig.js**: Array of room configurations (id, label, audioFile, theme)
- **room1.js** through **room6.js**: Individual room builder functions that return THREE.Group() with:
  - Floor and environmental geometry
  - Text panels with position statement content
  - Themed decorative elements (particles, shapes, lights)
  - Collision boxes for interactive objects

#### `src/constants.js`
Physics and game constants:
- `EYE_HEIGHT`: 1.6
- `GRAVITY`: -30.0
- `JUMP_VELOCITY`: 8.0
- `GROUND_HEIGHT`: 0

### Room System

Each room builder follows a consistent pattern:
1. Create a THREE.Group() container
2. Build floor and environmental geometry
3. Generate text panels from position statement content arrays
4. Position panels in 3D space around player spawn point
5. Add themed decorative elements
6. Register collision boxes for interactive objects
7. Return the group for scene addition

Room themes: thinking, assumptions, principles, simplicity, iteration, growth

### Main Game Loop (src/main.js)

The main file orchestrates:
1. **Scene Setup**: Camera, renderer, PointerLockControls with custom pitch/roll hierarchy
2. **System Initialization**: Audio, textures, text panels, subtitles
3. **Room Management**: `teleportToRoom()` handles room transitions, audio playback, position reset
4. **Input Handling**:
   - WASD: Movement with velocity-based physics
   - Mouse: First-person camera look
   - Space: Jump (with gravity simulation)
   - Arrow Up/Down: Navigate between rooms
   - Number keys: Cast spells
   - H: Return to room center
   - C: Toggle subtitles
   - E: Interact with objects
5. **Physics Loop**: Velocity damping, gravity, ground collision, collision detection
6. **Animation Loop**: Updates spell effects, collision checks, subtitle timing

### Audio System

- Audio files are M4A format (not MP3): `room1.m4a` through `room6.m4a`
- Boss sting plays on room entry with configurable duration and fade-out
- `playRoomAudio()` manages transitions between rooms
- Subtitle system syncs with audio playback using word-per-second timing
- All transcripts stored in `src/core/subtitles.js` as `ROOM_TRANSCRIPTS`

### Controls

- **WASD**: Movement
- **Mouse**: Look around (pointer lock)
- **Space**: Jump
- **Arrow Up/Down**: Navigate rooms
- **Number keys (1)**: Cast lightning spell
- **H**: Return to room center
- **C**: Toggle subtitles
- **E**: Interact with objects in view

### Text Panel System

Text panels use Canvas API to render rich text onto CanvasTexture applied to PlaneGeometry:
- `createTextPanel({ title, body })` in `src/utils/textPanel.js`
- Dynamic text wrapping with word breaking
- Georgia font at various sizes for title/body
- High-resolution canvas (1024x640) for crisp text
- DoubleSide material for visibility from both sides

### Collision System

The collision system (`src/core/collision.js`) provides:
- `addCollisionBox(object, offset, size)`: Register collision boxes for objects
- `checkCollision(position, radius)`: Check if position intersects any collision box
- `clearCollisions()`: Clear all registered collision boxes
- Auto-updating collision boxes for dynamic objects

### Interactive Features

- **Room-specific overlays**: Plankton microscope (Room 3), First Principles interface (Room 3)
- **Boss intro system**: Boss title card with sting audio on room entry
- **Jail/death system**: Triggered by collision with specific objects, respawn with restart button
- **Subtitle toggle**: C key toggles real-time subtitles synced with audio

## Modifying Content

### Adding/Editing Position Statement Text

Text content is defined in room builder functions as arrays:
1. Locate the room file (e.g., `src/rooms/room3.js`)
2. Find `createTextPanel({ title: "...", body: [...] })` calls
3. Edit title string or body array (each element is a paragraph)
4. Update corresponding transcript in `src/core/subtitles.js` ROOM_TRANSCRIPTS

### Adding New Rooms

1. Add config to `src/rooms/roomConfig.js` array
2. Create `src/rooms/roomN.js` with `createRoomN()` function following existing pattern
3. Import and call in `src/main.js` room initialization section
4. Add corresponding `roomN.m4a` audio file to root directory
5. Add transcript to `src/core/subtitles.js` ROOM_TRANSCRIPTS

### Adjusting Physics

Movement and physics constants in `src/constants.js`. Velocity calculations in main.js animation loop:
- Velocity damping: `velocity.x *= 0.9` and `velocity.z *= 0.9`
- Movement speed: Direction vector × delta time
- Jump detection: `isOnGround` flag based on `GROUND_HEIGHT`

### Adding Interactive Objects

1. Create object geometry in room builder
2. Register collision box: `addCollisionBox(object, offset, size)`
3. Add interaction handler in main.js input system (E key handler)
4. Define behavior in collision callback

## Development Notes

- Three.js version: 0.161.0 (CDN-loaded, no local dependencies)
- No build system or transpilation - vanilla ES modules
- All JavaScript uses ES6 imports/exports
- Audio files are M4A format, not MP3
- No package dependencies beyond Node.js for dev server
- All game logic is client-side JavaScript
