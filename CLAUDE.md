# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive 3D first-person walkthrough experience built with Three.js for presenting a position statement through 8 themed story rooms. This is an academic project that combines game-like navigation with narrative content displayed on in-world text panels.

## Running the Application

Start the development server:
```bash
npm start
```

The application runs at `http://localhost:5173` (configurable via `PORT` environment variable).

## Architecture

### Core Components

- **index.html**: Entry point with Three.js import map (CDN-loaded from unpkg.com)
- **main.js**: ~1700 lines containing all game logic, room generation, and rendering
- **server.js**: Simple Node.js HTTP server with MIME type handling
- **style.css**: UI overlays, HUD, and modal styling

### main.js Structure

The application follows a monolithic architecture with all Three.js logic in a single file:

1. **Scene Setup** (lines 1-100): Camera, renderer, controls (PointerLockControls), audio system
2. **State Management** (lines 101-122): Room tracking, spell system, audio buffers
3. **Room Configuration** (lines 124-182): 8 room definitions with audio file mappings
4. **Utility Functions** (lines 202-364):
   - `createTextPanel()`: Generates canvas-based text panels from title/body content
   - `drawWrappedText()`: Text wrapping for panels
   - `createWand()`: Player's wand mesh
   - `createLightningBeam()`: Lightning spell visual effects
5. **Room Builders** (lines 365-1370): Individual `createRoomN()` functions that:
   - Build room geometry (floors, walls, decorative objects)
   - Create and position text panels with position statement content
   - Add themed lighting and visual elements
   - Use shared helper patterns (particle systems, geometric shapes)
6. **Game Systems** (lines 1380-1716):
   - `teleportToRoom()`: Room transition logic with audio playback
   - Input handling (WASD movement, arrow keys for room navigation, number keys for spells)
   - Physics system (gravity, jumping, ground collision)
   - Spell casting system with raycasting and visual effects
   - Animation loop with velocity-based movement

### Room Design Pattern

Each room builder function (`createRoom1()` through `createRoom8()`) follows a similar pattern:
1. Create a THREE.Group() container
2. Build floor and environmental geometry
3. Generate text panels from position statement content arrays
4. Position panels in 3D space around the player spawn point
5. Add themed decorative elements (particles, shapes, lights)
6. Return the group for scene addition

Room themes: defiance, structure, humanity, iteration, reality, humility, growth, imagination

### Audio System

- Audio files load on startup via THREE.AudioLoader
- `playRoomAudio()` manages audio transitions between rooms
- Required MP3 files: `room1.mp3` through `room8.mp3` (see AUDIO_FILES_NEEDED.md)
- Audio stops when switching rooms and plays the new room's audio

### Controls

- WASD: Movement with velocity-based physics
- Mouse: First-person camera look
- Space: Jump (with gravity simulation)
- Arrow Up/Down: Navigate between rooms
- Number keys (1, etc.): Cast spells (lightning)
- H: Return to room center

### Physics Constants

- `EYE_HEIGHT`: 1.6 (camera Y position)
- `GRAVITY`: -30.0
- `JUMP_VELOCITY`: 8.0
- `GROUND_HEIGHT`: 0

## Key Implementation Details

### Text Panel Generation

Text panels use Canvas API to render rich text (title + body paragraphs) onto a CanvasTexture applied to PlaneGeometry. The `createTextPanel()` function handles:
- Dynamic text wrapping with word breaking
- Georgia font for consistency
- High-resolution canvas (1024x640) for crisp text
- DoubleSide material for visibility from both sides

### Pointer Lock Controls

The app uses Three.js PointerLockControls for FPS-style camera control. The pitch/roll hierarchy is modified to support camera effects:
- Controls object contains pitch control
- Custom rollGroup added for camera roll effects
- Overlay shows/hides based on pointer lock state

### Room Transition System

`teleportToRoom()` handles:
1. Hiding all room groups except target
2. Resetting player position to (0, EYE_HEIGHT, 0)
3. Updating room label in HUD
4. Playing corresponding audio
5. Managing navigation prompts for first/last rooms

### Asset Notes

Legacy assets (`beer.jpg`, `fireball.png`, `police.png`, `police-siren-sound-effect-240674.mp3`) appear to be from earlier iterations and may not be actively used.

## Modifying Content

### Adding/Editing Position Statement Text

Text content is hardcoded in the `createRoomN()` functions as arrays passed to `createTextPanel()`. To modify:
1. Locate the appropriate room function (e.g., `createRoom3()` for Room 3)
2. Find the panel creation calls with `createTextPanel({ title: "...", body: [...] })`
3. Edit the title string or body array (each array element is a paragraph)

### Adding New Rooms

1. Add configuration to `ROOM_CONFIGS` array with id, label, audioFile, theme
2. Create `createRoomN()` function following existing pattern
3. Call the function in the room initialization section
4. Add corresponding `roomN.mp3` audio file to root directory

### Adjusting Physics

Movement speed and physics are controlled by constants and velocity calculations in the animation loop. Key variables:
- Velocity damping: `velocity.x *= 0.9` and `velocity.z *= 0.9`
- Movement speed: Controlled by direction vector and delta time multiplication
- Jump detection: `isOnGround` flag based on `GROUND_HEIGHT` comparison

## Development Notes

- Three.js version: 0.161.0 (CDN-loaded, no local dependencies)
- No build system or transpilation - vanilla ES modules
- No package dependencies beyond Node.js for the dev server
- All game logic is client-side JavaScript
