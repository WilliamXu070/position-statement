# Texture Download Guide

This project uses a mix of downloaded textures (for realism) and procedural textures (for effects). Below are the textures you should download.

## Where to Download

All textures can be downloaded from **Polyhaven.com** (CC0 license, free to use):
https://polyhaven.com/textures

## Required Textures

Download these textures and save them to the `textures/` folder in your project:

### 1. Concrete Texture
- **Use**: Room 1 platform (Storm Cloud)
- **Recommended**: "Concrete Floor" or "Cracked Concrete"
- **Direct Link**: https://polyhaven.com/a/concrete_floor_02
- **Resolution**: 1K (1024x1024)
- **Filename**: Save as `concrete.jpg`

### 2. Wood Planks Texture
- **Use**: Room 7 platform (Fog Bridge)
- **Recommended**: "Wood Planks" or "Weathered Planks"
- **Direct Link**: https://polyhaven.com/a/wood_planks_grey
- **Resolution**: 1K (1024x1024)
- **Filename**: Save as `wood.jpg`

### 3. Metal Grating Texture
- **Use**: Room 4 platform (Floating Workshop)
- **Recommended**: "Metal Grid" or "Industrial Floor"
- **Direct Link**: https://polyhaven.com/a/metal_grid
- **Resolution**: 1K (1024x1024)
- **Filename**: Save as `metal-grating.jpg`

### 4. Grass Texture
- **Use**: Room 3 platform (Sky Garden)
- **Recommended**: "Grass" or "Short Grass"
- **Direct Link**: https://polyhaven.com/a/aerial_grass_rock
- **Resolution**: 1K (1024x1024)
- **Filename**: Save as `grass.jpg`

### 5. Rusty Metal Texture
- **Use**: Room 1 structures, Room 4 machines
- **Recommended**: "Rusty Metal" or "Metal Scratches"
- **Direct Link**: https://polyhaven.com/a/rust_coarse_01
- **Resolution**: 1K (1024x1024)
- **Filename**: Save as `rust.jpg`

### 6. Stone/Rock Texture (Optional)
- **Use**: Room 1 broken structures
- **Recommended**: "Rock Wall" or "Stone"
- **Direct Link**: https://polyhaven.com/a/rock_wall
- **Resolution**: 1K (1024x1024)
- **Filename**: Save as `stone.jpg`

## Download Instructions

1. Visit each link above
2. Click "Download" button
3. Select "1K JPG" format (smallest, fastest)
4. Save the file with the specified filename in the `textures/` folder
5. Repeat for all textures

## Procedural Textures (Already Implemented)

These textures are generated in code and don't need to be downloaded:
- Blueprint grid (Room 2)
- Circuit board patterns (Room 3)
- Storm clouds (Room 1)
- Mirror cracks (Room 6)
- Fog/cloud effects (all rooms)

## File Structure

After downloading, your folder should look like this:
```
doom-position/
├── textures/
│   ├── concrete.jpg
│   ├── wood.jpg
│   ├── metal-grating.jpg
│   ├── grass.jpg
│   ├── rust.jpg
│   └── stone.jpg (optional)
├── main.js
├── index.html
└── ...
```

## Alternative: Quick Download Script

If you want to automate this, you can use `wget` or `curl`:

```bash
cd textures/
wget -O concrete.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_02/concrete_floor_02_diff_1k.jpg"
wget -O wood.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks_grey/wood_planks_grey_diff_1k.jpg"
wget -O metal-grating.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/metal_grid/metal_grid_diff_1k.jpg"
wget -O grass.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/aerial_grass_rock/aerial_grass_rock_diff_1k.jpg"
wget -O rust.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rust_coarse_01/rust_coarse_01_diff_1k.jpg"
```

## License

All Polyhaven textures are CC0 (Public Domain). You can use them for any purpose without attribution.

## Notes

- The code will automatically load these textures when present
- If a texture is missing, the code will fall back to procedural textures or solid colors
- You can replace these with any similar textures you prefer
- Higher resolution textures (2K, 4K) will look better but may impact performance
