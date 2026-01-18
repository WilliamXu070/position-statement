# Texture Download Guide

This project uses a mix of downloaded textures (for realism) and procedural textures (for effects). Below are the textures you can optionally download.

## ✅ Current State

**Room 1 works NOW without any textures!** All rooms use procedural textures by default. Adding real textures will enhance visual quality.

## Where to Download

All textures can be downloaded from **Polyhaven.com** (CC0 license, free to use):
https://polyhaven.com/textures

## Optional Textures for Room 1 (Heavenly Platform)

### 1. Marble Texture
- **Use**: Room 1 platform and pillars (Heavenly Platform)
- **Recommended**: "White Marble" or "Carrara Marble"
- **Direct Link**: https://polyhaven.com/a/white_marble_01
- **Resolution**: 1K (1024x1024) or 2K
- **Location**: `textures/marble/marble_color.jpg`

### 2. Cloud Texture (Optional)
- **Use**: Room 1 clouds (enhanced realism)
- **Recommended**: Sky HDRI cloud layer
- **Direct Link**: https://polyhaven.com/hdris/skies
- **Resolution**: 2K
- **Location**: `textures/sky/clouds.jpg`

## Optional Textures for Other Rooms

### Room 2 (Breaking Assumptions)
- Glass crack texture (procedural by default)
- Location: `textures/glass/crack.jpg`

### Room 3 (First Principles - Lab)
- Lab floor texture (white tiles)
- Location: `textures/lab/floor.jpg`

### Room 4 (Simplicity)
- Code texture / complexity patterns (procedural by default)

### Room 5 (Iteration)
- Conveyor belt metal texture
- Location: `textures/metal/conveyor.jpg`

### Room 6 (Reflection)
- Mirror surface (procedural by default)

## Download Instructions

1. Visit each link above
2. Click "Download" button
3. Select "1K JPG" format (smallest, fastest)
4. Save the file with the specified filename in the correct folder
5. Repeat for textures you want

## Procedural Textures (Already Implemented)

These textures are generated in code and don't need to be downloaded:
- White marble (Room 1) - uses procedural if texture not found
- Volumetric clouds (Room 1)
- Glass cracks (Room 2)
- Blueprint grid (Room 3)
- Mirror surface (Room 6)
- All lighting and particle effects

## File Structure

After downloading textures (optional), your folder should look like this:
```
doom-position/
├── textures/
│   ├── marble/
│   │   └── marble_color.jpg (optional)
│   ├── sky/
│   │   └── clouds.jpg (optional)
│   ├── glass/
│   ├── lab/
│   └── metal/
├── src/
│   ├── main.js
│   └── rooms/
├── index.html
└── ...
```

## Quick Download for Room 1 Marble

If you want to add the marble texture for Room 1:

```bash
mkdir -p textures/marble
cd textures/marble
wget -O marble_color.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/white_marble_01/white_marble_01_diff_1k.jpg"
```

## License

All Polyhaven textures are CC0 (Public Domain). You can use them for any purpose without attribution.

## Notes

- The code will automatically load these textures when present
- If a texture is missing, the code will fall back to procedural textures or solid colors
- You can replace these with any similar textures you prefer
- Higher resolution textures (2K, 4K) will look better but may impact performance
