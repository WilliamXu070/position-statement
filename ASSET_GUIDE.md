# Asset Guide for 6-Room Experience

## Where to Get 3D Models and Textures

### Free 3D Model Resources

#### 1. **Sketchfab** (https://sketchfab.com)
- **Best for**: Ready-made 3D models (microscope, lab equipment, office items)
- **Format**: GLTF/GLB (native Three.js support)
- **License**: Filter by "Downloadable" and "CC Attribution" for free use
- **What to search**:
  - "microscope low poly"
  - "smartphone"
  - "laboratory equipment"
  - "mirror"
  - "conveyor belt"

#### 2. **Poly Haven** (https://polyhaven.com/models)
- **Best for**: High-quality, CC0 (public domain) models
- **Format**: GLTF, OBJ, FBX
- **License**: 100% free, no attribution required
- **What to get**:
  - Office furniture
  - Generic props

#### 3. **Three.js Examples** (Built-in geometries)
- **Best for**: Simple shapes (cubes, spheres, planes)
- **Format**: THREE.BoxGeometry, THREE.SphereGeometry, etc.
- **License**: Free (part of Three.js)
- **Use for**:
  - Room 1: Glowing cube, floating text panels
  - Room 2: Glass walls, barriers
  - Room 4: Code blocks (simple boxes)
  - Room 5: Project cards (planes with textures)

### Texture Resources

#### 1. **Poly Haven Textures** (https://polyhaven.com/textures)
- **Best for**: PBR textures (seamless, realistic)
- **License**: CC0 (free, no attribution)
- **What to get**:
  - Wood textures
  - Metal textures
  - Glass/transparent materials
  - Concrete/floor textures

#### 2. **TextureHaven** (https://texturehaven.com) [Merged with Poly Haven]
- Same as above

#### 3. **CC0 Textures** (https://cc0textures.com)
- **Best for**: Free PBR textures
- **License**: CC0
- **What to get**:
  - Lab surfaces
  - Wall materials
  - Floor tiles

### Icons and 2D Assets

#### 1. **Font Awesome** (https://fontawesome.com)
- **Best for**: Icons as 2D sprites
- **License**: Free tier available
- **Use for**:
  - Room 6: Lightbulb, compass, heart icons
  - Room 1: Floating word graphics

#### 2. **Flaticon** (https://www.flaticon.com)
- **Best for**: Simple icons and symbols
- **License**: Free with attribution
- **Use for**: UI elements, concept icons

---

## Specific Assets Needed for Each Room

### Room 1: Thinking Space
**No external assets needed** - Use procedural Three.js geometries:
- Central cube: `THREE.BoxGeometry`
- Floating words: `createTextPanel()` (already implemented)
- Lighting: `THREE.PointLight`, `THREE.AmbientLight`

### Room 2: Challenging Assumptions
**Minimal assets**:
- Glass wall effect: Use `THREE.PlaneGeometry` with transparent material
- Red warning text: `createTextPanel()` with red background
- Optional: Crack texture from Poly Haven for breaking effect

### Room 3: First Principles (CellScope)
**Assets needed**:
1. **Microscope 3D model**:
   - Search Sketchfab: "microscope low poly"
   - Download as GLB format
   - Example: https://sketchfab.com/3d-models/microscope-*

2. **Smartphone model** (optional):
   - Search: "smartphone low poly"
   - Alternatively: Use `THREE.BoxGeometry` as placeholder

3. **Lab textures**:
   - White/gray surfaces from Poly Haven
   - Blueprint texture (procedural or download)

4. **Light ray visualization**:
   - Use `THREE.Line` with glowing material (procedural)
   - No external asset needed

### Room 4: Simplicity Over Complexity
**No external assets needed**:
- Code blocks: `THREE.BoxGeometry` with text textures
- Tangled wires: `THREE.TubeGeometry` (procedural)
- Door: Simple `THREE.BoxGeometry`

### Room 5: Speed & Iteration
**Minimal assets**:
- Conveyor belt: `THREE.BoxGeometry` + moving texture
- Project cards: `THREE.PlaneGeometry` with canvas textures
- Optional: Download conveyor belt texture from CC0 Textures

### Room 6: Reflection & Growth
**Assets needed**:
1. **Mirror effect**:
   - Use `THREE.CubeCamera` for reflection (procedural)
   - Or: `THREE.MeshStandardMaterial` with high metalness

2. **Icons** (lightbulb, compass, heart):
   - **Option A**: Download PNG icons from Flaticon
   - **Option B**: Use emoji textures (🔬💡🧭❤️)
   - **Option C**: Use Font Awesome and render to canvas

---

## How to Import 3D Models in Three.js

### GLTFLoader (Recommended)

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

loader.load(
  'models/microscope.glb',  // Path to your model
  (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 1, -5);
    model.scale.set(0.5, 0.5, 0.5);
    group.add(model);
  },
  undefined,
  (error) => console.error('Model load error:', error)
);
```

### Converting STEP Files to GLB

**Three.js does NOT support STEP format directly.** If you have a STEP file (.step, .stp), convert it first:

#### Method 1: Using Blender (Free, Best Quality)
1. Download Blender: https://www.blender.org/
2. Enable CAD Import addon:
   - Edit → Preferences → Add-ons
   - Enable "Import CAD Formats"
3. Import: File → Import → STEP (.stp)
4. Export: File → Export → glTF 2.0 (.glb)
   - Choose "glTF Binary (.glb)" format

#### Method 2: Online Converters (Quick)
- **AnyConv**: https://anyconv.com/step-to-gltf-converter/
- **Aspose**: https://products.aspose.app/3d/conversion/step-to-gltf
- Upload STEP → Download GLB

#### Method 3: CAD Software
If you have Fusion 360, SolidWorks, etc.:
- Open STEP file
- Export as OBJ or STL
- Then convert OBJ → GLB in Blender

### OBJLoader (Alternative)

If you have an OBJ file instead:

```javascript
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const loader = new OBJLoader();
loader.load('models/microscope.obj', (object) => {
  object.position.set(0, 1, -5);
  object.scale.set(0.5, 0.5, 0.5);
  group.add(object);
});
```

### Where to Put Assets

```
doom-position/
├── models/          ← Create this folder
│   ├── microscope.glb
│   └── smartphone.glb
├── textures/        ← Already exists
│   ├── lab-floor.jpg
│   ├── metal.jpg
│   └── icons/
│       ├── lightbulb.png
│       └── compass.png
└── Room 1.m4a
```

---

## Recommended Asset Downloads

### Priority 1: Must-Have
1. **Microscope model** (Room 3) - Sketchfab
2. **Icon PNGs** (Room 6) - Flaticon or Font Awesome

### Priority 2: Nice-to-Have
1. Lab surface textures - Poly Haven
2. Glass/crack textures - CC0 Textures
3. Conveyor belt texture - CC0 Textures

### Priority 3: Optional
1. Smartphone model - Sketchfab
2. Blueprint patterns - Can use procedural texture

---

## Licensing Notes

- **CC0**: No attribution required, 100% free
- **CC BY**: Requires attribution in credits
- **Sketchfab Free**: Check individual model license
- **Three.js built-in**: Always free

Always check the specific license for each asset!

---

## Next Steps

1. **Create folders**:
   ```bash
   mkdir models
   mkdir textures/icons
   ```

2. **Download priority assets**:
   - Microscope GLB → `models/microscope.glb`
   - Icons PNG → `textures/icons/`

3. **Update server.js MIME types** (if needed):
   ```javascript
   ".glb": "model/gltf-binary",
   ".gltf": "model/gltf+json",
   ```

4. **Test asset loading** before full integration
