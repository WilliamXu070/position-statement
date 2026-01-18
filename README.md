# Position Statement | Story Rooms

An interactive 3D first-person walkthrough experience built with Three.js. Navigate through story rooms to explore a position statement, with each room containing a section of the statement displayed on the walls.

## Features

- First-person 3D navigation using WASD keys and mouse look
- 8 themed rooms navigated with ↑/↓ arrow keys
- Each room has a unique environment matching the position statement theme
- Audio playback when entering each room
- Interactive lightning spell system
- Text panels displaying position statement content

## Getting Started

### Prerequisites

- Node.js (v14 or higher)

### Installation

No dependencies need to be installed - Three.js is loaded via CDN.

### Running the Project

Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:5173` (or the port specified by the `PORT` environment variable).

### Controls

- **WASD** - Move
- **Mouse** - Look around
- **↑ Arrow** - Navigate to next room
- **↓ Arrow** - Navigate to previous room
- **1** - Cast lightning spell

## Project Structure

- `index.html` - Main HTML file with import map for Three.js
- `main.js` - Core Three.js application logic and game mechanics
- `server.js` - Simple HTTP server for local development
- `style.css` - Styling for UI overlays and HUD
- `package.json` - Project configuration

## Rooms

The application features 8 themed rooms:

1. **Room 1**: Storm Cloud - Defiance, ego, human ambition
2. **Room 2**: Sky Temple - Structure from chaos
3. **Room 3**: Sky Garden - Values, humanity, impact
4. **Room 4**: Floating Workshop - Iteration, failure, persistence
5. **Room 5**: Microscope Platform - Academic experience
6. **Room 6**: Mirror Labyrinth - Personal challenge
7. **Room 7**: Fog Bridge - Reflection, growth
8. **Room 8**: Infinite Sky - Conclusion, imagination

## Assets

### Required Audio Files

See `AUDIO_FILES_NEEDED.md` for the list of required MP3 audio files. Each room requires a corresponding audio file that plays automatically when entered.

### Existing Assets

- `beer.jpg` - Beer texture (legacy)
- `fireball.png` - Fireball sprite texture (legacy)
- `police.png` - Police sprite texture (legacy)

## License

Private project for academic purposes.
