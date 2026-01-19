# Repository Guidelines

## Project Structure & Module Organization
- `index.html` loads the Three.js app (module entry at `src/main.js`).
- `src/` holds the ES module code:
  - `src/core/` engine systems (audio, collision, spells).
  - `src/rooms/` room builders and `roomConfig.js`.
  - `src/utils/` shared helpers (textures, text panels, geometry, animations).
- `server.js` is the local dev server.
- `style.css` styles the HUD and overlays.
- Assets live at the repo root and in `Images/`, `textures/`, and `models/` (audio files are also in the root).

## Build, Test, and Development Commands
- `npm start` starts the local dev server at `http://localhost:5173` (or `PORT`).

## Coding Style & Naming Conventions
- JavaScript ES modules with semicolons and 2-space indentation.
- Prefer `camelCase` for variables/functions and `PascalCase` for classes/constructors.
- Keep room builders named `createRoomN()` and register them in `src/rooms/roomConfig.js`.
- Follow existing patterns in `src/main.js` for scene setup and system initialization.

## Testing Guidelines
- No automated test framework is configured yet.
- Validate changes by running `npm start` and manually walking through rooms, audio triggers, and UI overlays.

## Commit & Pull Request Guidelines
- Commit history uses short, imperative summaries (e.g., “Fix Room 2 lighting”).
- Keep commits focused on a single change.
- PRs should include a brief description, any relevant screenshots for visual changes, and a note about manual testing (rooms visited, audio checked).

## Assets & Configuration Tips
- Required audio files are listed in `AUDIO_FILES_NEEDED.md`.
- Three.js is loaded via CDN (see `index.html`), so no install step is required beyond Node.js for `server.js`.
