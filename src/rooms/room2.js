import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EYE_HEIGHT } from "../constants.js";
import { addCollisionBox } from "../core/collision.js";

// ROOM 2: Bitcoin Conference Room
export function createRoom2(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -200);

  // Dark room atmosphere (like reference image)
  scene.background = new THREE.Color(0x1a1a1a);
  scene.fog = new THREE.Fog(0x1a1a1a, 15, 40);

  // === ROOM STRUCTURE ===

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a8a8a,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Floor
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.2, 25),
    new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.9,
      metalness: 0.1,
    })
  );
  floor.position.set(0, -0.1, -12);
  group.add(floor);
  spellTargets.push(floor);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.2, 25),
    wallMaterial
  );
  ceiling.position.set(0, 6, -12);
  group.add(ceiling);

  // Back wall (with Bitcoin photo)
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(20, 6, 0.5),
    wallMaterial
  );
  backWall.position.set(0, 3, -24);
  group.add(backWall);
  addCollisionBox(backWall, new THREE.Vector3(0, 3, -24), new THREE.Vector3(20, 6, 0.5));

  // Left wall
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 6, 25),
    wallMaterial
  );
  leftWall.position.set(-10, 3, -12);
  group.add(leftWall);
  addCollisionBox(leftWall, new THREE.Vector3(-10, 3, -12), new THREE.Vector3(0.5, 6, 25));

  // Right wall
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 6, 25),
    wallMaterial
  );
  rightWall.position.set(10, 3, -12);
  group.add(rightWall);
  addCollisionBox(rightWall, new THREE.Vector3(10, 3, -12), new THREE.Vector3(0.5, 6, 25));

  // Front wall (partial, for entrance)
  const frontWallLeft = new THREE.Mesh(
    new THREE.BoxGeometry(6, 6, 0.5),
    wallMaterial
  );
  frontWallLeft.position.set(-7, 3, 0);
  group.add(frontWallLeft);

  const frontWallRight = new THREE.Mesh(
    new THREE.BoxGeometry(6, 6, 0.5),
    wallMaterial
  );
  frontWallRight.position.set(7, 3, 0);
  group.add(frontWallRight);

  // === BITCOIN PHOTO ON BACK WALL ===

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    'bitcoin.jpeg',
    (texture) => {
      const photoMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
      });

      const bitcoinPhoto = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 4),
        photoMaterial
      );
      bitcoinPhoto.position.set(0, 3.5, -23.7);
      bitcoinPhoto.rotation.y = 0;
      group.add(bitcoinPhoto);
      spellTargets.push(bitcoinPhoto);

      console.log('✅ Loaded bitcoin.jpeg photo');
    },
    undefined,
    (error) => {
      console.error('❌ Error loading bitcoin.jpeg:', error);
    }
  );

  // === TABLE IN CENTER ===

  // Load table texture
  textureLoader.load(
    'textures/table/table.jpg',
    (tableTexture) => {
      tableTexture.wrapS = THREE.RepeatWrapping;
      tableTexture.wrapT = THREE.RepeatWrapping;
      tableTexture.repeat.set(2, 1);

      const table = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.1, 1.5),
        new THREE.MeshStandardMaterial({
          map: tableTexture,
          roughness: 0.3,
          metalness: 0.1,
        })
      );
      table.position.set(0, 1.2, -12);
      group.add(table);
      spellTargets.push(table);
      addCollisionBox(table, new THREE.Vector3(0, 1.2, -12), new THREE.Vector3(3, 0.1, 1.5));

      console.log('✅ Loaded table texture');
    },
    undefined,
    (error) => {
      console.error('❌ Error loading table texture:', error);
      // Fallback to plain color
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.1, 1.5),
        new THREE.MeshStandardMaterial({
          color: 0x4a2a1a,
          roughness: 0.3,
          metalness: 0.1,
        })
      );
      table.position.set(0, 1.2, -12);
      group.add(table);
      spellTargets.push(table);
      addCollisionBox(table, new THREE.Vector3(0, 1.2, -12), new THREE.Vector3(3, 0.1, 1.5));
    }
  );

  // Table legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });

  const positions = [
    [-1.3, 0.6, -11.5],
    [1.3, 0.6, -11.5],
    [-1.3, 0.6, -12.5],
    [1.3, 0.6, -12.5],
  ];

  positions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  const loader = new GLTFLoader();

  // === LOAD MULTIPLE BUSINESSMEN ===

  const labelTexture = createAssumingLabelTexture();
  const businessmenPositions = [
    { pos: [-4, 0, -15], scale: 1.2, focus: new THREE.Vector3(-0.8, 1.5, -12.2) },
    { pos: [4, 0, -15], scale: 1.2, focus: new THREE.Vector3(0.8, 1.5, -12.2) },
    { pos: [-3, 0, -9], scale: 1.2, focus: new THREE.Vector3(-0.8, 1.5, -11.8) },
    { pos: [3, 0, -9], scale: 1.2, focus: new THREE.Vector3(0.8, 1.5, -11.8) },
  ];

  businessmenPositions.forEach((config, index) => {
    loader.load(
      'models/drex__human_3d_character.glb',
      (gltf) => {
        const businessman = gltf.scene;
        businessman.name = `businessman${index}`;
        businessman.position.set(...config.pos);
        businessman.scale.set(config.scale, config.scale, config.scale);
        businessman.lookAt(config.focus);
        businessman.rotation.x = 0;
        businessman.rotation.z = 0;

        const labelSprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: labelTexture,
            transparent: true,
            depthTest: false,
          })
        );
        const bounds = new THREE.Box3().setFromObject(businessman);
        const labelOffsetY = bounds.max.y - businessman.position.y + 0.3;
        labelSprite.position.set(0, labelOffsetY, 0);
        labelSprite.scale.set(1.6, 0.6, 1);
        labelSprite.renderOrder = 2;
        businessman.add(labelSprite);

        group.add(businessman);

        businessman.traverse((child) => {
          if (child.isMesh) {
            spellTargets.push(child);
          }
        });

        console.log(`✅ Loaded businessman ${index + 1}`);
      },
      undefined,
      (error) => {
        console.error(`❌ Error loading businessman ${index + 1}:`, error);
      }
    );
  });

  function createAssumingLabelTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(184, 91, 59, 0.9)";
    ctx.beginPath();
    const radius = 18;
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    ctx.font = "700 40px Georgia";
    ctx.fillStyle = "#fff4ea";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ASSUMING", canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // === SMALL STONKS HEAD ON TABLE ===

  // Load cloth texture for stonks head
  textureLoader.load(
    'textures/cloth/cloth.jpg',
    (clothTexture) => {
      // Load stonks head model
      loader.load(
        'models/stonks_head.glb',
        (gltf) => {
          const stonksHead = gltf.scene;
          stonksHead.name = 'stonksHead';

          // Small stonks head on table
          stonksHead.position.set(0, 1.5, -12);
          stonksHead.scale.set(0.006, 0.006, 0.006); // Small

          // Apply cloth texture to all meshes
          stonksHead.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                map: clothTexture,
                roughness: 0.8,
                metalness: 0.1,
              });
              spellTargets.push(child);
            }
          });

          group.add(stonksHead);

          // Animation properties
          stonksHead.userData.rotationSpeed = 1.0;

          console.log('✅ Loaded small stonks head with cloth texture');
        },
        undefined,
        (error) => {
          console.error('❌ Error loading stonks head:', error);
        }
      );
    },
    undefined,
    (error) => {
      console.error('❌ Error loading cloth texture:', error);
      // Load model without texture if cloth texture fails
      loader.load(
        'models/stonks_head.glb',
        (gltf) => {
          const stonksHead = gltf.scene;
          stonksHead.name = 'stonksHead';
          stonksHead.position.set(0, 1.5, -12);
          stonksHead.scale.set(0.006, 0.006, 0.006);
          group.add(stonksHead);

          stonksHead.traverse((child) => {
            if (child.isMesh) {
              spellTargets.push(child);
            }
          });

          stonksHead.userData.rotationSpeed = 1.0;
          console.log('✅ Loaded stonks head (without texture)');
        }
      );
    }
  );

  // === "WILLIAM" ARROW AND TEXT ===

  // Create arrow pointing down to stonks head
  const arrowGroup = new THREE.Group();

  // Arrow shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
    })
  );
  shaft.position.y = 0;
  arrowGroup.add(shaft);

  // Arrow head (cone pointing down)
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.2, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
    })
  );
  arrowHead.position.y = -0.5;
  arrowGroup.add(arrowHead);

  arrowGroup.position.set(0, 2.8, -12);
  group.add(arrowGroup);

  // "WILLIAM" text canvas
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Yellow glow
  ctx.shadowColor = 'rgba(255, 255, 0, 1)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffff00';
  ctx.fillText('WILLIAM', canvas.width / 2, canvas.height / 2);

  const textTexture = new THREE.CanvasTexture(canvas);
  const textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const williamText = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.5),
    textMaterial
  );
  williamText.position.set(0, 3.5, -12);
  group.add(williamText);

  // === LIGHTING ===

  // Very minimal ambient light to prevent complete blackness
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  // Main directional light from upper front-left (like reference image)
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(-3, 6, -8);
  scene.add(mainLight);

  // Subtle fill light from right to soften shadows
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.03);
  fillLight.position.set(3, 4, -10);
  scene.add(fillLight);

  // Single overhead point light for room illumination
  const ceilingLight = new THREE.PointLight(0xffffff, 0.5, 25);
  ceilingLight.position.set(0, 5.5, -12);
  scene.add(ceilingLight);

  rooms.push({
    id: "room2",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -200),
    update: (time, delta) => {
      // Rotate stonks head
      group.traverse((child) => {
        if (child.name === 'stonksHead') {
          child.rotation.y += delta * child.userData.rotationSpeed;
        }
      });

      // Pulse arrow and text
      arrowGroup.children.forEach((child) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.3;
        }
      });
    },
  });

  scene.add(group);
  return group;
}
